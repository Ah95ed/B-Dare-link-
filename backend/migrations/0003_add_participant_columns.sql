-- Add missing columns to room_participants

ALTER TABLE room_participants ADD COLUMN role TEXT DEFAULT 'player';
ALTER TABLE room_participants ADD COLUMN is_frozen BOOLEAN DEFAULT FALSE;
ALTER TABLE room_participants ADD COLUMN is_kicked BOOLEAN DEFAULT FALSE;
ALTER TABLE room_participants ADD COLUMN hints_used INTEGER DEFAULT 0;
ALTER TABLE room_participants ADD COLUMN hints_available INTEGER DEFAULT 3;

-- Update existing participants: creator should be manager
UPDATE room_participants 
SET role = 'manager' 
WHERE user_id IN (SELECT created_by FROM rooms WHERE id = room_participants.room_id);

-- Create index for role
CREATE INDEX IF NOT EXISTS idx_room_participants_role ON room_participants(room_id, role);
