/**
 * deploy-ugco-dashboard.ts - Deploy dashboard blocks to the UGCO Dashboard page
 *
 * Adds to the existing Dashboard page grid:
 *   Row 1: Markdown header with hospital/UGCO description
 *   Row 2: Casos Activos table + Tareas Pendientes table
 *   Row 3: Comités + Eventos Clínicos tables
 *   Row 4: Charts (Bar: estado adm, Pie: tipos evento)
 *   Row 5: Contactos + Equipos tables
 *
 * Uses: shared/scripts/nocobase-ui-helpers.ts (shared module)
 *
 * Usage:
 *   npx tsx Apps/UGCO/scripts/nocobase/deploy-ugco-dashboard.ts
 *   npx tsx Apps/UGCO/scripts/nocobase/deploy-ugco-dashboard.ts --discover
 */

import { createClient, log } from '../../../../shared/scripts/ApiClient.js';
import {
    buildTableBlock, buildMarkdownBlock, buildChartBlock,
    wrapInRow, insertIntoGrid, findGridUid, findRouteByTitle,
} from '../../../../shared/scripts/nocobase-ui-helpers.js';

const api = createClient();
const UGCO_ROOT_ID = 349160760737793;
const DISCOVER = process.argv.includes('--discover');

async function resolveGridUid(): Promise<string> {
    if (DISCOVER) {
        log('  Discovering Dashboard grid UID...', 'gray');
        const route = await findRouteByTitle(api, UGCO_ROOT_ID, 'Dashboard');
        if (!route) {
            // Try emoji variant
            const route2 = await findRouteByTitle(api, UGCO_ROOT_ID, '\uD83D\uDCCA Dashboard');
            if (!route2) throw new Error('Dashboard page not found under UGCO root');
            const gridUid = await findGridUid(api, route2.schemaUid);
            if (!gridUid) throw new Error(`Grid not found in schema ${route2.schemaUid}`);
            log(`  Discovered grid UID: ${gridUid}`, 'green');
            return gridUid;
        }
        const gridUid = await findGridUid(api, route.schemaUid);
        if (!gridUid) throw new Error(`Grid not found in schema ${route.schemaUid}`);
        log(`  Discovered grid UID: ${gridUid}`, 'green');
        return gridUid;
    }
    return '9pv7ojsyj69'; // Known UID from last deploy
}

async function main() {
    log('\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557', 'cyan');
    log('\u2551  DEPLOY UGCO DASHBOARD \u2014 KPIs, Charts & Tables           \u2551', 'cyan');
    log('\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D\n', 'cyan');

    const gridUid = await resolveGridUid();

    // Row 1: Header
    log('\u2500\u2500 Row 1: Dashboard Header \u2500\u2500\n', 'cyan');
    const headerMd = buildMarkdownBlock(
        `## Dashboard \u2014 Unidad de Gesti\u00F3n en C\u00E1ncer y Oncolog\u00EDa (UGCO)\n\n` +
        `Hospital Dr. Antonio Tirado Lanas \u2014 Ovalle\n\n` +
        `> Panel de control para seguimiento de casos oncol\u00F3gicos, tareas pendientes, comit\u00E9s y eventos cl\u00EDnicos.`
    );
    if (await insertIntoGrid(api, gridUid, wrapInRow([headerMd]))) {
        log('  [OK] Header Markdown block', 'green');
    }

    // Row 2: Casos + Tareas
    log('\n\u2500\u2500 Row 2: Casos Activos + Tareas Pendientes \u2500\u2500\n', 'cyan');
    const casosTable = buildTableBlock({
        collection: 'UGCO_casooncologico',
        title: 'Casos Oncol\u00F3gicos Activos',
        columns: ['UGCO_COD01', 'codigo_cie10', 'cie10_glosa', 'fecha_diagnostico', 'estado_seguimiento', 'estado_adm_id'],
        params: { sort: ['-createdAt'], pageSize: 10 },
    });
    const tareasTable = buildTableBlock({
        collection: 'UGCO_tarea',
        title: 'Tareas Pendientes',
        columns: ['titulo', 'estado', 'prioridad', 'fecha_vencimiento', 'responsable_usuario'],
        params: { sort: ['-createdAt'], pageSize: 10 },
    });
    if (await insertIntoGrid(api, gridUid, wrapInRow([casosTable, tareasTable]))) {
        log('  [OK] Casos + Tareas tables', 'green');
    }

    // Row 3: Comites + Eventos
    log('\n\u2500\u2500 Row 3: Comit\u00E9s + Eventos Cl\u00EDnicos \u2500\u2500\n', 'cyan');
    const comitesTable = buildTableBlock({
        collection: 'UGCO_comiteoncologico',
        title: 'Comit\u00E9s Oncol\u00F3gicos',
        columns: ['fecha_sesion', 'lugar', 'estado', 'observaciones'],
        params: { sort: ['-fecha_sesion'], pageSize: 5 },
    });
    const eventosTable = buildTableBlock({
        collection: 'UGCO_eventoclinico',
        title: '\u00DAltimos Eventos Cl\u00EDnicos',
        columns: ['tipo_evento', 'estado', 'fecha_solicitud', 'fecha_realizacion', 'resultado_resumen'],
        params: { sort: ['-createdAt'], pageSize: 5 },
    });
    if (await insertIntoGrid(api, gridUid, wrapInRow([comitesTable, eventosTable]))) {
        log('  [OK] Comit\u00E9s + Eventos tables', 'green');
    }

    // Row 4: Charts
    log('\n\u2500\u2500 Row 4: Chart blocks \u2500\u2500\n', 'cyan');
    try {
        const chartBar = buildChartBlock({
            title: 'Casos por Estado Administrativo',
            collection: 'UGCO_casooncologico',
            measures: [{ field: ['id'], aggregation: 'count', alias: 'total' }],
            dimensions: [{ field: ['estado_seguimiento'], alias: 'estado' }],
            chartType: 'Bar', xField: 'estado', yField: 'total',
        });
        const chartPie = buildChartBlock({
            title: 'Eventos Cl\u00EDnicos por Tipo',
            collection: 'UGCO_eventoclinico',
            measures: [{ field: ['id'], aggregation: 'count', alias: 'total' }],
            dimensions: [{ field: ['tipo_evento'], alias: 'tipo' }],
            chartType: 'Pie', xField: 'tipo', yField: 'total',
        });
        if (await insertIntoGrid(api, gridUid, wrapInRow([chartBar, chartPie]))) {
            log('  [OK] Chart blocks (Bar + Pie)', 'green');
        }
    } catch (err: unknown) {
        log(`  [WARN] Charts not inserted: ${err instanceof Error ? err.message : String(err)}`, 'yellow');
    }

    // Row 5: Contactos + Equipos
    log('\n\u2500\u2500 Row 5: Contactos + Equipos \u2500\u2500\n', 'cyan');
    const contactosTable = buildTableBlock({
        collection: 'UGCO_contactopaciente',
        title: 'Contactos de Pacientes',
        columns: ['tipo_contacto', 'valor_contacto', 'es_principal', 'activo'],
        params: { sort: ['-createdAt'], pageSize: 5 },
    });
    const equiposTable = buildTableBlock({
        collection: 'UGCO_equiposeguimiento',
        title: 'Equipos de Seguimiento',
        columns: ['nombre', 'descripcion', 'activo'],
        params: { sort: ['nombre'], pageSize: 5 },
    });
    if (await insertIntoGrid(api, gridUid, wrapInRow([contactosTable, equiposTable]))) {
        log('  [OK] Contactos + Equipos tables', 'green');
    }

    log('\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550', 'green');
    log('  UGCO Dashboard deployed: 5 rows, 10+ blocks', 'green');
    log('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err.message}`, 'red');
    process.exit(1);
});
