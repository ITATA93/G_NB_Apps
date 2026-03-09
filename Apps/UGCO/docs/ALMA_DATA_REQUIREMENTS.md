# Requerimientos de Datos ALMA → UGCO

> **Propósito**: Este documento describe las tablas de ALMA que alimentan la aplicación UGCO
> (Unidad de Gestión del Cáncer en Ovalle), los campos requeridos de cada una, y cómo
> se consumen en UGCO. Está dirigido al equipo de Query Builder / integración de datos
> para construir las consultas SQL o vistas que exponen la información desde el RCE hacia UGCO.

---

## Resumen Ejecutivo

UGCO requiere **5 tablas de ALMA**, todas en modo **solo lectura** (UGCO nunca escribe en ALMA).
Los datos fluyen en una sola dirección: **ALMA → UGCO**.

| # | Tabla ALMA | Propósito en UGCO | Frecuencia de actualización sugerida |
|---|-----------|-------------------|--------------------------------------|
| 1 | ALMA_Paciente | Maestro de pacientes | Tiempo real o cada 5 min |
| 2 | ALMA_Episodio | Episodios clínicos (hospitalizaciones, consultas) | Cada 15 min |
| 3 | ALMA_Diagnostico | Diagnósticos CIE-10 registrados en RCE | Cada 15 min |
| 4 | ALMA_Interconsulta | Interconsultas entre servicios | Cada 30 min |
| 5 | ALMA_OrdenExamen | Órdenes de exámenes (laboratorio, imágenes, procedimientos) | Cada 15 min |

---

## 1. ALMA_Paciente

**Uso en UGCO**: Identificación del paciente en cada caso oncológico, ficha 360°, y todas las pantallas clínicas. Es la tabla más crítica — sin ella no se puede crear un caso.

**Tablas UGCO que la consumen**:
- `ugco_casooncologico.paciente_id` — vínculo principal caso↔paciente
- `ugco_eventoclinico.paciente_id` — cada evento clínico identifica al paciente
- `ugco_contactopaciente.paciente_id` — datos de contacto del paciente
- `ugco_tarea.paciente_id` — tareas asignadas por paciente
- `ugco_comitecaso.paciente_id` — casos en comité oncológico

### Campos requeridos

| Campo | Tipo | Obligatorio | Descripción | Uso en UGCO |
|-------|------|:-----------:|-------------|-------------|
| `paciente_id` | INTEGER (PK) | ✅ | ID único del paciente en ALMA | FK en todas las tablas UGCO |
| `run` | VARCHAR | | RUN formateado (ej: 12.345.678-9) | Búsqueda e identificación visual |
| `tipo_documento` | VARCHAR | | Tipo: RUN, PASAPORTE, DNI | Identificación de extranjeros |
| `nro_documento` | VARCHAR | | Número del documento | Búsqueda alternativa |
| `dv` | VARCHAR(1) | | Dígito verificador | Validación |
| `nombres` | VARCHAR | ✅ | Nombres del paciente | Visualización en toda la app |
| `apellido_paterno` | VARCHAR | | Apellido paterno | Visualización + búsqueda |
| `apellido_materno` | VARCHAR | | Apellido materno | Visualización |
| `fecha_nacimiento` | DATE | | Fecha de nacimiento | Cálculo de edad, filtros |
| `sexo` | VARCHAR(1) | | Sexo biológico (F/M/I) | Protocolos clínicos por sexo |
| `genero` | VARCHAR | | Género registrado | Trato al paciente |
| `nacionalidad` | VARCHAR | | Nacionalidad | Contexto demográfico |
| `prevision` | VARCHAR | | Previsión (FONASA A-D, ISAPRE, etc.) | Gestión de compra de servicio y derivaciones |
| `sistema_prevision` | VARCHAR | | Clasificación (PÚBLICO/PRIVADO) | Modalidad de prestación |
| `fecha_defuncion` | DATE | | Fecha de defunción | Marcado de caso como fallecido |
| `fecha_ultima_actualizacion` | TIMESTAMP | | Última sincronización | Control de frescura del dato |
| `activo` | BOOLEAN | ✅ | Registro activo en réplica | Filtro de registros válidos |

### Filtro sugerido para la query
```sql
WHERE activo = true
  AND (fecha_ultima_actualizacion >= :last_sync OR :full_refresh = true)
```

---

## 2. ALMA_Episodio

**Uso en UGCO**: Contexto clínico del caso oncológico — cuándo fue hospitalizado, en qué servicio, quién lo atendió. Vincula las actividades del paciente en el hospital con su caso UGCO.

**Tablas UGCO que la consumen**:
- `ugco_casooncologico.episodio_alma_id` — episodio que dio origen al caso oncológico
- `ugco_eventoclinico.episodio_alma_id` — episodio asociado al evento clínico

### Campos requeridos

| Campo | Tipo | Obligatorio | Descripción | Uso en UGCO |
|-------|------|:-----------:|-------------|-------------|
| `episodio_id` | INTEGER (PK) | ✅ | ID único del episodio en ALMA | FK en caso y evento |
| `paciente_id` | INTEGER (FK) | ✅ | ID del paciente → ALMA_Paciente | Cruce con paciente |
| `tipo_episodio` | VARCHAR | | HOSPITALARIO, CONSULTA_EXT, URGENCIA, AMBULATORIO | Contexto del evento oncológico |
| `fecha_ingreso` | TIMESTAMP | ✅ | Fecha/hora de ingreso | Línea de tiempo del caso |
| `fecha_egreso` | TIMESTAMP | | Fecha/hora de egreso | Duración de hospitalización |
| `establecimiento` | VARCHAR | | Centro de salud | Identificación del centro |
| `servicio` | VARCHAR | | Servicio clínico (Medicina, Cirugía, etc.) | Filtro por servicio |
| `unidad` | VARCHAR | | Unidad/sala/cama | Ubicación del paciente |
| `profesional_tratante` | VARCHAR | | Médico tratante | Responsable clínico |
| `motivo_consulta` | TEXT | | Motivo de la consulta/ingreso | Contexto clínico |
| `resumen_alta` | TEXT | | Resumen de egreso | Información de seguimiento |
| `fecha_ultima_actualizacion` | TIMESTAMP | | Última sincronización | Control de frescura |
| `activo` | BOOLEAN | ✅ | Registro activo | Filtro |

### Filtro sugerido
```sql
WHERE activo = true
  AND paciente_id IN (SELECT paciente_id FROM ugco_casooncologico WHERE fallecido = false)
```

---

## 3. ALMA_Diagnostico

**Uso en UGCO**: Es el **dato más crítico después del paciente** — el diagnóstico CIE-10 oncológico es lo que crea un caso UGCO. Los diagnósticos con `es_oncologico = true` son los que interesan. UGCO enriquece el diagnóstico con codificación ICD-O (topografía, morfología) y estadificación TNM.

**Tablas UGCO que la consumen**:
- `ugco_casooncologico.diag_alma_id` — diagnóstico que origina el caso
- `ugco_casooncologico.codigo_cie10` — código CIE-10 copiado desde ALMA
- `ugco_casooncologico.diagnostico_principal` — glosa del diagnóstico

### Campos requeridos

| Campo | Tipo | Obligatorio | Descripción | Uso en UGCO |
|-------|------|:-----------:|-------------|-------------|
| `diag_id` | INTEGER (PK) | ✅ | ID único del diagnóstico | FK en caso oncológico |
| `episodio_id` | INTEGER (FK) | ✅ | Episodio donde se registró | Trazabilidad |
| `paciente_id` | INTEGER (FK) | ✅ | Paciente → ALMA_Paciente | Cruce |
| `tipo_diagnostico` | VARCHAR | | PRINCIPAL, SECUNDARIO, COMORBILIDAD | Priorización |
| `codigo_cie10` | VARCHAR | ✅ | Código CIE-10 (ej: C50.9) | **Campo clave** — define el tipo de cáncer |
| `descripcion` | VARCHAR | | Descripción del diagnóstico | Visualización en caso |
| `fecha_registro` | TIMESTAMP | ✅ | Fecha en que se registró | Fecha de diagnóstico en UGCO |
| `profesional_registra` | VARCHAR | | Médico que registró | Auditoría |
| `es_oncologico` | BOOLEAN | ✅ | ¿Es diagnóstico oncológico? | **Filtro principal** — solo estos interesan |
| `fecha_ultima_actualizacion` | TIMESTAMP | | Última sincronización | Control de frescura |
| `activo` | BOOLEAN | ✅ | Registro activo | Filtro |

### Filtro sugerido
```sql
WHERE activo = true
  AND es_oncologico = true
```

### Nota importante
Los diagnósticos con `es_oncologico = true` son los que gatillan la creación de un caso en UGCO. El campo `codigo_cie10` debe corresponder a códigos del capítulo II de CIE-10 (C00-D48, neoplasias).

---

## 4. ALMA_Interconsulta

**Uso en UGCO**: Seguimiento de las interconsultas solicitadas para el paciente oncológico — especialmente las derivaciones a especialidades (oncología médica, cirugía oncológica, radioterapia, etc.). Permite a UGCO saber si una interconsulta está pendiente, aceptada, o respondida.

**Tablas UGCO que la consumen**:
- No tiene FK directa, pero se usa como referencia en flujos de trabajo de eventos y tareas
- Puede alimentar la creación de `ugco_eventoclinico` cuando una interconsulta resulta en un procedimiento

### Campos requeridos

| Campo | Tipo | Obligatorio | Descripción | Uso en UGCO |
|-------|------|:-----------:|-------------|-------------|
| `interconsulta_id` | INTEGER (PK) | ✅ | ID único de la IC | Referencia |
| `paciente_id` | INTEGER (FK) | ✅ | Paciente → ALMA_Paciente | Cruce con caso UGCO |
| `episodio_id` | INTEGER (FK) | | Episodio asociado | Contexto |
| `especialidad_solicitada` | VARCHAR | ✅ | Especialidad destino | Filtro por especialidad oncológica |
| `servicio_solicitante` | VARCHAR | | Servicio que solicita | Trazabilidad |
| `profesional_solicitante` | VARCHAR | | Médico solicitante | Responsable |
| `motivo_solicitud` | TEXT | | Motivo de la IC | Contexto clínico |
| `prioridad` | VARCHAR | | RUTINA, URGENTE, EMERGENCIA | Priorización en UGCO |
| `fecha_solicitud` | TIMESTAMP | ✅ | Fecha de solicitud | Línea de tiempo |
| `fecha_aceptacion` | TIMESTAMP | | Fecha de aceptación | Seguimiento |
| `fecha_respuesta` | TIMESTAMP | | Fecha de respuesta | Seguimiento |
| `estado_ic` | VARCHAR | | PENDIENTE, ACEPTADA, EN_CURSO, RESPONDIDA, RECHAZADA, CANCELADA | **Estado clave** para seguimiento |
| `profesional_responde` | VARCHAR | | Médico que responde | Coordinación |
| `respuesta_resumen` | TEXT | | Resumen de la respuesta | Información clínica |
| `fecha_ultima_actualizacion` | TIMESTAMP | | Última sincronización | Control |
| `activo` | BOOLEAN | ✅ | Registro activo | Filtro |

### Filtro sugerido
```sql
WHERE activo = true
  AND paciente_id IN (SELECT paciente_id FROM ugco_casooncologico)
```

---

## 5. ALMA_OrdenExamen

**Uso en UGCO**: Es la tabla que **más tráfico genera** — TODAS las solicitudes de exámenes deben nacer en ALMA (a excepción de anatomía patológica que puede originarse externamente). Las órdenes de examen se sincronizan como eventos clínicos (`ugco_eventoclinico`) con `origen_dato = 'ALMA'`.

**Tablas UGCO que la consumen**:
- `ugco_eventoclinico` — cada orden de examen se refleja como un evento clínico
- La relación es conceptual: UGCO crea eventos basados en las órdenes de ALMA

### Campos requeridos

| Campo | Tipo | Obligatorio | Descripción | Uso en UGCO |
|-------|------|:-----------:|-------------|-------------|
| `orden_id` | INTEGER (PK) | ✅ | ID único de la orden | Referencia cruzada |
| `paciente_id` | INTEGER (FK) | ✅ | Paciente → ALMA_Paciente | Cruce con caso UGCO |
| `episodio_id` | INTEGER (FK) | | Episodio asociado | Contexto |
| `tipo_orden` | VARCHAR | | Imagenología, Laboratorio, Procedimiento, Anatomía Patológica | Clasificación del evento en UGCO |
| `codigo_examen` | VARCHAR | | Código interno del examen | Identificación técnica |
| `nombre_examen` | VARCHAR | ✅ | Nombre del examen/procedimiento | Título del evento en UGCO |
| `fecha_solicitud` | TIMESTAMP | ✅ | Fecha de solicitud | `ugco_eventoclinico.fecha_solicitud` |
| `fecha_programada` | TIMESTAMP | | Fecha programada | `ugco_eventoclinico.fecha_programada` |
| `fecha_realizacion` | TIMESTAMP | | Fecha de realización | `ugco_eventoclinico.fecha_realizacion` |
| `fecha_informe` | TIMESTAMP | | Fecha del informe | `ugco_eventoclinico.fecha_resultado` |
| `estado_orden` | VARCHAR | | SOLICITADO, PROGRAMADO, REALIZADO, INFORMADO, CANCELADO | Mapea a `estado_seguimiento_id` en UGCO |
| `servicio_solicitante` | VARCHAR | | Servicio que solicita | Trazabilidad |
| `profesional_solicitante` | VARCHAR | | Médico solicitante | `ugco_eventoclinico.profesional_responsable` |
| `resultado_resumen` | TEXT | | Resumen del resultado | `ugco_eventoclinico.resultado_resumen` |
| `url_informe` | VARCHAR | | URL al visor de informe completo | Link en la ficha del evento |
| `fecha_ultima_actualizacion` | TIMESTAMP | | Última sincronización | Control |
| `activo` | BOOLEAN | ✅ | Registro activo | Filtro |

### Filtro sugerido
```sql
WHERE activo = true
  AND paciente_id IN (SELECT paciente_id FROM ugco_casooncologico)
```

### Mapeo de estados ALMA → UGCO

| Estado en ALMA (estado_orden) | Estado en UGCO (estado_seguimiento) |
|-------------------------------|-------------------------------------|
| SOLICITADO | SOLICITADO |
| PROGRAMADO | PROGRAMADO |
| EN_PROCESO | EN_CURSO |
| REALIZADO | REALIZADO |
| INFORMADO | RESULTADO_RECIBIDO |
| CANCELADO | CANCELADO |

---

## Diagrama de Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│                    ALMA (RCE)                            │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Paciente     │  │ Episodio     │  │ Diagnóstico   │  │
│  │ (maestro)    │  │ (admisiones) │  │ (CIE-10)      │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                 │                   │          │
│  ┌──────┴───────┐  ┌──────┴───────┐           │          │
│  │ Interconsulta│  │ OrdenExamen  │           │          │
│  │ (derivac.)   │  │ (exámenes)   │           │          │
│  └──────┬───────┘  └──────┬───────┘           │          │
└─────────┼─────────────────┼───────────────────┼──────────┘
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                    UGCO (NocoBase)                        │
│                                                          │
│  ┌─────────────────────────────────────────────────┐     │
│  │ ugco_casooncologico                             │     │
│  │  ← paciente_id, episodio_alma_id, diag_alma_id │     │
│  │  ← codigo_cie10, diagnostico_principal          │     │
│  │  + TNM, estadio, ICD-O, ECOG (enriquecimiento) │     │
│  └──────────────────────┬──────────────────────────┘     │
│                         │                                │
│  ┌──────────────────────▼──────────────────────────┐     │
│  │ ugco_eventoclinico                              │     │
│  │  ← episodio_alma_id                             │     │
│  │  ← datos de ALMA_OrdenExamen (origen_dato=ALMA) │     │
│  │  + modalidad, subtipo, centro, seguimiento      │     │
│  └─────────────────────────────────────────────────┘     │
│                                                          │
│  ┌─────────────────┐ ┌───────────┐ ┌────────────────┐   │
│  │ ugco_tarea      │ │ comité    │ │ observaciones  │   │
│  │ ugco_documento  │ │ oncológico│ │ (bitácora)     │   │
│  └─────────────────┘ └───────────┘ └────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## Regla de Origen de Datos

| Tipo de dato | Origen esperado | Excepción |
|---|---|---|
| Solicitud de examen | ALMA (siempre) | Anatomía patológica (puede ser externo) |
| Diagnóstico CIE-10 | ALMA | — |
| Datos del paciente | ALMA | — |
| Episodio clínico | ALMA | — |
| Interconsulta | ALMA | — |
| Estadificación TNM/ICD-O | UGCO (enriquecimiento manual) | — |
| Eventos externos (QT, RT, cirugía en otro centro) | UGCO manual + centro destino | — |
| Observaciones clínicas | UGCO (append-only) | — |
| Tareas/pendientes | UGCO | — |

---

## Notas para el Constructor de Queries

1. **Todas las tablas ALMA son de solo lectura** — UGCO nunca modifica datos en ALMA
2. **El campo `activo`** debe filtrarse siempre (`WHERE activo = true`)
3. **Sincronización incremental** recomendada usando `fecha_ultima_actualizacion >= :last_sync`
4. **Pacientes de interés**: solo aquellos que tienen un caso en `ugco_casooncologico` (o potenciales con diagnóstico oncológico)
5. **Órdenes de examen**: son la fuente principal de eventos clínicos — el mapeo de estados es crítico
6. **Diagnósticos oncológicos**: filtrar `es_oncologico = true` para identificar casos UGCO
7. **Volumen estimado**: ~200 pacientes activos, ~2000 eventos/año, ~50 exámenes/día
