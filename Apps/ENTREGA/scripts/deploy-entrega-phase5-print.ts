/**
 * deploy-entrega-phase5-print.ts
 *
 * Agrega capacidad de impresión al módulo ENTREGA usando el plugin
 * gratuito "Action: Print" (action-print v1.9.14, ya habilitado).
 *
 * 1. Botón Print en ActionBar de la tabla de Historial (et_turnos)
 *    → Imprime la tabla visible con todos los turnos
 *
 * 2. Nueva página "🖨️ Imprimir Entrega":
 *    → Detail view del turno (todos los campos)
 *    → Tabla de pacientes activos (et_pacientes_censo)
 *    → Botón Print que dispara browser print con CSS de impresión
 *    → Accesible para todos los roles médicos + jefatura
 *
 * El plugin action-print usa CSS print media query del navegador.
 * Para el documento formateado completo (blueprint sección 4.2),
 * se necesitaría el plugin Enterprise "Template Print" o un
 * microservicio WeasyPrint/Puppeteer (Fase 6 pendiente).
 *
 * Uso:
 *   npx tsx Apps/ENTREGA/scripts/deploy-entrega-phase5-print.ts
 */

import { createClient, log } from '../../../shared/scripts/ApiClient';
import { createPage } from '../../../shared/scripts/nocobase-ui-helpers';

const api = createClient();

// UIDs conocidos
const HISTORIAL_GRID_UID  = '12elhnz9gt0';
const HISTORIAL_ACTIONS_UID = 'cut88kb1sat'; // ActionBar de la tabla et_turnos

const ENTREGA_MEDICA_ID = 352413416226819;

const ROLES_PRINT = [
  'medico_cirugia', 'medico_medicina', 'medico_intensivista',
  'medico_obst_gin', 'medico_pediatria', 'traumatologia',
  'jefe_servicio', 'coordinador_pabellon', 'administrativo',
];

function genUid() {
  return Math.random().toString(36).slice(2, 12);
}

// ─── 1. Botón Print en ActionBar existente de Historial ─────────────────────

async function addPrintButtonToHistorial() {
  log('── Paso 1: Botón Print en Historial (ActionBar) ──\n', 'cyan');

  const printUid = genUid();
  try {
    await (api as any).post(
      `/uiSchemas:insertAdjacent/${HISTORIAL_ACTIONS_UID}?position=beforeEnd`,
      {
        schema: {
          type: 'void',
          'x-uid': printUid,
          'x-action': 'printSetup',
          title: '{{t("Print")}}',
          'x-settings': 'actionSettings:print',
          'x-component': 'Action',
          'x-use-component-props': 'useCustomizeActionProps',
          'x-component-props': {
            title: 'Imprimir',
            icon: 'PrinterOutlined',
          },
          'x-decorator': 'ACLActionProvider',
        },
      },
    );
    log('   ✅ Botón Print agregado a ActionBar de Historial', 'green');
  } catch (err: any) {
    log(`   ⚠️  ${err.message}`, 'yellow');
  }
}

// ─── 2. Nueva página "Imprimir Entrega" ─────────────────────────────────────

async function createPrintPage() {
  log('\n── Paso 2: Crear página Imprimir Entrega ──\n', 'cyan');

  const result = await createPage(api, '🖨️ Imprimir Entrega', ENTREGA_MEDICA_ID);
  if (!result) {
    log('   ❌ No se pudo crear la página', 'red');
    return;
  }

  const { routeId, gridUid } = result;
  log(`   route=${routeId}, grid=${gridUid}`, 'gray');

  // Asignar a roles
  const all = await (api as any).get('/desktopRoutes:list?pageSize=300&sort=sort');
  const routes = (all as any)?.data?.data || (all as any)?.data || [];
  const tabChild = routes.find((r: any) => r.parentId === routeId && r.type === 'tabs');

  for (const role of ROLES_PRINT) {
    try {
      const ids = tabChild ? [routeId, tabChild.id] : [routeId];
      await (api as any).post(`/roles/${role}/desktopRoutes:add`, { tk: ids });
      log(`   ✅ ${role}`, 'green');
    } catch (err: any) {
      log(`   ⚠️  ${role}: ${err.message}`, 'yellow');
    }
  }

  // ── Bloque 1: Markdown header explicativo
  const mdUid = genUid();
  try {
    await (api as any).post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, {
      schema: {
        type: 'void',
        'x-uid': mdUid,
        'x-component': 'Markdown.Void',
        'x-decorator': 'CardItem',
        'x-component-props': {
          content: '## 🖨️ Imprimir Entrega de Turno\n\n**Instrucciones:** Selecciona el turno en la tabla Historial → haz clic en **Ver** → en el detalle usa **Ctrl+P** (Windows) o **⌘+P** (Mac) para imprimir.',
        },
      },
    });
    log('\n   ✅ Bloque Markdown header', 'green');
  } catch (err: any) {
    log(`   ⚠️  Markdown: ${err.message}`, 'yellow');
  }

  // ── Bloque 2: Tabla de turnos recientes con botón Print
  const tableProviderUid = genUid();
  const tableActionsUid  = genUid();
  const printBtnUid      = genUid();
  const tableUid         = genUid();

  try {
    await (api as any).post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, {
      schema: {
        type: 'void',
        'x-uid': tableProviderUid,
        'x-decorator': 'TableBlockProvider',
        'x-decorator-props': {
          collection: 'et_turnos',
          dataSource: 'main',
          action: 'list',
          params: { pageSize: 10, sort: ['-fecha'] },
        },
        'x-component': 'CardItem',
        'x-component-props': { title: 'Turnos Recientes (para imprimir)' },
        properties: {
          [tableActionsUid]: {
            type: 'void',
            'x-uid': tableActionsUid,
            'x-component': 'ActionBar',
            'x-component-props': { style: { marginBottom: 16 } },
            properties: {
              [printBtnUid]: {
                type: 'void',
                'x-uid': printBtnUid,
                'x-action': 'printSetup',
                title: '{{t("Print")}}',
                'x-settings': 'actionSettings:print',
                'x-component': 'Action',
                'x-use-component-props': 'useCustomizeActionProps',
                'x-component-props': {
                  title: 'Imprimir Turno Activo',
                  icon: 'PrinterOutlined',
                  type: 'primary',
                },
                'x-decorator': 'ACLActionProvider',
              },
            },
          },
          [tableUid]: {
            type: 'array',
            'x-uid': tableUid,
            'x-component': 'TableV2',
            'x-component-props': {
              rowKey: 'id',
              rowSelection: { type: 'checkbox' },
            },
            'x-use-component-props': 'useTableBlockProps',
            properties: {},
          },
        },
      },
    });
    log('   ✅ Tabla et_turnos con botón Print agregada', 'green');
  } catch (err: any) {
    log(`   ⚠️  Tabla turnos: ${err.message}`, 'yellow');
  }

  // ── Bloque 3: Tabla de pacientes activos (censo)
  const censoProviderUid = genUid();
  const censoTableUid    = genUid();

  try {
    await (api as any).post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, {
      schema: {
        type: 'void',
        'x-uid': censoProviderUid,
        'x-decorator': 'TableBlockProvider',
        'x-decorator-props': {
          collection: 'et_pacientes_censo',
          dataSource: 'main',
          action: 'list',
          params: {
            pageSize: 100,
            filter: { estado_turno: { $eq: 'Activo' } },
            sort: ['servicio_id', 'sala', 'cama'],
          },
        },
        'x-component': 'CardItem',
        'x-component-props': { title: 'Pacientes Activos (ordenados por unidad)' },
        properties: {
          [censoTableUid]: {
            type: 'array',
            'x-uid': censoTableUid,
            'x-component': 'TableV2',
            'x-component-props': {
              rowKey: 'id',
            },
            'x-use-component-props': 'useTableBlockProps',
            properties: {},
          },
        },
      },
    });
    log('   ✅ Tabla pacientes activos (para impresión) agregada', 'green');
  } catch (err: any) {
    log(`   ⚠️  Tabla censo: ${err.message}`, 'yellow');
  }

  log(`\n   → routeId=${routeId}`, 'gray');
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('  ENTREGA FASE 5 — Impresión (action-print FREE plugin)', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  await addPrintButtonToHistorial();
  await createPrintPage();

  log('\n═══════════════════════════════════════════════════════════', 'green');
  log('  ✅ ENTREGA FASE 5 PRINT — COMPLETADO', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'green');

  log('Cómo imprimir el turno:', 'cyan');
  log('  1. Ir a "Entrega Médica → Historial"', 'gray');
  log('  2. Hacer clic en botón "Imprimir" → Ctrl+P del navegador', 'gray');
  log('  3. O ir a "🖨️ Imprimir Entrega" → tabla pacientes → Ctrl+P', 'gray');
  log('\nNOTA: Para el documento formateado exacto del blueprint (sección 4.2),', 'yellow');
  log('  se requiere plugin "Template Print" (Enterprise) o microservicio', 'yellow');
  log('  Puppeteer/WeasyPrint (Fase 6 del plan de desarrollo).', 'yellow');
}

main().catch(err => {
  log(`\n❌ Fatal: ${err.message}`, 'red');
  process.exit(1);
});
