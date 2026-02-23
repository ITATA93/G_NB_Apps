require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.NOCOBASE_API_URL;
const API_KEY = process.env.NOCOBASE_API_TOKEN;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`
    }
});

async function verifyCollections() {
    try {
        const res = await apiClient.get('/collections?paginate=false');
        const collections = res.data.data;
        const almaCollections = collections.filter(c => c.name.startsWith('ALMA_'));

        console.log(`Found ${almaCollections.length} ALMA_ collections:`);
        almaCollections.forEach(c => console.log(`- ${c.name}`));

    } catch (error) {
        console.error('Error verifying collections:', error.message);
    }
}

verifyCollections();
