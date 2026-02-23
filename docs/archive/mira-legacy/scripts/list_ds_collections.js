const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');
const DATA_SOURCE_KEY = 'd_llw3u3ya2ej';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

async function listCollections() {
    console.log(`--- Listing Collections for Data Source ${DATA_SOURCE_KEY} ---`);
    try {
        const res = await apiClient.get(`/dataSources/${DATA_SOURCE_KEY}/collections?paginate=false`);
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            const collections = res.data.data;
            console.log(`Found ${collections.length} collections.`);
            console.log('Collections:', collections.map(c => c.name).join(', '));

            // Save to file for analysis if needed, or just log
            // collections.forEach(c => {
            //     console.log(`- ${c.name} (Fields: ${c.fields?.length || 0})`);
            // });
        } else {
            console.log('Error:', JSON.stringify(res.data));
        }
    } catch (e) {
        console.error('Exception:', e.message);
    }
}

listCollections();
