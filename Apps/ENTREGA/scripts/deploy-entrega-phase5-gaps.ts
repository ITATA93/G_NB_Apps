/**
 * deploy-entrega-phase5-gaps.ts
 *
 * Completa los gaps detectados en el análisis blueprint vs estado actual:
 *
 *  1. et_pacientes_censo:
 *     + estado_clinico (select: Estable/Observación/Crítico/Alta pendiente)
 *     + pendientes (text — acciones pendientes del turno)
 *
 *  2. et_turnos:
 *     + incidentes (text — eventos adversos del turno)
 *
 *  3. et_servicios (UNIDADES):
 *     + Seed de unidades faltantes:
 *       PENS (Pensionado), MAT (Maternidad), REC (Recuperación),
 *       PSQ (Psiquiatría), OBST (Obstetricia), NEO (Neonatología),
 *       PCER (Cirugía Pediátrica), URG (Urgencias), CIBU (Cirugía Mayor Ambulatoria)
 *     + Agregar campo 'tipo' (Hospitalización/Crítico/Transitoria/Especialidad)
 *
 *  Idempotente: seguro de re-ejecutar.
 *
 *  Uso:
 *    npx tsx Apps/ENTREGA/scripts/deploy-entrega-phase5-gaps.ts
 *    npx tsx Apps/ENTREGA/scripts/deploy-entrega-phase5-gaps.ts --dry-run
 */

import { createClient, log } from '../../../shared/scripts/ApiClient';

const api = createClient();
const DRY_RUN = process.argv.includes('--dry-run');

// ─── helpers ────────────────────────────────────────────────────────────────

async function addFieldSafe(
  collection: string,
  name: string,
  type: string,
  title: string,
  extra: Record<string, any> = {},
): Promise<boolean> {
  if (DRY_RUN) {
    log(`   [DRY] ${collection}.${name} (${type})`, 'gray');
    return true;
  }
  try {
    const component = type === 'text' ? 'Input.TextArea' : 'Input';
    await (api as any).post(`/collections/${collection}/fields:create`, {
      name,
      type,
      uiSchema: { title, 'x-component': component },
      ...extra,
    });
    log(`   ✅ ${collection}.${name}`, 'green');
    return true;
  } catch (err: any) {
    const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      log(`   ⚠️  ${collection}.${name} ya existe`, 'yellow');
      return true;
    }
    log(`   ❌ ${collection}.${name}: ${msg}`, 'red');
    return false;
  }
}

async function addEnumField(
  collection: string,
  name: string,
  title: string,
  options: string[],
  defaultValue?: string,
): Promise<boolean> {
  if (DRY_RUN) {
    log(`   [DRY] ${collection}.${name} (enum: ${options.join('|')})`, 'gray');
    return true;
  }
  try {
    await (api as any).post(`/collections/${collection}/fields:create`, {
      name,
      type: 'string',
      defaultValue: defaultValue || null,
      uiSchema: {
        title,
        'x-component': 'Select',
        enum: options.map(v => ({ value: v, label: v })),
      },
    });
    log(`   ✅ ${collection}.${name} (enum)`, 'green');
    return true;
  } catch (err: any) {
    const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      log(`   ⚠️  ${collection}.${name} ya existe`, 'yellow');
      return true;
    }
    log(`   ❌ ${collection}.${name}: ${msg}`, 'red');
    return false;
  }
}

async function seedRecord(
  collection: string,
  data: Record<string, any>,
  uniqueKey: string,
): Promise<void> {
  if (DRY_RUN) {
    log(`   [DRY] ${collection}: ${data[uniqueKey]}`, 'gray');
    return;
  }
  try {
    await (api as any).post(`/${collection}:create`, data);
    log(`   ✅ ${data[uniqueKey]}`, 'green');
  } catch (err: any) {
    const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
    if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('already')) {
      log(`   ⚠️  "${data[uniqueKey]}" ya existe`, 'yellow');
    } else {
      log(`   ❌ "${data[uniqueKey]}": ${msg}`, 'red');
    }
  }
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  log('═══════════════════════════════════════════════════════════', 'cyan');
  log('  ENTREGA FASE 5 — Completar gaps del blueprint', 'cyan');
  log('═══════════════════════════════════════════════════════════\n', 'cyan');
  if (DRY_RUN) log('🔍 MODO DRY RUN\n', 'yellow');

  // ── 1. Campos faltantes en et_pacientes_censo ─────────────────────────────
  log('── Paso 1: Campos faltantes en et_pacientes_censo ──\n', 'cyan');

  // estado_clinico: clave para dashboard de críticos y colores de fila
  await addEnumField(
    'et_pacientes_censo',
    'estado_clinico',
    'Estado Clínico',
    ['Estable', 'Observación', 'Crítico', 'Alta pendiente'],
    'Estable',
  );

  // pendientes: acciones pendientes del turno (ERCP, TAC, cultivo...)
  await addFieldSafe('et_pacientes_censo', 'pendientes', 'text', 'Pendientes del Turno');

  // ── 2. Campo faltante en et_turnos ───────────────────────────────────────
  log('\n── Paso 2: Campos faltantes en et_turnos ──\n', 'cyan');

  // incidentes: eventos adversos del turno (sección clave del documento imprimible)
  await addFieldSafe('et_turnos', 'incidentes', 'text', 'Incidentes y Eventos Adversos');

  // ── 3. Agregar campo 'tipo' a et_servicios ───────────────────────────────
  log('\n── Paso 3: Agregar campo tipo a et_servicios ──\n', 'cyan');
  await addEnumField(
    'et_servicios',
    'tipo',
    'Tipo de Unidad',
    ['Hospitalización', 'Crítico', 'Transitoria', 'Especialidad'],
    'Hospitalización',
  );

  // ── 4. Seed unidades faltantes en et_servicios ───────────────────────────
  log('\n── Paso 4: Seed unidades físicas en et_servicios ──\n', 'cyan');

  const UNIDADES_FALTANTES = [
    { codigo: 'PENS',  nombre: 'Pensionado',                     tipo: 'Hospitalización' },
    { codigo: 'MAT',   nombre: 'Maternidad',                     tipo: 'Especialidad' },
    { codigo: 'REC',   nombre: 'Recuperación Post-Anestesia',    tipo: 'Transitoria' },
    { codigo: 'PSQ',   nombre: 'Psiquiatría',                    tipo: 'Especialidad' },
    { codigo: 'OBST',  nombre: 'Obstetricia',                    tipo: 'Especialidad' },
    { codigo: 'NEO',   nombre: 'Neonatología',                   tipo: 'Especialidad' },
    { codigo: 'PCER',  nombre: 'Cirugía Pediátrica / Ambulatoria', tipo: 'Transitoria' },
    { codigo: 'URG',   nombre: 'Urgencias',                      tipo: 'Transitoria' },
    { codigo: 'CIBU',  nombre: 'Cirugía Mayor Ambulatoria',      tipo: 'Hospitalización' },
  ];

  for (const u of UNIDADES_FALTANTES) {
    await seedRecord('et_servicios', u, 'codigo');
  }

  // ── 5. Actualizar unidades existentes con tipo correcto ──────────────────
  log('\n── Paso 5: Actualizar tipo de unidades existentes ──\n', 'cyan');

  const TIPO_POR_CODIGO: Record<string, string> = {
    'S-UCI': 'Crítico', 'S-UTI': 'Crítico',
    'S-MQ1': 'Hospitalización', 'S-MQ2': 'Hospitalización', 'S-MQ3': 'Hospitalización',
    'S-MED': 'Hospitalización', 'S-CIR': 'Hospitalización',
    'S-PED': 'Especialidad', 'S-OBS': 'Especialidad', 'S-NEO': 'Especialidad',
    'S-TRA': 'Especialidad',
  };

  if (!DRY_RUN) {
    for (const [codigo, tipo] of Object.entries(TIPO_POR_CODIGO)) {
      try {
        // Find by codigo first
        const res = await (api as any).get(`/et_servicios:list?filter[codigo]=${codigo}`);
        const record = res?.data?.data?.[0];
        if (record) {
          await (api as any).post(`/et_servicios:update?filterByTk=${record.id}`, { tipo });
          log(`   ✅ ${codigo} → tipo="${tipo}"`, 'green');
        } else {
          log(`   ⚠️  ${codigo} no encontrado`, 'yellow');
        }
      } catch (err: any) {
        log(`   ⚠️  ${codigo}: ${err.message}`, 'yellow');
      }
    }
  } else {
    log('   [DRY] Actualizaría tipos de 11 servicios existentes', 'gray');
  }

  // ── RESUMEN ──────────────────────────────────────────────────────────────
  log('\n═══════════════════════════════════════════════════════════', 'green');
  log('  ✅ ENTREGA FASE 5 GAPS — COMPLETADO', 'green');
  log('═══════════════════════════════════════════════════════════\n', 'green');

  log('Resumen de cambios:', 'cyan');
  log('  + et_pacientes_censo.estado_clinico (Estable/Observación/Crítico/Alta pendiente)', 'gray');
  log('  + et_pacientes_censo.pendientes (text)', 'gray');
  log('  + et_turnos.incidentes (text)', 'gray');
  log('  + et_servicios.tipo (campo nuevo)', 'gray');
  log('  + 9 unidades físicas adicionales en et_servicios', 'gray');
  log('\nSiguiente paso:', 'cyan');
  log('  npx tsx Apps/ENTREGA/scripts/deploy-entrega-phase5-print.ts', 'gray');
  log('  (Agrega botón Print a la vista del turno)', 'gray');
}

main().catch(err => {
  log(`\n❌ Fatal: ${err.message}`, 'red');
  process.exit(1);
});
