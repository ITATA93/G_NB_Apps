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
    console.log('=== INVESTIGACION PROFUNDA DE SCHEMAS ===\n');

    // 1. Listar todos los schemas
    console.log('1. Listando schemas en ui_schemas...');
    try {
        const res = await client.get('/uiSchemas:list', { params: { pageSize: 500 } });
        const schemas = res.data?.data || [];
        console.log('   Total schemas:', schemas.length);

        // Buscar el Dashboard
        const dashboard = schemas.find((s: any) => s['x-uid'] === 'xikvv7wkefy');
        console.log('\n   Dashboard (xikvv7wkefy) en lista:', !!dashboard);
        if (dashboard) {
            console.log('   Dashboard ID:', dashboard.id);
            console.log('   Dashboard keys:', Object.keys(dashboard));
        }

        // Buscar Digestivo Alto nuevo
        const digestivo = schemas.find((s: any) => s['x-uid'] === 'y9z8atdl8r');
        console.log('\n   Digestivo (y9z8atdl8r) en lista:', !!digestivo);
        if (digestivo) {
            console.log('   Digestivo ID:', digestivo.id);
        }
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 2. Ver estructura de un schema en la tabla
    console.log('\n2. Obteniendo registro completo del Dashboard...');
    try {
        const res = await client.get('/uiSchemas:get', {
            params: { filter: { 'x-uid': 'xikvv7wkefy' } }
        });
        console.log('   Response:', JSON.stringify(res.data, null, 2).substring(0, 1000));
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 3. Buscar colecciones relacionadas con UI
    console.log('\n3. Buscando colecciones del sistema...');
    try {
        const res = await client.get('/collections:list', { params: { pageSize: 200 } });
        const collections = res.data?.data || [];
        const uiCollections = collections.filter((c: any) =>
            c.name.includes('ui') || c.name.includes('schema') || c.name.includes('route')
        );
        console.log('   Colecciones relacionadas con UI:');
        for (const c of uiCollections) {
            console.log(`     - ${c.name}: ${c.title || ''}`);
        }
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 4. Verificar si hay diferencia en cómo se obtiene el schema
    console.log('\n4. Comparando getJsonSchema vs get...');

    // Dashboard
    console.log('\n   --- Dashboard ---');
    try {
        const jsonSchema = await client.get('/uiSchemas:getJsonSchema/xikvv7wkefy');
        console.log('   getJsonSchema OK:', !!jsonSchema.data?.data);
    } catch (e: any) {
        console.log('   getJsonSchema Error:', e.message);
    }

    // Digestivo
    console.log('\n   --- Digestivo Alto ---');
    try {
        const jsonSchema = await client.get('/uiSchemas:getJsonSchema/y9z8atdl8r');
        console.log('   getJsonSchema OK:', !!jsonSchema.data?.data);
        console.log('   Schema type:', jsonSchema.data?.data?.type);
        console.log('   Schema x-component:', jsonSchema.data?.data?.['x-component']);
    } catch (e: any) {
        console.log('   getJsonSchema Error:', e.message);
    }

    // 5. Verificar la ruta
    console.log('\n5. Verificando ruta de Digestivo Alto...');
    try {
        const res = await client.get('/desktopRoutes:get', {
            params: { filterByTk: 345392373628934 }
        });
        const route = res.data?.data;
        console.log('   Route title:', route?.title);
        console.log('   Route schemaUid:', route?.schemaUid);
        console.log('   Route type:', route?.type);
        console.log('   Route keys:', Object.keys(route || {}));
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 6. Ver si hay alguna tabla de cache
    console.log('\n6. Buscando tablas de cache...');
    try {
        const res = await client.get('/collections:list', { params: { pageSize: 500 } });
        const collections = res.data?.data || [];
        const cacheCollections = collections.filter((c: any) =>
            c.name.includes('cache') || c.name.includes('temp')
        );
        if (cacheCollections.length > 0) {
            console.log('   Tablas de cache encontradas:');
            for (const c of cacheCollections) {
                console.log(`     - ${c.name}`);
            }
        } else {
            console.log('   No se encontraron tablas de cache');
        }
    } catch (e: any) {
        console.log('   Error:', e.message);
    }

    // 7. Probar insertar un schema usando insertAdjacent
    console.log('\n7. Probando insertAdjacent como alternativa...');
    const testUid = 'test_' + Math.random().toString(36).substring(2, 8);
    try {
        // Primero crear un schema padre vacío
        const testSchema = {
            type: 'void',
            'x-component': 'div',
            'x-uid': testUid,
            name: testUid
        };

        // Intentar insertAdjacent en el root
        const res = await client.post('/uiSchemas:insertAdjacent/nocobase-admin-menu?position=beforeEnd', {
            schema: testSchema
        });
        console.log('   insertAdjacent response:', res.status);

        // Eliminar el test
        await client.post(`/uiSchemas:remove/${testUid}`);
        console.log('   Test schema eliminado');
    } catch (e: any) {
        console.log('   Error:', e.response?.data?.errors?.[0]?.message || e.message);
    }

    console.log('\n=== FIN INVESTIGACION ===');
}

main().catch(e => console.error(e));
