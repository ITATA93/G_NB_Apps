#!/usr/bin/env bash
# Deploy UGCO to mira.imedicina.cl
# Usage: bash Apps/UGCO/scripts/nocobase/deploy-to-imed.sh

set -e

export NOCOBASE_BASE_URL=https://mira.imedicina.cl/api
export NOCOBASE_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGVOYW1lIjoicm9vdCIsImlhdCI6MTc3MjQ4NjE4NywiZXhwIjoyMDg3ODQ2MTg3fQ.565epcwk5GXx2zvLSMBF5QcmJros3G23uw7MenZUyMU

echo "═══════════════════════════════════════════════"
echo "  UGCO Deployment → mira.imedicina.cl"
echo "═══════════════════════════════════════════════"
echo ""

DIR="Apps/UGCO/scripts/nocobase"

echo "── Phase 1: REF Collections (20 tables + seed) ──"
npx tsx "$DIR/phase1-ref-collections.ts"
echo ""

echo "── Phase 2: UGCO Collections (11 tables) ──"
npx tsx "$DIR/phase2-ugco-collections.ts"
echo ""

echo "── Phase 3: ALMA + Relationships ──"
npx tsx "$DIR/phase3-alma-and-relations.ts"
echo ""

echo "── Phase 4: Pages & Menu ──"
npx tsx "$DIR/phase5-pages.ts"
echo ""

echo "── Phase 5: Event Enhancements ──"
npx tsx "$DIR/enhance-eventos.ts"
echo ""

echo "── Phase 6: Observaciones + Roles ──"
npx tsx "$DIR/add-observaciones-and-roles.ts"
echo ""

echo "── Phase 7: ACL Clean ──"
npx tsx "$DIR/fix-acl-clean.ts"
echo ""

echo "── Phase 8: Page Visibility ──"
npx tsx "$DIR/set-page-visibility.ts"
echo ""

echo "── Phase 9: Verification ──"
npx tsx "$DIR/phase8-verify.ts"
echo ""

echo "── Phase 10: Fix UGCO v2 (seed + charts + FK + filters) ──"
npx tsx "$DIR/fix-ugco-v2.ts"
echo ""

echo "═══════════════════════════════════════════════"
echo "  DEPLOYMENT COMPLETE"
echo "  URL: https://mira.imedicina.cl/admin/"
echo "═══════════════════════════════════════════════"
