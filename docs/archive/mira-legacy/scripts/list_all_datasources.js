const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');

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

async function runDiscovery() {
    console.log('--- Discovering Data Sources ---');
    try {
        const res = await apiClient.get('/dataSources:list?paginate=false');
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            const sources = res.data.data;
            console.log(`Found ${sources.length} data sources:`);
            sources.forEach(s => {
                console.log(`- Key: ${s.key}, Name: ${s.displayName}, Type: ${s.type}`);
            });
        } else {
            console.log('Error listing data sources:', JSON.stringify(res.data).substring(0, 200));
        }
    } catch (e) {
        console.log('Exception listing data sources:', e.message);
    }

    console.log('\n--- Discovering All Collections ---');
    try {
        const res = await apiClient.get('/collections:list?paginate=false');
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            const collections = res.data.data;
            console.log(`Found ${collections.length} collections.`);
            // Filter for anything looking like 'user' or 'usuarios'
            const suspicious = collections.filter(c =>
                c.name.toLowerCase().includes('user') ||
                c.name.toLowerCase().includes('usuario') ||
                c.dataSourceKey // If available
            );
            console.log('Suspicious Collections:', JSON.stringify(suspicious.map(c => ({
                name: c.name,
                title: c.title,
                dataSource: c.dataSource
            })), null, 2));
        }
    } catch (e) {
        console.log('Exception listing collections:', e.message);
    }
}

runDiscovery();
