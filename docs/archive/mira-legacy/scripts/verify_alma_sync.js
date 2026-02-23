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

async function verifySync() {
    console.log('Verifying ALMA_Usuarios count...');
    try {
        const res = await apiClient.get('/ALMA_Usuarios:list?paginate=false');
        if (res.status === 200) {
            const count = res.data.data.length;
            console.log(`ALMA_Usuarios Count: ${count}`);
            if (count > 0) {
                console.log('Sample Record:', JSON.stringify(res.data.data[0], null, 2));
            }
        } else {
            console.log('Error:', JSON.stringify(res.data).substring(0, 200));
        }
    } catch (e) {
        console.log('Exception:', e.message);
    }
}

verifySync();
