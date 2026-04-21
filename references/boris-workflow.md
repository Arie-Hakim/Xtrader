# How Boris Cherny Uses Claude Code

> Boris Cherny is the creator and Head of Claude Code at Anthropic.
> Sources: howborisusesclaudecode.com, Threads (@boris_cherny), Pragmatic Engineer interview, InfoQ, PushToProd, MindWired, XDA.
> Last updated: 2026-04-20

---

## 1. Parallel Sessions & Terminal Architecture

### What Boris does

- Runs **5 Claude Code instances simultaneously** in his terminal (Ghostty), tabs numbered 1–5
- Runs **5–10 additional sessions on claude.ai/code** in parallel with local ones
- Starts mobile sessions from the **Claude iOS app** throughout the day and checks in on them later
- Each local session runs in its **own git checkout** (or git worktree) of the same repo — never shared branches — to prevent conflicts
- Uses **iTerm2 system notifications** so he knows the moment any Claude needs input
- Hands off local sessions to web using the `&` command; moves between local↔web with `--teleport`
- ~10–20% of sessions are abandoned due to unexpected scenarios — that's normal and expected
- Total live sessions at any time: **10–15**

### How to apply this

1. Open 5 terminal tabs, number them. Run `git worktree add .claude/worktrees/session-N origin/main` for each.
2. Enable iTerm2 notifications: Settings → Profiles → Terminal → "Send notification on output" (or see Claude docs on terminal notifications).
3. Don't wait for one session to finish before starting the next. Assign independent tasks to each tab.
4. Use `claude --name "task-description"` so tabs are easy to identify.
5. Accept that some sessions will be abandoned — don't over-invest in salvaging a bad thread.

```bash
# Set up 5 worktrees
for i in 1 2 3 4 5; do
  git worktree add .claude/worktrees/session-$i origin/main
done
```

---

## 2. Model Choice

### What Boris does

- Uses **Opus with thinking mode for everything** — no exceptions for "simple" tasks
- Sets effort to **"High"** for most work; **"Max"** for complex debugging
- His reasoning: _"It's the best coding model I've ever used. Even though it's bigger & slower than Sonnet, since you have to steer it less and it's better at tool use, it is almost always faster than using a smaller model in the end."_
- The parallel session architecture absorbs the latency — while one Opus instance thinks, 4 others are running

### How to apply this

- Switch your default model to Opus with thinking. The slowness is a non-issue when you're running 5 parallel sessions.
- Use the `/effort` slash command to dial up to Max when debugging hard problems.
- Don't downgrade to Sonnet to "save time" — you'll spend that time re-steering.

---

## 3. Plan Mode

### What Boris does

- **Every PR-level task starts in Plan Mode** (activated with Shift+Tab twice)
- Iterates back and forth with Claude on the plan until he is satisfied
- Only then switches to **auto-accept edits mode** — Claude executes the full implementation in one shot
- Quote: _"A good plan is really important to avoid issues down the line."_
- Sessions **auto-name themselves** after Plan mode exits, based on the task description
- For complex sessions: uses the prompting pattern _"Grill me on these changes and don't make a PR until I pass your test"_ before exiting plan mode

### How to apply this

1. For any non-trivial task: Shift+Tab twice → Plan mode.
2. Push back on the plan. Ask "What could go wrong?" Ask "Is there a simpler approach?"
3. Only after the plan feels solid: switch to auto-accept and let Claude run.
4. If the implementation goes sideways, use `/rewind` to drop the failed attempt and return to the plan — do NOT use `/compact` to push through.
5. After a mediocre fix: _"Knowing everything you know now, scrap this and implement the elegant solution."_

---

## 4. CLAUDE.md

### What Boris does

- Team maintains a **single shared CLAUDE.md checked into git** — everyone reads the same file
- Current size: **~2,500–4,000 tokens** for team usage
- Updated **multiple times per week** by the whole team
- Core principle: _"Anytime we see Claude do something incorrectly, we add it to the CLAUDE.md so Claude knows not to do it next time."_
- During code reviews, teammates are tagged with `@.claude` to preserve learnings
- A **GitHub Action automates CLAUDE.md updates** from PR comments tagged with `@.claude`
- Individual `CLAUDE.md` can import or point to the shared team version

**Example rules in Boris's team CLAUDE.md:**

```markdown
- Always use `bun`, not `npm` or `yarn`
- Never use TypeScript enums; prefer literal union types
- Never use `interface` where `type` suffices
- PR template: [link to template]
- Run tests with: bun test
- CI command: bun run ci
- Style conventions: [link to style guide]
```

### How to apply this

1. Create `.claude/CLAUDE.md` in your repo root and commit it.
2. Every time Claude makes a mistake you have to correct, add a rule to CLAUDE.md immediately.
3. Add your standard toolchain commands (`bun`, `pytest`, `go test ./...`), test commands, and PR template.
4. Keep it under 4k tokens — it loads on every session; bloated files degrade performance.
5. Treat it as a living document, not a one-time setup.

---

## 5. Slash Commands

### What Boris does

- Uses slash commands for **every workflow done multiple times a day** — avoids re-prompting
- Commands stored in **`.claude/commands/`**, checked into git, shared team-wide
- Commands can include **inline Bash** to pre-compute information (e.g., `git status`) before Claude sees it — avoids extra model round-trips
- Claude itself invokes these commands as part of larger workflows

**Boris's key slash commands:**

| Command           | Purpose                                                 | Frequency              |
| ----------------- | ------------------------------------------------------- | ---------------------- |
| `/commit-push-pr` | Stage, commit, push, open PR                            | Dozens of times/day    |
| `/simplify`       | Parallel agents review and clean up code                | Every PR               |
| `/go`             | Composite: verify → simplify → PR                       | Daily                  |
| `/batch`          | Run the same task across dozens of agents in parallel   | Migrations             |
| `/loop`           | Schedule recurring task (up to 3 days)                  | Ongoing tasks          |
| `/btw`            | Side-chain a question without derailing current session | Frequently             |
| `/effort`         | Set reasoning depth: low / medium / high / max          | Per-task               |
| `/permissions`    | Pre-allow safe bash commands                            | Session setup          |
| `/voice`          | Enable voice dictation input                            | Mobile/on-the-go       |
| `/color`          | Color-code terminal tab for visual identification       | Multi-session          |
| `/branch`         | Fork the current conversation                           | Exploring alternatives |
| `/compact`        | Lossy LLM context compression                           | Long sessions          |
| `/rewind`         | Drop last failed attempt, restore prior state           | Recovery               |
| `/clear`          | Reset context with a custom brief                       | Fresh start            |
| `/focus`          | Show only final results, hide intermediate steps        | Clean output           |
| `/statusline`     | Show model, directory, context usage, cost              | Always-on              |
| `/memory`         | Persist learnings between sessions                      | Ongoing                |

### How to apply this

1. Create `.claude/commands/` in your repo.
2. Start with `/commit-push-pr` — this alone saves massive repetition.
3. Add inline bash to commands: pre-compute `git status`, `git log --oneline -5`, etc. so Claude has context without burning a turn.
4. Check commands into git — your whole team inherits the workflow.
5. Build a `/go` command that chains your most common post-coding steps.

**Example `/commit-push-pr` command structure:**

```markdown
Current git status:
$(git status --short)

Recent commits:
$(git log --oneline -5)

Stage all changes, write a conventional commit message, push to origin, and open a PR.
Use the team PR template from CLAUDE.md.
```

---

## 6. Hooks Configuration

### What Boris does

- Primary hook: **PostToolUse formatter** — auto-formats code after every Write or Edit
  ```json
  {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "bun run format || true" }]
      }
    ]
  }
  ```
  Rationale: Claude produces well-formatted code ~90% of the time, but the hook catches the other 10% before CI fails.

**Full hook inventory Boris configures:**

| Hook                | Trigger             | Purpose                                          |
| ------------------- | ------------------- | ------------------------------------------------ |
| `PostToolUse`       | Write or Edit       | Auto-format code                                 |
| `SessionStart`      | Session opens       | Load dynamic context                             |
| `PreToolUse`        | Bash commands       | Log all shell commands                           |
| `PermissionRequest` | Sensitive operation | Route approval to Slack/WhatsApp                 |
| `Stop`              | Claude finishes     | Trigger notification or nudge Claude to continue |
| `PostCompact`       | Context compresses  | Re-inject key context after compression          |

### How to apply this

1. Add the PostToolUse formatter as your first hook — it's pure upside.
2. Use `|| true` at the end of hook commands so a formatter crash doesn't block Claude.
3. Wire `Stop` hooks to a Slack or desktop notification so you can walk away from long-running sessions.
4. Use `PermissionRequest` hooks to route sensitive operations to your phone rather than leaving Claude blocked.

**Minimal starter hooks config (`.claude/settings.json`):**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "bun run format || true" }]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "notify-send 'Claude done' 'Session complete' || true"
          }
        ]
      }
    ]
  }
}
```

---

## 7. Permissions Management

### What Boris does

- **Never uses `--dangerously-skip-permissions`** for regular work — only for long-running sandboxed tasks
- Pre-allows common safe commands via `/permissions` → stored in `.claude/settings.json` → checked into git
- Team shares the same permissions file

**Boris's permission allowlist examples:**

```json
{
  "permissions": {
    "allow": [
      "Bash(bun run *)",
      "Bash(bun test *)",
      "Bash(bun run build:*)",
      "Bash(bun run test:*)",
      "Bash(gh pr *)",
      "Bash(gh pr checks:*)",
      "Bash(bq query:*)",
      "Edit(/docs/**)",
      "Bash(git *)"
    ]
  }
}
```

- Wildcard syntax is supported: `Bash(bun run *)` covers all bun scripts
- Risky operations (infra changes, deploys, external API calls) are NOT pre-allowed — Claude prompts for approval

### How to apply this

1. Run `/permissions` in a Claude session and pre-allow your standard toolchain commands.
2. Check `.claude/settings.json` into git so teammates don't get interrupted by permission prompts.
3. Use wildcards aggressively for build/test commands: `Bash(npm run *)`, `Bash(pytest *)`, etc.
4. Leave infra-touching commands unapproved — the friction is the point.

---

## 8. Verification Loops

### What Boris does

- **#1 tip**: _"Give Claude a way to verify its work. If Claude has that feedback loop, it will 2–3x the quality of the final result."_
- Claude tests **every single change** before it lands to claude.ai/code
- Verification is domain-specific:
  - **Backend**: Claude starts the service and runs end-to-end tests
  - **Frontend**: Claude uses the **Claude Chrome extension** to open a browser, navigate the UI, and iterate until UX feels right
  - **Desktop apps**: Claude uses computer use capabilities
  - **General**: runs test suite + CI commands

### How to apply this

1. In your CLAUDE.md, include the exact commands to run your test suite and start your dev server.
2. Tell Claude explicitly: _"Before making a PR, run `bun test` and fix any failures."_
3. For frontend work: install the Claude Chrome extension and tell Claude to test the UI in the browser.
4. Build a `/verify-app` slash command that runs your full verification suite.
5. Never ship a PR from Claude that hasn't run through at least a test suite.

---

## 9. Subagent Architecture

### What Boris does

- Treats Claude as a **delegated engineer**, not a pair programmer — gives full context upfront (goal + constraints + acceptance criteria) in the first turn
- Common subagents run automatically as part of slash commands:

| Subagent          | Role                                                      |
| ----------------- | --------------------------------------------------------- |
| `code-simplifier` | Post-completion cleanup — finds redundancy and complexity |
| `verify-app`      | End-to-end testing with browser/simulator                 |
| `code-architect`  | Design review before implementation                       |
| `code-review`     | Hunts bugs on every PR, posts inline comments to GitHub   |
| `build-validator` | Validates build succeeds before PR                        |
| `oncall-guide`    | Incident response runbooks                                |

- For migrations: uses `/batch` to spawn **dozens of agents in parallel** across isolated worktrees
- Before PR automation: Boris used to track repeated code review comments in a spreadsheet — once a pattern hit 3–4 occurrences, he'd automate it. Same philosophy applied to subagents.

### How to apply this

1. After Claude finishes a task, run a `code-simplifier` agent on the result before opening the PR.
2. On every PR, run a `code-review` agent to find bugs — this is what lets Boris ship 20–30 PRs/day with confidence.
3. Think in terms of automating repeated review comments → slash commands → subagents.

---

## 10. Context Window Management

### What Boris does

- Uses the **1M token context window**
- Sets **auto-compact threshold at 400,000 tokens** — avoids "context rot" above 300–400k
- When a thread goes wrong: uses **`/rewind`** to drop failed attempts and restore prior state — does NOT use `/compact` to push through bad paths
- `/compact` is for long, healthy sessions that need to continue — not for recovering from mistakes

### How to apply this

- Set auto-compact in settings to trigger at 400k tokens.
- If Claude starts going in circles or makes a bad decision: `/rewind`, not `/compact`.
- Start a fresh session (`/clear`) for genuinely new tasks — don't drag old context in.

---

## 11. MCP Servers

### What Boris does

- Configured MCPs checked into git and shared team-wide:
  - **Slack**: search and post messages
  - **BigQuery**: query execution (skips writing SQL entirely — just asks Claude)
  - **Sentry**: retrieve error logs for debugging

### How to apply this

- Wire up the data sources your team touches daily (databases, error tracking, Slack).
- Check MCP configs into `.claude/settings.json` so the whole team shares them.

---

## 12. Production Metrics

| Metric                          | Value                                    |
| ------------------------------- | ---------------------------------------- |
| PRs shipped per day             | **20–30 PRs**                            |
| Parallel local sessions         | **5**                                    |
| Parallel web sessions           | **5–10**                                 |
| Total live sessions             | **10–15**                                |
| Verification quality multiplier | **2–3x** with feedback loop              |
| Session abandonment rate        | **~10–20%** (normal)                     |
| CLAUDE.md size (team)           | **~2,500–4,000 tokens**                  |
| Code output per engineer        | **+200% annually** (Anthropic internal)  |
| Context sweet spot              | **below 400k tokens**                    |
| Time compression vs sequential  | **5 hours → 1–2 hours** with parallelism |

---

## 13. Terminal & Environment Setup

### What Boris does

- Terminal: **Ghostty** (synchronized rendering, 24-bit color, unicode)
- Notifications: **iTerm2 system notifications** for session completion
- Status bar: `/statusline` showing model name, working directory, context usage, cost
- Tabs: color-coded with `/color` command; named worktrees (e.g., `za`, `zb`, `zc`)
- Voice input: double-tap function key on macOS → more detailed prompts because speaking is faster than typing
- Desktop app: used specifically for **web server / browser testing** workflows

---

## 14. Advanced Patterns

### Session forking

`/branch` creates a conversation branch — the original session is resumable via its session ID. Use this to explore two implementation approaches without losing either.

### Long-running tasks

- `--permission-mode=dontAsk` for fully sandboxed long-running tasks
- `Stop` hook triggers Slack/WhatsApp notification when done
- `/loop` for tasks that need to recur over hours or days

### Multi-repo access

`--add-dir` grants Claude visibility and permissions across multiple repositories in a single session.

### Team config distribution

- `.claude/settings.json` (permissions, hooks, MCP) → checked into git
- `.claude/commands/` (slash commands) → checked into git
- `CLAUDE.md` (rules, conventions) → checked into git
- Individual `~/.claude/` (personal preferences) → not shared

---

---

# CHEAT SHEET

```
┌─────────────────────────────────────────────────────────────────┐
│              BORIS CHERNY'S CLAUDE CODE CHEAT SHEET             │
├─────────────────────────────────────────────────────────────────┤
│  SESSIONS     5 local terminals + 5-10 web + mobile             │
│               Each tab = its own git worktree                   │
│               iTerm2 notifications for async work               │
│                                                                 │
│  MODEL        Opus + thinking, always                           │
│               Effort: High (default) / Max (hard bugs)          │
│                                                                 │
│  EVERY TASK   Shift+Tab ×2 → Plan Mode                         │
│               Iterate plan → Auto-accept → One-shot impl        │
│               If broken: /rewind (not /compact)                 │
│                                                                 │
│  CLAUDE.md    Shared, git-committed                             │
│               Add a rule every time Claude makes a mistake      │
│               Keep under 4k tokens                              │
│                                                                 │
│  SLASH CMDS   /commit-push-pr  — daily workhorse                │
│               /simplify        — run after every PR             │
│               /go              — verify→simplify→PR             │
│               /verify-app      — browser/e2e testing            │
│               /effort max      — for hard debugging             │
│               /rewind          — drop bad attempts              │
│                                                                 │
│  HOOKS        PostToolUse: "bun run format || true"             │
│               Stop: send Slack/desktop notification             │
│                                                                 │
│  PERMISSIONS  Allowlist in .claude/settings.json                │
│               Bash(bun run *), Bash(gh pr *), Edit(/docs/**)    │
│               NEVER --dangerously-skip-permissions              │
│                                                                 │
│  VERIFY       #1 TIP: give Claude a feedback loop = 2-3x qual  │
│               Backend: run service + e2e tests                  │
│               Frontend: Claude Chrome extension                 │
│                                                                 │
│  CONTEXT      Auto-compact at 400k tokens                       │
│               Sweet spot: below 300-400k                        │
│                                                                 │
│  METRICS      20-30 PRs/day  |  5hr task → 1-2hr parallel      │
│               +200% code output per engineer annually           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sources

- [How Boris Uses Claude Code](https://howborisusesclaudecode.com/) — primary source, 87 tips
- [Boris's Threads post (original)](https://www.threads.com/@boris_cherny/post/DTBVlMIkpcm/) — the post that started it all
- [Boris's Threads: 5 terminals](https://www.threads.com/@boris_cherny/post/DTBVlq0kobo/)
- [Boris's Threads: web sessions](https://www.threads.com/@boris_cherny/post/DTBVmoKkkpR/)
- [Pragmatic Engineer: Building Claude Code with Boris Cherny](https://newsletter.pragmaticengineer.com/p/building-claude-code-with-boris-cherny)
- [InfoQ: Inside the Development Workflow of Claude Code's Creator](https://www.infoq.com/news/2026/01/claude-code-creator-workflow/)
- [PushToProd: How the Creator of Claude Code Actually Uses Claude Code](https://getpushtoprod.substack.com/p/how-the-creator-of-claude-code-actually)
- [MindWired: How the Creator of Claude Code Uses It](https://mindwiredai.com/2026/04/14/claude-code-creator-workflow-boris-cherny/)
- [XDA: I set up Claude Code the way its creator does](https://www.xda-developers.com/set-up-claude-code-like-boris-cherny/)
- [VentureBeat: The creator of Claude Code just revealed his workflow](https://venturebeat.com/technology/the-creator-of-claude-code-just-revealed-his-workflow-and-developers-are)
