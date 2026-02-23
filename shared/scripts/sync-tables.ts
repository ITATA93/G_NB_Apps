/**
 * sync-tables.ts - Sincronización automática entre tablas NocoBase
 *
 * Uso:
 *   npx tsx shared/scripts/sync-tables.ts --source tabla_origen --target tabla_destino --mapping "campo1:campo_dest1,campo2:campo_dest2"
 *   npx tsx shared/scripts/sync-tables.ts --source tabla_origen --target tabla_destino --mapping "campo1,campo2" --syncField sincronizado
 *   npx tsx shared/scripts/sync-tables.ts --config sync-config.json
 *
 * Opciones:
 *   --source       Colección origen
 *   --target       Colección destino
 *   --mapping      Mapeo de campos (campo_origen:campo_destino o campo si es igual)
 *   --syncField    Campo booleano en origen para marcar sincronizados (default: sincronizado)
 *   --filter       Filtro JSON para origen (opcional)
 *   --keyField     Campo clave para updates (default: id, usa codigo_origen si existe)
 *   --mode         create | upsert (default: create)
 *   --dry-run      Solo mostrar qué haría sin ejecutar
 *   --config       Archivo JSON con configuración
 */

import { createClient, log, logAction } from './ApiClient.js';

const client = createClient();

interface SyncConfig {
    source: string;
    target: string;
    mapping: Record<string, string>;
    syncField?: string;
    filter?: Record<string, unknown>;
    keyField?: string;
    mode?: 'create' | 'upsert';
}

function parseArgs(args: string[]): { flags: Record<string, string>, positional: string[] } {
    const flags: Record<string, string> = {};
    const positional: string[] = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            flags[args[i].slice(2)] = args[i + 1] || '';
            i++;
        } else {
            positional.push(args[i]);
        }
    }
    return { flags, positional };
}

function parseMapping(mappingStr: string): Record<string, string> {
    const mapping: Record<string, string> = {};
    const pairs = mappingStr.split(',');
    for (const pair of pairs) {
        const [source, target] = pair.includes(':') ? pair.split(':') : [pair, pair];
        mapping[source.trim()] = target.trim();
    }
    return mapping;
}

async function syncTables(config: SyncConfig, dryRun: boolean = false) {
    const { source, target, mapping, syncField = 'sincronizado', filter, keyField, mode = 'create' } = config;

    log(`\n=== SINCRONIZACIÓN: ${source} → ${target} ===\n`, 'cyan');
    log(`Modo: ${mode}`, 'gray');
    log(`Campo sync: ${syncField}`, 'gray');
    log(`Mapeo: ${JSON.stringify(mapping)}`, 'gray');
    if (filter) log(`Filtro: ${JSON.stringify(filter)}`, 'gray');
    if (dryRun) log(`\n⚠️  DRY RUN - No se ejecutarán cambios\n`, 'yellow');

    // 1. Obtener registros pendientes de origen
    const sourceFilter: Record<string, unknown> = { ...filter };
    sourceFilter[syncField] = { $or: [{ $eq: false }, { $eq: null }] };

    const sourceData = await client.get(`/${source}:list`, {
        filter: sourceFilter,
        pageSize: 500
    });
    const pendingRecords = sourceData.data || [];

    if (pendingRecords.length === 0) {
        log('✅ No hay registros pendientes de sincronizar.', 'green');
        return { synced: 0, errors: 0 };
    }

    log(`\n📋 Registros pendientes: ${pendingRecords.length}\n`, 'white');

    let synced = 0;
    let errors = 0;

    for (const record of pendingRecords) {
        try {
            // Construir datos para destino
            const targetData: Record<string, unknown> = {};
            for (const [srcField, dstField] of Object.entries(mapping)) {
                if (record[srcField] !== undefined) {
                    targetData[dstField] = record[srcField];
                }
            }

            // Agregar timestamp de sync si existe el campo
            targetData.fecha_sync = new Date().toISOString();

            const recordId = record.id || record[Object.keys(mapping)[0]];
            log(`  ${recordId}: ${JSON.stringify(targetData)}`, 'gray');

            if (!dryRun) {
                if (mode === 'upsert' && keyField) {
                    // Buscar si existe
                    const existing = await client.get(`/${target}:list`, {
                        filter: { [keyField]: record[Object.keys(mapping)[0]] },
                        pageSize: 1
                    });

                    if (existing.data && existing.data.length > 0) {
                        // Update
                        await client.post(`/${target}:update?filterByTk=${existing.data[0].id}`, targetData);
                        log(`    ✏️  Actualizado`, 'yellow');
                    } else {
                        // Create
                        await client.post(`/${target}:create`, targetData);
                        log(`    ➕ Creado`, 'green');
                    }
                } else {
                    // Solo create
                    await client.post(`/${target}:create`, targetData);
                    log(`    ➕ Creado`, 'green');
                }

                // Marcar como sincronizado en origen
                await client.post(`/${source}:update?filterByTk=${record.id}`, {
                    [syncField]: true
                });
            } else {
                log(`    [DRY RUN] Se crearía/actualizaría`, 'yellow');
            }

            synced++;
        } catch (err: unknown) {
            log(`    ❌ Error: ${(err instanceof Error ? err.message : String(err))}`, 'red');
            errors++;
        }
    }

    log(`\n=== RESUMEN ===`, 'cyan');
    log(`✅ Sincronizados: ${synced}`, 'green');
    if (errors > 0) log(`❌ Errores: ${errors}`, 'red');

    if (!dryRun) {
        logAction('TABLE_SYNC', {
            source,
            target,
            synced,
            errors,
            mode
        });
    }

    return { synced, errors };
}

async function main() {
    const { flags } = parseArgs(process.argv.slice(2));

    // Si hay archivo de config
    if (flags.config) {
        const fs = await import('fs');
        const configPath = flags.config;
        if (!fs.existsSync(configPath)) {
            log(`❌ Archivo no encontrado: ${configPath}`, 'red');
            process.exit(1);
        }
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        await syncTables(config, flags['dry-run'] === 'true');
        return;
    }

    // Validar parámetros requeridos
    if (!flags.source || !flags.target || !flags.mapping) {
        log('Uso: sync-tables.ts --source <col> --target <col> --mapping <campos>\n', 'cyan');
        log('Opciones:', 'white');
        log('  --source        Colección origen', 'gray');
        log('  --target        Colección destino', 'gray');
        log('  --mapping       campo1:dest1,campo2:dest2 (o campo1,campo2 si iguales)', 'gray');
        log('  --syncField     Campo booleano para marcar sync (default: sincronizado)', 'gray');
        log('  --filter        Filtro JSON para origen', 'gray');
        log('  --mode          create | upsert (default: create)', 'gray');
        log('  --keyField      Campo clave para upsert', 'gray');
        log('  --dry-run       Solo mostrar sin ejecutar', 'gray');
        log('  --config        Archivo JSON de configuración', 'gray');
        log('\nEjemplos:', 'white');
        log('  npx tsx shared/scripts/sync-tables.ts --source pacientes --target pacientes_backup --mapping "rut,nombre,email"', 'gray');
        log('  npx tsx shared/scripts/sync-tables.ts --source alma_data --target local_data --mapping "codigo:cod,nombre:name" --mode upsert --keyField cod', 'gray');
        process.exit(1);
    }

    const config: SyncConfig = {
        source: flags.source,
        target: flags.target,
        mapping: parseMapping(flags.mapping),
        syncField: flags.syncField || 'sincronizado',
        mode: (flags.mode as 'create' | 'upsert') || 'create',
        keyField: flags.keyField
    };

    if (flags.filter) {
        try {
            config.filter = JSON.parse(flags.filter);
        } catch {
            log('❌ --filter debe ser JSON válido', 'red');
            process.exit(1);
        }
    }

    await syncTables(config, flags['dry-run'] === 'true');
}

main().catch(err => {
    log(`\n❌ Error: ${(err instanceof Error ? err.message : String(err))}`, 'red');
    process.exit(1);
});
