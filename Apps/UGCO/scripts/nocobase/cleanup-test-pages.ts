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

// IDs de páginas importantes que NO se deben borrar
const KEEP_IDS = [
    345392373628930,  // 📊 Dashboard
    345392373628932,  // 📁 Especialidades
    345392375726091,  // 📅 Comités
    345392375726093,  // ✅ Tareas
    345392375726095,  // 📄 Reportes
];

async function main() {
    const UGCO_ID = 345392373628928;

    const routes = await client.get('/desktopRoutes:list', {
        params: {
            filter: { parentId: UGCO_ID },
            pageSize: 100
        }
    });

    const toDelete = (routes.data?.data || []).filter(
        (r: any) => !KEEP_IDS.includes(r.id)
    );

    console.log('=== LIMPIANDO PÁGINAS DE PRUEBA ===\n');
    console.log('Páginas a eliminar:', toDelete.length);

    for (const route of toDelete) {
        console.log(`  Eliminando: ${route.id} | ${route.title}`);
        try {
            // Eliminar la ruta
            await client.post(`/desktopRoutes:destroy?filterByTk=${route.id}`);

            // Eliminar el schema si existe
            if (route.schemaUid) {
                await client.post(`/uiSchemas:remove/${route.schemaUid}`).catch(() => {});
            }
        } catch (e: any) {
            console.log(`    Error: ${e.response?.data?.errors?.[0]?.message || e.message}`);
        }
    }

    console.log('\n=== ELIMINACIÓN COMPLETADA ===');

    // Verificar lo que quedó
    const remaining = await client.get('/desktopRoutes:list', {
        params: {
            filter: { parentId: UGCO_ID },
            pageSize: 100
        }
    });

    console.log('\nPáginas restantes:');
    for (const route of remaining.data?.data || []) {
        console.log(`  ${route.id} | ${route.title}`);
    }
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
