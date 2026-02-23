/**
 * inspect-existing-pages.ts - Inspeccionar páginas existentes en NocoBase
 */

import axios from 'axios';

const MIRA_CONFIG = {
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    apiKey: (process.env.NOCOBASE_API_KEY || ''),
};

async function main() {
    const client = axios.create({
        baseURL: MIRA_CONFIG.baseURL,
        headers: {
            'Authorization': `Bearer ${MIRA_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
        },
    });

    console.log('=== INSPECCIONANDO PÁGINAS EXISTENTES ===\n');

    // Ver la página INICIO que ya existe
    console.log('1. Página INICIO (1o5y8dftms0):');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/1o5y8dftms0');
        const schema = res.data?.data;
        console.log(JSON.stringify(schema, null, 2).slice(0, 2000));
    } catch (e: any) {
        console.log('Error:', e.response?.status);
    }

    // Ver estructura completa del menú admin
    console.log('\n\n2. Menú admin completo:');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menu = res.data?.data;

        // Mostrar estructura del menú
        console.log('Root menu:');
        console.log('  x-uid:', menu['x-uid']);
        console.log('  x-component:', menu['x-component']);

        const props = menu.properties || {};
        console.log('\nItems del menú:');

        for (const [key, value] of Object.entries(props) as any) {
            console.log(`\n  === ${key} ===`);
            console.log(`  title: ${value.title}`);
            console.log(`  x-uid: ${value['x-uid']}`);
            console.log(`  x-component: ${value['x-component']}`);
            console.log(`  x-decorator: ${value['x-decorator']}`);

            // Ver sub-properties
            if (value.properties) {
                console.log(`  properties: ${Object.keys(value.properties).length} items`);
                for (const [subKey, subValue] of Object.entries(value.properties) as any) {
                    console.log(`    - ${subKey}: ${subValue.title || subValue['x-component']}`);
                }
            }
        }
    } catch (e: any) {
        console.log('Error:', e.response?.data?.errors?.[0]?.message || e.message);
    }

    // 3. Verificar ACL/permisos del menú
    console.log('\n\n3. Verificando roles y permisos:');
    try {
        const res = await client.get('/roles:list');
        const roles = res.data?.data || [];
        console.log('Roles disponibles:');
        for (const role of roles) {
            console.log(`  - ${role.name}: ${role.title}`);
        }
    } catch (e: any) {
        console.log('Error:', e.response?.status);
    }

    // 4. Ver menuUiSchemas (si existe)
    console.log('\n\n4. Verificando menuUiSchemas:');
    try {
        const res = await client.get('/roles:get?filterByTk=root&appends=menuUiSchemas');
        const role = res.data?.data;
        console.log('Role root menuUiSchemas:', role?.menuUiSchemas?.length || 0);
        if (role?.menuUiSchemas) {
            for (const schema of role.menuUiSchemas.slice(0, 10)) {
                console.log(`  - ${schema['x-uid']}: ${schema.title || '(sin título)'}`);
            }
        }
    } catch (e: any) {
        console.log('Error:', e.response?.data?.errors?.[0]?.message || e.message);
    }
}

main().catch(console.error);
