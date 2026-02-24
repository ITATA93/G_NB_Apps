# Minimum App Documentation Checklist

> Every app under `Apps/` MUST have these files. Use `Apps/_APP_TEMPLATE/` as reference.

## Required Files

| File | Purpose | Template |
|------|---------|----------|
| `README.md` | App overview, structure, deploy instructions | _APP_TEMPLATE/README.md |
| `CHANGELOG.md` | Version history (Keep a Changelog format) | _APP_TEMPLATE/CHANGELOG.md |
| `STATUS.md` | Current phase, progress metrics | _APP_TEMPLATE/STATUS.md |
| `.env.example` | Environment configuration template | _APP_TEMPLATE/.env.example |
| `BD/` | At least one data model document | _APP_TEMPLATE/BD/ |

## Recommended Files

| File | Purpose |
|------|---------|
| `PROMPT_*.md` | Functional specification document |
| `docs/DISEÑO-UI.md` | UI design document |
| `docs/ARQUITECTURA.md` | Architecture document |
| `scripts/README.md` | Script catalog |
| `planificacion/PLAN-IMPLEMENTACION.md` | Implementation plan |

## Compliance Status

| App | README | CHANGELOG | STATUS | .env.example | BD/ |
|-----|--------|-----------|--------|--------------|-----|
| UGCO | OK | OK | - | OK | OK |
| ENTREGA | OK | OK | OK | OK | - |
| AGENDA | OK | OK | OK | OK | OK |
| BUHO | OK | OK | OK | OK | OK |
