/**
 * deep-menu-compare.ts - Comparar estructura de menú completa
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const client = axios.create({
    baseURL: process.env.NOCOBASE_BASE_URL,
    headers: {
        'Authorization': `Bearer ${process.env.NOCOBASE_API_KEY}`,
        'Content-Type': 'application/json',
    },
});

async function main() {
    console.log('=== COMPARACIÓN PROFUNDA DE MENÚ ===\n');

    // 1. Ver estructura completa del menú UGCO
    console.log('1. Estructura del menú UGCO...\n');
    const menuRes = await client.get('/uiSchemas:getProperties/nocobase-admin-menu');
    const menu = menuRes.data?.data;

    // UGCO
    const ugco = menu?.properties?.im75usfnpl5;
    console.log('UGCO x-uid:', ugco?.['x-uid']);
    console.log('UGCO x-component:', ugco?.['x-component']);

    // Especialidades dentro de UGCO
    if (ugco?.properties) {
        console.log('\nItems en UGCO:');
        for (const [key, value] of Object.entries(ugco.properties)) {
            const item = value as any;
            console.log(`  ${key}:`);
            console.log(`    title: ${item?.title}`);
            console.log(`    x-uid: ${item?.['x-uid']}`);
            console.log(`    x-component: ${item?.['x-component']}`);

            // Si es Especialidades, ver sus hijos
            if (item?.title?.includes('Especialidades') && item?.properties) {
                console.log('    HIJOS de Especialidades:');
                for (const [subKey, subValue] of Object.entries(item.properties)) {
                    const subItem = subValue as any;
                    console.log(`      ${subKey}:`);
                    console.log(`        title: ${subItem?.title}`);
                    console.log(`        x-uid: ${subItem?.['x-uid']}`);
                    console.log(`        x-component: ${subItem?.['x-component']}`);
                }
            }
        }
    }

    // 2. Comparar menuSchemaUid de "a" vs Digestivo
    console.log('\n\n2. Comparando menuSchemaUid...\n');

    // Página "a"
    const aRouteRes = await client.get('/desktopRoutes:list', {
        params: { filter: { schemaUid: '0h2vgqaifns' } }
    });
    const aRoute = aRouteRes.data?.data?.[0];
    console.log('Página "a":');
    console.log('  menuSchemaUid:', aRoute?.menuSchemaUid);

    // Verificar si menuSchemaUid de "a" está en el menú
    if (aRoute?.menuSchemaUid) {
        const aMenuPaths = await client.get('/uiSchemaTreePath:list', {
            params: { filter: { descendant: aRoute.menuSchemaUid } }
        });
        console.log('  Tree paths de menuSchemaUid:');
        for (const p of aMenuPaths.data?.data || []) {
            console.log(`    ancestor: ${p.ancestor}, depth: ${p.depth}`);
        }
    }

    // Digestivo
    const digRouteRes = await client.get('/desktopRoutes:list', {
        params: { filter: { schemaUid: '6ch1d2z4fz6' } }
    });
    const digRoute = digRouteRes.data?.data?.[0];
    console.log('\nDigestivo Alto:');
    console.log('  menuSchemaUid:', digRoute?.menuSchemaUid);

    if (digRoute?.menuSchemaUid) {
        const digMenuPaths = await client.get('/uiSchemaTreePath:list', {
            params: { filter: { descendant: digRoute.menuSchemaUid } }
        });
        console.log('  Tree paths de menuSchemaUid:');
        for (const p of digMenuPaths.data?.data || []) {
            console.log(`    ancestor: ${p.ancestor}, depth: ${p.depth}`);
        }
    }

    // 3. Ver si el menuSchemaUid de "a" está en la estructura del menú
    console.log('\n\n3. Buscando menuSchemaUid en estructura del menú...\n');

    function findInMenu(obj: any, targetUid: string, path: string = ''): string | null {
        if (!obj) return null;
        if (obj['x-uid'] === targetUid) return path;
        if (obj.properties) {
            for (const [key, value] of Object.entries(obj.properties)) {
                const result = findInMenu(value, targetUid, `${path}.${key}`);
                if (result) return result;
            }
        }
        return null;
    }

    const aMenuPath = findInMenu(menu, aRoute?.menuSchemaUid || '', 'menu');
    console.log('Ubicación de menuSchemaUid de "a":', aMenuPath || 'NO ENCONTRADO');

    const digMenuPath = findInMenu(menu, digRoute?.menuSchemaUid || '', 'menu');
    console.log('Ubicación de menuSchemaUid de Digestivo:', digMenuPath || 'NO ENCONTRADO');

    // 4. Obtener el schema completo del menuSchemaUid de "a"
    if (aRoute?.menuSchemaUid) {
        console.log('\n\n4. Schema del menuSchemaUid de "a"...\n');
        try {
            const menuSchemaRes = await client.get(`/uiSchemas:getJsonSchema/${aRoute.menuSchemaUid}`);
            console.log(JSON.stringify(menuSchemaRes.data?.data, null, 2));
        } catch (e: any) {
            console.log('Error:', e.message);
        }
    }
}

main().catch(e => console.error('Error:', e.message));
