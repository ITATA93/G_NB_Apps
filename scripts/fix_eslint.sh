#!/usr/bin/env bash
# fix_eslint.sh — Batch fix ESLint warnings (no-unused-vars)
#
# Ejecuta ESLint con --fix en los directorios de scripts del proyecto.
# Objetivo: corregir las ~48 warnings de no-unused-vars en validate-*.ts
# y otros scripts.
#
# Uso:
#   bash scripts/fix_eslint.sh              # Fix + reporte
#   bash scripts/fix_eslint.sh --report     # Solo reporte (sin fix)
#   bash scripts/fix_eslint.sh --verbose    # Fix con salida detallada

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

REPORT_ONLY=false
VERBOSE=false

for arg in "$@"; do
    case "$arg" in
        --report) REPORT_ONLY=true ;;
        --verbose) VERBOSE=true ;;
    esac
done

echo "============================================================"
echo "  ESLint Fix — G_NB_Apps"
echo "============================================================"
echo ""
echo "  Directorio: $PROJECT_ROOT"
echo "  Modo: $(if $REPORT_ONLY; then echo 'Solo reporte'; else echo 'Fix + reporte'; fi)"
echo ""

# Directorios a procesar
DIRS=(
    "shared/scripts/"
    "Apps/UGCO/scripts/"
    "Apps/ENTREGA/scripts/"
    "Apps/AGENDA/scripts/"
    "Apps/ENTREGA/workflows/"
    "Apps/AGENDA/workflows/"
    "Apps/Oncologia/pages/"
    "scripts/"
)

# Paso 1: Reporte previo
echo "--- Reporte previo de warnings ---"
echo ""

TOTAL_WARNINGS=0
TOTAL_ERRORS=0

for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        # Contar warnings
        COUNT=$(npx eslint "$dir" --no-error-on-unmatched-pattern 2>/dev/null | grep -c "warning" || true)
        ERROR_COUNT=$(npx eslint "$dir" --no-error-on-unmatched-pattern 2>/dev/null | grep -c "error" || true)
        TOTAL_WARNINGS=$((TOTAL_WARNINGS + COUNT))
        TOTAL_ERRORS=$((TOTAL_ERRORS + ERROR_COUNT))
        echo "  $dir: $COUNT warnings, $ERROR_COUNT errors"
    fi
done

echo ""
echo "  Total previo: $TOTAL_WARNINGS warnings, $TOTAL_ERRORS errors"
echo ""

if $REPORT_ONLY; then
    echo "--- Modo reporte solamente (sin --fix) ---"
    echo ""
    npx eslint shared/scripts/ Apps/*/scripts/ scripts/ \
        --no-error-on-unmatched-pattern \
        --format stylish 2>/dev/null || true
    echo ""
    echo "============================================================"
    echo "  Reporte completado."
    echo "============================================================"
    exit 0
fi

# Paso 2: Aplicar fix
echo "--- Aplicando ESLint --fix ---"
echo ""

FIX_FLAGS="--fix --no-error-on-unmatched-pattern"
if $VERBOSE; then
    FIX_FLAGS="$FIX_FLAGS --debug"
fi

for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "  Fixing: $dir"
        npx eslint "$dir" $FIX_FLAGS 2>/dev/null || true
    fi
done

echo ""

# Paso 3: Reporte post-fix
echo "--- Reporte post-fix ---"
echo ""

POST_WARNINGS=0
POST_ERRORS=0

for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        COUNT=$(npx eslint "$dir" --no-error-on-unmatched-pattern 2>/dev/null | grep -c "warning" || true)
        ERROR_COUNT=$(npx eslint "$dir" --no-error-on-unmatched-pattern 2>/dev/null | grep -c "error" || true)
        POST_WARNINGS=$((POST_WARNINGS + COUNT))
        POST_ERRORS=$((POST_ERRORS + ERROR_COUNT))
        echo "  $dir: $COUNT warnings, $ERROR_COUNT errors"
    fi
done

FIXED=$((TOTAL_WARNINGS - POST_WARNINGS))

echo ""
echo "============================================================"
echo "  ESLint Fix completado"
echo "  Antes:   $TOTAL_WARNINGS warnings, $TOTAL_ERRORS errors"
echo "  Despues: $POST_WARNINGS warnings, $POST_ERRORS errors"
echo "  Fijados: $FIXED warnings"
echo "============================================================"
