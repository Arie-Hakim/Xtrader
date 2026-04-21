# /commit-push-pr

Stage all changes, write a conventional commit message from the diff, push to origin, and open a PR.

---

## Context (pre-computed)

Current git status:

```
$(git status --short)
```

Recent commits (style reference):

```
$(git log --oneline -8)
```

Full diff of staged + unstaged changes:

```
$(git diff HEAD)
```

Current branch:

```
$(git branch --show-current)
```

---

## Instructions

1. Review the diff and status above.
2. Stage all relevant changes: `git add -A` (exclude secrets — warn if `.env` or credential files appear in the diff).
3. Write a conventional commit message:
   - Format: `<type>(<scope>): <short summary>` — 72 chars max on the subject line
   - Types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `ci`
   - Body: one or two sentences on _why_, not _what_ (the diff shows the what)
   - No trailing period on the subject line
4. Commit using a heredoc so formatting is preserved.
5. Push to origin: `git push -u origin <branch>`.
6. Open a PR with `gh pr create`:
   - Title: same as the commit subject line
   - Body: short summary (2–4 bullets) + a test plan checklist
   - Base branch: `main` (or `master` if main does not exist)
7. Print the PR URL when done.

Do not force-push. Do not skip hooks (`--no-verify`). If a pre-commit hook fails, fix the underlying issue and re-commit — do not bypass.
