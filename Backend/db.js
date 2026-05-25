const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_CONN_STRING,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  }
});

const initDb = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        youtube_id TEXT UNIQUE,
        user_id INTEGER REFERENCES users(id),
        title TEXT,
        channel TEXT,
        thumbnail_url TEXT,
        duration_seconds INTEGER,
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS study_sessions (
        id SERIAL PRIMARY KEY,
        video_id INTEGER REFERENCES videos(id),
        user_id INTEGER REFERENCES users(id),
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP,
        time_spent_seconds INTEGER,
        quiz_score INTEGER,
        total_questions INTEGER
      );

      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        video_id INTEGER REFERENCES videos(id),
        question_text TEXT,
        option_a TEXT, 
        option_b TEXT, 
        option_c TEXT, 
        option_d TEXT,
        correct_option TEXT,
        explanation TEXT
      );

      CREATE TABLE IF NOT EXISTS flashcards (
        id SERIAL PRIMARY KEY,
        video_id INTEGER REFERENCES videos(id),
        front_text TEXT,
        back_text TEXT
      );

      CREATE TABLE IF NOT EXISTS summaries (
        id SERIAL PRIMARY KEY,
        video_id INTEGER REFERENCES videos(id),
        bullet_points_json TEXT
      );
    `);

    await client.query(`
      ALTER TABLE videos ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
      ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
      ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_youtube_id_key;
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS videos_user_id_youtube_id_key
      ON videos (user_id, youtube_id);
    `);
    
    await client.query('COMMIT');
    console.log('Database initialized successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { pool, initDb };
