require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.NOCOBASE_API_URL;
const API_KEY = process.env.NOCOBASE_API_TOKEN;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

async function checkCount() {
    console.log('Checking ALMA_Usuarios count...');
    const res = await apiClient.get('/collections/ALMA_Usuarios:count');

    if (res.status === 200) {
        console.log(`Count: ${res.data.data}`);
    } else {
        console.log('Error:', res.status, res.data);
    }
}

checkCount();
