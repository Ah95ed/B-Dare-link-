-- Solo puzzle bank: difficulty, dedupe hash, player assignment history

ALTER TABLE puzzles ADD COLUMN difficulty INTEGER NOT NULL DEFAULT 1;
ALTER TABLE puzzles ADD COLUMN question_hash TEXT;
ALTER TABLE puzzles ADD COLUMN source TEXT DEFAULT 'ai';

CREATE INDEX IF NOT EXISTS idx_puzzles_level_lang_diff
  ON puzzles(level, lang, difficulty);

-- Non-null hashes must be unique (SQLite allows multiple NULLs in UNIQUE index).
CREATE UNIQUE INDEX IF NOT EXISTS idx_puzzles_question_hash
  ON puzzles(question_hash);

CREATE TABLE IF NOT EXISTS solo_player_puzzles (
  user_key TEXT NOT NULL,
  puzzle_id INTEGER NOT NULL,
  level INTEGER NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_key, puzzle_id),
  FOREIGN KEY (puzzle_id) REFERENCES puzzles(id)
);

CREATE INDEX IF NOT EXISTS idx_solo_player_user_level
  ON solo_player_puzzles(user_key, level);
