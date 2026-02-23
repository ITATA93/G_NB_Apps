#!/bin/bash
# Claude Code API Call Hook
# Ejecutado cuando se hace una llamada a API de NocoBase

TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
API_LOG=".claude/logs/api-calls-$(date +%Y%m%d).log"
SESSION_LOG=".claude/logs/session-$(date +%Y%m%d).log"

# Recibir parámetros de la API call
ENDPOINT="${1:-unknown}"
METHOD="${2:-GET}"
STATUS_CODE="${3:-000}"
RESPONSE_TIME="${4:-0}"

# Crear directorio de logs si no existe
mkdir -p .claude/logs

# Registrar llamada en formato JSON
cat >> "$API_LOG" << EOF
{
  "timestamp": "$TIMESTAMP",
  "endpoint": "$ENDPOINT",
  "method": "$METHOD",
  "status_code": $STATUS_CODE,
  "response_time_ms": $RESPONSE_TIME
}
EOF

# Registrar en log de sesión con nivel apropiado
if [ "$STATUS_CODE" -ge 200 ] && [ "$STATUS_CODE" -lt 300 ]; then
    LEVEL="INFO"
elif [ "$STATUS_CODE" -ge 400 ]; then
    LEVEL="ERROR"
else
    LEVEL="WARNING"
fi

echo "[$TIMESTAMP] [$LEVEL] API $METHOD $ENDPOINT - Status: $STATUS_CODE - Time: ${RESPONSE_TIME}ms" >> "$SESSION_LOG"

# Alertar si response time es muy alto
if [ "$RESPONSE_TIME" -gt 5000 ]; then
    echo "[$TIMESTAMP] [WARNING] Slow API response detected: ${RESPONSE_TIME}ms for $ENDPOINT" >> "$SESSION_LOG"
fi

# Incrementar contador de API calls
API_COUNT_FILE=".claude/memory/api_count_$(date +%Y%m%d).txt"
if [ -f "$API_COUNT_FILE" ]; then
    API_COUNT=$(($(cat "$API_COUNT_FILE") + 1))
else
    API_COUNT=1
fi
echo "$API_COUNT" > "$API_COUNT_FILE"

# Guardar última API call para contexto
cat > ".claude/memory/last_api_call.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "endpoint": "$ENDPOINT",
  "method": "$METHOD",
  "status_code": $STATUS_CODE,
  "response_time_ms": $RESPONSE_TIME
}
EOF

exit 0
