---
depends_on: []
impacts: []
---

# Changelog — G_NB_Apps

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **UGCO Full Implementation (v2.0)**: Aplicacion de oncologia completamente desplegada en produccion
  - 45+ colecciones desplegadas (27 REF, 3 ALMA, 11 core, 4 secundarias)
  - 95 registros de datos de referencia cargados en 12 catalogos
  - 19 paginas UI + 2 grupos con bloques de tabla funcionales
  - Dashboard con 5 filas: header MD, KPI tables, charts (Bar+Pie), tablas resumen
  - Pagina de Reportes con 5 tablas exportables (casos, eventos, tareas, comites)
  - 4 workflows activos: auto-codigo, log estados, tarea comite, check diario 8AM
  - 3 roles: medico_oncologo, enfermera_ugco, coordinador_ugco con acceso menu
- Deploy scripts UGCO: `deploy-ugco-schema-mira.ts`, `deploy-ugco-remaining.ts`, `seed-ugco-refs-v2.ts`, `rebuild-ugco-pages.ts`, `create-ugco-workflows.ts`, `configure-ugco-permissions.ts`, `deploy-ugco-dashboard.ts`, `deploy-ugco-reportes.ts`
- `shared/scripts/nocobase-ui-helpers.ts`: Modulo compartido de helpers UI (uid, buildTableBlock, wrapInRow, createPage, findGridUid, field helpers) — elimina duplicacion entre scripts de deploy
- `deploy-ugco-improve.ts`: Agrega 18 campos faltantes en 5 colecciones + expansion de enum tipo_evento (idempotente, soporta --dry-run)
- Clinical Consensus Panel workflow (`.agent/workflows/clinical-consensus-panel.md`): MoE panel with 5 clinical expert roles (Needs Analyst, Domain MD, Health Informatics, Clinical UX, Technical Integrator).
- Clinical App Pipeline workflow (`.agent/workflows/20_clinical_app_pipeline.md`): End-to-end pipeline connecting clinical consensus → HITL → NocoBase intake → spec → configure → audit.
- `run-clinical-consensus.sh` script (`.subagents/`): Executable wrapper that invokes each agent with role-specific clinical prompts and chains output between turns.
- Teams `clinical-consensus` and `clinical-app-pipeline` added to `.subagents/manifest.json` and `AGENTS.md`.

### Changed

- Enhanced README.md with structured sections: Proposito, Arquitectura, Uso con Gemini CLI, Scripts, Configuracion.
- `Apps/UGCO/STATUS.md`: actualizado de Fase 1 (20%) a Fase 8 completada (95%)
- `deploy-ugco-schema-mira.ts`: refactorizado para usar shared ApiClient (fix auth)
- `deploy-ugco-dashboard.ts`: refactorizado para usar shared helpers + flag --discover para descubrimiento dinamico de UID
- `deploy-ugco-reportes.ts`: refactorizado para usar shared helpers + flag --discover + botones de exportacion

### Fixed

- `package.json`: nombre corregido `ag-nb-apps` → `g-nb-apps`, URLs repository/bugs/homepage actualizadas a `G_NB_Apps`.
- `AGENTS.md`: agregado agente `visual-verifier` (faltaba) y team `deploy-and-verify` (faltaba) — ahora 9 agentes y 13 teams alineados con manifest.json.
- `shared/scripts/temp/TEMP_05.ts`: referencia legacy `AG_NB_Apps` → `G_NB_Apps`.
- `docs/TODO.md`: referencia legacy `AG_Consultas` → `G_Consultas`.

## [1.0.0] — 2026-02-23

### Initial Release

- Full GEN_OS mirror infrastructure migrated from AG_NB_Apps.
- Multi-vendor dispatch: .subagents/, .claude/, .codex/, .gemini/, .agent/.
- Governance standards: docs/standards/.
- CI/CD workflows: .github/workflows/.
- All domain content preserved from AG_NB_Apps.
