/**
 * Phase 2 — Create 11 UGCO operational collections + fields
 * UGCO rebuild from scratch
 *
 * Usage: npx tsx Apps/UGCO/scripts/nocobase/phase2-ugco-collections.ts
 */

import "dotenv/config";

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;
if (!BASE || !KEY) { console.error("Missing env vars"); process.exit(1); }

let okCount = 0, errCount = 0, skipCount = 0;

async function api(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    if (text.includes("already exists") || text.includes("duplicate")) { skipCount++; return null; }
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  okCount++;
  return text ? JSON.parse(text) : {};
}

// ─── Field helpers ───
type FT = "string" | "text" | "integer" | "boolean" | "date" | "dateOnly" | "select";
interface FS {
  name: string; type: FT; title: string;
  required?: boolean; unique?: boolean; defaultValue?: any;
  enum?: { value: string; label: string; color?: string }[];
}

function bf(f: FS): object {
  const isSelect = f.type === "select" || !!f.enum;
  const realType = isSelect ? "string" : (f.type === "dateOnly" ? "dateOnly" : f.type);
  const iface = isSelect ? "select" : ({
    string: "input", text: "textarea", integer: "integer",
    boolean: "checkbox", date: "datetime", dateOnly: "date",
  } as Record<string, string>)[f.type] || "input";
  const comp = isSelect ? "Select" : ({
    string: "Input", text: "Input.TextArea", integer: "InputNumber",
    boolean: "Checkbox", date: "DatePicker", dateOnly: "DatePicker",
  } as Record<string, string>)[f.type] || "Input";
  const uiType = f.type === "boolean" ? "boolean" : f.type === "integer" ? "number" : "string";

  const base: any = {
    name: f.name, type: realType, interface: iface,
    uiSchema: { title: f.title, type: uiType, "x-component": comp },
  };
  if (f.required) base.required = true;
  if (f.unique) base.unique = true;
  if (f.defaultValue !== undefined) base.defaultValue = f.defaultValue;
  if (f.enum) base.uiSchema.enum = f.enum;
  return base;
}

// ─── Audit fields (shared) ───
const auditFields: FS[] = [
  { name: "creado_por", type: "string", title: "Creado por" },
  { name: "modificado_por", type: "string", title: "Modificado por" },
];

// ─── UGCO Code fields ───
const codeFields: FS[] = [
  { name: "UGCO_COD01", type: "string", title: "Código UGCO", unique: true },
  { name: "UGCO_COD02", type: "string", title: "Código Externo 1" },
  { name: "UGCO_COD03", type: "string", title: "Código Externo 2" },
  { name: "UGCO_COD04", type: "string", title: "Código Reservado" },
];

// ═══════════════════════════════════════════════════════════
// COLLECTION DEFINITIONS (in dependency order)
// ═══════════════════════════════════════════════════════════

interface ColDef { name: string; title: string; fields: FS[]; }

const COLLECTIONS: ColDef[] = [
  // ── 1. UGCO_CasoOncologico ──
  {
    name: "ugco_casooncologico",
    title: "Caso Oncológico",
    fields: [
      ...codeFields,
      // Patient/Episode links (integer FKs, relationships added in Phase 4)
      { name: "paciente_id", type: "integer", title: "Paciente ID" },
      { name: "episodio_alma_id", type: "integer", title: "Episodio ALMA ID" },
      { name: "diag_alma_id", type: "integer", title: "Diagnóstico ALMA ID" },
      // Diagnosis
      { name: "codigo_cie10", type: "string", title: "Código CIE-10", required: true },
      { name: "cie10_glosa", type: "string", title: "Glosa CIE-10" },
      { name: "diagnostico_principal", type: "string", title: "Diagnóstico Principal" },
      { name: "topografia_icdo", type: "string", title: "Topografía ICD-O" },
      { name: "morfologia_icdo", type: "string", title: "Morfología ICD-O" },
      { name: "comportamiento", type: "string", title: "Comportamiento" },
      // Diagnosis date/base
      { name: "fecha_diagnostico", type: "dateOnly", title: "Fecha Diagnóstico", required: true },
      { name: "base_diagnostico", type: "string", title: "Base Diagnóstico" },
      // Staging
      { name: "tipo_etapificacion", type: "string", title: "Tipo Etapificación" },
      { name: "tnm_t", type: "string", title: "TNM T" },
      { name: "tnm_n", type: "string", title: "TNM N" },
      { name: "tnm_m", type: "string", title: "TNM M" },
      { name: "estadio_clinico", type: "string", title: "Estadío Clínico" },
      { name: "figo", type: "string", title: "FIGO" },
      { name: "grado_diferenciacion", type: "string", title: "Grado Diferenciación" },
      { name: "ecog_inicial", type: "integer", title: "ECOG Inicial" },
      // States (integer FKs to REF tables, relationships in Phase 4)
      { name: "estado_clinico_id", type: "integer", title: "Estado Clínico ID", required: true },
      { name: "estado_adm_id", type: "integer", title: "Estado Administrativo ID", required: true },
      { name: "intencion_trat_id", type: "integer", title: "Intención Tratamiento ID" },
      { name: "estado_seguimiento_id", type: "integer", title: "Estado Seguimiento ID", required: true },
      // FHIR
      { name: "clinical_status", type: "string", title: "Clinical Status (FHIR)" },
      { name: "verification_status", type: "string", title: "Verification Status (FHIR)" },
      { name: "severity", type: "string", title: "Severity (FHIR)" },
      // Outcome
      { name: "fallecido", type: "boolean", title: "Fallecido", defaultValue: false },
      { name: "fecha_defuncion", type: "dateOnly", title: "Fecha Defunción" },
      { name: "causa_defuncion", type: "text", title: "Causa Defunción" },
      // Tracking dates
      { name: "fecha_caso", type: "dateOnly", title: "Fecha Caso" },
      { name: "fecha_inicio_seguimiento", type: "dateOnly", title: "Fecha Inicio Seguimiento" },
      { name: "fecha_ultimo_contacto", type: "dateOnly", title: "Fecha Último Contacto" },
      ...auditFields,
    ],
  },
  // ── 2. UGCO_EventoClinico ──
  {
    name: "ugco_eventoclinico",
    title: "Evento Clínico",
    fields: [
      ...codeFields,
      { name: "paciente_id", type: "integer", title: "Paciente ID", required: true },
      { name: "caso_id", type: "integer", title: "Caso ID" },
      { name: "episodio_alma_id", type: "integer", title: "Episodio ALMA ID" },
      {
        name: "tipo_evento", type: "select", title: "Tipo Evento", required: true,
        enum: [
          { value: "EXAMEN", label: "Examen", color: "blue" },
          { value: "CIRUGIA", label: "Cirugía", color: "red" },
          { value: "QT", label: "Quimioterapia", color: "purple" },
          { value: "RT", label: "Radioterapia", color: "orange" },
          { value: "OTRO", label: "Otro", color: "default" },
        ],
      },
      { name: "subtipo_evento", type: "string", title: "Subtipo Evento" },
      { name: "fecha_solicitud", type: "date", title: "Fecha Solicitud" },
      { name: "fecha_realizacion", type: "date", title: "Fecha Realización" },
      { name: "resultado_resumen", type: "text", title: "Resultado Resumen" },
      { name: "centro_realizacion", type: "string", title: "Centro Realización" },
      {
        name: "origen_dato", type: "select", title: "Origen Dato", required: true,
        enum: [
          { value: "ALMA", label: "ALMA", color: "green" },
          { value: "EXTERNO", label: "Externo", color: "orange" },
          { value: "MANUAL", label: "Manual", color: "blue" },
        ],
      },
      { name: "sistema_origen", type: "string", title: "Sistema Origen" },
      { name: "descripcion_origen", type: "string", title: "Descripción Origen" },
      ...auditFields,
    ],
  },
  // ── 3. UGCO_CasoEspecialidad ──
  {
    name: "ugco_casoespecialidad",
    title: "Caso-Especialidad",
    fields: [
      { name: "caso_id", type: "integer", title: "Caso ID", required: true },
      { name: "especialidad_id", type: "integer", title: "Especialidad ID", required: true },
      { name: "equipo_id", type: "integer", title: "Equipo ID" },
      { name: "es_principal", type: "boolean", title: "Es Principal", defaultValue: false },
      { name: "comentario", type: "text", title: "Comentario" },
      ...auditFields,
    ],
  },
  // ── 4. UGCO_Tarea ──
  {
    name: "ugco_tarea",
    title: "Tarea",
    fields: [
      ...codeFields,
      { name: "paciente_id", type: "integer", title: "Paciente ID" },
      { name: "caso_id", type: "integer", title: "Caso ID" },
      { name: "evento_id", type: "integer", title: "Evento ID" },
      { name: "es_interna", type: "boolean", title: "Es Tarea Interna", required: true, defaultValue: false },
      { name: "tipo_tarea_id", type: "integer", title: "Tipo Tarea ID", required: true },
      { name: "estado_tarea_id", type: "integer", title: "Estado Tarea ID", required: true },
      { name: "titulo", type: "string", title: "Título", required: true },
      { name: "descripcion", type: "text", title: "Descripción" },
      { name: "fecha_vencimiento", type: "date", title: "Fecha Vencimiento" },
      { name: "fecha_inicio", type: "date", title: "Fecha Inicio" },
      { name: "fecha_cierre", type: "date", title: "Fecha Cierre" },
      { name: "responsable_usuario", type: "string", title: "Responsable" },
      { name: "equipo_id", type: "integer", title: "Equipo ID" },
      { name: "comentarios", type: "text", title: "Comentarios" },
      ...auditFields,
    ],
  },
  // ── 5. UGCO_DocumentoCaso ──
  {
    name: "ugco_documentocaso",
    title: "Documento de Caso",
    fields: [
      { name: "caso_id", type: "integer", title: "Caso ID", required: true },
      { name: "evento_id", type: "integer", title: "Evento ID" },
      { name: "tipo_documento_id", type: "integer", title: "Tipo Documento ID" },
      { name: "nombre_archivo", type: "string", title: "Nombre Archivo", required: true },
      { name: "ruta_almacenamiento", type: "string", title: "Ruta Almacenamiento", required: true },
      { name: "seccion_origen", type: "string", title: "Sección Origen" },
      { name: "fecha_carga", type: "date", title: "Fecha Carga" },
      { name: "observaciones", type: "text", title: "Observaciones" },
      { name: "cargado_por", type: "string", title: "Cargado Por" },
      { name: "es_visible", type: "boolean", title: "Es Visible", required: true, defaultValue: true },
    ],
  },
  // ── 6. UGCO_ContactoPaciente ──
  {
    name: "ugco_contactopaciente",
    title: "Contacto Paciente",
    fields: [
      { name: "paciente_id", type: "integer", title: "Paciente ID", required: true },
      { name: "caso_id", type: "integer", title: "Caso ID" },
      { name: "region_residencia", type: "string", title: "Región" },
      { name: "provincia_residencia", type: "string", title: "Provincia" },
      { name: "comuna_residencia", type: "string", title: "Comuna" },
      { name: "tipo_calle", type: "string", title: "Tipo Calle" },
      { name: "nombre_calle", type: "string", title: "Nombre Calle" },
      { name: "numero_direccion", type: "string", title: "Número" },
      { name: "complemento_dir", type: "string", title: "Complemento Dirección" },
      { name: "telefono_1", type: "string", title: "Teléfono 1" },
      { name: "telefono_2", type: "string", title: "Teléfono 2" },
      { name: "email", type: "string", title: "Email" },
      {
        name: "fuente_dato", type: "select", title: "Fuente Dato",
        enum: [
          { value: "ALMA", label: "ALMA", color: "green" },
          { value: "SIGO", label: "SIGO", color: "blue" },
          { value: "MANUAL", label: "Manual", color: "default" },
        ],
      },
      { name: "observaciones", type: "text", title: "Observaciones" },
      ...auditFields,
    ],
  },
  // ── 7. UGCO_PersonaSignificativa ──
  {
    name: "ugco_personasignificativa",
    title: "Persona Significativa",
    fields: [
      { name: "paciente_id", type: "integer", title: "Paciente ID", required: true },
      { name: "caso_id", type: "integer", title: "Caso ID" },
      { name: "nombre_completo", type: "string", title: "Nombre Completo", required: true },
      { name: "parentesco", type: "string", title: "Parentesco" },
      { name: "telefono_1", type: "string", title: "Teléfono 1" },
      { name: "telefono_2", type: "string", title: "Teléfono 2" },
      { name: "email", type: "string", title: "Email" },
      { name: "vive_con_paciente", type: "boolean", title: "Vive con Paciente" },
      { name: "es_cuidador_principal", type: "boolean", title: "Es Cuidador Principal" },
      { name: "fuente_dato", type: "string", title: "Fuente Dato" },
      { name: "observaciones", type: "text", title: "Observaciones" },
      ...auditFields,
    ],
  },
  // ── 8. UGCO_EquipoSeguimiento ──
  {
    name: "ugco_equiposeguimiento",
    title: "Equipo de Seguimiento",
    fields: [
      { name: "nombre", type: "string", title: "Nombre", required: true },
      { name: "descripcion", type: "text", title: "Descripción" },
      { name: "especialidad_id", type: "integer", title: "Especialidad ID" },
      { name: "activo", type: "boolean", title: "Activo", required: true, defaultValue: true },
    ],
  },
  // ── 9. UGCO_EquipoMiembro ──
  {
    name: "ugco_equipomiembro",
    title: "Miembro de Equipo",
    fields: [
      { name: "equipo_id", type: "integer", title: "Equipo ID", required: true },
      { name: "usuario_id", type: "integer", title: "Usuario ID", required: true },
      { name: "rol_miembro", type: "string", title: "Rol Miembro" },
      { name: "fecha_inicio", type: "dateOnly", title: "Fecha Inicio" },
      { name: "fecha_fin", type: "dateOnly", title: "Fecha Fin" },
      { name: "activo", type: "boolean", title: "Activo", required: true, defaultValue: true },
      ...auditFields,
    ],
  },
  // ── 10. UGCO_ComiteOncologico ──
  {
    name: "ugco_comiteoncologico",
    title: "Comité Oncológico",
    fields: [
      ...codeFields,
      { name: "fecha_comite", type: "date", title: "Fecha Comité", required: true },
      { name: "nombre", type: "string", title: "Nombre" },
      { name: "tipo_comite", type: "string", title: "Tipo Comité" },
      { name: "especialidad_id", type: "integer", title: "Especialidad ID" },
      { name: "lugar", type: "string", title: "Lugar" },
      { name: "observaciones", type: "text", title: "Observaciones" },
      ...auditFields,
    ],
  },
  // ── 11. UGCO_ComiteCaso ──
  {
    name: "ugco_comitecaso",
    title: "Caso en Comité",
    fields: [
      { name: "comite_id", type: "integer", title: "Comité ID", required: true },
      { name: "caso_id", type: "integer", title: "Caso ID", required: true },
      { name: "paciente_id", type: "integer", title: "Paciente ID" },
      { name: "es_caso_principal", type: "boolean", title: "Es Caso Principal", defaultValue: false },
      { name: "decision_resumen", type: "text", title: "Decisión Resumen" },
      { name: "plan_tratamiento", type: "text", title: "Plan Tratamiento" },
      { name: "otros_acuerdos", type: "text", title: "Otros Acuerdos" },
      { name: "responsable_seguimiento", type: "string", title: "Responsable Seguimiento" },
      { name: "requiere_tareas", type: "boolean", title: "Requiere Tareas", defaultValue: false },
      ...auditFields,
    ],
  },
];

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║  Phase 2 — UGCO Operational Collections       ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  for (const col of COLLECTIONS) {
    console.log(`\n── ${col.title} (${col.name}) ──`);

    // 1. Create collection
    try {
      await api("POST", "collections:create", {
        name: col.name,
        title: col.title,
        fields: [],
        autoGenId: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        sortable: true,
      });
      console.log(`  ✅ Collection created`);
    } catch (e: any) {
      if (e.message.includes("already exists") || e.message.includes("duplicate")) {
        console.log(`  ℹ️  Already exists`);
        skipCount++;
      } else {
        console.error(`  ❌ ${e.message}`);
        errCount++;
        continue;
      }
    }

    // 2. Create fields
    for (const fspec of col.fields) {
      try {
        await api("POST", `collections/${col.name}/fields:create`, bf(fspec));
      } catch (e: any) {
        if (e.message?.includes("already exists") || e.message?.includes("duplicate")) {
          // skip
        } else {
          console.error(`  ❌ Field ${fspec.name}: ${e.message}`);
          errCount++;
        }
      }
    }
    console.log(`  ✅ ${col.fields.length} fields processed`);
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`✅ OK: ${okCount} | ⏭️  Skip: ${skipCount} | ❌ Err: ${errCount}`);
  console.log(`Total collections: ${COLLECTIONS.length}`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
