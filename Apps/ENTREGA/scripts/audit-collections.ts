import { createClient } from '../../../shared/scripts/ApiClient';
const c = createClient();

const suspects = [
  'UGCO_REF_cie10','UGCO_REF_comuna','UGCO_REF_sexo','UGCO_REF_prevision',
  'UGCO_REF_establecimiento_deis','UGCO_REF_oncodiagnostico','UGCO_REF_oncoespecialidad',
  'UGCO_REF_oncomorfologiaicdo','UGCO_REF_oncotopografiaicdo',
  'ugco_casooncologico','ugco_comiteoncologico','ugco_evento',
  'UGCO_ALMA_diagnostico','UGCO_ALMA_episodio','UGCO_ALMA_paciente',
  'ALMA_PacientesData_','ALMA_PacientesData_full','ALMA_H_GDA_ALMA',
  'ALMA_H_gda_futuro','ALMA_H_gda_prospectivo','ALMA_H_Oncologia2',
  'alma_paciente','t_8v1jdhjkyo2','BUHO_Pacientes',
  'UGCO_REF_extension','UGCO_REF_lateralidad','UGCO_REF_oncobasediagnostico',
  'UGCO_REF_oncoecog','UGCO_REF_oncoestadio_clinico','UGCO_REF_oncoestadoactividad',
  'UGCO_REF_oncoestadoadm','UGCO_REF_oncoestadocaso','UGCO_REF_oncoestadoclinico',
  'UGCO_REF_oncofigo','UGCO_REF_oncogradohistologico','UGCO_REF_oncointenciontrat',
  'UGCO_REF_oncotipoactividad','UGCO_REF_oncotipodocumento','UGCO_REF_oncotipoetapificacion',
  'UGCO_REF_oncotnm_m','UGCO_REF_oncotnm_n','UGCO_REF_oncotnm_t',
  'UGCO_comitecaso','UGCO_contactopaciente','UGCO_equiposeguimiento',
  'UGCO_eventoclinico','UGCO_tarea',
  'wf_destino','wf_origen',
];

(async () => {
  console.log('COLLECTION | RECORDS');
  console.log('---');
  for (const name of suspects) {
    try {
      const r = await c.get(`/${name}:list`, { pageSize: 1 });
      const count = r.meta?.totalCount ?? r.meta?.count ?? r.data?.length ?? 0;
      console.log(`${name} | ${count}`);
    } catch (err: any) {
      console.log(`${name} | ERR: ${err?.response?.status || err.message}`);
    }
  }
  console.log('--- DONE');
})();
