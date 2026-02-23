# Setup Guide - Claude Code Configuration

Esta guía te ayudará a configurar Claude Code correctamente en tu entorno local.

## Prerequisites

- Claude Code CLI instalado
- Node.js 16+ (para scripts TypeScript)
- Python 3.8+ (para scripts globales)
- Git configurado

## Instalación

### 1. Verificar Estructura

Asegúrate de que la estructura de `.claude/` existe:

```bash
cd c:\Proyectos\NB_Apps
ls -la .claude/
```

Deberías ver:
```
.claude/
├── settings.json
├── settings.local.json
├── README.md
├── SETUP.md (este archivo)
├── skills/
├── hooks/
├── prompts/
├── memory/
└── logs/
```

### 2. Configurar Permisos (Linux/Mac)

En sistemas Unix, dar permisos de ejecución a los hooks:

```bash
chmod +x .claude/hooks/*.sh
```

En Windows (Git Bash):
```bash
chmod +x .claude/hooks/*.sh
```

### 3. Configurar Variables de Entorno

Asegúrate de tener configurado `.env` en la raíz del proyecto:

```bash
# Copiar template si no existe
cp .env.example .env

# Editar con tus credenciales
code .env
```

Variables requeridas:
```env
NOCOBASE_API_URL=https://nocobase.hospitaldeovalle.cl/api
NOCOBASE_API_TOKEN=tu_token_aqui
```

### 4. Personalizar settings.local.json

Editar `.claude/settings.local.json` con permisos específicos:

```json
{
  "permissions": {
    "allow": [
      "Bash(git status)",
      "Bash(git diff:*)",
      "Bash(npm install)",
      "Bash(node scripts/*)",
      "Read(*)",
      "Write(docs/*)",
      "Glob(*)",
      "Grep(*)"
    ]
  }
}
```

### 5. Verificar Configuración

Ejecutar script de verificación:

```bash
# Crear directorios necesarios
mkdir -p .claude/logs .claude/memory

# Verificar hooks
ls -l .claude/hooks/*.sh

# Verificar skills
ls -l .claude/skills/*.json
```

## Primer Uso

### Iniciar Claude Code

```bash
cd c:\Proyectos\NB_Apps
claude code
```

Al iniciar, deberías ver:
```
🤖 Claude Code inicializado para NB_Apps (MIRA)
📁 Workspace: c:\Proyectos\NB_Apps
📝 Logs: .claude/logs/session-20260125.log

Skills disponibles:
  /nocobase-configure - Configurar colecciones y campos
  /nocobase-inspect   - Inspeccionar estado de NocoBase
  /nocobase-seed      - Cargar datos maestros
  /git                - Workflow de Git
```

### Probar Skills

```bash
# Inspeccionar estado de NocoBase
/nocobase-inspect

# Ver opciones de Git
/git
```

### Verificar Logging

Los logs se crean automáticamente en `.claude/logs/`:

```bash
# Ver log de sesión actual
tail -f .claude/logs/session-$(date +%Y%m%d).log

# Ver errores
cat .claude/logs/errors-$(date +%Y%m%d).log

# Ver API calls
cat .claude/logs/api-calls-$(date +%Y%m%d).log
```

## Configuración Avanzada

### Ajustar Nivel de Logging

Editar `settings.json`:

```json
{
  "logging": {
    "level": "debug",  // opciones: debug, info, warning, error
    ...
  }
}
```

### Personalizar Hooks

Los hooks pueden editarse en `.claude/hooks/`:

- `startup.sh` - Personalizar mensaje de bienvenida
- `error.sh` - Personalizar manejo de errores
- `api_call.sh` - Ajustar logging de API
- `task_complete.sh` - Personalizar mensajes de completado
- `file_change.sh` - Ajustar detección de archivos sensibles

### Agregar Skills Personalizados

Crear nuevo archivo en `.claude/skills/`:

```json
{
  "name": "mi-skill",
  "version": "1.0.0",
  "description": "Descripción de mi skill",
  "trigger": "/mi-skill",
  "workflow": {
    "steps": [
      // ... definir pasos
    ]
  }
}
```

## Troubleshooting

### Hooks No Se Ejecutan

**Problema**: Los hooks no se ejecutan al realizar acciones.

**Solución**:
```bash
# Verificar permisos
ls -l .claude/hooks/*.sh

# Dar permisos si es necesario
chmod +x .claude/hooks/*.sh

# Verificar que hooks está habilitado en settings.json
grep -A2 '"hooks"' .claude/settings.json
```

### Logs No Se Crean

**Problema**: No se generan archivos de log.

**Solución**:
```bash
# Crear directorio de logs
mkdir -p .claude/logs

# Verificar permisos de escritura
touch .claude/logs/test.log && rm .claude/logs/test.log

# Verificar configuración de logging
grep -A5 '"logging"' .claude/settings.json
```

### Skills No Aparecen

**Problema**: Los skills personalizados no están disponibles.

**Solución**:
```bash
# Verificar que skills está habilitado
grep -A3 '"skills"' .claude/settings.json

# Verificar archivos de skills
ls -l .claude/skills/*.json

# Validar JSON de skills
for file in .claude/skills/*.json; do
  echo "Validating $file"
  python -m json.tool "$file" > /dev/null && echo "✓ Valid" || echo "✗ Invalid"
done
```

### Memoria No Persiste

**Problema**: El contexto no se mantiene entre sesiones.

**Solución**:
```bash
# Verificar directorio de memoria
mkdir -p .claude/memory

# Verificar que memoria está habilitada
grep -A3 '"memory"' .claude/settings.json

# Revisar archivos de memoria
ls -l .claude/memory/
```

## Integración con Gemini (Antigravity)

Claude Code está configurado para trabajar coordinadamente con Gemini:

### Verificar Configuración de Gemini

```bash
# Verificar que .agent/ existe
ls -la .agent/

# Ver workflows disponibles
ls .agent/workflows/
```

### Protocolo de Handoff

Ver `.claude/prompts/coordination_protocol.md` para detalles completos sobre cómo Claude y Gemini coordinan el trabajo.

**Resumen**:
- Claude: Desarrollo interactivo, debugging, documentación
- Gemini: Automatización, workflows, bulk operations
- Handoff basado en contexto y tipo de tarea

## Actualizar Configuración

### Actualizar settings.json

```bash
# Editar configuración principal
code .claude/settings.json

# Validar JSON
python -m json.tool .claude/settings.json > /dev/null && echo "✓ Valid" || echo "✗ Invalid"
```

### Actualizar Memoria del Proyecto

```bash
# Editar conocimiento del proyecto
code .claude/memory/project_knowledge.json

# Agregar problemas comunes
code .claude/memory/common_issues.json
```

### Actualizar Prompts

```bash
# Editar system prompt
code .claude/prompts/system_prompt.md

# Editar protocolo de coordinación
code .claude/prompts/coordination_protocol.md
```

## Mantenimiento

### Limpieza Periódica

Ejecutar cada mes:

```bash
# Eliminar logs > 30 días
find .claude/logs -name "*.log" -mtime +30 -delete

# Comprimir logs > 7 días
find .claude/logs -name "*.log" -mtime +7 ! -name "*.gz" -exec gzip {} \;

# Limpiar contadores antiguos
find .claude/memory -name "*_count_*.txt" -mtime +30 -delete
```

### Backup de Configuración

Respaldar configuración antes de cambios importantes:

```bash
# Backup de toda la configuración
tar -czf claude-config-backup-$(date +%Y%m%d).tar.gz .claude/

# Backup solo de settings
cp .claude/settings.json .claude/settings.json.backup
```

### Restaurar desde Backup

```bash
# Restaurar configuración completa
tar -xzf claude-config-backup-YYYYMMDD.tar.gz

# Restaurar solo settings
cp .claude/settings.json.backup .claude/settings.json
```

## Recursos

- [README.md](.claude/README.md) - Documentación completa
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guía de contribución
- [FAQ.md](../MIRA/docs/FAQ.md) - Preguntas frecuentes

## Soporte

Para ayuda:
1. Revisar [.claude/README.md](.claude/README.md)
2. Consultar logs en `.claude/logs/`
3. Revisar memoria en `.claude/memory/common_issues.json`
4. Crear issue en el repositorio

---

**Versión**: 1.0.0
**Última Actualización**: 2026-01-25
