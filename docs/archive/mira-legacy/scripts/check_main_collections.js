const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    }
});

async function listCollections() {
    try {
        console.log('Fetching /collections:list...');
        const res = await apiClient.get('/collections:list?paginate=false');
        const collections = res.data.data;
        console.log(`Found ${collections.length} collections.`);

        const hUser = collections.find(c => c.name.toLowerCase() === 'h_user' || c.name.toLowerCase() === 'usuarios');
        if (hUser) {
            console.log('FOUND H_user/Usuarios in main collections!');
            console.log(JSON.stringify(hUser, null, 2));
        } else {
            console.log('H_user/Usuarios NOT found in main collections.');
            // List some names to be sure
            console.log('Sample collections:', collections.slice(0, 5).map(c => c.name));
        }

    } catch (e) {
        console.error('Error fetching collections:', e.message);
    }
}

listCollections();
