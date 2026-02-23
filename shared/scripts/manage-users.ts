/**
 * manage-users.ts - CRUD de usuarios NocoBase via API
 *
 * Uso:
 *   tsx shared/scripts/manage-users.ts list
 *   tsx shared/scripts/manage-users.ts get <id>
 *   tsx shared/scripts/manage-users.ts create --email user@example.com --nickname "Juan" --password "pass123"
 *   tsx shared/scripts/manage-users.ts update <id> --nickname "Nuevo Nombre"
 *   tsx shared/scripts/manage-users.ts delete <id>
 *   tsx shared/scripts/manage-users.ts roles <id>              # listar roles del usuario
 *   tsx shared/scripts/manage-users.ts assign-role <id> <role>  # asignar rol
 *   tsx shared/scripts/manage-users.ts remove-role <id> <role>  # quitar rol
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

async function listUsers() {
    log('📋 Listando usuarios...\n', 'cyan');
    const response = await client.get('/users:list', {
        pageSize: 200,
        appends: ['roles']
    });
    const users = response.data || [];

    if (users.length === 0) {
        log('No se encontraron usuarios.', 'yellow');
        return;
    }

    log(`Total: ${users.length} usuario(s)\n`, 'green');
    for (const u of users) {
        const roles = (u.roles || []).map((r: Record<string, unknown>) => r.name).join(', ') || 'sin roles';
        log(`  [${u.id}] ${u.nickname || u.username || '(sin nombre)'}`, 'white');
        log(`      Email: ${u.email || 'N/A'}  |  Roles: ${roles}`, 'gray');
    }
}

async function getUser(id: string) {
    log(`🔍 Obteniendo usuario ${id}...\n`, 'cyan');
    const response = await client.get(`/users:get`, {
        filterByTk: id,
        appends: ['roles']
    });
    const user = response.data;
    log(JSON.stringify(user, null, 2), 'white');
}

async function createUser(flags: Record<string, string>) {
    const { email, nickname, password, username, phone } = flags;
    if (!email) {
        log('❌ Se requiere --email', 'red');
        process.exit(1);
    }

    log(`➕ Creando usuario: ${email}...\n`, 'cyan');
    const data: Record<string, unknown> = { email };
    if (nickname) data.nickname = nickname;
    if (password) data.password = password;
    if (username) data.username = username;
    if (phone) data.phone = phone;

    const response = await client.post('/users:create', data);
    log(`✅ Usuario creado: ID ${response.data?.id}`, 'green');
    log(JSON.stringify(response.data, null, 2), 'white');
}

async function updateUser(id: string, flags: Record<string, string>) {
    log(`✏️  Actualizando usuario ${id}...\n`, 'cyan');
    const data: Record<string, unknown> = {};
    if (flags.nickname) data.nickname = flags.nickname;
    if (flags.email) data.email = flags.email;
    if (flags.phone) data.phone = flags.phone;
    if (flags.password) data.password = flags.password;

    if (Object.keys(data).length === 0) {
        log('❌ Proporciona al menos un campo para actualizar (--nickname, --email, --phone, --password)', 'red');
        process.exit(1);
    }

    await client.post(`/users:update`, {
        ...data,
        filterByTk: id
    });
    log(`✅ Usuario ${id} actualizado.`, 'green');
}

async function deleteUser(id: string) {
    log(`🗑️  Eliminando usuario ${id}...\n`, 'cyan');
    await client.post('/users:destroy', { filterByTk: id });
    log(`✅ Usuario ${id} eliminado.`, 'green');
}

async function listUserRoles(id: string) {
    log(`🔐 Roles del usuario ${id}...\n`, 'cyan');
    const response = await client.get('/users:get', {
        filterByTk: id,
        appends: ['roles']
    });
    const roles = response.data?.roles || [];
    if (roles.length === 0) {
        log('Sin roles asignados.', 'yellow');
        return;
    }
    for (const r of roles) {
        log(`  [${r.name}] ${r.title || r.name}`, 'white');
    }
}

async function assignRole(userId: string, roleName: string) {
    log(`➕ Asignando rol "${roleName}" al usuario ${userId}...\n`, 'cyan');
    await client.post(`/users/${userId}/roles:add`, { name: roleName });
    log(`✅ Rol "${roleName}" asignado al usuario ${userId}.`, 'green');
}

async function removeRole(userId: string, roleName: string) {
    log(`➖ Removiendo rol "${roleName}" del usuario ${userId}...\n`, 'cyan');
    await client.post(`/users/${userId}/roles:remove`, { name: roleName });
    log(`✅ Rol "${roleName}" removido del usuario ${userId}.`, 'green');
}

async function main() {
    const args = process.argv.slice(2);
    const { flags, positional } = parseArgs(args);
    const command = positional[0];

    try {
        switch (command) {
            case 'list':
                await listUsers();
                break;
            case 'get':
                if (!positional[1]) { log('❌ Uso: get <id>', 'red'); process.exit(1); }
                await getUser(positional[1]);
                break;
            case 'create':
                await createUser(flags);
                break;
            case 'update':
                if (!positional[1]) { log('❌ Uso: update <id> --campo valor', 'red'); process.exit(1); }
                await updateUser(positional[1], flags);
                break;
            case 'delete':
                if (!positional[1]) { log('❌ Uso: delete <id>', 'red'); process.exit(1); }
                await deleteUser(positional[1]);
                break;
            case 'roles':
                if (!positional[1]) { log('❌ Uso: roles <userId>', 'red'); process.exit(1); }
                await listUserRoles(positional[1]);
                break;
            case 'assign-role':
                if (!positional[1] || !positional[2]) { log('❌ Uso: assign-role <userId> <roleName>', 'red'); process.exit(1); }
                await assignRole(positional[1], positional[2]);
                break;
            case 'remove-role':
                if (!positional[1] || !positional[2]) { log('❌ Uso: remove-role <userId> <roleName>', 'red'); process.exit(1); }
                await removeRole(positional[1], positional[2]);
                break;
            default:
                log('Uso: manage-users.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list                          Listar todos los usuarios', 'gray');
                log('  get <id>                      Obtener detalle de un usuario', 'gray');
                log('  create --email e [--nickname n] [--password p]  Crear usuario', 'gray');
                log('  update <id> --campo valor     Actualizar usuario', 'gray');
                log('  delete <id>                   Eliminar usuario', 'gray');
                log('  roles <id>                    Ver roles del usuario', 'gray');
                log('  assign-role <id> <role>       Asignar rol', 'gray');
                log('  remove-role <id> <role>       Quitar rol', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
