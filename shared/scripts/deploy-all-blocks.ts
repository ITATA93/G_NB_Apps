/**
 * deploy-all-blocks.ts — Deploy table blocks to BUHO, AGENDA, and ENTREGA pages
 *
 * Pattern: UGCO's add-table-blocks.ts (validated, working)
 *   1. GET /desktopRoutes:listAccessible?tree=true → recursive tree with children
 *   2. Walk tree to find page nodes by title
 *   3. GET /uiSchemas:getJsonSchema/{page.schemaUid} → find Grid 'x-uid' recursively
 *   4. POST /uiSchemas:insertAdjacent/{gridUid}?position=beforeEnd → insert table block
 *
 * Uso:
 *   npx tsx shared/scripts/deploy-all-blocks.ts
 *   npx tsx shared/scripts/deploy-all-blocks.ts --app BUHO
 *   npx tsx shared/scripts/deploy-all-blocks.ts --verify
 */
import { createClient, log } from './ApiClient.js';

const client = createClient();
const DRY_RUN = process.argv.includes('--dry-run');
const VERIFY_ONLY = process.argv.includes('--verify');
const APP_FILTER = (() => {
  const idx = process.argv.indexOf('--app');
  return idx !== -1 ? process.argv[idx + 1]?.toUpperCase() : null;
})();

function uid(): string {
  return Math.random().toString(36).substring(2, 13);
}

// ─── Page → Collection mappings ───────────────────────────────────────────────

const APP_CONFIGS: Array<{ groupTitle: string; pageMap: Record<string, string> }> = [
  {
    groupTitle: 'BUHO',
    pageMap: {
      'Lista Pacientes': 'buho_pacientes',
      'Estado Clínico': 'buho_pacientes',
      'Planes de Trabajo': 'buho_planes_trabajo',
      Alertas: 'buho_alertas',
      'Catálogo de Camas': 'buho_camas',
      'Parámetros de Riesgo': 'buho_parametros_riesgo',
    },
  },
  {
    groupTitle: 'Agenda Médica',
    pageMap: {
      'Actividades (Bloques)': 'ag_bloques_agenda',
      Inasistencias: 'ag_inasistencias',
      'Resumen Diario': 'ag_resumen_diario',
      'Resumen Semanal': 'ag_resumen_semanal',
      Funcionarios: 'ag_funcionarios',
      'Categorías de Actividad': 'ag_categorias_actividad',
      'Tipos de Inasistencia': 'ag_tipos_inasistencia',
      Servicios: 'ag_servicios',
    },
  },
  {
    groupTitle: 'Entrega de Turno',
    pageMap: {
      'Vista Global': 'et_pacientes_censo',
      Historial: 'et_turnos',
      'Medicina Interna': 'et_entrega_paciente',
      'Cirugía General': 'et_entrega_paciente',
      Pediatría: 'et_entrega_paciente',
      'Obst/Ginecología': 'et_entrega_paciente',
      Neonatología: 'et_entrega_paciente',
      Traumatología: 'et_entrega_paciente',
      'UCI / UTI': 'et_entrega_paciente',
      'Enf. MQ1': 'et_entrega_enfermeria',
      'Enf. MQ2': 'et_entrega_enfermeria',
      'Enf. MQ3': 'et_entrega_enfermeria',
      'Enf. UCI': 'et_entrega_enfermeria',
      'Enf. UTI': 'et_entrega_enfermeria',
      'Enf. PED': 'et_entrega_enfermeria',
      'Enf. OBST': 'et_entrega_enfermeria',
    },
  },
];

// ─── Schema Grid Discovery (UGCO pattern) ────────────────────────────────────

async function findGridUid(schemaUid: string): Promise<string | null> {
  try {
    const result = await client.get(`/uiSchemas:getJsonSchema/${schemaUid}`, { readPretty: true });
    const schema = (result as any).data;
    if (!schema) return null;

    // Direct grid check
    if (schema['x-component'] === 'Grid') return schema['x-uid'] || null;

    // Recursive search for Grid with initializer
    function findGrid(obj: any): string | null {
      if (!obj || typeof obj !== 'object') return null;
      if (obj['x-component'] === 'Grid' && obj['x-initializer']) {
        return obj['x-uid'] || null;
      }
      if (obj.properties) {
        for (const key of Object.keys(obj.properties)) {
          const found = findGrid(obj.properties[key]);
          if (found) return found;
        }
      }
      return null;
    }
    return findGrid(schema);
  } catch {
    return null;
  }
}

async function gridHasBlocks(gridUid: string): Promise<boolean> {
  try {
    const result = (await client.get(`/uiSchemas:getJsonSchema/${gridUid}`)) as any;
    const props = result.data?.properties;
    return props && Object.keys(props).length > 0;
  } catch {
    return false;
  }
}

// ─── Full Table Block Schema (UGCO pattern with Filter + Add New buttons) ─────

function buildTableBlockSchema(collection: string, title: string) {
  return {
    _isJSONSchemaObject: true,
    version: '2.0',
    type: 'void',
    'x-component': 'Grid.Row',
    'x-uid': uid(),
    name: uid(),
    properties: {
      [uid()]: {
        _isJSONSchemaObject: true,
        version: '2.0',
        type: 'void',
        'x-component': 'Grid.Col',
        properties: {
          [uid()]: {
            _isJSONSchemaObject: true,
            version: '2.0',
            type: 'void',
            'x-acl-action': `${collection}:list`,
            'x-decorator': 'TableBlockProvider',
            'x-decorator-props': {
              collection,
              dataSource: 'main',
              action: 'list',
              params: { pageSize: 20 },
              showIndex: true,
              dragSort: false,
            },
            'x-component': 'CardItem',
            'x-component-props': { title },
            'x-toolbar': 'BlockSchemaToolbar',
            'x-settings': 'blockSettings:table',
            properties: {
              actions: {
                _isJSONSchemaObject: true,
                version: '2.0',
                type: 'void',
                'x-initializer': 'table:configureActions',
                'x-component': 'ActionBar',
                'x-component-props': {
                  style: { marginBottom: 'var(--nb-spacing)' },
                },
                properties: {
                  filter: {
                    _isJSONSchemaObject: true,
                    version: '2.0',
                    type: 'void',
                    title: '{{ t("Filter") }}',
                    'x-action': 'filter',
                    'x-component': 'Filter.Action',
                    'x-use-component-props': 'useFilterActionProps',
                    'x-component-props': { icon: 'FilterOutlined' },
                    'x-align': 'left',
                  },
                  create: {
                    _isJSONSchemaObject: true,
                    version: '2.0',
                    type: 'void',
                    title: '{{ t("Add new") }}',
                    'x-action': 'create',
                    'x-component': 'Action',
                    'x-component-props': {
                      openMode: 'drawer',
                      type: 'primary',
                      icon: 'PlusOutlined',
                    },
                    'x-align': 'right',
                    'x-acl-action': `${collection}:create`,
                    properties: {
                      drawer: {
                        _isJSONSchemaObject: true,
                        version: '2.0',
                        type: 'void',
                        title: '{{ t("Add record") }}',
                        'x-component': 'Action.Container',
                        'x-component-props': { className: 'nb-action-popup' },
                        properties: {
                          grid: {
                            _isJSONSchemaObject: true,
                            version: '2.0',
                            type: 'void',
                            'x-component': 'Grid',
                            'x-initializer': 'popup:addNew:addBlock',
                            properties: {},
                          },
                        },
                      },
                    },
                  },
                },
              },
              [uid()]: {
                _isJSONSchemaObject: true,
                version: '2.0',
                type: 'array',
                'x-initializer': 'table:configureColumns',
                'x-component': 'TableV2',
                'x-use-component-props': 'useTableBlockProps',
                'x-component-props': {
                  rowKey: 'id',
                  rowSelection: { type: 'checkbox' },
                },
                properties: {
                  actions: {
                    _isJSONSchemaObject: true,
                    version: '2.0',
                    type: 'void',
                    title: '{{ t("Actions") }}',
                    'x-action-column': 'actions',
                    'x-decorator': 'TableV2.Column.ActionBar',
                    'x-component': 'TableV2.Column',
                    'x-component-props': { width: 150, fixed: 'right' },
                    'x-initializer': 'table:configureItemActions',
                    properties: {},
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

// ─── Tree Walker ─────────────────────────────────────────────────────────────

interface TreeNode {
  id: number;
  title: string;
  type: string;
  schemaUid?: string;
  children?: TreeNode[];
}

function collectPageNodes(node: TreeNode, targetGroupTitle: string): TreeNode[] {
  const pages: TreeNode[] = [];
  if (node.title === targetGroupTitle && node.type === 'group') {
    // Collect all pages within this group
    function walk(n: TreeNode) {
      if (n.type === 'page' && n.schemaUid) pages.push(n);
      if (n.children) n.children.forEach(walk);
    }
    walk(node);
  } else if (node.children) {
    for (const child of node.children) {
      pages.push(...collectPageNodes(child, targetGroupTitle));
    }
  }
  return pages;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  log(
    `\n🚀 Deploy Table Blocks — BUHO + AGENDA + ENTREGA${DRY_RUN ? ' [DRY RUN]' : ''}${VERIFY_ONLY ? ' [VERIFY]' : ''}\n`,
    'cyan',
  );

  // Use listAccessible with tree=true (UGCO validated pattern)
  const routesResp = (await client.get('/desktopRoutes:listAccessible', {
    tree: true,
    sort: 'sort',
  })) as any;
  const treeRoots: TreeNode[] = routesResp.data || routesResp;

  log(`📋 Top-level route groups: ${treeRoots.length}\n`, 'gray');

  const configs = APP_FILTER
    ? APP_CONFIGS.filter((c) => c.groupTitle.toUpperCase().includes(APP_FILTER))
    : APP_CONFIGS;

  let totalSuccess = 0,
    totalSkipped = 0,
    totalFailed = 0;

  for (const cfg of configs) {
    log(`\n📁 Procesando: ${cfg.groupTitle}`, 'cyan');

    // Find pages in this app group
    const pages: TreeNode[] = [];
    for (const root of treeRoots) {
      pages.push(...collectPageNodes(root, cfg.groupTitle));
    }
    log(`  Encontradas: ${pages.length} páginas`, 'white');

    for (const page of pages) {
      const cleanTitle = page.title?.replace(/^[^\w\s]*\s*/, '').trim();
      const collection = cfg.pageMap[cleanTitle] || cfg.pageMap[page.title];

      if (!collection) {
        log(`  ⬜ "${page.title}" — sin mapping (Dashboard/Reportes: configurar manual)`, 'gray');
        totalSkipped++;
        continue;
      }

      // Find grid UUID in schema
      const gridUid = await findGridUid(page.schemaUid!);
      if (!gridUid) {
        log(`  ⚠️ "${page.title}" — Grid no encontrado en schema ${page.schemaUid}`, 'yellow');
        totalFailed++;
        continue;
      }

      if (VERIFY_ONLY) {
        const hasBlocks = await gridHasBlocks(gridUid);
        log(
          `  ${hasBlocks ? '✅' : '⬜'} "${page.title}" → ${collection} (grid=${gridUid})`,
          hasBlocks ? 'green' : 'yellow',
        );
        continue;
      }

      const hasBlocks = await gridHasBlocks(gridUid);
      if (hasBlocks) {
        log(`  ✅ "${page.title}" — ya tiene bloque`, 'green');
        totalSkipped++;
        continue;
      }

      log(`  📦 "${page.title}" → ${collection}`, 'white');

      if (DRY_RUN) {
        log(`    [DRY] insertAdjacent ${gridUid}`, 'gray');
        totalSuccess++;
        continue;
      }

      try {
        const schema = buildTableBlockSchema(collection, page.title);
        await client.post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, {
          schema,
        } as any);
        log(`    ✅ Bloque creado`, 'green');
        totalSuccess++;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        log(`    ❌ ${msg}`, 'red');
        totalFailed++;
      }
    }
  }

  if (!VERIFY_ONLY) {
    log(
      `\n📊 Total: ${totalSuccess} creados, ${totalSkipped} omitidos, ${totalFailed} fallidos\n`,
      'cyan',
    );
  }
}

main().catch((e) => {
  console.error('Fatal:', e instanceof Error ? e.message : e);
  process.exit(1);
});
