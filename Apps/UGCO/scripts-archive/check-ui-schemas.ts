/**
 * check-ui-schemas.ts - Verificar schemas UI en NocoBase
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

    console.log('Verificando schemas UI en NocoBase...\n');

    // 1. Verificar conexión
    try {
        await client.get('/app:getLang');
        console.log('[OK] Conexión establecida\n');
    } catch (e: any) {
        console.log('[ERROR] No se puede conectar:', e.message);
        return;
    }

    // 2. Listar endpoints disponibles de UI
    const endpoints = [
        '/uiSchemas:list',
        '/uiSchemas:getJsonSchema/nocobase-admin-menu',
        '/routes:list',
        '/systemSettings:get',
    ];

    for (const endpoint of endpoints) {
        try {
            const res = await client.get(endpoint);
            console.log(`[OK] ${endpoint}`);
            if (res.data?.data) {
                console.log(`    Registros: ${Array.isArray(res.data.data) ? res.data.data.length : 'objeto'}`);
            }
        } catch (e: any) {
            console.log(`[--] ${endpoint}: ${e.response?.status || e.message}`);
        }
    }

    // 3. Buscar schemas UGCO
    console.log('\n--- Buscando schemas UGCO ---\n');

    const ugcoSchemas = [
        'ugco-root-menu',
        'ugco-page-dashboard',
        'ugco-table-casos-mama',
    ];

    for (const uid of ugcoSchemas) {
        try {
            const res = await client.get(`/uiSchemas:getJsonSchema/${uid}`);
            console.log(`[EXISTE] ${uid}`);
        } catch (e: any) {
            console.log(`[NO EXISTE] ${uid}: ${e.response?.status}`);
        }
    }

    // 4. Ver cómo se crean páginas en NocoBase
    console.log('\n--- Verificando método de creación de páginas ---\n');

    // Obtener el schema del menú admin
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const schema = res.data?.data;
        if (schema) {
            console.log('Menu admin encontrado');
            console.log('Propiedades:', Object.keys(schema.properties || {}).slice(0, 10).join(', '));
        }
    } catch (e: any) {
        console.log('No se pudo obtener menu admin:', e.response?.status);
    }

    // 5. Ver rutas existentes
    console.log('\n--- Rutas existentes ---\n');
    try {
        const res = await client.get('/routes:list?pageSize=100');
        const routes = res.data?.data || [];
        console.log(`Total rutas: ${routes.length}`);

        // Mostrar primeras 10 rutas
        routes.slice(0, 10).forEach((r: any) => {
            console.log(`  - ${r.path || r.title || r.id}`);
        });
    } catch (e: any) {
        console.log('Error obteniendo rutas:', e.response?.data?.errors?.[0]?.message || e.message);
    }
}

main().catch(console.error);
