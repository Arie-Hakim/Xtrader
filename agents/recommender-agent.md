# Agent: Recommender

## Purpose

Aggregate all active, non-expired Insights across analysts, apply the Scoring Engine formula (spec §6), and generate ranked daily stock recommendations plus a Hebrew morning report. Runs after Regime Detector so the regime multiplier is always fresh.

---

## Trigger

- **Scheduled:** Daily at 08:00 (cron: `0 8 * * *`) — depends on Regime Detector (07:00) having completed

---

## Skills Used

| Skill                    | Purpose                                                                 |
| ------------------------ | ----------------------------------------------------------------------- |
| `recommendation-builder` | Scoring engine, consensus computation, contrarian signal, Hebrew report |

---

## Input

```json
{
  "date": "2026-04-24",
  "current_regime": "BULL_STRONG",
  "insights": ["...all active, non-expired Insight objects..."],
  "analysts": [
    {
      "analyst_id": "uuid",
      "analyst_username": "string",
      "analyst_type": "trader-swing",
      "analyst_weight": 0.85
    }
  ],
  "sentiment_scores": {
    "NVDA": 82,
    "TSLA": 45
  }
}
```

Loaded from:

- `market_regimes` table → today's `regime`
- `insights` table → `WHERE age_days < 3 × half_life_days` (non-expired only)
- `analysts` table → `analyst_weight`, `analyst_type` for all active analysts
- External sentiment provider → optional; omit if unavailable

---

## Output

Two writes to Supabase:

**`recommendations` table** — one row per ticker:

| Column               | Value                             |
| -------------------- | --------------------------------- |
| `date`               | Today's date                      |
| `ticker`             | Stock symbol                      |
| `final_score`        | 0–10 composite score              |
| `direction`          | `bullish` / `bearish` / `neutral` |
| `consensus_strength` | `strong` / `moderate` / `weak`    |
| `result_json`        | Full recommendation object        |

**`daily_reports` table** — one row per day:

| Column       | Value                          |
| ------------ | ------------------------------ |
| `date`       | Today's date                   |
| `report_he`  | Hebrew markdown morning report |
| `regime`     | Today's regime                 |
| `top_ticker` | Highest scoring ticker         |

---

## Flow

1. **Load regime** — Fetch today's regime from `market_regimes`; if unavailable, wait 5 minutes and retry (Regime Detector may still be running)
2. **Load active insights** — Filter out expired insights (`freshness_multiplier < 0.10` per spec §6)
3. **Load analyst weights** — From `analysts` table
4. **Guard: < 5 active insights** — Skip scoring; save minimal report: "אין המלצות היום — נתונים לא מספיקים"; log warning
5. **Call `recommendation-builder`** — Pass all assembled data; receive ranked recommendations + contrarian alerts + Hebrew report
6. **Save recommendations** — Upsert into `recommendations` table for today's date, one row per ticker
7. **Save report** — Insert into `daily_reports` table
8. **Log run** — Record `{ ticker_count, top_ticker, top_score, contrarian_alerts_count, duration_ms }` in `recommender_runs`

---

## Error Handling

| Scenario                            | Action                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------- |
| Regime not available after retry    | Use yesterday's regime with `confidence - 2`; add note to report                |
| < 5 active insights                 | Skip scoring; generate minimal Hebrew report with regime summary                |
| Single-analyst tickers              | Move to `low_coverage` list in output; exclude from main ranked recommendations |
| Contrarian Signal fires             | Include in report with ⚠️ warning; never suppress                               |
| DB write failure on recommendations | Retry once; alert if still failing                                              |
| Sentiment scores unavailable        | Proceed without them; Contrarian Signal simply does not fire                    |

---

## Cost Estimation

- **Model:** Claude Sonnet
- **Prompt size:** ~15,000–25,000 tokens (all active insights + analyst metadata)
- **Per run:** ~**$0.05–0.15**
- **Monthly:** ~**$1.50–4.50/month**

---

## Tier-Aware Reports

The Recommender generates three report types on different cadences, each scoped to the
analysts most relevant for that timeframe:

| Report          | Cadence       | Analysts Included         | Trigger          |
| --------------- | ------------- | ------------------------- | ---------------- |
| Daily report    | Every morning | HOT + PINNED only         | Daily cron 08:00 |
| Weekly digest   | Sundays 09:00 | HOT + PINNED + WARM       | Weekly cron      |
| Monthly summary | 1st, 09:00    | All tiers (HOT/WARM/COLD) | Monthly cron     |

### Daily Report (HOT + PINNED)

- Loads insights only from analysts with `fetch_tier IN ('HOT', 'PINNED')`
- Most actionable — these analysts were viewed recently and have fresh tweets
- Produces ranked recommendations + Hebrew morning report (existing flow, unchanged)

### Weekly Digest (+ WARM)

- Extends the daily scope to include WARM analysts
- WARM analysts fetched that Sunday morning are included if parsing completed
- Report section header: `## עדכון שבועי — אנליסטים פעילים` (Weekly update — active analysts)
- Surfaced as a separate `report_type = 'weekly'` row in `daily_reports`

### Monthly Summary (All Tiers)

- Includes COLD analysts — uses their most recent insights (may be weeks old)
- Highlights DNA changes: analysts whose `dna_version` incremented this month
- Useful for spotting analysts who were dormant but have updated their style
- Report section header: `## סיכום חודשי — כל האנליסטים` (Monthly summary — all analysts)
- Surfaced as `report_type = 'monthly'` in `daily_reports`
