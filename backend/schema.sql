PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS room_results;
DROP TABLE IF EXISTS competition_results;
DROP TABLE IF EXISTS room_participants;
DROP TABLE IF EXISTS competition_participants;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS competitions;
DROP TABLE IF EXISTS progress;
DROP TABLE IF EXISTS puzzles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  username TEXT NOT NULL,
  total_score INTEGER DEFAULT 0,
  current_level_id INTEGER DEFAULT 1,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE puzzles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level INTEGER,
  lang TEXT,
  json TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  level INTEGER,
  score INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_puzzles_level_lang ON puzzles(level, lang);
CREATE INDEX idx_progress_user ON progress(user_id);

-- Competitions (مسابقات بين مجموعات)
CREATE TABLE competitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'global' or 'group'
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'active', 'finished'
  max_participants INTEGER DEFAULT 10,
  puzzle_count INTEGER DEFAULT 5,
  time_per_puzzle INTEGER DEFAULT 60, -- seconds
  created_by INTEGER,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Rooms (غرف داخلية - مجموعات)
CREATE TABLE rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- Room code for joining
  competition_id INTEGER, -- NULL for standalone rooms, or link to competition
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'active', 'finished'
  max_participants INTEGER DEFAULT 10,
  puzzle_count INTEGER DEFAULT 5,
  time_per_puzzle INTEGER DEFAULT 60,
  current_puzzle_index INTEGER DEFAULT 0,
  current_puzzle_id INTEGER, -- Reference to puzzles table
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (competition_id) REFERENCES competitions(id)
);

-- Competition Participants (مشاركون في مسابقات)
CREATE TABLE competition_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competition_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  room_id INTEGER, -- Which room they're in
  total_score INTEGER DEFAULT 0,
  puzzles_solved INTEGER DEFAULT 0,
  average_time REAL DEFAULT 0, -- Average time per puzzle in seconds
  rank INTEGER,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (competition_id) REFERENCES competitions(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  UNIQUE(competition_id, user_id)
);

-- Room Participants (مشاركون في غرف)
CREATE TABLE room_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  puzzles_solved INTEGER DEFAULT 0,
  current_puzzle_index INTEGER DEFAULT 0,
  is_ready BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(room_id, user_id)
);

-- Competition Results (نتائج المسابقات)
CREATE TABLE competition_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  competition_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  puzzle_id INTEGER NOT NULL,
  puzzle_index INTEGER NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  time_taken INTEGER, -- milliseconds
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (competition_id) REFERENCES competitions(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(id)
);

-- Room Results (نتائج الغرف)
CREATE TABLE room_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  puzzle_id INTEGER NOT NULL,
  puzzle_index INTEGER NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  time_taken INTEGER, -- milliseconds
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(id)
);

-- Indexes
CREATE INDEX idx_competitions_status ON competitions(status);
CREATE INDEX idx_competitions_type ON competitions(type);
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_competition_participants_comp ON competition_participants(competition_id);
CREATE INDEX idx_room_participants_room ON room_participants(room_id);
CREATE INDEX idx_competition_results_comp ON competition_results(competition_id, user_id);
CREATE INDEX idx_room_results_room ON room_results(room_id, user_id);

