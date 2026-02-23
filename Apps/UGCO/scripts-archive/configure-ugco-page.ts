/**
 * configure-ugco-page.ts - Configurar contenido de la página UGCO
 */

import axios from 'axios';

const client = axios.create({
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    headers: {
        'Authorization': 'Bearer ' + (process.env.NOCOBASE_API_KEY || ''),
    },
});

const colors = {
    cyan: (t: string) => `\x1b[36m${t}\x1b[0m`,
    green: (t: string) => `\x1b[32m${t}\x1b[0m`,
    yellow: (t: string) => `\x1b[33m${t}\x1b[0m`,
    red: (t: string) => `\x1b[31m${t}\x1b[0m`,
    gray: (t: string) => `\x1b[90m${t}\x1b[0m`,
};

function log(msg: string, color: keyof typeof colors = 'cyan') {
    console.log(colors[color](msg));
}

function uid() {
    return Math.random().toString(36).substring(2, 12);
}

const UGCO_PAGE_UID = '5zw9nk7k3f1';

async function main() {
    log('╔════════════════════════════════════════════════════════════════════╗');
    log('║  CONFIGURAR PÁGINA UGCO                                           ║');
    log('╚════════════════════════════════════════════════════════════════════╝');

    // 1. Verificar que la página existe
    log('\n1. Verificando página UGCO...', 'gray');
    try {
        const res = await client.get(`/uiSchemas:getJsonSchema/${UGCO_PAGE_UID}`);
        const page = res.data?.data;
        log(`   [OK] Página encontrada: ${page.title || 'UGCO'}`, 'green');
        log(`   Component: ${page['x-component']}`, 'gray');
    } catch (e: any) {
        log(`   [ERROR] Página no encontrada: ${e.message}`, 'red');
        return;
    }

    // 2. Crear Grid principal con tabs para especialidades
    log('\n2. Creando estructura de la página...', 'gray');

    const gridUid = uid();
    const tabsUid = uid();

    // Schema de contenido: Tabs con especialidades
    const contentSchema = {
        type: 'void',
        'x-uid': gridUid,
        'x-component': 'Grid',
        'x-initializer': 'page:addBlock',
        _isJSONSchemaObject: true,
        version: '2.0',
        properties: {
            // Row para tabs de especialidades
            row1: {
                type: 'void',
                'x-uid': uid(),
                'x-component': 'Grid.Row',
                _isJSONSchemaObject: true,
                version: '2.0',
                properties: {
                    col1: {
                        type: 'void',
                        'x-uid': uid(),
                        'x-component': 'Grid.Col',
                        _isJSONSchemaObject: true,
                        version: '2.0',
                        properties: {
                            tabs: {
                                type: 'void',
                                'x-uid': tabsUid,
                                'x-component': 'Tabs',
                                'x-component-props': {},
                                _isJSONSchemaObject: true,
                                version: '2.0',
                                properties: {
                                    // Tab: Todos los casos
                                    tab_todos: {
                                        type: 'void',
                                        'x-uid': uid(),
                                        'x-component': 'Tabs.TabPane',
                                        'x-component-props': {
                                            tab: '📋 Todos los Casos',
                                        },
                                        'x-designer': 'Tabs.Designer',
                                        _isJSONSchemaObject: true,
                                        version: '2.0',
                                        properties: {
                                            grid: {
                                                type: 'void',
                                                'x-uid': uid(),
                                                'x-component': 'Grid',
                                                'x-initializer': 'page:addBlock',
                                                _isJSONSchemaObject: true,
                                                version: '2.0',
                                            },
                                        },
                                    },
                                    // Tab: Mama
                                    tab_mama: {
                                        type: 'void',
                                        'x-uid': uid(),
                                        'x-component': 'Tabs.TabPane',
                                        'x-component-props': {
                                            tab: '🩷 Mama',
                                        },
                                        'x-designer': 'Tabs.Designer',
                                        _isJSONSchemaObject: true,
                                        version: '2.0',
                                        properties: {
                                            grid: {
                                                type: 'void',
                                                'x-uid': uid(),
                                                'x-component': 'Grid',
                                                'x-initializer': 'page:addBlock',
                                                _isJSONSchemaObject: true,
                                                version: '2.0',
                                            },
                                        },
                                    },
                                    // Tab: Digestivo
                                    tab_digestivo: {
                                        type: 'void',
                                        'x-uid': uid(),
                                        'x-component': 'Tabs.TabPane',
                                        'x-component-props': {
                                            tab: '🔶 Digestivo',
                                        },
                                        'x-designer': 'Tabs.Designer',
                                        _isJSONSchemaObject: true,
                                        version: '2.0',
                                        properties: {
                                            grid: {
                                                type: 'void',
                                                'x-uid': uid(),
                                                'x-component': 'Grid',
                                                'x-initializer': 'page:addBlock',
                                                _isJSONSchemaObject: true,
                                                version: '2.0',
                                            },
                                        },
                                    },
                                    // Tab: Urología
                                    tab_urologia: {
                                        type: 'void',
                                        'x-uid': uid(),
                                        'x-component': 'Tabs.TabPane',
                                        'x-component-props': {
                                            tab: '💙 Urología',
                                        },
                                        'x-designer': 'Tabs.Designer',
                                        _isJSONSchemaObject: true,
                                        version: '2.0',
                                        properties: {
                                            grid: {
                                                type: 'void',
                                                'x-uid': uid(),
                                                'x-component': 'Grid',
                                                'x-initializer': 'page:addBlock',
                                                _isJSONSchemaObject: true,
                                                version: '2.0',
                                            },
                                        },
                                    },
                                    // Tab: Ginecología
                                    tab_gineco: {
                                        type: 'void',
                                        'x-uid': uid(),
                                        'x-component': 'Tabs.TabPane',
                                        'x-component-props': {
                                            tab: '💜 Ginecología',
                                        },
                                        'x-designer': 'Tabs.Designer',
                                        _isJSONSchemaObject: true,
                                        version: '2.0',
                                        properties: {
                                            grid: {
                                                type: 'void',
                                                'x-uid': uid(),
                                                'x-component': 'Grid',
                                                'x-initializer': 'page:addBlock',
                                                _isJSONSchemaObject: true,
                                                version: '2.0',
                                            },
                                        },
                                    },
                                    // Tab: Comités
                                    tab_comites: {
                                        type: 'void',
                                        'x-uid': uid(),
                                        'x-component': 'Tabs.TabPane',
                                        'x-component-props': {
                                            tab: '📅 Comités',
                                        },
                                        'x-designer': 'Tabs.Designer',
                                        _isJSONSchemaObject: true,
                                        version: '2.0',
                                        properties: {
                                            grid: {
                                                type: 'void',
                                                'x-uid': uid(),
                                                'x-component': 'Grid',
                                                'x-initializer': 'page:addBlock',
                                                _isJSONSchemaObject: true,
                                                version: '2.0',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    };

    try {
        await client.post(`/uiSchemas:insertAdjacent/${UGCO_PAGE_UID}?position=beforeEnd`, {
            schema: contentSchema,
        });
        log(`   [OK] Estructura creada con tabs`, 'green');
    } catch (e: any) {
        log(`   [ERROR] ${e.response?.data?.errors?.[0]?.message || e.message}`, 'red');
    }

    // 3. Verificar resultado
    log('\n3. Verificando...', 'gray');
    try {
        const res = await client.get(`/uiSchemas:getJsonSchema/${UGCO_PAGE_UID}`);
        const page = res.data?.data;

        if (page.properties) {
            log(`   [OK] Página tiene ${Object.keys(page.properties).length} elementos`, 'green');
        }
    } catch (e: any) {
        log(`   Error: ${e.message}`, 'red');
    }

    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('  Refresca la página UGCO:', 'yellow');
    log(`  https://mira.hospitaldeovalle.cl/admin/${UGCO_PAGE_UID}`, 'green');
    log('', 'cyan');
    log('  Deberías ver tabs para cada especialidad.', 'gray');
    log('  Luego usa UI Editor para agregar tablas a cada tab.', 'gray');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
}

main().catch(console.error);
