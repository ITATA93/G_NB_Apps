require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    }
});

async function checkData() {
    try {
        console.log('Checking data in buho_pacientes...');
        const res = await apiClient.get('/buho_pacientes:list');
        const data = res.data.data;

        console.log(`Found ${data.length} records.`);
        if (data.length > 0) {
            console.log('Sample record:', JSON.stringify(data[0], null, 2));
        }

    } catch (error) {
        console.error('Error:', error.message, error.response ? error.response.data : '');
    }
}

checkData();
