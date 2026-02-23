/**
 * manage-db-views.ts - Gestión de vistas SQL de base de datos NocoBase via API
 *
 * Usa el plugin: collection-sql
 *
 * Uso:
 *   tsx shared/scripts/manage-db-views.ts list                            # listar vistas
 *   tsx shared/scripts/manage-db-views.ts get <name>                      # detalle de una vista
 *   tsx shared/scripts/manage-db-views.ts query <name>                    # ejecutar query de la vista
 */

import { createClient, log } from './ApiClient';

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

async function listViews() {
    log('🗄️  Vistas SQL de la base de datos...\n', 'cyan');

    try {
        const response = await client.get('/dbViews:list');
        const raw = response.data || response;
        const views = Array.isArray(raw) ? raw : (raw.data || raw.rows || []);

        if (!Array.isArray(views) || views.length === 0) {
            log('  Sin vistas SQL definidas.', 'yellow');
            log('  Las vistas se crean directamente en PostgreSQL y se sincronizan.', 'gray');
            return;
        }

        log(`  Total: ${views.length} vista(s)\n`, 'green');

        for (const v of views) {
            log(`  🗄️  ${v.name || v.viewName || 'N/A'}`, 'white');
            if (v.definition || v.sql) {
                const sql = (v.definition || v.sql || '').substring(0, 100);
                log(`      SQL: ${sql}${sql.length >= 100 ? '...' : ''}`, 'gray');
            }
            if (v.schema) log(`      Schema: ${v.schema}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function getView(name: string) {
    log(`🗄️  Detalle de vista "${name}"...\n`, 'cyan');

    try {
        const response = await client.get('/dbViews:get', { filterByTk: name });
        const view = response.data || response;
        log(JSON.stringify(view, null, 2), 'white');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function queryView(name: string) {
    log(`🗄️  Consultando vista "${name}"...\n`, 'cyan');

    try {
        const response = await client.get('/dbViews:query', { filterByTk: name });
        const raw = response.data || response;
        const data = Array.isArray(raw) ? raw : (raw.data || raw.rows || []);

        if (!Array.isArray(data) || data.length === 0) {
            log('  Sin resultados.', 'yellow');
            return;
        }

        log(`  Resultados: ${data.length} fila(s)\n`, 'green');

        const headers = Object.keys(data[0]);
        log(`  ${headers.join('  |  ')}`, 'white');
        log(`  ${'─'.repeat(headers.join('  |  ').length)}`, 'gray');

        for (const row of data.slice(0, 50)) {
            const values = headers.map(h => String(row[h] ?? '-'));
            log(`  ${values.join('  |  ')}`, 'gray');
        }

        if (data.length > 50) {
            log(`\n  ... y ${data.length - 50} filas más`, 'yellow');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function main() {
    const args = process.argv.slice(2);
    const { positional } = parseArgs(args);
    const command = positional[0];

    try {
        switch (command) {
            case 'list': await listViews(); break;
            case 'get':
                if (!positional[1]) { log('❌ Falta: <name>', 'red'); process.exit(1); }
                await getView(positional[1]); break;
            case 'query':
                if (!positional[1]) { log('❌ Falta: <name>', 'red'); process.exit(1); }
                await queryView(positional[1]); break;
            default:
                log('Uso: manage-db-views.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list                                   Listar vistas SQL', 'gray');
                log('  get <name>                             Detalle de una vista', 'gray');
                log('  query <name>                           Ejecutar consulta de la vista', 'gray');
                log('\nNota:', 'white');
                log('  Las vistas SQL se crean en PostgreSQL y se sincronizan con NocoBase.', 'gray');
                log('  Para crear una vista, usa SQL directamente:', 'gray');
                log('    CREATE VIEW mi_vista AS SELECT ...', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
