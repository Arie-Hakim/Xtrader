// Domain types (mirrored from frontend/src/types for backend independence)

export type AnalystType =
  | "trader-scalp"
  | "trader-swing"
  | "trader-position"
  | "investor-value"
  | "investor-growth"
  | "macro"
  | "mixed";

export type Direction = "bullish" | "bearish" | "neutral";
export type Horizon = "scalp" | "swing" | "long_term" | "macro";
export type MarketRegime =
  | "BULL_STRONG"
  | "BULL_WEAK"
  | "CHOP"
  | "BEAR_WEAK"
  | "BEAR_STRONG";

export interface KeyLevels {
  entry?: number;
  stop?: number;
  target?: number;
}

export interface Velocity {
  delta: number;
  post_frequency: number;
}

export interface Decay {
  half_life_days: number;
}

export type RegimeFit = Partial<Record<MarketRegime, number>>;

export interface RawData {
  tweet_url: string;
}

export interface Analyst {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  analyst_type: AnalystType;
  analyst_weight: number;
  tweets_learned_count: number;
  created_at: string;
}

export interface DNAProfileData {
  core_style: string;
  preferred_indicators: string[];
  typical_horizon: string;
  risk_management: string;
  regime_performance: Partial<Record<MarketRegime, number>>;
  top_tickers: string[];
  avg_strength: number;
  avg_confidence: number;
  summary_he: string;
}

export interface AnalystDNA {
  id: string;
  analyst_id: string;
  version: number;
  profile_type: AnalystType;
  profile_data: DNAProfileData;
  tweets_analyzed_count: number;
  created_at: string;
}

export interface Insight {
  id: string;
  analyst_id: string;
  ticker: string;
  analyst_type: AnalystType;
  direction: Direction;
  strength: number;
  confidence: number;
  horizon: Horizon;
  reasoning: string;
  key_levels?: KeyLevels;
  velocity: Velocity;
  decay: Decay;
  regime_fit: RegimeFit;
  raw_data: RawData;
  created_at: string;
}

export interface StockFitResult {
  id: string;
  analyst_id: string;
  ticker: string;
  fit_score: number;
  explanation_he: string;
  risks_he: string[];
  relevant_tweet_url?: string;
  relevant_tweet_content?: string;
  current_regime: MarketRegime;
  expires_at: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// DB row types — raw shapes returned by Supabase (enum values use underscores)
// ---------------------------------------------------------------------------

export interface DbAnalystRow {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  analyst_type: string;
  analyst_weight: number;
  tweets_learned_count: number;
  is_active: boolean;
  created_at: string;
}

export interface DbAnalystDnaRow {
  id: string;
  analyst_id: string;
  version: number;
  profile_type: string;
  profile_data: DNAProfileData;
  tweets_analyzed_count: number;
  created_at: string;
}

export interface DbInsightRow {
  id: string;
  analyst_id: string;
  ticker: string;
  direction: string;
  strength: number;
  confidence: number;
  horizon: string;
  reasoning_he: string;
  key_levels: Record<string, number> | null;
  velocity: { delta: number; post_frequency: number };
  decay: { half_life_days: number };
  regime_fit: Record<string, number>;
  raw_data: { tweet_url: string };
  created_at: string;
}

export interface DbStockFitRow {
  id: string;
  analyst_id: string;
  ticker: string;
  fit_score: number;
  explanation_he: string;
  risks_he: string[] | null;
  relevant_tweet_url: string | null;
  current_regime: string | null;
  expires_at: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Enum helpers
// ---------------------------------------------------------------------------

// Special-case mappings where DB enum ≠ simple hyphen→underscore conversion.
// DB only has 'investor'; frontend distinguishes investor-value / investor-growth.
// Writing: both map to 'investor'. Reading: 'investor' defaults to 'investor-value'.
const API_TO_DB_OVERRIDES: Record<string, string> = {
  "investor-value": "investor",
  "investor-growth": "investor",
};

const DB_TO_API_OVERRIDES: Record<string, string> = {
  investor: "investor-value",
};

export function toDbEnum(s: string): string {
  return API_TO_DB_OVERRIDES[s] ?? s.replace(/-/g, "_");
}

export function fromDbEnum(s: string): string {
  return DB_TO_API_OVERRIDES[s] ?? s.replace(/_/g, "-");
}

// ---------------------------------------------------------------------------
// Custom error class
// ---------------------------------------------------------------------------

export class AppError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = "DEFAULT") {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}
