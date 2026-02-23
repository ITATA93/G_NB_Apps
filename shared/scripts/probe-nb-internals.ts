/**
 * probe-nb-internals.ts — Investigar las tablas y relaciones internas de NocoBase
 *
 * Mapea la base de datos interna para entender cómo se registran y vinculan
 * routes, schemas, bloques, menús, roles, etc.
 *
 * USO:
 *   npx tsx shared/scripts/probe-nb-internals.ts
 */
import { createClient, log } from './ApiClient.ts';
import fs from 'fs';
import path from 'path';

const client = createClient();
const OUT_FILE = path.join(process.cwd(), 'docs', 'NB_INTERNAL_SCHEMA_MAP.md');

interface CollectionInfo {
    name: string;
    title?: string;
    fields?: FieldInfo[];
    category?: string;
    hidden?: boolean;
    isThrough?: boolean;
}

interface FieldInfo {
    name: string;
    type: string;
    interface?: string;
    target?: string;
    foreignKey?: string;
    through?: string;
}

// UI-related table names to investigate deeply
const UI_TABLES = [
    'desktopRoutes',
    'uiSchemas',
    'uiSchemaTemplates',
    'uiSchemaTreePath',
    'roles',
    'rolesDesktopRoutes',
    'rolesUiSchemas',
    'rolesMenuItems', // may not exist
    'menuUiSchemas',  // may not exist
];

async function main() {
    log('\n🔍 === INVESTIGACIÓN PROFUNDA: TABLAS INTERNAS NocoBase ===\n', 'cyan');
    const report: string[] = [
        '# NocoBase Internal Schema Map',
        `\nGenerated: ${new Date().toISOString()}\n`,
    ];

    // ─── PHASE 1: List ALL collections ──────────────────────────────────────
    log('📋 Fase 1: Listando TODAS las colecciones...', 'white');
    let allCollections: CollectionInfo[] = [];
    try {
        const resp = await client.get('/collections:list', { paginate: false, appends: ['fields'] });
        const data = resp as Record<string, unknown>;
        allCollections = ((data.data || data) as CollectionInfo[]) || [];
        log(`  ✅ Total colecciones: ${allCollections.length}`, 'green');
    } catch (_e: unknown) {
        log(`  ⚠️ Falló /collections:list con appends. Intentando sin appends...`, 'yellow');
        try {
            const resp = await client.get('/collections:list', { paginate: false });
            const data = resp as Record<string, unknown>;
            allCollections = ((data.data || data) as CollectionInfo[]) || [];
            log(`  ✅ Total colecciones: ${allCollections.length}`, 'green');
        } catch (e2: unknown) {
            log(`  ❌ Error: ${e2 instanceof Error ? e2.message : String(e2)}`, 'red');
        }
    }

    // Classify collections
    const uiRelated: CollectionInfo[] = [];
    const systemRelated: CollectionInfo[] = [];
    const appRelated: CollectionInfo[] = [];

    for (const col of allCollections) {
        const n = col.name.toLowerCase();
        if (n.includes('ui') || n.includes('schema') || n.includes('route') ||
            n.includes('menu') || n.includes('desktop') || n.includes('block')) {
            uiRelated.push(col);
        } else if (n.startsWith('ag_') || n.startsWith('ugco_') || n.startsWith('reca_')) {
            appRelated.push(col);
        } else {
            systemRelated.push(col);
        }
    }

    report.push('## Collection Overview\n');
    report.push(`| Category | Count |`);
    report.push(`|----------|-------|`);
    report.push(`| UI-related | ${uiRelated.length} |`);
    report.push(`| System | ${systemRelated.length} |`);
    report.push(`| Application | ${appRelated.length} |`);
    report.push(`| **Total** | **${allCollections.length}** |\n`);

    // ─── PHASE 2: UI-related tables detail ──────────────────────────────────
    log('\n📊 Fase 2: Detalle de tablas UI-related...', 'white');
    report.push('## UI-Related Collections\n');

    for (const col of uiRelated) {
        log(`  🔍 ${col.name}`, 'cyan');
        report.push(`### ${col.name}\n`);
        if (col.title) report.push(`**Title:** ${col.title}\n`);

        // Get fields for this collection
        try {
            const fieldsResp = await client.get(`/collections/${col.name}/fields:list`, { paginate: false });
            const fieldsData = fieldsResp as Record<string, unknown>;
            const fields = ((fieldsData.data || fieldsData) as FieldInfo[]) || [];

            if (fields.length > 0) {
                report.push('| Field | Type | Interface | Target | ForeignKey |');
                report.push('|-------|------|-----------|--------|------------|');
                for (const f of fields) {
                    const target = f.target || '';
                    const fk = f.foreignKey || '';
                    log(`     ${f.name}: ${f.type}${target ? ' → ' + target : ''}`, 'gray');
                    report.push(`| ${f.name} | ${f.type} | ${f.interface || ''} | ${target} | ${fk} |`);
                }
                report.push('');
            }
        } catch (_e: unknown) {
            report.push(`*Could not fetch fields for ${col.name}*\n`);
        }
    }

    // ─── PHASE 3: Probe specific UI tables ──────────────────────────────────
    log('\n🎯 Fase 3: Probando tablas UI específicas...', 'white');
    report.push('## Direct API Probes\n');

    for (const table of UI_TABLES) {
        log(`  🔍 ${table}...`, 'cyan');
        report.push(`### ${table}\n`);
        try {
            const resp = await client.get(`/${table}:list`, { pageSize: 3, page: 1 });
            const data = resp as Record<string, unknown>;
            const items = (data.data || data) as Record<string, unknown>[];

            if (Array.isArray(items) && items.length > 0) {
                const sample = items[0];
                const keys = Object.keys(sample);
                log(`    ✅ ${items.length} items. Keys: ${keys.join(', ')}`, 'green');
                report.push(`**Status:** Available (${items.length}+ items)\n`);
                report.push(`**Sample keys:** \`${keys.join('`, `')}\`\n`);

                // Show sample data (sanitized)
                report.push('**Sample record:**\n');
                report.push('```json');
                report.push(JSON.stringify(sample, null, 2));
                report.push('```\n');
            } else {
                log(`    ⬜ Empty or no array`, 'gray');
                report.push(`**Status:** Empty or no data\n`);
            }
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            log(`    ❌ ${msg}`, 'red');
            report.push(`**Status:** Error — ${msg}\n`);
        }
    }

    // ─── PHASE 4: Deep-dive into RECA (functional) vs AGENDA routes ─────────
    log('\n🔬 Fase 4: Comparación RECA (funcional) vs AGENDA (no editable)...', 'white');
    report.push('## Route Comparison: RECA vs AGENDA\n');

    try {
        const routesResp = await client.get('/desktopRoutes:list', { paginate: false });
        const routesData = routesResp as Record<string, unknown>;
        const routes = ((routesData.data || routesData) as Record<string, unknown>[]) || [];

        // Find RECA and AGENDA groups
        const recaGroup = routes.find(r => r.title === 'RECA' && r.type === 'group');
        const agendaGroup = routes.find(r => r.title === 'Agenda' && r.type === 'group');

        if (recaGroup && agendaGroup) {
            report.push('### Group Comparison\n');
            report.push('```json');
            report.push('// RECA Group:');
            report.push(JSON.stringify(recaGroup, null, 2));
            report.push('\n// AGENDA Group:');
            report.push(JSON.stringify(agendaGroup, null, 2));
            report.push('```\n');

            // Get child pages
            const recaPages = routes.filter(r => r.parentId === recaGroup.id && r.type === 'page');
            const agendaPages = routes.filter(r => r.parentId === agendaGroup.id && r.type === 'page');

            if (recaPages.length > 0) {
                report.push('### RECA Page (functional) — Full record:\n');
                report.push('```json');
                report.push(JSON.stringify(recaPages[0], null, 2));
                report.push('```\n');
            }
            if (agendaPages.length > 0) {
                report.push('### AGENDA Page (non-editable) — Full record:\n');
                report.push('```json');
                report.push(JSON.stringify(agendaPages[0], null, 2));
                report.push('```\n');
            }

            // Key differences
            if (recaPages.length > 0 && agendaPages.length > 0) {
                const rp = recaPages[0];
                const ap = agendaPages[0];
                const allKeys = new Set([...Object.keys(rp), ...Object.keys(ap)]);

                report.push('### Field-by-Field Differences\n');
                report.push('| Field | RECA | AGENDA | Match? |');
                report.push('|-------|------|--------|--------|');
                for (const key of [...allKeys].sort()) {
                    const rv = JSON.stringify(rp[key]);
                    const av = JSON.stringify(ap[key]);
                    const match = rv === av ? '✅' : '❌';
                    if (rv !== av) {
                        report.push(`| **${key}** | ${rv || 'undefined'} | ${av || 'undefined'} | ${match} |`);
                    }
                }
                report.push('');
            }
        }
    } catch (e: unknown) {
        report.push(`*Error comparing routes: ${e instanceof Error ? e.message : String(e)}*\n`);
    }

    // ─── PHASE 5: rolesDesktopRoutes bindings ───────────────────────────────
    log('\n🔐 Fase 5: Bindings roles ↔ routes...', 'white');
    report.push('## Role-Route Bindings\n');

    try {
        const resp = await client.get('/rolesDesktopRoutes:list', { paginate: false });
        const data = resp as Record<string, unknown>;
        const bindings = ((data.data || data) as Record<string, unknown>[]) || [];

        log(`  Total bindings: ${bindings.length}`, 'green');
        report.push(`**Total bindings:** ${bindings.length}\n`);

        if (bindings.length > 0) {
            report.push('**Sample binding:**\n');
            report.push('```json');
            report.push(JSON.stringify(bindings[0], null, 2));
            report.push('```\n');

            // Count per role
            const byRole: Record<string, number> = {};
            for (const b of bindings) {
                const role = String(b.roleName || b.role || 'unknown');
                byRole[role] = (byRole[role] || 0) + 1;
            }
            report.push('**Bindings per role:**\n');
            for (const [role, count] of Object.entries(byRole)) {
                report.push(`- ${role}: ${count}`);
            }
            report.push('');
        }
    } catch (e: unknown) {
        report.push(`*Error: ${e instanceof Error ? e.message : String(e)}*\n`);
    }

    // ─── PHASE 6: uiSchemaTreePath — how schemas are nested ─────────────────
    log('\n🌳 Fase 6: Schema tree paths...', 'white');
    report.push('## Schema Tree Paths\n');

    try {
        const resp = await client.get('/uiSchemaTreePath:list', { pageSize: 20, page: 1 });
        const data = resp as Record<string, unknown>;
        const paths = ((data.data || data) as Record<string, unknown>[]) || [];

        log(`  Sample paths: ${paths.length}`, 'green');
        if (paths.length > 0) {
            report.push('**Sample tree path:**\n');
            report.push('```json');
            report.push(JSON.stringify(paths.slice(0, 5), null, 2));
            report.push('```\n');
        }
    } catch (e: unknown) {
        report.push(`*Note: uiSchemaTreePath — ${e instanceof Error ? e.message : String(e)}*\n`);
    }

    // ─── PHASE 7: Examine a working RECA page schema vs AGENDA ──────────────
    log('\n📄 Fase 7: Schema comparison (RECA page vs AGENDA page)...', 'white');
    report.push('## Schema Comparison\n');

    try {
        const routesResp = await client.get('/desktopRoutes:list', { paginate: false });
        const routesData = routesResp as Record<string, unknown>;
        const routes = ((routesData.data || routesData) as Record<string, unknown>[]) || [];

        const recaGroup = routes.find(r => r.title === 'RECA' && r.type === 'group');
        const agendaGroup = routes.find(r => r.title === 'Agenda' && r.type === 'group');

        if (recaGroup && agendaGroup) {
            const recaPage = routes.find(r => r.parentId === recaGroup.id && r.type === 'page');
            const agendaPage = routes.find(r => r.parentId === agendaGroup.id && r.type === 'page');

            if (recaPage?.schemaUid) {
                const schema = await client.get(`/uiSchemas:getJsonSchema/${recaPage.schemaUid}`, {});
                report.push(`### RECA Page Schema (\`${recaPage.schemaUid}\`)\n`);
                report.push('```json');
                report.push(JSON.stringify((schema as Record<string, unknown>).data || schema, null, 2));
                report.push('```\n');
            }

            if (agendaPage?.schemaUid) {
                const schema = await client.get(`/uiSchemas:getJsonSchema/${agendaPage.schemaUid}`, {});
                report.push(`### AGENDA Page Schema (\`${agendaPage.schemaUid}\`)\n`);
                report.push('```json');
                report.push(JSON.stringify((schema as Record<string, unknown>).data || schema, null, 2));
                report.push('```\n');
            }
        }
    } catch (e: unknown) {
        report.push(`*Error: ${e instanceof Error ? e.message : String(e)}*\n`);
    }

    // ─── Save report ────────────────────────────────────────────────────────
    fs.writeFileSync(OUT_FILE, report.join('\n'));
    log(`\n📁 Reporte guardado: ${OUT_FILE}`, 'cyan');
    log(`   ${report.length} líneas, ${allCollections.length} tablas mapeadas`, 'gray');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
