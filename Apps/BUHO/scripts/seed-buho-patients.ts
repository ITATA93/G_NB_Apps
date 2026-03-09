/**
 * seed-buho-patients.ts — Carga 5 pacientes ficticios de prueba en BUHO
 *
 * Uso:
 *   NOCOBASE_BASE_URL=... NOCOBASE_API_KEY=... npx tsx Apps/BUHO/scripts/seed-buho-patients.ts
 */

import { createClient, log } from '../../../shared/scripts/ApiClient.js';

const client = createClient();

const PATIENTS = [
  {
    nombre: 'María Elena Soto González',
    rut: '12.345.678-9',
    episodio: 'EP-2026-0001',
    servicio: 'Medicina Interna',
    sala: 'MQ1',
    cama: '101-A',
    diagnostico_principal: 'Neumonía adquirida en la comunidad',
    medico_tratante: 'Dr. Carlos Mendoza',
    fecha_ingreso: '2026-03-05',
    estado_plan: 'activo',
    riesgo_detectado: 'medio',
  },
  {
    nombre: 'Juan Alberto Pérez Muñoz',
    rut: '11.222.333-4',
    episodio: 'EP-2026-0002',
    servicio: 'Cirugía General',
    sala: 'MQ2',
    cama: '205-B',
    diagnostico_principal: 'Apendicitis aguda — Post-operatorio',
    medico_tratante: 'Dra. Ana López',
    fecha_ingreso: '2026-03-07',
    estado_plan: 'activo',
    riesgo_detectado: 'bajo',
  },
  {
    nombre: 'Rosa Beatriz Contreras Villalobos',
    rut: '9.876.543-2',
    episodio: 'EP-2026-0003',
    servicio: 'UCI',
    sala: 'UCI',
    cama: 'UCI-03',
    diagnostico_principal: 'Sepsis de foco urinario',
    medico_tratante: 'Dr. Pedro Fuentes',
    fecha_ingreso: '2026-03-01',
    estado_plan: 'crítico',
    riesgo_detectado: 'alto',
  },
  {
    nombre: 'Diego Andrés Morales Tapia',
    rut: '15.432.109-8',
    episodio: 'EP-2026-0004',
    servicio: 'Traumatología',
    sala: 'MQ3',
    cama: '312-A',
    diagnostico_principal: 'Fractura de cadera derecha',
    medico_tratante: 'Dr. Roberto Salas',
    fecha_ingreso: '2026-03-08',
    estado_plan: 'activo',
    riesgo_detectado: 'medio',
  },
  {
    nombre: 'Catalina Isabel Rojas Fernández',
    rut: '18.765.432-1',
    episodio: 'EP-2026-0005',
    servicio: 'Pediatría',
    sala: 'PED',
    cama: 'PED-02',
    diagnostico_principal: 'Crisis asmática moderada',
    medico_tratante: 'Dra. Francisca Torres',
    fecha_ingreso: '2026-03-09',
    estado_plan: 'observación',
    riesgo_detectado: 'bajo',
  },
];

async function main() {
  log('═══════════════════════════════════════════════', 'cyan');
  log(' Seed Data — BUHO Pacientes de Prueba (5)', 'cyan');
  log('═══════════════════════════════════════════════', 'cyan');

  // Check existing
  try {
    const existing = await client.get('/buho_pacientes:list', { pageSize: 1 });
    const count = existing.data?.length || 0;
    if (count > 0) {
      log(`\n  ⏭  buho_pacientes ya tiene datos (${count}+ registros). Saltando.`, 'yellow');
      return;
    }
  } catch {
    log('  ⚠️  No se pudo verificar datos existentes. Intentando insertar...', 'yellow');
  }

  let ok = 0;
  for (const p of PATIENTS) {
    try {
      await client.post('/buho_pacientes:create', p);
      log(`  ✅ ${p.nombre} (${p.rut})`, 'green');
      ok++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      log(`  ❌ ${p.nombre}: ${msg}`, 'red');
    }
  }

  log(`\n═══════════════════════════════════════════════`, 'green');
  log(` Resultado: ${ok}/${PATIENTS.length} pacientes insertados`, 'green');
  log('═══════════════════════════════════════════════', 'green');
}

main().catch(err => {
  log(`\n❌ Error fatal: ${err.message}`, 'red');
  process.exit(1);
});
