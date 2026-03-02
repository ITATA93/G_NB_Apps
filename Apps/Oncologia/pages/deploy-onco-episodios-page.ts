/**
 * deploy-onco-episodios-page.ts — Deploy page: Episodios Oncologicos
 *
 * Crea la pagina UI de onco_episodios en NocoBase con un bloque TableV2
 * para visualizar episodios clinicos asociados a casos oncologicos.
 *
 * Uso:
 *   npx tsx Apps/Oncologia/pages/deploy-onco-episodios-page.ts
 *   npx tsx Apps/Oncologia/pages/deploy-onco-episodios-page.ts --dry-run
 *   npx tsx Apps/Oncologia/pages/deploy-onco-episodios-page.ts --parent-id <routeId>
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
    log('  ONCOLOGIA: Deploy Pagina — Episodios Oncologicos', 'cyan');
    log('============================================================\n', 'cyan');

    if (DRY_RUN) {
        log('[DRY RUN] Simulacion sin aplicar cambios\n', 'yellow');
        log('  Crearía pagina "Episodios Oncologicos" con tabla onco_episodios', 'yellow');
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

    const page = await createPage(api, 'Episodios Oncologicos', parentId);
    if (!page) {
        log('  [ERROR] No se pudo crear la pagina', 'red');
        process.exit(1);
    }

    // Header
    const headerRow = wrapInRow([
        buildMarkdownBlock(
            '## Episodios Oncologicos\n\nHistorial de episodios clinicos ' +
            '(consultas, procedimientos, hospitalizaciones) vinculados a cada caso.'
        ),
    ]);
    await insertIntoGrid(api, page.gridUid, headerRow);

    // Tabla principal
    const tableRow = wrapInRow([
        buildTableBlock({
            collection: 'onco_episodios',
            title: 'Episodios Clinicos',
            columns: [
                'caso_id',
                'tipo_episodio',
                'fecha_inicio',
                'fecha_fin',
                'diagnostico',
                'tratamiento',
                'estado',
                'profesional_responsable',
            ],
            params: { pageSize: 25, sort: ['-fecha_inicio'] },
            includeExport: true,
            includeCreate: true,
        }),
    ]);
    await insertIntoGrid(api, page.gridUid, tableRow);

    logAction('ONCO_PAGE_DEPLOYED', {
        page: 'Episodios Oncologicos',
        collection: 'onco_episodios',
        routeId: page.routeId,
    });

    log('\n============================================================', 'green');
    log(`  Pagina "Episodios Oncologicos" deployada (route=${page.routeId})`, 'green');
    log('============================================================\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err instanceof Error ? err.message : String(err)}`, 'red');
    process.exit(1);
});
