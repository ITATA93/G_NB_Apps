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

async function listFields() {
    try {
        const res = await apiClient.get(`/dataSources/${DATA_SOURCE_KEY}/collections?paginate=false`);
        if (res.status === 200) {
            const hUser = res.data.data.find(c => c.name === 'H_user' || c.name === 'h_user');
            if (hUser && hUser.fields) {
                console.log('H_user Fields:');
                hUser.fields.forEach(f => console.log(`- ${f.name} (${f.type})`));
            } else {
                console.log('H_user fields not found.');
            }
        }
    } catch (e) {
        console.error('Exception:', e.message);
    }
}

listFields();
