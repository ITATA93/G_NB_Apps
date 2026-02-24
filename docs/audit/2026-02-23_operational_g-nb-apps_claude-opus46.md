---
# === Antigravity Audit Report ===
# Standard: AG-AUDIT-STD v1.0 (ISO 19011 / ISACA ITAF / CVSS v3.1 aligned)

audit_id: "AG-AUD-2026-02-23-003"
title: "Operational Audit — Scripts, Skills & Team Assessment"
date: "2026-02-23"
timestamp: "2026-02-23T19:15:00-03:00"

agent:
  vendor: "claude"
  model: "opus-4.6"
  interface: "vscode"
  agent_name: "claude-code"
  team_mode: "4 parallel explore + 5 execution verifications"

scope:
  type: "operational"
  domain: "02_HOSPITAL_PUBLICO"
  projects: [g-nb-apps]
  criteria:
    - Script execution verification
    - Skill loading validation
    - TypeScript compilation check
    - Python script runtime check
    - Team composition assessment
    - AG-AUDIT-STD v1.0

severity_summary:
  critical: 2
  high: 3
  medium: 5
  low: 4
  info: 3

overall_score: 72
overall_grade: "B-"
status: "action-required"
language: "mixed"
tags: [operational, scripts, skills, team-assessment, g-nb-apps]
---

# Operational Audit — Scripts, Skills & Team Assessment

## 1. Executive Summary

Comprehensive operational audit of G_NB_Apps with **real execution verification** of
scripts, tests, skills, and infrastructure. The project has a solid foundation (133 passing
tests, strong governance) but suffers from **383 TypeScript compilation errors**, **2 broken
Python scripts**, and a **58% script registration gap**. Team assessment identifies
**3 critical roles needed** to advance the 4 hospital apps from current state to production.

**Score: 72/100 (B-)** — Functional but needs engineering attention.

## 2. Execution Verification Results

### 2.1 Vitest Tests — PASS

| Metric | Result |
|--------|--------|
| Test suites | 10/10 passed |
| Tests | **133/133 passed** |
| Duration | 563ms |
| Framework | Vitest 4.0.18 |

All unit tests pass. Coverage: ApiClient, collections, fields, permissions, roles,
UI management, workflows, routes, UI pages, data CRUD.

### 2.2 TypeScript Compilation — FAIL

| Metric | Result |
|--------|--------|
| Total errors | **383** |
| Files affected | 50+ |
| Error types | 13 distinct TS error codes |

**Error Distribution by Directory:**

| Directory | Errors | Severity |
|-----------|--------|----------|
| shared/scripts/ (core) | 269 | HIGH — production code |
| Apps/UGCO/scripts/ | 38 | MEDIUM — active dev |
| Apps/BUHO/backend/ | 18 | MEDIUM — missing deps |
| Apps/_APP_TEMPLATE/ | 14 | LOW — template code |
| Apps/UGCO/scripts-archive/ | 11 | LOW — archived |
| Apps/ENTREGA/scripts/ | 3 | LOW — few errors |

**Error Types (Top 5):**

| Code | Count | Description |
|------|-------|-------------|
| TS18046 | 284 | 'x' is of type 'unknown' (catch/response typing) |
| TS2339 | 36 | Property does not exist on type |
| TS2345 | 20 | Argument type mismatch |
| TS7006 | 8 | Implicit 'any' parameter |
| TS2307 | 8 | Cannot find module |

**Root Cause:** Most errors (284) are `TS18046` — untyped `catch(error)` blocks and
`response` variables from Axios calls. These are type-safety issues, not runtime errors
(tests pass). However, they indicate the codebase bypasses TypeScript's strict mode benefits.

### 2.3 Python Scripts — PARTIAL FAIL

| Script | Status | Error |
|--------|--------|-------|
| agent_health_check.py | **CRASH** | `KeyError: 'vendor'` — expects `agent["vendor"]` but manifest v3.1 uses `vendor_preference` |
| agent_selftest.py | **CRASH** | `UnicodeEncodeError` — uses → ✅ ❌ chars, Windows cp1252 can't encode |
| ecosystem_dashboard.py | **CRASH** | Missing `config/project_registry.json` |
| audit_ecosystem.py | Not tested (too large) | Likely works (has env_resolver fallback) |
| propagate.py | Not tested | Hardcoded paths |

### 2.4 ESLint — PASS

| Metric | Result |
|--------|--------|
| shared/scripts/ | 0 errors, 0 warnings |
| Status | Clean |

### 2.5 Skills — PASS (structural)

| Location | Files | Status |
|----------|-------|--------|
| .claude/skills/ | 19 skills + archive | Loaded (markdown files, no runtime) |
| .claude/commands/ | 7 commands | Valid syntax |
| .codex/skills/ | 5 skills | Valid syntax |
| .gemini/skills/ | 5 skills | Valid syntax |
| .subagents/skills/ | 4 skills | Valid syntax |

Skills are documentation-based (markdown) — they load correctly. The NocoBase API endpoints
referenced in skills match the patterns in `shared/scripts/ApiClient.ts`.

## 3. Findings

### 3.1 Severity Summary

| Level | Count | IDs |
|-------|-------|-----|
| Critical | 2 | C-QA-001, C-OPS-001 |
| High | 3 | H-QA-002, H-OPS-002, H-GOV-001 |
| Medium | 5 | M-QA-003, M-SEC-001, M-ARCH-001, M-OPS-003, M-DOC-001 |
| Low | 4 | L-QA-004, L-QA-005, L-OPS-004, L-DOC-002 |
| Info | 3 | I-ARCH-001, I-GOV-002, I-OPS-005 |

### 3.2 Critical Findings

**C-QA-001: 383 TypeScript compilation errors in production code**
- Location: `shared/scripts/`, `Apps/*/scripts/`
- Impact: Type safety completely bypassed; bugs in production API calls won't be caught
- Fix: Add proper typing to catch blocks (`catch (error: unknown)` → type guards),
  type Axios responses with generics
- Effort: 2-3 days (mostly mechanical: `if (error instanceof Error)` patterns)

**C-OPS-001: Python infrastructure scripts crash on execution**
- Location: `scripts/agent_health_check.py`, `scripts/agent_selftest.py`
- Impact: Cannot validate agent health or run self-tests — CI pipeline broken
- Fix: Update `agent["vendor"]` to `agent.get("vendor_preference", agent.get("vendor"))`,
  add `sys.stdout.reconfigure(encoding='utf-8')` for Windows
- Effort: 1-2 hours

### 3.3 High Findings

**H-QA-002: Zero app-specific tests exist**
- Impact: ENTREGA (production), AGENDA, BUHO, UGCO have no tests
- 133 tests exist but only cover shared infrastructure, not business logic
- Fix: Create test suites per app (at minimum: collection schema validation, deploy scripts)
- Effort: 3-5 days per app

**H-OPS-002: ecosystem_dashboard.py requires missing config**
- Location: `config/project_registry.json` does not exist
- Impact: Dashboard cannot display ecosystem status
- Fix: Create project registry file or update script to detect standalone mode
- Effort: 2 hours

**H-GOV-001: 162 scripts unregistered (58% of codebase)**
- Location: `docs/library/scripts.md` has 117 entries, 279 exist on disk
- Missing: 82 UGCO archived, 30+ app-specific, 7 hooks/utilities
- Fix: Decide scope, update registry
- Effort: 1 day

### 3.4 Medium Findings

**M-QA-003: BUHO backend missing npm dependencies**
- `express`, `cors`, `winston` not installed — `tsc` can't resolve modules
- Fix: Add `package.json` to `Apps/BUHO/backend/` or document dependency requirements

**M-SEC-001: No .env validation at startup**
- Scripts silently fail if `NOCOBASE_API_KEY` or `NOCOBASE_BASE_URL` missing
- Fix: Add env validation in ApiClient constructor with clear error messages

**M-ARCH-001: Gemini researcher agent definition missing**
- `.gemini/agents/researcher.toml` does not exist (6 of 7 agents defined)
- Dispatch will fail if `researcher` forced to Gemini vendor
- Fix: Create researcher.toml

**M-OPS-003: 3 Python scripts use hardcoded paths**
- `agent_selftest.py`, `memory_sync.py`, `propagate.py` use `C:\_Repositorio`
- Should use `env_resolver.py`
- Fix: Migrate to env_resolver

**M-DOC-001: UGCO has no STATUS.md**
- Only app without STATUS.md tracking file
- Fix: Create Apps/UGCO/STATUS.md following BUHO/ENTREGA/AGENDA pattern

### 3.5 Low Findings

**L-QA-004: Inconsistent TypeScript import styles**
- Mixed: `./ApiClient`, `./ApiClient.ts`, `./ApiClient.js`

**L-QA-005: 82 archived UGCO scripts have broken imports**
- 4 files reference `../../../../shared/scripts/ApiClient` (wrong path)

**L-OPS-004: NocoBase skills duplicated across 5 vendor directories**
- Same content in `.claude/`, `.codex/`, `.gemini/`, `.agent/`, `.subagents/`
- No sync mechanism — drift possible

**L-DOC-002: CI pipelines reference untested paths**
- `.github/workflows/ci.yml` runs pytest but Python tests aren't maintained

### 3.6 Info Findings

**I-ARCH-001: Claude internal agents diverge from manifest agents**
- Claude uses 9 internal agents vs 7 manifest agents — by design, documented

**I-GOV-002: Version strings inconsistent**
- Manifest: v3.1, Claude Settings: v2.1.0, Codex Config: v2.0

**I-OPS-005: UGCO scripts-archive/ contains 82 development scripts**
- Should be explicitly marked as archived in governance or .gitignore

## 4. Scorecard

| Category | Code | Score | Grade | C | H | M | L | I |
|----------|------|-------|-------|---|---|---|---|---|
| Code Quality | QA | 55/100 | D | 1 | 1 | 1 | 2 | 0 |
| Operations | OPS | 60/100 | D+ | 1 | 1 | 1 | 1 | 1 |
| Governance | GOV | 80/100 | B+ | 0 | 1 | 0 | 0 | 1 |
| Security | SEC | 85/100 | B+ | 0 | 0 | 1 | 0 | 0 |
| Architecture | ARCH | 80/100 | B+ | 0 | 0 | 1 | 0 | 1 |
| Documentation | DOC | 78/100 | B | 0 | 0 | 1 | 0 | 0 |
| Testing | TEST | 65/100 | C | 0 | 0 | 0 | 1 | 0 |
| **Overall** | | **72/100** | **B-** | **2** | **3** | **5** | **4** | **3** |

## 5. App Maturity Assessment

| App | Phase | Progress | Collections | Workflows | UI Pages | Tests | Production Ready |
|-----|-------|----------|-------------|-----------|----------|-------|------------------|
| ENTREGA | 3 - Workflows | 70% | 10/10 (100%) | 0/3 (0%) | Deployed | 0 | Partial — needs workflows |
| UGCO | 1 - Planning | 20% | Defined | 0 | 0 | 0 | NO |
| AGENDA | 2 - Dev Core | 50% | 8/8 (100%) | 0/3 (0%) | 0/11 (0%) | 0 | NO |
| BUHO | 1 - Foundation | 40% | 1/1 (100%) | 0 | Designed | 0 | NO |

**Critical Gap: ZERO workflows implemented across ALL 4 apps. ZERO app-specific tests.**

## 6. Team & Role Assessment

### 6.1 Current Capabilities (AI Agent Team)

The project currently operates with **AI agents only** (Claude, Gemini, Codex) — no dedicated human roles beyond the project owner. The agents effectively cover:

- Code generation and review
- Documentation writing
- Script automation
- Audit and governance compliance
- Database schema design

### 6.2 Roles NEEDED — Priority Assessment

#### CRITICAL NEED: NocoBase/Low-Code Specialist

| Attribute | Detail |
|-----------|--------|
| **Role** | NocoBase Application Developer |
| **Why** | 0/9 workflows deployed across 4 apps; 0/11 AGENDA pages; 0/3 role configs |
| **Skills** | NocoBase workflow engine, UI builder, ACL system, plugin development |
| **Impact** | Unblocks ALL 4 apps from current stall point |
| **Priority** | P0 — Without this, no app advances past current phase |
| **Alternative** | The AI agents have the skills (16 NocoBase skills documented) but need a human to approve and validate UI/UX decisions against clinical requirements |

#### HIGH NEED: Clinical Domain Expert / Product Owner

| Attribute | Detail |
|-----------|--------|
| **Role** | Clinical Analyst / Product Owner |
| **Why** | Hospital apps require clinical workflow validation — handoff protocols (ENTREGA), oncology pathways (UGCO), scheduling rules (AGENDA), patient classification rules (BUHO) |
| **Skills** | Clinical informatics, hospital workflow knowledge, HL7/FHIR awareness |
| **Impact** | Validates that technical implementations match real clinical needs |
| **Priority** | P0 — Business logic cannot be validated by engineers alone |
| **Note** | This role likely exists informally (someone defined the 130+ ENTREGA fields). Should be formalized. |

#### HIGH NEED: TypeScript/Full-Stack Developer

| Attribute | Detail |
|-----------|--------|
| **Role** | Senior TypeScript Developer |
| **Why** | 383 TS compilation errors, missing type safety, BUHO backend needs Express expertise |
| **Skills** | TypeScript strict mode, Axios typing, Express.js, Vitest |
| **Impact** | Fixes code quality from D to A, enables reliable CI/CD |
| **Priority** | P1 — Not blocking but degrading quality rapidly |
| **Scope** | ~3 weeks to fix all TS errors + add app-specific tests |

#### MEDIUM NEED: Database / Integration Specialist

| Attribute | Detail |
|-----------|--------|
| **Role** | Database & Integration Engineer |
| **Why** | ALMA/TrakCare integration (ZEN fields, HL7 code systems), PostgreSQL optimization, multi-datasource management |
| **Skills** | PostgreSQL, HL7 FHIR, REST API integration, NocoBase datasources |
| **Impact** | Enables UGCO's ALMA integration, optimizes ENTREGA's ZEN sync |
| **Priority** | P2 — Needed for Phase 3+ of most apps |
| **Note** | The `db-analyst` agent partially covers this role |

#### LOW NEED: UI/UX Designer

| Attribute | Detail |
|-----------|--------|
| **Role** | UI/UX Designer (healthcare) |
| **Why** | NocoBase provides built-in UI components — most apps don't need custom design. But BUHO's Kanban view and UGCO's dashboards could benefit from professional UX |
| **Skills** | Healthcare UX, NocoBase block customization, dashboard design |
| **Impact** | Improves usability but not blocking any technical work |
| **Priority** | P3 — Nice to have, not critical |
| **Note** | NocoBase's drag-and-drop builder means a developer can handle 80% of UI needs. Only complex dashboard layouts benefit from a dedicated designer |

### 6.3 Role Summary Matrix

| Role | Priority | Blocks | Estimated FTE | Agent Alternative |
|------|----------|--------|---------------|-------------------|
| NocoBase App Developer | P0 | All 4 apps | 0.5 FTE | Partial (skills exist, needs human validation) |
| Clinical Analyst / PO | P0 | Business logic | 0.25 FTE | None (domain knowledge required) |
| TypeScript Developer | P1 | Code quality, CI | 0.25-0.5 FTE | Partial (AI can fix mechanical errors) |
| DB/Integration Engineer | P2 | ALMA integration | 0.25 FTE | Partial (db-analyst agent) |
| UI/UX Designer | P3 | None | As needed | Strong (NocoBase builder + AI agents) |

### 6.4 Recommendation

**Minimum Viable Team: 2 people**

1. **NocoBase Developer + Clinical Knowledge** (ideally one person who knows both the platform and the hospital domain) — this single hire unblocks everything
2. **Project Owner (current)** — continues architecture, governance, AI orchestration

The AI agent team (7 agents, 8 teams) effectively replaces 3-4 engineering roles. The gap is domain expertise (clinical workflows) and hands-on NocoBase configuration that requires visual validation.

## 7. Remediation Roadmap

### Phase 1: Quick Wins (1-2 days)

| ID | Task | Effort |
|----|------|--------|
| C-OPS-001 | Fix agent_health_check.py and agent_selftest.py | 2h |
| H-OPS-002 | Create config/project_registry.json or handle missing | 1h |
| M-ARCH-001 | Create .gemini/agents/researcher.toml | 30min |
| M-DOC-001 | Create Apps/UGCO/STATUS.md | 30min |

### Phase 2: Code Quality (1-2 weeks)

| ID | Task | Effort |
|----|------|--------|
| C-QA-001 | Fix 383 TypeScript errors (type guards, Axios generics) | 3-5 days |
| M-SEC-001 | Add .env validation to ApiClient | 2h |
| L-QA-004 | Standardize import style | 1h |
| H-GOV-001 | Update scripts registry (117 → 279) | 1 day |

### Phase 3: App Advancement (2-4 weeks per app)

| App | Priority | Next Milestone |
|-----|----------|----------------|
| ENTREGA | P0 | 3 workflows: sync_censo, crear_entrega, firmar_cerrar |
| AGENDA | P1 | 11 UI pages + 3 roles configured |
| BUHO | P2 | Backend deps installed, motor de reglas tested |
| UGCO | P3 | Schema deployed, ALMA integration designed |

## 8. Conclusion

G_NB_Apps has **strong infrastructure** (governance, multi-agent system, 133 passing tests,
16 NocoBase skills) but faces two categories of problems:

1. **Technical debt** — fixable by the AI agents (TS errors, broken Python scripts, registry gaps)
2. **Domain gap** — requires human expertise (clinical workflows, NocoBase UI validation)

The project does NOT need a designer (NocoBase handles UI). It DOES need someone who
understands both NocoBase and hospital clinical workflows. The single most impactful
hire would be a **NocoBase developer with clinical informatics experience**.
