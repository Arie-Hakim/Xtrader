export interface RawTweet {
  id: string;
  text: string;
  created_at: string;
  author_username: string;
  public_metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

export interface FetchOptions {
  sinceId?: string;
  maxTweets?: number;
}

export interface FetchResult {
  tweets: RawTweet[];
  lastTweetId: string | null;
  displayName: string;
  username: string;
}

export interface SaveResult {
  saved: number;
  skipped: number;
  errors: number;
}

export interface AnalystFetchResult {
  analystId: string;
  username: string;
  fetched: number;
  saved: number;
  skipped: number;
  errors: number;
  skippedReason?: string;
}

export interface DailyFetchResult {
  totalAnalysts: number;
  fetched: number;
  saved: number;
  skipped: number;
  errors: number;
  durationMs: number;
}
