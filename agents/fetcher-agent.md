# Agent: Fetcher

## Purpose

Fetch 500–1,000 tweets per analyst from X using Grok X Search Tool and persist them as raw, unprocessed records in the database. This is the entry point of the entire XTrader pipeline — every downstream agent depends on this data.

---

## Trigger

- **Scheduled:** Daily at 06:00 (cron: `0 6 * * *`)
- **Manual:** On-demand via Claude Console → Managed Agents → trigger

---

## Skills Used

None — this agent performs pure data fetching via the Grok X Search Tool.

---

## Input

```json
{
  "username": "string", // X handle without @, e.g. "qullamaggie"
  "count": 500 // Target tweet count. Default: 500. Max: 1,000.
}
```

When triggered by cron, the agent iterates over all active analysts in the `analysts` table automatically.

---

## Output

Raw tweets saved to the `tweets` table in Supabase:

| Column       | Value                                           |
| ------------ | ----------------------------------------------- |
| `tweet_id`   | Unique X tweet ID (deduplication key)           |
| `analyst_id` | FK to `analysts` table                          |
| `content`    | Raw tweet text                                  |
| `posted_at`  | Original tweet timestamp (ISO-8601)             |
| `url`        | Full tweet URL (`https://x.com/user/status/ID`) |
| `processed`  | `false` — Parser will flip this to `true`       |

---

## Flow

1. **Load analysts** — Query `analysts` table for all `active = true` records
2. **For each analyst:**
   a. Call Grok X Search Tool: `{ username, count }`
   b. Paginate results until `count` tweets fetched or no further results available
   c. Deduplicate: skip `tweet_id` values already present in `tweets` table
   d. Upsert new tweets with `processed = false`
   e. Log: `{ analyst_username, fetched_count, new_count, duplicate_count }`
3. **Record run** — Insert row in `fetcher_runs`: `{ timestamp, total_analysts, total_tweets_fetched, total_new, errors }`

---

## Error Handling

| Scenario                            | Action                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| Rate limit (429)                    | Exponential backoff: retry after 30s → 60s → 120s; fail gracefully after 3rd attempt |
| < 100 tweets fetched for an analyst | Log warning; send alert to monitoring; continue to next analyst                      |
| Grok API error (5xx)                | Log error with `analyst_username`; skip analyst; continue pipeline                   |
| DB write failure                    | Retry once; halt and alert if still failing                                          |
| Analyst with 0 tweets found         | Log as `no_data`; do not trigger Parser for this analyst                             |

---

## Cost Estimation

- **Tool:** Grok X Search Tool
- **Rate:** ~$5 per 1,000 tweet searches (spec §12)
- **Per analyst per day:** 500–1,000 tweets ≈ **$0.50–1.00**
- **Daily cost (20 analysts):** ≈ **$10–20/day**
- **Monthly cost (20 analysts):** ≈ **$300–600/month**

> Cost optimization: reduce `count` to 500 (minimum for reliable DNA). Avoid re-fetching
> analysts more than once per day — the `fetcher_runs` log enforces this guard.

---

## Adaptive Fetch Strategy

Instead of fetching all analysts daily, the Fetcher assigns each analyst a **tier** based on
how recently any user viewed them. This cuts monthly Fetcher cost by ~95%.

See [ADAPTIVE_STRATEGY.md](ADAPTIVE_STRATEGY.md) for the full cost analysis and state machine.

### Tiers

| Tier   | Condition                      | Fetch Schedule         |
| ------ | ------------------------------ | ---------------------- |
| HOT    | `last_user_view_at` ≤ 7 days   | Daily at 06:00         |
| WARM   | `last_user_view_at` 8–30 days  | Weekly (Sundays 06:00) |
| COLD   | `last_user_view_at` > 30 days  | Monthly (1st at 06:00) |
| PINNED | User explicitly pinned analyst | Always daily (HOT)     |

### Fetch Logic Changes

- **After initial fetch (500–1,000 tweets):** use `since_id` parameter for all subsequent
  incremental fetches — only new tweets since the last run are pulled
- **`analysts.fetch_tier`** column drives which analysts run on each cron invocation
- **`analyst_user_views`** table tracks `(analyst_id, user_id, viewed_at)` — Fetcher reads
  `MAX(viewed_at)` per analyst to determine tier
- **Nightly rebalance job** at 02:00 recalculates and writes `fetch_tier` for all analysts

### COLD Re-Entry (On-Demand)

When a user views a COLD analyst, the agent fires an on-demand fetch immediately:

1. Insert row in `analyst_user_views`
2. Trigger Fetcher for that analyst (manual trigger path)
3. Use `since_id` for incremental fetch — not a full 500-tweet pull
4. Analyst promoted to HOT; normal daily cadence resumes

### Adaptive Cost Estimates (20 Analysts)

| Tier      | Count | Cost/Month     |
| --------- | ----- | -------------- |
| HOT       | 5     | $7.50          |
| WARM      | 10    | $6.00          |
| COLD      | 5     | $0.50          |
| **Total** | 20    | **~$14/month** |

Compared to $300–600/month naïve daily fetch → **~95% savings.**

---

## Plan-Based Limits (Future)

> Implementation deferred to Monetization sprint. Reference only.

| Plan    | Max Analysts | HOT Slots | Pinning | Stock Fit/day |
| ------- | ------------ | --------- | ------- | ------------- |
| FREE    | 3            | 1         | 0       | 5             |
| PRO     | 10           | 3         | 2       | 50            |
| PREMIUM | 50           | 10        | 10      | unlimited     |

**HOT Slots** = maximum analysts a user can hold in HOT tier simultaneously.
Analysts beyond a user's HOT slot cap are demoted to WARM regardless of view recency.
Enforcement lives in the nightly rebalance job, not in the Fetcher itself.
