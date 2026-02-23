/**
 * cleanup-duplicate-collections.ts
 * 
 * Elimina colecciones duplicadas/vacías en NocoBase.
 * Solo borra colecciones con 0 registros que son duplicados conocidos.
 *
 * Uso:
 *   npx tsx Apps/ENTREGA/scripts/cleanup-duplicate-collections.ts --dry-run
 *   npx tsx Apps/ENTREGA/scripts/cleanup-duplicate-collections.ts
 */

import { createClient, log } from '../../../shared/scripts/ApiClient';

const client = createClient();
const DRY_RUN = process.argv.includes('--dry-run');

// Collections to DELETE — all confirmed 0 records + duplicated or orphaned
const TO_DELETE = [
  // Empty UGCO_REF_* with no data (0 records confirmed)
  { name: 'UGCO_REF_comuna', reason: 'Duplicado de ref_comuna, 0 registros' },
  { name: 'UGCO_REF_establecimiento_deis', reason: 'Duplicado de ref_establecimiento, 0 registros' },
  { name: 'UGCO_REF_oncobasediagnostico', reason: 'Sin contraparte, 0 registros' },
  { name: 'UGCO_REF_oncoecog', reason: '0 registros, sin uso' },
  { name: 'UGCO_REF_oncoestadio_clinico', reason: 'Duplicado de ref_etapa_clinica, 0 registros' },
  { name: 'UGCO_REF_oncoestadoactividad', reason: '0 registros' },
  { name: 'UGCO_REF_oncoestadoadm', reason: '0 registros' },
  { name: 'UGCO_REF_oncoestadocaso', reason: 'Duplicado de ref_estado_caso, 0 registros' },
  { name: 'UGCO_REF_oncoestadoclinico', reason: '0 registros' },
  { name: 'UGCO_REF_oncofigo', reason: '0 registros' },
  { name: 'UGCO_REF_oncointenciontrat', reason: '0 registros' },
  { name: 'UGCO_REF_oncotipoactividad', reason: '0 registros' },
  { name: 'UGCO_REF_oncotipodocumento', reason: '0 registros' },
  { name: 'UGCO_REF_oncotipoetapificacion', reason: '0 registros' },

  // Empty UGCO_ application tables (0 records, superseded by onco_*)
  { name: 'ugco_casooncologico', reason: 'Duplicado de onco_casos, 0 registros' },
  { name: 'UGCO_comitecaso', reason: 'Duplicado de onco_comite_casos, 0 registros' },
  { name: 'UGCO_contactopaciente', reason: '0 registros, sin uso' },
  { name: 'UGCO_equiposeguimiento', reason: '0 registros, sin uso' },
  { name: 'UGCO_eventoclinico', reason: '0 registros, sin uso' },
  { name: 'UGCO_tarea', reason: '0 registros, sin uso' },

  // Empty UGCO_ALMA_* (superseded by ALMA_*)
  { name: 'UGCO_ALMA_diagnostico', reason: 'Duplicado, 0 registros' },
  { name: 'UGCO_ALMA_episodio', reason: 'Duplicado, 0 registros' },
  { name: 'UGCO_ALMA_paciente', reason: 'Duplicado de ALMA_Pacientes, 0 registros' },

  // Empty ALMA variants
  { name: 'ALMA_PacientesData_', reason: 'Duplicado de ALMA_PacientesData, 0 registros' },
  { name: 'ALMA_PacientesData_full', reason: 'Duplicado de ALMA_PacientesData, 0 registros' },
  { name: 'ALMA_H_GDA_ALMA', reason: 'Duplicado de ALMA_H_GDA, 0 registros' },
  { name: 'ALMA_H_gda_futuro', reason: '0 registros' },
  { name: 'ALMA_H_gda_prospectivo', reason: '0 registros' },
  { name: 'ALMA_H_Oncologia2', reason: 'Duplicado de ALMA_H_Oncologia, 0 registros' },
  { name: 'alma_paciente', reason: 'Duplicado de ALMA_Pacientes, 0 registros' },

  // Orphan
  { name: 't_8v1jdhjkyo2', reason: 'Tabla huérfana autogenerada, 0 registros' },

  // Broken table (table doesn't exist in MySQL)
  { name: 'ugco_evento', reason: 'Tabla rota: MySQL table doesn\'t exist, ERR 500' },

  // Empty ref_* (skeleton only, 0-1 records, data lives in UGCO_REF_*)
  { name: 'ref_oncomorfologia', reason: '0 registros, data en UGCO_REF_oncomorfologiaicdo (1031)' },
];

async function main() {
  log('═══════════════════════════════════════════════', 'cyan');
  log('  CLEANUP: Colecciones Duplicadas/Vacías', 'cyan');
  log('═══════════════════════════════════════════════\n', 'cyan');

  if (DRY_RUN) log('🔍 MODO DRY RUN — no se borrará nada.\n', 'yellow');

  let deleted = 0;
  let errors = 0;

  for (const col of TO_DELETE) {
    log(`🗑️  ${col.name}`, 'red');
    log(`   → ${col.reason}`, 'gray');

    if (DRY_RUN) {
      log(`   [DRY RUN] Se borraría\n`, 'yellow');
      continue;
    }

    try {
      await client.delete(`/collections:destroy?filterByTk=${col.name}`);
      log(`   ✅ Eliminada\n`, 'green');
      deleted++;
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
      log(`   ❌ Error: ${msg}\n`, 'red');
      errors++;
    }
  }

  log('═══════════════════════════════════════════════', 'green');
  log(`  ✅ ${deleted} eliminadas, ${errors} errores, ${TO_DELETE.length} total`, 'green');
  log('═══════════════════════════════════════════════', 'green');
}

main().catch(err => {
  log(`\n❌ Error fatal: ${err.message}`, 'red');
  process.exit(1);
});
