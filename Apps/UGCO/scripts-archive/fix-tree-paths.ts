/**
 * fix-tree-paths.ts - Investigar y reparar tree paths de schemas
 *
 * La tabla uiSchemaTreePath contiene la relación jerárquica de schemas.
 * Si un schema no está conectado aquí, NocoBase no lo renderiza.
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

// UIDs de schemas conocidos
const DASHBOARD_UID = 'xikvv7wkefy';  // Dashboard (debería funcionar)
const DIGESTIVO_UID = 'y9z8atdl8r';   // Digestivo Alto (no funciona)

async function main() {
    console.log('=== INVESTIGANDO TREE PATHS ===\n');

    // 1. Obtener todos los tree paths
    console.log('1. Obteniendo todos los tree paths...');
    try {
        const res = await client.get('/uiSchemaTreePath:list', { params: { pageSize: 500 } });
        const paths = res.data?.data || [];
        console.log(`   Total paths: ${paths.length}`);

        // Buscar el Dashboard
        const dashboardPaths = paths.filter((p: any) =>
            p.ancestor === DASHBOARD_UID || p.descendant === DASHBOARD_UID
        );
        console.log(`\n   Paths del Dashboard (${DASHBOARD_UID}):`);
        for (const p of dashboardPaths) {
            console.log(`     ancestor: ${p.ancestor}, descendant: ${p.descendant}, depth: ${p.depth}, type: ${p.type}`);
        }

        // Buscar Digestivo Alto
        const digestivoPaths = paths.filter((p: any) =>
            p.ancestor === DIGESTIVO_UID || p.descendant === DIGESTIVO_UID
        );
        console.log(`\n   Paths de Digestivo Alto (${DIGESTIVO_UID}):`);
        if (digestivoPaths.length === 0) {
            console.log('     ❌ NO HAY PATHS - Este es el problema!');
        } else {
            for (const p of digestivoPaths) {
                console.log(`     ancestor: ${p.ancestor}, descendant: ${p.descendant}, depth: ${p.depth}`);
            }
        }

        // Buscar paths de nocobase-admin-menu
        const menuPaths = paths.filter((p: any) =>
            p.ancestor === 'nocobase-admin-menu' || p.descendant === 'nocobase-admin-menu'
        );
        console.log(`\n   Paths del menú principal (nocobase-admin-menu):`);
        console.log(`     Total: ${menuPaths.length}`);

        // Ver la estructura del árbol del Dashboard
        console.log('\n2. Analizando estructura del Dashboard...');
        const dashboardAncestors = paths.filter((p: any) => p.descendant === DASHBOARD_UID);
        console.log('   Ancestros del Dashboard:');
        for (const p of dashboardAncestors) {
            console.log(`     - ${p.ancestor} (depth: ${p.depth}, type: ${p.type})`);
        }

    } catch (e: any) {
        console.log('   Error:', e.response?.data || e.message);
    }

    // 2. Verificar si podemos crear tree paths manualmente
    console.log('\n3. Verificando endpoints de tree path...');
    try {
        // Intentar crear un path
        const res = await client.post('/uiSchemaTreePath:create', {
            ancestor: DIGESTIVO_UID,
            descendant: DIGESTIVO_UID,
            depth: 0,
            async: true,
            type: null,
            sort: null
        });
        console.log('   Create response:', res.status);
        console.log('   Data:', JSON.stringify(res.data).substring(0, 200));
    } catch (e: any) {
        console.log('   Error create:', e.response?.data?.errors?.[0]?.message || e.message);
    }

    // 3. Ver qué campos tiene un tree path
    console.log('\n4. Estructura de un tree path...');
    try {
        const res = await client.get('/uiSchemaTreePath:list', { params: { pageSize: 1 } });
        const path = res.data?.data?.[0];
        if (path) {
            console.log('   Campos:', Object.keys(path).join(', '));
            console.log('   Ejemplo:', JSON.stringify(path, null, 2));
        }
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 4. Buscar schema root que conecte con las páginas
    console.log('\n5. Buscando conexión entre menú y páginas...');
    try {
        const res = await client.get('/uiSchemaTreePath:list', { params: { pageSize: 1000 } });
        const paths = res.data?.data || [];

        // Encontrar todos los descendientes directos del menú
        const menuDescendants = paths.filter((p: any) =>
            p.ancestor === 'nocobase-admin-menu' && p.depth === 1
        );
        console.log('   Descendientes directos del menú:', menuDescendants.length);
        for (const p of menuDescendants.slice(0, 5)) {
            console.log(`     - ${p.descendant}`);
        }

        // Ver si algún schema de página está conectado al menú
        const pageSchemas = ['xikvv7wkefy', 'y9z8atdl8r', 'nocobase-page-root'];
        for (const uid of pageSchemas) {
            const connected = paths.some((p: any) =>
                p.ancestor === 'nocobase-admin-menu' && p.descendant === uid
            );
            console.log(`   ${uid} conectado al menú: ${connected ? '✓' : '✗'}`);
        }

    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 5. Intentar recrear el schema con insertAdjacent en el root correcto
    console.log('\n6. Verificando si las páginas deben conectarse a un page-root...');
    try {
        const res = await client.get('/uiSchemaTreePath:list', { params: { pageSize: 1000 } });
        const paths = res.data?.data || [];

        // Buscar dónde está conectado el Dashboard
        const dashConnections = paths.filter((p: any) => p.descendant === DASHBOARD_UID);
        console.log('   Dashboard conectado a:');
        for (const p of dashConnections) {
            console.log(`     - ancestor: ${p.ancestor}, depth: ${p.depth}`);

            // Si tiene un ancestro, buscar dónde está ese ancestro
            if (p.ancestor !== DASHBOARD_UID) {
                const ancestorConnections = paths.filter((p2: any) => p2.descendant === p.ancestor);
                if (ancestorConnections.length > 0) {
                    console.log(`       (${p.ancestor} conectado a: ${ancestorConnections.map((x: any) => x.ancestor).join(', ')})`);
                }
            }
        }
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    console.log('\n=== FIN INVESTIGACIÓN ===');
}

main().catch(e => console.error('Error fatal:', e.message));
