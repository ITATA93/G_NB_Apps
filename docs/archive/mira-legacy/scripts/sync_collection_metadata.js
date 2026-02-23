const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');
const DATA_SOURCE_KEY = 'd_llw3u3ya2ej';
const COLLECTION_NAME = 'H_user';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-Role': 'root',
        'X-Hostname': 'mira.hospitaldeovalle.cl',
        'X-With-ACL-Meta': 'true'
    },
    validateStatus: () => true
});

async function syncMetadata() {
    console.log(`Syncing metadata for ${COLLECTION_NAME}...`);

    // Try :sync endpoint
    const url = `/dataSources/${DATA_SOURCE_KEY}/collections/${COLLECTION_NAME}:sync`;
    console.log(`POST ${url}`);
    try {
        const res = await apiClient.post(url, {});
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            console.log('Sync successful!');
            console.log(JSON.stringify(res.data, null, 2));
        } else {
            console.log('Error:', JSON.stringify(res.data).substring(0, 200));
        }
    } catch (e) {
        console.log('Exception:', e.message);
    }
}

syncMetadata();
