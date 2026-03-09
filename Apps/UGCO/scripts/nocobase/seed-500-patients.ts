/**
 * Seed 500 patients + full oncological data for UGCO testing
 *
 * Creates:
 * - 500 alma_paciente
 * - 500 alma_episodio
 * - 500 alma_diagnostico (oncológicos)
 * - 450 ugco_casooncologico (90% of patients)
 * - 900 ugco_casoespecialidad (2 per caso avg)
 * - 2250 ugco_eventoclinico (~5 per caso)
 * - 900 ugco_tarea (~2 per caso)
 * - 450 ugco_contactopaciente
 * - 300 ugco_personasignificativa
 * - 450 ugco_documentocaso
 * - 1000 ugco_observacionevento
 * - 20 ugco_comiteoncologico (sesiones)
 * - 200 ugco_comitecaso
 * - 9 ugco_equiposeguimiento
 * - 36 ugco_equipomiembro
 *
 * Usage: NOCOBASE_BASE_URL=... NOCOBASE_API_KEY=... npx tsx Apps/UGCO/scripts/nocobase/seed-500-patients.ts
 */

import "dotenv/config";

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;
if (!BASE || !KEY) { console.error("Missing env vars"); process.exit(1); }

let okCount = 0, errCount = 0;

async function api(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) { errCount++; return null; }
  okCount++;
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

// Batch create helper
async function bulkCreate(collection: string, rows: object[], label: string) {
  let created = 0;
  // NocoBase doesn't have bulk create, so batch sequentially but fast
  const BATCH = 20;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    await Promise.all(batch.map(row => api("POST", `${collection}:create`, row).then(r => { if (r) created++; })));
    if ((i + BATCH) % 100 === 0 || i + BATCH >= rows.length) {
      process.stdout.write(`\r  ${label}: ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
    }
  }
  console.log(`\r  ✅ ${label}: ${created}/${rows.length}`);
  return created;
}

// ═══════════════════════════════════════════════════════════
// DATA GENERATORS
// ═══════════════════════════════════════════════════════════

const NOMBRES_M = ["Juan", "Carlos", "Pedro", "Miguel", "José", "Luis", "Roberto", "Fernando", "Andrés", "Diego",
  "Ricardo", "Sergio", "Alejandro", "Pablo", "Francisco", "Daniel", "Gonzalo", "Héctor", "Raúl", "Patricio",
  "Eduardo", "Gabriel", "Cristián", "Rodrigo", "Felipe", "Mauricio", "Víctor", "Marcos", "Tomás", "Nicolás",
  "Claudio", "Sebastián", "Matías", "Ignacio", "Javier", "Hugo", "Arturo", "Mario", "Oscar", "Álvaro"];

const NOMBRES_F = ["María", "Ana", "Carmen", "Rosa", "Patricia", "Claudia", "Francisca", "Sofía", "Valentina", "Camila",
  "Daniela", "Carolina", "Fernanda", "Catalina", "Javiera", "Marcela", "Isabel", "Gabriela", "Andrea", "Paulina",
  "Lorena", "Verónica", "Alejandra", "Cecilia", "Beatriz", "Teresa", "Lucía", "Marta", "Susana", "Silvia",
  "Laura", "Constanza", "Macarena", "Natalia", "Paola", "Viviana", "Sandra", "Gloria", "Eliana", "Margarita"];

const APELLIDOS = ["González", "Muñoz", "Rojas", "Díaz", "Pérez", "Soto", "Contreras", "Silva", "Martínez", "Sepúlveda",
  "Morales", "Rodríguez", "López", "Fuentes", "Hernández", "García", "Garrido", "Bravo", "Reyes", "Núñez",
  "Araya", "Espinoza", "Tapia", "Figueroa", "Cortés", "Castro", "Carrasco", "Aravena", "Flores", "Gutiérrez",
  "Pizarro", "Vargas", "Campos", "Vega", "Sandoval", "Ramírez", "Torres", "Cáceres", "Riquelme", "Salazar",
  "Álvarez", "Valenzuela", "Castillo", "Vera", "Yáñez", "Aguilera", "Parra", "Navarro", "Bustos", "Molina"];

const COMUNAS = ["Ovalle", "Monte Patria", "Punitaqui", "Combarbalá", "Río Hurtado", "Canela",
  "La Serena", "Coquimbo", "Vicuña", "Andacollo", "Illapel", "Salamanca"];

const REGIONES = ["Coquimbo"];

const CIE10_ONCO = [
  { codigo: "C50.9", desc: "Tumor maligno de mama, no especificado", esp: 3 },
  { codigo: "C34.9", desc: "Tumor maligno de bronquio o pulmón", esp: 6 },
  { codigo: "C18.9", desc: "Tumor maligno de colon, no especificado", esp: 2 },
  { codigo: "C20", desc: "Tumor maligno del recto", esp: 2 },
  { codigo: "C16.9", desc: "Tumor maligno del estómago", esp: 1 },
  { codigo: "C61", desc: "Tumor maligno de próstata", esp: 5 },
  { codigo: "C53.9", desc: "Tumor maligno del cuello uterino", esp: 4 },
  { codigo: "C54.1", desc: "Tumor maligno del endometrio", esp: 4 },
  { codigo: "C56", desc: "Tumor maligno del ovario", esp: 4 },
  { codigo: "C67.9", desc: "Tumor maligno de vejiga", esp: 5 },
  { codigo: "C64", desc: "Tumor maligno del riñón", esp: 5 },
  { codigo: "C73", desc: "Tumor maligno de tiroides", esp: 8 },
  { codigo: "C43.9", desc: "Melanoma maligno de piel", esp: 7 },
  { codigo: "C15.9", desc: "Tumor maligno del esófago", esp: 1 },
  { codigo: "C25.9", desc: "Tumor maligno del páncreas", esp: 1 },
  { codigo: "C22.0", desc: "Carcinoma hepatocelular", esp: 1 },
  { codigo: "C91.0", desc: "Leucemia linfoblástica aguda", esp: 9 },
  { codigo: "C81.9", desc: "Linfoma de Hodgkin", esp: 9 },
  { codigo: "C90.0", desc: "Mieloma múltiple", esp: 9 },
  { codigo: "C44.9", desc: "Tumor maligno de piel, otro", esp: 7 },
];

// Specialty IDs from ref_oncoespecialidad seed (1-9)
// 1=Digestivo Alto, 2=Digestivo Bajo, 3=Mama, 4=Ginecología,
// 5=Urología, 6=Tórax, 7=Piel, 8=Endocrinología, 9=Hematología

const TIPO_EVENTOS = ["EXAMEN", "CIRUGIA", "QT", "RT", "OTRO"];
const ORIGEN_DATO = ["ALMA", "EXTERNO", "MANUAL"];
const MODALIDADES = ["INTERNO", "COMPLEMENTO", "DERIVACION", "COMPRA_SERVICIO"];
const PREVISIONES = ["FONASA A", "FONASA B", "FONASA C", "FONASA D", "ISAPRE", "PRAIS"];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randDate(startYear: number, endYear: number): string {
  const y = randInt(startYear, endYear);
  const m = String(randInt(1, 12)).padStart(2, "0");
  const d = String(randInt(1, 28)).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function calcRUN(): { run: string; dv: string } {
  const num = randInt(5000000, 25000000);
  let sum = 0, mul = 2, n = num;
  while (n > 0) { sum += (n % 10) * mul; mul = mul === 7 ? 2 : mul + 1; n = Math.floor(n / 10); }
  const rem = 11 - (sum % 11);
  const dv = rem === 11 ? "0" : rem === 10 ? "K" : String(rem);
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return { run: `${formatted}-${dv}`, dv };
}

// ═══════════════════════════════════════════════════════════
// GENERATE DATA
// ═══════════════════════════════════════════════════════════

function generatePatients(count: number) {
  const patients: any[] = [];
  for (let i = 1; i <= count; i++) {
    const sexo = Math.random() > 0.5 ? "F" : "M";
    const { run, dv } = calcRUN();
    patients.push({
      paciente_id: i,
      run,
      tipo_documento: "RUN",
      nro_documento: run.replace(/\./g, "").split("-")[0],
      dv,
      nombres: sexo === "F" ? rand(NOMBRES_F) : rand(NOMBRES_M),
      apellido_paterno: rand(APELLIDOS),
      apellido_materno: rand(APELLIDOS),
      fecha_nacimiento: randDate(1940, 2000),
      sexo,
      nacionalidad: "Chilena",
      prevision: rand(PREVISIONES),
      sistema_prevision: "PÚBLICO",
      activo: true,
    });
  }
  return patients;
}

function generateEpisodios(patients: any[]) {
  return patients.map((p, i) => ({
    episodio_id: i + 1,
    paciente_id: p.paciente_id,
    tipo_episodio: rand(["HOSPITALARIO", "CONSULTA_EXT", "AMBULATORIO"]),
    fecha_ingreso: randDate(2024, 2026),
    establecimiento: "Hospital de Ovalle",
    servicio: rand(["Medicina", "Cirugía", "Oncología", "Ginecología", "Urología"]),
    profesional_tratante: `Dr. ${rand(APELLIDOS)}`,
    motivo_consulta: "Estudio oncológico",
    activo: true,
  }));
}

function generateDiagnosticos(patients: any[]) {
  return patients.map((p, i) => {
    const dx = rand(CIE10_ONCO);
    return {
      diag_id: i + 1,
      episodio_id: i + 1,
      paciente_id: p.paciente_id,
      tipo_diagnostico: "PRINCIPAL",
      codigo_cie10: dx.codigo,
      descripcion: dx.desc,
      fecha_registro: randDate(2024, 2026),
      es_oncologico: true,
      activo: true,
    };
  });
}

function generateCasos(patients: any[], count: number) {
  const casos: any[] = [];
  const estadosClinicos = [1, 2, 3, 4]; // Sospecha, Confirmado, En tratamiento, En seguimiento
  const estadosAdm = [1, 2, 3, 4, 5];
  const intenciones = [1, 2, 3, 4]; // Curativo, Paliativo, etc.

  for (let i = 0; i < count; i++) {
    const p = patients[i];
    const dx = rand(CIE10_ONCO);
    const fechaDx = randDate(2024, 2026);
    const fallecido = Math.random() < 0.05; // 5% fallecidos

    casos.push({
      paciente_id: p.paciente_id,
      episodio_alma_id: i + 1,
      diag_alma_id: i + 1,
      codigo_cie10: dx.codigo,
      cie10_glosa: dx.desc,
      diagnostico_principal: dx.desc,
      fecha_diagnostico: fechaDx,
      fecha_caso: fechaDx,
      fecha_inicio_seguimiento: fechaDx,
      fecha_ultimo_contacto: randDate(2025, 2026),
      estado_clinico_id: rand(estadosClinicos),
      estado_adm_id: rand(estadosAdm),
      estado_seguimiento_id: rand([1, 2, 3, 4, 5, 6]),
      intencion_trat_id: rand(intenciones),
      tipo_etapificacion: rand(["TNM", "FIGO", "ANN_ARBOR"]),
      tnm_t: rand(["T1", "T2", "T3", "T4", "Tx"]),
      tnm_n: rand(["N0", "N1", "N2", "Nx"]),
      tnm_m: rand(["M0", "M1", "Mx"]),
      estadio_clinico: rand(["I", "II", "IIA", "IIB", "III", "IIIA", "IV"]),
      ecog_inicial: randInt(0, 3),
      fallecido,
      fecha_defuncion: fallecido ? randDate(2025, 2026) : null,
      clinical_status: fallecido ? "inactive" : "active",
      verification_status: rand(["confirmed", "provisional"]),
      _specialty: dx.esp, // internal: which specialty this belongs to
    });
  }
  return casos;
}

function generateCasoEspecialidades(casos: any[]) {
  const rows: any[] = [];
  for (let i = 0; i < casos.length; i++) {
    // Primary specialty
    rows.push({
      caso_id: i + 1,
      especialidad_id: casos[i]._specialty,
      es_principal: true,
    });
    // Some get a secondary specialty
    if (Math.random() < 0.5) {
      let sec = randInt(1, 9);
      while (sec === casos[i]._specialty) sec = randInt(1, 9);
      rows.push({
        caso_id: i + 1,
        especialidad_id: sec,
        es_principal: false,
        comentario: "Evaluación secundaria",
      });
    }
  }
  return rows;
}

function generateEventos(casos: any[]) {
  const rows: any[] = [];
  for (let i = 0; i < casos.length; i++) {
    const numEventos = randInt(2, 8);
    for (let j = 0; j < numEventos; j++) {
      const tipo = rand(TIPO_EVENTOS);
      const modalidad = rand(MODALIDADES);
      const fechaSol = randDate(2024, 2026);
      rows.push({
        caso_id: i + 1,
        paciente_id: casos[i].paciente_id,
        tipo_evento: tipo,
        origen_dato: rand(ORIGEN_DATO),
        fecha_solicitud: fechaSol,
        fecha_realizacion: Math.random() > 0.3 ? randDate(2024, 2026) : null,
        resultado_resumen: tipo === "EXAMEN" ? rand(["Normal", "Anormal", "Pendiente informe", "Compatible con neoplasia", "Sin hallazgos significativos"]) : null,
        centro_realizacion: rand(["Hospital de Ovalle", "Hospital de Coquimbo", "Hospital de La Serena", "Clínica Elqui"]),
        modalidad_prestacion_id: MODALIDADES.indexOf(modalidad) + 1,
        subtipo_evento_id: randInt(1, 41),
        estado_seguimiento_id: randInt(1, 7),
        es_derivacion: modalidad === "DERIVACION",
        fecha_programada: Math.random() > 0.5 ? randDate(2025, 2026) : null,
        fecha_resultado: Math.random() > 0.4 ? randDate(2025, 2026) : null,
        profesional_responsable: `Dr. ${rand(APELLIDOS)}`,
        notas_seguimiento: Math.random() > 0.6 ? rand(["Pendiente resultado", "Paciente citado", "Derivado a centro externo", "En espera de hora", "Completado"]) : null,
      });
    }
  }
  return rows;
}

function generateTareas(casos: any[]) {
  const rows: any[] = [];
  const titulos = [
    "Solicitar TAC de control", "Coordinar hora de QT", "Llamar al paciente",
    "Revisar resultado de biopsia", "Gestionar compra de servicio",
    "Preparar caso para comité", "Actualizar ficha clínica",
    "Coordinar RT con centro externo", "Solicitar interconsulta",
    "Seguimiento post-cirugía", "Gestionar exámenes pre-quirúrgicos",
    "Contactar a persona significativa", "Actualizar estado del caso",
  ];
  for (let i = 0; i < casos.length; i++) {
    const numTareas = randInt(1, 4);
    for (let j = 0; j < numTareas; j++) {
      rows.push({
        caso_id: i + 1,
        paciente_id: casos[i].paciente_id,
        tipo_tarea_id: randInt(1, 8),
        estado_tarea_id: randInt(1, 5),
        titulo: rand(titulos),
        descripcion: "Tarea generada automáticamente para testing",
        es_interna: Math.random() > 0.3,
        fecha_vencimiento: randDate(2025, 2026),
        fecha_inicio: randDate(2024, 2026),
        responsable_usuario: rand(["E. González", "M. Soto", "C. Pérez", "A. Muñoz", "R. Silva"]),
      });
    }
  }
  return rows;
}

function generateContactos(casos: any[]) {
  return casos.map((c, i) => ({
    caso_id: i + 1,
    paciente_id: c.paciente_id,
    fuente_dato: rand(["ALMA", "MANUAL"]),
    comuna_residencia: rand(COMUNAS),
    region_residencia: "Coquimbo",
    telefono_1: `+569${randInt(10000000, 99999999)}`,
    telefono_2: Math.random() > 0.5 ? `+569${randInt(10000000, 99999999)}` : null,
    email: Math.random() > 0.6 ? `paciente${i + 1}@email.cl` : null,
  }));
}

function generatePersonasSignificativas(casos: any[]) {
  const rows: any[] = [];
  for (let i = 0; i < casos.length; i++) {
    if (Math.random() < 0.65) {
      const sexo = Math.random() > 0.5 ? "F" : "M";
      rows.push({
        caso_id: i + 1,
        nombres: sexo === "F" ? rand(NOMBRES_F) : rand(NOMBRES_M),
        apellido_paterno: rand(APELLIDOS),
        apellido_materno: rand(APELLIDOS),
        parentesco: rand(["Cónyuge", "Hijo/a", "Padre/Madre", "Hermano/a", "Otro familiar"]),
        telefono: `+569${randInt(10000000, 99999999)}`,
        es_contacto_emergencia: Math.random() > 0.3,
        es_cuidador_principal: Math.random() > 0.5,
      });
    }
  }
  return rows;
}

function generateDocumentos(casos: any[]) {
  const rows: any[] = [];
  const tipos = ["Informe Biopsia", "TAC", "Ecografía", "Informe Quirúrgico", "Consentimiento",
    "Derivación", "Informe Comité", "RNM", "PET-CT", "Protocolo QT"];
  for (let i = 0; i < casos.length; i++) {
    rows.push({
      caso_id: i + 1,
      tipo_documento_id: randInt(1, 5),
      nombre_documento: rand(tipos),
      descripcion: "Documento de testing",
      fecha_documento: randDate(2024, 2026),
      origen: rand(["ALMA", "MANUAL", "EXTERNO"]),
    });
  }
  return rows;
}

function generateComites() {
  const rows: any[] = [];
  for (let i = 1; i <= 20; i++) {
    rows.push({
      nombre: `Comité Oncológico ${i}`,
      fecha_comite: randDate(2024, 2026),
      tipo_comite: rand(["ORDINARIO", "EXTRAORDINARIO"]),
      especialidad_id: randInt(1, 9),
      lugar: rand(["Sala Reuniones UGCO", "Auditorio Hospital", "Videoconferencia"]),
      observaciones: `Sesión #${i} del comité oncológico`,
    });
  }
  return rows;
}

function generateComiteCasos(numCasos: number) {
  const rows: any[] = [];
  const usedPairs = new Set<string>();
  for (let i = 0; i < 200; i++) {
    const comite_id = randInt(1, 20);
    const caso_id = randInt(1, numCasos);
    const key = `${comite_id}-${caso_id}`;
    if (usedPairs.has(key)) continue;
    usedPairs.add(key);
    rows.push({
      comite_id,
      caso_id,
      es_caso_principal: Math.random() > 0.7,
      decision_resumen: rand(["Iniciar QT", "Cirugía programada", "Continuar seguimiento", "Derivar a RT", "Completar estudios", "Alta oncológica"]),
      plan_tratamiento: rand(["QT neoadyuvante + cirugía", "Cirugía + RT adyuvante", "QT paliativa", "Seguimiento activo", "Biopsia + estadificación"]),
      responsable_seguimiento: rand(["E. González", "M. Soto", "C. Pérez"]),
      requiere_tareas: Math.random() > 0.4,
    });
  }
  return rows;
}

function generateEquipos() {
  const especialidades = [
    "Digestivo Alto", "Digestivo Bajo", "Mama", "Ginecología", "Urología",
    "Tórax", "Piel y Partes Blandas", "Endocrinología", "Hematología",
  ];
  return especialidades.map((e, i) => ({
    nombre: `Equipo ${e}`,
    especialidad_id: i + 1,
    descripcion: `Equipo de seguimiento de ${e}`,
    activo: true,
  }));
}

function generateEquipoMiembros() {
  const rows: any[] = [];
  for (let equipo = 1; equipo <= 9; equipo++) {
    // 4 miembros por equipo
    rows.push({ equipo_id: equipo, nombre_usuario: `Dr. ${rand(APELLIDOS)}`, rol_equipo: "Médico Referente", activo: true });
    rows.push({ equipo_id: equipo, nombre_usuario: `Enf. ${rand(APELLIDOS)}`, rol_equipo: "Enfermera Gestora", activo: true });
    rows.push({ equipo_id: equipo, nombre_usuario: `TENS ${rand(APELLIDOS)}`, rol_equipo: "TENS Gestora", activo: true });
    rows.push({ equipo_id: equipo, nombre_usuario: `Adm. ${rand(APELLIDOS)}`, rol_equipo: "Administrativa", activo: true });
  }
  return rows;
}

function generateObservaciones(numEventos: number) {
  const rows: any[] = [];
  const textos = [
    "Paciente contactado telefónicamente, refiere buena tolerancia al tratamiento",
    "Se solicita TAC de control para reevaluación",
    "Resultado de biopsia recibido, compatible con diagnóstico",
    "Paciente no acude a citación, se reprograma",
    "Se coordina hora en centro externo para QT",
    "Informe de imagenología sin hallazgos nuevos",
    "Se actualiza estadificación según nuevos resultados",
    "Paciente presenta EA grado 2, se ajusta dosis",
    "Derivación a cuidados paliativos por progresión",
    "Control satisfactorio, continúa protocolo actual",
    "Se presenta caso en comité oncológico",
    "Pendiente resultado de anatomía patológica",
    "Paciente completó ciclo de QT sin complicaciones",
    "Se gestiona compra de servicio para PET-CT",
    "Seguimiento post-quirúrgico favorable",
  ];
  for (let i = 0; i < 1000; i++) {
    rows.push({
      evento_id: randInt(1, numEventos),
      caso_id: randInt(1, 450),
      texto: rand(textos),
      fecha_observacion: randDate(2024, 2026),
      autor: rand(["E. González", "M. Soto", "C. Pérez", "Dr. Muñoz", "Enf. Silva", "TENS Rojas"]),
    });
  }
  return rows;
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║  Seed 500 Patients + Full Oncological Data    ║");
  console.log("╚═══════════════════════════════════════════════╝");
  console.log(`Target: ${BASE}\n`);

  const t0 = Date.now();

  // 1. Patients
  console.log("── 1. ALMA Pacientes ──");
  const patients = generatePatients(500);
  await bulkCreate("alma_paciente", patients, "Pacientes");

  // 2. Episodios
  console.log("── 2. ALMA Episodios ──");
  const episodios = generateEpisodios(patients);
  await bulkCreate("alma_episodio", episodios, "Episodios");

  // 3. Diagnosticos
  console.log("── 3. ALMA Diagnósticos ──");
  const diagnosticos = generateDiagnosticos(patients);
  await bulkCreate("alma_diagnostico", diagnosticos, "Diagnósticos");

  // 4. Casos oncológicos
  console.log("── 4. UGCO Casos Oncológicos ──");
  const casos = generateCasos(patients, 450);
  const casosClean = casos.map(({ _specialty, ...rest }) => rest);
  await bulkCreate("ugco_casooncologico", casosClean, "Casos");

  // 5. Caso-Especialidad
  console.log("── 5. UGCO Caso-Especialidad ──");
  const especialidades = generateCasoEspecialidades(casos);
  await bulkCreate("ugco_casoespecialidad", especialidades, "Caso-Especialidad");

  // 6. Eventos clínicos
  console.log("── 6. UGCO Eventos Clínicos ──");
  const eventos = generateEventos(casos);
  await bulkCreate("ugco_eventoclinico", eventos, "Eventos");

  // 7. Tareas
  console.log("── 7. UGCO Tareas ──");
  const tareas = generateTareas(casos);
  await bulkCreate("ugco_tarea", tareas, "Tareas");

  // 8. Contactos
  console.log("── 8. UGCO Contactos ──");
  const contactos = generateContactos(casos);
  await bulkCreate("ugco_contactopaciente", contactos, "Contactos");

  // 9. Personas significativas
  console.log("── 9. UGCO Personas Significativas ──");
  const personas = generatePersonasSignificativas(casos);
  await bulkCreate("ugco_personasignificativa", personas, "Personas Sig.");

  // 10. Documentos
  console.log("── 10. UGCO Documentos ──");
  const documentos = generateDocumentos(casos);
  await bulkCreate("ugco_documentocaso", documentos, "Documentos");

  // 11. Comités
  console.log("── 11. UGCO Comités ──");
  const comites = generateComites();
  await bulkCreate("ugco_comiteoncologico", comites, "Comités");

  // 12. Casos en comité
  console.log("── 12. UGCO Casos en Comité ──");
  const comiteCasos = generateComiteCasos(450);
  await bulkCreate("ugco_comitecaso", comiteCasos, "Casos Comité");

  // 13. Equipos
  console.log("── 13. UGCO Equipos ──");
  const equipos = generateEquipos();
  await bulkCreate("ugco_equiposeguimiento", equipos, "Equipos");

  // 14. Miembros
  console.log("── 14. UGCO Miembros ──");
  const miembros = generateEquipoMiembros();
  await bulkCreate("ugco_equipomiembro", miembros, "Miembros");

  // 15. Observaciones
  console.log("── 15. UGCO Observaciones ──");
  const obs = generateObservaciones(eventos.length);
  await bulkCreate("ugco_observacionevento", obs, "Observaciones");

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n${"═".repeat(50)}`);
  console.log(`✅ OK: ${okCount} | ❌ Err: ${errCount} | ⏱️  ${elapsed}s`);
  console.log(`URL: ${BASE.replace("/api", "")}/admin/`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
