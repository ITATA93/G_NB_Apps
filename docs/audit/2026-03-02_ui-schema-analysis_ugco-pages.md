---
title: "UI Schema Analysis: UGCO Especialidades & Configuracion Pages"
date: 2026-03-02
type: audit
scope: UGCO UI schemas
tool: Claude Opus 4.6
impacts:
  - Apps/UGCO/
  - docs/audit/INDEX.md
---

# UI Schema Analysis: UGCO Especialidades & Configuracion Pages

**Date:** 2026-03-02
**Source:** NocoBase API -- mira.hospitaldeovalle.cl
**Method:** desktopRoutes:list + uiSchemas:getJsonSchema

---

## Summary of Findings

| Finding | Severity | Pages Affected |
|---------|----------|----------------|
| No specialty filter on Especialidades pages | **HIGH** | Digestivo Alto, Mama, Ginecologia, Hematologia |
| Reportes references non-existent fields on Comite collections | **HIGH** | Reportes |
| Reportes shows raw FK IDs instead of related display names | **MEDIUM** | Reportes (Casos Oncologicos block) |
| Create forms are empty (no form fields configured) | **MEDIUM** | All Especialidades pages |
| Catalogos REF shows only one table (Estado Administrativo) | **LOW** | Catalogos REF |
| N:N pivot table UGCO_casoespecialidad is unused in any UI | **MEDIUM** | (none -- not rendered) |

---

## 1. ESPECIALIDADES PAGES

### 1.1 Digestivo Alto

| Property | Value |
|----------|-------|
| **Route ID** | 350480704012291 |
| **Tab Schema UID** | whi112loap |
| **Collection** | UGCO_casooncologico |
| **Block type** | TableBlockProvider (list, pageSize=20) |
| **Pre-configured filter** | **NONE** |

**Columns (8):**

| # | Field | Description |
|---|-------|-------------|
| 1 | UGCO_COD01 | Codigo UGCO 01 |
| 2 | codigo_cie10 | Codigo CIE-10 |
| 3 | cie10_glosa | Glosa CIE-10 |
| 4 | fecha_diagnostico | Fecha diagnostico |
| 5 | tnm_t | TNM - T |
| 6 | tnm_n | TNM - N |
| 7 | tnm_m | TNM - M |
| 8 | estadio_clinico | Estadio clinico |

**Actions:** filter, create (create form drawer is empty -- no fields configured)

---

### 1.2 Mama

| Property | Value |
|----------|-------|
| **Route ID** | 350480704012295 |
| **Tab Schema UID** | z36ew42hs8 |
| **Collection** | UGCO_casooncologico |
| **Block type** | TableBlockProvider (list, pageSize=20) |
| **Pre-configured filter** | **NONE** |

**Columns (8):** Identical to Digestivo Alto (same 8 columns).

**Actions:** filter, create (create form drawer is empty)

---

### 1.3 Ginecologia

| Property | Value |
|----------|-------|
| **Route ID** | 350480706109441 |
| **Tab Schema UID** | sl13b38jxrj |
| **Collection** | UGCO_casooncologico |
| **Block type** | TableBlockProvider (list, pageSize=20) |
| **Pre-configured filter** | **NONE** |

**Columns (12):** Includes 4 additional columns vs. the other specialties:

| # | Field | Description |
|---|-------|-------------|
| 1 | UGCO_COD01 | Codigo UGCO 01 |
| 2 | codigo_cie10 | Codigo CIE-10 |
| 3 | cie10_glosa | Glosa CIE-10 |
| 4 | fecha_diagnostico | Fecha diagnostico |
| 5 | tnm_t | TNM - T |
| 6 | tnm_n | TNM - N |
| 7 | tnm_m | TNM - M |
| 8 | estadio_clinico | Estadio clinico |
| 9 | figo | Estadio FIGO (gynecology-specific) |
| 10 | UGCO_COD02 | Codigo UGCO 02 |
| 11 | UGCO_COD03 | Codigo UGCO 03 |
| 12 | UGCO_COD04 | Codigo UGCO 04 |

**Actions:** filter, create (create form drawer is empty)

---

### 1.4 Hematologia

| Property | Value |
|----------|-------|
| **Route ID** | 350480708206592 |
| **Tab Schema UID** | 0tkcxfdduik |
| **Collection** | UGCO_casooncologico |
| **Block type** | TableBlockProvider (list, pageSize=20) |
| **Pre-configured filter** | **NONE** |

**Columns (8):** Identical to Digestivo Alto (same 8 columns).

**Actions:** filter, create (create form drawer is empty)

---

### CRITICAL ISSUE: No Specialty Filters

All four Especialidades pages query the **same** collection (UGCO_casooncologico) with **no filter** to scope by specialty. This means:

- Every page shows the **entire** list of oncological cases regardless of specialty.
- The pages are functionally identical (except Ginecologia which has 4 extra columns).
- Users see the same data on every specialty tab.

**Expected behavior:** Each page should filter cases by specialty via the N:N pivot table UGCO_casoespecialidad:

```
UGCO_casooncologico <-(caso_id)-- UGCO_casoespecialidad --(especialidad_id)-> UGCO_REF_oncoespecialidad
```

The UGCO_REF_oncoespecialidad reference table contains 9 specialties: Digestivo alto, Digestivo bajo, Endocrinologia, P. mamaria, P. cervical, Urologia, Torax, Piel y partes blandas, hematologia.

**Recommended fix:** Add a params.filter to each page x-decorator-props that joins through UGCO_casoespecialidad to filter by the corresponding specialty. Alternatively, use the NocoBase data scope feature on each table block.

---

## 2. CONFIGURATION PAGES

### 2.1 Especialidades Catalog

| Property | Value |
|----------|-------|
| **Route ID** | 350480708206599 |
| **Tab Schema UID** | i4b6frlj13b |
| **Collection** | UGCO_REF_oncoespecialidad |
| **Block type** | TableBlockProvider (list) |
| **Block title** | Especialidades |
| **Pre-configured filter** | None |

**Columns (6):**

| # | Field | Description |
|---|-------|-------------|
| 1 | codigo_alma | Codigo ALMA |
| 2 | codigo_oficial | Codigo Oficial |
| 3 | nombre | Nombre |
| 4 | activo | Activo (boolean) |
| 5 | codigo_map_snomed | Codigo SNOMED |
| 6 | codigo_map_deis | Codigo DEIS |

**Actions:** filter, create

**Note:** The current data has 9 specialties, all active. The codigo_alma field is empty for all records.

---

### 2.2 Equipos de Seguimiento

| Property | Value |
|----------|-------|
| **Route ID** | 350480708206601 |
| **Tab Schema UID** | du0m47b9zgj |
| **Collection** | UGCO_equiposeguimiento |
| **Block type** | TableBlockProvider (list) |
| **Block title** | Equipos de Seguimiento |
| **Pre-configured filter** | None |

**Columns (3):**

| # | Field | Description |
|---|-------|-------------|
| 1 | nombre | Nombre |
| 2 | descripcion | Descripcion |
| 3 | activo | Activo (boolean) |

**Actions:** filter, create

**Missing:** The `especialidad` relationship (belongsTo UGCO_REF_oncoespecialidad) exists in the collection but is NOT displayed in the table.

---

### 2.3 Catalogos REF

| Property | Value |
|----------|-------|
| **Route ID** | 350480708206603 |
| **Tab Schema UID** | 3n7inw5k552 |
| **Collection** | UGCO_REF_oncoestadoadm |
| **Block type** | TableBlockProvider (list) |
| **Block title** | Catalogos REF |
| **Pre-configured filter** | None |

**Columns (4):**

| # | Field | Description |
|---|-------|-------------|
| 1 | codigo | Codigo |
| 2 | nombre | Nombre |
| 3 | es_final | Es estado final (boolean) |
| 4 | activo | Activo (boolean) |

**Actions:** filter, create

**Note:** This page only shows the Estado Administrativo catalog (UGCO_REF_oncoestadoadm). There are 28+ REF collections in the UGCO domain that are not accessible from this page. The page title says "Catalogos REF" (plural) but only one catalog is rendered.

---

## 3. OTHER PAGES

### 3.1 Tareas Pendientes

| Property | Value |
|----------|-------|
| **Route ID** | 350480708206594 |
| **Tab Schema UID** | 29cyuleqk6h |
| **Collection** | UGCO_tarea |
| **Block type** | TableBlockProvider (list) |
| **Block title** | Tareas |
| **Pre-configured filter** | None |

**Columns (5):**

| # | Field | Description |
|---|-------|-------------|
| 1 | UGCO_COD01 | Codigo UGCO 01 |
| 2 | titulo | Titulo |
| 3 | fecha_vencimiento | Fecha vencimiento |
| 4 | responsable_usuario | Responsable |
| 5 | comentarios | Comentarios |

**Actions:** filter, create

**Missing columns:** estado_tarea (relationship), caso (relationship), paciente (relationship), descripcion, fecha_cierre. The lack of estado_tarea means users cannot see task status. The lack of caso and paciente means no context about which case/patient the task belongs to.

---

### 3.2 Reportes

| Property | Value |
|----------|-------|
| **Route ID** | 350480708206596 |
| **Tab Schema UID** | n6kbu61z0vc |
| **Layout** | Multi-block page (5 table blocks in 3 grid rows) |
| **Pre-configured filter** | None on any block |

**Block 1: "Reporte: Todos los Casos Oncologicos"**
- Collection: `UGCO_casooncologico`
- Actions: filter, export
- Columns (15): UGCO_COD01, codigo_cie10, cie10_glosa, fecha_diagnostico, estado_adm_id, estado_clinico_id, intencion_tratamiento_id, tnm_t, tnm_n, tnm_m, estadio_clinico, base_diagnostico_id, grado_histologico_id, lateralidad_id, createdAt

> **Issue:** estado_adm_id, estado_clinico_id, grado_histologico_id, lateralidad_id are FK columns (auto-generated by belongsTo). They display raw integer IDs instead of human-readable names. `intencion_tratamiento_id` references a FK that is actually named `intencion_trat_id` -- this column likely shows blank/error. `base_diagnostico_id` has no matching belongsTo relationship at all.

**Block 2: "Reporte: Eventos Clinicos"**
- Collection: `UGCO_eventoclinico`
- Actions: filter, export
- Columns (7): tipo_evento, subtipo_evento, fecha_solicitud, fecha_realizacion, resultado_resumen, origen_dato, createdAt
- Status: **OK** -- all fields exist in the collection.

**Block 3: "Reporte: Tareas"**
- Collection: `UGCO_tarea`
- Actions: filter, export
- Columns (6): titulo, descripcion, fecha_vencimiento, responsable_usuario, comentarios, createdAt
- Status: **OK** -- all fields exist in the collection.

**Block 4: "Reporte: Sesiones de Comite"**
- Collection: `UGCO_comiteoncologico`
- Actions: filter, export
- Columns (5): fecha_sesion, lugar, estado, observaciones, createdAt

> **CRITICAL:** The actual collection has fields: `fecha_comite`, `tipo_comite`, `resolucion`. The schema references fecha_sesion, lugar, estado, observaciones -- **none of these fields exist**. This entire table block is broken.

**Block 5: "Reporte: Casos en Comite"**
- Collection: `UGCO_comitecaso`
- Actions: filter, export
- Columns (6): orden_presentacion, motivo_presentacion, decision_comite, plan_tratamiento, observaciones, createdAt

> **CRITICAL:** The actual collection has: decision_resumen, es_caso_principal, plan_tratamiento, responsable_seguimiento, + relationships (paciente, caso, comite). Schema references orden_presentacion, motivo_presentacion, decision_comite, observaciones -- **3 of 5 non-system fields do not exist**. Only `plan_tratamiento` and `createdAt` are valid.

---

## 4. COLLECTION INVENTORY (UGCO/Onco domain)

### Core Collections

| Collection | Title | Purpose |
|------------|-------|---------|
| UGCO_casooncologico | UGCO: Caso Oncologico | Main case record |
| UGCO_casoespecialidad | UGCO: Caso-Especialidad (N:N) | Pivot: case to specialty |
| UGCO_eventoclinico | UGCO: Evento Clinico | Clinical events per case |
| UGCO_tarea | UGCO: Tarea | Tasks/follow-ups |
| UGCO_documentocaso | UGCO: Documento del Caso | Case documents |
| UGCO_contactopaciente | UGCO: Contacto Paciente | Patient contact records |
| UGCO_personasignificativa | UGCO: Persona Significativa / Cuidador | Caregiver info |
| UGCO_equiposeguimiento | UGCO: Equipo de Seguimiento | Follow-up teams |
| UGCO_equipomiembro | UGCO: Miembro de Equipo | Team members |
| UGCO_comitecaso | UGCO: Caso en Comite | Case in committee |
| ugco_comiteoncologico | Comite Oncologico | Committee sessions |

### ALMA Integration Collections

| Collection | Title |
|------------|-------|
| UGCO_ALMA_paciente | UGCO ALMA: Paciente |
| UGCO_ALMA_episodio | UGCO ALMA: Episodio |
| UGCO_ALMA_diagnostico | UGCO ALMA: Diagnostico |
| ALMA_H_Oncologia | ALMA H_Oncologia |
| ALMA_H_OncologiaMensual | ALMA H_OncologiaMensual |

### Reference (REF) Collections (27+)

| Collection | Title |
|------------|-------|
| UGCO_REF_oncoespecialidad | Especialidades Oncologicas |
| UGCO_REF_oncodiagnostico | Diagnosticos Oncologicos |
| UGCO_REF_cie10 | Clasificacion CIE-10 |
| UGCO_REF_oncotopografiaicdo | Topografia ICD-O |
| UGCO_REF_oncomorfologiaicdo | Morfologia ICD-O |
| UGCO_REF_oncoestadoadm | Estado Administrativo |
| UGCO_REF_oncoestadoclinico | Estado Clinico |
| UGCO_REF_oncoestadocaso | Estado de Caso |
| UGCO_REF_oncoestadoactividad | Estado de Actividad |
| UGCO_REF_oncotnm_t | TNM - Tumor (T) |
| UGCO_REF_oncotnm_n | TNM - Nodulos (N) |
| UGCO_REF_oncotnm_m | TNM - Metastasis (M) |
| UGCO_REF_oncoestadio_clinico | Estadios Clinicos |
| UGCO_REF_oncofigo | Estadios FIGO |
| UGCO_REF_oncoecog | Escala ECOG |
| UGCO_REF_oncogradohistologico | Grado Histologico |
| UGCO_REF_oncobasediagnostico | Base del Diagnostico |
| UGCO_REF_oncointenciontrat | Intencion de Tratamiento |
| UGCO_REF_oncotipoetapificacion | Tipo de Etapificacion |
| UGCO_REF_oncotipodocumento | Tipo de Documento |
| UGCO_REF_oncotipoactividad | Tipo de Actividad |
| UGCO_REF_extension | Extension Tumoral |
| UGCO_REF_lateralidad | Lateralidad |
| UGCO_REF_prevision | Prevision de Salud |
| UGCO_REF_sexo | Sexo |
| UGCO_REF_comuna | Comunas |
| UGCO_REF_establecimiento_deis | Establecimientos DEIS |

### Legacy Collections

| Collection | Title |
|------------|-------|
| ref_oncodiagnostico | Diagnosticos Oncologicos (legacy) |
| ref_oncoespecialidad | Especialidades Oncologicas (legacy) |
| ref_oncotopografia | Topografia CIE-O-3 (legacy) |
| onco_casos | Casos Oncologicos (legacy) |
| onco_episodios | Episodios Oncologicos (legacy) |
| onco_comite_casos | Casos en Comite (legacy) |
| onco_comite_sesiones | Sesiones de Comite (legacy) |

---

## 5. UGCO_casooncologico -- Full Field Reference

### Direct Fields (string/date/boolean)

| Field | Title | Type |
|-------|-------|------|
| UGCO_COD01 | Codigo UGCO 01 | string |
| UGCO_COD02 | Codigo UGCO 02 | string |
| UGCO_COD03 | Codigo UGCO 03 | string |
| UGCO_COD04 | Codigo UGCO 04 | string |
| codigo_cie10 | Codigo CIE-10 | string |
| cie10_glosa | Glosa CIE-10 | string |
| fecha_diagnostico | Fecha diagnostico | date |
| fecha_caso | Fecha caso | date |
| fecha_creacion | Fecha creacion | date |
| fecha_modificacion | Fecha modificacion | date |
| fecha_inicio_seguimiento | Fecha inicio seguimiento | date |
| fecha_ultimo_contacto | Ultimo contacto | date |
| fecha_examen_confirmatorio | Fecha examen confirmatorio | date |
| fecha_defuncion | Fecha defuncion | date |
| tnm_t | TNM - T | string |
| tnm_n | TNM - N | string |
| tnm_m | TNM - M | string |
| estadio_clinico | Estadio clinico | string |
| figo | FIGO | string |
| ecog_inicial | ECOG inicial | string |
| lateralidad | Lateralidad | string |
| extension_tumoral | Extension Tumoral | string |
| base_diagnostico | Base del diagnostico | string |
| morfologia_icdo | Morfologia ICD-O | string |
| morfologia_descripcion | Descripcion Morfologia | string |
| topografia_icdo | Topografia ICD-O | string |
| topografia_descripcion | Descripcion Topografia | string |
| grado_diferenciacion | Grado diferenciacion | string |
| comportamiento | Comportamiento | string |
| tipo_etapificacion | Tipo etapificacion | string |
| garantia | Garantia (GES/CAEC) | string |
| causa_defuncion | Causa defuncion | string |
| codigo_establecimiento_deis | Codigo Establecimiento DEIS | string |
| rut_patologo | RUT Patologo | string |
| id_carga_masiva | ID Carga Masiva SIGO | string |
| creado_por | Creado por | string |
| modificado_por | Modificado por | string |
| comentario_general | Comentario general | text |
| fallecido | Fallecido | boolean |
| fuente_dato | Fuente del Dato | select |
| verification_status | Verification Status | select |
| clinical_status | Clinical Status | select |

### Relationship Fields (belongsTo)

| Relationship | Foreign Key | Target Collection |
|-------------|-------------|-------------------|
| paciente | paciente_id | UGCO_ALMA_paciente |
| episodio_alma | episodio_alma_id | UGCO_ALMA_episodio |
| diag_alma | diag_alma_id | UGCO_ALMA_diagnostico |
| cie10_ref | cie10_id | UGCO_REF_cie10 |
| estado_adm | estado_adm_id | UGCO_REF_oncoestadoadm |
| estado_clinico | estado_clinico_id | UGCO_REF_oncoestadoclinico |
| intencion_trat | intencion_trat_id | UGCO_REF_oncointenciontrat |
| tnm_t_ref | tnm_t_id | UGCO_REF_oncotnm_t |
| tnm_n_ref | tnm_n_id | UGCO_REF_oncotnm_n |
| tnm_m_ref | tnm_m_id | UGCO_REF_oncotnm_m |
| grado_histologico_ref | grado_histologico_id | UGCO_REF_oncogradohistologico |
| lateralidad_ref | lateralidad_id | UGCO_REF_lateralidad |
| extension_ref | extension_id | UGCO_REF_extension |
| morfologia_ref | morfologia_id | UGCO_REF_oncomorfologiaicdo |
| topografia_ref | topografia_id | UGCO_REF_oncotopografiaicdo |

---

## 6. RECOMMENDED ACTIONS

### P0 -- Critical (Broken functionality)

1. **Add specialty filters to Especialidades pages.**
   Each of the 4 specialty pages must filter UGCO_casooncologico through UGCO_casoespecialidad by the corresponding especialidad_id. Without this, the specialty pages are non-functional as specialty views.

2. **Fix Reportes "Sesiones de Comite" block.**
   Replace schema field references: fecha_sesion -> fecha_comite. Remove lugar, estado, observaciones (fields do not exist) or add those fields to the UGCO_comiteoncologico collection.

3. **Fix Reportes "Casos en Comite" block.**
   Replace schema field references: decision_comite -> decision_resumen. Remove orden_presentacion, motivo_presentacion, observaciones (fields do not exist). Add useful fields: caso, comite, responsable_seguimiento.

### P1 -- High (Data quality / usability)

4. **Fix Reportes "Casos Oncologicos" FK columns.**
   Replace raw FK references with relationship fields:
   - estado_adm_id -> estado_adm
   - estado_clinico_id -> estado_clinico
   - grado_histologico_id -> grado_histologico_ref
   - lateralidad_id -> lateralidad_ref
   - intencion_tratamiento_id -> intencion_trat (name mismatch)
   - base_diagnostico_id -> remove (no matching belongsTo)

5. **Configure create forms on Especialidades pages.**
   The create action drawer on all 4 specialty pages has an empty Grid with no form fields. Users cannot create new cases from these pages.

6. **Add estado_tarea and caso columns to Tareas Pendientes.**
   The task list is missing task status and case context.

### P2 -- Medium (Completeness)

7. **Add especialidad column to Equipos de Seguimiento table.**
   The team specialty relationship exists but is not shown.

8. **Expand Catalogos REF page** to include tables for more REF collections (currently only shows UGCO_REF_oncoestadoadm).

9. **Add missing specialty pages** for: Digestivo bajo, Endocrinologia, P. cervical, Urologia, Torax, Piel y partes blandas (only 4 of 9 specialties have dedicated pages).

---

## 7. COLLECTION NAME INCONSISTENCY

Note the naming inconsistency in Comite collections:
- `UGCO_comiteoncologico` (mixed case) -- referenced in Reportes schema
- `ugco_comiteoncologico` (all lowercase) -- listed in collections API

These may be the same collection (PostgreSQL is case-insensitive for unquoted identifiers) or different collections. This should be verified at the database level.

---

*Generated by Claude Opus 4.6 -- 2026-03-02*
