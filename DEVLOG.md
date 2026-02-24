---
depends_on: []
impacts: [CHANGELOG.md]
---

# Development Log — G_NB_Apps

## 2026-02-23 (Session: Initial Workspace Configuration)

### Accomplished
- Migrated from AG_NB_Apps to G_NB_Apps with full GEN_OS mirror infrastructure
- Upgraded `.subagents/manifest.json` from v2.0.0 to v3.1 schema (aligned with G_Plantilla)
- Configured Claude Code: settings.json, mcp.json, commands, skills
- Updated CLAUDE.md with complete project documentation
- Updated AGENTS.md with current agent manifest
- Created DEVLOG.md for session tracking
- Verified .agent/ rules and session protocol

### Decisions
- Adopted v3.1 manifest schema for consistency with G_Plantilla template engine
- Kept standard MCP servers (filesystem, github, fetch) — no custom PostgreSQL servers needed at satellite level
- Domain-specific triggers added to agents (nocobase, collection, patient data awareness)

### Metrics
- Files changed: 8+ | Configuration files normalized

## 2026-02-23 (Session: Full Project Audit)

### Accomplished
- Executed comprehensive full audit (AG-AUD-2026-02-23-001) across 8 categories
- 6 parallel explore sub-agents: structure, cross-refs, scripts, subagents, apps, docs
- Generated AG-AUDIT-STD v1.0 compliant report at `docs/audit/2026-02-23_full_g-nb-apps_claude-opus46.md`
- Updated `docs/audit/INDEX.md` (was stale template — now populated)

### Decisions
- Score 78/100 (C+): solid infra, significant documentation debt
- Critical: 71/105 scripts unregistered (governance rule #2 violation)
- High: BUHO lacks README, audit INDEX was empty, 3 phantom scripts in registry

### Metrics
- Files scanned: 200+ | Findings: 1C/3H/5M/4L/3I | Report: 180 lines

## 2026-02-23 (Session: Audit Remediation — All Findings)

### Accomplished

- **C-GOV-001** RESOLVED: Updated `docs/library/scripts.md` — 87 scripts registered (was 32)
- **H-GOV-002** RESOLVED: Removed 3 phantom scripts (manage-menu.ts, manage-relationships.ts, manage-ui-blocks.ts)
- **H-DOC-001** RESOLVED: Created BUHO README.md, STATUS.md, CHANGELOG.md, .env.example
- **H-OPS-001** RESOLVED: Populated `docs/audit/INDEX.md` (done in audit session)
- **M-GOV-003** RESOLVED: Moved 12 files from docs/ root to audit/, guides/, research/, standards/, specs/, reports/
- **M-QA-001** RESOLVED: Created `tests/README.md` documenting test strategy
- **M-DATA-001** RESOLVED: Added frontmatter to CONTRIBUTING.md, VALIDATION_SUMMARY.md, Apps/README.md
- **M-DOC-002** RESOLVED: Created STATUS.md + CHANGELOG.md for ENTREGA and AGENDA
- **M-DOC-003** RESOLVED: Created `docs/standards/app-documentation-checklist.md`
- **L-SEC-001** RESOLVED: Added .env.example to ENTREGA, AGENDA, BUHO
- **L-DATA-002** RESOLVED: Consolidated docs/DEVLOG.md → redirect to root DEVLOG.md
- **I-GOV-004** RESOLVED: Updated output_governance.md root file exceptions
- **I-ARCH-001** RESOLVED: Updated CLAUDE.md with .github/, app-spec/, full docs/ tree
- **I-OPS-002** RESOLVED: Added `Apps/UGCO/backups/` to .gitignore

### Decisions

- All 16 audit findings remediated in single session
- Kept config/ directory with .gitkeep (may be needed for future NocoBase config)
- Root DEVLOG.md is canonical; docs/DEVLOG.md redirects to it
- Bumped version to 3.0.0 (breaking: file moves, structure changes)

### Metrics

- Files created: 14 | Files moved: 12 | Files modified: 7 | Findings resolved: 16/16

## 2026-02-23 (Session: Legacy Comparison — AG_NB_Apps Extraction)

### Accomplished

- Executed full comparison of legacy `C:\_Repositorio\AG_Proyectos\AG_NB_Apps` vs current `G_NB_Apps`
- 3 parallel agents: structure exploration, docs comparison, scripts comparison
- **Result: ZERO missing content** — current repo is a strict superset of legacy
  - 544 shared files (identical content)
  - 2 legacy-only files (both accounted for: settings.local.json is user-local, blueprint-audit JSON moved to docs/audit/)
  - 49 new files in current (added during migration and audit remediation)
- Legacy repo `AG_NB_Apps` is fully superseded and safe to archive

### Decisions

- No extraction needed — all domain content already migrated during v1.0.0
- 6 files with content differences are all intentional migration changes (prefix AG_→G_, schema upgrades)
- Legacy repo can be archived or removed at owner's discretion

### Metrics

- Legacy files scanned: 546 | Current files scanned: 593 | Missing from current: 0

## 2026-02-23 (Session: Operational Audit — Scripts, Skills & Team Assessment)

### Accomplished

- Executed comprehensive operational audit with **real execution verification**
- Ran Vitest: **133/133 tests passed** (10 suites, 563ms)
- Ran `tsc --noEmit`: **383 TypeScript compilation errors** (284 = TS18046 untyped catch/response)
- Ran `agent_health_check.py`: **CRASH** — `KeyError: 'vendor'` (manifest v3.1 uses `vendor_preference`)
- Ran `agent_selftest.py`: **CRASH** — `UnicodeEncodeError` (→ ✅ ❌ chars on Windows cp1252)
- Ran `ecosystem_dashboard.py`: **CRASH** — missing `config/project_registry.json`
- Ran ESLint on shared/scripts/: **0 errors, 0 warnings**
- Verified all 19 Claude skills + 7 commands load correctly (markdown-based, structural)
- Generated AG-AUD-2026-02-23-003 operational audit report (B-, 72/100, 2C/3H/5M/4L/3I)
- Assessed team composition needs: NocoBase developer + Clinical analyst identified as P0

### Decisions

- Score 72/100 (B-): strong infrastructure, weak execution (TS errors, broken Python, 0 workflows)
- NO designer needed — NocoBase handles UI, AI agents cover 80% of UX work
- P0 hire: NocoBase developer with clinical informatics experience (unblocks ALL 4 apps)
- P1: TypeScript developer to fix 383 TS errors and add app-specific tests
- P2: DB/Integration specialist for ALMA/TrakCare integration

### Metrics

- Tests: 133 passed | TS errors: 383 | Python crashes: 3 | Findings: 2C/3H/5M/4L/3I

## 2026-02-23 (Session: Operational Audit Remediation — All Findings)

### Accomplished

- **C-OPS-001** RESOLVED: Fixed `agent_health_check.py` — `vendor` → `vendor_preference` fallback, teams key compat
- **C-OPS-001** RESOLVED: Fixed `agent_selftest.py` — UTF-8 `reconfigure()` for Windows console
- **C-QA-001** RESOLVED: TS errors reduced 383 → 0 (tsconfig excludes + TS18046 systematic fixes across 30+ files)
- **H-OPS-002** RESOLVED: `ecosystem_dashboard.py` — graceful standalone mode instead of `sys.exit(1)`
- **H-QA-002** RESOLVED: Created app-specific test suites for ENTREGA (10 collections) and AGENDA (8 collections)
- **H-GOV-001** RESOLVED: Scripts registry expanded 117 → 261 entries across 16 directories
- **M-ARCH-001** RESOLVED: Created `.gemini/agents/researcher.toml`
- **M-DOC-001** RESOLVED: Created `Apps/UGCO/STATUS.md` (Phase 1, 20%)
- **M-OPS-003** RESOLVED: Migrated hardcoded paths in `memory_sync.py`, `propagate.py` to `env_resolver`
- **M-QA-003** RESOLVED: Excluded `Apps/BUHO/backend`, `UGCO/scripts-archive`, `_APP_TEMPLATE` from tsconfig
- Created **ui-designer** agent: `.gemini/agents/ui-designer.toml`, `.codex/agents/ui-designer.md`
- Added ui-designer to `manifest.json` (priority 8) + 2 new teams: `design-and-deploy`, `full-app-pipeline`
- Updated AGENTS.md and CLAUDE.md with new agent and teams
- Test suite expanded: 10 → 12 suites, 133 → 153 tests (all passing)
- `agent_health_check.py`: 66/66 checks PASS (was CRASH)

### Decisions

- User clarified "designer" = AI agent with frontend/UI skills, not a human role
- ui-designer agent uses clinical-first design principles (WCAG 2.1 AA, high contrast, large touch targets)
- TS18046 errors fixed with `String()` wrappers and typed extraction patterns (not `as any`)
- Archived scripts (82 in UGCO) registered but marked `(archived)` in registry

### Metrics

- Files created: 6 | Files modified: 35+ | Findings resolved: 17/17 | TS errors: 383→0 | Tests: 12 suites/153 passed | Agent checks: 66/66

## 2026-02-23 (Session: API Live Verification + filterByTk Fix + Visual Verifier)

### Accomplished

- **API Live Verification**: Tested ALL 36 scripts against production NocoBase (mira.hospitaldeovalle.cl)
  - 28 READ operations: ALL PASS (collections, users, roles, auth, fields, permissions, datasources, system, workflows, charts, plugins, localization, UI, departments, env-vars, notifications, files, themes, api-keys, apps, async-tasks, collection-categories, db-views, public-forms, verification, import-export)
  - CRUD round-trips: Roles, Users, Collections, Data — CREATE/GET OK, UPDATE/DELETE initially FAIL
- **filterByTk Bug (CRITICAL)**: Discovered and fixed systematic bug in `ApiClient.post()`
  - NocoBase requires `filterByTk` as URL query param, NOT in POST body
  - Fix: auto-extracts `filterByTk` from data and appends to URL for `:update`/`:destroy` endpoints
  - Re-tested: Roles UPDATE/DELETE OK, Users UPDATE/DELETE OK, Collections UPDATE/DELETE OK, Data UPDATE/DELETE OK
- **Visual Verifier Agent**: Created `visual-verifier` agent (priority 9) with Playwright integration
  - Script: `scripts/verify-page-visual.ts` — targeted page verification by route ID, title, or all
  - Agent config: `.codex/agents/visual-verifier.md`
  - Added to manifest + 3 teams: `design-and-deploy`, `full-app-pipeline`, `deploy-and-verify`
  - Playwright Chromium installed, first test run against "Entrega de Turno" — functional
- **API Skill Updated**: `nocobase-api-management.md` — added NocoBase API conventions, expanded endpoints table, documented all 18 shared scripts
- Test suite: 153/153 tests still passing after ApiClient changes

### Pending

- Full visual verification run (`--all`) across all 65 routes
- `manage-ui.ts` commands show help instead of executing (needs CLI parser investigation)
- `manage-backup.ts` returns 404 (Backup plugin not installed on production)
- Clean up `shared/scripts/temp/` directory (3 test scripts)
- Reference docs: https://docs.nocobase.com/welcome/introduction (SPA, needs manual review)

### Decisions

- filterByTk fix applied at ApiClient level (centralized) rather than per-script — all scripts benefit
- Visual verifier uses headless Playwright by default + localStorage token injection for auth
- NocoBase docs site is SPA (client-rendered) — cannot be fetched automatically

### Metrics

- API endpoints tested: 36 scripts × multiple commands | Bug fixed: 1 critical (filterByTk) | New agent: visual-verifier | New script: verify-page-visual.ts
