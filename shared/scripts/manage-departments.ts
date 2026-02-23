/**
 * manage-departments.ts - Gestión de departamentos/unidades organizacionales NocoBase via API
 *
 * Usa el plugin: departments
 *
 * Uso:
 *   tsx shared/scripts/manage-departments.ts list                          # listar departamentos
 *   tsx shared/scripts/manage-departments.ts get <id>                      # detalle
 *   tsx shared/scripts/manage-departments.ts create --title t [--parent id] # crear departamento
 *   tsx shared/scripts/manage-departments.ts update <id> --title t         # actualizar
 *   tsx shared/scripts/manage-departments.ts delete <id>                   # eliminar
 *   tsx shared/scripts/manage-departments.ts members <id>                  # miembros del departamento
 *   tsx shared/scripts/manage-departments.ts add-member <deptId> <userId>  # agregar miembro
 *   tsx shared/scripts/manage-departments.ts remove-member <deptId> <userId> # quitar miembro
 *   tsx shared/scripts/manage-departments.ts set-owner <deptId> <userId>   # asignar responsable
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

function printTree(departments: unknown[], parentId: number | null = null, indent = '') {
    const children = departments.filter((d: Record<string, unknown>) => (d.parentId || null) === parentId);
    for (const dept of children) {
        log(`${indent}  [${dept.id}] ${dept.title || dept.name || 'Sin nombre'}`, 'white');
        printTree(departments, dept.id, indent + '    ');
    }
}

async function listDepartments() {
    log('🏢 Departamentos...\n', 'cyan');

    try {
        const response = await client.get('/departments:list', {
            paginate: false,
        });
        const raw = response.data || response;
        const departments = Array.isArray(raw) ? raw : (raw.data || raw.rows || []);

        if (!Array.isArray(departments) || departments.length === 0) {
            log('  Sin departamentos configurados.', 'yellow');
            log('  Crea uno con: manage-departments.ts create --title "Urgencias"', 'gray');
            return;
        }

        log(`  Total: ${departments.length} departamento(s)\n`, 'green');

        // Try tree view
        const hasParents = departments.some((d: Record<string, unknown>) => d.parentId);
        if (hasParents) {
            log('  Árbol organizacional:', 'white');
            printTree(departments);
        } else {
            for (const d of departments) {
                log(`  [${d.id}] ${d.title || d.name || 'Sin nombre'}`, 'white');
            }
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function getDepartment(id: string) {
    log(`🏢 Detalle del departamento ${id}...\n`, 'cyan');

    try {
        const response = await client.get('/departments:get', {
            filterByTk: id,
            appends: ['parent', 'members', 'children'],
        });
        const dept = response.data || response;

        log(`  Nombre:      ${dept.title || dept.name || 'N/A'}`, 'white');
        if (dept.parent) log(`  Padre:       [${dept.parent.id}] ${dept.parent.title || dept.parent.name}`, 'gray');
        if (dept.createdAt) log(`  Creado:      ${new Date(dept.createdAt).toLocaleString('es-CL')}`, 'gray');

        const members = dept.members || [];
        if (members.length > 0) {
            log(`\n  Miembros (${members.length}):`, 'white');
            for (const m of members) {
                log(`    [${m.id}] ${m.nickname || m.username || m.email}`, 'gray');
            }
        }

        const children = dept.children || [];
        if (children.length > 0) {
            log(`\n  Sub-departamentos (${children.length}):`, 'white');
            for (const c of children) {
                log(`    [${c.id}] ${c.title || c.name}`, 'gray');
            }
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function createDepartment(flags: Record<string, string>) {
    if (!flags.title) {
        log('❌ Parámetro requerido: --title <nombre>', 'red');
        log('   Opcionales: --parent <idPadre> --owner <idUsuario>', 'gray');
        process.exit(1);
    }

    log(`➕ Creando departamento "${flags.title}"...\n`, 'cyan');

    const data: Record<string, unknown> = { title: flags.title };
    if (flags.parent) data.parentId = parseInt(flags.parent);
    if (flags.owner) data.ownerId = parseInt(flags.owner);

    try {
        const response = await client.post('/departments:create', data);
        const dept = response.data || response;
        log(`✅ Departamento creado: [${dept.id}] ${dept.title}`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function updateDepartment(id: string, flags: Record<string, string>) {
    const data: Record<string, unknown> = {};
    if (flags.title) data.title = flags.title;
    if (flags.parent) data.parentId = parseInt(flags.parent);
    if (flags.owner) data.ownerId = parseInt(flags.owner);

    if (Object.keys(data).length === 0) {
        log('❌ Proporciona al menos: --title, --parent o --owner', 'red');
        process.exit(1);
    }

    log(`✏️  Actualizando departamento ${id}...\n`, 'cyan');
    try {
        await client.post('/departments:update', { ...data, filterByTk: id });
        log('✅ Departamento actualizado.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function deleteDepartment(id: string) {
    log(`🗑️  Eliminando departamento ${id}...\n`, 'cyan');
    try {
        await client.post('/departments:destroy', { filterByTk: id });
        log('✅ Departamento eliminado.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function listMembers(deptId: string) {
    log(`👥 Miembros del departamento ${deptId}...\n`, 'cyan');

    try {
        const response = await client.get(`/departments/${deptId}/members:list`, {
            pageSize: 100,
        });
        const raw = response.data || response;
        const members = Array.isArray(raw) ? raw : (raw.data || raw.rows || []);

        if (!Array.isArray(members) || members.length === 0) {
            log('  Sin miembros asignados.', 'yellow');
            return;
        }

        log(`  Total: ${members.length} miembro(s)\n`, 'green');
        for (const m of members) {
            log(`  [${m.id}] ${m.nickname || m.username || m.email || 'N/A'}`, 'white');
            if (m.phone) log(`      Tel: ${m.phone}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function addMember(deptId: string, userId: string) {
    log(`➕ Agregando usuario ${userId} al departamento ${deptId}...\n`, 'cyan');
    try {
        await client.post(`/departments/${deptId}/members:add`, { tk: userId });
        log('✅ Miembro agregado.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function removeMember(deptId: string, userId: string) {
    log(`➖ Quitando usuario ${userId} del departamento ${deptId}...\n`, 'cyan');
    try {
        await client.post(`/departments/${deptId}/members:remove`, { tk: userId });
        log('✅ Miembro eliminado.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function setOwner(deptId: string, userId: string) {
    log(`⭐ Asignando responsable ${userId} al departamento ${deptId}...\n`, 'cyan');
    try {
        await client.post('/departments:update', { filterByTk: deptId, ownerId: parseInt(userId) });
        log('✅ Responsable asignado.', 'green');
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
            case 'list': await listDepartments(); break;
            case 'get':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await getDepartment(positional[1]); break;
            case 'create': await createDepartment(flags); break;
            case 'update':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await updateDepartment(positional[1], flags); break;
            case 'delete':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await deleteDepartment(positional[1]); break;
            case 'members':
                if (!positional[1]) { log('❌ Falta: <deptId>', 'red'); process.exit(1); }
                await listMembers(positional[1]); break;
            case 'add-member':
                if (!positional[1] || !positional[2]) { log('❌ Falta: <deptId> <userId>', 'red'); process.exit(1); }
                await addMember(positional[1], positional[2]); break;
            case 'remove-member':
                if (!positional[1] || !positional[2]) { log('❌ Falta: <deptId> <userId>', 'red'); process.exit(1); }
                await removeMember(positional[1], positional[2]); break;
            case 'set-owner':
                if (!positional[1] || !positional[2]) { log('❌ Falta: <deptId> <userId>', 'red'); process.exit(1); }
                await setOwner(positional[1], positional[2]); break;
            default:
                log('Uso: manage-departments.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list                                   Listar departamentos (árbol)', 'gray');
                log('  get <id>                               Detalle con miembros', 'gray');
                log('  create --title t [--parent id]         Crear departamento', 'gray');
                log('  update <id> --title t [--owner uid]    Actualizar', 'gray');
                log('  delete <id>                            Eliminar departamento', 'gray');
                log('  members <deptId>                       Listar miembros', 'gray');
                log('  add-member <deptId> <userId>           Agregar miembro', 'gray');
                log('  remove-member <deptId> <userId>        Quitar miembro', 'gray');
                log('  set-owner <deptId> <userId>            Asignar responsable', 'gray');
                log('\nEjemplos:', 'white');
                log('  create --title "Urgencias" --parent 1', 'gray');
                log('  add-member 3 5', 'gray');
                log('  set-owner 3 5', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
