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

## API Endpoints

### Health

| Method | Path    | Description                    |
| ------ | ------- | ------------------------------ |
| GET    | /health | Returns `{ status, database }` |

### Analysts

| Method | Path                    | Description                                                |
| ------ | ----------------------- | ---------------------------------------------------------- |
| GET    | /api/analysts           | List all active analysts                                   |
| GET    | /api/analysts/:username | Single analyst + latest DNA profile                        |
| POST   | /api/analysts           | Add new analyst `{ username, display_name, analyst_type }` |

### Insights

| Method | Path                      | Description                     |
| ------ | ------------------------- | ------------------------------- |
| GET    | /api/insights?ticker=NVDA | Latest 50 insights for a ticker |

### Stock Fit Simulator

| Method | Path           | Description                                           |
| ------ | -------------- | ----------------------------------------------------- |
| POST   | /api/stock-fit | `{ analyst_id, ticker }` → placeholder (AI agent TBD) |

## Error Responses

All errors follow this shape:

```json
{ "error": "<Hebrew message>", "details": "..." }
```

`details` is only included when `NODE_ENV=development`.

## Architecture

```
routes/         → validate input, call service, map DTO → response
services/       → all Supabase queries (raw DB types in/out)
dto/            → DB row → API response (enum conversion, fit_score ×10)
validation/     → Zod schemas for request bodies and query params
middleware/     → asyncHandler, errorHandler, rateLimiter, logger, requireAuth
config/         → Supabase singleton (fails fast if env vars missing)
types/          → shared domain types + DB row types + enum helpers
```

## Notes

- **Morgan removed** — replaced by `pino-http` for structured JSON logging.
- **fit_score**: stored as `0.0–1.0` in DB, returned as `0–10` in API responses.
- **Enum mapping**: DB uses underscores (`trader_scalp`), API uses hyphens (`trader-scalp`). Conversion in `dto/` layer.
- **`requireAuth`**: placeholder middleware — wire in Supabase JWT verification when auth is built.
