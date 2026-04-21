# Skill: analyst-classifier

## Purpose

Classify an analyst's type and sub-type from a batch of 500–1,000 tweets.
Called by the Parser agent when a new analyst is added. The output drives
every downstream skill — get this wrong and the whole pipeline is poisoned.

---

## Input Format

```json
{
  "analyst_username": "string",
  "tweets": [
    {
      "tweet_id": "string",
      "content": "string",
      "posted_at": "ISO-8601 string"
    }
  ]
}
```

| Field                | Required | Notes                                       |
| -------------------- | -------- | ------------------------------------------- |
| `analyst_username`   | Yes      | X handle without @                          |
| `tweets`             | Yes      | 500–1,000 items for reliable signal         |
| `tweets[].content`   | Yes      | Raw tweet text including hashtags / $TICKER |
| `tweets[].posted_at` | Yes      | Used to detect time-of-day patterns         |

---

## Output Format (JSON)

```json
{
  "analyst_type": "trader-swing",
  "sub_type": "breakout",
  "confidence": 8,
  "horizon_distribution": {
    "scalp": 0.05,
    "swing": 0.8,
    "position": 0.1,
    "macro": 0.05
  },
  "dominant_indicators": ["volume", "breakout", "stage_2", "rs_line"],
  "style_notes": "מתמקד בפריצות עם ווליום חריג, שיטת Minervini Stage Analysis",
  "tweets_analyzed": 847
}
```

| Field                  | Type   | Description                                          |
| ---------------------- | ------ | ---------------------------------------------------- |
| `analyst_type`         | enum   | One of the 7 valid types (see Rules)                 |
| `sub_type`             | string | Free-text refinement (breakout, value, growth, etc.) |
| `confidence`           | 1–10   | How clearly the pattern emerged                      |
| `horizon_distribution` | object | Proportion of tweets in each time horizon            |
| `dominant_indicators`  | array  | Top technical/fundamental signals the analyst uses   |
| `style_notes`          | string | Hebrew summary of the analyst's approach             |
| `tweets_analyzed`      | int    | Actual count used                                    |

---

## Rules

1. **Valid types only** — `analyst_type` MUST be one of:
   `trader-scalp` | `trader-swing` | `trader-position` | `investor-value` | `investor-growth` | `macro` | `mixed`

2. **Sub-type on top of type** — e.g., type=`trader-swing`, sub_type=`breakout`.
   Never invent a new top-level type.

3. **Mixed is a last resort** — Use `mixed` only when ≥3 clearly distinct styles
   appear with no dominant one (>40% share). Do not use it to avoid a hard call.

4. **Distinguish Position from Swing** — Position traders discuss 1–6 month setups,
   Stage Analysis, 150/200-day MAs. Swing traders focus on 1–4 week breakouts, RSI, MACD.

5. **Minimum tweet count** — If fewer than 200 financial tweets are found, set
   `confidence` ≤ 4 and add a warning in `style_notes`.

6. **No scoring here** — Output is classification only. Do not emit `analyst_weight`
   or any performance metric — those belong to the DNA Builder.

7. **Hebrew output** — `style_notes` must be in Hebrew.

---

## Example Input

```json
{
  "analyst_username": "qullamaggie",
  "tweets": [
    {
      "tweet_id": "1234567890",
      "content": "$NVDA breaking out of 6-week base above $500 on massive volume. Stage 2 confirmed. RS line at highs. This is the setup I've been waiting for.",
      "posted_at": "2026-04-15T14:32:00Z"
    },
    {
      "tweet_id": "1234567891",
      "content": "Sold $TSLA at target +18%. Entry was the breakout above the 21-day EMA on 2x average volume. Clean trade.",
      "posted_at": "2026-04-10T16:05:00Z"
    }
  ]
}
```

---

## Example Output

```json
{
  "analyst_type": "trader-swing",
  "sub_type": "breakout",
  "confidence": 9,
  "horizon_distribution": {
    "scalp": 0.02,
    "swing": 0.83,
    "position": 0.12,
    "macro": 0.03
  },
  "dominant_indicators": [
    "volume",
    "breakout",
    "stage_2",
    "rs_line",
    "21_ema",
    "vwap"
  ],
  "style_notes": "סוחר פריצות קלאסי בסגנון Minervini. מחפש מניות ב-Stage 2 עם ווליום חריג ו-RS Line בשיאים. אופק טיפוסי: 2–6 שבועות.",
  "tweets_analyzed": 847
}
```
