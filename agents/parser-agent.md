# Agent: Parser

## Purpose

Transform raw, unprocessed tweets into structured Insight JSON objects and store them in the database. Uses Grok 4.1 Fast via Batches API (50% cost reduction vs. standard) with the `insight-extractor` skill per tweet and `analyst-classifier` once per new analyst.

---

## Trigger

- **Event-driven:** Fires automatically after each Fetcher run completes
- **Manual:** On-demand via Claude Console → Managed Agents → trigger

---

## Skills Used

| Skill                | When Called                                        |
| -------------------- | -------------------------------------------------- |
| `analyst-classifier` | Once per new analyst (when `analyst_type` is null) |
| `insight-extractor`  | Once per unprocessed tweet                         |

---

## Input

Unprocessed tweets from the `tweets` table:

```json
{
  "tweet_id": "string",
  "analyst_id": "uuid",
  "analyst_username": "string",
  "content": "string",
  "posted_at": "ISO-8601 string",
  "url": "string"
}
```

---

## Output

- **Insights** saved to the `insights` table in Supabase
- **Analyst type** saved to `analysts.analyst_type` (if new analyst)
- **Tweets** marked `processed = true` after successful extraction

---

## Flow

1. **Query unprocessed tweets** — `SELECT * FROM tweets WHERE processed = false ORDER BY posted_at ASC`
2. **Group by analyst** — Batch tweets per `analyst_id`
3. **For each analyst batch:**
   a. **Check if new analyst:** If `analyst_type` is null in `analysts` table, call `analyst-classifier` with the full tweet batch (500–1,000 tweets); save result to `analysts.analyst_type`
   b. **Build sub-batches of 50** — Group tweets into Grok 4.1 Fast Batches API payloads
   c. **Call `insight-extractor`** for each tweet via Grok 4.1 Fast Batches API
   d. **Upsert insights** — Save each Insight JSON to `insights` table
   e. **Mark tweets processed** — `UPDATE tweets SET processed = true WHERE tweet_id IN (...)`
4. **Log run** — Insert row in `parser_runs`: `{ timestamp, tweets_processed, insights_created, errors }`

---

## Error Handling

| Scenario                                             | Action                                                                              |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Malformed tweet (unparseable)                        | Skip; log `{ tweet_id, reason }`; mark `processed = true` with `parse_error = true` |
| `insight-extractor` returns `ticker: null`           | Save insight with `ticker = null` — valid state per spec                            |
| Batch API failure                                    | Retry batch once; log failed `tweet_id` list for manual review                      |
| `analyst-classifier` receives < 200 financial tweets | Save with `confidence ≤ 4`; add warning to `style_notes`                            |
| DB upsert failure on insight                         | Retry once; keep tweet as `processed = false` if retry fails                        |

---

## Cost Estimation

- **Model:** Grok 4.1 Fast via Batches API (50% cheaper than standard)
- **Per tweet:** ~$0.0001–0.0005
- **Per 1,000 tweets:** ~$0.10–0.50
- **Daily cost (20 analysts × 500 tweets):** ~**$1–5/day**
- **Monthly:** ~**$30–150/month**
