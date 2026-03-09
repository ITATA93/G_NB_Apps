# ENTREGA DE TURNO — Datos Requeridos para Produccion

**Destino**: mira.hospitaldeovalle.cl
**Fuente**: Sidra_Test (servidor hospital)
**Fecha**: 2026-03-09

---

## Regla Visual Obligatoria

Toda pantalla que muestre informacion de paciente DEBE incluir:
- **Nombre completo**: nombres + apellido_paterno + apellido_materno
- **RUT**: formato XX.XXX.XXX-X
- **Edad**: en anos
- **Diagnostico principal**: texto descriptivo

---

## Resumen de Fuentes

| Tabla Sidra | Sync | Coleccion NocoBase | Campos | Prioridad |
|-------------|------|-------------------|--------|-----------|
| CENSO_HOSPITALIZADOS | 30 min | et_pacientes_censo | 24 | MAXIMA |
| DIAGNOSTICOS_PACIENTE | 30 min | et_diagnosticos | 6 | ALTA |
| PERSONAL_CLINICO | Semanal | et_usuarios | 7 | MEDIA |
| REPORTE_ZEN_ENFERMERIA | 3x/dia | et_entrega_enfermeria | 48 | MEDIA |

**Nota**: Los catalogos de referencia ya estan precargados y NO requieren Sidra:
- `et_especialidades` — 9 especialidades (MI, CG, MINT, PED, OBG, TRAU, NEO, CI, MULTI)
- `et_servicios` — 12 servicios (MQ1, MQ2, MQ3, PCER, UCI, UTI, CIBU, PED, OBST, GIN, NEO, TRAU)

Las colecciones transaccionales son generadas internamente:
- `et_turnos` — Creadas por medicos al iniciar entrega
- `et_entrega_paciente` — Generadas por workflow al crear turno
- `et_eventos_turno` — Generadas por workflow al firmar turno
- `et_cotratancia` — Creadas manualmente por medicos

---

## Tabla 1: CENSO_HOSPITALIZADOS

**Frecuencia sync**: cada 30 minutos
**Modo sync**: UPSERT por campo `id_episodio` (unique)
**Volumen estimado**: ~100-150 pacientes hospitalizados simultaneos
**Coleccion NocoBase**: `et_pacientes_censo`
**Compartida con**: BUHO (misma fuente, campos similares)

| # | Campo Sidra | Tipo | Obligatorio | Mapeo NocoBase | Ejemplo |
|---|-------------|------|-------------|----------------|---------|
| 1 | id_episodio | string | SI | et_pacientes_censo.id_episodio | EP-2026-001234 |
| 2 | rut | string | SI | et_pacientes_censo.rut | 12.345.678-9 |
| 3 | nro_ficha | string | NO | et_pacientes_censo.nro_ficha | 123456 |
| 4 | nombres | string | SI | et_pacientes_censo.nombre* | Maria Elena |
| 5 | apellido_paterno | string | SI | (concatenar a nombre)* | Soto |
| 6 | apellido_materno | string | NO | (concatenar a nombre)* | Gonzalez |
| 7 | edad | integer | SI | et_pacientes_censo.edad | 68 |
| 8 | sexo | string | NO | et_pacientes_censo.sexo | F |
| 9 | servicio_codigo | string | SI | et_pacientes_censo.servicio_id** | MQ1 |
| 10 | sala | string | NO | et_pacientes_censo.sala | 3 |
| 11 | cama | string | NO | et_pacientes_censo.cama | A |
| 12 | medico_tratante | string | NO | et_pacientes_censo.medico_tratante_alma | Dr. Juan Perez |
| 13 | cod_medico | string | NO | et_pacientes_censo.cod_medico | MED-001 |
| 14 | especialidad_clinica | string | NO | et_pacientes_censo.especialidad_clinica | Medicina Interna |
| 15 | fecha_ingreso | datetime | SI | et_pacientes_censo.f_ingreso | 2026-03-01T10:30 |
| 16 | dias_hospitalizacion | integer | NO | et_pacientes_censo.dias_hospitalizacion | 8 |
| 17 | diagnostico_principal | text | SI | et_pacientes_censo.dx_principal | Neumonia adquirida comunidad |
| 18 | fecha_probable_alta | date | NO | et_pacientes_censo.f_probable_alta | 2026-03-12 |
| 19 | alta_confirmada | boolean | NO | et_pacientes_censo.alta_confirmada | false |
| 20 | fecha_alta_medica | date | NO | et_pacientes_censo.f_alta_medica | null |
| 21 | alergias | text | NO | et_pacientes_censo.alergias | Penicilina |
| 22 | telefono | string | NO | et_pacientes_censo.telefono | +56912345678 |
| 23 | tipo_ingreso | string | NO | et_pacientes_censo.tipo_ingreso | Urgencia |
| 24 | es_aislamiento | boolean | NO | et_pacientes_censo.es_aislamiento | false |

*`nombre` en NocoBase se construye como `"${nombres} ${apellido_paterno} ${apellido_materno}"`. Si Sidra entrega `nombre_completo` como campo unico, se mapea directo.

**`servicio_codigo` se mapea a `et_servicios.codigo` para obtener el ID numerico de la relacion.

### Valores esperados para campos enum

**tipo_ingreso**: Electivo | Urgencia | Traslado | Reingreso

---

## Tabla 2: DIAGNOSTICOS_PACIENTE

**Frecuencia sync**: cada 30 minutos (junto con censo)
**Modo sync**: UPSERT por combinacion `id_episodio` + `cod_cie`
**Volumen estimado**: ~2-5 diagnosticos por paciente
**Coleccion NocoBase**: `et_diagnosticos`

| # | Campo Sidra | Tipo | Obligatorio | Mapeo NocoBase | Ejemplo |
|---|-------------|------|-------------|----------------|---------|
| 1 | id_episodio | string | SI | et_diagnosticos.paciente_censo_id* | EP-2026-001234 |
| 2 | tipo_dx | string | NO | et_diagnosticos.tipo_dx | Principal |
| 3 | diagnostico | text | NO | et_diagnosticos.diagnostico | Neumonia adquirida comunidad |
| 4 | cod_cie | string | NO | et_diagnosticos.cod_cie | J18.9 |
| 5 | fecha_dx | date | NO | et_diagnosticos.fecha_dx | 2026-03-01 |
| 6 | activo | boolean | NO | et_diagnosticos.activo | true |

*`id_episodio` se resuelve al `id` numerico de `et_pacientes_censo` via lookup por `id_episodio`.

### Valores esperados para campos enum

**tipo_dx**: Principal | Secundario | Comorbilidad

---

## Tabla 3: PERSONAL_CLINICO

**Frecuencia sync**: semanal (lunes 06:00)
**Modo sync**: UPSERT por campo `rut` (unique)
**Volumen estimado**: ~150-200 funcionarios (medicos + enfermeros)
**Coleccion NocoBase**: `et_usuarios`
**Compartida con**: AGENDA (misma fuente, subcampos distintos)

| # | Campo Sidra | Tipo | Obligatorio | Mapeo NocoBase | Ejemplo |
|---|-------------|------|-------------|----------------|---------|
| 1 | rut | string | NO | et_usuarios.rut | 10.234.567-8 |
| 2 | nombre_completo | string | SI | et_usuarios.nombre | Dr. Juan Perez M. |
| 3 | codigo_alma | string | NO | et_usuarios.codigo_alma | MED-001 |
| 4 | cargo | string | NO | et_usuarios.cargo | Medico |
| 5 | especialidad | string | NO | et_usuarios.especialidad | Cirugia General |
| 6 | email | string | NO | et_usuarios.email | jperez@hospital.cl |
| 7 | activo | boolean | SI | et_usuarios.activo | true |

### Valores esperados para campos enum

**cargo**: Medico | Enfermero/a | Interno | Becado

**IMPORTANTE**: A diferencia de AGENDA (solo medicos), ENTREGA necesita TANTO medicos COMO enfermeros en esta tabla, ya que `et_entrega_enfermeria` referencia enfermeras via FK a `et_usuarios`.

---

## Tabla 4: REPORTE_ZEN_ENFERMERIA

**Frecuencia sync**: 3 veces al dia (cambio de turno: 07:00, 15:00, 23:00)
**Modo sync**: INSERT (cada turno genera nuevos registros)
**Volumen estimado**: ~100-150 registros por turno
**Coleccion NocoBase**: `et_entrega_enfermeria`

### Campos de identificacion (join con censo)

| # | Campo Sidra | Tipo | Obligatorio | Mapeo NocoBase |
|---|-------------|------|-------------|----------------|
| 1 | id_episodio | string | SI | et_entrega_enfermeria.paciente_censo_id* |

*Se resuelve al ID numerico via lookup en et_pacientes_censo.

### Campos clinicos (48 campos del reporte ZEN)

| Grupo | Campos Sidra | Tipo | Mapeo NocoBase |
|-------|-------------|------|----------------|
| **Diagnosticos** | dx_confirmados, dx_preoperatorio | text | .dx_confirmados, .dx_preoperatorio |
| **Cirugia** | cirugia_procedimiento, fecha_agendada, hora_agendada, quirofano, estado_cirugia | text/date/string | .cirugia_procedimiento, .fecha_agendada, etc. |
| **Dispositivos** | dispositivo_invasivo, fecha_instalacion, ubicacion_lateralidad, dias_instalado, comentarios_instalacion | text/date/int | .dispositivo_invasivo, .fecha_instalacion, etc. |
| **Egresos** | egreso_diuresis, egreso_drenaje, egreso_drenaje_3, egreso_drenaje_4, egreso_drenaje_5 | double (ml) | .egreso_diuresis, .egreso_drenaje, etc. |
| **Laboratorio** | lab_pendientes, img_pendientes | text | .lab_pendientes, .img_pendientes |
| **Signos vitales** | fc, pa_sistolica, pa_diastolica, fr, sat_o2, temperatura, hgt, eva_dolor | double | .fc, .pa_sistolica, etc. |
| **Insulina** | hgt_insulina, clasificacion_insulina, tipo_insulina, dosis_insulina, sitio_puncion_insulina, comentarios_insulina | double/string/text | .hgt_insulina, .tipo_insulina, etc. |
| **Otros** | ic_internas_pendientes, medicamentos, alergias, escala_caidas, riesgo_dependencia, regimen | text/string | .ic_internas_pendientes, .medicamentos, etc. |
| **Notas** | observaciones, cuidados_especiales, incidentes | text | .observaciones, .cuidados_especiales, .incidentes |

### Rangos esperados para signos vitales

| Campo | Unidad | Rango normal | Alerta |
|-------|--------|-------------|--------|
| fc | bpm | 60-100 | <50 o >120 |
| pa_sistolica | mmHg | 90-140 | <80 o >180 |
| pa_diastolica | mmHg | 60-90 | <50 o >110 |
| fr | rpm | 12-20 | <8 o >30 |
| sat_o2 | % | 94-100 | <90 |
| temperatura | C | 36.0-37.5 | <35.5 o >38.5 |
| hgt | mg/dL | 70-180 | <60 o >300 |
| eva_dolor | 0-10 | 0-3 | >7 |

---

## Notas de Implementacion

### Orden de carga sugerido
1. PERSONAL_CLINICO (et_usuarios) — sin dependencias
2. CENSO_HOSPITALIZADOS (et_pacientes_censo) — depende de et_servicios (ya precargado)
3. DIAGNOSTICOS_PACIENTE (et_diagnosticos) — depende de et_pacientes_censo
4. REPORTE_ZEN_ENFERMERIA (et_entrega_enfermeria) — depende de et_pacientes_censo + et_usuarios

### Campos compartidos con otras apps

| Campo Sidra | ENTREGA | BUHO | UGCO | AGENDA |
|-------------|---------|------|------|--------|
| Censo pacientes | et_pacientes_censo | buho_pacientes | alma_paciente | - |
| Diagnosticos | et_diagnosticos | - | alma_diagnostico | - |
| Funcionarios | et_usuarios | - | - | ag_funcionarios |

**IMPORTANTE**: ENTREGA y BUHO comparten la misma fuente de censo de pacientes. Sidra_Test puede exponer UNA vista SQL que alimente ambas apps, mapeando los campos segun la coleccion destino.
