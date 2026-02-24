---
depends_on: [.subagents/manifest.json]
impacts: [CLAUDE.md]
---

# AGENTS.md — G_NB_Apps

> Manifest version: **3.1** | Domain: `02_HOSPITAL_PUBLICO`

## Subagent Manifest

Agents for this project are defined in `.subagents/manifest.json` (v3.1 schema).
Dispatch via `.subagents/dispatch.sh` (single) or `.subagents/dispatch-team.sh` (team).

## Available Agents

| Agent | Default Vendor | Priority | Scope | Triggers |
| ----- | -------------- | -------- | ----- | -------- |
| researcher | codex | 1 | global | research, investigate, find docs, nocobase docs |
| code-reviewer | claude | 2 | project | review, audit, bugs, security |
| code-analyst | gemini | 3 | project | analyze, explain, architecture |
| doc-writer | gemini | 4 | project | document, README, CHANGELOG |
| test-writer | gemini | 5 | project | test, coverage, vitest, pytest |
| db-analyst | claude | 6 | project | database, SQL, schema, collection |
| deployer | gemini | 7 | project | deploy, docker, CI/CD |
| ui-designer | gemini | 8 | project | design, UI, UX, layout, dashboard, frontend |

## Teams

| Team | Agents | Mode | Use Case |
|------|--------|------|----------|
| full-review | code-reviewer, test-writer, doc-writer | parallel | Pre-merge review |
| feature-pipeline | code-analyst, test-writer, code-reviewer | sequential | TDD pipeline |
| deep-audit | code-reviewer, db-analyst, deployer | parallel | Full-stack audit |
| rapid-fix | code-analyst, code-reviewer | sequential | Quick bug fix |
| full-audit | code-reviewer, code-analyst | sequential | Project audit |
| code-and-review | code-analyst, code-reviewer | sequential | Generate + review |
| research-and-document | researcher, doc-writer | sequential | Research + document |
| adversarial-review | code-analyst, code-reviewer | sequential | Isolated critique |
| design-and-deploy | ui-designer, code-reviewer, deployer | sequential | Design UI → review → deploy |
| full-app-pipeline | db-analyst, ui-designer, test-writer, code-reviewer | sequential | Schema → UI → tests → review |

## Dispatch

```bash
# Single agent
bash .subagents/dispatch.sh <agent-id> "prompt"
bash .subagents/dispatch.sh code-reviewer "Audit the UGCO collections"

# Team
bash .subagents/dispatch-team.sh <team-id> "prompt"
bash .subagents/dispatch-team.sh deep-audit "Full audit of AGENDA app"
```

## Vendor Support

| Vendor | Model | Context | Parallel | Notes |
| ------ | ----- | ------- | -------- | ----- |
| Claude | Opus 4.6 | 1M (beta) | Yes | Agent teams, adaptive thinking |
| Gemini | Pro / Flash | 2M | Yes | Thinking mode, web search |
| Codex | GPT-5.3 | 128K | No | No Task tool, sequential only |
