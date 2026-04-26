-- Migration 003: user_analysts join table (M:N users ↔ analysts)
-- Safe to re-run (IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS user_analysts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  analyst_id   UUID NOT NULL REFERENCES analysts(id) ON DELETE CASCADE,
  is_pinned    BOOLEAN     DEFAULT FALSE,
  added_at     TIMESTAMPTZ DEFAULT NOW(),
  last_view_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, analyst_id)
);

CREATE INDEX IF NOT EXISTS idx_user_analysts_user_view
  ON user_analysts(user_id, last_view_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_analysts_analyst_pin
  ON user_analysts(analyst_id, is_pinned);
