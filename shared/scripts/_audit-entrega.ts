/**
 * _audit-entrega.ts — One-shot audit of ENTREGA module state in NocoBase
 */
import { createClient, log } from './ApiClient';

const client = createClient();

async function main() {
  // 1. Check ENTREGA collections + field counts
  log('\n=== COLECCIONES ENTREGA ===\n', 'cyan');
  const colResp = await client.get('/collections:list', { pageSize: 200 }) as { data: Record<string, unknown>[] };
  const etCols = colResp.data.filter(c => typeof c.name === 'string' && (c.name as string).startsWith('et_'));
  
  for (const col of etCols) {
    const name = col.name as string;
    let fieldCount = 0;
    let recCount: number | string = '?';
    try {
      const fieldResp = await client.get(`/collections/${name}/fields:list`) as { data: unknown[] };
      fieldCount = fieldResp.data?.length || 0;
    } catch { fieldCount = -1; }
    try {
      const listResp = await client.get(`/${name}:list`, { pageSize: 1 }) as { meta?: { count?: number } };
      recCount = listResp.meta?.count ?? '?';
    } catch { recCount = 'ERR'; }
    log(`  ${name.padEnd(28)} fields: ${String(fieldCount).padEnd(4)} records: ${recCount}`, 'white');
  }

  // 2. All roles
  log('\n=== ROLES (all) ===\n', 'cyan');
  const rolesResp = await client.get('/roles:list', { pageSize: 200 }) as { data: { name: string; title?: string }[] };
  for (const r of rolesResp.data) {
    log(`  [${r.name}] ${r.title || ''}`, 'white');
  }

  // 3. Blueprint ENTREGA roles check
  const blueprintRoles = ['medico_medicina', 'medico_cirugia', 'enfermeria_servicio', 'jefe_servicio'];
  log('\n=== ROLES ENTREGA (blueprint) ===\n', 'cyan');
  const existingNames = rolesResp.data.map(r => r.name);
  for (const br of blueprintRoles) {
    const exists = existingNames.includes(br);
    log(`  ${br.padEnd(25)} ${exists ? '✅ EXISTS' : '❌ MISSING'}`, exists ? 'green' : 'red');
  }

  // 4. Seed data
  log('\n=== SEED DATA ===\n', 'cyan');
  for (const col of ['et_especialidades', 'et_servicios']) {
    try {
      const resp = await client.get(`/${col}:list`, { pageSize: 200 }) as { data: Record<string, unknown>[] };
      const records = resp.data || [];
      log(`  ${col}: ${records.length} registro(s)`, records.length > 0 ? 'green' : 'yellow');
      for (const r of records.slice(0, 5)) {
        log(`    - ${r.nombre || r.codigo || JSON.stringify(r).slice(0, 50)}`, 'gray');
      }
    } catch { log(`  ${col}: ⚠️ Error`, 'yellow'); }
  }

  // 5. UI menus
  log('\n=== UI MENUS ===\n', 'cyan');
  try {
    const menuResp = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu') as { data?: { properties?: Record<string, { title?: string; properties?: Record<string, unknown> }> } };
    const props = menuResp.data?.properties || {};
    for (const key of Object.keys(props)) {
      const menu = props[key];
      const title = menu.title || key;
      const childCount = Object.keys(menu.properties || {}).length;
      const isEntrega = title.toLowerCase().includes('entrega') || title.toLowerCase().includes('enferm');
      log(`  ${isEntrega ? '🟢' : '  '} ${title} (${childCount} children)`, isEntrega ? 'green' : 'gray');
    }
  } catch (err: unknown) {
    log(`  ⚠️ Error: ${err instanceof Error ? err.message : String(err)}`, 'yellow');
  }

  log('\n=== AUDIT COMPLETE ===\n', 'cyan');
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
