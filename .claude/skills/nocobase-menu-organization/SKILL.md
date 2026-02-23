---
name: nocobase-menu-organization
description: Organizar menús y navegación en NocoBase. Reordenar páginas, crear grupos, mover elementos entre carpetas.
argument-hint: <command> [options]
disable-model-invocation: false
allowed-tools: Bash(npx tsx:*), Read
---

# Organización de Menús en NocoBase

Gestiona la estructura de navegación y menús en NocoBase.

## Comandos Disponibles

### Listar estructura de menú

```bash
# Ver estructura completa de UGCO
npx tsx Apps/UGCO/scripts/nocobase/list-all-ugco.ts

# Listar páginas bajo un parent
npx tsx Apps/UGCO/scripts/nocobase/list-ugco-pages.ts
```

### Ver menú del sistema

```bash
npx tsx shared/scripts/manage-ui.ts menus
```

## API de Desktop Routes

### Listar rutas accesibles (árbol)

```typescript
const routes = await client.get('/desktopRoutes:listAccessible', {
    params: { tree: true, sort: 'sort' }
});
```

### Listar rutas bajo un parent

```typescript
const children = await client.get('/desktopRoutes:list', {
    params: {
        filter: { parentId: PARENT_ID },
        pageSize: 100,
        sort: ['sort']
    }
});
```

### Mover una página a otro parent

```typescript
await client.post('/desktopRoutes:update', {
    filterByTk: pageId,
    parentId: newParentId
});
```

### Reordenar páginas (cambiar sort)

```typescript
// Mover página al principio
await client.post('/desktopRoutes:update', {
    filterByTk: pageId,
    sort: 1
});

// Usar move para orden relativo
await client.post('/desktopRoutes:move', {
    sourceId: pageToMoveId,
    targetId: referencePageId,
    method: 'insertAfter'  // o 'insertBefore'
});
```

### Crear grupo de menú

```typescript
await client.post('/desktopRoutes:create', {
    type: 'group',
    title: 'Mi Grupo',
    parentId: parentId,
    icon: 'FolderOutlined'
});
```

## Tipos de Rutas

| Tipo | Uso | Icono sugerido |
|------|-----|----------------|
| `page` | Página con contenido | Varía según función |
| `group` | Carpeta/grupo | FolderOutlined |
| `link` | Enlace externo | LinkOutlined |
| `tabs` | Tab interno (oculto) | - |

## Iconos Disponibles

NocoBase usa iconos de Ant Design. Algunos comunes:

```
HomeOutlined, DashboardOutlined, SettingOutlined,
UserOutlined, TeamOutlined, FolderOutlined,
FileOutlined, DatabaseOutlined, AppstoreOutlined,
BarChartOutlined, PieChartOutlined, LineChartOutlined,
CalendarOutlined, ClockCircleOutlined, BellOutlined,
HeartOutlined, StarOutlined, TagOutlined,
SearchOutlined, FilterOutlined, SortAscendingOutlined
```

## Ejemplo: Reordenar Páginas

```typescript
import { createClient, log } from '../../shared/scripts/ApiClient.js';

const client = createClient();

async function reorderPages(parentId: number) {
    // 1. Obtener páginas actuales
    const response = await client.get('/desktopRoutes:list', {
        filter: { parentId },
        sort: ['sort']
    });

    const pages = response.data || [];
    log(`Encontradas ${pages.length} páginas`);

    // 2. Definir nuevo orden (por título)
    const sorted = [...pages].sort((a, b) => a.title.localeCompare(b.title));

    // 3. Actualizar sort de cada página
    for (let i = 0; i < sorted.length; i++) {
        await client.post('/desktopRoutes:update', {
            filterByTk: sorted[i].id,
            sort: i + 1
        });
        log(`${i + 1}. ${sorted[i].title}`);
    }

    log('Páginas reordenadas');
}

reorderPages(345392373628932);  // ID de Especialidades
```

## Ejemplo: Mover Página a Otro Grupo

```typescript
async function movePage(pageId: number, newParentId: number) {
    // Verificar que existe
    const route = await client.get('/desktopRoutes:get', { filterByTk: pageId });
    if (!route.data) {
        log('Página no encontrada');
        return;
    }

    log(`Moviendo "${route.data.title}" al nuevo grupo...`);

    // Mover
    await client.post('/desktopRoutes:update', {
        filterByTk: pageId,
        parentId: newParentId
    });

    log('Página movida exitosamente');
}

// Mover página 123 al grupo "Especialidades"
movePage(123, 345392373628932);
```

## Ejemplo: Crear Estructura de Grupos

```typescript
async function createMenuStructure(parentId: number) {
    const groups = [
        { title: 'Clínico', icon: 'MedicineBoxOutlined' },
        { title: 'Administrativo', icon: 'SolutionOutlined' },
        { title: 'Reportes', icon: 'BarChartOutlined' }
    ];

    for (const group of groups) {
        const response = await client.post('/desktopRoutes:create', {
            type: 'group',
            title: group.title,
            icon: group.icon,
            parentId: parentId
        });
        log(`Grupo creado: ${group.title} (ID: ${response.data?.id})`);
    }
}
```

## Parent IDs Conocidos

| Nombre | ID |
|--------|-----|
| UGCO Oncología (raíz) | 345392373628928 |
| Especialidades | 345392373628932 |

## Propiedades de Ruta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | number | ID único |
| `parentId` | number | ID del padre |
| `title` | string | Título mostrado |
| `icon` | string | Icono Ant Design |
| `type` | string | page, group, link, tabs |
| `sort` | number | Orden en el menú |
| `hidden` | boolean | Oculto en menú |
| `hideInMenu` | boolean | No mostrar en navegación |
| `schemaUid` | string | UID del schema (para pages) |

## Ocultar/Mostrar Página en Menú

```typescript
// Ocultar página del menú
await client.post('/desktopRoutes:update', {
    filterByTk: pageId,
    hideInMenu: true
});

// Mostrar página en menú
await client.post('/desktopRoutes:update', {
    filterByTk: pageId,
    hideInMenu: false
});
```

## Variables de Entorno

- `NOCOBASE_BASE_URL`: URL de la API
- `NOCOBASE_API_KEY`: Token de autenticación
