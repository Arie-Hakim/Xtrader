# /simplify

Run parallel cleanup agents on recently changed code before it lands in a PR.

---

## Context (pre-computed)

Files changed since last commit:

```
$(git diff --name-only HEAD)
```

Full diff:

```
$(git diff HEAD)
```

---

## Instructions

Spawn two subagents **in parallel** using the Agent tool. Do not wait for one to finish before starting the other.

**Agent 1 — Complexity hunter:**
Review the diff above for:

- Dead code, duplicate logic, or unnecessary abstractions
- Functions longer than ~40 lines that could be split
- Variables or parameters that are never used
- Overly nested conditionals that could be flattened
- Any `TODO` or `FIXME` comments that are now stale

Report findings as a bullet list with file:line references.

**Agent 2 — Convention checker:**
Review the diff above for XTrader conventions (from CLAUDE.md):

- No TypeScript `enum` — use literal union types instead
- No `interface` where `type` suffices
- All user-facing strings must be Hebrew (RTL)
- Parser functions must extract only — never compute scores
- Every Insight must be structured JSON with the original tweet URL preserved
- No sensitive keys hardcoded — must reference `process.env.*`

Report violations as a bullet list with file:line references.

After both agents finish, consolidate their findings and apply any fixes that are clearly correct. For anything ambiguous, list it and ask before changing.
