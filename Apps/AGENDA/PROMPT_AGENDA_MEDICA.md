# PROMPT: Agenda Medica — Especificacion Tecnica

## 1. Objetivo

Modulo de gestion de agendas medicas para el Hospital de Ovalle, desplegado sobre NocoBase.
Reemplaza el sistema anterior basado en Google Sheets + Apps Script.

**Fase 1:** Agenda para medicos (cirujanos, internistas, especialistas).
**Fase 2 (futura):** Extension a otros funcionarios clinicos.

## 2. Origen de datos

El sistema anterior utiliza:
- Google Sheets con celdas tipo `"VIS.DA: 08:00 - 10:30"` por medico por dia
- Apps Script con funciones: `totalhoras()`, `resumenDiario()`, `resumenSemanal()`, `horasalida()`, `buscarInasistencia()`
- Hoja "Inasistencias" con columnas: Fecha, Tipo (PA/LM/CS/CAP/FL/DC), Nombre, Notas

## 3. Modelo de datos

### 3.1 Colecciones (prefijo `ag_`)

**Catalogos:**

| # | Coleccion | Registros seed | Descripcion |
|---|-----------|---------------|-------------|
| 1 | ag_categorias_actividad | 16 | Tipos de actividad medica |
| 2 | ag_tipos_inasistencia | 6 | Tipos de ausencia |
| 3 | ag_servicios | 10 | Servicios hospitalarios |

**Maestros:**

| # | Coleccion | FK | Descripcion |
|---|-----------|-----|-------------|
| 4 | ag_funcionarios | ag_servicios | Personal medico |

**Transaccionales:**

| # | Coleccion | FK principales | Descripcion |
|---|-----------|----------------|-------------|
| 5 | ag_bloques_agenda | ag_funcionarios, ag_categorias_actividad, ag_servicios | Tabla central: 1 fila = 1 bloque horario |
| 6 | ag_inasistencias | ag_funcionarios, ag_tipos_inasistencia | Registro de ausencias |

**Generados:**

| # | Coleccion | FK | Descripcion |
|---|-----------|-----|-------------|
| 7 | ag_resumen_diario | ag_funcionarios | Agregacion diaria auto-generada |
| 8 | ag_resumen_semanal | ag_funcionarios | Agregacion semanal auto-generada |

### 3.2 Campos por coleccion

#### ag_categorias_actividad
- nombre (string, required)
- codigo (string, required, unique)
- grupo (string, enum: Clinica/Quirurgica/Policlinico/Oncologia/Administrativa/Otro)
- orden (integer)
- color (string, hex)
- activa (boolean, default: true)

#### ag_tipos_inasistencia
- nombre (string, required)
- codigo (string, required, unique)
- descripcion (text)
- activo (boolean, default: true)

#### ag_servicios
- nombre (string, required)
- codigo (string, required, unique)
- activo (boolean, default: true)

#### ag_funcionarios
- nombre_completo (string, required)
- rut (string, required, unique)
- codigo_alma (string)
- especialidad (string)
- servicio_id (belongsTo -> ag_servicios)
- cargo (string, enum: Medico Cirujano/Medico Internista/Medico Especialista)
- email (string)
- jornada_horas (integer)
- activo (boolean, default: true)

#### ag_bloques_agenda (tabla central)
- fecha (date, required)
- funcionario_id (belongsTo -> ag_funcionarios, required)
- categoria_id (belongsTo -> ag_categorias_actividad, required)
- subcategoria (string)
- hora_inicio (time, required)
- hora_fin (time, required)
- duracion_min (integer, calculado)
- periodo (string, enum: AM/PM, calculado)
- servicio_id (belongsTo -> ag_servicios)
- observaciones (text)

#### ag_inasistencias
- fecha (date, required)
- funcionario_id (belongsTo -> ag_funcionarios, required)
- tipo_inasistencia_id (belongsTo -> ag_tipos_inasistencia, required)
- periodo (string, enum: Completo/AM/PM)
- notas (text)

#### ag_resumen_diario
- fecha (date, required)
- funcionario_id (belongsTo -> ag_funcionarios, required)
- total_horas (double)
- hora_salida (time)
- sala_count (integer)
- pab_am, pab_pm (integer)
- poli_am, poli_pm (integer)
- inasistencias (integer)
- detalle_json (json)

#### ag_resumen_semanal
- semana_inicio (date, required)
- semana_fin (date, required)
- funcionario_id (belongsTo -> ag_funcionarios, required)
- total_horas (double)
- detalle_json (json)
- generado_at (datetime)

## 4. Categorias de actividad (seed)

Extraidas del Apps Script original:

| Codigo | Nombre | Grupo | Color |
|--------|--------|-------|-------|
| VIS | Visita | Clinica | #3B82F6 |
| SALA | Sala | Clinica | #10B981 |
| ENT | ENT | Clinica | #8B5CF6 |
| PAB | Pabellon | Quirurgica | #EF4444 |
| CX.MEN | Cirugia Menor | Quirurgica | #F97316 |
| POLI | Poli General | Policlinico | #06B6D4 |
| P.VAS | Poli Vascular | Policlinico | #0891B2 |
| POLI.HID | Poli Hidatidosis | Policlinico | #0E7490 |
| P.ONC | Poli Oncologico | Oncologia | #DB2777 |
| C.ONC | Comite Oncologico | Oncologia | #BE185D |
| INF.ONC | Informe Oncologico | Oncologia | #9D174D |
| G.INTER | Gestion Interconsulta | Clinica | #059669 |
| R | Reuniones | Administrativa | #D97706 |
| JEF | Jefatura | Administrativa | #92400E |
| ENDO | Endoscopia | Quirurgica | #7C3AED |
| T.TRAB | Teletrabajo | Otro | #6366F1 |

## 5. Roles y permisos

### admin_agenda
- Acceso total CRUD a las 8 colecciones
- Puede generar resumenes, gestionar catalogos, exportar datos

### jefe_servicio_agenda
- Lista/ve catalogos (solo lectura)
- CRUD de bloques e inasistencias filtrados por funcionarios de su servicio
- Ve resumenes de su servicio

### medico_agenda
- Lista/ve catalogos (solo lectura)
- CRUD de bloques propios (funcionario_id = self)
- Ve sus propias inasistencias y resumenes

## 6. Paginas UI

### Menu "Agenda Medica"
1. Dashboard — Charts de horas por categoria, top medicos, inasistencias mes
2. Agenda Semanal — Vista calendario con bloques por color
3. Registro de Actividades — Tabla CRUD ag_bloques_agenda
4. Inasistencias — Tabla CRUD ag_inasistencias
5. Resumen Diario — Tabla filtrable ag_resumen_diario
6. Resumen Semanal — Tabla filtrable ag_resumen_semanal
7. Funcionarios — Tabla CRUD ag_funcionarios
8. Categorias — Tabla CRUD ag_categorias_actividad

### Submenu "Admin Agenda" (solo admin_agenda)
9. Tipos Inasistencia — CRUD catalogo
10. Servicios — CRUD catalogo
11. Generar Resumenes — Boton para regenerar diario/semanal
12. Reportes — Charts comparativos por servicio

## 7. Workflows (Fase 2)

1. **calcular_duracion**: Al crear/editar ag_bloques_agenda, calcular duracion_min y periodo
2. **generar_resumen_diario**: Cron 23:00, agrupa bloques del dia
3. **generar_resumen_semanal**: Cron lunes 06:00, agrupa semana anterior

## 8. Mapeo Sheets -> NocoBase

| Sheets | NocoBase |
|--------|----------|
| Celda "VIS.DA: 08:00-10:30" | Fila ag_bloques_agenda |
| totalhoras() | ag_resumen_diario.total_horas |
| resumenDiario() | Pagina Resumen Diario |
| resumenSemanal() | Pagina Resumen Semanal |
| horasalida() | ag_resumen_diario.hora_salida |
| buscarInasistencia() | ag_inasistencias (filtro) |
| Hoja Inasistencias | ag_inasistencias |

## 9. Deploy

```bash
npx tsx Apps/AGENDA/scripts/deploy-agenda-collections.ts --dry-run
npx tsx Apps/AGENDA/scripts/deploy-agenda-collections.ts
npx tsx Apps/AGENDA/scripts/deploy-agenda-collections.ts --seed-only
```
