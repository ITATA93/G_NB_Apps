# Lecciones Aprendidas — Despliegue NocoBase via API

> Fuente: Proyecto UGCO (Oncología), desplegado en mira.imedicina.cl (2026-03-07/08)
> Errores detectados en auditoría visual, corregidos iterativamente con 9 scripts de fix.

---

## 1. Gráficos (data-visualization plugin)

### 1.1 Arquitectura de 3 capas — OBLIGATORIA

Los bloques de gráfico requieren EXACTAMENTE esta estructura anidada:

```
Layer 1 — ChartBlockProvider (contenedor)
├── x-component: "ChartCardItem"
├── x-decorator: "ChartBlockProvider"
└── x-decorator-props: { collection, dataSource }  ← SOLO estos 2

  Layer 2 — ChartV2Block + Grid (envoltorio)
  ├── x-component: "Grid"
  └── x-decorator: "ChartV2Block"

    Layer 3 — ChartRendererProvider (datos + render)
    ├── x-decorator: "ChartRendererProvider"
    ├── x-decorator-props: { collection, dataSource, query, config }  ← AQUÍ va todo
    ├── x-component: "CardItem"  (NO ChartCardItem)
    └── x-acl-action: "${collection}:list"
```

**Error cometido:** Poner `query` y `config` en Layer 1 (ChartBlockProvider). Resultado: gráfico no carga datos.

### 1.2 `aggregation`, NO `aggregate`

La API `charts:query` usa la propiedad **`aggregation`** en measures:

```typescript
// ✅ CORRECTO — retorna datos agrupados
measures: [{ field: ["id"], aggregation: "count", alias: "count" }]

// ❌ INCORRECTO — retorna filas crudas sin agrupar
measures: [{ field: ["id"], aggregate: "count", alias: "count" }]
```

**Error cometido:** Usar `aggregate` en los 6 nodos de gráficos. Resultado: gráficos mostraban IDs crudos como valores de conteo.

**Script de corrección:** `scripts/fix-chart-aggregation.ts`

### 1.3 `antd.statistic` requiere `general.field`

El tipo de gráfico estadístico necesita `config.general.field` apuntando al alias del measure:

```typescript
config: {
  chartType: "antd.statistic",
  general: {
    field: "count",    // ← OBLIGATORIO, apunta al alias del measure
    title: "Total Casos"
  }
}
```

**Error cometido:** No incluir `general.field`. Resultado: estadísticas mostraban "0".

**Script de corrección:** `scripts/fix-charts-v2.ts`

### 1.4 Tipos de gráfico y configuración

| Tipo | chartType | general |
|------|-----------|---------|
| Barra horizontal | `ant-design-charts.bar` | `{ xField: "count", yField: "categoria" }` |
| Barra vertical | `ant-design-charts.column` | `{ xField: "categoria", yField: "count" }` |
| Pie/Donut | `ant-design-charts.pie` | `{ colorField: "cat", angleField: "count" }` |
| Estadística | `antd.statistic` | `{ field: "count", title: "Título" }` |
| Línea | `ant-design-charts.line` | `{ xField: "fecha", yField: "count" }` |

**Consejo:** Usar `bar` (horizontal) para etiquetas largas en español.

---

## 2. Tablas y Columnas de Asociación

### 2.1 Las 3 condiciones para que una columna de asociación funcione

Las tablas que muestran campos de relaciones `belongsTo`/`hasMany` necesitan **las 3 condiciones simultáneamente**:

#### Condición 1: `params.appends` en TableBlockProvider

```typescript
// En x-decorator-props del TableBlockProvider:
params: {
  pageSize: 20,
  sort: ["-createdAt"],
  appends: ["paciente", "estado_clinico", "estado_adm"]  // ← OBLIGATORIO
}
```

Sin `appends`, el navegador NO solicita los registros relacionados. La tabla muestra datos pero las columnas de asociación quedan vacías.

**Error cometido:** Crear 19 bloques de tabla sin `appends`. Resultado: tablas vacías o con columnas de asociación en blanco.

**Script de corrección:** `scripts/fix-table-appends.ts`

#### Condición 2: `titleField` en la colección destino

Cada colección referenciada debe tener configurado `titleField`:

```typescript
// Para ref_oncoestadoclinico → titleField: "nombre"
await api("POST", "collections:update?filterByTk=ref_oncoestadoclinico", {
  titleField: "nombre"
});
```

Sin `titleField`, NocoBase no sabe qué campo mostrar como etiqueta. Muestra "N/A".

**Error cometido:** Las 14 colecciones de referencia no tenían `titleField` configurado. Resultado: todas las columnas de asociación mostraban "N/A".

**Script de corrección:** `scripts/fix-titlefield.ts`

#### Condición 3: La clave de propiedad (property key) del nodo interno

El `CollectionField` interno debe usar como nombre de propiedad el **nombre de la asociación**, NO el nombre del campo FK:

```json
// ✅ CORRECTO — clave = nombre de asociación
{
  "properties": {
    "estado_clinico": {                    // ← Coincide con el campo belongsTo
      "x-component": "CollectionField",
      "x-collection-field": "ugco_casooncologico.estado_clinico"
    }
  }
}

// ❌ INCORRECTO — clave = nombre del FK integer
{
  "properties": {
    "estado_clinico_id": {                 // ← NocoBase busca el campo integer, NO la asociación
      "x-component": "CollectionField",
      "x-collection-field": "ugco_casooncologico.estado_clinico"  // Aunque apunte bien, la clave manda
    }
  }
}
```

**Error cometido:** En fix-ugco-v2.ts Phase 2, solo se cambió `x-collection-field` de `estado_clinico_id` a `estado_clinico`, pero la clave de propiedad del nodo seguía siendo `estado_clinico_id`. NocoBase usa la CLAVE para buscar la definición del campo. Resultado: la columna intentaba renderizar un campo integer → "N/A".

**Solución:** Eliminar el nodo antiguo y recrear con la clave correcta:
```typescript
// 1. Eliminar nodo con clave incorrecta
await api("POST", `uiSchemas:remove/${oldNodeUid}`);

// 2. Insertar nodo con clave correcta
await api("POST", `uiSchemas:insertAdjacent/${parentUid}?position=beforeEnd`, {
  schema: {
    name: "estado_clinico",  // ← ESTA es la clave que importa
    "x-collection-field": "ugco_casooncologico.estado_clinico",
    "x-component": "CollectionField",
    "x-component-props": {
      fieldNames: { label: "nombre", value: "id" },
      ellipsis: true
    },
    "x-read-pretty": true,
    "x-decorator": null,
    "x-decorator-props": {}
  }
});
```

**Script de corrección:** `scripts/fix-column-keys.ts` — Reemplazó 13 columnas en 7 páginas.

### 2.2 Tabla de mapeo FK → Asociación

| Colección | Campo FK | Campo Asociación | Target | titleField |
|-----------|----------|------------------|--------|------------|
| ugco_casooncologico | paciente_id | paciente | alma_paciente | nombres |
| ugco_casooncologico | estado_clinico_id | estado_clinico | ref_oncoestadoclinico | nombre |
| ugco_casooncologico | estado_adm_id | estado_adm | ref_oncoestadoadm | nombre |
| ugco_casooncologico | estado_seguimiento_id | estado_seguimiento | ref_oncoestadocaso | nombre |
| ugco_comitecaso | comite_id | comite | ugco_comiteoncologico | nombre |
| ugco_comitecaso | caso_id | caso | ugco_casooncologico | UGCO_COD01 |
| ugco_comiteoncologico | especialidad_id | especialidad | ref_oncoespecialidad | nombre |
| ugco_tarea | tipo_tarea_id | tipo_tarea | ref_oncotipoactividad | nombre |
| ugco_tarea | estado_tarea_id | estado_tarea | ref_oncoestadoactividad | nombre |
| ugco_equiposeguimiento | especialidad_id | especialidad | ref_oncoespecialidad | nombre |

---

## 3. Descubrimiento de Páginas (Route Discovery)

### 3.1 Los tabs NO están embebidos en la lista de rutas

```typescript
// ❌ INCORRECTO — children no está en la respuesta de list
const tab = child.children?.find(c => c.type === "tabs");

// ✅ CORRECTO — buscar por parentId en la lista plana
const tab = allRoutes.find(r => r.parentId === child.id && r.type === "tabs");
```

**Error cometido:** Usar `child.children?.find()` para buscar tabs. Las rutas se devuelven como lista plana, no como árbol. Resultado: `gridUid` vacío para las 20 páginas.

### 3.2 El `schemaUid` del tab ES el gridUid

```typescript
const gridUid = tab.schemaUid;  // ← Este UID se usa en uiSchemas:getJsonSchema
```

---

## 4. Permisos ACL

### 4.1 `filterByTk` debe ser ID numérico

```typescript
// ❌ INCORRECTO — retorna 200 pero NO hace nada
await api("POST", "roles/ugco_medico/resources:update?filterByTk=ugco_casooncologico", body);

// ✅ CORRECTO — usa el ID numérico del recurso
const resources = await api("GET", "roles/ugco_medico/resources:list");
const resourceId = resources.data.find(r => r.name === "ugco_casooncologico").id;
await api("POST", `roles/ugco_medico/resources:update?filterByTk=${resourceId}`, body);
```

### 4.2 Incluir tabs ocultos en las rutas del rol

Las páginas tienen hijos ocultos de tipo `tabs` que también necesitan asignarse al rol:

```typescript
// Incluir parent group + page + tab oculto
const routeIds = [groupRouteId, pageRouteId, tabRouteId];
await api("POST", `roles/${role}/desktopRoutes:add`, { tk: routeIds });
```

---

## 5. Checklist de Despliegue NocoBase

### Pre-despliegue
- [ ] Definir `titleField` para TODAS las colecciones de referencia
- [ ] Verificar que las relaciones `belongsTo` tienen `uiSchema.x-component-props.fieldNames`

### Bloques de tabla
- [ ] Incluir `params.appends` con TODAS las asociaciones usadas en columnas
- [ ] Usar nombre de asociación (NO FK) como property key del `CollectionField`
- [ ] Configurar `x-component-props.fieldNames: { label, value }` en cada columna de asociación
- [ ] Verificar `x-read-pretty: true` en columnas de solo lectura

### Gráficos
- [ ] Usar arquitectura de 3 capas (ChartBlockProvider → ChartV2Block → ChartRendererProvider)
- [ ] `query` y `config` SOLO en Layer 3 (ChartRendererProvider)
- [ ] Usar `aggregation` (NO `aggregate`) en measures
- [ ] Para `antd.statistic`: incluir `general.field` con el alias del measure
- [ ] Filtrar valores null en dimensiones (`$ne: null`)

### Rutas y permisos
- [ ] Buscar tabs por `parentId` en lista plana (no `children`)
- [ ] Usar ID numérico en `filterByTk` para ACL resources
- [ ] Incluir rutas de grupo + página + tab oculto al asignar roles

### Verificación visual
- [ ] Ejecutar script de screenshots con Playwright
- [ ] Verificar que NINGUNA columna muestra "N/A" o "ID"
- [ ] Confirmar que gráficos muestran datos agregados (no filas crudas)
- [ ] Verificar paginación (Total N items) en tablas

---

## 6. Scripts de Referencia

| Script | Propósito | Cuándo usar |
|--------|-----------|-------------|
| `fix-ugco-v2.ts` | Fix completo 8 fases | Modelo para nuevos deployments |
| `fix-chart-aggregation.ts` | aggregate → aggregation | Gráficos sin datos agregados |
| `fix-charts-v2.ts` | KPI general.field | Estadísticas mostrando "0" |
| `fix-table-appends.ts` | Agregar appends | Tablas vacías con asociaciones |
| `fix-titlefield.ts` | Configurar titleField | Columnas mostrando "N/A" |
| `fix-column-keys.ts` | Renombrar property keys | Columnas FK mostrando "N/A" |
| `screenshot-verify.ts` | Screenshots Playwright | Verificación visual automatizada |
| `diagnose-column-schema.ts` | Dump de esquemas | Depuración de columnas |

---

## 7. Patrón Recomendado para Nuevas Apps

```typescript
// Orden de operaciones para desplegar una app NocoBase completa:
async function deployApp() {
  // 1. Colecciones + campos + relaciones
  await createCollections();
  await createFields();
  await createRelationships();

  // 2. INMEDIATAMENTE después: configurar titleField
  for (const coll of refCollections) {
    await api("POST", `collections:update?filterByTk=${coll.name}`, {
      titleField: coll.labelField  // "nombre", "nombres", etc.
    });
  }

  // 3. Páginas + rutas
  await createPages();

  // 4. Bloques de tabla — CON appends desde el inicio
  await createTableBlocks({
    params: {
      appends: getAllAssociationFields(collection)  // ← NO OLVIDAR
    }
  });

  // 5. Columnas — usar nombre de ASOCIACIÓN como property key
  for (const col of columns) {
    if (col.isAssociation) {
      // name = "estado_clinico" NO "estado_clinico_id"
      await insertColumn({
        name: col.associationName,
        "x-collection-field": `${collection}.${col.associationName}`,
        "x-component-props": {
          fieldNames: { label: col.labelField, value: "id" }
        }
      });
    }
  }

  // 6. Gráficos — usar aggregation + 3 capas
  await createCharts({
    measures: [{ field: ["id"], aggregation: "count", alias: "count" }]
  });

  // 7. Roles + ACL (usar IDs numéricos)
  await setupRoles();

  // 8. Verificar con screenshots
  await takeScreenshots();
}
```
