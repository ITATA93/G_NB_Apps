const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

if (!API_BASE_URL || !API_KEY) {
    console.error('Error: API_BASE_URL and API_KEY must be defined in .env');
    process.exit(1);
}

const COLLECTIONS = [
    'ref_cie10',
    'ref_oncoespecialidad',
    'ref_oncotopografia',
    'ref_oncomorfologia',
    'ref_sexobiologico',
    'ref_pueblooriginario',
    'ref_identidadgenero',
    'ref_prevision',
    'ref_nacionalidad',
    'ref_region',
    'ref_comuna',
    'ref_establecimiento',
    'ref_especialidad_medica',
    'ref_etapa_clinica',
    'ref_indicacion_comite',
    'ref_estado_caso'
];

async function checkCounts() {
    console.log(`Checking counts on ${API_BASE_URL}...`);
    console.log('------------------------------------------------');

    for (const collection of COLLECTIONS) {
        try {
            // NocoBase API list endpoint usually supports pageSize=1 and returns meta with count
            const response = await axios.get(`${API_BASE_URL}/api/${collection}:list`, {
                params: {
                    pageSize: 1
                    // appends: ['total'] // Removed as it causes 500 error
                },
                headers: { Authorization: `Bearer ${API_KEY}` }
            });

            // Check response structure for count
            // Usually response.data.meta.count or response.data.count
            const count = response.data?.meta?.count ?? response.data?.count ?? 'Unknown';

            console.log(`${collection.padEnd(25)}: ${count} records`);

        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(`${collection.padEnd(25)}: [Not Found / Not Created]`);
            } else {
                console.error(`${collection.padEnd(25)}: Error ${error.message}`);
            }
        }
    }
    console.log('------------------------------------------------');
}

checkCounts();
