import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const client = axios.create({
    baseURL: process.env.NOCOBASE_BASE_URL,
    headers: {
        'Authorization': `Bearer ${process.env.NOCOBASE_API_KEY}`,
    },
});

async function main() {
    // Dashboard que funciona
    console.log('=== Dashboard (FUNCIONA) ===');
    const dash = await client.get('/uiSchemas:getJsonSchema/xikvv7wkefy');
    console.log(JSON.stringify(dash.data?.data, null, 2));

    console.log('\n\n=== Digestivo Alto (NO FUNCIONA) ===');
    const dig = await client.get('/uiSchemas:getJsonSchema/mup74mf8agk');
    console.log(JSON.stringify(dig.data?.data, null, 2));

    // Comparar estructura
    console.log('\n\n=== COMPARACION ===');
    const d1 = dash.data?.data;
    const d2 = dig.data?.data;

    console.log('Dashboard keys:', Object.keys(d1 || {}));
    console.log('Digestivo keys:', Object.keys(d2 || {}));

    console.log('\nDashboard name:', d1?.name);
    console.log('Digestivo name:', d2?.name);

    console.log('\nDashboard x-uid:', d1?.['x-uid']);
    console.log('Digestivo x-uid:', d2?.['x-uid']);
}
main().catch(e => console.error(e));
