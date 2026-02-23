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
    console.log('=== COMPARANDO RUTAS: Dashboard vs Digestivo Alto ===\n');

    // Dashboard route
    const dashRoute = await client.get('/desktopRoutes:list', {
        params: { filter: { schemaUid: 'xikvv7wkefy' } }
    });
    const dash = dashRoute.data?.data?.[0];
    console.log('Dashboard Route:');
    console.log('  schemaUid:', dash?.schemaUid);
    console.log('  menuSchemaUid:', dash?.menuSchemaUid);
    console.log('  type:', dash?.type);
    console.log('  enableTabs:', dash?.enableTabs);
    console.log('  enableHeader:', dash?.enableHeader);
    console.log('  options:', JSON.stringify(dash?.options));

    // Digestivo route
    const digRoute = await client.get('/desktopRoutes:get', {
        params: { filterByTk: 345392373628934 }
    });
    const dig = digRoute.data?.data;
    console.log('\nDigestivo Alto Route:');
    console.log('  schemaUid:', dig?.schemaUid);
    console.log('  menuSchemaUid:', dig?.menuSchemaUid);
    console.log('  type:', dig?.type);
    console.log('  enableTabs:', dig?.enableTabs);
    console.log('  enableHeader:', dig?.enableHeader);
    console.log('  options:', JSON.stringify(dig?.options));

    // Si menuSchemaUid es diferente, intentar copiarlo
    if (dash?.menuSchemaUid && !dig?.menuSchemaUid) {
        console.log('\n⚠️ Dashboard tiene menuSchemaUid pero Digestivo no!');
        console.log('   Dashboard menuSchemaUid:', dash.menuSchemaUid);
    }

    // Verificar si hay páginas que SI funcionan dentro de UGCO
    console.log('\n=== Verificando Comités (que debería funcionar) ===');
    const comitesRoute = await client.get('/desktopRoutes:list', {
        params: { filter: { schemaUid: '7nzulppifqi' } }
    });
    const comites = comitesRoute.data?.data?.[0];
    console.log('Comités Route:');
    console.log('  schemaUid:', comites?.schemaUid);
    console.log('  menuSchemaUid:', comites?.menuSchemaUid);
    console.log('  type:', comites?.type);

    // Listar todas las rutas UGCO para ver el patrón
    console.log('\n=== Todas las rutas de especialidades ===');
    const allRoutes = await client.get('/desktopRoutes:list', {
        params: { pageSize: 100 }
    });
    const routes = allRoutes.data?.data || [];
    const specialtyRoutes = routes.filter((r: any) => r.parentId === 345392373628932);

    for (const r of specialtyRoutes) {
        const hasMenu = r.menuSchemaUid ? '✓' : '✗';
        console.log(`  ${r.title}: schemaUid=${r.schemaUid}, menuSchemaUid=${hasMenu}`);
    }
}

main().catch(e => console.error(e));
