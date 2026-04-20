# /plan

Force a structured planning session before writing any code.

---

## Context (pre-computed)

Current branch:

```
$(git branch --show-current)
```

Recent commits:

```
$(git log --oneline -5)
```

---

## Instructions

Enter Plan Mode now (if not already in it). Work through this checklist in order — do not write or edit any files until the checklist is complete and the user has approved the plan.

### Checklist

1. **Goal** — State in one sentence what the task is trying to accomplish and why.

2. **Constraints** — List any hard rules that must not be violated (from CLAUDE.md, the spec, or the user's request).

3. **Files affected** — Identify every file that will need to be created or changed. For each, note what changes and why.

4. **Approach** — Describe the implementation in plain English. Include the sequence of steps.

5. **What could go wrong?** — Name at least two failure modes or edge cases. For each, describe how the implementation handles it.

6. **Verification** — State exactly how you will confirm the implementation is correct (commands to run, UI to check, tests to pass).

After completing the checklist, present the full plan to the user. Do not proceed to implementation until the user explicitly approves.

When the user approves, exit Plan Mode and implement in one shot with auto-accept edits enabled.
