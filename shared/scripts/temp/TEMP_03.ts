/**
 * TEMP_03 — Diagnostics: Compare Agenda (working) vs ENTREGA (broken) route structures
 * 
 * Dumps: route fields, schemaUid content, and nested schema structure for both
 */
import { createClient, log } from '../ApiClient';
const client = createClient();

async function dumpRoute(routeId: number, label: string) {
  log(`\n─── ${label} ───`, 'cyan');

  // 1. Get route details
  const route = await client.get('/desktopRoutes:get', { filterByTk: routeId }) as {
    data: Record<string, unknown>
  };
  const r = route.data;
  log(`  Route: id=${r.id} type=${r.type} title=${r.title}`, 'white');
  log(`  schemaUid=${r.schemaUid}`, 'white');
  log(`  menuSchemaUid=${r.menuSchemaUid}`, 'white');
  log(`  parentId=${r.parentId}`, 'white');
  log(`  path=${r.path}`, 'white');
  log(`  enableTabs=${r.enableTabs}`, 'white');
  log(`  hideInMenu=${r.hideInMenu}`, 'white');
  log(`  All keys: ${Object.keys(r).join(', ')}`, 'gray');

  // 2. Get schema content
  const schemaUid = r.schemaUid as string;
  if (schemaUid) {
    try {
      const schema = await client.get(`/uiSchemas:getJsonSchema/${schemaUid}`) as {
        data: Record<string, unknown>
      };
      const s = schema.data;
      log(`  Schema x-component: ${s['x-component']}`, 'white');
      log(`  Schema x-async: ${s['x-async']}`, 'white');
      log(`  Schema type: ${s['type']}`, 'white');
      if (s.properties) {
        const propKeys = Object.keys(s.properties as Record<string, unknown>);
        log(`  Schema properties: [${propKeys.join(', ')}]`, 'white');
        for (const pk of propKeys) {
          const prop = (s.properties as Record<string, Record<string, unknown>>)[pk];
          log(`    ${pk}: x-component=${prop['x-component']} x-uid=${prop['x-uid']}`, 'white');
          if (prop.properties) {
            const subKeys = Object.keys(prop.properties as Record<string, unknown>);
            log(`      children: [${subKeys.join(', ')}]`, 'gray');
            for (const sk of subKeys) {
              const sub = (prop.properties as Record<string, Record<string, unknown>>)[sk];
              log(`        ${sk}: x-component=${sub['x-component']} x-uid=${sub['x-uid']}`, 'gray');
              if (sub.properties) {
                const deepKeys = Object.keys(sub.properties as Record<string, unknown>);
                log(`          deep children: [${deepKeys.join(', ')}]`, 'gray');
              }
            }
          }
        }
      }
    } catch (err: unknown) {
      log(`  ⚠️ Cannot fetch schema: ${err instanceof Error ? err.message : String(err)}`, 'yellow');
    }
  }
}

async function main() {
  log('\n=== COMPARATIVE DUMP: Agenda (working) vs ENTREGA (broken) ===\n', 'cyan');

  // Find Agenda page routes
  const routesResp = await client.get('/desktopRoutes:list', { pageSize: 200, sort: ['id'] }) as {
    data: { id: number; title?: string; type?: string; parentId?: number; schemaUid?: string }[]
  };
  const routes = routesResp.data || [];

  // Find Agenda group
  const agendaGroup = routes.find(r => r.type === 'group' && r.title?.includes('Agenda'));
  log(`Agenda group: id=${agendaGroup?.id} title=${agendaGroup?.title}`, 'cyan');

  // Get first Agenda page (e.g., "Bloques de Agenda" which we know works)
  if (agendaGroup) {
    const agendaPages = routes.filter(r => r.type === 'page' && r.parentId === agendaGroup.id);
    log(`Agenda pages: ${agendaPages.length}`, 'white');
    for (const p of agendaPages.slice(0, 2)) {
      await dumpRoute(p.id, `AGENDA PAGE: ${p.title}`);
    }
    // Also check if Agenda has 'tabs' type children
    const agendaTabs = routes.filter(r => r.type === 'tabs' && r.parentId === agendaGroup.id);
    log(`\nAgenda tabs-type routes: ${agendaTabs.length}`, 'white');
    // Check page children for tabs
    for (const p of agendaPages.slice(0, 2)) {
      const pageTabs = routes.filter(r => r.parentId === p.id);
      log(`  Children of page "${p.title}" (${p.id}): ${pageTabs.length}`, 'white');
      for (const t of pageTabs) {
        log(`    id=${t.id} type=${t.type} title=${t.title} schema=${t.schemaUid}`, 'gray');
      }
    }
  }

  // ENTREGA group
  const entregaGroup = routes.find(r => r.type === 'group' && r.title?.includes('Entrega'));
  log(`\nEntrega group: id=${entregaGroup?.id} title=${entregaGroup?.title}`, 'cyan');

  if (entregaGroup) {
    const entregaPages = routes.filter(r => r.type === 'page' && r.parentId === entregaGroup.id);
    log(`Entrega pages: ${entregaPages.length}`, 'white');
    // Just dump first 2 for comparison
    for (const p of entregaPages.slice(0, 2)) {
      await dumpRoute(p.id, `ENTREGA PAGE: ${p.title}`);
    }
    for (const p of entregaPages.slice(0, 2)) {
      const pageTabs = routes.filter(r => r.parentId === p.id);
      log(`  Children of page "${p.title}" (${p.id}): ${pageTabs.length}`, 'white');
      for (const t of pageTabs) {
        log(`    id=${t.id} type=${t.type} title=${t.title} schema=${t.schemaUid}`, 'gray');
      }
    }
  }

  log('\n=== DONE ===\n', 'cyan');
}

main().catch(e => { console.error(e.message); process.exit(1); });
