/**
 * _add-entrega-table-blocks.ts
 *
 * Adds table blocks to the 3 new ENTREGA pages using the correct API format:
 *   POST /uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd
 *   body: { schema: { ... } }
 */
import { createClient, log } from '../shared/scripts/ApiClient';

const api = createClient();

function genUid() {
  return Math.random().toString(36).slice(2, 12);
}

const PAGES = [
  {
    name: 'Pabellón',
    gridUid: 'nfsktwbe0ln',
    tables: [
      { collection: 'et_operaciones_turno', title: 'Operaciones del Turno' },
    ],
  },
  {
    name: 'Notas Clínicas',
    gridUid: 'vm4lzgvw2f',
    tables: [
      { collection: 'et_notas_clinicas', title: 'Historial de Notas Clínicas' },
    ],
  },
  {
    name: 'Configuración',
    gridUid: 'tsofy8gaskm',
    tables: [
      { collection: 'et_config_sistema',   title: 'Parámetros del Sistema' },
      { collection: 'et_tipos_nota',        title: 'Tipos de Nota Clínica' },
      { collection: 'et_servicios',         title: 'Servicios Hospitalarios' },
      { collection: 'et_especialidades',    title: 'Especialidades Médicas' },
    ],
  },
];

async function addTable(gridUid: string, collection: string, title: string) {
  const providerUid = genUid();
  const tableUid    = genUid();

  try {
    await (api as any).post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, {
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
            'x-uid': tableUid,
            'x-component': 'TableV2',
            'x-component-props': { rowKey: 'id', rowSelection: { type: 'checkbox' } },
            'x-use-component-props': 'useTableBlockProps',
            properties: {},
          },
        },
      },
    });
    log(`   ✅ ${collection} → "${title}"`, 'green');
  } catch (err: any) {
    const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
    log(`   ❌ ${collection}: ${msg}`, 'red');
  }
}

async function main() {
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('  ENTREGA — Agregar bloques de tabla a páginas nuevas', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');

  for (const page of PAGES) {
    log(`\n── ${page.name} (grid: ${page.gridUid}) ──\n`, 'cyan');
    for (const t of page.tables) {
      await addTable(page.gridUid, t.collection, t.title);
    }
  }

  log('\n═══════════════════════════════════════════════════════════', 'green');
  log('  ✅ Bloques de tabla — COMPLETADO', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'green');
}

main().catch(err => {
  log(`\n❌ Fatal: ${err.message}`, 'red');
  process.exit(1);
});
