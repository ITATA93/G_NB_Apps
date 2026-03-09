/**
 * seed-entrega-references.ts — Carga datos de referencia para Entrega de Turno
 *
 * Colecciones:
 *   - et_especialidades (9 especialidades médicas)
 *   - et_servicios (12 servicios hospitalarios)
 *
 * Uso:
 *   NOCOBASE_BASE_URL=... NOCOBASE_API_KEY=... npx tsx Apps/ENTREGA/scripts/seed-entrega-references.ts
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
    collection: 'et_especialidades',
    label: 'Especialidades Médicas',
    uniqueField: 'codigo',
    data: [
      { nombre: 'Medicina Interna', codigo: 'MI', activa: true },
      { nombre: 'Cirugía General', codigo: 'CG', activa: true },
      { nombre: 'Medicina Intensiva', codigo: 'MINT', activa: true },
      { nombre: 'Pediatría', codigo: 'PED', activa: true },
      { nombre: 'Obstetricia/Ginecología', codigo: 'OBG', activa: true },
      { nombre: 'Traumatología', codigo: 'TRAU', activa: true },
      { nombre: 'Neonatología', codigo: 'NEO', activa: true },
      { nombre: 'Cirugía Infantil', codigo: 'CI', activa: true },
      { nombre: 'Multidisciplinario', codigo: 'MULTI', activa: true },
    ],
  },
  {
    collection: 'et_servicios',
    label: 'Servicios Hospitalarios',
    uniqueField: 'codigo',
    data: [
      { codigo: 'MQ1', nombre: 'Medicina Quirúrgica 1', activo: true },
      { codigo: 'MQ2', nombre: 'Medicina Quirúrgica 2', activo: true },
      { codigo: 'MQ3', nombre: 'Medicina Quirúrgica 3', activo: true },
      { codigo: 'PCER', nombre: 'Pensionado Cerrado', activo: true },
      { codigo: 'UCI', nombre: 'Unidad Cuidados Intensivos', activo: true },
      { codigo: 'UTI', nombre: 'Unidad Tratamiento Intermedio', activo: true },
      { codigo: 'CIBU', nombre: 'Cirugía Infantil', activo: true },
      { codigo: 'PED', nombre: 'Pediatría', activo: true },
      { codigo: 'OBST', nombre: 'Obstetricia', activo: true },
      { codigo: 'GIN', nombre: 'Ginecología', activo: true },
      { codigo: 'NEO', nombre: 'Neonatología', activo: true },
      { codigo: 'TRAU', nombre: 'Traumatología', activo: true },
    ],
  },
];

async function seedCollection(cfg: SeedConfig) {
  log(`\n📦 Sembrando ${cfg.label} (${cfg.collection})...`, 'cyan');

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
        ok++;
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
  log(' Seed Data — Entrega de Turno', 'cyan');
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
