/**
 * TEMP_11 — Dump all ENTREGA-related routes with full details
 */
import { createClient, log } from '../ApiClient';
const client = createClient();

async function main() {
  const routesResp = await client.get('/desktopRoutes:list', { pageSize: 200, sort: ['id'] }) as { 
    data: { id: number; title?: string; type?: string; schemaUid?: string; menuSchemaUid?: string; parentId?: number; sort?: number }[] 
  };
  const routes = routesResp.data || [];
  
  // Find entrega and enfermería groups
  const entregaGroup = routes.find(r => r.title === 'Entrega de Turno' && r.type === 'group');
  const enfGroup = routes.find(r => r.title === 'Enfermería' && r.type === 'group');
  
  log('\n=== ENTREGA ROUTES ===\n', 'cyan');
  if (entregaGroup) {
    log(`Group: id=${entregaGroup.id} schema=${entregaGroup.schemaUid}`, 'white');
    const children = routes.filter(r => r.parentId === entregaGroup.id);
    for (const c of children) {
      log(`  [${c.id}] ${(c.title||'(tabs)').padEnd(22)} type=${c.type?.padEnd(5)} schema=${c.schemaUid?.padEnd(20)} menu=${c.menuSchemaUid || 'null'}`, 'white');
      // Check for tab children
      const tabChildren = routes.filter(r => r.parentId === c.id);
      for (const t of tabChildren) {
        log(`    [${t.id}] type=${t.type} schema=${t.schemaUid}`, 'gray');
      }
    }
  }

  log('\n=== ENFERMERÍA ROUTES ===\n', 'cyan');
  if (enfGroup) {
    log(`Group: id=${enfGroup.id} schema=${enfGroup.schemaUid}`, 'white');
    const children = routes.filter(r => r.parentId === enfGroup.id);
    for (const c of children) {
      log(`  [${c.id}] ${(c.title||'(tabs)').padEnd(22)} type=${c.type?.padEnd(5)} schema=${c.schemaUid?.padEnd(20)} menu=${c.menuSchemaUid || 'null'}`, 'white');
      const tabChildren = routes.filter(r => r.parentId === c.id);
      for (const t of tabChildren) {
        log(`    [${t.id}] type=${t.type} schema=${t.schemaUid}`, 'gray');
      }
    }
  }

  // Now check the schema UIDs to find which ones have content
  log('\n=== CHECKING SCHEMAS ===\n', 'cyan');
  const allEntregaRoutes = routes.filter(r => {
    if (!entregaGroup && !enfGroup) return false;
    return r.parentId === entregaGroup?.id || r.parentId === enfGroup?.id || 
      routes.some(parent => (parent.parentId === entregaGroup?.id || parent.parentId === enfGroup?.id) && parent.id === r.parentId);
  });
  
  for (const r of allEntregaRoutes) {
    if (!r.schemaUid) continue;
    try {
      const schema = await client.get(`/uiSchemas:getJsonSchema/${r.schemaUid}`) as { data: { properties?: Record<string, unknown>; 'x-component'?: string } };
      const propCount = Object.keys(schema.data?.properties || {}).length;
      const comp = schema.data?.['x-component'] || '?';
      log(`  ${r.schemaUid.padEnd(24)} props=${propCount} component=${comp} (${r.title || r.type})`, propCount > 0 ? 'green' : 'yellow');
    } catch {
      log(`  ${r.schemaUid.padEnd(24)} ⚠️ NOT FOUND (${r.title || r.type})`, 'red');
    }
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
