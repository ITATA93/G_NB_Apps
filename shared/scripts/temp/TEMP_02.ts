/**
 * TEMP_02 — Step 2: Add table blocks to all ENTREGA/Enfermería pages
 * 
 * Uses the EXACT pattern from add-block-to-page.ts:
 *   1. GET /desktopRoutes:get?filterByTk={pageId} → gets schemaUid
 *   2. GET /uiSchemas:getProperties/{schemaUid} → finds Grid x-uid
 *   3. POST /uiSchemas:insertAdjacent/{gridUid}?position=beforeEnd → inserts Grid.Row block
 */
import { createClient, log } from '../ApiClient';
const client = createClient();

function uid() {
  return Math.random().toString(36).substring(2, 13);
}

// Page configs: routeId → collection
const pageConfigs: { routeId: number; title: string; collection: string }[] = [
  // Entrega de Turno
  { routeId: 349130662412290, title: 'Dashboard', collection: 'et_pacientes_censo' },
  { routeId: 349130662412293, title: 'Vista Global', collection: 'et_pacientes_censo' },
  { routeId: 349130664509441, title: 'Medicina Interna', collection: 'et_entrega_paciente' },
  { routeId: 349130664509444, title: 'Cirugía General', collection: 'et_entrega_paciente' },
  { routeId: 349130664509447, title: 'Pediatría', collection: 'et_entrega_paciente' },
  { routeId: 349130664509450, title: 'Obst/Ginecología', collection: 'et_entrega_paciente' },
  { routeId: 349130664509453, title: 'Neonatología', collection: 'et_entrega_paciente' },
  { routeId: 349130664509456, title: 'Traumatología', collection: 'et_entrega_paciente' },
  { routeId: 349130664509459, title: 'UCI / UTI', collection: 'et_entrega_paciente' },
  { routeId: 349130664509462, title: 'Historial', collection: 'et_turnos' },
  // Enfermería
  { routeId: 349130664509466, title: 'Enf. MQ1', collection: 'et_entrega_enfermeria' },
  { routeId: 349130666606594, title: 'Enf. MQ2', collection: 'et_entrega_enfermeria' },
  { routeId: 349130666606597, title: 'Enf. MQ3', collection: 'et_entrega_enfermeria' },
  { routeId: 349130666606600, title: 'Enf. UCI', collection: 'et_entrega_enfermeria' },
  { routeId: 349130666606603, title: 'Enf. UTI', collection: 'et_entrega_enfermeria' },
  { routeId: 349130666606606, title: 'Enf. PED', collection: 'et_entrega_enfermeria' },
  { routeId: 349130666606609, title: 'Enf. OBST', collection: 'et_entrega_enfermeria' },
];

/**
 * createTableBlock — EXACT copy from add-block-to-page.ts (lines 34-86)
 */
function createTableBlock(collectionName: string): Record<string, unknown> {
  const rowUid = uid();
  const colUid = uid();
  const cardUid = uid();
  const actionsUid = uid();
  const tableUid = uid();

  return {
    type: 'void',
    'x-component': 'Grid.Row',
    'x-uid': rowUid,
    properties: {
      [colUid]: {
        type: 'void',
        'x-component': 'Grid.Col',
        'x-uid': colUid,
        properties: {
          [cardUid]: {
            type: 'void',
            'x-decorator': 'TableBlockProvider',
            'x-decorator-props': {
              collection: collectionName,
              resource: collectionName,
              action: 'list',
              params: { pageSize: 20 }
            },
            'x-component': 'CardItem',
            'x-uid': cardUid,
            properties: {
              [actionsUid]: {
                type: 'void',
                'x-component': 'ActionBar',
                'x-uid': actionsUid,
                'x-component-props': { style: { marginBottom: 16 } },
                properties: {}
              },
              [tableUid]: {
                type: 'array',
                'x-component': 'TableV2',
                'x-uid': tableUid,
                'x-component-props': {
                  rowKey: 'id',
                  rowSelection: { type: 'checkbox' }
                },
                properties: {}
              }
            }
          }
        }
      }
    }
  };
}

/**
 * addBlockToPage — EXACT logic from add-block-to-page.ts (lines 176-249)
 */
async function addBlockToPage(routeId: number, collectionName: string, title: string) {
  log(`  ${title} (${routeId})`, 'white');

  try {
    // 1. Get route info → schemaUid
    const route = await client.get('/desktopRoutes:get', { filterByTk: routeId }) as {
      data: { schemaUid?: string }
    };
    const schemaUid = route.data?.schemaUid;
    if (!schemaUid) {
      log(`    ❌ No schemaUid on route`, 'red');
      return false;
    }

    // 2. Get Grid from page schema (use getProperties, NOT getJsonSchema)
    const pageSchema = await client.get(`/uiSchemas:getProperties/${schemaUid}`) as {
      data: { properties?: Record<string, { 'x-uid'?: string }> }
    };
    if (!pageSchema.data?.properties) {
      log(`    ❌ Schema has no Grid`, 'red');
      return false;
    }
    const gridKey = Object.keys(pageSchema.data.properties)[0];
    const gridUid = pageSchema.data.properties[gridKey]?.['x-uid'];
    if (!gridUid) {
      log(`    ❌ Grid has no x-uid`, 'red');
      return false;
    }

    // 3. Create and insert table block
    const block = createTableBlock(collectionName);
    await client.post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, {
      schema: block
    });

    log(`    ✅ Table block added (${collectionName})`, 'green');
    return true;
  } catch (err: unknown) {
    log(`    ❌ ${err instanceof Error ? err.message : String(err)}`, 'red');
    return false;
  }
}

async function main() {
  log('\n=== Step 2: Add table blocks to pages ===\n', 'cyan');

  let ok = 0, fail = 0;
  for (const page of pageConfigs) {
    const result = await addBlockToPage(page.routeId, page.collection, page.title);
    if (result) ok++; else fail++;
  }

  log(`\n=== RESULTS ===`, 'cyan');
  log(`  ✅ Success: ${ok}`, 'green');
  if (fail > 0) log(`  ❌ Failed: ${fail}`, 'red');
  log(`\n=== DONE — Reload browser to verify ===\n`, 'cyan');
}

main().catch(e => { console.error(e.message); process.exit(1); });
