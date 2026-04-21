-- XTrader – ENUM Types
-- Run this file FIRST, before schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Analyst type (SQL uses underscores; app layer maps trader-scalp ↔ trader_scalp)
CREATE TYPE analyst_type_enum AS ENUM (
    'trader_scalp',
    'trader_swing',
    'trader_position',
    'investor',   -- covers both value and growth; sub-type stored in DNA profile_data
    'macro',
    'mixed'
);

-- Directional bias of an Insight
CREATE TYPE direction_enum AS ENUM (
    'bullish',
    'bearish',
    'neutral'
);

-- Investment / trade horizon
CREATE TYPE horizon_enum AS ENUM (
    'scalp',
    'swing',
    'long_term',
    'macro'
);

-- Market regime (Regime Detector output)
CREATE TYPE market_regime_enum AS ENUM (
    'BULL_STRONG',
    'BULL_WEAK',
    'CHOP',
    'BEAR_WEAK',
    'BEAR_STRONG'
);

-- Subscription plan
CREATE TYPE plan_type_enum AS ENUM (
    'free',
    'pro',
    'team',
    'enterprise'
);
