---
depends_on: []
impacts: []
---

# Changelog — G_NB_Apps

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.7.0] — 2026-03-11

### Added

- **ENTREGA Blueprint Fases 1-4 — Deploy completo en staging** (mira.imedicina.cl)
  - **Fase 1 — Modelo de datos** (`deploy-entrega-phase2-collections.ts`):
    - 4 campos editables en `et_pacientes_censo`: estado_turno, es_aislamiento, requiere_interconsulta, tipo_ingreso
    - 11 campos en `et_turnos`: total_pacientes, total_altas, total_ingresos, total_fallecidos, total_operados, total_evaluaciones, total_interconsultas, distribucion_por_unidad, texto_distribucion, pdf_generado, closed_at
    - 4 nuevas colecciones: `et_tipos_nota`, `et_notas_clinicas`, `et_operaciones_turno`, `et_config_sistema`
    - 9 registros seed en et_tipos_nota + 10 parámetros seed en et_config_sistema
  - **Fase 2 — Roles** (`deploy-entrega-phase2-roles.ts`):
    - 2 roles nuevos: `tens` (read-only censo), `administrativo` (full catalog + config)
    - 11 roles existentes actualizados con permisos en las 4 nuevas colecciones
  - **Fase 3 — Páginas** (`_fix-entrega-pages.ts`):
    - 3 páginas nuevas con schema completo: `🔪 Pabellón`, `📝 Notas Clínicas`, `⚙️ Configuración`
    - Asignadas a roles correctos (8, 11, 3 roles respectivamente)
    - 6 bloques de tabla insertados (`_add-entrega-table-blocks.ts`)
  - **Fase 4 — Workflows** (`deploy-entrega-phase4-workflows.ts`):
    - 4 workflows creados: Ingreso paciente (WF-4), Alta paciente (WF-5), Alerta crítico (WF-6), Alerta larga estancia (WF-7)
    - Nodos de WF-4 y WF-5 configurados con tipo_nota_id correcto (Ingreso=9, Alta=5)
  - ENTREGA cobertura blueprint: 45% → ~80%

### Fixed

- `scripts/_fix-entrega-failed-fields.ts` — 2 campos con tipos no soportados: attachment→text, richText→text

## [1.6.0] — 2026-03-11

### Added

- **ENTREGA Blueprint Reconciliación (Fase 0)** — Reconciliación completa del blueprint v1.0 con infraestructura MIRA existente
  - `Apps/ENTREGA/docs/reconciliacion_blueprint_v2.md` — Mapeo detallado: 10 colecciones et_* existentes vs blueprint propuesto, con 5 decisiones de diseño y plan de brechas
  - `Apps/ENTREGA/docs/strategy_data_sources.md` — Strategy doc: clasificación canónica de campos ALMA (read-only) vs NocoBase (add-on), pipeline ETL Q1→Q13, 6 campos nuevos propuestos
  - **Sección ENTREGA en app.yaml** — ~480 líneas: 10 colecciones con 130+ campos, 11 roles con ACL, 17 UI pages, 3 workflows, state machine et_turnos, 5 business rules
  - 6 campos nuevos propuestos (status: 'proposed'): es_aislamiento, pdf_generado, snapshot_distribucion, texto_distribucion

### Changed

- `app-spec/app.yaml` — Expandido de 2625 a ~3100 líneas con módulo ENTREGA completo (reconciliado con deploy existente)

## [1.5.0] — 2026-03-10

### Added

- **Sistema de Auto-Mejora y Prevencion de Fallos** — Framework de 4 componentes para prevenir recurrencia de los 30+ fallos descubiertos en auditorias
  - `docs/standards/failure-catalog.yaml` — Catalogo machine-readable de 21 fallos con ID, severidad, causa raiz, prevencion y checker asociado
  - `shared/scripts/verify-deploy.ts` — Script de verificacion post-deploy con 10 checkers automatizados (fields, catalogs, routes, workflows, schemas, charts, ghost blocks)
  - `.agent/rules/80_failure_prevention.md` — Regla agentica con 14 constraints obligatorias pre/post-deploy
  - Nivel L0 Automatizado en piramide de verificacion del SKILL.md
  - Gate 15 automatizado en quality gates (regla 70)
  - Paso 9 obligatorio en workflow 12 (configure-ui)

## [1.4.0] — 2026-03-10

### Added

- **Analisis integral produccion** — Auditoria de 12 ejes + 4 transversales para las 4 apps en hospitaldeovalle.cl (`docs/audit/analisis-integral-produccion-2026-03-10.md`)
- **UGCO MANUAL_USUARIO.md** — Manual completo: 8 secciones, 9 roles, 8 flujos paso a paso, 4 automatizaciones, 8 FAQs, 20 terminos glosario
- **UGCO FLUJOS_DE_USO.md** — 7 flujos detallados, modelo ER, validaciones, matriz permisos 9x12
- **UGCO ESTANDARES_CALIDAD.md** — 928 lineas, 124 checklist items, 7 secciones (generales, pagina, datos, seguridad, automatizacion, UX, verificacion)
- **Dashboard UGCO charts** — 3 bloques insertados: Statistic (total casos), Bar (por estado), Pie (por especialidad) via `scripts/add-ugco-dashboard-charts.ts`
- **9 scripts de auditoria** — fix-null-interfaces, seed-empty-catalogs, add-ugco-dashboard-charts, 5 scripts \_audit-\*, \_verify-dashboard-charts
- **Dashboard ENTREGA charts** — 3 bloques insertados: Statistic (total pacientes), Bar (por servicio), Pie (por especialidad) via `scripts/add-entrega-dashboard-charts.ts`
- **UGCO Reportes funcional** — 5 tablas exportables insertadas en pagina Reportes: Casos, Eventos, Tareas, Comites, Casos-Comite via `scripts/deploy-ugco-reportes-prod.ts`
- **BUHO Kanban** — Pagina Kanban Pacientes desplegada, agrupada por estado_plan (Pendiente/En Curso/Listo para Alta). 3 campos convertidos a select: estado_plan, riesgo_detectado, categorizacion

### Fixed

- **224 campos interface=null** — Corregidos en ENTREGA (164), AGENDA (60), BUHO (56) via `scripts/fix-null-interfaces.ts`. Formularios CRUD ahora funcionales en 3 apps
- **7 catalogos vacios** — Poblados con datos de referencia: et_especialidades(8), et_servicios(11), ag_categorias(16), ag_inasistencia(6), ag_servicios(10), buho_camas(69), buho_riesgo(5)

## [1.3.0] — 2026-03-09

### Added

- **AGENDA functional_spec** — 5 user journeys, 12 page specs (con chart_specs, form_specs, drawer sections), 6 business rules, state machine de editabilidad
- **UGCO functional_spec** — 5 user journeys (registro caso, episodios, comite, seguimiento), 9 page specs (casos list, ficha 360 con tabs, comite, dashboard), 2 state machines (onco_casos, comite_sesiones), 5 business rules
- **validate_blueprint.py** — Script de validacion automatica de completitud del blueprint (62 checks, 3 modulos)

### Changed

- **Workflow 10 (intake)** — Agregadas secciones chart_spec, form_spec y patron de paginas repetitivas
- **Workflow 11 (generate-spec)** — Reescrito completo con protocolo de 7 pasos, templates YAML y checklist pre-entrega
- **Workflow 12 (configure-ui)** — Reescrito con tabla de mapeo page_spec -> NocoBase x-component, guia de traduccion bloques, y tabla de errores comunes
- **Regla 50** — functional_spec declarado OBLIGATORIO por modulo; modulo sin fspec no debe desplegarse
- **Regla 70** — Agregado gate de blueprint: validate_blueprint.py debe pasar antes de DoD
- **SKILL.md (nocobase-app-builder)** — Agregada referencia a validate_blueprint.py en paso 1, guia de traduccion workflow 12, seccion "Referencias clave" con links a workflows/reglas/standards
- **ugco-improvement-plan-v1.md** — Estado actualizado de 2026-03-04 a 2026-03-09: P0-P2 completados (95%), criterios de exito marcados, status `mostly-complete`

### Fixed

- Page specs faltantes para admin_staff, admin_departments, sgq_agenda, sgq_activities (ahora todos los page_keys tienen page_spec)

## [1.2.0] — 2026-03-09

### Added

- **BUHO App (v1.0)** — Sistema de hospitalización desplegado en staging (imedicina.cl)
  - 5 colecciones: buho_pacientes (26 campos), buho_camas, buho_alertas, buho_planes_trabajo, buho_parametros_riesgo
  - 3 roles: medico_buho, enfermeria_buho, jefe_servicio_buho
  - 6 páginas con table blocks + 2 sub-grupos (Pacientes, Administración)
  - 2 workflows: clasificar riesgo automáticamente, alertar alta < 2 días
  - 5 pacientes de prueba cargados

- **AGENDA App (v1.0)** — Agenda Médica Hospitalaria desplegada en staging
  - 8 colecciones + 54 campos desplegados
  - 3 roles con permisos: admin_agenda, jefe_servicio_agenda, medico_agenda (24 grants)
  - 9 páginas + 1 sub-grupo (Admin Agenda)
  - 3 workflows: calcular duración, resumen diario, resumen semanal
  - 32 registros seed (16 categorías actividad + 6 tipos inasistencia + 10 servicios)

- **ENTREGA App (v1.0)** — Entrega de Turno desplegada en staging
  - 10 colecciones + 138 campos desplegados
  - 11 roles preexistentes
  - 17 páginas en 2 sub-grupos (Entrega Médica + Enfermería)
  - 3 workflows: sync censo ALMA, registrar entrega, cerrar turno
  - 21 registros seed (9 especialidades + 12 servicios)

- **Seed scripts**: seed-agenda-references.ts, seed-entrega-references.ts, seed-buho-patients.ts
- **Documentación**: troubleshooting.md, release-checklist.md

### Fixed

- **Permisos AGENDA**: Reescrito `grantPermissions()` usando API correcta (`roles/{role}/resources:create` + `resources:update?filterByTk={numericId}`) — el endpoint `/roles:setResources` no existe en NocoBase v1.9.14
- **ESLint**: 5 errores `prefer-const` corregidos, 0 errores restantes

### Changed

- Movidos 13 scripts diagnósticos UGCO a `Apps/UGCO/scripts/diagnostics/`
- Actualizado `.gitignore`: excluye screenshots UI, root JSONs, tmp/, memory/
- Script registry actualizado: 283 → 296 entries

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
