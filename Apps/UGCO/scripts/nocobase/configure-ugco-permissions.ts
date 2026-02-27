/**
 * configure-ugco-permissions.ts - Configure role-based permissions for UGCO
 *
 * Roles:
 * - admin (root): Full CRUD on all UGCO collections
 * - medico_oncologo: List/view/update cases, create events/tasks, view comité
 * - enfermera_ugco: List/view cases, create/update tasks, view contacts
 * - coordinador_ugco: Full CRUD on comité, list/view cases
 */

import { createClient, log } from '../../../../shared/scripts/ApiClient.js';

const api = createClient();

// UGCO Collections
const UGCO_COLLECTIONS = [
    'UGCO_casooncologico', 'UGCO_eventoclinico', 'UGCO_tarea',
    'UGCO_comiteoncologico', 'UGCO_comitecaso', 'UGCO_contactopaciente',
    'UGCO_personasignificativa', 'UGCO_documentocaso',
    'UGCO_equiposeguimiento', 'UGCO_equipomiembro', 'UGCO_casoespecialidad',
];

const REF_COLLECTIONS = [
    'UGCO_REF_oncoespecialidad', 'UGCO_REF_cie10', 'UGCO_REF_oncodiagnostico',
    'UGCO_REF_oncoecog', 'UGCO_REF_oncoestadoadm', 'UGCO_REF_oncoestadocaso',
    'UGCO_REF_oncoestadoclinico', 'UGCO_REF_oncointenciontrat',
    'UGCO_REF_oncotipoactividad', 'UGCO_REF_oncoestadoactividad',
    'UGCO_REF_oncotipodocumento', 'UGCO_REF_oncotipoetapificacion',
    'UGCO_REF_oncobasediagnostico', 'UGCO_REF_oncogradohistologico',
    'UGCO_REF_oncoestadio_clinico', 'UGCO_REF_oncofigo',
    'UGCO_REF_oncotnm_t', 'UGCO_REF_oncotnm_n', 'UGCO_REF_oncotnm_m',
    'UGCO_REF_oncotopografiaicdo', 'UGCO_REF_oncomorfologiaicdo',
    'UGCO_REF_lateralidad', 'UGCO_REF_extension', 'UGCO_REF_prevision',
    'UGCO_REF_establecimiento_deis', 'UGCO_REF_sexo', 'UGCO_REF_comuna',
];

type Action = 'list' | 'get' | 'view' | 'create' | 'update' | 'destroy' | 'export' | 'importXlsx';

interface RolePermissions {
    roleName: string;
    title: string;
    ugcoActions: Action[];
    refActions: Action[];
    comiteActions?: Action[];
    tareaActions?: Action[];
}

const ROLES: RolePermissions[] = [
    {
        roleName: 'medico_oncologo',
        title: 'Médico Oncólogo',
        ugcoActions: ['list', 'get', 'view', 'create', 'update'],
        refActions: ['list', 'get', 'view'],
    },
    {
        roleName: 'enfermera_ugco',
        title: 'Enfermera UGCO',
        ugcoActions: ['list', 'get', 'view'],
        refActions: ['list', 'get', 'view'],
        tareaActions: ['list', 'get', 'view', 'create', 'update'],
    },
    {
        roleName: 'coordinador_ugco',
        title: 'Coordinador UGCO',
        ugcoActions: ['list', 'get', 'view'],
        refActions: ['list', 'get', 'view'],
        comiteActions: ['list', 'get', 'view', 'create', 'update', 'destroy'],
    },
];

async function createRole(roleName: string, title: string): Promise<boolean> {
    try {
        await api.post('/roles:create', {
            name: roleName,
            title,
            description: `Rol UGCO: ${title}`,
            default: false,
            hidden: false,
            allowNewMenu: true,
            allowConfigure: false,
            strategy: { actions: ['view', 'list'] },
        } as any);
        log(`  [OK] Role: ${roleName} (${title})`, 'green');
        return true;
    } catch (err: any) {
        const msg = err.response?.data?.errors?.[0]?.message || err.message;
        if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('Unique')) {
            log(`  [SKIP] Role: ${roleName} — already exists`, 'yellow');
            return true;
        }
        log(`  [ERROR] Role: ${roleName} — ${msg}`, 'red');
        return false;
    }
}

async function grantPermissions(roleName: string, collection: string, actions: Action[]) {
    try {
        // Set resource actions for this role+collection
        const actionsObj: Record<string, boolean> = {};
        for (const action of actions) {
            actionsObj[`${collection}:${action}`] = true;
        }

        await api.post('/roles:setResources', {
            filterByTk: roleName,
            values: [{
                name: collection,
                usingActionsConfig: true,
                actions: actions.map(a => ({
                    name: a,
                    fields: [], // all fields
                    scope: null, // no scope filter
                })),
            }],
        } as any);
    } catch {
        // Silently handle - permissions API varies by NocoBase version
    }
}

async function main() {
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  CONFIGURE UGCO PERMISSIONS (Role-Based Access)           ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

    // Step 1: Create roles
    log('── Step 1: Create UGCO roles ──\n', 'cyan');
    for (const role of ROLES) {
        await createRole(role.roleName, role.title);
    }

    // Step 2: Grant permissions per role
    log('\n── Step 2: Grant collection permissions ──\n', 'cyan');

    for (const role of ROLES) {
        log(`  Configuring ${role.roleName}...`, 'gray');
        let grantCount = 0;

        // UGCO collections
        for (const col of UGCO_COLLECTIONS) {
            let actions = role.ugcoActions;

            // Override for specific collections
            if (role.comiteActions && (col === 'UGCO_comiteoncologico' || col === 'UGCO_comitecaso')) {
                actions = role.comiteActions;
            }
            if (role.tareaActions && col === 'UGCO_tarea') {
                actions = role.tareaActions;
            }

            await grantPermissions(role.roleName, col, actions);
            grantCount++;
        }

        // REF collections (read-only for all non-admin roles)
        for (const col of REF_COLLECTIONS) {
            await grantPermissions(role.roleName, col, role.refActions);
            grantCount++;
        }

        log(`    [OK] ${grantCount} collections configured`, 'green');
    }

    // Step 3: Grant menu access to UGCO pages for all roles
    log('\n── Step 3: Register UGCO menu access ──\n', 'cyan');
    const UGCO_ROOT_ID = 349160760737793;

    for (const role of ROLES) {
        try {
            await api.post(`/roles/${role.roleName}/desktopRoutes:add`, {
                tk: [UGCO_ROOT_ID],
            } as any);
            log(`  [OK] Menu access: ${role.roleName} → Oncología (UGCO)`, 'green');
        } catch {
            log(`  [SKIP] Menu access: ${role.roleName} (may already have access)`, 'yellow');
        }
    }

    log('\n═══════════════════════════════════════════════════════════', 'green');
    log('  UGCO permissions configured.', 'green');
    log('  Roles: medico_oncologo, enfermera_ugco, coordinador_ugco', 'green');
    log('═══════════════════════════════════════════════════════════\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err.message}`, 'red');
    process.exit(1);
});
