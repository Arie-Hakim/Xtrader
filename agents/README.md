# XTrader Agents

6 Managed Agents that power the XTrader pipeline — from raw tweets to Hebrew morning reports and on-demand stock-fit analysis.

---

## Agent Overview

| Agent              | File                                         | Purpose                                 | Trigger                           |
| ------------------ | -------------------------------------------- | --------------------------------------- | --------------------------------- |
| 🤖 Fetcher         | [fetcher-agent.md](fetcher-agent.md)         | Fetch 500–1,000 tweets/analyst from X   | Daily 06:00 + manual              |
| 🧬 Parser          | [parser-agent.md](parser-agent.md)           | Extract Insights from raw tweets        | After each Fetch                  |
| 📚 DNA Builder     | [dna-builder-agent.md](dna-builder-agent.md) | Build/update analyst DNA profile        | New analyst / 50+ tweets / manual |
| 🌡️ Regime Detector | [regime-agent.md](regime-agent.md)           | Classify market regime (BULL/BEAR/CHOP) | Daily 07:00                       |
| 🎯 Recommender     | [recommender-agent.md](recommender-agent.md) | Daily consensus + Hebrew morning report | Daily 08:00                       |
| 🔍 Stock Fit       | [stock-fit-agent.md](stock-fit-agent.md)     | Check if stock fits analyst methodology | On-demand                         |

---

## Adaptive Strategy

XTrader uses a HOT/WARM/COLD tier system to reduce Fetcher costs by ~95%.
See [ADAPTIVE_STRATEGY.md](ADAPTIVE_STRATEGY.md) for the full design: cost analysis,
tier state machine, user pinning rules, plan integration roadmap, and monitoring metrics.

---

## Daily Execution Schedule

```
06:00  🤖 Fetcher          → tweets table
              ↓ (event-driven)
       🧬 Parser            → insights table
              ↓ (if 50+ new insights)
       📚 DNA Builder       → analyst_dna table (conditional)

07:00  🌡️ Regime Detector   → market_regimes table

08:00  🎯 Recommender       → recommendations + daily_reports tables

Anytime
       🔍 Stock Fit         → stock_fit_results (cached 4h)
```

---

## Agent Dependencies

```
[Fetcher] ──────────────────────────→ tweets table
                                              │
                                    [Parser] ←┘
                                         │
                              ┌──────────┴──────────┐
                              │                     │
                     insights table          analysts.analyst_type
                              │
               ┌──────────────┴──────────────┐
               │                             │
        [DNA Builder]                  [Recommender] ←── market_regimes ←── [Regime Detector]
               │                             │
       analyst_dna table           recommendations + daily_reports
               │
        [Stock Fit] ←── analyst_dna + insights + market_regimes
               │
      stock_fit_results (cached 4h)
```

---

## Skills Mapping

| Skill                    | File                                                                    | Used By         |
| ------------------------ | ----------------------------------------------------------------------- | --------------- |
| `analyst-classifier`     | [skills/analyst-classifier.md](../skills/analyst-classifier.md)         | Parser          |
| `insight-extractor`      | [skills/insight-extractor.md](../skills/insight-extractor.md)           | Parser          |
| `dna-builder`            | [skills/dna-builder.md](../skills/dna-builder.md)                       | DNA Builder     |
| `regime-classifier`      | [skills/regime-classifier.md](../skills/regime-classifier.md)           | Regime Detector |
| `recommendation-builder` | [skills/recommendation-builder.md](../skills/recommendation-builder.md) | Recommender     |
| `stock-fit-analyzer`     | [skills/stock-fit-analyzer.md](../skills/stock-fit-analyzer.md)         | Stock Fit       |

---

## Cost Estimation

Assumes 20 active analysts, ~1,000 on-demand stock-fit queries/month.

| Agent              | Model                       | Daily Cost       | Monthly Cost        |
| ------------------ | --------------------------- | ---------------- | ------------------- |
| 🤖 Fetcher         | Grok X Search Tool          | $10–20           | $300–600            |
| 🧬 Parser          | Grok 4.1 Fast (Batches API) | $1–5             | $30–150             |
| 📚 DNA Builder     | Claude Sonnet               | ~$0.20–0.60 \*   | $4–12               |
| 🌡️ Regime Detector | Claude Sonnet               | ~$0.002          | $0.06               |
| 🎯 Recommender     | Claude Sonnet               | $0.05–0.15       | $1.50–4.50          |
| 🔍 Stock Fit       | Claude Sonnet               | ~$0.50–1.00 \*\* | $15–30              |
| **Total**          |                             | **~$12–27/day**  | **~$350–800/month** |

\* DNA Builder runs ~2 times per analyst per month on average (fires only on 50+ new tweets)
\*\* Stock Fit assumes ~1,000 queries/month at 30% cache miss rate (70% served from 4h cache)

**Cost is dominated by Fetcher (Grok X Search).** To optimize:

- Reduce `count` to 500 (minimum for reliable DNA)
- Start with fewer analysts and scale up
- DNA Builder's conditional trigger already saves ~90% vs. running daily

### Adaptive Strategy Estimates (20 Analysts, HOT/WARM/COLD Tiers)

With the adaptive fetch strategy active, Fetcher cost drops from $300–600/month to ~$14/month:

| Tier      | Analysts | Fetcher Cost/Month | Parser Cost/Month | Total/Month |
| --------- | -------- | ------------------ | ----------------- | ----------- |
| HOT       | 5        | $7.50              | ~$0.75            | ~$8.25      |
| WARM      | 10       | $6.00              | ~$0.60            | ~$6.60      |
| COLD      | 5        | $0.50              | ~$0.05            | ~$0.55      |
| **Total** | 20       | **$14.00**         | **~$1.40**        | **~$15.40** |

Other agents (DNA Builder, Regime, Recommender, Stock Fit) are unaffected — total remains
~$20–30/month with adaptive strategy vs. $350–800/month without. **~95% savings.**

See [ADAPTIVE_STRATEGY.md](ADAPTIVE_STRATEGY.md) for full methodology.

---

## Future Monetization

> Deferred to Monetization sprint. Design reference only.

Plan-based limits will gate analyst counts, HOT slots, pinning, and Stock Fit queries:

| Plan    | Max Analysts | HOT Slots | Pinning | Stock Fit/day |
| ------- | ------------ | --------- | ------- | ------------- |
| FREE    | 3            | 1         | 0       | 5             |
| PRO     | 10           | 3         | 2       | 50            |
| PREMIUM | 50           | 10        | 10      | unlimited     |

Enforcement points: nightly rebalance job (HOT slots), analyst add flow (max analysts),
Stock Fit insert path (daily query cap). See [ADAPTIVE_STRATEGY.md](ADAPTIVE_STRATEGY.md) §6.

---

## Deployment

See [DEPLOY.md](DEPLOY.md) for full step-by-step Claude Console setup including skill upload, agent configuration, Supabase MCP connection, and dry-run testing.
