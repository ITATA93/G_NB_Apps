# Sistema de Memoria de Claude Code

Este directorio contiene el sistema de memoria persistente de Claude Code para mantener contexto entre sesiones.

## Archivos de Memoria

### Sesión Actual
- `last_session_start.txt` - Timestamp de inicio de la última sesión
- `last_context.json` - Contexto de la última tarea completada
- `last_error_context.json` - Contexto del último error
- `last_api_call.json` - Detalles de la última llamada API

### Contadores Diarios
- `task_count_YYYYMMDD.txt` - Número de tareas completadas hoy
- `error_count_YYYYMMDD.txt` - Número de errores detectados hoy
- `api_count_YYYYMMDD.txt` - Número de llamadas API hoy
- `changes_count_YYYYMMDD.txt` - Número de archivos modificados hoy

### Historial
- `successful_tasks.log` - Log de todas las tareas exitosas
- `project_knowledge.json` - Conocimiento acumulado del proyecto
- `common_issues.json` - Problemas comunes y sus soluciones

## Retención de Datos

Los archivos de memoria se mantienen según la política definida en `settings.json`:
- **Contexto de sesión**: 7 días
- **Contadores diarios**: 30 días
- **Historial de tareas**: 90 días
- **Conocimiento del proyecto**: Permanente

## Uso

El sistema de memoria es utilizado automáticamente por Claude Code para:
1. Restaurar contexto entre sesiones
2. Aprender de errores pasados
3. Optimizar sugerencias basadas en historial
4. Mantener continuidad en tareas largas

## Privacidad

Este directorio está excluido de git (vía .gitignore) para mantener la privacidad de la información de sesión.
