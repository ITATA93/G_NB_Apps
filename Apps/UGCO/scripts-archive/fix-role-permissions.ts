/**
 * fix-role-permissions.ts - Corregir permisos del rol root para ver menú UGCO
 */

import axios from 'axios';

const client = axios.create({
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    headers: {
        'Authorization': 'Bearer ' + (process.env.NOCOBASE_API_KEY || ''),
    },
});

const colors = {
    cyan: (t: string) => `\x1b[36m${t}\x1b[0m`,
    green: (t: string) => `\x1b[32m${t}\x1b[0m`,
    yellow: (t: string) => `\x1b[33m${t}\x1b[0m`,
    red: (t: string) => `\x1b[31m${t}\x1b[0m`,
    gray: (t: string) => `\x1b[90m${t}\x1b[0m`,
};

function log(msg: string, color: keyof typeof colors = 'cyan') {
    console.log(colors[color](msg));
}

async function main() {
    log('╔════════════════════════════════════════════════════════════════════╗');
    log('║  FIX ROLE PERMISSIONS - Habilitar menú UGCO para todos los roles  ║');
    log('╚════════════════════════════════════════════════════════════════════╝');

    const ugcoMenuUid = 'ugco-menu-9nb8qc3jsv';

    // 1. Habilitar allowNewMenu para root
    log('\n1. Habilitando allowNewMenu para rol root...', 'gray');
    try {
        await client.post('/roles:update?filterByTk=root', {
            allowNewMenu: true,
        });
        log('   [OK] allowNewMenu = true', 'green');
    } catch (e: any) {
        log(`   [ERROR] ${e.response?.data?.errors?.[0]?.message || e.message}`, 'red');
    }

    // 2. Asignar menú UGCO a todos los roles
    const roles = ['root', 'admin', 'member'];
    log('\n2. Asignando menú UGCO a todos los roles...', 'gray');

    for (const role of roles) {
        try {
            // Obtener menuUiSchemas actuales
            const res = await client.get(`/roles:get?filterByTk=${role}&appends=menuUiSchemas`);
            const currentMenus = res.data?.data?.menuUiSchemas || [];
            const currentUids = currentMenus.map((m: any) => m['x-uid']);

            // Agregar UGCO si no está
            if (!currentUids.includes(ugcoMenuUid)) {
                currentUids.push(ugcoMenuUid);
            }

            // Actualizar
            await client.post(`/roles:update?filterByTk=${role}`, {
                menuUiSchemas: currentUids,
            });
            log(`   [OK] ${role}: ${currentUids.length} menús`, 'green');
        } catch (e: any) {
            log(`   [ERROR] ${role}: ${e.response?.data?.errors?.[0]?.message || e.message}`, 'red');
        }
    }

    // 3. Obtener todos los UIDs de los sub-menús UGCO
    log('\n3. Obteniendo UIDs de sub-menús UGCO...', 'gray');
    let allUgcoUids: string[] = [ugcoMenuUid];

    try {
        const res = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menu = res.data?.data;
        const ugcoMenu = menu?.properties?.['ruwe8xogqka'];

        if (ugcoMenu?.properties) {
            // Recorrer recursivamente
            function collectUids(obj: any) {
                if (obj['x-uid']) {
                    allUgcoUids.push(obj['x-uid']);
                }
                if (obj.properties) {
                    for (const val of Object.values(obj.properties)) {
                        collectUids(val);
                    }
                }
            }
            collectUids(ugcoMenu);
        }
        log(`   [OK] Encontrados ${allUgcoUids.length} UIDs`, 'green');
    } catch (e: any) {
        log(`   [ERROR] ${e.message}`, 'red');
    }

    // 4. Asignar TODOS los UIDs al rol root
    log('\n4. Asignando todos los UIDs al rol root...', 'gray');
    try {
        await client.post('/roles:update?filterByTk=root', {
            menuUiSchemas: allUgcoUids,
        });
        log(`   [OK] ${allUgcoUids.length} UIDs asignados`, 'green');
    } catch (e: any) {
        log(`   [ERROR] ${e.response?.data?.errors?.[0]?.message || e.message}`, 'red');
    }

    // 5. Verificar resultado
    log('\n5. Verificando resultado...', 'gray');
    try {
        const res = await client.get('/roles:get?filterByTk=root&appends=menuUiSchemas');
        const role = res.data?.data;
        log(`   allowNewMenu: ${role?.allowNewMenu}`, 'green');
        log(`   menuUiSchemas: ${role?.menuUiSchemas?.length || 0} asignados`, 'green');
    } catch (e: any) {
        log(`   Error: ${e.message}`, 'red');
    }

    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('  Ahora:', 'yellow');
    log('  1. Cierra completamente el navegador', 'gray');
    log('  2. Abre una ventana de incógnito', 'gray');
    log('  3. Ve a https://mira.hospitaldeovalle.cl', 'gray');
    log('  4. Inicia sesión como Matias', 'gray');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
}

main().catch(console.error);
