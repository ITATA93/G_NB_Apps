# NocoBase Page & Block Deployment Standard

> **Fuente de verdad**: Este documento define el patrón validado para crear páginas con
> contenido editable en NocoBase via API. Todo deployment debe seguir este estándar.

## Arquitectura de una Página NocoBase

```
desktopRoute (type=group)          ← Menú principal (top bar)
  └─ desktopRoute (type=page)      ← Página (sidebar)
       ├─ schemaUid → Page schema  ← Estructura visual (Page component)
       ├─ menuSchemaUid → Menu.Item ← Vínculo con menú lateral
       └─ desktopRoute (type=tabs)  ← Hijo oculto (contenedor de contenido)
            └─ schemaUid → Grid    ← **AQUÍ van los bloques**
```

> [!IMPORTANT]
> **Los bloques van en el `schemaUid` del hijo `type=tabs`, NO en el de la página.**
> Esta es la "Key Discovery" documentada en `deploy-blocks.ts`.

## Pipeline de Deployment (3 pasos)

### Paso 1: Crear Rutas (`deploy-routes.ts`)

```bash
npx tsx shared/scripts/deploy-routes.ts --config <archivo.json>
```

El script:
1. Crea `desktopRoute type=group` (menú principal)
2. Para cada `type=page`:
   - Crea un `Page` schema via `POST /uiSchemas:insert` con `x-async: false`
   - Vincula via `POST /desktopRoutes:update` → `{ schemaUid }`
3. NocoBase auto-crea un hijo `type=tabs` con su propio `schemaUid`

**Config JSON format:**
```json
{
  "name": "Mi Módulo",
  "icon": "AppstoreOutlined",
  "routes": [
    { "title": "Dashboard", "type": "page", "icon": "DashboardOutlined" },
    { "title": "Sub-grupo", "type": "group", "children": [
      { "title": "Página 1", "type": "page" }
    ]}
  ]
}
```

### Paso 2: Descubrir Grid UIDs

```typescript
// Patrón validado (deploy-blocks.ts línea 97-102)
const tabsRoute = routes.find(r => r.parentId === pageRouteId && r.type === 'tabs');
const gridUid = tabsRoute.schemaUid; // ← Este es el target para bloques
```

### Paso 3: Insertar Bloques (`deploy-blocks.ts` pattern)

```bash
npx tsx shared/scripts/deploy-blocks.ts              # Deploy
npx tsx shared/scripts/deploy-blocks.ts --verify     # Verificar
npx tsx shared/scripts/deploy-blocks.ts --dry-run    # Preview
```

O via `add-block-to-page.ts`:
```bash
npx tsx shared/scripts/add-block-to-page.ts <routeId> <collection> --type table
```

**Schema de bloque tabla validado:**
```typescript
{
  type: 'void',
  'x-component': 'Grid.Row',
  properties: {
    col: {
      type: 'void',
      'x-component': 'Grid.Col',
      properties: {
        block: {
          type: 'void',
          'x-decorator': 'TableBlockProvider',
          'x-decorator-props': {
            collection: '<nombre_coleccion>',
            dataSource: 'main',           // ← REQUERIDO
            action: 'list',
            params: { pageSize: 20 },
          },
          'x-component': 'CardItem',
          'x-toolbar': 'BlockSchemaToolbar',    // ← REQUERIDO
          'x-settings': 'blockSettings:table',  // ← REQUERIDO
          properties: {
            actions: {
              type: 'void',
              'x-component': 'ActionBar',
              'x-initializer': 'table:configureActions',  // ← REQUERIDO
            },
            table: {
              type: 'array',
              'x-component': 'TableV2',
              'x-use-component-props': 'useTableBlockProps',  // ← REQUERIDO
              'x-initializer': 'table:configureColumns',      // ← REQUERIDO
              'x-component-props': {
                rowKey: 'id',
                rowSelection: { type: 'checkbox' },
              },
            },
          },
        },
      },
    },
  },
}
```

## Propiedades Críticas

| Propiedad | Valor | Efecto si falta |
|-----------|-------|-----------------|
| `dataSource` | `'main'` | Bloque no encuentra datos |
| `x-toolbar` | `'BlockSchemaToolbar'` | Sin menú de configuración |
| `x-settings` | `'blockSettings:table'` | Sin ajustes de bloque |
| `x-use-component-props` | `'useTableBlockProps'` | Tabla no funcional |
| `x-initializer` (ActionBar) | `'table:configureActions'` | Sin botón "+ Añadir acción" |
| `x-initializer` (TableV2) | `'table:configureColumns'` | Sin botón "+ Añadir columna" |
| `x-async` (Page) | `false` | NocoBase espera carga síncrona |
| `enableTabs` (Route) | `false` | Tabs se muestran incorrectamente |

## Double Binding Protocol

Para que una página sea visible Y editable:

1. **Structure Binding**: Route tiene `schemaUid` → apunta a `Page` schema con `Grid`
2. **Navigation Binding**: Route tiene `menuSchemaUid` → apunta a `Menu.Item` schema
3. **Content Binding**: Tabs child route tiene `schemaUid` → apunta a `Grid` real donde van los bloques

## Scripts Validados

| Script | Función | Uso |
|--------|---------|-----|
| `deploy-routes.ts` | Crear menús + páginas | `--config routes.json` |
| `deploy-blocks.ts` | Insertar bloques en páginas | `--verify`, `--dry-run` |
| `add-block-to-page.ts` | Agregar bloque individual | `<routeId> <collection> --type table` |

## Anti-patrones (NO HACER)

- ❌ Insertar bloques en el `schemaUid` de la page route
- ❌ Usar `x-async: true` en Page schemas
- ❌ Inventar UIDs para tabs routes (deben ser generados por `uiSchemas:insert`)
- ❌ Omitir `dataSource`, `x-toolbar`, `x-settings`, `x-initializer`
- ❌ Usar `uiSchemas:insertAdjacent` en Menu.Item schemas para contenido de página
