---
depends_on: []
impacts: []
---

# Changelog — G_NB_Apps

All notable changes to this project will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **ui-designer agent**: `.gemini/agents/ui-designer.toml`, `.codex/agents/ui-designer.md` — clinical-first UI design
- 2 new dispatch teams: `design-and-deploy`, `full-app-pipeline`
- `.gemini/agents/researcher.toml` — missing Gemini researcher agent definition (M-ARCH-001)
- `Apps/UGCO/STATUS.md` — app status tracking (M-DOC-001)
- App-specific test suites: ENTREGA (10 collections), AGENDA (8 collections) — 20 new tests (H-QA-002)

### Fixed

- `agent_health_check.py` — manifest v3.1 compat: `vendor_preference` fallback, teams key (C-OPS-001)
- `agent_selftest.py` — UTF-8 reconfigure for Windows console (C-OPS-001)
- `ecosystem_dashboard.py` — graceful standalone mode when registry missing (H-OPS-002)
- `memory_sync.py`, `propagate.py` — migrated hardcoded paths to `env_resolver` (M-OPS-003)
- TypeScript errors reduced 383 → 0 via tsconfig excludes + TS18046 systematic fixes across 30+ files (C-QA-001)

### Changed

- `docs/library/scripts.md` — registry expanded 117 → 261 entries across 16 directories (H-GOV-001)
- `tsconfig.json` — excluded `Apps/BUHO/backend`, `UGCO/scripts-archive`, `_APP_TEMPLATE` (M-QA-003)
- `.subagents/manifest.json` — added ui-designer agent + 2 teams
- `AGENTS.md`, `CLAUDE.md` — updated with new agent and teams

### Verified

- Legacy repo `AG_NB_Apps` fully superseded — 0 missing files, 544 shared files identical, 49 new files in current

## [3.0.0] — 2026-02-23

### Added

- BUHO: README.md, STATUS.md, CHANGELOG.md, .env.example (H-DOC-001)
- ENTREGA: STATUS.md, CHANGELOG.md, .env.example (M-DOC-002, L-SEC-001)
- AGENDA: STATUS.md, CHANGELOG.md, .env.example (M-DOC-002, L-SEC-001)
- `tests/README.md` documenting test strategy and locations (M-QA-001)
- `docs/standards/app-documentation-checklist.md` — minimum app docs standard (M-DOC-003)
- Frontmatter (`depends_on`/`impacts`) to CONTRIBUTING.md, VALIDATION_SUMMARY.md, Apps/README.md (M-DATA-001)

### Changed

- `docs/library/scripts.md` — full registry of 87 scripts (was 32) (C-GOV-001)
- Removed 3 phantom scripts from registry: manage-menu.ts, manage-relationships.ts, manage-ui-blocks.ts (H-GOV-002)
- Moved 12 misplaced docs/ root files to proper subdirectories per output routing table (M-GOV-003)
- Updated `docs/standards/output_governance.md` — added CONTRIBUTING.md, DEVLOG.md, VALIDATION_SUMMARY.md to root exceptions (I-GOV-004)
- Updated CLAUDE.md project structure — added .github/, app-spec/, docs subdirectories (I-ARCH-001)
- Consolidated docs/DEVLOG.md to redirect to root DEVLOG.md (L-DATA-002)
- Updated `docs/audit/INDEX.md` with active audit reports (H-OPS-001)

### Removed

- Removed empty `config/` and `tests/` from CLAUDE.md structure (replaced with documented locations)

## [2.5.0] — 2026-02-23

### Changed

- Upgraded `.subagents/manifest.json` from v2.0.0 to v3.1 schema (aligned with G_Plantilla)
- Updated `.claude/settings.json` to v2.1.0 with domain-specific config
- Expanded CLAUDE.md with full command reference, skills catalog, and output governance
- Expanded AGENTS.md with v3.1 manifest details, vendor support matrix, and usage examples

### Added

- Created DEVLOG.md for session tracking
- Added domain-specific triggers to agents (nocobase, collection, patient data awareness)
- Verified and documented all 16 NocoBase skills
- Documented all 8 agent teams with dispatch examples

## [1.0.0] — 2026-02-23

### Added
- Full GEN_OS mirror infrastructure migrated from AG_NB_Apps.
- Multi-vendor dispatch: .subagents/, .claude/, .codex/, .gemini/, .agent/.
- Governance standards: docs/standards/.
- CI/CD workflows: .github/workflows/.
- All domain content preserved from AG_NB_Apps.
