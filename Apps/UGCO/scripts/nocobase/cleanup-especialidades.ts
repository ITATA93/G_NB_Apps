import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const client = axios.create({
    baseURL: process.env.NOCOBASE_BASE_URL,
    headers: {
        'Authorization': `Bearer ${process.env.NOCOBASE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Role': 'root'
    },
});

// IDs de páginas de prueba a eliminar dentro de Especialidades
const DELETE_IDS = [
    345404482584576,  // a
    345411644358656,  // Test_Final
    345413477269504,  // Test_CorrectWay
    345413567447040,  // Test_Async
    345413844271104,  // Prueba_API
    345414364364800,  // Funciona
];

async function main() {
    console.log('=== ELIMINANDO PÁGINAS DE PRUEBA EN ESPECIALIDADES ===\n');

    for (const id of DELETE_IDS) {
        try {
            // Obtener info de la ruta
            const route = await client.get(`/desktopRoutes:get?filterByTk=${id}`);
            const title = route.data?.data?.title || 'desconocido';
            const schemaUid = route.data?.data?.schemaUid;

            console.log(`Eliminando: ${id} | ${title}`);

            // Eliminar la ruta
            await client.post(`/desktopRoutes:destroy?filterByTk=${id}`);

            // Eliminar el schema si existe
            if (schemaUid) {
                await client.post(`/uiSchemas:remove/${schemaUid}`).catch(() => {});
            }
        } catch (e: any) {
            console.log(`  Error con ${id}: ${e.response?.data?.errors?.[0]?.message || e.message}`);
        }
    }

    console.log('\n=== ELIMINACIÓN COMPLETADA ===');
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
