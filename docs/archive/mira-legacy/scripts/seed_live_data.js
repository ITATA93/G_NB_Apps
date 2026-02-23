const axios = require('axios');

const API_BASE_URL = 'https://mira.hospitaldeovalle.cl/api';
const API_KEY = (process.env.NOCOBASE_API_KEY || '');

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
    }
});

async function seedCollection(name, data) {
    try {
        console.log(`Seeding ${name}...`);
        for (const item of data) {
            try {
                await apiClient.post(`/${name}`, item);
                // console.log(`  Inserted item into ${name}`);
            } catch (e) {
                // Ignore unique constraint errors or similar if re-seeding
                console.error(`  Error inserting into ${name}:`, e.response?.data?.errors?.[0]?.message || e.message);
            }
        }
    } catch (e) {
        console.error(`Error seeding ${name}:`, e.message);
    }
}

async function main() {
    console.log('Starting live data seeding...');

    // 1. REF Tables
    await seedCollection('ref_oncodiagnostico', [
        { codigo: 'C50', nombre: 'Neoplasia maligna de la mama' },
        { codigo: 'C18', nombre: 'Neoplasia maligna del colon' },
        { codigo: 'C34', nombre: 'Neoplasia maligna de los bronquios y del pulmón' }
    ]);

    // 2. UGCO Tables
    await seedCollection('ugco_comiteoncologico', [
        { fecha_comite: '2023-11-01', tipo_comite: 'Mama', resolucion: 'Quimioterapia neoadyuvante' },
        { fecha_comite: '2023-11-15', tipo_comite: 'Digestivo', resolucion: 'Cirugía programada' }
    ]);

    // 3. BUHO Tables (Note: Using BUHO_Pacientes as per live instance)
    await seedCollection('BUHO_Pacientes', [
        { nombre: 'Juan Perez', estado_cama: 'Ocupada', diagnostico: 'Neumonía' },
        { nombre: 'Maria Gonzalez', estado_cama: 'Disponible', diagnostico: '' },
        { nombre: 'Pedro Soto', estado_cama: 'Ocupada', diagnostico: 'Fractura' }
    ]);

    console.log('Seeding completed.');
}

main();
