# CLAUDE.md

This repository documents and implements Boris Cherny's Claude Code workflow.
No build system. No runtime. The deliverables are config files, slash commands, and documentation.

---

## Architecture

```
.
├── CLAUDE.md                        ← you are here
├── references/
│   └── boris-workflow.md            ← source of truth for all conventions
└── .claude/
    ├── settings.json                ← permissions, hooks, MCP configs
    └── commands/                    ← slash commands, checked into git
```

**Stack:** Markdown, shell, JSON. No package manager. No compiler.

---

## Key Rules

- **Every task starts in Plan Mode** (Shift+Tab ×2). Iterate the plan before executing.
- **Never use `--dangerously-skip-permissions`** for regular work.
- **Keep CLAUDE.md under 4,000 tokens.** Bloated files degrade every session.
- When Claude makes a mistake, add a rule here immediately — do not wait.
- Use `/rewind` to recover from bad attempts. Do not `/compact` through errors.
- Commit `.claude/settings.json` and `.claude/commands/` — the whole team shares them.
- Set auto-compact threshold at 400,000 tokens. Stay below 300–400k for best results.

---

## Common Workflows

### Committing and opening a PR

```
/commit-push-pr
```

Stages changes, writes a conventional commit message from the diff, pushes, and opens a PR.

### After finishing any implementation

```
/simplify
```

Runs parallel agents to clean up redundancy and complexity before the PR lands.

### Full post-coding flow

```
/go
```

Chains: verify → simplify → PR.

### Setting up a parallel session

```bash
git worktree add .claude/worktrees/session-N origin/main
claude --name "task-description"
```

### Adding a new slash command

1. Create `.claude/commands/<name>.md`
2. Add an inline bash block at the top to pre-compute context (git status, logs, etc.)
3. Commit and push — teammates inherit the command automatically.

---

## Known Issues

- No automated CLAUDE.md update pipeline yet (Boris uses a GitHub Action that reads `@.claude` tags in PR comments — not yet wired up here).
- No `/verify-app` command yet — add one once there is a runnable service to test against.
- No MCP servers configured yet (Slack, BigQuery, Sentry are the Boris defaults — add as needed).
- Hooks are not yet configured in `.claude/settings.json`. Priority: `PostToolUse` formatter and `Stop` notification.
