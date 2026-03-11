/**
 * deploy-entrega-phase3-pages.ts
 *
 * ENTREGA — Fase 3: Páginas nuevas del blueprint
 *
 *   Crea las siguientes páginas en el grupo "🏥 Entrega Médica":
 *     - Pabellón        → tabla et_operaciones_turno (turno activo)
 *     - Notas Clínicas  → tabla et_notas_clinicas (todas)
 *     - Admin / Config  → pestañas: Config Global, Catálogos, Usuarios
 *
 *   Asigna las nuevas páginas a todos los roles ENTREGA relevantes.
 *
 *   NOTA: Este script crea las rutas de menú y bloques de tabla básicos.
 *   Los formularios de creación/edición y los drawers de detalle deben
 *   configurarse en la UI de NocoBase (sección Bloques → Formulario).
 *
 * Uso:
 *   npx tsx Apps/ENTREGA/scripts/deploy-entrega-phase3-pages.ts
 *   npx tsx Apps/ENTREGA/scripts/deploy-entrega-phase3-pages.ts --dry-run
 */

import { createClient, log } from '../../../shared/scripts/ApiClient.js';

const api = createClient();
const DRY_RUN = process.argv.includes('--dry-run');

// =============================================
// ROLES QUE DEBEN VER LAS NUEVAS PÁGINAS
// =============================================

// Pabellón: solo médicos y jefatura
const ROLES_PABELLON = [
  'medico_cirugia', 'medico_medicina', 'medico_intensivista',
  'medico_obst_gin', 'medico_pediatria', 'traumatologia',
  'jefe_servicio', 'coordinador_pabellon',
];

// Notas clínicas: médicos + enfermería + jefatura
const ROLES_NOTAS = [
  'medico_cirugia', 'medico_medicina', 'medico_intensivista',
  'medico_obst_gin', 'medico_pediatria', 'traumatologia',
  'enfermeria_servicio', 'enfermeria_mq1', 'enfermeria_uci',
  'jefe_servicio', 'coordinador_pabellon',
];

// Admin/Config: jefatura + administrativo
const ROLES_ADMIN = [
  'jefe_servicio', 'coordinador_pabellon', 'administrativo',
];

// =============================================
// HELPERS
// =============================================

async function getAllRoutes(): Promise<any[]> {
  try {
    const res = await api.get('/desktopRoutes:list', { pageSize: 200 } as any);
    return (res.data || []) as any[];
  } catch {
    return [];
  }
}

async function findGroupByTitle(routes: any[], title: string): Promise<any | null> {
  return routes.find((r: any) => r.title === title && r.type === 'group') || null;
}

async function findPageByTitle(routes: any[], title: string): Promise<any | null> {
  return routes.find((r: any) => r.title === title && r.type === 'page') || null;
}

async function createPage(
  title: string,
  icon: string,
  parentId: number | undefined,
): Promise<number | null> {
  try {
    if (DRY_RUN) {
      log(`   [DRY] Crearía página: "${title}"`, 'gray');
      return 99999; // Fake ID para dry-run
    }

    const body: any = {
      type: 'page',
      title,
      icon,
    };
    if (parentId) body.parentId = parentId;

    const res = await api.post('/desktopRoutes:create', body as any);
    const id = (res as any)?.id || (res as any)?.data?.id;
    log(`   ✅ Página "${title}" creada (ID: ${id})`, 'green');
    return id;
  } catch (err: any) {
    const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      log(`   ⚠️  "${title}" ya existe`, 'yellow');
      return null;
    }
    log(`   ❌ "${title}": ${msg}`, 'red');
    return null;
  }
}

async function createTabPage(
  title: string,
  parentId: number,
): Promise<number | null> {
  try {
    if (DRY_RUN) {
      log(`      [DRY] Tab: "${title}" en parentId ${parentId}`, 'gray');
      return 99999;
    }

    const res = await api.post('/desktopRoutes:create', {
      type: 'tabs',
      title,
      parentId,
      hidden: false,
    } as any);

    const id = (res as any)?.id || (res as any)?.data?.id;

    // El tab tiene un hijo de tipo tabs que es el schemaUid real
    // NocoBase auto-crea el nodo hijo
    log(`      ✅ Tab "${title}" (ID: ${id})`, 'green');
    return id;
  } catch (err: any) {
    log(`      ⚠️  Tab "${title}": ${err.message}`, 'yellow');
    return null;
  }
}

async function assignPageToRoles(
  pageId: number,
  roles: string[],
  tabChildIds: number[],
): Promise<void> {
  const allIds = [pageId, ...tabChildIds];

  for (const role of roles) {
    try {
      if (DRY_RUN) {
        log(`   [DRY] Asignaría páginas ${allIds.join(',')} al rol ${role}`, 'gray');
        continue;
      }

      await api.post(`/roles/${role}/desktopRoutes:add`, {
        tk: allIds,
      } as any);

      log(`   ✅ ${role} → páginas ${allIds.join(', ')}`, 'green');
    } catch (err: any) {
      log(`   ⚠️  ${role}: ${err.message}`, 'yellow');
    }
  }
}

async function addTableBlock(
  schemaUid: string,
  collection: string,
  title: string,
): Promise<void> {
  /**
   * Agrega un bloque de tabla básico a la página usando uiSchemas:insertAdjacent.
   * La tabla creada tiene configuración mínima. Columnas y formularios se
   * configuran en la UI de NocoBase.
   */
  try {
    if (DRY_RUN) {
      log(`   [DRY] Agregaría tabla "${collection}" a schema ${schemaUid}`, 'gray');
      return;
    }

    const blockUid = `et_${collection}_table_${Date.now()}`;
    const providerUid = `${blockUid}_provider`;

    await api.post(`/uiSchemas:insertAdjacent`, {
      uid: schemaUid,
      position: 'beforeEnd',
      schema: {
        type: 'void',
        'x-uid': providerUid,
        'x-decorator': 'TableBlockProvider',
        'x-decorator-props': {
          collection,
          dataSource: 'main',
          action: 'list',
          params: {
            pageSize: 20,
          },
        },
        'x-component': 'CardItem',
        'x-component-props': { title },
        properties: {
          actions: {
            type: 'void',
            'x-component': 'ActionBar',
            'x-component-props': { style: { marginBottom: 16 } },
            properties: {},
          },
          [blockUid]: {
            type: 'array',
            'x-component': 'TableV2',
            'x-component-props': { rowKey: 'id', rowSelection: { type: 'checkbox' } },
            'x-use-component-props': 'useTableBlockProps',
            properties: {},
          },
        },
      },
    } as any);

    log(`   ✅ Bloque tabla "${collection}" añadido a ${schemaUid}`, 'green');
  } catch (err: any) {
    log(`   ⚠️  Tabla "${collection}": ${err.message}`, 'yellow');
  }
}

// =============================================
// MAIN
// =============================================

async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║  ENTREGA FASE 3 — Páginas nuevas del Blueprint            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  if (DRY_RUN) log('🔍 MODO DRY RUN — no se crearán datos reales.\n', 'yellow');

  // 1. Leer estructura actual de rutas
  log('📋 Leyendo estructura de menú actual...', 'cyan');
  const allRoutes = await getAllRoutes();
  log(`   ${allRoutes.length} rutas encontradas\n`, 'gray');

  // Buscar el grupo "Entrega Médica" padre
  const grupoMedico = await findGroupByTitle(allRoutes, '🏥 Entrega Médica');
  const grupoMedicoId = grupoMedico?.id;
  if (!grupoMedicoId) {
    log('   ⚠️  Grupo "🏥 Entrega Médica" no encontrado. Las páginas se crearán sin grupo padre.', 'yellow');
  } else {
    log(`   ✅ Grupo "🏥 Entrega Médica" encontrado (ID: ${grupoMedicoId})\n`, 'green');
  }

  // ── PÁGINA: PABELLÓN ─────────────────────────────────────────────
  log('── Crear página: Pabellón ──\n', 'cyan');

  const existingPabellon = await findPageByTitle(allRoutes, '🔪 Pabellón');
  let pabellonId: number | null = null;

  if (existingPabellon) {
    log(`   ⚠️  Página "Pabellón" ya existe (ID: ${existingPabellon.id})`, 'yellow');
    pabellonId = existingPabellon.id;
  } else {
    pabellonId = await createPage('🔪 Pabellón', 'ScissorOutlined', grupoMedicoId);
  }

  if (pabellonId) {
    // Buscar la pestaña (tab child) de la página
    const tabChild = allRoutes.find(
      (r: any) => r.parentId === pabellonId && r.type === 'tabs',
    );

    log('\n   Asignando "Pabellón" a roles médicos y jefatura...', 'cyan');
    await assignPageToRoles(
      pabellonId,
      ROLES_PABELLON,
      tabChild ? [tabChild.id] : [],
    );

    if (tabChild?.schemaUid) {
      log(`\n   Agregando tabla et_operaciones_turno...`, 'cyan');
      await addTableBlock(tabChild.schemaUid, 'et_operaciones_turno', 'Operaciones del Turno');
    } else {
      log('\n   ⚠️  schemaUid del tab no disponible. Agregar tabla manualmente en la UI.', 'yellow');
    }
  }

  // ── PÁGINA: NOTAS CLÍNICAS ───────────────────────────────────────
  log('\n── Crear página: Notas Clínicas ──\n', 'cyan');

  const existingNotas = await findPageByTitle(allRoutes, '📝 Notas Clínicas');
  let notasId: number | null = null;

  if (existingNotas) {
    log(`   ⚠️  Página "Notas Clínicas" ya existe (ID: ${existingNotas.id})`, 'yellow');
    notasId = existingNotas.id;
  } else {
    notasId = await createPage('📝 Notas Clínicas', 'FileTextOutlined', grupoMedicoId);
  }

  if (notasId) {
    const tabChild = allRoutes.find(
      (r: any) => r.parentId === notasId && r.type === 'tabs',
    );

    log('\n   Asignando "Notas Clínicas" a roles médicos + enfermería + jefatura...', 'cyan');
    await assignPageToRoles(
      notasId,
      ROLES_NOTAS,
      tabChild ? [tabChild.id] : [],
    );

    if (tabChild?.schemaUid) {
      await addTableBlock(tabChild.schemaUid, 'et_notas_clinicas', 'Historial de Notas Clínicas');
    }
  }

  // ── PÁGINA: ADMIN / CONFIG ───────────────────────────────────────
  log('\n── Crear página: Admin / Configuración ──\n', 'cyan');

  const existingAdmin = await findPageByTitle(allRoutes, '⚙️ Configuración');
  let adminId: number | null = null;

  if (existingAdmin) {
    log(`   ⚠️  Página "Configuración" ya existe (ID: ${existingAdmin.id})`, 'yellow');
    adminId = existingAdmin.id;
  } else {
    // Esta página va sin grupo padre (menú principal) o en un grupo "Admin"
    adminId = await createPage('⚙️ Configuración', 'SettingOutlined', undefined);
  }

  if (adminId) {
    const tabChild = allRoutes.find(
      (r: any) => r.parentId === adminId && r.type === 'tabs',
    );

    log('\n   Asignando "Configuración" a jefatura y administrativo...', 'cyan');
    await assignPageToRoles(
      adminId,
      ROLES_ADMIN,
      tabChild ? [tabChild.id] : [],
    );

    if (tabChild?.schemaUid) {
      // Tab 1: Configuración global (et_config_sistema)
      await addTableBlock(tabChild.schemaUid, 'et_config_sistema', 'Parámetros del Sistema');
      // Tab 2: Tipos de nota
      await addTableBlock(tabChild.schemaUid, 'et_tipos_nota', 'Tipos de Nota Clínica');
      // Tab 3: Servicios
      await addTableBlock(tabChild.schemaUid, 'et_servicios', 'Servicios Hospitalarios');
      // Tab 4: Especialidades
      await addTableBlock(tabChild.schemaUid, 'et_especialidades', 'Especialidades Médicas');
    }
  }

  // ── RESUMEN ──────────────────────────────────────────────────────
  log('\n═══════════════════════════════════════════════════════════', 'green');
  log('  ✅ ENTREGA FASE 3 PÁGINAS — COMPLETADO', 'green');
  log('═══════════════════════════════════════════════════════════', 'green');

  printManualNotes();
}

function printManualNotes() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'yellow');
  log('║  ⚠️  CONFIGURACIÓN MANUAL REQUERIDA EN LA UI              ║', 'yellow');
  log('╠════════════════════════════════════════════════════════════╣', 'yellow');
  log('║                                                            ║', 'yellow');
  log('║  Página PABELLÓN:                                         ║', 'yellow');
  log('║    1. Agregar columnas a la tabla et_operaciones_turno    ║', 'yellow');
  log('║       (paciente, fecha_hora_cx, tipo, procedimiento,      ║', 'yellow');
  log('║        cirujano, estado_cx, complicaciones)               ║', 'yellow');
  log('║    2. Agregar botón "+ Nueva operación" con formulario     ║', 'yellow');
  log('║    3. Agregar filtro por turno activo y estado_cx         ║', 'yellow');
  log('║    4. Agregar acción Ver / Editar en cada fila            ║', 'yellow');
  log('║                                                            ║', 'yellow');
  log('║  Página NOTAS CLÍNICAS:                                   ║', 'yellow');
  log('║    1. Agregar columnas: fecha_nota, turno_horario,        ║', 'yellow');
  log('║       tipo_nota, paciente, contenido (resumen), autor     ║', 'yellow');
  log('║    2. Botón "+ Agregar nota" con formulario:              ║', 'yellow');
  log('║       paciente, turno_horario, tipo_nota, contenido       ║', 'yellow');
  log('║    3. NO exponer botones Editar/Eliminar (inmutable)      ║', 'yellow');
  log('║    4. Filtros: por paciente, tipo_nota, fecha             ║', 'yellow');
  log('║                                                            ║', 'yellow');
  log('║  Página CONFIGURACIÓN:                                    ║', 'yellow');
  log('║    1. et_config_sistema: tabla editable (clave+valor)     ║', 'yellow');
  log('║    2. et_tipos_nota: tabla CRUD para catálogo de tipos    ║', 'yellow');
  log('║    3. et_servicios: tabla CRUD para servicios             ║', 'yellow');
  log('║    4. et_especialidades: tabla CRUD                       ║', 'yellow');
  log('║    5. Organizar en pestañas (Tabs) si la UI lo permite    ║', 'yellow');
  log('║                                                            ║', 'yellow');
  log('║  Dashboard (enriquecer página existente):                 ║', 'yellow');
  log('║    1. Agregar 5 KPI cards (total activos, altas,          ║', 'yellow');
  log('║       ingresos, operados, fallecidos)                     ║', 'yellow');
  log('║    2. Agregar chart barras horizontales por servicio       ║', 'yellow');
  log('║    3. Agregar tabla de pacientes críticos                 ║', 'yellow');
  log('║    4. Agregar tabla de aislamientos + casos sociales      ║', 'yellow');
  log('║    5. Agregar campo texto_distribucion del turno activo   ║', 'yellow');
  log('║                                                            ║', 'yellow');
  log('║  Vista Global (enriquecer página existente):              ║', 'yellow');
  log('║    1. Activar agrupación por servicio_id (Unidad)         ║', 'yellow');
  log('║    2. Activar colores de fila por estado_paciente         ║', 'yellow');
  log('║    3. Agregar columnas: es_aislamiento,                   ║', 'yellow');
  log('║       requiere_interconsulta, estado_turno                ║', 'yellow');
  log('║    4. Filtros rápidos: estado_turno, es_aislamiento       ║', 'yellow');
  log('║                                                            ║', 'yellow');
  log('╚════════════════════════════════════════════════════════════╝\n', 'yellow');
}

main().catch((err) => {
  log(`\n[FATAL] ${err.message}`, 'red');
  process.exit(1);
});
