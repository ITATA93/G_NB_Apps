/**
 * manage-datasources.ts - Gestión de Data Sources NocoBase via API
 *
 * Uso:
 *   tsx shared/scripts/manage-datasources.ts list                 # listar datasources
 *   tsx shared/scripts/manage-datasources.ts get <key>            # detalle de un datasource
 *   tsx shared/scripts/manage-datasources.ts collections <key>    # colecciones del datasource
 *   tsx shared/scripts/manage-datasources.ts test <key>           # probar conexión
 *   tsx shared/scripts/manage-datasources.ts create --key mydb --type mssql --host 10.0.0.1 --port 1433 --database MyDB --username sa --password pass
 *   tsx shared/scripts/manage-datasources.ts enable <key>         # habilitar datasource
 *   tsx shared/scripts/manage-datasources.ts disable <key>        # deshabilitar datasource
 *   tsx shared/scripts/manage-datasources.ts delete <key>         # eliminar datasource
 *   tsx shared/scripts/manage-datasources.ts status               # resumen de todos los datasources
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

const DS_TYPES: Record<string, string> = {
    main: 'NocoBase (Principal)',
    mysql: 'MySQL',
    postgres: 'PostgreSQL',
    mariadb: 'MariaDB',
    mssql: 'Microsoft SQL Server',
    oracle: 'Oracle',
    kingbase: 'KingbaseES',
    'rest-api': 'REST API',
};

async function listDataSources() {
    log('🗄️  Listando Data Sources...\n', 'cyan');

    const response = await client.get('/dataSources:list', { pageSize: 100 });
    const sources = response.data || [];

    if (sources.length === 0) {
        log('  No se encontraron Data Sources.', 'yellow');
        return;
    }

    const enabled = sources.filter((s: Record<string, unknown>) => s.enabled !== false);
    const disabled = sources.filter((s: Record<string, unknown>) => s.enabled === false);

    log(`  Total: ${sources.length} datasource(s)  |  ✅ ${enabled.length} habilitados  |  ❌ ${disabled.length} deshabilitados\n`, 'green');

    for (const ds of sources) {
        const status = ds.enabled !== false ? '✅' : '❌';
        const type = DS_TYPES[ds.type] || ds.type || 'Desconocido';
        log(`  ${status} ${ds.displayName || ds.key}`, 'white');
        log(`      Key: ${ds.key}  |  Tipo: ${type}`, 'gray');
        if (ds.options?.host) {
            log(`      Host: ${ds.options.host}:${ds.options.port || 'default'}  |  DB: ${ds.options.database || 'N/A'}`, 'gray');
        }
        if (ds.fixed) log(`      ⚙️  Fixed (no editable)`, 'gray');
    }
}

async function getDataSource(key: string) {
    log(`🔍 Obteniendo datasource "${key}"...\n`, 'cyan');

    const response = await client.get('/dataSources:get', {
        filterByTk: key
    });
    const ds = response.data;

    if (!ds) {
        log(`❌ DataSource "${key}" no encontrado.`, 'red');
        return;
    }

    const status = ds.enabled !== false ? '✅ Habilitado' : '❌ Deshabilitado';
    const type = DS_TYPES[ds.type] || ds.type || 'Desconocido';

    log(`  DataSource: ${ds.displayName || ds.key}`, 'white');
    log(`  Key:        ${ds.key}`, 'gray');
    log(`  Tipo:       ${type}`, 'gray');
    log(`  Estado:     ${status}`, ds.enabled !== false ? 'green' : 'red');
    log(`  Fixed:      ${ds.fixed ? 'Sí' : 'No'}`, 'gray');
    log(`  Creado:     ${ds.createdAt || 'N/A'}`, 'gray');
    log(`  Actualizado: ${ds.updatedAt || 'N/A'}`, 'gray');

    if (ds.options) {
        log('\n  Opciones de conexión:', 'white');
        const safeOptions = { ...ds.options };
        if (safeOptions.password) safeOptions.password = '***';
        log(JSON.stringify(safeOptions, null, 2), 'gray');
    }
}

async function listCollections(key: string) {
    log(`📋 Colecciones del datasource "${key}"...\n`, 'cyan');

    try {
        const response = await client.get(`/dataSources/${key}/collections:list`, {
            pageSize: 200,
            paginate: false
        });
        const collections = response.data || [];

        if (collections.length === 0) {
            log(`  No se encontraron colecciones en "${key}".`, 'yellow');
            return;
        }

        log(`  Total: ${collections.length} colección(es)\n`, 'green');

        // Group by category if available
        const categorized: Record<string, Record<string, unknown>[]> = {};
        for (const c of collections) {
            const cat = c.category || 'Sin categoría';
            if (!categorized[cat]) categorized[cat] = [];
            categorized[cat].push(c);
        }

        for (const [category, cols] of Object.entries(categorized)) {
            if (Object.keys(categorized).length > 1) {
                log(`\n  📁 ${category}:`, 'white');
            }
            for (const c of cols) {
                const fieldCount = (c.fields as unknown[] | undefined)?.length || 0;
                log(`    [${c.name}] ${c.title || c.name}  (${fieldCount} campos)`, 'white');
            }
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        log(`  Verifica que el datasource "${key}" existe y está habilitado.`, 'yellow');
    }
}

async function testConnection(key: string) {
    log(`🧪 Probando conexión del datasource "${key}"...\n`, 'cyan');

    try {
        const response = await client.post(`/dataSources:testConnection`, {
            filterByTk: key
        });
        log(`✅ Conexión exitosa para "${key}".`, 'green');
        if (response.data) {
            log(JSON.stringify(response.data, null, 2), 'gray');
        }
    } catch (error: unknown) {
        // Try alternative: just list collections to verify
        try {
            const response = await client.get(`/dataSources/${key}/collections:list`, {
                pageSize: 1
            });
            const count = response.data?.length || 0;
            log(`✅ Conexión verificada para "${key}" (${count} colección(es) accesibles).`, 'green');
        } catch {
            log(`❌ Error de conexión para "${key}": ${(error instanceof Error ? error.message : String(error))}`, 'red');
        }
    }
}

async function createDataSource(flags: Record<string, string>) {
    const { key, type, host, port, database, username, password } = flags;
    const displayName = flags['display-name'] || flags.name || key;

    if (!key || !type) {
        log('❌ Se requieren --key y --type como mínimo', 'red');
        log('  Tipos válidos: mysql, postgres, mariadb, mssql, oracle, kingbase, rest-api', 'gray');
        process.exit(1);
    }

    log(`➕ Creando datasource "${key}" (${type})...\n`, 'cyan');

    const options: Record<string, unknown> = {};

    if (host) options.host = host;
    if (port) options.port = parseInt(port);
    if (database) options.database = database;
    if (username) options.username = username;
    if (password) options.password = password;

    // Additional options
    if (flags.encrypt) options.encrypt = flags.encrypt === 'true';
    if (flags.ssl) options.ssl = flags.ssl === 'true';
    if (flags.schema) options.schema = flags.schema;

    const data: Record<string, unknown> = {
        key,
        type,
        displayName,
        enabled: true,
        options
    };

    try {
        const response = await client.post('/dataSources:create', data);
        log(`✅ DataSource "${key}" creado exitosamente.`, 'green');
        if (response.data) {
            log(JSON.stringify(response.data, null, 2), 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error creando datasource: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function enableDataSource(key: string) {
    log(`✅ Habilitando datasource "${key}"...\n`, 'cyan');

    try {
        await client.post('/dataSources:update', {
            filterByTk: key,
            enabled: true
        });
        log(`✅ DataSource "${key}" habilitado.`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function disableDataSource(key: string) {
    log(`❌ Deshabilitando datasource "${key}"...\n`, 'cyan');

    try {
        await client.post('/dataSources:update', {
            filterByTk: key,
            enabled: false
        });
        log(`✅ DataSource "${key}" deshabilitado.`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function deleteDataSource(key: string) {
    log(`🗑️  Eliminando datasource "${key}"...\n`, 'cyan');

    try {
        await client.post('/dataSources:destroy', { filterByTk: key });
        log(`✅ DataSource "${key}" eliminado.`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function dataSourceStatus() {
    log('📊 Resumen de Data Sources...\n', 'cyan');

    const response = await client.get('/dataSources:list', { pageSize: 100 });
    const sources = response.data || [];

    if (sources.length === 0) {
        log('  No se encontraron Data Sources.', 'yellow');
        return;
    }

    for (const ds of sources) {
        const status = ds.enabled !== false ? '✅' : '❌';
        const type = DS_TYPES[ds.type] || ds.type || '?';
        log(`\n  ${status} ${ds.displayName || ds.key} (${type})`, 'white');

        // Try to get collection count
        try {
            const colResponse = await client.get(`/dataSources/${ds.key}/collections:list`, {
                pageSize: 1
            });
            const meta = colResponse.meta || {};
            const count = meta.count || colResponse.data?.length || 0;
            log(`      Colecciones: ${count}`, 'gray');
        } catch {
            log(`      Colecciones: ⚠️  No accesible`, 'yellow');
        }
    }
}

async function main() {
    const args = process.argv.slice(2);
    const { flags, positional } = parseArgs(args);
    const command = positional[0];

    try {
        switch (command) {
            case 'list':
                await listDataSources();
                break;
            case 'get':
                if (!positional[1]) { log('❌ Uso: get <key>', 'red'); process.exit(1); }
                await getDataSource(positional[1]);
                break;
            case 'collections':
                if (!positional[1]) { log('❌ Uso: collections <key>', 'red'); process.exit(1); }
                await listCollections(positional[1]);
                break;
            case 'test':
                if (!positional[1]) { log('❌ Uso: test <key>', 'red'); process.exit(1); }
                await testConnection(positional[1]);
                break;
            case 'create':
                await createDataSource(flags);
                break;
            case 'enable':
                if (!positional[1]) { log('❌ Uso: enable <key>', 'red'); process.exit(1); }
                await enableDataSource(positional[1]);
                break;
            case 'disable':
                if (!positional[1]) { log('❌ Uso: disable <key>', 'red'); process.exit(1); }
                await disableDataSource(positional[1]);
                break;
            case 'delete':
                if (!positional[1]) { log('❌ Uso: delete <key>', 'red'); process.exit(1); }
                await deleteDataSource(positional[1]);
                break;
            case 'status':
                await dataSourceStatus();
                break;
            default:
                log('Uso: manage-datasources.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list                          Listar todos los datasources', 'gray');
                log('  get <key>                     Detalle de un datasource', 'gray');
                log('  collections <key>             Colecciones del datasource', 'gray');
                log('  test <key>                    Probar conexión', 'gray');
                log('  create --key k --type t       Crear datasource', 'gray');
                log('  enable <key>                  Habilitar datasource', 'gray');
                log('  disable <key>                 Deshabilitar datasource', 'gray');
                log('  delete <key>                  Eliminar datasource', 'gray');
                log('  status                        Resumen con conteos', 'gray');
                log('\nTipos disponibles:', 'white');
                for (const [k, v] of Object.entries(DS_TYPES)) {
                    log(`  ${k.padEnd(12)} ${v}`, 'gray');
                }
                log('\nEjemplo:', 'white');
                log('  manage-datasources.ts create --key midb --type mssql --host 10.0.0.1 --port 1433 --database MiDB --username sa --password "pass"', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
