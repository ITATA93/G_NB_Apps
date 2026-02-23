/**
 * snapshot-nb-tables.ts — Snapshot de tablas internas NocoBase (before/after)
 *
 * Captura el estado de todas las tablas relacionadas con UI para comparar
 * antes y después de crear una página desde la UI de NocoBase.
 *
 * USO:
 *   npx tsx shared/scripts/snapshot-nb-tables.ts before    # Snapshot ANTES
 *   npx tsx shared/scripts/snapshot-nb-tables.ts after     # Snapshot DESPUÉS
 *   npx tsx shared/scripts/snapshot-nb-tables.ts diff      # Comparar before vs after
 */
import { createClient, log } from './ApiClient.ts';
import fs from 'fs';
import path from 'path';

const client = createClient();
const SNAPSHOT_DIR = path.join(process.cwd(), 'docs', 'nb-table-snapshots');

// Tables to monitor
const TABLES_TO_SNAPSHOT = [
    { name: 'desktopRoutes', endpoint: '/desktopRoutes:list', paginate: false },
    { name: 'uiSchemas', endpoint: '/uiSchemas:list', paginate: false },
    { name: 'uiSchemaTreePath', endpoint: '/uiSchemaTreePath:list', paginate: false },
    { name: 'uiSchemaTemplates', endpoint: '/uiSchemaTemplates:list', paginate: false },
    { name: 'rolesDesktopRoutes', endpoint: '/rolesDesktopRoutes:list', paginate: false },
];

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function takeSnapshot(label: string) {
    ensureDir(SNAPSHOT_DIR);
    log(`\n📸 === SNAPSHOT: ${label.toUpperCase()} ===\n`, 'cyan');

    const snapshot: Record<string, unknown[]> = {};

    for (const table of TABLES_TO_SNAPSHOT) {
        log(`  📋 ${table.name}...`, 'white');
        try {
            const params: Record<string, unknown> = {};
            if (table.paginate === false) params.paginate = false;
            else { params.pageSize = 9999; params.page = 1; }

            const resp = await client.get(table.endpoint, params);
            const data = resp as Record<string, unknown>;
            let items = (data.data || data) as unknown[];

            if (!Array.isArray(items)) items = [];

            snapshot[table.name] = items;
            log(`    ✅ ${items.length} registros`, 'green');
        } catch (e: unknown) {
            log(`    ❌ ${e instanceof Error ? e.message : String(e)}`, 'red');
            snapshot[table.name] = [];
        }
    }

    const outFile = path.join(SNAPSHOT_DIR, `${label}.json`);
    fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2));
    log(`\n📁 Snapshot guardado: ${outFile}`, 'cyan');

    // Print summary
    log('\n  Resumen:', 'white');
    for (const [name, items] of Object.entries(snapshot)) {
        log(`    ${name}: ${(items as unknown[]).length} registros`, 'gray');
    }
}

async function diffSnapshots() {
    const beforeFile = path.join(SNAPSHOT_DIR, 'before.json');
    const afterFile = path.join(SNAPSHOT_DIR, 'after.json');

    if (!fs.existsSync(beforeFile) || !fs.existsSync(afterFile)) {
        log('❌ Necesitas ambos: before.json y after.json', 'red');
        return;
    }

    const before = JSON.parse(fs.readFileSync(beforeFile, 'utf-8')) as Record<string, Record<string, unknown>[]>;
    const after = JSON.parse(fs.readFileSync(afterFile, 'utf-8')) as Record<string, Record<string, unknown>[]>;

    log('\n🔄 === DIFF: BEFORE vs AFTER ===\n', 'cyan');

    const report: string[] = [
        '# NocoBase Internal Table Diff',
        `\nGenerated: ${new Date().toISOString()}`,
        '\nComparison of internal tables before and after creating a page from the UI.\n',
    ];

    for (const tableName of Object.keys(before)) {
        const beforeItems = before[tableName] || [];
        const afterItems = after[tableName] || [];

        log(`\n📊 ${tableName} (${beforeItems.length} → ${afterItems.length}):`, 'cyan');
        report.push(`## ${tableName}\n`);
        report.push(`- Before: ${beforeItems.length} records`);
        report.push(`- After: ${afterItems.length} records`);
        report.push(`- Delta: **${afterItems.length - beforeItems.length}**\n`);

        // Find primary key
        const pk = getPrimaryKey(tableName);

        // Index before items
        const beforeIndex = new Map<string, Record<string, unknown>>();
        for (const item of beforeItems) {
            const key = getItemKey(item, pk);
            beforeIndex.set(key, item);
        }

        // Find NEW items (in after but not before)
        const newItems: Record<string, unknown>[] = [];
        const modifiedItems: { before: Record<string, unknown>; after: Record<string, unknown> }[] = [];

        for (const item of afterItems) {
            const key = getItemKey(item, pk);
            const beforeItem = beforeIndex.get(key);

            if (!beforeItem) {
                newItems.push(item);
            } else if (JSON.stringify(beforeItem) !== JSON.stringify(item)) {
                modifiedItems.push({ before: beforeItem, after: item });
            }
        }

        // Find DELETED items
        const afterIndex = new Map<string, boolean>();
        for (const item of afterItems) {
            afterIndex.set(getItemKey(item, pk), true);
        }
        const deletedItems = beforeItems.filter(item => !afterIndex.has(getItemKey(item, pk)));

        // Report
        if (newItems.length > 0) {
            log(`  ➕ ${newItems.length} NUEVOS:`, 'green');
            report.push(`### ➕ New Records (${newItems.length})\n`);
            for (const item of newItems) {
                const summary = summarizeItem(item, tableName);
                log(`    ${summary}`, 'green');
                report.push('```json');
                report.push(JSON.stringify(item, null, 2));
                report.push('```\n');
            }
        }

        if (modifiedItems.length > 0) {
            log(`  🔄 ${modifiedItems.length} MODIFICADOS:`, 'yellow');
            report.push(`### 🔄 Modified Records (${modifiedItems.length})\n`);
            for (const { before: b, after: a } of modifiedItems) {
                // Find changed fields
                const allKeys = new Set([...Object.keys(b), ...Object.keys(a)]);
                const changes: string[] = [];
                for (const key of allKeys) {
                    if (JSON.stringify(b[key]) !== JSON.stringify(a[key])) {
                        changes.push(`${key}: ${JSON.stringify(b[key])} → ${JSON.stringify(a[key])}`);
                    }
                }
                log(`    ${summarizeItem(a, tableName)}: ${changes.join(', ')}`, 'yellow');
                report.push(`**${summarizeItem(a, tableName)}**\n`);
                report.push('| Field | Before | After |');
                report.push('|-------|--------|-------|');
                for (const key of allKeys) {
                    if (JSON.stringify(b[key]) !== JSON.stringify(a[key])) {
                        report.push(`| ${key} | \`${JSON.stringify(b[key])}\` | \`${JSON.stringify(a[key])}\` |`);
                    }
                }
                report.push('');
            }
        }

        if (deletedItems.length > 0) {
            log(`  ➖ ${deletedItems.length} ELIMINADOS:`, 'red');
            report.push(`### ➖ Deleted Records (${deletedItems.length})\n`);
            for (const item of deletedItems) {
                log(`    ${summarizeItem(item, tableName)}`, 'red');
                report.push('```json');
                report.push(JSON.stringify(item, null, 2));
                report.push('```\n');
            }
        }

        if (newItems.length === 0 && modifiedItems.length === 0 && deletedItems.length === 0) {
            log(`  ✅ Sin cambios`, 'gray');
            report.push('*No changes*\n');
        }
    }

    const reportFile = path.join(SNAPSHOT_DIR, 'diff_report.md');
    fs.writeFileSync(reportFile, report.join('\n'));
    log(`\n📁 Diff report: ${reportFile}`, 'cyan');
}

function getPrimaryKey(tableName: string): string | string[] {
    switch (tableName) {
        case 'desktopRoutes': return 'id';
        case 'uiSchemas': return 'x-uid';
        case 'uiSchemaTreePath': return ['ancestor', 'descendant'];
        case 'uiSchemaTemplates': return 'key';
        case 'rolesDesktopRoutes': return ['desktopRouteId', 'roleName'];
        default: return 'id';
    }
}

function getItemKey(item: Record<string, unknown>, pk: string | string[]): string {
    if (Array.isArray(pk)) {
        return pk.map(k => String(item[k] || '')).join('::');
    }
    return String(item[pk] || JSON.stringify(item));
}

function summarizeItem(item: Record<string, unknown>, tableName: string): string {
    switch (tableName) {
        case 'desktopRoutes':
            return `Route #${item.id} "${item.title}" (${item.type})`;
        case 'uiSchemas':
            return `Schema ${item['x-uid']} (${item['x-component']})`;
        case 'uiSchemaTreePath':
            return `Path ${item.ancestor} → ${item.descendant} (depth: ${item.depth})`;
        case 'uiSchemaTemplates':
            return `Template "${item.name}" (${item.componentName})`;
        case 'rolesDesktopRoutes':
            return `Binding role:${item.roleName} → route:${item.desktopRouteId}`;
        default:
            return JSON.stringify(item).slice(0, 80);
    }
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
    const command = process.argv[2];

    if (!command || !['before', 'after', 'diff'].includes(command)) {
        log('USO: npx tsx snapshot-nb-tables.ts <before|after|diff>', 'white');
        return;
    }

    if (command === 'diff') {
        await diffSnapshots();
    } else {
        await takeSnapshot(command);
    }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
