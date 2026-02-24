/**
 * manage-charts.ts - Gestión de visualización de datos NocoBase via API
 *
 * Usa el plugin: data-visualization
 *
 * Uso:
 *   tsx shared/scripts/manage-charts.ts query --collection c --measures m --dimensions d  # consultar datos
 *   tsx shared/scripts/manage-charts.ts query-sql --sql "SELECT ..."   # consulta SQL directa
 *   tsx shared/scripts/manage-charts.ts collections                    # colecciones disponibles para charts
 *   tsx shared/scripts/manage-charts.ts fields <coleccion>             # campos disponibles para una colección
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

async function queryChart(flags: Record<string, string>) {
    if (!flags.collection) {
        log('❌ Parámetro requerido: --collection <nombre>', 'red');
        log('   Opcionales: --measures <campo> --dimensions <campo> --filter <json>', 'gray');
        log('   Ejemplo: --collection users --measures id --dimensions createdAt', 'gray');
        process.exit(1);
    }

    log('📊 Ejecutando consulta de datos...\n', 'cyan');

    const measures: Record<string, unknown>[] = [];
    const dimensions: Record<string, unknown>[] = [];

    if (flags.measures) {
        const measureList = flags.measures.split(',');
        for (const m of measureList) {
            const [field, aggregation] = m.split(':');
            measures.push({
                field: [field],
                aggregation: aggregation || 'count',
                alias: `${aggregation || 'count'}_${field}`,
            });
        }
    } else {
        measures.push({
            field: ['id'],
            aggregation: 'count',
            alias: 'count',
        });
    }

    if (flags.dimensions) {
        const dims = flags.dimensions.split(',');
        for (const d of dims) {
            dimensions.push({ field: [d] });
        }
    }

    const query: Record<string, unknown> = {
        collection: flags.collection,
        measures,
        dimensions,
    };

    if (flags.filter) {
        try {
            query.filter = JSON.parse(flags.filter);
        } catch {
            log('⚠️  --filter debe ser JSON válido', 'yellow');
        }
    }

    if (flags.limit) query.limit = parseInt(flags.limit);
    if (flags.orderBy) {
        query.orders = [{ field: flags.orderBy, order: flags.order || 'ASC' }];
    }

    log(`  Colección: ${query.collection}`, 'gray');
    log(`  Medidas: ${JSON.stringify(query.measures)}`, 'gray');
    log(`  Dimensiones: ${JSON.stringify(query.dimensions)}`, 'gray');
    log('', 'white');

    try {
        const response = await client.post('/charts:query', query);
        const data = response.data || response;

        if (Array.isArray(data) && data.length > 0) {
            log(`  Resultados: ${data.length} fila(s)\n`, 'green');

            // Print as table
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
        } else {
            log('  Sin resultados.', 'yellow');
            log(`  Respuesta: ${JSON.stringify(data)}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        const axiosErr = error as { response?: { data?: unknown } };
        if (axiosErr.response?.data) {
            log(`  Detalle: ${JSON.stringify(axiosErr.response.data)}`, 'gray');
        }
    }
}

async function querySql(flags: Record<string, string>) {
    if (!flags.sql) {
        log('❌ Parámetro requerido: --sql "SELECT ..."', 'red');
        process.exit(1);
    }

    log('📊 Ejecutando consulta SQL...\n', 'cyan');
    log(`  SQL: ${flags.sql}`, 'gray');
    log('', 'white');

    try {
        const response = await client.post('/charts:query', {
            type: 'sql',
            sql: flags.sql,
        });
        const data = response.data || response;

        if (Array.isArray(data) && data.length > 0) {
            log(`  Resultados: ${data.length} fila(s)\n`, 'green');

            const headers = Object.keys(data[0]);
            log(`  ${headers.join('  |  ')}`, 'white');
            log(`  ${'─'.repeat(headers.join('  |  ').length)}`, 'gray');

            for (const row of data.slice(0, 50)) {
                const values = headers.map(h => String(row[h] ?? '-'));
                log(`  ${values.join('  |  ')}`, 'gray');
            }
        } else {
            log('  Sin resultados.', 'yellow');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function listChartCollections() {
    log('📊 Colecciones disponibles para visualización...\n', 'cyan');

    try {
        const response = await client.get('/collections:list', { paginate: false });
        const collections = response.data || [];

        if (collections.length === 0) {
            log('  Sin colecciones.', 'yellow');
            return;
        }

        log(`  Total: ${collections.length} colección(es)\n`, 'green');

        for (const c of collections) {
            const fields = c.fields?.length || 0;
            log(`  📋 ${c.name}: ${c.title || 'N/A'} (${fields} campos)`, 'white');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function listChartFields(collection: string) {
    log(`📊 Campos de "${collection}" para visualización...\n`, 'cyan');

    try {
        const response = await client.get(`/collections/${collection}/fields:list`, {
            paginate: false,
            sort: ['sort'],
        });
        const fields = response.data || [];

        if (fields.length === 0) {
            log('  Sin campos.', 'yellow');
            return;
        }

        const numericTypes = ['integer', 'bigInt', 'float', 'double', 'decimal', 'number'];
        const dateTypes = ['date', 'dateOnly', 'datetime'];

        log(`  Total: ${fields.length} campo(s)\n`, 'green');
        log('  Para medidas (aggregation):', 'white');
        for (const f of fields) {
            if (numericTypes.includes(f.type) || f.type === 'bigInt') {
                log(`    📐 ${f.name} (${f.type}) - count, sum, avg, min, max`, 'gray');
            }
        }

        log('\n  Para dimensiones (agrupación):', 'white');
        for (const f of fields) {
            if (dateTypes.includes(f.type)) {
                log(`    📅 ${f.name} (${f.type})`, 'gray');
            } else if (['string', 'enum'].includes(f.type) || f.interface === 'select') {
                log(`    🏷️  ${f.name} (${f.type})`, 'gray');
            }
        }

        log('\n  Todos los campos:', 'white');
        for (const f of fields) {
            log(`    ${f.name}: ${f.type} (${f.interface || 'N/A'})`, 'gray');
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
            case 'query':
                await queryChart(flags);
                break;
            case 'query-sql':
                await querySql(flags);
                break;
            case 'collections':
                await listChartCollections();
                break;
            case 'fields':
                if (!positional[1]) { log('❌ Falta: <coleccion>', 'red'); process.exit(1); }
                await listChartFields(positional[1]);
                break;
            default:
                log('Uso: manage-charts.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  query --collection c [--measures m] [--dimensions d]  Consultar datos', 'gray');
                log('        --measures campo:aggregation  (count, sum, avg, min, max)', 'gray');
                log('        --dimensions campo             Campo para agrupar', 'gray');
                log('        --filter \'{"campo":"valor"}\'   Filtro JSON', 'gray');
                log('        --limit N --orderBy campo      Limitar y ordenar', 'gray');
                log('  query-sql --sql "SELECT ..."          Consulta SQL directa', 'gray');
                log('  collections                           Colecciones disponibles', 'gray');
                log('  fields <coleccion>                    Campos para charts', 'gray');
                log('\nEjemplos:', 'white');
                log('  query --collection users --measures id:count', 'gray');
                log('  query --collection users --measures id:count --dimensions roles', 'gray');
                log('  query-sql --sql "SELECT COUNT(*) as total FROM users"', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
