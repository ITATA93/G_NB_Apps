#!/bin/bash
# Claude Code Task Complete Hook
# Ejecutado cuando se completa una tarea

TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
TASK_LOG=".claude/logs/tasks-$(date +%Y%m%d).log"
SESSION_LOG=".claude/logs/session-$(date +%Y%m%d).log"

# Recibir parámetros de la tarea
TASK_NAME="${1:-unknown_task}"
TASK_DURATION="${2:-0}"
TASK_STATUS="${3:-success}"
FILES_CHANGED="${4:-0}"

# Crear directorio de logs si no existe
mkdir -p .claude/logs
mkdir -p .claude/memory

# Registrar tarea completada
cat >> "$TASK_LOG" << EOF
{
  "timestamp": "$TIMESTAMP",
  "task": "$TASK_NAME",
  "duration_seconds": $TASK_DURATION,
  "status": "$TASK_STATUS",
  "files_changed": $FILES_CHANGED
}
EOF

# Registrar en log de sesión
if [ "$TASK_STATUS" = "success" ]; then
    LEVEL="INFO"
    EMOJI="✅"
else
    LEVEL="WARNING"
    EMOJI="⚠️"
fi

echo "[$TIMESTAMP] [$LEVEL] Task completed: $TASK_NAME - Status: $TASK_STATUS - Duration: ${TASK_DURATION}s" >> "$SESSION_LOG"

# Actualizar memoria de contexto
CONTEXT_FILE=".claude/memory/last_context.json"
cat > "$CONTEXT_FILE" << EOF
{
  "last_task": {
    "name": "$TASK_NAME",
    "timestamp": "$TIMESTAMP",
    "status": "$TASK_STATUS",
    "duration_seconds": $TASK_DURATION,
    "files_changed": $FILES_CHANGED
  }
}
EOF

# Incrementar contador de tareas completadas
TASK_COUNT_FILE=".claude/memory/task_count_$(date +%Y%m%d).txt"
if [ -f "$TASK_COUNT_FILE" ]; then
    TASK_COUNT=$(($(cat "$TASK_COUNT_FILE") + 1))
else
    TASK_COUNT=1
fi
echo "$TASK_COUNT" > "$TASK_COUNT_FILE"

# Mostrar mensaje de completado
echo ""
echo "$EMOJI Tarea completada: $TASK_NAME"
echo "   Duración: ${TASK_DURATION}s | Archivos modificados: $FILES_CHANGED"
echo "   Total de tareas hoy: $TASK_COUNT"
echo ""

# Si fue exitosa, guardar en historial de tareas exitosas
if [ "$TASK_STATUS" = "success" ]; then
    echo "$TIMESTAMP|$TASK_NAME|${TASK_DURATION}s|$FILES_CHANGED files" >> ".claude/memory/successful_tasks.log"
fi

exit 0
