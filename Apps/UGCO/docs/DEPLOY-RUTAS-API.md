# Creación de Rutas NocoBase via API

**Fecha**: 2026-01-29
**Autor**: Claude (asistido por API)
**Estado**: ✅ Exitoso
**Entorno**: mira.hospitaldeovalle.cl (Producción)

---

## Resumen

Se logró crear **14 rutas de navegación** en NocoBase programáticamente usando la API REST, sin necesidad de intervención manual en la interfaz de usuario.

## Problema Inicial

NocoBase tiene dos sistemas separados:
1. **UI Schemas** (`/uiSchemas:*`) - Define la estructura visual de bloques, páginas y componentes
2. **Desktop Routes** (`/desktopRoutes:*`) - Define la navegación/menú de la aplicación

Los scripts existentes solo creaban UI Schemas, que no aparecían en el menú de navegación.

## Solución

Usar la API de **Desktop Routes** para crear la estructura de navegación.

### Endpoint Utilizado

```
POST /desktopRoutes:create
```

### Payload de Ejemplo

```json
{
  "title": "🏥 UGCO Oncología",
  "type": "group",
  "icon": "MedicineBoxOutlined",
  "parentId": null,
  "hideInMenu": false
}
```

### Tipos de Ruta Disponibles

| Tipo | Descripción | Puede tener hijos |
|------|-------------|-------------------|
| `group` | Carpeta/Grupo | ✅ Sí |
| `page` | Página con contenido | ❌ No (solo tabs) |
| `tabs` | Pestañas dentro de página | ❌ No |

## Estructura Creada

```
🏥 UGCO Oncología (group) - ID: 345392373628928
├── 📊 Dashboard (page) - ID: 345392373628930
├── 📁 Especialidades (group) - ID: 345392373628932
│   ├── 🔶 Digestivo Alto (page) - ID: 345392373628934
│   ├── 🟤 Digestivo Bajo (page) - ID: 345392373628936
│   ├── 🩷 Mama (page) - ID: 345392373628938
│   ├── 💜 Ginecología (page) - ID: 345392373628940
│   ├── 💙 Urología (page) - ID: 345392375726081
│   ├── 🫁 Tórax (page) - ID: 345392375726083
│   ├── 💛 Piel (page) - ID: 345392375726085
│   ├── 💚 Endocrinología (page) - ID: 345392375726087
│   └── ❤️ Hematología (page) - ID: 345392375726089
├── 📅 Comités (page) - ID: 345392375726091
├── ✅ Tareas (page) - ID: 345392375726093
└── 📄 Reportes (page) - ID: 345392375726095
```

## Script de Creación

```typescript
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const client = axios.create({
    baseURL: process.env.NOCOBASE_BASE_URL,
    headers: {
        'Authorization': `Bearer ${process.env.NOCOBASE_API_KEY}`,
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Definición de rutas
const routes = [
    { title: '📊 Dashboard', type: 'page', icon: 'BarChartOutlined' },
    { title: '📁 Especialidades', type: 'group', icon: 'FolderOutlined', children: [
        { title: '🔶 Digestivo Alto', type: 'page' },
        { title: '🟤 Digestivo Bajo', type: 'page' },
        { title: '🩷 Mama', type: 'page' },
        { title: '💜 Ginecología', type: 'page' },
        { title: '💙 Urología', type: 'page' },
        { title: '🫁 Tórax', type: 'page' },
        { title: '💛 Piel', type: 'page' },
        { title: '💚 Endocrinología', type: 'page' },
        { title: '❤️ Hematología', type: 'page' },
    ]},
    { title: '📅 Comités', type: 'page', icon: 'CalendarOutlined' },
    { title: '✅ Tareas', type: 'page', icon: 'CheckSquareOutlined' },
    { title: '📄 Reportes', type: 'page', icon: 'FileTextOutlined' },
];

async function createRoute(route: any, parentId: number | null = null) {
    const response = await client.post('/desktopRoutes:create', {
        title: route.title,
        type: route.type,
        icon: route.icon,
        parentId: parentId,
        hideInMenu: false,
    });

    const created = response.data?.data || response.data;
    console.log(`✅ Creada: ${route.title} (ID: ${created.id})`);

    // Crear hijos recursivamente
    if (route.children && created.id) {
        for (const child of route.children) {
            await createRoute(child, created.id);
        }
    }

    return created;
}

async function main() {
    // Crear grupo principal
    const ugcoGroup = await client.post('/desktopRoutes:create', {
        title: '🏥 UGCO Oncología',
        type: 'group',
        icon: 'MedicineBoxOutlined',
        hideInMenu: false,
    });

    const groupId = ugcoGroup.data?.data?.id;

    // Crear subrutas
    for (const route of routes) {
        await createRoute(route, groupId);
    }
}

main();
```

## APIs de Rutas Descubiertas

### Listar Rutas
```
GET /desktopRoutes:list?pageSize=100
```

### Crear Ruta
```
POST /desktopRoutes:create
Body: { title, type, icon, parentId, hideInMenu, schemaUid }
```

### Actualizar Ruta
```
POST /desktopRoutes:update?filterByTk={id}
Body: { title, type, icon, hideInMenu }
```

### Eliminar Ruta
```
POST /desktopRoutes:destroy?filterByTk={id}
```

## Diferencia Clave: Routes vs Schemas

| Aspecto | Desktop Routes | UI Schemas |
|---------|----------------|------------|
| **Propósito** | Navegación/Menú | Contenido visual |
| **API** | `/desktopRoutes:*` | `/uiSchemas:*` |
| **Visible en** | Menú lateral | Dentro de páginas |
| **Tipos** | group, page, tabs | void, array, object |
| **Identificador** | ID numérico | UID string (x-uid) |

## Próximos Pasos

1. ~~**Agregar contenido** a cada página usando el editor visual de NocoBase~~ ✅ Completado
2. ~~**Vincular schemas** existentes a las rutas (campo `schemaUid`)~~ ✅ Completado
3. **Configurar permisos** de acceso por rol
4. ~~**Eliminar** la página UGCO original~~ ✅ Completado

---

## Actualización 2026-01-29: Contenido Agregado

### Acciones Realizadas

1. **Eliminada** página UGCO original (ID: 345232373514240) para evitar duplicación
2. **Creados y vinculados** schemas de contenido para todas las páginas

### Páginas Configuradas

| Página | Schema UID | Contenido |
|--------|------------|-----------|
| 📊 Dashboard | `xikvv7wkefy` | Panel principal con markdown |
| 📅 Comités | `7nzulppifqi` | Gestión de sesiones |
| ✅ Tareas | `drslbwvdzby` | Panel de tareas |
| 📄 Reportes | `kj5musku31w` | Centro de reportes |
| 🔶 Digestivo Alto | `gvwu5oy6x81` | Página con instrucciones para tabla |
| 🟤 Digestivo Bajo | `dveo8ljnh3m` | Página con instrucciones para tabla |
| 🩷 Mama | `gd5bm7y7eeu` | Página con instrucciones para tabla |
| 💜 Ginecología | `rrilka8jvxk` | Página con instrucciones para tabla |
| 💙 Urología | `8233csa73m0` | Página con instrucciones para tabla |
| 🫁 Tórax | `smwp7k0f12b` | Página con instrucciones para tabla |
| 💛 Piel | `1zdi1oxxqwa` | Página con instrucciones para tabla |
| 💚 Endocrinología | `ji5zcgu1sq6` | Página con instrucciones para tabla |
| ❤️ Hematología | `3rjf7ph6m9k` | Página con instrucciones para tabla |

### Script Reutilizable

Se creó `shared/scripts/deploy-routes.ts` para automatizar el deploy de rutas en futuras aplicaciones.

**Uso:**
```bash
npm run nb:routes -- --config Apps/MiApp/routes-config.json
npm run nb:routes -- --config Apps/MiApp/routes-config.json --dry-run
```

**Archivo de configuración ejemplo:** `Apps/_APP_TEMPLATE/routes-config.json`

---

## Notas Importantes

- ~~Las páginas creadas tienen `schemaUid: null` - están vacías~~ → Ahora todas tienen contenido
- El contenido se puede ampliar haciendo clic en "Editar" en cada página
- Los emojis en títulos funcionan correctamente
- La jerarquía se mantiene con `parentId`

## Evidencia

![Rutas creadas en NocoBase](../screenshots/rutas-ugco-creadas-2026-01-29.png)

---

**Conclusión**: Es posible automatizar completamente la creación de estructuras de navegación en NocoBase usando la API REST, lo que permite despliegues programáticos y reproducibles.
