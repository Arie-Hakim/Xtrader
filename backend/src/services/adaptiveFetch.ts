import { supabase } from "../config/supabase";
import { logger } from "../middleware/logger";
import { AppError, DbAnalystRow, FetchTier } from "../types";

const TIER_THRESHOLDS_DAYS = {
  HOT: 3,
  WARM: 14,
} as const;

const FETCH_INTERVALS_HOURS = {
  HOT: 24,
  WARM: 7 * 24,
  COLD: 30 * 24,
} as const;

export async function determineTier(analyst_id: string): Promise<FetchTier> {
  const { data, error } = await supabase
    .from("user_analysts")
    .select("is_pinned, last_view_at")
    .eq("analyst_id", analyst_id);

  if (error) {
    logger.error({ error, analyst_id }, "determineTier query failed");
    throw new AppError(error.message, 500, "DB_ERROR");
  }

  if (!data || data.length === 0) return "COLD";

  const anyPinned = data.some((row) => row.is_pinned);
  if (anyPinned) return "HOT";

  const latestView = data.reduce<Date | null>((max, row) => {
    const d = new Date(row.last_view_at as string);
    return max === null || d > max ? d : max;
  }, null);

  if (!latestView) return "COLD";

  const daysAgo = (Date.now() - latestView.getTime()) / 86_400_000;

  if (daysAgo <= TIER_THRESHOLDS_DAYS.HOT) return "HOT";
  if (daysAgo <= TIER_THRESHOLDS_DAYS.WARM) return "WARM";
  return "COLD";
}

export function shouldFetchAnalyst(analyst: DbAnalystRow): boolean {
  if (!analyst.last_fetched_at) return true;

  const hoursSince =
    (Date.now() - new Date(analyst.last_fetched_at).getTime()) / 3_600_000;

  return hoursSince >= FETCH_INTERVALS_HOURS[analyst.fetch_tier];
}

export function getFetchParams(analyst: DbAnalystRow): {
  since_id: string | null;
  limit: number;
} {
  if (!analyst.last_tweet_id) {
    return { since_id: null, limit: 1000 };
  }
  return { since_id: analyst.last_tweet_id, limit: 200 };
}

export async function updateAnalystAfterFetch(
  analyst_id: string,
  newest_tweet_id: string,
  tweet_count: number,
  days_since_last: number,
): Promise<void> {
  const { data: current, error: fetchError } = await supabase
    .from("analysts")
    .select("tweets_per_day_avg")
    .eq("id", analyst_id)
    .single();

  if (fetchError) {
    logger.error(
      { fetchError, analyst_id },
      "updateAnalystAfterFetch read failed",
    );
    throw new AppError(fetchError.message, 500, "DB_ERROR");
  }

  const newRate =
    days_since_last > 0 ? tweet_count / days_since_last : tweet_count;
  const existingAvg =
    (current as { tweets_per_day_avg: number }).tweets_per_day_avg ?? 0;
  const updatedAvg = existingAvg * 0.7 + newRate * 0.3;

  const { error } = await supabase
    .from("analysts")
    .update({
      last_tweet_id: newest_tweet_id,
      last_fetched_at: new Date().toISOString(),
      tweets_per_day_avg: Math.round(updatedAvg * 100) / 100,
    })
    .eq("id", analyst_id);

  if (error) {
    logger.error({ error, analyst_id }, "updateAnalystAfterFetch write failed");
    throw new AppError(error.message, 500, "DB_ERROR");
  }
}

export async function rebalanceTiers(): Promise<{
  updated: number;
  distribution: Record<FetchTier, number>;
}> {
  const { data: analysts, error } = await supabase
    .from("analysts")
    .select("id")
    .eq("is_active", true);

  if (error) {
    logger.error({ error }, "rebalanceTiers fetch failed");
    throw new AppError(error.message, 500, "DB_ERROR");
  }

  const distribution: Record<FetchTier, number> = { HOT: 0, WARM: 0, COLD: 0 };
  let updated = 0;

  for (const { id } of analysts ?? []) {
    const tier = await determineTier(id);
    distribution[tier]++;

    const { error: updateError } = await supabase
      .from("analysts")
      .update({ fetch_tier: tier })
      .eq("id", id);

    if (updateError) {
      logger.warn(
        { updateError, id },
        "rebalanceTiers single update failed — skipping",
      );
    } else {
      updated++;
    }
  }

  return { updated, distribution };
}
