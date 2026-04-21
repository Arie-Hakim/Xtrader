-- XTrader – Table Definitions
-- Run AFTER enums.sql

-- ─────────────────────────────────────────
-- analysts
-- ─────────────────────────────────────────
CREATE TABLE analysts (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    username            TEXT        NOT NULL UNIQUE,
    display_name        TEXT,
    avatar_url          TEXT,
    analyst_type        analyst_type_enum NOT NULL,
    analyst_weight      NUMERIC(4,3) NOT NULL DEFAULT 0.500
                            CHECK (analyst_weight >= 0 AND analyst_weight <= 1),
    tweets_learned_count INT        NOT NULL DEFAULT 0 CHECK (tweets_learned_count >= 0),
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- tweets
-- ─────────────────────────────────────────
CREATE TABLE tweets (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    analyst_id      UUID        NOT NULL REFERENCES analysts(id) ON DELETE CASCADE,
    tweet_id        TEXT        NOT NULL UNIQUE,
    content         TEXT        NOT NULL,
    posted_at       TIMESTAMPTZ NOT NULL,
    is_financial    BOOLEAN     NOT NULL DEFAULT FALSE,
    is_processed    BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- analyst_dna
-- ─────────────────────────────────────────
CREATE TABLE analyst_dna (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    analyst_id            UUID        NOT NULL REFERENCES analysts(id) ON DELETE CASCADE,
    version               INT         NOT NULL DEFAULT 1 CHECK (version >= 1),
    profile_type          analyst_type_enum NOT NULL,
    profile_data          JSONB       NOT NULL DEFAULT '{}',
    tweets_analyzed_count INT         NOT NULL DEFAULT 0 CHECK (tweets_analyzed_count >= 0),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (analyst_id, version)
);

-- ─────────────────────────────────────────
-- insights
-- ─────────────────────────────────────────
CREATE TABLE insights (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    analyst_id   UUID        NOT NULL REFERENCES analysts(id) ON DELETE CASCADE,
    ticker       TEXT        NOT NULL,
    direction    direction_enum NOT NULL,
    strength     SMALLINT    NOT NULL CHECK (strength BETWEEN 1 AND 10),
    confidence   SMALLINT    NOT NULL CHECK (confidence BETWEEN 1 AND 10),
    horizon      horizon_enum NOT NULL,
    reasoning_he TEXT,
    key_levels   JSONB,       -- {entry, stop, target} — nullable for non-traders
    velocity     JSONB        NOT NULL DEFAULT '{}',  -- {delta, post_frequency}
    decay        JSONB        NOT NULL DEFAULT '{}',  -- {half_life_days}
    regime_fit   JSONB        NOT NULL DEFAULT '{}',  -- {BULL_STRONG: 0.95, …}
    -- Core Principle #4 – Transparency: raw_data MUST always contain tweet_url
    raw_data     JSONB        NOT NULL DEFAULT '{}',  -- {tweet_url, tweet_id, posted_at}
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- market_regimes
-- ─────────────────────────────────────────
CREATE TABLE market_regimes (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    date        DATE        NOT NULL UNIQUE,
    regime      market_regime_enum NOT NULL,
    vix_level   NUMERIC(6,2),
    spy_trend   TEXT,
    confidence  NUMERIC(4,3) CHECK (confidence >= 0 AND confidence <= 1),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- recommendations
-- ─────────────────────────────────────────
CREATE TABLE recommendations (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    date             DATE        NOT NULL,
    ticker           TEXT        NOT NULL,
    final_score      NUMERIC(5,4) CHECK (final_score >= 0 AND final_score <= 1),
    consensus        JSONB        NOT NULL DEFAULT '{}',
    contrarian_flag  BOOLEAN      NOT NULL DEFAULT FALSE,
    reasoning_he     TEXT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (date, ticker)
);

-- ─────────────────────────────────────────
-- stock_fit_results  (4-hour cache)
-- ─────────────────────────────────────────
CREATE TABLE stock_fit_results (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    analyst_id          UUID        NOT NULL REFERENCES analysts(id) ON DELETE CASCADE,
    ticker              TEXT        NOT NULL,
    -- 0.0–1.0 (consistent with final_score scale; app displays as ×10 for "8/10" UX)
    fit_score           NUMERIC(4,3) CHECK (fit_score >= 0 AND fit_score <= 1),
    explanation_he      TEXT,
    relevant_tweet_url  TEXT,
    expires_at          TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (analyst_id, ticker)
);

-- ─────────────────────────────────────────
-- users  (id mirrors Supabase auth.users.id)
-- ─────────────────────────────────────────
CREATE TABLE users (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT        NOT NULL UNIQUE,
    plan_type   plan_type_enum NOT NULL DEFAULT 'free',
    preferences JSONB        NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
