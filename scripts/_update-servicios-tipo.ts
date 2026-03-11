/**
 * _update-servicios-tipo.ts — Actualiza campo tipo en et_servicios existentes
 */
import { createClient, log } from '../shared/scripts/ApiClient';
const api = createClient();

const TIPO_MAP: Record<string, string> = {
  'S-UCI': 'Crítico',          'S-UTI': 'Crítico',
  'S-MQ1': 'Hospitalización',  'S-MQ2': 'Hospitalización', 'S-MQ3': 'Hospitalización',
  'S-MED': 'Hospitalización',  'S-CIR': 'Hospitalización',
  'S-PED': 'Especialidad',     'S-OBS': 'Especialidad',
  'S-NEO': 'Especialidad',     'S-TRA': 'Especialidad',
  'PENS': 'Hospitalización',   'MAT': 'Especialidad',
  'REC': 'Transitoria',        'PSQ': 'Especialidad',
  'OBST': 'Especialidad',      'NEO': 'Especialidad',
  'PCER': 'Transitoria',       'URG': 'Transitoria',       'CIBU': 'Transitoria',
};

async function main() {
  const res = await (api as any).get('/et_servicios:list?pageSize=50');
  const records = res?.data?.data || res?.data || [];
  log(`Servicios encontrados: ${records.length}`, 'cyan');

  for (const r of records) {
    const tipo = TIPO_MAP[r.codigo] || 'Hospitalización';
    try {
      await (api as any).post(`/et_servicios:update?filterByTk=${r.id}`, { tipo });
      log(`  ✅ [${r.id}] ${r.codigo} → ${tipo}`, 'green');
    } catch (err: any) {
      log(`  ❌ ${r.codigo}: ${err.message}`, 'red');
    }
  }
  log('\n✅ Done', 'green');
}

main().catch(e => { console.error(e.message); process.exit(1); });
