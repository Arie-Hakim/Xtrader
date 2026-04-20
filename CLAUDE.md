# XTrader – Claude Code Instructions

## MUST READ FIRST

Before ANY task, read `specs/XTrader_Spec_v3_Final.docx` for full context.

---

## Project Overview

XTrader is a Hebrew-first deep learning platform for X (Twitter) analysts.
It learns each analyst's trading/investing DNA, extracts structured Insights from tweets,
and lets users check whether a stock fits an analyst's methodology.

**Stack:** React + Vite + TypeScript · Node.js + Express · PostgreSQL via Supabase
**AI (tweets):** Grok 4.1 Fast (Batches API) · **AI (DNA/Reports):** Claude Sonnet

---

## Boris Workflow Rules

- **Every non-trivial task starts in Plan Mode** (Shift+Tab ×2). Iterate the plan before executing.
- **Never use `--dangerously-skip-permissions`** for regular work.
- **Keep this file under 4,000 tokens.** Bloated files degrade every session.
- When Claude makes a mistake, add a rule here immediately — do not wait.
- Use `/rewind` to recover from bad attempts. Do not `/compact` through errors.
- Commit `.claude/settings.json` and `.claude/commands/` — the whole team shares them.
- Set auto-compact threshold at 400,000 tokens. Stay below 300–400k for best results.

---

## Core Principles (NEVER violate)

1. **Separation of Concerns** — Parser extracts only; never computes scores
2. **Insight is atomic** — Every tweet → one structured JSON object
3. **Type-aware** — Analyst type is one of: `trader-scalp` | `trader-swing` | `trader-position` | `investor` | `macro` | `mixed`
4. **Transparency** — Always preserve the original tweet URL in every Insight
5. **Hebrew RTL** — All user-facing strings in Hebrew

---

## Critical Rules

- Learn from **500–1,000 tweets** per analyst before building DNA
- Fetcher runs **once/day** or on manual trigger — never more
- DNA Builder runs ONLY when: new analyst added / 50+ new tweets accumulated / manual trigger
- All sensitive keys in `.env` — never commit secrets

---

## Slash Commands

| Command           | Purpose                                            |
| ----------------- | -------------------------------------------------- |
| `/plan`           | Force structured planning before code              |
| `/commit-push-pr` | Stage → commit → push → open PR                    |
| `/simplify`       | Parallel cleanup agents (complexity + conventions) |
| `/go`             | Full pipeline: verify → simplify → PR              |

---

## Workflow for Every Task

1. Read the relevant section in `specs/`
2. Run `/plan` — show the plan, await approval
3. Implement step by step
4. Run `/go` to verify, clean up, and open the PR

---

## Known Issues

- No `/verify-app` command yet — add once the dev server is confirmed
- No MCP servers configured yet (add Supabase, Sentry as needed)
- GitHub Action for auto-updating CLAUDE.md from `@.claude` PR comments not yet wired up
