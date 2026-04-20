# /go

Full post-coding pipeline: verify → simplify → commit, push, open PR.

---

## Context (pre-computed)

Current branch:

```
$(git branch --show-current)
```

Git status:

```
$(git status --short)
```

---

## Instructions

Run these steps in order. Stop and report if any step fails — do not continue to the next step.

### Step 1 — Verify

Run the test suite:

```bash
npm test 2>/dev/null || npm run test 2>/dev/null || echo "NO_TESTS: no test script found"
```

- If tests fail: stop, report the failures, and do not proceed.
- If `NO_TESTS`: note it, continue.

### Step 2 — Simplify

Run `/simplify`: spawn the two parallel cleanup agents (complexity hunter + convention checker). Apply any clear fixes. List any ambiguous findings for the user.

### Step 3 — Commit, push, open PR

Run `/commit-push-pr`: stage all changes, write a conventional commit message, push to origin, and open a PR with `gh pr create`. Print the PR URL.

---

If all three steps complete without error, print:

```
✓ Tests passed
✓ Simplify complete
✓ PR open: <url>
```
