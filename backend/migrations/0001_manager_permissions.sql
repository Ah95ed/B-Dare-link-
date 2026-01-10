-- Migration: Add manager permissions and settings
-- Date: 2026-01-10

-- Add new columns to room_participants
ALTER TABLE room_participants ADD COLUMN role TEXT DEFAULT 'player';
ALTER TABLE room_participants ADD COLUMN is_frozen BOOLEAN DEFAULT FALSE;
ALTER TABLE room_participants ADD COLUMN is_kicked BOOLEAN DEFAULT FALSE;

-- Update existing participants: creator should be manager
UPDATE room_participants 
SET role = 'manager' 
WHERE user_id IN (SELECT created_by FROM rooms WHERE id = room_participants.room_id);

-- Add new columns to room_settings (if table exists)
ALTER TABLE room_settings ADD COLUMN manager_can_skip_puzzle BOOLEAN DEFAULT TRUE;
ALTER TABLE room_settings ADD COLUMN manager_can_reset_scores BOOLEAN DEFAULT TRUE;
ALTER TABLE room_settings ADD COLUMN manager_can_freeze_players BOOLEAN DEFAULT TRUE;
ALTER TABLE room_settings ADD COLUMN manager_can_kick_players BOOLEAN DEFAULT TRUE;
ALTER TABLE room_settings ADD COLUMN manager_can_change_difficulty BOOLEAN DEFAULT TRUE;
ALTER TABLE room_settings ADD COLUMN allow_co_managers BOOLEAN DEFAULT TRUE;
ALTER TABLE room_settings ADD COLUMN show_detailed_stats_to_all BOOLEAN DEFAULT FALSE;

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
CREATE INDEX IF NOT EXISTS idx_room_participants_role ON room_participants(room_id, role);
CREATE INDEX IF NOT EXISTS idx_manager_actions_room ON manager_actions(room_id);
CREATE INDEX IF NOT EXISTS idx_manager_actions_manager ON manager_actions(manager_user_id);
