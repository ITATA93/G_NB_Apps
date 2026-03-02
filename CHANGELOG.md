---
depends_on: []
impacts: []
---

# Changelog — G_NB_Apps

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **ENTREGA Workflows** (3 scripts en `Apps/ENTREGA/workflows/`):
  - `sync_censo_alma.ts` — workflow schedule (cron 30min) para sincronizar censo desde ALMA/TrakCare a et_pacientes_censo
  - `crear_entrega_turno.ts` — workflow collection (on create et_turnos) que auto-genera registros de entrega por paciente
  - `firmar_cerrar_entrega.ts` — workflow collection (on update et_turnos) que verifica ambas firmas y cierra la entrega
- **AGENDA Workflows** (3 scripts en `Apps/AGENDA/workflows/`):
  - `calcular_duracion.ts` — workflow collection (on create/update ag_bloques_agenda) que auto-calcula duracion en minutos
  - `resumen_diario.ts` — workflow schedule (cron 20:00) que consolida bloques del dia en ag_resumen_diario
  - `resumen_semanal.ts` — workflow schedule (domingos 21:00) que genera resumen semanal por funcionario
- **AGENDA Permisos** (`Apps/AGENDA/workflows/permisos_roles.ts`): configura permisos por recurso para 3 roles (medico_agenda, jefe_servicio_agenda, admin_agenda) en 8 colecciones AGENDA
- **Oncologia Pages** (4 deploy scripts en `Apps/Oncologia/pages/`):
  - `deploy-onco-casos-page.ts` — pagina con tabla onco_casos + markdown header + filtros + export
  - `deploy-onco-episodios-page.ts` — pagina con tabla onco_episodios
  - `deploy-onco-comite-sesiones-page.ts` — pagina con tabla onco_comite_sesiones
  - `deploy-onco-comite-casos-page.ts` — pagina con tabla onco_comite_casos
- **ETL Script** (`shared/scripts/sync_entrega_turno.py`): script Python ETL (Extract-Transform-Load) para sincronizar censo ALMA a NocoBase, con soporte --dry-run, --service, modo mock
- **Role Rename** (`scripts/rename_role_cirujano.ts`): migra rol r_gd0z1pmdmii a cirujano_residente con permisos y usuarios
- **FK Naming Audit** (`scripts/fix_fk_naming.ts`): audita inconsistencias camelCase vs snake_case en FK de schedule_blocks y colecciones relacionadas
- **ESLint Batch Fix** (`scripts/fix_eslint.sh`): ejecuta ESLint --fix en todos los directorios de scripts con reporte pre/post
- **Temp Cleanup** (`scripts/cleanup_temp.sh`): identifica y opcionalmente elimina/archiva 20 archivos temporales (stubs + diagnosticos)
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

- `GEMINI.md`: consolidado con contenido relevante de CONTEXT_GEMINI_3.0.md — ahora incluye apps activas, estructura detallada, herramientas CLI
- `CONTEXT_GEMINI_3.0.md`: marcado como DEPRECATED (contenido consolidado en GEMINI.md)
- `docs/TODO.md`: 11 items pendientes marcados como completados (0 items en backlog)
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
