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
    // Comparar Dashboard (que funcionaba) con Digestivo Alto (nuevo)
    console.log('=== Comparando schemas ===\n');

    const schemas = [
        { name: 'Dashboard', uid: 'xikvv7wkefy' },
        { name: 'Digestivo Alto', uid: 'gvwu5oy6x81' },
    ];

    for (const s of schemas) {
        console.log(`--- ${s.name} (${s.uid}) ---`);
        try {
            const res = await client.get(`/uiSchemas:getJsonSchema/${s.uid}`);
            const data = res.data?.data || res.data;
            console.log('  type:', data.type);
            console.log('  name:', data.name);
            console.log('  x-uid:', data['x-uid']);
            console.log('  x-component:', data['x-component']);
            console.log('  x-async:', data['x-async']);
            console.log('  properties keys:', Object.keys(data.properties || {}));
        } catch (e: any) {
            console.log('  Error:', e.message);
        }
        console.log('');
    }
}

main().catch(e => console.error('Error:', e.message));
