/**
 * _fix-entrega-pages.ts
 *
 * Fixes pages created by deploy-entrega-phase3-pages.ts that lack schemaUid/tab children.
 * Deletes broken pages and recreates them using the correct shared createPage helper.
 *
 * Pages to fix:
 *   352808813264896 — 🔪 Pabellón
 *   352808813264898 — 📝 Notas Clínicas
 *   352808813264900 — ⚙️ Configuración
 *
 * Target parents:
 *   Pabellón, Notas → "Entrega Médica" (352413416226819)
 *   Configuración   → "Entrega de Turno" (352413416226818)
 */

import { createClient, log } from '../shared/scripts/ApiClient';
import { createPage, uid, buildTableBlock } from '../shared/scripts/nocobase-ui-helpers';

const api = createClient();

const ENTREGA_MEDICA_ID = 352413416226819;
const ENTREGA_TURNO_ID  = 352413416226818;

const BROKEN_PAGE_IDS = [352808813264896, 352808813264898, 352808813264900];

const ROLES_PABELLON = [
  'medico_cirugia', 'medico_medicina', 'medico_intensivista',
  'medico_obst_gin', 'medico_pediatria', 'traumatologia',
  'jefe_servicio', 'coordinador_pabellon',
];

const ROLES_NOTAS = [
  'medico_cirugia', 'medico_medicina', 'medico_intensivista',
  'medico_obst_gin', 'medico_pediatria', 'traumatologia',
  'enfermeria_servicio', 'enfermeria_mq1', 'enfermeria_uci',
  'jefe_servicio', 'coordinador_pabellon',
];

const ROLES_ADMIN = ['jefe_servicio', 'coordinador_pabellon', 'administrativo'];

// ─── helpers ────────────────────────────────────────────────────────────────

async function deleteRoute(id: number) {
  try {
    await api.post(`/desktopRoutes:destroy?filterByTk=${id}`, {} as any);
    log(`   🗑  Eliminada ruta ${id}`, 'gray');
  } catch (err: any) {
    log(`   ⚠️  No pudo eliminar ${id}: ${err.message}`, 'yellow');
  }
}

async function assignToRoles(pageId: number, tabId: number | undefined, roles: string[]) {
  const ids = tabId ? [pageId, tabId] : [pageId];
  for (const role of roles) {
    try {
      await api.post(`/roles/${role}/desktopRoutes:add`, { tk: ids } as any);
      log(`   ✅ ${role} → [${ids.join(', ')}]`, 'green');
    } catch (err: any) {
      log(`   ⚠️  ${role}: ${err.message}`, 'yellow');
    }
  }
}

async function addSimpleTable(gridUid: string, collection: string, title: string) {
  try {
    const providerUid = uid();
    const tableUid = uid();
    await api.post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, {
      schema: {
        type: 'void',
        'x-uid': providerUid,
        'x-decorator': 'TableBlockProvider',
        'x-decorator-props': {
          collection,
          dataSource: 'main',
          action: 'list',
          params: { pageSize: 20 },
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
          [tableUid]: {
            type: 'array',
            'x-component': 'TableV2',
            'x-component-props': { rowKey: 'id', rowSelection: { type: 'checkbox' } },
            'x-use-component-props': 'useTableBlockProps',
            properties: {},
          },
        },
      },
    } as any);
    log(`   ✅ Tabla "${collection}" añadida a ${gridUid}`, 'green');
  } catch (err: any) {
    log(`   ⚠️  Tabla "${collection}": ${err.message}`, 'yellow');
  }
}

async function getAllRoutes(): Promise<any[]> {
  const r = await api.get('/desktopRoutes:list?pageSize=300&sort=sort' as any);
  return (r as any).data?.data || (r as any).data || [];
}

async function getTabChild(pageId: number): Promise<{ id: number; schemaUid: string } | null> {
  const routes = await getAllRoutes();
  const tab = routes.find((r: any) => r.parentId === pageId && r.type === 'tabs');
  return tab ? { id: tab.id, schemaUid: tab.schemaUid } : null;
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('  Fix: Páginas ENTREGA (schemaUid + tab children)', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  // 1. Delete broken pages
  log('── Paso 1: Eliminar páginas sin schema ──\n', 'cyan');
  for (const id of BROKEN_PAGE_IDS) {
    await deleteRoute(id);
  }

  // Small delay to ensure deletes are committed
  await new Promise(r => setTimeout(r, 1000));

  // 2. Create Pabellón
  log('\n── Paso 2: Crear página Pabellón ──\n', 'cyan');
  const pabellon = await createPage(api, '🔪 Pabellón', ENTREGA_MEDICA_ID);
  if (pabellon) {
    log(`   route=${pabellon.routeId}, grid=${pabellon.gridUid}`, 'gray');

    const tabChild = await getTabChild(pabellon.routeId);
    log(`   tab child: ${JSON.stringify(tabChild)}`, 'gray');

    await assignToRoles(pabellon.routeId, tabChild?.id, ROLES_PABELLON);
    await addSimpleTable(pabellon.gridUid, 'et_operaciones_turno', 'Operaciones del Turno');
  }

  // 3. Create Notas Clínicas
  log('\n── Paso 3: Crear página Notas Clínicas ──\n', 'cyan');
  const notas = await createPage(api, '📝 Notas Clínicas', ENTREGA_MEDICA_ID);
  if (notas) {
    log(`   route=${notas.routeId}, grid=${notas.gridUid}`, 'gray');

    const tabChild = await getTabChild(notas.routeId);
    await assignToRoles(notas.routeId, tabChild?.id, ROLES_NOTAS);
    await addSimpleTable(notas.gridUid, 'et_notas_clinicas', 'Historial de Notas Clínicas');
  }

  // 4. Create Configuración
  log('\n── Paso 4: Crear página Configuración ──\n', 'cyan');
  const config = await createPage(api, '⚙️ Configuración', ENTREGA_TURNO_ID);
  if (config) {
    log(`   route=${config.routeId}, grid=${config.gridUid}`, 'gray');

    const tabChild = await getTabChild(config.routeId);
    await assignToRoles(config.routeId, tabChild?.id, ROLES_ADMIN);
    await addSimpleTable(config.gridUid, 'et_config_sistema', 'Parámetros del Sistema');
    await addSimpleTable(config.gridUid, 'et_tipos_nota', 'Tipos de Nota Clínica');
    await addSimpleTable(config.gridUid, 'et_servicios', 'Servicios Hospitalarios');
    await addSimpleTable(config.gridUid, 'et_especialidades', 'Especialidades Médicas');
  }

  log('\n═══════════════════════════════════════════════════════════', 'green');
  log('  ✅ Fix páginas ENTREGA — COMPLETADO', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'green');
}

main().catch(err => {
  log(`\n❌ Fatal: ${err.message}`, 'red');
  process.exit(1);
});
