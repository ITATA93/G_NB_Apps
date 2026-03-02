#!/usr/bin/env bash
# cleanup_temp.sh — Identificar y limpiar archivos temporales
#
# Busca e identifica archivos temporales en el proyecto:
#   - shared/scripts/temp/TEMP_*.ts (stubs de diagnostico)
#   - shared/scripts/temp/__*.ts (scripts de prueba)
#   - Otros archivos temp identificados en auditoria
#
# Uso:
#   bash scripts/cleanup_temp.sh              # Solo listar (no eliminar)
#   bash scripts/cleanup_temp.sh --delete     # Listar y eliminar
#   bash scripts/cleanup_temp.sh --archive    # Mover a docs/archive/temp/

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

DELETE=false
ARCHIVE=false

for arg in "$@"; do
    case "$arg" in
        --delete) DELETE=true ;;
        --archive) ARCHIVE=true ;;
    esac
done

echo "============================================================"
echo "  Cleanup Temp Files — G_NB_Apps"
echo "============================================================"
echo ""
echo "  Directorio: $PROJECT_ROOT"
echo "  Modo: $(if $DELETE; then echo 'ELIMINAR'; elif $ARCHIVE; then echo 'ARCHIVAR'; else echo 'Solo listar'; fi)"
echo ""

# ── Buscar archivos temporales ───────────────────────────────────────────────

TEMP_FILES=()

# 1. TEMP stubs en shared/scripts/temp/
echo "--- Buscando stubs TEMP_*.ts ---"
if [ -d "shared/scripts/temp" ]; then
    while IFS= read -r -d '' file; do
        TEMP_FILES+=("$file")
        SIZE=$(wc -c < "$file" | tr -d ' ')
        echo "  [TEMP] $file ($SIZE bytes)"
    done < <(find "shared/scripts/temp" -name "TEMP_*.ts" -print0 2>/dev/null)
fi

# 2. Test/cleanup scripts en shared/scripts/temp/
echo ""
echo "--- Buscando scripts diagnosticos __*.ts ---"
if [ -d "shared/scripts/temp" ]; then
    while IFS= read -r -d '' file; do
        TEMP_FILES+=("$file")
        SIZE=$(wc -c < "$file" | tr -d ' ')
        echo "  [DIAG] $file ($SIZE bytes)"
    done < <(find "shared/scripts/temp" -name "__*.ts" -print0 2>/dev/null)
fi

# 3. deploy-oncologia.ts en temp (stub obsoleto)
echo ""
echo "--- Buscando stubs deploy obsoletos en temp ---"
if [ -f "shared/scripts/temp/deploy-oncologia.ts" ]; then
    TEMP_FILES+=("shared/scripts/temp/deploy-oncologia.ts")
    SIZE=$(wc -c < "shared/scripts/temp/deploy-oncologia.ts" | tr -d ' ')
    echo "  [STUB] shared/scripts/temp/deploy-oncologia.ts ($SIZE bytes)"
fi

echo ""
echo "  Total archivos temporales encontrados: ${#TEMP_FILES[@]}"
echo ""

if [ ${#TEMP_FILES[@]} -eq 0 ]; then
    echo "  Sin archivos temporales que limpiar."
    echo ""
    echo "============================================================"
    echo "  Cleanup completado — nada que hacer."
    echo "============================================================"
    exit 0
fi

# ── Ejecutar accion ──────────────────────────────────────────────────────────

if $ARCHIVE; then
    ARCHIVE_DIR="docs/archive/temp-$(date +%Y%m%d)"
    echo "--- Archivando a $ARCHIVE_DIR ---"
    mkdir -p "$ARCHIVE_DIR"

    for file in "${TEMP_FILES[@]}"; do
        BASENAME=$(basename "$file")
        echo "  Moviendo: $file -> $ARCHIVE_DIR/$BASENAME"
        mv "$file" "$ARCHIVE_DIR/$BASENAME"
    done

    echo ""
    echo "  ${#TEMP_FILES[@]} archivos archivados en $ARCHIVE_DIR"

elif $DELETE; then
    echo "--- Eliminando archivos temporales ---"
    echo ""

    for file in "${TEMP_FILES[@]}"; do
        echo "  Eliminando: $file"
        rm -f "$file"
    done

    # Limpiar directorio temp si quedo vacio
    if [ -d "shared/scripts/temp" ]; then
        REMAINING=$(find "shared/scripts/temp" -type f | wc -l)
        if [ "$REMAINING" -eq 0 ]; then
            echo ""
            echo "  Directorio shared/scripts/temp/ vacio — eliminando"
            rm -rf "shared/scripts/temp"
        fi
    fi

    echo ""
    echo "  ${#TEMP_FILES[@]} archivos eliminados."

else
    echo "  [INFO] Usar --delete para eliminar o --archive para archivar."
    echo "  [INFO] Sin la bandera, solo se listan los archivos."
fi

echo ""
echo "============================================================"
echo "  Cleanup completado."
echo "============================================================"
