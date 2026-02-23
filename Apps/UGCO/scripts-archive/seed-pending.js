require('dotenv').config({ path: '../../.env' });
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
};

const DATA_DIR = path.resolve(__dirname, '../../BD/diccionarios_raw');

function readJson(filename) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

async function seedCollection(collectionName, data, idField = 'codigo_oficial') {
    console.log(`Seeding ${collectionName} with ${data.length} records...`);
    let successCount = 0;
    for (const item of data) {
        try {
            const exists = await axios.get(`${API_BASE_URL}/api/${collectionName}:list`, {
                headers,
                params: { filter: JSON.stringify({ [idField]: item[idField] }), pageSize: 1 }
            });

            if (exists.data.data && exists.data.data.length > 0) {
                await axios.put(`${API_BASE_URL}/api/${collectionName}:update/${exists.data.data[0].id}`, item, { headers });
            } else {
                await axios.post(`${API_BASE_URL}/api/${collectionName}:create`, item, { headers });
            }
            successCount++;
        } catch (error) {
            console.error(`❌ Error processing ${item[idField]}:`, error.response ? error.response.data : error.message);
        }
        if (successCount % 50 === 0) process.stdout.write('.');
    }
    console.log(`\n✅ ${collectionName}: ${successCount} processed.`);
}

async function main() {
    // 1. Especialidades (Anexo 10)
    const anexo10 = readJson('DEIS_Esquema_Registros_2025_Corregido__Anexo_10.json');
    if (anexo10 && anexo10.entries) {
        const especialidades = [];
        for (const entry of anexo10.entries) {
            if (entry['Anexo 10'] === 'Código' || entry['Anexo 10'] === undefined) continue;

            const code = String(entry['Anexo 10']).trim();
            const name = entry['__EMPTY'];

            if (code && name) {
                especialidades.push({
                    codigo_oficial: code,
                    descripcion: name,
                    sistema_codificacion: 'DEIS',
                    version: '2025',
                    activo: true
                });
            }
        }
        await seedCollection('ref_especialidad_medica', especialidades);
    }

    // 2. Local Dictionaries from GESTORAS
    const gestoras = readJson('UGCO_Diccionario_Local_COLUMNAS_Y_DICCIONARIO__GESTORAS_.json');
    if (gestoras && gestoras.entries) {
        const etapas = new Set();
        const indicaciones = new Set();
        const estados = new Set();

        for (const entry of gestoras.entries) {
            if (entry['Etapa Clinica']) etapas.add(String(entry['Etapa Clinica']).trim());
            if (entry['Indicación de Comité']) indicaciones.add(String(entry['Indicación de Comité']).trim());
            if (entry['ESTADO DE CASO ']) estados.add(String(entry['ESTADO DE CASO ']).trim());
        }

        // Helper to create objects
        const createObjects = (set, prefix) => Array.from(set).filter(v => v && v !== 'Etapa clinica' && v !== 'Indicacion de comité' && v !== 'ESTADO DE CASO').map((v, i) => ({
            codigo_oficial: `${prefix}_${i + 1}`,
            descripcion: v,
            sistema_codificacion: 'LOCAL',
            activo: true
        }));

        const etapasData = createObjects(etapas, 'EC');
        const indicacionesData = createObjects(indicaciones, 'IC');
        const estadosData = createObjects(estados, 'ECASO');

        await seedCollection('ref_etapa_clinica', etapasData);
        await seedCollection('ref_indicacion_comite', indicacionesData);
        await seedCollection('ref_estado_caso', estadosData);
    }
}

main();
