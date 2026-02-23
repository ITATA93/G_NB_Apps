/**
 * TEMP_01 — Step 1: Create proper Page+Grid schemas for all ENTREGA/Enfermería routes
 * 
 * Uses the EXACT pattern from deploy-routes.ts createPageSchema() (lines 91-140):
 *   1. POST /uiSchemas:insert → creates Page + Grid schema → returns x-uid
 *   2. POST /desktopRoutes:update?filterByTk={id} → binds schemaUid
 */
import { createClient, log } from '../ApiClient';
const client = createClient();

// Route IDs from TEMP_09/TEMP_11 discovery
const ENTREGA_GROUP_ID = 349130662412288;
const ENF_GROUP_ID = 349130664509464;

/**
 * createPageSchema — EXACT copy of deploy-routes.ts pattern (lines 94-135)
 */
async function createPageSchema(title: string): Promise<string | null> {
  const schema = {
    type: 'void',
    'x-component': 'Page',
    'x-async': true,
    properties: {
      grid: {
        type: 'void',
        'x-component': 'Grid',
        'x-initializer': 'page:addBlock',
        properties: {}  // Empty grid — blocks will be added in Step 2
      }
    }
  };

  try {
    const response = await client.post('/uiSchemas:insert', schema);
    const uid = response?.data?.['x-uid'] || response?.['x-uid'] || null;
    return uid;
  } catch (err: unknown) {
    log(`  ⚠️ Error creating schema for "${title}": ${err instanceof Error ? err.message : String(err)}`, 'yellow');
    return null;
  }
}

async function main() {
  log('\n=== Step 1: Create Page schemas and rebind routes ===\n', 'cyan');

  // Get all routes
  const routesResp = await client.get('/desktopRoutes:list', { pageSize: 200, sort: ['id'] }) as {
    data: { id: number; title?: string; type?: string; schemaUid?: string; parentId?: number }[]
  };
  const routes = routesResp.data || [];

  // Find all page routes under ENTREGA and ENF groups
  const pageRoutes = routes.filter(r => 
    r.type === 'page' && (r.parentId === ENTREGA_GROUP_ID || r.parentId === ENF_GROUP_ID)
  );

  log(`  Found ${pageRoutes.length} page routes to fix\n`, 'white');

  const results: { routeId: number; title: string; schemaUid: string }[] = [];
  let ok = 0, fail = 0;

  for (const route of pageRoutes) {
    const title = route.title || `Route ${route.id}`;
    log(`  ${title} (ID: ${route.id})`, 'white');

    // Step 1: Create Page schema
    const schemaUid = await createPageSchema(title);
    if (!schemaUid) {
      log(`    ❌ Failed to create schema`, 'red');
      fail++;
      continue;
    }

    // Step 2: Bind schema to route (EXACT pattern from deploy-routes.ts line 184)
    try {
      await client.post(`/desktopRoutes:update?filterByTk=${route.id}`, {
        schemaUid: schemaUid
      });
      log(`    ✅ Schema: ${schemaUid}`, 'green');
      results.push({ routeId: route.id, title, schemaUid });
      ok++;
    } catch (err: unknown) {
      log(`    ❌ Failed to bind: ${err instanceof Error ? err.message : String(err)}`, 'red');
      fail++;
    }
  }

  // Summary
  log(`\n=== RESULTS ===\n`, 'cyan');
  log(`  ✅ Success: ${ok}`, 'green');
  if (fail > 0) log(`  ❌ Failed: ${fail}`, 'red');
  
  // Output mapping for Step 2
  log(`\n=== ROUTE → COLLECTION MAPPING (for Step 2) ===\n`, 'cyan');
  for (const r of results) {
    log(`  ${r.routeId}\t${r.title}\t${r.schemaUid}`, 'white');
  }

  log('\n=== DONE ===\n', 'cyan');
}

main().catch(e => { console.error(e.message); process.exit(1); });
