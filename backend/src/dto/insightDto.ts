import {
  DbInsightRow,
  Direction,
  fromDbEnum,
  Horizon,
  Insight,
  AnalystType,
  RegimeFit,
  MarketRegime,
} from "../types";

export function toInsightResponse(row: DbInsightRow): Insight {
  return {
    id: row.id,
    analyst_id: row.analyst_id,
    ticker: row.ticker,
    analyst_type: "mixed" as AnalystType, // resolved via JOIN when needed
    direction: fromDbEnum(row.direction) as Direction,
    strength: row.strength,
    confidence: row.confidence,
    horizon: row.horizon as Horizon,
    reasoning: row.reasoning_he,
    key_levels: row.key_levels ?? undefined,
    velocity: row.velocity,
    decay: row.decay,
    regime_fit: row.regime_fit as RegimeFit,
    raw_data: row.raw_data,
    created_at: row.created_at,
  };
}

export function toInsightResponseWithType(
  row: DbInsightRow,
  analystType: AnalystType,
): Insight {
  return {
    ...toInsightResponse(row),
    analyst_type: analystType,
  };
}
