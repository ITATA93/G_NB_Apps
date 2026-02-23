# Audit — Normalization AG_NB_Apps
> Date: 2026-02-18 | Reference: AG_Plantilla

---

## Infraestructura

| Item | Estado | Notas |
|------|--------|-------|
| GEMINI.md en raíz | ✅ SI | Adaptado al dominio NocoBase/Hospital |
| CLAUDE.md en raíz | ✅ SI | Configurado para NocoBase platform |
| README.md | ✅ SI | Actualizado (v2.4.0, 2026-02-17) |
| CHANGELOG.md | ✅ SI | Historia completa desde v1.0.0 |
| docs/TASKS.md | ✅ SI | Formato unified (Local/Incoming/Outgoing/Completed) |
| docs/DEVLOG.md | ✅ SI | Última entrada: 2026-02-16 |
| docs/standards/output_governance.md | ✅ SI | Presente |
| .gitignore | ✅ SI | Protege .env, credentials, .claude/logs |

## Agentes

| Item | Estado | Notas |
|------|--------|-------|
| .subagents/manifest.json | ✅ SI | 7 agentes definidos (v3.0) |
| .subagents/dispatch.sh | ✅ SI | Presente |
| .subagents/dispatch.ps1 | ❌ NO | Falta dispatcher PowerShell |

### Agentes definidos:
| Agente | Vendor | Estado |
|--------|--------|--------|
| code-analyst | gemini | ✅ Configurado |
| doc-writer | gemini | ✅ Configurado |
| code-reviewer | claude | ✅ Configurado |
| test-writer | gemini | ✅ Configurado |
| db-analyst | claude | ✅ Configurado |
| deployer | gemini | ✅ Configurado |
| researcher | codex | ✅ Configurado |

## Skills

### Claude (.claude/skills/) — 15 skills
| Skill | Clasificación |
|-------|---------------|
| nocobase-charts | RELEVANTE |
| nocobase-db-collections | RELEVANTE |
| nocobase-db-datasources | RELEVANTE |
| nocobase-db-fields | RELEVANTE |
| nocobase-db-relationships | RELEVANTE |
| nocobase-db-views | RELEVANTE |
| nocobase-menu-organization | RELEVANTE |
| nocobase-page-create | RELEVANTE |
| nocobase-page-delete | RELEVANTE |
| nocobase-page-list | RELEVANTE |
| nocobase-page-verify | RELEVANTE |
| nocobase-permissions | RELEVANTE |
| nocobase-system | RELEVANTE |
| nocobase-ui-blocks | RELEVANTE |
| nocobase-workflows | RELEVANTE |

> **Todas 15 skills son domain-specific para NocoBase.** Ninguna es genérica ni requiere archivado.

### .claude/commands/ — 0 archivos
No existe directorio commands.

### .claude/internal-agents/ — 0 archivos
No existe directorio internal-agents.

### Gemini (.gemini/skills/) — ❌ NO EXISTE
Directorio faltante.

### .agent/skills/ — 1 skill
| Skill | Clasificación |
|-------|---------------|
| nocobase-app-builder | RELEVANTE |

## Workflows

### .agent/workflows/ — 6 archivos
| Workflow | Descripción | Funcional |
|----------|-------------|-----------|
| 10_nocobase_intake.md | Intake para NocoBase | ✅ Tiene frontmatter |
| 11_nocobase_generate_spec.md | Generar spec YAML | ✅ Tiene frontmatter |
| 12_nocobase_configure_ui.md | Configurar UI | ✅ Tiene frontmatter |
| 13_nocobase_configure_api.md | Configurar API | ✅ Tiene frontmatter |
| 14_nocobase_audit.md | Auditar NocoBase | ✅ Tiene frontmatter |
| 15_nocobase_seed_data.md | Seed data | ✅ Tiene frontmatter |

> Falta: `turbo-ops.md` (estándar AG_Plantilla)

## Memoria y Config

| Item | Estado | Notas |
|------|--------|-------|
| .gemini/brain/ | ✅ SI | Directorio existe |
| .gemini/settings.json | ❌ NO | Falta configuración Gemini |
| .claude/settings.json | ✅ SI | Configuración completa (v2.0.0) |
| .claude/settings.local.json | ✅ SI | Permisos bash configurados |
| .claude/mcp.json | ❌ NO | No encontrado |

## Seguridad

| Item | Estado | Notas |
|------|--------|-------|
| Credenciales hardcodeadas | ✅ LIMPIO | Todos usan process.env |
| .env.example | ✅ SI | Presente con placeholders |
| .gitignore cubre .env | ✅ SI | .env, credentials, secrets cubiertos |
| Passwords en backups | ⚠️ NOTA | `***REDACTED***` en backups (correcto) |

---

## Resumen Pre-Normalización

| Categoría | Estado | Score (0-10) |
|-----------|--------|:------------:|
| Infraestructura (archivos raíz) | ✅ Completa | 10 |
| Documentación | ✅ Actualizada | 9 |
| Agentes (.subagents/) | ✅ 7/7 configurados | 9 |
| Claude Skills | ✅ 15/15 RELEVANT | 10 |
| Gemini Skills | ❌ No existen | 0 |
| .agent Skills | ✅ 1 relevant | 8 |
| Workflows | ✅ 6 funcionales, falta turbo-ops | 8 |
| Memoria/Config | ⚠️ Falta .gemini/settings.json | 6 |
| Seguridad | ✅ Clean | 10 |
| Tareas pendientes | ⚠️ 2 PENDING en TASKS.md | 7 |

**Score Total Pre-Normalización: 77/100**

---

## Acciones de Normalización Ejecutadas

1. ✅ Created `.gemini/settings.json` — Gemini CLI configuration from AG_Plantilla template
2. ✅ Created `.gemini/skills/nocobase-api-management.md` — Domain-specific Gemini skill
3. ✅ Created `.agent/workflows/turbo-ops.md` — Standard turbo-ops from AG_Plantilla
4. ✅ Evaluated all 15 Claude skills → ALL RELEVANT (NocoBase domain-specific)
5. ✅ Evaluated all 7 agents → ALL configured and relevant
6. ✅ Verified 6 NocoBase workflows → ALL functional with frontmatter
7. ✅ Completed 2 PENDING tasks in `docs/TASKS.md` → DONE
8. ✅ Updated `docs/DEVLOG.md` with normalization session entry
9. ✅ Security scan clean — no hardcoded credentials

---

## Resumen Post-Normalización

| Categoría | Antes | Después | Delta |
|-----------|:-----:|:-------:|:-----:|
| Infraestructura | 10 | 10 | 0 |
| Documentación | 9 | 10 | +1 |
| Agentes | 9 | 9 | 0 |
| Claude Skills | 10 | 10 | 0 |
| Gemini Skills | 0 | 8 | +8 |
| .agent Skills | 8 | 8 | 0 |
| Workflows | 8 | 10 | +2 |
| Memoria/Config | 6 | 9 | +3 |
| Seguridad | 10 | 10 | 0 |
| Tareas pendientes | 7 | 10 | +3 |

**Score Total Post-Normalización: 94/100 (Δ +17)**
