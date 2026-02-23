require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.NOCOBASE_API_URL;
const API_KEY = process.env.NOCOBASE_API_TOKEN;
const DATA_SOURCE_KEY = process.env.SIDRA_DATA_SOURCE_KEY || 'd_llw3u3ya2ej';
const SOURCE_COLLECTION = 'H_user';
const TARGET_COLLECTION = 'ALMA_Usuarios';

if (!API_BASE_URL || !API_KEY) {
    console.error('Error: Missing NOCOBASE_API_URL or NOCOBASE_API_TOKEN in .env file');
    process.exit(1);
}

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-Role': 'root',
        'X-Hostname': 'mira.hospitaldeovalle.cl',
        'X-With-ACL-Meta': 'true'
    }
});

async function syncData() {
    console.log(`[${new Date().toISOString()}] Starting sync...`);
    try {
        // 1. Fetch data from Source
        // Correct endpoint found via diagnostics: /dataSources/{key}/collections/{name}:list
        const sourceUrl = `/dataSources/${DATA_SOURCE_KEY}/collections/${SOURCE_COLLECTION}:list?paginate=false`;
        console.log(`Fetching from ${sourceUrl}...`);

        const sourceRes = await apiClient.get(sourceUrl);
        console.log('Source Response Status:', sourceRes.status);
        // console.log('Source Response Keys:', Object.keys(sourceRes.data));

        let sourceData = sourceRes.data?.data;
        if (!sourceData && Array.isArray(sourceRes.data)) {
            sourceData = sourceRes.data;
        }

        if (!sourceData) {
            console.error('Unexpected response structure:', JSON.stringify(sourceRes.data).substring(0, 200));
            return;
        }

        console.log(`Fetched ${sourceData.length} records from source.`);

        // 2. Upsert into Target
        for (const item of sourceData) {
            try {
                const payload = {
                    id_original: item.id?.toString() || item.ID?.toString(),
                    nombre: item.nombre || item.name || item.Nombre,
                    email: item.email || item.Email,
                    rut: item.rut || item.RUT,
                    username: item.username || item.login || item.Usuario
                };

                // Check if exists
                const existing = await apiClient.get(`/${TARGET_COLLECTION}:list?filter[id_original]=${payload.id_original}&pageSize=1`);

                if (existing.data.data.length > 0) {
                    // Update
                    const targetId = existing.data.data[0].id;
                    await apiClient.put(`/${TARGET_COLLECTION}/${targetId}`, payload);
                } else {
                    // Create
                    await apiClient.post(`/${TARGET_COLLECTION}`, payload);
                }

            } catch (rowError) {
                console.error(`Error processing row:`, rowError.message);
            }
        }
        console.log(`[${new Date().toISOString()}] Sync completed.`);

    } catch (error) {
        console.error(`Sync failed:`, error.response?.data || error.message);
    }
}

// Run immediately
syncData();

// Schedule every 3 minutes (180000 ms)
setInterval(syncData, 180000);
console.log('Sync scheduler started (every 3 minutes). Press Ctrl+C to stop.');
