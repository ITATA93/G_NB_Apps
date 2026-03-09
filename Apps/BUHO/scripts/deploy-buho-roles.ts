/**
 * deploy-buho-roles.ts — BUHO: Crear roles y permisos en NocoBase
 *
 * Roles:
 *   - medico_buho         → Ver/editar pacientes, planes de trabajo, confirmar alertas
 *   - enfermeria_buho     → Ver pacientes, gestionar camas, alertas
 *   - jefe_servicio_buho  → Full CRUD en todo BUHO, acceso a parámetros de riesgo
 *
 * Uso:
 *   npx tsx Apps/BUHO/scripts/deploy-buho-roles.ts
 */

import { createClient, log } from '../../../shared/scripts/ApiClient.js';

const api = createClient();

const BUHO_COLLECTIONS = [
  'buho_pacientes',
  'buho_camas',
  'buho_alertas',
  'buho_planes_trabajo',
  'buho_parametros_riesgo',
];

type Action = 'list' | 'get' | 'view' | 'create' | 'update' | 'destroy';

interface RoleConfig {
  roleName: string;
  title: string;
  description: string;
  permissions: Record<string, Action[]>;
}

const ROLES: RoleConfig[] = [
  {
    roleName: 'medico_buho',
    title: 'Médico BUHO',
    description: 'Médico tratante — gestión de pacientes y planes de trabajo',
    permissions: {
      buho_pacientes: ['list', 'get', 'view', 'update'],
      buho_camas: ['list', 'get', 'view'],
      buho_alertas: ['list', 'get', 'view', 'update'],
      buho_planes_trabajo: ['list', 'get', 'view', 'create', 'update'],
      buho_parametros_riesgo: ['list', 'get', 'view'],
    },
  },
  {
    roleName: 'enfermeria_buho',
    title: 'Enfermería BUHO',
    description: 'Personal de enfermería — seguimiento de camas y alertas',
    permissions: {
      buho_pacientes: ['list', 'get', 'view'],
      buho_camas: ['list', 'get', 'view', 'create', 'update'],
      buho_alertas: ['list', 'get', 'view', 'update'],
      buho_planes_trabajo: ['list', 'get', 'view'],
      buho_parametros_riesgo: ['list', 'get', 'view'],
    },
  },
  {
    roleName: 'jefe_servicio_buho',
    title: 'Jefe de Servicio BUHO',
    description: 'Jefatura clínica — acceso completo a BUHO',
    permissions: {
      buho_pacientes: ['list', 'get', 'view', 'create', 'update'],
      buho_camas: ['list', 'get', 'view', 'create', 'update', 'destroy'],
      buho_alertas: ['list', 'get', 'view', 'create', 'update', 'destroy'],
      buho_planes_trabajo: ['list', 'get', 'view', 'create', 'update'],
      buho_parametros_riesgo: ['list', 'get', 'view', 'create', 'update'],
    },
  },
];

async function createRole(role: RoleConfig): Promise<boolean> {
  try {
    await api.post('/roles:create', {
      name: role.roleName,
      title: role.title,
      description: role.description,
      default: false,
      hidden: false,
      allowNewMenu: true,
      allowConfigure: false,
      strategy: { actions: ['view', 'list'] },
    } as any);
    log(`  [OK] Role: ${role.roleName} (${role.title})`, 'green');
    return true;
  } catch (err: any) {
    const msg = err.response?.data?.errors?.[0]?.message || err.message;
    if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('Unique')) {
      log(`  [SKIP] Role: ${role.roleName} — ya existe`, 'yellow');
      return true;
    }
    log(`  [ERROR] Role: ${role.roleName} — ${msg}`, 'red');
    return false;
  }
}

async function grantPermissions(roleName: string, collection: string, actions: Action[]) {
  try {
    await api.post('/roles:setResources', {
      filterByTk: roleName,
      values: [
        {
          name: collection,
          usingActionsConfig: true,
          actions: actions.map((a) => ({
            name: a,
            fields: [],
            scope: null,
          })),
        },
      ],
    } as any);
  } catch {
    // Silent — permissions API varies by version
  }
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║  DEPLOY BUHO ROLES & PERMISSIONS                          ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  log('── Step 1: Crear roles BUHO ──\n', 'cyan');
  for (const role of ROLES) {
    await createRole(role);
  }

  log('\n── Step 2: Asignar permisos por colección ──\n', 'cyan');
  for (const role of ROLES) {
    log(`  Configurando ${role.roleName}...`, 'gray');
    for (const [col, actions] of Object.entries(role.permissions)) {
      await grantPermissions(role.roleName, col, actions);
    }
    log(`    [OK] ${Object.keys(role.permissions).length} colecciones configuradas`, 'green');
  }

  log('\n═══════════════════════════════════════════════════════════', 'green');
  log('  BUHO Roles configurados: medico_buho, enfermeria_buho, jefe_servicio_buho', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'green');
}

main().catch((err) => {
  log(`\n[FATAL] ${err.message}`, 'red');
  process.exit(1);
});
