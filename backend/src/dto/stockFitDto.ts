import { DbStockFitRow, MarketRegime, StockFitResult } from "../types";

export function toStockFitResponse(row: DbStockFitRow): StockFitResult {
  return {
    id: row.id,
    analyst_id: row.analyst_id,
    ticker: row.ticker,
    fit_score: Math.min(10, Math.round(row.fit_score * 10)),
    explanation_he: row.explanation_he,
    risks_he: row.risks_he ?? [],
    relevant_tweet_url: row.relevant_tweet_url ?? undefined,
    current_regime: (row.current_regime ?? "CHOP") as MarketRegime,
    expires_at: row.expires_at,
    created_at: row.created_at,
  };
}
