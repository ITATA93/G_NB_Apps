---
name: nocobase-permissions
description: Gestionar permisos y roles ACL en NocoBase. Listar roles, configurar estrategias, otorgar/revocar permisos por colección.
argument-hint: <command> [role] [options]
disable-model-invocation: false
allowed-tools: Bash(npx tsx:*), Read
---

# Gestión de Permisos ACL en NocoBase

Administra roles y permisos de acceso a colecciones via API.

## Script Principal

```bash
npx tsx shared/scripts/manage-permissions.ts <comando> [opciones]
```

## Comandos Disponibles

### Listar roles

```bash
npx tsx shared/scripts/manage-permissions.ts list-roles
```

### Ver estrategia de un rol

```bash
npx tsx shared/scripts/manage-permissions.ts strategy <roleName>
```

### Configurar estrategia de un rol

```bash
# Dar acceso completo
npx tsx shared/scripts/manage-permissions.ts set-strategy <role> --actions view,create,update,delete

# Solo lectura
npx tsx shared/scripts/manage-permissions.ts set-strategy <role> --actions view

# Lectura y exportación
npx tsx shared/scripts/manage-permissions.ts set-strategy <role> --actions view,export
```

### Ver permisos por recurso

```bash
npx tsx shared/scripts/manage-permissions.ts resources <roleName>
```

### Otorgar permisos en colección

```bash
# Permiso de ver
npx tsx shared/scripts/manage-permissions.ts grant <role> <collection> --actions view

# Permisos completos
npx tsx shared/scripts/manage-permissions.ts grant <role> <collection> --actions view,create,update,delete

# Permisos con campos específicos
npx tsx shared/scripts/manage-permissions.ts grant <role> <collection> --actions view --fields nombre,email,telefono
```

### Revocar permisos

```bash
npx tsx shared/scripts/manage-permissions.ts revoke <role> <collection>
```

### Verificar permiso específico

```bash
npx tsx shared/scripts/manage-permissions.ts check <role> <collection> <action>

# Ejemplo
npx tsx shared/scripts/manage-permissions.ts check member onco_casos view
```

### Auditoría de permisos

```bash
npx tsx shared/scripts/manage-permissions.ts audit
```

## Acciones Disponibles

| Acción | Descripción |
|--------|-------------|
| `view` | Ver registros |
| `create` | Crear registros |
| `update` | Actualizar registros |
| `delete` | Eliminar registros |
| `export` | Exportar datos |
| `importXlsx` | Importar desde Excel |

## Modificadores de Scope

| Modificador | Descripción |
|-------------|-------------|
| `:own` | Solo registros propios (ej: `view:own`) |
| Sin modificador | Todos los registros |

## Roles del Sistema

| Rol | Descripción | Permisos típicos |
|-----|-------------|------------------|
| `root` | Super administrador | Todos |
| `admin` | Administrador | CRUD completo |
| `member` | Usuario estándar | Generalmente `view:own` |

## API Endpoints

| Operación | Endpoint |
|-----------|----------|
| Listar roles | `GET /roles:list` |
| Obtener rol | `GET /roles:get` |
| Actualizar rol | `POST /roles:update` |
| Recursos del rol | `GET /roles/{role}` con `appends: ['resources']` |
| Crear recurso | `POST /roles/{role}/resources:create` |
| Actualizar recurso | `POST /roles/{role}/resources:update` |

## Ejemplo: Crear Rol con Permisos

```typescript
import { createClient } from './ApiClient';
const client = createClient();

// 1. Crear rol
await client.post('/roles:create', {
    name: 'oncologist',
    title: 'Oncólogo',
    allowNewMenu: true,
    strategy: {
        actions: ['view']  // estrategia base: solo ver
    }
});

// 2. Otorgar permisos específicos en colección
await client.post('/roles/oncologist/resources:create', {
    name: 'onco_casos',
    usingActionsConfig: true,
    actions: [
        { name: 'view' },
        { name: 'create' },
        { name: 'update', fields: ['estado', 'observaciones'] }  // solo puede editar estos campos
    ]
});

// 3. Permisos de solo lectura en otra colección
await client.post('/roles/oncologist/resources:create', {
    name: 'pacientes',
    usingActionsConfig: true,
    actions: [
        { name: 'view' }
    ]
});
```

## Ejemplo: Permisos con Scope

```typescript
// Solo puede ver sus propios registros
await client.post('/roles/member/resources:create', {
    name: 'mis_tareas',
    usingActionsConfig: true,
    actions: [
        {
            name: 'view',
            scope: {
                createdById: '{{ ctx.state.currentUser.id }}'
            }
        },
        {
            name: 'update',
            scope: {
                createdById: '{{ ctx.state.currentUser.id }}'
            }
        }
    ]
});
```

## Estructura de Permisos

```
Rol
├── strategy (permisos globales por defecto)
│   └── actions: ['view', 'create', ...]
│
└── resources (permisos específicos por colección)
    └── collection_name
        ├── usingActionsConfig: true
        └── actions[]
            ├── name: 'view'
            ├── fields: ['campo1', 'campo2']  (opcional)
            └── scope: { filtro }  (opcional)
```

## Notas Importantes

- La **estrategia** del rol define permisos por defecto
- Los **recursos** definen permisos específicos que sobreescriben la estrategia
- `usingActionsConfig: true` activa la configuración de acciones
- Los campos vacíos (`fields: []`) significa acceso a todos los campos
- El scope permite filtrar registros (ej: solo propios)

## Variables de Entorno

- `NOCOBASE_BASE_URL`: URL de la API
- `NOCOBASE_API_KEY`: Token de autenticación
