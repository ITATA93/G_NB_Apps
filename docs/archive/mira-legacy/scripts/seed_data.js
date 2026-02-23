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

async function createRecord(collection, data) {
    try {
        // Standard NocoBase REST API: POST /api/<collectionName>
        await apiClient.post(`/${collection}`, data);
        console.log(`[${collection}] Registro creado.`);
    } catch (error) {
        console.error(`[${collection}] Error creando registro:`, error.response ? error.response.data : error.message);
    }
}

async function seed() {
    console.log('--- Iniciando carga de datos de prueba ---');

    // 1. Diccionarios (REF_*)

    // REF_OncoEspecialidad
    const especialidades = [
        { codigo_oficial: 'DIG_ALTO', nombre: 'Digestivo Alto', activo: true },
        { codigo_oficial: 'MAMA', nombre: 'Patología Mamaria', activo: true },
        { codigo_oficial: 'UROLO', nombre: 'Urología Oncológica', activo: true },
        { codigo_oficial: 'CABEZA_CUELLO', nombre: 'Cabeza y Cuello', activo: true }
    ];
    for (const item of especialidades) await createRecord('ref_oncoespecialidad', item);

    // REF_OncoEstadoClinico
    const estadosClinicos = [
        { codigo_oficial: 'SOSPECHA', nombre: 'Sospecha Diagnóstica' },
        { codigo_oficial: 'CONFIRMADO', nombre: 'Confirmado' },
        { codigo_oficial: 'RECURRENCIA', nombre: 'Recurrencia' }
    ];
    for (const item of estadosClinicos) await createRecord('ref_oncoestadoclinico', item);

    // REF_OncoEstadoAdm
    const estadosAdm = [
        { codigo_oficial: 'DIAGNOSTICO', nombre: 'En Proceso Diagnóstico' },
        { codigo_oficial: 'ETAPIFICACION', nombre: 'En Etapificación' },
        { codigo_oficial: 'TRATAMIENTO', nombre: 'En Tratamiento' },
        { codigo_oficial: 'SEGUIMIENTO', nombre: 'En Seguimiento' }
    ];
    for (const item of estadosAdm) await createRecord('ref_oncoestadoadm', item);

    // REF_OncoEstadoCaso
    const estadosCaso = [
        { codigo_oficial: 'ACTIVO', nombre: 'Activo' },
        { codigo_oficial: 'CERRADO', nombre: 'Cerrado' },
        { codigo_oficial: 'FALLECIDO', nombre: 'Fallecido' }
    ];
    for (const item of estadosCaso) await createRecord('ref_oncoestadocaso', item);


    // 2. Datos ALMA (Simulados)

    // ALMA_Paciente
    const pacientes = [
        {
            rut: '11111111-1',
            nombre: 'Juan',
            apellido_paterno: 'Pérez',
            apellido_materno: 'González',
            fecha_nacimiento: '1980-05-15',
            sexo: 'M'
        },
        {
            rut: '22222222-2',
            nombre: 'María',
            apellido_paterno: 'López',
            apellido_materno: 'Soto',
            fecha_nacimiento: '1992-11-20',
            sexo: 'F'
        },
        {
            rut: '33333333-3',
            nombre: 'Carlos',
            apellido_paterno: 'Ruiz',
            apellido_materno: 'Díaz',
            fecha_nacimiento: '1975-03-10',
            sexo: 'M'
        }
    ];

    for (const p of pacientes) await createRecord('alma_paciente', p);

    // ALMA_Diagnostico
    const diagnosticos = [
        { codigo_cie10: 'C16.9', glosa: 'Tumor maligno del estómago, parte no especificada' },
        { codigo_cie10: 'C50.9', glosa: 'Tumor maligno de la mama, parte no especificada' },
        { codigo_cie10: 'C61', glosa: 'Tumor maligno de la próstata' }
    ];
    for (const d of diagnosticos) await createRecord('alma_diagnostico', d);

    console.log('--- Carga de datos finalizada ---');
}

seed();
