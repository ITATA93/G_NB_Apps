/**
 * diagnose-routes.ts — Show route tree around BUHO / Agenda Médica / Entrega de Turno
 */
import { createClient, log } from './ApiClient.js';

const client = createClient();

async function main() {
  const routesResp = await client.get('/desktopRoutes:list', { paginate: false });
  const routes = ((routesResp as Record<string, unknown>).data || routesResp) as Record<
    string,
    unknown
  >[];

  log(`Total routes: ${routes.length}`, 'cyan');

  const targets = ['BUHO', 'Agenda Médica', 'Entrega de Turno'];

  for (const targetTitle of targets) {
    const group = routes.find((r) => r.title === targetTitle && r.type === 'group');
    if (!group) {
      log(`\n❌ "${targetTitle}" group not found`, 'red');
      continue;
    }

    log(`\n📁 "${targetTitle}" (id=${group.id}, parentId=${group.parentId})`, 'cyan');

    // Level 1: direct children
    const L1 = routes.filter((r) => r.parentId === group.id);
    for (const r1 of L1) {
      const icon = r1.type === 'group' ? '📂' : r1.type === 'page' ? '📄' : '🔗';
      log(
        `  ${icon} "${r1.title}" (id=${r1.id}, type=${r1.type}, schemaUid=${r1.schemaUid || '-'})`,
        'white',
      );

      // Level 2: children of L1
      const L2 = routes.filter((r) => r.parentId === r1.id);
      for (const r2 of L2) {
        const icon2 =
          r2.type === 'group' ? '📂' : r2.type === 'page' ? '📄' : r2.type === 'tabs' ? '📑' : '🔗';
        log(
          `    ${icon2} "${r2.title}" (id=${r2.id}, type=${r2.type}, schemaUid=${r2.schemaUid || '-'})`,
          'gray',
        );

        // Level 3
        const L3 = routes.filter((r) => r.parentId === r2.id);
        for (const r3 of L3) {
          log(
            `      🔸 "${r3.title}" (id=${r3.id}, type=${r3.type}, schemaUid=${r3.schemaUid || '-'})`,
            'gray',
          );
        }
      }
    }
  }
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
