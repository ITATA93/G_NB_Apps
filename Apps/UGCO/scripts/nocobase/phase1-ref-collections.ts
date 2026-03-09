/**
 * Phase 1 — Create 20 REF catalog collections + fields + seed data
 * UGCO rebuild from scratch
 *
 * Usage: npx tsx Apps/UGCO/scripts/nocobase/phase1-ref-collections.ts
 */

import "dotenv/config";

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;
if (!BASE || !KEY) { console.error("Missing NOCOBASE_BASE_URL or NOCOBASE_API_KEY"); process.exit(1); }

let okCount = 0, errCount = 0, skipCount = 0;

async function api(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    if (text.includes("already exists") || text.includes("duplicate")) {
      skipCount++;
      return null;
    }
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  okCount++;
  return text ? JSON.parse(text) : {};
}

// ─── Field builder helpers ───
type FType = "string" | "text" | "integer" | "boolean" | "date" | "dateOnly";
interface FSpec {
  name: string; type: FType; title: string;
  required?: boolean; unique?: boolean; defaultValue?: any;
  enum?: { value: string; label: string; color?: string }[];
}

function buildField(f: FSpec): object {
  const base: any = {
    name: f.name,
    type: f.type === "dateOnly" ? "dateOnly" : f.type,
    interface: ({
      string: f.enum ? "select" : "input",
      text: "textarea",
      integer: "integer",
      boolean: "checkbox",
      date: "datetime",
      dateOnly: "date",
    } as Record<string, string>)[f.type] || "input",
    uiSchema: {
      title: f.title,
      type: f.type === "boolean" ? "boolean" : f.type === "integer" ? "number" : "string",
      "x-component": ({
        string: f.enum ? "Select" : "Input",
        text: "Input.TextArea",
        integer: "InputNumber",
        boolean: "Checkbox",
        date: "DatePicker",
        dateOnly: "DatePicker",
      } as Record<string, string>)[f.type] || "Input",
    },
  };
  if (f.required) base.required = true;
  if (f.unique) base.unique = true;
  if (f.defaultValue !== undefined) base.defaultValue = f.defaultValue;
  if (f.enum) base.uiSchema.enum = f.enum;
  return base;
}

// ─── 6-Code schema fields (shared across coding tables) ───
function codingFields(hasDescripcion = true): FSpec[] {
  return [
    { name: "codigo_alma", type: "string", title: "Código ALMA" },
    { name: "codigo_oficial", type: "string", title: "Código Oficial", required: true, unique: true },
    { name: "codigo_map_snomed", type: "string", title: "SNOMED CT" },
    { name: "codigo_map_deis", type: "string", title: "DEIS" },
    { name: "codigo_map_legacy", type: "string", title: "Legacy" },
    ...(hasDescripcion ? [{ name: "descripcion", type: "text" as FType, title: "Descripción" }] : []),
  ];
}

// ─── Standard catalog fields ───
function catalogFields(extras: FSpec[] = []): FSpec[] {
  return [
    { name: "codigo", type: "string", title: "Código", required: true, unique: true },
    { name: "nombre", type: "string", title: "Nombre", required: true },
    { name: "descripcion", type: "text", title: "Descripción" },
    { name: "orden", type: "integer", title: "Orden" },
    ...extras,
    { name: "activo", type: "boolean", title: "Activo", defaultValue: true },
  ];
}

// ═══════════════════════════════════════════════════════════
// COLLECTION DEFINITIONS
// ═══════════════════════════════════════════════════════════

interface ColDef {
  name: string;
  title: string;
  fields: FSpec[];
}

const COLLECTIONS: ColDef[] = [
  // ── 1. REF_OncoEspecialidad ──
  {
    name: "ref_oncoespecialidad",
    title: "Especialidades Oncológicas",
    fields: [
      ...codingFields(false),
      { name: "nombre", type: "string", title: "Nombre", required: true },
      { name: "activo", type: "boolean", title: "Activo", defaultValue: true },
    ],
  },
  // ── 2. REF_OncoEstadoCaso ──
  {
    name: "ref_oncoestadocaso",
    title: "Estados de Caso",
    fields: catalogFields([
      { name: "es_final", type: "boolean", title: "Es Estado Final" },
    ]),
  },
  // ── 3. REF_OncoEstadoClinico ──
  {
    name: "ref_oncoestadoclinico",
    title: "Estados Clínicos",
    fields: catalogFields([
      { name: "es_maligno", type: "boolean", title: "Es Maligno" },
    ]),
  },
  // ── 4. REF_OncoEstadoAdm ──
  {
    name: "ref_oncoestadoadm",
    title: "Estados Administrativos",
    fields: catalogFields([
      { name: "es_final", type: "boolean", title: "Es Estado Final" },
    ]),
  },
  // ── 5. REF_OncoIntencionTrat ──
  {
    name: "ref_oncointenciontrat",
    title: "Intención Tratamiento",
    fields: catalogFields([
      { name: "es_curativo", type: "boolean", title: "Es Curativo" },
      { name: "es_paliativo", type: "boolean", title: "Es Paliativo" },
    ]),
  },
  // ── 6. REF_OncoTipoActividad ──
  {
    name: "ref_oncotipoactividad",
    title: "Tipos de Actividad",
    fields: catalogFields([
      { name: "es_clinica", type: "boolean", title: "Es Clínica" },
    ]),
  },
  // ── 7. REF_OncoEstadoActividad ──
  {
    name: "ref_oncoestadoactividad",
    title: "Estados de Actividad",
    fields: catalogFields([
      { name: "es_final", type: "boolean", title: "Es Estado Final" },
    ]),
  },
  // ── 8. REF_CIE10 ──
  {
    name: "ref_cie10",
    title: "CIE-10",
    fields: [
      ...codingFields(true),
      { name: "capitulo", type: "string", title: "Capítulo" },
      { name: "grupo", type: "string", title: "Grupo" },
      { name: "categoria", type: "string", title: "Categoría" },
      { name: "sistema_cod", type: "string", title: "Sistema Codificación" },
      { name: "version", type: "string", title: "Versión" },
      { name: "activo", type: "boolean", title: "Activo", defaultValue: true },
    ],
  },
  // ── 9. REF_OncoDiagnostico ──
  {
    name: "ref_oncodiagnostico",
    title: "Diagnósticos Oncológicos",
    fields: [
      { name: "codigo_cie10", type: "string", title: "Código CIE-10", required: true },
      { name: "nombre_dx", type: "string", title: "Nombre Diagnóstico", required: true },
      { name: "grupo_tumor", type: "string", title: "Grupo Tumoral" },
      { name: "es_maligno", type: "boolean", title: "Es Maligno" },
      { name: "es_in_situ", type: "boolean", title: "Es In Situ" },
      { name: "es_hematologico", type: "boolean", title: "Es Hematológico" },
      { name: "activo", type: "boolean", title: "Activo", defaultValue: true },
    ],
  },
  // ── 10. REF_OncoMorfologiaICDO ──
  {
    name: "ref_oncomorfologiaicdo",
    title: "Morfología ICD-O",
    fields: [
      ...codingFields(true),
      { name: "comportamiento", type: "string", title: "Comportamiento", required: true },
      { name: "es_maligno", type: "boolean", title: "Es Maligno" },
      { name: "sistema_cod", type: "string", title: "Sistema Codificación" },
      { name: "activo", type: "boolean", title: "Activo", defaultValue: true },
    ],
  },
  // ── 11. REF_OncoTopografiaICDO ──
  {
    name: "ref_oncotopografiaicdo",
    title: "Topografía ICD-O",
    fields: [
      ...codingFields(true),
      { name: "sitio_anatomico", type: "string", title: "Sitio Anatómico" },
      { name: "grupo_tumor", type: "string", title: "Grupo Tumoral" },
      { name: "sistema_cod", type: "string", title: "Sistema Codificación" },
      { name: "version", type: "string", title: "Versión" },
      { name: "activo", type: "boolean", title: "Activo", defaultValue: true },
    ],
  },
  // ── 12. REF_OncoEstadioClinico ──
  {
    name: "ref_oncoestadio",
    title: "Estadíos Clínicos",
    fields: [
      { name: "sistema", type: "string", title: "Sistema (TNM/FIGO/etc)", required: true },
      { name: "codigo", type: "string", title: "Código", required: true },
      { name: "nombre", type: "string", title: "Nombre", required: true },
      { name: "descripcion", type: "text", title: "Descripción" },
      { name: "localizacion", type: "string", title: "Localización" },
      { name: "orden", type: "integer", title: "Orden" },
      { name: "activo", type: "boolean", title: "Activo", defaultValue: true },
    ],
  },
  // ── 13. REF_OncoTNM_T ──
  {
    name: "ref_oncotnm_t",
    title: "TNM - Componente T",
    fields: [
      { name: "codigo", type: "string", title: "Código", required: true },
      { name: "descripcion", type: "text", title: "Descripción", required: true },
      { name: "localizacion", type: "string", title: "Localización" },
      { name: "orden", type: "integer", title: "Orden" },
      { name: "activo", type: "boolean", title: "Activo", defaultValue: true },
    ],
  },
  // ── 14. REF_OncoTNM_M ──
  {
    name: "ref_oncotnm_m",
    title: "TNM - Componente M",
    fields: [
      { name: "codigo", type: "string", title: "Código", required: true },
      { name: "descripcion", type: "text", title: "Descripción", required: true },
      { name: "localizacion", type: "string", title: "Localización" },
      { name: "orden", type: "integer", title: "Orden" },
      { name: "activo", type: "boolean", title: "Activo", defaultValue: true },
    ],
  },
  // ── 15. REF_OncoFIGO ──
  {
    name: "ref_oncofigo",
    title: "Estadificación FIGO",
    fields: [
      { name: "localizacion", type: "string", title: "Localización", required: true },
      { name: "codigo", type: "string", title: "Código", required: true },
      { name: "nombre", type: "string", title: "Nombre", required: true },
      { name: "descripcion", type: "text", title: "Descripción" },
      { name: "orden", type: "integer", title: "Orden" },
      { name: "activo", type: "boolean", title: "Activo", defaultValue: true },
    ],
  },
  // ── 16. REF_OncoGradoHistologico ──
  {
    name: "ref_oncogradohistologico",
    title: "Grado Histológico",
    fields: catalogFields([]),
  },
  // ── 17. REF_OncoTipoEtapificacion ──
  {
    name: "ref_oncoetapificacion",
    title: "Tipo Etapificación",
    fields: catalogFields([]),
  },
  // ── 18. REF_OncoBaseDiagnostico ──
  {
    name: "ref_oncobasediagnostico",
    title: "Base Diagnóstico",
    fields: catalogFields([
      { name: "es_histologico", type: "boolean", title: "Es Histológico" },
    ]),
  },
  // ── 19. REF_OncoECOG ──
  {
    name: "ref_oncoecog",
    title: "Escala ECOG",
    fields: [
      { name: "valor", type: "integer", title: "Valor ECOG", required: true, unique: true },
      { name: "codigo", type: "string", title: "Código" },
      { name: "nombre", type: "string", title: "Nombre" },
      { name: "descripcion", type: "text", title: "Descripción", required: true },
      { name: "orden", type: "integer", title: "Orden" },
      { name: "activo", type: "boolean", title: "Activo", defaultValue: true },
    ],
  },
  // ── 20. REF_OncoTipoDocumento ──
  {
    name: "ref_oncotipodocumento",
    title: "Tipos de Documento",
    fields: catalogFields([]),
  },
];

// ═══════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════

const SEED: Record<string, object[]> = {
  ref_oncoespecialidad: [
    { codigo_oficial: "DIG_ALTO", nombre: "Digestivo Alto", activo: true },
    { codigo_oficial: "DIG_BAJO", nombre: "Digestivo Bajo", activo: true },
    { codigo_oficial: "MAMA", nombre: "Mama", activo: true },
    { codigo_oficial: "GINECO", nombre: "Ginecología", activo: true },
    { codigo_oficial: "UROLO", nombre: "Urología", activo: true },
    { codigo_oficial: "TORAX", nombre: "Tórax", activo: true },
    { codigo_oficial: "PIEL", nombre: "Piel y Partes Blandas", activo: true },
    { codigo_oficial: "ENDOCR", nombre: "Endocrinología", activo: true },
    { codigo_oficial: "HEMATO", nombre: "Hematología", activo: true },
  ],
  ref_oncoestadocaso: [
    { codigo: "ACTIVO", nombre: "Activo", descripcion: "Caso oncológico activo", orden: 1, activo: true },
    { codigo: "SEGUIMIENTO", nombre: "Seguimiento", descripcion: "Paciente en seguimiento", orden: 2, activo: true },
    { codigo: "CERRADO", nombre: "Cerrado", descripcion: "Caso cerrado", orden: 3, activo: true, es_final: true },
    { codigo: "PERDIDO", nombre: "Perdido", descripcion: "Paciente perdido de seguimiento", orden: 4, activo: true, es_final: true },
    { codigo: "FALLECIDO", nombre: "Fallecido", descripcion: "Paciente fallecido", orden: 5, activo: true, es_final: true },
    { codigo: "DERIVADO", nombre: "Derivado", descripcion: "Paciente derivado a otro centro", orden: 6, activo: true, es_final: true },
  ],
  ref_oncoestadoclinico: [
    { codigo: "SOSPECHA", nombre: "Sospecha", descripcion: "Sospecha diagnóstica de cáncer", orden: 1, activo: true },
    { codigo: "CONFIRMADO", nombre: "Confirmado", descripcion: "Diagnóstico confirmado de cáncer", orden: 2, activo: true, es_maligno: true },
    { codigo: "NO_CANCER", nombre: "No cáncer", descripcion: "Estudio descarta cáncer", orden: 3, activo: true },
    { codigo: "RECAIDA", nombre: "Recaída", descripcion: "Recurrencia o recaída del cáncer", orden: 4, activo: true, es_maligno: true },
  ],
  ref_oncoestadoadm: [
    { codigo: "PROCESO_DIAGNOSTICO", nombre: "Proceso diagnóstico", descripcion: "Paciente en proceso de estudio y diagnóstico", orden: 1, activo: true },
    { codigo: "ETAPIFICACION", nombre: "Etapificación", descripcion: "Paciente en etapa de etapificación oncológica", orden: 2, activo: true },
    { codigo: "TRATAMIENTO", nombre: "Tratamiento", descripcion: "Paciente en tratamiento activo", orden: 3, activo: true },
    { codigo: "SEGUIMIENTO", nombre: "Seguimiento", descripcion: "Paciente en seguimiento post-tratamiento", orden: 4, activo: true },
    { codigo: "CERRADO", nombre: "Cerrado", descripcion: "Caso cerrado administrativamente", orden: 5, activo: true, es_final: true },
  ],
  ref_oncointenciontrat: [
    { codigo: "CURATIVO", nombre: "Curativo", descripcion: "Tratamiento con intención curativa", orden: 1, activo: true, es_curativo: true },
    { codigo: "PALIATIVO", nombre: "Paliativo", descripcion: "Tratamiento con intención paliativa", orden: 2, activo: true, es_paliativo: true },
    { codigo: "DIAGNOSTICO", nombre: "Diagnóstico", descripcion: "Procedimiento con intención diagnóstica", orden: 3, activo: true },
    { codigo: "PROFILACTICO", nombre: "Profiláctico", descripcion: "Tratamiento profiláctico", orden: 4, activo: true },
  ],
  ref_oncotipoactividad: [
    { codigo: "EXAMEN", nombre: "Examen", descripcion: "Examen o procedimiento diagnóstico", orden: 1, activo: true, es_clinica: true },
    { codigo: "INTERCONSULTA", nombre: "Interconsulta", descripcion: "Interconsulta a especialidad", orden: 2, activo: true, es_clinica: true },
    { codigo: "CONTROL", nombre: "Control", descripcion: "Control médico programado", orden: 3, activo: true, es_clinica: true },
    { codigo: "GESTION_INTERNA", nombre: "Gestión interna", descripcion: "Gestión administrativa interna", orden: 4, activo: true, es_clinica: false },
    { codigo: "COMITE", nombre: "Comité", descripcion: "Presentación en comité oncológico", orden: 5, activo: true, es_clinica: true },
    { codigo: "CIRUGIA", nombre: "Cirugía", descripcion: "Intervención quirúrgica", orden: 6, activo: true, es_clinica: true },
    { codigo: "QT", nombre: "Quimioterapia", descripcion: "Sesión de quimioterapia", orden: 7, activo: true, es_clinica: true },
    { codigo: "RT", nombre: "Radioterapia", descripcion: "Sesión de radioterapia", orden: 8, activo: true, es_clinica: true },
  ],
  ref_oncoestadoactividad: [
    { codigo: "PENDIENTE", nombre: "Pendiente", descripcion: "Actividad pendiente de realización", orden: 1, activo: true },
    { codigo: "EN_PROGRESO", nombre: "En progreso", descripcion: "Actividad en curso", orden: 2, activo: true },
    { codigo: "COMPLETADA", nombre: "Completada", descripcion: "Actividad completada", orden: 3, activo: true, es_final: true },
    { codigo: "VENCIDA", nombre: "Vencida", descripcion: "Actividad vencida sin completar", orden: 4, activo: true, es_final: true },
    { codigo: "CANCELADA", nombre: "Cancelada", descripcion: "Actividad cancelada", orden: 5, activo: true, es_final: true },
  ],
  ref_cie10: [
    { codigo_oficial: "C50.9", descripcion: "Tumor maligno de la mama, parte no especificada", capitulo: "II", grupo: "C50", categoria: "C50.9", activo: true },
    { codigo_oficial: "C18.9", descripcion: "Tumor maligno del colon, parte no especificada", capitulo: "II", grupo: "C18", categoria: "C18.9", activo: true },
    { codigo_oficial: "C20", descripcion: "Tumor maligno del recto", capitulo: "II", grupo: "C20", categoria: "C20", activo: true },
    { codigo_oficial: "C34.9", descripcion: "Tumor maligno bronquios o pulmón, no especificado", capitulo: "II", grupo: "C34", categoria: "C34.9", activo: true },
    { codigo_oficial: "C53.9", descripcion: "Tumor maligno del cuello del útero, sin especificar", capitulo: "II", grupo: "C53", categoria: "C53.9", activo: true },
    { codigo_oficial: "C54.1", descripcion: "Tumor maligno del endometrio", capitulo: "II", grupo: "C54", categoria: "C54.1", activo: true },
    { codigo_oficial: "C56", descripcion: "Tumor maligno del ovario", capitulo: "II", grupo: "C56", categoria: "C56", activo: true },
    { codigo_oficial: "C16.9", descripcion: "Tumor maligno del estómago, parte no especificada", capitulo: "II", grupo: "C16", categoria: "C16.9", activo: true },
    { codigo_oficial: "C22.0", descripcion: "Carcinoma hepatocelular", capitulo: "II", grupo: "C22", categoria: "C22.0", activo: true },
    { codigo_oficial: "C25.9", descripcion: "Tumor maligno del páncreas, parte no especificada", capitulo: "II", grupo: "C25", categoria: "C25.9", activo: true },
    { codigo_oficial: "C61", descripcion: "Tumor maligno de la próstata", capitulo: "II", grupo: "C61", categoria: "C61", activo: true },
    { codigo_oficial: "C64", descripcion: "Tumor maligno del riñón, excepto pelvis renal", capitulo: "II", grupo: "C64", categoria: "C64", activo: true },
    { codigo_oficial: "C67.9", descripcion: "Tumor maligno de la vejiga urinaria, no especificado", capitulo: "II", grupo: "C67", categoria: "C67.9", activo: true },
    { codigo_oficial: "C43.9", descripcion: "Melanoma maligno de piel, sitio no especificado", capitulo: "II", grupo: "C43", categoria: "C43.9", activo: true },
    { codigo_oficial: "C73", descripcion: "Tumor maligno de la glándula tiroides", capitulo: "II", grupo: "C73", categoria: "C73", activo: true },
    { codigo_oficial: "C81.9", descripcion: "Linfoma de Hodgkin, no especificado", capitulo: "II", grupo: "C81", categoria: "C81.9", activo: true },
    { codigo_oficial: "C83.3", descripcion: "Linfoma no Hodgkin difuso de células grandes", capitulo: "II", grupo: "C83", categoria: "C83.3", activo: true },
    { codigo_oficial: "C92.0", descripcion: "Leucemia mieloide aguda", capitulo: "II", grupo: "C92", categoria: "C92.0", activo: true },
    { codigo_oficial: "C90.0", descripcion: "Mieloma múltiple", capitulo: "II", grupo: "C90", categoria: "C90.0", activo: true },
    { codigo_oficial: "C32.9", descripcion: "Tumor maligno de la laringe, no especificado", capitulo: "II", grupo: "C32", categoria: "C32.9", activo: true },
    { codigo_oficial: "C71.9", descripcion: "Tumor maligno del encéfalo, no especificado", capitulo: "II", grupo: "C71", categoria: "C71.9", activo: true },
    { codigo_oficial: "C15.9", descripcion: "Tumor maligno del esófago, parte no especificada", capitulo: "II", grupo: "C15", categoria: "C15.9", activo: true },
    { codigo_oficial: "C62.9", descripcion: "Tumor maligno del testículo, no especificado", capitulo: "II", grupo: "C62", categoria: "C62.9", activo: true },
    { codigo_oficial: "C45.0", descripcion: "Mesotelioma de la pleura", capitulo: "II", grupo: "C45", categoria: "C45.0", activo: true },
    { codigo_oficial: "C06.9", descripcion: "Tumor maligno de la boca, parte no especificada", capitulo: "II", grupo: "C06", categoria: "C06.9", activo: true },
    { codigo_oficial: "C49.9", descripcion: "Tumor maligno tejido conjuntivo y blando, no especificado", capitulo: "II", grupo: "C49", categoria: "C49.9", activo: true },
  ],
  ref_oncodiagnostico: [
    { codigo_cie10: "C50.9", nombre_dx: "Carcinoma ductal invasivo de mama", grupo_tumor: "mama", es_maligno: true, activo: true },
    { codigo_cie10: "C50.9", nombre_dx: "Carcinoma lobulillar de mama", grupo_tumor: "mama", es_maligno: true, activo: true },
    { codigo_cie10: "C18.9", nombre_dx: "Adenocarcinoma de colon", grupo_tumor: "dig_bajo", es_maligno: true, activo: true },
    { codigo_cie10: "C20", nombre_dx: "Adenocarcinoma de recto", grupo_tumor: "dig_bajo", es_maligno: true, activo: true },
    { codigo_cie10: "C34.9", nombre_dx: "Ca pulmonar de células no pequeñas", grupo_tumor: "torax", es_maligno: true, activo: true },
    { codigo_cie10: "C53.9", nombre_dx: "Carcinoma cervicouterino", grupo_tumor: "gineco", es_maligno: true, activo: true },
    { codigo_cie10: "C54.1", nombre_dx: "Carcinoma de endometrio", grupo_tumor: "gineco", es_maligno: true, activo: true },
    { codigo_cie10: "C56", nombre_dx: "Carcinoma de ovario", grupo_tumor: "gineco", es_maligno: true, activo: true },
    { codigo_cie10: "C16.9", nombre_dx: "Adenocarcinoma gástrico", grupo_tumor: "dig_alto", es_maligno: true, activo: true },
    { codigo_cie10: "C61", nombre_dx: "Carcinoma de próstata", grupo_tumor: "uro", es_maligno: true, activo: true },
    { codigo_cie10: "C64", nombre_dx: "Carcinoma renal de células claras", grupo_tumor: "uro", es_maligno: true, activo: true },
    { codigo_cie10: "C67.9", nombre_dx: "Carcinoma vesical", grupo_tumor: "uro", es_maligno: true, activo: true },
    { codigo_cie10: "C43.9", nombre_dx: "Melanoma maligno cutáneo", grupo_tumor: "piel", es_maligno: true, activo: true },
    { codigo_cie10: "C73", nombre_dx: "Carcinoma de tiroides papilar", grupo_tumor: "endocr", es_maligno: true, activo: true },
    { codigo_cie10: "C81.9", nombre_dx: "Linfoma de Hodgkin", grupo_tumor: "hemato", es_maligno: true, es_hematologico: true, activo: true },
    { codigo_cie10: "C83.3", nombre_dx: "Linfoma no Hodgkin difuso", grupo_tumor: "hemato", es_maligno: true, es_hematologico: true, activo: true },
    { codigo_cie10: "C92.0", nombre_dx: "Leucemia mieloide aguda", grupo_tumor: "hemato", es_maligno: true, es_hematologico: true, activo: true },
    { codigo_cie10: "C90.0", nombre_dx: "Mieloma múltiple", grupo_tumor: "hemato", es_maligno: true, es_hematologico: true, activo: true },
    { codigo_cie10: "C22.0", nombre_dx: "Carcinoma hepatocelular", grupo_tumor: "dig_alto", es_maligno: true, activo: true },
    { codigo_cie10: "C25.9", nombre_dx: "Adenocarcinoma de páncreas", grupo_tumor: "dig_alto", es_maligno: true, activo: true },
  ],
  ref_oncoestadio: [
    { sistema: "TNM", codigo: "0", nombre: "Estadio 0", descripcion: "Carcinoma in situ", orden: 1, activo: true },
    { sistema: "TNM", codigo: "I", nombre: "Estadio I", descripcion: "Tumor localizado pequeño", orden: 2, activo: true },
    { sistema: "TNM", codigo: "IA", nombre: "Estadio IA", descripcion: "Subetapa IA", orden: 3, activo: true },
    { sistema: "TNM", codigo: "IB", nombre: "Estadio IB", descripcion: "Subetapa IB", orden: 4, activo: true },
    { sistema: "TNM", codigo: "II", nombre: "Estadio II", descripcion: "Tumor localizado mayor", orden: 5, activo: true },
    { sistema: "TNM", codigo: "IIA", nombre: "Estadio IIA", descripcion: "Subetapa IIA", orden: 6, activo: true },
    { sistema: "TNM", codigo: "IIB", nombre: "Estadio IIB", descripcion: "Subetapa IIB", orden: 7, activo: true },
    { sistema: "TNM", codigo: "III", nombre: "Estadio III", descripcion: "Extensión regional", orden: 8, activo: true },
    { sistema: "TNM", codigo: "IIIA", nombre: "Estadio IIIA", descripcion: "Subetapa IIIA", orden: 9, activo: true },
    { sistema: "TNM", codigo: "IIIB", nombre: "Estadio IIIB", descripcion: "Subetapa IIIB", orden: 10, activo: true },
    { sistema: "TNM", codigo: "IIIC", nombre: "Estadio IIIC", descripcion: "Subetapa IIIC", orden: 11, activo: true },
    { sistema: "TNM", codigo: "IV", nombre: "Estadio IV", descripcion: "Enfermedad metastásica", orden: 12, activo: true },
    { sistema: "TNM", codigo: "IVA", nombre: "Estadio IVA", descripcion: "Subetapa IVA", orden: 13, activo: true },
    { sistema: "TNM", codigo: "IVB", nombre: "Estadio IVB", descripcion: "Subetapa IVB", orden: 14, activo: true },
  ],
  ref_oncotnm_t: [
    { codigo: "Tis", descripcion: "Carcinoma in situ", orden: 1, activo: true },
    { codigo: "T0", descripcion: "Sin evidencia de tumor primario", orden: 2, activo: true },
    { codigo: "T1", descripcion: "Tumor ≤2 cm", orden: 3, activo: true },
    { codigo: "T1a", descripcion: "Tumor >0.1 cm pero ≤0.5 cm", orden: 4, activo: true },
    { codigo: "T1b", descripcion: "Tumor >0.5 cm pero ≤1 cm", orden: 5, activo: true },
    { codigo: "T1c", descripcion: "Tumor >1 cm pero ≤2 cm", orden: 6, activo: true },
    { codigo: "T2", descripcion: "Tumor >2 cm pero ≤5 cm", orden: 7, activo: true },
    { codigo: "T3", descripcion: "Tumor >5 cm", orden: 8, activo: true },
    { codigo: "T4", descripcion: "Tumor de cualquier tamaño con extensión directa", orden: 9, activo: true },
    { codigo: "T4a", descripcion: "Extensión a pared torácica", orden: 10, activo: true },
    { codigo: "T4b", descripcion: "Edema o ulceración de piel", orden: 11, activo: true },
    { codigo: "TX", descripcion: "No se puede evaluar el tumor primario", orden: 12, activo: true },
  ],
  ref_oncotnm_m: [
    { codigo: "M0", descripcion: "Sin metástasis a distancia", orden: 1, activo: true },
    { codigo: "M1", descripcion: "Metástasis a distancia presente", orden: 2, activo: true },
    { codigo: "M1a", descripcion: "Metástasis en un solo órgano", orden: 3, activo: true },
    { codigo: "M1b", descripcion: "Metástasis en múltiples órganos", orden: 4, activo: true },
    { codigo: "MX", descripcion: "No se puede evaluar metástasis", orden: 5, activo: true },
  ],
  ref_oncofigo: [
    { localizacion: "General", codigo: "I", nombre: "FIGO I", descripcion: "Tumor confinado al órgano de origen", orden: 1, activo: true },
    { localizacion: "General", codigo: "IA", nombre: "FIGO IA", descripcion: "Subetapa IA", orden: 2, activo: true },
    { localizacion: "General", codigo: "IA1", nombre: "FIGO IA1", descripcion: "Subetapa IA1", orden: 3, activo: true },
    { localizacion: "General", codigo: "IA2", nombre: "FIGO IA2", descripcion: "Subetapa IA2", orden: 4, activo: true },
    { localizacion: "General", codigo: "IB", nombre: "FIGO IB", descripcion: "Subetapa IB", orden: 5, activo: true },
    { localizacion: "General", codigo: "IB1", nombre: "FIGO IB1", descripcion: "Subetapa IB1", orden: 6, activo: true },
    { localizacion: "General", codigo: "IB2", nombre: "FIGO IB2", descripcion: "Subetapa IB2", orden: 7, activo: true },
    { localizacion: "General", codigo: "IB3", nombre: "FIGO IB3", descripcion: "Subetapa IB3", orden: 8, activo: true },
    { localizacion: "General", codigo: "II", nombre: "FIGO II", descripcion: "Extensión más allá del órgano", orden: 9, activo: true },
    { localizacion: "General", codigo: "IIA", nombre: "FIGO IIA", descripcion: "Subetapa IIA", orden: 10, activo: true },
    { localizacion: "General", codigo: "IIB", nombre: "FIGO IIB", descripcion: "Subetapa IIB", orden: 11, activo: true },
    { localizacion: "General", codigo: "III", nombre: "FIGO III", descripcion: "Extensión a pelvis o ganglios", orden: 12, activo: true },
    { localizacion: "General", codigo: "IIIA", nombre: "FIGO IIIA", descripcion: "Subetapa IIIA", orden: 13, activo: true },
    { localizacion: "General", codigo: "IIIB", nombre: "FIGO IIIB", descripcion: "Subetapa IIIB", orden: 14, activo: true },
    { localizacion: "General", codigo: "IIIC", nombre: "FIGO IIIC", descripcion: "Subetapa IIIC", orden: 15, activo: true },
    { localizacion: "General", codigo: "IV", nombre: "FIGO IV", descripcion: "Enfermedad a distancia", orden: 16, activo: true },
    { localizacion: "General", codigo: "IVA", nombre: "FIGO IVA", descripcion: "Invasión mucosa vesical o rectal", orden: 17, activo: true },
    { localizacion: "General", codigo: "IVB", nombre: "FIGO IVB", descripcion: "Metástasis a distancia", orden: 18, activo: true },
  ],
  ref_oncogradohistologico: [
    { codigo: "G1", nombre: "G1 - Bien diferenciado", descripcion: "Tumor bien diferenciado", orden: 1, activo: true },
    { codigo: "G2", nombre: "G2 - Moderadamente diferenciado", descripcion: "Tumor moderadamente diferenciado", orden: 2, activo: true },
    { codigo: "G3", nombre: "G3 - Poco diferenciado", descripcion: "Tumor poco diferenciado", orden: 3, activo: true },
    { codigo: "G4", nombre: "G4 - Indiferenciado", descripcion: "Tumor indiferenciado / anaplásico", orden: 4, activo: true },
    { codigo: "GX", nombre: "GX - No evaluable", descripcion: "Grado no puede ser evaluado", orden: 5, activo: true },
  ],
  ref_oncoetapificacion: [
    { codigo: "TNM_CLINICO", nombre: "TNM Clínico", descripcion: "Etapificación TNM clínica (cTNM)", orden: 1, activo: true },
    { codigo: "TNM_PATOLOGICO", nombre: "TNM Patológico", descripcion: "Etapificación TNM patológica (pTNM)", orden: 2, activo: true },
    { codigo: "FIGO", nombre: "FIGO", descripcion: "Etapificación FIGO para cánceres ginecológicos", orden: 3, activo: true },
    { codigo: "ANN_ARBOR", nombre: "Ann Arbor", descripcion: "Etapificación Ann Arbor para linfomas", orden: 4, activo: true },
  ],
  ref_oncobasediagnostico: [
    { codigo: "CLINICO", nombre: "Clínico", descripcion: "Diagnóstico basado en hallazgos clínicos", orden: 1, activo: true },
    { codigo: "HISTOLOGICO", nombre: "Histológico", descripcion: "Diagnóstico confirmado por biopsia/histología", orden: 2, activo: true, es_histologico: true },
    { codigo: "CITOLOGICO", nombre: "Citológico", descripcion: "Diagnóstico basado en citología", orden: 3, activo: true },
    { codigo: "IMAGENOLOGICO", nombre: "Imagenológico", descripcion: "Diagnóstico basado en imágenes", orden: 4, activo: true },
    { codigo: "MARCADORES", nombre: "Marcadores tumorales", descripcion: "Diagnóstico basado en marcadores tumorales", orden: 5, activo: true },
    { codigo: "LABORATORIO", nombre: "Laboratorio", descripcion: "Diagnóstico basado en exámenes de laboratorio", orden: 6, activo: true },
  ],
  ref_oncoecog: [
    { valor: 0, codigo: "0", nombre: "ECOG 0", descripcion: "Completamente activo, sin restricciones", orden: 0, activo: true },
    { valor: 1, codigo: "1", nombre: "ECOG 1", descripcion: "Restricción en actividad física extenuante, ambulatorio", orden: 1, activo: true },
    { valor: 2, codigo: "2", nombre: "ECOG 2", descripcion: "Ambulatorio y capaz de autocuidado, en pie >50% horas vigilia", orden: 2, activo: true },
    { valor: 3, codigo: "3", nombre: "ECOG 3", descripcion: "Autocuidado limitado, en cama o silla >50% horas vigilia", orden: 3, activo: true },
    { valor: 4, codigo: "4", nombre: "ECOG 4", descripcion: "Completamente incapacitado, postrado", orden: 4, activo: true },
    { valor: 5, codigo: "5", nombre: "ECOG 5", descripcion: "Fallecido", orden: 5, activo: true },
  ],
  ref_oncotipodocumento: [
    { codigo: "INFORME", nombre: "Informe", descripcion: "Informe médico o de procedimiento", orden: 1, activo: true },
    { codigo: "NOTIFICACION", nombre: "Notificación", descripcion: "Notificación GES u obligatoria", orden: 2, activo: true },
    { codigo: "IMAGEN", nombre: "Imagen", descripcion: "Imagen diagnóstica", orden: 3, activo: true },
    { codigo: "CONSENTIMIENTO", nombre: "Consentimiento", descripcion: "Consentimiento informado", orden: 4, activo: true },
    { codigo: "OTRO", nombre: "Otro", descripcion: "Otro tipo de documento", orden: 5, activo: true },
  ],
  // Morphology and Topography — minimal seed (these are large catalogs, add via import later)
  ref_oncomorfologiaicdo: [
    { codigo_oficial: "8140/3", descripcion: "Adenocarcinoma, SAI", comportamiento: "/3", es_maligno: true, activo: true },
    { codigo_oficial: "8500/3", descripcion: "Carcinoma ductal infiltrante, SAI", comportamiento: "/3", es_maligno: true, activo: true },
    { codigo_oficial: "8070/3", descripcion: "Carcinoma de células escamosas, SAI", comportamiento: "/3", es_maligno: true, activo: true },
    { codigo_oficial: "8720/3", descripcion: "Melanoma maligno, SAI", comportamiento: "/3", es_maligno: true, activo: true },
    { codigo_oficial: "9680/3", descripcion: "Linfoma difuso de células B grandes", comportamiento: "/3", es_maligno: true, activo: true },
  ],
  ref_oncotopografiaicdo: [
    { codigo_oficial: "C50.9", descripcion: "Mama, SAI", sitio_anatomico: "Mama", grupo_tumor: "mama", activo: true },
    { codigo_oficial: "C18.9", descripcion: "Colon, SAI", sitio_anatomico: "Colon", grupo_tumor: "dig_bajo", activo: true },
    { codigo_oficial: "C34.9", descripcion: "Pulmón, SAI", sitio_anatomico: "Pulmón", grupo_tumor: "torax", activo: true },
    { codigo_oficial: "C16.9", descripcion: "Estómago, SAI", sitio_anatomico: "Estómago", grupo_tumor: "dig_alto", activo: true },
    { codigo_oficial: "C61.9", descripcion: "Próstata", sitio_anatomico: "Próstata", grupo_tumor: "uro", activo: true },
    { codigo_oficial: "C53.9", descripcion: "Cuello uterino, SAI", sitio_anatomico: "Cérvix", grupo_tumor: "gineco", activo: true },
  ],
};

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║  Phase 1 — REF Catalog Collections            ║");
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
        await api("POST", `collections/${col.name}/fields:create`, buildField(fspec));
      } catch (e: any) {
        if (e.message?.includes("already exists") || e.message?.includes("duplicate")) {
          // skip silently
        } else {
          console.error(`  ❌ Field ${fspec.name}: ${e.message}`);
          errCount++;
        }
      }
    }
    console.log(`  ✅ ${col.fields.length} fields processed`);

    // 3. Seed data
    const seed = SEED[col.name];
    if (seed && seed.length > 0) {
      let seedOk = 0;
      for (const row of seed) {
        try {
          await api("POST", `${col.name}:create`, row);
          seedOk++;
        } catch {
          // skip duplicates silently
        }
      }
      console.log(`  ✅ Seeded ${seedOk}/${seed.length} rows`);
    }
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`✅ OK: ${okCount} | ⏭️  Skip: ${skipCount} | ❌ Err: ${errCount}`);
  console.log(`Total collections: ${COLLECTIONS.length}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
