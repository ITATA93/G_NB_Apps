/**
 * deploy-oncologia.ts — Create Oncología menu group + 4 pages with table blocks
 *
 * Following the validated standard: docs/standards/nocobase-page-block-deployment.md
 *
 * Creates:
 *   1. Menu group "Oncología (UGCO)"
 *   2. 4 pages: Casos, Episodios, Sesiones Comité, Casos en Comité
 *   Each page has Triple Binding (structure+navigation+content)
 *
 * USO:
 *   npx tsx shared/scripts/temp/deploy-oncologia.ts
 */
import { createClient, log } from '../ApiClient';

const client = createClient();
const ROLES = ['admin', 'member', 'root', 'medico_oncologo', 'r_gd0z1pmdmii'];

interface PageSpec {
  title: string;
  collection: string;
}

const PAGES: PageSpec[] = [
  { title: 'Casos Oncológicos',     collection: 'onco_casos' },
  { title: 'Episodios',             collection: 'onco_episodios' },
  { title: 'Sesiones de Comité',    collection: 'onco_comite_sesiones' },
  { title: 'Casos en Comité',       collection: 'onco_comite_casos' },
];

// ─── Schema builders ──────────────────────────────────────────────────────────

function buildTableBlockSchema(collectionName: string): Record<string, unknown> {
  return {
    type: 'void',
    'x-decorator': 'TableBlockProvider',
    'x-decorator-props': {
      collection: collectionName,
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
        'x-initializer': 'table:configureActions',
        'x-component-props': { style: { marginBottom: 'var(--nb-spacing)' } },
      },
      table: {
        type: 'array',
        'x-component': 'TableV2',
        'x-use-component-props': 'useTableBlockProps',
        'x-component-props': { rowKey: 'id', rowSelection: { type: 'checkbox' } },
        'x-initializer': 'table:configureColumns',
      },
    },
  };
}

async function createPageSchema(title: string): Promise<string | null> {
  const schema = {
    type: 'void',
    'x-component': 'Page',
    'x-async': true,
    title,
    properties: {},
  };
  try {
    const resp = await client.post('/uiSchemas:insert', schema);
    const data = (resp as Record<string, unknown>).data as Record<string, unknown>;
    return (data?.['x-uid'] || null) as string | null;
  } catch (_e) {
    log(`  ❌ Failed to create Page schema for "${title}"`, 'red');
    return null;
  }
}

async function createGridSchema(): Promise<{ uid: string; name: string } | null> {
  const schema = {
    type: 'void',
    'x-component': 'Grid',
    'x-initializer': 'page:addBlock',
  };
  try {
    const resp = await client.post('/uiSchemas:insert', schema);
    const d = (resp as Record<string, unknown>).data as Record<string, unknown>;
    return { uid: d?.['x-uid'] as string, name: d?.name as string };
  } catch (_e) {
    log(`  ❌ Failed to create Grid schema`, 'red');
    return null;
  }
}

async function createMenuItemSchema(title: string): Promise<string | null> {
  const schema = {
    type: 'void',
    'x-component': 'Menu.Item',
    'x-component-props': {},
    title,
  };
  try {
    const resp = await client.post('/uiSchemas:insert', schema);
    const d = (resp as Record<string, unknown>).data as Record<string, unknown>;
    return (d?.['x-uid'] || null) as string | null;
  } catch (_e) {
    log(`  ❌ Failed to create Menu.Item schema for "${title}"`, 'red');
    return null;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  log('\n╔══════════════════════════════════════════════════════╗', 'cyan');
  log('║  DEPLOY ONCOLOGÍA UI                                 ║', 'cyan');
  log('╚══════════════════════════════════════════════════════╝\n', 'cyan');

  // ── Step 1: Create menu group ────────────────────────────────────────────
  log('── Step 1: Create menu group "Oncología (UGCO)" ──\n', 'cyan');

  const groupMenuUid = await createMenuItemSchema('Oncología (UGCO)');
  if (!groupMenuUid) throw new Error('Failed to create group menu schema');

  const groupResp = await client.post('/desktopRoutes:create', {
    parentId: null,
    title: 'Oncología (UGCO)',
    icon: 'HeartOutlined',
    type: 'group',
    menuSchemaUid: groupMenuUid,
  });
  const groupRouteId = ((groupResp as Record<string, unknown>).data as Record<string, unknown>)?.id as number;
  log(`  ✅ Group route ID: ${groupRouteId}\n`, 'green');

  // Bind roles to group
  for (const role of ROLES) {
    try {
      await client.post('/rolesDesktopRoutes:create', { desktopRouteId: groupRouteId, roleName: role });
    } catch (_e) { /* already bound */ }
  }
  log(`  ✅ Roles bound to group\n`, 'green');

  // ── Step 2: Create pages ─────────────────────────────────────────────────
  log('── Step 2: Create pages ──\n', 'cyan');

  let success = 0;

  for (const page of PAGES) {
    log(`  📄 ${page.title} (${page.collection})`, 'white');

    // 1. Create Page schema
    const pageSchemaUid = await createPageSchema(page.title);
    if (!pageSchemaUid) continue;

    // 2. Create Grid schema (for tabs child route)
    const grid = await createGridSchema();
    if (!grid) continue;

    // 3. Create Menu.Item schema
    const menuSchemaUid = await createMenuItemSchema(page.title);
    if (!menuSchemaUid) continue;

    // 4. Create page route
    const pageRouteResp = await client.post('/desktopRoutes:create', {
      parentId: groupRouteId,
      title: page.title,
      schemaUid: pageSchemaUid,
      menuSchemaUid,
      type: 'page',
      enableTabs: false,
    });
    const pageRouteId = ((pageRouteResp as Record<string, unknown>).data as Record<string, unknown>)?.id as number;

    // 5. Create tabs child route (Triple Binding — content layer)
    const tabsResp = await client.post('/desktopRoutes:create', {
      parentId: pageRouteId,
      schemaUid: grid.uid,
      tabSchemaName: grid.name,
      type: 'tabs',
      hidden: true,
    });
    const tabsRouteId = ((tabsResp as Record<string, unknown>).data as Record<string, unknown>)?.id as number;

    // 6. Bind roles to page + tabs
    for (const role of ROLES) {
      try { await client.post('/rolesDesktopRoutes:create', { desktopRouteId: pageRouteId, roleName: role }); } catch (_e) { /* */ }
      try { await client.post('/rolesDesktopRoutes:create', { desktopRouteId: tabsRouteId, roleName: role }); } catch (_e) { /* */ }
    }

    // 7. Insert table block into grid
    const blockSchema = buildTableBlockSchema(page.collection);
    const rowWrapper = {
      type: 'void',
      'x-component': 'Grid.Row',
      properties: {
        col: {
          type: 'void',
          'x-component': 'Grid.Col',
          properties: {
            block: blockSchema,
          },
        },
      },
    };

    try {
      await client.post(`/uiSchemas:insertAdjacent/${grid.uid}?position=beforeEnd`, { schema: rowWrapper });
      log(`    ✅ Route: ${pageRouteId}, Tabs: ${tabsRouteId}, Grid: ${grid.uid}`, 'green');
      success++;
    } catch (_e) {
      log(`    ❌ Failed to insert block for ${page.collection}`, 'red');
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  log(`\n═══ RESULTS ═══`, 'cyan');
  log(`  ✅ Success: ${success}/${PAGES.length}`, success === PAGES.length ? 'green' : 'yellow');
  log(`  Group: Oncología (UGCO) — Route ID: ${groupRouteId}\n`, 'gray');

  if (success < PAGES.length) process.exit(1);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
