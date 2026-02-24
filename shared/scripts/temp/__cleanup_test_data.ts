/**
 * Cleanup orphaned test data from CRUD round-trip tests
 */
import { createClient, log } from '../ApiClient';

const client = createClient();

async function main() {
    log('=== CLEANUP: Datos huerfanos del test ===\n', 'cyan');

    // 1. Delete test user (ID 6)
    log('1. DELETE user test_agent@test.local (ID 6)...', 'white');
    try {
        await client.post('/users:destroy?filterByTk=6', {});
        log('   OK', 'green');
    } catch (err: unknown) {
        log('   ' + (err instanceof Error ? err.message : String(err)), 'yellow');
    }

    // 2. Delete test role
    log('2. DELETE role __test_role...', 'white');
    try {
        await client.post('/roles:destroy?filterByTk=__test_role', {});
        log('   OK', 'green');
    } catch (err: unknown) {
        log('   ' + (err instanceof Error ? err.message : String(err)), 'yellow');
    }

    // 3. Delete test record in et_turnos
    log('3. DELETE test record in et_turnos...', 'white');
    try {
        const res = await client.get('/et_turnos:list', {
            filter: { turno: 'NOCTURNO_TEST' }
        });
        const records = res.data || [];
        for (const r of records) {
            await client.post(`/et_turnos:destroy?filterByTk=${r.id}`, {});
            log('   Deleted record ID: ' + r.id, 'green');
        }
        if (records.length === 0) log('   No test records found', 'yellow');
    } catch (err: unknown) {
        log('   ' + (err instanceof Error ? err.message : String(err)), 'yellow');
    }

    // 4. Delete visual test route
    log('4. DELETE visual test route (TEST_VISUAL_CHECK)...', 'white');
    try {
        const res = await client.get('/desktopRoutes:list', {
            filter: { title: 'TEST_VISUAL_CHECK' }
        });
        const routes = res.data || [];
        for (const r of routes) {
            await client.post(`/desktopRoutes:destroy?filterByTk=${r.id}`, {});
            log('   Deleted route ID: ' + r.id, 'green');
        }
        if (routes.length === 0) log('   No test routes found', 'yellow');
    } catch (err: unknown) {
        log('   ' + (err instanceof Error ? err.message : String(err)), 'yellow');
    }

    // 5. Cleanup leftover AUTO_TEST departments
    log('5. DELETE leftover AUTO_TEST departments...', 'white');
    try {
        const res = await client.get('/departments:list', { pageSize: 200 });
        const depts = (res.data || []).filter((d: Record<string, unknown>) =>
            String(d.title || '').startsWith('AUTO_TEST')
        );
        for (const d of depts) {
            await client.post(`/departments:destroy?filterByTk=${d.id}`, {});
            log('   Deleted dept: ' + d.title, 'green');
        }
        if (depts.length === 0) log('   No test departments found', 'yellow');
    } catch (err: unknown) {
        log('   ' + (err instanceof Error ? err.message : String(err)), 'yellow');
    }

    log('\n=== CLEANUP COMPLETE ===', 'cyan');
}

main().catch(err => {
    log('FATAL: ' + (err instanceof Error ? err.message : String(err)), 'red');
});
