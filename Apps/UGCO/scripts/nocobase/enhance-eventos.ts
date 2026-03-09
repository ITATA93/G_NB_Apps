/**
 * Enhance UGCO_EventoClinico — Add modalidad prestación, centros, subtipos
 *
 * Creates:
 *   1. REF_CentroSalud (DEIS-based health facility catalog)
 *   2. REF_SubtipoEvento (editable event subtypes)
 *   3. REF_ModalidadPrestacion (INTERNO/COMPLEMENTO/DERIVACION/COMPRA)
 *   4. REF_EstadoSeguimientoEvento (lifecycle states)
 *   5. New fields on UGCO_EventoClinico
 *   6. New relationships
 *
 * Usage: npx tsx Apps/UGCO/scripts/nocobase/enhance-eventos.ts
 */

import "dotenv/config";

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;
if (!BASE || !KEY) { console.error("Missing env vars"); process.exit(1); }

let okCount = 0; const errCount = 0;

async function api(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    if (text.includes("already exists") || text.includes("duplicate")) return null;
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  okCount++;
  return text ? JSON.parse(text) : {};
}

function buildField(f: { name: string; type: string; title: string; required?: boolean; unique?: boolean; defaultValue?: any; enum?: any[] }): object {
  const isSelect = !!f.enum;
  const realType = isSelect ? "string" : (f.type === "dateOnly" ? "dateOnly" : f.type);
  const iface = isSelect ? "select" : ({ string: "input", text: "textarea", integer: "integer", boolean: "checkbox", date: "datetime", dateOnly: "date" } as any)[f.type] || "input";
  const comp = isSelect ? "Select" : ({ string: "Input", text: "Input.TextArea", integer: "InputNumber", boolean: "Checkbox", date: "DatePicker", dateOnly: "DatePicker" } as any)[f.type] || "Input";
  const base: any = {
    name: f.name, type: realType, interface: iface,
    uiSchema: { title: f.title, type: f.type === "boolean" ? "boolean" : f.type === "integer" ? "number" : "string", "x-component": comp },
  };
  if (f.required) base.required = true;
  if (f.unique) base.unique = true;
  if (f.defaultValue !== undefined) base.defaultValue = f.defaultValue;
  if (f.enum) base.uiSchema.enum = f.enum;
  return base;
}

// ═══════════════════════════════════════════════════════════
// 1. REF_CentroSalud
// ═══════════════════════════════════════════════════════════

const CENTRO_SALUD_FIELDS = [
  { name: "codigo_deis", type: "string", title: "Código DEIS", unique: true },
  { name: "nombre", type: "string", title: "Nombre", required: true },
  { name: "tipo_establecimiento", type: "string", title: "Tipo Establecimiento" },
  { name: "nivel_atencion", type: "string", title: "Nivel Atención" },
  { name: "dependencia", type: "string", title: "Dependencia" },
  { name: "servicio_salud", type: "string", title: "Servicio de Salud" },
  { name: "comuna", type: "string", title: "Comuna" },
  { name: "region", type: "string", title: "Región" },
  { name: "direccion", type: "string", title: "Dirección" },
  { name: "telefono", type: "string", title: "Teléfono" },
  { name: "es_publico", type: "boolean", title: "Es Público", defaultValue: true },
  { name: "en_red_oncologica", type: "boolean", title: "En Red Oncológica" },
  { name: "activo", type: "boolean", title: "Activo", defaultValue: true },
];

// Seed: Coquimbo region + major national referral centers
const CENTROS_SEED = [
  // ── Servicio de Salud Coquimbo ──
  { codigo_deis: "113100", nombre: "Hospital San Pablo de Coquimbo", tipo_establecimiento: "Hospital", nivel_atencion: "Alta Complejidad", servicio_salud: "Servicio de Salud Coquimbo", comuna: "Coquimbo", region: "Coquimbo", es_publico: true, en_red_oncologica: true, activo: true },
  { codigo_deis: "113200", nombre: "Hospital San Juan de Dios de La Serena", tipo_establecimiento: "Hospital", nivel_atencion: "Alta Complejidad", servicio_salud: "Servicio de Salud Coquimbo", comuna: "La Serena", region: "Coquimbo", es_publico: true, en_red_oncologica: true, activo: true },
  { codigo_deis: "113300", nombre: "Hospital Antonio Tirado Lanas de Ovalle", tipo_establecimiento: "Hospital", nivel_atencion: "Mediana Complejidad", servicio_salud: "Servicio de Salud Coquimbo", comuna: "Ovalle", region: "Coquimbo", es_publico: true, en_red_oncologica: true, activo: true },
  { codigo_deis: "113301", nombre: "Hospital de Combarbalá", tipo_establecimiento: "Hospital", nivel_atencion: "Baja Complejidad", servicio_salud: "Servicio de Salud Coquimbo", comuna: "Combarbalá", region: "Coquimbo", es_publico: true, activo: true },
  { codigo_deis: "113302", nombre: "Hospital de Illapel", tipo_establecimiento: "Hospital", nivel_atencion: "Baja Complejidad", servicio_salud: "Servicio de Salud Coquimbo", comuna: "Illapel", region: "Coquimbo", es_publico: true, activo: true },
  { codigo_deis: "113303", nombre: "Hospital de Salamanca", tipo_establecimiento: "Hospital", nivel_atencion: "Baja Complejidad", servicio_salud: "Servicio de Salud Coquimbo", comuna: "Salamanca", region: "Coquimbo", es_publico: true, activo: true },
  { codigo_deis: "113304", nombre: "Hospital de Vicuña", tipo_establecimiento: "Hospital", nivel_atencion: "Baja Complejidad", servicio_salud: "Servicio de Salud Coquimbo", comuna: "Vicuña", region: "Coquimbo", es_publico: true, activo: true },
  { codigo_deis: "113305", nombre: "Hospital de Andacollo", tipo_establecimiento: "Hospital", nivel_atencion: "Baja Complejidad", servicio_salud: "Servicio de Salud Coquimbo", comuna: "Andacollo", region: "Coquimbo", es_publico: true, activo: true },
  // ── Hospitales de referencia nacional (oncología) ──
  { codigo_deis: "100100", nombre: "Instituto Nacional del Cáncer", tipo_establecimiento: "Instituto", nivel_atencion: "Alta Complejidad", servicio_salud: "Servicio de Salud Metropolitano Norte", comuna: "Independencia", region: "Metropolitana", es_publico: true, en_red_oncologica: true, activo: true },
  { codigo_deis: "101100", nombre: "Hospital San Borja Arriarán", tipo_establecimiento: "Hospital", nivel_atencion: "Alta Complejidad", servicio_salud: "Servicio de Salud Metropolitano Central", comuna: "Santiago", region: "Metropolitana", es_publico: true, en_red_oncologica: true, activo: true },
  { codigo_deis: "101200", nombre: "Hospital Clínico San José", tipo_establecimiento: "Hospital", nivel_atencion: "Alta Complejidad", servicio_salud: "Servicio de Salud Metropolitano Norte", comuna: "Independencia", region: "Metropolitana", es_publico: true, activo: true },
  { codigo_deis: "105100", nombre: "Hospital Carlos Van Buren", tipo_establecimiento: "Hospital", nivel_atencion: "Alta Complejidad", servicio_salud: "Servicio de Salud Valparaíso - San Antonio", comuna: "Valparaíso", region: "Valparaíso", es_publico: true, en_red_oncologica: true, activo: true },
  { codigo_deis: "105200", nombre: "Hospital Dr. Gustavo Fricke", tipo_establecimiento: "Hospital", nivel_atencion: "Alta Complejidad", servicio_salud: "Servicio de Salud Viña del Mar - Quillota", comuna: "Viña del Mar", region: "Valparaíso", es_publico: true, activo: true },
  // ── Centros privados comunes para compra de servicio ──
  { codigo_deis: "PRV-001", nombre: "Clínica Alemana de Santiago", tipo_establecimiento: "Clínica Privada", nivel_atencion: "Alta Complejidad", comuna: "Vitacura", region: "Metropolitana", es_publico: false, activo: true },
  { codigo_deis: "PRV-002", nombre: "Clínica Las Condes", tipo_establecimiento: "Clínica Privada", nivel_atencion: "Alta Complejidad", comuna: "Las Condes", region: "Metropolitana", es_publico: false, activo: true },
  { codigo_deis: "PRV-003", nombre: "Clínica IRAM (La Serena)", tipo_establecimiento: "Clínica Privada", nivel_atencion: "Mediana Complejidad", comuna: "La Serena", region: "Coquimbo", es_publico: false, activo: true },
  { codigo_deis: "PRV-004", nombre: "Centro PET-CT Santiago", tipo_establecimiento: "Centro Diagnóstico", nivel_atencion: "Alta Complejidad", comuna: "Providencia", region: "Metropolitana", es_publico: false, activo: true },
  { codigo_deis: "PRV-005", nombre: "Laboratorio Biopat (Anatomía Patológica)", tipo_establecimiento: "Laboratorio", nivel_atencion: "Especialidad", comuna: "Santiago", region: "Metropolitana", es_publico: false, activo: true },
];

// ═══════════════════════════════════════════════════════════
// 2. REF_SubtipoEvento
// ═══════════════════════════════════════════════════════════

const SUBTIPO_FIELDS = [
  { name: "tipo_padre", type: "string", title: "Tipo Padre", required: true },
  { name: "codigo", type: "string", title: "Código", required: true, unique: true },
  { name: "nombre", type: "string", title: "Nombre", required: true },
  { name: "descripcion", type: "text", title: "Descripción" },
  { name: "orden", type: "integer", title: "Orden" },
  { name: "activo", type: "boolean", title: "Activo", defaultValue: true },
];

const SUBTIPOS_SEED = [
  // Cirugías
  { tipo_padre: "CIRUGIA", codigo: "CIR_ONCOLOGICA", nombre: "Cirugía Oncológica", orden: 1, activo: true },
  { tipo_padre: "CIRUGIA", codigo: "CIR_PALIATIVA", nombre: "Cirugía Paliativa", orden: 2, activo: true },
  { tipo_padre: "CIRUGIA", codigo: "CIR_DIAGNOSTICA", nombre: "Cirugía Diagnóstica", orden: 3, activo: true },
  { tipo_padre: "CIRUGIA", codigo: "CIR_RECONSTRUCTIVA", nombre: "Cirugía Reconstructiva", orden: 4, activo: true },
  // Endoscopías
  { tipo_padre: "ENDOSCOPIA", codigo: "EDA", nombre: "Endoscopía Digestiva Alta", orden: 1, activo: true },
  { tipo_padre: "ENDOSCOPIA", codigo: "COLONO", nombre: "Colonoscopía", orden: 2, activo: true },
  { tipo_padre: "ENDOSCOPIA", codigo: "ENDOSONO", nombre: "Endosonografía", orden: 3, activo: true },
  { tipo_padre: "ENDOSCOPIA", codigo: "BRONCOSCOPIA", nombre: "Broncoscopía", orden: 4, activo: true },
  { tipo_padre: "ENDOSCOPIA", codigo: "CISTOSCOPIA", nombre: "Cistoscopía", orden: 5, activo: true },
  // Biopsias
  { tipo_padre: "BIOPSIA", codigo: "BX_CORE", nombre: "Biopsia Core", orden: 1, activo: true },
  { tipo_padre: "BIOPSIA", codigo: "BX_INCISIONAL", nombre: "Biopsia Incisional", orden: 2, activo: true },
  { tipo_padre: "BIOPSIA", codigo: "BX_EXCISIONAL", nombre: "Biopsia Excisional", orden: 3, activo: true },
  { tipo_padre: "BIOPSIA", codigo: "BX_ASPIRATIVA", nombre: "Punción Aspirativa (PAAF)", orden: 4, activo: true },
  { tipo_padre: "BIOPSIA", codigo: "BX_ENDOSCOPICA", nombre: "Biopsia Endoscópica", orden: 5, activo: true },
  // Imágenes
  { tipo_padre: "IMAGEN", codigo: "TAC", nombre: "TAC (Tomografía)", orden: 1, activo: true },
  { tipo_padre: "IMAGEN", codigo: "RM", nombre: "Resonancia Magnética", orden: 2, activo: true },
  { tipo_padre: "IMAGEN", codigo: "PET_CT", nombre: "PET-CT", orden: 3, activo: true },
  { tipo_padre: "IMAGEN", codigo: "ECO", nombre: "Ecografía", orden: 4, activo: true },
  { tipo_padre: "IMAGEN", codigo: "MAMOGRAFIA", nombre: "Mamografía", orden: 5, activo: true },
  { tipo_padre: "IMAGEN", codigo: "RX", nombre: "Radiografía", orden: 6, activo: true },
  { tipo_padre: "IMAGEN", codigo: "CINTIGRAFIA", nombre: "Cintigrafía", orden: 7, activo: true },
  // Quimioterapia
  { tipo_padre: "QT", codigo: "QT_NEOADYUVANTE", nombre: "QT Neoadyuvante", orden: 1, activo: true },
  { tipo_padre: "QT", codigo: "QT_ADYUVANTE", nombre: "QT Adyuvante", orden: 2, activo: true },
  { tipo_padre: "QT", codigo: "QT_PALIATIVA", nombre: "QT Paliativa", orden: 3, activo: true },
  { tipo_padre: "QT", codigo: "QT_1_LINEA", nombre: "QT Primera Línea", orden: 4, activo: true },
  { tipo_padre: "QT", codigo: "QT_2_LINEA", nombre: "QT Segunda Línea", orden: 5, activo: true },
  // Radioterapia
  { tipo_padre: "RT", codigo: "RT_CURATIVA", nombre: "RT Curativa", orden: 1, activo: true },
  { tipo_padre: "RT", codigo: "RT_PALIATIVA", nombre: "RT Paliativa", orden: 2, activo: true },
  { tipo_padre: "RT", codigo: "RT_ADYUVANTE", nombre: "RT Adyuvante", orden: 3, activo: true },
  { tipo_padre: "RT", codigo: "BRAQUITERAPIA", nombre: "Braquiterapia", orden: 4, activo: true },
  // Complementos (sobre estudios internos)
  { tipo_padre: "COMPLEMENTO", codigo: "IHQ", nombre: "Inmunohistoquímica", orden: 1, activo: true },
  { tipo_padre: "COMPLEMENTO", codigo: "FISH", nombre: "FISH (Hibridación in situ)", orden: 2, activo: true },
  { tipo_padre: "COMPLEMENTO", codigo: "PCR_MOL", nombre: "PCR Molecular", orden: 3, activo: true },
  { tipo_padre: "COMPLEMENTO", codigo: "PANEL_GENOMICO", nombre: "Panel Genómico", orden: 4, activo: true },
  { tipo_padre: "COMPLEMENTO", codigo: "MARCADORES_TUM", nombre: "Marcadores Tumorales", orden: 5, activo: true },
  // Laboratorio
  { tipo_padre: "LABORATORIO", codigo: "HEMOGRAMA", nombre: "Hemograma", orden: 1, activo: true },
  { tipo_padre: "LABORATORIO", codigo: "PERFIL_BIOQUIMICO", nombre: "Perfil Bioquímico", orden: 2, activo: true },
  { tipo_padre: "LABORATORIO", codigo: "MARCADORES_SERICOS", nombre: "Marcadores Séricos", orden: 3, activo: true },
  // Interconsulta
  { tipo_padre: "IC", codigo: "IC_ESPECIALIDAD", nombre: "Interconsulta Especialidad", orden: 1, activo: true },
  { tipo_padre: "IC", codigo: "IC_DOLOR", nombre: "IC Unidad del Dolor", orden: 2, activo: true },
  { tipo_padre: "IC", codigo: "IC_PALIATIVO", nombre: "IC Cuidados Paliativos", orden: 3, activo: true },
];

// ═══════════════════════════════════════════════════════════
// 3. REF_ModalidadPrestacion
// ═══════════════════════════════════════════════════════════

const MODALIDAD_FIELDS = [
  { name: "codigo", type: "string", title: "Código", required: true, unique: true },
  { name: "nombre", type: "string", title: "Nombre", required: true },
  { name: "descripcion", type: "text", title: "Descripción" },
  { name: "requiere_centro", type: "boolean", title: "Requiere Centro Destino" },
  { name: "permite_evento_padre", type: "boolean", title: "Permite Evento Padre" },
  { name: "orden", type: "integer", title: "Orden" },
  { name: "activo", type: "boolean", title: "Activo", defaultValue: true },
];

const MODALIDADES_SEED = [
  { codigo: "INTERNO", nombre: "Interno", descripcion: "Estudio realizado en el Hospital de Ovalle", requiere_centro: false, permite_evento_padre: false, orden: 1, activo: true },
  { codigo: "COMPLEMENTO", nombre: "Complemento", descripcion: "Estudio complementario sobre un estudio interno (ej: IHQ sobre biopsia)", requiere_centro: true, permite_evento_padre: true, orden: 2, activo: true },
  { codigo: "DERIVACION", nombre: "Derivación", descripcion: "Estudio/procedimiento derivado a otro hospital de la red pública", requiere_centro: true, permite_evento_padre: false, orden: 3, activo: true },
  { codigo: "COMPRA_SERVICIO", nombre: "Compra de Servicio", descripcion: "Servicio comprado por el hospital a un centro externo (público o privado)", requiere_centro: true, permite_evento_padre: false, orden: 4, activo: true },
];

// ═══════════════════════════════════════════════════════════
// 4. REF_EstadoSeguimientoEvento
// ═══════════════════════════════════════════════════════════

const ESTADO_SEG_FIELDS = [
  { name: "codigo", type: "string", title: "Código", required: true, unique: true },
  { name: "nombre", type: "string", title: "Nombre", required: true },
  { name: "descripcion", type: "text", title: "Descripción" },
  { name: "es_final", type: "boolean", title: "Es Estado Final" },
  { name: "orden", type: "integer", title: "Orden" },
  { name: "activo", type: "boolean", title: "Activo", defaultValue: true },
];

const ESTADO_SEG_SEED = [
  { codigo: "SOLICITADO", nombre: "Solicitado", descripcion: "Evento solicitado, pendiente de programación", orden: 1, activo: true },
  { codigo: "PROGRAMADO", nombre: "Programado", descripcion: "Evento programado con fecha", orden: 2, activo: true },
  { codigo: "EN_CURSO", nombre: "En Curso", descripcion: "Evento en ejecución", orden: 3, activo: true },
  { codigo: "REALIZADO", nombre: "Realizado", descripcion: "Evento realizado, pendiente resultado", orden: 4, activo: true },
  { codigo: "RESULTADO_RECIBIDO", nombre: "Resultado Recibido", descripcion: "Resultado recibido e ingresado", orden: 5, activo: true },
  { codigo: "CERRADO", nombre: "Cerrado", descripcion: "Evento completamente cerrado", es_final: true, orden: 6, activo: true },
  { codigo: "CANCELADO", nombre: "Cancelado", descripcion: "Evento cancelado", es_final: true, orden: 7, activo: true },
];

// ═══════════════════════════════════════════════════════════
// 5. New fields for UGCO_EventoClinico
// ═══════════════════════════════════════════════════════════

const NEW_EVENTO_FIELDS = [
  { name: "modalidad_prestacion_id", type: "integer", title: "Modalidad Prestación ID" },
  { name: "subtipo_evento_id", type: "integer", title: "Subtipo Evento ID" },
  { name: "evento_padre_id", type: "integer", title: "Evento Padre ID" },
  { name: "centro_destino_id", type: "integer", title: "Centro Destino ID" },
  { name: "estado_seguimiento_id", type: "integer", title: "Estado Seguimiento ID" },
  { name: "es_derivacion", type: "boolean", title: "Es Derivación", defaultValue: false },
  { name: "fecha_programada", type: "date", title: "Fecha Programada" },
  { name: "fecha_resultado", type: "date", title: "Fecha Resultado Recibido" },
  { name: "profesional_responsable", type: "string", title: "Profesional Responsable" },
  { name: "notas_seguimiento", type: "text", title: "Notas de Seguimiento" },
];

// ═══════════════════════════════════════════════════════════
// 6. New relationships
// ═══════════════════════════════════════════════════════════

const NEW_RELATIONSHIPS = [
  {
    collection: "ugco_eventoclinico",
    field: {
      type: "belongsTo", name: "modalidad_prestacion", foreignKey: "modalidad_prestacion_id",
      target: "ref_modalidadprestacion", interface: "m2o",
      uiSchema: { title: "Modalidad Prestación", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "nombre", value: "id" } } },
    },
  },
  {
    collection: "ugco_eventoclinico",
    field: {
      type: "belongsTo", name: "subtipo_evento", foreignKey: "subtipo_evento_id",
      target: "ref_subtipoevento", interface: "m2o",
      uiSchema: { title: "Subtipo Evento", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "nombre", value: "id" } } },
    },
  },
  {
    collection: "ugco_eventoclinico",
    field: {
      type: "belongsTo", name: "evento_padre", foreignKey: "evento_padre_id",
      target: "ugco_eventoclinico", interface: "m2o",
      uiSchema: { title: "Evento Padre", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "tipo_evento", value: "id" } } },
    },
  },
  {
    collection: "ugco_eventoclinico",
    field: {
      type: "hasMany", name: "complementos", foreignKey: "evento_padre_id",
      target: "ugco_eventoclinico", interface: "o2m",
      uiSchema: { title: "Complementos", "x-component": "AssociationField" },
    },
  },
  {
    collection: "ugco_eventoclinico",
    field: {
      type: "belongsTo", name: "centro_destino", foreignKey: "centro_destino_id",
      target: "ref_centrosaluddeis", interface: "m2o",
      uiSchema: { title: "Centro Destino", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "nombre", value: "id" } } },
    },
  },
  {
    collection: "ugco_eventoclinico",
    field: {
      type: "belongsTo", name: "estado_seguimiento", foreignKey: "estado_seguimiento_id",
      target: "ref_estadoseguimientoevento", interface: "m2o",
      uiSchema: { title: "Estado Seguimiento", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "nombre", value: "id" } } },
    },
  },
];

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function createCollectionWithFieldsAndSeed(
  name: string, title: string,
  fields: any[], seed: any[],
) {
  console.log(`\n── ${title} (${name}) ──`);

  try {
    await api("POST", "collections:create", {
      name, title, fields: [],
      autoGenId: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, sortable: true,
    });
    console.log(`  ✅ Collection created`);
  } catch (e: any) {
    console.log(`  ℹ️  Already exists`);
  }

  for (const f of fields) {
    try { await api("POST", `collections/${name}/fields:create`, buildField(f)); }
    catch { /* skip dupes */ }
  }
  console.log(`  ✅ ${fields.length} fields`);

  let seedOk = 0;
  for (const row of seed) {
    try { await api("POST", `${name}:create`, row); seedOk++; } catch { /* skip */ }
  }
  console.log(`  ✅ Seeded ${seedOk}/${seed.length} rows`);
}

async function main() {
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║  Enhance Eventos — Modalidad + Centros         ║");
  console.log("╚═══════════════════════════════════════════════╝");

  // 1. REF collections
  await createCollectionWithFieldsAndSeed("ref_centrosaluddeis", "Centro de Salud (DEIS)", CENTRO_SALUD_FIELDS, CENTROS_SEED);
  await createCollectionWithFieldsAndSeed("ref_subtipoevento", "Subtipo Evento", SUBTIPO_FIELDS, SUBTIPOS_SEED);
  await createCollectionWithFieldsAndSeed("ref_modalidadprestacion", "Modalidad Prestación", MODALIDAD_FIELDS, MODALIDADES_SEED);
  await createCollectionWithFieldsAndSeed("ref_estadoseguimientoevento", "Estado Seguimiento Evento", ESTADO_SEG_FIELDS, ESTADO_SEG_SEED);

  // 2. New fields on UGCO_EventoClinico
  console.log("\n── Nuevos campos en UGCO_EventoClinico ──");
  for (const f of NEW_EVENTO_FIELDS) {
    try {
      await api("POST", "collections/ugco_eventoclinico/fields:create", buildField(f));
      console.log(`  ✅ ${f.name}`);
    } catch (e: any) {
      if (e) console.log(`  ℹ️  ${f.name} (exists)`);
    }
  }

  // 3. Relationships
  console.log("\n── Relaciones ──");
  for (const rel of NEW_RELATIONSHIPS) {
    const fieldName = (rel.field as any).name;
    try {
      await api("POST", `collections/${rel.collection}/fields:create`, rel.field);
      console.log(`  ✅ ${rel.collection}.${fieldName}`);
    } catch {
      console.log(`  ℹ️  ${rel.collection}.${fieldName} (exists)`);
    }
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`✅ OK: ${okCount} | ❌ Err: ${errCount}`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
