/**
 * check-ugco-app.ts - Verificar estado de la app UGCO
 */

import axios from 'axios';

const client = axios.create({
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    headers: {
        'Authorization': 'Bearer ' + (process.env.NOCOBASE_API_KEY || ''),
    },
});

async function main() {
    console.log('=== VERIFICANDO APP UGCO ===\n');

    // 1. Obtener info de la app UGCO
    console.log('1. Obteniendo info de UGCO...');
    try {
        const res = await client.get('/applications:get?filterByTk=a_7sbacjcq6e3');
        const app = res.data?.data;
        console.log('   App UGCO:');
        console.log(JSON.stringify(app, null, 2));
    } catch (e: any) {
        console.log(`   Error: ${e.response?.status} - ${e.message}`);
    }

    // 2. Intentar iniciar/habilitar la app
    console.log('\n2. Intentando iniciar la app UGCO...');
    try {
        await client.post('/applications:start?filterByTk=a_7sbacjcq6e3');
        console.log('   [OK] App iniciada');
    } catch (e: any) {
        console.log(`   Error: ${e.response?.data?.errors?.[0]?.message || e.message}`);
    }

    // 3. Verificar URL de acceso
    console.log('\n3. URLs de acceso posibles:');
    console.log('   - https://mira.hospitaldeovalle.cl/apps/a_7sbacjcq6e3/admin');
    console.log('   - https://mira.hospitaldeovalle.cl/apps/ugco/admin');
    console.log('   - https://mira.hospitaldeovalle.cl/admin/a_7sbacjcq6e3');

    // 4. Verificar permisos de la app
    console.log('\n4. Verificando permisos...');
    try {
        const res = await client.get('/roles:list?appends=apps');
        const roles = res.data?.data || [];

        for (const role of roles) {
            const apps = role.apps || [];
            const hasUgco = apps.some((a: any) => a.name?.includes('ugco') || a.name?.includes('7sbacjcq6e3'));
            console.log(`   ${role.name}: ${hasUgco ? 'tiene acceso a UGCO' : 'sin acceso a UGCO'}`);
        }
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }

    // 5. Ver estado del plugin multi-app
    console.log('\n5. Estado del plugin multi-app...');
    try {
        const res = await client.get('/applicationPlugins:list?filter[name][$includes]=multi-app');
        const plugins = res.data?.data || [];

        for (const p of plugins) {
            console.log(`   Plugin: ${p.name}`);
            console.log(`     enabled: ${p.enabled}`);
            console.log(`     installed: ${p.installed}`);
        }
    } catch (e: any) {
        console.log(`   Error: ${e.message}`);
    }

    // 6. Intentar acceder a la API de la sub-app
    console.log('\n6. Intentando acceder a la sub-app UGCO...');
    const subAppUrls = [
        'https://mira.hospitaldeovalle.cl/api/a_7sbacjcq6e3:app:getInfo',
        'https://mira.hospitaldeovalle.cl/apps/a_7sbacjcq6e3/api/app:getInfo',
    ];

    for (const url of subAppUrls) {
        try {
            const res = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${process.env.NOCOBASE_API_KEY || ""}`,
                },
            });
            console.log(`   [OK] ${url}`);
            console.log(`     ${JSON.stringify(res.data?.data || res.data)}`);
        } catch (e: any) {
            console.log(`   [--] ${url}: ${e.response?.status || e.message}`);
        }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  SOLUCIÓN RECOMENDADA:');
    console.log('  En vez de usar multi-app, agregar UGCO como');
    console.log('  un MENÚ dentro de la app principal MIRA,');
    console.log('  igual que ALMA, RECA, BUHO.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(console.error);
