const express = require('express');
const cors = require('cors');
const { YoutubeTranscript } = require('youtube-transcript');
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

// --- ENDPOINTS ---

// 1. Process Video
app.post('/api/process', async (req, res) => {
  const client = await pool.connect();
  try {
    const { url } = req.body;
    const videoId = extractVideoId(url);
    if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

    // Check if already processed
    const existing = await client.query('SELECT id FROM videos WHERE youtube_id = $1', [videoId]);
    if (existing.rows.length > 0) return res.json({ videoId });

    // Fetch Transcript
    let transcriptData;
    try {
      transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (e) {
      return res.status(400).json({ error: 'Transcript not available for this video.' });
    }
    const transcriptText = transcriptData.map(t => t.text).join(' ');

    // Call OpenAI
    const aiData = await generateStudyPack(transcriptText);

    // Save to DB via Transaction
    await client.query('BEGIN');
    
    const vRes = await client.query(
      'INSERT INTO videos (youtube_id, title, channel, thumbnail_url) VALUES ($1, $2, $3, $4) RETURNING id',
      [videoId, `Video ${videoId}`, 'YouTube Channel', `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`]
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

// 2. Get All Videos (Library)
app.get('/api/videos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, 
      (SELECT quiz_score FROM study_sessions WHERE video_id = v.id ORDER BY ended_at DESC LIMIT 1) as last_score 
      FROM videos v ORDER BY processed_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

// 3. Get Single Study Pack
app.get('/api/videos/:youtubeId', async (req, res) => {
  try {
    const vRes = await pool.query('SELECT * FROM videos WHERE youtube_id = $1', [req.params.youtubeId]);
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

// 4. Save Session
app.post('/api/sessions', async (req, res) => {
  try {
    const { youtubeId, time_spent_seconds, quiz_score, total_questions } = req.body;
    const vRes = await pool.query('SELECT id FROM videos WHERE youtube_id = $1', [youtubeId]);
    if (vRes.rows.length === 0) return res.status(404).send();
    const videoId = vRes.rows[0].id;

    await pool.query(
      'INSERT INTO study_sessions (video_id, time_spent_seconds, quiz_score, total_questions, ended_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
      [videoId, time_spent_seconds, quiz_score, total_questions]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }
});

// 5. Dashboard Stats
app.get('/api/dashboard', async (req, res) => {
  try {
    const countRes = await pool.query('SELECT COUNT(*) as count FROM videos');
    const totalVideos = parseInt(countRes.rows[0].count);
    
    const scoreRes = await pool.query('SELECT AVG(CAST(quiz_score AS FLOAT) / NULLIF(total_questions, 0)) * 100 as avg_score FROM study_sessions WHERE total_questions > 0');
    const avgScore = scoreRes.rows[0].avg_score ? Math.round(scoreRes.rows[0].avg_score) : 0;
    
    const sessionsRes = await pool.query('SELECT quiz_score, total_questions, ended_at FROM study_sessions ORDER BY ended_at ASC LIMIT 10');
    
    res.json({
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