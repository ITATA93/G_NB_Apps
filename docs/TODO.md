# TODO — G_NB_Apps

## 🔴 Blockers

(ninguno actualmente)

## 🔵 In Progress

- [ ] Implementar workflows ENTREGA: sync_censo_alma, crear_entrega_turno, firmar_cerrar_entrega
- [ ] Implementar workflows AGENDA: calcular_duracion, resumen_diario, resumen_semanal
- [ ] Otorgar permisos por recurso a los 3 roles AGENDA
- [ ] Crear UI pages Oncología (4 colecciones sin menú)

## 📋 Backlog

### Oncología (sin UI)
- [ ] Diseñar rutas + bloques para onco_casos, onco_episodios, onco_comite_sesiones, onco_comite_casos
- [ ] Renombrar rol `r_gd0z1pmdmii` → `cirujano_residente`

### ENTREGA (Workflows pendientes)
- [ ] Implementar workflow: sync_censo_alma (cron 30min)
- [ ] Implementar workflow: crear_entrega_turno (user_action)
- [ ] Implementar workflow: firmar_cerrar_entrega (both_signatures)
- [ ] Crear script ETL sync_entrega_turno.py en G_Consultas

### SGQ/UGCO (Mantenimiento)
- [ ] Reconciliar FK naming convention (snake_case vs camelCase en schedule_blocks)

### Calidad de Código
- [ ] Fix 48 ESLint warnings (`no-unused-vars` en validate-*.ts)
- [ ] Limpiar 20 archivos temp (8 stubs vacíos + 12 scripts diagnósticos)

### Documentación
- [ ] Evaluar consolidar CONTEXT_GEMINI_3.0.md en GEMINI.md

## ✅ Done

- [x] **ONCOLOGÍA UI** 4 páginas deployadas: Casos, Episodios, Sesiones Comité, Casos en Comité (2026-02-19)
- [x] **ENTREGA UI FIX** 17 páginas con tablas funcionando — tabs routes corregidos con Grid reales (2026-02-19)
- [x] **AGENDA UI** 8 páginas configuradas con bloques de tabla (2026-02-19)
- [x] **STANDARD DOC** `docs/standards/nocobase-page-block-deployment.md` — patrón validado (2026-02-19)
- [x] **AUDIT** Score 85/100 — 12 findings categorizados (2026-02-19)
- [x] **AGENDA DEPLOY** 8 colecciones + 52 campos + 8 relaciones + 3 roles + 32 seed records (2026-02-18)
- [x] **ONCO FK** `responsible_doctor` belongsTo → staff en onco_casos (2026-02-18)
- [x] **ESLINT ZERO** 25→0 warnings: 13 `no-explicit-any` + 12 `no-unused-vars` en 16 archivos (2026-02-18)
- [x] **ESLINT CONFIG** `varsIgnorePattern: '^_'` agregado a `eslint.config.js` (2026-02-18)
- [x] **TESTS ×4** manage-collections, manage-fields, data-crud, manage-ui — 98 tests total (7/34 = 20.6%) (2026-02-18)
- [x] **ESLINT FIX** `prefer-const` error fijo en verify-fix-pages.ts — 0 errors, 241 warnings (2026-02-18)
- [x] **VALIDATION_SUMMARY.md** actualizado con datos actuales: 98 tests, 0 errores ESLint (2026-02-18)

- [x] **TYPES** `shared/scripts/types.ts`: 15+ interfaces (NbCollection, NbRole, NbField, etc.) (2026-02-17)
- [x] **ESLINT** 300→25 warnings (92% reducción): ApiClient + 33 scripts tipados (2026-02-17)
- [x] **CONSOLIDAR UGCO**: `scripts/scripts-archive/` (82 files) movido a `scripts-archive/` nivel UGCO (2026-02-17)
- [x] **AUDITORÍA** 2026-02-17: Score 91/100 post-remediación (▲+15 vs 76/100) (2026-02-17)
- [x] **AGENDA Blueprint**: Módulo completo en `app-spec/app.yaml` — 8 colecciones, 3 roles, 11 páginas (2026-02-17)
- [x] **MIRA/ archivado**: 98 archivos legacy movidos a `docs/archive/mira-legacy/` (2026-02-17)
- [x] **`_base-api-client.js` archivado**: Último JS legacy en shared/ movido a archive (2026-02-17)
- [x] **CONTEXT_GEMINI_3.0.md** actualizado: ENTREGA + AGENDA + testing + linting (2026-02-17)
- [x] **README.md** sincronizado: versión 2.4.0, apps actualizadas (2026-02-17)
- [x] **Apps/README.md** actualizado: ENTREGA y AGENDA documentadas (2026-02-17)
- [x] **ENTREGA** Blueprint YAML generado en `app-spec/app.yaml` — 10 colecciones, 4 roles ENTREGA, 17 páginas UI, seed data (2026-02-17)
- [x] **NOCOBASE cleanup** 33 colecciones vacías/duplicadas eliminadas (123→90) (2026-02-17)
- [x] **ENTREGA desplegado**: 10 colecciones + 11 roles + seed data en NocoBase (2026-02-17)
- [x] **ROLES** Creados en NocoBase live: `admin_clinico`, `medico_oncologo`, `coordinador_pabellon` (2026-02-17)
- [x] **PERMISOS** Otorgados por blueprint: 9 resource-action grants (2026-02-17)
- [x] **SECURITY** Eliminar tokens JWT de ~50 scripts (activos + archivados + MIRA legacy) (2026-02-17)
- [x] **DEP** Migrar xlsx → exceljs (3 scripts: analyze-sheets, extract-dictionaries, seed-ugco-references) (2026-02-17)
- [x] **TESTS** 46 tests unitarios: ApiClient (18), manage-roles (14), manage-permissions (14) (2026-02-17)
- [x] Actualizar axios a versión segura (2026-02-17)
- [x] Configurar ESLint v10 + Prettier para TypeScript (2026-02-16)
- [x] Archivar 43 scripts JS legacy a `scripts-archive/` (2026-02-16)
- [x] Documentar MIRA/ como legacy con `_LEGACY_README.md` (2026-02-16)
- [x] Crear estructura Apps/ENTREGA y README (2026-02-16)
- [x] Consolidar `global_templates/` en `docs/templates/` (2026-02-16)
- [x] Ampliar `.gitignore` con debug outputs y eslint cache (2026-02-16)
- [x] Remediación estructural del ecosistema AG (2026-02-16)
