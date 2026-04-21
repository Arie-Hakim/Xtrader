# XTrader – Database Migration Guide

## Overview

Three SQL files create the full XTrader schema on Supabase (PostgreSQL 15+):

| File          | Contents                                   |
| ------------- | ------------------------------------------ |
| `enums.sql`   | 5 ENUM types + `pgcrypto` extension        |
| `schema.sql`  | 8 tables with constraints and foreign keys |
| `indexes.sql` | B-tree + GIN indexes                       |

---

## Execution Order

**Always run in this order.** Each file depends on the previous one.

```
1. enums.sql
2. schema.sql
3. indexes.sql
```

---

## Running on Supabase

### Option A – SQL Editor (recommended for first run)

1. Open your Supabase project → **SQL Editor**
2. Paste and run `enums.sql` → click **Run**
3. Paste and run `schema.sql` → click **Run**
4. Paste and run `indexes.sql` → click **Run**

### Option B – Supabase CLI migration

```bash
supabase migration new initial_schema
# Copy the content of each file into the generated migration file in order:
# enums → schema → indexes
supabase db push
```

### Option C – psql

```bash
psql "$DATABASE_URL" -f database/enums.sql
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/indexes.sql
```

---

## Verification Queries

Run these after migration to confirm everything was created correctly.

### 1. All 8 tables exist

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
-- Expected: analyst_dna, analysts, insights, market_regimes,
--           recommendations, stock_fit_results, tweets, users
```

### 2. All 5 ENUMs exist

```sql
SELECT typname
FROM pg_type
WHERE typcategory = 'E'
ORDER BY typname;
-- Expected: analyst_type_enum, direction_enum, horizon_enum,
--           market_regime_enum, plan_type_enum
```

### 3. GIN indexes on JSONB columns

```sql
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE indexdef ILIKE '%gin%'
ORDER BY tablename, indexname;
-- Expected: ~9 GIN indexes across analyst_dna, insights,
--           recommendations, users
```

### 4. Foreign keys with CASCADE

```sql
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
-- All rows should show delete_rule = 'CASCADE'
```

### 5. Smoke test – insert and query an analyst

```sql
INSERT INTO analysts (username, display_name, analyst_type)
VALUES ('qullamaggie', 'Kristjan Qvigstad Kullamägi', 'trader_swing');

SELECT id, username, analyst_type, analyst_weight
FROM analysts
WHERE username = 'qullamaggie';

-- Clean up
DELETE FROM analysts WHERE username = 'qullamaggie';
```

---

## Enum Mapping: App Layer ↔ SQL

PostgreSQL ENUMs cannot contain hyphens (`-`), so the app maps values on
every read/write:

| App value (TypeScript) | DB value (SQL ENUM) |
| ---------------------- | ------------------- |
| `trader-scalp`         | `trader_scalp`      |
| `trader-swing`         | `trader_swing`      |
| `trader-position`      | `trader_position`   |
| `investor`             | `investor`          |
| `macro`                | `macro`             |
| `mixed`                | `mixed`             |

Apply this mapping in the backend service layer (e.g., a `toDbEnum` /
`fromDbEnum` utility) so that the rest of the codebase — and the spec —
can continue using hyphenated strings without change.

Example (TypeScript):

```ts
const toDbAnalystType = (t: string) => t.replace(/-/g, "_");
const fromDbAnalystType = (t: string) => t.replace(/_/g, "-");
```

---

## Rollback

To drop everything cleanly (destructive — dev only):

```sql
DROP TABLE IF EXISTS stock_fit_results, recommendations, market_regimes,
    insights, analyst_dna, tweets, users, analysts CASCADE;

DROP TYPE IF EXISTS analyst_type_enum, direction_enum, horizon_enum,
    market_regime_enum, plan_type_enum CASCADE;
```

---

## Notes

- `fit_score` in `stock_fit_results` is stored as **0.0–1.0**. The UI
  displays it as `×10` (e.g., `0.8` → `"8/10"`) for consistency with
  `final_score` in `recommendations`.
- `raw_data` in `insights` **must always contain `tweet_url`** — this
  enforces Core Principle #4 (Transparency). Validation happens at the
  Parser Agent layer before insert.
- `users.id` should be set to the Supabase `auth.users.id` value so
  that Row Level Security policies can reference it with `auth.uid()`.
