import { z } from "zod";

export const InsightResponseSchema = z.object({
  ticker: z.string().nullable(),
  analyst_type: z.string(),
  direction: z.enum(["bullish", "bearish", "neutral"]),
  strength: z.number().min(1).max(10),
  confidence: z.number().min(1).max(10),
  horizon: z.enum(["scalp", "swing", "long_term", "macro"]),
  reasoning: z.string(),
  key_levels: z
    .object({
      entry: z.number().optional(),
      stop: z.number().optional(),
      target: z.number().optional(),
    })
    .nullable()
    .optional(),
  velocity: z.object({
    delta: z.number(),
    post_frequency: z.number(),
  }),
  decay: z.object({ half_life_days: z.number() }),
  regime_fit: z.record(z.number()),
  raw_data: z.object({
    tweet_url: z.string(),
    tweet_content: z.string(),
    posted_at: z.string(),
  }),
});

export const DnaResponseSchema = z.object({
  analyst_id: z.string().optional(),
  version: z.number().int().optional(),
  profile_type: z.string().optional(),
  tweets_analyzed_count: z.number().optional(),
  trading_style: z.object({
    summary_he: z.string(),
    horizon_preference: z.string().optional(),
    avg_hold_days: z.number().optional(),
    risk_reward_ratio: z.number().optional(),
  }),
  entry_rules: z.array(z.string()),
  exit_rules: z.array(z.string()),
  dominant_indicators: z.array(
    z.object({
      name: z.string(),
      weight: z.number(),
      description_he: z.string(),
    }),
  ),
  sector_preferences: z.array(z.string()).optional(),
  regime_performance: z.record(
    z.object({
      avg_strength: z.number(),
      insight_count: z.number(),
      fit: z.number(),
    }),
  ),
  contrarian_risk: z
    .object({ hype_sensitivity: z.number(), note_he: z.string() })
    .optional(),
  key_quotes: z
    .array(
      z.object({
        quote: z.string(),
        tweet_url: z.string(),
        theme: z.string(),
      }),
    )
    .optional(),
});

export const StockFitResponseSchema = z.object({
  fit_score: z.number().min(1).max(10),
  fit_label: z.string(),
  regime_aligned: z.boolean(),
  reasons: z.array(
    z.object({ rule: z.string(), met: z.boolean(), detail_he: z.string() }),
  ),
  risks: z.array(
    z.object({
      risk_he: z.string(),
      severity: z.enum(["low", "moderate", "high"]),
    }),
  ),
  relevant_tweet: z
    .object({
      content: z.string(),
      tweet_url: z.string(),
      posted_at: z.string(),
      days_ago: z.number(),
    })
    .nullable(),
  regime_note_he: z.string(),
  explanation_he: z.string(),
  cache_ttl_hours: z.number(),
});

export type InsightResponse = z.infer<typeof InsightResponseSchema>;
export type DnaResponse = z.infer<typeof DnaResponseSchema>;
export type StockFitResponse = z.infer<typeof StockFitResponseSchema>;
