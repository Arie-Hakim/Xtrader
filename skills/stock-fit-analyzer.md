# Skill: stock-fit-analyzer

## Purpose

Given an analyst's DNA profile and live stock data, determine how well the
stock fits the analyst's methodology right now. This is the engine behind the
DNA Simulator — the flagship feature of XTrader. Called by the Stock Fit agent
on-demand when a user submits a { analyst_id, ticker } query.

---

## Input Format

```json
{
  "analyst_id": "uuid",
  "analyst_username": "qullamaggie",
  "dna": { ...DNA profile from dna-builder... },
  "ticker": "NVDA",
  "stock_data": {
    "price": 512.50,
    "change_1d_pct": 1.8,
    "change_5d_pct": 4.2,
    "volume_today": 52000000,
    "volume_avg_20d": 38000000,
    "volume_ratio": 1.37,
    "ma_50": 490.0,
    "ma_150": 465.0,
    "ma_200": 445.0,
    "above_ma50": true,
    "above_ma200": true,
    "rs_line_trend": "at_highs",
    "stage": "stage_2",
    "base_weeks": 7,
    "adr_pct": 3.2,
    "sector": "Technology",
    "pe_ratio": 35.0,
    "revenue_growth_yoy": 0.22
  },
  "current_regime": "BULL_STRONG",
  "recent_insights": [
    {
      "ticker": "NVDA",
      "direction": "bullish",
      "strength": 9,
      "posted_at": "2026-04-18T14:00:00Z",
      "raw_data": {
        "tweet_url": "https://x.com/qullamaggie/status/1234567890",
        "tweet_content": "$NVDA breaking out above $500 on massive volume."
      }
    }
  ]
}
```

| Field             | Required | Notes                                                          |
| ----------------- | -------- | -------------------------------------------------------------- |
| `analyst_id`      | Yes      | UUID linking to analyst record                                 |
| `dna`             | Yes      | Full DNA profile from dna-builder                              |
| `ticker`          | Yes      | Stock symbol being analyzed                                    |
| `stock_data`      | Yes      | Live stock metrics from Yahoo Finance / data provider          |
| `current_regime`  | Yes      | From today's regime-classifier output                          |
| `recent_insights` | No       | Analyst's recent Insights for this ticker — used for relevance |

---

## Output Format (JSON)

```json
{
  "analyst_id": "uuid",
  "analyst_username": "qullamaggie",
  "ticker": "NVDA",
  "analyzed_at": "2026-04-20T10:15:00Z",
  "fit_score": 8,
  "fit_label": "התאמה חזקה",
  "regime_aligned": true,
  "reasons": [
    {
      "rule": "פריצה מעל בסיס של 3+ שבועות",
      "met": true,
      "detail_he": "NVDA פרצה מבסיס של 7 שבועות מעל 500 — עומד בכלל"
    },
    {
      "rule": "ווליום לפחות 150% מהממוצע ביום הפריצה",
      "met": false,
      "detail_he": "ווליום היום: 137% מהממוצע — קרוב אך מתחת לסף 150%"
    },
    {
      "rule": "RS Line בשיאים לפני הפריצה",
      "met": true,
      "detail_he": "RS Line בשיאים — אישור חוזק יחסי"
    },
    {
      "rule": "Stage 2 מאושר לפי שיטת Minervini",
      "met": true,
      "detail_he": "NVDA ב-Stage 2: מעל MA50, MA150, MA200 — כולם בעלייה"
    }
  ],
  "risks": [
    {
      "risk_he": "ווליום מתחת לסף 150% — פריצה פחות משכנעת",
      "severity": "moderate"
    },
    {
      "risk_he": "קרובה לרמת Resistance היסטורית ב-525",
      "severity": "low"
    }
  ],
  "relevant_tweet": {
    "content": "$NVDA breaking out above $500 on massive volume. Stage 2. RS Line at highs.",
    "tweet_url": "https://x.com/qullamaggie/status/1234567890",
    "posted_at": "2026-04-18T14:00:00Z",
    "days_ago": 2
  },
  "regime_note_he": "מצב שוק BULL_STRONG — השיטה של @qullamaggie עובדת הכי טוב בתנאים אלה (95% מהעסקאות שלו במצב זה הצליחו)",
  "explanation_he": "NVDA מתאימה חזק לשיטה של @qullamaggie. 3 מתוך 4 כללי הכניסה שלו מקוימים. הסיכון העיקרי: ווליום מעט נמוך מהסף המועדף. מצב השוק BULL_STRONG הוא הסביבה הטובה ביותר לסטאפים כאלה.",
  "cache_ttl_hours": 4
}
```

| Field             | Type   | Description                                                       |
| ----------------- | ------ | ----------------------------------------------------------------- |
| `fit_score`       | 1–10   | How well the stock matches the analyst's DNA right now            |
| `fit_label`       | string | Hebrew label: התאמה חזקה / התאמה בינונית / התאמה חלשה / לא מתאים  |
| `regime_aligned`  | bool   | Is the current regime good for this analyst's style?              |
| `reasons`         | array  | Each DNA rule checked against actual stock data, met or not       |
| `risks`           | array  | Specific risks per the analyst's own framework                    |
| `relevant_tweet`  | object | Most recent analyst tweet about this ticker (transparency anchor) |
| `regime_note_he`  | string | Hebrew note on regime alignment with historical performance       |
| `explanation_he`  | string | Hebrew summary for the UI — write for retail investor             |
| `cache_ttl_hours` | int    | Result is cached 4 hours (from spec §9.3)                         |

---

## Rules

### R1 — Score Against DNA Rules, Not Generic Rules

The `reasons` array must check the analyst's own entry rules from their DNA,
not generic trading best practices. A value investor's rules differ completely
from a swing trader's rules. The DNA is the source of truth.

### R2 — fit_score Derivation

Calculate as: (rules_met / total_rules) × 10, then adjust:

- −1 if any `severity: "high"` risk present
- −0.5 per `severity: "moderate"` risk
- +0.5 if `regime_aligned = true` and regime performance fit > 0.85

Round to nearest integer (1–10).

### R3 — fit_label Thresholds

| Score | Hebrew Label  |
| ----- | ------------- |
| 8–10  | התאמה חזקה    |
| 6–7   | התאמה בינונית |
| 4–5   | התאמה חלשה    |
| 1–3   | לא מתאים      |

### R4 — relevant_tweet is Mandatory When Available

If `recent_insights` contains any tweet for this ticker, always include the
most recent one in `relevant_tweet`. If no insights exist for this ticker,
set `relevant_tweet: null`. Never omit the `tweet_url`.

### R5 — Regime Alignment Check

`regime_aligned = true` when:
`dna.regime_performance[current_regime].fit > 0.70`

If `regime_aligned = false`, add a risk entry explaining why the current
regime is unfavorable for this analyst's style.

### R6 — Hebrew Output

`explanation_he`, `regime_note_he`, all `detail_he` and `risk_he` fields
must be in Hebrew. `explanation_he` is shown prominently in the UI — write
clearly for a retail investor.

### R7 — Cache 4 Hours

Set `cache_ttl_hours: 4` always — matches §9.3 of the spec. The backend
uses this to set the TTL on the `stock_fit_results` table.

### R8 — No Final Score or Recommendation

This skill outputs `fit_score` (1–10, methodology match only). It does NOT
output buy/sell recommendations, price targets, or portfolio allocation advice.
The standard disclaimer applies to all output.

---

## Example Input

```json
{
  "analyst_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "analyst_username": "qullamaggie",
  "dna": {
    "profile_type": "trader-swing",
    "entry_rules": [
      "פריצה מעל בסיס של 3+ שבועות",
      "ווליום לפחות 150% מהממוצע ביום הפריצה",
      "RS Line בשיאים לפני הפריצה",
      "Stage 2 מאושר לפי שיטת Minervini"
    ],
    "regime_performance": {
      "BULL_STRONG": { "fit": 0.95 },
      "BULL_WEAK": { "fit": 0.62 },
      "CHOP": { "fit": 0.28 }
    }
  },
  "ticker": "NVDA",
  "stock_data": {
    "price": 512.5,
    "volume_ratio": 1.37,
    "above_ma50": true,
    "above_ma200": true,
    "rs_line_trend": "at_highs",
    "stage": "stage_2",
    "base_weeks": 7
  },
  "current_regime": "BULL_STRONG",
  "recent_insights": [
    {
      "ticker": "NVDA",
      "direction": "bullish",
      "strength": 9,
      "posted_at": "2026-04-18T14:00:00Z",
      "raw_data": {
        "tweet_url": "https://x.com/qullamaggie/status/1234567890",
        "tweet_content": "$NVDA breaking out above $500 on massive volume."
      }
    }
  ]
}
```

---

## Example Output

```json
{
  "analyst_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "analyst_username": "qullamaggie",
  "ticker": "NVDA",
  "analyzed_at": "2026-04-20T10:15:00Z",
  "fit_score": 8,
  "fit_label": "התאמה חזקה",
  "regime_aligned": true,
  "reasons": [
    {
      "rule": "פריצה מעל בסיס של 3+ שבועות",
      "met": true,
      "detail_he": "בסיס של 7 שבועות — עומד בדרישה המינימלית בנוחות"
    },
    {
      "rule": "ווליום לפחות 150% מהממוצע ביום הפריצה",
      "met": false,
      "detail_he": "ווליום היום: 137% מהממוצע — קרוב אך לא מגיע לסף 150%"
    },
    {
      "rule": "RS Line בשיאים לפני הפריצה",
      "met": true,
      "detail_he": "RS Line בשיאים — אות חוזק יחסי לפני הפריצה"
    },
    {
      "rule": "Stage 2 מאושר לפי שיטת Minervini",
      "met": true,
      "detail_he": "NVDA ב-Stage 2: מעל MA50, MA150, MA200"
    }
  ],
  "risks": [
    {
      "risk_he": "ווליום לא הגיע לסף 150% — פריצה פחות משכנעת לפי הכללים שלו",
      "severity": "moderate"
    }
  ],
  "relevant_tweet": {
    "content": "$NVDA breaking out above $500 on massive volume. Stage 2. RS Line at highs.",
    "tweet_url": "https://x.com/qullamaggie/status/1234567890",
    "posted_at": "2026-04-18T14:00:00Z",
    "days_ago": 2
  },
  "regime_note_he": "מצב שוק BULL_STRONG — הסביבה הטובה ביותר לשיטת @qullamaggie (95% התאמה היסטורית)",
  "explanation_he": "NVDA מתאימה חזק לשיטה של @qullamaggie: 3 מתוך 4 כללי הכניסה שלו מקוימים. החסרון היחיד — ווליום מעט נמוך מהסף. מצב השוק BULL_STRONG הוא הסביבה האידיאלית לסטאפים שלו. ⚠️ מידע בלבד, אין ייעוץ פיננסי.",
  "cache_ttl_hours": 4
}
```
