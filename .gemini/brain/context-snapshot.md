# Context Snapshot — 2026-02-17

## Last Session: 2026-02-17 (Session: Security Audit & Ecosystem Remediation)

## Current State

### 📋 Backlog (4)
- [ ] 🟠 **SEC**: Remove `--dangerously-skip-permissions` flags for production dispatch (H-01)
- [ ] 🟡 **SEC**: Require API auth in all environments (M-02)
- [ ] 🟡 **SEC**: Replace `eval` in health-check.sh with direct execution (M-01)
- [ ] 🟡 **SEC**: Remove input echo from agent_service.py responses (H-02)

### ✅ Recently Completed
- 🔒 Ecosystem security remediation: 12/13 findings fixed across 5 AG projects
- 🔒 G_Plantilla: dev-secret-key → change-me + validator, CORS restricted, MCP scoped, dispatch delimiters
- 🔒 G_SV_Agent: 3 critical credential exposures fixed
- 🔒 G_NB_Apps: SIDRA password redacted from JSON files
- 🔒 G_Notebook + G_Hospital_Organizador + G_DeepResearch: config + CORS fixes
