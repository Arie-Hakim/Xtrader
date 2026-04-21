export type AnalystType =
  | 'trader-scalp'
  | 'trader-swing'
  | 'trader-position'
  | 'investor-value'
  | 'investor-growth'
  | 'macro'
  | 'mixed'

export type Direction = 'bullish' | 'bearish' | 'neutral'

export type Horizon = 'scalp' | 'swing' | 'long_term' | 'macro'

export type MarketRegime =
  | 'BULL_STRONG'
  | 'BULL_WEAK'
  | 'CHOP'
  | 'BEAR_WEAK'
  | 'BEAR_STRONG'

export interface KeyLevels {
  entry?: number
  stop?: number
  target?: number
}

export interface Velocity {
  delta: number
  post_frequency: number
}

export interface Decay {
  half_life_days: number
}

export type RegimeFit = Partial<Record<MarketRegime, number>>

export interface RawData {
  tweet_url: string
}

export interface Insight {
  id: string
  ticker: string
  analyst_type: AnalystType
  direction: Direction
  strength: number        // 1-10
  confidence: number      // 1-10
  horizon: Horizon
  reasoning: string       // Hebrew text
  key_levels?: KeyLevels
  velocity: Velocity
  decay: Decay
  regime_fit: RegimeFit
  raw_data: RawData
  created_at: string
}
