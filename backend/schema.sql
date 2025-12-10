DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS puzzles;
DROP TABLE IF EXISTS progress;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  total_score INTEGER DEFAULT 0,
  current_level_id INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE puzzles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  start_word_ar TEXT,
  end_word_ar TEXT,
  start_word_en TEXT,
  end_word_en TEXT,
  solution_json TEXT, -- Stores the valid chain or hints
  generated_by TEXT DEFAULT 'gemini',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  puzzle_id INTEGER,
  is_solved BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  score_earned INTEGER DEFAULT 0,
  solved_at TIMESTAMP
);
