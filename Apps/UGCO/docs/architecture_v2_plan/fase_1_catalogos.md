# FASE 1: Capa de Catálogos y Entidades Estructurales

## 1. Justificación Arquitectónica

Para evitar la entropía de datos (texto libre con errores tipográficos) y permitir análisis estadísticos confiables (reporting MINSAL), el sistema se fundamenta en diccionarios estandarizados. Estos diccionarios además sirven como pivotes técnicos para la interfaz (filtrar tableros Kanban por "Especialidad") y como mappers para la integración con ALMA.

**Convención de Nomenclatura**: Todas las colecciones usan el prefijo `ugco_` para coherencia con el namespace de la aplicación NocoBase existente.

---

## 2. Catálogos Maestros

### 2.1 `ugco_cat_especialidades`

Define los flujos y tableros independientes. Reemplaza los "Libros Excel" separados.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | PK Auto | — | — |
| `nombre` | String | Unique, Required | "Cabeza y Cuello", "Digestivo Alto", "Digestivo Bajo", "Endocrinología", "Hematología", "Sarcoma", "Tórax", "Urología", "Mama" |
| `codigo` | String | Unique | CYC, DIG_A, DIG_B, ENDO, HEMA, SARC, TOR, URO, MAM |
| `responsable_id` | BelongsTo → `users` | Nullable | Coordinador/a de esta sub-unidad |
| `activa` | Boolean | Default: true | Soft-delete conceptual |

### 2.2 `ugco_cat_tipos_evento`

El diccionario maestro del sistema Event-Driven. Define *qué puede pasarle a un paciente*.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | PK Auto | — | — |
| `codigo` | String | Unique | `BIOPSIA_SOLICITUD`, `BIOPSIA_RESULTADO`, `COMITE_RESOLUCION`, `CONTROL_MEDICO`, `QT_CICLO`, etc. |
| `nombre_display` | String | Required | "Solicitud de Biopsia", "Resolución de Comité" |
| `categoria` | Enum | Required | `Diagnostico_Estudio`, `Tratamiento_Quirurgico`, `Tratamiento_Sistemico`, `Tratamiento_Radioterapia`, `Seguimiento_Control`, `Administrativo`, `Resolucion` |
| `es_solicitud` | Boolean | Default: false | Si es `true`, el evento tiene ciclo de vida con estados (Solicitado → Agendado → Realizado → Cancelado). Si es `false`, se inserta como hecho consumado. |
| `es_hito_rhc` | Boolean | Default: false | Identifica si debe exportarse al Registro Hospitalario de Cáncer |
| `gatilla_tarea` | Boolean | Default: false | Bandera para el motor de Workflows |
| `plantilla_payload` | JSON | Nullable | Estructura recomendada para `detalles_json` del evento |

### 2.3 `ugco_cat_tipos_tarea`

Diccionario de las tareas de navegación (evita Enum hardcodeado en la tabla de tareas).

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | PK Auto | — | — |
| `codigo` | String | Unique | `COORD_IMAGEN`, `COORD_BIOPSIA`, `PRESENTAR_COMITE`, `AGENDAR_CONTROL`, `COORD_CIRUGIA`, `DERIVACION_EXTRA`, `EVAL_GES` |
| `nombre_display` | String | Required | "Coordinar Imagenología", "Presentar a Comité" |
| `prioridad_default` | Enum | Default: Normal | Urgente, Alta, Normal, Baja |

### 2.4 `ugco_cat_cie_o` (Recomendado)

Carga de las tablas oficiales CIE-O-3 (Topografía y Morfología) del MINSAL.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `codigo` | String, PK | C34.9, 8070/3, etc. |
| `tipo` | Enum | `Topografia`, `Morfologia` |
| `descripcion` | String | "Bronquios y pulmón, SAI" |
| `capitulo` | String | Agrupación jerárquica |

---

## 3. Entidades Estructurales (No son catálogos, pero sí son colecciones propias)

### 3.1 `ugco_comite_sesiones`

El Comité Oncológico es una entidad colegiada con estructura propia. **No** es un simple "tipo de evento" genérico.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | PK Auto | — | — |
| `fecha_sesion` | Date | Required | Fecha del comité |
| `especialidad_comite_id` | BelongsTo → `ugco_cat_especialidades` | Required | Digestivo, Tórax, Mamas, General |
| `lugar` | String | Nullable | "Sala Comité Piso 3" |
| `estado_sesion` | Enum | Default: Programada | Programada, En Curso, Cerrada |
| `acta_resumen` | Rich Text | Nullable | Acta general de la sesión |

### 3.2 `ugco_comite_presentaciones`

Relación M:N entre Caso y Sesión. Representa el acto de "presentar un paciente al comité".

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | PK Auto | — | — |
| `sesion_id` | BelongsTo → `ugco_comite_sesiones` | Required | En qué sesión se presentó |
| `caso_id` | BelongsTo → `ugco_casos` | Required | Qué paciente/caso se discutió |
| `medico_presentador_id` | BelongsTo → `users` | Nullable | Quién expuso el caso |
| `decision_clinica` | Enum | Required | Cirugía, QT_Neoadyuvante, RT, Paliativo, Seguimiento, Derivacion_Extra, Ampliacion_Margenes, Estudio_Complementario |
| `centro_derivacion` | String | Nullable | "INC", "Hospital San Juan de Dios", etc. |
| `observaciones_comite` | Rich Text | Nullable | Notas detalladas de la resolución |
| `requiere_accion_urgente` | Boolean | Default: false | Si requiere bloqueo quirúrgico o tratamiento urgente |

> [!IMPORTANT]
> Cuando una presentación de Comité se cierra, un **Workflow** debe automáticamente:
>
> 1. Insertar un Evento en la Línea de Tiempo (`ugco_eventos`) con el resumen de la resolución.
> 2. Si `requiere_accion_urgente` = true, crear una Tarea de Navegación prioritaria.

---

## 4. Beneficios y Validaciones

- **Escalabilidad**: Si el hospital incorpora ginecología oncológica, se añade un registro a `ugco_cat_especialidades` y automáticamente se genera su Tablero Kanban.
- **Trazabilidad ALMA**: El `codigo` de `ugco_cat_tipos_evento` servirá como mapper directo cuando se extraigan eventos de TrakCare.
- **Comités como entidades de primer nivel**: Permiten registro de asistencia, múltiples casos por sesión, y resoluciones formales con trazabilidad de quién presentó y qué se decidió.
