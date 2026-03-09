# Evaluacion Blueprint "Entrega de Turno Hospitalario" v2

**Fecha evaluacion**: 2026-03-09
**Blueprint evaluado**: "SISTEMA: Entrega de Turno Hospitalario — Implementacion NocoBase"
**Implementacion actual**: 10 colecciones, 3 workflows, 17 paginas, 11 roles en mira.imedicina.cl

---

## Veredicto: EVOLUCIONAR, NO REEMPLAZAR

El blueprint aporta **3 mejoras valiosas** pero su arquitectura plana es **incompatible** con la integracion ALMA existente. Se recomienda incorporar las mejoras como adiciones al sistema actual.

---

## 1. Mapeo de Colecciones

| Blueprint | Actual | Estado |
|-----------|--------|--------|
| PACIENTES_HOSPITALIZADOS | `et_pacientes_censo` + `et_entrega_paciente` | CONFLICTO — blueprint fusiona 2 tablas |
| NOTAS_CLINICAS | (no existe) | **NUEVA** — incorporar |
| TURNOS_ENTREGA | `et_turnos` | PARCIAL — campos nuevos utiles |
| MEDICOS | `et_usuarios` | PARCIAL — blueprint excluye enfermeria |
| OPERACIONES_TURNO | (no existe) | **NUEVA** — incorporar |
| UNIDADES | `et_servicios` | EQUIVALENTE |
| ESPECIALIDADES | `et_especialidades` | EQUIVALENTE |
| TIPOS_NOTA | (no existe) | **NUEVA** — incorporar |
| — | `et_diagnosticos` | OMITIDO por blueprint |
| — | `et_cotratancia` | OMITIDO por blueprint |
| — | `et_entrega_paciente` | ABSORBIDO en blueprint (incorrecto) |
| — | `et_eventos_turno` | PARCIALMENTE reemplazado |
| — | `et_entrega_enfermeria` | OMITIDO por blueprint (50+ campos) |

---

## 2. Conflictos Arquitectonicos Criticos

### CONFLICTO 1: Modelo de paciente plano vs separado

**Blueprint**: Una tabla `PACIENTES_HOSPITALIZADOS` con datos ALMA + datos editables mezclados.
**Actual**: `et_pacientes_censo` (ALMA, read-only) + `et_entrega_paciente` (editable por turno).

**Por que NO fusionar**: El sync ALMA cada 30 min sobreescribiria campos editados manualmente (pendientes, estado_clinico, plan_tratamiento). La separacion protege la integridad de datos clinicos.

### CONFLICTO 2: Turno global vs turno por especialidad

**Blueprint**: Un turno global por dia con `cirujano_residente` y `cirujano_urgencias`.
**Actual**: Un turno por especialidad por periodo (Medicina-Manana, Cirugia-Tarde, etc.).

**Por que NO cambiar**: El hospital opera con 7+ especialidades haciendo entregas independientes. Un turno global pierde la granularidad operacional real.

### CONFLICTO 3: MEDICOS vs et_usuarios

**Blueprint**: Tabla `MEDICOS` solo para doctores (Staff/Residente/Becado/Externo).
**Actual**: `et_usuarios` incluye medicos Y enfermeros (cargo: Medico/Enfermero-a/Interno/Becado).

**Por que NO separar**: `et_entrega_enfermeria` usa FKs a `et_usuarios` para enfermera_saliente, enfermera_entrante, enfermera_cargo. Eliminar enfermeria de la tabla rompe 50+ campos de entrega de enfermeria.

---

## 3. Diferencias de Enums

| Contexto | Actual | Blueprint | Resolucion |
|----------|--------|-----------|------------|
| Estado paciente | estable, inestable, grave, critico, alta_programada | Estable, Observacion, Critico, Alta pendiente | MANTENER actual (mas granular) |
| Estado turno | borrador, en_curso, completada, firmada | Borrador, Cerrado, Firmado | MANTENER actual (4 estados vs 3) |
| Cargo usuario | Medico, Enfermero/a, Interno, Becado | Staff, Residente, Becado, Externo | MANTENER actual + AGREGAR `categoria` como campo adicional |

---

## 4. Que SI Incorporar del Blueprint

### 4.1 NUEVA coleccion: `et_notas_clinicas`

Notas clinicas independientes del turno. Actualmente las notas estan embebidas en `et_entrega_paciente` (resumen_historia, plan_tratamiento) y se pierden entre turnos.

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| paciente_censo_id | FK → et_pacientes_censo | SI | |
| fecha_nota | datetime | SI | default: now() |
| turno_horario | enum | SI | Manana/Tarde/Noche/Guardia |
| tipo_nota_id | FK → et_tipos_nota | SI | |
| contenido | richtext | SI | |
| es_procedimiento_cx | boolean | NO | default: false |

**Inmutabilidad**: createdBy y createdAt son automaticos e inmutables. Las notas NO se editan ni eliminan.

### 4.2 NUEVA coleccion: `et_operaciones_turno`

Tracking estructurado de cirugias. Reemplaza los campos `fue_operado` + `procedimiento` (texto libre) de et_entrega_paciente.

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| paciente_censo_id | FK → et_pacientes_censo | SI | |
| turno_id | FK → et_turnos | NO | |
| fecha_hora_cx | datetime | SI | |
| tipo_cirugia | enum | NO | Electiva/Urgencia/Reoperacion |
| procedimiento | text | SI | |
| cirujano_principal_id | FK → et_usuarios | NO | |
| ayudante_id | FK → et_usuarios | NO | |
| anestesiologo | string | NO | Texto libre (no FK) |
| complicaciones | text | NO | |
| estado_cx | enum | NO | Pendiente/En Pabellon/Completada/Suspendida |

### 4.3 NUEVO catalogo: `et_tipos_nota`

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| nombre | string | SI |
| codigo | string | SI (unique) |
| activo | boolean | SI (default: true) |

**Seed data sugerido**: Ingreso, Alta, Evolucion, Enfermeria, Observacion, Procedimiento, Interconsulta

### 4.4 Campos nuevos en colecciones existentes

**En `et_pacientes_censo`** (2 campos):
- `tipo_ingreso` (enum: Electivo/Urgencia/Traslado/Reingreso)
- `es_aislamiento` (boolean, default: false)

**En `et_turnos`** (7 campos):
- `total_altas` (integer, default: 0)
- `total_ingresos` (integer, default: 0)
- `total_fallecidos` (integer, default: 0)
- `total_operados` (integer, default: 0)
- `total_evaluaciones` (integer, default: 0)
- `total_interconsultas` (integer, default: 0)
- `pdf_generado` (attachment)

### 4.5 Nuevo workflow: Alerta paciente critico

**Trigger**: Collection event on `et_entrega_paciente`, afterUpdate, cuando `estado_paciente` cambia a "critico".
**Accion**: Notificacion in-app al medico_tratante y al responsable del turno activo.

### 4.6 Nuevas vistas

- **"Mis Pacientes"**: Filtro `medico_tratante_id = $currentUser` AND `alta_confirmada = false`
- **"Unidades Criticas"**: Filtro `servicio IN ('UCI','UTI')` AND `alta_confirmada = false`
- **"Altas del Dia"**: Filtro `alta_confirmada = true` AND `f_alta_medica = TODAY()`

---

## 5. Que NO Incorporar del Blueprint

| Propuesta Blueprint | Razon de Rechazo |
|---------------------|------------------|
| Tabla plana PACIENTES_HOSPITALIZADOS | Rompe separacion ALMA read-only vs datos editables |
| Turno global sin especialidad | Hospital opera con 7+ especialidades independientes |
| MEDICOS solo-doctores | Enfermeria necesita estar en et_usuarios para FKs |
| Eliminar et_entrega_enfermeria | 50+ campos de enfermeria sin reemplazo |
| Eliminar et_cotratancia | Seguimiento inter-especialidad es workflow real |
| Eliminar et_diagnosticos | Multiples diagnosticos CIE-10 son clinicamente necesarios |
| Eliminar et_eventos_turno | Log de eventos no-quirurgicos (ingresos, altas, fallecimientos) |
| Formula dias_hospitalizacion | ALMA ya calcula y provee este dato |
| Formula texto_distribucion | Complejidad innecesaria; se genera en el workflow de cierre |

---

## 6. Roadmap de Implementacion

### Fase 1: Nuevas colecciones (additive)
1. Crear `et_tipos_nota` + seed data (7 tipos)
2. Crear `et_notas_clinicas` con FKs
3. Crear `et_operaciones_turno` con FKs
4. Crear paginas UI para ambas colecciones

### Fase 2: Campos adicionales
5. Agregar `tipo_ingreso`, `es_aislamiento` a et_pacientes_censo
6. Agregar 7 campos de conteo + `pdf_generado` a et_turnos

### Fase 3: Workflow + vistas
7. Crear workflow "Alerta paciente critico"
8. Crear vistas filtradas (Mis Pacientes, Unidades Criticas, Altas del Dia)

### Fase 4: ACL
9. Configurar permisos para nuevas colecciones segun roles existentes

---

## 7. Impacto en ACL (Permisos por Rol)

| Rol | et_notas_clinicas | et_operaciones_turno | et_tipos_nota |
|-----|-------------------|---------------------|---------------|
| medico | list/view/create | list/view/create/update | list/view |
| enfermeria | list/view/create (solo tipo Enfermeria/Observacion) | list/view | list/view |
| tens | (sin acceso) | (sin acceso) | (sin acceso) |
| administrativo | list/view | list/view | list/view |
| admin | CRUD completo | CRUD completo | CRUD completo |

---

## 8. Campos Minimos Obligatorios en Pantalla de Paciente

Toda vista que muestre un paciente DEBE incluir estas columnas:

| # | Campo | Fuente | Tipo |
|---|-------|--------|------|
| 1 | Nombre completo | et_pacientes_censo.nombre | string |
| 2 | RUT | et_pacientes_censo.rut | string (XX.XXX.XXX-X) |
| 3 | Edad | et_pacientes_censo.edad | integer |
| 4 | Diagnostico principal | et_pacientes_censo.dx_principal | text |
| 5 | Servicio | et_pacientes_censo.servicio_id → et_servicios.nombre | relacion |
| 6 | Sala/Cama | et_pacientes_censo.sala + cama | string |

**NOTA**: El campo `nombre` en et_pacientes_censo debe construirse como `"${nombres} ${apellido_paterno} ${apellido_materno}"` desde la fuente Sidra. Esto aplica a TODAS las apps (UGCO, BUHO, ENTREGA).
