/**
 * investigate-ui.ts — Investigar diferencias entre páginas funcionales y creadas via API
 */
import { createClient, log } from './ApiClient.ts';

const client = createClient();

async function main() {
    // 1. List all routes
    log('\n📍 === TODAS LAS RUTAS ===\n', 'cyan');
    const routesResp = await client.get('/desktopRoutes:list', { paginate: false });
    const routesData = routesResp as Record<string, unknown>;
    const routes = (routesData.data || routesData) as Record<string, unknown>[];
    const routeList = Array.isArray(routes) ? routes : [];

    for (const r of routeList) {
        log(`  ID: ${r.id} | ${r.type} | "${r.title}" | schema: ${r.schemaUid || 'NONE'} | menu: ${r.menuSchemaUid || 'NONE'} | tabs: ${r.enableTabs} | header: ${r.enableHeader} | hidden: ${r.hidden}`, 'white');
    }

    // 2. Compare schemas: get one of our created pages
    const agendaPages = routeList.filter(r => r.title === 'Funcionarios' || r.title === 'Categorías de Actividad');
    if (agendaPages.length > 0) {
        const page = agendaPages[0];
        log(`\n🔍 === SCHEMA DE PÁGINA CREADA: "${page.title}" (${page.schemaUid}) ===\n`, 'cyan');
        if (page.schemaUid) {
            const schema = await client.get(`/uiSchemas:getJsonSchema/${page.schemaUid}`, {});
            log(JSON.stringify(schema, null, 2), 'gray');
        }
    }

    // 3. Check what tables NocoBase has for UI
    log('\n📊 === TABLAS INTERNAS (uiSchemaTemplates, roles routes) ===\n', 'cyan');

    // Check uiSchemaTemplates
    try {
        const templates = await client.get('/uiSchemaTemplates:list', {});
        const tData = templates as Record<string, unknown>;
        const tList = ((tData.data || tData) as Record<string, unknown>[]) || [];
        log(`  uiSchemaTemplates: ${Array.isArray(tList) ? tList.length : '?'} templates`, 'white');
    } catch (e: unknown) {
        log(`  uiSchemaTemplates: ${e instanceof Error ? e.message : 'Not available'}`, 'yellow');
    }

    // Check roles:desktopRoutes (ACL for routes)
    try {
        const roles = await client.get('/roles:list', { paginate: false });
        const rData = roles as Record<string, unknown>;
        const rList = ((rData.data || rData) as Record<string, unknown>[]) || [];
        log(`\n  Roles existentes: ${Array.isArray(rList) ? rList.length : '?'}`, 'white');
        if (Array.isArray(rList)) {
            for (const role of rList) {
                log(`    - ${role.name} (${role.title})`, 'gray');
            }
        }
    } catch (e: unknown) {
        log(`  roles:list: ${e instanceof Error ? e.message : 'Error'}`, 'yellow');
    }

    // Check if there's a desktopRoutes:accessible endpoint
    try {
        const accessible = await client.get('/desktopRoutes:listAccessible', { tree: true });
        const aData = accessible as Record<string, unknown>;
        const aList = ((aData.data || aData) as Record<string, unknown>[]) || [];
        log(`\n  desktopRoutes:listAccessible: ${Array.isArray(aList) ? aList.length : '?'} accessible`, 'white');
        if (Array.isArray(aList)) {
            for (const a of aList) {
                log(`    - ${a.title} (${a.type}) children: ${(a.children as unknown[])?.length || 0}`, 'gray');
            }
        }
    } catch (e: unknown) {
        log(`  desktopRoutes:listAccessible: ${e instanceof Error ? e.message : 'Not available'}`, 'yellow');
    }

    // 4. Check rolesDesktopRoutes (binding roles to routes)
    try {
        const rdRoutes = await client.get('/rolesDesktopRoutes:list', { paginate: false });
        const rdData = rdRoutes as Record<string, unknown>;
        const rdList = ((rdData.data || rdData) as Record<string, unknown>[]) || [];
        log(`\n  rolesDesktopRoutes: ${Array.isArray(rdList) ? rdList.length : '?'} bindings`, 'white');
        if (Array.isArray(rdList)) {
            for (const rd of rdList.slice(0, 10)) {
                log(`    - role=${rd.roleName} route=${rd.desktopRouteId} accessible=${rd.accessible}`, 'gray');
            }
            if (rdList.length > 10) log(`    ... y ${rdList.length - 10} más`, 'gray');
        }
    } catch (e: unknown) {
        log(`  rolesDesktopRoutes: ${e instanceof Error ? e.message : 'Not available'}`, 'yellow');
    }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
