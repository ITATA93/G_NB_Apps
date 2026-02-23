# Diccionario de Datos — Modulo AGENDA

## Colecciones

### ag_categorias_actividad (Catalogo)
| Campo | Tipo | Req | Unique | Default | Descripcion |
|-------|------|-----|--------|---------|-------------|
| id | integer | auto | si | auto | PK |
| nombre | string | si | no | — | Nombre categoria |
| codigo | string | si | si | — | Codigo corto (VIS, SALA, PAB...) |
| grupo | string | no | no | — | Clinica, Quirurgica, Policlinico, Oncologia, Administrativa, Otro |
| orden | integer | no | no | — | Orden en reportes |
| color | string | no | no | — | Color hex para calendario |
| activa | boolean | no | no | true | Activa/inactiva |

### ag_tipos_inasistencia (Catalogo)
| Campo | Tipo | Req | Unique | Default | Descripcion |
|-------|------|-----|--------|---------|-------------|
| id | integer | auto | si | auto | PK |
| nombre | string | si | no | — | Nombre completo |
| codigo | string | si | si | — | PA, LM, CS, CAP, FL, DC |
| descripcion | text | no | no | — | Detalle del tipo |
| activo | boolean | no | no | true | Activo/inactivo |

### ag_servicios (Catalogo)
| Campo | Tipo | Req | Unique | Default | Descripcion |
|-------|------|-----|--------|---------|-------------|
| id | integer | auto | si | auto | PK |
| nombre | string | si | no | — | Nombre servicio |
| codigo | string | si | si | — | Codigo ALMA |
| activo | boolean | no | no | true | Activo/inactivo |

### ag_funcionarios (Maestro)
| Campo | Tipo | Req | Unique | Default | FK | Descripcion |
|-------|------|-----|--------|---------|-----|-------------|
| id | integer | auto | si | auto | — | PK |
| nombre_completo | string | si | no | — | — | Nombre del profesional |
| rut | string | si | si | — | — | RUT chileno |
| codigo_alma | string | no | no | — | — | Codigo en ALMA |
| especialidad | string | no | no | — | — | Especialidad medica |
| servicio_id | belongsTo | no | no | — | ag_servicios | Servicio asignado |
| cargo | string | no | no | — | — | Medico Cirujano / Internista / Especialista |
| email | string | no | no | — | — | Correo institucional |
| jornada_horas | integer | no | no | — | — | Horas contrato semanal |
| activo | boolean | no | no | true | — | Activo/inactivo |

### ag_bloques_agenda (Transaccional — TABLA CENTRAL)
| Campo | Tipo | Req | Unique | Default | FK | Descripcion |
|-------|------|-----|--------|---------|-----|-------------|
| id | integer | auto | si | auto | — | PK |
| fecha | date | si | no | — | — | Fecha del bloque |
| funcionario_id | belongsTo | si | no | — | ag_funcionarios | Medico asignado |
| categoria_id | belongsTo | si | no | — | ag_categorias_actividad | Tipo de actividad |
| subcategoria | string | no | no | — | — | Sub-codigo libre (DA, DB, P...) |
| hora_inicio | time | si | no | — | — | HH:MM inicio |
| hora_fin | time | si | no | — | — | HH:MM fin |
| duracion_min | integer | no | no | — | — | Calculado: fin - inicio |
| periodo | string | no | no | — | — | AM (<14:00) o PM (>=14:00) |
| servicio_id | belongsTo | no | no | — | ag_servicios | Donde se realizo |
| observaciones | text | no | no | — | — | Notas libres |

### ag_inasistencias (Transaccional)
| Campo | Tipo | Req | Unique | Default | FK | Descripcion |
|-------|------|-----|--------|---------|-----|-------------|
| id | integer | auto | si | auto | — | PK |
| fecha | date | si | no | — | — | Fecha ausencia |
| funcionario_id | belongsTo | si | no | — | ag_funcionarios | Funcionario ausente |
| tipo_inasistencia_id | belongsTo | si | no | — | ag_tipos_inasistencia | Tipo de ausencia |
| periodo | string | no | no | — | — | Completo, AM o PM |
| notas | text | no | no | — | — | Observaciones |

### ag_resumen_diario (Generado)
| Campo | Tipo | Req | Unique | Default | FK | Descripcion |
|-------|------|-----|--------|---------|-----|-------------|
| id | integer | auto | si | auto | — | PK |
| fecha | date | si | no | — | — | Fecha |
| funcionario_id | belongsTo | si | no | — | ag_funcionarios | Funcionario |
| total_horas | double | no | no | — | — | Total horas trabajadas |
| hora_salida | time | no | no | — | — | Ultima hora de salida |
| sala_count | integer | no | no | — | — | N actividades Sala |
| pab_am | integer | no | no | — | — | N pabellon AM |
| pab_pm | integer | no | no | — | — | N pabellon PM |
| poli_am | integer | no | no | — | — | N policlinico AM |
| poli_pm | integer | no | no | — | — | N policlinico PM |
| inasistencias | integer | no | no | — | — | N inasistencias del dia |
| detalle_json | json | no | no | — | — | Breakdown por categoria |

### ag_resumen_semanal (Generado)
| Campo | Tipo | Req | Unique | Default | FK | Descripcion |
|-------|------|-----|--------|---------|-----|-------------|
| id | integer | auto | si | auto | — | PK |
| semana_inicio | date | si | no | — | — | Lunes de la semana |
| semana_fin | date | si | no | — | — | Domingo |
| funcionario_id | belongsTo | si | no | — | ag_funcionarios | Funcionario |
| total_horas | double | no | no | — | — | Total horas semana |
| detalle_json | json | no | no | — | — | Breakdown con subcategorias |
| generado_at | datetime | no | no | — | — | Timestamp generacion |

## Relaciones

```
ag_servicios ←── ag_funcionarios.servicio_id
ag_funcionarios ←── ag_bloques_agenda.funcionario_id
ag_categorias_actividad ←── ag_bloques_agenda.categoria_id
ag_servicios ←── ag_bloques_agenda.servicio_id
ag_funcionarios ←── ag_inasistencias.funcionario_id
ag_tipos_inasistencia ←── ag_inasistencias.tipo_inasistencia_id
ag_funcionarios ←── ag_resumen_diario.funcionario_id
ag_funcionarios ←── ag_resumen_semanal.funcionario_id
```
