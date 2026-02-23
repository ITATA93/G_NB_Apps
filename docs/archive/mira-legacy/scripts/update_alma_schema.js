const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');
const TARGET_COLLECTION = 'ALMA_Usuarios';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    },
    validateStatus: () => true
});

const newFields = [
    { name: 'nombre_profesional', type: 'string', title: 'Nombre Profesional' },
    { name: 'apellidos', type: 'string', title: 'Apellidos' },
    { name: 'activo', type: 'string', title: 'Activo' },
    { name: 'fecha_creacion', type: 'string', title: 'Fecha Creacion (ALMA)' },
    { name: 'hora_creacion', type: 'string', title: 'Hora Creacion (ALMA)' },
    { name: 'fecha_ultimo_ingreso', type: 'string', title: 'Fecha Ultimo Ingreso' },
    { name: 'establecimiento_principal', type: 'string', title: 'Establecimiento Principal' },
    { name: 'grupo_seguridad', type: 'string', title: 'Grupo Seguridad' },
    { name: 'cod_establecimiento', type: 'string', title: 'Cod Establecimiento' }
];

async function updateSchema() {
    console.log(`Updating ${TARGET_COLLECTION} schema...`);

    for (const field of newFields) {
        try {
            // Check if field exists first (optional, but good practice)
            // For simplicity, we'll try to create it. API might error if exists, which is fine.
            const payload = {
                interface: 'input',
                name: field.name,
                type: field.type,
                uiSchema: {
                    title: field.title,
                    'x-component': 'Input'
                }
            };

            const res = await apiClient.post(`/collections/${TARGET_COLLECTION}/fields`, payload);
            if (res.status === 200 || res.status === 201) {
                console.log(`Field '${field.name}' created.`);
            } else {
                console.log(`Failed to create '${field.name}': ${res.status} - ${JSON.stringify(res.data?.errors || res.data)}`);
            }
        } catch (e) {
            console.error(`Exception creating '${field.name}':`, e.message);
        }
    }
}

updateSchema();
