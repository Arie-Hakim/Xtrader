import type { AnalystType, MarketRegime } from './insight'

export interface Analyst {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  analyst_type: AnalystType
  analyst_weight: number  // 0-1, dynamic based on performance
  tweets_learned_count: number
  created_at: string
}

export interface AnalystDNA {
  id: string
  analyst_id: string
  version: number
  profile_type: AnalystType
  profile_data: DNAProfileData
  tweets_analyzed_count: number
  created_at: string
}

export interface DNAProfileData {
  core_style: string
  preferred_indicators: string[]
  typical_horizon: string
  risk_management: string
  regime_performance: Partial<Record<MarketRegime, number>>
  top_tickers: string[]
  avg_strength: number
  avg_confidence: number
  summary_he: string
}

export interface StockFitResult {
  id: string
  analyst_id: string
  ticker: string
  fit_score: number      // 0-10
  explanation_he: string
  risks_he: string[]
  relevant_tweet_url?: string
  relevant_tweet_content?: string
  current_regime: MarketRegime
  expires_at: string
  created_at: string
}
