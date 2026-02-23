/**
 * TEMP_09 — Create desktopRoutes for ENTREGA + Enfermería
 * This is what makes pages visible in the top navigation bar
 */
import { createClient, log } from '../ApiClient';
const client = createClient();

// Menu UIDs from TEMP_08 discovery
const entregaPages = [
  { title: 'Dashboard', menuUid: '8dnirm1iban' },
  { title: 'Vista Global', menuUid: 'g2oonlkvguw' },
  { title: 'Medicina Interna', menuUid: '5bcr7inja0u' },
  { title: 'Cirugía General', menuUid: 'lhkjhpaysoj' },
  { title: 'Pediatría', menuUid: 'blfynskvl48' },
  { title: 'Obst/Ginecología', menuUid: '7hsfk084jcx' },
  { title: 'Neonatología', menuUid: 'hxeobhrflay' },
  { title: 'Traumatología', menuUid: 'dfhhiy8gbhe' },
  { title: 'UCI / UTI', menuUid: 'm0egbk32x5o' },
  { title: 'Historial', menuUid: 'kqwbf3hjd4t' },
];

const enfPages = [
  { title: 'Enf. MQ1', menuUid: 'ad6ldi72aac' },
  { title: 'Enf. MQ2', menuUid: '2xub2btulu5' },
  { title: 'Enf. MQ3', menuUid: '79icnuq3c9a' },
  { title: 'Enf. UCI', menuUid: 'wx8kbcai3l6' },
  { title: 'Enf. UTI', menuUid: '2ej3hd6v7ar' },
  { title: 'Enf. PED', menuUid: 'sd0pjh1bkra' },
  { title: 'Enf. OBST', menuUid: 'dc4p3a6vlx3' },
];

async function main() {
  // Step 1: List existing routes to understand the pattern
  log('\n=== Analyzing existing route structure ===\n', 'cyan');
  const routesResp = await client.get('/desktopRoutes:list', { pageSize: 200, sort: ['id'] }) as { 
    data: { id: number; title?: string; type?: string; schemaUid?: string; menuSchemaUid?: string; parentId?: number; icon?: string; sort?: number; options?: Record<string, unknown> }[] 
  };
  const routes = routesResp.data || [];
  
  // Show full structure
  for (const r of routes) {
    log(`  [${r.id}] ${(r.title || '?').padEnd(22)} type=${(r.type || '?').padEnd(6)} schema=${(r.schemaUid || '').padEnd(14)} menu=${r.menuSchemaUid || 'null'} parent=${r.parentId || 'root'}`, 'gray');
  }
  
  // Step 2: Create "Entrega de Turno" group route
  log('\n=== Creating ENTREGA group route ===\n', 'cyan');
  
  // Find the max sort value for top-level routes
  const topRoutes = routes.filter(r => !r.parentId);
  const maxSort = Math.max(...topRoutes.map(r => r.sort || 0), 0);
  
  let entregaGroupId: number | null = null;
  try {
    const groupResp = await client.post('/desktopRoutes:create', {
      title: 'Entrega de Turno',
      type: 'group',
      icon: 'MedicineBoxOutlined',
      schemaUid: 'et_menu_e6x6mzcyg5wb4k',
      sort: maxSort + 1,
    }) as { data: { id: number } };
    entregaGroupId = groupResp.data?.id;
    log(`  ✅ Group created: id=${entregaGroupId}`, 'green');
  } catch (err: unknown) {
    log(`  ❌ Failed: ${err instanceof Error ? err.message : String(err)}`, 'red');
  }

  // Step 3: Create child page routes for Entrega
  if (entregaGroupId) {
    log('\n=== Creating ENTREGA page routes ===\n', 'cyan');
    for (let i = 0; i < entregaPages.length; i++) {
      const page = entregaPages[i];
      try {
        const pageResp = await client.post('/desktopRoutes:create', {
          title: page.title,
          type: 'page',
          schemaUid: page.menuUid,
          menuSchemaUid: page.menuUid,
          parentId: entregaGroupId,
          sort: i + 1,
        }) as { data: { id: number } };
        log(`  ✅ ${page.title} (id=${pageResp.data?.id})`, 'green');
        
        // Create tabs route after each page (NocoBase pattern)
        await client.post('/desktopRoutes:create', {
          type: 'tabs',
          schemaUid: page.menuUid + '_tabs',
          parentId: pageResp.data?.id,
          sort: 1,
        });
      } catch (err: unknown) {
        log(`  ❌ ${page.title}: ${err instanceof Error ? err.message : ''}`, 'red');
      }
    }
  }

  // Step 4: Create "Enfermería" group route
  log('\n=== Creating ENFERMERÍA group route ===\n', 'cyan');
  let enfGroupId: number | null = null;
  try {
    const groupResp = await client.post('/desktopRoutes:create', {
      title: 'Enfermería',
      type: 'group',
      icon: 'HeartOutlined',
      schemaUid: 'enf_menu_3zh982cj9twb6p',
      sort: maxSort + 2,
    }) as { data: { id: number } };
    enfGroupId = groupResp.data?.id;
    log(`  ✅ Group created: id=${enfGroupId}`, 'green');
  } catch (err: unknown) {
    log(`  ❌ Failed: ${err instanceof Error ? err.message : String(err)}`, 'red');
  }

  // Step 5: Create child page routes for Enfermería
  if (enfGroupId) {
    log('\n=== Creating ENFERMERÍA page routes ===\n', 'cyan');
    for (let i = 0; i < enfPages.length; i++) {
      const page = enfPages[i];
      try {
        const pageResp = await client.post('/desktopRoutes:create', {
          title: page.title,
          type: 'page',
          schemaUid: page.menuUid,
          menuSchemaUid: page.menuUid,
          parentId: enfGroupId,
          sort: i + 1,
        }) as { data: { id: number } };
        log(`  ✅ ${page.title} (id=${pageResp.data?.id})`, 'green');

        // Create tabs route
        await client.post('/desktopRoutes:create', {
          type: 'tabs',
          schemaUid: page.menuUid + '_tabs',
          parentId: pageResp.data?.id,
          sort: 1,
        });
      } catch (err: unknown) {
        log(`  ❌ ${page.title}: ${err instanceof Error ? err.message : ''}`, 'red');
      }
    }
  }

  // Step 6: Verify
  log('\n=== Verifying routes ===\n', 'cyan');
  const newRoutes = await client.get('/desktopRoutes:list', { pageSize: 200, sort: ['id'] }) as { data: { id: number; title?: string; type?: string; parentId?: number }[] };
  const entregaRoutes = newRoutes.data.filter(r => r.parentId === entregaGroupId || r.id === entregaGroupId);
  const enfRoutes = newRoutes.data.filter(r => r.parentId === enfGroupId || r.id === enfGroupId);
  log(`  Entrega routes total: ${entregaRoutes.length}`, 'white');
  log(`  Enfermería routes total: ${enfRoutes.length}`, 'white');
  log(`  Total routes now: ${newRoutes.data.length}`, 'white');

  log('\n=== DONE — Reload browser to see menus ===\n', 'cyan');
}

main().catch(e => { console.error(e.message); process.exit(1); });
