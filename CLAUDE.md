# XTrader – Claude Code Instructions

## MUST READ FIRST
Before ANY task, read `specs/XTrader_Spec_v3_Final.docx` for full context.

## Project Overview
XTrader is a Hebrew-first deep learning platform for X analysts.
Learns each analyst's DNA, extracts Insights from tweets,
and lets users check if stocks fit an analyst's methodology.

## Core Principles (NEVER violate)
1. Separation of Concerns: Parser extracts only – never computes scores
2. Insight is atomic: Every tweet → structured JSON
3. Type-aware: trader-scalp/swing/position, investor, macro, mixed
4. Transparency: Always preserve original tweet URL
5. Hebrew RTL: All user-facing strings in Hebrew

## Tech Stack
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express
- DB: PostgreSQL via Supabase
- AI for tweets: Grok 4.1 Fast (Batches API)
- AI for DNA/Reports: Claude Sonnet

## Critical Rules
- Learn from 500-1000 tweets per analyst
- Fetcher runs once/day OR manual trigger
- DNA Builder runs ONLY when: new analyst / 50+ new tweets / manual
- All sensitive keys in .env (never commit)

## Workflow for every task
1. Read relevant section in specs/
2. Show plan before writing code
3. Implement step by step
4. Commit with clear message
