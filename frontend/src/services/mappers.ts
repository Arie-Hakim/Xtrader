import type { Analyst, Insight } from "@/types";
import type {
  AnalystDNA,
  AnalystProfile,
  DNAProfileData,
  StockFitReason,
  StockFitRelevantTweet,
  StockFitResult,
  StockFitRisk,
} from "@/types/analyst";
import type {
  AnalystType,
  Direction,
  Horizon,
  MarketRegime,
  RegimeFit,
} from "@/types/insight";

function requireString(obj: Record<string, unknown>, key: string): string {
  const val = obj[key];
  if (typeof val !== "string" || val.length === 0) {
    throw new Error(`mappers: required field "${key}" missing or not a string`);
  }
  return val;
}

function requireNumber(obj: Record<string, unknown>, key: string): number {
  const val = obj[key];
  if (typeof val !== "number") {
    throw new Error(`mappers: required field "${key}" missing or not a number`);
  }
  return val;
}

function asRecord(raw: unknown): Record<string, unknown> {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("mappers: expected object, got " + typeof raw);
  }
  return raw as Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Analyst
// ---------------------------------------------------------------------------

export function mapAnalyst(raw: unknown): Analyst {
  const r = asRecord(raw);
  return {
    id: requireString(r, "id"),
    username: requireString(r, "username"),
    display_name: requireString(r, "display_name"),
    avatar_url: typeof r.avatar_url === "string" ? r.avatar_url : null,
    analyst_type: requireString(r, "analyst_type") as AnalystType,
    analyst_weight: requireNumber(r, "analyst_weight"),
    tweets_learned_count: requireNumber(r, "tweets_learned_count"),
    created_at: requireString(r, "created_at"),
  };
}

// ---------------------------------------------------------------------------
// AnalystDNA
// ---------------------------------------------------------------------------

function mapDNAProfileData(raw: unknown): DNAProfileData {
  const r = asRecord(raw);
  const regime = asRecord(r.regime_performance ?? {});
  const regimePerf: Partial<Record<MarketRegime, number>> = {};
  for (const key of Object.keys(regime)) {
    const v = regime[key];
    if (typeof v === "number") {
      regimePerf[key as MarketRegime] = v;
    }
  }

  return {
    core_style: typeof r.core_style === "string" ? r.core_style : "",
    preferred_indicators: Array.isArray(r.preferred_indicators)
      ? (r.preferred_indicators as unknown[]).filter(
          (x): x is string => typeof x === "string",
        )
      : [],
    typical_horizon:
      typeof r.typical_horizon === "string" ? r.typical_horizon : "",
    risk_management:
      typeof r.risk_management === "string" ? r.risk_management : "",
    regime_performance: regimePerf,
    top_tickers: Array.isArray(r.top_tickers)
      ? (r.top_tickers as unknown[]).filter(
          (x): x is string => typeof x === "string",
        )
      : [],
    avg_strength: typeof r.avg_strength === "number" ? r.avg_strength : 0,
    avg_confidence: typeof r.avg_confidence === "number" ? r.avg_confidence : 0,
    summary_he: typeof r.summary_he === "string" ? r.summary_he : "",
  };
}

function mapAnalystDNA(raw: unknown): AnalystDNA {
  const r = asRecord(raw);
  return {
    id: requireString(r, "id"),
    analyst_id: requireString(r, "analyst_id"),
    version: requireNumber(r, "version"),
    profile_type: requireString(r, "profile_type") as AnalystType,
    profile_data: mapDNAProfileData(r.profile_data),
    tweets_analyzed_count: requireNumber(r, "tweets_analyzed_count"),
    created_at: requireString(r, "created_at"),
  };
}

// ---------------------------------------------------------------------------
// AnalystProfile
// M1: backend returns { analyst, dna } only — no insights or quotes
// ---------------------------------------------------------------------------

export function mapAnalystProfile(raw: unknown): AnalystProfile {
  const r = asRecord(raw);
  return {
    analyst: mapAnalyst(r.analyst),
    dna: r.dna != null ? mapAnalystDNA(r.dna) : null,
  };
}

// ---------------------------------------------------------------------------
// Insight
// ---------------------------------------------------------------------------

export function mapInsight(raw: unknown): Insight {
  const r = asRecord(raw);

  const rawRegimeFit = r.regime_fit != null ? asRecord(r.regime_fit) : {};
  const regime_fit: RegimeFit = {};
  for (const key of Object.keys(rawRegimeFit)) {
    const v = rawRegimeFit[key];
    if (typeof v === "number") {
      regime_fit[key as MarketRegime] = v;
    }
  }

  const rawKeyLevels =
    r.key_levels != null && typeof r.key_levels === "object"
      ? asRecord(r.key_levels)
      : null;

  const rawVelocity = asRecord(r.velocity ?? {});
  const rawDecay = asRecord(r.decay ?? {});
  const rawRawData = asRecord(r.raw_data ?? {});

  return {
    id: requireString(r, "id"),
    analyst_id: typeof r.analyst_id === "string" ? r.analyst_id : "",
    ticker: requireString(r, "ticker"),
    analyst_type: (requireString(r, "analyst_type") as AnalystType) ?? "mixed",
    direction: (requireString(r, "direction") as Direction) ?? "neutral",
    strength: typeof r.strength === "number" ? r.strength : 0,
    confidence: typeof r.confidence === "number" ? r.confidence : 0,
    horizon: (requireString(r, "horizon") as Horizon) ?? "swing",
    reasoning: typeof r.reasoning === "string" ? r.reasoning : "",
    key_levels: rawKeyLevels
      ? {
          entry:
            typeof rawKeyLevels.entry === "number"
              ? rawKeyLevels.entry
              : undefined,
          stop:
            typeof rawKeyLevels.stop === "number"
              ? rawKeyLevels.stop
              : undefined,
          target:
            typeof rawKeyLevels.target === "number"
              ? rawKeyLevels.target
              : undefined,
        }
      : undefined,
    velocity: {
      delta: typeof rawVelocity.delta === "number" ? rawVelocity.delta : 0,
      post_frequency:
        typeof rawVelocity.post_frequency === "number"
          ? rawVelocity.post_frequency
          : 0,
    },
    decay: {
      half_life_days:
        typeof rawDecay.half_life_days === "number"
          ? rawDecay.half_life_days
          : 7,
    },
    regime_fit,
    raw_data: {
      tweet_url:
        typeof rawRawData.tweet_url === "string" ? rawRawData.tweet_url : "",
    },
    created_at: requireString(r, "created_at"),
  };
}

// ---------------------------------------------------------------------------
// StockFitResult
// ---------------------------------------------------------------------------

export function mapStockFitResult(raw: unknown): StockFitResult {
  const r = asRecord(raw);

  const risks: StockFitRisk[] = Array.isArray(r.risks)
    ? (r.risks as unknown[]).map((item) => {
        const rr =
          typeof item === "object" && item !== null
            ? (item as Record<string, unknown>)
            : {};
        const sev = rr.severity;
        return {
          risk_he: typeof rr.risk_he === "string" ? rr.risk_he : "",
          severity:
            sev === "low" || sev === "moderate" || sev === "high" ? sev : "low",
        };
      })
    : [];

  const reasons: StockFitReason[] = Array.isArray(r.reasons)
    ? (r.reasons as unknown[]).map((item) => {
        const rr =
          typeof item === "object" && item !== null
            ? (item as Record<string, unknown>)
            : {};
        return {
          rule: typeof rr.rule === "string" ? rr.rule : "",
          met: typeof rr.met === "boolean" ? rr.met : false,
          detail_he: typeof rr.detail_he === "string" ? rr.detail_he : "",
        };
      })
    : [];

  const rawTweet =
    r.relevant_tweet != null && typeof r.relevant_tweet === "object"
      ? (r.relevant_tweet as Record<string, unknown>)
      : null;
  const relevant_tweet: StockFitRelevantTweet | null = rawTweet
    ? {
        content: typeof rawTweet.content === "string" ? rawTweet.content : "",
        tweet_url:
          typeof rawTweet.tweet_url === "string" ? rawTweet.tweet_url : "",
        posted_at:
          typeof rawTweet.posted_at === "string" ? rawTweet.posted_at : "",
        days_ago: typeof rawTweet.days_ago === "number" ? rawTweet.days_ago : 0,
      }
    : null;

  return {
    fit_score: typeof r.fit_score === "number" ? r.fit_score : 0,
    fit_label: typeof r.fit_label === "string" ? r.fit_label : "",
    regime_aligned:
      typeof r.regime_aligned === "boolean" ? r.regime_aligned : false,
    reasons,
    risks,
    relevant_tweet,
    regime_note_he:
      typeof r.regime_note_he === "string" ? r.regime_note_he : "",
    explanation_he:
      typeof r.explanation_he === "string" ? r.explanation_he : "",
    cache_ttl_hours:
      typeof r.cache_ttl_hours === "number" ? r.cache_ttl_hours : 4,
  };
}
