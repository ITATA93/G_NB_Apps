const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

async function verifyCollections() {
    console.log('Verifying ALMA_ collections...');
    try {
        const res = await apiClient.get('/collections?paginate=false');
        if (res.status === 200) {
            const collections = res.data.data;
            console.log(`Found ${collections.length} Total collections.`);
            console.log('All Names:', collections.map(c => c.name).join(', '));

            const almaCollections = collections.filter(c => c.name.startsWith('ALMA_'));
            console.log(`Found ${almaCollections.length} ALMA_ collections.`);
        } else {
            console.log('Error:', JSON.stringify(res.data));
        }
    } catch (e) {
        console.error('Exception:', e.message);
    }
}

verifyCollections();
