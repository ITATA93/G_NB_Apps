/**
 * manage-collection-categories.ts - Gestión de categorías de colecciones NocoBase via API
 *
 * Categorías permiten organizar y agrupar colecciones visualmente.
 *
 * Uso:
 *   tsx shared/scripts/manage-collection-categories.ts list               # listar categorías
 *   tsx shared/scripts/manage-collection-categories.ts create --name n [--color c] # crear
 *   tsx shared/scripts/manage-collection-categories.ts update <id> --name n       # actualizar
 *   tsx shared/scripts/manage-collection-categories.ts delete <id>        # eliminar
 *   tsx shared/scripts/manage-collection-categories.ts reorder <id1,id2,...>  # reordenar
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

const defaultColors = ['default', 'red', 'volcano', 'orange', 'gold', 'yellow', 'lime', 'green', 'cyan', 'blue', 'geekblue', 'purple', 'magenta'];

async function listCategories() {
    log('🏷️  Categorías de colecciones...\n', 'cyan');

    try {
        const response = await client.post('/collectionCategories:list', {});
        const raw = response.data || response;
        const categories = Array.isArray(raw) ? raw : (raw.data || raw.rows || []);

        if (!Array.isArray(categories) || categories.length === 0) {
            log('  Sin categorías configuradas.', 'yellow');
            log('  Crea una con: manage-collection-categories.ts create --name "Clínico"', 'gray');
            return;
        }

        log(`  Total: ${categories.length} categoría(s)\n`, 'green');

        for (const cat of categories) {
            const color = cat.color || 'default';
            log(`  🏷️  [${cat.id}] ${cat.name || 'Sin nombre'}`, 'white');
            log(`      Color: ${color}  |  Orden: ${cat.sort ?? 'N/A'}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function createCategory(flags: Record<string, string>) {
    if (!flags.name) {
        log('❌ Parámetro requerido: --name <nombre>', 'red');
        log(`   Opcionales: --color <${defaultColors.slice(0, 5).join('|')}|...>`, 'gray');
        process.exit(1);
    }

    log(`➕ Creando categoría "${flags.name}"...\n`, 'cyan');

    const data: Record<string, unknown> = { name: flags.name };
    if (flags.color) data.color = flags.color;

    try {
        const response = await client.post('/collectionCategories:create', data);
        const cat = response.data || response;
        log(`✅ Categoría creada: [${cat.id}] ${cat.name}`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function updateCategory(id: string, flags: Record<string, string>) {
    const data: Record<string, unknown> = {};
    if (flags.name) data.name = flags.name;
    if (flags.color) data.color = flags.color;

    if (Object.keys(data).length === 0) {
        log('❌ Proporciona al menos: --name o --color', 'red');
        process.exit(1);
    }

    log(`✏️  Actualizando categoría ${id}...\n`, 'cyan');
    try {
        await client.post('/collectionCategories:update', { ...data, filterByTk: id });
        log('✅ Categoría actualizada.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function deleteCategory(id: string) {
    log(`🗑️  Eliminando categoría ${id}...\n`, 'cyan');
    try {
        await client.post('/collectionCategories:destroy', { filterByTk: id });
        log('✅ Categoría eliminada.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function reorderCategories(ids: string) {
    const idList = ids.split(',').map(id => parseInt(id.trim()));
    log(`🔀 Reordenando ${idList.length} categorías...\n`, 'cyan');

    try {
        for (let i = 0; i < idList.length; i++) {
            await client.post('/collectionCategories:move', {
                filterByTk: idList[i],
                sortField: 'sort',
                targetIndex: i,
            });
        }
        log('✅ Categorías reordenadas.', 'green');
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
            case 'list': await listCategories(); break;
            case 'create': await createCategory(flags); break;
            case 'update':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await updateCategory(positional[1], flags); break;
            case 'delete':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await deleteCategory(positional[1]); break;
            case 'reorder':
                if (!positional[1]) { log('❌ Falta: <id1,id2,...>', 'red'); process.exit(1); }
                await reorderCategories(positional[1]); break;
            default:
                log('Uso: manage-collection-categories.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list                                   Listar categorías', 'gray');
                log('  create --name n [--color c]            Crear categoría', 'gray');
                log('  update <id> --name n [--color c]       Actualizar categoría', 'gray');
                log('  delete <id>                            Eliminar categoría', 'gray');
                log('  reorder <id1,id2,...>                   Reordenar categorías', 'gray');
                log('\nColores disponibles:', 'white');
                log(`  ${defaultColors.join(', ')}`, 'gray');
                log('\nEjemplos:', 'white');
                log('  create --name "Clínico" --color blue', 'gray');
                log('  create --name "Administrativo" --color green', 'gray');
                log('  create --name "Laboratorio" --color purple', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
