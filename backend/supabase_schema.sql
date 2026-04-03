-- ============================================================
-- Ventara Database Schema
-- Paste this entire file into Supabase → SQL Editor → Run
-- ============================================================

-- Sessions table (stores every conversation turn + emotion data)
CREATE TABLE IF NOT EXISTS sessions (
  id          BIGSERIAL PRIMARY KEY,
  user_id     TEXT      NOT NULL,
  timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_msg    TEXT      NOT NULL,
  bot_reply   TEXT      NOT NULL,
  emotion     TEXT,
  intensity   INTEGER,
  mood_score  FLOAT,
  risk_flag   BOOLEAN   DEFAULT FALSE,
  keywords    TEXT
);

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_timestamp ON sessions(timestamp DESC);

-- Row Level Security (keeps each user's data private)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Allow service role (backend) full access
CREATE POLICY "service_role_all" ON sessions
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- Done! Your database is ready.
-- ============================================================
