# UGCO (Oncologia) — Datos Requeridos para Produccion

**Destino**: mira.hospitaldeovalle.cl
**Fuente**: Sidra_Test (servidor hospital)
**Fecha**: 2026-03-09

---

## Regla Visual Obligatoria

Toda pantalla que muestre informacion de paciente DEBE incluir:
- **Nombre completo**: nombres + apellido_paterno + apellido_materno
- **RUT**: formato XX.XXX.XXX-X
- **Edad**: calculada desde fecha_nacimiento
- **Diagnostico principal**: codigo_cie10 + glosa

---

## Resumen de Fuentes

| Tabla Sidra | Sync | Coleccion NocoBase | Campos | Prioridad |
|-------------|------|-------------------|--------|-----------|
| ALMA_PACIENTE | 5 min | alma_paciente | 14 | MAXIMA |
| ALMA_EPISODIO | 15 min | alma_episodio | 11 | ALTA |
| ALMA_DIAGNOSTICO | 15 min | alma_diagnostico | 9 | ALTA |
| ALMA_INTERCONSULTA | 30 min | alma_interconsulta | 13 | MEDIA |
| ALMA_ORDENEXAMEN | 15 min | alma_ordenexamen | 15 | ALTA |

**Nota**: Los 20 catalogos `ref_*` (especialidades, TNM, CIE-10, ECOG, FIGO, etc.) NO requieren datos de Sidra. Son estandares internacionales OMS/MINSAL ya precargados.

---

## Tabla 1: ALMA_PACIENTE (Maestro de Pacientes)

**Frecuencia sync**: cada 5 minutos
**Modo sync**: UPSERT por campo `run`
**Volumen estimado**: ~2,000 pacientes activos
**Coleccion NocoBase**: `alma_paciente`

| # | Campo Sidra | Tipo | Obligatorio | Mapeo NocoBase | Ejemplo |
|---|-------------|------|-------------|----------------|---------|
| 1 | run | string | SI | alma_paciente.run | 12.345.678-9 |
| 2 | tipo_documento | string | NO | alma_paciente.tipo_documento | RUN |
| 3 | nro_documento | string | NO | alma_paciente.nro_documento | 12345678 |
| 4 | dv | string | NO | alma_paciente.dv | 9 |
| 5 | nombres | string | SI | alma_paciente.nombres | Maria Elena |
| 6 | apellido_paterno | string | SI | alma_paciente.apellido_paterno | Soto |
| 7 | apellido_materno | string | NO | alma_paciente.apellido_materno | Gonzalez |
| 8 | fecha_nacimiento | date | NO | alma_paciente.fecha_nacimiento | 1955-03-15 |
| 9 | sexo | string | NO | alma_paciente.sexo | F |
| 10 | genero | string | NO | alma_paciente.genero | Femenino |
| 11 | nacionalidad | string | NO | alma_paciente.nacionalidad | Chilena |
| 12 | prevision | string | NO | alma_paciente.prevision | FONASA B |
| 13 | sistema_prevision | string | NO | alma_paciente.sistema_prevision | PUBLIC |
| 14 | fecha_defuncion | date | NO | alma_paciente.fecha_defuncion | null |
| 15 | activo | boolean | SI | alma_paciente.activo | true |

**Uso en UGCO**: Identifica a cada paciente con caso oncologico. Es la tabla mas critica — usada por TODAS las pantallas.

---

## Tabla 2: ALMA_EPISODIO (Episodios Clinicos)

**Frecuencia sync**: cada 15 minutos
**Modo sync**: UPSERT por ID interno
**Volumen estimado**: ~500 episodios/mes
**Coleccion NocoBase**: `alma_episodio`

| # | Campo Sidra | Tipo | Obligatorio | Mapeo NocoBase | Ejemplo |
|---|-------------|------|-------------|----------------|---------|
| 1 | paciente_id | FK→alma_paciente | SI | alma_episodio.paciente_id | 42 |
| 2 | tipo_episodio | string | NO | alma_episodio.tipo_episodio | HOSPITALARIO |
| 3 | fecha_ingreso | date | SI | alma_episodio.fecha_ingreso | 2026-03-01 |
| 4 | fecha_egreso | date | NO | alma_episodio.fecha_egreso | 2026-03-08 |
| 5 | establecimiento | string | NO | alma_episodio.establecimiento | Hospital Ovalle |
| 6 | servicio | string | NO | alma_episodio.servicio | Cirugia General |
| 7 | unidad | string | NO | alma_episodio.unidad | MQ2-205B |
| 8 | profesional_tratante | string | NO | alma_episodio.profesional_tratante | Dr. Perez |
| 9 | motivo_consulta | text | NO | alma_episodio.motivo_consulta | Sospecha ca. colon |
| 10 | resumen_alta | text | NO | alma_episodio.resumen_alta | Alta con biopsia pendiente |
| 11 | activo | boolean | SI | alma_episodio.activo | true |

**Tipos de episodio esperados**: HOSPITALARIO, CONSULTA_EXT, URGENCIA, AMBULATORIO

---

## Tabla 3: ALMA_DIAGNOSTICO (Diagnosticos CIE-10)

**Frecuencia sync**: cada 15 minutos
**Modo sync**: UPSERT por ID interno
**Volumen estimado**: ~300 diagnosticos/mes
**Coleccion NocoBase**: `alma_diagnostico`

| # | Campo Sidra | Tipo | Obligatorio | Mapeo NocoBase | Ejemplo |
|---|-------------|------|-------------|----------------|---------|
| 1 | episodio_id | FK→alma_episodio | SI | alma_diagnostico.episodio_id | 100 |
| 2 | paciente_id | FK→alma_paciente | SI | alma_diagnostico.paciente_id | 42 |
| 3 | tipo_diagnostico | string | NO | alma_diagnostico.tipo_diagnostico | PRINCIPAL |
| 4 | codigo_cie10 | string | SI | alma_diagnostico.codigo_cie10 | C50.9 |
| 5 | descripcion | string | NO | alma_diagnostico.descripcion | Tumor maligno de mama |
| 6 | fecha_registro | date | SI | alma_diagnostico.fecha_registro | 2026-03-01 |
| 7 | profesional_registra | string | NO | alma_diagnostico.profesional_registra | Dra. Lopez |
| 8 | es_oncologico | boolean | SI | alma_diagnostico.es_oncologico | true |
| 9 | activo | boolean | SI | alma_diagnostico.activo | true |

**CRITICO**: Cuando `es_oncologico = true` y `codigo_cie10` esta en rango C00-D48, se GATILLA la creacion automatica de un caso oncologico en `ugco_casooncologico`.

---

## Tabla 4: ALMA_INTERCONSULTA (Interconsultas)

**Frecuencia sync**: cada 30 minutos
**Modo sync**: UPSERT por ID interno
**Volumen estimado**: ~100 interconsultas/mes
**Coleccion NocoBase**: `alma_interconsulta`

| # | Campo Sidra | Tipo | Obligatorio | Mapeo NocoBase | Ejemplo |
|---|-------------|------|-------------|----------------|---------|
| 1 | paciente_id | FK→alma_paciente | SI | alma_interconsulta.paciente_id | 42 |
| 2 | episodio_id | FK→alma_episodio | NO | alma_interconsulta.episodio_id | 100 |
| 3 | especialidad_solicitada | string | SI | alma_interconsulta.especialidad_solicitada | Oncologia |
| 4 | servicio_solicitante | string | NO | alma_interconsulta.servicio_solicitante | Cirugia General |
| 5 | profesional_solicitante | string | NO | alma_interconsulta.profesional_solicitante | Dr. Perez |
| 6 | motivo_solicitud | text | NO | alma_interconsulta.motivo_solicitud | Evaluacion caso ca. colon |
| 7 | prioridad | string | NO | alma_interconsulta.prioridad | URGENTE |
| 8 | fecha_solicitud | date | SI | alma_interconsulta.fecha_solicitud | 2026-03-02 |
| 9 | fecha_aceptacion | date | NO | alma_interconsulta.fecha_aceptacion | 2026-03-02 |
| 10 | fecha_respuesta | date | NO | alma_interconsulta.fecha_respuesta | 2026-03-03 |
| 11 | estado_ic | string | NO | alma_interconsulta.estado_ic | RESPONDIDA |
| 12 | profesional_responde | string | NO | alma_interconsulta.profesional_responde | Dra. Lopez |
| 13 | activo | boolean | SI | alma_interconsulta.activo | true |

**Valores estado_ic**: PENDIENTE, ACEPTADA, EN_CURSO, RESPONDIDA, RECHAZADA, CANCELADA
**Valores prioridad**: RUTINA, URGENTE, EMERGENCIA

---

## Tabla 5: ALMA_ORDENEXAMEN (Ordenes de Examen)

**Frecuencia sync**: cada 15 minutos
**Modo sync**: UPSERT por ID interno
**Volumen estimado**: 50+ registros/dia (MAYOR VOLUMEN)
**Coleccion NocoBase**: `alma_ordenexamen`

| # | Campo Sidra | Tipo | Obligatorio | Mapeo NocoBase | Ejemplo |
|---|-------------|------|-------------|----------------|---------|
| 1 | paciente_id | FK→alma_paciente | SI | alma_ordenexamen.paciente_id | 42 |
| 2 | episodio_id | FK→alma_episodio | NO | alma_ordenexamen.episodio_id | 100 |
| 3 | tipo_orden | string | NO | alma_ordenexamen.tipo_orden | Imagenologia |
| 4 | codigo_examen | string | NO | alma_ordenexamen.codigo_examen | TAC-ABD |
| 5 | nombre_examen | string | SI | alma_ordenexamen.nombre_examen | TAC Abdomen con contraste |
| 6 | fecha_solicitud | date | SI | alma_ordenexamen.fecha_solicitud | 2026-03-02 |
| 7 | fecha_programada | date | NO | alma_ordenexamen.fecha_programada | 2026-03-05 |
| 8 | fecha_realizacion | date | NO | alma_ordenexamen.fecha_realizacion | 2026-03-05 |
| 9 | fecha_informe | date | NO | alma_ordenexamen.fecha_informe | 2026-03-06 |
| 10 | estado_orden | string | NO | alma_ordenexamen.estado_orden | INFORMADO |
| 11 | servicio_solicitante | string | NO | alma_ordenexamen.servicio_solicitante | Cirugia |
| 12 | profesional_solicitante | string | NO | alma_ordenexamen.profesional_solicitante | Dr. Perez |
| 13 | resultado_resumen | text | NO | alma_ordenexamen.resultado_resumen | Masa hepatica sospechosa |
| 14 | url_informe | string | NO | alma_ordenexamen.url_informe | https://... |
| 15 | activo | boolean | SI | alma_ordenexamen.activo | true |

**Tipos de orden**: Imagenologia, Laboratorio, Procedimiento, Anatomia Patologica
**Estados**: SOLICITADO, PROGRAMADO, REALIZADO, INFORMADO, CANCELADO

Cada orden de examen genera automaticamente un `ugco_eventoclinico` con `origen_dato=ALMA`.

---

## Flujo de Datos

```
Sidra_Test ──[consultas SQL programadas]──> NocoBase (alma_*)
                                                │
alma_diagnostico (es_oncologico=true) ──> CREA ugco_casooncologico
alma_ordenexamen ──────────────────────> CREA ugco_eventoclinico
alma_interconsulta ────────────────────> Visible en Ficha 360°
```

**Direccion**: Sidra → NocoBase SOLAMENTE. NocoBase NUNCA escribe hacia Sidra/ALMA.
