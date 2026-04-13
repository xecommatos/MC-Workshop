# AI Coding: Programador Amplificado — Workshop

## What This Is

A 60-minute live demo workshop for UMinho CS students. The thesis: spec quality determines code security. The same AI model produces vulnerable or secure code depending on the spec it receives.

## App: Confissões UMinho

Anonymous confession board — submit, browse, search, and moderate confessions. Built with Node.js + Express + SQLite + EJS on localhost:3000.

## Workshop Commands

Three project commands drive the demo pipeline:

| Command | What It Does |
|---|---|
| `/project:spec-generator` | Reads `user-stories.md`, produces `spec-v1.md` (junior-style, no security) |
| `/project:code-generator spec-v1.md` | Implements app from spec — YAGNI, no extras |
| `/project:spec-validator spec-v1.md` | Security review of spec, produces `spec-v2.md` |

### Full pipeline

```
/project:spec-generator                → spec-v1.md
/project:code-generator spec-v1.md     → vulnerable app
/project:spec-validator spec-v1.md     → spec-v2.md
/project:code-generator spec-v2.md     → secure app
```

## Stack

- Node.js + Express
- SQLite (better-sqlite3)
- EJS templates
- Port 3000, localhost only

## Key Files

- `user-stories.md` — input user stories (deliberately missing security requirements)
- `workshop-design.md` — full workshop narrative and run-of-show
- `docs/superpowers/specs/` — design specs
- `.claude/commands/` — the three project commands
