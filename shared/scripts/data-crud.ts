/**
 * data-crud.ts - Operaciones CRUD de datos en colecciones NocoBase
 *
 * Uso:
 *   tsx shared/scripts/data-crud.ts list <collection> [--page 1] [--pageSize 20] [--filter '{"field":"value"}']
 *   tsx shared/scripts/data-crud.ts get <collection> <id>
 *   tsx shared/scripts/data-crud.ts create <collection> --data '{"field":"value"}'
 *   tsx shared/scripts/data-crud.ts update <collection> <id> --data '{"field":"newValue"}'
 *   tsx shared/scripts/data-crud.ts delete <collection> <id>
 *   tsx shared/scripts/data-crud.ts count <collection> [--filter '{"field":"value"}']
 *   tsx shared/scripts/data-crud.ts search <collection> --field name --value "Juan"
 *   tsx shared/scripts/data-crud.ts bulk-create <collection> --file data.json
 *   tsx shared/scripts/data-crud.ts bulk-update <collection> --filter '{"status":"old"}' --data '{"status":"new"}'
 *   tsx shared/scripts/data-crud.ts bulk-delete <collection> --filter '{"status":"archived"}'
 *   tsx shared/scripts/data-crud.ts export <collection> [--format json|csv] [--output file.json]
 */

import { createClient, log } from './ApiClient';
import fs from 'fs';

const client = createClient();

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

function parseJsonFlag(value: string | undefined, label: string): Record<string, unknown> {
    if (!value) return undefined;
    try {
        return JSON.parse(value);
    } catch {
        log(`❌ --${label} debe ser JSON valido`, 'red');
        process.exit(1);
    }
}

async function listRecords(collection: string, flags: Record<string, string>) {
    const page = parseInt(flags.page || '1');
    const pageSize = parseInt(flags.pageSize || '20');
    const filter = parseJsonFlag(flags.filter, 'filter');
    const sort = flags.sort ? flags.sort.split(',') : undefined;
    const appends = flags.appends ? flags.appends.split(',') : undefined;

    log(`📋 Registros de "${collection}" (pagina ${page}, ${pageSize}/pag)...\n`, 'cyan');

    const params: Record<string, unknown> = { page, pageSize };
    if (filter) params.filter = filter;
    if (sort) params.sort = sort;
    if (appends) params.appends = appends;

    const response = await client.get(`/${collection}:list`, params);
    const records = response.data || [];
    const meta = response.meta || {};

    log(`Total: ${meta.count ?? records.length} registro(s)  |  Pagina ${meta.page || page}/${meta.totalPage || '?'}\n`, 'green');

    if (records.length === 0) {
        log('Sin registros.', 'yellow');
        return;
    }

    // Auto-detect columns from first record
    const keys = Object.keys(records[0]).filter(k => !['createdAt', 'updatedAt', 'createdById', 'updatedById'].includes(k));
    const displayKeys = keys.slice(0, 6); // Limit columns

    for (const record of records) {
        const vals = displayKeys.map(k => {
            const v = record[k];
            if (v === null || v === undefined) return '-';
            if (typeof v === 'object') return JSON.stringify(v).slice(0, 30);
            return String(v).slice(0, 30);
        });
        log(`  [${record.id}] ${vals.join('  |  ')}`, 'white');
    }

    if (meta.totalPage && meta.page < meta.totalPage) {
        log(`\n  ... ${meta.count - records.length} registros mas. Usa --page ${page + 1}`, 'gray');
    }
}

async function getRecord(collection: string, id: string, flags: Record<string, string>) {
    log(`🔍 Registro ${id} de "${collection}"...\n`, 'cyan');
    const params: Record<string, unknown> = { filterByTk: id };
    if (flags.appends) params.appends = flags.appends.split(',');

    const response = await client.get(`/${collection}:get`, params);
    log(JSON.stringify(response.data, null, 2), 'white');
}

async function createRecord(collection: string, flags: Record<string, string>) {
    const data = parseJsonFlag(flags.data, 'data');
    if (!data) {
        log('❌ Se requiere --data \'{"campo":"valor"}\'', 'red');
        process.exit(1);
    }

    log(`➕ Creando registro en "${collection}"...\n`, 'cyan');
    const response = await client.post(`/${collection}:create`, data);
    log(`✅ Registro creado: ID ${response.data?.id}`, 'green');
    log(JSON.stringify(response.data, null, 2), 'white');
}

async function updateRecord(collection: string, id: string, flags: Record<string, string>) {
    const data = parseJsonFlag(flags.data, 'data');
    if (!data) {
        log('❌ Se requiere --data \'{"campo":"nuevoValor"}\'', 'red');
        process.exit(1);
    }

    log(`✏️  Actualizando registro ${id} en "${collection}"...\n`, 'cyan');
    await client.post(`/${collection}:update`, {
        ...data,
        filterByTk: id
    });
    log(`✅ Registro ${id} actualizado.`, 'green');
}

async function deleteRecord(collection: string, id: string) {
    log(`🗑️  Eliminando registro ${id} de "${collection}"...\n`, 'cyan');
    await client.post(`/${collection}:destroy`, { filterByTk: id });
    log(`✅ Registro ${id} eliminado.`, 'green');
}

async function countRecords(collection: string, flags: Record<string, string>) {
    const filter = parseJsonFlag(flags.filter, 'filter');
    log(`🔢 Contando registros en "${collection}"...\n`, 'cyan');

    const params: Record<string, unknown> = {};
    if (filter) params.filter = filter;

    const response = await client.get(`/${collection}:count`, params);
    log(`Total: ${response.data?.count ?? response.data ?? 'N/A'} registros`, 'green');
}

async function searchRecords(collection: string, flags: Record<string, string>) {
    const { field, value } = flags;
    if (!field || !value) {
        log('❌ Se requiere --field y --value', 'red');
        process.exit(1);
    }

    const operator = flags.operator || '$includes';
    log(`🔍 Buscando en "${collection}" donde ${field} ${operator} "${value}"...\n`, 'cyan');

    const response = await client.get(`/${collection}:list`, {
        filter: { [field]: { [operator]: value } },
        pageSize: parseInt(flags.pageSize || '50')
    });

    const records = response.data || [];
    log(`Encontrados: ${records.length} registro(s)\n`, 'green');

    for (const record of records) {
        const preview = Object.entries(record)
            .filter(([k]) => !['createdAt', 'updatedAt', 'createdById', 'updatedById'].includes(k))
            .slice(0, 4)
            .map(([k, v]) => `${k}: ${String(v).slice(0, 25)}`)
            .join('  |  ');
        log(`  [${record.id}] ${preview}`, 'white');
    }
}

async function bulkCreate(collection: string, flags: Record<string, string>) {
    const filePath = flags.file;
    if (!filePath) {
        log('❌ Se requiere --file <ruta.json>', 'red');
        process.exit(1);
    }

    log(`📥 Carga masiva en "${collection}" desde ${filePath}...\n`, 'cyan');

    const raw = fs.readFileSync(filePath, 'utf8');
    const records = JSON.parse(raw);

    if (!Array.isArray(records)) {
        log('❌ El archivo debe contener un array JSON', 'red');
        process.exit(1);
    }

    log(`Registros a crear: ${records.length}`, 'white');
    let created = 0;
    let errors = 0;

    for (const record of records) {
        try {
            await client.post(`/${collection}:create`, record);
            created++;
        } catch (err: unknown) {
            errors++;
            log(`  ⚠️  Error en registro: ${(err instanceof Error ? err.message : String(err))}`, 'yellow');
        }
    }

    log(`\n✅ Creados: ${created}  |  Errores: ${errors}`, created === records.length ? 'green' : 'yellow');
}

async function bulkUpdate(collection: string, flags: Record<string, string>) {
    const filter = parseJsonFlag(flags.filter, 'filter');
    const data = parseJsonFlag(flags.data, 'data');

    if (!filter || !data) {
        log('❌ Se requiere --filter y --data', 'red');
        process.exit(1);
    }

    log(`✏️  Actualizacion masiva en "${collection}"...\n`, 'cyan');
    log(`   Filtro: ${JSON.stringify(filter)}`, 'gray');
    log(`   Datos: ${JSON.stringify(data)}\n`, 'gray');

    await client.post(`/${collection}:update`, {
        ...data,
        filter
    });
    log(`✅ Registros actualizados.`, 'green');
}

async function bulkDelete(collection: string, flags: Record<string, string>) {
    const filter = parseJsonFlag(flags.filter, 'filter');
    if (!filter) {
        log('❌ Se requiere --filter para evitar eliminacion accidental', 'red');
        process.exit(1);
    }

    log(`🗑️  Eliminacion masiva en "${collection}"...\n`, 'cyan');
    log(`   Filtro: ${JSON.stringify(filter)}\n`, 'gray');

    await client.post(`/${collection}:destroy`, { filter });
    log(`✅ Registros eliminados.`, 'green');
}

async function exportData(collection: string, flags: Record<string, string>) {
    const format = flags.format || 'json';
    const output = flags.output;

    log(`📤 Exportando "${collection}" en formato ${format}...\n`, 'cyan');

    // Fetch all records
    const allRecords = await client.listAll(`/${collection}:list`);
    log(`Total: ${allRecords.length} registro(s)\n`, 'green');

    let content: string;
    if (format === 'csv') {
        if (allRecords.length === 0) {
            content = '';
        } else {
            const headers = Object.keys(allRecords[0]);
            const rows = allRecords.map(r =>
                headers.map(h => {
                    const v = r[h];
                    if (v === null || v === undefined) return '';
                    const str = typeof v === 'object' ? JSON.stringify(v) : String(v);
                    return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
                }).join(',')
            );
            content = [headers.join(','), ...rows].join('\n');
        }
    } else {
        content = JSON.stringify(allRecords, null, 2);
    }

    if (output) {
        fs.writeFileSync(output, content, 'utf8');
        log(`✅ Exportado a: ${output}`, 'green');
    } else {
        console.log(content);
    }
}

async function main() {
    const args = process.argv.slice(2);
    const { flags, positional } = parseArgs(args);
    const command = positional[0];
    const collection = positional[1];

    try {
        switch (command) {
            case 'list':
                if (!collection) { log('❌ Uso: list <collection>', 'red'); process.exit(1); }
                await listRecords(collection, flags);
                break;
            case 'get':
                if (!collection || !positional[2]) { log('❌ Uso: get <collection> <id>', 'red'); process.exit(1); }
                await getRecord(collection, positional[2], flags);
                break;
            case 'create':
                if (!collection) { log('❌ Uso: create <collection> --data \'{}\'', 'red'); process.exit(1); }
                await createRecord(collection, flags);
                break;
            case 'update':
                if (!collection || !positional[2]) { log('❌ Uso: update <collection> <id> --data \'{}\'', 'red'); process.exit(1); }
                await updateRecord(collection, positional[2], flags);
                break;
            case 'delete':
                if (!collection || !positional[2]) { log('❌ Uso: delete <collection> <id>', 'red'); process.exit(1); }
                await deleteRecord(collection, positional[2]);
                break;
            case 'count':
                if (!collection) { log('❌ Uso: count <collection>', 'red'); process.exit(1); }
                await countRecords(collection, flags);
                break;
            case 'search':
                if (!collection) { log('❌ Uso: search <collection> --field f --value v', 'red'); process.exit(1); }
                await searchRecords(collection, flags);
                break;
            case 'bulk-create':
                if (!collection) { log('❌ Uso: bulk-create <collection> --file data.json', 'red'); process.exit(1); }
                await bulkCreate(collection, flags);
                break;
            case 'bulk-update':
                if (!collection) { log('❌ Uso: bulk-update <collection> --filter \'{}\' --data \'{}\'', 'red'); process.exit(1); }
                await bulkUpdate(collection, flags);
                break;
            case 'bulk-delete':
                if (!collection) { log('❌ Uso: bulk-delete <collection> --filter \'{}\'', 'red'); process.exit(1); }
                await bulkDelete(collection, flags);
                break;
            case 'export':
                if (!collection) { log('❌ Uso: export <collection> [--format json|csv] [--output file]', 'red'); process.exit(1); }
                await exportData(collection, flags);
                break;
            default:
                log('Uso: data-crud.ts <comando> <collection> [opciones]\n', 'cyan');
                log('Lectura:', 'white');
                log('  list <col> [--page 1] [--pageSize 20] [--filter \'{}\'] [--sort f1,f2]', 'gray');
                log('  get <col> <id> [--appends rel1,rel2]', 'gray');
                log('  count <col> [--filter \'{}\']', 'gray');
                log('  search <col> --field f --value v [--operator $includes]', 'gray');
                log('  export <col> [--format json|csv] [--output file]', 'gray');
                log('\nEscritura:', 'white');
                log('  create <col> --data \'{"campo":"valor"}\'', 'gray');
                log('  update <col> <id> --data \'{"campo":"nuevo"}\'', 'gray');
                log('  delete <col> <id>', 'gray');
                log('\nOperaciones masivas:', 'white');
                log('  bulk-create <col> --file data.json', 'gray');
                log('  bulk-update <col> --filter \'{}\' --data \'{}\'', 'gray');
                log('  bulk-delete <col> --filter \'{}\'', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
