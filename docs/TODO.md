# TODO — G_NB_Apps

## Blockers

(ninguno actualmente)

## In Progress

(ninguno actualmente)

## Backlog

> Plan completo: `docs/plans/ugco-improvement-plan-v1.md`

### Backlog P2 Restante

- [ ] **P2-06 RHC** Exportación RHC MINSAL — script listo (`export-rhc-minsal.ts`), pendiente validación clínica con MINSAL
- [ ] **P3-01 ETL ALMA** `etl-alma-ugco.ts` — ETL desde InterSystems IRIS (requiere acceso TI al sistema ALMA)

## Done

- [x] **P0-01 CRUD CORE** — Ya implementado en sesiones previas (Casos, Episodios, Sesiones, Comité tienen formularios) (2026-03-04)
- [x] **P0-02 FILTROS ESPECIALIDAD** — Filtros por especialidad ya existían con valores correctos (`digestivo_alto`, etc.) (2026-03-04)
- [x] **P0-03 WORKFLOWS** — Los 4 workflows UGCO ya estaban activos: asignar código, log estado, tarea comité, verificar vencidas (2026-03-04)
- [x] **P0-04 GES COLLECTION** — Creada `ugco_garantias_ges` con 10 campos + relación a onco_casos (2026-03-04)
- [x] **P1-01 COMITE COLUMNS** — Agregadas 7 columnas a Casos en Comité (paciente, especialidad, sesión, prioridad, recomendación, seguimiento) (2026-03-04)
- [x] **P1-02 DATE FORMAT** — 11 nodos de fecha parcheados a DD/MM/YYYY en 4 páginas core (2026-03-04)
- [x] **P1-06 ENCODING FIX** — 5 campos corregidos: tipo_episodio (Cirugía), especialidad (labels legibles), estado, estadio_clinico, prioridad (2026-03-04)
- [x] **P1-05 GES PAGE** — Página "Garantías GES" creada (routeId: 351440432070656), tabla semáforo con 8 columnas ordenada por dias_restantes ASC (2026-03-04)
- [x] **P2-07 CLEANUP** — 13 colecciones UGCO\_\* legacy eliminadas (0 registros c/u), UGCO\_REF\_\* preservadas (2026-03-04)
- [x] **P1-03 IMMUTABILITY + P2-01 RBAC** — 321 grants aplicados en 5 roles UGCO; medico_oncologo: list/get/create en onco_episodios (sin update/destroy) (2026-03-04)
- [x] **P1-04 CIE-O CATALOG** — 219 códigos cargados: 126 morfologías + 93 topografías CIE-O-3 en UGCO_REF_* (2026-03-04)
- [x] **P2-02 RLS** — Row-Level Security aplicado: 6 recursos configurados con scope filters por rol (enfermeras ven solo casos activos) (2026-03-04)
- [x] **P2-03 FLS** — Field-Level Security aplicado: TNM protegido en 3 roles; enfermeras solo editan estado/fecha/observaciones (2026-03-04)
- [x] **P2-04 KANBAN** — Vista Kanban en Tareas Pendientes; onco_casos agrupado por estado (uid: c5afc300f7) (2026-03-04)
- [x] **P2-05 DRAWER** — Página "Ficha 360° Paciente" creada (routeId: 351445842722816) con 5 bloques de datos (2026-03-04)
- [x] **ENTREGA WORKFLOWS** 3 workflows creados: sync_censo_alma (cron 30min), crear_entrega_turno (collection), firmar_cerrar_entrega (collection) (2026-03-01)
- [x] **AGENDA WORKFLOWS** 3 workflows creados: calcular_duracion (collection), resumen_diario (cron 20:00), resumen_semanal (domingos 21:00) (2026-03-01)
- [x] **AGENDA PERMISOS** Permisos por recurso para 3 roles: medico_agenda, jefe_servicio_agenda, admin_agenda (2026-03-01)
- [x] **ONCOLOGIA PAGES** 4 deploy scripts para paginas UI: onco_casos, onco_episodios, onco_comite_sesiones, onco_comite_casos (2026-03-01)
- [x] **ONCOLOGIA RUTAS** Disenar rutas + bloques para las 4 colecciones onco_* con TableV2 + filtros + export (2026-03-01)
- [x] **ETL SCRIPT** sync_entrega_turno.py creado en shared/scripts/ — ETL ALMA -> NocoBase (2026-03-01)
- [x] **ROLE RENAME** Script rename_role_cirujano.ts: migra r_gd0z1pmdmii -> cirujano_residente con permisos y usuarios (2026-03-01)
- [x] **FK NAMING** Script fix_fk_naming.ts: audita y documenta inconsistencias camelCase vs snake_case en schedule_blocks (2026-03-01)
- [x] **ESLINT FIX** Script fix_eslint.sh: batch --fix en todos los directorios de scripts (2026-03-01)
- [x] **TEMP CLEANUP** Script cleanup_temp.sh: identifica y limpia 20 archivos temp (stubs + diagnosticos) (2026-03-01)
- [x] **GEMINI CONSOLIDATION** CONTEXT_GEMINI_3.0.md consolidado en GEMINI.md y marcado como DEPRECATED (2026-03-01)
- [x] **ONCOLOGIA UI** 4 paginas deployadas: Casos, Episodios, Sesiones Comite, Casos en Comite (2026-02-19)
- [x] **ENTREGA UI FIX** 17 paginas con tablas funcionando — tabs routes corregidos con Grid reales (2026-02-19)
- [x] **AGENDA UI** 8 paginas configuradas con bloques de tabla (2026-02-19)
- [x] **STANDARD DOC** `docs/standards/nocobase-page-block-deployment.md` — patron validado (2026-02-19)
- [x] **AUDIT** Score 85/100 — 12 findings categorizados (2026-02-19)
- [x] **AGENDA DEPLOY** 8 colecciones + 52 campos + 8 relaciones + 3 roles + 32 seed records (2026-02-18)
- [x] **ONCO FK** `responsible_doctor` belongsTo -> staff en onco_casos (2026-02-18)
- [x] **ESLINT ZERO** 25->0 warnings: 13 `no-explicit-any` + 12 `no-unused-vars` en 16 archivos (2026-02-18)
- [x] **ESLINT CONFIG** `varsIgnorePattern: '^_'` agregado a `eslint.config.js` (2026-02-18)
- [x] **TESTS x4** manage-collections, manage-fields, data-crud, manage-ui — 98 tests total (7/34 = 20.6%) (2026-02-18)
- [x] **ESLINT FIX** `prefer-const` error fijo en verify-fix-pages.ts — 0 errors, 241 warnings (2026-02-18)
- [x] **VALIDATION_SUMMARY.md** actualizado con datos actuales: 98 tests, 0 errores ESLint (2026-02-18)
- [x] **TYPES** `shared/scripts/types.ts`: 15+ interfaces (NbCollection, NbRole, NbField, etc.) (2026-02-17)
- [x] **ESLINT** 300->25 warnings (92% reduccion): ApiClient + 33 scripts tipados (2026-02-17)
- [x] **CONSOLIDAR UGCO**: `scripts/scripts-archive/` (82 files) movido a `scripts-archive/` nivel UGCO (2026-02-17)
- [x] **AUDITORIA** 2026-02-17: Score 91/100 post-remediacion (+15 vs 76/100) (2026-02-17)
- [x] **AGENDA Blueprint**: Modulo completo en `app-spec/app.yaml` — 8 colecciones, 3 roles, 11 paginas (2026-02-17)
- [x] **MIRA/ archivado**: 98 archivos legacy movidos a `docs/archive/mira-legacy/` (2026-02-17)
- [x] **`_base-api-client.js` archivado**: Ultimo JS legacy en shared/ movido a archive (2026-02-17)
- [x] **CONTEXT_GEMINI_3.0.md** actualizado: ENTREGA + AGENDA + testing + linting (2026-02-17)
- [x] **README.md** sincronizado: version 2.4.0, apps actualizadas (2026-02-17)
- [x] **Apps/README.md** actualizado: ENTREGA y AGENDA documentadas (2026-02-17)
- [x] **ENTREGA** Blueprint YAML generado en `app-spec/app.yaml` — 10 colecciones, 4 roles ENTREGA, 17 paginas UI, seed data (2026-02-17)
- [x] **NOCOBASE cleanup** 33 colecciones vacias/duplicadas eliminadas (123->90) (2026-02-17)
- [x] **ENTREGA desplegado**: 10 colecciones + 11 roles + seed data en NocoBase (2026-02-17)
- [x] **ROLES** Creados en NocoBase live: `admin_clinico`, `medico_oncologo`, `coordinador_pabellon` (2026-02-17)
- [x] **PERMISOS** Otorgados por blueprint: 9 resource-action grants (2026-02-17)
- [x] **SECURITY** Eliminar tokens JWT de ~50 scripts (activos + archivados + MIRA legacy) (2026-02-17)
- [x] **DEP** Migrar xlsx -> exceljs (3 scripts: analyze-sheets, extract-dictionaries, seed-ugco-references) (2026-02-17)
- [x] **TESTS** 46 tests unitarios: ApiClient (18), manage-roles (14), manage-permissions (14) (2026-02-17)
- [x] Actualizar axios a version segura (2026-02-17)
- [x] Configurar ESLint v10 + Prettier para TypeScript (2026-02-16)
- [x] Archivar 43 scripts JS legacy a `scripts-archive/` (2026-02-16)
- [x] Documentar MIRA/ como legacy con `_LEGACY_README.md` (2026-02-16)
- [x] Crear estructura Apps/ENTREGA y README (2026-02-16)
- [x] Consolidar `global_templates/` en `docs/templates/` (2026-02-16)
- [x] Ampliar `.gitignore` con debug outputs y eslint cache (2026-02-16)
- [x] Remediacion estructural del ecosistema AG (2026-02-16)
