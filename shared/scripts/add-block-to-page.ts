/**
 * add-block-to-page.ts - Agregar bloques a páginas NocoBase via API
 *
 * Uso:
 *   npx tsx shared/scripts/add-block-to-page.ts <pageId> <collection> [--type table|form|details]
 *
 * Ejemplos:
 *   npx tsx shared/scripts/add-block-to-page.ts 345419886166016 onco_casos
 *   npx tsx shared/scripts/add-block-to-page.ts 345419886166016 onco_casos --type form
 */

import { createClient, log, logAction } from './ApiClient';

const client = createClient();

function uid() {
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

function createTableBlock(collectionName: string): Record<string, unknown> {
    const rowUid = uid();
    const colUid = uid();
    const cardUid = uid();
    const actionsUid = uid();
    const tableUid = uid();

    return {
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
                            [actionsUid]: {
                                type: 'void',
                                'x-component': 'ActionBar',
                                'x-uid': actionsUid,
                                'x-component-props': { style: { marginBottom: 16 } },
                                properties: {}
                            },
                            [tableUid]: {
                                type: 'array',
                                'x-component': 'TableV2',
                                'x-uid': tableUid,
                                'x-component-props': {
                                    rowKey: 'id',
                                    rowSelection: { type: 'checkbox' }
                                },
                                properties: {}
                            }
                        }
                    }
                }
            }
        }
    };
}

function createFormBlock(collectionName: string): Record<string, unknown> {
    const rowUid = uid();
    const colUid = uid();
    const cardUid = uid();
    const formUid = uid();
    const actionsUid = uid();

    return {
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
                        'x-decorator': 'FormBlockProvider',
                        'x-decorator-props': {
                            collection: collectionName,
                            resource: collectionName
                        },
                        'x-component': 'CardItem',
                        'x-uid': cardUid,
                        properties: {
                            [formUid]: {
                                type: 'void',
                                'x-component': 'FormV2',
                                'x-uid': formUid,
                                properties: {}
                            },
                            [actionsUid]: {
                                type: 'void',
                                'x-component': 'ActionBar',
                                'x-uid': actionsUid,
                                properties: {}
                            }
                        }
                    }
                }
            }
        }
    };
}

function createDetailsBlock(collectionName: string): Record<string, unknown> {
    const rowUid = uid();
    const colUid = uid();
    const cardUid = uid();
    const detailsUid = uid();

    return {
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
                        'x-decorator': 'DetailsBlockProvider',
                        'x-decorator-props': {
                            collection: collectionName,
                            resource: collectionName,
                            action: 'get'
                        },
                        'x-component': 'CardItem',
                        'x-uid': cardUid,
                        properties: {
                            [detailsUid]: {
                                type: 'void',
                                'x-component': 'Details',
                                'x-uid': detailsUid,
                                properties: {}
                            }
                        }
                    }
                }
            }
        }
    };
}

async function addBlockToPage(pageId: number, collectionName: string, blockType: string = 'table') {
    log(`=== AGREGANDO BLOQUE A PÁGINA ===\n`, 'cyan');
    log(`Page ID: ${pageId}`, 'white');
    log(`Colección: ${collectionName}`, 'white');
    log(`Tipo: ${blockType}`, 'white');

    try {
        // 1. Obtener info de la página
        log('\n1. Obteniendo info de la página...', 'gray');
        const route = await client.get('/desktopRoutes:get', { filterByTk: pageId });

        if (!route.data) {
            log('❌ Página no encontrada', 'red');
            return;
        }

        const pageSchemaUid = route.data.schemaUid;
        log(`   Schema UID: ${pageSchemaUid}`, 'gray');

        // 2. Obtener el Grid de la página (usar getProperties, no getJsonSchema)
        log('2. Obteniendo Grid de la página...', 'gray');
        const pageSchema = await client.get(`/uiSchemas:getProperties/${pageSchemaUid}`);

        // ApiClient ya devuelve response.data, así que pageSchema.data contiene el objeto interno
        if (!pageSchema.data?.properties) {
            log('❌ Schema de página no encontrado o sin Grid', 'red');
            log('   Asegúrate de que la página fue creada con el método correcto.', 'yellow');
            return;
        }

        const gridKey = Object.keys(pageSchema.data.properties)[0];
        const gridUid = pageSchema.data.properties[gridKey]['x-uid'];
        log(`   Grid UID: ${gridUid}`, 'gray');

        // 3. Crear el bloque según el tipo
        log(`3. Creando bloque de tipo "${blockType}"...`, 'gray');
        let block;
        switch (blockType) {
            case 'table':
                block = createTableBlock(collectionName);
                break;
            case 'form':
                block = createFormBlock(collectionName);
                break;
            case 'details':
                block = createDetailsBlock(collectionName);
                break;
            default:
                log(`❌ Tipo de bloque no soportado: ${blockType}`, 'red');
                log('   Tipos válidos: table, form, details', 'yellow');
                return;
        }

        // 4. Insertar el bloque
        log('4. Insertando bloque en el Grid...', 'gray');
        await client.post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, {
            schema: block
        });

        log(`\n✅ Bloque "${blockType}" agregado exitosamente`, 'green');
        log(`   Colección: ${collectionName}`, 'white');

        logAction('BLOCK_ADDED', {
            pageId,
            collectionName,
            blockType,
            gridUid
        });

    } catch (error: unknown) {
        log(`\n❌ Error: ${error.response?.data?.errors?.[0]?.message || (error instanceof Error ? error.message : String(error))}`, 'red');
        logAction('BLOCK_ADD_ERROR', { pageId, collectionName, error: (error instanceof Error ? error.message : String(error)) });
    }
}

async function main() {
    const { flags, positional } = parseArgs(process.argv.slice(2));
    const pageId = positional[0];
    const collectionName = positional[1];
    const blockType = flags.type || 'table';

    if (!pageId || !collectionName) {
        log('Uso: add-block-to-page.ts <pageId> <collection> [--type table|form|details]\n', 'cyan');
        log('Ejemplos:', 'white');
        log('  npx tsx shared/scripts/add-block-to-page.ts 345419886166016 onco_casos', 'gray');
        log('  npx tsx shared/scripts/add-block-to-page.ts 345419886166016 onco_casos --type form', 'gray');
        log('  npx tsx shared/scripts/add-block-to-page.ts 345419886166016 onco_casos --type details', 'gray');
        process.exit(1);
    }

    await addBlockToPage(parseInt(pageId), collectionName, blockType);
}

main();
