# FASE 4: Capa de Operaciones (Gestor de Navegación)

## 1. Justificación Arquitectónica

Las 80 columnas del Excel heredado existían para que la enfermera pudiera decir: *"A este paciente le falta un TAC, este otro está atrasado para su cirugía"*. En lugar de forzar esa información administrativa dentro de la historia clínica, la extraemos a un **Gestor de Tareas de Navegación**. Esto separa la Medicina (qué pasó) de la Logística (qué falta por hacer).

---

## 2. Colección: `ugco_tareas`

### 2.1 Relación y Origen

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | PK Auto | — | — |
| `caso_id` | BelongsTo → `ugco_casos` | Required | El paciente que requiere gestión |
| `evento_origen_id` | BelongsTo → `ugco_eventos` | Nullable | Qué evento médico gatilló esta tarea |
| `tipo_tarea_id` | BelongsTo → `ugco_cat_tipos_tarea` | Required | Tipo de tarea (del catálogo Fase 1) |
| `asignado_a_id` | BelongsTo → `users` | Nullable | Enfermera o usuario asignado |

### 2.2 Definición del Cuello de Botella

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `descripcion` | Text | Nullable | "Paciente requiere RM con contraste, buscar cupo en Hospital X" |
| `prioridad_clinica` | Enum | Default: Normal | Urgente, Alta, Normal, Baja. Permite ordenar tareas que vencen el mismo día por gravedad real. |

### 2.3 Motor de Alertas (Time Tracking)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `fecha_solicitud` | Date | Auto (created_at) | Cuándo nació la necesidad |
| `fecha_vencimiento` | Date | Required | Plazo estricto (GES o clínico) |
| `dias_restantes` | Formula | Calculado | `fecha_vencimiento - NOW()` |

**Regla de Semáforo**:

| Días Restantes | Color | Significado |
|----------------|-------|-------------|
| > 15 | 🟢 Verde | Holgura |
| 5 – 14 | 🟡 Amarillo | Alerta |
| 1 – 4 | 🟠 Naranja | Riesgo |
| ≤ 0 | 🔴 Rojo | Incumplimiento / Vencido |

### 2.4 Ciclo de Vida y Resolución

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `estado` | Enum | Default: Pendiente | `Pendiente`, `En_Tramite`, `Bloqueada_Paciente`, `Completada`, `Anulada` |
| `fecha_resolucion` | Datetime | Nullable | Cuándo se cerró |
| `notas_resolucion` | Text | Nullable | "Logré hora para el 14/Nov. Paciente avisado vía WhatsApp" |

---

## 3. La Experiencia del "Kanban Clínico"

Con esta tabla limpia, NocoBase crea un **Tablero Kanban Real**:

1. **Columnas** = Los `estados` (Pendiente → En Trámite → Completada).
2. **Tarjetas** = Cada tarea mostrando RUT del paciente, tipo de tarea, y `dias_restantes` con color semáforo.
3. **Orden dentro de columna**: Primero por `prioridad_clinica` (Urgente arriba), luego por `dias_restantes` (más atrasado arriba).
4. **Workflow habitual**: La enfermera abre el sistema, ve la columna `Pendiente` ordenada por urgencia, arrastra a `En_Tramite` y gestiona.
