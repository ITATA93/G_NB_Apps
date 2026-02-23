/**
 * check-page-structure.ts - Verificar estructura de página UGCO
 */

import axios from 'axios';

const client = axios.create({
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    headers: {
        'Authorization': 'Bearer ' + (process.env.NOCOBASE_API_KEY || ''),
    },
});

async function main() {
    console.log('=== ESTRUCTURA PÁGINA UGCO (5zw9nk7k3f1) ===\n');

    // 1. Obtener estructura de UGCO
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/5zw9nk7k3f1');
        const page = res.data?.data;
        console.log('UGCO Page:');
        console.log(JSON.stringify(page, null, 2));
    } catch (e: any) {
        console.log('Error UGCO:', e.message);
    }

    // 2. Comparar con INICIO
    console.log('\n\n=== ESTRUCTURA PÁGINA INICIO (1o5y8dftms0) ===\n');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/1o5y8dftms0');
        const page = res.data?.data;
        console.log('INICIO Page:');
        console.log(JSON.stringify(page, null, 2).slice(0, 3000));
    } catch (e: any) {
        console.log('Error INICIO:', e.message);
    }
}

main().catch(console.error);
