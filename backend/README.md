# XTrader Backend

Express + TypeScript API server. Connects the React frontend to Supabase using the secret key (never exposed to the client).

## Setup

```bash
npm install
cp .env.example .env
# Fill SUPABASE_URL and SUPABASE_SECRET_KEY in .env
```

## Run

```bash
npm run dev      # development (ts-node + nodemon, pretty logs)
npm run build    # compile to dist/
npm run start    # run compiled output
npm test         # run jest test suite
```

## Environment Variables

| Variable            | Description                      | Default               |
| ------------------- | -------------------------------- | --------------------- |
| SUPABASE_URL        | Supabase project URL             | **required**          |
| SUPABASE_SECRET_KEY | Supabase service_role secret key | **required**          |
| PORT                | Server port                      | 3001                  |
| NODE_ENV            | `development` or `production`    | development           |
| CORS_ORIGIN         | Allowed frontend origin          | http://localhost:5173 |
| LOG_LEVEL           | Pino log level                   | info                  |

## Database Migrations

Run in order against your Supabase project (SQL Editor or `psql`):

| File                                         | What it does                                            |
| -------------------------------------------- | ------------------------------------------------------- |
| `database/migrations/001_*`                  | Initial schema (analysts, tweets, dna, insights, etc.)  |
| `database/migrations/002_adaptive_fetch.sql` | Adds fetch-tier tracking columns to `analysts`          |
| `database/migrations/003_user_analysts.sql`  | Creates `user_analysts` join table                      |
| `database/migrations/004_plan_ready.sql`     | Adds plan/subscription columns + `usage_tracking` table |

All migrations are idempotent (`IF NOT EXISTS`) — safe to re-run.

## API Endpoints

### Health

| Method | Path    | Description                    |
| ------ | ------- | ------------------------------ |
| GET    | /health | Returns `{ status, database }` |

### Analysts

| Method | Path                    | Auth | Description                                                |
| ------ | ----------------------- | ---- | ---------------------------------------------------------- |
| GET    | /api/analysts           |      | List all active analysts                                   |
| GET    | /api/analysts/:username |      | Single analyst + latest DNA profile                        |
| POST   | /api/analysts           | ✓    | Add new analyst `{ username, display_name, analyst_type }` |

### Insights

| Method | Path                      | Description                     |
| ------ | ------------------------- | ------------------------------- |
| GET    | /api/insights?ticker=NVDA | Latest 50 insights for a ticker |

### Stock Fit Simulator

| Method | Path           | Auth | Description                                                        |
| ------ | -------------- | ---- | ------------------------------------------------------------------ |
| POST   | /api/stock-fit | ✓    | `{ analyst_id, ticker }` → `{ result, cache_hit, plan_remaining }` |

Response shape:

```json
{
  "result": {
    "analyst_id": "...",
    "ticker": "NVDA",
    "status": "pending",
    "message": "..."
  },
  "cache_hit": false,
  "plan_remaining": 5
}
```

### User–Analyst Relationships

| Method | Path                                | Auth | Description                                 |
| ------ | ----------------------------------- | ---- | ------------------------------------------- |
| POST   | /api/user-analysts                  | ✓    | Add analyst to user's list `{ analyst_id }` |
| DELETE | /api/user-analysts/:analyst_id      | ✓    | Remove analyst from user's list             |
| POST   | /api/user-analysts/:analyst_id/pin  | ✓    | Toggle pin on an analyst                    |
| GET    | /api/user-analysts                  | ✓    | Get user's analysts sorted by last view     |
| POST   | /api/user-analysts/:analyst_id/view | ✓    | Record a view event (updates last_view_at)  |

### Admin

| Method | Path                         | Auth | Description                             |
| ------ | ---------------------------- | ---- | --------------------------------------- |
| GET    | /api/admin/cost-stats        | ✓    | Fetch/action counts from usage_tracking |
| GET    | /api/admin/tier-distribution | ✓    | HOT/WARM/COLD analyst counts            |
| POST   | /api/admin/rebalance-tiers   | ✓    | Recompute fetch tier for all analysts   |

## Adaptive Fetch

Analysts are fetched on different schedules based on user activity:

| Tier | Condition                                | Fetch interval |
| ---- | ---------------------------------------- | -------------- |
| HOT  | Pinned by any user, or viewed in last 3d | Every 24h      |
| WARM | Viewed in last 14 days                   | Every 7 days   |
| COLD | Not viewed in 14+ days                   | Every 30 days  |

Tier rebalancing runs nightly via `POST /api/admin/rebalance-tiers` (wire into a cron job or Supabase Edge Function scheduler).

First fetch for a new analyst pulls up to **1,000 tweets**; incremental fetches pull up to **200** using `since_id`.

## Plan Limits (skeleton — Monetization sprint)

| Plan    | Max analysts | HOT slots | Stock fits/day | Pinned |
| ------- | ------------ | --------- | -------------- | ------ |
| FREE    | 3            | 1         | 5              | 0      |
| PRO     | 10           | 3         | 50             | 2      |
| PREMIUM | 50           | 10        | unlimited      | 10     |

Plan enforcement currently returns `allowed: true` for all checks. Real quota logic and Stripe integration ship in the Monetization sprint.

## Architecture

```
routes/         → validate input, call service, map DTO → response
services/       → Supabase queries + adaptive fetch logic + cache + plan enforcement
dto/            → DB row → API response (enum conversion, fit_score ×10)
validation/     → Zod schemas for request bodies and query params
middleware/     → asyncHandler, errorHandler, rateLimiter, logger, requireAuth
config/         → Supabase singleton + plan limits constants
types/          → shared domain types + DB row types + enum helpers
__tests__/      → jest unit tests (adaptiveFetch, cacheManager, planEnforcement)
```

## Notes

- **Morgan removed** — replaced by `pino-http` for structured JSON logging.
- **fit_score**: stored as `0.0–1.0` in DB, returned as `0–10` in API responses.
- **Enum mapping**: DB uses underscores (`trader_scalp`), API uses hyphens (`trader-scalp`). Conversion in `dto/` layer.
- **`requireAuth`**: placeholder middleware — wire in Supabase JWT verification when auth is built.
- **Stock-fit cache**: in-memory `Map` for MVP. Replace with Redis (`ioredis`) when provisioned.
