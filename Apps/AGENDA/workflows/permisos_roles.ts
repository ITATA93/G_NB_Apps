/**
 * permisos_roles.ts — Otorgar permisos por recurso a los 3 roles AGENDA
 *
 * Configura permisos granulares para los roles de la aplicacion AGENDA:
 *   - medico_agenda:       CRUD completo en bloques, lectura en catalogos
 *   - jefe_servicio_agenda: CRUD completo + exportar + gestionar inasistencias
 *   - admin_agenda:         Full access a todas las colecciones AGENDA
 *
 * Uso:
 *   npx tsx Apps/AGENDA/workflows/permisos_roles.ts
 *   npx tsx Apps/AGENDA/workflows/permisos_roles.ts --dry-run
 */

import { createClient, log, logAction } from '../../../shared/scripts/ApiClient.js';

const api = createClient();
const DRY_RUN = process.argv.includes('--dry-run');

// ── Colecciones AGENDA ──────────────────────────────────────────────────────

const AGENDA_COLLECTIONS = [
    'ag_categorias_actividad',
    'ag_tipos_inasistencia',
    'ag_servicios',
    'ag_funcionarios',
    'ag_bloques_agenda',
    'ag_inasistencias',
    'ag_resumen_diario',
    'ag_resumen_semanal',
];

// ── Definicion de permisos por rol ──────────────────────────────────────────

interface PermissionGrant {
    role: string;
    title: string;
    description: string;
    grants: Array<{
        collection: string;
        actions: string[];
    }>;
}

const ROLE_PERMISSIONS: PermissionGrant[] = [
    {
        role: 'medico_agenda',
        title: 'Medico Agenda',
        description: 'Medico con acceso a su agenda personal y lectura de catalogos',
        grants: [
            // Catalogos: solo lectura
            { collection: 'ag_categorias_actividad', actions: ['view', 'list'] },
            { collection: 'ag_tipos_inasistencia', actions: ['view', 'list'] },
            { collection: 'ag_servicios', actions: ['view', 'list'] },
            { collection: 'ag_funcionarios', actions: ['view', 'list'] },
            // Bloques: CRUD propio
            { collection: 'ag_bloques_agenda', actions: ['view', 'list', 'create', 'update'] },
            // Inasistencias: solo lectura
            { collection: 'ag_inasistencias', actions: ['view', 'list'] },
            // Resumenes: lectura
            { collection: 'ag_resumen_diario', actions: ['view', 'list'] },
            { collection: 'ag_resumen_semanal', actions: ['view', 'list'] },
        ],
    },
    {
        role: 'jefe_servicio_agenda',
        title: 'Jefe de Servicio Agenda',
        description: 'Jefe de servicio con CRUD de bloques, inasistencias y exportacion',
        grants: [
            // Catalogos: lectura
            { collection: 'ag_categorias_actividad', actions: ['view', 'list'] },
            { collection: 'ag_tipos_inasistencia', actions: ['view', 'list'] },
            { collection: 'ag_servicios', actions: ['view', 'list'] },
            // Funcionarios: lectura + edicion limitada
            { collection: 'ag_funcionarios', actions: ['view', 'list', 'update'] },
            // Bloques: CRUD completo + exportar
            { collection: 'ag_bloques_agenda', actions: ['view', 'list', 'create', 'update', 'delete', 'export'] },
            // Inasistencias: CRUD completo
            { collection: 'ag_inasistencias', actions: ['view', 'list', 'create', 'update', 'delete'] },
            // Resumenes: lectura + exportar
            { collection: 'ag_resumen_diario', actions: ['view', 'list', 'export'] },
            { collection: 'ag_resumen_semanal', actions: ['view', 'list', 'export'] },
        ],
    },
    {
        role: 'admin_agenda',
        title: 'Administrador Agenda',
        description: 'Acceso completo a todas las colecciones AGENDA',
        grants: AGENDA_COLLECTIONS.map(collection => ({
            collection,
            actions: ['view', 'list', 'create', 'update', 'delete', 'export', 'importXlsx'],
        })),
    },
];

// ── Funciones de ejecucion ──────────────────────────────────────────────────

async function ensureRoleExists(roleName: string, title: string, description: string): Promise<boolean> {
    try {
        await api.get('/roles:get', { filterByTk: roleName });
        log(`  [EXISTS] Rol "${roleName}" ya existe`, 'gray');
        return true;
    } catch {
        // Rol no existe, crearlo
        try {
            if (DRY_RUN) {
                log(`  [DRY RUN] Crearía rol "${roleName}" (${title})`, 'yellow');
                return true;
            }
            await api.post('/roles:create', {
                name: roleName,
                title,
                description,
                allowNewMenu: true,
            });
            log(`  [CREATED] Rol "${roleName}" creado`, 'green');
            return true;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            log(`  [ERROR] No se pudo crear rol "${roleName}": ${msg}`, 'red');
            return false;
        }
    }
}

async function grantResourcePermission(
    roleName: string,
    collection: string,
    actions: string[],
): Promise<boolean> {
    if (DRY_RUN) {
        log(`    [DRY RUN] ${roleName} -> ${collection}: ${actions.join(', ')}`, 'yellow');
        return true;
    }

    try {
        // Verificar si ya existe el recurso
        const existing = await api.get(`/roles/${roleName}/resources:list`, {
            filter: { name: collection },
        });

        const existingData = (existing as { data?: unknown[] }).data || [];

        if (existingData.length > 0) {
            // Actualizar existente
            await api.post(`/roles/${roleName}/resources:update`, {
                filterByTk: collection,
                usingActionsConfig: true,
                actions: actions.map(name => ({ name, fields: [] })),
            });
        } else {
            // Crear nuevo
            await api.post(`/roles/${roleName}/resources:create`, {
                name: collection,
                usingActionsConfig: true,
                actions: actions.map(name => ({ name, fields: [] })),
            });
        }

        log(`    [OK] ${roleName} -> ${collection}: ${actions.join(', ')}`, 'green');
        return true;
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        log(`    [ERROR] ${roleName} -> ${collection}: ${msg}`, 'red');
        return false;
    }
}

async function main() {
    log('\n============================================================', 'cyan');
    log('  AGENDA: Configurar Permisos por Recurso (3 roles)', 'cyan');
    log('============================================================\n', 'cyan');

    if (DRY_RUN) log('[DRY RUN] Simulacion sin aplicar cambios\n', 'yellow');

    let totalGrants = 0;
    let successGrants = 0;

    for (const roleDef of ROLE_PERMISSIONS) {
        log(`\n── Rol: ${roleDef.role} (${roleDef.title}) ──\n`, 'cyan');

        // Asegurar que el rol existe
        const roleOk = await ensureRoleExists(roleDef.role, roleDef.title, roleDef.description);
        if (!roleOk) {
            log(`  [SKIP] No se pudo asegurar rol "${roleDef.role}", saltando...`, 'red');
            continue;
        }

        // Otorgar permisos por recurso
        for (const grant of roleDef.grants) {
            totalGrants++;
            const ok = await grantResourcePermission(roleDef.role, grant.collection, grant.actions);
            if (ok) successGrants++;
        }
    }

    logAction('AGENDA_PERMISSIONS_CONFIGURED', {
        roles: ROLE_PERMISSIONS.length,
        totalGrants,
        successGrants,
        dryRun: DRY_RUN,
    });

    log('\n============================================================', 'green');
    log(`  Permisos AGENDA configurados: ${successGrants}/${totalGrants} grants`, 'green');
    log('============================================================\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err instanceof Error ? err.message : String(err)}`, 'red');
    process.exit(1);
});
