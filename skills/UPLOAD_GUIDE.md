# Skills Upload Guide — Claude Console

This guide explains how to upload the XTrader skills to Claude Console.

---

## Skills in This Folder

| Skill                    | Directory                 | Purpose                                          |
| ------------------------ | ------------------------- | ------------------------------------------------ |
| `insight-extractor`      | `insight-extractor/`      | Parse one tweet → structured Insight JSON        |
| `analyst-classifier`     | `analyst-classifier/`     | Classify analyst type from 500–1,000 tweets      |
| `dna-builder`            | `dna-builder/`            | Build analyst DNA profile from batch of Insights |
| `recommendation-builder` | `recommendation-builder/` | Daily morning report + scoring engine            |
| `regime-classifier`      | `regime-classifier/`      | Market regime classification (07:00 daily)       |
| `stock-fit-analyzer`     | `stock-fit-analyzer/`     | DNA Simulator — stock vs. analyst methodology    |

---

## Upload Steps (per skill)

1. **Open Claude Console** → Skills → New Skill
2. **Upload method**: drag the skill's folder (e.g., `insight-extractor/`) or
   zip it first: `zip -r insight-extractor.zip insight-extractor/`
3. The console reads `SKILL.md` as the entry file — ensure it is present
4. Verify the frontmatter fields appear correctly:
   - `name` — slug used in API calls
   - `description` — shown in the skill list
   - `version` — for change tracking
5. Test with a sample input from the skill's "Example Input" section
6. Save and note the skill ID returned — add it to `.env` as `SKILL_ID_<NAME>`

---

## Recommended Upload Order

Upload in dependency order so you can test each layer before the next:

```
1. regime-classifier       (no dependencies)
2. analyst-classifier      (no dependencies)
3. insight-extractor       (depends on analyst-classifier output)
4. dna-builder             (depends on insight-extractor output)
5. stock-fit-analyzer      (depends on dna-builder output)
6. recommendation-builder  (depends on all of the above)
```

---

## Environment Variables

After uploading, add to `.env`:

```env
SKILL_ID_REGIME_CLASSIFIER=<id from console>
SKILL_ID_ANALYST_CLASSIFIER=<id from console>
SKILL_ID_INSIGHT_EXTRACTOR=<id from console>
SKILL_ID_DNA_BUILDER=<id from console>
SKILL_ID_STOCK_FIT_ANALYZER=<id from console>
SKILL_ID_RECOMMENDATION_BUILDER=<id from console>
```

---

## Notes

- Skills are called by the backend agents in `backend/agents/`
- Do **not** commit skill IDs to the repo — keep them in `.env` only
- To update a skill: edit `SKILL.md`, bump `version`, re-upload, update the ID in `.env`
