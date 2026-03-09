/**
 * deploy-agenda-roles.ts — AGENDA: Crear roles y permisos en NocoBase
 *
 * Roles (del blueprint app.yaml):
 *   - admin_agenda          → CRUD completo en todos los recursos
 *   - jefe_servicio_agenda  → CRUD filtrado a servicio propio
 *   - medico_agenda         → Ver/crear propios bloques e inasistencias
 *
 * Uso:
 *   npx tsx Apps/AGENDA/scripts/deploy-agenda-roles.ts
 */

import { createClient, log } from '../../../shared/scripts/ApiClient.js';

const api = createClient();

type Action = 'list' | 'get' | 'view' | 'create' | 'update' | 'destroy';

interface RoleConfig {
  roleName: string;
  title: string;
  description: string;
  permissions: Record<string, Action[]>;
}

const ROLES: RoleConfig[] = [
  {
    roleName: 'admin_agenda',
    title: 'Administrador Agenda Médica',
    description: 'Control total de la agenda: funcionarios, bloques, inasistencias, resúmenes',
    permissions: {
      ag_categorias_actividad: ['list', 'get', 'view', 'create', 'update', 'destroy'],
      ag_tipos_inasistencia: ['list', 'get', 'view', 'create', 'update', 'destroy'],
      ag_servicios: ['list', 'get', 'view', 'create', 'update', 'destroy'],
      ag_funcionarios: ['list', 'get', 'view', 'create', 'update', 'destroy'],
      ag_bloques_agenda: ['list', 'get', 'view', 'create', 'update', 'destroy'],
      ag_inasistencias: ['list', 'get', 'view', 'create', 'update', 'destroy'],
      ag_resumen_diario: ['list', 'get', 'view', 'create', 'update', 'destroy'],
      ag_resumen_semanal: ['list', 'get', 'view', 'create', 'update', 'destroy'],
    },
  },
  {
    roleName: 'jefe_servicio_agenda',
    title: 'Jefe de Servicio (Agenda)',
    description: 'Gestión de agenda para su servicio clínico',
    permissions: {
      ag_categorias_actividad: ['list', 'get', 'view'],
      ag_tipos_inasistencia: ['list', 'get', 'view'],
      ag_servicios: ['list', 'get', 'view'],
      ag_funcionarios: ['list', 'get', 'view'],
      ag_bloques_agenda: ['list', 'get', 'view', 'create', 'update'],
      ag_inasistencias: ['list', 'get', 'view', 'create', 'update'],
      ag_resumen_diario: ['list', 'get', 'view'],
      ag_resumen_semanal: ['list', 'get', 'view'],
    },
  },
  {
    roleName: 'medico_agenda',
    title: 'Médico (Agenda)',
    description: 'Médico — puede ver y registrar su propia agenda',
    permissions: {
      ag_categorias_actividad: ['list', 'get', 'view'],
      ag_tipos_inasistencia: ['list', 'get', 'view'],
      ag_servicios: ['list', 'get', 'view'],
      ag_funcionarios: ['list', 'get', 'view'],
      ag_bloques_agenda: ['list', 'get', 'view', 'create', 'update'],
      ag_inasistencias: ['list', 'get', 'view'],
      ag_resumen_diario: ['list', 'get', 'view'],
      ag_resumen_semanal: ['list', 'get', 'view'],
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
    log(`  [OK] Role: ${role.roleName}`, 'green');
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
          actions: actions.map((a) => ({ name: a, fields: [], scope: null })),
        },
      ],
    } as any);
  } catch {
    /* Silent */
  }
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║  DEPLOY AGENDA ROLES & PERMISSIONS                        ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  log('── Step 1: Crear roles AGENDA ──\n', 'cyan');
  for (const role of ROLES) await createRole(role);

  log('\n── Step 2: Asignar permisos ──\n', 'cyan');
  for (const role of ROLES) {
    log(`  Configurando ${role.roleName}...`, 'gray');
    for (const [col, actions] of Object.entries(role.permissions)) {
      await grantPermissions(role.roleName, col, actions);
    }
    log(`    [OK] ${Object.keys(role.permissions).length} colecciones`, 'green');
  }

  log('\n═══════════════════════════════════════════════════════════', 'green');
  log('  AGENDA Roles: admin_agenda, jefe_servicio_agenda, medico_agenda', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'green');
}

main().catch((err) => {
  log(`\n[FATAL] ${err.message}`, 'red');
  process.exit(1);
});
