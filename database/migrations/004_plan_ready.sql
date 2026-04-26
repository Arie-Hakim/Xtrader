-- Migration 004: Plan / subscription columns on users + usage tracking table
-- Safe to re-run (IF NOT EXISTS)

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan_type VARCHAR(20) DEFAULT 'FREE'
    CHECK (plan_type IN ('FREE', 'PRO', 'PREMIUM')),
  ADD COLUMN IF NOT EXISTS plan_started_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plan_expires_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id     VARCHAR(50),
  ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(50);

CREATE TABLE IF NOT EXISTS usage_tracking (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action  VARCHAR(50) NOT NULL,
  date    DATE        NOT NULL DEFAULT CURRENT_DATE,
  count   INT                  DEFAULT 1,
  UNIQUE(user_id, action, date)
);
