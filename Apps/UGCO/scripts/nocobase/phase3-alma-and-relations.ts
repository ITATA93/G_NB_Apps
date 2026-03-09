/**
 * Phase 3+4 — Create 5 ALMA collections + configure all relationships
 * UGCO rebuild from scratch
 *
 * Usage: npx tsx Apps/UGCO/scripts/nocobase/phase3-alma-and-relations.ts
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

// ═══════════════════════════════════════════════════════════
// PART A — ALMA Collections (read-only integration)
// ═══════════════════════════════════════════════════════════

interface ColDef { name: string; title: string; fields: { name: string; type: string; title: string; required?: boolean }[]; }

const ALMA_COLLECTIONS: ColDef[] = [
  {
    name: "alma_paciente",
    title: "ALMA - Paciente",
    fields: [
      { name: "run", type: "string", title: "RUN" },
      { name: "tipo_documento", type: "string", title: "Tipo Documento" },
      { name: "nro_documento", type: "string", title: "Nro Documento" },
      { name: "dv", type: "string", title: "Dígito Verificador" },
      { name: "nombres", type: "string", title: "Nombres", required: true },
      { name: "apellido_paterno", type: "string", title: "Apellido Paterno" },
      { name: "apellido_materno", type: "string", title: "Apellido Materno" },
      { name: "fecha_nacimiento", type: "dateOnly", title: "Fecha Nacimiento" },
      { name: "sexo", type: "string", title: "Sexo" },
      { name: "genero", type: "string", title: "Género" },
      { name: "nacionalidad", type: "string", title: "Nacionalidad" },
      { name: "prevision", type: "string", title: "Previsión" },
      { name: "sistema_prevision", type: "string", title: "Sistema Previsión" },
      { name: "fecha_defuncion", type: "dateOnly", title: "Fecha Defunción" },
      { name: "activo", type: "boolean", title: "Activo" },
    ],
  },
  {
    name: "alma_episodio",
    title: "ALMA - Episodio",
    fields: [
      { name: "paciente_id", type: "integer", title: "Paciente ID", required: true },
      { name: "tipo_episodio", type: "string", title: "Tipo Episodio" },
      { name: "fecha_ingreso", type: "date", title: "Fecha Ingreso", required: true },
      { name: "fecha_egreso", type: "date", title: "Fecha Egreso" },
      { name: "establecimiento", type: "string", title: "Establecimiento" },
      { name: "servicio", type: "string", title: "Servicio" },
      { name: "unidad", type: "string", title: "Unidad" },
      { name: "profesional_tratante", type: "string", title: "Profesional Tratante" },
      { name: "motivo_consulta", type: "text", title: "Motivo Consulta" },
      { name: "resumen_alta", type: "text", title: "Resumen Alta" },
      { name: "activo", type: "boolean", title: "Activo" },
    ],
  },
  {
    name: "alma_diagnostico",
    title: "ALMA - Diagnóstico",
    fields: [
      { name: "episodio_id", type: "integer", title: "Episodio ID", required: true },
      { name: "paciente_id", type: "integer", title: "Paciente ID", required: true },
      { name: "tipo_diagnostico", type: "string", title: "Tipo Diagnóstico" },
      { name: "codigo_cie10", type: "string", title: "Código CIE-10", required: true },
      { name: "descripcion", type: "string", title: "Descripción" },
      { name: "fecha_registro", type: "date", title: "Fecha Registro", required: true },
      { name: "profesional_registra", type: "string", title: "Profesional" },
      { name: "es_oncologico", type: "boolean", title: "Es Oncológico" },
      { name: "activo", type: "boolean", title: "Activo" },
    ],
  },
  {
    name: "alma_interconsulta",
    title: "ALMA - Interconsulta",
    fields: [
      { name: "paciente_id", type: "integer", title: "Paciente ID", required: true },
      { name: "episodio_id", type: "integer", title: "Episodio ID" },
      { name: "especialidad_solicitada", type: "string", title: "Especialidad Solicitada", required: true },
      { name: "servicio_solicitante", type: "string", title: "Servicio Solicitante" },
      { name: "profesional_solicitante", type: "string", title: "Profesional Solicitante" },
      { name: "motivo_solicitud", type: "text", title: "Motivo Solicitud" },
      { name: "prioridad", type: "string", title: "Prioridad" },
      { name: "fecha_solicitud", type: "date", title: "Fecha Solicitud", required: true },
      { name: "fecha_aceptacion", type: "date", title: "Fecha Aceptación" },
      { name: "fecha_respuesta", type: "date", title: "Fecha Respuesta" },
      { name: "estado_ic", type: "string", title: "Estado IC" },
      { name: "profesional_responde", type: "string", title: "Profesional Responde" },
      { name: "respuesta_resumen", type: "text", title: "Respuesta Resumen" },
      { name: "activo", type: "boolean", title: "Activo" },
    ],
  },
  {
    name: "alma_ordenexamen",
    title: "ALMA - Orden Examen",
    fields: [
      { name: "paciente_id", type: "integer", title: "Paciente ID", required: true },
      { name: "episodio_id", type: "integer", title: "Episodio ID" },
      { name: "tipo_orden", type: "string", title: "Tipo Orden" },
      { name: "codigo_examen", type: "string", title: "Código Examen" },
      { name: "nombre_examen", type: "string", title: "Nombre Examen", required: true },
      { name: "fecha_solicitud", type: "date", title: "Fecha Solicitud", required: true },
      { name: "fecha_programada", type: "date", title: "Fecha Programada" },
      { name: "fecha_realizacion", type: "date", title: "Fecha Realización" },
      { name: "fecha_informe", type: "date", title: "Fecha Informe" },
      { name: "estado_orden", type: "string", title: "Estado Orden" },
      { name: "servicio_solicitante", type: "string", title: "Servicio Solicitante" },
      { name: "profesional_solicitante", type: "string", title: "Profesional Solicitante" },
      { name: "resultado_resumen", type: "text", title: "Resultado Resumen" },
      { name: "url_informe", type: "string", title: "URL Informe" },
      { name: "activo", type: "boolean", title: "Activo" },
    ],
  },
];

function buildField(f: { name: string; type: string; title: string; required?: boolean }): object {
  const typeMap: Record<string, string> = {
    string: "input", text: "textarea", integer: "integer",
    boolean: "checkbox", date: "datetime", dateOnly: "date",
  };
  const compMap: Record<string, string> = {
    string: "Input", text: "Input.TextArea", integer: "InputNumber",
    boolean: "Checkbox", date: "DatePicker", dateOnly: "DatePicker",
  };
  const base: any = {
    name: f.name,
    type: f.type === "dateOnly" ? "dateOnly" : f.type,
    interface: typeMap[f.type] || "input",
    uiSchema: {
      title: f.title,
      type: f.type === "boolean" ? "boolean" : f.type === "integer" ? "number" : "string",
      "x-component": compMap[f.type] || "Input",
    },
  };
  if (f.required) base.required = true;
  return base;
}

// ═══════════════════════════════════════════════════════════
// PART B — Relationships (belongsTo / hasMany)
// ═══════════════════════════════════════════════════════════

interface Rel {
  collection: string;  // source collection
  field: object;       // field definition for belongsTo or hasMany
}

const RELATIONSHIPS: Rel[] = [
  // ── UGCO_CasoOncologico belongsTo ──
  {
    collection: "ugco_casooncologico",
    field: {
      type: "belongsTo", name: "paciente", foreignKey: "paciente_id",
      target: "alma_paciente", interface: "m2o",
      uiSchema: { title: "Paciente", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "nombres", value: "id" } } },
    },
  },
  {
    collection: "ugco_casooncologico",
    field: {
      type: "belongsTo", name: "estado_clinico", foreignKey: "estado_clinico_id",
      target: "ref_oncoestadoclinico", interface: "m2o",
      uiSchema: { title: "Estado Clínico", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "nombre", value: "id" } } },
    },
  },
  {
    collection: "ugco_casooncologico",
    field: {
      type: "belongsTo", name: "estado_adm", foreignKey: "estado_adm_id",
      target: "ref_oncoestadoadm", interface: "m2o",
      uiSchema: { title: "Estado Administrativo", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "nombre", value: "id" } } },
    },
  },
  {
    collection: "ugco_casooncologico",
    field: {
      type: "belongsTo", name: "intencion_trat", foreignKey: "intencion_trat_id",
      target: "ref_oncointenciontrat", interface: "m2o",
      uiSchema: { title: "Intención Tratamiento", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "nombre", value: "id" } } },
    },
  },
  {
    collection: "ugco_casooncologico",
    field: {
      type: "belongsTo", name: "estado_seguimiento", foreignKey: "estado_seguimiento_id",
      target: "ref_oncoestadocaso", interface: "m2o",
      uiSchema: { title: "Estado Seguimiento", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "nombre", value: "id" } } },
    },
  },
  // ── UGCO_CasoOncologico hasMany ──
  {
    collection: "ugco_casooncologico",
    field: {
      type: "hasMany", name: "eventos", foreignKey: "caso_id",
      target: "ugco_eventoclinico", interface: "o2m",
      uiSchema: { title: "Eventos Clínicos", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "tipo_evento", value: "id" } } },
    },
  },
  {
    collection: "ugco_casooncologico",
    field: {
      type: "hasMany", name: "tareas", foreignKey: "caso_id",
      target: "ugco_tarea", interface: "o2m",
      uiSchema: { title: "Tareas", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "titulo", value: "id" } } },
    },
  },
  {
    collection: "ugco_casooncologico",
    field: {
      type: "hasMany", name: "documentos", foreignKey: "caso_id",
      target: "ugco_documentocaso", interface: "o2m",
      uiSchema: { title: "Documentos", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "nombre_archivo", value: "id" } } },
    },
  },
  {
    collection: "ugco_casooncologico",
    field: {
      type: "hasMany", name: "especialidades", foreignKey: "caso_id",
      target: "ugco_casoespecialidad", interface: "o2m",
      uiSchema: { title: "Especialidades", "x-component": "AssociationField" },
    },
  },
  {
    collection: "ugco_casooncologico",
    field: {
      type: "hasMany", name: "contactos", foreignKey: "caso_id",
      target: "ugco_contactopaciente", interface: "o2m",
      uiSchema: { title: "Contactos", "x-component": "AssociationField" },
    },
  },
  {
    collection: "ugco_casooncologico",
    field: {
      type: "hasMany", name: "personas_significativas", foreignKey: "caso_id",
      target: "ugco_personasignificativa", interface: "o2m",
      uiSchema: { title: "Personas Significativas", "x-component": "AssociationField" },
    },
  },
  // ── UGCO_EventoClinico belongsTo ──
  {
    collection: "ugco_eventoclinico",
    field: {
      type: "belongsTo", name: "caso", foreignKey: "caso_id",
      target: "ugco_casooncologico", interface: "m2o",
      uiSchema: { title: "Caso Oncológico", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "codigo_cie10", value: "id" } } },
    },
  },
  // ── UGCO_CasoEspecialidad belongsTo ──
  {
    collection: "ugco_casoespecialidad",
    field: {
      type: "belongsTo", name: "caso", foreignKey: "caso_id",
      target: "ugco_casooncologico", interface: "m2o",
      uiSchema: { title: "Caso", "x-component": "AssociationField" },
    },
  },
  {
    collection: "ugco_casoespecialidad",
    field: {
      type: "belongsTo", name: "especialidad", foreignKey: "especialidad_id",
      target: "ref_oncoespecialidad", interface: "m2o",
      uiSchema: { title: "Especialidad", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "nombre", value: "id" } } },
    },
  },
  // ── UGCO_Tarea belongsTo ──
  {
    collection: "ugco_tarea",
    field: {
      type: "belongsTo", name: "caso", foreignKey: "caso_id",
      target: "ugco_casooncologico", interface: "m2o",
      uiSchema: { title: "Caso", "x-component": "AssociationField" },
    },
  },
  {
    collection: "ugco_tarea",
    field: {
      type: "belongsTo", name: "tipo_tarea", foreignKey: "tipo_tarea_id",
      target: "ref_oncotipoactividad", interface: "m2o",
      uiSchema: { title: "Tipo Tarea", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "nombre", value: "id" } } },
    },
  },
  {
    collection: "ugco_tarea",
    field: {
      type: "belongsTo", name: "estado_tarea", foreignKey: "estado_tarea_id",
      target: "ref_oncoestadoactividad", interface: "m2o",
      uiSchema: { title: "Estado Tarea", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "nombre", value: "id" } } },
    },
  },
  // ── UGCO_ComiteOncologico ──
  {
    collection: "ugco_comiteoncologico",
    field: {
      type: "belongsTo", name: "especialidad", foreignKey: "especialidad_id",
      target: "ref_oncoespecialidad", interface: "m2o",
      uiSchema: { title: "Especialidad", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "nombre", value: "id" } } },
    },
  },
  {
    collection: "ugco_comiteoncologico",
    field: {
      type: "hasMany", name: "casos", foreignKey: "comite_id",
      target: "ugco_comitecaso", interface: "o2m",
      uiSchema: { title: "Casos", "x-component": "AssociationField" },
    },
  },
  // ── UGCO_ComiteCaso belongsTo ──
  {
    collection: "ugco_comitecaso",
    field: {
      type: "belongsTo", name: "comite", foreignKey: "comite_id",
      target: "ugco_comiteoncologico", interface: "m2o",
      uiSchema: { title: "Comité", "x-component": "AssociationField" },
    },
  },
  {
    collection: "ugco_comitecaso",
    field: {
      type: "belongsTo", name: "caso", foreignKey: "caso_id",
      target: "ugco_casooncologico", interface: "m2o",
      uiSchema: { title: "Caso", "x-component": "AssociationField" },
    },
  },
  // ── UGCO_EquipoSeguimiento ──
  {
    collection: "ugco_equiposeguimiento",
    field: {
      type: "belongsTo", name: "especialidad", foreignKey: "especialidad_id",
      target: "ref_oncoespecialidad", interface: "m2o",
      uiSchema: { title: "Especialidad", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "nombre", value: "id" } } },
    },
  },
  {
    collection: "ugco_equiposeguimiento",
    field: {
      type: "hasMany", name: "miembros", foreignKey: "equipo_id",
      target: "ugco_equipomiembro", interface: "o2m",
      uiSchema: { title: "Miembros", "x-component": "AssociationField" },
    },
  },
  // ── UGCO_EquipoMiembro belongsTo ──
  {
    collection: "ugco_equipomiembro",
    field: {
      type: "belongsTo", name: "equipo", foreignKey: "equipo_id",
      target: "ugco_equiposeguimiento", interface: "m2o",
      uiSchema: { title: "Equipo", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "nombre", value: "id" } } },
    },
  },
  // ── UGCO_DocumentoCaso belongsTo ──
  {
    collection: "ugco_documentocaso",
    field: {
      type: "belongsTo", name: "caso", foreignKey: "caso_id",
      target: "ugco_casooncologico", interface: "m2o",
      uiSchema: { title: "Caso", "x-component": "AssociationField" },
    },
  },
  {
    collection: "ugco_documentocaso",
    field: {
      type: "belongsTo", name: "tipo_documento", foreignKey: "tipo_documento_id",
      target: "ref_oncotipodocumento", interface: "m2o",
      uiSchema: { title: "Tipo Documento", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "nombre", value: "id" } } },
    },
  },
];

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║  Phase 3+4 — ALMA + Relationships             ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  // Part A: ALMA Collections
  console.log("── PART A: ALMA Collections ──\n");
  for (const col of ALMA_COLLECTIONS) {
    console.log(`  ${col.title} (${col.name})`);
    try {
      await api("POST", "collections:create", {
        name: col.name, title: col.title, fields: [],
        autoGenId: true, createdAt: true, updatedAt: true, sortable: true,
      });
      console.log(`    ✅ Created`);
    } catch (e: any) {
      if (e.message.includes("already exists")) { console.log(`    ℹ️  Exists`); skipCount++; }
      else { console.error(`    ❌ ${e.message}`); errCount++; continue; }
    }
    for (const f of col.fields) {
      try { await api("POST", `collections/${col.name}/fields:create`, buildField(f)); }
      catch { /* skip dupes */ }
    }
    console.log(`    ✅ ${col.fields.length} fields`);
  }

  // Part B: Relationships
  console.log("\n── PART B: Relationships ──\n");
  for (const rel of RELATIONSHIPS) {
    const fieldName = (rel.field as any).name;
    try {
      await api("POST", `collections/${rel.collection}/fields:create`, rel.field);
      console.log(`  ✅ ${rel.collection}.${fieldName}`);
    } catch (e: any) {
      if (e.message?.includes("already exists") || e.message?.includes("duplicate")) {
        console.log(`  ℹ️  ${rel.collection}.${fieldName} exists`);
      } else {
        console.error(`  ❌ ${rel.collection}.${fieldName}: ${e.message}`);
        errCount++;
      }
    }
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`✅ OK: ${okCount} | ⏭️  Skip: ${skipCount} | ❌ Err: ${errCount}`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
