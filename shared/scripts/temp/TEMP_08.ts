/**
 * TEMP_08 — Find actual page schemas created by bindMenuToPage for ENTREGA menus
 * and insert table blocks into the correct page schemas
 */
import { createClient, log } from '../ApiClient';
const client = createClient();

function uid() {
  return Math.random().toString(36).slice(2, 14);
}

async function main() {
  // Step 1: Get complete menu schema with deep nesting
  log('\n=== Finding page schemas for ENTREGA ===\n', 'cyan');
  
  const menuResp = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu') as { 
    data: { properties: Record<string, { title?: string; 'x-uid'?: string; properties?: Record<string, { title?: string; 'x-uid'?: string }> }> } 
  };
  
  const menus = menuResp.data?.properties || {};
  
  // Find all ENTREGA page UIDs from menu
  const pageMap: { key: string; title: string; menuUid: string }[] = [];
  
  for (const [menuKey, menu] of Object.entries(menus)) {
    const title = menu.title || menuKey;
    if (!title.includes('Entrega') && !title.includes('Enferm')) continue;
    
    log(`\n📁 ${title} (menu uid: ${menu['x-uid'] || menuKey})`, 'cyan');
    const children = menu.properties || {};
    
    for (const [childKey, child] of Object.entries(children)) {
      const childUid = child['x-uid'] || childKey;
      log(`  📄 ${child.title || childKey} → uid: ${childUid}`, 'white');
      
      // Try to get the page schema to see if it has content
      try {
        const pageSchema = await client.get(`/uiSchemas:getJsonSchema/${childUid}`) as { 
          data: { properties?: Record<string, unknown>; 'x-uid'?: string } 
        };
        const propCount = Object.keys(pageSchema.data?.properties || {}).length;
        log(`    Schema props: ${propCount}`, propCount > 0 ? 'green' : 'yellow');
        
        // Look for the actual page UID in properties
        if (propCount > 0) {
          for (const [pk, pv] of Object.entries(pageSchema.data.properties || {})) {
            const pvObj = pv as Record<string, unknown>;
            log(`    → prop: ${pk} (component: ${pvObj['x-component']})`, 'gray');
          }
        }
      } catch {
        log(`    ⚠️ Cannot read schema`, 'yellow');
      }
      
      pageMap.push({ key: childKey, title: child.title || childKey, menuUid: childUid });
    }
  }

  // Step 2: Try to find routes/pages
  log('\n=== Checking routes ===\n', 'cyan');
  try {
    const routesResp = await client.get('/uiRoutes:list', { pageSize: 200 }) as { data: { path?: string; uiSchemaUid?: string; title?: string }[] };
    const etRoutes = routesResp.data?.filter(r => 
      r.path?.includes('et_') || r.uiSchemaUid?.startsWith('et_')
    ) || [];
    log(`  ENTREGA routes found: ${etRoutes.length}`, 'white');
    for (const r of etRoutes.slice(0, 20)) {
      log(`    ${r.path} → schema: ${r.uiSchemaUid}`, 'gray');
    }
  } catch (err: unknown) {
    log(`  Routes API not available: ${err instanceof Error ? err.message : ''}`, 'yellow');
  }

  // Step 3: Check desktopRoutes
  log('\n=== Checking desktopRoutes ===\n', 'cyan');
  try {
    const dRoutes = await client.get('/desktopRoutes:list', { pageSize: 200 }) as { data: { id?: number; path?: string; schemaUid?: string; title?: string; type?: string; menuSchemaUid?: string }[] };
    const routes = dRoutes.data || [];
    log(`  Total desktop routes: ${routes.length}`, 'white');
    
    // Find routes that reference our menu UIDs
    const menuUids = new Set(pageMap.map(p => p.menuUid));
    const etRoutes = routes.filter(r => 
      menuUids.has(r.schemaUid || '') || 
      menuUids.has(r.menuSchemaUid || '') ||
      (r.title && (r.title.includes('Entrega') || r.title.includes('Enferm') || r.title.includes('Medicina') || r.title.includes('Vista')))
    );
    
    log(`  ENTREGA-related routes: ${etRoutes.length}`, etRoutes.length > 0 ? 'green' : 'yellow');
    for (const r of etRoutes) {
      log(`    [${r.id}] ${r.title || r.path || '?'} type=${r.type} schema=${r.schemaUid} menu=${r.menuSchemaUid}`, 'white');
    }
    
    // Also dump some routes to understand structure
    log('\n  Sample routes:', 'gray'); 
    for (const r of routes.slice(0, 10)) {
      log(`    [${r.id}] ${r.title || '?'} type=${r.type} schema=${r.schemaUid} menu=${r.menuSchemaUid}`, 'gray');
    }
  } catch (err: unknown) {
    log(`  desktopRoutes API error: ${err instanceof Error ? err.message : ''}`, 'yellow');
  }

  log('\n=== DONE ===\n', 'cyan');
}

main().catch(e => { console.error(e.message); process.exit(1); });
