# Agent: DNA Builder

## Purpose

Build or incrementally update an analyst's DNA profile from a batch of 500–1,000 processed Insights. The DNA is the persistent memory of how an analyst thinks — entry rules, exit rules, dominant indicators, regime preferences, and historical patterns. Runs only when there is enough new data to justify a rebuild, saving ~90% of potential costs.

---

## Trigger

Fires on any of these conditions (checked in order):

1. **New analyst added** — `analyst_type` set for the first time in `analysts` table
2. **50+ new insights** accumulated since `analyst_dna.built_at`
3. **Manual trigger** via Claude Console → Managed Agents → trigger

---

## Skills Used

| Skill         | Purpose                                         |
| ------------- | ----------------------------------------------- |
| `dna-builder` | Builds full DNA profile from 500–1,000 Insights |

---

## Input

```json
{
  "analyst_id": "uuid",
  "analyst_username": "string",
  "analyst_type": "trader-swing",
  "insights": [ "...500–1,000 Insight objects..." ],
  "existing_dna": { "...previous DNA profile or null..." }
}
```

Loaded from:

- `analysts` table → `analyst_id`, `analyst_username`, `analyst_type`
- `insights` table → filtered by `analyst_id`, ordered by `posted_at DESC`, limit 1,000
- `analyst_dna` table → current DNA version (if exists), used for incremental updates

---

## Output

DNA profile saved to `analyst_dna` table:

| Column           | Value                                    |
| ---------------- | ---------------------------------------- |
| `analyst_id`     | FK to `analysts`                         |
| `version`        | Incremented on each successful build     |
| `dna_json`       | Full DNA object from `dna-builder` skill |
| `built_at`       | Timestamp of this build                  |
| `insights_count` | Number of insights used in this build    |

---

## Flow

1. **Check trigger condition:**
   - New analyst → proceed immediately
   - Existing analyst → count `insights WHERE analyst_id = X AND posted_at > last built_at`; if < 50, exit with `{ skipped: true, reason: "insufficient_new_data" }`
2. **Load data** — Fetch 500–1,000 most recent insights for `analyst_id`; load existing DNA if present
3. **Call `dna-builder`** — Pass insights batch + `existing_dna`; receive DNA profile
4. **Handle skip response** — If skill returns `{ skipped: true }`, log gracefully and exit; do not error
5. **Validate output** — Confirm required fields present: `entry_rules`, `exit_rules`, `regime_performance`, `dominant_indicators`
6. **Upsert DNA** — Save to `analyst_dna` with `version = previous_version + 1` and `built_at = now()`
7. **Log run** — Insert row in `dna_builder_runs`: `{ analyst_id, version, insights_used, duration_ms, skipped }`

---

## Error Handling

| Scenario                                  | Action                                                                                                    |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| < 200 insights available                  | Refuse build; log `{ analyst_id, insight_count, reason: "below_minimum" }`; do not write to `analyst_dna` |
| 200–499 insights                          | Build with warning field in `dna_json`; proceed                                                           |
| `dna-builder` returns `{ skipped: true }` | Log gracefully; update `last_checked_at` to prevent re-triggering today                                   |
| DB upsert failure                         | Retry once; keep previous DNA version intact if retry fails                                               |
| `existing_dna` version conflict           | Use DB-fetched version as authoritative; overwrite stale in-memory copy                                   |

---

## Cost Estimation

- **Model:** Claude Sonnet
- **Prompt size:** ~50,000 tokens per build (500–1,000 Insight objects)
- **Per build:** ~**$0.10–0.30**
- **Frequency:** Only when 50+ new tweets since last build (not daily)
- **Monthly (20 analysts, ~2 builds each):** ~**$4–12/month**

> DNA Builder is the most cost-efficient agent — it runs only when it has enough signal.
> A 20-analyst setup may trigger DNA Builder only 40 times/month total.

---

## Adaptive Trigger Logic

The base trigger conditions (50+ new insights, new analyst, manual) are augmented per tier:

### With Adaptive Strategy Active:

| Tier   | DNA Rebuild Trigger                                                      |
| ------ | ------------------------------------------------------------------------ |
| HOT    | 100+ new insights since last `built_at` (raised threshold — more signal) |
| WARM   | Monthly rebuild regardless of insight count                              |
| COLD   | Rebuild on COLD → HOT re-entry (user views analyst after 30+ day gap)    |
| PINNED | Same as HOT — 100+ new insights triggers rebuild                         |

**New analyst threshold:** build DNA after first **200 insights** (reduced from 500 — enough
signal for an initial DNA without waiting weeks for a new analyst to accumulate tweets).

---

## Incremental DNA Updates

Instead of a full rebuild from scratch each time, the DNA Builder tracks its position
and augments existing DNA with new signal only:

### Version Tracking

Two new fields on the `analyst_dna` table:

| Column                    | Value                                          |
| ------------------------- | ---------------------------------------------- |
| `dna_version`             | Integer, incremented on each successful build  |
| `analyzed_until_tweet_id` | X tweet ID of the most recent insight included |

### Update Flow

```
1. Load existing DNA from analyst_dna (if version ≥ 1)
2. Fetch only insights WHERE tweet_id > analyzed_until_tweet_id
3. If new_insight_count < threshold → skip (return { skipped: true })
4. Call dna-builder skill with:
     existing_dna  = current DNA object
     new_insights  = only the delta batch
5. Skill merges new signal into existing DNA (augment mode, not full rebuild)
6. Save: dna_version += 1, analyzed_until_tweet_id = MAX(new tweet_id)
```

### Full Rebuild Schedule

Incremental augments accumulate drift over time. Force a full rebuild every **3 months**:

- Set `force_rebuild = true` when `built_at < now() - 90 days`
- Full rebuild loads up to 1,000 most recent insights (ignores `analyzed_until_tweet_id`)
- Resets the version anchor to the latest tweet ID

**Cost impact:** incremental augments cost ~60% less than a full rebuild (smaller prompt).
