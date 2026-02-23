#!/bin/bash
# Claude Code Error Hook
# Ejecutado cuando ocurre un error

TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
ERROR_LOG=".claude/logs/errors-$(date +%Y%m%d).log"
SESSION_LOG=".claude/logs/session-$(date +%Y%m%d).log"

# Recibir parámetros del error
ERROR_TYPE="${1:-unknown}"
ERROR_MESSAGE="${2:-No error message provided}"
ERROR_CONTEXT="${3:-}"

# Crear directorio de logs si no existe
mkdir -p .claude/logs

# Registrar error en formato JSON
cat >> "$ERROR_LOG" << EOF
{
  "timestamp": "$TIMESTAMP",
  "type": "$ERROR_TYPE",
  "message": "$ERROR_MESSAGE",
  "context": "$ERROR_CONTEXT",
  "session": "$(cat .claude/memory/last_session_start.txt 2>/dev/null || echo 'unknown')"
}
EOF

# Registrar también en log de sesión
echo "[$TIMESTAMP] [ERROR] Type: $ERROR_TYPE | Message: $ERROR_MESSAGE" >> "$SESSION_LOG"

# Determinar severidad y acción
case "$ERROR_TYPE" in
    "api_error")
        echo "[$TIMESTAMP] [ERROR] API error detected. Check NocoBase connectivity." >> "$SESSION_LOG"
        ;;
    "file_not_found")
        echo "[$TIMESTAMP] [ERROR] File not found. Check file path." >> "$SESSION_LOG"
        ;;
    "permission_denied")
        echo "[$TIMESTAMP] [ERROR] Permission denied. Check file permissions or settings.json." >> "$SESSION_LOG"
        ;;
    "syntax_error")
        echo "[$TIMESTAMP] [ERROR] Syntax error detected. Review code syntax." >> "$SESSION_LOG"
        ;;
    *)
        echo "[$TIMESTAMP] [ERROR] Unknown error type." >> "$SESSION_LOG"
        ;;
esac

# Incrementar contador de errores de la sesión
ERROR_COUNT_FILE=".claude/memory/error_count_$(date +%Y%m%d).txt"
if [ -f "$ERROR_COUNT_FILE" ]; then
    ERROR_COUNT=$(($(cat "$ERROR_COUNT_FILE") + 1))
else
    ERROR_COUNT=1
fi
echo "$ERROR_COUNT" > "$ERROR_COUNT_FILE"

# Si hay muchos errores, alertar
if [ "$ERROR_COUNT" -gt 10 ]; then
    echo "[$TIMESTAMP] [ALERT] High error count detected: $ERROR_COUNT errors today" >> "$SESSION_LOG"
    echo "⚠️  ALERTA: $ERROR_COUNT errores detectados hoy. Revisa logs: $ERROR_LOG"
fi

# Guardar contexto del error para análisis posterior
ERROR_CONTEXT_FILE=".claude/memory/last_error_context.json"
cat > "$ERROR_CONTEXT_FILE" << EOF
{
  "timestamp": "$TIMESTAMP",
  "type": "$ERROR_TYPE",
  "message": "$ERROR_MESSAGE",
  "count_today": $ERROR_COUNT
}
EOF

exit 0
