# CLAUDE.md — G_NB_Apps

## Identity
This is **G_NB_Apps** — satellite project under the Antigravity ecosystem.
Domain: `02_HOSPITAL_PUBLICO` | Orchestrator: GEN_OS | Prefix: `G_`

Aplicaciones NocoBase — MIRA (gestion clinica), Agenda, Oncologia (UGCO), Entrega, BUHO.

## Rules
1. Follow the governance standards defined in `docs/standards/`.
2. All scripts must be registered in `docs/library/scripts.md`.
3. Update CHANGELOG.md and DEVLOG.md with significant changes.
4. Cross-reference integrity: check `impacts:` frontmatter before finalizing edits.

## Regla de Consistencia Cruzada
Antes de finalizar cualquier edicion a un archivo que contenga frontmatter `impacts:`,
DEBES leer cada archivo listado en `impacts` y verificar que las referencias cruzadas
sigan siendo correctas. Si no lo son, corrigelas en el mismo commit/sesion.

## Project Structure
```
G_NB_Apps/
  .claude/          # Claude Code commands, agents, skills, MCP
  .gemini/          # Gemini CLI agents, rules, workflows
  .codex/           # Codex CLI agents, skills
  .agent/           # Agent rules and workflows
  .subagents/       # Dispatch scripts, manifest v3.1, skills
  .github/          # GitHub Actions workflows
  Apps/             # Application implementations (UGCO, AGENDA, BUHO, ENTREGA)
  app-spec/         # Application specification (app.yaml blueprint)
  shared/           # Transversal scripts (TypeScript, Python)
  docs/             # Documentation
    standards/      # Governance standards
    library/        # Living dictionary (scripts.md)
    audit/          # Audit reports (AG-AUDIT-STD v1.0)
    research/       # Research artifacts
    guides/         # User guides and checklists
    specs/          # Technical specifications
    reports/        # Test and validation reports
    plans/          # Implementation plans (max 5 active)
    decisions/      # Architecture Decision Records
  scripts/          # Automation scripts
    setup/          # Environment bootstrap scripts
```

## Available Commands

| Command            | Description                                |
| ------------------ | ------------------------------------------ |
| `/help`            | Show help and user guide                   |
| `/project-status`  | Project health overview                    |
| `/quick-review`    | Fast code review of recent changes         |
| `/team-review`     | Parallel review (code + tests + docs)      |
| `/create-tests`    | Generate unit tests                        |
| `/update-docs`     | Sync documentation                         |
| `/insights-review` | Run usage insights analysis                |

## Sub-Agents

```bash
# Dispatch single agent
bash .subagents/dispatch.sh <agent-id> "prompt"

# Dispatch team
bash .subagents/dispatch-team.sh <team-id> "prompt"
```

Available agents: `researcher`, `code-reviewer`, `code-analyst`, `doc-writer`,
`test-writer`, `db-analyst`, `deployer`, `ui-designer`

Available teams: `full-review`, `feature-pipeline`, `deep-audit`, `rapid-fix`,
`full-audit`, `code-and-review`, `research-and-document`, `adversarial-review`,
`design-and-deploy`, `full-app-pipeline`

## NocoBase Skills

16 domain-specific skills available via `.claude/skills/`:

- **Database**: collections, fields, relationships, datasources, views
- **Automation**: workflows, charts
- **UI**: blocks, menu-organization, page-list/create/delete/verify
- **System**: permissions, system info, API management

## Output Governance

- NEVER create files in project root
- Append session logs to `docs/DEVLOG.md`
- Update tasks in `docs/TODO.md`
- Reports go to `docs/audit/`, plans to `docs/plans/`, research to `docs/research/`
