/**
 * setup-ugco-menu.ts - Configurar menú lateral UGCO en NocoBase
 *
 * Crea la estructura de navegación por especialidades oncológicas.
 *
 * Uso:
 *   npx tsx Apps/UGCO/scripts/nocobase/setup-ugco-menu.ts --dry-run
 *   npx tsx Apps/UGCO/scripts/nocobase/setup-ugco-menu.ts
 */

import axios, { AxiosInstance } from 'axios';

// ─── Configuración MIRA ─────────────────────────────────────────────────────

const MIRA_CONFIG = {
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    apiKey: (process.env.NOCOBASE_API_KEY || ''),
};

const DRY_RUN = process.argv.includes('--dry-run');

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

// ─── Estructura del Menú ────────────────────────────────────────────────────

interface MenuItem {
    uid: string;
    title: string;
    icon?: string;
    type: 'page' | 'group' | 'link';
    schemaUid?: string;
    children?: MenuItem[];
    options?: {
        url?: string;
        params?: Record<string, any>;
    };
}

function generateMenuStructure(): MenuItem[] {
    const especialidadesMenu: MenuItem[] = ESPECIALIDADES.map(esp => ({
        uid: `ugco-esp-${esp.id}`,
        title: `${esp.icono} ${esp.nombre}`,
        type: 'page',
        schemaUid: `ugco-page-${esp.id}`,
        options: {
            params: { especialidad: esp.codigo }
        }
    }));

    return [
        {
            uid: 'ugco-dashboard',
            title: '📊 Dashboard',
            type: 'page',
            schemaUid: 'ugco-page-dashboard',
        },
        {
            uid: 'ugco-especialidades',
            title: '📁 ESPECIALIDADES',
            type: 'group',
            children: especialidadesMenu,
        },
        {
            uid: 'ugco-comites',
            title: '📅 Comités Oncológicos',
            type: 'page',
            schemaUid: 'ugco-page-comites',
        },
        {
            uid: 'ugco-tareas',
            title: '✅ Tareas Pendientes',
            type: 'page',
            schemaUid: 'ugco-page-tareas',
        },
        {
            uid: 'ugco-reportes',
            title: '📄 Reportes',
            type: 'page',
            schemaUid: 'ugco-page-reportes',
        },
        {
            uid: 'ugco-config',
            title: '⚙️ Configuración',
            type: 'group',
            children: [
                {
                    uid: 'ugco-config-especialidades',
                    title: 'Especialidades',
                    type: 'page',
                    schemaUid: 'ugco-page-config-especialidades',
                },
                {
                    uid: 'ugco-config-equipos',
                    title: 'Equipos de Seguimiento',
                    type: 'page',
                    schemaUid: 'ugco-page-config-equipos',
                },
                {
                    uid: 'ugco-config-catalogos',
                    title: 'Catálogos',
                    type: 'page',
                    schemaUid: 'ugco-page-config-catalogos',
                },
            ],
        },
    ];
}

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

// ─── Exportar configuración JSON ────────────────────────────────────────────

function exportMenuConfig() {
    const menu = generateMenuStructure();
    const config = {
        name: 'UGCO Oncología',
        description: 'Menú de navegación para gestión oncológica por especialidad',
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        menu,
        especialidades: ESPECIALIDADES,
    };
    return config;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    log('╔════════════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  SETUP UGCO MENU - Configuración de Navegación                    ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════════════╝', 'cyan');

    log(`\n  Servidor: ${MIRA_CONFIG.baseURL}`, 'gray');

    if (DRY_RUN) {
        log('\n  [!] Modo DRY-RUN: generando configuración sin aplicar\n', 'yellow');
    }

    const client = axios.create({
        baseURL: MIRA_CONFIG.baseURL,
        headers: {
            'Authorization': `Bearer ${MIRA_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
        },
    });

    // Verificar conexión
    log('\n  Verificando conexión...', 'gray');
    try {
        await client.get('/app:getLang');
        log('  [OK] Conexión establecida\n', 'green');
    } catch (error: any) {
        log(`\n  [ERROR] No se puede conectar: ${error.message}`, 'red');
        process.exit(1);
    }

    // Generar estructura del menú
    log('  Generando estructura del menú...', 'gray');
    const menuConfig = exportMenuConfig();

    // Mostrar estructura
    log('\n  ESTRUCTURA DEL MENÚ:', 'cyan');
    log('  ───────────────────────────────────────', 'gray');

    function printMenu(items: MenuItem[], indent = 0) {
        for (const item of items) {
            const prefix = '  '.repeat(indent + 2);
            if (item.type === 'group') {
                log(`${prefix}📁 ${item.title}`, 'white');
                if (item.children) {
                    printMenu(item.children, indent + 1);
                }
            } else {
                log(`${prefix}├── ${item.title}`, 'gray');
            }
        }
    }

    printMenu(menuConfig.menu);

    log('\n  ───────────────────────────────────────', 'gray');
    log(`  Total especialidades: ${ESPECIALIDADES.length}`, 'gray');
    log(`  Total ítems de menú: ${menuConfig.menu.length}`, 'gray');

    // Guardar configuración como JSON
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const configPath = path.resolve(__dirname, '../../nocobase/ui-config/menu-config.json');
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(menuConfig, null, 2));
    log(`\n  [OK] Configuración guardada en: ${configPath}`, 'green');

    // Si no es dry-run, intentar crear páginas en NocoBase
    if (!DRY_RUN) {
        log('\n  Creando páginas en NocoBase...', 'cyan');

        // Crear página del Dashboard
        try {
            // NocoBase usa uiSchemas para las páginas
            // Primero verificamos si ya existe
            const pages = [
                { uid: 'ugco-page-dashboard', title: 'Dashboard UGCO' },
                { uid: 'ugco-page-comites', title: 'Comités Oncológicos' },
                { uid: 'ugco-page-tareas', title: 'Tareas Pendientes' },
                { uid: 'ugco-page-reportes', title: 'Reportes' },
                ...ESPECIALIDADES.map(esp => ({
                    uid: `ugco-page-${esp.id}`,
                    title: `${esp.nombre} - Casos Oncológicos`
                }))
            ];

            for (const page of pages) {
                log(`    Verificando página: ${page.title}...`, 'gray');
                // En NocoBase, las páginas se crean como uiSchemas
                // Este es un placeholder - la creación real depende de la versión de NocoBase
            }

            log('\n  [INFO] Las páginas deben configurarse manualmente en NocoBase UI', 'yellow');
            log('  Use la configuración JSON generada como referencia.', 'gray');
        } catch (error: any) {
            log(`  [ERROR] ${error.message}`, 'red');
        }
    }

    log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'white');
    log(`  Configuración del menú completada`, 'green');
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`, 'white');

    // Imprimir instrucciones de implementación manual
    log('\n  INSTRUCCIONES PARA NOCOBASE:', 'cyan');
    log('  ─────────────────────────────────────────────', 'gray');
    log('  1. Ir a NocoBase Admin > UI Editor', 'white');
    log('  2. Crear menú lateral con la estructura definida', 'white');
    log('  3. Para cada especialidad, crear una página con:', 'white');
    log('     - Bloque de estadísticas (4 KPIs)', 'gray');
    log('     - Bloque de filtros', 'gray');
    log('     - Bloque de tabla (casos filtrados)', 'gray');
    log('     - Bloque Kanban (estados del proceso)', 'gray');
    log('  4. Configurar filtros por especialidad_id', 'white');
    log('  5. Vincular acciones (Ver, Editar, Agendar)', 'white');
    log('  ─────────────────────────────────────────────\n', 'gray');
}

main().catch(console.error);
