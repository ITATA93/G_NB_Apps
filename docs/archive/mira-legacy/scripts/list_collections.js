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

async function listCollections() {
    console.log('Listing Collections...');
    try {
        const res = await apiClient.get('/collections:list?paginate=false');
        console.log(`Status: ${res.status}`);
        if (res.status === 200) {
            const collections = res.data.data;
            console.log(`Found ${collections.length} collections.`);
            collections.forEach(c => {
                console.log(`- ${c.name} (Title: ${c.title}, DataSource: ${c.dataSourceId || 'Main'})`);
            });
        } else {
            console.log('Error:', JSON.stringify(res.data).substring(0, 200));
        }
    } catch (e) {
        console.log('Exception:', e.message);
    }
}

listCollections();
