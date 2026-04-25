# XTrader Agents — Deployment Guide

Deploy all 6 XTrader Managed Agents to Claude Console (console.anthropic.com).

---

## Prerequisites

- Anthropic Console account with Managed Agents enabled
- Supabase project running with schema applied from `database/schema.sql`
- All environment variables ready (see Step 5)

---

## Step 1 — Upload Skills

1. Go to **console.anthropic.com → Build → Skills**
2. Click **New Skill** for each file in `skills/`:

| Skill File                         | Skill Name               | Model                   |
| ---------------------------------- | ------------------------ | ----------------------- |
| `skills/analyst-classifier.md`     | `analyst-classifier`     | Claude Sonnet           |
| `skills/insight-extractor.md`      | `insight-extractor`      | Grok 4.1 Fast (Batches) |
| `skills/dna-builder.md`            | `dna-builder`            | Claude Sonnet           |
| `skills/regime-classifier.md`      | `regime-classifier`      | Claude Sonnet           |
| `skills/recommendation-builder.md` | `recommendation-builder` | Claude Sonnet           |
| `skills/stock-fit-analyzer.md`     | `stock-fit-analyzer`     | Claude Sonnet           |

3. Paste the full content of each `.md` file into the skill editor
4. Set the model per the table above — `insight-extractor` uses Grok 4.1 Fast Batches API for 50% cost savings

---

## Step 2 — Create Agents

Go to **Managed Agents → Agents → New Agent** and create one per row:

| Agent Config File             | Agent Name        | Skills to Attach                          |
| ----------------------------- | ----------------- | ----------------------------------------- |
| `agents/fetcher-agent.md`     | `fetcher`         | _(none)_                                  |
| `agents/parser-agent.md`      | `parser`          | `insight-extractor`, `analyst-classifier` |
| `agents/dna-builder-agent.md` | `dna-builder`     | `dna-builder`                             |
| `agents/regime-agent.md`      | `regime-detector` | `regime-classifier`                       |
| `agents/recommender-agent.md` | `recommender`     | `recommendation-builder`                  |
| `agents/stock-fit-agent.md`   | `stock-fit`       | `stock-fit-analyzer`                      |

For each agent:

1. Copy the **Purpose** and **Flow** sections from the agent's `.md` file into the agent system prompt
2. Attach the relevant skills from the table above
3. Set the trigger (see Step 3)

---

## Step 3 — Set Triggers

| Agent             | Trigger Type | Cron Expression                                         |
| ----------------- | ------------ | ------------------------------------------------------- |
| `fetcher`         | Cron         | `0 6 * * *` (daily 06:00)                               |
| `parser`          | Event        | After `fetcher` run completes                           |
| `dna-builder`     | Conditional  | New analyst OR 50+ new tweets (agent checks internally) |
| `regime-detector` | Cron         | `0 7 * * *` (daily 07:00)                               |
| `recommender`     | Cron         | `0 8 * * *` (daily 08:00)                               |
| `stock-fit`       | Manual / API | On-demand user request                                  |

---

## Step 4 — Connect Supabase (MCP)

In **Managed Agents → Environments**:

1. Add MCP Server: **Supabase**
2. Configure with your Supabase connection string from project settings → Database → Connection string
3. Grant each agent DB access scoped to its role (read/write per the **Output** section of each agent file)
4. Test connection with a dry-run query before enabling cron triggers

---

## Step 5 — Set Environment Variables

In **Managed Agents → Environments → Environment Variables**:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
GROK_API_KEY=your-grok-api-key
YAHOO_FINANCE_API_KEY=your-key-if-using-paid-tier
```

> Never commit these values to git. Store only in Claude Console environment settings.

---

## Step 6 — Test (Dry Run)

Run these in order to verify the full pipeline:

1. Trigger `fetcher` manually: `{ "username": "test_analyst", "count": 10 }` → verify rows in `tweets` table
2. Trigger `parser` manually → verify rows in `insights` table, `processed = true` in tweets
3. Trigger `dna-builder` manually → verify row in `analyst_dna` table
4. Trigger `regime-detector` manually → verify row in `market_regimes` table
5. Trigger `recommender` manually → verify rows in `recommendations` and `daily_reports`
6. Trigger `stock-fit` with `{ "analyst_id": "...", "ticker": "AAPL" }` → verify row in `stock_fit_results`
7. Trigger `stock-fit` again with same input → verify cache hit (no new DB write, same result)

---

## Monitoring

- **Managed Agents → Sessions** — Full run history and logs per agent
- **Managed Agents → Analytics** — Token usage, cost breakdown, error rates
- Set up alerts for any agent run with `error_count > 0`
- Watch `fetcher_runs` and `parser_runs` tables for daily pipeline health
