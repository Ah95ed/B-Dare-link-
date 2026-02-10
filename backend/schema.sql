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
  -- New fields for puzzle sources
  puzzle_source TEXT DEFAULT 'database', -- 'ai', 'database', 'manual'
  difficulty INTEGER DEFAULT 1, -- 1-10
  language TEXT DEFAULT 'ar', -- 'ar', 'en'
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (competition_id) REFERENCES competitions(id)
);

-- Room Puzzles (ألغاز كل غرفة مُعدّة مسبقاً)
CREATE TABLE room_puzzles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  puzzle_index INTEGER NOT NULL,
  puzzle_json TEXT NOT NULL,
  solved_by INTEGER, -- User who solved it first
  solved_at TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (solved_by) REFERENCES users(id)
);

-- Room Puzzle History (used to prevent repeats across rounds in the same room)
CREATE TABLE room_puzzle_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  puzzle_id INTEGER,
  question_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(id)
);

CREATE INDEX idx_room_puzzle_history_room ON room_puzzle_history(room_id);
CREATE INDEX idx_room_puzzle_history_hash ON room_puzzle_history(room_id, question_hash);

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
  hints_used INTEGER DEFAULT 0, -- Number of hints used in this room
  hints_available INTEGER DEFAULT 3, -- Number of hints still available
  role TEXT DEFAULT 'player', -- 'manager', 'co_manager', 'player'
  is_frozen BOOLEAN DEFAULT FALSE, -- Manager can freeze a player
  is_kicked BOOLEAN DEFAULT FALSE, -- Manager kicked this player
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(room_id, user_id)
);

-- Room Settings (إعدادات متقدمة للغرفة)
CREATE TABLE room_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL UNIQUE,
  hints_enabled BOOLEAN DEFAULT TRUE,
  hints_per_player INTEGER DEFAULT 3,
  hint_penalty_percent REAL DEFAULT 10, -- Reduce correct answer points by X% if hint used
  allow_report_bad_puzzle BOOLEAN DEFAULT TRUE,
  auto_advance_seconds INTEGER DEFAULT 2, -- Auto advance to next after answer
  shuffle_options BOOLEAN DEFAULT TRUE, -- Shuffle answer options
  show_rankings_live BOOLEAN DEFAULT TRUE, -- Show live rankings during game
  allow_skip_puzzle BOOLEAN DEFAULT FALSE,
  min_time_per_puzzle INTEGER DEFAULT 5, -- Minimum time before allowing next puzzle
  
  -- Manager-specific settings
  manager_can_skip_puzzle BOOLEAN DEFAULT TRUE, -- Only manager can skip
  manager_can_reset_scores BOOLEAN DEFAULT TRUE, -- Manager can reset all scores
  manager_can_freeze_players BOOLEAN DEFAULT TRUE, -- Manager can freeze/unfreeze players
  manager_can_kick_players BOOLEAN DEFAULT TRUE, -- Manager can kick players
  manager_can_change_difficulty BOOLEAN DEFAULT TRUE, -- Manager can change difficulty mid-game
  allow_co_managers BOOLEAN DEFAULT TRUE, -- Allow multiple co-managers
  show_detailed_stats_to_all BOOLEAN DEFAULT FALSE, -- If false, only manager sees detailed stats
  
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Bad Puzzle Reports (تقارير الأسئلة السيئة)
CREATE TABLE puzzle_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  puzzle_index INTEGER NOT NULL,
  puzzle_json TEXT, -- Store the puzzle JSON for reference
  user_id INTEGER NOT NULL,
  report_type TEXT NOT NULL, -- 'bad_wording', 'wrong_answer', 'unclear', 'offensive', 'duplicate', 'other'
  details TEXT, -- Optional details
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
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
CREATE INDEX idx_room_participants_role ON room_participants(room_id, role);
CREATE INDEX idx_competition_results_comp ON competition_results(competition_id, user_id);
CREATE INDEX idx_room_results_room ON room_results(room_id, user_id);
CREATE INDEX idx_puzzle_reports_room ON puzzle_reports(room_id);
CREATE INDEX idx_puzzle_reports_user ON puzzle_reports(user_id);

-- Manager Action Logs (سجل تصرفات المدير للشفافية)
CREATE TABLE manager_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  manager_user_id INTEGER NOT NULL,
  action_type TEXT NOT NULL, -- 'kick', 'freeze', 'unfreeze', 'reset_scores', 'skip_puzzle', 'change_difficulty', 'transfer_manager', 'change_settings'
  target_user_id INTEGER, -- If action targets a specific user
  details TEXT, -- JSON with additional details
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (manager_user_id) REFERENCES users(id),
  FOREIGN KEY (target_user_id) REFERENCES users(id)
);

CREATE INDEX idx_manager_actions_room ON manager_actions(room_id);
CREATE INDEX idx_manager_actions_manager ON manager_actions(manager_user_id);

PRAGMA foreign_keys = ON;


