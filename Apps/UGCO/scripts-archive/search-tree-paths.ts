/**
 * search-tree-paths.ts - Buscar tree paths específicos
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

const DASHBOARD_UID = 'xikvv7wkefy';
const DIGESTIVO_UID = 'y9z8atdl8r';

async function main() {
    console.log('=== BUSCANDO TREE PATHS ESPECÍFICOS ===\n');

    // 1. Buscar Dashboard directamente
    console.log('1. Buscando Dashboard por filtro...');
    try {
        const res = await client.get('/uiSchemaTreePath:list', {
            params: {
                filter: { descendant: DASHBOARD_UID }
            }
        });
        console.log('   Dashboard paths:', res.data?.data?.length || 0);
        if (res.data?.data?.length > 0) {
            for (const p of res.data.data) {
                console.log(`     ${JSON.stringify(p)}`);
            }
        }
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 2. Buscar Digestivo directamente
    console.log('\n2. Buscando Digestivo por filtro...');
    try {
        const res = await client.get('/uiSchemaTreePath:list', {
            params: {
                filter: { descendant: DIGESTIVO_UID }
            }
        });
        console.log('   Digestivo paths:', res.data?.data?.length || 0);
        if (res.data?.data?.length > 0) {
            for (const p of res.data.data) {
                console.log(`     ${JSON.stringify(p)}`);
            }
        }
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 3. Contar total de registros
    console.log('\n3. Contando total de tree paths...');
    try {
        const res = await client.get('/uiSchemaTreePath:list', {
            params: { pageSize: 1 }
        });
        console.log('   Total registros:', res.data?.meta?.count || 'desconocido');
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 4. Buscar todos los paths de tipo Page
    console.log('\n4. Buscando UIDs que empiecen con letras comunes...');
    const testUids = ['xikvv', 'y9z8a', 'fnqn2', 'kyr0u']; // Parte de UIDs conocidos
    for (const uid of testUids) {
        try {
            const res = await client.get('/uiSchemaTreePath:list', {
                params: {
                    filter: { $or: [{ descendant: { $like: `${uid}%` } }] },
                    pageSize: 10
                }
            });
            console.log(`   ${uid}*: ${res.data?.data?.length || 0} registros`);
        } catch (e: any) {
            // El filtro $like puede no ser soportado
        }
    }

    // 5. Verificar el schema con get directo
    console.log('\n5. Obteniendo schemas por getProperties...');
    try {
        const res = await client.get(`/uiSchemas:getProperties/${DASHBOARD_UID}`);
        console.log('   Dashboard properties:', Object.keys(res.data?.data || {}).slice(0, 5));
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 6. Probar si hay una forma de "registrar" el schema
    console.log('\n6. Intentando patch al schema existente...');
    try {
        // Primero obtener el schema actual
        const getRes = await client.get(`/uiSchemas:getJsonSchema/${DIGESTIVO_UID}`);
        const schema = getRes.data?.data;
        console.log('   Schema actual existe:', !!schema);
        console.log('   x-async:', schema?.['x-async']);

        // Intentar patch con saveAsTemplate o similar
        const patchRes = await client.post(`/uiSchemas:patch`, {
            'x-uid': DIGESTIVO_UID,
            'x-async': true  // Marcar como async podría forzar re-registro
        });
        console.log('   Patch response:', patchRes.status);
    } catch (e: any) {
        console.log('   Error patch:', e.response?.data?.errors?.[0]?.message || e.message);
    }

    // 7. Ver si podemos eliminar y recrear con insertAdjacent
    console.log('\n7. Probando eliminar y recrear con insertAdjacent...');
    // Obtener el schema actual de Digestivo
    try {
        const getRes = await client.get(`/uiSchemas:getJsonSchema/${DIGESTIVO_UID}`);
        const schema = getRes.data?.data;

        if (schema) {
            console.log('   Schema actual:');
            console.log('     x-component:', schema['x-component']);
            console.log('     properties:', Object.keys(schema.properties || {}));

            // Eliminar schema actual
            console.log('\n   Eliminando schema actual...');
            await client.post(`/uiSchemas:remove/${DIGESTIVO_UID}`);
            console.log('   ✓ Schema eliminado');

            // Recrear con insertAdjacent en nocobase-page-root
            console.log('\n   Recreando con insertAdjacent en page-root...');
            const newSchema = {
                ...schema,
                name: schema.name || DIGESTIVO_UID,
                'x-uid': DIGESTIVO_UID,
                'x-async': true
            };

            // Intentar insertar en diferentes roots
            const roots = ['nocobase-page-root', 'page-root', 'root'];
            for (const root of roots) {
                try {
                    const insertRes = await client.post(`/uiSchemas:insertAdjacent/${root}?position=afterBegin`, {
                        schema: newSchema
                    });
                    console.log(`   insertAdjacent en ${root}:`, insertRes.status);
                    if (insertRes.status === 200) {
                        console.log('   ✓ Schema insertado exitosamente');
                        break;
                    }
                } catch (e: any) {
                    console.log(`   ${root}: ${e.response?.data?.errors?.[0]?.message || e.message}`);
                }
            }

            // Verificar si ahora tiene tree path
            console.log('\n   Verificando tree path después de insertar...');
            const pathRes = await client.get('/uiSchemaTreePath:list', {
                params: { filter: { descendant: DIGESTIVO_UID } }
            });
            console.log('   Paths encontrados:', pathRes.data?.data?.length || 0);
        }
    } catch (e: any) {
        console.log('   Error:', e.response?.data?.errors?.[0]?.message || e.message);
    }

    console.log('\n=== FIN BÚSQUEDA ===');
}

main().catch(e => console.error('Error fatal:', e.message));
