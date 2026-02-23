/**
 * fix-menu-schema.ts - Agregar menuSchemaUid a las rutas UGCO
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

function uid() {
    return Math.random().toString(36).substring(2, 13);
}

async function main() {
    console.log('=== ARREGLANDO menuSchemaUid ===\n');

    const DIGESTIVO_ROUTE_ID = 345392373628934;

    // 1. Crear un menuSchema vacío (como el de Ejemplo_01)
    const menuUid = uid();
    console.log('1. Creando menuSchema vacío:', menuUid);

    try {
        const menuSchema = {
            type: 'void',
            name: menuUid,
            'x-uid': menuUid
        };

        await client.post('/uiSchemas:insert', menuSchema);
        console.log('   ✓ menuSchema creado');
    } catch (e: any) {
        console.log('   Error:', e.response?.data?.errors?.[0]?.message || e.message);
    }

    // 2. Actualizar la ruta de Digestivo con menuSchemaUid y enableTabs
    console.log('\n2. Actualizando ruta de Digestivo...');
    try {
        await client.post(`/desktopRoutes:update?filterByTk=${DIGESTIVO_ROUTE_ID}`, {
            menuSchemaUid: menuUid,
            enableTabs: false
        });
        console.log('   ✓ Ruta actualizada');
    } catch (e: any) {
        console.log('   Error:', e.response?.data?.errors?.[0]?.message || e.message);
    }

    // 3. Verificar
    console.log('\n3. Verificando...');
    const routeRes = await client.get('/desktopRoutes:get', {
        params: { filterByTk: DIGESTIVO_ROUTE_ID }
    });
    const route = routeRes.data?.data;
    console.log('   menuSchemaUid:', route?.menuSchemaUid);
    console.log('   enableTabs:', route?.enableTabs);
    console.log('   schemaUid:', route?.schemaUid);

    // 4. También verificar y arreglar el padre "Especialidades"
    console.log('\n4. Verificando ruta padre "Especialidades"...');
    const ESPECIALIDADES_ROUTE_ID = 345392373628932;

    const parentRes = await client.get('/desktopRoutes:get', {
        params: { filterByTk: ESPECIALIDADES_ROUTE_ID }
    });
    const parent = parentRes.data?.data;
    console.log('   title:', parent?.title);
    console.log('   schemaUid:', parent?.schemaUid);
    console.log('   type:', parent?.type);

    // Si Especialidades no tiene schemaUid, podría ser el problema
    // Especialidades parece ser un "group" no una "page"
    if (!parent?.schemaUid) {
        console.log('\n   Especialidades no tiene schemaUid (es un grupo)');
        console.log('   Esto podría ser normal para un grupo de menú...');
    }

    console.log('\n=== Por favor recarga la página de Digestivo Alto ===');

    // 5. Alternativa: mover temporalmente Digestivo bajo UGCO directamente
    console.log('\n5. ¿Quieres probar mover Digestivo directamente bajo UGCO?');
    console.log('   (Actualmente está bajo Especialidades -> UGCO)');
}

main().catch(e => console.error('Error:', e.message));
