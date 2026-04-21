# Skill: insight-extractor

## Purpose

**THE HEART of the system.**

Extract a single structured Insight JSON from one tweet. This skill is the
Parser agent's only tool for turning raw text into the atomic unit that drives
every downstream computation. It EXTRACTS — it never scores, never ranks,
never recommends. Separation of Concerns is absolute.

---

## Input Format

```json
{
  "tweet_url": "string",
  "tweet_content": "string",
  "posted_at": "ISO-8601 string",
  "analyst_type": "trader-swing",
  "previous_insight": { ... }
}
```

| Field              | Required | Notes                                                      |
| ------------------ | -------- | ---------------------------------------------------------- |
| `tweet_url`        | Yes      | Full URL — preserved verbatim in output for transparency   |
| `tweet_content`    | Yes      | Raw tweet text                                             |
| `posted_at`        | Yes      | Timestamp for decay calculation                            |
| `analyst_type`     | Yes      | From analyst-classifier — shapes what fields to extract    |
| `previous_insight` | No       | Last Insight for this ticker + analyst — used for velocity |

---

## Output Format (JSON)

```json
{
  "ticker": "NVDA",
  "analyst_type": "trader-swing",
  "direction": "bullish",
  "strength": 8,
  "confidence": 7,
  "horizon": "swing",
  "reasoning": "מצפה לפריצה מעל 500 עם ווליום חריג. מזהה Stage 2 ו-RS Line בשיאים.",
  "key_levels": {
    "entry": 500,
    "stop": 485,
    "target": 550
  },
  "velocity": {
    "delta": 2,
    "post_frequency": 3
  },
  "decay": {
    "half_life_days": 5
  },
  "regime_fit": {
    "BULL_STRONG": 0.95,
    "BULL_WEAK": 0.7,
    "CHOP": 0.35,
    "BEAR_WEAK": 0.1,
    "BEAR_STRONG": 0.05
  },
  "raw_data": {
    "tweet_url": "https://x.com/qullamaggie/status/1234567890",
    "tweet_content": "$NVDA breaking out above $500 on massive volume. Stage 2. RS Line at highs. Waiting for the move.",
    "posted_at": "2026-04-15T14:32:00Z"
  }
}
```

| Field                     | Type    | Description                                                             |
| ------------------------- | ------- | ----------------------------------------------------------------------- |
| `ticker`                  | string  | Stock symbol in uppercase (NVDA, TSLA). Null if no ticker.              |
| `analyst_type`            | enum    | Passed through from input unchanged                                     |
| `direction`               | enum    | `bullish` / `bearish` / `neutral`                                       |
| `strength`                | 1–10    | How emphatically the analyst expresses the view                         |
| `confidence`              | 1–10    | Extractor's confidence in its own parsing — NOT a score                 |
| `horizon`                 | enum    | `scalp` / `swing` / `long_term` / `macro`                               |
| `reasoning`               | string  | Hebrew summary of WHY the analyst holds this view                       |
| `key_levels`              | object? | `entry`, `stop`, `target` — traders only; null for investors            |
| `velocity.delta`          | int     | Change in strength vs. previous insight (positive = growing conviction) |
| `velocity.post_frequency` | int     | Times analyst mentioned this ticker in the past 7 days                  |
| `decay.half_life_days`    | int     | How quickly this insight expires (see Rules §4)                         |
| `regime_fit`              | object  | Fit score 0.0–1.0 for each of 5 regimes                                 |
| `raw_data.tweet_url`      | string  | **MANDATORY** — original tweet URL, never omit                          |
| `raw_data.tweet_content`  | string  | Original tweet text, preserved verbatim                                 |
| `raw_data.posted_at`      | string  | Original timestamp                                                      |

---

## Rules

### R1 — Extraction Only, Never Scores

This skill extracts what the analyst said. It does NOT compute `final_score`,
`analyst_weight`, or any composite ranking. Those live in the Scoring Engine.
If tempted to add a score — stop. That is a different agent's job.

### R2 — Ticker is Required (or null)

If no ticker is mentioned, set `ticker: null`. Do not guess or infer.
A tweet about "the market" with no ticker produces `ticker: null, direction: "macro-view"`.

### R3 — Strength Reflects the Analyst's Conviction

Calibrate `strength` from the analyst's words:

- 1–3: vague mention, "watching", "interesting"
- 4–6: moderate interest, "like the setup", "considering"
- 7–8: strong view, "added", "breaking out", "strong conviction"
- 9–10: extreme conviction, "all-in", "highest conviction trade"

### R4 — Confidence Reflects Parser Certainty

`confidence` measures how well the extractor understood the tweet:

- 9–10: explicit entry/stop/target + clear direction
- 6–8: clear direction but some ambiguity
- 3–5: direction inferred, possible misread
- 1–2: very ambiguous, mostly noise

### R5 — Decay Half-Life by Analyst Type

| Analyst Type      | Half-life (days)            |
| ----------------- | --------------------------- |
| `trader-scalp`    | 0.5–1                       |
| `trader-swing`    | 3–7                         |
| `trader-position` | 14–30                       |
| `investor-*`      | 60–90                       |
| `macro`           | 14–30                       |
| `mixed`           | Use dominant sub-type logic |

### R6 — Regime Fit Calibration

Estimate how well this insight performs in each market regime.
A bullish scalp trade is BULL_STRONG=0.95, BEAR_STRONG=0.05.
A defensive macro view might be BEAR_STRONG=0.85, BULL_STRONG=0.15.

### R7 — key_levels Only for Traders

For `investor-*` and `macro` types, set `key_levels: null`.
For traders, populate if the tweet mentions price levels — never invent levels.

### R8 — Velocity When Previous Insight Provided

If `previous_insight` is supplied:

- `delta` = current `strength` − previous `strength`
- Positive delta = growing conviction (bullish signal)
- If not supplied, set `delta: 0`

### R9 — Hebrew Reasoning

`reasoning` must be in Hebrew and summarize the analyst's stated rationale,
not a translation of the raw tweet. Extract the "why", not the "what".

### R10 — Preserve raw_data Always

`raw_data.tweet_url` is the transparency anchor of the entire system.
It must never be omitted, null, or modified.

---

## Example Input

```json
{
  "tweet_url": "https://x.com/qullamaggie/status/1234567890",
  "tweet_content": "$NVDA breaking out of 6-week base above $500 on massive volume. Stage 2 confirmed. RS line at highs. My highest conviction swing trade right now. Stop at $485, targeting $550.",
  "posted_at": "2026-04-15T14:32:00Z",
  "analyst_type": "trader-swing",
  "previous_insight": {
    "ticker": "NVDA",
    "strength": 6,
    "posted_at": "2026-04-10T09:00:00Z"
  }
}
```

---

## Example Output

```json
{
  "ticker": "NVDA",
  "analyst_type": "trader-swing",
  "direction": "bullish",
  "strength": 9,
  "confidence": 9,
  "horizon": "swing",
  "reasoning": "פריצה מעל 500 מבסיס של 6 שבועות עם ווליום גבוה במיוחד. אישור Stage 2 לפי שיטת Minervini. RS Line בשיאים — סימן לחוזק יחסי. הסוחר מציין זו העסקה עם הביטחון הגבוה ביותר שלו כרגע.",
  "key_levels": {
    "entry": 500,
    "stop": 485,
    "target": 550
  },
  "velocity": {
    "delta": 3,
    "post_frequency": 3
  },
  "decay": {
    "half_life_days": 5
  },
  "regime_fit": {
    "BULL_STRONG": 0.95,
    "BULL_WEAK": 0.72,
    "CHOP": 0.3,
    "BEAR_WEAK": 0.08,
    "BEAR_STRONG": 0.04
  },
  "raw_data": {
    "tweet_url": "https://x.com/qullamaggie/status/1234567890",
    "tweet_content": "$NVDA breaking out of 6-week base above $500 on massive volume. Stage 2 confirmed. RS line at highs. My highest conviction swing trade right now. Stop at $485, targeting $550.",
    "posted_at": "2026-04-15T14:32:00Z"
  }
}
```
