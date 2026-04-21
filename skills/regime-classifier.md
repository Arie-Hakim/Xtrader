# Skill: regime-classifier

## Purpose

Classify the current market regime from real-time macro indicators. Output
is consumed by every other agent — it gates which Insights are fresh,
multiplies scores, and determines whether the DNA Simulator shows a green
or red light. Called by the Regime Detector agent every morning at 07:00.

---

## Input Format

```json
{
  "date": "2026-04-20",
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

| Field                            | Required | Notes                                      |
| -------------------------------- | -------- | ------------------------------------------ |
| `date`                           | Yes      | Date of classification                     |
| `vix.current`                    | Yes      | CBOE VIX spot                              |
| `vix.change_5d`                  | Yes      | 5-day change — direction of fear           |
| `spy.price`                      | Yes      | SPY closing price                          |
| `spy.change_5d_pct`              | Yes      | 5-day momentum                             |
| `spy.above_ma50` / `above_ma200` | Yes      | Trend structure checks                     |
| `market_breadth`                 | No       | Strengthens signal if provided             |
| `previous_regime`                | No       | Used to detect transitions, avoid whipsaws |

---

## Output Format (JSON)

```json
{
  "date": "2026-04-20",
  "regime": "BULL_STRONG",
  "confidence": 8,
  "vix_level": 18.5,
  "spy_trend": "uptrend",
  "regime_probabilities": {
    "BULL_STRONG": 0.78,
    "BULL_WEAK": 0.15,
    "CHOP": 0.05,
    "BEAR_WEAK": 0.01,
    "BEAR_STRONG": 0.01
  },
  "transition": {
    "from": "BULL_WEAK",
    "to": "BULL_STRONG",
    "confirmed": true
  },
  "reasoning_he": "ה-VIX ירד מתחת ל-20 ונמצא מתחת לממוצע 20 הימים שלו. ה-SPY נסחר מעל ה-MA50 וה-MA200 עם מומנטום חיובי של 5 ימים. רוחב השוק חזק — 68% מהמניות מעל MA50. מעבר מ-BULL_WEAK ל-BULL_STRONG מאושר."
}
```

| Field                  | Type    | Description                                      |
| ---------------------- | ------- | ------------------------------------------------ |
| `regime`               | enum    | The classified regime (see Rules §1)             |
| `confidence`           | 1–10    | Certainty in the classification                  |
| `vix_level`            | float   | Current VIX used in classification               |
| `spy_trend`            | enum    | `uptrend` / `downtrend` / `sideways`             |
| `regime_probabilities` | object  | Soft probabilities for all 5 regimes, sum = 1.0  |
| `transition`           | object? | Populated only when regime changes from previous |
| `reasoning_he`         | string  | Hebrew explanation of why this regime was chosen |

---

## Rules

### R1 — Valid Regimes Only

`regime` MUST be one of exactly 5 values:
`BULL_STRONG` | `BULL_WEAK` | `CHOP` | `BEAR_WEAK` | `BEAR_STRONG`

### R2 — Classification Heuristic

| Regime      | VIX   | SPY Trend                          | Breadth |
| ----------- | ----- | ---------------------------------- | ------- |
| BULL_STRONG | < 20  | > MA50, > MA200, +momentum         | > 60%   |
| BULL_WEAK   | 20–25 | > MA50, mixed signals              | 40–60%  |
| CHOP        | 20–30 | Between MA50/MA200, no clear trend | 35–55%  |
| BEAR_WEAK   | 25–35 | < MA50, > MA200                    | 30–45%  |
| BEAR_STRONG | > 35  | < MA50, < MA200                    | < 35%   |

These thresholds are guidelines — confidence weighs all signals together.

### R3 — Transition Hysteresis

Do not flip regime on a single day's data. Require 2+ consecutive days of
new-regime signals before marking `transition.confirmed = true`. This prevents
whipsawing between regimes during volatile sessions.

### R4 — Confidence Calibration

- 9–10: All signals agree unambiguously
- 7–8: Primary signals agree, minor divergence
- 5–6: Mixed signals, one dominant
- 3–4: Genuinely ambiguous, borderline case
- 1–2: Conflicting signals, use previous regime as tiebreaker

### R5 — Hebrew Reasoning

`reasoning_he` must explain which data points drove the decision and why.
It is shown in the dashboard — write for a retail investor, not a quant.

---

## Example Input

```json
{
  "date": "2026-04-20",
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

---

## Example Output

```json
{
  "date": "2026-04-20",
  "regime": "BULL_STRONG",
  "confidence": 8,
  "vix_level": 18.5,
  "spy_trend": "uptrend",
  "regime_probabilities": {
    "BULL_STRONG": 0.78,
    "BULL_WEAK": 0.16,
    "CHOP": 0.04,
    "BEAR_WEAK": 0.01,
    "BEAR_STRONG": 0.01
  },
  "transition": {
    "from": "BULL_WEAK",
    "to": "BULL_STRONG",
    "confirmed": true
  },
  "reasoning_he": "ה-VIX ירד ל-18.5, מתחת לממוצע 20 הימים שלו (21.0) — הפחד בשוק יורד. ה-SPY נסחר מעל ה-MA50 (510) וה-MA200 (480) עם עלייה של 2.1% בשבוע האחרון. רוחב השוק חזק — 68% מהמניות מעל MA50. כל האינדיקטורים מצביעים על מעבר ממצב BULL_WEAK ל-BULL_STRONG."
}
```
