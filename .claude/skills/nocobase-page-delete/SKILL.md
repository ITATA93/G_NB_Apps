---
name: nocobase-page-delete
description: Eliminar páginas de NocoBase via API. Usa cuando necesites borrar páginas del menú de NocoBase.
argument-hint: <pageId> | "título"
disable-model-invocation: true
allowed-tools: Bash(npx tsx:*), Read, Write, AskUserQuestion
---

# Eliminar Páginas en NocoBase

Elimina páginas de NocoBase incluyendo sus schemas y children.

## Uso

```
/nocobase-page-delete 345419036819456
/nocobase-page-delete "Pacientes"
```

## Proceso de Eliminación

### 1. Buscar la página por ID o título

```typescript
// Por ID
const route = await client.get(`/desktopRoutes:get?filterByTk=${pageId}`);

// Por título (listar y filtrar)
const routes = await client.get('/desktopRoutes:list', {
    params: { filter: { title: titulo } }
});
```

### 2. Eliminar children primero

```typescript
const children = await client.get('/desktopRoutes:list', {
    params: { filter: { parentId: pageId } }
});

for (const child of children.data?.data || []) {
    await client.post(`/desktopRoutes:destroy?filterByTk=${child.id}`);
}
```

### 3. Eliminar la ruta

```typescript
await client.post(`/desktopRoutes:destroy?filterByTk=${pageId}`);
```

### 4. Eliminar el schema (opcional pero recomendado)

```typescript
if (route.schemaUid) {
    await client.post(`/uiSchemas:remove/${route.schemaUid}`);
}
```

## Script de Referencia

Puedes crear un script basado en `Apps/UGCO/scripts/nocobase/cleanup-test-pages.ts`:

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

async function deletePage(pageId: number) {
    // 1. Obtener info
    const route = await client.get(`/desktopRoutes:get?filterByTk=${pageId}`);
    const schemaUid = route.data?.data?.schemaUid;

    // 2. Eliminar children
    const children = await client.get('/desktopRoutes:list', {
        params: { filter: { parentId: pageId } }
    });
    for (const child of children.data?.data || []) {
        await client.post(`/desktopRoutes:destroy?filterByTk=${child.id}`);
    }

    // 3. Eliminar ruta
    await client.post(`/desktopRoutes:destroy?filterByTk=${pageId}`);

    // 4. Eliminar schema
    if (schemaUid) {
        await client.post(`/uiSchemas:remove/${schemaUid}`).catch(() => {});
    }
}
```

## Seguridad

- **SIEMPRE** confirmar con el usuario antes de eliminar
- Listar lo que se va a eliminar antes de proceder
- No eliminar páginas con IDs protegidos (Dashboard, grupos principales)

## IDs Protegidos (NO eliminar)

| Página | ID |
|--------|-----|
| 📊 Dashboard | 345392373628930 |
| 📁 Especialidades | 345392373628932 |
| 📅 Comités | 345392375726091 |
| ✅ Tareas | 345392375726093 |
| 📄 Reportes | 345392375726095 |

## Variables de Entorno Requeridas

- `NOCOBASE_BASE_URL`: URL de la API de NocoBase
- `NOCOBASE_API_KEY`: Token de autenticación
