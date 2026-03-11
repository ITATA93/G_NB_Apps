/**
 * deploy-entrega-phase2-roles.ts
 *
 * ENTREGA — Fase 2: Roles nuevos + permisos para nuevas colecciones
 *
 *   Roles nuevos:
 *     `tens`           — Solo lectura de censo de pacientes (sin RUT/edad/pendientes)
 *     `administrativo` — Lectura global + editar catálogos + descargar PDF
 *
 *   Roles existentes actualizados (nuevas colecciones):
 *     et_tipos_nota, et_notas_clinicas, et_operaciones_turno, et_config_sistema
 *
 * Idempotente: seguro de re-ejecutar.
 *
 * Uso:
 *   npx tsx Apps/ENTREGA/scripts/deploy-entrega-phase2-roles.ts
 */

import { createClient, log } from '../../../shared/scripts/ApiClient.js';

const api = createClient();

type Action = 'list' | 'get' | 'view' | 'create' | 'update' | 'destroy';

const READ_ONLY:  Action[] = ['list', 'get', 'view'];
const READ_WRITE: Action[] = ['list', 'get', 'view', 'create', 'update'];
const FULL_CRUD:  Action[] = ['list', 'get', 'view', 'create', 'update', 'destroy'];

// =============================================
// PERMISOS DE ROLES NUEVOS
// =============================================

/**
 * TENS: solo puede ver el censo de pacientes.
 * - Sin acceso a: notas, turnos, operaciones, cotratancia, config
 * - Ocultar RUT/edad/pendientes via UI (field-level)
 */
const TENS_PERMS: Record<string, Action[]> = {
  et_especialidades:  READ_ONLY,
  et_servicios:       READ_ONLY,
  et_pacientes_censo: READ_ONLY,
  // Sin acceso a: et_usuarios, et_diagnosticos, et_cotratancia, et_turnos,
  //               et_entrega_paciente, et_eventos_turno, et_entrega_enfermeria,
  //               et_notas_clinicas, et_operaciones_turno, et_config_sistema, et_tipos_nota
};

/**
 * ADMINISTRATIVO: lectura global + gestión de catálogos + config.
 * - Puede leer TODO (sin editar registros clínicos)
 * - Puede editar: et_tipos_nota, et_especialidades, et_servicios, et_config_sistema
 * - Puede descargar PDF (lectura de et_turnos con campo pdf_generado)
 */
const ADMINISTRATIVO_PERMS: Record<string, Action[]> = {
  et_especialidades:      READ_WRITE,   // Editar catálogo de especialidades
  et_servicios:           READ_WRITE,   // Editar catálogo de servicios
  et_usuarios:            READ_ONLY,
  et_pacientes_censo:     READ_ONLY,
  et_diagnosticos:        READ_ONLY,
  et_cotratancia:         READ_ONLY,
  et_turnos:              READ_ONLY,    // Incluye lectura de pdf_generado
  et_entrega_paciente:    READ_ONLY,
  et_eventos_turno:       READ_ONLY,
  et_entrega_enfermeria:  READ_ONLY,
  et_tipos_nota:          READ_WRITE,   // Editar tipos de nota
  et_notas_clinicas:      READ_ONLY,
  et_operaciones_turno:   READ_ONLY,
  et_config_sistema:      FULL_CRUD,    // Gestión completa de configuración
};

// =============================================
// PERMISOS ADICIONALES PARA ROLES EXISTENTES
// (nuevas colecciones de fase 2)
// =============================================

/** Médicos: crear/ver notas y operaciones */
const MEDICO_NEW_PERMS: Record<string, Action[]> = {
  et_tipos_nota:         READ_ONLY,
  et_notas_clinicas:     READ_WRITE,  // Crear notas; no editar/eliminar (regla de negocio)
  et_operaciones_turno:  READ_WRITE,
  et_config_sistema:     READ_ONLY,
};

/** Enfermería: crear notas (tipo Enfermería/Observación TENS), ver operaciones */
const ENFERMERIA_NEW_PERMS: Record<string, Action[]> = {
  et_tipos_nota:         READ_ONLY,
  et_notas_clinicas:     READ_WRITE,  // Filtro por tipo_nota se aplica en UI
  et_operaciones_turno:  READ_ONLY,
  et_config_sistema:     READ_ONLY,
};

/** Jefatura: CRUD completo en todo */
const JEFATURA_NEW_PERMS: Record<string, Action[]> = {
  et_tipos_nota:         FULL_CRUD,
  et_notas_clinicas:     FULL_CRUD,
  et_operaciones_turno:  FULL_CRUD,
  et_config_sistema:     FULL_CRUD,
};

// Mapa de roles existentes → permisos nuevos
const EXISTING_ROLE_UPDATES: Array<{
  roles: string[];
  newPerms: Record<string, Action[]>;
  label: string;
}> = [
  {
    roles: [
      'medico_cirugia', 'medico_medicina', 'medico_intensivista',
      'medico_obst_gin', 'medico_pediatria', 'traumatologia',
    ],
    newPerms: MEDICO_NEW_PERMS,
    label: 'Médicos (6 roles)',
  },
  {
    roles: ['enfermeria_servicio', 'enfermeria_mq1', 'enfermeria_uci'],
    newPerms: ENFERMERIA_NEW_PERMS,
    label: 'Enfermería (3 roles)',
  },
  {
    roles: ['jefe_servicio', 'coordinador_pabellon'],
    newPerms: JEFATURA_NEW_PERMS,
    label: 'Jefatura (2 roles)',
  },
];

// =============================================
// HELPERS
// =============================================

async function createRole(
  roleName: string,
  title: string,
  description: string,
): Promise<boolean> {
  try {
    await api.post('/roles:create', {
      name: roleName,
      title,
      description,
      default: false,
      hidden: false,
      allowNewMenu: true,
      allowConfigure: false,
      strategy: { actions: ['view', 'list'] },
    } as any);
    log(`  ✅ Rol creado: ${roleName} (${title})`, 'green');
    return true;
  } catch (err: any) {
    const msg = err.response?.data?.errors?.[0]?.message || err.message;
    if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('Unique')) {
      log(`  ⚠️  Rol "${roleName}" ya existe`, 'yellow');
      return true;
    }
    log(`  ❌ Rol "${roleName}": ${msg}`, 'red');
    return false;
  }
}

async function grantPermissions(
  roleName: string,
  permissions: Record<string, Action[]>,
): Promise<void> {
  // 1. Crear resource entries (skip si ya existe)
  for (const collection of Object.keys(permissions)) {
    try {
      await api.post(`/roles/${roleName}/resources:create`, {
        name: collection,
        usingActionsConfig: true,
      } as any);
    } catch {
      // Silencioso: ya existe
    }
  }

  // 2. Obtener IDs numéricos de los resources
  const res = await api.get(`/roles/${roleName}/resources:list`, {
    pageSize: 200,
    appends: ['actions'],
  } as any);
  const resources = (res.data || []) as any[];

  // 3. Actualizar cada resource con sus actions usando ID numérico
  for (const [collection, actions] of Object.entries(permissions)) {
    const resource = resources.find((r: any) => r.name === collection);
    if (!resource) {
      log(`    ⚠️  Resource "${collection}" no encontrado para rol ${roleName}`, 'yellow');
      continue;
    }

    try {
      await api.post(
        `/roles/${roleName}/resources:update?filterByTk=${resource.id}`,
        {
          usingActionsConfig: true,
          actions: actions.map((a) => ({ name: a })),
        } as any,
      );
      log(`    ✅ ${roleName}.${collection} [${actions.join(', ')}]`, 'green');
    } catch (err: any) {
      log(`    ⚠️  ${collection}: ${err.message}`, 'yellow');
    }
  }
}

// =============================================
// MAIN
// =============================================

async function main() {
  log('\n╔═══════════════════════════════════════════════════════════════╗', 'cyan');
  log('║  ENTREGA FASE 2 — Roles: tens + administrativo + actualizaciones ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════╝\n', 'cyan');

  // ── Paso 1: Crear roles nuevos ────────────────────────────────────
  log('── Paso 1: Crear roles nuevos ──\n', 'cyan');
  await createRole(
    'tens',
    'TENS',
    'Técnico de Enfermería — solo lectura del censo de pacientes de su unidad',
  );
  await createRole(
    'administrativo',
    'Administrativo',
    'Lectura global, exportación de PDF, edición de catálogos y configuración',
  );

  // ── Paso 2: Permisos rol tens ─────────────────────────────────────
  log('\n── Paso 2: Permisos para rol "tens" ──\n', 'cyan');
  await grantPermissions('tens', TENS_PERMS);

  // ── Paso 3: Permisos rol administrativo ──────────────────────────
  log('\n── Paso 3: Permisos para rol "administrativo" ──\n', 'cyan');
  await grantPermissions('administrativo', ADMINISTRATIVO_PERMS);

  // ── Paso 4: Actualizar roles existentes ──────────────────────────
  log('\n── Paso 4: Agregar nuevas colecciones a roles existentes ──\n', 'cyan');
  for (const { roles, newPerms, label } of EXISTING_ROLE_UPDATES) {
    log(`\n  → ${label}`, 'cyan');
    for (const roleName of roles) {
      log(`    Actualizando ${roleName}...`, 'gray');
      await grantPermissions(roleName, newPerms);
    }
  }

  log('\n═══════════════════════════════════════════════════════════════', 'green');
  log('  ✅ ENTREGA FASE 2 ROLES — COMPLETADO', 'green');
  log('  Roles nuevos: tens, administrativo', 'green');
  log('  Colecciones actualizadas en: 11 roles existentes', 'green');
  log('═══════════════════════════════════════════════════════════════\n', 'green');
}

main().catch((err) => {
  log(`\n[FATAL] ${err.message}`, 'red');
  process.exit(1);
});
