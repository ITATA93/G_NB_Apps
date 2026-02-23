const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-Role': 'root',
        'X-Hostname': 'mira.hospitaldeovalle.cl'
    },
    validateStatus: () => true
});

async function listDataSources() {
    console.log('Listing Data Sources...');
    try {
        const res = await apiClient.get('/dataSources:list?paginate=false');
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            const dataSources = res.data.data;
            console.log(`Found ${dataSources.length} data sources.`);
            dataSources.forEach(ds => {
                console.log(`- [${ds.key}] ${ds.displayName} (Type: ${ds.type})`);
            });
        } else {
            console.log('Error:', JSON.stringify(res.data).substring(0, 200));
        }
    } catch (e) {
        console.log('Exception:', e.message);
    }
}

listDataSources();
