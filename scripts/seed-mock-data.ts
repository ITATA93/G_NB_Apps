
/**
 * Seed Mock Data for Visual Complexity
 * 
 * PURPOSE:
 * Populate 'onco_casos' and 'schedule_blocks' with 50+ records to enable
 * testing of charts, calendars, and complex table views.
 */

import { ApiClient } from '../shared/scripts/ApiClient.js';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

// Configure Faker for Spanish data (if available, otherwise fallback)
// faker.locale = 'es'; 

dotenv.config();

const api = new ApiClient();

// OPTIONS
const ONCO_CASES_COUNT = 30;
const SCHEDULE_BLOCKS_COUNT = 20;

// Data Dictionaries
const DIAGNOSES = [
    'Carcinoma ductal infiltrante de mama',
    'Adenocarcinoma de colon',
    'Carcinoma de células escamosas de pulmón',
    'Linfoma No-Hodgkin',
    'Melanoma maligno',
    'Cáncer gástrico avanzado',
    'Leucemia Mieloide Aguda'
];

const STATES = ['Ingresado', 'En Comité', 'En Tratamiento', 'Cuidados Paliativos', 'Alta', 'Fallecido'];
const SCHEDULE_STATUS = ['Programado', 'Realizado', 'Cancelado', 'Reprogramado'];

async function getOrCreateDependencies() {
    console.log('🔍 Resolving dependencies (Staff / Activity Types)...');
    
    // 1. Staff
    let staff = await api.listAll('staff', { pageSize: 5 });
    if (staff.length === 0) {
        console.log('   Creating dummy staff...');
        const s = await api.post('staff', { first_name: 'Juan', last_name: 'Perez', role: 'Medico' });
        staff = [s];
    }
    
    // 2. Activity Types
    let activityTypes = await api.listAll('activity_types', { pageSize: 5 });
    if (activityTypes.length === 0) {
        console.log('   Creating dummy activity types...');
        const a1 = await api.post('activity_types', { name: 'Consulta', color: '#1f77ff' });
        const a2 = await api.post('activity_types', { name: 'Cirugia', color: '#ff2233' });
        const a3 = await api.post('activity_types', { name: 'Comite', color: '#22ff55' });
        activityTypes = [a1, a2, a3];
    }
    
    return { staff, activityTypes };
}

async function seedOncoCases() {
    console.log(`\n💉 Seeding ${ONCO_CASES_COUNT} Oncology Cases...`);
    
    for (let i = 0; i < ONCO_CASES_COUNT; i++) {
        const admissionDate = faker.date.past({ years: 1 });
        const rut = `${faker.number.int({ min: 5000000, max: 25000000 })}-${faker.string.numeric(1)}`;
        
        const data = {
            paciente_rut: rut,
            fecha_ingreso: admissionDate.toISOString().split('T')[0], // YYYY-MM-DD
            diagnostico_principal: faker.helpers.arrayElement(DIAGNOSES),
            estado: faker.helpers.arrayElement(STATES),
            observaciones: faker.lorem.sentence()
        };

        try {
            await api.post('onco_casos', data);
            process.stdout.write('.');
        } catch (_e: any) {
            process.stdout.write('x');
        }
    }
    console.log('\n✅ Onco Cases Seeded.');
}

async function seedSchedule(staff: any[], activityTypes: any[]) {
    console.log(`\n📅 Seeding ${SCHEDULE_BLOCKS_COUNT} Schedule Blocks...`);

    for (let i = 0; i < SCHEDULE_BLOCKS_COUNT; i++) {
        const startDate = faker.date.recent({ days: 30 }); // Last 30 days and next few days
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
        
        const randomStaff = faker.helpers.arrayElement(staff);
        const randomType = faker.helpers.arrayElement(activityTypes);

        const data = {
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
            status: faker.helpers.arrayElement(SCHEDULE_STATUS),
            staffId: randomStaff.id,
            activityTypeId: randomType.id,
            notes: faker.lorem.words(3)
        };

        try {
            await api.post('schedule_blocks', data);
            process.stdout.write('.');
        } catch (e: any) {
            console.error(e.message);
            process.stdout.write('x');
        }
    }
    console.log('\n✅ Schedule Blocks Seeded.');
}

async function main() {
    console.log('🚀 Starting Mock Data Seeder...');
    try {
        const { staff, activityTypes } = await getOrCreateDependencies();
        await seedOncoCases();
        await seedSchedule(staff, activityTypes);
        console.log('\n✨ DONE! Database populated for visual testing.');
    } catch (e: any) {
        console.error('\n❌ Fatal Error:', e.message);
    }
}

main();
