/**
 * manage-permissions.ts - Gestion de permisos ACL NocoBase via API
 *
 * Uso:
 *   tsx shared/scripts/manage-permissions.ts list-roles
 *   tsx shared/scripts/manage-permissions.ts strategy <role>                    # ver estrategia del rol
 *   tsx shared/scripts/manage-permissions.ts set-strategy <role> --actions view,create,update,delete
 *   tsx shared/scripts/manage-permissions.ts resources <role>                   # ver permisos por recurso
 *   tsx shared/scripts/manage-permissions.ts grant <role> <collection> --actions view,create [--fields f1,f2]
 *   tsx shared/scripts/manage-permissions.ts revoke <role> <collection>
 *   tsx shared/scripts/manage-permissions.ts check <role> <collection> <action> # verificar permiso
 *   tsx shared/scripts/manage-permissions.ts audit                              # resumen de permisos
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

const ACTIONS = ['view', 'create', 'update', 'delete', 'export', 'importXlsx'];

async function listRoles() {
    log('📋 Roles y sus estrategias de permisos...\n', 'cyan');
    const response = await client.get('/roles:list', { pageSize: 200 });
    const roles = response.data || [];

    for (const r of roles) {
        const strategy = r.strategy || {};
        const allowedActions = strategy.actions || [];
        log(`🔐 [${r.name}] ${r.title || r.name}`, 'white');
        log(`   Estrategia: ${allowedActions.length > 0 ? allowedActions.join(', ') : 'sin acciones'}`, 'gray');
        log(`   Allow new menu: ${r.allowNewMenu ? 'Si' : 'No'}`, 'gray');
        log('', 'white');
    }
}

async function getStrategy(roleName: string) {
    log(`🔐 Estrategia del rol "${roleName}"...\n`, 'cyan');
    const response = await client.get('/roles:get', {
        filterByTk: roleName,
    });
    const role = response.data;

    log(`Rol: ${role.name} (${role.title || ''})`, 'white');
    log(`Estrategia:`, 'cyan');
    log(JSON.stringify(role.strategy || {}, null, 2), 'white');
    log(`\nAllow new menu: ${role.allowNewMenu}`, 'gray');
    log(`Allow configure: ${role.allowConfigure}`, 'gray');
}

async function setStrategy(roleName: string, flags: Record<string, string>) {
    const actionsStr = flags.actions;
    if (!actionsStr) {
        log(`❌ Se requiere --actions (disponibles: ${ACTIONS.join(', ')})`, 'red');
        process.exit(1);
    }

    const actions = actionsStr.split(',').map(a => a.trim());
    log(`✏️  Configurando estrategia del rol "${roleName}"...`, 'cyan');
    log(`   Acciones: ${actions.join(', ')}\n`, 'gray');

    await client.post('/roles:update', {
        filterByTk: roleName,
        strategy: { actions }
    });
    log(`✅ Estrategia actualizada para "${roleName}".`, 'green');
}

async function listResources(roleName: string) {
    log(`📋 Recursos del rol "${roleName}"...\n`, 'cyan');

    const response = await client.get(`/roles/${roleName}`, {
        appends: ['resources', 'resources.actions']
    });
    const resources = response.data?.resources || [];

    if (resources.length === 0) {
        log('Sin permisos de recursos especificos (usa estrategia general).', 'yellow');
        return;
    }

    log(`Total: ${resources.length} recurso(s) con permisos especificos\n`, 'green');

    for (const r of resources) {
        const actions = (r.actions || []);
        log(`  📦 ${r.name}`, 'white');
        log(`     Usar config de acciones: ${r.usingActionsConfig ? 'Si' : 'No'}`, 'gray');
        for (const a of actions) {
            const scope = a.scope ? ` (scope: ${JSON.stringify(a.scope)})` : '';
            const fields = a.fields?.length ? ` [campos: ${a.fields.join(', ')}]` : '';
            log(`     ✓ ${a.name}${fields}${scope}`, 'green');
        }
        log('', 'white');
    }
}

async function grantPermission(roleName: string, collection: string, flags: Record<string, string>) {
    const actionsStr = flags.actions || 'view';
    const actions = actionsStr.split(',').map(a => a.trim());
    const fields = flags.fields ? flags.fields.split(',').map(f => f.trim()) : [];

    log(`➕ Otorgando permisos al rol "${roleName}" en "${collection}"...`, 'cyan');
    log(`   Acciones: ${actions.join(', ')}`, 'gray');
    if (fields.length > 0) log(`   Campos: ${fields.join(', ')}`, 'gray');
    log('', 'white');

    // First check if resource already exists
    try {
        const existing = await client.get(`/roles/${roleName}/resources:list`, {
            filter: { name: collection }
        });

        if (existing.data && existing.data.length > 0) {
            // Update existing
            await client.post(`/roles/${roleName}/resources:update`, {
                filterByTk: existing.data[0].name,
                usingActionsConfig: true,
                actions: actions.map(name => ({
                    name,
                    fields: fields.length > 0 ? fields : undefined,
                }))
            });
        } else {
            // Create new
            await client.post(`/roles/${roleName}/resources:create`, {
                name: collection,
                usingActionsConfig: true,
                actions: actions.map(name => ({
                    name,
                    fields: fields.length > 0 ? fields : undefined,
                }))
            });
        }

        log(`✅ Permisos otorgados.`, 'green');
    } catch (err: unknown) {
        log(`❌ Error: ${(err instanceof Error ? err.message : String(err))}`, 'red');
    }
}

async function revokePermission(roleName: string, collection: string) {
    log(`➖ Revocando permisos del rol "${roleName}" en "${collection}"...\n`, 'cyan');
    await client.post(`/roles/${roleName}/resources:destroy`, {
        filter: { name: collection }
    });
    log(`✅ Permisos revocados.`, 'green');
}

async function checkPermission(roleName: string, collection: string, action: string) {
    log(`🔍 Verificando: rol "${roleName}" puede "${action}" en "${collection}"?\n`, 'cyan');

    const response = await client.get(`/roles/${roleName}`, {
        appends: ['resources', 'resources.actions']
    });
    const role = response.data;

    // Check strategy (general permissions)
    const strategyActions = role.strategy?.actions || [];
    const hasStrategyPermission = strategyActions.includes(action);

    // Check specific resource permission
    const resources = role.resources || [];
    const resource = resources.find((r: Record<string, unknown>) => r.name === collection);
    let hasResourcePermission = false;

    if (resource && resource.usingActionsConfig) {
        const actions = resource.actions || [];
        hasResourcePermission = actions.some((a: Record<string, unknown>) => a.name === action);
    }

    log(`Estrategia general: ${hasStrategyPermission ? '✅ Permitido' : '❌ No permitido'}`, hasStrategyPermission ? 'green' : 'red');
    log(`Permiso especifico: ${resource ? (hasResourcePermission ? '✅ Permitido' : '❌ No permitido') : '⚠️  Sin configuracion especifica'}`,
        hasResourcePermission ? 'green' : resource ? 'red' : 'yellow');
    log(`\nResultado: ${(hasStrategyPermission || hasResourcePermission) ? '✅ PERMITIDO' : '❌ DENEGADO'}`,
        (hasStrategyPermission || hasResourcePermission) ? 'green' : 'red');
}

async function auditPermissions() {
    log('📊 Auditoria de permisos...\n', 'cyan');

    const rolesResp = await client.get('/roles:list', { pageSize: 200 });
    const roles = rolesResp.data || [];

    const collectionsResp = await client.get('/collections:list', { pageSize: 200 });
    const collections = collectionsResp.data || [];

    log(`Roles: ${roles.length}  |  Colecciones: ${collections.length}\n`, 'green');

    // Print matrix header
    // collections and roles loaded for permission matrix audit

    for (const role of roles) {
        if (role.hidden) continue;

        const strategy = role.strategy?.actions || [];
        log(`\n🔐 ${role.name} (${role.title || ''})`, 'white');
        log(`   Estrategia: ${strategy.join(', ') || 'ninguna'}`, 'gray');

        // Get specific resources
        try {
            const resResp = await client.get(`/roles/${role.name}`, {
                appends: ['resources', 'resources.actions']
            });
            const resources = resResp.data?.resources || [];
            if (resources.length > 0) {
                log(`   Recursos con permisos especificos:`, 'gray');
                for (const r of resources) {
                    const acts = (r.actions || []).map((a: Record<string, unknown>) => a.name).join(', ');
                    log(`     ${r.name}: ${acts}`, 'gray');
                }
            }
        } catch {
            // Skip if can't fetch
        }
    }
}

async function main() {
    const args = process.argv.slice(2);
    const { flags, positional } = parseArgs(args);
    const command = positional[0];

    try {
        switch (command) {
            case 'list-roles':
                await listRoles();
                break;
            case 'strategy':
                if (!positional[1]) { log('❌ Uso: strategy <role>', 'red'); process.exit(1); }
                await getStrategy(positional[1]);
                break;
            case 'set-strategy':
                if (!positional[1]) { log('❌ Uso: set-strategy <role> --actions view,create', 'red'); process.exit(1); }
                await setStrategy(positional[1], flags);
                break;
            case 'resources':
                if (!positional[1]) { log('❌ Uso: resources <role>', 'red'); process.exit(1); }
                await listResources(positional[1]);
                break;
            case 'grant':
                if (!positional[1] || !positional[2]) { log('❌ Uso: grant <role> <collection> --actions view,create', 'red'); process.exit(1); }
                await grantPermission(positional[1], positional[2], flags);
                break;
            case 'revoke':
                if (!positional[1] || !positional[2]) { log('❌ Uso: revoke <role> <collection>', 'red'); process.exit(1); }
                await revokePermission(positional[1], positional[2]);
                break;
            case 'check':
                if (!positional[1] || !positional[2] || !positional[3]) { log('❌ Uso: check <role> <collection> <action>', 'red'); process.exit(1); }
                await checkPermission(positional[1], positional[2], positional[3]);
                break;
            case 'audit':
                await auditPermissions();
                break;
            default:
                log('Uso: manage-permissions.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list-roles                                 Listar roles con estrategias', 'gray');
                log('  strategy <role>                            Ver estrategia del rol', 'gray');
                log('  set-strategy <role> --actions view,create  Configurar estrategia', 'gray');
                log('  resources <role>                           Ver permisos por recurso', 'gray');
                log('  grant <role> <col> --actions a [--fields f]  Otorgar permiso', 'gray');
                log('  revoke <role> <collection>                 Revocar permiso', 'gray');
                log('  check <role> <col> <action>                Verificar permiso', 'gray');
                log('  audit                                      Resumen de todos los permisos', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
