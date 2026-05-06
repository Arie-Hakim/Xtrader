import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "../config/supabase";
import { logger } from "../middleware/logger";
import { AppError } from "../types";
import { InsightResponseSchema } from "../validation/claudeResponses";
import { callClaude, extractJson, loadSkillPrompt } from "./claudeClient";

const BATCH_SIZE = 3;

function pause(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

interface TweetRow {
  id: string;
  tweet_id: string;
  content: string;
  posted_at: string;
}

export async function parseUnprocessedTweets(analystId: string): Promise<{
  processed: number;
  insights: number;
  skipped: number;
}> {
  const { data: analyst, error: aErr } = await supabase
    .from("analysts")
    .select("id, username, analyst_type")
    .eq("id", analystId)
    .eq("is_active", true)
    .single();

  if (aErr || !analyst) {
    throw new AppError(`אנליסט לא נמצא: ${analystId}`, 404, "NOT_FOUND");
  }

  const { data: tweets, error: tErr } = await supabase
    .from("tweets")
    .select("id, tweet_id, content, posted_at")
    .eq("analyst_id", analystId)
    .eq("is_processed", false)
    .limit(200);

  if (tErr) throw new AppError(tErr.message, 500, "DB_ERROR");
  if (!tweets || tweets.length === 0)
    return { processed: 0, insights: 0, skipped: 0 };

  const prompt = loadSkillPrompt("insight-extractor");
  let processed = 0;
  let insightsCreated = 0;
  let skipped = 0;
  let batchNum = 0;

  for (let i = 0; i < tweets.length; i += BATCH_SIZE) {
    batchNum++;
    const batch = (tweets as TweetRow[]).slice(i, i + BATCH_SIZE);
    logger.info(
      { analystId, batch: batchNum, count: batch.length },
      "processing batch",
    );

    const results = await Promise.allSettled(
      batch.map((tweet) => processSingleTweet(tweet, analyst, prompt)),
    );

    for (let j = 0; j < results.length; j++) {
      const tweet = batch[j];
      const result = results[j];

      if (result.status === "fulfilled") {
        const { isFinancial } = result.value;
        await supabase
          .from("tweets")
          .update({ is_processed: true, is_financial: isFinancial })
          .eq("id", tweet.id);
        processed++;
        if (isFinancial) insightsCreated++;
      } else {
        const err = result.reason as Error;
        const isTransient =
          err instanceof Anthropic.RateLimitError ||
          err instanceof Anthropic.APIConnectionError;

        if (isTransient) {
          logger.warn(
            { analystId, tweetId: tweet.tweet_id, err: err.message },
            "transient error — not marking processed",
          );
        } else {
          await supabase
            .from("tweets")
            .update({ is_processed: true, is_financial: false })
            .eq("id", tweet.id);
          skipped++;
          logger.warn(
            { analystId, tweetId: tweet.tweet_id, err: err.message },
            "tweet skipped permanently",
          );
        }
      }
    }

    logger.info(
      { analystId, processed, insights: insightsCreated, skipped, batchNum },
      "batch done",
    );
    if (i + BATCH_SIZE < tweets.length) await pause(500);
  }

  return { processed, insights: insightsCreated, skipped };
}

async function processSingleTweet(
  tweet: TweetRow,
  analyst: { id: string; username: string; analyst_type: string },
  prompt: string,
): Promise<{ isFinancial: boolean }> {
  const tweetUrl = `https://x.com/${analyst.username}/status/${tweet.tweet_id}`;
  const input = {
    tweet_url: tweetUrl,
    tweet_content: tweet.content,
    posted_at: tweet.posted_at,
    analyst_type: analyst.analyst_type,
  };

  logger.info(
    { analystId: analyst.id, tweetId: tweet.tweet_id },
    "sending to claude",
  );
  const raw = await callClaude(prompt, JSON.stringify(input));
  const parsed = InsightResponseSchema.safeParse(extractJson(raw));

  if (!parsed.success) {
    logger.warn(
      { tweetId: tweet.tweet_id, issues: parsed.error.issues },
      "invalid insight response",
    );
    throw new Error(
      `Claude returned invalid Insight JSON: ${parsed.error.message}`,
    );
  }

  const data = parsed.data;
  if (!data.ticker) return { isFinancial: false };

  const insightRow = {
    analyst_id: analyst.id,
    ticker: data.ticker,
    direction: data.direction,
    strength: Math.round(data.strength),
    confidence: Math.round(data.confidence),
    horizon: data.horizon,
    reasoning_he: data.reasoning,
    key_levels: data.key_levels
      ? Object.fromEntries(
          Object.entries(data.key_levels).filter(([, v]) => v != null) as [
            string,
            number,
          ][],
        )
      : null,
    velocity: {
      delta: data.velocity.delta,
      post_frequency: data.velocity.post_frequency,
    },
    decay: { half_life_days: data.decay.half_life_days },
    regime_fit: data.regime_fit,
    raw_data: {
      tweet_url: data.raw_data.tweet_url,
      tweet_content: data.raw_data.tweet_content,
      tweet_id: tweet.tweet_id,
      posted_at: tweet.posted_at,
    },
  };

  const { error: iErr } = await supabase.from("insights").insert(insightRow);

  if (iErr) {
    logger.error(
      { analystId: analyst.id, tweetId: tweet.tweet_id, error: iErr },
      "failed to save insight",
    );
    throw new Error(`Insight upsert failed: ${iErr.message}`);
  }

  logger.info(
    { analystId: analyst.id, tweetId: tweet.tweet_id, ticker: data.ticker },
    "insight saved",
  );
  return { isFinancial: true };
}
