/**
 * deploy-ugco-reportes.ts - Add report blocks to the Reportes page
 *
 * Adds comprehensive table views with export capabilities:
 *   Row 1: All cases (full columns for export/analysis)
 *   Row 2: All events + All tasks
 *   Row 3: Comite sessions + Comite cases
 *
 * Uses: shared/scripts/nocobase-ui-helpers.ts (shared module)
 *
 * Usage:
 *   npx tsx Apps/UGCO/scripts/nocobase/deploy-ugco-reportes.ts
 *   npx tsx Apps/UGCO/scripts/nocobase/deploy-ugco-reportes.ts --discover
 */

import { createClient, log } from '../../../../shared/scripts/ApiClient.js';
import {
    buildTableBlock, wrapInRow, insertIntoGrid,
    findGridUid, findRouteByTitle,
} from '../../../../shared/scripts/nocobase-ui-helpers.js';

const api = createClient();
const UGCO_ROOT_ID = 349160760737793;
const DISCOVER = process.argv.includes('--discover');

async function resolveGridUid(): Promise<string> {
    if (DISCOVER) {
        log('  Discovering Reportes grid UID...', 'gray');
        const route = await findRouteByTitle(api, UGCO_ROOT_ID, '\uD83D\uDCC8 Reportes');
        if (!route) throw new Error('Reportes page not found under UGCO root');
        const gridUid = await findGridUid(api, route.schemaUid);
        if (!gridUid) throw new Error(`Grid not found in schema ${route.schemaUid}`);
        log(`  Discovered grid UID: ${gridUid}`, 'green');
        return gridUid;
    }
    return 'n6kbu61z0vc'; // Known UID from last deploy
}

async function main() {
    log('\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557', 'cyan');
    log('\u2551  DEPLOY UGCO REPORTES \u2014 Full Table Views for Export      \u2551', 'cyan');
    log('\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n', 'cyan');

    const gridUid = await resolveGridUid();

    // Row 1: Full cases table
    log('\u2500\u2500 Row 1: Reporte completo de Casos Oncol\u00F3gicos \u2500\u2500\n', 'cyan');
    const casosFullTable = buildTableBlock({
        collection: 'UGCO_casooncologico',
        title: 'Reporte: Todos los Casos Oncol\u00F3gicos',
        columns: ['UGCO_COD01', 'codigo_cie10', 'cie10_glosa', 'fecha_diagnostico',
            'estado_seguimiento', 'estado_adm_id', 'estado_clinico_id',
            'intencion_trat_id', 'tnm_t', 'tnm_n', 'tnm_m', 'estadio_clinico',
            'control_vencido', 'tareas_criticas_pendientes', 'createdAt'],
        params: { sort: ['-createdAt'], pageSize: 50 },
        includeExport: true,
    });
    if (await insertIntoGrid(api, gridUid, wrapInRow([casosFullTable]))) {
        log('  [OK] Casos full table', 'green');
    }

    // Row 2: Events + Tasks
    log('\n\u2500\u2500 Row 2: Eventos Cl\u00EDnicos + Tareas \u2500\u2500\n', 'cyan');
    const eventosTable = buildTableBlock({
        collection: 'UGCO_eventoclinico',
        title: 'Reporte: Eventos Cl\u00EDnicos',
        columns: ['tipo_evento', 'subtipo_evento', 'estado', 'fecha_solicitud',
            'fecha_realizacion', 'resultado_resumen', 'origen_dato', 'createdAt'],
        params: { sort: ['-createdAt'], pageSize: 20 },
        includeExport: true,
    });
    const tareasTable = buildTableBlock({
        collection: 'UGCO_tarea',
        title: 'Reporte: Tareas',
        columns: ['titulo', 'estado', 'prioridad', 'descripcion', 'fecha_vencimiento',
            'responsable_usuario', 'comentarios', 'createdAt'],
        params: { sort: ['-createdAt'], pageSize: 20 },
        includeExport: true,
    });
    if (await insertIntoGrid(api, gridUid, wrapInRow([eventosTable, tareasTable]))) {
        log('  [OK] Eventos + Tareas tables', 'green');
    }

    // Row 3: Comites + Comite-Casos
    log('\n\u2500\u2500 Row 3: Comit\u00E9s + Casos en Comit\u00E9 \u2500\u2500\n', 'cyan');
    const comitesTable = buildTableBlock({
        collection: 'UGCO_comiteoncologico',
        title: 'Reporte: Sesiones de Comit\u00E9',
        columns: ['fecha_sesion', 'lugar', 'estado', 'observaciones', 'createdAt'],
        params: { sort: ['-fecha_sesion'], pageSize: 20 },
        includeExport: true,
    });
    const comiteCasosTable = buildTableBlock({
        collection: 'UGCO_comitecaso',
        title: 'Reporte: Casos en Comit\u00E9',
        columns: ['orden_presentacion', 'motivo_presentacion', 'decision_comite',
            'plan_tratamiento', 'observaciones', 'createdAt'],
        params: { sort: ['-createdAt'], pageSize: 20 },
        includeExport: true,
    });
    if (await insertIntoGrid(api, gridUid, wrapInRow([comitesTable, comiteCasosTable]))) {
        log('  [OK] Comit\u00E9s + Casos en Comit\u00E9 tables', 'green');
    }

    log('\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550', 'green');
    log('  UGCO Reportes page deployed: 3 rows, 5 tables', 'green');
    log('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err.message}`, 'red');
    process.exit(1);
});
