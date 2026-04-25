# Agent: Regime Detector

## Purpose

Classify the current market regime each morning by analyzing SPY, VIX, and market breadth data fetched from Yahoo Finance. The regime output gates every downstream score computation — it is the most foundational daily calculation in the pipeline.

---

## Trigger

- **Scheduled:** Daily at 07:00 (cron: `0 7 * * *`) — after Fetcher (06:00), before Recommender (08:00)

---

## Skills Used

| Skill               | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| `regime-classifier` | Classifies current regime from market indicators |

---

## Input

Market data fetched from Yahoo Finance (yfinance):

```json
{
  "date": "2026-04-24",
  "vix": {
    "current": 18.5,
    "change_5d": -2.1,
    "ma_20": 21.0
  },
  "spy": {
    "price": 525.4,
    "change_1d_pct": 0.8,
    "change_5d_pct": 2.1,
    "ma_50": 510.0,
    "ma_200": 480.0,
    "above_ma50": true,
    "above_ma200": true
  },
  "market_breadth": {
    "advance_decline_ratio": 2.3,
    "pct_above_ma50": 68.0
  },
  "previous_regime": "BULL_WEAK"
}
```

`previous_regime` is loaded from the most recent row in the `market_regimes` table.

---

## Output

Regime classification saved to `market_regimes` table:

| Column        | Value                                                                      |
| ------------- | -------------------------------------------------------------------------- |
| `date`        | Today's date                                                               |
| `regime`      | One of: `BULL_STRONG` / `BULL_WEAK` / `CHOP` / `BEAR_WEAK` / `BEAR_STRONG` |
| `confidence`  | 1–10                                                                       |
| `regime_json` | Full output object from `regime-classifier` skill                          |
| `created_at`  | Timestamp                                                                  |

---

## Flow

1. **Fetch market data** — Call Yahoo Finance (yfinance) for SPY price/MAs, ^VIX spot/MA, advance-decline ratio
2. **Load previous regime** — `SELECT regime FROM market_regimes ORDER BY date DESC LIMIT 1`
3. **Assemble input** — Build the JSON input object with all market indicators
4. **Call `regime-classifier`** — Pass full market data; receive regime classification
5. **Detect transition** — Compare new regime to `previous_regime`; log if changed; skill enforces 2-day hysteresis before confirming transition
6. **Save to DB** — Upsert into `market_regimes` for today's date
7. **Log run** — Record `{ regime, confidence, transition_detected, duration_ms }` in `regime_runs`

---

## Error Handling

| Scenario                              | Action                                                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Yahoo Finance API failure             | Use yesterday's regime; set `confidence - 2`; log alert; insert row with `fallback = true`                 |
| Partial data (breadth unavailable)    | Proceed without breadth; classifier uses VIX + SPY only; note in `regime_json`                             |
| Regime flip without hysteresis        | Classifier internally requires 2+ consecutive days; `transition.confirmed` will be `false` until confirmed |
| DB write failure                      | Retry once; alert if still failing — Recommender depends on this data                                      |
| Previous regime not found (first run) | Pass `previous_regime: null`; classifier uses data alone                                                   |

---

## Cost Estimation

- **Model:** Claude Sonnet
- **Prompt size:** ~1,000 tokens (small structured input)
- **Per run:** ~**$0.002**
- **Monthly:** ~**$0.06/month**

> Regime Detector is the cheapest agent. The dominant cost at this layer
> is Yahoo Finance API tier pricing, not Claude token usage.
