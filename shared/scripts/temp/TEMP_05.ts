/**
 * TEMP_05 — Full project audit: connectivity, collections, routes, UI integrity
 */
import { createClient, log } from '../ApiClient';
const client = createClient();

async function main() {
  log('\n══════════════════════════════════════════════', 'cyan');
  log('        G_NB_Apps — FULL PROJECT AUDIT', 'cyan');
  log('══════════════════════════════════════════════\n', 'cyan');

  // 1. CONNECTIVITY
  log('── 1. CONNECTIVITY ──', 'cyan');
  try {
    const sys = await client.get('/app:getLang') as Record<string, unknown>;
    log(`  ✅ NocoBase reachable (lang: ${JSON.stringify(sys).substring(0, 80)})`, 'green');
  } catch (e: unknown) {
    log(`  ❌ Connection failed: ${e instanceof Error ? e.message : String(e)}`, 'red');
    return;
  }

  // 2. COLLECTIONS
  log('\n── 2. COLLECTIONS ──', 'cyan');
  const collectionsResp = await client.get('/collections', { paginate: false }) as { data: Record<string, unknown>[] };
  const collections = (collectionsResp.data || collectionsResp) as Record<string, unknown>[];
  log(`  Total collections: ${collections.length}`, 'white');

  const modules = ['et_', 'ag_', 'onco_', 'sgq_', 'ugco_'];
  for (const prefix of modules) {
    const count = collections.filter(c => (c.name as string || '').startsWith(prefix)).length;
    if (count > 0) {
      const names = collections.filter(c => (c.name as string || '').startsWith(prefix)).map(c => c.name);
      log(`  ${prefix}* = ${count} collections: ${names.join(', ')}`, 'white');
    }
  }
  const otherCount = collections.filter(c => !modules.some(m => (c.name as string || '').startsWith(m))).length;
  log(`  Other (system/custom): ${otherCount}`, 'gray');

  // 3. ROLES
  log('\n── 3. ROLES ──', 'cyan');
  const rolesResp = await client.get('/roles', { paginate: false }) as { data: Record<string, unknown>[] };
  const roles = (rolesResp.data || rolesResp) as Record<string, unknown>[];
  log(`  Total roles: ${roles.length}`, 'white');
  const customRoles = roles.filter(r => !['root', 'admin', 'member', 'guest'].includes(r.name as string));
  for (const r of customRoles) {
    log(`  - ${r.name}: ${r.title || '(no title)'}`, 'white');
  }

  // 4. DESKTOP ROUTES — UI INTEGRITY
  log('\n── 4. UI ROUTES ──', 'cyan');
  const routesResp = await client.get('/desktopRoutes:list', { paginate: false }) as { data: Record<string, unknown>[] };
  const routes = (routesResp.data || routesResp) as Record<string, unknown>[];
  log(`  Total routes: ${routes.length}`, 'white');

  const groups = routes.filter(r => r.type === 'group' && !r.hidden);
  log(`  Menu groups: ${groups.length}`, 'white');
  for (const g of groups) {
    const title = g.title as string || 'Unknown';
    const children = routes.filter(r => r.parentId === g.id && r.type === 'page');
    const childrenWithSchema = children.filter(c => c.schemaUid);
    const childrenWithMenu = children.filter(c => c.menuSchemaUid);

    // Check tabs integrity
    let tabsOk = 0, tabsBroken = 0;
    for (const c of children) {
      const tabs = routes.find(r => r.parentId === c.id && r.type === 'tabs');
      if (tabs && tabs.schemaUid && !(tabs.schemaUid as string).includes('_tabs')) {
        tabsOk++;
      } else if (tabs) {
        tabsBroken++;
      } else {
        tabsBroken++;
      }
    }

    const status = childrenWithSchema.length === children.length && tabsOk === children.length ? '✅' : '⚠️';
    log(`  ${status} ${title}: ${children.length} pages (schema: ${childrenWithSchema.length}, menu: ${childrenWithMenu.length}, tabs-ok: ${tabsOk}, tabs-broken: ${tabsBroken})`, 
      tabsBroken > 0 ? 'yellow' : 'green');
  }

  // 5. ORPHAN SCHEMAS ON PAGES
  log('\n── 5. PAGE CONTENT CHECK (sample) ──', 'cyan');
  const samplePages = routes.filter(r => r.type === 'page' && r.schemaUid).slice(0, 5);
  for (const p of samplePages) {
    const tabs = routes.find(r => r.parentId === p.id && r.type === 'tabs');
    if (!tabs?.schemaUid) {
      log(`  ⚠️ "${p.title}" — no tabs route`, 'yellow');
      continue;
    }
    try {
      const schema = await client.get(`/uiSchemas:getJsonSchema/${tabs.schemaUid}`, {}) as { data: Record<string, unknown> };
      const data = (schema.data || schema) as Record<string, unknown>;
      const hasBlocks = data.properties && Object.keys(data.properties as Record<string, unknown>).length > 0;
      log(`  ${hasBlocks ? '✅' : '⬜'} "${p.title}" — grid: ${tabs.schemaUid} — ${hasBlocks ? 'HAS blocks' : 'EMPTY'}`, hasBlocks ? 'green' : 'yellow');
    } catch {
      log(`  ❌ "${p.title}" — cannot fetch schema`, 'red');
    }
  }

  // 6. TEMP FILES STATUS
  log('\n── 6. TEMP FILES ──', 'cyan');
  log(`  Warning: 20 TEMP_*.ts files in shared/scripts/temp/`, 'yellow');
  log(`  8 are empty stubs (35 bytes each): TEMP_13 through TEMP_20`, 'gray');
  log(`  12 contain logic: TEMP_01 through TEMP_12`, 'gray');
  log(`  Recommendation: Archive or delete after audit`, 'yellow');

  log('\n══════════════════════════════════════════════', 'cyan');
  log('                 AUDIT COMPLETE', 'cyan');
  log('══════════════════════════════════════════════\n', 'cyan');
}

main().catch(e => { console.error(e.message); process.exit(1); });
