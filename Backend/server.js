const express = require('express');
const cors = require('cors');
const { fetchTranscript, toPlainText } = require('youtube-transcript-plus');
const { pool, initDb } = require('./db');
const { generateStudyPack } = require('./services/ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const extractVideoId = (url) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
};

const sanitizeUser = (userRow) => ({
  id: userRow.id,
  username: userRow.username,
  fullName: userRow.full_name,
});

const normalizeUsername = (value) => value.trim().toLowerCase();

const getAuthenticatedUser = async (req) => {
  const rawUserId = req.header('x-user-id');
  const userId = Number(rawUserId);

  if (!userId) {
    return null;
  }

  const result = await pool.query(
    'SELECT id, username, full_name FROM users WHERE id = $1',
    [userId]
  );

  return result.rows[0] || null;
};

// --- ENDPOINTS ---

// 1. Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, username, password } = req.body;

    if (!fullName || !username || !password) {
      return res.status(400).json({ error: 'Full name, username, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanFullName = fullName.trim();
    const cleanUsername = normalizeUsername(username);

    const existingUserRes = await pool.query(
      'SELECT id FROM users WHERE LOWER(username) = $1 LIMIT 1',
      [cleanUsername]
    );

    if (existingUserRes.rows.length > 0) {
      return res.status(409).json({ error: 'That username is already taken.' });
    }

    const result = await pool.query(
      `
        INSERT INTO users (username, password, full_name)
        VALUES ($1, $2, $3)
        RETURNING id, username, full_name
      `,
      [cleanUsername, password, cleanFullName]
    );

    res.status(201).json({ user: sanitizeUser(result.rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create your account right now.' });
  }
});

// 2. Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const result = await pool.query(
      `
        SELECT id, username, password, full_name
        FROM users
        WHERE LOWER(username) = LOWER($1)
        LIMIT 1
      `,
      [normalizeUsername(username)]
    );

    const user = result.rows[0];
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to log in right now.' });
  }
});

// 2. Process Video
app.post('/api/process', async (req, res) => {
  const client = await pool.connect();
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Please log in to continue.' });

    const { url } = req.body;
    const videoId = extractVideoId(url);
    if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

    // Check if already processed
    const existing = await client.query(
      'SELECT id, youtube_id FROM videos WHERE youtube_id = $1 AND user_id = $2',
      [videoId, user.id]
    );
    if (existing.rows.length > 0) return res.json({ videoId });

    // Fetch Transcript
    let transcriptResponse;
    try {
      transcriptResponse = await fetchTranscript(videoId, { lang: 'en', videoDetails: true });
      console.log("The Transcription Response: ", transcriptResponse);
    } catch (e) {
      return res.status(400).json({ error: 'Transcript not available for this video.' });
    }
    const transcriptData = transcriptResponse.segments;
    const videoDetails = transcriptResponse.videoDetails;
    const transcriptText = toPlainText(transcriptData, ' ');
    const durationSeconds = Number(videoDetails?.lengthSeconds || videoDetails?.duration_seconds || 0);
    console.log("The Transcription Text: ", transcriptText);

    // Call OpenAI
    const aiData = await generateStudyPack(transcriptText);

    // Save to DB via Transaction
    await client.query('BEGIN');

    const vRes = await client.query(
      'INSERT INTO videos (youtube_id, user_id, title, channel, thumbnail_url, duration_seconds) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [videoId, user.id, videoDetails.title || `Video ${videoId}`, videoDetails.author || 'YouTube Channel', `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, durationSeconds]
    );
    const dbId = vRes.rows[0].id;

    await client.query(
      'INSERT INTO summaries (video_id, bullet_points_json) VALUES ($1, $2)',
      [dbId, JSON.stringify(aiData.summary)]
    );

    for (const q of aiData.questions) {
      await client.query(
        'INSERT INTO questions (video_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [dbId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option.toLowerCase(), q.explanation]
      );
    }

    for (const f of aiData.flashcards) {
      await client.query(
        'INSERT INTO flashcards (video_id, front_text, back_text) VALUES ($1, $2, $3)',
        [dbId, f.front, f.back]
      );
    }

    await client.query('COMMIT');
    res.json({ videoId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'AI generation failed, please try again.' });
  } finally {
    client.release();
  }
});

// 3. Get All Videos (Library)
app.get('/api/videos', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Please log in to continue.' });

    const result = await pool.query(`
      SELECT v.*, 
      (SELECT quiz_score FROM study_sessions WHERE video_id = v.id ORDER BY ended_at DESC LIMIT 1) as last_score 
      FROM videos v
      WHERE v.user_id = $1
      ORDER BY processed_at DESC
    `, [user.id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

// 4. Get Single Study Pack
app.get('/api/videos/:youtubeId', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Please log in to continue.' });

    const vRes = await pool.query(
      'SELECT * FROM videos WHERE youtube_id = $1 AND user_id = $2',
      [req.params.youtubeId, user.id]
    );
    if (vRes.rows.length === 0) return res.status(404).json({ error: 'Video not found' });
    const video = vRes.rows[0];

    const sRes = await pool.query('SELECT bullet_points_json FROM summaries WHERE video_id = $1', [video.id]);
    const summary = JSON.parse(sRes.rows[0].bullet_points_json);

    const qRes = await pool.query('SELECT * FROM questions WHERE video_id = $1', [video.id]);
    const questions = qRes.rows;

    const fRes = await pool.query('SELECT * FROM flashcards WHERE video_id = $1', [video.id]);
    const flashcards = fRes.rows;

    res.json({ video, summary, questions, flashcards });
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

// 5. Save Session
app.post('/api/sessions', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Please log in to continue.' });

    const { youtubeId, time_spent_seconds, quiz_score, total_questions } = req.body;
    const vRes = await pool.query(
      'SELECT id FROM videos WHERE youtube_id = $1 AND user_id = $2',
      [youtubeId, user.id]
    );
    if (vRes.rows.length === 0) return res.status(404).send();
    const videoId = vRes.rows[0].id;

    await pool.query(
      'INSERT INTO study_sessions (video_id, user_id, time_spent_seconds, quiz_score, total_questions, ended_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)',
      [videoId, user.id, time_spent_seconds, quiz_score, total_questions]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

// 6. Dashboard Stats
app.get('/api/dashboard', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Please log in to continue.' });

    const countRes = await pool.query('SELECT COUNT(*) as count FROM videos WHERE user_id = $1', [user.id]);
    const totalVideos = parseInt(countRes.rows[0].count);

    const scoreRes = await pool.query(
      `
        SELECT AVG(CAST(quiz_score AS FLOAT) / NULLIF(total_questions, 0)) * 100 as avg_score
        FROM study_sessions
        WHERE total_questions > 0 AND user_id = $1
      `,
      [user.id]
    );
    const avgScore = scoreRes.rows[0].avg_score ? Math.round(scoreRes.rows[0].avg_score) : 0;

    const sessionsRes = await pool.query(`
      SELECT s.id, s.video_id, s.quiz_score, s.total_questions, s.time_spent_seconds, s.ended_at, v.title
      FROM study_sessions s
      JOIN videos v ON v.id = s.video_id
      WHERE s.user_id = $1
      ORDER BY s.ended_at ASC
      LIMIT 10
    `, [user.id]);

    res.json({
      user: sanitizeUser(user),
      totalVideos,
      avgScore,
      timeSaved: totalVideos * 25,
      recentSessions: sessionsRes.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

const startServer = async () => {
  try {
    await initDb();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
