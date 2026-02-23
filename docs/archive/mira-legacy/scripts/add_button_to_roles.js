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

async function addButtonToRoles() {
    const actionBarUid = 'otwcu4506cl'; // The ActionBar of the Roles Table

    const actionSchema = {
        "type": "void",
        "title": "TEST BUTTON",
        "x-component": "Action",
        "x-component-props": {
            "type": "primary",
            "icon": "ExperimentOutlined"
        },
        "x-action": "test_action"
    };

    try {
        console.log(`Inserting Button into ActionBar '${actionBarUid}'...`);
        const res = await apiClient.post('/uiSchemas:insert', {
            schema: actionSchema,
            ancestor: actionBarUid
        });
        console.log('Success!', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message, error.response ? error.response.data : '');
    }
}

addButtonToRoles();
