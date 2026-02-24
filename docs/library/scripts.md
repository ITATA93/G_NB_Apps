---
depends_on: []
impacts: [CLAUDE.md]
---

# Script Registry — G_NB_Apps

All automation scripts must be registered here per governance rule #2.

**Total: 261 entries** across 16 directories (excluding test files, types.ts, node_modules, and README.md).
Some scripts are cross-listed (cross-platform pairs and duplicate Python files across directories).

---

## Dispatch Scripts (.subagents/)

| Script | Type | Description |
| ------ | ---- | ----------- |
| dispatch.sh | Shell | Multi-vendor subagent dispatcher -- selects and invokes the correct vendor CLI for a given agent |
| dispatch.ps1 | PowerShell | Multi-vendor subagent dispatcher for Windows -- PowerShell equivalent of dispatch.sh |
| dispatch-team.sh | Shell | Multi-vendor Agent Team orchestrator -- executes a group of agents sequentially or in parallel based on manifest.json |
| dispatch-team.ps1 | PowerShell | Multi-vendor Agent Team orchestrator for Windows -- PowerShell equivalent of dispatch-team.sh |
| auto-memory.sh | Shell | Automatically updates DEVLOG after team execution |
| auto-memory.ps1 | PowerShell | Automatically updates DEVLOG after team execution (Windows equivalent) |
| safe-write.sh | Shell | Output governance file creator -- ensures files are created in allowed target directories matching Antigravity standards |
| safe-write.ps1 | PowerShell | Safe write output governance hook -- validates output paths against output\_governance.md rules and creates missing directories |

## Ecosystem Scripts (scripts/)

| Script | Type | Description |
| ------ | ---- | ----------- |
| audit-blueprint.ts | TypeScript | Full audit of current NocoBase state vs App Blueprint specification |
| complete\_config.ps1 | PowerShell | Batch runner that adds table blocks to UGCO, SGQ, and Admin pages via add-block-to-page.ts |
| complete\_config.py | Python | NocoBase configuration helper -- creates table blocks and UI schemas via direct API calls |
| complete\_config.sh | Shell | Batch runner that adds table blocks to UGCO, SGQ, and Admin pages via add-block-to-page.ts (Bash version) |
| deep\_route\_inspection.ts | TypeScript | Inspects all NocoBase desktop routes with full detail (paginate: false) |
| deep\_route\_inspection\_simple.ts | TypeScript | Simplified inspection of NocoBase desktop routes |
| deploy-ui-guide.ts | TypeScript | Deploys UI pages via API following the official NocoBase guide protocol (route, grid, block, columns, actions) |
| fix\_menu\_visibility.ts | TypeScript | Adds menu items to the UGCO parent group in NocoBase UI schemas |
| get\_page\_ids.py | Python | Retrieves route IDs for target pages (Casos, Comite, Agenda, etc.) from NocoBase desktop routes |
| inspect\_route\_detail.ts | TypeScript | Inspects a single NocoBase route by ID with full detail output |
| link\_route\_menu.ts | TypeScript | Links a NocoBase desktop route to a menu schema UID |
| list\_route\_names.ts | TypeScript | Lists the 50 most recent NocoBase desktop route names |
| mcp\_governance.ps1 | PowerShell | Governance pre-execution hook (guardrail) -- scans input for destructive patterns before allowing execution |
| nocobase\_call.py | Python | Generic HTTP caller for NocoBase Resource:Action API (list, create, update, destroy) |
| nocobase\_configure.py | Python | NocoBase Blueprint Configurator -- reads app-spec/app.yaml and creates collections + fields via API |
| nocobase\_seed.py | Python | Seeds data into NocoBase collections from app-spec/app.yaml seed section |
| nocobase\_swagger\_dump.py | Python | Dumps NocoBase Swagger/OpenAPI JSON from API documentation endpoints |
| safe-write.ps1 | PowerShell | Safe write output governance hook -- validates output paths against output\_governance.md rules |
| safe-write.sh | Shell | Output governance file creator -- ensures files are created in allowed target directories |
| seed-mock-data.ts | TypeScript | Seeds mock data (50+ records) into onco\_casos and schedule\_blocks for visual complexity testing |
| validate-all-scripts.ps1 | PowerShell | Quick validation of all NocoBase npm/tsx scripts -- verifies operational status |
| validate-chrome-remote.ts | TypeScript | Validates NocoBase UI by connecting to Chrome remote debugging via CDP (port 9222) |
| validate-deep.ts | TypeScript | Deep validation of NocoBase UI + network -- captures console errors and failed network requests |
| validate-injection-e2e.ts | TypeScript | Unified E2E injection test (Playwright) -- injects data via API, verifies in browser UI, cleans up |
| validate-ui-browser.ts | TypeScript | Playwright-based UI validation -- opens NocoBase, captures console errors, verifies UI elements, takes screenshots |
| agent\_health\_check.py | Python | Validates that all agent definitions are correctly configured (manifest, definitions, vendor configs) |
| agent\_selftest.py | Python | Verifies that each project has infrastructure for autonomous agent work (dispatch, manifests, workflows, memory) |
| audit\_ecosystem.py | Python | Context-aware normalization audit of all AG projects -- detects hardcoded credentials while ignoring validators |
| cross\_task.py | Python | Cross-workspace task delegation system -- creates, lists, updates, and tracks tasks spanning multiple AG projects |
| ecosystem\_dashboard.py | Python | Category-aware dashboard for the full AG ecosystem -- groups projects by category with health indicators |
| env\_resolver.py | Python | Central environment resolver -- replaces all hardcoded paths across the ecosystem by auto-detecting the environment |
| knowledge\_sync.py | Python | Structured knowledge extraction -- generates context snapshots and updates memory index |
| memory\_sync.py | Python | Transversal memory system -- collects project status (DEVLOG, TASKS) and generates unified ecosystem dashboard |
| propagate.py | Python | Template propagation engine -- detects template drift and applies approved changes across all AG projects |
| template\_sync.py | Python | Syncs core files from project root to `_global-profile/` and `_template/workspace/` |
| sync-knowledge.ps1 | PowerShell | Promotes deep research artifacts to global Knowledge Items (Windows) |
| sync-knowledge.sh | Shell | Promotes deep research artifacts to global Knowledge Items (Bash) |
| sync-skills.ps1 | PowerShell | Consolidates and synchronizes Antigravity skills across all vendor directories (.gemini, .claude, .codex) |
| migrate\_ecosystem.ps1 | PowerShell | Migrates flat workspace into Star Topology domain architecture |
| Generate-Context.ps1 | PowerShell | Generates a context prompt for Gemini 3.0 based on current G\_NB\_Apps project state |

## Setup Scripts (scripts/setup/)

| Script | Type | Description |
| ------ | ---- | ----------- |
| backup-config.ps1 | PowerShell | Creates a timestamped backup of Antigravity configuration (.gemini/, .claude/, instruction files) |
| bootstrap\_environment.ps1 | PowerShell | Interactive step-by-step Antigravity environment setup for new machines (Windows) |
| bootstrap\_environment.py | Python | Interactive step-by-step Antigravity environment setup for new machines (Python) |
| health-check.ps1 | PowerShell | Checks health of Antigravity installation and configuration (tools, files, configs) |
| health-check.sh | Shell | Checks health of Antigravity installation and configuration (Bash version) |
| sync-global.ps1 | PowerShell | Synchronizes workspace configuration with global profile and optionally installs to ~/.gemini/ |

## Temporary Utilities (scripts/temp/)

| Script | Type | Description |
| ------ | ---- | ----------- |
| archive\_skills.py | Python | Archives unused skills from .claude/skills/ based on keyword filtering |
| audit\_ecosystem.py | Python | Ecosystem normalization audit v2 -- context-aware security scanning with per-project actionable output |
| audit\_plantilla.py | Python | Audits AG\_Plantilla content quality (GEMINI.md references, structure checks) |
| commit\_satellites.py | Python | Commits TASKS.md changes in satellite projects that received incoming tasks |
| scan\_tasks.py | Python | Scans all AG projects for TASKS.md status and pending items |
| send\_norm\_tasks.py | Python | Sends normalization tasks to projects with specific gaps via cross\_task.py |

## NocoBase API Client & Management (shared/scripts/)

| Script | Type | Description |
| ------ | ---- | ----------- |
| ApiClient.ts | TypeScript | Shared HTTP client for NocoBase API (axios-based, handles auth, logging, env config) |
| \_audit-entrega.ts | TypeScript | One-shot audit of ENTREGA module state in NocoBase (collections, fields) |
| add-block-to-page.ts | TypeScript | Adds blocks (table, form, details) to NocoBase pages via API |
| capture-ui-schemas.ts | TypeScript | Reverse-engineering tool -- exports UI schemas generated by NocoBase for building reusable templates |
| cleanup-agenda-routes.ts | TypeScript | Removes all AGENDA routes and XXX test page from NocoBase |
| create-workflow.ts | TypeScript | Creates complete and functional workflows in NocoBase (sync, notify, and custom types) |
| data-crud.ts | TypeScript | CRUD operations on NocoBase collection data (list, get, create, update, delete, count) |
| deploy-agenda-fields.ts | TypeScript | Deploys all AGENDA module fields to NocoBase collections |
| deploy-blocks.ts | TypeScript | Deploys table blocks to all AGENDA pages via insertAdjacent API |
| deploy-routes.ts | TypeScript | Deploys navigation routes/menu structures in NocoBase from JSON config files |
| deploy-ui-correct.ts | TypeScript | Deploys UI pages correctly replicating NocoBase internal pattern (routes, schemas, tree paths, menu links) |
| deploy-ui-pages.ts | TypeScript | Deploys complete UI pages in NocoBase (menu group, pages, schemas, route-schema bindings, content blocks) |
| fix-agenda-editability.ts | TypeScript | Fixes AGENDA pages to be editable by adding missing menuSchemaUid and enableTabs |
| fix-agenda-relations.ts | TypeScript | Fixes belongsTo relations for AGENDA module (foreignKey != field name, uses \_fk suffix) |
| investigate-ui.ts | TypeScript | Investigates differences between functional pages and API-created pages in NocoBase |
| manage-api-keys.ts | TypeScript | Management of NocoBase API keys (list, create, delete/revoke) via api-keys plugin |
| manage-apps.ts | TypeScript | Management of NocoBase sub-applications via multi-app-manager plugin |
| manage-async-tasks.ts | TypeScript | Management of NocoBase async tasks (list, get, cancel, clean) via async-task-manager plugin |
| manage-auth.ts | TypeScript | Management of NocoBase authentication providers and SSO (list, create, enable, disable) |
| manage-backup.ts | TypeScript | Management of NocoBase backups (list, create, download, restore, delete) |
| manage-charts.ts | TypeScript | Data visualization management via data-visualization plugin (query, SQL, collections, fields) |
| manage-collection-categories.ts | TypeScript | Management of NocoBase collection categories for visual organization (list, create, update, delete) |
| manage-collections.ts | TypeScript | Full CRUD of NocoBase collections (list, get, create, update, delete, schema export) |
| manage-custom-requests.ts | TypeScript | Management of custom HTTP action requests via action-custom-request plugin |
| manage-datasources.ts | TypeScript | Management of NocoBase data sources (list, get, test connection, create, enable, disable) |
| manage-db-views.ts | TypeScript | Management of SQL database views via collection-sql plugin (list, get, query) |
| manage-departments.ts | TypeScript | Management of departments/organizational units via departments plugin |
| manage-env-vars.ts | TypeScript | Management of NocoBase environment variables via environment-variables plugin |
| manage-fields.ts | TypeScript | CRUD of NocoBase collection fields (list, get, create, update, delete, list interfaces) |
| manage-files.ts | TypeScript | Management of NocoBase files and attachments (list, get, upload, delete, storage management) |
| manage-import-export.ts | TypeScript | Import and export of NocoBase collection data via action-import/action-export plugins |
| manage-localization.ts | TypeScript | Management of NocoBase translations/localization (list, get, create, update, delete) |
| manage-notifications.ts | TypeScript | Management of NocoBase notifications (channels, messages) via notification-manager plugin |
| manage-permissions.ts | TypeScript | Management of NocoBase ACL permissions (strategy, resources, grant, revoke per role) |
| manage-plugins.ts | TypeScript | Management of NocoBase plugins (list, get, enable, disable, install, remove) |
| manage-public-forms.ts | TypeScript | Management of NocoBase public forms via public-forms plugin |
| manage-roles.ts | TypeScript | CRUD of NocoBase roles and permissions (list, get, create, update, delete, user assignments) |
| manage-system.ts | TypeScript | Management of NocoBase system configuration (info, settings, auth, env, health) |
| manage-themes.ts | TypeScript | Management of NocoBase visual themes via theme-editor plugin (list, get, activate, create) |
| manage-ui.ts | TypeScript | Management of NocoBase UI schemas -- menus, pages, schema trees, export/import |
| manage-users.ts | TypeScript | CRUD of NocoBase users (list, get, create, update, delete, role assignments) |
| manage-verification.ts | TypeScript | Management of NocoBase verification providers via verification plugin |
| manage-workflows.ts | TypeScript | Management of NocoBase workflows (list, get, nodes, enable, disable, trigger, create, delete) |
| probe-nb-internals.ts | TypeScript | Maps NocoBase internal database tables and relations (routes, schemas, blocks, menus, roles) |
| probe-ui-api.ts | TypeScript | Systematically explores and documents all NocoBase UI API endpoints |
| seed-agenda-data.ts | TypeScript | Seeds AGENDA catalog data (categories, activity types) from hardcoded definitions |
| snapshot-nb-tables.ts | TypeScript | Snapshots NocoBase internal tables (before/after) for comparing state changes during UI creation |
| sync-tables.ts | TypeScript | Automatic synchronization between NocoBase tables with field mapping |
| validate-advanced-config.ts | TypeScript | Tests advanced UI configurations via API (drawers, row actions, relation fields, multi-tab, data scope) |
| validate-all-blocks.ts | TypeScript | Tests all NocoBase block types via API (table, form, details, list, calendar, kanban, etc.) |
| validate-api-full.ts | TypeScript | Comprehensive API validation for all NocoBase block types -- full lifecycle testing |
| validate-deep-config.ts | TypeScript | Tests deep block configuration via API (schema patch, sorting, filtering, columns, visibility) |
| validate-missing-blocks.ts | TypeScript | Tests block types not yet validated (charts, map, filter blocks, markdown, audit logs) |

## NocoBase Python API Tools (shared/python/)

| Script | Type | Description |
| ------ | ---- | ----------- |
| nocobase\_call.py | Python | Generic HTTP caller for NocoBase Resource:Action API (list, create, update, destroy) |
| nocobase\_configure.py | Python | NocoBase Blueprint Configurator -- reads app-spec/app.yaml and creates collections + fields via API |
| nocobase\_seed.py | Python | Seeds data into NocoBase collections from app-spec/app.yaml seed section |
| nocobase\_swagger\_dump.py | Python | Dumps NocoBase Swagger/OpenAPI JSON from API documentation endpoints |

## Shared Temp Scripts (shared/scripts/temp/)

| Script | Type | Description |
| ------ | ---- | ----------- |
| TEMP\_01.ts | TypeScript | Step 1: Create proper Page+Grid schemas for all ENTREGA/Enfermeria routes |
| TEMP\_02.ts | TypeScript | Step 2: Add table blocks to all ENTREGA/Enfermeria pages |
| TEMP\_03.ts | TypeScript | Diagnostics: Compare Agenda (working) vs ENTREGA (broken) route structures |
| TEMP\_04.ts | TypeScript | Fix ENTREGA tabs + deploy blocks (unified validated pattern) |
| TEMP\_05.ts | TypeScript | Full project audit: connectivity, collections, routes, UI integrity |
| TEMP\_06.ts | TypeScript | Rename cryptic role r\_gd0z1pmdmii to cirujano\_residente |
| TEMP\_07.ts | TypeScript | Discover onco\_\* collections and their fields |
| TEMP\_08.ts | TypeScript | Find actual page schemas created by bindMenuToPage for ENTREGA menus and insert table blocks |
| TEMP\_09.ts | TypeScript | Create desktopRoutes for ENTREGA + Enfermeria (top navigation bar visibility) |
| TEMP\_10.ts | TypeScript | Find actual tab schemas and insert table blocks |
| TEMP\_11.ts | TypeScript | Dump all ENTREGA-related routes with full details |
| TEMP\_12.ts | TypeScript | Insert table blocks into \_tabs schemas for ENTREGA pages |
| deploy-oncologia.ts | TypeScript | Create Oncologia menu group + 4 pages with table blocks (Triple Binding pattern) |

## App Scripts -- AGENDA (Apps/AGENDA/scripts/)

| Script | Type | Description |
| ------ | ---- | ----------- |
| deploy-agenda-collections.ts | TypeScript | Creates the 8 AGENDA collections + all fields + seed data in NocoBase following app.yaml blueprint |

## App Scripts -- ENTREGA (Apps/ENTREGA/scripts/)

| Script | Type | Description |
| ------ | ---- | ----------- |
| audit-collections.ts | TypeScript | Audits ENTREGA collection state in NocoBase (identifies UGCO duplicates and suspect collections) |
| cleanup-duplicate-collections.ts | TypeScript | Removes duplicate/empty collections in NocoBase (only deletes collections with 0 records) |
| deploy-entrega-collections.ts | TypeScript | Creates the 10 ENTREGA collections + all fields + seed data in NocoBase following app.yaml blueprint |

## App Scripts -- BUHO (Apps/BUHO/backend/scripts/)

| Script | Type | Description |
| ------ | ---- | ----------- |
| create-ui.ts | TypeScript | Generates NocoBase UI pages and menus for BUHO Proyeccion module |
| init-db.ts | TypeScript | Initializes BUHO database schema from SQL migrations |
| register-collection.ts | TypeScript | Registers BUHO\_Pacientes collection in NocoBase via API |

## App Scripts -- UGCO (Apps/UGCO/scripts/)

| Script | Type | Description |
| ------ | ---- | ----------- |
| analyze-sheets.ts | TypeScript | Analyzes SIGO Excel spreadsheets to extract dictionary structure |
| check-sql-sync.ts | TypeScript | Verifies SQL synchronization state between NocoBase collections |
| delete-collections.ts | TypeScript | Deletes specified empty UGCO collections from NocoBase |
| extract-dictionaries.ts | TypeScript | Extracts dictionary data from SIGO Excel into structured output |
| fetch-hl7-codesystems.ts | TypeScript | Fetches HL7 FHIR CodeSystems (CIE-10, SNOMED, etc.) for oncology reference data |
| inspect-datasources.ts | TypeScript | Inspects NocoBase data sources and exports collection metadata |
| list-collections.ts | TypeScript | Lists all UGCO collections in NocoBase with field counts and metadata |
| test-connection.ts | TypeScript | Tests MIRA NocoBase API connection and validates configuration |
| python/restructure-sigo-excel.py | Python | Restructures SIGO Excel dictionaries into normalized per-sheet format |

### UGCO NocoBase Sub-scripts (Apps/UGCO/scripts/nocobase/)

| Script | Type | Description |
| ------ | ---- | ----------- |
| add-chart-users-roles.ts | TypeScript | Adds a users-by-role chart block to a UGCO page |
| add-fields-to-collections.ts | TypeScript | Adds field definitions to existing UGCO collections that were created without fields |
| add-sigo-fields.ts | TypeScript | Adds SIGO-compatibility fields and reference tables (TNM, lateralidad, extension) |
| backup-mira-oncologia.ts | TypeScript | Backs up oncology collections from MIRA Hospital de Ovalle to local JSON files |
| check-page-schema.ts | TypeScript | Inspects the UI schema of a specific NocoBase page |
| cleanup-especialidades.ts | TypeScript | Cleans up orphaned specialty pages and routes in NocoBase |
| cleanup-test-pages.ts | TypeScript | Removes test/temporary pages from NocoBase |
| create-page.ts | TypeScript | Creates functional pages in NocoBase via API (replicates UI page-creation flow) |
| delete-page.ts | TypeScript | Deletes a NocoBase page by ID via API |
| deploy-specialty-tables.ts | TypeScript | Adds case table blocks to UGCO specialty pages |
| deploy-ugco-schema-mira.ts | TypeScript | Deploys UGCO schema to MIRA with UGCO\_ prefix on all collections |
| deploy-ugco-ui.ts | TypeScript | Deploys UGCO UI configuration (pages, menus, schemas) in NocoBase |
| fix-chart-block.ts | TypeScript | Fixes an existing chart block configuration |
| generate-specialty-pages.ts | TypeScript | Generates 9 specialty page JSON configs from template |
| list-all-ugco.ts | TypeScript | Lists all UGCO-related collections and routes in NocoBase |
| list-ugco-pages.ts | TypeScript | Lists all UGCO pages with route and schema details |
| register-menu-for-role.ts | TypeScript | Registers UGCO menu entry for the root role |
| seed-ugco-references.ts | TypeScript | Seeds UGCO\_REF\_\* reference tables from MIRA backup and normalized SIGO Excel |
| unify-duplicate-tables.ts | TypeScript | Identifies and unifies duplicate UGCO tables (ALMA\_Sexo + ref\_sexobiologico, etc.) |
| update-relationships.ts | TypeScript | Updates belongsTo relations to point to new UGCO\_ prefixed tables |
| verify-fix-pages.ts | TypeScript | Verifies and optionally repairs NocoBase pages under UGCO |
| verify-page.ts | TypeScript | Verifies a single NocoBase page structure (route, schema, menu) |
| verify-pages.ts | TypeScript | Verifies multiple NocoBase pages structure and accessibility |

## UGCO Archived Scripts (Apps/UGCO/scripts-archive/) -- ARCHIVED

> **Note:** These 82 scripts are historical iterations from UGCO development.
> They are preserved for reference but are **not active**. Do not use in production.

| Script | Type | Description |
| ------ | ---- | ----------- |
| add-ugco-menu-item.ts | TypeScript | (archived) Add UGCO menu item to NocoBase |
| add-ugco-to-main-menu.ts | TypeScript | (archived) Add UGCO to main menu |
| add-ugco-to-main.ts | TypeScript | (archived) Add UGCO to main navigation |
| analyze-menu-connection.ts | TypeScript | (archived) Analyze menu-to-page connection logic |
| capture-ui-calls.ts | TypeScript | (archived) Capture UI API calls for reverse engineering |
| check-acl.ts | TypeScript | (archived) Check ACL permissions |
| check-menu-schema.ts | TypeScript | (archived) Check menu schema structure |
| check-page-structure.ts | TypeScript | (archived) Check page structure integrity |
| check-routes.ts | TypeScript | (archived) Check route configuration |
| check-ugco-app.ts | TypeScript | (archived) Check UGCO app configuration |
| check-ui-schemas.ts | TypeScript | (archived) Check UI schema definitions |
| check-user.ts | TypeScript | (archived) Check user configuration |
| clone-dashboard-structure.ts | TypeScript | (archived) Clone dashboard structure as template |
| compare-a-vs-digestivo.ts | TypeScript | (archived) Compare page A vs Digestivo schema |
| compare-all-pages.ts | TypeScript | (archived) Compare all page structures |
| compare-funciona.ts | TypeScript | (archived) Compare working vs broken pages |
| compare-schemas.ts | TypeScript | (archived) Compare schema structures |
| compare-with-ejemplos.ts | TypeScript | (archived) Compare with example pages |
| compare-working-page.ts | TypeScript | (archived) Compare with a known working page |
| compare-working-schema.ts | TypeScript | (archived) Compare with a known working schema |
| configure-ugco-page.ts | TypeScript | (archived) Configure UGCO page layout |
| create-full-schema.ts | TypeScript | (archived) Create full page schema |
| create-page-complete.ts | TypeScript | (archived) Create complete page (iteration) |
| create-page-correct-way.ts | TypeScript | (archived) Create page the correct way (iteration) |
| create-page-correct.ts | TypeScript | (archived) Create page correctly (iteration) |
| create-page-final.ts | TypeScript | (archived) Create page final version (iteration) |
| create-page-fresh.ts | TypeScript | (archived) Create fresh page from scratch (iteration) |
| create-page-like-ui.ts | TypeScript | (archived) Create page replicating UI flow (iteration) |
| create-page-official.ts | TypeScript | (archived) Create page following official docs (iteration) |
| create-page-v2.ts | TypeScript | (archived) Create page v2 (iteration) |
| create-schema.ts | TypeScript | (archived) Create schema structure |
| create-test02.ts | TypeScript | (archived) Create test page 02 |
| create-top-menu-tab.ts | TypeScript | (archived) Create top menu tab |
| create-ugco-menu-route.ts | TypeScript | (archived) Create UGCO menu route |
| create-ugco-top-tab.ts | TypeScript | (archived) Create UGCO top-level tab |
| create-with-insertbeforeend.ts | TypeScript | (archived) Create using insertBeforeEnd API |
| debug-menu.ts | TypeScript | (archived) Debug menu rendering |
| deep-compare.ts | TypeScript | (archived) Deep comparison of page structures |
| deep-debug.ts | TypeScript | (archived) Deep debug of page issues |
| deep-menu-compare.ts | TypeScript | (archived) Deep comparison of menu structures |
| exhaustive-compare.ts | TypeScript | (archived) Exhaustive comparison of all page attributes |
| find-all-apps.ts | TypeScript | (archived) Find all NocoBase applications |
| find-buho.ts | TypeScript | (archived) Find BUHO application references |
| find-edit-component.ts | TypeScript | (archived) Find edit component in schemas |
| find-hidden-difference.ts | TypeScript | (archived) Find hidden differences in schemas |
| find-initialization.ts | TypeScript | (archived) Find initialization sequence |
| find-menu-structure.ts | TypeScript | (archived) Find menu structure hierarchy |
| find-other-apps.ts | TypeScript | (archived) Find other registered apps |
| find-tabs-structure.ts | TypeScript | (archived) Find tabs structure in schemas |
| fix-all-sigo.ts | TypeScript | (archived) Fix all SIGO-related issues |
| fix-menu-schema.ts | TypeScript | (archived) Fix menu schema |
| fix-old-pages.ts | TypeScript | (archived) Fix old page structures |
| fix-role-permissions.ts | TypeScript | (archived) Fix role permissions |
| fix-schema-properly.ts | TypeScript | (archived) Fix schema properly (iteration) |
| fix-schema-sigo.ts | TypeScript | (archived) Fix SIGO schema issues |
| fix-test02-like-a.ts | TypeScript | (archived) Fix test02 to match page A |
| fix-tree-paths.ts | TypeScript | (archived) Fix tree path hierarchies |
| fix-ugco-pages.ts | TypeScript | (archived) Fix UGCO page issues |
| fix-with-empty-schema.ts | TypeScript | (archived) Fix using empty schema approach |
| get-full-schema.ts | TypeScript | (archived) Get full schema dump |
| get-tabs-schema.ts | TypeScript | (archived) Get tabs schema structure |
| insert-ugco-sibling.ts | TypeScript | (archived) Insert UGCO as sibling node |
| inspect-existing-pages.ts | TypeScript | (archived) Inspect existing page structures |
| inspect-working-page.ts | TypeScript | (archived) Inspect a known working page |
| investigate-async.ts | TypeScript | (archived) Investigate async rendering |
| investigate-ejemplo.ts | TypeScript | (archived) Investigate example page |
| investigate-menu-schema.ts | TypeScript | (archived) Investigate menu schema |
| investigate-page-a-deep.ts | TypeScript | (archived) Deep investigation of page A |
| investigate-page-creation.ts | TypeScript | (archived) Investigate page creation flow |
| investigate-schemas-deep.ts | TypeScript | (archived) Deep investigation of schemas |
| investigate-tree-structure.ts | TypeScript | (archived) Investigate tree structure |
| link-ugco-menu.ts | TypeScript | (archived) Link UGCO to menu |
| quick-compare.ts | TypeScript | (archived) Quick comparison of pages |
| recreate-especialidades.ts | TypeScript | (archived) Recreate specialty pages |
| recreate-like-working.ts | TypeScript | (archived) Recreate like working page |
| recreate-main-pages.ts | TypeScript | (archived) Recreate main pages |
| restore-simple-schema.ts | TypeScript | (archived) Restore simple schema |
| search-tree-paths.ts | TypeScript | (archived) Search tree path hierarchy |
| seed-full-references.ts | TypeScript | (archived) Seed full reference data |
| seed-references.ts | TypeScript | (archived) Seed reference data |
| setup-ugco-menu.ts | TypeScript | (archived) Setup UGCO menu |
| verify-schema-structure.ts | TypeScript | (archived) Verify schema structure |

## App Template Scripts (Apps/\_APP\_TEMPLATE/scripts/) -- TEMPLATE

> **Note:** These are starter templates for new NocoBase applications.
> Copy and customize when bootstrapping a new App module.

| Script | Type | Description |
| ------ | ---- | ----------- |
| configure/configure.ts | TypeScript | (template) Configure collections for a new app in NocoBase |
| inspect/list-collections.ts | TypeScript | (template) List all app collections with basic info |
| seed/seed-references.ts | TypeScript | (template) Load reference/catalog data from JSON files |
| test/test-connection.ts | TypeScript | (template) Verify NocoBase API connection and configuration |
| utils/ApiClient.ts | TypeScript | (template) Reusable NocoBase API client with retries and logging |

## Agent Hooks (.claude/hooks/)

| Script | Type | Description |
| ------ | ---- | ----------- |
| api\_call.sh | Shell | Claude Code hook -- logs NocoBase API calls with timestamps |
| error.sh | Shell | Claude Code hook -- logs errors with timestamps and context |
| file\_change.sh | Shell | Claude Code hook -- logs file modifications with timestamps |
| startup.sh | Shell | Claude Code hook -- initializes session logging on startup |
| task\_complete.sh | Shell | Claude Code hook -- logs task completions with timestamps |

## Gemini Utilities (.gemini/scripts/)

| Script | Type | Description |
| ------ | ---- | ----------- |
| deep-research.sh | Shell | Executes Gemini Deep Research queries via API with structured output to docs/research/ |
| parallel-agents.sh | Shell | Launches multiple sub-agents in parallel with per-agent log capture |

---

## Summary by Type

| Type | Count |
| ---- | ----- |
| TypeScript (.ts) | 203 |
| Python (.py) | 27 |
| PowerShell (.ps1) | 16 |
| Shell (.sh) | 15 |
| **Total entries** | **261** |

## Summary by Directory

| Directory | Count | Notes |
| --------- | ----- | ----- |
| .subagents/ | 8 | Dispatch infrastructure (4 SH + 4 PS1) |
| scripts/ | 40 | Ecosystem automation (13 TS + 16 PY + 8 PS1 + 3 SH) |
| scripts/setup/ | 6 | Bootstrap and health checks |
| scripts/temp/ | 6 | Temporary ecosystem utilities (PY) |
| shared/scripts/ | 53 | NocoBase API client and management (TS) |
| shared/scripts/temp/ | 13 | Temporary deployment and debug scripts (TS) |
| shared/python/ | 4 | NocoBase Python API tools |
| Apps/AGENDA/scripts/ | 1 | AGENDA module scripts |
| Apps/ENTREGA/scripts/ | 3 | ENTREGA module scripts |
| Apps/BUHO/backend/scripts/ | 3 | BUHO module scripts |
| Apps/UGCO/scripts/ | 31 | UGCO module scripts (9 top-level + 22 nocobase/) |
| Apps/UGCO/scripts-archive/ | 82 | UGCO archived iterations (read-only) |
| Apps/\_APP\_TEMPLATE/scripts/ | 5 | App template starters |
| .claude/hooks/ | 5 | Claude Code agent hooks |
| .gemini/scripts/ | 2 | Gemini CLI utilities |

> **Note:** Some scripts are cross-listed in multiple sections (cross-platform pairs like `safe-write.sh`/`safe-write.ps1`,
> and `scripts/nocobase_*.py` duplicates of `shared/python/nocobase_*.py`).
>
> Last updated: 2026-02-23
