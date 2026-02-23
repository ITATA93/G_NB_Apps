/**
 * get-tabs-schema.ts - Obtener estructura del Tabs
 */

import axios from 'axios';

const client = axios.create({
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    headers: {
        'Authorization': 'Bearer ' + (process.env.NOCOBASE_API_KEY || ''),
    },
});

async function main() {
    // Obtener el schema de Tabs
    console.log('=== ESTRUCTURA DEL TABS (ats6b01zp2c) ===\n');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/ats6b01zp2c');
        const tabs = res.data?.data;
        console.log(JSON.stringify(tabs, null, 2).slice(0, 3000));
    } catch (e: any) {
        console.log('Error:', e.message);
    }

    // Obtener MobilePageTabs también
    console.log('\n\n=== ESTRUCTURA DEL MobilePageTabs (77iio5w3wsv) ===\n');
    try {
        const res = await client.get('/uiSchemas:getJsonSchema/77iio5w3wsv');
        const tabs = res.data?.data;
        console.log(JSON.stringify(tabs, null, 2).slice(0, 3000));
    } catch (e: any) {
        console.log('Error:', e.message);
    }
}

main().catch(console.error);
