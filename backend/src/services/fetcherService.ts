import axios, { AxiosError } from "axios";
import { supabase } from "../config/supabase";
import { logger } from "../middleware/logger";
import {
  getFetchParams,
  shouldFetchAnalyst,
  updateAnalystAfterFetch,
} from "./adaptiveFetch";
import { getAllAnalysts } from "./supabaseService";
import { DbAnalystRow } from "../types";
import {
  AnalystFetchResult,
  DailyFetchResult,
  FetchOptions,
  FetchResult,
  RawTweet,
  SaveResult,
} from "../types/fetcher";

const API_BASE = process.env.TWITTER_API_URL ?? "https://api.twitter.com/2";

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(err: unknown): boolean {
  if (err instanceof AxiosError) {
    if (!err.response) return true; // network error
    const status = err.response.status;
    if (status === 429 || status >= 500) return true;
  }
  return false;
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  const delays = [1000, 2000, 4000];
  let lastErr: unknown;
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!isRetryable(err)) throw err;
      lastErr = err;
      if (attempt < delays.length) {
        logger.warn(
          { attempt: attempt + 1 },
          `ניסיון חוזר אחרי שגיאת רשת/קצב...`,
        );
        await pause(delays[attempt]);
      }
    }
  }
  throw lastErr;
}

export async function fetchTweetsFromX(
  username: string,
  options: FetchOptions = {},
): Promise<FetchResult> {
  const token = process.env.TWITTER_BEARER_TOKEN;
  if (!token) {
    logger.warn("TWITTER_BEARER_TOKEN חסר — מדלג על שליפת טוויטים");
    return { tweets: [], lastTweetId: null, displayName: username, username };
  }

  const headers = { Authorization: `Bearer ${token}` };
  const maxTweets = options.maxTweets ?? 1000;

  // Resolve userId + display name
  const userRes = await withRetry(() =>
    axios.get(`${API_BASE}/users/by/username/${username}`, {
      headers,
      timeout: 30000,
    }),
  );

  const userData = userRes.data?.data;
  if (!userData) {
    throw new Error(`משתמש @${username} לא נמצא`);
  }
  const userId: string = userData.id;
  const displayName: string = userData.name ?? username;

  const tweets: RawTweet[] = [];
  let nextToken: string | undefined;
  const maxPages = Math.ceil(maxTweets / 100);

  for (let page = 0; page < maxPages; page++) {
    const params: Record<string, string | number> = {
      max_results: 100,
      "tweet.fields": "created_at,text,public_metrics",
      exclude: "retweets,replies",
    };
    if (options.sinceId) params.since_id = options.sinceId;
    if (nextToken) params.pagination_token = nextToken;

    const res = await withRetry(() =>
      axios.get(`${API_BASE}/users/${userId}/tweets`, {
        headers,
        params,
        timeout: 30000,
      }),
    );

    const batch: RawTweet[] = (res.data?.data ?? []).map((t: any) => ({
      id: t.id,
      text: t.text,
      created_at: t.created_at,
      author_username: username,
      public_metrics: t.public_metrics ?? {
        retweet_count: 0,
        reply_count: 0,
        like_count: 0,
        quote_count: 0,
      },
    }));

    tweets.push(...batch);
    nextToken = res.data?.meta?.next_token;

    if (!nextToken || tweets.length >= maxTweets) break;

    await pause(500);
  }

  return {
    tweets,
    lastTweetId: tweets[0]?.id ?? null,
    displayName,
    username,
  };
}

export async function saveTweetsToDB(
  tweets: RawTweet[],
  analystId: string,
): Promise<SaveResult> {
  if (tweets.length === 0) return { saved: 0, skipped: 0, errors: 0 };

  const rows = tweets.map((t) => ({
    analyst_id: analystId,
    tweet_id: t.id,
    content: t.text,
    posted_at: t.created_at,
    is_processed: false,
    is_financial: false,
  }));

  const { data, error } = await supabase
    .from("tweets")
    .upsert(rows, { onConflict: "tweet_id", ignoreDuplicates: true })
    .select("tweet_id");

  if (error) {
    logger.error({ error, analystId }, "שגיאה בשמירת טוויטים ל-DB");
    return { saved: 0, skipped: tweets.length, errors: 1 };
  }

  const saved = data?.length ?? 0;
  const skipped = tweets.length - saved;
  return { saved, skipped, errors: 0 };
}

export async function runFetchForAnalyst(
  analyst: DbAnalystRow,
): Promise<AnalystFetchResult> {
  const base: Omit<
    AnalystFetchResult,
    "fetched" | "saved" | "skipped" | "errors"
  > = {
    analystId: analyst.id,
    username: analyst.username,
  };

  if (!shouldFetchAnalyst(analyst)) {
    logger.info(
      { username: analyst.username },
      "מדלג על שליפה — לא זמן לפי הטייר",
    );
    return {
      ...base,
      fetched: 0,
      saved: 0,
      skipped: 1,
      errors: 0,
      skippedReason: "לא זמן לשליפה לפי הטייר",
    };
  }

  const { since_id, limit } = getFetchParams(analyst);

  logger.info({ username: analyst.username, since_id, limit }, "מתחיל שליפה");

  let fetchResult: FetchResult;
  try {
    fetchResult = await fetchTweetsFromX(analyst.username, {
      sinceId: since_id ?? undefined,
      maxTweets: limit,
    });
  } catch (err) {
    logger.error({ err, username: analyst.username }, "שליפה נכשלה");
    return { ...base, fetched: 0, saved: 0, skipped: 0, errors: 1 };
  }

  const { tweets, lastTweetId } = fetchResult;

  logger.info(
    { username: analyst.username, count: tweets.length },
    "טוויטים נשלפו",
  );

  const saveResult = await saveTweetsToDB(tweets, analyst.id);

  if (saveResult.saved > 0 && lastTweetId) {
    const daysSinceLast = analyst.last_fetched_at
      ? (Date.now() - new Date(analyst.last_fetched_at).getTime()) / 86_400_000
      : 1;
    await updateAnalystAfterFetch(
      analyst.id,
      lastTweetId,
      saveResult.saved,
      daysSinceLast,
    );
  }

  logger.info({ username: analyst.username, ...saveResult }, "שליפה הושלמה");

  return {
    ...base,
    fetched: tweets.length,
    saved: saveResult.saved,
    skipped: saveResult.skipped,
    errors: saveResult.errors,
  };
}

export async function runDailyFetch(): Promise<DailyFetchResult> {
  const start = Date.now();
  logger.info("שליפה יומית מתחילה...");

  const analysts = await getAllAnalysts();
  const eligible = analysts.filter((a) => shouldFetchAnalyst(a));

  logger.info(
    { total: analysts.length, eligible: eligible.length },
    "אנליסטים לשליפה",
  );

  let fetched = 0;
  let saved = 0;
  let skipped = 0;
  let errors = 0;

  for (const analyst of analysts) {
    const result = await runFetchForAnalyst(analyst);
    fetched += result.fetched;
    saved += result.saved;
    skipped += result.skipped;
    errors += result.errors;
  }

  const summary: DailyFetchResult = {
    totalAnalysts: analysts.length,
    fetched,
    saved,
    skipped,
    errors,
    durationMs: Date.now() - start,
  };

  logger.info(summary, "שליפה יומית הסתיימה");
  return summary;
}
