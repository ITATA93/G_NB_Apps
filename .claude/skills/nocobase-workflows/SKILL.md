---
name: nocobase-workflows
description: Gestionar workflows (automatizaciones) en NocoBase. Listar, habilitar, deshabilitar, ejecutar y monitorear workflows.
argument-hint: <command> [id] [options]
disable-model-invocation: false
allowed-tools: Bash(npx tsx:*), Read
---

# Gestión de Workflows en NocoBase

Administra workflows (automatizaciones) en NocoBase via API.

## Scripts Disponibles

```bash
# Gestión de workflows existentes
npx tsx shared/scripts/manage-workflows.ts <comando> [opciones]

# Crear workflows completos via API
npx tsx shared/scripts/create-workflow.ts [opciones]
```

## Comandos Disponibles

### Listar workflows

```bash
# Todos los workflows
npx tsx shared/scripts/manage-workflows.ts list

# Solo habilitados
npx tsx shared/scripts/manage-workflows.ts list --enabled true

# Solo deshabilitados
npx tsx shared/scripts/manage-workflows.ts list --enabled false
```

### Ver detalle de un workflow

```bash
npx tsx shared/scripts/manage-workflows.ts get <workflowId>
```

### Ver nodos de un workflow

```bash
npx tsx shared/scripts/manage-workflows.ts nodes <workflowId>
```

### Habilitar/Deshabilitar

```bash
# Habilitar
npx tsx shared/scripts/manage-workflows.ts enable <workflowId>

# Deshabilitar
npx tsx shared/scripts/manage-workflows.ts disable <workflowId>
```

### Ejecutar manualmente

```bash
npx tsx shared/scripts/manage-workflows.ts trigger <workflowId>
```

### Ver ejecuciones

```bash
# Últimas 10 ejecuciones
npx tsx shared/scripts/manage-workflows.ts executions <workflowId>

# Últimas 50 ejecuciones
npx tsx shared/scripts/manage-workflows.ts executions <workflowId> --limit 50
```

### Eliminar workflow

```bash
npx tsx shared/scripts/manage-workflows.ts delete <workflowId>
```

## Crear Workflows Completos via API

### Workflow de Sincronización

```bash
# Sincroniza tabla origen → destino al crear registros
npx tsx shared/scripts/create-workflow.ts --type sync \
  --source tabla_origen \
  --target tabla_destino \
  --mapping "campo1,campo2,campo3"

# Con campo de sync personalizado
npx tsx shared/scripts/create-workflow.ts --type sync \
  --source pacientes \
  --target pacientes_backup \
  --mapping "nombre,dni,email" \
  --syncField "respaldado"
```

### Workflow de Notificación

```bash
npx tsx shared/scripts/create-workflow.ts --type notify \
  --collection pedidos \
  --notifyCollection alertas \
  --titleField codigo_pedido
```

### Workflow desde JSON

```bash
npx tsx shared/scripts/create-workflow.ts --config mi-workflow.json
```

**Ejemplo de JSON:**
```json
{
  "title": "Mi Workflow Personalizado",
  "type": "collection",
  "trigger": {
    "collection": "mi_tabla",
    "mode": 1
  },
  "nodes": [
    {
      "type": "create",
      "title": "Crear registro",
      "collection": "otra_tabla",
      "values": {
        "campo1": "{{$context.data.campo_origen}}",
        "fecha": "{{$system.now}}"
      }
    },
    {
      "type": "update",
      "title": "Actualizar origen",
      "collection": "mi_tabla",
      "filter": { "id": "{{$context.data.id}}" },
      "values": { "procesado": "true" }
    }
  ]
}

## Tipos de Workflows

| Tipo | Descripción | Trigger |
|------|-------------|---------|
| `collection` | Evento de colección | create, update, delete de registros |
| `schedule` | Programado | Cron expression |
| `action` | Acción manual | Botón en la UI |
| `form` | Formulario | Submit de formulario |

### Modos de Trigger (collection)

| Mode | Descripción | Ejemplo |
|------|-------------|---------|
| 1 | On Create | Se ejecuta al crear registro |
| 2 | On Update | Se ejecuta al actualizar registro |
| 3 | On Delete | Se ejecuta al eliminar registro |
| 7 | Todos | Create + Update + Delete |

### Ejemplo: Workflow Schedule (Cron)

```json
{
  "title": "Backup cada hora",
  "type": "schedule",
  "trigger": {
    "cron": "0 0 * * * *"
  },
  "nodes": [...]
}
```

### Ejemplo: Workflow Update Trigger

```json
{
  "title": "Log cambios",
  "type": "collection",
  "trigger": {
    "collection": "mi_tabla",
    "mode": 2
  },
  "nodes": [...]
}

## Estados de Ejecución

| Código | Estado | Icono |
|--------|--------|-------|
| 0 | Pendiente | ⏳ |
| 1 | Completado | ✅ |
| -1 | Fallido | ❌ |
| -2 | Cancelado | 🚫 |

## API Endpoints

| Operación | Endpoint |
|-----------|----------|
| Listar | `GET /workflows:list` |
| Obtener | `GET /workflows:get` |
| Actualizar | `POST /workflows:update` |
| Ejecutar | `POST /workflows/{id}:trigger` |
| Eliminar | `POST /workflows:destroy` |
| Listar nodos | `GET /flow_nodes:list` |
| Ejecuciones | `GET /executions:list` |

## Crear Workflow via API

```typescript
import { createClient } from './ApiClient';
const client = createClient();

// Crear workflow de tipo collection (trigger en create)
const workflow = await client.post('/workflows:create', {
    title: 'Notificar nuevo caso',
    type: 'collection',
    enabled: false,
    config: {
        collection: 'onco_casos',
        mode: 1,  // 1=create, 2=update, 3=delete
        changed: []
    }
});

// Agregar nodo de acción
await client.post('/flow_nodes:create', {
    workflowId: workflow.data.id,
    type: 'create',  // tipo de nodo
    title: 'Crear notificación',
    config: {
        collection: 'notifications',
        params: {
            values: {
                title: 'Nuevo caso creado',
                content: '{{$context.data.diagnostico_principal}}'
            }
        }
    }
});

// Habilitar workflow
await client.post('/workflows:update', {
    filterByTk: workflow.data.id,
    enabled: true
});
```

## Tipos de Nodos

| Tipo | Descripción |
|------|-------------|
| `condition` | Condicional (if/else) |
| `create` | Crear registro |
| `update` | Actualizar registro |
| `destroy` | Eliminar registro |
| `query` | Consultar registros |
| `request` | HTTP Request |
| `calculation` | Cálculo/expresión |
| `parallel` | Ejecución paralela |
| `delay` | Esperar tiempo |
| `manual` | Acción manual |

## Ejemplo: Workflow de Notificación

```typescript
// 1. Crear workflow
const wf = await client.post('/workflows:create', {
    title: 'Notificar caso oncológico',
    type: 'collection',
    enabled: false,
    config: {
        collection: 'onco_casos',
        mode: 1,  // on create
        changed: []
    }
});

// 2. Nodo: Verificar condición
const conditionNode = await client.post('/flow_nodes:create', {
    workflowId: wf.data.id,
    type: 'condition',
    title: 'Es caso urgente?',
    config: {
        calculation: '{{$context.data.prioridad}} === "urgente"'
    }
});

// 3. Nodo: Crear notificación (branch true)
await client.post('/flow_nodes:create', {
    workflowId: wf.data.id,
    upstreamId: conditionNode.data.id,
    branchIndex: 0,  // true branch
    type: 'create',
    title: 'Crear alerta',
    config: {
        collection: 'alerts',
        params: {
            values: {
                type: 'urgente',
                message: 'Caso urgente: {{$context.data.codigo}}'
            }
        }
    }
});

// 4. Habilitar
await client.post('/workflows:update', {
    filterByTk: wf.data.id,
    enabled: true
});
```

## Variables en Workflows

| Variable | Descripción |
|----------|-------------|
| `$context.data` | Datos del trigger |
| `$context.user` | Usuario actual |
| `$jobsMapByNodeId` | Resultados de nodos anteriores |
| `$system.now` | Fecha/hora actual |

## Notas Técnicas Importantes

### Enlazar Nodos Correctamente

Al crear nodos via API, **debes actualizar manualmente el `downstreamId`** del nodo anterior:

```typescript
// 1. Crear primer nodo
const node1 = await client.post('/flow_nodes:create', {
    workflowId: wfId,
    type: 'create',
    title: 'Nodo 1',
    config: { ... }
});

// 2. Crear segundo nodo con upstreamId
const node2 = await client.post('/flow_nodes:create', {
    workflowId: wfId,
    upstreamId: node1.data.id,  // ← enlace hacia arriba
    type: 'update',
    title: 'Nodo 2',
    config: { ... }
});

// 3. IMPORTANTE: Actualizar downstreamId del nodo anterior
await client.post(`/flow_nodes:update?filterByTk=${node1.data.id}`, {
    downstreamId: node2.data.id  // ← enlace hacia abajo
});
```

Sin este paso, solo se ejecutará el primer nodo.

### Variables requieren assignFormSchema

Para que las variables `{{$context.data.campo}}` funcionen, los nodos de tipo create/update necesitan `assignFormSchema`:

```typescript
config: {
    collection: 'mi_tabla',
    params: {
        values: { campo: '{{$context.data.valor}}' }
    },
    assignFormSchema: { /* schema del formulario */ },
    usingAssignFormSchema: true
}
```

El script `create-workflow.ts` genera esto automáticamente.

## Limitaciones Conocidas

### Nodos Condition
Los nodos de tipo `condition` tienen limitaciones al crearse via API:
- El calculator `notEmpty` no está registrado en todas las versiones
- Las comparaciones con `null` pueden no funcionar como se espera
- **Recomendación**: Crear condiciones complejas desde la UI de NocoBase

### Nodos Soportados via API
Los siguientes tipos de nodos funcionan correctamente via API:
- ✅ `create` - Crear registros (con assignFormSchema)
- ✅ `update` - Actualizar registros (con filtro en formato $and)
- ✅ `query` - Consultar registros (solo datasource main)
- ✅ `request` - HTTP requests a APIs externas
- ⚠️ `condition` - Limitado (ver arriba)
- ❓ `calculation` - Cálculos (no probado)

### Nodo HTTP Request

Permite llamar APIs externas y usar los datos en nodos posteriores:

```typescript
// 1. Crear nodo HTTP con key fija
const httpNode = await client.post('/flow_nodes:create', {
    workflowId: wfId,
    key: 'http_api_call',  // key para referenciar
    type: 'request',
    title: 'Llamar API',
    config: {
        url: 'https://api.ejemplo.com/datos',
        method: 'GET',  // GET, POST, PUT, DELETE
        headers: [
            { name: 'Authorization', value: 'Bearer token' }
        ],
        timeout: 5000
    }
});

// 2. Usar respuesta en siguiente nodo
const createNode = await client.post('/flow_nodes:create', {
    workflowId: wfId,
    upstreamId: httpNode.data.id,
    type: 'create',
    title: 'Guardar datos',
    config: {
        collection: 'mi_tabla',
        params: {
            values: {
                // Referenciar datos de la respuesta HTTP
                nombre: '{{$jobsMapByNodeKey.http_api_call.data.name}}',
                email: '{{$jobsMapByNodeKey.http_api_call.data.email}}'
            }
        }
    }
});
```

### Consultas a Bases de Datos Externas

- ⚠️ El nodo `query` solo funciona con el datasource principal (`main`)
- Para consultar BD externas, usar nodo `request` llamando a una API
- Los datasources externos (SQL Server, PostgreSQL, etc.) se pueden leer pero no desde workflows directamente

## Notas Generales

- Los workflows de tipo `collection` se ejecutan automáticamente
- Los workflows de tipo `schedule` usan cron expressions
- Deshabilitá workflows antes de modificarlos
- Las ejecuciones fallidas se pueden revisar en logs

## Variables de Entorno

- `NOCOBASE_BASE_URL`: URL de la API
- `NOCOBASE_API_KEY`: Token de autenticación
