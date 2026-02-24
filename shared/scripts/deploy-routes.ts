/**
 * deploy-routes.ts - Desplegar rutas de navegación en NocoBase
 *
 * Script reutilizable para crear estructuras de menú/navegación en NocoBase.
 *
 * Uso:
 *   npx tsx shared/scripts/deploy-routes.ts --config <archivo.json>
 *   npx tsx shared/scripts/deploy-routes.ts --config Apps/UGCO/routes-config.json
 *   npx tsx shared/scripts/deploy-routes.ts --config Apps/UGCO/routes-config.json --dry-run
 *
 * Formato del archivo de configuración (JSON):
 * {
 *   "name": "Mi App",
 *   "icon": "AppstoreOutlined",
 *   "routes": [
 *     { "title": "Dashboard", "type": "page", "icon": "HomeOutlined" },
 *     { "title": "Módulos", "type": "group", "children": [...] }
 *   ]
 * }
 */

import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// ─── Configuración ──────────────────────────────────────────────────────────

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

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface RouteConfig {
    title: string;
    type: 'group' | 'page' | 'link';
    icon?: string;
    url?: string; // Para type: 'link'
    schemaContent?: string; // Contenido markdown para la página
    children?: RouteConfig[];
}

interface AppConfig {
    name: string;
    icon?: string;
    routes: RouteConfig[];
}

interface CreatedRoute {
    id: number;
    title: string;
    type: string;
    schemaUid?: string;
}

// ─── Cliente API ────────────────────────────────────────────────────────────

function createClient(): AxiosInstance {
    const apiUrl = process.env.NOCOBASE_BASE_URL;
    const apiKey = process.env.NOCOBASE_API_KEY;

    if (!apiUrl || !apiKey) {
        log('❌ Error: NOCOBASE_BASE_URL o NOCOBASE_API_KEY no configurados en .env', 'red');
        process.exit(1);
    }

    return axios.create({
        baseURL: apiUrl,
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        timeout: 30000,
    });
}

// ─── Funciones de Creación ──────────────────────────────────────────────────

async function createPageSchema(client: AxiosInstance, title: string, content?: string): Promise<string | null> {
    const markdownContent = content || `# ${title}\n\n*Use el botón + para agregar bloques*`;

    const schema = {
        type: 'void',
        'x-component': 'Page',
        'x-async': true,
        properties: {
            grid: {
                type: 'void',
                'x-component': 'Grid',
                'x-initializer': 'page:addBlock',
                properties: {
                    row1: {
                        type: 'void',
                        'x-component': 'Grid.Row',
                        properties: {
                            col1: {
                                type: 'void',
                                'x-component': 'Grid.Col',
                                properties: {
                                    card: {
                                        type: 'void',
                                        'x-component': 'CardItem',
                                        'x-component-props': { title },
                                        properties: {
                                            markdown: {
                                                type: 'void',
                                                'x-component': 'Markdown.Void',
                                                'x-component-props': { content: markdownContent }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    try {
        const response = await client.post('/uiSchemas:insert', schema);
        return response.data?.data?.['x-uid'] || response.data?.['x-uid'] || null;
    } catch (error: unknown) {
        const axiosErr = error as { response?: { data?: { errors?: { message?: string }[] } } };
        log(`  ⚠️ Error creando schema: ${axiosErr.response?.data?.errors?.[0]?.message || (error instanceof Error ? error.message : String(error))}`, 'yellow');
        return null;
    }
}

async function createRoute(
    client: AxiosInstance,
    route: RouteConfig,
    parentId: number | null,
    dryRun: boolean,
    indent: string = ''
): Promise<CreatedRoute | null> {
    const icon = route.icon || (route.type === 'group' ? 'FolderOutlined' : 'FileOutlined');

    log(`${indent}${route.type === 'group' ? '📁' : '📄'} ${route.title}...`, 'white');

    if (dryRun) {
        log(`${indent}   [DRY-RUN] Se crearía ruta tipo ${route.type}`, 'yellow');

        // Procesar hijos en dry-run
        if (route.children) {
            for (const child of route.children) {
                await createRoute(client, child, 0, dryRun, indent + '  ');
            }
        }
        return null;
    }

    try {
        // Crear la ruta
        const response = await client.post('/desktopRoutes:create', {
            title: route.title,
            type: route.type,
            icon: icon,
            parentId: parentId,
            hideInMenu: false,
            url: route.url,
        });

        const created = response.data?.data || response.data;
        const routeId = created.id;

        // Si es página, crear y vincular schema
        let schemaUid: string | undefined;
        if (route.type === 'page' && routeId) {
            schemaUid = await createPageSchema(client, route.title, route.schemaContent) || undefined;
            if (schemaUid) {
                await client.post(`/desktopRoutes:update?filterByTk=${routeId}`, {
                    schemaUid: schemaUid
                });
            }
        }

        log(`${indent}   ✅ ID: ${routeId}${schemaUid ? ` | Schema: ${schemaUid}` : ''}`, 'green');

        // Crear hijos recursivamente
        if (route.children && routeId) {
            for (const child of route.children) {
                await createRoute(client, child, routeId, dryRun, indent + '  ');
            }
        }

        return { id: routeId, title: route.title, type: route.type, schemaUid };

    } catch (error: unknown) {
        const axiosErr = error as { response?: { data?: { errors?: { message?: string }[] } } };
        log(`${indent}   ❌ Error: ${axiosErr.response?.data?.errors?.[0]?.message || (error instanceof Error ? error.message : String(error))}`, 'red');
        return null;
    }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    const args = process.argv.slice(2);
    const configIndex = args.indexOf('--config');
    const dryRun = args.includes('--dry-run');

    if (configIndex === -1 || !args[configIndex + 1]) {
        log(`
Uso: npx tsx shared/scripts/deploy-routes.ts --config <archivo.json> [--dry-run]

Opciones:
  --config <archivo>  Archivo JSON con la configuración de rutas
  --dry-run          Simular sin aplicar cambios

Ejemplo de configuración (routes-config.json):
{
  "name": "Mi Aplicación",
  "icon": "AppstoreOutlined",
  "routes": [
    { "title": "📊 Dashboard", "type": "page", "icon": "DashboardOutlined" },
    {
      "title": "📁 Módulos",
      "type": "group",
      "children": [
        { "title": "Módulo 1", "type": "page" },
        { "title": "Módulo 2", "type": "page" }
      ]
    }
  ]
}
`, 'cyan');
        process.exit(1);
    }

    const configPath = path.resolve(args[configIndex + 1]);

    if (!fs.existsSync(configPath)) {
        log(`❌ Archivo no encontrado: ${configPath}`, 'red');
        process.exit(1);
    }

    // Cargar configuración
    let config: AppConfig;
    try {
        const content = fs.readFileSync(configPath, 'utf-8');
        config = JSON.parse(content);
    } catch (error: unknown) {
        log(`❌ Error leyendo configuración: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }

    log('╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  NocoBase Route Deployer                                   ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝', 'cyan');

    log(`\n  Aplicación: ${config.name}`, 'white');
    log(`  Configuración: ${configPath}`, 'gray');
    log(`  Servidor: ${process.env.NOCOBASE_BASE_URL}`, 'gray');

    if (dryRun) {
        log('\n  [!] Modo DRY-RUN: simulando sin aplicar cambios\n', 'yellow');
    }

    const client = createClient();

    // Verificar conexión
    try {
        await client.get('/app:getLang');
        log('  ✅ Conexión verificada\n', 'green');
    } catch {
        log('  ❌ No se puede conectar al servidor\n', 'red');
        process.exit(1);
    }

    // Crear grupo principal
    log(`📦 Creando grupo principal: ${config.name}`, 'cyan');

    let rootId: number | null = null;

    if (!dryRun) {
        try {
            const response = await client.post('/desktopRoutes:create', {
                title: config.name,
                type: 'group',
                icon: config.icon || 'AppstoreOutlined',
                hideInMenu: false,
            });
            rootId = response.data?.data?.id || response.data?.id;
            log(`   ✅ Grupo creado (ID: ${rootId})\n`, 'green');
        } catch (error: unknown) {
            log(`   ❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
            process.exit(1);
        }
    } else {
        log(`   [DRY-RUN] Se crearía grupo principal\n`, 'yellow');
    }

    // Crear rutas
    log('📋 Creando rutas:\n', 'cyan');

    let created = 0;
    let errors = 0;

    for (const route of config.routes) {
        const result = await createRoute(client, route, rootId, dryRun, '  ');
        if (result) created++;
        else if (!dryRun) errors++;
    }

    // Resumen
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'white');
    if (dryRun) {
        log('  Modo DRY-RUN completado (sin cambios aplicados)', 'yellow');
    } else {
        log(`  ✅ Rutas creadas exitosamente`, 'green');
        log(`     Grupo principal: ${config.name} (ID: ${rootId})`, 'gray');
        log(`     Total rutas: ${created}`, 'gray');
        if (errors > 0) log(`     Errores: ${errors}`, 'red');
    }
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'white');
}

main().catch(console.error);
