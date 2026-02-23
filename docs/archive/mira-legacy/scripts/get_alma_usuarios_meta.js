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

async function getCollectionInfo() {
    console.log('Fetching ALMA_Usuarios metadata...');
    try {
        const res = await apiClient.get('/collections:list?paginate=false');
        if (res.status === 200) {
            const collections = res.data.data;
            const target = collections.find(c => c.name === 'ALMA_Usuarios');
            if (target) {
                console.log('ALMA_Usuarios Metadata:', JSON.stringify(target, null, 2));
            } else {
                console.log('ALMA_Usuarios not found.');
            }
        }
    } catch (e) {
        console.log('Exception:', e.message);
    }
}

getCollectionInfo();
