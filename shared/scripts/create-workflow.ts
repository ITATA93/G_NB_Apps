/**
 * create-workflow.ts - Crear workflows COMPLETOS y funcionales en NocoBase
 *
 * Uso:
 *   npx tsx shared/scripts/create-workflow.ts --config workflow.json
 *   npx tsx shared/scripts/create-workflow.ts --type sync --source tabla1 --target tabla2 --mapping "campo1,campo2"
 *
 * Tipos predefinidos:
 *   sync      - Sincronización entre tablas (trigger: on create en origen)
 *   notify    - Notificación al crear registro
 *   validate  - Validación de datos antes de guardar
 */

import { createClient, log, logAction } from './ApiClient.js';
import * as fs from 'fs';

const client = createClient();

function uid(): string {
    return Math.random().toString(36).substring(2, 13);
}

function parseArgs(args: string[]): { flags: Record<string, string>, positional: string[] } {
    const flags: Record<string, string> = {};
    const positional: string[] = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            flags[args[i].slice(2)] = args[i + 1] || '';
            i++;
        } else {
            positional.push(args[i]);
        }
    }
    return { flags, positional };
}

interface WorkflowConfig {
    title: string;
    description?: string;
    type: 'collection' | 'schedule' | 'action';
    trigger: {
        collection?: string;
        mode?: number;  // 1=create, 2=update, 3=delete, 7=all
        cron?: string;  // Para schedule
    };
    nodes: NodeConfig[];
    enabled?: boolean;
}

interface NodeConfig {
    type: 'create' | 'update' | 'destroy' | 'query' | 'condition' | 'calculation' | 'request';
    title: string;
    collection?: string;
    values?: Record<string, string>;  // campo: "{{$context.data.campo}}"
    filter?: Record<string, unknown>;
    config?: Record<string, unknown>;  // Config adicional
}

// Generar assignFormSchema para que las variables funcionen
function generateAssignFormSchema(collection: string, fields: string[]): Record<string, unknown> {
    const schema: Record<string, unknown> = {
        name: uid(),
        type: 'void',
        version: '2.0',
        'x-component': 'Grid',
        'x-initializer': 'assignFieldValuesForm:configureFields',
        '_isJSONSchemaObject': true,
        properties: {}
    };

    for (const field of fields) {
        const rowId = uid();
        const colId = uid();
        schema.properties[rowId] = {
            name: rowId,
            type: 'void',
            version: '2.0',
            'x-component': 'Grid.Row',
            '_isJSONSchemaObject': true,
            properties: {
                [colId]: {
                    name: colId,
                    type: 'void',
                    version: '2.0',
                    'x-component': 'Grid.Col',
                    '_isJSONSchemaObject': true,
                    properties: {
                        [field]: {
                            name: field,
                            type: 'string',
                            version: '2.0',
                            'x-toolbar': 'FormItemSchemaToolbar',
                            'x-settings': 'fieldSettings:FormItem',
                            'x-component': 'AssignedField',
                            'x-decorator': 'FormItem',
                            'x-collection-field': `${collection}.${field}`,
                            '_isJSONSchemaObject': true
                        }
                    }
                }
            }
        };
    }

    return schema;
}

async function createWorkflow(config: WorkflowConfig): Promise<number> {
    log(`\n=== CREANDO WORKFLOW: ${config.title} ===\n`, 'cyan');

    // 1. Crear workflow base
    log('1. Creando workflow base...', 'gray');
    const wfData: Record<string, unknown> = {
        title: config.title,
        type: config.type,
        enabled: false,
        description: config.description || ''
    };

    if (config.type === 'collection') {
        wfData.config = {
            collection: config.trigger.collection,
            mode: config.trigger.mode || 1,
            changed: []
        };
    } else if (config.type === 'schedule') {
        wfData.config = {
            cron: config.trigger.cron || '0 */5 * * * *',
            mode: 0
        };
    }

    const wfResponse = await client.post('/workflows:create', wfData);
    const workflowId = wfResponse.data.id;
    log(`   Workflow ID: ${workflowId}`, 'green');

    // 2. Crear nodos
    let previousNodeId: number | null = null;
    const createdNodes: number[] = [];

    for (let i = 0; i < config.nodes.length; i++) {
        const nodeConfig = config.nodes[i];
        log(`2.${i + 1}. Creando nodo: ${nodeConfig.title}...`, 'gray');

        const nodeKey = uid();
        const nodeData: Record<string, unknown> = {
            workflowId: workflowId,
            key: nodeKey,
            type: nodeConfig.type,
            title: nodeConfig.title
        };

        if (previousNodeId) {
            nodeData.upstreamId = previousNodeId;
        }

        // Configurar según tipo de nodo
        if (nodeConfig.type === 'create' || nodeConfig.type === 'update') {
            const fields = Object.keys(nodeConfig.values || {});

            nodeData.config = {
                collection: nodeConfig.collection,
                params: {
                    values: nodeConfig.values || {},
                    individualHooks: false
                },
                assignFormSchema: generateAssignFormSchema(nodeConfig.collection!, fields),
                usingAssignFormSchema: true
            };

            if (nodeConfig.type === 'update' && nodeConfig.filter) {
                // Convertir filtro simple a formato NocoBase con $and
                const filterEntries = Object.entries(nodeConfig.filter);
                if (filterEntries.length > 0) {
                    nodeData.config.params.filter = {
                        $and: filterEntries.map(([key, value]) => ({
                            [key]: { $eq: value }
                        }))
                    };
                }
            }
        } else if (nodeConfig.type === 'query') {
            nodeData.config = {
                collection: nodeConfig.collection,
                params: {
                    filter: nodeConfig.filter || {},
                    appends: [],
                    pageSize: nodeConfig.config?.pageSize || 20
                }
            };
        } else if (nodeConfig.type === 'condition') {
            nodeData.config = {
                calculation: nodeConfig.config?.calculation || 'true',
                rejectOnFalse: nodeConfig.config?.rejectOnFalse || false
            };
        } else if (nodeConfig.config) {
            nodeData.config = nodeConfig.config;
        }

        const nodeResponse = await client.post('/flow_nodes:create', nodeData);
        const currentNodeId = nodeResponse.data.id;
        createdNodes.push(currentNodeId);

        // IMPORTANTE: Actualizar el nodo anterior para establecer downstreamId
        if (previousNodeId) {
            log(`   Enlazando nodo ${previousNodeId} → ${currentNodeId}...`, 'gray');
            await client.post(`/flow_nodes:update?filterByTk=${previousNodeId}`, {
                downstreamId: currentNodeId
            });
        }

        previousNodeId = currentNodeId;
        log(`   Nodo ID: ${currentNodeId} (key: ${nodeKey})`, 'green');
    }

    // 3. Habilitar si está configurado
    if (config.enabled !== false) {
        log('3. Habilitando workflow...', 'gray');
        await client.post(`/workflows:update?filterByTk=${workflowId}`, {
            enabled: true
        });
        log('   Workflow habilitado', 'green');
    }

    log(`\n✅ Workflow "${config.title}" creado exitosamente`, 'green');
    log(`   ID: ${workflowId}`, 'white');

    logAction('WORKFLOW_CREATED', {
        workflowId,
        title: config.title,
        type: config.type,
        nodes: config.nodes.length
    });

    return workflowId;
}

// Crear workflow de sincronización predefinido
async function createSyncWorkflow(source: string, target: string, mapping: string, syncField: string = 'sincronizado') {
    const fields = mapping.split(',').map(f => f.trim());
    const fieldMapping: Record<string, string> = {};

    for (const f of fields) {
        const [src, dst] = f.includes(':') ? f.split(':') : [f, f];
        fieldMapping[dst.trim()] = `{{$context.data.${src.trim()}}}`;
    }

    // Agregar campo de fecha de sync
    fieldMapping['fecha_sync'] = '{{$system.now}}';

    const config: WorkflowConfig = {
        title: `Sync: ${source} → ${target}`,
        description: `Sincroniza registros de ${source} a ${target} al crear`,
        type: 'collection',
        trigger: {
            collection: source,
            mode: 1  // on create
        },
        nodes: [
            {
                type: 'create',
                title: `Crear en ${target}`,
                collection: target,
                values: fieldMapping
            },
            {
                type: 'update',
                title: 'Marcar sincronizado',
                collection: source,
                filter: {
                    id: '{{$context.data.id}}'
                },
                values: {
                    [syncField]: 'true'
                }
            }
        ],
        enabled: true
    };

    return createWorkflow(config);
}

// Crear workflow de notificación
async function createNotifyWorkflow(collection: string, notificationCollection: string, titleField: string) {
    const config: WorkflowConfig = {
        title: `Notificar: Nuevo en ${collection}`,
        description: `Crea notificación cuando se agrega registro en ${collection}`,
        type: 'collection',
        trigger: {
            collection: collection,
            mode: 1
        },
        nodes: [
            {
                type: 'create',
                title: 'Crear notificación',
                collection: notificationCollection,
                values: {
                    title: `{{$context.data.${titleField}}}`,
                    message: `Nuevo registro creado en ${collection}`,
                    read: 'false',
                    createdAt: '{{$system.now}}'
                }
            }
        ],
        enabled: true
    };

    return createWorkflow(config);
}

async function main() {
    const { flags } = parseArgs(process.argv.slice(2));

    if (flags.config) {
        // Cargar desde archivo JSON
        if (!fs.existsSync(flags.config)) {
            log(`❌ Archivo no encontrado: ${flags.config}`, 'red');
            process.exit(1);
        }
        const config = JSON.parse(fs.readFileSync(flags.config, 'utf-8'));
        await createWorkflow(config);
        return;
    }

    if (flags.type === 'sync') {
        if (!flags.source || !flags.target || !flags.mapping) {
            log('❌ Para sync se requiere: --source, --target, --mapping', 'red');
            process.exit(1);
        }
        await createSyncWorkflow(flags.source, flags.target, flags.mapping, flags.syncField || 'sincronizado');
        return;
    }

    if (flags.type === 'notify') {
        if (!flags.collection || !flags.notifyCollection || !flags.titleField) {
            log('❌ Para notify se requiere: --collection, --notifyCollection, --titleField', 'red');
            process.exit(1);
        }
        await createNotifyWorkflow(flags.collection, flags.notifyCollection, flags.titleField);
        return;
    }

    // Mostrar ayuda
    log('Uso: create-workflow.ts [opciones]\n', 'cyan');
    log('Opciones:', 'white');
    log('  --config <file.json>     Crear desde archivo de configuración', 'gray');
    log('  --type sync              Crear workflow de sincronización', 'gray');
    log('  --type notify            Crear workflow de notificación', 'gray');
    log('\nPara sync:', 'white');
    log('  --source <colección>     Colección origen', 'gray');
    log('  --target <colección>     Colección destino', 'gray');
    log('  --mapping "c1,c2,c3"     Campos a sincronizar', 'gray');
    log('  --syncField <campo>      Campo para marcar sync (default: sincronizado)', 'gray');
    log('\nPara notify:', 'white');
    log('  --collection <col>       Colección a observar', 'gray');
    log('  --notifyCollection <col> Colección de notificaciones', 'gray');
    log('  --titleField <campo>     Campo para título de notificación', 'gray');
    log('\nEjemplo JSON:', 'white');
    log(`{
  "title": "Mi Workflow",
  "type": "collection",
  "trigger": { "collection": "mi_tabla", "mode": 1 },
  "nodes": [
    {
      "type": "create",
      "title": "Crear registro",
      "collection": "otra_tabla",
      "values": {
        "campo1": "{{$context.data.campo_origen}}",
        "campo2": "{{$context.data.otro_campo}}"
      }
    }
  ]
}`, 'gray');
}

main().catch(err => {
    log(`\n❌ Error: ${(err instanceof Error ? err.message : String(err))}`, 'red');
    process.exit(1);
});
