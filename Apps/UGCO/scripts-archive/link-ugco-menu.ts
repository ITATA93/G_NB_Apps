/**
 * link-ugco-menu.ts - Vincular menú UGCO al menú principal de NocoBase
 *
 * Los schemas ya existen, solo falta vincularlos al menú admin.
 *
 * Uso:
 *   npx tsx Apps/UGCO/scripts/nocobase/link-ugco-menu.ts
 */

import axios from 'axios';

const MIRA_CONFIG = {
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    apiKey: (process.env.NOCOBASE_API_KEY || ''),
};

// ─── Colores para consola ───────────────────────────────────────────────────

const colors = {
    cyan: (t: string) => `\x1b[36m${t}\x1b[0m`,
    green: (t: string) => `\x1b[32m${t}\x1b[0m`,
    yellow: (t: string) => `\x1b[33m${t}\x1b[0m`,
    red: (t: string) => `\x1b[31m${t}\x1b[0m`,
    gray: (t: string) => `\x1b[90m${t}\x1b[0m`,
    white: (t: string) => `\x1b[37m${t}\x1b[0m`,
};

function log(msg: string, color: keyof typeof colors = 'white') {
    console.log(colors[color](msg));
}

// ─── Especialidades ─────────────────────────────────────────────────────────

interface Especialidad {
    id: string;
    nombre: string;
    codigo: string;
    color: string;
    icono: string;
}

const ESPECIALIDADES: Especialidad[] = [
    { id: 'digestivo_alto', nombre: 'Digestivo Alto', codigo: 'DIGESTIVO_ALTO', color: '#FF8B00', icono: '🔶' },
    { id: 'digestivo_bajo', nombre: 'Digestivo Bajo', codigo: 'DIGESTIVO_BAJO', color: '#8B4513', icono: '🟤' },
    { id: 'mama', nombre: 'Mama', codigo: 'P._MAMARIA', color: '#E91E63', icono: '🩷' },
    { id: 'ginecologia', nombre: 'Ginecología', codigo: 'P._CERVICAL', color: '#9C27B0', icono: '💜' },
    { id: 'urologia', nombre: 'Urología', codigo: 'UROLOGIA', color: '#2196F3', icono: '💙' },
    { id: 'torax', nombre: 'Tórax', codigo: 'TORAX', color: '#607D8B', icono: '🫁' },
    { id: 'piel', nombre: 'Piel y Partes Blandas', codigo: 'PIEL_Y_PARTES_BLANDAS', color: '#FFC107', icono: '💛' },
    { id: 'endocrinologia', nombre: 'Endocrinología', codigo: 'ENDOCRINOLOGIA', color: '#4CAF50', icono: '💚' },
    { id: 'hematologia', nombre: 'Hematología', codigo: 'HEMATOLOGÍA', color: '#F44336', icono: '❤️' },
];

// ─── Función para generar UID único ─────────────────────────────────────────

function generateUid() {
    return Math.random().toString(36).substring(2, 15);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    log('╔════════════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  LINK UGCO MENU - Vincular menú al panel de NocoBase              ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════════════╝', 'cyan');

    const client = axios.create({
        baseURL: MIRA_CONFIG.baseURL,
        headers: {
            'Authorization': `Bearer ${MIRA_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
        },
    });

    // Verificar conexión
    log('\n  Conectando al servidor...', 'gray');
    try {
        await client.get('/app:getLang');
        log('  [OK] Conexión establecida', 'green');
    } catch (e: any) {
        log(`  [ERROR] ${e.message}`, 'red');
        return;
    }

    // Obtener el schema del menú admin actual
    log('\n  Obteniendo menú admin actual...', 'gray');
    let adminMenuSchema: any;
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        adminMenuSchema = res.data?.data;
        const existingItems = Object.keys(adminMenuSchema?.properties || {});
        log(`  [OK] Menú encontrado con ${existingItems.length} items`, 'green');
        log(`       Items: ${existingItems.slice(0, 5).join(', ')}...`, 'gray');
    } catch (e: any) {
        log(`  [ERROR] No se pudo obtener menú: ${e.message}`, 'red');
        return;
    }

    // Crear estructura del menú UGCO para insertar en admin menu
    log('\n  CREANDO MENÚ UGCO EN NOCOBASE:', 'cyan');
    log('  ───────────────────────────────────────', 'gray');

    // Generar UIDs únicos para cada elemento
    const ugcoMenuUid = `ugco-menu-${generateUid()}`;
    const dashboardUid = `ugco-dash-${generateUid()}`;
    const espGroupUid = `ugco-esp-group-${generateUid()}`;

    // Schema del grupo UGCO
    const ugcoGroupSchema = {
        type: 'void',
        title: '🏥 UGCO Oncología',
        'x-component': 'Menu.SubMenu',
        'x-decorator': 'ACLMenuItemProvider',
        'x-component-props': {
            icon: 'MedicineBoxOutlined',
        },
        'x-uid': ugcoMenuUid,
        'x-async': false,
        properties: {
            // Dashboard
            [`dashboard-${generateUid()}`]: {
                type: 'void',
                title: '📊 Dashboard',
                'x-component': 'Menu.Item',
                'x-decorator': 'ACLMenuItemProvider',
                'x-component-props': {
                    icon: 'DashboardOutlined',
                },
                'x-uid': dashboardUid,
                'x-async': false,
                properties: {
                    page: {
                        type: 'void',
                        'x-component': 'Page',
                        'x-async': true,
                        'x-uid': `page-dash-${generateUid()}`,
                        properties: {
                            // Contenido de la página se configura manualmente
                        },
                    },
                },
            },
            // Grupo Especialidades
            [`especialidades-${generateUid()}`]: {
                type: 'void',
                title: '📁 Especialidades',
                'x-component': 'Menu.SubMenu',
                'x-decorator': 'ACLMenuItemProvider',
                'x-component-props': {
                    icon: 'FolderOutlined',
                },
                'x-uid': espGroupUid,
                'x-async': false,
                properties: Object.fromEntries(
                    ESPECIALIDADES.map(esp => [
                        `esp-${esp.id}-${generateUid()}`,
                        {
                            type: 'void',
                            title: `${esp.icono} ${esp.nombre}`,
                            'x-component': 'Menu.Item',
                            'x-decorator': 'ACLMenuItemProvider',
                            'x-uid': `esp-${esp.id}-${generateUid()}`,
                            'x-async': false,
                            properties: {
                                page: {
                                    type: 'void',
                                    'x-component': 'Page',
                                    'x-async': true,
                                    'x-uid': `page-${esp.id}-${generateUid()}`,
                                    properties: {},
                                },
                            },
                        },
                    ])
                ),
            },
            // Comités
            [`comites-${generateUid()}`]: {
                type: 'void',
                title: '📅 Comités',
                'x-component': 'Menu.Item',
                'x-decorator': 'ACLMenuItemProvider',
                'x-component-props': {
                    icon: 'CalendarOutlined',
                },
                'x-uid': `comites-${generateUid()}`,
                'x-async': false,
                properties: {
                    page: {
                        type: 'void',
                        'x-component': 'Page',
                        'x-async': true,
                        'x-uid': `page-comites-${generateUid()}`,
                        properties: {},
                    },
                },
            },
            // Tareas
            [`tareas-${generateUid()}`]: {
                type: 'void',
                title: '✅ Tareas',
                'x-component': 'Menu.Item',
                'x-decorator': 'ACLMenuItemProvider',
                'x-component-props': {
                    icon: 'CheckSquareOutlined',
                },
                'x-uid': `tareas-${generateUid()}`,
                'x-async': false,
                properties: {
                    page: {
                        type: 'void',
                        'x-component': 'Page',
                        'x-async': true,
                        'x-uid': `page-tareas-${generateUid()}`,
                        properties: {},
                    },
                },
            },
        },
    };

    // Insertar el menú UGCO dentro del menú admin
    log('\n  Insertando menú UGCO...', 'white');
    try {
        // Usar insertAdjacent para agregar al menú admin
        // position: 'beforeEnd' lo agrega al final
        const response = await client.post('/uiSchemas:insertAdjacent/nocobase-admin-menu?position=beforeEnd', {
            schema: ugcoGroupSchema,
        });

        log('  [OK] Menú UGCO insertado exitosamente', 'green');
        log(`       UID del menú: ${ugcoMenuUid}`, 'gray');
    } catch (e: any) {
        const errorMsg = e.response?.data?.errors?.[0]?.message || e.message;
        log(`  [ERROR] ${errorMsg}`, 'red');

        // Si ya existe, intentar actualizarlo
        if (errorMsg.includes('exist') || errorMsg.includes('duplicate')) {
            log('  Intentando actualizar menú existente...', 'yellow');
            try {
                await client.post(`/uiSchemas:patch`, {
                    'x-uid': ugcoMenuUid,
                    schema: ugcoGroupSchema,
                });
                log('  [OK] Menú actualizado', 'green');
            } catch (e2: any) {
                log(`  [ERROR] ${e2.response?.data?.errors?.[0]?.message || e2.message}`, 'red');
            }
        }
    }

    // Resumen
    log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'white');
    log(`  Menú UGCO creado con:`, 'green');
    log(`    - Dashboard`, 'gray');
    log(`    - ${ESPECIALIDADES.length} especialidades`, 'gray');
    log(`    - Comités`, 'gray');
    log(`    - Tareas`, 'gray');
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`, 'white');

    log('  SIGUIENTE PASO:', 'cyan');
    log('  1. Refrescar la página de NocoBase en el navegador', 'white');
    log('  2. Buscar "UGCO Oncología" en el menú lateral', 'white');
    log('  3. Configurar el contenido de cada página con UI Editor\n', 'white');
}

main().catch(console.error);
