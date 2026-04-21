# Skill: dna-builder

## Purpose

Build or update a comprehensive DNA profile for one analyst from a batch of
500–1,000 Insights. The DNA profile is the persistent memory of how an analyst
thinks — their indicators, entry rules, risk management style, preferred regimes,
and historical accuracy signals. Called by the DNA Builder agent.

---

## Input Format

```json
{
  "analyst_id": "string",
  "analyst_username": "string",
  "analyst_type": "trader-swing",
  "insights": [ { ...Insight... } ],
  "existing_dna": { ... }
}
```

| Field              | Required | Notes                                                            |
| ------------------ | -------- | ---------------------------------------------------------------- |
| `analyst_id`       | Yes      | UUID from `analysts` table                                       |
| `analyst_username` | Yes      | X handle for display                                             |
| `analyst_type`     | Yes      | From analyst-classifier — drives which DNA fields to build       |
| `insights`         | Yes      | Array of 500–1,000 Insights (full schema from insight-extractor) |
| `existing_dna`     | No       | Previous DNA version — used for incremental updates              |

---

## Output Format (JSON)

```json
{
  "analyst_id": "uuid",
  "version": 3,
  "profile_type": "trader-swing",
  "tweets_analyzed_count": 847,
  "built_at": "2026-04-20T08:00:00Z",
  "trading_style": {
    "summary_he": "סוחר פריצות קלאסי. מחפש Stage 2 עם ווליום חריג ו-RS Line בשיאים.",
    "horizon_preference": "swing",
    "avg_hold_days": 12,
    "risk_reward_ratio": 2.8
  },
  "entry_rules": [
    "פריצה מעל בסיס של לפחות 3 שבועות",
    "ווליום ביום הפריצה לפחות 150% מהממוצע",
    "RS Line בשיאים לפני הפריצה",
    "Stage 2 לפי שיטת Minervini"
  ],
  "exit_rules": [
    "Stop מתחת לבסיס הפריצה",
    "יציאה אם ווליום נחלש תוך 3 ימים",
    "Target: R/R של לפחות 2:1"
  ],
  "dominant_indicators": [
    {
      "name": "volume",
      "weight": 0.35,
      "description_he": "ווליום ביום הפריצה"
    },
    {
      "name": "stage_2",
      "weight": 0.3,
      "description_he": "Stage 2 לפי Minervini"
    },
    { "name": "rs_line", "weight": 0.2, "description_he": "RS Line בשיאים" },
    {
      "name": "base_length",
      "weight": 0.15,
      "description_he": "בסיס של 3+ שבועות"
    }
  ],
  "sector_preferences": ["Technology", "Healthcare", "Industrials"],
  "regime_performance": {
    "BULL_STRONG": { "avg_strength": 8.2, "insight_count": 320, "fit": 0.95 },
    "BULL_WEAK": { "avg_strength": 6.1, "insight_count": 180, "fit": 0.65 },
    "CHOP": { "avg_strength": 4.0, "insight_count": 90, "fit": 0.3 },
    "BEAR_WEAK": { "avg_strength": 2.5, "insight_count": 40, "fit": 0.15 },
    "BEAR_STRONG": { "avg_strength": 1.8, "insight_count": 12, "fit": 0.05 }
  },
  "contrarian_risk": {
    "hype_sensitivity": 0.2,
    "note_he": "לא מושפע מהייפ — מחכה לסטאפ ברור לפני כניסה"
  },
  "key_quotes": [
    {
      "quote": "I only buy when price, volume, and RS all confirm at the same time.",
      "tweet_url": "https://x.com/qullamaggie/status/1234567890",
      "theme": "entry_discipline"
    }
  ]
}
```

| Field                      | Type   | Description                                            |
| -------------------------- | ------ | ------------------------------------------------------ |
| `version`                  | int    | Increments each time DNA is rebuilt                    |
| `profile_type`             | enum   | Mirrors `analyst_type`                                 |
| `trading_style.summary_he` | string | Hebrew one-paragraph description of the analyst        |
| `entry_rules`              | array  | Hebrew list of rules derived from patterns in Insights |
| `exit_rules`               | array  | Hebrew list of exit/stop rules                         |
| `dominant_indicators`      | array  | Top signals with learned weights                       |
| `regime_performance`       | object | How the analyst performs across regimes                |
| `key_quotes`               | array  | Verbatim quotes that best capture the analyst's rules  |

---

## Rules

1. **500+ Insights required** — Refuse to build DNA from fewer than 200 Insights.
   Set a `warning` field if between 200–499.

2. **Incremental updates** — If `existing_dna` is supplied and `tweets_analyzed_count`
   increased by < 50, return `{ "skipped": true, "reason": "insufficient new data" }`.
   DNA Builder agent will only call this skill when 50+ new tweets accumulated.

3. **Derive, don't invent** — Every entry/exit rule must come from observed patterns
   in the Insights batch. Do not add rules that aren't evidenced.

4. **Hebrew for all user-facing strings** — `summary_he`, `entry_rules`, `exit_rules`,
   `description_he` inside indicators, `note_he` in contrarian_risk.

5. **key_quotes with tweet_url** — Each quote must include its source `tweet_url`
   for transparency. Never quote without attribution.

6. **Regime performance from data** — `regime_performance` is computed from the
   distribution of `regime_fit` values across all Insights, not invented.

7. **No final_score** — DNA is a profile, not a ranking. Do not add composite scores.

---

## Example Input

```json
{
  "analyst_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "analyst_username": "qullamaggie",
  "analyst_type": "trader-swing",
  "insights": [
    {
      "ticker": "NVDA",
      "direction": "bullish",
      "strength": 9,
      "horizon": "swing",
      "key_levels": { "entry": 500, "stop": 485, "target": 550 },
      "regime_fit": { "BULL_STRONG": 0.95, "CHOP": 0.3, "BEAR_STRONG": 0.04 }
    }
  ],
  "existing_dna": null
}
```

---

## Example Output

```json
{
  "analyst_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "version": 1,
  "profile_type": "trader-swing",
  "tweets_analyzed_count": 847,
  "built_at": "2026-04-20T08:00:00Z",
  "trading_style": {
    "summary_he": "סוחר פריצות קלאסי בסגנון Minervini. מחכה לבסיסים של 3–6 שבועות עם ווליום חריג ביום הפריצה וחוזק יחסי גבוה. אופק עסקה טיפוסי: שבועיים עד חודשיים.",
    "horizon_preference": "swing",
    "avg_hold_days": 14,
    "risk_reward_ratio": 2.8
  },
  "entry_rules": [
    "פריצה מעל בסיס של 3+ שבועות",
    "ווליום לפחות 150% מהממוצע ביום הפריצה",
    "RS Line בשיאים לפני הפריצה",
    "Stage 2 מאושר לפי שיטת Minervini"
  ],
  "exit_rules": [
    "Stop אוטומטי מתחת לתחתית הבסיס",
    "יציאה חלקית ב-20% רווח",
    "R/R מינימלי 2:1 לפני כניסה"
  ],
  "dominant_indicators": [
    {
      "name": "volume",
      "weight": 0.35,
      "description_he": "ווליום חריג ביום הפריצה"
    },
    {
      "name": "stage_2",
      "weight": 0.28,
      "description_he": "Stage 2 לפי Minervini"
    },
    {
      "name": "rs_line",
      "weight": 0.22,
      "description_he": "חוזק יחסי גבוה לפני פריצה"
    },
    {
      "name": "base_quality",
      "weight": 0.15,
      "description_he": "בסיס נקי ורחב"
    }
  ],
  "sector_preferences": ["Technology", "Healthcare", "Consumer Discretionary"],
  "regime_performance": {
    "BULL_STRONG": { "avg_strength": 8.4, "insight_count": 412, "fit": 0.95 },
    "BULL_WEAK": { "avg_strength": 6.0, "insight_count": 210, "fit": 0.62 },
    "CHOP": { "avg_strength": 3.8, "insight_count": 95, "fit": 0.28 },
    "BEAR_WEAK": { "avg_strength": 2.2, "insight_count": 38, "fit": 0.12 },
    "BEAR_STRONG": { "avg_strength": 1.5, "insight_count": 10, "fit": 0.05 }
  },
  "contrarian_risk": {
    "hype_sensitivity": 0.15,
    "note_he": "ממתין לקונפירמציה טכנית — לא נכנס על הייפ בלבד"
  },
  "key_quotes": [
    {
      "quote": "Volume is the only thing I trust. Price can lie, volume can't.",
      "tweet_url": "https://x.com/qullamaggie/status/9876543210",
      "theme": "volume_primacy"
    }
  ]
}
```
