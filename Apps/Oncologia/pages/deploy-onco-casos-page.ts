/**
 * deploy-onco-casos-page.ts — Deploy page: Casos Oncologicos
 *
 * Crea la pagina UI de onco_casos en NocoBase con un bloque TableV2
 * que muestra los casos oncologicos con columnas clinicas relevantes.
 * Vincula la pagina al grupo Oncologia existente.
 *
 * Uso:
 *   npx tsx Apps/Oncologia/pages/deploy-onco-casos-page.ts
 *   npx tsx Apps/Oncologia/pages/deploy-onco-casos-page.ts --dry-run
 *   npx tsx Apps/Oncologia/pages/deploy-onco-casos-page.ts --parent-id <routeId>
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
    log('  ONCOLOGIA: Deploy Pagina — Casos Oncologicos (onco_casos)', 'cyan');
    log('============================================================\n', 'cyan');

    if (DRY_RUN) {
        log('[DRY RUN] Simulacion sin aplicar cambios\n', 'yellow');
        log('  Crearía pagina "Casos Oncologicos" con tabla onco_casos', 'yellow');
        log('  Columnas: rut, nombre, diagnostico, etapa, estado, fecha_diagnostico', 'yellow');
        return;
    }

    // Determinar parent ID
    let parentId = getParentId();
    if (!parentId) {
        log('  Buscando grupo Oncologia...', 'gray');
        parentId = await findOncologiaGroup();
        if (!parentId) {
            log('  [WARN] No se encontro grupo Oncologia. Creando pagina en raiz.', 'yellow');
            parentId = 0;
        } else {
            log(`  [OK] Grupo Oncologia encontrado: id=${parentId}`, 'green');
        }
    }

    // Crear pagina
    const page = await createPage(api, 'Casos Oncologicos', parentId);
    if (!page) {
        log('  [ERROR] No se pudo crear la pagina', 'red');
        process.exit(1);
    }

    // Insertar header markdown
    const headerRow = wrapInRow([
        buildMarkdownBlock(
            '## Casos Oncologicos\n\nRegistro de casos oncologicos activos. ' +
            'Utilice los filtros para buscar por paciente, diagnostico o estado.'
        ),
    ]);
    await insertIntoGrid(api, page.gridUid, headerRow);

    // Insertar tabla principal
    const tableRow = wrapInRow([
        buildTableBlock({
            collection: 'onco_casos',
            title: 'Casos Oncologicos',
            columns: [
                'rut_paciente',
                'nombre_paciente',
                'diagnostico_principal',
                'etapa_clinica',
                'estado',
                'fecha_diagnostico',
                'medico_tratante',
                'servicio',
            ],
            params: { pageSize: 25, sort: ['-createdAt'] },
            includeExport: true,
            includeCreate: true,
        }),
    ]);
    await insertIntoGrid(api, page.gridUid, tableRow);

    logAction('ONCO_PAGE_DEPLOYED', {
        page: 'Casos Oncologicos',
        collection: 'onco_casos',
        routeId: page.routeId,
    });

    log('\n============================================================', 'green');
    log(`  Pagina "Casos Oncologicos" deployada (route=${page.routeId})`, 'green');
    log('============================================================\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err instanceof Error ? err.message : String(err)}`, 'red');
    process.exit(1);
});
