/**
 * find-tabs-structure.ts - Encontrar estructura de pestañas donde está INICIO
 */

import axios from 'axios';

const client = axios.create({
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    headers: {
        'Authorization': 'Bearer ' + (process.env.NOCOBASE_API_KEY || ''),
    },
});

async function main() {
    console.log('=== BUSCANDO ESTRUCTURA DE PESTAÑAS ===\n');

    // 1. Obtener TODOS los schemas y buscar cuál contiene a INICIO (1o5y8dftms0)
    console.log('1. Buscando parent de INICIO...');

    try {
        const res = await client.get('/uiSchemas:list?pageSize=1000');
        const schemas = res.data?.data || [];

        console.log(`   Total schemas: ${schemas.length}`);

        // Para cada schema, obtener su estructura completa y buscar si contiene INICIO
        const candidates = schemas.filter((s: any) => {
            const component = s['x-component'] || '';
            // Buscar contenedores que podrían tener páginas como hijos
            return component === 'Menu' ||
                component.includes('Tabs') ||
                component === 'Layout' ||
                component === 'Routes' ||
                component === 'Admin';
        });

        console.log(`   Candidatos a contenedor: ${candidates.length}`);
        for (const c of candidates) {
            console.log(`     - ${c['x-uid']}: ${c['x-component']}`);
        }
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }

    // 2. Obtener el schema completo del admin-menu y ver TODA su estructura
    console.log('\n2. Estructura COMPLETA del nocobase-admin-menu...');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menu = res.data?.data;

        // Buscar recursivamente
        function findInSchema(obj: any, target: string, path = ''): string | null {
            if (!obj) return null;

            const uid = obj['x-uid'] || '';
            const currentPath = path + '/' + (obj.name || uid || 'unknown');

            if (uid === target || obj.title === 'INICIO') {
                return currentPath;
            }

            if (obj.properties) {
                for (const [key, val] of Object.entries(obj.properties)) {
                    const result = findInSchema(val, target, currentPath);
                    if (result) return result;
                }
            }

            return null;
        }

        const path = findInSchema(menu, '1o5y8dftms0');
        console.log(`   INICIO en admin-menu: ${path || 'NO ENCONTRADO'}`);
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }

    // 3. Buscar schemas que contengan "1o5y8dftms0" en su JSON
    console.log('\n3. Buscando en routes y páginas del sistema...');
    try {
        // Intentar obtener routes
        const endpoints = [
            '/uiRoutes:list',
            '/pages:list',
            '/menus:list',
            '/systemSettings:get',
        ];

        for (const ep of endpoints) {
            try {
                const res = await client.get(ep);
                console.log(`   [OK] ${ep} - ${res.data?.data?.length || 'obj'}`);
            } catch (e: any) {
                console.log(`   [--] ${ep}: ${e.response?.status}`);
            }
        }
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }

    // 4. Obtener schema de desktop
    console.log('\n4. Buscando schemas de desktop/layout...');
    const desktopIds = [
        'nocobase-admin',
        'nocobase-desktop',
        'admin',
        'desktop',
        'root',
        'layout',
    ];

    for (const id of desktopIds) {
        try {
            const res = await client.get(`/uiSchemas:getJsonSchema/${id}`);
            const schema = res.data?.data;
            console.log(`   [OK] ${id}: ${schema['x-component'] || schema.title}`);
        } catch (e: any) {
            // No mostrar errores 404
        }
    }

    // 5. Obtener el schema del tab de INICIO directamente y ver sus propiedades
    console.log('\n5. Schema detallado de INICIO...');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/1o5y8dftms0');
        const inicio = res.data?.data;
        console.log(JSON.stringify(inicio, null, 2).slice(0, 1500));
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }

    // 6. Buscar en ancestros
    console.log('\n6. Buscando ancestros de INICIO...');
    try {
        const res = await client.get('/uiSchemas:getAncestors/1o5y8dftms0');
        const ancestors = res.data?.data || [];
        console.log(`   Ancestros: ${ancestors.length}`);
        for (const a of ancestors) {
            console.log(`     - ${a['x-uid']}: ${a.title || a['x-component']}`);
        }
    } catch (e: any) {
        console.log(`   Error: ${e.response?.status} - quizás endpoint no existe`);
    }
}

main().catch(console.error);
