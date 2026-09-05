PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  puzzle_size INTEGER NOT NULL CHECK (puzzle_size IN (3, 4, 5)),
  game_mode TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  completion_time INTEGER NOT NULL DEFAULT 0,
  moves INTEGER NOT NULL DEFAULT 0,
  mistakes INTEGER NOT NULL DEFAULT 0,
  accuracy REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  condition TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_games_user_created ON games(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_score ON games(score DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

INSERT OR IGNORE INTO achievements (name, description, condition) VALUES
  ('First Puzzle', 'Complete your first puzzle.', 'games >= 1'),
  ('Speed Solver', 'Complete a puzzle in under two minutes.', 'completion_time < 120'),
  ('Perfect Solve', 'Complete a puzzle with 100% accuracy.', 'accuracy = 100'),
  ('Gesture Master', 'Complete a puzzle with 10 or more moves.', 'moves >= 10'),
  ('10 Games Completed', 'Complete ten puzzles.', 'games >= 10'),
  ('Puzzle Champion', 'Reach a score of 1000.', 'score >= 1000');
