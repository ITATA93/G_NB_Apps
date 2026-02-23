/**
 * TEMP_04 — Fix ENTREGA tabs + deploy blocks (unified)
 * 
 * Based on EXACT validated pattern from deploy-blocks.ts:
 *   1. Fix tabs child routes: create real Grid schemas, bind to tabs routes
 *   2. Insert blocks using buildTableBlockSchema() from deploy-blocks.ts
 *   3. Update page routes: set enableTabs=false, x-async=false match
 */
import { createClient, log } from '../ApiClient';
const client = createClient();

const ENTREGA_GROUP_ID = 349130662412288;
const ENF_GROUP_ID = 349130664509464;

// Page → collection mapping (same as implementation plan)
const PAGE_COLLECTION_MAP: Record<string, string> = {
  'Dashboard': 'et_pacientes_censo',
  'Vista Global': 'et_pacientes_censo',
  'Medicina Interna': 'et_entrega_paciente',
  'Cirugía General': 'et_entrega_paciente',
  'Pediatría': 'et_entrega_paciente',
  'Obst/Ginecología': 'et_entrega_paciente',
  'Neonatología': 'et_entrega_paciente',
  'Traumatología': 'et_entrega_paciente',
  'UCI / UTI': 'et_entrega_paciente',
  'Historial': 'et_turnos',
  'Enf. MQ1': 'et_entrega_enfermeria',
  'Enf. MQ2': 'et_entrega_enfermeria',
  'Enf. MQ3': 'et_entrega_enfermeria',
  'Enf. UCI': 'et_entrega_enfermeria',
  'Enf. UTI': 'et_entrega_enfermeria',
  'Enf. PED': 'et_entrega_enfermeria',
  'Enf. OBST': 'et_entrega_enfermeria',
};

/**
 * buildTableBlockSchema — EXACT copy from deploy-blocks.ts lines 33-95
 */
function buildTableBlockSchema(collection: string) {
  return {
    type: 'void',
    'x-component': 'Grid.Row',
    properties: {
      col: {
        type: 'void',
        'x-component': 'Grid.Col',
        properties: {
          block: {
            type: 'void',
            'x-decorator': 'TableBlockProvider',
            'x-decorator-props': {
              collection,
              dataSource: 'main',
              action: 'list',
              params: { pageSize: 20 },
            },
            'x-component': 'CardItem',
            'x-toolbar': 'BlockSchemaToolbar',
            'x-settings': 'blockSettings:table',
            properties: {
              actions: {
                type: 'void',
                'x-component': 'ActionBar',
                'x-component-props': { style: { marginBottom: 'var(--nb-spacing)' } },
                'x-initializer': 'table:configureActions',
              },
              table: {
                type: 'array',
                'x-component': 'TableV2',
                'x-use-component-props': 'useTableBlockProps',
                'x-component-props': {
                  rowKey: 'id',
                  rowSelection: { type: 'checkbox' },
                },
                'x-initializer': 'table:configureColumns',
                properties: {
                  actions: {
                    type: 'void',
                    title: '{{ t("Actions") }}',
                    'x-component': 'TableV2.Column',
                    'x-decorator': 'TableV2.Column.Decorator',
                    'x-action-column': 'actions',
                    'x-initializer': 'table:configureItemActions',
                    properties: {
                      actions: {
                        type: 'void',
                        'x-decorator': 'DndContext',
                        'x-component': 'Space',
                        'x-component-props': { split: '|' },
                      },
                    },
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

async function main() {
  log('\n=== Fix ENTREGA tabs + deploy blocks ===\n', 'cyan');

  // Fetch all routes
  const routesResp = await client.get('/desktopRoutes:list', { paginate: false }) as {
    data: { id: number; title?: string; type?: string; parentId?: number; schemaUid?: string }[]
  };
  const routes = (routesResp.data || routesResp) as { id: number; title?: string; type?: string; parentId?: number; schemaUid?: string }[];

  // Find ENTREGA + ENF page routes
  const pageRoutes = routes.filter(r =>
    r.type === 'page' && (r.parentId === ENTREGA_GROUP_ID || r.parentId === ENF_GROUP_ID)
  );
  log(`  Found ${pageRoutes.length} page routes\n`, 'white');

  let ok = 0, fail = 0;

  for (const page of pageRoutes) {
    const title = page.title || `Route ${page.id}`;
    const collection = PAGE_COLLECTION_MAP[title];
    if (!collection) {
      log(`  ⬜ "${title}" — no collection mapping, skipping`, 'gray');
      continue;
    }

    log(`  📦 "${title}" → ${collection}`, 'white');

    // Step A: Find the tabs child route
    const tabsRoute = routes.find(r => r.parentId === page.id && r.type === 'tabs');
    if (!tabsRoute) {
      log(`    ❌ No tabs child route found`, 'red');
      fail++;
      continue;
    }

    // Step B: Create a real Grid schema (matching Agenda pattern)
    let gridUid: string;
    try {
      const gridSchema = {
        type: 'void',
        'x-component': 'Grid',
        'x-initializer': 'page:addBlock',
        properties: {}
      };
      const resp = await client.post('/uiSchemas:insert', gridSchema) as {
        data?: { 'x-uid'?: string }; 'x-uid'?: string
      };
      gridUid = resp?.data?.['x-uid'] || resp?.['x-uid'] || '';
      if (!gridUid) {
        log(`    ❌ Failed to create Grid schema`, 'red');
        fail++;
        continue;
      }
    } catch (err: unknown) {
      log(`    ❌ Grid creation error: ${err instanceof Error ? err.message : String(err)}`, 'red');
      fail++;
      continue;
    }

    // Step C: Update the tabs route with the real Grid schemaUid
    try {
      await client.post(`/desktopRoutes:update?filterByTk=${tabsRoute.id}`, {
        schemaUid: gridUid
      });
    } catch (err: unknown) {
      log(`    ❌ Tabs update error: ${err instanceof Error ? err.message : String(err)}`, 'red');
      fail++;
      continue;
    }

    // Step D: Update page route to match Agenda (enableTabs: false)
    try {
      await client.post(`/desktopRoutes:update?filterByTk=${page.id}`, {
        enableTabs: false
      });
    } catch (err: unknown) {
      log(`    ⚠️ Page update warning: ${err instanceof Error ? err.message : String(err)}`, 'yellow');
    }

    // Step E: Insert table block into the Grid (EXACT deploy-blocks.ts pattern)
    try {
      const schema = buildTableBlockSchema(collection);
      await client.post(
        `/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`,
        { schema }
      );
      log(`    ✅ Grid: ${gridUid} | Block: ${collection}`, 'green');
      ok++;
    } catch (err: unknown) {
      log(`    ❌ Block insert error: ${err instanceof Error ? err.message : String(err)}`, 'red');
      fail++;
    }
  }

  log(`\n=== RESULTS ===`, 'cyan');
  log(`  ✅ Success: ${ok}`, 'green');
  if (fail > 0) log(`  ❌ Failed: ${fail}`, 'red');
  log(`\n=== DONE — Reload browser to verify ===\n`, 'cyan');
}

main().catch(e => { console.error(e.message); process.exit(1); });
