/**
 * seed-agenda-references.ts — Carga datos de referencia para Agenda Médica
 *
 * Colecciones:
 *   - ag_categorias_actividad (16 categorías con colores)
 *   - ag_tipos_inasistencia (6 tipos)
 *   - ag_servicios (10 servicios hospitalarios)
 *
 * Uso:
 *   NOCOBASE_BASE_URL=... NOCOBASE_API_KEY=... npx tsx Apps/AGENDA/scripts/seed-agenda-references.ts
 */

import { createClient, log } from '../../../shared/scripts/ApiClient.js';

const client = createClient();

interface SeedConfig {
  collection: string;
  label: string;
  uniqueField: string;
  data: Record<string, unknown>[];
}

const SEEDS: SeedConfig[] = [
  {
    collection: 'ag_categorias_actividad',
    label: 'Categorías de Actividad',
    uniqueField: 'codigo',
    data: [
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
    ],
  },
  {
    collection: 'ag_tipos_inasistencia',
    label: 'Tipos de Inasistencia',
    uniqueField: 'codigo',
    data: [
      { nombre: 'Permiso Administrativo', codigo: 'PA', activo: true },
      { nombre: 'Licencia Médica', codigo: 'LM', activo: true },
      { nombre: 'Comisión de Servicio', codigo: 'CS', activo: true },
      { nombre: 'Capacitación', codigo: 'CAP', activo: true },
      { nombre: 'Feriado Legal', codigo: 'FL', activo: true },
      { nombre: 'Día Compensatorio', codigo: 'DC', activo: true },
    ],
  },
  {
    collection: 'ag_servicios',
    label: 'Servicios Hospitalarios',
    uniqueField: 'codigo',
    data: [
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
    ],
  },
];

async function seedCollection(cfg: SeedConfig) {
  log(`\n📦 Sembrando ${cfg.label} (${cfg.collection})...`, 'cyan');

  // Check existing
  try {
    const existing = await client.get(`/${cfg.collection}:list`, { pageSize: 1 });
    const count = existing.data?.length || 0;
    if (count > 0) {
      log(`  ⏭  Ya tiene datos (${count}+ registros). Saltando.`, 'yellow');
      return { ok: 0, skip: cfg.data.length };
    }
  } catch {
    log(`  ⚠️  No se pudo verificar datos existentes. Intentando insertar...`, 'yellow');
  }

  let ok = 0, fail = 0;
  for (const row of cfg.data) {
    try {
      await client.post(`/${cfg.collection}:create`, row);
      ok++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('duplicate') || msg.includes('unique')) {
        ok++; // Already exists, count as OK
      } else {
        log(`  ❌ Error insertando ${(row as Record<string, unknown>)[cfg.uniqueField]}: ${msg}`, 'red');
        fail++;
      }
    }
  }

  log(`  ✅ ${ok}/${cfg.data.length} insertados${fail > 0 ? ` | ❌ ${fail} errores` : ''}`, 'green');
  return { ok, skip: 0 };
}

async function main() {
  log('═══════════════════════════════════════════════', 'cyan');
  log(' Seed Data — Agenda Médica Hospitalaria', 'cyan');
  log('═══════════════════════════════════════════════', 'cyan');

  let totalOk = 0, totalSkip = 0;

  for (const seed of SEEDS) {
    const result = await seedCollection(seed);
    totalOk += result.ok;
    totalSkip += result.skip;
  }

  log(`\n═══════════════════════════════════════════════`, 'green');
  log(` Resultado: ${totalOk} insertados | ${totalSkip} saltados`, 'green');
  log('═══════════════════════════════════════════════', 'green');
}

main().catch(err => {
  log(`\n❌ Error fatal: ${err.message}`, 'red');
  process.exit(1);
});
