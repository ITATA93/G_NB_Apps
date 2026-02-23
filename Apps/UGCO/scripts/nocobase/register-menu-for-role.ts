/**
 * register-menu-for-role.ts - Registrar menú UGCO para el rol root
 */

import axios from 'axios';

const MIRA_CONFIG = {
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    apiKey: process.env.NOCOBASE_API_KEY || '',
};

const colors = {
    cyan: (t: string) => `\x1b[36m${t}\x1b[0m`,
    green: (t: string) => `\x1b[32m${t}\x1b[0m`,
    yellow: (t: string) => `\x1b[33m${t}\x1b[0m`,
    red: (t: string) => `\x1b[31m${t}\x1b[0m`,
    gray: (t: string) => `\x1b[90m${t}\x1b[0m`,
    white: (t: string) => `\x1b[37m${t}\x1b[0m`,
};

function log(msg: string, color: keyof typeof colors = 'white') {
    console.log(colors[color](msg));
}

async function main() {
    log('╔════════════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  REGISTER MENU FOR ROLE - Registrar menú para rol root            ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════════════╝', 'cyan');

    const client = axios.create({
        baseURL: MIRA_CONFIG.baseURL,
        headers: {
            'Authorization': `Bearer ${MIRA_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
        },
    });

    // 1. Obtener el UID del menú UGCO
    log('\n  Obteniendo UID del menú UGCO...', 'gray');
    let ugcoMenuUid: string | null = null;

    try {
        const res = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menu = res.data?.data;
        const props = menu?.properties || {};

        for (const [key, value] of Object.entries(props) as any) {
            if (value.title?.includes('UGCO')) {
                ugcoMenuUid = value['x-uid'];
                log(`  [OK] Encontrado: ${ugcoMenuUid}`, 'green');
                break;
            }
        }

        if (!ugcoMenuUid) {
            log('  [ERROR] No se encontró el menú UGCO', 'red');
            return;
        }
    } catch (e: any) {
        log(`  [ERROR] ${e.message}`, 'red');
        return;
    }

    // 2. Ver qué endpoints de roles/permisos están disponibles
    log('\n  Explorando API de roles...', 'gray');

    const endpoints = [
        { method: 'get', url: '/roles:get?filterByTk=root' },
        { method: 'get', url: '/rolesResourcesScopes:list' },
        { method: 'get', url: '/uiSchemaRoles:list' },
        { method: 'get', url: '/roles:list?appends=menuUiSchemas' },
    ];

    for (const ep of endpoints) {
        try {
            const res = await client.get(ep.url);
            log(`  [OK] ${ep.url}`, 'green');
            if (ep.url.includes('roles:get')) {
                const role = res.data?.data;
                log(`       snippets: ${role?.snippets?.join(', ') || 'ninguno'}`, 'gray');
                log(`       strategy: ${JSON.stringify(role?.strategy) || 'ninguno'}`, 'gray');
            }
        } catch (e: any) {
            log(`  [--] ${ep.url}: ${e.response?.status}`, 'yellow');
        }
    }

    // 3. Intentar asignar el menú al rol root
    log('\n  Asignando menú UGCO al rol root...', 'white');

    // Método 1: Usando roles:update con menuUiSchemas
    try {
        await client.post('/roles:update?filterByTk=root', {
            menuUiSchemas: [ugcoMenuUid],
        });
        log('  [OK] Método 1: roles:update', 'green');
    } catch (e: any) {
        log(`  [--] Método 1 falló: ${e.response?.data?.errors?.[0]?.message || e.message}`, 'yellow');
    }

    // Método 2: Usando roles:setMenuUiSchemas
    try {
        await client.post(`/roles:setMenuUiSchemas?filterByTk=root`, {
            values: [ugcoMenuUid],
        });
        log('  [OK] Método 2: roles:setMenuUiSchemas', 'green');
    } catch (e: any) {
        log(`  [--] Método 2 falló: ${e.response?.data?.errors?.[0]?.message || e.message}`, 'yellow');
    }

    // Método 3: Usando ACL directamente
    try {
        await client.post('/acl:setMenuUiSchemas', {
            role: 'root',
            values: [ugcoMenuUid],
        });
        log('  [OK] Método 3: acl:setMenuUiSchemas', 'green');
    } catch (e: any) {
        log(`  [--] Método 3 falló: ${e.response?.data?.errors?.[0]?.message || e.message}`, 'yellow');
    }

    // Método 4: Ver tabla de relación roles_uiSchemas
    try {
        const res = await client.get('/rolesUiSchemas:list');
        log('  [OK] Tabla rolesUiSchemas existe', 'green');
        log(`       Registros: ${res.data?.data?.length || 0}`, 'gray');
    } catch (e: any) {
        log(`  [--] rolesUiSchemas: ${e.response?.status}`, 'yellow');
    }

    // 4. Verificar el resultado
    log('\n  Verificando asignación...', 'gray');
    try {
        const res = await client.get('/roles:get?filterByTk=root&appends=menuUiSchemas');
        const role = res.data?.data;
        log(`  menuUiSchemas: ${role?.menuUiSchemas?.length || 0}`, 'white');
    } catch (e: any) {
        log(`  Error: ${e.message}`, 'red');
    }

    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'white');
    log('  Si el menú no aparece, prueba:', 'yellow');
    log('  1. Limpiar caché del navegador (Ctrl+Shift+Del)', 'white');
    log('  2. Cerrar sesión y volver a entrar', 'white');
    log('  3. Ir a Settings > Roles & Permissions > root > Menu', 'white');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'white');
}

main().catch(console.error);
