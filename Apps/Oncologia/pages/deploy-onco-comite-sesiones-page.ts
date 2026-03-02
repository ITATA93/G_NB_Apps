/**
 * deploy-onco-comite-sesiones-page.ts — Deploy page: Sesiones Comite Oncologico
 *
 * Crea la pagina UI de onco_comite_sesiones en NocoBase con un bloque
 * TableV2 para gestionar las sesiones del comite oncologico.
 *
 * Uso:
 *   npx tsx Apps/Oncologia/pages/deploy-onco-comite-sesiones-page.ts
 *   npx tsx Apps/Oncologia/pages/deploy-onco-comite-sesiones-page.ts --dry-run
 *   npx tsx Apps/Oncologia/pages/deploy-onco-comite-sesiones-page.ts --parent-id <routeId>
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
    log('  ONCOLOGIA: Deploy Pagina — Sesiones Comite Oncologico', 'cyan');
    log('============================================================\n', 'cyan');

    if (DRY_RUN) {
        log('[DRY RUN] Simulacion sin aplicar cambios\n', 'yellow');
        log('  Crearía pagina "Sesiones Comite Oncologico" con tabla onco_comite_sesiones', 'yellow');
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

    const page = await createPage(api, 'Sesiones Comite Oncologico', parentId);
    if (!page) {
        log('  [ERROR] No se pudo crear la pagina', 'red');
        process.exit(1);
    }

    // Header
    const headerRow = wrapInRow([
        buildMarkdownBlock(
            '## Sesiones del Comite Oncologico\n\nCalendario de sesiones del comite, ' +
            'participantes y actas. Cada sesion agrupa los casos a discutir.'
        ),
    ]);
    await insertIntoGrid(api, page.gridUid, headerRow);

    // Tabla principal
    const tableRow = wrapInRow([
        buildTableBlock({
            collection: 'onco_comite_sesiones',
            title: 'Sesiones del Comite',
            columns: [
                'fecha_sesion',
                'hora_inicio',
                'hora_fin',
                'lugar',
                'estado',
                'moderador',
                'total_casos',
                'acta_aprobada',
            ],
            params: { pageSize: 20, sort: ['-fecha_sesion'] },
            includeExport: true,
            includeCreate: true,
        }),
    ]);
    await insertIntoGrid(api, page.gridUid, tableRow);

    logAction('ONCO_PAGE_DEPLOYED', {
        page: 'Sesiones Comite Oncologico',
        collection: 'onco_comite_sesiones',
        routeId: page.routeId,
    });

    log('\n============================================================', 'green');
    log(`  Pagina "Sesiones Comite" deployada (route=${page.routeId})`, 'green');
    log('============================================================\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err instanceof Error ? err.message : String(err)}`, 'red');
    process.exit(1);
});
