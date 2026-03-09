# FASE 6: Workflows y Automatización

## 1. Justificación Arquitectónica

La diferencia entre "un Excel digital" y un sistema vivo de alcance enterprise son las **consecuencias automáticas de las acciones** (Triggers). Si un médico registra un evento de alta, la ficha maestra debe cerrarse sola. Si alguien presenta al paciente en comité, enfermería debe saberlo automáticamente.

---

## 2. Workflows Críticos

### WF-1: Evento → Tarea Automática (After Create en `ugco_eventos`)

| Atributo | Valor |
|----------|-------|
| **Trigger** | After Create en `ugco_eventos` |
| **Condición** | `ugco_eventos.tipo_evento.gatilla_tarea` = true **O** campo del formulario `requiere_seguimiento` = true |
| **Acción** | Create Record en `ugco_tareas` |

**Lógica del nodo Create**:

- `caso_id` ← Evento.caso_id
- `evento_origen_id` ← Evento.id
- `tipo_tarea_id` ← Derivado del tipo de evento (mapeo en catálogo)
- `estado` ← "Pendiente"
- `prioridad_clinica` ← Si `requiere_seguimiento` es urgente → "Urgente", sino → "Normal"

### WF-2: Cierre de Comité → Evento + Tarea (After Update en `ugco_comite_presentaciones`)

| Atributo | Valor |
|----------|-------|
| **Trigger** | After Update en `ugco_comite_presentaciones` |
| **Condición** | Campo `decision_clinica` pasa de NULL a un valor (se cerró la resolución) |
| **Acción 1** | Create Record en `ugco_eventos` con tipo `COMITE_RESOLUCION` |
| **Acción 2** | Si `requiere_accion_urgente` = true → Create Record en `ugco_tareas` con prioridad "Urgente" |

**Payload del Evento creado**:

- `resumen_titulo` ← "Comité [Especialidad]: [decision_clinica]"
- `detalles_json` ← `{"decision": "[...]", "centro_derivacion": "[...]"}`
- `origen_dato` ← "Workflow"

### WF-3: Evento de Resolución → Cierre de Caso (After Create en `ugco_eventos`)

| Atributo | Valor |
|----------|-------|
| **Trigger** | After Create en `ugco_eventos` |
| **Condición** | `tipo_evento.categoria` = "Resolucion" (Fallecimiento, Alta) |
| **Acción** | Update Record en `ugco_casos` |

**Lógica**:

- `estado_viaje` ← "Egresado"
- Si tipo es Fallecimiento: `fecha_defuncion` ← Evento.fecha_clinica, `causa_egreso` ← "Fallecimiento"
- Si tipo es Alta: `causa_egreso` ← "Alta_Curado" o "Alta_Administrativa"
- **Efecto**: Paciente desaparece de todas las grillas de "Pacientes Activos"

### WF-4: Re-estadificación → Actualizar Snapshot (After Create en `ugco_eventos`)

| Atributo | Valor |
|----------|-------|
| **Trigger** | After Create en `ugco_eventos` |
| **Condición** | `tipo_evento.codigo` = "RE_ESTADIFICACION" |
| **Acción** | Update Record en `ugco_casos` |

**Lógica**:

- Leer del `detalles_json` los campos `nuevo_tnm_t`, `nuevo_tnm_n`, `nuevo_tnm_m`, `nueva_etapa`, `nueva_clase_tnm`
- Actualizar los campos snapshot de `ugco_casos`
- El TNM anterior queda preservado en el Evento (inmutable)

### WF-5: Alerta por Inactividad (Cron Job Diario)

| Atributo | Valor |
|----------|-------|
| **Trigger** | Schedule: Todos los días a las 02:00 AM |
| **Condición** | `ugco_casos.estado_viaje` IN (Sospecha_Estudio, Tto_Activo_Curativo) AND último `ugco_evento` tiene fecha > 30 días atrás |
| **Acción** | Create Record en `ugco_tareas` |

**Lógica**:

- `tipo_tarea_id` ← "Alerta Inactividad"
- `prioridad_clinica` ← "Alta"
- `descripcion` ← "ALERTA: 30+ días sin actividad clínica registrada"
- `fecha_vencimiento` ← NOW() + 7 días

### WF-6: Cierre de Tarea → Log en Timeline (Opcional)

| Atributo | Valor |
|----------|-------|
| **Trigger** | After Update en `ugco_tareas` |
| **Condición** | `estado` cambia a "Completada" |
| **Acción** | Create Record en `ugco_eventos` |

**Lógica**:

- `tipo_evento_id` ← "TAREA_COMPLETADA"
- `resumen_titulo` ← "Tarea Administrativa Completada: [tipo_tarea.nombre_display]"
- `origen_dato` ← "Workflow"

---

## 3. Resumen de Triggers

| Workflow | Tabla Trigger | Tabla Destino | Propósito |
|----------|---------------|---------------|-----------|
| WF-1 | `ugco_eventos` | `ugco_tareas` | Auto-crear tareas de seguimiento |
| WF-2 | `ugco_comite_presentaciones` | `ugco_eventos` + `ugco_tareas` | Loguear resolución de comité |
| WF-3 | `ugco_eventos` | `ugco_casos` | Cerrar paciente egresado/fallecido |
| WF-4 | `ugco_eventos` | `ugco_casos` | Actualizar TNM por re-estadificación |
| WF-5 | Cron (Schedule) | `ugco_tareas` | Alertar inactividad clínica |
| WF-6 | `ugco_tareas` | `ugco_eventos` | Traza administrativa en timeline |
