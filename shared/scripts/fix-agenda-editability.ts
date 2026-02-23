/**
 * fix-agenda-editability.ts — Arregla las páginas AGENDA para que sean editables
 *
 * Root cause: Las páginas creadas via API carecen de `menuSchemaUid` y `enableTabs`.
 * Las páginas funcionales (RECA) tienen ambos valores.
 *
 * Este script:
 * 1. Crea un menuSchema para el grupo Agenda
 * 2. Crea menuSchemas para cada página AGENDA
 * 3. Vincula los menuSchemas a las rutas
 * 4. Configura enableTabs: false en todas las páginas
 * 5. Opcionalmente resetea el schema de la página a uno simple (como RECA)
 *
 * USO:
 *   npx tsx shared/scripts/fix-agenda-editability.ts              # Fix + verify
 *   npx tsx shared/scripts/fix-agenda-editability.ts --dry-run    # Preview only
 *   npx tsx shared/scripts/fix-agenda-editability.ts --verify     # Just verify
 */
import { createClient, log } from './ApiClient.ts';

const client = createClient();
const DRY_RUN = process.argv.includes('--dry-run');
const VERIFY_ONLY = process.argv.includes('--verify');

interface RouteInfo {
    id: number;
    title: string;
    type: string;
    schemaUid: string | null;
    menuSchemaUid: string | null;
    parentId: number | null;
    enableTabs: boolean | null;
    icon: string | null;
}

async function getRoutes(): Promise<RouteInfo[]> {
    const resp = await client.get('/desktopRoutes:list', { paginate: false });
    const data = resp as Record<string, unknown>;
    return ((data.data || data) as RouteInfo[]) || [];
}

async function verify() {
    log('\n🔍 === VERIFICACIÓN: Estado actual ===\n', 'cyan');

    const routes = await getRoutes();
    const agendaGroup = routes.find(r => r.title === 'Agenda' && r.type === 'group');

    if (!agendaGroup) {
        log('  ❌ Grupo "Agenda" no encontrado', 'red');
        return false;
    }

    log(`  Grupo: "${agendaGroup.title}" (id: ${agendaGroup.id})`, 'white');
    log(`    schemaUid:     ${agendaGroup.schemaUid || 'NULL ❌'}`, agendaGroup.schemaUid ? 'green' : 'red');

    const pages = routes.filter(r => r.parentId === agendaGroup.id && r.type === 'page');
    let allOk = true;

    for (const page of pages) {
        const hasSchema = !!page.schemaUid;
        const hasMenu = !!page.menuSchemaUid;
        const hasTabs = page.enableTabs !== null;
        const ok = hasSchema && hasMenu && hasTabs;
        if (!ok) allOk = false;

        log(`  "${page.title}":`, 'white');
        log(`    schemaUid:     ${page.schemaUid || 'NULL ❌'}`, hasSchema ? 'green' : 'red');
        log(`    menuSchemaUid: ${page.menuSchemaUid || 'NULL ❌'}`, hasMenu ? 'green' : 'red');
        log(`    enableTabs:    ${page.enableTabs === null ? 'NULL ❌' : page.enableTabs}`, hasTabs ? 'green' : 'red');
    }

    if (allOk) {
        log('\n  ✅ Todas las páginas tienen schemaUid + menuSchemaUid + enableTabs', 'green');
    } else {
        log('\n  ⚠️ Algunas páginas requieren fix', 'yellow');
    }

    return allOk;
}

async function fix() {
    log(`\n🔧 === FIX: Haciendo páginas AGENDA editables ===${DRY_RUN ? ' [DRY RUN]' : ''}\n`, 'cyan');

    const routes = await getRoutes();
    const agendaGroup = routes.find(r => r.title === 'Agenda' && r.type === 'group');

    if (!agendaGroup) {
        log('  ❌ Grupo "Agenda" no encontrado', 'red');
        return;
    }

    // ─── Step 1: Fix Group schemaUid ─────────────────────────────────────
    if (!agendaGroup.schemaUid) {
        log('  📦 Creando schema para el grupo Agenda...', 'white');
        if (!DRY_RUN) {
            // Groups use a simple schema - looking at RECA pattern
            const groupSchema = {
                type: 'void',
                'x-component': 'Menu.SubMenu',
                'x-component-props': {},
            };
            const resp = await client.post('/uiSchemas:insert', groupSchema);
            const respData = (resp as Record<string, unknown>).data as Record<string, unknown>;
            const uid = respData?.['x-uid'] as string;
            if (uid) {
                await client.post(`/desktopRoutes:update?filterByTk=${agendaGroup.id}`, { schemaUid: uid });
                log(`    ✅ Grupo schemaUid: ${uid}`, 'green');
            }
        } else {
            log('    [DRY] crearía schema para grupo', 'gray');
        }
    } else {
        log(`  ✅ Grupo ya tiene schemaUid: ${agendaGroup.schemaUid}`, 'green');
    }

    // ─── Step 2: Fix each page ──────────────────────────────────────────
    const pages = routes.filter(r => r.parentId === agendaGroup.id && r.type === 'page');
    log(`\n  Procesando ${pages.length} páginas...\n`, 'white');

    for (const page of pages) {
        log(`  📄 "${page.title}":`, 'white');

        // 2a. Create menuSchemaUid if missing
        if (!page.menuSchemaUid) {
            log('    📦 Creando menuSchema...', 'white');
            if (!DRY_RUN) {
                const menuSchema = {
                    type: 'void',
                    'x-component': 'Menu.Item',
                    'x-component-props': {},
                    title: page.title,
                };
                const resp = await client.post('/uiSchemas:insert', menuSchema);
                const respData = (resp as Record<string, unknown>).data as Record<string, unknown>;
                const menuUid = respData?.['x-uid'] as string;
                if (menuUid) {
                    await client.post(`/desktopRoutes:update?filterByTk=${page.id}`, { menuSchemaUid: menuUid });
                    log(`      ✅ menuSchemaUid: ${menuUid}`, 'green');
                } else {
                    log(`      ❌ No se generó menuSchemaUid`, 'red');
                }
            } else {
                log('      [DRY] crearía menuSchema', 'gray');
            }
        } else {
            log(`    ✅ Ya tiene menuSchemaUid: ${page.menuSchemaUid}`, 'green');
        }

        // 2b. Set enableTabs if missing
        if (page.enableTabs === null) {
            log('    📦 Seteando enableTabs: false...', 'white');
            if (!DRY_RUN) {
                await client.post(`/desktopRoutes:update?filterByTk=${page.id}`, { enableTabs: false });
                log(`      ✅ enableTabs: false`, 'green');
            } else {
                log('      [DRY] setearía enableTabs: false', 'gray');
            }
        } else {
            log(`    ✅ Ya tiene enableTabs: ${page.enableTabs}`, 'green');
        }

        // 2c. Simplify page schema to match RECA (Page without Grid)
        // RECA schema: { type: 'void', 'x-component': 'Page', 'x-async': false }
        // Our schema has Grid + x-initializer which may cause issues
        if (page.schemaUid) {
            try {
                const schemaResp = await client.get(`/uiSchemas:getJsonSchema/${page.schemaUid}`, {});
                const schema = ((schemaResp as Record<string, unknown>).data || schemaResp) as Record<string, unknown>;

                const hasGrid = schema.properties && typeof schema.properties === 'object';
                const isAsync = schema['x-async'] === true;

                if (hasGrid || isAsync) {
                    log('    📦 Simplificando schema (quitando Grid, x-async → false)...', 'white');
                    if (!DRY_RUN) {
                        // Remove old schema and create a simple one like RECA
                        await client.post(`/uiSchemas:remove/${page.schemaUid}`, {});

                        const simpleSchema = {
                            type: 'void',
                            'x-component': 'Page',
                            'x-async': false,
                        };
                        const resp = await client.post('/uiSchemas:insert', simpleSchema);
                        const respData = (resp as Record<string, unknown>).data as Record<string, unknown>;
                        const newUid = respData?.['x-uid'] as string;
                        if (newUid) {
                            await client.post(`/desktopRoutes:update?filterByTk=${page.id}`, { schemaUid: newUid });
                            log(`      ✅ Schema simplificado: ${page.schemaUid} → ${newUid}`, 'green');
                        }
                    } else {
                        log('      [DRY] simplificaría schema', 'gray');
                    }
                } else {
                    log(`    ✅ Schema ya es simple`, 'green');
                }
            } catch (_e: unknown) {
                log(`    ⚠️ No se pudo inspeccionar schema`, 'yellow');
            }
        }
    }

    log('\n✅ Fix completado. Verifica en el navegador.', 'green');
}

async function main() {
    log('🔧 NocoBase AGENDA Page Editability Fix\n', 'cyan');

    if (VERIFY_ONLY) {
        await verify();
    } else {
        if (DRY_RUN) {
            log('  ⚠️ Modo DRY RUN — no se ejecutarán cambios\n', 'yellow');
        }
        await fix();
        log('\n─── Verificación post-fix ───', 'white');
        await verify();
    }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
