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
