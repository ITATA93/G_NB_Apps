const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
// Using User Token as it worked for listing collections
const API_KEY = (process.env.NOCOBASE_API_KEY || '');
const DATA_SOURCE_KEY = 'd_llw3u3ya2ej';

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

async function verifyData() {
    console.log('--- Verifying Data Access ---');

    const tests = [
        { name: 'H_user (Name)', endpoint: `/dataSources/${DATA_SOURCE_KEY}/collections/H_user:list?paginate=false` },
        { name: '3dvc91e92rr (Key)', endpoint: `/dataSources/${DATA_SOURCE_KEY}/collections/3dvc91e92rr:list?paginate=false` },
        { name: 'Usuarios (Alt Name)', endpoint: `/dataSources/${DATA_SOURCE_KEY}/collections/Usuarios:list?paginate=false` }
    ];

    for (const test of tests) {
        console.log(`\nTesting ${test.name}: ${test.endpoint}`);
        try {
            const res = await apiClient.get(test.endpoint);
            console.log(`Status: ${res.status}`);
            if (res.status === 200) {
                const data = res.data.data;
                if (data) {
                    console.log(`SUCCESS! Found ${data.length} records.`);
                    if (data.length > 0) {
                        console.log('Sample Record:', JSON.stringify(data[0], null, 2));
                    }
                } else {
                    console.log('Response OK but data is null/undefined.');
                    console.log('Full Body:', JSON.stringify(res.data).substring(0, 200));
                }
            } else {
                console.log('Error:', JSON.stringify(res.data).substring(0, 200));
            }
        } catch (e) {
            console.log('Exception:', e.message);
        }
    }
}

verifyData();
