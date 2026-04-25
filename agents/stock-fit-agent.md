# Agent: Stock Fit

## Purpose

On-demand: given an analyst and a ticker, determine how well the stock matches the analyst's DNA methodology right now. Powers the DNA Simulator — XTrader's flagship feature. Results are cached 4 hours to avoid redundant API calls per spec §9.3.

---

## Trigger

- **On-demand** — Fires when a user submits `{ analyst_id, ticker }` via the XTrader API or UI
- No scheduled cron — purely request-driven

---

## Skills Used

| Skill                | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| `stock-fit-analyzer` | Checks live stock data against analyst DNA entry rules |

---

## Input

User request (from API/UI):

```json
{
  "analyst_id": "uuid",
  "ticker": "NVDA"
}
```

Assembled internally by the agent before calling the skill:

```json
{
  "analyst_id": "uuid",
  "analyst_username": "string",
  "dna": { "...full DNA profile from analyst_dna table..." },
  "ticker": "NVDA",
  "stock_data": {
    "price": 512.50,
    "change_1d_pct": 1.8,
    "volume_ratio": 1.37,
    "ma_50": 490.0,
    "ma_200": 445.0,
    "above_ma50": true,
    "above_ma200": true,
    "rs_line_trend": "at_highs",
    "stage": "stage_2",
    "base_weeks": 7,
    "sector": "Technology"
  },
  "current_regime": "BULL_STRONG",
  "recent_insights": [ "...analyst's last 10 insights for this ticker..." ]
}
```

---

## Output

Fit result saved to `stock_fit_results` table (TTL 4 hours) and returned to user:

| Column        | Value                                                               |
| ------------- | ------------------------------------------------------------------- |
| `analyst_id`  | FK to `analysts`                                                    |
| `ticker`      | Stock symbol                                                        |
| `fit_score`   | 1–10                                                                |
| `fit_label`   | Hebrew: `התאמה חזקה` / `התאמה בינונית` / `התאמה חלשה` / `לא מתאים`  |
| `result_json` | Full output from `stock-fit-analyzer` (Hebrew explanation included) |
| `expires_at`  | `now() + 4 hours`                                                   |

---

## Flow

1. **Check cache** — Query `stock_fit_results WHERE analyst_id = X AND ticker = Y AND expires_at > now()`; if found, return cached `result_json` immediately (no API call)
2. **Load DNA** — Fetch `analyst_dna` for `analyst_id`; if not found → return `409 { error: "DNA not ready", analyst_id }`
3. **Load stock data** — Fetch live data from Yahoo Finance for `ticker`; if invalid → return `400 { error: "Invalid ticker", ticker }`
4. **Load recent insights** — `SELECT * FROM insights WHERE analyst_id = X AND ticker = Y ORDER BY posted_at DESC LIMIT 10`
5. **Load current regime** — Fetch latest row from `market_regimes`
6. **Call `stock-fit-analyzer`** — Pass fully assembled payload; receive fit result with Hebrew explanation
7. **Cache result** — Upsert into `stock_fit_results` with `expires_at = now() + 4 hours`
8. **Return result** — Send `result_json` to the requesting user

---

## Error Handling

| Scenario                           | Action                                                                           |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| DNA not built yet for analyst      | Return `409 Conflict: { error: "DNA not ready", analyst_id }` — do not cache     |
| Invalid or unknown ticker          | Return `400 Bad Request: { error: "Invalid ticker", ticker }` — do not cache     |
| Yahoo Finance API failure          | Return `503 Service Unavailable`; do not cache error responses                   |
| No recent insights for this ticker | Pass `recent_insights: []`; skill handles gracefully with `relevant_tweet: null` |
| Regime not available               | Use yesterday's regime; add warning in `regime_note_he`                          |
| Cache expired mid-request          | Treat as cache miss; fetch fresh data                                            |

---

## Cost Estimation

- **Model:** Claude Sonnet
- **Prompt size:** ~6,000–10,000 tokens (DNA + stock data + recent insights)
- **Per query (cache miss):** ~**$0.01–0.02**
- **Cache hit rate:** ~70% (4-hour TTL across 20 analysts × 50 tickers)
- **Monthly (1,000 queries, 30% cache miss):** ~**$3–6/month**
