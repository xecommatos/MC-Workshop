# Workshop Skills Design — "AI Coding: Programador Amplificado"

> **Date:** 2026-04-13
> **Status:** Approved
> **Context:** Three Claude Code project commands for the workshop dry-run and live demo

---

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Skill format | Claude Code project commands (`.claude/commands/`) | Project-specific, invocable via `/project:name` |
| spec-generator hints | Hybrid — persona framing + concrete technical preferences | Balances plausibility with >=80% reproducibility |
| spec-validator persona | Security-focused reviewer | Stays on-message for the workshop's security narrative |
| Spec output format | Prescribed sections + diff-friendly | v1→v2 visually comparable on stage |

---

## Architecture

Three Claude Code project commands in `.claude/commands/`:

| File | Invocation | Input | Output |
|---|---|---|---|
| `spec-generator.md` | `/project:spec-generator` | reads `user-stories.md` | writes `spec-v1.md` |
| `code-generator.md` | `/project:code-generator` | takes spec filename as `$ARGUMENTS` | writes app files |
| `spec-validator.md` | `/project:spec-validator` | takes spec filename as `$ARGUMENTS` | writes `spec-v2.md` |

`code-generator` and `spec-validator` use `$ARGUMENTS` so they're reusable — you feed `spec-v1.md` or `spec-v2.md` to either.

---

## spec-generator — Persona & Strategy

**Persona:** Pragmatic junior engineer who values simplicity and speed. Thinks ORMs are overhead, trusts internal users, and prefers the straightforward approach.

**Technical preferences baked in (the "innocent hints"):**
- "Use string interpolation/template literals for SQL — clearer than query builders"
- "Render user content directly in templates to preserve formatting"
- "Internal-only routes don't need middleware — keep it simple"
- "No authentication in v1 — it's a campus tool, not a bank"

**Output structure (prescribed sections):**
1. Overview
2. Stack & Dependencies
3. Database Schema
4. Endpoints (method, path, behaviour)
5. Templates (what each page shows)
6. Behaviour Notes

No security section. That's the point.

---

## code-generator — Strict Literal Implementation

**Core instruction:** Implement exactly what the spec says. Nothing more, nothing less.

**Key constraints:**
- YAGNI extremo — if the spec doesn't mention it, don't add it
- No input validation unless specified
- No HTML escaping unless specified
- No parameterized queries unless specified
- No auth middleware unless specified
- Use the exact technical approaches the spec recommends
- Produce a single working app (server.js, views/, package.json)

**Stack locked to:** Node.js, Express, SQLite (better-sqlite3), EJS templates, port 3000.

---

## spec-validator — Security Reviewer

**Persona:** Security engineer reviewing a spec before implementation.

**Process:**
1. Read the input spec
2. Identify security gaps (focus on XSS, injection, access control, headers)
3. Produce a new spec with the same section structure
4. Append security requirements as subsections within each relevant section
5. Add a new top-level "Security Requirements" section for cross-cutting concerns (CSP headers, rate limiting)

**Diff-friendly output:** Same headings as input spec. New content clearly marked. On stage, v1 and v2 are visually comparable.

---

## Expected Workshop Flow

```
user-stories.md
      │
      ▼  /project:spec-generator
  spec-v1.md  ──────────────────────┐
      │                             │
      ▼  /project:code-generator    ▼  /project:spec-validator
  app (vulnerable)              spec-v2.md
                                    │
                                    ▼  /project:code-generator
                                app (secure)
```

---

## What Makes Vulnerabilities Reproducible

1. **spec-generator persona** steers toward simple/naive patterns
2. **User stories' pressure features** invite the gaps (HTML formatting, SQL wildcards, no auth)
3. **code-generator's YAGNI rule** means it won't add defenses not in the spec
4. **spec-validator** adds exactly what was missing, producing a contrastable v2
