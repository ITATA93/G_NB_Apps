---
name: nocobase-ui-blocks
description: Gestionar bloques de UI en páginas NocoBase. Agregar tablas, formularios, detalles y otros bloques a páginas existentes.
argument-hint: <command> <pageId> [options]
disable-model-invocation: false
allowed-tools: Bash(npx tsx:*), Read, Write
---

# Gestión de Bloques UI en NocoBase

Agrega bloques (tablas, formularios, detalles) a páginas existentes de NocoBase.

## Comandos Disponibles

### Ver estructura de una página

```bash
# Obtener el schemaUid de una página
npx tsx shared/scripts/manage-ui.ts schema <pageSchemaUid>

# Ver árbol de bloques
npx tsx shared/scripts/manage-ui.ts tree <pageSchemaUid>
```

### Listar templates de bloques

```bash
npx tsx shared/scripts/manage-ui.ts templates
```

### Exportar/Importar schemas

```bash
# Exportar bloque existente como template
npx tsx shared/scripts/manage-ui.ts export <blockUid> --file bloque.json

# Importar bloque a una página
npx tsx shared/scripts/manage-ui.ts import --file bloque.json --parent <gridUid>
```

## Agregar Bloques via API

### Estructura de una Página

```
Page (schemaUid de la ruta)
└── Grid (contenedor de bloques)
    └── Grid.Row
        └── Grid.Col
            └── CardItem
                └── TableBlockProvider / FormBlockProvider / etc.
```

### Agregar Bloque de Tabla

```typescript
import { createClient } from './ApiClient';
const client = createClient();

// 1. Obtener el Grid de la página
const pageSchema = await client.get(`/uiSchemas:getJsonSchema/${pageSchemaUid}`);
const gridUid = Object.values(pageSchema.data.properties)[0]['x-uid'];

// 2. Crear el bloque de tabla
const tableBlock = {
    type: 'void',
    'x-component': 'Grid.Row',
    'x-uid': generateUid(),
    properties: {
        [generateUid()]: {
            type: 'void',
            'x-component': 'Grid.Col',
            properties: {
                [generateUid()]: {
                    type: 'void',
                    'x-decorator': 'TableBlockProvider',
                    'x-decorator-props': {
                        collection: 'mi_coleccion',
                        resource: 'mi_coleccion',
                        action: 'list',
                        params: {
                            pageSize: 20
                        }
                    },
                    'x-component': 'CardItem',
                    properties: {
                        actions: {
                            type: 'void',
                            'x-component': 'ActionBar',
                            'x-component-props': {
                                style: { marginBottom: 16 }
                            }
                        },
                        table: {
                            type: 'array',
                            'x-component': 'TableV2',
                            'x-component-props': {
                                rowKey: 'id',
                                rowSelection: { type: 'checkbox' }
                            }
                        }
                    }
                }
            }
        }
    }
};

// 3. Insertar el bloque
await client.post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, {
    schema: tableBlock
});
```

### Agregar Bloque de Formulario

```typescript
const formBlock = {
    type: 'void',
    'x-component': 'Grid.Row',
    properties: {
        col: {
            type: 'void',
            'x-component': 'Grid.Col',
            properties: {
                form: {
                    type: 'void',
                    'x-decorator': 'FormBlockProvider',
                    'x-decorator-props': {
                        collection: 'mi_coleccion',
                        resource: 'mi_coleccion'
                    },
                    'x-component': 'CardItem',
                    properties: {
                        form: {
                            type: 'void',
                            'x-component': 'FormV2',
                            properties: {
                                // campos del formulario se agregan aquí
                            }
                        },
                        actions: {
                            type: 'void',
                            'x-component': 'ActionBar',
                            properties: {
                                submit: {
                                    type: 'void',
                                    'x-component': 'Action',
                                    'x-component-props': {
                                        type: 'primary',
                                        useAction: '{{ useCreateActionProps }}'
                                    },
                                    title: 'Guardar'
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
```

### Agregar Bloque de Detalles

```typescript
const detailsBlock = {
    type: 'void',
    'x-component': 'Grid.Row',
    properties: {
        col: {
            type: 'void',
            'x-component': 'Grid.Col',
            properties: {
                details: {
                    type: 'void',
                    'x-decorator': 'DetailsBlockProvider',
                    'x-decorator-props': {
                        collection: 'mi_coleccion',
                        resource: 'mi_coleccion',
                        action: 'get'
                    },
                    'x-component': 'CardItem',
                    properties: {
                        details: {
                            type: 'void',
                            'x-component': 'Details',
                            properties: {}
                        }
                    }
                }
            }
        }
    }
};
```

## Tipos de Bloques Disponibles

| Tipo | Decorator | Componente | Uso |
|------|-----------|------------|-----|
| Tabla | TableBlockProvider | TableV2 | Listado de registros |
| Formulario | FormBlockProvider | FormV2 | Crear/Editar registros |
| Detalles | DetailsBlockProvider | Details | Ver un registro |
| Calendario | CalendarBlockProvider | Calendar | Vista calendario |
| Kanban | KanbanBlockProvider | Kanban | Vista kanban |
| Lista | ListBlockProvider | List | Lista simple |
| Grid Card | GridCardBlockProvider | GridCard | Cards en grid |

## Posiciones de Inserción

| Posición | Descripción |
|----------|-------------|
| `beforeEnd` | Al final del contenedor (más común) |
| `afterBegin` | Al inicio del contenedor |
| `beforeBegin` | Antes del elemento referenciado |
| `afterEnd` | Después del elemento referenciado |

## Flujo Recomendado

1. **Crear página** con `/nocobase-page-create`
2. **Obtener Grid UID** de la página creada
3. **Diseñar bloque** con la estructura JSON
4. **Insertar bloque** con `uiSchemas:insertAdjacent`
5. **Agregar campos** al bloque si es necesario

## Ejemplo: Script Completo

```typescript
import { createClient, log, logAction } from '../../shared/scripts/ApiClient.js';

const client = createClient();

function uid() {
    return Math.random().toString(36).substring(2, 13);
}

async function addTableBlock(pageId: number, collectionName: string) {
    // 1. Obtener info de la página
    const route = await client.get('/desktopRoutes:get', { filterByTk: pageId });
    const pageSchemaUid = route.data.schemaUid;

    // 2. Obtener el Grid
    const pageSchema = await client.get(`/uiSchemas:getJsonSchema/${pageSchemaUid}`);
    const gridKey = Object.keys(pageSchema.data.properties)[0];
    const gridUid = pageSchema.data.properties[gridKey]['x-uid'];

    log(`Page Schema: ${pageSchemaUid}`, 'gray');
    log(`Grid UID: ${gridUid}`, 'gray');

    // 3. Crear bloque de tabla
    const rowUid = uid();
    const colUid = uid();
    const cardUid = uid();

    const tableBlock = {
        type: 'void',
        'x-component': 'Grid.Row',
        'x-uid': rowUid,
        properties: {
            [colUid]: {
                type: 'void',
                'x-component': 'Grid.Col',
                'x-uid': colUid,
                properties: {
                    [cardUid]: {
                        type: 'void',
                        'x-decorator': 'TableBlockProvider',
                        'x-decorator-props': {
                            collection: collectionName,
                            resource: collectionName,
                            action: 'list',
                            params: { pageSize: 20 }
                        },
                        'x-component': 'CardItem',
                        'x-uid': cardUid,
                        properties: {
                            actions: {
                                type: 'void',
                                'x-component': 'ActionBar',
                                'x-component-props': { style: { marginBottom: 16 } }
                            },
                            table: {
                                type: 'array',
                                'x-component': 'TableV2',
                                'x-component-props': {
                                    rowKey: 'id',
                                    rowSelection: { type: 'checkbox' }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    // 4. Insertar el bloque
    await client.post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, {
        schema: tableBlock
    });

    log(`Bloque de tabla agregado para colección: ${collectionName}`, 'green');
    logAction('BLOCK_ADDED', { pageId, collectionName, type: 'table' });
}

// Uso
addTableBlock(345419886166016, 'onco_casos');
```

## Notas Importantes

- Los UIDs deben ser únicos en todo el sistema
- El Grid debe existir antes de agregar bloques
- Los bloques se renderizan según su orden en properties
- Para agregar campos a una tabla, hay que modificar el schema del bloque

## Variables de Entorno

- `NOCOBASE_BASE_URL`: URL de la API
- `NOCOBASE_API_KEY`: Token de autenticación
