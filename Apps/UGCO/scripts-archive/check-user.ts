/**
 * check-user.ts - Verificar usuario en NocoBase
 */

import axios from 'axios';

const MIRA_CONFIG = {
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    apiKey: (process.env.NOCOBASE_API_KEY || ''),
};

async function main() {
    const client = axios.create({
        baseURL: MIRA_CONFIG.baseURL,
        headers: {
            'Authorization': `Bearer ${MIRA_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
        },
    });

    console.log('=== VERIFICANDO USUARIOS ===\n');

    // Listar usuarios
    try {
        const res = await client.get('/users:list?pageSize=20&appends=roles');
        const users = res.data?.data || [];

        console.log('Usuarios en el sistema:');
        for (const u of users) {
            const roles = u.roles?.map((r: any) => r.name).join(', ') || 'sin roles';
            console.log(`  ID: ${u.id} | ${u.nickname || u.username || 'sin nombre'} | ${u.email || 'sin email'} | Roles: ${roles}`);
        }
    } catch (e: any) {
        console.log('Error listando usuarios:', e.response?.data?.errors?.[0]?.message || e.message);
    }

    // Verificar estado del servidor
    console.log('\n=== ESTADO DEL SERVIDOR ===\n');
    try {
        const res = await client.get('/app:getInfo');
        console.log('Versión:', res.data?.data?.version);
        console.log('Nombre:', res.data?.data?.name);
    } catch (e: any) {
        console.log('Error:', e.message);
    }
}

main().catch(console.error);
