#!/bin/bash
# Claude Code Startup Hook
# Ejecutado al iniciar una sesión de Claude Code

TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
LOG_FILE=".claude/logs/session-$(date +%Y%m%d).log"

# Crear directorio de logs si no existe
mkdir -p .claude/logs

# Registrar inicio de sesión
echo "[$TIMESTAMP] [STARTUP] Claude Code session started" >> "$LOG_FILE"

# Verificar configuración de entorno
if [ ! -f ".env" ]; then
    echo "[$TIMESTAMP] [WARNING] .env file not found" >> "$LOG_FILE"
    echo "⚠️  Advertencia: Archivo .env no encontrado. Algunas funcionalidades pueden no estar disponibles."
fi

# Verificar conexión a NocoBase (opcional)
if [ -n "$NOCOBASE_API_URL" ]; then
    echo "[$TIMESTAMP] [INFO] NocoBase API URL configured: $NOCOBASE_API_URL" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] [WARNING] NOCOBASE_API_URL not configured" >> "$LOG_FILE"
fi

# Cargar contexto de sesión anterior (si existe)
if [ -f ".claude/memory/last_context.json" ]; then
    echo "[$TIMESTAMP] [INFO] Loading previous session context" >> "$LOG_FILE"
fi

# Mostrar mensaje de bienvenida
echo ""
echo "🤖 Claude Code inicializado para NB_Apps (MIRA)"
echo "📁 Workspace: $(pwd)"
echo "📝 Logs: $LOG_FILE"
echo ""
echo "Skills disponibles:"
echo "  /nocobase-configure - Configurar colecciones y campos"
echo "  /nocobase-inspect   - Inspeccionar estado de NocoBase"
echo "  /nocobase-seed      - Cargar datos maestros"
echo "  /git                - Workflow de Git"
echo ""

# Guardar timestamp de inicio
echo "$TIMESTAMP" > .claude/memory/last_session_start.txt

exit 0
