/**
 * check-acl.ts - Verificar permisos ACL del menú UGCO
 */

import axios from 'axios';

const client = axios.create({
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    headers: {
        'Authorization': 'Bearer ' + (process.env.NOCOBASE_API_KEY || ''),
    },
});

async function main() {
    console.log('=== PERMISOS DE MENÚ POR ROL ===\n');

    const roles = ['root', 'admin', 'member'];

    for (const role of roles) {
        try {
            const res = await client.get(`/roles:get?filterByTk=${role}&appends=menuUiSchemas`);
            const data = res.data?.data;
            const menus = data?.menuUiSchemas || [];
            console.log(`${role}: ${menus.length} menús asignados`);
            for (const m of menus) {
                console.log(`  - ${m['x-uid'] || m.uid}: ${m.title || 'sin título'}`);
            }
        } catch (e: any) {
            console.log(`${role}: error - ${e.message}`);
        }
    }

    console.log('\n=== MENÚ ADMIN ACTUAL ===\n');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menu = res.data?.data;
        const props = menu?.properties || {};

        console.log('Items en menú principal:', Object.keys(props).length);
        for (const [key, val] of Object.entries(props) as any) {
            console.log(`  - ${val.title || key} (${val['x-uid']})`);

            // Sub-items
            if (val.properties) {
                for (const [subKey, subVal] of Object.entries(val.properties) as any) {
                    console.log(`      - ${subVal.title || subKey}`);
                }
            }
        }
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // Verificar snippets del rol root
    console.log('\n=== SNIPPETS ROL ROOT ===\n');
    try {
        const res = await client.get('/roles:get?filterByTk=root');
        const role = res.data?.data;
        console.log('snippets:', role?.snippets?.join(', '));
        console.log('allowConfigure:', role?.allowConfigure);
        console.log('allowNewMenu:', role?.allowNewMenu);
    } catch (e: any) {
        console.log('Error:', e.message);
    }
}

main().catch(console.error);
