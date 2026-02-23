/**
 * manage-roles.ts - CRUD de roles y permisos NocoBase via API
 *
 * Uso:
 *   tsx shared/scripts/manage-roles.ts list
 *   tsx shared/scripts/manage-roles.ts get <name>
 *   tsx shared/scripts/manage-roles.ts create --name editor --title "Editor"
 *   tsx shared/scripts/manage-roles.ts update <name> --title "Nuevo Titulo"
 *   tsx shared/scripts/manage-roles.ts delete <name>
 *   tsx shared/scripts/manage-roles.ts users <name>           # listar usuarios con este rol
 *   tsx shared/scripts/manage-roles.ts resources <name>       # ver permisos de recursos
 *   tsx shared/scripts/manage-roles.ts grant <name> <collection> --actions view,create,update
 *   tsx shared/scripts/manage-roles.ts revoke <name> <collection>
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

async function listRoles() {
    log('📋 Listando roles...\n', 'cyan');
    const response = await client.get('/roles:list', { pageSize: 200 });
    const roles = response.data || [];

    if (roles.length === 0) {
        log('No se encontraron roles.', 'yellow');
        return;
    }

    log(`Total: ${roles.length} rol(es)\n`, 'green');
    for (const r of roles) {
        const defaultStr = r.default ? ' (default)' : '';
        const hiddenStr = r.hidden ? ' [oculto]' : '';
        log(`  [${r.name}] ${r.title || r.name}${defaultStr}${hiddenStr}`, 'white');
        if (r.description) log(`      ${r.description}`, 'gray');
    }
}

async function getRole(name: string) {
    log(`🔍 Obteniendo rol "${name}"...\n`, 'cyan');
    const response = await client.get('/roles:get', { filterByTk: name });
    log(JSON.stringify(response.data, null, 2), 'white');
}

async function createRole(flags: Record<string, string>) {
    const { name, title, description } = flags;
    if (!name) {
        log('❌ Se requiere --name', 'red');
        process.exit(1);
    }

    log(`➕ Creando rol "${name}"...\n`, 'cyan');
    const data: Record<string, unknown> = { name };
    if (title) data.title = title;
    if (description) data.description = description;

    const response = await client.post('/roles:create', data);
    log(`✅ Rol creado: ${response.data?.name}`, 'green');
}

async function updateRole(name: string, flags: Record<string, string>) {
    log(`✏️  Actualizando rol "${name}"...\n`, 'cyan');
    const data: Record<string, unknown> = {};
    if (flags.title) data.title = flags.title;
    if (flags.description) data.description = flags.description;
    if (flags.default) data.default = flags.default === 'true';

    if (Object.keys(data).length === 0) {
        log('❌ Proporciona al menos un campo (--title, --description)', 'red');
        process.exit(1);
    }

    await client.post('/roles:update', { ...data, filterByTk: name });
    log(`✅ Rol "${name}" actualizado.`, 'green');
}

async function deleteRole(name: string) {
    log(`🗑️  Eliminando rol "${name}"...\n`, 'cyan');
    await client.post('/roles:destroy', { filterByTk: name });
    log(`✅ Rol "${name}" eliminado.`, 'green');
}

async function listRoleUsers(name: string) {
    log(`👥 Usuarios con rol "${name}"...\n`, 'cyan');
    const response = await client.get(`/roles/${name}/users:list`, { pageSize: 200 });
    const users = response.data || [];

    if (users.length === 0) {
        log('Sin usuarios asignados.', 'yellow');
        return;
    }

    log(`Total: ${users.length} usuario(s)\n`, 'green');
    for (const u of users) {
        log(`  [${u.id}] ${u.nickname || u.username || u.email}`, 'white');
    }
}

async function listRoleResources(name: string) {
    log(`🔐 Permisos del rol "${name}"...\n`, 'cyan');
    const response = await client.get(`/roles/${name}/resources:list`, { pageSize: 200 });
    const resources = response.data || [];

    if (resources.length === 0) {
        log('Sin permisos de recursos configurados.', 'yellow');
        return;
    }

    log(`Total: ${resources.length} recurso(s)\n`, 'green');
    for (const r of resources) {
        const actions = (r.actions || []).map((a: Record<string, unknown>) => a.name).join(', ');
        log(`  📦 ${r.name}`, 'white');
        log(`      Acciones: ${actions || 'ninguna'}`, 'gray');
    }
}

async function grantPermission(roleName: string, collection: string, flags: Record<string, string>) {
    const actionsStr = flags.actions || 'view';
    const actions = actionsStr.split(',').map(a => a.trim());

    log(`➕ Otorgando permisos en "${collection}" al rol "${roleName}"...`, 'cyan');
    log(`   Acciones: ${actions.join(', ')}\n`, 'gray');

    await client.post(`/roles/${roleName}/resources:create`, {
        name: collection,
        usingActionsConfig: true,
        actions: actions.map(name => ({ name, fields: [] }))
    });
    log(`✅ Permisos otorgados.`, 'green');
}

async function revokePermission(roleName: string, collection: string) {
    log(`➖ Revocando permisos en "${collection}" del rol "${roleName}"...\n`, 'cyan');
    await client.post(`/roles/${roleName}/resources:destroy`, {
        filter: { name: collection }
    });
    log(`✅ Permisos revocados.`, 'green');
}

async function main() {
    const args = process.argv.slice(2);
    const { flags, positional } = parseArgs(args);
    const command = positional[0];

    try {
        switch (command) {
            case 'list':
                await listRoles();
                break;
            case 'get':
                if (!positional[1]) { log('❌ Uso: get <name>', 'red'); process.exit(1); }
                await getRole(positional[1]);
                break;
            case 'create':
                await createRole(flags);
                break;
            case 'update':
                if (!positional[1]) { log('❌ Uso: update <name> --campo valor', 'red'); process.exit(1); }
                await updateRole(positional[1], flags);
                break;
            case 'delete':
                if (!positional[1]) { log('❌ Uso: delete <name>', 'red'); process.exit(1); }
                await deleteRole(positional[1]);
                break;
            case 'users':
                if (!positional[1]) { log('❌ Uso: users <roleName>', 'red'); process.exit(1); }
                await listRoleUsers(positional[1]);
                break;
            case 'resources':
                if (!positional[1]) { log('❌ Uso: resources <roleName>', 'red'); process.exit(1); }
                await listRoleResources(positional[1]);
                break;
            case 'grant':
                if (!positional[1] || !positional[2]) { log('❌ Uso: grant <role> <collection> --actions view,create', 'red'); process.exit(1); }
                await grantPermission(positional[1], positional[2], flags);
                break;
            case 'revoke':
                if (!positional[1] || !positional[2]) { log('❌ Uso: revoke <role> <collection>', 'red'); process.exit(1); }
                await revokePermission(positional[1], positional[2]);
                break;
            default:
                log('Uso: manage-roles.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list                              Listar roles', 'gray');
                log('  get <name>                        Detalle de un rol', 'gray');
                log('  create --name n --title t         Crear rol', 'gray');
                log('  update <name> --title t           Actualizar rol', 'gray');
                log('  delete <name>                     Eliminar rol', 'gray');
                log('  users <name>                      Usuarios con este rol', 'gray');
                log('  resources <name>                  Permisos del rol', 'gray');
                log('  grant <role> <col> --actions a    Otorgar permisos', 'gray');
                log('  revoke <role> <collection>        Revocar permisos', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
