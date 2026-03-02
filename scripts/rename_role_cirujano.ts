/**
 * rename_role_cirujano.ts — Renombrar rol r_gd0z1pmdmii a cirujano_residente
 *
 * NocoBase no permite renombrar el `name` de un rol (es PK), por lo que
 * este script:
 *   1. Lee el rol actual r_gd0z1pmdmii con sus permisos
 *   2. Crea el nuevo rol cirujano_residente con los mismos permisos
 *   3. Migra los usuarios del rol antiguo al nuevo
 *   4. Opcionalmente elimina el rol antiguo (con --delete-old)
 *
 * Uso:
 *   npx tsx scripts/rename_role_cirujano.ts
 *   npx tsx scripts/rename_role_cirujano.ts --dry-run
 *   npx tsx scripts/rename_role_cirujano.ts --delete-old
 */

import { createClient, log, logAction } from '../shared/scripts/ApiClient.js';

const api = createClient();
const DRY_RUN = process.argv.includes('--dry-run');
const DELETE_OLD = process.argv.includes('--delete-old');

const OLD_ROLE = 'r_gd0z1pmdmii';
const NEW_ROLE = 'cirujano_residente';
const NEW_TITLE = 'Cirujano Residente';
const NEW_DESCRIPTION = 'Medico cirujano en formacion de residencia — acceso a entregas de turno y agenda quirurgica';

async function main() {
    log('\n============================================================', 'cyan');
    log(`  Renombrar Rol: ${OLD_ROLE} -> ${NEW_ROLE}`, 'cyan');
    log('============================================================\n', 'cyan');

    if (DRY_RUN) log('[DRY RUN] Simulacion sin aplicar cambios\n', 'yellow');

    // 1. Leer rol antiguo
    log('1. Leyendo rol antiguo...', 'gray');
    let oldRole: Record<string, unknown>;
    try {
        const result = await api.get('/roles:get', {
            filterByTk: OLD_ROLE,
            appends: ['resources', 'resources.actions'],
        });
        oldRole = (result as { data?: Record<string, unknown> }).data || {};
        log(`   [OK] Rol "${OLD_ROLE}" encontrado: title="${oldRole.title}"`, 'green');
    } catch (err: unknown) {
        log(`   [ERROR] Rol "${OLD_ROLE}" no encontrado. Puede que ya se haya renombrado.`, 'red');
        log(`   Verificando si "${NEW_ROLE}" ya existe...`, 'gray');
        try {
            await api.get('/roles:get', { filterByTk: NEW_ROLE });
            log(`   [OK] Rol "${NEW_ROLE}" ya existe. Nada que hacer.`, 'green');
        } catch {
            log(`   [ERROR] Ni "${OLD_ROLE}" ni "${NEW_ROLE}" existen.`, 'red');
        }
        return;
    }

    // 2. Crear nuevo rol
    log('\n2. Creando nuevo rol...', 'gray');
    if (DRY_RUN) {
        log(`   [DRY RUN] Crearía rol "${NEW_ROLE}" (${NEW_TITLE})`, 'yellow');
    } else {
        try {
            // Verificar si ya existe
            try {
                await api.get('/roles:get', { filterByTk: NEW_ROLE });
                log(`   [EXISTS] Rol "${NEW_ROLE}" ya existe, saltando creacion`, 'yellow');
            } catch {
                await api.post('/roles:create', {
                    name: NEW_ROLE,
                    title: NEW_TITLE,
                    description: NEW_DESCRIPTION,
                    allowNewMenu: oldRole.allowNewMenu ?? true,
                    strategy: oldRole.strategy || { actions: ['view'] },
                });
                log(`   [OK] Rol "${NEW_ROLE}" creado`, 'green');
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            log(`   [ERROR] No se pudo crear rol: ${msg}`, 'red');
            return;
        }
    }

    // 3. Migrar permisos de recursos
    log('\n3. Migrando permisos de recursos...', 'gray');
    const resources = (oldRole.resources as Array<{
        name: string;
        usingActionsConfig: boolean;
        actions: Array<{ name: string; fields?: string[] }>;
    }>) || [];

    if (resources.length === 0) {
        log('   Sin permisos de recursos que migrar', 'yellow');
    } else {
        for (const resource of resources) {
            if (DRY_RUN) {
                const actions = resource.actions?.map(a => a.name).join(', ') || 'ninguna';
                log(`   [DRY RUN] Migrar: ${resource.name} -> ${actions}`, 'yellow');
            } else {
                try {
                    await api.post(`/roles/${NEW_ROLE}/resources:create`, {
                        name: resource.name,
                        usingActionsConfig: resource.usingActionsConfig,
                        actions: resource.actions || [],
                    });
                    log(`   [OK] ${resource.name} migrado`, 'green');
                } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : String(err);
                    log(`   [WARN] ${resource.name}: ${msg}`, 'yellow');
                }
            }
        }
    }

    // 4. Migrar usuarios
    log('\n4. Migrando usuarios al nuevo rol...', 'gray');
    try {
        const usersResult = await api.get(`/roles/${OLD_ROLE}/users:list`, { pageSize: 200 });
        const users = (usersResult as { data?: Array<{ id: number; nickname?: string }> }).data || [];

        if (users.length === 0) {
            log('   Sin usuarios que migrar', 'yellow');
        } else {
            log(`   ${users.length} usuario(s) a migrar`, 'gray');
            for (const user of users) {
                if (DRY_RUN) {
                    log(`   [DRY RUN] Migrar user id=${user.id} (${user.nickname || 'N/A'})`, 'yellow');
                } else {
                    try {
                        // Agregar nuevo rol al usuario
                        await api.post(`/roles/${NEW_ROLE}/users:add`, {
                            tk: user.id,
                        });
                        log(`   [OK] User id=${user.id} -> ${NEW_ROLE}`, 'green');
                    } catch (err: unknown) {
                        const msg = err instanceof Error ? err.message : String(err);
                        log(`   [WARN] User id=${user.id}: ${msg}`, 'yellow');
                    }
                }
            }
        }
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        log(`   [ERROR] No se pudieron listar usuarios: ${msg}`, 'red');
    }

    // 5. Eliminar rol antiguo (opcional)
    if (DELETE_OLD) {
        log('\n5. Eliminando rol antiguo...', 'gray');
        if (DRY_RUN) {
            log(`   [DRY RUN] Eliminaría rol "${OLD_ROLE}"`, 'yellow');
        } else {
            try {
                await api.post('/roles:destroy', { filterByTk: OLD_ROLE });
                log(`   [OK] Rol "${OLD_ROLE}" eliminado`, 'green');
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                log(`   [ERROR] No se pudo eliminar: ${msg}`, 'red');
            }
        }
    } else {
        log('\n5. Rol antiguo NO eliminado (usar --delete-old para eliminar)', 'gray');
    }

    logAction('ROLE_RENAMED', {
        oldRole: OLD_ROLE,
        newRole: NEW_ROLE,
        dryRun: DRY_RUN,
        deletedOld: DELETE_OLD,
    });

    log('\n============================================================', 'green');
    log(`  Renombrado completado: ${OLD_ROLE} -> ${NEW_ROLE}`, 'green');
    log('============================================================\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err instanceof Error ? err.message : String(err)}`, 'red');
    process.exit(1);
});
