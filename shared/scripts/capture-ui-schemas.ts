/**
 * capture-ui-schemas.ts — Capturar y catalogar schemas generados por NocoBase UI
 *
 * Herramienta de reverse-engineering: después de diseñar visualmente en la UI,
 * este script exporta los schemas exactos generados por NocoBase para
 * construir un catálogo de templates reutilizables.
 *
 * USO:
 *   npx tsx shared/scripts/capture-ui-schemas.ts snapshot             # Capturar todas las páginas
 *   npx tsx shared/scripts/capture-ui-schemas.ts snapshot --page <uid> # Capturar una página específica
 *   npx tsx shared/scripts/capture-ui-schemas.ts diff                  # Comparar con snapshot anterior
 *   npx tsx shared/scripts/capture-ui-schemas.ts catalog               # Ver catálogo de templates
 *   npx tsx shared/scripts/capture-ui-schemas.ts reset-pages           # Resetear páginas AGENDA a vacío
 */
import { createClient, log } from './ApiClient.ts';
import fs from 'fs';
import path from 'path';

const client = createClient();
const SNAPSHOTS_DIR = path.join(process.cwd(), 'docs', 'ui-snapshots');
const CATALOG_DIR = path.join(process.cwd(), 'docs', 'ui-catalog');

// ─── Types ──────────────────────────────────────────────────────────────────

interface RouteInfo {
    id: number;
    title: string;
    type: string;
    schemaUid: string | null;
    parentId: number | null;
}

interface SchemaSnapshot {
    capturedAt: string;
    route: RouteInfo;
    schema: Record<string, unknown>;
    blockTypes: string[];
    collections: string[];
    componentTree: string[];
}

interface CatalogEntry {
    name: string;
    description: string;
    capturedFrom: string;
    capturedAt: string;
    blockType: string;
    collection?: string;
    schema: Record<string, unknown>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/** Extract useful metadata from a schema tree */
function analyzeSchema(schema: Record<string, unknown>, _prefix = ''): {
    blockTypes: string[];
    collections: string[];
    componentTree: string[];
} {
    const blockTypes: string[] = [];
    const collections: string[] = [];
    const componentTree: string[] = [];

    function walk(node: Record<string, unknown>, depth: number) {
        if (!node || typeof node !== 'object') return;

        const component = node['x-component'] as string | undefined;
        const decorator = node['x-decorator'] as string | undefined;
        const uid = node['x-uid'] as string | undefined;
        const decoratorProps = node['x-decorator-props'] as Record<string, unknown> | undefined;

        if (component) {
            componentTree.push(`${'  '.repeat(depth)}${component}${decorator ? ` [${decorator}]` : ''}${uid ? ` (${uid})` : ''}`);
        }

        // Detect block types
        if (decorator === 'TableBlockProvider') blockTypes.push('table');
        if (decorator === 'FormBlockProvider') blockTypes.push('form');
        if (decorator === 'DetailsBlockProvider') blockTypes.push('details');
        if (decorator === 'CalendarBlockProvider') blockTypes.push('calendar');
        if (decorator === 'ChartBlockProvider' || decorator === 'ChartRendererProvider') blockTypes.push('chart');
        if (component === 'Markdown.Void') blockTypes.push('markdown');
        if (decorator === 'KanbanBlockProvider') blockTypes.push('kanban');
        if (decorator === 'ListBlockProvider') blockTypes.push('list');

        // Detect collections
        if (decoratorProps?.collection) {
            collections.push(decoratorProps.collection as string);
        }

        // Walk properties
        const props = node.properties as Record<string, Record<string, unknown>> | undefined;
        if (props) {
            for (const [_key, child] of Object.entries(props)) {
                walk(child, depth + 1);
            }
        }
    }

    walk(schema, 0);
    return {
        blockTypes: [...new Set(blockTypes)],
        collections: [...new Set(collections)],
        componentTree
    };
}

/** Extract individual blocks from a page schema for cataloging */
function extractBlocks(schema: Record<string, unknown>): { name: string; schema: Record<string, unknown>; blockType: string; collection?: string }[] {
    const blocks: { name: string; schema: Record<string, unknown>; blockType: string; collection?: string }[] = [];

    function findBlocks(node: Record<string, unknown>, path: string) {
        const decorator = node['x-decorator'] as string | undefined;
        const component = node['x-component'] as string | undefined;

        // A "block" is typically a node with a block provider decorator
        const isBlock = decorator && [
            'TableBlockProvider', 'FormBlockProvider', 'DetailsBlockProvider',
            'CalendarBlockProvider', 'ChartBlockProvider', 'ChartRendererProvider',
            'KanbanBlockProvider', 'ListBlockProvider'
        ].includes(decorator);

        const isMarkdown = component === 'Markdown.Void';

        if (isBlock || isMarkdown) {
            const decoratorProps = node['x-decorator-props'] as Record<string, unknown> | undefined;
            const blockType = isMarkdown ? 'markdown' :
                decorator?.replace('BlockProvider', '').replace('RendererProvider', '').toLowerCase() || 'unknown';
            blocks.push({
                name: `${blockType}_${decoratorProps?.collection || 'standalone'}`,
                schema: node,
                blockType,
                collection: decoratorProps?.collection as string | undefined,
            });
            return; // Don't recurse deeper into this block
        }

        const props = node.properties as Record<string, Record<string, unknown>> | undefined;
        if (props) {
            for (const [key, child] of Object.entries(props)) {
                findBlocks(child, `${path}.${key}`);
            }
        }
    }

    findBlocks(schema, 'root');
    return blocks;
}

// ─── Commands ───────────────────────────────────────────────────────────────

async function snapshotAll(targetUid?: string) {
    ensureDir(SNAPSHOTS_DIR);

    log('\n📸 === CAPTURANDO SCHEMAS ===\n', 'cyan');

    // Get all routes
    const routesResp = await client.get('/desktopRoutes:list', { paginate: false });
    const routesData = routesResp as Record<string, unknown>;
    const allRoutes = ((routesData.data || routesData) as RouteInfo[]) || [];
    const routes = allRoutes.filter(r => r.type === 'page' && r.schemaUid);

    if (targetUid) {
        const target = routes.find(r => r.schemaUid === targetUid);
        if (!target) {
            log(`❌ No se encontró página con schemaUid: ${targetUid}`, 'red');
            return;
        }
        await snapshotPage(target);
        return;
    }

    const snapshots: SchemaSnapshot[] = [];

    for (const route of routes) {
        const snapshot = await snapshotPage(route);
        if (snapshot) snapshots.push(snapshot);
    }

    // Save combined snapshot
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outFile = path.join(SNAPSHOTS_DIR, `snapshot_${timestamp}.json`);
    fs.writeFileSync(outFile, JSON.stringify(snapshots, null, 2));
    log(`\n📁 Snapshot guardado: ${path.basename(outFile)} (${snapshots.length} páginas)`, 'cyan');

    // Generate readable report
    const reportFile = path.join(SNAPSHOTS_DIR, `snapshot_${timestamp}.md`);
    generateSnapshotReport(snapshots, reportFile);
    log(`📄 Reporte: ${path.basename(reportFile)}`, 'cyan');
}

async function snapshotPage(route: RouteInfo): Promise<SchemaSnapshot | null> {
    if (!route.schemaUid) return null;

    try {
        const resp = await client.get(`/uiSchemas:getJsonSchema/${route.schemaUid}`, {});
        const respData = resp as Record<string, unknown>;
        const schema = (respData.data || respData) as Record<string, unknown>;
        const analysis = analyzeSchema(schema);

        const snapshot: SchemaSnapshot = {
            capturedAt: new Date().toISOString(),
            route: {
                id: route.id,
                title: route.title,
                type: route.type,
                schemaUid: route.schemaUid,
                parentId: route.parentId,
            },
            schema,
            ...analysis,
        };

        const blockCount = analysis.blockTypes.length;
        const icon = blockCount > 0 ? '✅' : '⬜';
        log(`  ${icon} "${route.title}" → ${blockCount} block(s): [${analysis.blockTypes.join(', ') || 'empty'}] ${analysis.collections.length > 0 ? `collections: [${analysis.collections.join(', ')}]` : ''}`, blockCount > 0 ? 'green' : 'gray');

        // Also save individual page schema
        const safeTitle = route.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
        const pageFile = path.join(SNAPSHOTS_DIR, `page_${safeTitle}_${route.schemaUid}.json`);
        fs.writeFileSync(pageFile, JSON.stringify(snapshot, null, 2));

        return snapshot;
    } catch (error: unknown) {
        log(`  ❌ Error capturando "${route.title}": ${error instanceof Error ? error.message : String(error)}`, 'red');
        return null;
    }
}

function generateSnapshotReport(snapshots: SchemaSnapshot[], outFile: string) {
    const lines: string[] = [
        '# UI Schema Snapshot Report',
        `\nCaptured: ${new Date().toISOString()}\n`,
        '## Pages Summary\n',
        '| Page | Schema UID | Blocks | Collections |',
        '|------|-----------|--------|-------------|',
    ];

    for (const s of snapshots) {
        lines.push(`| ${s.route.title} | \`${s.route.schemaUid}\` | ${s.blockTypes.join(', ') || '—'} | ${s.collections.join(', ') || '—'} |`);
    }

    lines.push('\n## Component Trees\n');
    for (const s of snapshots) {
        if (s.componentTree.length > 0) {
            lines.push(`### ${s.route.title}\n`);
            lines.push('```');
            lines.push(s.componentTree.join('\n'));
            lines.push('```\n');
        }
    }

    fs.writeFileSync(outFile, lines.join('\n'));
}

async function diffSnapshots() {
    ensureDir(SNAPSHOTS_DIR);
    const files = fs.readdirSync(SNAPSHOTS_DIR)
        .filter(f => f.startsWith('snapshot_') && f.endsWith('.json'))
        .sort();

    if (files.length < 2) {
        log('⚠️ Se necesitan al menos 2 snapshots para comparar. Ejecuta "snapshot" primero.', 'yellow');
        return;
    }

    const prev = JSON.parse(fs.readFileSync(path.join(SNAPSHOTS_DIR, files[files.length - 2]), 'utf-8')) as SchemaSnapshot[];
    const curr = JSON.parse(fs.readFileSync(path.join(SNAPSHOTS_DIR, files[files.length - 1]), 'utf-8')) as SchemaSnapshot[];

    log('\n🔄 === DIFF entre snapshots ===\n', 'cyan');
    log(`  Anterior: ${files[files.length - 2]}`, 'gray');
    log(`  Actual:   ${files[files.length - 1]}`, 'gray');

    // Compare pages
    const prevPages = new Map(prev.map(s => [s.route.schemaUid, s]));
    const currPages = new Map(curr.map(s => [s.route.schemaUid, s]));

    for (const [uid, currSnap] of currPages) {
        const prevSnap = prevPages.get(uid);
        if (!prevSnap) {
            log(`  ➕ NUEVA: "${currSnap.route.title}" [${currSnap.blockTypes.join(', ')}]`, 'green');
        } else {
            const prevJson = JSON.stringify(prevSnap.schema);
            const currJson = JSON.stringify(currSnap.schema);
            if (prevJson !== currJson) {
                log(`  🔄 MODIFICADA: "${currSnap.route.title}"`, 'yellow');
                log(`     Blocks antes: [${prevSnap.blockTypes.join(', ')}] → ahora: [${currSnap.blockTypes.join(', ')}]`, 'gray');

                // Extract new blocks
                const prevBlocks = extractBlocks(prevSnap.schema);
                const currBlocks = extractBlocks(currSnap.schema);
                const newBlocks = currBlocks.filter(cb =>
                    !prevBlocks.some(pb => JSON.stringify(pb.schema) === JSON.stringify(cb.schema))
                );

                if (newBlocks.length > 0) {
                    log(`     📦 ${newBlocks.length} bloque(s) nuevos detectados:`, 'white');
                    for (const block of newBlocks) {
                        log(`       - ${block.blockType}(${block.collection || 'N/A'})`, 'green');

                        // Auto-catalog new blocks
                        catalogBlock({
                            name: block.name,
                            description: `Auto-capturado desde "${currSnap.route.title}"`,
                            capturedFrom: currSnap.route.title,
                            capturedAt: currSnap.capturedAt,
                            blockType: block.blockType,
                            collection: block.collection,
                            schema: block.schema,
                        });
                    }
                }
            }
        }
    }

    for (const [uid, prevSnap] of prevPages) {
        if (!currPages.has(uid)) {
            log(`  ➖ ELIMINADA: "${prevSnap.route.title}"`, 'red');
        }
    }
}

function catalogBlock(entry: CatalogEntry) {
    ensureDir(CATALOG_DIR);
    const safeName = entry.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const outFile = path.join(CATALOG_DIR, `${safeName}.json`);
    fs.writeFileSync(outFile, JSON.stringify(entry, null, 2));
    log(`       💾 Catalogado: ${safeName}.json`, 'cyan');
}

async function showCatalog() {
    ensureDir(CATALOG_DIR);
    const files = fs.readdirSync(CATALOG_DIR).filter(f => f.endsWith('.json'));

    if (files.length === 0) {
        log('\n📂 Catálogo vacío. Diseña bloques en la UI, luego ejecuta "snapshot" + "diff".', 'yellow');
        return;
    }

    log(`\n📚 === CATÁLOGO DE TEMPLATES (${files.length}) ===\n`, 'cyan');

    for (const file of files) {
        const entry = JSON.parse(fs.readFileSync(path.join(CATALOG_DIR, file), 'utf-8')) as CatalogEntry;
        log(`  📦 ${entry.name}`, 'white');
        log(`     Tipo: ${entry.blockType} | Colección: ${entry.collection || 'N/A'}`, 'gray');
        log(`     Capturado desde: "${entry.capturedFrom}" (${entry.capturedAt})`, 'gray');
        log(`     Archivo: ${file}`, 'gray');
    }
}

async function resetPages() {
    log('\n🔄 === RESET: Páginas AGENDA a schema vacío ===\n', 'cyan');
    log('  Esto elimina los bloques actuales y deja las páginas con "Añadir bloque"\n', 'yellow');

    // Get AGENDA routes
    const routesResp = await client.get('/desktopRoutes:list', { paginate: false });
    const routesData = routesResp as Record<string, unknown>;
    const allRoutes = ((routesData.data || routesData) as RouteInfo[]) || [];

    // Find Agenda group
    const agendaGroup = allRoutes.find(r => r.title === 'Agenda' && r.type === 'group');
    if (!agendaGroup) {
        log('  ❌ Grupo "Agenda" no encontrado', 'red');
        return;
    }

    const agendaPages = allRoutes.filter(r => r.type === 'page' && r.parentId === agendaGroup.id);
    log(`  Encontradas ${agendaPages.length} páginas AGENDA\n`, 'white');

    for (const page of agendaPages) {
        if (!page.schemaUid) {
            log(`  ⬜ "${page.title}" — ya sin schema`, 'gray');
            continue;
        }

        try {
            // 1. Remove old schema
            await client.post(`/uiSchemas:remove/${page.schemaUid}`, {});

            // 2. Create a new empty Page schema with just Grid + initializer
            const newSchema = {
                type: 'void',
                'x-component': 'Page',
                'x-async': true,
                properties: {
                    grid: {
                        type: 'void',
                        'x-component': 'Grid',
                        'x-initializer': 'page:addBlock',
                        properties: {}
                    }
                }
            };

            const insertResp = await client.post('/uiSchemas:insert', newSchema);
            const insertData = (insertResp as Record<string, unknown>).data as Record<string, unknown>;
            const newUid = insertData?.['x-uid'] as string;

            if (newUid) {
                // 3. Bind new schema to route
                await client.post(`/desktopRoutes:update?filterByTk=${page.id}`, { schemaUid: newUid });
                log(`  ✅ "${page.title}" → schema reseteado (${page.schemaUid} → ${newUid})`, 'green');
            } else {
                log(`  ⚠️ "${page.title}" — no se pudo crear nuevo schema`, 'yellow');
            }
        } catch (error: unknown) {
            log(`  ❌ "${page.title}": ${error instanceof Error ? error.message : String(error)}`, 'red');
        }
    }

    log('\n✅ Páginas listas. Usa la UI de NocoBase para diseñar bloques visualmente.', 'green');
    log('   Luego ejecuta: npx tsx shared/scripts/capture-ui-schemas.ts snapshot', 'gray');
    log('   Y después:     npx tsx shared/scripts/capture-ui-schemas.ts diff', 'gray');
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    const command = process.argv[2] || 'snapshot';
    const pageFlag = process.argv.indexOf('--page');
    const targetUid = pageFlag !== -1 ? process.argv[pageFlag + 1] : undefined;

    log('📷 NocoBase UI Schema Capture Tool\n', 'cyan');

    switch (command) {
        case 'snapshot':
            await snapshotAll(targetUid);
            break;
        case 'diff':
            await diffSnapshots();
            break;
        case 'catalog':
            await showCatalog();
            break;
        case 'reset-pages':
            await resetPages();
            break;
        default:
            log('Comandos: snapshot | diff | catalog | reset-pages', 'white');
    }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
