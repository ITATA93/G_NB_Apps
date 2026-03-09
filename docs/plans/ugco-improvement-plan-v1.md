---
title: "UGCO — Plan de Mejora Integral v1"
date: 2026-03-04
status: active
author: Claude Sonnet 4.6
depends_on:
  - Apps/UGCO/docs/architecture_v2_plan/
  - docs/audit/ugco-critical-analysis-2026-03-02.md
impacts:
  - Apps/UGCO/
  - docs/library/scripts.md
  - DEVLOG.md
---

# UGCO — Plan de Mejora Integral v1

> **Contexto**: Plan derivado del análisis completo del `architecture_v2_plan` (7 fases),
> el audit 2026-03-02 y las sesiones de mejora 2026-03-03/04.
> Producción: `mira.hospitaldeovalle.cl` — NocoBase v1.9.14

---

## Estado Actual (2026-03-04)

| Aspecto | Estado | Porcentaje |
| --- | --- | --- |
| Modelo de datos core | Funcional | 70% |
| UI — Carga de datos | Parcial | 60% |
| UI — CRUD | Ausente | 0% |
| UI — Filtros/Búsqueda | Ausente | 0% |
| Dashboard | Parcial (charts OK, tablas OK) | 65% |
| Workflows | Creados pero desactivados | 0% |
| Permisos RBAC/RLS | Ausente | 0% |
| ETL ALMA | No existe | 0% |
| GES Tracking | No existe | 0% |
| Inmutabilidad eventos | No aplicada | 0% |

---

## Roadmap

```
Semana 1-2: P0 — Funcionalidad básica (sistema usable)
Semana 3-4: P1 — Completitud clínica (piloto con usuarios)
Semana 5-8: P2 — Calidad y seguridad (producción real)
Semana 9+:  P3 — Optimización e integraciones
```

---

## P0 — Bloqueantes (Semana 1-2)

> Sin esto el sistema no es usable clínicamente.

---

### P0-01: CRUD en páginas core

**Problema**: Las 4 páginas principales son 100% solo lectura.
Nadie puede crear, editar ni eliminar registros desde la UI.

**Impacto**: Bloqueante absoluto. Sin esto el sistema es un visor de datos de prueba.

**Páginas afectadas**:
- Casos Oncológicos (`onco_casos`)
- Episodios (`onco_episodios`)
- Sesiones de Comité (`onco_comite_sesiones`)
- Casos en Comité (`onco_comite_casos`)

**Acciones**:

1. Agregar botón **"Nuevo"** (formulario de creación) en cada página
2. Agregar botón **"Editar"** en fila de acciones de cada tabla
3. Agregar botón **"Eliminar"** con confirmación en acciones
4. Configurar formulario de creación con campos correctos por colección

**Script a crear**: `Apps/UGCO/scripts/nocobase/add-crud-to-pages.ts`

```typescript
// Estructura de cada acción a insertar:
// POST uiSchemas:insertAdjacent/<tableBlockUid>?position=beforeEnd
// body: { schema: actionBarSchema }

// Bloque para crear (en toolbar del TableBlockProvider):
{
  "x-component": "Action",
  "x-component-props": { "type": "primary", "icon": "PlusOutlined" },
  "x-acl-action": "onco_casos:create",
  "x-action": "create",
  title: "Nuevo Caso"
  // properties: formulario con campos
}

// Bloque editar (en columna acciones de cada fila):
{
  "x-component": "Action.Link",
  "x-action": "update",
  "x-acl-action": "onco_casos:update"
}

// Bloque eliminar (en columna acciones de cada fila):
{
  "x-component": "Action.Link",
  "x-action": "destroy",
  "x-acl-action": "onco_casos:destroy",
  "x-component-props": { "danger": true, "confirm": { "title": "¿Eliminar este caso?" } }
}
```

**UIDs de tablas conocidos**:

| Página | blockUid tabla | actionsColUid |
| --- | --- | --- |
| Casos Oncológicos | (obtener via getJsonSchema) | (obtener) |
| Episodios | `6az86nznuks` | (obtener) |
| Casos en Comité | `uzuw452137g` | (obtener) |
| Sesiones de Comité | `7v770k387m4` | (obtener) |

**Formularios mínimos por colección**:

`onco_casos`:
- `paciente_nombre` (text, requerido)
- `rut_paciente` (text)
- `especialidad` (select)
- `fecha_ingreso` (date)
- `diagnostico_principal` (text)
- `estadio_clinico` (select: I, II, III, IV)
- `estado` (select: activo, seguimiento, egresado, fallecido)

`onco_episodios`:
- `caso_id` (relation → onco_casos, requerido)
- `tipo_episodio` (select)
- `fecha` (date, requerido)
- `descripcion` (textarea)
- `estado_episodio` (select)

`onco_comite_sesiones`:
- `numero_sesion` (number)
- `tipo_comite` (select)
- `fecha` (date, requerido)
- `estado_sesion` (select)
- `asistentes` (textarea)

`onco_comite_casos`:
- `sesion_id` (relation → onco_comite_sesiones)
- `caso_id` (relation → onco_casos, requerido)
- `fecha_presentacion` (date)
- `prioridad` (select)
- `decision` (textarea)
- `recomendacion` (textarea)
- `seguimiento_requerido` (checkbox)

---

### P0-02: Filtros de búsqueda en páginas core

**Problema**: Con 1,035 casos y 2,529 episodios sin filtros, el sistema es inutilizable
para encontrar un paciente específico.

**Acciones**:

1. Agregar bloque **FilterForm** encima de cada tabla en las 4 páginas core
2. Agregar bloque **FilterForm** en las 9 páginas de especialidades

**Script a crear**: `Apps/UGCO/scripts/nocobase/add-filters-to-pages.ts`

**Filtros por página**:

`onco_casos`:
- `paciente_nombre` (contains)
- `rut_paciente` (contains)
- `especialidad` (select)
- `estado` (select)
- `fecha_ingreso` (date range)
- `estadio_clinico` (select)

`onco_episodios`:
- `caso.paciente_nombre` (contains, vía relación)
- `tipo_episodio` (select)
- `estado_episodio` (select)
- `fecha` (date range)

`onco_comite_sesiones`:
- `tipo_comite` (select)
- `fecha` (date range)
- `estado_sesion` (select)

`onco_comite_casos`:
- `prioridad` (select)
- `seguimiento_requerido` (boolean)
- `fecha_presentacion` (date range)

**Patrón de implementación** (basado en `fix-dashboard-tables.ts`):
```typescript
// Insertar FilterForm block antes de la tabla
await api("POST", `uiSchemas:insertAdjacent/${pageGridUid}?position=beforeEnd`, {
  schema: buildFilterFormSchema({
    collection: "onco_casos",
    fields: ["paciente_nombre", "rut_paciente", "especialidad", "estado", "fecha_ingreso"]
  })
});
```

---

### P0-03: Activar y validar los 6 workflows

**Problema**: Los workflows fueron creados con `enabled: false`.
Sin ellos no hay automatización: sin tareas auto-creadas, sin cierre de casos, sin alertas.

**Acciones**:

1. Listar todos los workflows UGCO en producción (GET `workflows:list`)
2. Para cada workflow: ejecutar prueba en sandbox con datos reales
3. Activar uno a uno validando que no hay efectos secundarios no deseados
4. Documentar resultados

**Script a crear**: `Apps/UGCO/scripts/nocobase/enable-ugco-workflows.ts`

```typescript
// Activar un workflow:
await api("PATCH", `workflows:update?filterByTk=${workflowId}`, {
  enabled: true
});

// Verificar trigger y nodos:
const wf = await api("GET", `workflows:get?filterByTk=${workflowId}`);
console.log("Nodes:", wf.nodes?.length, "| Trigger:", wf.type);
```

**Orden de activación** (menos riesgo primero):

| WF | Trigger | Acción | Riesgo |
| --- | --- | --- | --- |
| WF-4 | Update evento (RE_ESTADIFICACION) | Actualiza snapshot TNM | Bajo |
| WF-3 | Create evento (Resolución) | Cierra caso | Medio |
| WF-6 | Update tarea → Completada | Crea evento de log | Bajo |
| WF-2 | Update comite_presentacion | Crea tarea urgente | Medio |
| WF-1 | Create evento (`gatilla_tarea=true`) | Auto-crea tarea | Medio |
| WF-5 | Cron diario 02:00 | Alertas inactividad 30d | Alto |

---

### P0-04: Crear colección `ugco_garantias_ges`

**Problema**: MINSAL exige tracking de plazos GES. La colección no existe.
Sin esto no hay semáforo de alertas por vencimiento de garantías.

**Campos requeridos** (según `CONDICIONES-PARA-ACCEDER-A-GES_versión-nov-2025.pdf`):

```typescript
const GES_COLLECTION = {
  name: "ugco_garantias_ges",
  fields: [
    { name: "caso_id",            type: "bigInt",  interface: "m2o" },      // → onco_casos
    { name: "tipo_garantia",      type: "string",  interface: "select",
      options: ["DIAGNOSTICO", "TRATAMIENTO", "SEGUIMIENTO", "PALIATIVOS"] },
    { name: "fecha_inicio",       type: "date",    interface: "date" },
    { name: "fecha_limite",       type: "date",    interface: "date" },
    { name: "dias_restantes",     type: "formula", formula: "DATEDIFF(fecha_limite, NOW())" },
    { name: "estado_garantia",    type: "string",  interface: "select",
      options: ["EN_PLAZO", "PROXIMA_VENCER", "VENCIDA", "CUMPLIDA"] },
    { name: "numero_problema_ges",type: "string",  interface: "input" },
    { name: "observaciones",      type: "text",    interface: "textarea" },
  ]
};
```

**Vista semáforo** (lógica de colores):
```
dias_restantes > 15 → Verde
dias_restantes 5-14  → Amarillo
dias_restantes 1-4   → Naranja
dias_restantes ≤ 0   → Rojo (vencida)
```

**Script a crear**: `Apps/UGCO/scripts/nocobase/create-ges-collection.ts`

---

### P0-05: Filtros por especialidad en páginas de especialidad

**Problema**: Las 9 páginas de especialidades muestran TODOS los casos, no solo los de esa especialidad.

**Corrección** (patch `x-decorator-props.params.filter` en cada tabla):

```typescript
const SPECIALTY_FILTER_PATCHES = [
  { tabUid: "whi112loap", especialidad: "Digestivo Alto" },
  { tabUid: "vs3hrzebl28", especialidad: "Digestivo Bajo" },
  { tabUid: "z36ew42hs8", especialidad: "Mama" },
  // ... 6 más
];

for (const { tabUid, especialidad } of SPECIALTY_FILTER_PATCHES) {
  const schema = await api("GET", `uiSchemas:getJsonSchema/${tabUid}`);
  const tableUid = findTableBlockUid(schema);
  await api("POST", "uiSchemas:patch", {
    "x-uid": tableUid,
    "x-decorator-props": {
      params: {
        filter: { "$and": [{ "especialidad": { "$eq": especialidad } }] },
        sort: ["-fecha_ingreso"],
        pageSize: 20
      }
    }
  });
}
```

**Script a crear**: `Apps/UGCO/scripts/nocobase/fix-specialty-filters.ts`

> **Nota**: Esto es diferente a RLS — es un filtro fijo por página, no por usuario.
> El RLS real (filtro por rol del usuario logueado) va en P2-07.

---

## P1 — Alta Prioridad (Semana 3-4)

> Necesario antes del piloto con usuarios clínicos reales.

---

### P1-01: Completar Casos en Comité (7 columnas faltantes)

**Problema**: La tabla solo muestra 2 columnas (Decisión, Fecha Presentación).
Faltan: caso/paciente, sesión, prioridad, recomendación, votación, responsable.

**Columns a agregar** (en tabla `uzuw452137g`):

```typescript
const COMITE_CASOS_COLUMNS = [
  { field: "caso.paciente_nombre", title: "Paciente",     position: "first" },
  { field: "caso.especialidad",    title: "Especialidad", position: "after:paciente" },
  { field: "sesion.numero_sesion", title: "N° Sesión",    position: "after:especialidad" },
  { field: "prioridad",            title: "Prioridad",    position: "after:sesion" },
  { field: "recomendacion",        title: "Recomendación" },
  { field: "seguimiento_requerido",title: "Seguimiento" },
];
```

**Script**: Extender `fix-dashboard-tables.ts` o crear `fix-comite-casos-columns.ts`

---

### P1-02: Formato de fechas (ISO → DD/MM/YYYY)

**Problema**: Todas las fechas muestran `2025-12-29T00:00:00.000Z` en vez de `29/12/2025`.

**Solución**: Patch de `x-component-props.format` en cada campo fecha:

```typescript
// Para cada field de tipo date en las tablas:
await api("POST", "uiSchemas:patch", {
  "x-uid": dateFieldUid,
  "x-component-props": {
    format: "DD/MM/YYYY"
  }
});
```

**Script a crear**: `Apps/UGCO/scripts/nocobase/fix-date-formats.ts`

**Campos afectados**:
- `onco_casos.fecha_ingreso` (todas las páginas donde aparece)
- `onco_episodios.fecha`
- `onco_comite_sesiones.fecha`
- `onco_comite_casos.fecha_presentacion`
- Cualquier campo `createdAt`/`updatedAt` visible

---

### P1-03: Inmutabilidad de eventos clínicos

**Problema**: `onco_episodios` puede editarse y eliminarse libremente.
El plan especifica que los eventos son inmutables (responsabilidad médico-legal).

**Solución en NocoBase**:
```typescript
// Opción A: Remover botón editar/eliminar de la UI de episodios
// Opción B: Configurar ACL — rol general no tiene :update ni :destroy en onco_episodios
// Solo admin_ugco puede corregir (vía evento de corrección)

await api("POST", "roles:update?filterByTk=member", {
  "strategy": { "actions": ["view", "create"] }  // sin update/destroy
});
// Luego grant específico por colección
```

**Script a crear**: `Apps/UGCO/scripts/nocobase/configure-ugco-permissions.ts` (extender el existente)

---

### P1-04: Cargar catálogo CIE-O-3

**Problema**: No existe `ugco_cat_cie_o`. Sin él los códigos de diagnóstico no están estandarizados
y los reportes MINSAL (RHC) son inválidos.

**Fuente**: MINSAL publica el catálogo CIE-O-3 (Topografía + Morfología)

**Acciones**:
1. Descargar archivo oficial CIE-O-3 desde MINSAL
2. Crear colección `ugco_cat_cie_o`:
   - `codigo_topografia` (text)
   - `descripcion_topografia` (text)
   - `codigo_morfologia` (text)
   - `descripcion_morfologia` (text)
   - `comportamiento` (select: benigno, maligno, in_situ, incierto)
3. Seed desde CSV oficial

**Script a crear**: `Apps/UGCO/scripts/nocobase/seed-cie-o-catalog.ts`

---

### P1-05: UI para ugco_garantias_ges

**Después de P0-04**: Agregar página "Garantías GES" en el menú UGCO con:
- Tabla con semáforo visual (tags de color según `estado_garantia`)
- Filtros: `tipo_garantia`, `estado_garantia`, `caso.especialidad`
- Ordenar por `dias_restantes ASC` por defecto
- KPI block: count de garantías vencidas (rojo)

**Script a crear**: `Apps/UGCO/scripts/nocobase/create-ges-page.ts`

---

### P1-06: Corregir encoding en enums

**Problema**: "Cirugía" muestra como "Cirug◆a", "Quimioterapia" truncado, etc.
Afecta credibilidad con usuarios clínicos.

**Diagnóstico**: Los valores de enum se guardaron con encoding incorrecto durante el seed.

**Solución**:
```typescript
// Patch del uiSchema del campo tipo_episodio:
await api("POST", "uiSchemas:patch", {
  "x-uid": tipoEpisodioFieldUid,
  "x-component-props": {
    options: [
      { value: "biopsia",         label: "Biopsia",         color: "orange" },
      { value: "cirugia",         label: "Cirugía",         color: "red" },
      { value: "quimioterapia",   label: "Quimioterapia",   color: "purple" },
      { value: "radioterapia",    label: "Radioterapia",    color: "volcano" },
      { value: "consulta",        label: "Consulta",        color: "blue" },
      { value: "imagenologia",    label: "Imagenología",    color: "cyan" },
      { value: "laboratorio",     label: "Laboratorio",     color: "geekblue" },
      { value: "control",         label: "Control",         color: "green" },
    ]
  }
});
```

**Script a crear**: `Apps/UGCO/scripts/nocobase/fix-enum-encoding.ts`

---

## P2 — Calidad y Seguridad (Semana 5-8)

> Necesario para producción con datos reales de pacientes.

---

### P2-01: RBAC — Roles y permisos base

**Roles a configurar** (según Fase 7 del plan):

| Rol | Colecciones | Acciones |
| --- | --- | --- |
| `admin_ugco` | Todas | CRUD + config |
| `medico_oncologo` | onco_casos, onco_episodios, onco_comite_* | view + create + update limitado |
| `enfermera_navegadora` | onco_casos (view), onco_episodios (create), ugco_garantias_ges, ugco_tareas | CRUD en tareas, create en episodios |
| `registrador_rhc` | Todas | Solo view + export |
| `solo_lectura` | Todas | Solo view |

**Script**: Extender `Apps/UGCO/scripts/nocobase/configure-ugco-permissions.ts`

---

### P2-02: RLS — Filtros por rol en especialidades

**Objetivo**: El médico de Tórax solo ve sus casos cuando navega a la página de Tórax.

**Implementación en NocoBase**:
```typescript
// Configurar scope en ACL por role + collection:
// Alternativa: usar x-acl-params en el decorator de cada tabla
// con {{currentUser.departments}} o similar
```

> **Nota técnica**: NocoBase 1.9.14 tiene soporte limitado de RLS dinámico.
> La solución pragmática es usar filtros fijos por página (P0-05) + autenticación de rol.
> El RLS real (por token de usuario) requiere investigación adicional de la API ACL.

**Script a crear**: `Apps/UGCO/scripts/nocobase/configure-rls.ts`

---

### P2-03: FLS — Seguridad por campo

**Campos restringidos**:

| Campo | Restricción |
| --- | --- |
| `estadio_clinico`, `tnm_*` | Solo `medico_oncologo` + `admin_ugco` pueden editar |
| `estado` (viaje clínico) | Solo workflows o `admin_ugco` |
| `rut_paciente`, `paciente_nombre` | Solo `admin_ugco` puede editar (inmutable) |

**Implementación**: Configurar `x-acl-action` y `x-read-pretty` condicionalmente por campo.

---

### P2-04: Kanban de tareas con semáforo

**Colección**: `ugco_tareas` (o `onco_comite_casos` como proxy)

**Columnas Kanban** (por `estado_tarea`):
```
PENDIENTE → EN_TRÁMITE → COMPLETADA
```

**Semáforo** (por `dias_restantes`):
- Badge rojo: ≤ 0 días (vencida)
- Badge naranja: 1-4 días
- Badge amarillo: 5-14 días
- Badge verde: > 15 días

**Script a crear**: `Apps/UGCO/scripts/nocobase/create-kanban-tasks.ts`

---

### P2-05: Drawer / Ficha 360° del paciente

**Objetivo**: Click en un paciente abre un drawer lateral con 5 pestañas:

```
[ Datos Generales ] [ Episodios ] [ Comité ] [ GES ] [ Tareas ]
```

Cada pestaña muestra la información relacionada filtrada por el `caso_id` del paciente seleccionado.

**Implementación**: `Action.Drawer` con `RecordProvider` y tabs de sub-tablas.

**Script a crear**: `Apps/UGCO/scripts/nocobase/create-patient-drawer.ts`

---

### P2-06: Exportación RHC MINSAL

**Objetivo**: Generar el archivo CSV/Excel con variables RHC según el estándar MINSAL
(`DIRECTRICES_Y_LINEAMIENTOS_PARA_LOS_REGISTROS_HOSPITALARIOS_DE_CANCER_RHC.pdf`)

**Variables requeridas por el RHC**:
- RUT, nombre, fecha nacimiento, sexo, domicilio
- Fecha diagnóstico, CIE-O topografía, CIE-O morfología, comportamiento
- Fecha primera consulta oncológica, fecha tratamiento
- TNM clínico, TNM patológico, estadio
- Tratamiento recibido (cirugía, QT, RT, hormonoterapia)
- Fecha egreso, causa egreso, estado vital

**Script a crear**: `Apps/UGCO/scripts/nocobase/export-rhc-minsal.ts`

---

### P2-07: Limpieza colecciones legacy UGCO_*

**Colecciones a eliminar** (vacías, reemplazadas por `onco_*`):

```typescript
const LEGACY_COLLECTIONS = [
  "UGCO_casooncologico",       // → onco_casos (1,035 registros reales)
  "UGCO_eventoclinico",        // → onco_episodios (2,529 registros reales)
  "UGCO_comiteoncologico",     // → onco_comite_sesiones (86 registros)
  "UGCO_comitecaso",           // → onco_comite_casos (605 registros)
  "UGCO_tarea",                // → (por crear ugco_tareas)
  "UGCO_contactopaciente",     // → datos en onco_casos
  "UGCO_equiposeguimiento",    // → sin reemplazo (feature no implementada)
  "UGCO_casoespecialidad",     // → pivot table, sin uso real
];
```

> **Precaución**: Verificar que ninguna página activa use estas colecciones antes de eliminar.
> Script debe hacer check primero.

**Script a crear**: `Apps/UGCO/scripts/nocobase/cleanup-legacy-collections.ts`

---

## P3 — Integraciones (Semana 9+)

---

### P3-01: ETL ALMA (InterSystems IRIS)

**Problema**: El script `etl-alma-ugco.ts` referenciado en Fase 3B no existe.

**Alcance**:
- Conexión ODBC a InterSystems IRIS (TrakCare/ALMA)
- Extracción de: datos demográficos, episodios ambulatorios, diagnósticos CIE-10, laboratorios
- De-duplicación por `id_episodio_rce + tipo_evento_id`
- Inserción en `onco_episodios` con `origen_dato: "ETL_ALMA"`
- Cron: diario a las 02:00 AM
- Log de errores + alertas por Slack/email

**Script a crear**: `shared/scripts/etl-alma-ugco.ts`

> **Prerequisito**: Acceso ODBC a servidor ALMA. Requiere gestión con TI del hospital.

---

### P3-02: Alertas automáticas (WF-5 inactividad)

**Workflow**: Cron diario que detecta casos sin episodios en > 30 días y crea tarea de alerta.

**Implementación**: Activar WF-5 después de validar WF-1 a WF-4 (P0-03).

---

### P3-03: Dashboard gerencial avanzado

**KPIs adicionales** (más allá de los 2 gráficos actuales):
- Tiempo promedio diagnóstico → tratamiento (por especialidad)
- Compliance GES por tipo de garantía
- Casos nuevos por mes (serie temporal)
- Distribución por estadio clínico

**Implementación**: Agregar chart blocks adicionales con `ChartRendererProvider`
(usar patrón documentado en `docs/standards/nocobase-chart-blocks.md`)

---

## Scripts a Desarrollar (Registro)

| Script | Prioridad | Fase | Descripción |
| --- | --- | --- | --- |
| `add-crud-to-pages.ts` | P0 | 5 | CRUD blocks en 4 páginas core |
| `add-filters-to-pages.ts` | P0 | 5 | FilterForm en páginas core y especialidades |
| `enable-ugco-workflows.ts` | P0 | 6 | Activar 6 workflows + verificación |
| `create-ges-collection.ts` | P0 | 2 | Colección ugco_garantias_ges + campos |
| `fix-specialty-filters.ts` | P0 | 5 | Filtro fijo por especialidad en 9 páginas |
| `fix-comite-casos-columns.ts` | P1 | 5 | 7 columnas faltantes en Casos en Comité |
| `fix-date-formats.ts` | P1 | 5 | Formato DD/MM/YYYY en todos los campos fecha |
| `configure-ugco-permissions.ts` | P1/P2 | 7 | Inmutabilidad + RBAC base (extender existente) |
| `seed-cie-o-catalog.ts` | P1 | 1 | Cargar CIE-O-3 desde CSV MINSAL |
| `create-ges-page.ts` | P1 | 5 | Página UI para garantías GES |
| `fix-enum-encoding.ts` | P1 | 5 | Corregir encoding en enums (Cirugía, etc.) |
| `configure-rls.ts` | P2 | 7 | Row-Level Security por especialidad |
| `create-kanban-tasks.ts` | P2 | 4/5 | Vista Kanban tareas + semáforo |
| `create-patient-drawer.ts` | P2 | 5 | Drawer Ficha 360° del paciente |
| `export-rhc-minsal.ts` | P2 | 5 | Exportación RHC para MINSAL |
| `cleanup-legacy-collections.ts` | P2 | — | Eliminar colecciones UGCO_* vacías |
| `etl-alma-ugco.ts` | P3 | 3B | ETL diario desde InterSystems IRIS |

---

## Dependencias entre Tareas

```
P0-04 (create-ges-collection)
  └── P1-05 (create-ges-page)
        └── P3-02 (alertas WF-5)

P0-01 (add-crud)
  └── P0-02 (add-filters) — no depende, pero mejor juntos
        └── P1-01 (fix-comite-cols)

P0-03 (enable-workflows)
  └── P1-03 (inmutabilidad) — activar juntos
        └── P2-01 (RBAC)
              └── P2-02 (RLS)
                    └── P2-03 (FLS)

P1-04 (CIE-O)
  └── P2-06 (export-RHC) — RHC requiere CIE-O

P2-07 (cleanup legacy)
  └── Último en ejecutar — verificar que nada dependa primero
```

---

## Criterios de Éxito por Fase

### Semana 2 (P0 completo):
- [ ] Un clínico puede crear un caso nuevo desde la UI
- [ ] Un clínico puede buscar un paciente por RUT o nombre
- [ ] Al crear un episodio se auto-crea una tarea (WF-1 activo)
- [ ] El semáforo GES muestra garantías próximas a vencer

### Semana 4 (P1 completo):
- [ ] Las fechas muestran formato DD/MM/YYYY en toda la UI
- [ ] Casos en Comité muestra nombre del paciente y sesión
- [ ] Los enums muestran texto correcto sin encoding roto
- [ ] Existe página "Garantías GES" con semáforo de colores

### Semana 8 (P2 completo):
- [ ] Una enfermera no puede editar campos TNM
- [ ] Un médico de Tórax ve solo sus casos en la página Tórax
- [ ] Los eventos clínicos no se pueden editar (solo crear correcciones)
- [ ] Existe exportación RHC válida para MINSAL

### Semana 12+ (P3):
- [ ] Los datos de ALMA aparecen automáticamente cada mañana
- [ ] El dashboard muestra KPIs de tiempo diagnóstico → tratamiento
- [ ] Las colecciones legacy UGCO_* están eliminadas del sistema

---

## Riesgos del Plan

| Riesgo | Probabilidad | Mitigación |
| --- | --- | --- |
| ETL ALMA requiere acceso TI | Alta | Gestionar acceso ODBC desde el inicio (P3-01) |
| Workflows causan datos duplicados al activar | Media | Probar en modo dry-run antes de activar |
| Cleanup legacy rompe páginas no detectadas | Media | Script verifica referencias antes de eliminar |
| RLS nativa limitada en NocoBase 1.9.14 | Alta | Usar filtros fijos + auth por role como alternativa |
| CIE-O-3 MINSAL requiere parsing complejo | Baja | Existe script de referencia en `fetch-hl7-codesystems.ts` |
