-- XTrader – Indexes
-- Run AFTER schema.sql

-- ─────────────────────────────────────────
-- analysts
-- ─────────────────────────────────────────
-- username already has a UNIQUE index from the constraint; no duplicate needed

-- ─────────────────────────────────────────
-- tweets
-- ─────────────────────────────────────────
CREATE INDEX idx_tweets_analyst_id   ON tweets (analyst_id);
CREATE INDEX idx_tweets_posted_at    ON tweets (posted_at DESC);
CREATE INDEX idx_tweets_is_processed ON tweets (is_processed) WHERE is_processed = FALSE;

-- ─────────────────────────────────────────
-- analyst_dna
-- ─────────────────────────────────────────
CREATE INDEX idx_analyst_dna_analyst_id ON analyst_dna (analyst_id);
-- profile_data: GIN for fast key/value lookups inside the DNA blob
CREATE INDEX idx_analyst_dna_profile_data ON analyst_dna USING GIN (profile_data);

-- ─────────────────────────────────────────
-- insights
-- ─────────────────────────────────────────
CREATE INDEX idx_insights_analyst_id  ON insights (analyst_id);
CREATE INDEX idx_insights_ticker      ON insights (ticker);
CREATE INDEX idx_insights_created_at  ON insights (created_at DESC);
-- GIN indexes for JSONB query patterns used by Scoring Engine and Stock Fit Agent
CREATE INDEX idx_insights_velocity    ON insights USING GIN (velocity);
CREATE INDEX idx_insights_decay       ON insights USING GIN (decay);
CREATE INDEX idx_insights_regime_fit  ON insights USING GIN (regime_fit);
CREATE INDEX idx_insights_raw_data    ON insights USING GIN (raw_data);
CREATE INDEX idx_insights_key_levels  ON insights USING GIN (key_levels) WHERE key_levels IS NOT NULL;

-- ─────────────────────────────────────────
-- market_regimes
-- ─────────────────────────────────────────
-- date already has a UNIQUE index from the constraint
CREATE INDEX idx_market_regimes_regime ON market_regimes (regime);

-- ─────────────────────────────────────────
-- recommendations
-- ─────────────────────────────────────────
-- (date, ticker) already covered by UNIQUE constraint
CREATE INDEX idx_recommendations_date        ON recommendations (date DESC);
CREATE INDEX idx_recommendations_ticker      ON recommendations (ticker);
CREATE INDEX idx_recommendations_final_score ON recommendations (final_score DESC);
CREATE INDEX idx_recommendations_consensus   ON recommendations USING GIN (consensus);

-- ─────────────────────────────────────────
-- stock_fit_results
-- ─────────────────────────────────────────
-- (analyst_id, ticker) already covered by UNIQUE constraint
CREATE INDEX idx_stock_fit_expires_at ON stock_fit_results (expires_at);

-- ─────────────────────────────────────────
-- users
-- ─────────────────────────────────────────
-- email already has a UNIQUE index from the constraint
CREATE INDEX idx_users_plan_type    ON users (plan_type);
CREATE INDEX idx_users_preferences  ON users USING GIN (preferences);
