require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const headers = {
    'Authorization': `Bearer ${API_KEY}`
};

async function inspectSqlCollections() {
    try {
        console.log('Fetching all collections...');
        const res = await axios.get(`${API_BASE_URL}/api/collections:list`, {
            headers,
            params: {
                pageSize: 200,
                appends: ['fields']
            }
        });

        const collections = res.data.data;

        // Filter for potential SQL collections (views or explicitly typed)
        const sqlCollections = collections.filter(c =>
            c.view === true ||
            c.collectionType === 'view' ||
            c.collectionType === 'sql'
        );

        console.log(`Found ${sqlCollections.length} potential SQL collections.`);

        sqlCollections.forEach(c => {
            console.log('------------------------------------------------');
            console.log(`Name: ${c.name}`);
            console.log(`Title: ${c.title}`);
            console.log(`Type: ${c.collectionType}`);
            console.log(`View: ${c.view}`);
            if (c.options && c.options.sql) {
                console.log(`SQL: ${c.options.sql}`);
            }
        });

        // Also log unique collection types found to help debugging
        const types = [...new Set(collections.map(c => c.collectionType))];
        console.log('------------------------------------------------');
        console.log('All Collection Types found:', types);

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

inspectSqlCollections();
