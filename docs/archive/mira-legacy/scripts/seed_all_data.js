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

async function seedAllData() {
    try {
        console.log('Starting comprehensive data seeding...');

        // --- Helper to seed a collection if empty ---
        const seedCollection = async (name, data) => {
            try {
                const check = await apiClient.get(`/${name}:list?pageSize=1`);
                if (check.data.data.length === 0) {
                    console.log(`Seeding ${name}...`);
                    for (const item of data) {
                        try {
                            await apiClient.post(`/${name}`, item);
                        } catch (e) {
                            console.error(`Error inserting into ${name}:`, e.message);
                        }
                    }
                } else {
                    console.log(`${name} already has data. Skipping.`);
                }
            } catch (e) {
                console.error(`Error checking/seeding ${name}:`, e.message);
            }
        };

        // --- 1. REF Tables (Dictionaries) ---
        await seedCollection('ref_oncoespecialidad', [
            { codigo_oficial: 'ONCO_MED', nombre: 'Oncología Médica', activo: true },
            { codigo_oficial: 'HEMATO', nombre: 'Hematología', activo: true }
        ]);

        await seedCollection('ref_oncodiagnostico', [
            { codigo: 'C50', nombre: 'Neoplasia maligna de la mama' },
            { codigo: 'C18', nombre: 'Neoplasia maligna del colon' }
        ]);

        await seedCollection('ref_oncoestadocaso', [
            { codigo: 'ACTIVO', nombre: 'Activo' },
            { codigo: 'CERRADO', nombre: 'Cerrado' }
        ]);

        // --- 2. ALMA Tables (Simulated Hospital Data) ---
        await seedCollection('alma_paciente', [
            { rut: '11.111.111-1', nombre: 'Paciente Uno', fecha_nacimiento: '1980-01-01' },
            { rut: '22.222.222-2', nombre: 'Paciente Dos', fecha_nacimiento: '1990-05-05' }
        ]);

        // --- 3. UGCO Tables ---
        await seedCollection('ugco_casooncologico', [
            {
                id_paciente: 1, // Assuming ID 1 exists from alma_paciente
                fecha_diagnostico: '2023-01-01',
                diagnostico_principal: 'C50',
                estado_caso: 'ACTIVO'
            }
        ]);

        await seedCollection('ugco_comiteoncologico', [
            { fecha_comite: '2023-11-01', tipo_comite: 'Mama', resolucion: 'Quimioterapia' }
        ]);

        // --- 4. BUHO Tables (Already seeded, but good to ensure) ---
        await seedCollection('buho_pacientes', [
            { nombre: 'Extra Patient', estado_plan: 'Pendiente' }
        ]);

        console.log('Comprehensive seeding completed.');

    } catch (error) {
        console.error('Global Error:', error.message);
    }
}

seedAllData();
