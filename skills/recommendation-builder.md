# Skill: recommendation-builder

## Purpose

Compute cross-analyst consensus for every active ticker and generate the
daily Hebrew morning report. This skill runs the Scoring Engine formula
(§6 of the spec), applies Type Diversity Bonus and Contrarian Signal,
and produces ranked recommendations. Called by the Recommender agent at 08:00.

---

## Input Format

```json
{
  "date": "2026-04-20",
  "current_regime": "BULL_STRONG",
  "insights": [ { ...Insight... } ],
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

| Field              | Required | Notes                                                     |
| ------------------ | -------- | --------------------------------------------------------- |
| `date`             | Yes      | Report date                                               |
| `current_regime`   | Yes      | From regime-classifier output                             |
| `insights`         | Yes      | All active, non-expired Insights across all analysts      |
| `analysts`         | Yes      | Analyst metadata including `analyst_weight` (0–1)         |
| `sentiment_scores` | No       | Social sentiment 0–100 per ticker (for Contrarian Signal) |

---

## Output Format (JSON)

```json
{
  "date": "2026-04-20",
  "regime": "BULL_STRONG",
  "recommendations": [
    {
      "ticker": "NVDA",
      "final_score": 8.4,
      "direction": "bullish",
      "consensus_strength": "strong",
      "supporting_analysts": [
        {
          "analyst_username": "qullamaggie",
          "analyst_type": "trader-swing",
          "strength": 9,
          "tweet_url": "https://x.com/qullamaggie/status/1234567890"
        }
      ],
      "type_diversity_bonus": true,
      "unique_analyst_types": 3,
      "contrarian_flag": false,
      "score_breakdown": {
        "base_score": 0.82,
        "regime_multiplier": 0.95,
        "analyst_multiplier": 0.85,
        "velocity_multiplier": 1.15,
        "freshness_multiplier": 0.91,
        "diversity_multiplier": 1.15
      },
      "reasoning_he": "NVDA נתמכת על ידי 3 סוגי אנליסטים שונים: טריידר סווינג, משקיע צמיחה ואנליסט מאקרו. כולם בולישים. הסוחר מזהה פריצה עם ווליום חריג, המשקיע מציין מנועי צמיחה חזקים ב-AI, האנליסט המאקרו מדגיש תזרים מוסדי חיובי. מצב שוק BULL_STRONG תומך בסטאפ."
    }
  ],
  "report_summary_he": "## דוח בוקר – 20 אפריל 2026\n\n**מצב שוק: BULL_STRONG**\n\nהשוק ממשיך לעלות עם VIX נמוך ורוחב חזק. הציון הגבוה ביותר היום: **NVDA** (8.4/10) — קונצנזוס משולש בין טריידרים, משקיעים ומאקרו. שימו לב: **TSLA** מקבל Contrarian Signal — הייפ ברשתות חזק אך האנליסטים הרציניים שותקים.",
  "contrarian_alerts": [
    {
      "ticker": "TSLA",
      "sentiment_score": 85,
      "insight_score": 48,
      "note_he": "הייפ גבוה ברשתות (85/100) מול ציון אנליסטים נמוך (48) — אות Contrarian. שקלו לא להיכנס."
    }
  ]
}
```

| Field                  | Type   | Description                                         |
| ---------------------- | ------ | --------------------------------------------------- |
| `recommendations`      | array  | Sorted by `final_score` descending                  |
| `final_score`          | 0–10   | Composite score from Scoring Engine formula         |
| `consensus_strength`   | enum   | `strong` (≥7) / `moderate` (5–6.9) / `weak` (<5)    |
| `type_diversity_bonus` | bool   | True if 3+ analyst types agree                      |
| `contrarian_flag`      | bool   | True if sentiment > 80 AND insight_score < 55       |
| `score_breakdown`      | object | All multipliers for transparency                    |
| `reasoning_he`         | string | Hebrew explanation for the recommendation           |
| `report_summary_he`    | string | Hebrew markdown morning report (shown in dashboard) |
| `contrarian_alerts`    | array  | Tickers with Contrarian Signal flagged              |

---

## Rules

### R1 — Scoring Engine Formula (from §6)

```
final_score = base_score
            × regime_multiplier
            × analyst_multiplier
            × velocity_multiplier
            × freshness_multiplier
```

- `base_score` = (strength × 0.6 + confidence × 0.4) / 10
- `regime_multiplier` = insight's `regime_fit[current_regime]`
- `analyst_multiplier` = analyst's `analyst_weight` (0–1)
- `velocity_multiplier` = 1 + (velocity.delta × 0.05), capped at 1.25
- `freshness_multiplier` = e^(−λ × age_in_days) where λ = ln(2) / half_life_days

### R2 — Type Diversity Bonus

Apply AFTER computing per-insight scores, when aggregating by ticker:

- `unique_analyst_types` ≥ 3 → multiply final by 1.15
- `unique_analyst_types` == 2 → multiply final by 1.07
- `unique_analyst_types` == 1 → no bonus

### R3 — Contrarian Signal

```
if sentiment_score > 80 AND avg_insight_score < 55:
    contrarian_flag = True
    final_score *= 0.60
```

This fires when social hype is loud but serious analysts are silent or bearish.

### R4 — Expired Insights Excluded

Only include Insights where `age_in_days < 3 × half_life_days`.
A freshness_multiplier < 0.10 is effectively dead weight — exclude it.

### R5 — Minimum Coverage

A ticker needs Insights from ≥ 2 different analysts to appear in recommendations.
Single-analyst tickers go into a separate `low_coverage` list.

### R6 — Hebrew Output

`reasoning_he` and `report_summary_he` must be in Hebrew.
`report_summary_he` should be readable by a retail investor — clear language,
no jargon, use bold for key tickers and scores.

### R7 — Disclaimer

The report summary must include the standard disclaimer:
"מידע בלבד. אין זה ייעוץ פיננסי. ביצועי עבר אינם מבטיחים עתיד."

---

## Example Input

```json
{
  "date": "2026-04-20",
  "current_regime": "BULL_STRONG",
  "insights": [
    {
      "ticker": "NVDA",
      "analyst_type": "trader-swing",
      "direction": "bullish",
      "strength": 9,
      "confidence": 9,
      "velocity": { "delta": 3, "post_frequency": 3 },
      "decay": { "half_life_days": 5 },
      "regime_fit": { "BULL_STRONG": 0.95 },
      "raw_data": {
        "tweet_url": "https://x.com/qullamaggie/status/1234567890",
        "posted_at": "2026-04-18T14:00:00Z"
      }
    }
  ],
  "analysts": [
    {
      "analyst_id": "uuid-1",
      "analyst_username": "qullamaggie",
      "analyst_type": "trader-swing",
      "analyst_weight": 0.9
    }
  ],
  "sentiment_scores": { "NVDA": 72 }
}
```

---

## Example Output

```json
{
  "date": "2026-04-20",
  "regime": "BULL_STRONG",
  "recommendations": [
    {
      "ticker": "NVDA",
      "final_score": 8.1,
      "direction": "bullish",
      "consensus_strength": "strong",
      "supporting_analysts": [
        {
          "analyst_username": "qullamaggie",
          "analyst_type": "trader-swing",
          "strength": 9,
          "tweet_url": "https://x.com/qullamaggie/status/1234567890"
        }
      ],
      "type_diversity_bonus": false,
      "unique_analyst_types": 1,
      "contrarian_flag": false,
      "score_breakdown": {
        "base_score": 0.9,
        "regime_multiplier": 0.95,
        "analyst_multiplier": 0.9,
        "velocity_multiplier": 1.15,
        "freshness_multiplier": 0.94,
        "diversity_multiplier": 1.0
      },
      "reasoning_he": "NVDA מקבל ציון גבוה מ-qullamaggie — פריצה עם ווליום חריג ו-Stage 2 מאושר. Velocity חיובי: ביטחון האנליסט עולה. מצב BULL_STRONG תואם לחלוטין לסגנון שלו. ציון נמוך ממה שיכול היה כי יש רק אנליסט אחד — אין בונוס גיוון."
    }
  ],
  "report_summary_he": "## דוח בוקר – 20 אפריל 2026\n\n**מצב שוק: BULL_STRONG** | VIX: 18.5\n\nהמלצה מובילה: **NVDA** (8.1/10) — פריצה עם ווליום חריג לפי @qullamaggie.\n\n⚠️ מידע בלבד. אין זה ייעוץ פיננסי. ביצועי עבר אינם מבטיחים עתיד.",
  "contrarian_alerts": []
}
```
