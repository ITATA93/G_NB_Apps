# Integración TASK - Antigravity (Gemini)

Este archivo documenta cómo Antigravity/Gemini debe usar el archivo TASK.md compartido para coordinación con Claude Code.

## Ubicación del TASK

**Path**: `c:\Proyectos\NB_Apps\TASK.md`

Este archivo es el **punto único de coordinación** entre Claude Code y Antigravity.

---

## Flujo de Trabajo

### 1. Al Recibir Instrucción del Usuario

```
Usuario da instrucción
    ↓
Claude crea/actualiza TASK.md
    ↓
Claude trabaja en subtareas asignadas
    ↓
Claude actualiza progreso en TASK.md
    ↓
Claude determina handoff point
    ↓
Claude documenta contexto para Gemini en TASK.md
    ↓
Usuario invoca Gemini workflow
    ↓
Gemini lee TASK.md
    ↓
Gemini ejecuta tareas asignadas
    ↓
Gemini actualiza progreso en TASK.md
    ↓
Gemini documenta resultado para Claude
    ↓
Handoff de vuelta a Claude (si necesario)
```

---

## Estructura del TASK.md

### Secciones Clave

1. **Tarea Actual**: Objetivo principal
2. **Contexto**: Background de la tarea
3. **Subtareas**: Desglose con responsables
4. **Handoff Points**: Cuándo y cómo hacer handoff
5. **Progreso**: Estado actual
6. **Decisiones Tomadas**: Log de decisiones importantes
7. **Riesgos**: Riesgos identificados y mitigaciones
8. **Próximos Pasos**: Orden de ejecución claro
9. **Historial**: Log de updates

---

## Responsabilidades de Gemini

### Al Recibir Handoff de Claude

1. **Leer TASK.md completo**
   ```bash
   cat TASK.md
   ```

2. **Identificar tareas asignadas a Gemini**
   - Buscar sección "Handoff Points → Claude → Gemini"
   - Leer "Tareas para Gemini"
   - Verificar "Contexto a pasar"

3. **Actualizar estado a "En Progreso"**
   ```markdown
   ### 🚧 En Progreso

   - [ ] **Actualizar workflows en .agent/**
     - Responsable: Gemini ← ACTUALIZAR
     - Estado: En progreso (iniciado 2026-01-25 16:00)
   ```

4. **Ejecutar tareas**
   - Usar workflows definidos en `.agent/workflows/`
   - Registrar errores o problemas
   - Documentar decisiones tomadas

5. **Actualizar progreso**
   ```markdown
   ### ✅ Completadas

   - [x] **Actualizar workflows en .agent/**
     - Responsable: Gemini
     - Completado: 2026-01-25 16:15
     - Archivos modificados: 3
   ```

6. **Documentar resultado para Claude**
   ```markdown
   ### Gemini → Claude

   **Completado**: 2026-01-25 16:15

   **Tareas realizadas**:
   1. Actualización de .agent/workflows/12_nocobase_configure_ui.md
   2. Actualización de .agent/workflows/13_nocobase_configure_api.md
   3. Validación con /nocobase-inspect

   **Resultado**: ✅ Exitoso

   **Archivos modificados**:
   - .agent/workflows/12_nocobase_configure_ui.md
   - .agent/workflows/13_nocobase_configure_api.md
   - .agent/rules/00_context.md

   **Issues encontrados**: Ninguno

   **Próximas tareas para Claude**:
   - Documentar cambios en CHANGELOG
   - Actualizar README principal
   ```

7. **Agregar entrada al historial**
   ```markdown
   | 2026-01-25 16:15 | Gemini | Completada actualización de workflows |
   ```

---

## Workflows Típicos de Gemini

### Workflow 1: Actualizar Configuración

Cuando Claude reorganiza estructura del proyecto:

```markdown
**Tareas para Gemini**:
1. Actualizar paths en .agent/workflows/*.md
2. Actualizar .agent/rules/00_context.md
3. Validar con /nocobase-inspect
4. Reportar resultado
```

### Workflow 2: Configurar NocoBase

Cuando Claude define especificación:

```markdown
**Tareas para Gemini**:
1. Leer app-spec/app.yaml
2. Ejecutar /nocobase-configure
3. Seed datos de referencia con /nocobase-seed
4. Validar configuración
5. Reportar colecciones creadas
```

### Workflow 3: Audit y Validación

Después de cambios de Claude:

```markdown
**Tareas para Gemini**:
1. Ejecutar /nocobase-audit workflow
2. Verificar integridad de datos
3. Generar reporte de audit
4. Reportar issues encontrados
```

---

## Formato de Updates en TASK.md

### Template de Update de Gemini

```markdown
---

## Update Gemini - [FECHA] [HORA]

**Workflow Ejecutado**: [nombre del workflow]

**Estado**: ✅ Exitoso / ⚠️ Con Warnings / ❌ Fallido

**Tareas Completadas**:
- [x] Tarea 1 - Resultado
- [x] Tarea 2 - Resultado

**Archivos Modificados**:
- path/to/file1
- path/to/file2

**Colecciones Afectadas** (si aplica):
- collection_name (created/updated/deleted)

**Tiempo de Ejecución**: Xm Ys

**Issues Encontrados**:
- [Descripción de issue 1]
- [Descripción de issue 2]

**Decisiones Tomadas**:
- [Decisión 1 con justificación]

**Próximo Paso Recomendado**: [Acción para Claude o usuario]

---
```

---

## Archivos que Gemini Debe Actualizar

### Cuando hay cambios de estructura:

1. **`.agent/rules/00_context.md`**
   - Actualizar paths de workspace
   - Actualizar estructura de carpetas

2. **`.agent/workflows/*.md`**
   - Actualizar references a paths de archivos
   - Actualizar ejemplos de comandos

3. **TASK.md**
   - Agregar updates
   - Marcar tareas como completadas
   - Documentar handoff

---

## Coordinación en Tiempo Real

### Principio: "Single Source of Truth"

- **TASK.md** es la única fuente de verdad para el estado actual
- Ambos agentes (Claude y Gemini) DEBEN actualizar TASK.md
- No usar canales paralelos de comunicación

### Evitar Conflictos

1. **Claude escribe primero** la tarea y subtareas
2. **Gemini lee antes de ejecutar** para entender contexto
3. **Gemini actualiza durante ejecución** para visibilidad
4. **Gemini documenta al finalizar** para handoff a Claude
5. **Claude valida** y continúa o cierra tarea

---

## Ejemplos de Coordinación

### Ejemplo 1: Reorganización de Estructura

**Claude escribe en TASK.md**:
```markdown
### Handoff Points

#### Claude → Gemini

**Cuándo**: Después de mover UGCO y BUHO a Apps/

**Tareas para Gemini**:
1. Actualizar .agent/workflows/ con nuevos paths
2. Actualizar .agent/rules/00_context.md
3. Validar con /nocobase-inspect

**Paths Cambiados** (Ejemplo de migración):
- MIRA/UGCO → Apps/UGCO
- MIRA/BUHO → Apps/BUHO
- MIRA/shared → shared (en raíz)
```

**Gemini lee, ejecuta y documenta**:
```markdown
## Update Gemini - 2026-01-25 16:00

**Workflow Ejecutado**: Actualización de configuración

**Estado**: ✅ Exitoso

**Tareas Completadas**:
- [x] Actualizado .agent/workflows/12_nocobase_configure_ui.md
- [x] Actualizado .agent/workflows/13_nocobase_configure_api.md
- [x] Actualizado .agent/rules/00_context.md
- [x] Validación con /nocobase-inspect: 10 colecciones encontradas

**Archivos Modificados**:
- .agent/workflows/12_nocobase_configure_ui.md (3 paths actualizados)
- .agent/workflows/13_nocobase_configure_api.md (2 paths actualizados)
- .agent/rules/00_context.md (estructura workspace actualizada)

**Próximo Paso**: Claude puede continuar con documentación
```

---

## Monitoreo del TASK

### Para Gemini: Verificar Estado

```bash
# Ver estado actual del TASK
head -n 20 TASK.md

# Ver últimas actualizaciones
tail -n 50 TASK.md

# Buscar tareas asignadas a Gemini
grep -A5 "Tareas para Gemini" TASK.md
```

### Para Ambos: Validar Sincronización

```bash
# Verificar última modificación
ls -lh TASK.md

# Ver historial de cambios
git log --oneline TASK.md

# Comparar con versión anterior
git diff HEAD~1 TASK.md
```

---

## Troubleshooting

### Issue: TASK.md No Existe

**Solución**: Claude debe crear TASK.md al recibir nueva instrucción

### Issue: Tareas No Están Claras

**Solución**: Gemini debe pedir clarificación actualizando TASK.md:
```markdown
## ⚠️ Clarificación Requerida - Gemini

**Fecha**: 2026-01-25 16:00

**Pregunta**: [Descripción de ambigüedad]

**Contexto**: [Por qué no está claro]

**Esperando respuesta de**: Claude / Usuario
```

### Issue: Conflicto de Updates

**Solución**: Último en escribir gana, pero documentar conflicto:
```markdown
## ⚠️ Conflicto de Update

**Detectado**: 2026-01-25 16:00

**Descripción**: Claude y Gemini actualizaron simultáneamente

**Resolución**: [Cómo se resolvió]
```

---

## Checklist para Gemini

Antes de iniciar workflow:
- [ ] Leer TASK.md completo
- [ ] Verificar que hay tareas asignadas a Gemini
- [ ] Entender contexto de handoff
- [ ] Verificar archivos necesarios existen

Durante ejecución:
- [ ] Actualizar progreso cada subtarea
- [ ] Documentar decisiones tomadas
- [ ] Registrar errores encontrados
- [ ] Mantener estado actualizado

Al finalizar:
- [ ] Marcar tareas como completadas
- [ ] Documentar resultado detalladamente
- [ ] Especificar próximos pasos para Claude
- [ ] Agregar entrada al historial
- [ ] Actualizar estado del TASK

---

**Versión**: 1.0.0
**Última Actualización**: 2026-01-25
**Mantenido Por**: Equipo MIRA
