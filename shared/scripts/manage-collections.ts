/**
 * manage-collections.ts - CRUD completo de colecciones NocoBase via API
 *
 * Uso:
 *   tsx shared/scripts/manage-collections.ts list [--datasource main]
 *   tsx shared/scripts/manage-collections.ts get <name>
 *   tsx shared/scripts/manage-collections.ts create --name patients --title "Pacientes"
 *   tsx shared/scripts/manage-collections.ts update <name> --title "Nuevo Titulo"
 *   tsx shared/scripts/manage-collections.ts delete <name>
 *   tsx shared/scripts/manage-collections.ts schema <name>     # exportar schema completo (campos + relaciones)
 *   tsx shared/scripts/manage-collections.ts count <name>      # contar registros
 *   tsx shared/scripts/manage-collections.ts clone <source> --name <target>  # clonar estructura
 */

import { createClient, log } from './ApiClient';

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

async function listCollections(flags: Record<string, string>) {
    const datasource = flags.datasource || 'main';
    log(`📋 Colecciones (datasource: ${datasource})...\n`, 'cyan');

    let response;
    if (datasource === 'main') {
        response = await client.get('/collections:list', { pageSize: 200, sort: ['name'] });
    } else {
        response = await client.get(`/dataSources/${datasource}/collections:list`, { pageSize: 200 });
    }
    const collections = response.data || [];

    if (collections.length === 0) {
        log('Sin colecciones.', 'yellow');
        return;
    }

    log(`Total: ${collections.length} coleccion(es)\n`, 'green');

    const maxName = Math.max(...collections.map((c: Record<string, unknown>) => String(c.name || '').length), 6);
    log(`  ${'NOMBRE'.padEnd(maxName)}  CAMPOS  TITULO`, 'gray');
    log(`  ${'─'.repeat(maxName)}  ${'─'.repeat(6)}  ${'─'.repeat(30)}`, 'gray');

    for (const c of collections) {
        const fieldCount = (c.fields || []).length;
        const title = c.title || '';
        const hidden = c.hidden ? ' [oculta]' : '';
        log(`  ${(c.name || '').padEnd(maxName)}  ${String(fieldCount).padEnd(6)}  ${title}${hidden}`, 'white');
    }
}

async function getCollection(name: string) {
    log(`🔍 Coleccion "${name}"...\n`, 'cyan');
    const response = await client.get('/collections:get', {
        filterByTk: name,
        appends: ['fields']
    });
    const col = response.data;

    log(`Nombre: ${col.name}`, 'white');
    log(`Titulo: ${col.title || 'N/A'}`, 'white');
    log(`Oculta: ${col.hidden ? 'Si' : 'No'}`, 'white');
    log(`Origen: ${col.origin || 'N/A'}`, 'white');
    log(`Campos: ${(col.fields || []).length}`, 'white');

    if (col.fields && col.fields.length > 0) {
        log('\nCampos:', 'cyan');
        for (const f of col.fields) {
            log(`  ${f.name} (${f.type}) - ${f.uiSchema?.title || f.title || ''}`, 'gray');
        }
    }
}

async function createCollection(flags: Record<string, string>) {
    const { name, title, category, inherits } = flags;
    if (!name) {
        log('❌ Se requiere --name', 'red');
        process.exit(1);
    }

    log(`➕ Creando coleccion "${name}"...\n`, 'cyan');
    const data: Record<string, unknown> = {
        name,
        title: title || name,
        fields: [],
        autoGenId: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        sortable: true,
    };

    if (category) data.category = category;
    if (inherits) data.inherits = inherits;

    await client.post('/collections:create', data);
    log(`✅ Coleccion "${name}" creada.`, 'green');
}

async function updateCollection(name: string, flags: Record<string, string>) {
    log(`✏️  Actualizando coleccion "${name}"...\n`, 'cyan');
    const data: Record<string, unknown> = {};
    if (flags.title) data.title = flags.title;
    if (flags.hidden !== undefined) data.hidden = flags.hidden === 'true';

    if (Object.keys(data).length === 0) {
        log('❌ Proporciona al menos un campo (--title, --hidden)', 'red');
        process.exit(1);
    }

    await client.post('/collections:update', { ...data, filterByTk: name });
    log(`✅ Coleccion "${name}" actualizada.`, 'green');
}

async function deleteCollection(name: string) {
    log(`🗑️  Eliminando coleccion "${name}"...\n`, 'cyan');
    await client.post(`/collections:destroy?filterByTk=${name}`, {});
    log(`✅ Coleccion "${name}" eliminada.`, 'green');
}

async function exportSchema(name: string) {
    log(`📦 Schema de coleccion "${name}"...\n`, 'cyan');
    const response = await client.get('/collections:get', {
        filterByTk: name,
        appends: ['fields']
    });
    const schema = response.data;

    // Clean up for export
    const exportData = {
        name: schema.name,
        title: schema.title,
        fields: (schema.fields || []).map((f: Record<string, unknown>) => ({
            name: f.name,
            type: f.type,
            interface: f.interface,
            title: (f.uiSchema as Record<string, unknown>)?.title || f.title,
            required: f.required || false,
            unique: f.unique || false,
            defaultValue: f.defaultValue,
            options: f.options,
        }))
    };

    log(JSON.stringify(exportData, null, 2), 'white');
}

async function countRecords(name: string) {
    log(`🔢 Contando registros en "${name}"...\n`, 'cyan');
    const response = await client.get(`/${name}:count`);
    log(`Total: ${response.data?.count ?? response.data ?? 'N/A'} registros`, 'green');
}

async function cloneCollection(source: string, flags: Record<string, string>) {
    const targetName = flags.name;
    if (!targetName) {
        log('❌ Se requiere --name para la coleccion destino', 'red');
        process.exit(1);
    }

    log(`📋 Clonando "${source}" -> "${targetName}"...\n`, 'cyan');

    // Get source schema
    const sourceResp = await client.get('/collections:get', {
        filterByTk: source,
        appends: ['fields']
    });
    const sourceCol = sourceResp.data;

    // Create target collection
    const targetTitle = flags.title || `${sourceCol.title} (copia)`;
    await client.post('/collections:create', {
        name: targetName,
        title: targetTitle,
        fields: [],
        autoGenId: true,
        createdAt: true,
        updatedAt: true,
        sortable: true,
    });

    // Copy fields (excluding system fields)
    const systemFields = ['id', 'createdAt', 'updatedAt', 'createdById', 'updatedById', 'sort'];
    const fieldsToClone = (sourceCol.fields || []).filter(
        (f: Record<string, unknown>) => !systemFields.includes(String(f.name)) && !f.primaryKey
    );

    let copied = 0;
    for (const f of fieldsToClone) {
        try {
            await client.post(`/collections/${targetName}/fields:create`, {
                name: f.name,
                type: f.type,
                interface: f.interface,
                uiSchema: f.uiSchema,
                required: f.required,
                unique: f.unique,
                defaultValue: f.defaultValue,
            });
            copied++;
        } catch (err: unknown) {
            log(`  ⚠️  No se pudo copiar campo "${f.name}": ${(err instanceof Error ? err.message : String(err))}`, 'yellow');
        }
    }

    log(`✅ Coleccion "${targetName}" creada con ${copied}/${fieldsToClone.length} campos.`, 'green');
}

async function main() {
    const args = process.argv.slice(2);
    const { flags, positional } = parseArgs(args);
    const command = positional[0];

    try {
        switch (command) {
            case 'list':
                await listCollections(flags);
                break;
            case 'get':
                if (!positional[1]) { log('❌ Uso: get <name>', 'red'); process.exit(1); }
                await getCollection(positional[1]);
                break;
            case 'create':
                await createCollection(flags);
                break;
            case 'update':
                if (!positional[1]) { log('❌ Uso: update <name> --campo valor', 'red'); process.exit(1); }
                await updateCollection(positional[1], flags);
                break;
            case 'delete':
                if (!positional[1]) { log('❌ Uso: delete <name>', 'red'); process.exit(1); }
                await deleteCollection(positional[1]);
                break;
            case 'schema':
                if (!positional[1]) { log('❌ Uso: schema <name>', 'red'); process.exit(1); }
                await exportSchema(positional[1]);
                break;
            case 'count':
                if (!positional[1]) { log('❌ Uso: count <name>', 'red'); process.exit(1); }
                await countRecords(positional[1]);
                break;
            case 'clone':
                if (!positional[1]) { log('❌ Uso: clone <source> --name <target>', 'red'); process.exit(1); }
                await cloneCollection(positional[1], flags);
                break;
            default:
                log('Uso: manage-collections.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list [--datasource main]           Listar colecciones', 'gray');
                log('  get <name>                         Detalle con campos', 'gray');
                log('  create --name n --title t          Crear coleccion', 'gray');
                log('  update <name> --title t            Actualizar', 'gray');
                log('  delete <name>                      Eliminar', 'gray');
                log('  schema <name>                      Exportar schema JSON', 'gray');
                log('  count <name>                       Contar registros', 'gray');
                log('  clone <source> --name <target>     Clonar estructura', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
