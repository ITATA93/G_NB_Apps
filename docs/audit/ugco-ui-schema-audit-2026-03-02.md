# UGCO Oncology App - UI Schema Audit Report

**Date:** 2026-03-02  
**Source:** NocoBase API uiSchemas + collections endpoints  
**Base URL:** `https://mira.hospitaldeovalle.cl/api`

---

## 1. Record Counts

| Collection | Records | Status |
|---|---|---|
| `onco_casos` | 1,035 | Active |
| `onco_episodios` | 2,529 | Active |
| `onco_comite_sesiones` | 86 | Active |
| `onco_comite_casos` | 605 | Active |
| `UGCO_casooncologico` (OLD) | 0 | Empty/Legacy |
| `UGCO_eventoclinico` (OLD) | 0 | Empty/Legacy |

> **Note:** `onco_sesiones_comite` returned 404. The actual collection is `onco_comite_sesiones` (86 records).

---

## 2. Collection Field Definitions

### 2.1 `onco_casos` (12 fields)

| Field | Type | Interface | UI Title |
|---|---|---|---|
| `codigo_cie10` | string | input | Codigo CIE-10 |
| `comite_presentaciones` | hasMany | o2m | Presentaciones en Comite |
| `diagnostico_principal` | text | textarea | Diagnostico Principal |
| `episodios` | hasMany | o2m | Episodios |
| `estadio_clinico` | string | select | Estadio Clinico |
| `estado` | string | select | Estado del Caso |
| `fecha_ingreso` | date | date | Fecha Ingreso |
| `observaciones` | text | textarea | Observaciones |
| `paciente_id` | string | input | ID Paciente |
| `paciente_nombre` | string | input | Nombre Paciente |
| `paciente_rut` | string | input | RUT Paciente |
| `responsible_doctor` | belongsTo | (none) | Medico Responsable |

### 2.2 `onco_episodios` (8 fields)

| Field | Type | Interface | UI Title |
|---|---|---|---|
| `caso` | belongsTo | obo | Caso Oncologico |
| `caso_id` | bigInt | integer | caso_id |
| `descripcion` | text | textarea | Descripcion |
| `estado_episodio` | string | select | Estado |
| `fecha` | date | date | Fecha |
| `notas_clinicas` | text | textarea | Notas Clinicas |
| `resultado` | text | textarea | Resultado |
| `tipo_episodio` | string | select | Tipo de Episodio |

### 2.3 `onco_comite_sesiones` (7 fields)

| Field | Type | Interface | UI Title |
|---|---|---|---|
| `tipo_comite` | string | select | Tipo de Comite |
| `numero_sesion` | string | input | Numero de Sesion |
| `asistentes` | text | textarea | Asistentes |
| `fecha` | date | date | Fecha de Sesion |
| `acta` | text | textarea | Acta |
| `estado_sesion` | string | select | Estado |
| `casos_presentados` | hasMany | o2m | Casos Presentados |

### 2.4 `onco_comite_casos` (9 fields)

| Field | Type | Interface | UI Title |
|---|---|---|---|
| `caso` | belongsTo | obo | Caso Oncologico |
| `caso_id` | bigInt | integer | caso_id |
| `decision` | text | textarea | Decision del Comite |
| `fecha_presentacion` | date | date | Fecha de Presentacion |
| `prioridad` | string | select | Prioridad |
| `recomendacion` | text | textarea | Recomendacion |
| `seguimiento_requerido` | boolean | checkbox | Seguimiento Requerido |
| `sesion` | belongsTo | obo | Sesion del Comite |
| `sesion_id` | bigInt | integer | sesion_id |

---

## 3. Page-by-Page UI Analysis
### 3.1 Casos Oncologicos (UID: `kkcolmf4bc7`)

**Collection:** `onco_casos`

**Table Columns (11 of 12 defined fields shown):**

| # | Column | Displayed |
|---|---|---|
| 1 | `fecha_ingreso` | Yes |
| 2 | `observaciones` | Yes |
| 3 | `paciente_id` | Yes |
| 4 | `paciente_rut` | Yes |
| 5 | `diagnostico_principal` | Yes |
| 6 | `estado` | Yes |
| 7 | `paciente_nombre` | Yes |
| 8 | `estadio_clinico` | Yes |
| 9 | `codigo_cie10` | Yes |
| 10 | `episodios` | Yes |
| 11 | `comite_presentaciones` | Yes |
| 12 | `responsible_doctor` | **NO** |

**Action Buttons:**
- ActionBar (table toolbar)
- Popup action (`customize:popup`) -- opens record detail popup

**Filters/Sort:** None configured

**Create/Edit/Delete Forms:** NONE -- no FormV2 blocks found

**Detail Views / Sub-tables:** None

---

### 3.2 Episodios (UID: `roks71uff2s`)

**Collection:** `onco_episodios`

**Table Columns (19 total: 8 own + 11 expanded from parent `caso` relation):**

*Own columns (8):*

| # | Column |
|---|---|
| 1 | `fecha` |
| 2 | `descripcion` |
| 3 | `caso_id` |
| 4 | `tipo_episodio` |
| 5 | `estado_episodio` |
| 6 | `notas_clinicas` |
| 7 | `resultado` |
| 8 | `caso` |

*Expanded from `onco_casos` via `caso` relation (11):*

| # | Column |
|---|---|
| 1 | `onco_casos.paciente_id` |
| 2 | `onco_casos.paciente_rut` |
| 3 | `onco_casos.fecha_ingreso` |
| 4 | `onco_casos.diagnostico_principal` |
| 5 | `onco_casos.estado` |
| 6 | `onco_casos.observaciones` |
| 7 | `onco_casos.paciente_nombre` |
| 8 | `onco_casos.codigo_cie10` |
| 9 | `onco_casos.estadio_clinico` |
| 10 | `onco_casos.episodios` |
| 11 | `onco_casos.comite_presentaciones` |

**Action Buttons:**
- ActionBar (table toolbar) -- no create/edit/delete buttons

**Filters/Sort:** None configured

**Create/Edit/Delete Forms:** NONE

**Detail Views / Sub-tables:** None

---

### 3.3 Sesiones de Comite (UID: `agcxxqd5if0`)

**Collection:** `onco_comite_sesiones`

**Table Columns (2 of 7 defined -- INCOMPLETE):**

| # | Column | Displayed |
|---|---|---|
| 1 | `fecha` | Yes |
| 2 | `acta` | Yes |
| 3 | `tipo_comite` | **NO** |
| 4 | `numero_sesion` | **NO** |
| 5 | `asistentes` | **NO** |
| 6 | `estado_sesion` | **NO** |
| 7 | `casos_presentados` | **NO** |

**Action Buttons:**
- ActionBar (table toolbar) -- no create/edit/delete buttons

**Filters/Sort:** None configured

**Create/Edit/Delete Forms:** NONE

---

### 3.4 Casos en Comite (UID: `abryj1xvn0c`)

**Collection:** `onco_comite_casos`

**Table Columns (2 of 9 defined -- INCOMPLETE):**

| # | Column | Displayed |
|---|---|---|
| 1 | `decision` | Yes |
| 2 | `fecha_presentacion` | Yes |
| 3 | `caso` | **NO** |
| 4 | `caso_id` | **NO** |
| 5 | `prioridad` | **NO** |
| 6 | `recomendacion` | **NO** |
| 7 | `seguimiento_requerido` | **NO** |
| 8 | `sesion` | **NO** |
| 9 | `sesion_id` | **NO** |

**Action Buttons:**
- ActionBar (table toolbar) -- no create/edit/delete buttons

**Filters/Sort:** None configured

**Create/Edit/Delete Forms:** NONE

---
### 3.5 Dashboard (UID: `9pv7ojsyj69`)

**Collections referenced:** `UGCO_casooncologico`, `UGCO_comiteoncologico`, `UGCO_contactopaciente`, `UGCO_equiposeguimiento`, `UGCO_eventoclinico`, `UGCO_tarea`

> **CRITICAL:** Dashboard references OLD `UGCO_` collections (all have 0 records). The dashboard is completely non-functional.

**Tables (6 read-only list views):**

| # | Collection | Columns | Sort |
|---|---|---|---|
| 1 | `UGCO_casooncologico` | codigo_cie10, cie10_glosa, fecha_diagnostico, estado_adm_id, estado_clinico_id | -createdAt |
| 2 | `UGCO_tarea` | titulo, fecha_vencimiento, responsable_usuario, comentarios | -createdAt |
| 3 | `UGCO_comiteoncologico` | fecha_sesion, lugar, estado, observaciones | -fecha_sesion |
| 4 | `UGCO_eventoclinico` | tipo_evento, subtipo_evento, fecha_solicitud, fecha_realizacion, resultado_resumen | -createdAt |
| 5 | `UGCO_contactopaciente` | tipo_contacto, valor_contacto, es_principal, activo | -createdAt |
| 6 | `UGCO_equiposeguimiento` | nombre, descripcion, activo | nombre |

**Charts (2):**

1. **Bar Chart** -- `UGCO_casooncologico`: count of cases by `verification_status`
2. **Pie Chart** -- `UGCO_eventoclinico`: count of events by `tipo_evento`

**Filter Actions:** 6 `Filter.Action` buttons (one per table)

---

## 4. Gap Analysis Summary

### 4.1 Fields Defined vs. Visible in UI

| Page | Collection | Defined | In Table | In Forms | Missing from Table |
|---|---|---|---|---|---|
| Casos Oncologicos | `onco_casos` | 12 | 11 | 0 | `responsible_doctor` |
| Episodios | `onco_episodios` | 8 | 8 (all) + 11 parent | 0 | (none) |
| Sesiones de Comite | `onco_comite_sesiones` | 7 | 2 | 0 | `tipo_comite`, `numero_sesion`, `asistentes`, `estado_sesion`, `casos_presentados` |
| Casos en Comite | `onco_comite_casos` | 9 | 2 | 0 | `caso`, `caso_id`, `prioridad`, `recomendacion`, `seguimiento_requerido`, `sesion`, `sesion_id` |
| Dashboard | 6x `UGCO_*` | N/A | 25 cols | 0 | ALL data missing (0 records in old collections) |

### 4.2 Critical Issues

| # | Severity | Issue |
|---|---|---|
| 1 | **CRITICAL** | Dashboard uses OLD `UGCO_*` collections (0 records). All 6 tables and 2 charts are empty. Must migrate to `onco_*` collections. |
| 2 | **HIGH** | No create/edit/delete forms on ANY page. All 4 data pages are read-only. Users cannot manage oncology data through the UI. |
| 3 | **HIGH** | Sesiones de Comite shows only 2 of 7 fields. Missing: tipo_comite, numero_sesion, asistentes, estado_sesion, casos_presentados. |
| 4 | **HIGH** | Casos en Comite shows only 2 of 9 fields. Missing: prioridad, recomendacion, seguimiento_requerido, caso/sesion links. |
| 5 | **MEDIUM** | No filters or sorting configured on Casos, Episodios, Sesiones, or Comite Casos pages. |
| 6 | **MEDIUM** | `responsible_doctor` field (belongsTo relation) not displayed in Casos Oncologicos table. |
| 7 | **LOW** | Collection naming inconsistency: UI references `onco_comite_sesiones` but the expected name was `onco_sesiones_comite` (which 404s). |
| 8 | **LOW** | Old `UGCO_*` collections exist but are empty. Consider dropping after confirming no dependencies. |

### 4.3 Prioritized Recommendations

| Priority | Action | Impact |
|---|---|---|
| P0 | Rebuild Dashboard to use `onco_*` collections | Restores dashboard visibility for 4,255 records |
| P0 | Add Create/Edit/Delete actions to all 4 data pages | Enables data management through UI |
| P1 | Complete Sesiones de Comite table (add 5 missing columns) | Shows full session information |
| P1 | Complete Casos en Comite table (add 7 missing columns) | Shows full committee case details |
| P1 | Add Filter.Action to all data pages | Enables users to search/filter records |
| P2 | Add default sorting to all pages | Better default data presentation |
| P2 | Show `responsible_doctor` in Casos table | Shows treating physician |
| P3 | Drop empty `UGCO_*` legacy collections | Database cleanup |

---

*Report generated by automated UI schema analysis via NocoBase API.*
