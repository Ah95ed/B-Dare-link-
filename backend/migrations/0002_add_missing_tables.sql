-- Add missing tables and columns for manager permissions system

-- Add new columns to room_participants if they don't exist
-- Note: SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS
-- So we need to handle this carefully

-- First, check the structure
PRAGMA table_info(room_participants);

-- Create room_settings table
CREATE TABLE IF NOT EXISTS room_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL UNIQUE,
  hints_enabled BOOLEAN DEFAULT TRUE,
  hints_per_player INTEGER DEFAULT 3,
  hint_penalty_percent REAL DEFAULT 10,
  allow_report_bad_puzzle BOOLEAN DEFAULT TRUE,
  auto_advance_seconds INTEGER DEFAULT 2,
  shuffle_options BOOLEAN DEFAULT TRUE,
  show_rankings_live BOOLEAN DEFAULT TRUE,
  allow_skip_puzzle BOOLEAN DEFAULT FALSE,
  min_time_per_puzzle INTEGER DEFAULT 5,
  manager_can_skip_puzzle BOOLEAN DEFAULT TRUE,
  manager_can_reset_scores BOOLEAN DEFAULT TRUE,
  manager_can_freeze_players BOOLEAN DEFAULT TRUE,
  manager_can_kick_players BOOLEAN DEFAULT TRUE,
  manager_can_change_difficulty BOOLEAN DEFAULT TRUE,
  allow_co_managers BOOLEAN DEFAULT TRUE,
  show_detailed_stats_to_all BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

-- Create puzzle_reports table
CREATE TABLE IF NOT EXISTS puzzle_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  puzzle_index INTEGER NOT NULL,
  puzzle_json TEXT,
  user_id INTEGER NOT NULL,
  report_type TEXT NOT NULL,
  details TEXT,
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create manager_actions table
CREATE TABLE IF NOT EXISTS manager_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  manager_user_id INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id INTEGER,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (manager_user_id) REFERENCES users(id),
  FOREIGN KEY (target_user_id) REFERENCES users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_manager_actions_room ON manager_actions(room_id);
CREATE INDEX IF NOT EXISTS idx_manager_actions_manager ON manager_actions(manager_user_id);
CREATE INDEX IF NOT EXISTS idx_puzzle_reports_room ON puzzle_reports(room_id);
CREATE INDEX IF NOT EXISTS idx_puzzle_reports_user ON puzzle_reports(user_id);
