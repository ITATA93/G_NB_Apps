/**
 * Seed AGENDA catalog data from app-spec/app.yaml.
 * Run: npx tsx shared/scripts/seed-agenda-data.ts
 */
import { createClient, log } from './ApiClient.ts';

const CATEGORIAS = [
    { nombre: 'Visita', codigo: 'VIS', grupo: 'Clínica', orden: 1, color: '#3B82F6', activa: true },
    { nombre: 'Sala', codigo: 'SALA', grupo: 'Clínica', orden: 2, color: '#10B981', activa: true },
    { nombre: 'ENT', codigo: 'ENT', grupo: 'Clínica', orden: 3, color: '#8B5CF6', activa: true },
    { nombre: 'Pabellón', codigo: 'PAB', grupo: 'Quirúrgica', orden: 4, color: '#EF4444', activa: true },
    { nombre: 'Cirugía Menor', codigo: 'CX.MEN', grupo: 'Quirúrgica', orden: 5, color: '#F97316', activa: true },
    { nombre: 'Poli General', codigo: 'POLI', grupo: 'Policlínico', orden: 6, color: '#06B6D4', activa: true },
    { nombre: 'Poli Vascular', codigo: 'P.VAS', grupo: 'Policlínico', orden: 7, color: '#0891B2', activa: true },
    { nombre: 'Poli Hidatidosis', codigo: 'POLI.HID', grupo: 'Policlínico', orden: 8, color: '#0E7490', activa: true },
    { nombre: 'Poli Oncológico', codigo: 'P.ONC', grupo: 'Oncología', orden: 9, color: '#DB2777', activa: true },
    { nombre: 'Comité Oncológico', codigo: 'C.ONC', grupo: 'Oncología', orden: 10, color: '#BE185D', activa: true },
    { nombre: 'Informe Oncológico', codigo: 'INF.ONC', grupo: 'Oncología', orden: 11, color: '#9D174D', activa: true },
    { nombre: 'Gestión Interconsulta', codigo: 'G.INTER', grupo: 'Clínica', orden: 12, color: '#059669', activa: true },
    { nombre: 'Reuniones', codigo: 'R', grupo: 'Administrativa', orden: 13, color: '#D97706', activa: true },
    { nombre: 'Jefatura', codigo: 'JEF', grupo: 'Administrativa', orden: 14, color: '#92400E', activa: true },
    { nombre: 'Endoscopía', codigo: 'ENDO', grupo: 'Quirúrgica', orden: 15, color: '#7C3AED', activa: true },
    { nombre: 'Teletrabajo', codigo: 'T.TRAB', grupo: 'Otro', orden: 16, color: '#6366F1', activa: true },
];

const TIPOS_INASISTENCIA = [
    { nombre: 'Permiso Administrativo', codigo: 'PA', activo: true },
    { nombre: 'Licencia Médica', codigo: 'LM', activo: true },
    { nombre: 'Comisión de Servicio', codigo: 'CS', activo: true },
    { nombre: 'Capacitación', codigo: 'CAP', activo: true },
    { nombre: 'Feriado Legal', codigo: 'FL', activo: true },
    { nombre: 'Día Compensatorio', codigo: 'DC', activo: true },
];

const SERVICIOS = [
    { nombre: 'Cirugía General', codigo: 'CG', activo: true },
    { nombre: 'Medicina Interna', codigo: 'MI', activo: true },
    { nombre: 'Traumatología', codigo: 'TRAU', activo: true },
    { nombre: 'Pediatría', codigo: 'PED', activo: true },
    { nombre: 'Ginecología', codigo: 'GIN', activo: true },
    { nombre: 'UCI', codigo: 'UCI', activo: true },
    { nombre: 'UTI', codigo: 'UTI', activo: true },
    { nombre: 'Urgencias', codigo: 'URG', activo: true },
    { nombre: 'Oncología', codigo: 'ONC', activo: true },
    { nombre: 'Neonatología', codigo: 'NEO', activo: true },
];

async function seedCollection(client: ReturnType<typeof createClient>, collection: string, records: Record<string, unknown>[]) {
    log(`\n📦 ${collection} (${records.length} registros)`, 'white');
    let ok = 0, fail = 0;
    for (const rec of records) {
        try {
            await client.post(`/${collection}:create`, rec);
            ok++;
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            if (msg.includes('duplicate') || msg.includes('unique')) {
                log(`  ⏭️  ${(rec as Record<string, string>).codigo} (ya existe)`, 'yellow');
            } else {
                log(`  ❌ ${JSON.stringify(rec)}: ${msg}`, 'red');
                fail++;
            }
        }
    }
    log(`  ✅ ${ok} creados, ${fail} errores`, ok > 0 ? 'green' : 'yellow');
}

async function main() {
    const client = createClient();
    log('🌱 Cargando seed data AGENDA...\n', 'cyan');

    await seedCollection(client, 'ag_categorias_actividad', CATEGORIAS);
    await seedCollection(client, 'ag_tipos_inasistencia', TIPOS_INASISTENCIA);
    await seedCollection(client, 'ag_servicios', SERVICIOS);

    log('\n✅ Seed completo.\n', 'green');
}

main().catch(console.error);
