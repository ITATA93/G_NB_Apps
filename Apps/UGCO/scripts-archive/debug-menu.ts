/**
 * debug-menu.ts - Debug del menú de NocoBase
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

    console.log('=== DEBUG MENU NOCOBASE ===\n');

    // 1. Ver menú admin
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menu = res.data?.data;

        console.log('Menu admin x-uid:', menu?.['x-uid']);
        console.log('Menu admin component:', menu?.['x-component']);

        const props = menu?.properties || {};
        const keys = Object.keys(props);
        console.log('\nItems en el menú:', keys.length);

        for (const key of keys) {
            const item = props[key];
            console.log(`\n  [${key}]`);
            console.log(`    title: ${item?.title || '(sin título)'}`);
            console.log(`    x-uid: ${item?.['x-uid']}`);
            console.log(`    component: ${item?.['x-component']}`);

            // Sub-items
            const subProps = item?.properties || {};
            const subKeys = Object.keys(subProps);
            if (subKeys.length > 0) {
                console.log(`    sub-items: ${subKeys.length}`);
            }
        }
    } catch (e: any) {
        console.log('Error obteniendo menú admin:', e.response?.data?.errors?.[0]?.message || e.message);
    }

    // 2. Listar todos los uiSchemas
    console.log('\n\n=== TODOS LOS UI SCHEMAS ===\n');
    try {
        const res = await client.get('/uiSchemas:list?pageSize=50');
        const schemas = res.data?.data || [];

        console.log('Total schemas:', schemas.length);

        for (const schema of schemas) {
            const uid = schema['x-uid'] || schema.uid || schema.name;
            const title = schema.title || '';
            console.log(`  - ${uid} ${title ? `(${title})` : ''}`);
        }
    } catch (e: any) {
        console.log('Error listando schemas:', e.response?.data?.errors?.[0]?.message || e.message);
    }

    // 3. Ver cómo se obtiene el menú del usuario
    console.log('\n\n=== MENU DEL USUARIO ===\n');
    try {
        // Intentar diferentes endpoints
        const endpoints = [
            '/users:check',
            '/app:getInfo',
            '/applicationPlugins:list',
        ];

        for (const ep of endpoints) {
            try {
                const res = await client.get(ep);
                console.log(`${ep}: OK`);
                if (res.data?.data?.options?.adminSchemaUid) {
                    console.log('  adminSchemaUid:', res.data.data.options.adminSchemaUid);
                }
            } catch (e: any) {
                console.log(`${ep}: ${e.response?.status || e.message}`);
            }
        }
    } catch (e: any) {
        console.log('Error:', e.message);
    }
}

main().catch(console.error);
