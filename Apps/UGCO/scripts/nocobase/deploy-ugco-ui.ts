/**
 * deploy-ugco-ui.ts - Desplegar configuración UI de UGCO en NocoBase
 *
 * Crea páginas, menús y schemas UI en el servidor NocoBase.
 *
 * Uso:
 *   npx tsx Apps/UGCO/scripts/nocobase/deploy-ugco-ui.ts --dry-run
 *   npx tsx Apps/UGCO/scripts/nocobase/deploy-ugco-ui.ts
 */

import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Configuración MIRA ─────────────────────────────────────────────────────

const MIRA_CONFIG = {
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    apiKey: process.env.NOCOBASE_API_KEY || '',
};

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose');

// ─── Colores para consola ───────────────────────────────────────────────────

const colors = {
    cyan: (t: string) => `\x1b[36m${t}\x1b[0m`,
    green: (t: string) => `\x1b[32m${t}\x1b[0m`,
    yellow: (t: string) => `\x1b[33m${t}\x1b[0m`,
    red: (t: string) => `\x1b[31m${t}\x1b[0m`,
    gray: (t: string) => `\x1b[90m${t}\x1b[0m`,
    white: (t: string) => `\x1b[37m${t}\x1b[0m`,
    magenta: (t: string) => `\x1b[35m${t}\x1b[0m`,
};

function log(msg: string, color: keyof typeof colors = 'white') {
    console.log(colors[color](msg));
}

// ─── Definición de Especialidades ───────────────────────────────────────────

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

// ─── Generadores de UI Schema NocoBase ──────────────────────────────────────

/**
 * Genera el schema de una página para NocoBase
 */
function generatePageSchema(uid: string, title: string, icon?: string) {
    return {
        type: 'void',
        'x-uid': uid,
        'x-component': 'Page',
        'x-component-props': {
            title,
            icon,
        },
        'x-async': true,
        properties: {},
    };
}

/**
 * Genera el schema de un menú para NocoBase
 */
function generateMenuSchema() {
    const menuItems: any = {
        'ugco-dashboard': {
            type: 'void',
            'x-uid': 'ugco-menu-dashboard',
            'x-component': 'Menu.Item',
            'x-component-props': {
                icon: 'BarChartOutlined',
            },
            'x-decorator': 'ACLMenuItemProvider',
            title: '📊 Dashboard',
            'x-server-hooks': [
                {
                    type: 'onSelfCreate',
                    method: 'bindMenuToRole',
                },
            ],
            properties: {
                page: {
                    type: 'void',
                    'x-uid': 'ugco-page-dashboard',
                    'x-component': 'Page',
                    'x-async': true,
                },
            },
        },
        'ugco-especialidades': {
            type: 'void',
            'x-uid': 'ugco-menu-especialidades',
            'x-component': 'Menu.SubMenu',
            'x-component-props': {
                icon: 'FolderOutlined',
            },
            title: '📁 Especialidades',
            properties: {} as Record<string, any>,
        },
        'ugco-comites': {
            type: 'void',
            'x-uid': 'ugco-menu-comites',
            'x-component': 'Menu.Item',
            'x-component-props': {
                icon: 'CalendarOutlined',
            },
            title: '📅 Comités',
            properties: {
                page: {
                    type: 'void',
                    'x-uid': 'ugco-page-comites',
                    'x-component': 'Page',
                    'x-async': true,
                },
            },
        },
        'ugco-tareas': {
            type: 'void',
            'x-uid': 'ugco-menu-tareas',
            'x-component': 'Menu.Item',
            'x-component-props': {
                icon: 'CheckSquareOutlined',
            },
            title: '✅ Tareas',
            properties: {
                page: {
                    type: 'void',
                    'x-uid': 'ugco-page-tareas',
                    'x-component': 'Page',
                    'x-async': true,
                },
            },
        },
        'ugco-reportes': {
            type: 'void',
            'x-uid': 'ugco-menu-reportes',
            'x-component': 'Menu.Item',
            'x-component-props': {
                icon: 'FileTextOutlined',
            },
            title: '📄 Reportes',
            properties: {
                page: {
                    type: 'void',
                    'x-uid': 'ugco-page-reportes',
                    'x-component': 'Page',
                    'x-async': true,
                },
            },
        },
    };

    // Agregar especialidades al submenú
    for (const esp of ESPECIALIDADES) {
        menuItems['ugco-especialidades'].properties[`ugco-esp-${esp.id}`] = {
            type: 'void',
            'x-uid': `ugco-menu-esp-${esp.id}`,
            'x-component': 'Menu.Item',
            'x-component-props': {
                style: { color: esp.color },
            },
            title: `${esp.icono} ${esp.nombre}`,
            properties: {
                page: {
                    type: 'void',
                    'x-uid': `ugco-page-esp-${esp.id}`,
                    'x-component': 'Page',
                    'x-async': true,
                },
            },
        };
    }

    return {
        type: 'void',
        'x-uid': 'ugco-root-menu',
        'x-component': 'Menu',
        'x-component-props': {
            mode: 'inline',
            theme: 'light',
        },
        properties: menuItems,
    };
}

/**
 * Genera el schema de la tabla de casos para una especialidad
 */
function generateCasosTableSchema(especialidad: Especialidad) {
    return {
        type: 'void',
        'x-uid': `ugco-table-casos-${especialidad.id}`,
        'x-component': 'CardItem',
        'x-component-props': {
            title: `Casos de ${especialidad.nombre}`,
        },
        properties: {
            table: {
                type: 'void',
                'x-component': 'Table',
                'x-component-props': {
                    useProps: '{{ useTableBlockProps }}',
                    rowKey: 'id',
                },
                'x-decorator': 'TableBlockProvider',
                'x-decorator-props': {
                    collection: 'ugco_casooncologico',
                    action: 'list',
                    params: {
                        filter: {
                            'especialidad_principal.codigo': especialidad.codigo,
                        },
                        pageSize: 20,
                        sort: ['-updated_at'],
                    },
                },
                properties: {
                    actions: {
                        type: 'void',
                        'x-component': 'ActionBar',
                        'x-component-props': {
                            style: { marginBottom: 16 },
                        },
                        properties: {
                            filter: {
                                type: 'void',
                                'x-component': 'Filter.Action',
                                'x-component-props': {
                                    useProps: '{{ useFilterBlockActionProps }}',
                                },
                            },
                            create: {
                                type: 'void',
                                'x-component': 'Action',
                                title: '+ Nuevo Caso',
                                'x-component-props': {
                                    type: 'primary',
                                },
                            },
                        },
                    },
                    column_codigo: {
                        type: 'void',
                        'x-component': 'Table.Column',
                        'x-component-props': {
                            title: 'Código',
                            dataIndex: 'UGCO_COD01',
                            width: 120,
                        },
                    },
                    column_paciente: {
                        type: 'void',
                        'x-component': 'Table.Column',
                        'x-component-props': {
                            title: 'Paciente',
                            dataIndex: ['paciente', 'nombre_completo'],
                            width: 200,
                        },
                    },
                    column_diagnostico: {
                        type: 'void',
                        'x-component': 'Table.Column',
                        'x-component-props': {
                            title: 'Diagnóstico',
                            dataIndex: 'cie10_glosa',
                            width: 200,
                        },
                    },
                    column_estado: {
                        type: 'void',
                        'x-component': 'Table.Column',
                        'x-component-props': {
                            title: 'Estado',
                            dataIndex: 'estado_adm',
                            width: 120,
                        },
                    },
                    column_actions: {
                        type: 'void',
                        'x-component': 'Table.Column',
                        'x-component-props': {
                            title: 'Acciones',
                            width: 150,
                        },
                        properties: {
                            view: {
                                type: 'void',
                                'x-component': 'Action.Link',
                                title: 'Ver',
                            },
                            edit: {
                                type: 'void',
                                'x-component': 'Action.Link',
                                title: 'Editar',
                            },
                        },
                    },
                },
            },
        },
    };
}

/**
 * Genera estadísticas KPI para el dashboard
 */
function generateKPISchema() {
    return {
        type: 'void',
        'x-uid': 'ugco-dashboard-kpis',
        'x-component': 'Grid',
        'x-component-props': {
            cols: 4,
        },
        properties: {
            kpi_total: {
                type: 'void',
                'x-component': 'CardItem',
                'x-component-props': {
                    title: '📊 Casos Totales',
                    bordered: true,
                },
                properties: {
                    value: {
                        type: 'void',
                        'x-component': 'Statistic',
                        'x-decorator': 'CollectionProvider',
                        'x-decorator-props': {
                            collection: 'ugco_casooncologico',
                        },
                    },
                },
            },
            kpi_criticos: {
                type: 'void',
                'x-component': 'CardItem',
                'x-component-props': {
                    title: '🔴 Críticos',
                    bordered: true,
                },
            },
            kpi_pendientes: {
                type: 'void',
                'x-component': 'CardItem',
                'x-component-props': {
                    title: '🟡 Pendientes',
                    bordered: true,
                },
            },
            kpi_aldia: {
                type: 'void',
                'x-component': 'CardItem',
                'x-component-props': {
                    title: '🟢 Al día',
                    bordered: true,
                },
            },
        },
    };
}

// ─── API Client ─────────────────────────────────────────────────────────────

async function createApiClient(): Promise<AxiosInstance> {
    const client = axios.create({
        baseURL: MIRA_CONFIG.baseURL,
        headers: {
            'Authorization': `Bearer ${MIRA_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
        },
        timeout: 30000,
    });

    // Verificar conexión
    try {
        await client.get('/app:getLang');
        return client;
    } catch (error: any) {
        throw new Error(`No se puede conectar al servidor: ${error.message}`);
    }
}

// ─── Funciones de Deploy ────────────────────────────────────────────────────

interface DeployResult {
    success: boolean;
    created: string[];
    errors: string[];
}

async function deployUISchemas(client: AxiosInstance): Promise<DeployResult> {
    const result: DeployResult = {
        success: true,
        created: [],
        errors: [],
    };

    log('\n  DESPLEGANDO UI SCHEMAS:', 'cyan');
    log('  ───────────────────────────────────────', 'gray');

    // 1. Crear schema del menú
    log('\n  1. Creando menú principal...', 'white');
    const menuSchema = generateMenuSchema();

    if (!DRY_RUN) {
        try {
            // En NocoBase, los schemas de UI se crean con uiSchemas:insert
            await client.post('/uiSchemas:insert', menuSchema);
            log('     [OK] Menú creado', 'green');
            result.created.push('ugco-root-menu');
        } catch (error: any) {
            if (error.response?.status === 400 || error.response?.data?.errors?.[0]?.message?.includes('exist')) {
                log('     [SKIP] Menú ya existe', 'yellow');
            } else {
                log(`     [ERROR] ${error.response?.data?.errors?.[0]?.message || error.message}`, 'red');
                result.errors.push(`menu: ${error.message}`);
            }
        }
    } else {
        log('     [DRY-RUN] Se crearía el menú principal', 'yellow');
    }

    // 2. Crear páginas de especialidad
    log('\n  2. Creando páginas de especialidad...', 'white');
    for (const esp of ESPECIALIDADES) {
        const pageSchema = generateCasosTableSchema(esp);

        if (!DRY_RUN) {
            try {
                await client.post('/uiSchemas:insert', pageSchema);
                log(`     ${esp.icono} ${esp.nombre}: [OK]`, 'green');
                result.created.push(`page-${esp.id}`);
            } catch (error: any) {
                if (error.response?.status === 400 || error.response?.data?.errors?.[0]?.message?.includes('exist')) {
                    log(`     ${esp.icono} ${esp.nombre}: [SKIP] Ya existe`, 'yellow');
                } else {
                    log(`     ${esp.icono} ${esp.nombre}: [ERROR] ${error.message}`, 'red');
                    result.errors.push(`page-${esp.id}: ${error.message}`);
                }
            }
        } else {
            log(`     ${esp.icono} ${esp.nombre}: [DRY-RUN]`, 'yellow');
        }
    }

    // 3. Crear dashboard con KPIs
    log('\n  3. Creando dashboard...', 'white');
    const kpiSchema = generateKPISchema();

    if (!DRY_RUN) {
        try {
            await client.post('/uiSchemas:insert', kpiSchema);
            log('     [OK] Dashboard con KPIs creado', 'green');
            result.created.push('dashboard-kpis');
        } catch (error: any) {
            if (error.response?.status === 400) {
                log('     [SKIP] Dashboard ya existe', 'yellow');
            } else {
                log(`     [ERROR] ${error.message}`, 'red');
                result.errors.push(`dashboard: ${error.message}`);
            }
        }
    } else {
        log('     [DRY-RUN] Se crearía el dashboard', 'yellow');
    }

    result.success = result.errors.length === 0;
    return result;
}

// ─── Exportar configuración completa ────────────────────────────────────────

function exportFullConfig() {
    const pagesDir = path.resolve(__dirname, '../../nocobase/ui-config/pages');
    const exportDir = path.resolve(__dirname, '../../nocobase/ui-config/export');

    // Crear directorio de exportación
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    // Configuración completa para importación manual en NocoBase
    const fullConfig = {
        name: 'ugco-ui-config',
        version: '1.0.0',
        description: 'Configuración completa de UI para UGCO Gestión Oncológica',
        generatedAt: new Date().toISOString(),
        menu: generateMenuSchema(),
        pages: {
            dashboard: generateKPISchema(),
            especialidades: ESPECIALIDADES.map(esp => ({
                id: esp.id,
                schema: generateCasosTableSchema(esp),
            })),
        },
        especialidades: ESPECIALIDADES,
        instructions: {
            step1: 'Ir a NocoBase Admin > UI Editor',
            step2: 'Crear nuevo menú con estructura definida en "menu"',
            step3: 'Para cada especialidad, crear página con bloques Table y Kanban',
            step4: 'Configurar filtros por especialidad_principal.codigo',
            step5: 'Vincular acciones Ver/Editar a drawers',
        },
    };

    const exportPath = path.resolve(exportDir, 'full-ui-config.json');
    fs.writeFileSync(exportPath, JSON.stringify(fullConfig, null, 2));

    return exportPath;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    log('╔════════════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  DEPLOY UGCO UI - Despliegue de Interfaz en NocoBase              ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════════════╝', 'cyan');

    log(`\n  Servidor: ${MIRA_CONFIG.baseURL}`, 'gray');

    if (DRY_RUN) {
        log('  [!] Modo DRY-RUN: simulando sin aplicar cambios\n', 'yellow');
    }

    // Conectar al servidor
    log('\n  Conectando al servidor...', 'gray');
    let client: AxiosInstance;
    try {
        client = await createApiClient();
        log('  [OK] Conexión establecida', 'green');
    } catch (error: any) {
        log(`\n  [ERROR] ${error.message}`, 'red');
        process.exit(1);
    }

    // Exportar configuración completa
    log('\n  Exportando configuración completa...', 'gray');
    const exportPath = exportFullConfig();
    log(`  [OK] Exportado a: ${exportPath}`, 'green');

    // Desplegar schemas
    const result = await deployUISchemas(client);

    // Resumen
    log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'white');
    if (result.success) {
        log(`  ✓ Despliegue completado exitosamente`, 'green');
    } else {
        log(`  ⚠ Despliegue completado con errores`, 'yellow');
    }
    log(`  ✓ Schemas creados: ${result.created.length}`, 'gray');
    if (result.errors.length > 0) {
        log(`  ✗ Errores: ${result.errors.length}`, 'red');
    }
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`, 'white');

    // Instrucciones finales
    log('  PRÓXIMOS PASOS:', 'cyan');
    log('  ───────────────────────────────────────', 'gray');
    log('  1. Abrir NocoBase en navegador', 'white');
    log('  2. Ir a Settings > UI Editor', 'white');
    log('  3. Usar la configuración JSON exportada como referencia', 'white');
    log('  4. Crear bloques manualmente siguiendo el schema', 'white');
    log(`\n  Archivo de referencia: ${exportPath}`, 'gray');
    log('');

    // Si hubo errores, mostrarlos
    if (result.errors.length > 0) {
        log('  ERRORES ENCONTRADOS:', 'red');
        for (const err of result.errors) {
            log(`    • ${err}`, 'red');
        }
        log('');
    }
}

main().catch(console.error);
