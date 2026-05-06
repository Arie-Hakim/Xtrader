import type { AnalystType, MarketRegime } from "./insight";

export interface Analyst {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  analyst_type: AnalystType;
  analyst_weight: number; // 0-1, dynamic based on performance
  tweets_learned_count: number;
  created_at: string;
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

export interface StockFitRisk {
  risk_he: string;
  severity: "low" | "moderate" | "high";
}

export interface StockFitReason {
  rule: string;
  met: boolean;
  detail_he: string;
}

export interface StockFitRelevantTweet {
  content: string;
  tweet_url: string;
  posted_at: string;
  days_ago: number;
}

export interface StockFitResult {
  fit_score: number;
  fit_label: string;
  regime_aligned: boolean;
  reasons: StockFitReason[];
  risks: StockFitRisk[];
  relevant_tweet: StockFitRelevantTweet | null;
  regime_note_he: string;
  explanation_he: string;
  cache_ttl_hours: number;
}

export interface AnalystProfile {
  analyst: Analyst;
  dna: AnalystDNA | null;
}
