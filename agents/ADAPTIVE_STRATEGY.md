# Adaptive Fetch Strategy — Master Document

> **TL;DR:** Instead of fetching every analyst daily, XTrader assigns each analyst a fetch tier
> based on how recently a user viewed them. Result: 95% cost reduction (from ~$300–600/month
> to ~$14/month for 20 analysts).

---

## 1. Why Adaptive Fetch

### The Problem

The naïve approach — fetch all analysts daily — costs $10–20/day in Grok X Search calls.
At 20 analysts, that is $300–600/month before a single user has signed up.

The insight: **not all analysts are equally relevant at all times.**
A user who last looked at an analyst 45 days ago does not need daily fresh tweets for them.

### Cost Breakdown

| Tier | Frequency | Cost/Analyst/Month |
| ---- | --------- | ------------------ |
| HOT  | Daily     | ~$1.50             |
| WARM | Weekly    | ~$0.60             |
| COLD | Monthly   | ~$0.10             |

### Example Scenario (20 Analysts)

| Tier      | Count | Unit Cost | Subtotal         |
| --------- | ----- | --------- | ---------------- |
| HOT       | 5     | $1.50     | $7.50            |
| WARM      | 10    | $0.60     | $6.00            |
| COLD      | 5     | $0.10     | $0.50            |
| **Total** | 20    | —         | **$14.00/month** |

Compared to $300–600/month naïve → **95%+ savings.**

---

## 2. Tier Definitions

| Tier   | Condition                          | Fetch Frequency        |
| ------ | ---------------------------------- | ---------------------- |
| HOT    | `last_user_view_at` ≤ 7 days ago   | Daily (existing cron)  |
| WARM   | `last_user_view_at` 8–30 days ago  | Weekly (Sundays 06:00) |
| COLD   | `last_user_view_at` > 30 days ago  | Monthly (1st, 06:00)   |
| PINNED | User explicitly pinned the analyst | Always HOT, regardless |

**Data source:** `analyst_user_views` table — tracks `(analyst_id, user_id, viewed_at)`.
`last_user_view_at` = MAX(viewed_at) across ALL users for a given analyst.

---

## 3. Tier Transition State Machine

```
                   ┌─────────────────────────────────────────┐
                   │              PINNED                      │
                   │  (user override — always fetches daily)  │
                   └───────┬─────────────────────────────────┘
                           │ unpin                 ▲ pin
                           ▼                       │
  ┌───────────────────────────────────────────────────────────┐
  │                         HOT                               │
  │             last_user_view_at ≤ 7 days                    │
  └──────┬──────────────────────────────────────┬────────────┘
         │ no view for 8+ days                  │ user views analyst
         ▼                                      │
  ┌──────────────────────────────┐              │
  │            WARM              │──────────────┘
  │  last_user_view_at 8–30 days │
  └──────┬───────────────────────┘
         │ no view for 31+ days
         ▼
  ┌──────────────────────────────┐
  │            COLD              │
  │  last_user_view_at > 30 days │
  └──────┬───────────────────────┘
         │ user views analyst → trigger immediate fetch + DNA refresh
         └──────────────────────────────────────────────────→ HOT
```

### Transition Rules

- **HOT → WARM:** Nightly rebalance at 02:00 detects no view in 8+ days
- **WARM → COLD:** Nightly rebalance at 02:00 detects no view in 31+ days
- **COLD → HOT:** User views analyst (any page load or Stock Fit query) → immediate fetch queued + DNA refresh triggered
- **Any → PINNED:** User pins analyst in UI → tier locked to HOT permanently
- **PINNED → HOT:** User unpins → tier falls back to HOT (then naturally decays)

### Nightly Rebalance Job

```
Cron: 0 2 * * *   (02:00 every night)

For each analyst in analysts table:
  1. Compute days_since_last_view = now() - MAX(analyst_user_views.viewed_at)
  2. If pinned → set tier = PINNED (skip other checks)
  3. Else if days_since_last_view ≤ 7  → tier = HOT
  4. Else if days_since_last_view ≤ 30 → tier = WARM
  5. Else                              → tier = COLD
  6. Write tier to analysts.fetch_tier
```

---

## 4. User Pinning Behavior

- Pinning is a per-user action stored in `user_analyst_pins (user_id, analyst_id, pinned_at)`
- An analyst is PINNED globally (HOT for everyone) if **any** user has pinned them
- When the last user unpins an analyst, it returns to HOT and begins natural decay
- Pinning does NOT affect DNA rebuild frequency — only fetch frequency

### Plan-Based Pin Limits (Future — see §6)

| Plan    | Max Pins |
| ------- | -------- |
| FREE    | 0        |
| PRO     | 2        |
| PREMIUM | 10       |

---

## 5. COLD → HOT Re-Entry Flow

When a user views a COLD analyst (e.g., opens their profile or runs Stock Fit):

```
1. UI/API records view → inserts row in analyst_user_views
2. Fetcher Agent wakes on-demand for this analyst (manual trigger)
3. Fetcher uses since_id from last fetch → incremental only
4. Parser runs on new tweets immediately
5. DNA Builder checks: if 200+ new insights → full rebuild; else augment
6. Analyst tier updated to HOT in analysts.fetch_tier
7. Normal daily cadence resumes
```

Total re-entry latency: typically 2–5 minutes before fresh data is available.

---

## 6. Plan Integration Roadmap (Future — Monetization Sprint)

> Implementation deferred. This section exists for design reference only.

| Plan    | Max Analysts | HOT Slots | Pinning | Stock Fit/day |
| ------- | ------------ | --------- | ------- | ------------- |
| FREE    | 3            | 1         | 0       | 5             |
| PRO     | 10           | 3         | 2       | 50            |
| PREMIUM | 50           | 10        | 10      | unlimited     |

**HOT Slots** = maximum number of analysts a user can keep in HOT tier simultaneously.
Analysts beyond the HOT slot cap are automatically demoted to WARM regardless of view recency.

When implementing:

- Add `plan` column to `users` table
- Enforce HOT slot cap in nightly rebalance job
- Enforce Stock Fit daily limit in `stock_fit_results` insert path
- Enforce analyst count cap in analyst add flow

---

## 7. Monitoring Metrics

Track these in the `fetcher_runs` log and a dedicated `tier_metrics` table:

| Metric                       | Description                                 | Alert Threshold          |
| ---------------------------- | ------------------------------------------- | ------------------------ |
| `hot_count`                  | Analysts currently in HOT                   | > 15 (unexpected growth) |
| `warm_count`                 | Analysts currently in WARM                  | —                        |
| `cold_count`                 | Analysts currently in COLD                  | —                        |
| `cold_reentry_count`         | COLD analysts re-entered HOT today          | > 5 (sudden spike)       |
| `tier_rebalance_duration_ms` | Time for nightly rebalance job              | > 30,000 ms              |
| `estimated_monthly_cost_usd` | Projected cost at current tier distribution | > $50 (alert)            |
| `pinned_count`               | Analysts with active pins                   | —                        |

### Cost Projection Formula

```
estimated_monthly_cost =
  (hot_count  × 1.50) +
  (warm_count × 0.60) +
  (cold_count × 0.10)
```

Log this after every nightly rebalance. Surface it in the admin dashboard.

---

## Related Documents

- [Fetcher Agent](fetcher-agent.md) — fetch tier logic implementation
- [Parser Agent](parser-agent.md) — tier-aware parsing + deduplication
- [DNA Builder Agent](dna-builder-agent.md) — incremental DNA updates
- [Stock Fit Agent](stock-fit-agent.md) — tier-aware caching
- [Recommender Agent](recommender-agent.md) — tier-aware report generation
