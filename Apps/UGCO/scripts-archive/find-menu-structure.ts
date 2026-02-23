/**
 * find-menu-structure.ts - Encontrar estructura real del menú
 */

import axios from 'axios';

const client = axios.create({
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    headers: {
        'Authorization': 'Bearer ' + (process.env.NOCOBASE_API_KEY || ''),
    },
});

async function main() {
    console.log('=== BUSCANDO ESTRUCTURA DEL MENÚ ===\n');

    // 1. Obtener el schema completo del menú admin con todos los hijos
    console.log('1. Obteniendo menú completo con getJsonSchema...');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menu = res.data?.data;

        // Función recursiva para mostrar estructura
        function showStructure(obj: any, indent = 0) {
            const prefix = '  '.repeat(indent);
            const uid = obj['x-uid'] || '?';
            const title = obj.title || '';
            const component = obj['x-component'] || '';

            console.log(`${prefix}- [${uid}] ${title || component}`);

            if (obj.properties) {
                for (const [key, val] of Object.entries(obj.properties)) {
                    showStructure(val, indent + 1);
                }
            }
        }

        console.log('\nEstructura del menú:');
        showStructure(menu);
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 2. Buscar todos los schemas que son Menu.Item o Menu.SubMenu
    console.log('\n\n2. Buscando Menu.Item y Menu.SubMenu en todos los schemas...');
    try {
        const res = await client.get('/uiSchemas:list?pageSize=500');
        const schemas = res.data?.data || [];

        const menuItems = schemas.filter((s: any) => {
            const component = s['x-component'] || '';
            return component.includes('Menu.');
        });

        console.log(`Encontrados ${menuItems.length} items de menú:`);
        for (const item of menuItems) {
            console.log(`  - ${item['x-uid']}: ${item.title || '(sin título)'} [${item['x-component']}]`);
        }
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 3. Ver si hay un schema específico para el menú top
    console.log('\n\n3. Buscando schemas con "top" o "header"...');
    try {
        const res = await client.get('/uiSchemas:list?pageSize=500');
        const schemas = res.data?.data || [];

        const topSchemas = schemas.filter((s: any) => {
            const uid = (s['x-uid'] || '').toLowerCase();
            const name = (s.name || '').toLowerCase();
            return uid.includes('top') || uid.includes('header') || name.includes('top') || name.includes('header');
        });

        console.log(`Encontrados ${topSchemas.length} schemas relacionados:`);
        for (const s of topSchemas) {
            console.log(`  - ${s['x-uid']}: ${s.title || s.name || '(sin título)'}`);
        }
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 4. Buscar dónde está INICIO conectado
    console.log('\n\n4. Buscando conexión de INICIO...');
    try {
        // Buscar en el menú admin si hay referencia a INICIO
        const res = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menu = res.data?.data;

        function findInicio(obj: any, path = ''): string | null {
            if (obj['x-uid'] === '1o5y8dftms0' || obj.title === 'INICIO') {
                return path;
            }
            if (obj.properties) {
                for (const [key, val] of Object.entries(obj.properties)) {
                    const result = findInicio(val as any, `${path}/${key}`);
                    if (result) return result;
                }
            }
            return null;
        }

        const inicioPath = findInicio(menu);
        console.log(`INICIO path: ${inicioPath || 'No encontrado en menú admin'}`);
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // 5. Ver qué páginas están en el menú actual
    console.log('\n\n5. Páginas dentro del menú admin...');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
        const menu = res.data?.data;

        function findPages(obj: any, results: any[] = []) {
            if (obj['x-component'] === 'Page') {
                results.push({
                    uid: obj['x-uid'],
                    title: obj.title,
                });
            }
            if (obj.properties) {
                for (const val of Object.values(obj.properties)) {
                    findPages(val, results);
                }
            }
            return results;
        }

        const pages = findPages(menu);
        console.log(`Páginas encontradas: ${pages.length}`);
        for (const p of pages) {
            console.log(`  - ${p.uid}: ${p.title || '(sin título)'}`);
        }
    } catch (e: any) {
        console.log('Error:', e.message);
    }
}

main().catch(console.error);
