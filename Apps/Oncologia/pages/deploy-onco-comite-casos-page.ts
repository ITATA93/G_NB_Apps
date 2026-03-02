/**
 * deploy-onco-comite-casos-page.ts — Deploy page: Casos en Comite Oncologico
 *
 * Crea la pagina UI de onco_comite_casos en NocoBase con un bloque
 * TableV2 para gestionar los casos presentados en cada sesion del comite.
 *
 * Uso:
 *   npx tsx Apps/Oncologia/pages/deploy-onco-comite-casos-page.ts
 *   npx tsx Apps/Oncologia/pages/deploy-onco-comite-casos-page.ts --dry-run
 *   npx tsx Apps/Oncologia/pages/deploy-onco-comite-casos-page.ts --parent-id <routeId>
 */

import { createClient, log, logAction } from '../../../shared/scripts/ApiClient.js';
import {
    createPage,
    insertIntoGrid,
    wrapInRow,
    buildTableBlock,
    buildMarkdownBlock,
} from '../../../shared/scripts/nocobase-ui-helpers.js';

const api = createClient();
const DRY_RUN = process.argv.includes('--dry-run');

function getParentId(): number | null {
    const idx = process.argv.indexOf('--parent-id');
    if (idx !== -1 && process.argv[idx + 1]) {
        return parseInt(process.argv[idx + 1], 10);
    }
    return null;
}

async function findOncologiaGroup(): Promise<number | null> {
    try {
        const result = await api.get('/desktopRoutes:list', {
            filter: { type: 'group' },
            pageSize: 200,
        });
        const routes = (result as { data?: Array<{ id: number; title: string }> }).data || [];
        const oncoGroup = routes.find(r =>
            r.title.toLowerCase().includes('oncolog') ||
            r.title.includes('UGCO')
        );
        return oncoGroup?.id ?? null;
    } catch {
        return null;
    }
}

async function main() {
    log('\n============================================================', 'cyan');
    log('  ONCOLOGIA: Deploy Pagina — Casos en Comite Oncologico', 'cyan');
    log('============================================================\n', 'cyan');

    if (DRY_RUN) {
        log('[DRY RUN] Simulacion sin aplicar cambios\n', 'yellow');
        log('  Crearía pagina "Casos en Comite" con tabla onco_comite_casos', 'yellow');
        return;
    }

    let parentId = getParentId();
    if (!parentId) {
        log('  Buscando grupo Oncologia...', 'gray');
        parentId = await findOncologiaGroup();
        if (!parentId) {
            log('  [WARN] No se encontro grupo Oncologia. Creando en raiz.', 'yellow');
            parentId = 0;
        } else {
            log(`  [OK] Grupo Oncologia: id=${parentId}`, 'green');
        }
    }

    const page = await createPage(api, 'Casos en Comite Oncologico', parentId);
    if (!page) {
        log('  [ERROR] No se pudo crear la pagina', 'red');
        process.exit(1);
    }

    // Header
    const headerRow = wrapInRow([
        buildMarkdownBlock(
            '## Casos en Comite Oncologico\n\nCasos presentados en sesiones del comite. ' +
            'Incluye decision del comite, orden de presentacion y seguimiento.'
        ),
    ]);
    await insertIntoGrid(api, page.gridUid, headerRow);

    // Tabla principal
    const tableRow = wrapInRow([
        buildTableBlock({
            collection: 'onco_comite_casos',
            title: 'Casos Presentados en Comite',
            columns: [
                'sesion_id',
                'caso_id',
                'orden_presentacion',
                'motivo_presentacion',
                'diagnostico_resumen',
                'decision_comite',
                'plan_tratamiento',
                'responsable_seguimiento',
            ],
            params: { pageSize: 25, sort: ['orden_presentacion'] },
            includeExport: true,
            includeCreate: true,
        }),
    ]);
    await insertIntoGrid(api, page.gridUid, tableRow);

    logAction('ONCO_PAGE_DEPLOYED', {
        page: 'Casos en Comite Oncologico',
        collection: 'onco_comite_casos',
        routeId: page.routeId,
    });

    log('\n============================================================', 'green');
    log(`  Pagina "Casos en Comite" deployada (route=${page.routeId})`, 'green');
    log('============================================================\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err instanceof Error ? err.message : String(err)}`, 'red');
    process.exit(1);
});
