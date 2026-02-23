require('dotenv').config({ path: '../../.env' });
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:13000';
// Hardcoded key from user request to ensure it's fresh
const API_KEY = (process.env.NOCOBASE_API_KEY || '');

const headers = {
    'Authorization': `Bearer ${API_KEY}`
};

const collectionName = 'buho_pacientes';

const fields = [
    { name: 'nombre', type: 'string', interface: 'input' },
    { name: 'rut', type: 'string', interface: 'input' },
    { name: 'cama', type: 'string', interface: 'input' },
    { name: 'episodio', type: 'string', interface: 'input' },
    { name: 'servicio', type: 'string', interface: 'input' },
    { name: 'sala', type: 'string', interface: 'input' },
    { name: 'fecha_ingreso', type: 'date', interface: 'datetime' },
    { name: 'tipo_cama', type: 'string', interface: 'input' },
    { name: 'categorizacion', type: 'string', interface: 'input' },
    { name: 'diagnostico_principal', type: 'text', interface: 'textarea' },
    { name: 'especialidad_medico', type: 'string', interface: 'input' },
    { name: 'fecha_probable_alta', type: 'date', interface: 'datetime' },
    { name: 'estudios_pendientes', type: 'text', interface: 'textarea' },
    // Plan fields
    { name: 'estado_plan', type: 'string', interface: 'select', uiSchema: { enum: [{ label: 'Pendiente', value: 'Pendiente' }, { label: 'En Curso', value: 'En Curso' }, { label: 'Listo para Alta', value: 'Listo para Alta' }] } },
    { name: 'proxima_accion', type: 'text', interface: 'textarea' },
    { name: 'riesgo_detectado', type: 'string', interface: 'select', uiSchema: { enum: [{ label: 'Alto', value: 'Alto' }, { label: 'Medio', value: 'Medio' }, { label: 'Bajo', value: 'Bajo' }] } }
];

async function createBuhoSchema() {
    try {
        console.log(`Creating collection ${collectionName}...`);

        // 1. Create Collection
        try {
            await axios.post(`${API_BASE_URL}/api/collections:create`, {
                name: collectionName,
                title: 'BUHO Pacientes',
                autoGenId: true
            }, { headers });
            console.log('Collection created.');
        } catch (e) {
            if (e.response && e.response.status === 400) {
                console.log('Collection might already exist, proceeding to fields...');
            } else {
                throw e;
            }
        }

        // 2. Create Fields
        for (const field of fields) {
            try {
                console.log(`Creating field ${field.name}...`);
                await axios.post(`${API_BASE_URL}/api/collections.fields:create`, {
                    collectionName,
                    ...field
                }, { headers });
            } catch (e) {
                console.log(`Field ${field.name} might already exist or error: ${e.message}`);
            }
        }

        console.log('BUHO Schema creation complete.');

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

createBuhoSchema();
