#!/bin/bash
# Claude Code File Change Hook
# Ejecutado cuando se modifica un archivo

TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
CHANGES_LOG=".claude/logs/file-changes-$(date +%Y%m%d).log"
SESSION_LOG=".claude/logs/session-$(date +%Y%m%d).log"

# Recibir parámetros del cambio
FILE_PATH="${1:-unknown}"
CHANGE_TYPE="${2:-modified}"  # created, modified, deleted
LINES_ADDED="${3:-0}"
LINES_REMOVED="${4:-0}"

# Crear directorio de logs si no existe
mkdir -p .claude/logs

# Registrar cambio en formato JSON
cat >> "$CHANGES_LOG" << EOF
{
  "timestamp": "$TIMESTAMP",
  "file": "$FILE_PATH",
  "change_type": "$CHANGE_TYPE",
  "lines_added": $LINES_ADDED,
  "lines_removed": $LINES_REMOVED
}
EOF

# Registrar en log de sesión
echo "[$TIMESTAMP] [FILE_CHANGE] $CHANGE_TYPE: $FILE_PATH (+$LINES_ADDED -$LINES_REMOVED)" >> "$SESSION_LOG"

# Verificar si archivo contiene secretos (básico)
if echo "$FILE_PATH" | grep -qE "\.(env|key|pem|secret)$"; then
    echo "[$TIMESTAMP] [WARNING] Sensitive file modified: $FILE_PATH" >> "$SESSION_LOG"
    echo "⚠️  Advertencia: Archivo sensible modificado. Asegúrate de no committear secretos."
fi

# Verificar si es un archivo crítico
CRITICAL_FILES=(
    "app-spec/app.yaml"
    ".claude/settings.json"
    "package.json"
    ".gitignore"
)

for critical_file in "${CRITICAL_FILES[@]}"; do
    if [ "$FILE_PATH" = "$critical_file" ]; then
        echo "[$TIMESTAMP] [ALERT] Critical file modified: $FILE_PATH" >> "$SESSION_LOG"
        echo "⚠️  ALERTA: Archivo crítico modificado: $FILE_PATH"
        break
    fi
done

# Actualizar contador de cambios
CHANGES_COUNT_FILE=".claude/memory/changes_count_$(date +%Y%m%d).txt"
if [ -f "$CHANGES_COUNT_FILE" ]; then
    CHANGES_COUNT=$(($(cat "$CHANGES_COUNT_FILE") + 1))
else
    CHANGES_COUNT=1
fi
echo "$CHANGES_COUNT" > "$CHANGES_COUNT_FILE"

exit 0
