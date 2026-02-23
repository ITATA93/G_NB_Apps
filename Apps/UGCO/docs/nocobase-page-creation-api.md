# Crear Páginas en NocoBase via API

## Descubrimiento Final

Para crear páginas funcionales via API que permitan agregar bloques desde la UI, hay que replicar EXACTAMENTE lo que hace la UI de NocoBase:

1. **La ruta debe incluir `children`** con una referencia al Grid
2. **El schema debe incluir el Grid anidado** con `x-async: true`

## Proceso Correcto (verificado con captura de red)

### 1. Crear la Ruta CON children

```typescript
await client.post('/desktopRoutes:create', {
    type: 'page',
    title: 'Mi Página',
    parentId: PARENT_ID,
    schemaUid: pageUid,
    menuSchemaUid: menuSchemaUid,
    enableTabs: false,
    children: [{
        type: 'tabs',
        schemaUid: gridUid,      // UID del Grid
        tabSchemaName: gridName,  // Nombre del Grid (key en properties)
        hidden: true
    }]
});
```

### 2. Crear el Schema CON el Grid anidado

```typescript
await client.post('/uiSchemas:insert', {
    type: 'void',
    'x-component': 'Page',
    'x-uid': pageUid,
    properties: {
        [gridName]: {  // Mismo nombre que tabSchemaName
            type: 'void',
            'x-component': 'Grid',
            'x-initializer': 'page:addBlock',
            'x-uid': gridUid,  // Mismo UID que children[0].schemaUid
            'x-async': true,   // ¡CLAVE! Permite carga asíncrona
            properties: {}
        }
    }
});
```

## Script de Uso

```bash
# Crear página bajo UGCO Oncología
npx tsx Apps/UGCO/scripts/nocobase/create-page.ts "Mi Nueva Página"

# Crear página bajo Especialidades
npx tsx Apps/UGCO/scripts/nocobase/create-page.ts "Mi Página" 345392373628932
```

## Parent IDs Conocidos

| Nombre | ID |
|--------|-----|
| UGCO Oncología (raíz) | 345392373628928 |
| Especialidades | 345392373628932 |

## Por qué funciona

El campo `children` en la ruta crea una relación interna que NocoBase necesita para:
- Saber qué schema cargar de forma asíncrona
- Permitir la edición del Grid desde la UI
- Mostrar el botón "+ Añadir bloque"

Sin el `children`, NocoBase no sabe que hay un Grid editable dentro de la página.

## Captura de Red de la UI

Usando Playwright capturamos exactamente lo que hace la UI:

**Request 1: desktopRoutes:create**
```json
{
  "type": "page",
  "title": "Agregada222",
  "parentId": 345392373628928,
  "schemaUid": "5khl5atb9pk",
  "menuSchemaUid": "5p57l55sii0",
  "enableTabs": false,
  "children": [{
    "type": "tabs",
    "schemaUid": "fqixeqqlqdd",
    "tabSchemaName": "p931eorpmdm",
    "hidden": true
  }]
}
```

**Request 2: uiSchemas:insert**
```json
{
  "type": "void",
  "x-component": "Page",
  "x-uid": "5khl5atb9pk",
  "properties": {
    "p931eorpmdm": {
      "type": "void",
      "x-component": "Grid",
      "x-initializer": "page:addBlock",
      "x-uid": "fqixeqqlqdd",
      "x-async": true,
      "properties": {}
    }
  }
}
```

## Relación entre UIDs

```
pageUid ─────────────────────┬─── desktopRoutes.schemaUid
                             └─── uiSchemas[Page].x-uid

gridUid ─────────────────────┬─── desktopRoutes.children[0].schemaUid
                             └─── uiSchemas[Grid].x-uid

gridName ────────────────────┬─── desktopRoutes.children[0].tabSchemaName
                             └─── uiSchemas[Page].properties[KEY]
```

## Métodos Anteriores que NO Funcionan

❌ Crear Page sin properties y agregar Grid con `insertAdjacent`
❌ Crear ruta sin `children`
❌ Grid sin `x-async: true`
❌ Crear solo la ruta o solo el schema

## Referencias

- Script de captura: `Apps/UGCO/scripts/nocobase/capture-ui-calls.ts`
- Script de creación: `Apps/UGCO/scripts/nocobase/create-page.ts`
