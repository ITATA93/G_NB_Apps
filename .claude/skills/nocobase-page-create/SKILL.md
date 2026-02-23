---
name: nocobase-page-create
description: Crear páginas editables en NocoBase via API. Usa cuando necesites crear nuevas páginas en el menú de NocoBase.
argument-hint: "<título>" [parentId]
disable-model-invocation: false
allowed-tools: Bash(npx tsx:*), Read, Write
---

# Crear Páginas en NocoBase

Crea páginas funcionales y editables en NocoBase mediante API.

## Uso

```
/nocobase-page-create "Nombre de la Página"
/nocobase-page-create "Nombre" 345392373628932
```

## Parent IDs Conocidos

| Nombre | ID |
|--------|-----|
| UGCO Oncología (raíz) | 345392373628928 |
| Especialidades | 345392373628932 |

## Proceso

1. **Ejecutar el script de creación**:
   ```bash
   npx tsx Apps/UGCO/scripts/nocobase/create-page.ts "$ARGUMENTS"
   ```

2. **Verificar la creación** listando las páginas actuales.

## Script Principal

El script `Apps/UGCO/scripts/nocobase/create-page.ts` implementa el método correcto:

1. Crea `desktopRoutes:create` con `children` (tab oculto referenciando el Grid)
2. Crea `uiSchemas:insert` con el Grid anidado y `x-async: true`

## Estructura Requerida

```typescript
// 1. Ruta con children
await client.post('/desktopRoutes:create', {
    type: 'page',
    title: title,
    parentId: parentId,
    schemaUid: pageUid,
    enableTabs: false,
    children: [{
        type: 'tabs',
        schemaUid: gridUid,
        tabSchemaName: gridName,
        hidden: true
    }]
});

// 2. Schema con Grid anidado
await client.post('/uiSchemas:insert', {
    type: 'void',
    'x-component': 'Page',
    'x-uid': pageUid,
    properties: {
        [gridName]: {
            type: 'void',
            'x-component': 'Grid',
            'x-initializer': 'page:addBlock',
            'x-uid': gridUid,
            'x-async': true,
            properties: {}
        }
    }
});
```

## Notas Importantes

- Sin `children` en la ruta, la página NO será editable
- El Grid DEBE tener `x-async: true` para permitir edición
- El `gridName` debe coincidir con `tabSchemaName`
- El `gridUid` debe coincidir con `children[0].schemaUid`

## Variables de Entorno Requeridas

- `NOCOBASE_BASE_URL`: URL de la API de NocoBase
- `NOCOBASE_API_KEY`: Token de autenticación
