---
name: nocobase-page-list
description: Listar páginas de NocoBase via API. Usa para ver la estructura de menús y páginas existentes.
argument-hint: [parentId]
disable-model-invocation: false
allowed-tools: Bash(npx tsx:*), Read
---

# Listar Páginas en NocoBase

Lista la estructura de páginas y menús en NocoBase.

## Uso

```
/nocobase-page-list
/nocobase-page-list 345392373628928
```

## Scripts Disponibles

### Listar estructura completa de UGCO

```bash
npx tsx Apps/UGCO/scripts/nocobase/list-all-ugco.ts
```

### Listar páginas bajo un parent específico

```bash
npx tsx Apps/UGCO/scripts/nocobase/list-ugco-pages.ts
```

## API Endpoints

### Listar rutas accesibles (árbol completo)

```typescript
const routes = await client.get('/desktopRoutes:listAccessible', {
    params: { tree: true, sort: 'sort' }
});
```

### Listar rutas bajo un parent

```typescript
const routes = await client.get('/desktopRoutes:list', {
    params: {
        filter: { parentId: PARENT_ID },
        pageSize: 100
    }
});
```

### Obtener detalles de una ruta

```typescript
const route = await client.get(`/desktopRoutes:get?filterByTk=${routeId}`);
```

## Estructura de Respuesta

```json
{
  "id": 345392373628938,
  "parentId": 345392373628932,
  "title": "🩷 Mama",
  "type": "page",
  "schemaUid": "gd5bm7y7eeu",
  "menuSchemaUid": null,
  "enableTabs": false,
  "hidden": false
}
```

## Tipos de Rutas

| Tipo | Descripción |
|------|-------------|
| `page` | Página con contenido |
| `group` | Grupo/carpeta de menú |
| `tabs` | Tab interno (generalmente oculto) |
| `link` | Enlace externo |

## Parent IDs Conocidos

| Nombre | ID |
|--------|-----|
| UGCO Oncología (raíz) | 345392373628928 |
| Especialidades | 345392373628932 |

## Script de Ejemplo

```typescript
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const client = axios.create({
    baseURL: process.env.NOCOBASE_BASE_URL,
    headers: {
        'Authorization': `Bearer ${process.env.NOCOBASE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Role': 'root'
    },
});

async function listChildren(parentId: number, indent: string = '') {
    const routes = await client.get('/desktopRoutes:list', {
        params: {
            filter: { parentId },
            pageSize: 100
        }
    });

    for (const route of routes.data?.data || []) {
        console.log(`${indent}${route.id} | ${route.title} | ${route.type}`);
        if (route.type === 'group') {
            await listChildren(route.id, indent + '  ');
        }
    }
}

// Uso
listChildren(345392373628928);
```

## Verificar Estructura de Página

Para verificar si una página tiene la estructura correcta (editable):

```typescript
async function verifyPage(pageId: number) {
    // 1. Obtener ruta
    const route = await client.get(`/desktopRoutes:get?filterByTk=${pageId}`);

    // 2. Verificar children
    const children = await client.get('/desktopRoutes:list', {
        params: { filter: { parentId: pageId } }
    });

    // 3. Verificar schema
    const schemaUid = route.data?.data?.schemaUid;
    const props = await client.get(`/uiSchemas:getProperties/${schemaUid}`);

    // Página es editable si:
    // - Tiene children con type: 'tabs'
    // - Grid tiene x-async: true
    const hasChildren = children.data?.data?.length > 0;
    const gridKey = Object.keys(props.data?.data?.properties || {})[0];
    const gridAsync = props.data?.data?.properties?.[gridKey]?.['x-async'];

    return {
        editable: hasChildren && gridAsync === true,
        hasChildren,
        gridAsync
    };
}
```

## Variables de Entorno Requeridas

- `NOCOBASE_BASE_URL`: URL de la API de NocoBase
- `NOCOBASE_API_KEY`: Token de autenticación
