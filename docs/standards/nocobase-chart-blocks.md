---
depends_on: [nocobase-page-block-deployment.md]
impacts: [Apps/UGCO/scripts/create-ugco-charts.ts]
---

# NocoBase Chart Blocks — Estándar de Implementación via API

> **Fuente de verdad**: Este documento define el patrón validado para crear bloques de
> gráficos en NocoBase v1.9.14 via API. Descubierto y confirmado en sesión 2026-03-04
> mediante análisis del bundle JS del plugin `data-visualization` y fuente en GitHub.
>
> **Aplicación de referencia**: UGCO Dashboard (`dpjuonzjgna`)

---

## El Error Más Común (y costoso)

> [!CAUTION]
> **NO pongas `query` ni `config` en el `ChartBlockProvider`.**
> El proveedor externo **NO llama** a `charts:query`. Es solo un contenedor de contexto
> de auto-refresh. El `ChartRendererProvider` (interno) es quien hace el fetch real.

```typescript
// ❌ INCORRECTO — esto produce charts en blanco sin ningún API call
"x-decorator": "ChartBlockProvider",
"x-decorator-props": {
  collection: "mi_coleccion",
  query: { ... },      // ← IGNORADO
  config: { ... },     // ← IGNORADO
}

// ✅ CORRECTO — la query va en el renderer interno
"x-decorator": "ChartRendererProvider",
"x-decorator-props": {
  collection: "mi_coleccion",
  query: { ... },      // ← Este sí llama a charts:query
  config: { ... },     // ← Este sí configura el gráfico
}
```

---

## Arquitectura de Capas (3 niveles)

```
ChartBlockProvider (x-decorator)          ← Nivel 1: Auto-refresh context
  ChartCardItem (x-component)
  │
  ├── ActionBar                           ← Acciones del bloque (refresh, filtros)
  │
  └── Grid (x-decorator: ChartV2Block)   ← Nivel 2: Registra ChartRenderer localmente
        │
        └── Grid.Row
              └── Grid.Col
                    └── ChartRendererProvider (x-decorator)  ← Nivel 3: Fetch + data
                          CardItem (x-component)
                          │
                          ├── ActionBar  ← Acciones del gráfico individual
                          └── ChartRenderer (x-component)   ← Renderiza el visual
```

### Responsabilidades por nivel

| Componente | Rol | ¿Llama API? |
|---|---|---|
| `ChartBlockProvider` | Contexto de refresh global | No |
| `ChartCardItem` | Contenedor de la tarjeta externa | No |
| `ChartV2Block` | Registra `ChartRenderer` y `ChartRendererProvider` localmente | No |
| `ChartRendererProvider` | Llama `POST charts:query`, provee datos | **Sí** |
| `CardItem` | Tarjeta interna del gráfico | No |
| `ChartRenderer` | Lee contexto, renderiza el visual | No (consume contexto) |

> **Por qué `ChartRenderer` y `ChartRendererProvider` están disponibles como decoradores:**
> `ChartV2Block` los registra vía `SchemaComponentOptions` (React context), lo que los hace
> disponibles para todos los nodos descendientes del schema. Por eso deben vivir DENTRO del Grid.

---

## Schema Completo (TypeScript)

Fuente de referencia: `Apps/UGCO/scripts/create-ugco-charts.ts` (v4)

```typescript
function buildChartSchema(opts: {
  title: string;
  collection: string;
  chartType: string;             // ver tabla de tipos abajo
  measures: { field: string[]; aggregate: string; alias: string }[];
  dimensions: { field: string[]; alias?: string }[];
  general: Record<string, string>; // xField/yField/angleField/colorField etc.
  filter?: object;
}): object {

  // Generar UIDs únicos para cada nodo
  const blockUid         = uid();  // outer container
  const outerActionsUid  = uid();
  const gridUid          = uid();
  const rowUid           = uid();
  const colUid           = uid();
  const rendererUid      = uid();  // ChartRendererProvider
  const innerActionsUid  = uid();
  const chartRendererUid = uid();  // ChartRenderer

  const query = {
    measures: opts.measures,
    dimensions: opts.dimensions,
    filter: opts.filter ?? {},
    orders: [],          // ⚠️  NO ordenar por alias de aggregate (ej: "count") — causa "No data"
    limit: 2000,
  };

  return {
    type: "void",
    "x-uid": blockUid,
    name: blockUid,
    version: "2.0",
    _isJSONSchemaObject: true,

    // ── NIVEL 1: Contenedor externo ──────────────────────────────────────────
    "x-component": "ChartCardItem",
    "x-use-component-props": "useChartBlockCardProps",
    "x-settings": "chart:block",
    "x-decorator": "ChartBlockProvider",
    "x-decorator-props": {
      collection: opts.collection,  // solo para contexto ACL
      dataSource: "main",
      // ← SIN query ni config aquí
    },
    "x-async": false,
    "x-index": 1,

    properties: {
      [outerActionsUid]: {
        type: "void", "x-uid": outerActionsUid, name: outerActionsUid,
        "x-component": "ActionBar",
        "x-component-props": { style: { marginBottom: "var(--nb-designer-offset)" } },
        "x-initializer": "chartBlock:configureActions",
        "x-async": false, "x-index": 1,
      },

      // ── NIVEL 2: Grid con ChartV2Block ───────────────────────────────────
      [gridUid]: {
        type: "void", "x-uid": gridUid, name: gridUid,
        "x-component": "Grid",
        "x-decorator": "ChartV2Block",
        "x-initializer": "charts:addBlock",
        "x-async": false, "x-index": 2,

        properties: {
          [rowUid]: {
            type: "void", "x-uid": rowUid, name: rowUid,
            "x-component": "Grid.Row", "x-async": false, "x-index": 1,

            properties: {
              [colUid]: {
                type: "void", "x-uid": colUid, name: colUid,
                "x-component": "Grid.Col", "x-async": false, "x-index": 1,

                properties: {
                  // ── NIVEL 3: Renderer (el que SÍ llama charts:query) ──────
                  [rendererUid]: {
                    type: "void", "x-uid": rendererUid, name: rendererUid,
                    version: "2.0", _isJSONSchemaObject: true,

                    "x-decorator": "ChartRendererProvider",
                    "x-decorator-props": {
                      collection: opts.collection,
                      dataSource: "main",
                      query,                    // ← aquí sí va la query
                      config: {
                        chartType: opts.chartType,
                        general: opts.general,  // ← aquí sí va el config visual
                        advanced: {},           // objeto vacío, NO string JSON
                        title: opts.title,
                        bordered: false,
                      },
                    },
                    "x-acl-action": `${opts.collection}:list`,
                    "x-toolbar": "ChartRendererToolbar",
                    "x-settings": "chart:renderer",
                    "x-component": "CardItem",  // ← CardItem, NO ChartCardItem
                    "x-component-props": { size: "small", bordered: false },
                    "x-initializer": "charts:addBlock",
                    "x-async": false, "x-index": 1,

                    properties: {
                      [innerActionsUid]: {
                        type: "void", "x-uid": innerActionsUid, name: innerActionsUid,
                        "x-component": "ActionBar",
                        "x-initializer": "chart:configureActions",
                        "x-async": false, "x-index": 1,
                      },
                      [chartRendererUid]: {
                        type: "void", "x-uid": chartRendererUid, name: chartRendererUid,
                        "x-component": "ChartRenderer",
                        "x-component-props": {},
                        "x-async": false, "x-index": 2,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}
```

---

## Tipos de Gráficos Disponibles (v1.9.14)

Namespace `ant-design-charts` (G2Plot):

| `chartType` | Tipo | `general` requerido | Notas |
|---|---|---|---|
| `ant-design-charts.column` | Barras verticales | `xField`, `yField` | Evitar para categorías con nombres largos |
| `ant-design-charts.bar` | Barras horizontales | `yField` (categoría), `xField` (valor) | **Recomendado** para nombres en español |
| `ant-design-charts.pie` | Torta | `angleField`, `colorField` | Agregar `advanced: {innerRadius: 0.5}` para donut |
| `ant-design-charts.line` | Línea temporal | `xField`, `yField` | Ideal para series temporales |
| `ant-design-charts.area` | Área | `xField`, `yField` | Variante de línea con relleno |

Namespace `antd`:

| `chartType` | Tipo | `general` requerido |
|---|---|---|
| `antd.statistic` | Número estadístico | — (solo medida, sin dimensión) |

### Mapeado de campos para Bar (horizontal) vs Column (vertical)

```typescript
// Bar (horizontal) — CORRECTO para categorías largas en español
general: { yField: "especialidad", xField: "count" }
// El yField = categoría (eje Y izquierdo) | xField = valor (eje X)

// Column (vertical)
general: { xField: "especialidad", yField: "count" }
// El xField = categoría (eje X inferior) | yField = valor (eje Y)
```

### Advanced config (donut, colores, etc.)

```typescript
// El campo advanced es un OBJETO (no string JSON)
advanced: { innerRadius: 0.5 }            // donut
advanced: { innerRadius: 0.5, radius: 0.85 }  // donut con tamaño controlado
advanced: {}                              // sin config extra (campo obligatorio)
```

---

## Insertar en una Columna Existente

```typescript
await fetch(`${BASE}/uiSchemas:insertAdjacent/${colUid}?position=afterBegin`, {
  method: "POST",
  headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ schema: buildChartSchema(opts) }),
});
```

---

## Actualizar un Chart Existente (Patch)

Para modificar el tipo de gráfico o la query de un renderer existente, patchear solo
el nodo `ChartRendererProvider` (no el bloque externo):

```typescript
await fetch(`${BASE}/uiSchemas:patch`, {
  method: "POST",
  headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    "x-uid": rendererUid,          // UID del nodo ChartRendererProvider
    "x-decorator-props": {
      collection: "onco_casos",
      dataSource: "main",
      query: { ... },
      config: { chartType: "ant-design-charts.bar", general: { ... }, advanced: {} },
    },
  }),
});
```

Para encontrar el `rendererUid`:
```typescript
const schema = await fetch(`${BASE}/uiSchemas:getJsonSchema/${colUid}`).then(r => r.json());
// Buscar recursivamente: node["x-decorator"] === "ChartRendererProvider"
```

---

## Errores Conocidos y Soluciones

| Error | Causa | Solución |
|---|---|---|
| Chart en blanco, cero llamadas a `charts:query` | `query`/`config` en `ChartBlockProvider` en vez de `ChartRendererProvider` | Mover todo el config al nivel 3 |
| `"No data"` en el gráfico | `orders` contiene alias de aggregate (`"count"`) | Usar `orders: []` siempre |
| `"No data"` en el gráfico | `advanced` como string JSON en vez de objeto | Usar `advanced: {}` o `advanced: { innerRadius: 0.5 }` |
| Labels rotados/ilegibles | Usar `column` para categorías largas | Cambiar a `bar` (horizontal) |
| Gráfico renderiza pero no tiene datos reales | `ChartV2Block` Grid sin hijos | Agregar `Grid.Row > Grid.Col > ChartRendererProvider` dentro del Grid |

---

## Script de Referencia

```bash
# Crear/reemplazar charts del UGCO Dashboard
npx tsx --env-file=.env Apps/UGCO/scripts/create-ugco-charts.ts

# Verificar visualmente (screenshot con scroll hasta la fila de charts)
npx tsx --env-file=.env scripts/scroll-screenshot.ts
```

El script de diagnóstico `scripts/diagnose-charts.ts` captura errores de consola,
DOM del área de charts y requests de red para debugging.
