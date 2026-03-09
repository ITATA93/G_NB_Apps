/**
 * seed-ugco-bulk.ts — Genera ~1000 pacientes oncológicos simulados + datos asociados
 *
 * Volúmenes:
 *   - 1000 casos oncológicos
 *   - ~2500 episodios (2-4 por caso)
 *   - 80 sesiones de comité (semanales, ~18 meses)
 *   - ~600 presentaciones en comité
 *
 * Usage:
 *   npx tsx Apps/UGCO/seed-ugco-bulk.ts
 *   npx tsx Apps/UGCO/seed-ugco-bulk.ts --dry-run
 *   npx tsx Apps/UGCO/seed-ugco-bulk.ts --count 500
 */

import { createClient, log } from '../../shared/scripts/ApiClient.ts';
import type { ApiClient } from '../../shared/scripts/ApiClient.ts';

const DRY_RUN = process.argv.includes('--dry-run');
const COUNT_ARG = process.argv.indexOf('--count');
const PATIENT_COUNT = COUNT_ARG !== -1 ? parseInt(process.argv[COUNT_ARG + 1]) : 1000;
const BATCH_SIZE = 50;

// ─── Chilean Name Data ──────────────────────────────────────────────────────

const NOMBRES_M = [
  'María', 'Carmen', 'Rosa', 'Ana', 'Patricia', 'Claudia', 'Francisca', 'Isabel',
  'Marta', 'Teresa', 'Catalina', 'Valentina', 'Daniela', 'Constanza', 'Javiera',
  'Camila', 'Fernanda', 'Sofía', 'Antonia', 'Gabriela', 'Lorena', 'Paola',
  'Verónica', 'Carolina', 'Alejandra', 'Marcela', 'Cecilia', 'Mónica', 'Gloria',
  'Eliana', 'Silvia', 'Luz', 'Elena', 'Juana', 'Margarita', 'Sonia', 'Ximena',
  'Macarena', 'Bárbara', 'Natalia', 'Andrea', 'Susana', 'Graciela', 'Pilar',
  'Raquel', 'Soledad', 'Inés', 'Beatriz', 'Alicia', 'Norma',
];

const NOMBRES_H = [
  'Juan', 'Carlos', 'José', 'Pedro', 'Luis', 'Roberto', 'Jorge', 'Miguel',
  'Francisco', 'Héctor', 'Ricardo', 'Fernando', 'Sergio', 'Eduardo', 'Pablo',
  'Andrés', 'Rodrigo', 'Sebastián', 'Matías', 'Diego', 'Felipe', 'Cristián',
  'Manuel', 'Daniel', 'Raúl', 'Gonzalo', 'Mario', 'Claudio', 'Arturo', 'Ramón',
  'Tomás', 'Ignacio', 'Alejandro', 'Oscar', 'Jaime', 'Marco', 'Patricio',
  'Nelson', 'Guillermo', 'Víctor', 'Hugo', 'Ernesto', 'Alberto', 'Iván',
  'César', 'Rafael', 'Enrique', 'Gabriel', 'Nicolás', 'Benjamín',
];

const APELLIDOS = [
  'González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva',
  'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López', 'Fuentes', 'Hernández',
  'Torres', 'Araya', 'Reyes', 'Núñez', 'Jara', 'Vergara', 'Riquelme', 'Figueroa',
  'Cerda', 'Castro', 'Vargas', 'Carrasco', 'Guzmán', 'Flores', 'Garrido',
  'Espinoza', 'Bravo', 'Valenzuela', 'Tapia', 'Cárdenas', 'Sandoval', 'Pizarro',
  'Vega', 'Cortés', 'Castillo', 'Ramírez', 'Orellana', 'Medina', 'Herrera',
  'Aguilera', 'Parra', 'Campos', 'Vásquez', 'Ríos', 'Olivares', 'Alarcón',
  'Gallardo', 'Molina', 'Vera', 'Poblete', 'Aravena', 'Navarrete', 'Lagos',
  'Cáceres', 'Meza', 'Yáñez', 'Salazar', 'Acuña', 'Leiva', 'Barra',
];

// ─── Oncology Data ──────────────────────────────────────────────────────────

const DIAGNOSTICOS = [
  { dx: 'Carcinoma ductal invasivo de mama', cie10: 'C50.9', tipo: 'mama' },
  { dx: 'Carcinoma lobulillar de mama', cie10: 'C50.9', tipo: 'mama' },
  { dx: 'Adenocarcinoma de colon', cie10: 'C18.9', tipo: 'colon' },
  { dx: 'Adenocarcinoma de recto', cie10: 'C20', tipo: 'colon' },
  { dx: 'Cáncer pulmonar de células no pequeñas', cie10: 'C34.9', tipo: 'pulmon' },
  { dx: 'Cáncer pulmonar de células pequeñas', cie10: 'C34.9', tipo: 'pulmon' },
  { dx: 'Carcinoma cervicouterino', cie10: 'C53.9', tipo: 'gineco' },
  { dx: 'Carcinoma de endometrio', cie10: 'C54.1', tipo: 'gineco' },
  { dx: 'Carcinoma de ovario', cie10: 'C56', tipo: 'gineco' },
  { dx: 'Adenocarcinoma gástrico', cie10: 'C16.9', tipo: 'gastrico' },
  { dx: 'Carcinoma hepatocelular', cie10: 'C22.0', tipo: 'hepato' },
  { dx: 'Adenocarcinoma de páncreas', cie10: 'C25.9', tipo: 'pancreas' },
  { dx: 'Linfoma de Hodgkin', cie10: 'C81.9', tipo: 'hemato' },
  { dx: 'Linfoma no Hodgkin difuso', cie10: 'C83.3', tipo: 'hemato' },
  { dx: 'Leucemia mieloide aguda', cie10: 'C92.0', tipo: 'hemato' },
  { dx: 'Mieloma múltiple', cie10: 'C90.0', tipo: 'hemato' },
  { dx: 'Carcinoma de próstata', cie10: 'C61', tipo: 'uro' },
  { dx: 'Carcinoma renal de células claras', cie10: 'C64', tipo: 'uro' },
  { dx: 'Carcinoma vesical', cie10: 'C67.9', tipo: 'uro' },
  { dx: 'Melanoma maligno cutáneo', cie10: 'C43.9', tipo: 'piel' },
  { dx: 'Carcinoma de tiroides papilar', cie10: 'C73', tipo: 'tiroides' },
  { dx: 'Carcinoma escamoso de laringe', cie10: 'C32.9', tipo: 'cabeza' },
  { dx: 'Carcinoma escamoso de cavidad oral', cie10: 'C06.9', tipo: 'cabeza' },
  { dx: 'Glioblastoma multiforme', cie10: 'C71.9', tipo: 'neuro' },
  { dx: 'Sarcoma de tejidos blandos', cie10: 'C49.9', tipo: 'sarcoma' },
  { dx: 'Carcinoma de esófago', cie10: 'C15.9', tipo: 'esofago' },
  { dx: 'Tumor testicular de células germinales', cie10: 'C62.9', tipo: 'uro' },
  { dx: 'Mesotelioma pleural maligno', cie10: 'C45.0', tipo: 'pulmon' },
];

const ESTADOS = ['activo', 'en_tratamiento', 'seguimiento', 'cerrado', 'fallecido'];
const ESTADO_PESOS = [15, 35, 25, 15, 10]; // %

const ESTADIOS = ['I', 'II', 'III', 'IV', 'no_aplica'];
const ESTADIO_PESOS = [20, 30, 25, 20, 5];

const TIPO_EPISODIOS = ['cirugia', 'quimioterapia', 'radioterapia', 'inmunoterapia', 'biopsia', 'consulta', 'control', 'imagen', 'laboratorio'];
const ESTADO_EPISODIOS = ['programado', 'en_curso', 'completado', 'cancelado'];

const OBSERVACIONES_TEMPLATES = [
  'Paciente derivado desde APS. Pendiente estudio completo.',
  'Confirmado por biopsia. Se programa inicio de tratamiento.',
  'Paciente con antecedentes familiares de cáncer. Control estricto.',
  'Se solicita interconsulta a {esp}. Exámenes de laboratorio en curso.',
  'TC de etapificación muestra {hallazgo}. Se presenta en comité.',
  'Inicio de quimioterapia {esquema}. Tolerancia adecuada.',
  'Post-operatorio sin complicaciones. Control en 2 semanas.',
  'Paciente refiere dolor {loc}. Se ajusta analgesia.',
  'Respuesta parcial a tratamiento. Se mantiene esquema actual.',
  'Progresión documentada. Se cambia línea de tratamiento.',
  'Sin evidencia de recurrencia en controles. Próximo en 3 meses.',
  'Elevación de marcadores tumorales. Se solicita PET-CT.',
  'Paciente en cuidados paliativos. Se coordina con equipo de dolor.',
  'Resultado de PET-CT: captación {loc}. Se discute en comité.',
  'Evaluación nutricional: IMC {imc}. Se indica suplementación.',
  'Paciente con buena respuesta. Completa ciclo {n} de {total}.',
  'Efecto adverso grado {g}: {efecto}. Se reduce dosis.',
  'Derivación a radioterapia. Simulación programada.',
  'Control post-radioterapia. Mucositis grado {g} en resolución.',
  'Alta oncológica. Seguimiento semestral por 5 años.',
];

const ESPECIALIDADES = ['oncología médica', 'cirugía oncológica', 'radioterapia', 'hematología', 'ginecología oncológica', 'urología'];
const HALLAZGOS = ['compromiso ganglionar', 'lesión hepática sospechosa', 'nódulo pulmonar', 'masa retroperitoneal', 'lesión ósea lítica', 'engrosamiento parietal'];
const ESQUEMAS = ['AC', 'FOLFOX', 'ABVD', 'Cisplatino-Pemetrexed', 'Carboplatino-Paclitaxel', 'R-CHOP', 'BEP', 'Pembrolizumab'];
const LOCALIZACIONES = ['abdominal', 'torácico', 'lumbar', 'cervical', 'óseo', 'pélvico'];
const EFECTOS = ['neutropenia', 'náuseas', 'mucositis', 'neuropatía', 'fatiga', 'trombocitopenia', 'diarrea'];

const DESC_EPISODIOS: Record<string, string[]> = {
  cirugia: ['Mastectomía parcial', 'Mastectomía radical', 'Colectomía derecha', 'Hemicolectomía izquierda', 'Lobectomía pulmonar', 'Resección gástrica subtotal', 'Histerectomía radical', 'Prostatectomía radical', 'Nefrectomía parcial', 'Tiroidectomía total', 'Laringectomía parcial', 'Biopsia excisional amplia'],
  quimioterapia: ['Ciclo AC (Adriamicina + Ciclofosfamida)', 'Ciclo FOLFOX (5FU + Leucovorina + Oxaliplatino)', 'Ciclo Cisplatino + Pemetrexed', 'Ciclo R-CHOP', 'Ciclo ABVD', 'Ciclo BEP', 'Ciclo Carboplatino + Paclitaxel', 'Ciclo Gemcitabina + Cisplatino', 'Ciclo Docetaxel', 'Trastuzumab + Pertuzumab'],
  radioterapia: ['RT conformacional 3D mama', 'RT pelviana', 'RT mediastínica', 'RT cerebral total', 'RT estereotáctica corporal', 'RT adyuvante post-QT', 'Braquiterapia cervical', 'RT paliativa ósea'],
  inmunoterapia: ['Pembrolizumab 200mg IV c/3 sem', 'Nivolumab 240mg IV c/2 sem', 'Atezolizumab 1200mg IV c/3 sem', 'Ipilimumab + Nivolumab'],
  biopsia: ['Biopsia core guiada por ecografía', 'Biopsia por EBUS', 'Biopsia hepática percutánea', 'Biopsia de médula ósea', 'Biopsia incisional', 'Punción aspirativa con aguja fina'],
  consulta: ['Evaluación inicial por equipo oncológico', 'Consulta de seguimiento', 'Interconsulta a cuidados paliativos', 'Consulta nutricional oncológica', 'Evaluación pre-quirúrgica', 'Consulta de segunda opinión'],
  control: ['Control post-tratamiento 3 meses', 'Control post-operatorio 2 semanas', 'Control con marcadores tumorales', 'Control clínico trimestral', 'Control post-QT con hemograma'],
  imagen: ['TC Tórax-Abdomen-Pelvis con contraste', 'PET-CT F18-FDG', 'RNM cerebral con gadolinio', 'Ecografía mamaria bilateral', 'Ecografía abdominal', 'Cintigrafía ósea', 'Mamografía bilateral'],
  laboratorio: ['Hemograma + VHS + PCR', 'Perfil bioquímico + función hepática', 'Marcadores tumorales (CEA, CA 19-9)', 'Marcadores tumorales (CA 125, CA 15-3)', 'PSA total y libre', 'Beta-HCG + AFP + LDH', 'Inmunofenotipo por citometría'],
};

const RESULTADOS_EPISODIOS: Record<string, string[]> = {
  cirugia: ['Márgenes quirúrgicos libres', 'Márgenes comprometidos, requiere re-resección', 'Ganglio centinela negativo (0/3)', 'Ganglio centinela positivo (1/3)', 'Resección R0 completa', 'Resección R1 (margen comprometido)'],
  quimioterapia: ['Tolerancia adecuada. Sin toxicidad significativa', 'Neutropenia grado 2. Se difiere próximo ciclo', 'Respuesta parcial por imágenes', 'Enfermedad estable', 'Náuseas grado 2, controladas con ondansetrón', 'Neuropatía periférica grado 1'],
  radioterapia: ['Completó esquema sin interrupciones', 'Mucositis grado 2 en tratamiento', 'Dermatitis actínica grado 1', 'Buena tolerancia. Sin efectos adversos significativos'],
  biopsia: ['Carcinoma invasor confirmado', 'Adenocarcinoma moderadamente diferenciado', 'Muestra insuficiente, requiere nueva biopsia', 'Linfoma de Hodgkin clásico, esclerosis nodular', 'Negativo para malignidad', 'Carcinoma escamoso moderadamente diferenciado'],
  consulta: ['Se indica TC TAP y marcadores tumorales', 'Se programa inicio de QT', 'Paciente informado del diagnóstico y plan', 'Se solicita interconsulta a cirugía', 'Se ajusta esquema analgésico'],
  control: ['Sin evidencia de recurrencia', 'Marcadores en rango normal', 'Sospecha de recurrencia local, se solicita PET-CT', 'Paciente asintomático, continúa seguimiento', 'Buena evolución post-tratamiento'],
  imagen: ['Sin evidencia de enfermedad metastásica', 'Lesión hepática sospechosa de 2.3 cm', 'Respuesta metabólica completa por PET-CT', 'Nódulo pulmonar estable respecto a control previo', 'Progresión ósea multifocal'],
  laboratorio: ['Hemograma normal', 'Neutropenia (ANC 800/mm3)', 'CEA elevado (12.5 ng/mL)', 'Marcadores en rango normal', 'Función hepática alterada (GOT 3x)', 'PSA < 0.01 ng/mL'],
  inmunoterapia: ['Sin reacciones adversas inmunomediadas', 'Hipotiroidismo grado 1, inicio levotiroxina', 'Respuesta parcial mantenida', 'Colitis grado 2, suspensión temporal'],
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
function weightedPick(items: string[], weights: number[]): string {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function genRut(): string {
  const num = Math.floor(Math.random() * 25000000) + 5000000;
  const s = num.toString();
  const formatted = `${s.slice(0, -6)}.${s.slice(-6, -3)}.${s.slice(-3)}`;
  // Compute check digit
  let sum = 0;
  let mul = 2;
  for (let i = s.length - 1; i >= 0; i--) {
    sum += parseInt(s[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const remainder = 11 - (sum % 11);
  const dv = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder);
  return `${formatted}-${dv}`;
}

function randomDate(start: string, end: string): string {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return new Date(s + Math.random() * (e - s)).toISOString().split('T')[0];
}

function genObservacion(): string {
  let obs = pick(OBSERVACIONES_TEMPLATES);
  obs = obs.replace('{esp}', pick(ESPECIALIDADES));
  obs = obs.replace('{hallazgo}', pick(HALLAZGOS));
  obs = obs.replace('{esquema}', pick(ESQUEMAS));
  obs = obs.replace('{loc}', pick(LOCALIZACIONES));
  obs = obs.replace('{imc}', (18 + Math.random() * 14).toFixed(1));
  obs = obs.replace('{n}', String(Math.floor(Math.random() * 6) + 1));
  obs = obs.replace('{total}', String(Math.floor(Math.random() * 4) + 4));
  obs = obs.replace('{g}', String(Math.floor(Math.random() * 3) + 1));
  obs = obs.replace('{efecto}', pick(EFECTOS));
  return obs;
}

// ─── Generator Functions ────────────────────────────────────────────────────

function generateCasos(count: number) {
  const casos = [];
  for (let i = 0; i < count; i++) {
    const isFemale = Math.random() < 0.52;
    const nombre1 = pick(isFemale ? NOMBRES_M : NOMBRES_H);
    const nombre2 = Math.random() < 0.4 ? (' ' + pick(isFemale ? NOMBRES_M : NOMBRES_H)) : '';
    const ap1 = pick(APELLIDOS);
    const ap2 = pick(APELLIDOS);
    const dx = pick(DIAGNOSTICOS);

    casos.push({
      paciente_rut: genRut(),
      paciente_nombre: `${nombre1}${nombre2} ${ap1} ${ap2}`,
      fecha_ingreso: randomDate('2024-06-01', '2026-03-01'),
      diagnostico_principal: dx.dx,
      codigo_cie10: dx.cie10,
      estado: weightedPick(ESTADOS, ESTADO_PESOS),
      estadio_clinico: weightedPick(ESTADIOS, ESTADIO_PESOS),
      observaciones: genObservacion(),
    });
  }
  return casos;
}

function generateEpisodios(casoIds: number[]) {
  const episodios = [];
  for (const casoId of casoIds) {
    const numEps = Math.floor(Math.random() * 4) + 1; // 1-4
    const tipos = pickN(TIPO_EPISODIOS, numEps);
    for (const tipo of tipos) {
      const descs = DESC_EPISODIOS[tipo] || ['Procedimiento oncológico'];
      const results = RESULTADOS_EPISODIOS[tipo] || ['Resultado pendiente'];
      const estado = Math.random() < 0.7 ? 'completado' : pick(ESTADO_EPISODIOS);
      episodios.push({
        caso_id: casoId,
        fecha: randomDate('2024-06-01', '2026-03-01'),
        tipo_episodio: tipo,
        descripcion: pick(descs),
        estado_episodio: estado,
        resultado: estado === 'completado' ? pick(results) : '',
        notas_clinicas: estado === 'completado' ? genObservacion() : '',
      });
    }
  }
  return episodios;
}

function generateSesiones(count: number) {
  const sesiones = [];
  const startDate = new Date('2024-07-01');
  for (let i = 0; i < count; i++) {
    const fecha = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000 + Math.random() * 2 * 24 * 60 * 60 * 1000);
    const isFuture = fecha > new Date();
    const num = `COM-${fecha.getFullYear()}-${String(i + 1).padStart(3, '0')}`;
    sesiones.push({
      fecha: fecha.toISOString().split('T')[0],
      numero_sesion: num,
      tipo_comite: Math.random() < 0.85 ? 'ordinario' : 'extraordinario',
      estado_sesion: isFuture ? 'programada' : (Math.random() < 0.95 ? 'finalizada' : 'cancelada'),
      acta: isFuture ? '' : `Se revisaron ${Math.floor(Math.random() * 8) + 3} casos. Decisiones registradas en actas individuales. Asistencia completa del equipo oncológico.`,
      asistentes: pickN(['Dr. Pérez (Onc)', 'Dr. Morales (Cir)', 'Dra. Soto (Rad)', 'Enf. López (GC)', 'Dr. Ríos (Hem)', 'Dra. Vega (Gin)', 'Dr. Castro (Uro)', 'Dra. Núñez (Pat)', 'Dr. Tapia (Pal)', 'Enf. Reyes (Coord)'], Math.floor(Math.random() * 4) + 4).join(', '),
    });
  }
  return sesiones;
}

function generateComiteCasos(casoIds: number[], sesionIds: number[], count: number) {
  const comiteCasos = [];
  const decisiones = [
    'Iniciar QT neoadyuvante según protocolo institucional',
    'Cirugía programada. Pre-operatorio completo',
    'Continuar esquema actual. Reevaluar en 2 ciclos',
    'Cambio a segunda línea de QT',
    'RT adyuvante post-cirugía',
    'Derivar a cuidados paliativos + manejo del dolor',
    'Completar etapificación. Solicitar PET-CT',
    'Mantener seguimiento trimestral',
    'Interconsulta a radioterapia para evaluación',
    'Biopsia de lesión sospechosa antes de definir conducta',
    'Iniciar inmunoterapia como primera línea',
    'QT-RT concomitante según protocolo',
    'Observación activa. No requiere tratamiento inmediato',
    'Re-presentar con resultados de genómica tumoral',
  ];
  const recomendaciones = [
    'Control con marcadores e imágenes en 3 meses',
    'Hemograma semanal durante QT',
    'Evaluación nutricional y kinesioterapia',
    'Manejo multidisciplinario con equipo de dolor',
    'Control post-operatorio en 2 semanas',
    'PET-CT interim post ciclo 2-3',
    'Seguimiento con mamografía semestral',
    'Colonoscopía de control al año',
    'Derivar a consejería genética',
    'Considerar ensayo clínico si progresa',
  ];
  const prioridades = ['urgente', 'alta', 'normal', 'baja'];
  const prioridadPesos = [10, 30, 45, 15];

  for (let i = 0; i < count; i++) {
    comiteCasos.push({
      caso_id: pick(casoIds),
      sesion_id: pick(sesionIds),
      fecha_presentacion: randomDate('2024-07-01', '2026-03-01'),
      decision: pick(decisiones),
      recomendacion: pick(recomendaciones),
      prioridad: weightedPick(prioridades, prioridadPesos),
      seguimiento_requerido: Math.random() < 0.65,
    });
  }
  return comiteCasos;
}

// ─── Batch Insert ───────────────────────────────────────────────────────────

async function batchInsert(api: ApiClient, collection: string, records: Record<string, unknown>[], label: string): Promise<number[]> {
  const ids: number[] = [];
  const total = records.length;
  let ok = 0;
  let err = 0;

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const pct = Math.round(((i + batch.length) / total) * 100);

    if (DRY_RUN) {
      log(`  [DRY-RUN] ${label}: ${i + batch.length}/${total} (${pct}%)`, 'yellow');
      ok += batch.length;
      continue;
    }

    // Try bulk create first (NocoBase supports array in some versions)
    for (const record of batch) {
      try {
        const resp = await api.post(`/${collection}:create`, record);
        const id = (resp.data as Record<string, unknown>)?.id as number;
        if (id) ids.push(id);
        ok++;
      } catch {
        err++;
      }
    }

    // Progress log every batch
    if ((i + batch.length) % (BATCH_SIZE * 4) === 0 || i + batch.length === total) {
      log(`  ${label}: ${ok}/${total} ok, ${err} err (${pct}%)`, ok > 0 ? 'green' : 'yellow');
    }
  }

  log(`  ${label} DONE: ${ok} created, ${err} errors`, err > 0 ? 'yellow' : 'green');
  return ids;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  log('╔═══════════════════════════════════════════════════════════════╗', 'cyan');
  log('║    UGCO Bulk Seed — Datos Simulados Masivos                   ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════╝', 'cyan');

  if (DRY_RUN) log('\n  MODE: DRY-RUN\n', 'yellow');
  log(`  Pacientes objetivo: ${PATIENT_COUNT}`, 'white');

  const api = createClient();

  // Verify connection
  try {
    const resp = await api.get('/app:getLang');
    log(`  API OK: ${api.getBaseUrl()} (lang=${JSON.stringify(resp.data).slice(0, 20)})`, 'green');
  } catch (e) {
    log(`  API FAIL: ${e instanceof Error ? e.message : e}`, 'red');
    process.exit(1);
  }

  const t0 = Date.now();

  // Phase 1: Generate casos
  log('\n--- Fase 1: Casos Oncológicos ---', 'cyan');
  const casosData = generateCasos(PATIENT_COUNT);
  log(`  Generados: ${casosData.length} casos`, 'white');
  const casoIds = await batchInsert(api, 'onco_casos', casosData as unknown as Record<string, unknown>[], 'Casos');

  // Phase 2: Generate episodios
  log('\n--- Fase 2: Episodios ---', 'cyan');
  const idsToUse = DRY_RUN ? Array.from({ length: PATIENT_COUNT }, (_, i) => i + 100) : casoIds;
  const episodiosData = generateEpisodios(idsToUse);
  log(`  Generados: ${episodiosData.length} episodios (avg ${(episodiosData.length / PATIENT_COUNT).toFixed(1)}/caso)`, 'white');
  await batchInsert(api, 'onco_episodios', episodiosData as unknown as Record<string, unknown>[], 'Episodios');

  // Phase 3: Generate sesiones
  log('\n--- Fase 3: Sesiones de Comité ---', 'cyan');
  const numSesiones = Math.max(20, Math.floor(PATIENT_COUNT / 12));
  const sesionesData = generateSesiones(numSesiones);
  log(`  Generados: ${sesionesData.length} sesiones`, 'white');
  const sesionIds = await batchInsert(api, 'onco_comite_sesiones', sesionesData as unknown as Record<string, unknown>[], 'Sesiones');

  // Phase 4: Generate comité casos
  log('\n--- Fase 4: Casos en Comité ---', 'cyan');
  const numComiteCasos = Math.floor(PATIENT_COUNT * 0.6);
  const sesionIdsToUse = DRY_RUN ? Array.from({ length: numSesiones }, (_, i) => i + 100) : sesionIds;
  const comiteCasosData = generateComiteCasos(idsToUse, sesionIdsToUse, numComiteCasos);
  log(`  Generados: ${comiteCasosData.length} presentaciones`, 'white');
  await batchInsert(api, 'onco_comite_casos', comiteCasosData as unknown as Record<string, unknown>[], 'Comité Casos');

  // Summary
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  log('\n╔═══════════════════════════════════════════════════════════════╗', 'cyan');
  log('║    RESUMEN SEED                                                ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════╝', 'cyan');
  log(`  Casos:       ${casosData.length}`, 'white');
  log(`  Episodios:   ${episodiosData.length}`, 'white');
  log(`  Sesiones:    ${sesionesData.length}`, 'white');
  log(`  Comité:      ${comiteCasosData.length}`, 'white');
  log(`  Total:       ${casosData.length + episodiosData.length + sesionesData.length + comiteCasosData.length} registros`, 'green');
  log(`  Tiempo:      ${elapsed}s`, 'gray');
  log(`  ${DRY_RUN ? 'DRY-RUN (nada insertado)' : 'COMPLETADO'}`, DRY_RUN ? 'yellow' : 'green');
}

main().catch(err => {
  log(`\nFATAL: ${err instanceof Error ? err.message : String(err)}`, 'red');
  process.exit(1);
});
