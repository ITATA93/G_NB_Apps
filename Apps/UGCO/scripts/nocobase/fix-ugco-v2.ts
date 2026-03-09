/**
 * fix-ugco-v2.ts — Complete UGCO fix for mira.imedicina.cl
 *
 * Fixes ALL 5 critical + 4 structural problems from audit 2026-03-07:
 *   C1: Empty tables → re-seed data
 *   C2: No dashboard charts → create chart blocks
 *   C3: FK show IDs → switch to association fields
 *   C4: Empty Reportes → add chart + KPI blocks
 *   C5: Empty Ficha 360° → add form + table blocks
 *   E1: No specialty filters → add per-specialty filters
 *   E2: Technical column headers → fixed by C3 (associations have proper titles)
 *   E3: Dashboard missing columns → add patient name/RUT columns
 *
 * Usage: npx tsx Apps/UGCO/scripts/nocobase/fix-ugco-v2.ts
 */

import "dotenv/config";
import { randomBytes } from "crypto";

// ═══════════════════════════════════════════════════════════
// FORCE TARGET: mira.imedicina.cl (NOT .env default)
// ═══════════════════════════════════════════════════════════
const BASE = "https://mira.imedicina.cl/api";
const KEY  = process.env.NOCOBASE_MIRA_IMED_API_KEY!;
if (!KEY) { console.error("Missing NOCOBASE_MIRA_IMED_API_KEY in .env"); process.exit(1); }

let okCount = 0, errCount = 0;

function uid(): string { return randomBytes(5).toString("hex").slice(0, 10); }
function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randDate(sy: number, ey: number): string {
  return `${randInt(sy, ey)}-${String(randInt(1, 12)).padStart(2, "0")}-${String(randInt(1, 28)).padStart(2, "0")}`;
}

async function api(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) { errCount++; throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`); }
  okCount++;
  return text ? JSON.parse(text) : {};
}

async function apiSafe(method: string, path: string, body?: object): Promise<any> {
  try { return await api(method, path, body); }
  catch (e: any) { console.warn(`  ⚠ ${e.message.slice(0, 120)}`); return null; }
}

async function delay(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// Batch create helper (parallel within batches)
async function bulkCreate(collection: string, rows: object[], label: string) {
  let created = 0;
  const BATCH = 20;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    await Promise.all(batch.map(row =>
      apiSafe("POST", `${collection}:create`, row).then(r => { if (r) created++; })
    ));
    if ((i + BATCH) % 100 === 0 || i + BATCH >= rows.length) {
      process.stdout.write(`\r  ${label}: ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
    }
  }
  console.log(`\r  ✅ ${label}: ${created}/${rows.length}                `);
  return created;
}

// ═══════════════════════════════════════════════════════════
// PHASE 0 — Dynamic page discovery
// ═══════════════════════════════════════════════════════════

interface PageInfo {
  routeId: number;
  schemaUid: string;
  gridUid: string;
  title: string;
}

const PAGES: Record<string, PageInfo> = {};
const SPECIALTY_IDS: Record<string, number> = {};

async function phase0_discover() {
  console.log("\n╔═══════════════════════════════════════════════╗");
  console.log("║  Phase 0 — Discover pages & UIDs              ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  // Get all desktop routes
  const routesRes = await api("GET", "desktopRoutes:list?pageSize=200&sort=id&pagination=false");
  const routes: any[] = routesRes.data || [];

  // Find UGCO root group
  const ugcoRoot = routes.find((r: any) => r.type === "group" && r.title === "UGCO" && !r.parentId);
  if (!ugcoRoot) throw new Error("UGCO root group not found in desktopRoutes");
  console.log(`  📁 UGCO root: id=${ugcoRoot.id}`);

  // Recursively discover all pages
  // Note: tab children are separate route entries with parentId = page.id
  function discoverPages(parentId: number, allRoutes: any[]) {
    const children = allRoutes.filter((r: any) => r.parentId === parentId);
    for (const child of children) {
      if (child.type === "group") {
        console.log(`  📁 Group: "${child.title}" (id=${child.id})`);
        discoverPages(child.id, allRoutes);
      } else if (child.type === "page") {
        // Find the tab route that has this page as parent
        const tabRoute = allRoutes.find((r: any) => r.parentId === child.id && r.type === "tabs");
        const gridUid = tabRoute?.schemaUid || "";
        PAGES[child.title] = {
          routeId: child.id,
          schemaUid: child.schemaUid,
          gridUid,
          title: child.title,
        };
        console.log(`  📄 Page: "${child.title}" → grid=${gridUid}`);
      }
    }
  }

  discoverPages(ugcoRoot.id, routes);
  console.log(`\n  Total pages discovered: ${Object.keys(PAGES).length}`);

  // Discover specialty IDs
  console.log("\n  Discovering specialty IDs...");
  const specRes = await api("GET", "ref_oncoespecialidad:list?pageSize=20");
  const specs: any[] = specRes.data || [];
  for (const s of specs) {
    SPECIALTY_IDS[s.codigo_oficial] = s.id;
    console.log(`    ${s.codigo_oficial} = ${s.nombre} (id=${s.id})`);
  }
}

// ═══════════════════════════════════════════════════════════
// PHASE 1 — Verify data / re-seed if empty
// ═══════════════════════════════════════════════════════════

const NOMBRES_M = ["Juan","Carlos","Pedro","Miguel","José","Luis","Roberto","Fernando","Andrés","Diego","Ricardo","Sergio","Alejandro","Pablo","Francisco","Daniel","Gonzalo","Héctor","Raúl","Patricio"];
const NOMBRES_F = ["María","Ana","Carmen","Rosa","Patricia","Claudia","Francisca","Sofía","Valentina","Camila","Daniela","Carolina","Fernanda","Catalina","Javiera","Marcela","Isabel","Gabriela","Andrea","Paulina"];
const APELLIDOS = ["González","Muñoz","Rojas","Díaz","Pérez","Soto","Contreras","Silva","Martínez","Sepúlveda","Morales","Rodríguez","López","Fuentes","Hernández","García","Garrido","Bravo","Reyes","Núñez","Araya","Espinoza","Tapia","Figueroa","Cortés","Castro","Carrasco","Aravena","Flores","Gutiérrez"];
const COMUNAS = ["Ovalle","Monte Patria","Punitaqui","Combarbalá","Río Hurtado","Canela","La Serena","Coquimbo"];
const CIE10_ONCO = [
  { codigo: "C50.9", desc: "Tumor maligno de mama", esp: 3 },
  { codigo: "C34.9", desc: "Tumor maligno de bronquio o pulmón", esp: 6 },
  { codigo: "C18.9", desc: "Tumor maligno de colon", esp: 2 },
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
  { codigo: "C91.0", desc: "Leucemia linfoblástica aguda", esp: 9 },
  { codigo: "C81.9", desc: "Linfoma de Hodgkin", esp: 9 },
  { codigo: "C90.0", desc: "Mieloma múltiple", esp: 9 },
];
const PREVISIONES = ["FONASA A","FONASA B","FONASA C","FONASA D","ISAPRE","PRAIS"];
const TIPO_EVENTOS = ["EXAMEN","CIRUGIA","QT","RT","OTRO"];
const ORIGEN_DATO = ["ALMA","EXTERNO","MANUAL"];

function calcRUN(): { run: string; dv: string } {
  const num = randInt(5000000, 25000000);
  let sum = 0, mul = 2, n = num;
  while (n > 0) { sum += (n % 10) * mul; mul = mul === 7 ? 2 : mul + 1; n = Math.floor(n / 10); }
  const rem = 11 - (sum % 11);
  const dv = rem === 11 ? "0" : rem === 10 ? "K" : String(rem);
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return { run: `${formatted}-${dv}`, dv };
}

async function phase1_seed() {
  console.log("\n╔═══════════════════════════════════════════════╗");
  console.log("║  Phase 1 — Verify data / re-seed              ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  // Check if data exists
  const countRes = await apiSafe("GET", "ugco_casooncologico:list?pageSize=1");
  const totalCasos = countRes?.meta?.count || countRes?.meta?.totalCount || 0;
  console.log(`  Current ugco_casooncologico count: ${totalCasos}`);

  if (totalCasos > 10) {
    console.log("  ✅ Data already exists, skipping seed");
    return;
  }

  console.log("  ⚠ No data found — seeding 500 patients...\n");

  // 1. Patients
  console.log("── 1. ALMA Pacientes ──");
  const patients: any[] = [];
  for (let i = 1; i <= 500; i++) {
    const sexo = Math.random() > 0.5 ? "F" : "M";
    const { run, dv } = calcRUN();
    patients.push({
      paciente_id: i, run, tipo_documento: "RUN",
      nro_documento: run.replace(/\./g, "").split("-")[0], dv,
      nombres: sexo === "F" ? rand(NOMBRES_F) : rand(NOMBRES_M),
      apellido_paterno: rand(APELLIDOS), apellido_materno: rand(APELLIDOS),
      fecha_nacimiento: randDate(1940, 2000), sexo,
      nacionalidad: "Chilena", prevision: rand(PREVISIONES),
      sistema_prevision: "PÚBLICO", activo: true,
    });
  }
  await bulkCreate("alma_paciente", patients, "Pacientes");

  // 2. Episodios
  console.log("── 2. ALMA Episodios ──");
  const episodios = patients.map((p, i) => ({
    episodio_id: i + 1, paciente_id: p.paciente_id,
    tipo_episodio: rand(["HOSPITALARIO","CONSULTA_EXT","AMBULATORIO"]),
    fecha_ingreso: randDate(2024, 2026), establecimiento: "Hospital de Ovalle",
    servicio: rand(["Medicina","Cirugía","Oncología","Ginecología","Urología"]),
    profesional_tratante: `Dr. ${rand(APELLIDOS)}`, motivo_consulta: "Estudio oncológico", activo: true,
  }));
  await bulkCreate("alma_episodio", episodios, "Episodios");

  // 3. Diagnósticos
  console.log("── 3. ALMA Diagnósticos ──");
  const diagnosticos = patients.map((p, i) => {
    const dx = rand(CIE10_ONCO);
    return { diag_id: i + 1, episodio_id: i + 1, paciente_id: p.paciente_id,
      tipo_diagnostico: "PRINCIPAL", codigo_cie10: dx.codigo, descripcion: dx.desc,
      fecha_registro: randDate(2024, 2026), es_oncologico: true, activo: true };
  });
  await bulkCreate("alma_diagnostico", diagnosticos, "Diagnósticos");

  // 4. Casos oncológicos
  console.log("── 4. UGCO Casos Oncológicos ──");
  const casos: any[] = [];
  for (let i = 0; i < 450; i++) {
    const p = patients[i];
    const dx = rand(CIE10_ONCO);
    const fechaDx = randDate(2024, 2026);
    const fallecido = Math.random() < 0.05;
    casos.push({
      paciente_id: p.paciente_id, episodio_alma_id: i + 1, diag_alma_id: i + 1,
      codigo_cie10: dx.codigo, cie10_glosa: dx.desc, diagnostico_principal: dx.desc,
      fecha_diagnostico: fechaDx, fecha_caso: fechaDx, fecha_inicio_seguimiento: fechaDx,
      fecha_ultimo_contacto: randDate(2025, 2026),
      estado_clinico_id: rand([1,2,3,4]), estado_adm_id: rand([1,2,3,4,5]),
      estado_seguimiento_id: rand([1,2,3,4,5,6]), intencion_trat_id: rand([1,2,3,4]),
      tipo_etapificacion: rand(["TNM","FIGO","ANN_ARBOR"]),
      tnm_t: rand(["T1","T2","T3","T4","Tx"]), tnm_n: rand(["N0","N1","N2","Nx"]),
      tnm_m: rand(["M0","M1","Mx"]), estadio_clinico: rand(["I","II","IIA","IIB","III","IIIA","IV"]),
      ecog_inicial: randInt(0, 3), fallecido,
      fecha_defuncion: fallecido ? randDate(2025, 2026) : null,
      clinical_status: fallecido ? "inactive" : "active",
      verification_status: rand(["confirmed","provisional"]),
      _specialty: dx.esp,
    });
  }
  const casosClean = casos.map(({ _specialty, ...rest }) => rest);
  await bulkCreate("ugco_casooncologico", casosClean, "Casos");

  // 5. Caso-Especialidad
  console.log("── 5. UGCO Caso-Especialidad ──");
  const especRows: any[] = [];
  for (let i = 0; i < casos.length; i++) {
    especRows.push({ caso_id: i + 1, especialidad_id: casos[i]._specialty, es_principal: true });
    if (Math.random() < 0.5) {
      let sec = randInt(1, 9);
      while (sec === casos[i]._specialty) sec = randInt(1, 9);
      especRows.push({ caso_id: i + 1, especialidad_id: sec, es_principal: false });
    }
  }
  await bulkCreate("ugco_casoespecialidad", especRows, "Caso-Especialidad");

  // 6. Eventos clínicos
  console.log("── 6. UGCO Eventos Clínicos ──");
  const eventos: any[] = [];
  for (let i = 0; i < casos.length; i++) {
    for (let j = 0; j < randInt(2, 8); j++) {
      eventos.push({
        caso_id: i + 1, paciente_id: casos[i].paciente_id,
        tipo_evento: rand(TIPO_EVENTOS), origen_dato: rand(ORIGEN_DATO),
        fecha_solicitud: randDate(2024, 2026),
        fecha_realizacion: Math.random() > 0.3 ? randDate(2024, 2026) : null,
        resultado_resumen: rand(["Normal","Anormal","Pendiente informe","Compatible con neoplasia"]),
        centro_realizacion: rand(["Hospital de Ovalle","Hospital de Coquimbo","Hospital de La Serena"]),
        profesional_responsable: `Dr. ${rand(APELLIDOS)}`,
      });
    }
  }
  await bulkCreate("ugco_eventoclinico", eventos, "Eventos");

  // 7. Tareas
  console.log("── 7. UGCO Tareas ──");
  const titulos = ["Solicitar TAC de control","Coordinar hora de QT","Llamar al paciente","Revisar resultado de biopsia","Gestionar compra de servicio","Preparar caso para comité","Actualizar ficha clínica","Solicitar interconsulta","Seguimiento post-cirugía"];
  const tareas: any[] = [];
  for (let i = 0; i < casos.length; i++) {
    for (let j = 0; j < randInt(1, 4); j++) {
      tareas.push({
        caso_id: i + 1, paciente_id: casos[i].paciente_id,
        tipo_tarea_id: randInt(1, 8), estado_tarea_id: randInt(1, 5),
        titulo: rand(titulos), descripcion: "Tarea generada para testing",
        es_interna: Math.random() > 0.3, fecha_vencimiento: randDate(2025, 2026),
        fecha_inicio: randDate(2024, 2026),
        responsable_usuario: rand(["E. González","M. Soto","C. Pérez","A. Muñoz","R. Silva"]),
      });
    }
  }
  await bulkCreate("ugco_tarea", tareas, "Tareas");

  // 8. Contactos
  console.log("── 8. UGCO Contactos ──");
  const contactos = casos.map((c, i) => ({
    caso_id: i + 1, paciente_id: c.paciente_id,
    fuente_dato: rand(["ALMA","MANUAL"]), comuna_residencia: rand(COMUNAS),
    region_residencia: "Coquimbo", telefono_1: `+569${randInt(10000000, 99999999)}`,
  }));
  await bulkCreate("ugco_contactopaciente", contactos, "Contactos");

  // 9. Personas significativas
  console.log("── 9. UGCO Personas Significativas ──");
  const personas: any[] = [];
  for (let i = 0; i < casos.length; i++) {
    if (Math.random() < 0.65) {
      const s = Math.random() > 0.5 ? "F" : "M";
      personas.push({
        caso_id: i + 1, nombres: s === "F" ? rand(NOMBRES_F) : rand(NOMBRES_M),
        apellido_paterno: rand(APELLIDOS), apellido_materno: rand(APELLIDOS),
        parentesco: rand(["Cónyuge","Hijo/a","Padre/Madre","Hermano/a"]),
        telefono: `+569${randInt(10000000, 99999999)}`,
        es_contacto_emergencia: Math.random() > 0.3, es_cuidador_principal: Math.random() > 0.5,
      });
    }
  }
  await bulkCreate("ugco_personasignificativa", personas, "Personas Sig.");

  // 10. Documentos
  console.log("── 10. UGCO Documentos ──");
  const docs = casos.map((_, i) => ({
    caso_id: i + 1, tipo_documento_id: randInt(1, 5),
    nombre_documento: rand(["Informe Biopsia","TAC","Ecografía","Informe Quirúrgico","Consentimiento"]),
    descripcion: "Documento de testing", fecha_documento: randDate(2024, 2026), origen: rand(["ALMA","MANUAL","EXTERNO"]),
  }));
  await bulkCreate("ugco_documentocaso", docs, "Documentos");

  // 11. Comités
  console.log("── 11. UGCO Comités ──");
  const comites: any[] = [];
  for (let i = 1; i <= 20; i++) {
    comites.push({
      nombre: `Comité Oncológico ${i}`, fecha_comite: randDate(2024, 2026),
      tipo_comite: rand(["ORDINARIO","EXTRAORDINARIO"]), especialidad_id: randInt(1, 9),
      lugar: rand(["Sala Reuniones UGCO","Auditorio Hospital","Videoconferencia"]),
    });
  }
  await bulkCreate("ugco_comiteoncologico", comites, "Comités");

  // 12. Casos en comité
  console.log("── 12. UGCO Casos en Comité ──");
  const comiteCasos: any[] = [];
  const usedPairs = new Set<string>();
  for (let i = 0; i < 200; i++) {
    const comite_id = randInt(1, 20), caso_id = randInt(1, 450);
    const key = `${comite_id}-${caso_id}`;
    if (usedPairs.has(key)) continue;
    usedPairs.add(key);
    comiteCasos.push({
      comite_id, caso_id, es_caso_principal: Math.random() > 0.7,
      decision_resumen: rand(["Iniciar QT","Cirugía programada","Continuar seguimiento","Derivar a RT","Completar estudios"]),
      plan_tratamiento: rand(["QT neoadyuvante + cirugía","Cirugía + RT adyuvante","QT paliativa","Seguimiento activo"]),
      responsable_seguimiento: rand(["E. González","M. Soto","C. Pérez"]),
      requiere_tareas: Math.random() > 0.4,
    });
  }
  await bulkCreate("ugco_comitecaso", comiteCasos, "Casos Comité");

  // 13. Equipos
  console.log("── 13. UGCO Equipos ──");
  const espNames = ["Digestivo Alto","Digestivo Bajo","Mama","Ginecología","Urología","Tórax","Piel y Partes Blandas","Endocrinología","Hematología"];
  const equipos = espNames.map((e, i) => ({ nombre: `Equipo ${e}`, especialidad_id: i + 1, descripcion: `Equipo de seguimiento de ${e}`, activo: true }));
  await bulkCreate("ugco_equiposeguimiento", equipos, "Equipos");

  // 14. Miembros
  console.log("── 14. UGCO Miembros ──");
  const miembros: any[] = [];
  for (let eq = 1; eq <= 9; eq++) {
    miembros.push({ equipo_id: eq, nombre_usuario: `Dr. ${rand(APELLIDOS)}`, rol_equipo: "Médico Referente", activo: true });
    miembros.push({ equipo_id: eq, nombre_usuario: `Enf. ${rand(APELLIDOS)}`, rol_equipo: "Enfermera Gestora", activo: true });
    miembros.push({ equipo_id: eq, nombre_usuario: `TENS ${rand(APELLIDOS)}`, rol_equipo: "TENS Gestora", activo: true });
    miembros.push({ equipo_id: eq, nombre_usuario: `Adm. ${rand(APELLIDOS)}`, rol_equipo: "Administrativa", activo: true });
  }
  await bulkCreate("ugco_equipomiembro", miembros, "Miembros");

  // 15. Observaciones
  console.log("── 15. UGCO Observaciones ──");
  const obsTextos = ["Paciente contactado telefónicamente","Se solicita TAC de control","Resultado de biopsia recibido","Paciente no acude a citación","Se coordina hora en centro externo","Control satisfactorio"];
  const obs: any[] = [];
  for (let i = 0; i < 1000; i++) {
    obs.push({
      evento_id: randInt(1, eventos.length), caso_id: randInt(1, 450),
      texto: rand(obsTextos), fecha_observacion: randDate(2024, 2026),
      autor: rand(["E. González","M. Soto","C. Pérez","Dr. Muñoz","Enf. Silva"]),
    });
  }
  await bulkCreate("ugco_observacionevento", obs, "Observaciones");

  console.log("\n  ✅ Seed complete");
}

// ═══════════════════════════════════════════════════════════
// PHASE 2 — Fix FK columns (C3 + E2)
// ═══════════════════════════════════════════════════════════

// Map: collection.fk_field → collection.association_name
const FK_TO_ASSOC: Record<string, string> = {
  "ugco_casooncologico.paciente_id": "ugco_casooncologico.paciente",
  "ugco_casooncologico.estado_clinico_id": "ugco_casooncologico.estado_clinico",
  "ugco_casooncologico.estado_adm_id": "ugco_casooncologico.estado_adm",
  "ugco_casooncologico.estado_seguimiento_id": "ugco_casooncologico.estado_seguimiento",
  "ugco_comiteoncologico.especialidad_id": "ugco_comiteoncologico.especialidad",
  "ugco_comitecaso.comite_id": "ugco_comitecaso.comite",
  "ugco_comitecaso.caso_id": "ugco_comitecaso.caso",
  "ugco_tarea.tipo_tarea_id": "ugco_tarea.tipo_tarea",
  "ugco_tarea.estado_tarea_id": "ugco_tarea.estado_tarea",
  "ugco_equiposeguimiento.especialidad_id": "ugco_equiposeguimiento.especialidad",
};

async function phase2_fixFKColumns() {
  console.log("\n╔═══════════════════════════════════════════════╗");
  console.log("║  Phase 2 — Fix FK columns → associations      ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  let fixed = 0, skipped = 0;

  for (const [pageTitle, page] of Object.entries(PAGES)) {
    if (!page.gridUid) { console.log(`  ⏭ "${pageTitle}" — no gridUid`); continue; }

    // Get the full schema for this page
    const schemaRes = await apiSafe("GET", `uiSchemas:getJsonSchema/${page.gridUid}`);
    if (!schemaRes?.data) { console.log(`  ⏭ "${pageTitle}" — no schema`); continue; }

    // Find all nodes with x-collection-field ending in _id
    const patches: { xUid: string; oldField: string; newField: string }[] = [];

    function walkSchema(node: any) {
      if (!node || typeof node !== "object") return;
      if (node["x-collection-field"] && node["x-collection-field"].endsWith("_id")) {
        const collField = node["x-collection-field"]; // e.g. "ugco_casooncologico.estado_clinico_id"
        const newCollField = FK_TO_ASSOC[collField];
        if (newCollField && node["x-uid"]) {
          patches.push({ xUid: node["x-uid"], oldField: collField, newField: newCollField });
        }
      }
      if (node.properties) {
        for (const key of Object.keys(node.properties)) {
          walkSchema(node.properties[key]);
        }
      }
    }

    walkSchema(schemaRes.data);

    if (patches.length === 0) {
      skipped++;
      continue;
    }

    console.log(`  📄 "${pageTitle}" — ${patches.length} FK columns to fix`);

    for (const patch of patches) {
      const patchBody = {
        "x-uid": patch.xUid,
        "x-collection-field": patch.newField,
        "x-component": "CollectionField",
        "x-component-props": {},
        "x-read-pretty": true,
      };
      const res = await apiSafe("POST", `uiSchemas:patch`, patchBody);
      if (res) {
        console.log(`    ✅ ${patch.oldField} → ${patch.newField}`);
        fixed++;
      }
      await delay(200);
    }
  }

  console.log(`\n  Fixed: ${fixed} columns | Skipped: ${skipped} pages`);
}

// ═══════════════════════════════════════════════════════════
// PHASE 3 — Dashboard charts (C2)
// ═══════════════════════════════════════════════════════════

interface ChartOpts {
  title: string;
  collection: string;
  measures: { field: string[]; aggregate: string; alias: string }[];
  dimensions: { field: string[]; alias?: string }[];
  filter?: object;
  chartType: string;
  general?: Record<string, string>;
}

function buildChartRowSchema(leftChart: ChartOpts, rightChart: ChartOpts): object {
  const rowId = uid();

  function buildSingleChart(opts: ChartOpts): object {
    const blockId = uid(), outerActionsId = uid(), gridId = uid();
    const innerRowId = uid(), innerColId = uid(), rendererId = uid();
    const innerActionsId = uid(), chartId = uid();

    return {
      type: "void", "x-uid": blockId, name: blockId, version: "2.0", _isJSONSchemaObject: true,
      "x-component": "ChartCardItem", "x-use-component-props": "useChartBlockCardProps",
      "x-settings": "chart:block", "x-decorator": "ChartBlockProvider",
      "x-decorator-props": { collection: opts.collection, dataSource: "main" },
      "x-async": false, "x-index": 1,
      properties: {
        [outerActionsId]: {
          type: "void", "x-uid": outerActionsId, name: outerActionsId, version: "2.0", _isJSONSchemaObject: true,
          "x-component": "ActionBar",
          "x-component-props": { style: { marginBottom: "var(--nb-designer-offset)" } },
          "x-initializer": "chartBlock:configureActions", "x-async": false, "x-index": 1,
        },
        [gridId]: {
          type: "void", "x-uid": gridId, name: gridId, version: "2.0", _isJSONSchemaObject: true,
          "x-component": "Grid", "x-decorator": "ChartV2Block",
          "x-initializer": "charts:addBlock", "x-async": false, "x-index": 2,
          properties: {
            [innerRowId]: {
              type: "void", "x-uid": innerRowId, name: innerRowId, version: "2.0", _isJSONSchemaObject: true,
              "x-component": "Grid.Row", "x-async": false, "x-index": 1,
              properties: {
                [innerColId]: {
                  type: "void", "x-uid": innerColId, name: innerColId, version: "2.0", _isJSONSchemaObject: true,
                  "x-component": "Grid.Col", "x-async": false, "x-index": 1,
                  properties: {
                    [rendererId]: {
                      type: "void", "x-uid": rendererId, name: rendererId, version: "2.0", _isJSONSchemaObject: true,
                      "x-decorator": "ChartRendererProvider",
                      "x-decorator-props": {
                        collection: opts.collection, dataSource: "main",
                        query: { measures: opts.measures, dimensions: opts.dimensions, filter: opts.filter || {}, orders: [], limit: 2000 },
                        config: { chartType: opts.chartType, general: opts.general || {}, advanced: {}, title: opts.title, bordered: false },
                      },
                      "x-acl-action": `${opts.collection}:list`,
                      "x-toolbar": "ChartRendererToolbar", "x-settings": "chart:renderer",
                      "x-component": "CardItem", "x-component-props": { size: "small", bordered: false },
                      "x-initializer": "charts:addBlock", "x-async": false, "x-index": 1,
                      properties: {
                        [innerActionsId]: {
                          type: "void", "x-uid": innerActionsId, name: innerActionsId, version: "2.0", _isJSONSchemaObject: true,
                          "x-component": "ActionBar", "x-initializer": "chart:configureActions", "x-async": false, "x-index": 1,
                        },
                        [chartId]: {
                          type: "void", "x-uid": chartId, name: chartId, version: "2.0", _isJSONSchemaObject: true,
                          "x-component": "ChartRenderer", "x-component-props": {}, "x-async": false, "x-index": 2,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
  }

  const leftColId = uid(), rightColId = uid();
  return {
    type: "void", "x-uid": rowId, name: rowId, version: "2.0", _isJSONSchemaObject: true,
    "x-component": "Grid.Row", "x-async": false, "x-index": 1,
    properties: {
      [leftColId]: {
        type: "void", "x-uid": leftColId, name: leftColId, version: "2.0", _isJSONSchemaObject: true,
        "x-component": "Grid.Col", "x-async": false, "x-index": 1,
        properties: { [uid()]: buildSingleChart(leftChart) },
      },
      [rightColId]: {
        type: "void", "x-uid": rightColId, name: rightColId, version: "2.0", _isJSONSchemaObject: true,
        "x-component": "Grid.Col", "x-async": false, "x-index": 2,
        properties: { [uid()]: buildSingleChart(rightChart) },
      },
    },
  };
}

async function phase3_dashboardCharts() {
  console.log("\n╔═══════════════════════════════════════════════╗");
  console.log("║  Phase 3 — Dashboard charts (C2)              ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  const dashPage = PAGES["📊 Dashboard"] || PAGES["Dashboard"];
  if (!dashPage?.gridUid) { console.error("  ❌ Dashboard page not found"); return; }

  // Check if charts already exist
  const schemaRes = await apiSafe("GET", `uiSchemas:getJsonSchema/${dashPage.gridUid}`);
  if (schemaRes?.data) {
    let hasChart = false;
    function findChart(node: any) {
      if (!node || typeof node !== "object") return;
      if (node["x-decorator"] === "ChartBlockProvider" || node["x-component"] === "ChartCardItem") hasChart = true;
      if (node.properties) for (const k of Object.keys(node.properties)) findChart(node.properties[k]);
    }
    findChart(schemaRes.data);
    if (hasChart) { console.log("  ✅ Charts already exist, skipping"); return; }
  }

  const chartRow = buildChartRowSchema(
    {
      title: "Casos por Especialidad",
      collection: "ugco_casoespecialidad",
      measures: [{ field: ["id"], aggregation: "count", alias: "count" }],
      dimensions: [{ field: ["especialidad", "nombre"], alias: "especialidad" }],
      filter: { es_principal: true },
      chartType: "ant-design-charts.bar",
      general: { yField: "especialidad", xField: "count" },
    },
    {
      title: "Distribución por Estado Clínico",
      collection: "ugco_casooncologico",
      measures: [{ field: ["id"], aggregation: "count", alias: "count" }],
      dimensions: [{ field: ["estado_clinico", "nombre"], alias: "estado" }],
      chartType: "ant-design-charts.pie",
      general: { colorField: "estado", angleField: "count" },
    },
  );

  const res = await apiSafe("POST", `uiSchemas:insertAdjacent/${dashPage.gridUid}?position=beforeEnd`, { schema: chartRow });
  if (res) console.log("  ✅ Dashboard chart row inserted");
  else console.error("  ❌ Failed to insert dashboard charts");
}

// ═══════════════════════════════════════════════════════════
// PHASE 4 — Reportes page content (C4)
// ═══════════════════════════════════════════════════════════

function buildStatisticSchema(title: string, collection: string, filter?: object): object {
  const blockId = uid(), outerActionsId = uid(), gridId = uid();
  const innerRowId = uid(), innerColId = uid(), rendererId = uid();
  const innerActionsId = uid(), chartId = uid();

  return {
    type: "void", "x-uid": blockId, name: blockId, version: "2.0", _isJSONSchemaObject: true,
    "x-component": "ChartCardItem", "x-use-component-props": "useChartBlockCardProps",
    "x-settings": "chart:block", "x-decorator": "ChartBlockProvider",
    "x-decorator-props": { collection, dataSource: "main" },
    "x-async": false, "x-index": 1,
    properties: {
      [outerActionsId]: {
        type: "void", "x-uid": outerActionsId, name: outerActionsId, version: "2.0", _isJSONSchemaObject: true,
        "x-component": "ActionBar",
        "x-component-props": { style: { marginBottom: "var(--nb-designer-offset)" } },
        "x-initializer": "chartBlock:configureActions", "x-async": false, "x-index": 1,
      },
      [gridId]: {
        type: "void", "x-uid": gridId, name: gridId, version: "2.0", _isJSONSchemaObject: true,
        "x-component": "Grid", "x-decorator": "ChartV2Block",
        "x-initializer": "charts:addBlock", "x-async": false, "x-index": 2,
        properties: {
          [innerRowId]: {
            type: "void", "x-uid": innerRowId, name: innerRowId, version: "2.0", _isJSONSchemaObject: true,
            "x-component": "Grid.Row", "x-async": false, "x-index": 1,
            properties: {
              [innerColId]: {
                type: "void", "x-uid": innerColId, name: innerColId, version: "2.0", _isJSONSchemaObject: true,
                "x-component": "Grid.Col", "x-async": false, "x-index": 1,
                properties: {
                  [rendererId]: {
                    type: "void", "x-uid": rendererId, name: rendererId, version: "2.0", _isJSONSchemaObject: true,
                    "x-decorator": "ChartRendererProvider",
                    "x-decorator-props": {
                      collection, dataSource: "main",
                      query: {
                        measures: [{ field: ["id"], aggregation: "count", alias: "count" }],
                        dimensions: [], filter: filter || {}, orders: [], limit: 1,
                      },
                      config: { chartType: "antd.statistic", general: {}, advanced: {}, title, bordered: false },
                    },
                    "x-acl-action": `${collection}:list`,
                    "x-toolbar": "ChartRendererToolbar", "x-settings": "chart:renderer",
                    "x-component": "CardItem", "x-component-props": { size: "small", bordered: false },
                    "x-async": false, "x-index": 1,
                    properties: {
                      [innerActionsId]: {
                        type: "void", "x-uid": innerActionsId, name: innerActionsId, version: "2.0", _isJSONSchemaObject: true,
                        "x-component": "ActionBar", "x-initializer": "chart:configureActions", "x-async": false, "x-index": 1,
                      },
                      [chartId]: {
                        type: "void", "x-uid": chartId, name: chartId, version: "2.0", _isJSONSchemaObject: true,
                        "x-component": "ChartRenderer", "x-component-props": {}, "x-async": false, "x-index": 2,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

async function phase4_reportes() {
  console.log("\n╔═══════════════════════════════════════════════╗");
  console.log("║  Phase 4 — Reportes page content (C4)         ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  const repPage = PAGES["Reportes"];
  if (!repPage?.gridUid) { console.error("  ❌ Reportes page not found"); return; }

  // Check if content exists
  const schemaRes = await apiSafe("GET", `uiSchemas:getJsonSchema/${repPage.gridUid}`);
  const existingProps = schemaRes?.data?.properties;
  if (existingProps && Object.keys(existingProps).length > 0) {
    console.log("  ✅ Reportes already has content, skipping");
    return;
  }

  // Row 1: Charts (bar + pie)
  const chartRow = buildChartRowSchema(
    {
      title: "Casos por Especialidad",
      collection: "ugco_casoespecialidad",
      measures: [{ field: ["id"], aggregation: "count", alias: "count" }],
      dimensions: [{ field: ["especialidad", "nombre"], alias: "especialidad" }],
      filter: { es_principal: true },
      chartType: "ant-design-charts.bar",
      general: { yField: "especialidad", xField: "count" },
    },
    {
      title: "Distribución por Estado Clínico",
      collection: "ugco_casooncologico",
      measures: [{ field: ["id"], aggregation: "count", alias: "count" }],
      dimensions: [{ field: ["estado_clinico", "nombre"], alias: "estado" }],
      chartType: "ant-design-charts.pie",
      general: { colorField: "estado", angleField: "count" },
    },
  );

  const res1 = await apiSafe("POST", `uiSchemas:insertAdjacent/${repPage.gridUid}?position=beforeEnd`, { schema: chartRow });
  if (res1) console.log("  ✅ Charts row inserted");
  await delay(500);

  // Row 2: KPI statistics
  const statRowId = uid();
  const leftColId = uid(), rightColId = uid();
  const statRow = {
    type: "void", "x-uid": statRowId, name: statRowId, version: "2.0", _isJSONSchemaObject: true,
    "x-component": "Grid.Row", "x-async": false, "x-index": 2,
    properties: {
      [leftColId]: {
        type: "void", "x-uid": leftColId, name: leftColId, version: "2.0", _isJSONSchemaObject: true,
        "x-component": "Grid.Col", "x-async": false, "x-index": 1,
        properties: {
          [uid()]: buildStatisticSchema("Total Casos Oncológicos", "ugco_casooncologico"),
        },
      },
      [rightColId]: {
        type: "void", "x-uid": rightColId, name: rightColId, version: "2.0", _isJSONSchemaObject: true,
        "x-component": "Grid.Col", "x-async": false, "x-index": 2,
        properties: {
          [uid()]: buildStatisticSchema("Total Tareas Pendientes", "ugco_tarea"),
        },
      },
    },
  };

  const res2 = await apiSafe("POST", `uiSchemas:insertAdjacent/${repPage.gridUid}?position=beforeEnd`, { schema: statRow });
  if (res2) console.log("  ✅ KPI statistics row inserted");
}

// ═══════════════════════════════════════════════════════════
// PHASE 5 — Ficha 360° (C5)
// ═══════════════════════════════════════════════════════════

async function phase5_ficha360() {
  console.log("\n╔═══════════════════════════════════════════════╗");
  console.log("║  Phase 5 — Ficha 360° Paciente (C5)           ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  const fichaPage = PAGES["🗂️ Ficha 360° Paciente"] || PAGES["Ficha 360° Paciente"];
  if (!fichaPage?.gridUid) { console.error("  ❌ Ficha 360° page not found"); return; }

  // Check if content exists
  const schemaRes = await apiSafe("GET", `uiSchemas:getJsonSchema/${fichaPage.gridUid}`);
  const existingProps = schemaRes?.data?.properties;
  if (existingProps && Object.keys(existingProps).length > 0) {
    console.log("  ✅ Ficha 360° already has content, skipping");
    return;
  }

  // Row 1: Details block for ugco_casooncologico
  const detailFields = ["UGCO_COD01","paciente","codigo_cie10","diagnostico_principal","fecha_diagnostico","estadio_clinico","estado_clinico","estado_adm","estado_seguimiento","tnm_t","tnm_n","tnm_m","observaciones"];
  const detailCols: Record<string, any> = {};
  for (const f of detailFields) {
    detailCols[uid()] = {
      _isJSONSchemaObject: true, version: "2.0", type: "void",
      "x-decorator": "FormItem", "x-component": "CollectionField",
      "x-collection-field": `ugco_casooncologico.${f}`,
      "x-component-props": {}, "x-read-pretty": true,
    };
  }

  const detailRowUid = uid();
  const detailSchema = {
    type: "void", "x-uid": detailRowUid, name: detailRowUid, version: "2.0", _isJSONSchemaObject: true,
    "x-component": "Grid.Row", "x-async": false,
    properties: {
      [uid()]: {
        type: "void", _isJSONSchemaObject: true, version: "2.0",
        "x-component": "Grid.Col",
        properties: {
          [uid()]: {
            type: "void", _isJSONSchemaObject: true, version: "2.0",
            "x-acl-action": "ugco_casooncologico:get",
            "x-decorator": "DetailsBlockProvider",
            "x-decorator-props": {
              collection: "ugco_casooncologico", dataSource: "main", action: "list",
              params: { pageSize: 1, sort: ["-createdAt"] },
            },
            "x-component": "CardItem",
            "x-component-props": { title: "1. Datos Generales del Caso" },
            "x-toolbar": "BlockSchemaToolbar", "x-settings": "blockSettings:details",
            properties: {
              [uid()]: {
                type: "void", _isJSONSchemaObject: true, version: "2.0",
                "x-component": "Details",
                "x-read-pretty": true,
                "x-use-component-props": "useDetailsBlockProps",
                properties: detailCols,
              },
            },
          },
        },
      },
    },
  };

  const res1 = await apiSafe("POST", `uiSchemas:insertAdjacent/${fichaPage.gridUid}?position=beforeEnd`, { schema: detailSchema });
  if (res1) console.log("  ✅ Details block inserted");
  await delay(500);

  // Row 2: Eventos table
  const eventoCols = ["tipo_evento","fecha_solicitud","fecha_realizacion","resultado_resumen","origen_dato","profesional_responsable"];
  const eventoColProps: Record<string, any> = {};
  for (const col of eventoCols) {
    eventoColProps[uid()] = {
      _isJSONSchemaObject: true, version: "2.0", type: "void",
      "x-decorator": "TableV2.Column.Decorator", "x-component": "TableV2.Column",
      properties: {
        [col]: {
          _isJSONSchemaObject: true, version: "2.0",
          "x-collection-field": `ugco_eventoclinico.${col}`,
          "x-component": "CollectionField", "x-component-props": {},
          "x-read-pretty": true, "x-decorator": null, "x-decorator-props": {},
        },
      },
    };
  }

  const eventoRowUid = uid();
  const eventoSchema = {
    type: "void", "x-uid": eventoRowUid, name: eventoRowUid, version: "2.0", _isJSONSchemaObject: true,
    "x-component": "Grid.Row", "x-async": false,
    properties: {
      [uid()]: {
        type: "void", _isJSONSchemaObject: true, version: "2.0", "x-component": "Grid.Col",
        properties: {
          [uid()]: {
            type: "void", _isJSONSchemaObject: true, version: "2.0",
            "x-acl-action": "ugco_eventoclinico:list",
            "x-decorator": "TableBlockProvider",
            "x-decorator-props": {
              collection: "ugco_eventoclinico", dataSource: "main", action: "list",
              params: { pageSize: 10, sort: ["-fecha_realizacion"] }, showIndex: true, dragSort: false,
            },
            "x-component": "CardItem",
            "x-component-props": { title: "2. Episodios Clínicos" },
            "x-toolbar": "BlockSchemaToolbar", "x-settings": "blockSettings:table",
            properties: {
              actions: {
                _isJSONSchemaObject: true, version: "2.0", type: "void",
                "x-initializer": "table:configureActions", "x-component": "ActionBar",
                "x-component-props": { style: { marginBottom: "var(--nb-spacing)" } },
                properties: {
                  filter: {
                    _isJSONSchemaObject: true, version: "2.0", type: "void",
                    title: '{{ t("Filter") }}', "x-action": "filter",
                    "x-component": "Filter.Action", "x-use-component-props": "useFilterActionProps",
                    "x-component-props": { icon: "FilterOutlined" }, "x-align": "left",
                  },
                },
              },
              [uid()]: {
                _isJSONSchemaObject: true, version: "2.0", type: "array",
                "x-initializer": "table:configureColumns", "x-component": "TableV2",
                "x-use-component-props": "useTableBlockProps",
                "x-component-props": { rowKey: "id", rowSelection: { type: "checkbox" } },
                properties: eventoColProps,
              },
            },
          },
        },
      },
    },
  };

  const res2 = await apiSafe("POST", `uiSchemas:insertAdjacent/${fichaPage.gridUid}?position=beforeEnd`, { schema: eventoSchema });
  if (res2) console.log("  ✅ Eventos table inserted");
  await delay(500);

  // Row 3: Tareas table
  const tareaCols = ["titulo","tipo_tarea","estado_tarea","fecha_vencimiento","responsable_usuario"];
  const tareaColProps: Record<string, any> = {};
  for (const col of tareaCols) {
    tareaColProps[uid()] = {
      _isJSONSchemaObject: true, version: "2.0", type: "void",
      "x-decorator": "TableV2.Column.Decorator", "x-component": "TableV2.Column",
      properties: {
        [col]: {
          _isJSONSchemaObject: true, version: "2.0",
          "x-collection-field": `ugco_tarea.${col}`,
          "x-component": "CollectionField", "x-component-props": {},
          "x-read-pretty": true, "x-decorator": null, "x-decorator-props": {},
        },
      },
    };
  }

  const tareaRowUid = uid();
  const tareaSchema = {
    type: "void", "x-uid": tareaRowUid, name: tareaRowUid, version: "2.0", _isJSONSchemaObject: true,
    "x-component": "Grid.Row", "x-async": false,
    properties: {
      [uid()]: {
        type: "void", _isJSONSchemaObject: true, version: "2.0", "x-component": "Grid.Col",
        properties: {
          [uid()]: {
            type: "void", _isJSONSchemaObject: true, version: "2.0",
            "x-acl-action": "ugco_tarea:list",
            "x-decorator": "TableBlockProvider",
            "x-decorator-props": {
              collection: "ugco_tarea", dataSource: "main", action: "list",
              params: { pageSize: 10, sort: ["-fecha_vencimiento"] }, showIndex: true, dragSort: false,
            },
            "x-component": "CardItem",
            "x-component-props": { title: "3. Tareas del Caso" },
            "x-toolbar": "BlockSchemaToolbar", "x-settings": "blockSettings:table",
            properties: {
              [uid()]: {
                _isJSONSchemaObject: true, version: "2.0", type: "array",
                "x-initializer": "table:configureColumns", "x-component": "TableV2",
                "x-use-component-props": "useTableBlockProps",
                "x-component-props": { rowKey: "id", rowSelection: { type: "checkbox" } },
                properties: tareaColProps,
              },
            },
          },
        },
      },
    },
  };

  const res3 = await apiSafe("POST", `uiSchemas:insertAdjacent/${fichaPage.gridUid}?position=beforeEnd`, { schema: tareaSchema });
  if (res3) console.log("  ✅ Tareas table inserted");
}

// ═══════════════════════════════════════════════════════════
// PHASE 6 — Specialty filters (E1)
// ═══════════════════════════════════════════════════════════

const SPEC_PAGE_MAP: Record<string, string> = {
  "Digestivo Alto": "DIG_ALTO",
  "Digestivo Bajo": "DIG_BAJO",
  "Mama": "MAMA",
  "Ginecología": "GINECO",
  "Urología": "UROLO",
  "Tórax": "TORAX",
  "Piel y Partes Blandas": "PIEL",
  "Endocrinología": "ENDOCR",
  "Hematología": "HEMATO",
};

async function phase6_specialtyFilters() {
  console.log("\n╔═══════════════════════════════════════════════╗");
  console.log("║  Phase 6 — Specialty filters (E1)             ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  let fixed = 0;

  for (const [pageTitle, specCode] of Object.entries(SPEC_PAGE_MAP)) {
    const page = PAGES[pageTitle];
    if (!page?.gridUid) { console.log(`  ⏭ "${pageTitle}" not found`); continue; }

    const specId = SPECIALTY_IDS[specCode];
    if (!specId) { console.log(`  ⏭ Specialty "${specCode}" not found in ref`); continue; }

    // Get schema, find TableBlockProvider node
    const schemaRes = await apiSafe("GET", `uiSchemas:getJsonSchema/${page.gridUid}`);
    if (!schemaRes?.data) continue;

    // Find TableBlockProvider node
    let tableProviderUid: string | null = null;
    let currentFilter: any = null;

    function findTableProvider(node: any) {
      if (!node || typeof node !== "object") return;
      if (node["x-decorator"] === "TableBlockProvider" && node["x-uid"]) {
        tableProviderUid = node["x-uid"];
        currentFilter = node["x-decorator-props"]?.params?.filter;
      }
      if (node.properties) for (const k of Object.keys(node.properties)) findTableProvider(node.properties[k]);
    }
    findTableProvider(schemaRes.data);

    if (!tableProviderUid) { console.log(`  ⏭ "${pageTitle}" — no TableBlockProvider`); continue; }

    // Skip if filter already set
    if (currentFilter && JSON.stringify(currentFilter).includes("especialidad_id")) {
      console.log(`  ✅ "${pageTitle}" — filter already set`);
      continue;
    }

    // Patch with specialty filter
    const patchBody = {
      "x-uid": tableProviderUid,
      "x-decorator-props": {
        collection: "ugco_casooncologico", dataSource: "main", action: "list",
        params: {
          pageSize: 20,
          sort: ["-fecha_diagnostico"],
          filter: {
            $and: [{ especialidades: { especialidad_id: { $eq: specId }, es_principal: { $eq: true } } }],
          },
        },
        showIndex: true, dragSort: false,
      },
    };

    const res = await apiSafe("POST", "uiSchemas:patch", patchBody);
    if (res) {
      console.log(`  ✅ "${pageTitle}" → filter by ${specCode} (id=${specId})`);
      fixed++;
    }
    await delay(300);
  }

  console.log(`\n  Fixed: ${fixed} specialty pages`);
}

// ═══════════════════════════════════════════════════════════
// PHASE 7 — Improve Dashboard columns (E3)
// ═══════════════════════════════════════════════════════════

async function phase7_dashboardColumns() {
  console.log("\n╔═══════════════════════════════════════════════╗");
  console.log("║  Phase 7 — Dashboard columns (E3)             ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  const dashPage = PAGES["📊 Dashboard"] || PAGES["Dashboard"];
  if (!dashPage?.gridUid) { console.error("  ❌ Dashboard page not found"); return; }

  const schemaRes = await apiSafe("GET", `uiSchemas:getJsonSchema/${dashPage.gridUid}`);
  if (!schemaRes?.data) return;

  // Find TableV2 nodes (the array-type nodes)
  const tableV2Uids: { uid: string; collection: string }[] = [];

  function findTableV2(node: any, parentCollection?: string) {
    if (!node || typeof node !== "object") return;
    if (node["x-decorator"] === "TableBlockProvider") {
      parentCollection = node["x-decorator-props"]?.collection;
    }
    if (node["x-component"] === "TableV2" && node["x-uid"] && node.type === "array") {
      tableV2Uids.push({ uid: node["x-uid"], collection: parentCollection || "" });
    }
    if (node.properties) for (const k of Object.keys(node.properties)) findTableV2(node.properties[k], parentCollection);
  }
  findTableV2(schemaRes.data);

  for (const tv2 of tableV2Uids) {
    if (tv2.collection === "ugco_casooncologico") {
      // Add "paciente" association column
      const colSchema = {
        _isJSONSchemaObject: true, version: "2.0", type: "void",
        "x-decorator": "TableV2.Column.Decorator", "x-component": "TableV2.Column",
        "x-uid": uid(), name: uid(),
        properties: {
          paciente: {
            _isJSONSchemaObject: true, version: "2.0",
            "x-collection-field": "ugco_casooncologico.paciente",
            "x-component": "CollectionField", "x-component-props": {},
            "x-read-pretty": true, "x-decorator": null, "x-decorator-props": {},
          },
        },
      };
      const r = await apiSafe("POST", `uiSchemas:insertAdjacent/${tv2.uid}?position=afterBegin`, { schema: colSchema });
      if (r) console.log(`  ✅ Added "Paciente" column to Casos table`);
      await delay(300);
    }

    if (tv2.collection === "ugco_comitecaso") {
      // Add "caso" association column
      const colSchema = {
        _isJSONSchemaObject: true, version: "2.0", type: "void",
        "x-decorator": "TableV2.Column.Decorator", "x-component": "TableV2.Column",
        "x-uid": uid(), name: uid(),
        properties: {
          caso: {
            _isJSONSchemaObject: true, version: "2.0",
            "x-collection-field": "ugco_comitecaso.caso",
            "x-component": "CollectionField", "x-component-props": {},
            "x-read-pretty": true, "x-decorator": null, "x-decorator-props": {},
          },
        },
      };
      const r = await apiSafe("POST", `uiSchemas:insertAdjacent/${tv2.uid}?position=afterBegin`, { schema: colSchema });
      if (r) console.log(`  ✅ Added "Caso" column to Comité table`);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// PHASE 8 — Verification
// ═══════════════════════════════════════════════════════════

async function phase8_verify() {
  console.log("\n╔═══════════════════════════════════════════════╗");
  console.log("║  Phase 8 — Verification                       ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  const checks = [
    { collection: "alma_paciente", label: "Pacientes" },
    { collection: "ugco_casooncologico", label: "Casos Oncológicos" },
    { collection: "ugco_eventoclinico", label: "Eventos Clínicos" },
    { collection: "ugco_tarea", label: "Tareas" },
    { collection: "ugco_comiteoncologico", label: "Comités" },
    { collection: "ugco_comitecaso", label: "Casos en Comité" },
    { collection: "ugco_equiposeguimiento", label: "Equipos" },
  ];

  console.log("  Data counts:");
  for (const c of checks) {
    const res = await apiSafe("GET", `${c.collection}:list?pageSize=1`);
    const count = res?.meta?.count || res?.meta?.totalCount || "?";
    console.log(`    ${c.label}: ${count}`);
  }

  // Check dashboard has charts
  const dashPage = PAGES["📊 Dashboard"] || PAGES["Dashboard"];
  if (dashPage?.gridUid) {
    const schema = await apiSafe("GET", `uiSchemas:getJsonSchema/${dashPage.gridUid}`);
    let chartCount = 0;
    function countCharts(node: any) {
      if (!node || typeof node !== "object") return;
      if (node["x-component"] === "ChartRenderer") chartCount++;
      if (node.properties) for (const k of Object.keys(node.properties)) countCharts(node.properties[k]);
    }
    countCharts(schema?.data);
    console.log(`\n  Dashboard charts: ${chartCount}`);
  }

  // Check Reportes has content
  const repPage = PAGES["Reportes"];
  if (repPage?.gridUid) {
    const schema = await apiSafe("GET", `uiSchemas:getJsonSchema/${repPage.gridUid}`);
    const propCount = Object.keys(schema?.data?.properties || {}).length;
    console.log(`  Reportes blocks: ${propCount}`);
  }

  // Check Ficha 360°
  const fichaPage = PAGES["🗂️ Ficha 360° Paciente"] || PAGES["Ficha 360° Paciente"];
  if (fichaPage?.gridUid) {
    const schema = await apiSafe("GET", `uiSchemas:getJsonSchema/${fichaPage.gridUid}`);
    const propCount = Object.keys(schema?.data?.properties || {}).length;
    console.log(`  Ficha 360° blocks: ${propCount}`);
  }

  // Check FK columns (sample)
  let fkRemaining = 0;
  for (const [title, page] of Object.entries(PAGES)) {
    if (!page.gridUid) continue;
    const schema = await apiSafe("GET", `uiSchemas:getJsonSchema/${page.gridUid}`);
    function countFKs(node: any) {
      if (!node || typeof node !== "object") return;
      if (node["x-collection-field"]?.endsWith("_id") && FK_TO_ASSOC[node["x-collection-field"]]) fkRemaining++;
      if (node.properties) for (const k of Object.keys(node.properties)) countFKs(node.properties[k]);
    }
    countFKs(schema?.data);
  }
  console.log(`  Remaining FK _id columns: ${fkRemaining}`);
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║  fix-ugco-v2 — Complete UGCO fix for imedicina.cl     ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log(`\nTarget: ${BASE}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  const t0 = Date.now();

  await phase0_discover();
  await phase1_seed();
  await phase2_fixFKColumns();
  await phase3_dashboardCharts();
  await phase4_reportes();
  await phase5_ficha360();
  await phase6_specialtyFilters();
  await phase7_dashboardColumns();
  await phase8_verify();

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n${"═".repeat(55)}`);
  console.log(`✅ OK: ${okCount} | ❌ Err: ${errCount} | ⏱️  ${elapsed}s`);
  console.log(`URL: https://mira.imedicina.cl/admin/`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
