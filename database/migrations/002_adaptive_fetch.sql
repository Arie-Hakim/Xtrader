-- Migration 002: Adaptive Fetch columns on analysts table
-- Safe to re-run (IF NOT EXISTS on all columns)

ALTER TABLE analysts
  ADD COLUMN IF NOT EXISTS last_tweet_id VARCHAR(50),
  ADD COLUMN IF NOT EXISTS last_fetched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tweets_per_day_avg DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fetch_tier VARCHAR(10) DEFAULT 'HOT'
    CHECK (fetch_tier IN ('HOT', 'WARM', 'COLD')),
  ADD COLUMN IF NOT EXISTS dna_version INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS dna_analyzed_until_tweet_id VARCHAR(50);
