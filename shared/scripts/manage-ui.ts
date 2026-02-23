/**
 * manage-ui.ts - Gestión de UI Schemas (bloques, páginas, menús) NocoBase via API
 *
 * Uso:
 *   tsx shared/scripts/manage-ui.ts menus                        # listar menús del sistema
 *   tsx shared/scripts/manage-ui.ts pages                        # listar páginas
 *   tsx shared/scripts/manage-ui.ts schema <uid>                 # obtener schema por UID
 *   tsx shared/scripts/manage-ui.ts tree <uid>                   # árbol de schema (recursivo)
 *   tsx shared/scripts/manage-ui.ts export <uid> --file out.json # exportar schema a archivo
 *   tsx shared/scripts/manage-ui.ts import --file schema.json    # importar schema desde archivo
 *   tsx shared/scripts/manage-ui.ts delete <uid>                 # eliminar schema
 *   tsx shared/scripts/manage-ui.ts templates                    # listar block templates
 */

import { createClient, log } from './ApiClient';
import fs from 'fs';
import path from 'path';

const client = createClient();

function parseArgs(args: string[]): { flags: Record<string, string>, positional: string[] } {
    const flags: Record<string, string> = {};
    const positional: string[] = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].slice(2);
            flags[key] = args[i + 1] || '';
            i++;
        } else {
            positional.push(args[i]);
        }
    }
    return { flags, positional };
}

const SCHEMA_TYPES: Record<string, string> = {
    'void': '📦 Contenedor',
    'object': '📋 Objeto',
    'array': '📊 Lista/Tabla',
    'string': '📝 Texto',
    'number': '🔢 Número',
    'boolean': '✅ Booleano',
};

const COMPONENT_ICONS: Record<string, string> = {
    'Menu': '📑',
    'Menu.Item': '📄',
    'Menu.SubMenu': '📁',
    'Page': '📃',
    'Grid': '🔲',
    'Grid.Row': '➡️',
    'Grid.Col': '⬇️',
    'CardItem': '🃏',
    'TableBlockProvider': '📊',
    'FormBlockProvider': '📝',
    'DetailsBlockProvider': '🔍',
    'CalendarBlockProvider': '📅',
    'KanbanBlockProvider': '📋',
    'ChartBlockProvider': '📈',
    'Action': '⚡',
    'Action.Drawer': '📤',
    'Action.Modal': '🪟',
};

async function listMenus() {
    log('📑 Listando menús del sistema...\n', 'cyan');

    try {
        const response = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const schema = response.data;

        if (!schema || !schema.properties) {
            log('  No se encontraron menús.', 'yellow');
            return;
        }

        const properties = schema.properties;
        const menuItems = Object.entries(properties);

        log(`  Total: ${menuItems.length} elemento(s) de menú\n`, 'green');

        for (const [key, item] of menuItems) {
            const menuItem = item as Record<string, unknown>;
            const component = menuItem['x-component'] || '';
            const isSubmenu = component === 'Menu.SubMenu';
            const icon = isSubmenu ? '📁' : '📄';
            const title = menuItem.title || menuItem['x-component-props']?.title || key;

            log(`  ${icon} ${title}`, 'white');
            log(`      UID: ${menuItem['x-uid'] || key}  |  Componente: ${component}`, 'gray');

            // List sub-items if submenu
            if (isSubmenu && menuItem.properties) {
                const subItems = Object.entries(menuItem.properties);
                for (const [subKey, subItem] of subItems) {
                    const sub = subItem as Record<string, unknown>;
                    const subTitle = sub.title || sub['x-component-props']?.title || subKey;
                    log(`      📄 ${subTitle}`, 'gray');
                    log(`          UID: ${sub['x-uid'] || subKey}`, 'gray');
                }
            }
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        log('  Nota: El UID del menú raíz puede variar según la versión.', 'yellow');
    }
}

async function listPages() {
    log('📃 Listando páginas...\n', 'cyan');

    try {
        // First get the menu to find page UIDs
        const response = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const schema = response.data;

        if (!schema || !schema.properties) {
            log('  No se encontraron páginas.', 'yellow');
            return;
        }

        const pages: { title: string; uid: string; path: string; component: string }[] = [];

        function extractPages(props: Record<string, unknown>, parentPath: string = '') {
            for (const [key, value] of Object.entries(props)) {
                const item = value as Record<string, unknown>;
                const title = item.title || item['x-component-props']?.title || key;
                const uid = item['x-uid'] || key;
                const component = item['x-component'] || '';
                const currentPath = parentPath ? `${parentPath} > ${title}` : title;

                if (component === 'Menu.Item' || component === 'Menu.URL') {
                    pages.push({ title, uid, path: currentPath, component });
                }

                if (item.properties) {
                    extractPages(item.properties, currentPath);
                }
            }
        }

        extractPages(schema.properties);

        if (pages.length === 0) {
            log('  No se encontraron páginas individuales.', 'yellow');
            return;
        }

        log(`  Total: ${pages.length} página(s)\n`, 'green');
        for (const p of pages) {
            log(`  📄 ${p.path}`, 'white');
            log(`      UID: ${p.uid}  |  Tipo: ${p.component}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function getSchema(uid: string) {
    log(`🔍 Obteniendo schema "${uid}"...\n`, 'cyan');

    try {
        const response = await client.get(`/uiSchemas:getJsonSchema/${uid}`);
        const schema = response.data;

        if (!schema) {
            log(`❌ Schema "${uid}" no encontrado.`, 'red');
            return;
        }

        const component = schema['x-component'] || 'N/A';
        const type = schema.type || 'N/A';
        const title = schema.title || schema['x-component-props']?.title || 'Sin título';
        const typeIcon = SCHEMA_TYPES[type] || '❓';

        log(`  Schema: ${title}`, 'white');
        log(`  UID:        ${uid}`, 'gray');
        log(`  Tipo:       ${typeIcon} ${type}`, 'gray');
        log(`  Componente: ${COMPONENT_ICONS[component] || '🔧'} ${component}`, 'gray');

        if (schema['x-decorator']) log(`  Decorator:  ${schema['x-decorator']}`, 'gray');
        if (schema['x-collection-field']) log(`  Campo:      ${schema['x-collection-field']}`, 'gray');

        const propCount = schema.properties ? Object.keys(schema.properties).length : 0;
        log(`  Hijos:      ${propCount} propiedad(es)`, 'gray');

        log('\n  Schema completo:', 'white');
        log(JSON.stringify(schema, null, 2), 'gray');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function schemaTree(uid: string, depth: number = 0, maxDepth: number = 5) {
    if (depth === 0) {
        log(`🌳 Árbol de schema "${uid}"...\n`, 'cyan');
    }

    try {
        const response = await client.get(`/uiSchemas:getJsonSchema/${uid}`);
        const schema = response.data;

        if (!schema) {
            if (depth === 0) log(`❌ Schema "${uid}" no encontrado.`, 'red');
            return;
        }

        const indent = '  '.repeat(depth + 1);
        const component = schema['x-component'] || '';
        const type = schema.type || '';
        const title = schema.title || schema['x-component-props']?.title || '';
        const icon = COMPONENT_ICONS[component] || SCHEMA_TYPES[type]?.split(' ')[0] || '📌';
        const label = title ? `${title} ` : '';

        log(`${indent}${icon} ${label}[${component || type}] (${uid})`, 'white');

        if (schema.properties && depth < maxDepth) {
            for (const [key, value] of Object.entries(schema.properties)) {
                const child = value as Record<string, unknown>;
                const childUid = child['x-uid'] || key;
                const childComponent = child['x-component'] || '';
                const childTitle = child.title || child['x-component-props']?.title || '';
                const childIcon = COMPONENT_ICONS[childComponent] || '📌';
                const childLabel = childTitle ? `${childTitle} ` : '';

                log(`${'  '.repeat(depth + 2)}${childIcon} ${childLabel}[${childComponent || child.type || ''}] (${childUid})`, 'gray');

                // Recurse into children if they have properties
                if (child.properties && depth + 1 < maxDepth) {
                    for (const [subKey, subValue] of Object.entries(child.properties)) {
                        const sub = subValue as Record<string, unknown>;
                        const subUid = sub['x-uid'] || subKey;
                        const subComponent = sub['x-component'] || '';
                        const subTitle = sub.title || sub['x-component-props']?.title || '';
                        const subIcon = COMPONENT_ICONS[subComponent] || '📌';
                        const subLabel = subTitle ? `${subTitle} ` : '';

                        log(`${'  '.repeat(depth + 3)}${subIcon} ${subLabel}[${subComponent || sub.type || ''}] (${subUid})`, 'gray');
                    }
                }
            }
        }
    } catch (error: unknown) {
        if (depth === 0) log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function exportSchema(uid: string, flags: Record<string, string>) {
    log(`📤 Exportando schema "${uid}"...\n`, 'cyan');

    try {
        const response = await client.get(`/uiSchemas:getJsonSchema/${uid}`);
        const schema = response.data;

        if (!schema) {
            log(`❌ Schema "${uid}" no encontrado.`, 'red');
            return;
        }

        const filename = flags.file || `schema-${uid}.json`;
        const outputPath = path.resolve(process.cwd(), filename);

        fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2), 'utf-8');
        log(`✅ Schema exportado: ${outputPath}`, 'green');

        const size = fs.statSync(outputPath).size;
        log(`  Tamaño: ${(size / 1024).toFixed(1)} KB`, 'gray');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function importSchema(flags: Record<string, string>) {
    const filePath = flags.file;
    if (!filePath) {
        log('❌ Se requiere --file <archivo.json>', 'red');
        process.exit(1);
    }

    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
        log(`❌ Archivo no encontrado: ${resolvedPath}`, 'red');
        process.exit(1);
    }

    log(`📥 Importando schema desde ${path.basename(resolvedPath)}...\n`, 'cyan');

    try {
        const content = fs.readFileSync(resolvedPath, 'utf-8');
        const schema = JSON.parse(content);

        const parentUid = flags.parent || 'nocobase-admin-menu';
        const response = await client.post(`/uiSchemas:insertAdjacent/${parentUid}?position=beforeEnd`, {
            schema
        });

        log(`✅ Schema importado exitosamente.`, 'green');
        if (response.data) {
            log(JSON.stringify(response.data, null, 2), 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        if (error instanceof SyntaxError) {
            log('  El archivo no contiene JSON válido.', 'yellow');
        }
    }
}

async function deleteSchema(uid: string) {
    log(`🗑️  Eliminando schema "${uid}"...\n`, 'cyan');
    log('  ⚠️  Esto eliminará el bloque/página y todos sus hijos.', 'yellow');

    try {
        await client.post(`/uiSchemas:remove/${uid}`);
        log(`✅ Schema "${uid}" eliminado.`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function listTemplates() {
    log('📋 Listando block templates...\n', 'cyan');

    try {
        const response = await client.get('/uiSchemaTemplates:list', {
            pageSize: 100,
            sort: ['-createdAt']
        });
        const templates = response.data || [];

        if (templates.length === 0) {
            log('  No se encontraron templates.', 'yellow');
            return;
        }

        log(`  Total: ${templates.length} template(s)\n`, 'green');

        for (const t of templates) {
            const component = t.componentName || 'N/A';
            const icon = COMPONENT_ICONS[component] || '📋';
            log(`  ${icon} [${t.key || t.id}] ${t.name || 'Sin nombre'}`, 'white');
            log(`      Componente: ${component}  |  Colección: ${t.collectionName || 'N/A'}`, 'gray');
            log(`      Creado: ${t.createdAt || 'N/A'}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function main() {
    const args = process.argv.slice(2);
    const { flags, positional } = parseArgs(args);
    const command = positional[0];

    try {
        switch (command) {
            case 'menus':
                await listMenus();
                break;
            case 'pages':
                await listPages();
                break;
            case 'schema':
                if (!positional[1]) { log('❌ Uso: schema <uid>', 'red'); process.exit(1); }
                await getSchema(positional[1]);
                break;
            case 'tree':
                if (!positional[1]) { log('❌ Uso: tree <uid>', 'red'); process.exit(1); }
                await schemaTree(positional[1]);
                break;
            case 'export':
                if (!positional[1]) { log('❌ Uso: export <uid> [--file out.json]', 'red'); process.exit(1); }
                await exportSchema(positional[1], flags);
                break;
            case 'import':
                await importSchema(flags);
                break;
            case 'delete':
                if (!positional[1]) { log('❌ Uso: delete <uid>', 'red'); process.exit(1); }
                await deleteSchema(positional[1]);
                break;
            case 'templates':
                await listTemplates();
                break;
            default:
                log('Uso: manage-ui.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  menus                         Listar menús del sistema', 'gray');
                log('  pages                         Listar páginas', 'gray');
                log('  schema <uid>                  Obtener schema por UID', 'gray');
                log('  tree <uid>                    Árbol de schema (recursivo)', 'gray');
                log('  export <uid> [--file f.json]  Exportar schema a archivo', 'gray');
                log('  import --file f.json          Importar schema desde archivo', 'gray');
                log('  delete <uid>                  Eliminar schema', 'gray');
                log('  templates                     Listar block templates', 'gray');
                log('\nUIDs comunes:', 'white');
                log('  nocobase-admin-menu           Menú principal de administración', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
