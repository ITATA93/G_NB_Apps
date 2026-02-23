require('dotenv').config({ path: '../../.env' });
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = process.env.API_BASE_URL;
const API_KEY = process.env.API_KEY;

if (!API_BASE_URL || !API_KEY) {
    console.error('❌ Missing API_BASE_URL or API_KEY in .env');
    process.exit(1);
}

const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
};

const DATA_DIR = path.resolve(__dirname, '../../BD/diccionarios_raw');

// Helper to read JSON
function readJson(filename) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

async function seedCollection(collectionName, data, idField = 'codigo_oficial') {
    console.log(`Seeding ${collectionName} with ${data.length} records...`);
    let successCount = 0;
    let errorCount = 0;

    for (const item of data) {
        try {
            // Check if exists
            const exists = await axios.get(`${API_BASE_URL}/api/${collectionName}:list`, {
                headers,
                params: {
                    filter: JSON.stringify({ [idField]: item[idField] }),
                    pageSize: 1
                }
            });

            if (exists.data.data && exists.data.data.length > 0) {
                // Update
                const id = exists.data.data[0].id;
                await axios.put(`${API_BASE_URL}/api/${collectionName}:update/${id}`, item, { headers });
            } else {
                // Create
                await axios.post(`${API_BASE_URL}/api/${collectionName}:create`, item, { headers });
            }
            successCount++;
        } catch (error) {
            console.error(`❌ Error processing ${item[idField]}:`, error.response ? error.response.data : error.message);
            errorCount++;
        }

        if (successCount % 50 === 0) process.stdout.write('.');
    }
    console.log(`\n✅ ${collectionName}: ${successCount} processed, ${errorCount} errors.`);
}

async function main() {
    // 1. Process Anexo 2 (Regions and Communes)
    const anexo2 = readJson('DEIS_Esquema_Registros_2025_Corregido__Anexo_2.json');
    if (anexo2 && anexo2.entries) {
        const regionsMap = new Map();
        const comunas = [];

        for (const entry of anexo2.entries) {
            // Skip header rows or empty entries
            if (!entry['Anexo 2'] || entry['Anexo 2'] === 'Comunas' || entry['Anexo 2'] === 'Código Comuna') continue;

            const comunaCode = String(entry['Anexo 2']).trim();
            const comunaName = entry['__EMPTY'];
            const regionCode = String(entry['__EMPTY_1']).trim();
            const regionName = entry['__EMPTY_2'];

            if (comunaCode && comunaName && regionCode && regionName) {
                // Add Region if new
                if (!regionsMap.has(regionCode)) {
                    regionsMap.set(regionCode, {
                        codigo_oficial: regionCode,
                        descripcion: regionName,
                        sistema_codificacion: 'DEIS',
                        version: '2025',
                        activo: true
                    });
                }

                // Add Comuna
                comunas.push({
                    codigo_oficial: comunaCode,
                    descripcion: comunaName,
                    codigo_region: regionCode,
                    sistema_codificacion: 'DEIS',
                    version: '2025',
                    activo: true
                });
            }
        }

        const regions = Array.from(regionsMap.values());
        console.log(`Found ${regions.length} regions and ${comunas.length} comunas.`);

        await seedCollection('ref_region', regions);

        // Fetch Regions to get IDs for linking
        console.log('Fetching Regions to link Comunas...');
        const regionsDB = await axios.get(`${API_BASE_URL}/api/ref_region:list`, { headers, params: { pageSize: 2000 } });
        const regionMapDB = new Map(regionsDB.data.data.map(r => [r.codigo_oficial, r.id]));

        // Link Comunas to Regions
        comunas.forEach(c => {
            if (regionMapDB.has(c.codigo_region)) {
                c.region = regionMapDB.get(c.codigo_region);
            }
        });

        await seedCollection('ref_comuna', comunas);
    }

    // 2. Process Anexo 4 (Establecimientos)
    const anexo4 = readJson('DEIS_Esquema_Registros_2025_Corregido__Anexo_4.json');
    if (anexo4 && anexo4.entries) {
        // Fetch Comunas and Regions to get IDs for linking
        console.log('Fetching Comunas and Regions to link Establishments...');
        const regionsDB = await axios.get(`${API_BASE_URL}/api/ref_region:list`, { headers, params: { pageSize: 2000 } });
        const comunasDB = await axios.get(`${API_BASE_URL}/api/ref_comuna:list`, { headers, params: { pageSize: 2000 } });

        const regionMapDB = new Map(regionsDB.data.data.map(r => [r.codigo_oficial, r.id]));
        const comunaMapDB = new Map(comunasDB.data.data.map(c => [c.codigo_oficial, c.id]));

        const establecimientos = [];

        for (const entry of anexo4.entries) {
            // Skip header rows
            if (!entry['Anexo 4'] || entry['Anexo 4'] === 'Establecimientos de procedencia' || entry['Anexo 4'] === 'Código nuevo Establecimiento') continue;

            const estCode = String(entry['Anexo 4']).trim();
            const estName = entry['__EMPTY_5'];
            const servicio = entry['__EMPTY'];
            const tipo = entry['__EMPTY_3'];
            const comunaCode = String(entry['__EMPTY_6']).trim();
            const regionCode = String(entry['__EMPTY_7']).trim();

            if (estCode && estName) {
                const est = {
                    codigo_oficial: estCode,
                    descripcion: estName,
                    codigo_comuna: comunaCode,
                    codigo_region: regionCode,
                    servicio_salud: servicio,
                    tipo_establecimiento: tipo,
                    sistema_codificacion: 'DEIS',
                    version: '2025',
                    activo: true
                };

                if (regionMapDB.has(regionCode)) est.region = regionMapDB.get(regionCode);
                if (comunaMapDB.has(comunaCode)) est.comuna = comunaMapDB.get(comunaCode);

                establecimientos.push(est);
            }
        }

        console.log(`Found ${establecimientos.length} establecimientos.`);
        await seedCollection('ref_establecimiento', establecimientos);
    }
}

main();
