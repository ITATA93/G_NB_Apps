/**
 * Add UGCO_ObservacionEvento (audit trail) + replace generic roles with operational ones
 *
 * 1. Creates UGCO_ObservacionEvento (append-only event log)
 * 2. Deletes old generic roles
 * 3. Creates 9 operational roles per unit manual
 * 4. Configures ACL permissions per role
 *
 * Usage: npx tsx Apps/UGCO/scripts/nocobase/add-observaciones-and-roles.ts
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
    if (text.includes("already exists") || text.includes("duplicate") || text.includes("not found")) return null;
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  okCount++;
  return text ? JSON.parse(text) : {};
}

function buildField(f: { name: string; type: string; title: string; required?: boolean; unique?: boolean; defaultValue?: any }): object {
  const iface = ({ string: "input", text: "textarea", integer: "integer", boolean: "checkbox", date: "datetime", dateOnly: "date" } as any)[f.type] || "input";
  const comp = ({ string: "Input", text: "Input.TextArea", integer: "InputNumber", boolean: "Checkbox", date: "DatePicker", dateOnly: "DatePicker" } as any)[f.type] || "Input";
  const base: any = {
    name: f.name, type: f.type === "dateOnly" ? "dateOnly" : f.type, interface: iface,
    uiSchema: { title: f.title, type: f.type === "boolean" ? "boolean" : f.type === "integer" ? "number" : "string", "x-component": comp },
  };
  if (f.required) base.required = true;
  if (f.unique) base.unique = true;
  if (f.defaultValue !== undefined) base.defaultValue = f.defaultValue;
  return base;
}

// ═══════════════════════════════════════════════════════════
// PART 1 — UGCO_ObservacionEvento
// ═══════════════════════════════════════════════════════════

const OBS_FIELDS = [
  { name: "evento_id", type: "integer", title: "Evento ID", required: true },
  { name: "caso_id", type: "integer", title: "Caso ID" },
  { name: "texto", type: "text", title: "Observación", required: true },
  { name: "fecha_observacion", type: "date", title: "Fecha Observación" },
  { name: "autor", type: "string", title: "Autor" },
];

const OBS_RELATIONSHIPS = [
  {
    collection: "ugco_observacionevento",
    field: {
      type: "belongsTo", name: "evento", foreignKey: "evento_id",
      target: "ugco_eventoclinico", interface: "m2o",
      uiSchema: { title: "Evento", "x-component": "AssociationField", "x-component-props": { fieldNames: { label: "tipo_evento", value: "id" } } },
    },
  },
  {
    collection: "ugco_observacionevento",
    field: {
      type: "belongsTo", name: "caso", foreignKey: "caso_id",
      target: "ugco_casooncologico", interface: "m2o",
      uiSchema: { title: "Caso", "x-component": "AssociationField" },
    },
  },
  // hasMany from EventoClinico
  {
    collection: "ugco_eventoclinico",
    field: {
      type: "hasMany", name: "observaciones", foreignKey: "evento_id",
      target: "ugco_observacionevento", interface: "o2m",
      uiSchema: { title: "Observaciones", "x-component": "AssociationField" },
    },
  },
  // hasMany from CasoOncologico
  {
    collection: "ugco_casooncologico",
    field: {
      type: "hasMany", name: "observaciones_eventos", foreignKey: "caso_id",
      target: "ugco_observacionevento", interface: "o2m",
      uiSchema: { title: "Observaciones Eventos", "x-component": "AssociationField" },
    },
  },
];

// ═══════════════════════════════════════════════════════════
// PART 2 — OPERATIONAL ROLES (per unit manual)
// ═══════════════════════════════════════════════════════════

// Old generic roles to delete
const OLD_ROLES = [
  "admin_ugco", "medico_oncologo", "coordinador_ugco",
  "enfermera_ugco", "enfermera_gestora_onco",
];

// New operational roles
const NEW_ROLES = [
  // Jefatura
  { name: "ugco_enfermera_jefe", title: "UGCO — Enfermera Jefe", description: "Máxima autoridad enfermería UGCO. Acceso completo + configuración." },
  { name: "ugco_medico_jefe", title: "UGCO — Médico Jefe", description: "Máxima autoridad médica UGCO. Acceso completo + configuración." },
  { name: "ugco_enfermera_subrogante", title: "UGCO — Enfermera Subrogante", description: "Suplente de Enfermera Jefe. Mismo acceso." },
  { name: "ugco_medico_subrogante", title: "UGCO — Médico Subrogante", description: "Suplente de Médico Jefe. Mismo acceso." },
  // Operativo clínico
  { name: "ugco_enfermera_gestora", title: "UGCO — Enfermera Gestora", description: "Seguimiento de casos de sus especialidades asignadas." },
  { name: "ugco_medico_referente", title: "UGCO — Médico Referente", description: "Atiende pacientes de su especialidad." },
  { name: "ugco_medico_ref_tecnico", title: "UGCO — Médico Ref. Técnico", description: "Vigila todo el proceso transversalmente." },
  // Operativo administrativo
  { name: "ugco_tens_gestora", title: "UGCO — TENS Gestora", description: "Gestiona exámenes y compra de servicio." },
  { name: "ugco_administrativa", title: "UGCO — Administrativa", description: "Citaciones, tareas/pendientes. No edita datos clínicos." },
];

// ═══════════════════════════════════════════════════════════
// PART 3 — ACL PERMISSIONS
// ═══════════════════════════════════════════════════════════

const ALL_UGCO = [
  "ugco_casooncologico", "ugco_eventoclinico", "ugco_casoespecialidad",
  "ugco_tarea", "ugco_documentocaso", "ugco_contactopaciente",
  "ugco_personasignificativa", "ugco_equiposeguimiento", "ugco_equipomiembro",
  "ugco_comiteoncologico", "ugco_comitecaso", "ugco_observacionevento",
];
const ALL_REF = [
  "ref_oncoespecialidad", "ref_oncoestadocaso", "ref_oncoestadoclinico",
  "ref_oncoestadoadm", "ref_oncointenciontrat", "ref_oncotipoactividad",
  "ref_oncoestadoactividad", "ref_cie10", "ref_oncodiagnostico",
  "ref_oncomorfologiaicdo", "ref_oncotopografiaicdo", "ref_oncoestadio",
  "ref_oncotnm_t", "ref_oncotnm_m", "ref_oncofigo",
  "ref_oncogradohistologico", "ref_oncoetapificacion", "ref_oncobasediagnostico",
  "ref_oncoecog", "ref_oncotipodocumento",
  "ref_centrosaluddeis", "ref_subtipoevento", "ref_modalidadprestacion",
  "ref_estadoseguimientoevento",
];
const ALL_ALMA = [
  "alma_paciente", "alma_episodio", "alma_diagnostico",
  "alma_interconsulta", "alma_ordenexamen",
];

type Acts = string[];
const FULL: Acts = ["list", "get", "create", "update", "destroy"];
const CRUD: Acts = ["list", "get", "create", "update"];
const READ: Acts = ["list", "get"];
const CREATE_READ: Acts = ["list", "get", "create"];

interface RolePerm {
  role: string;
  grants: { collections: string[]; actions: Acts }[];
}

const ROLE_PERMS: RolePerm[] = [
  // ── Jefatura (full access) ──
  ...(["ugco_enfermera_jefe", "ugco_medico_jefe", "ugco_enfermera_subrogante", "ugco_medico_subrogante"].map(role => ({
    role,
    grants: [
      { collections: [...ALL_UGCO, ...ALL_REF], actions: FULL },
      { collections: ALL_ALMA, actions: READ },
    ],
  }))),
  // ── Enfermera Gestora ──
  {
    role: "ugco_enfermera_gestora",
    grants: [
      { collections: ["ugco_casooncologico", "ugco_eventoclinico", "ugco_casoespecialidad", "ugco_contactopaciente", "ugco_personasignificativa", "ugco_documentocaso"], actions: CRUD },
      { collections: ["ugco_tarea", "ugco_observacionevento"], actions: CRUD },
      { collections: ["ugco_comiteoncologico", "ugco_comitecaso"], actions: CRUD },
      { collections: ["ugco_equiposeguimiento", "ugco_equipomiembro"], actions: READ },
      { collections: ALL_REF, actions: READ },
      { collections: ALL_ALMA, actions: READ },
    ],
  },
  // ── Médico Referente ──
  {
    role: "ugco_medico_referente",
    grants: [
      { collections: ["ugco_casooncologico", "ugco_eventoclinico", "ugco_casoespecialidad"], actions: FULL },
      { collections: ["ugco_tarea", "ugco_observacionevento", "ugco_documentocaso"], actions: CRUD },
      { collections: ["ugco_comiteoncologico", "ugco_comitecaso"], actions: CRUD },
      { collections: ["ugco_contactopaciente", "ugco_personasignificativa"], actions: CRUD },
      { collections: ["ugco_equiposeguimiento", "ugco_equipomiembro"], actions: READ },
      { collections: ALL_REF, actions: READ },
      { collections: ALL_ALMA, actions: READ },
    ],
  },
  // ── Médico Ref. Técnico (reads everything, can intervene) ──
  {
    role: "ugco_medico_ref_tecnico",
    grants: [
      { collections: ALL_UGCO, actions: CRUD },
      { collections: ALL_REF, actions: READ },
      { collections: ALL_ALMA, actions: READ },
    ],
  },
  // ── TENS Gestora (exámenes y compras, no edita casos clínicos directamente) ──
  {
    role: "ugco_tens_gestora",
    grants: [
      { collections: ["ugco_eventoclinico", "ugco_observacionevento", "ugco_documentocaso"], actions: CRUD },
      { collections: ["ugco_tarea"], actions: CRUD },
      { collections: ["ugco_casooncologico", "ugco_casoespecialidad", "ugco_contactopaciente", "ugco_personasignificativa"], actions: READ },
      { collections: ["ugco_comiteoncologico", "ugco_comitecaso"], actions: READ },
      { collections: ["ugco_equiposeguimiento", "ugco_equipomiembro"], actions: READ },
      { collections: ALL_REF, actions: READ },
      { collections: ALL_ALMA, actions: READ },
    ],
  },
  // ── Administrativa (tareas/pendientes y citaciones, NO datos clínicos) ──
  {
    role: "ugco_administrativa",
    grants: [
      { collections: ["ugco_tarea", "ugco_observacionevento"], actions: CREATE_READ },
      { collections: ["ugco_casooncologico", "ugco_eventoclinico"], actions: READ },
      { collections: ["ugco_contactopaciente", "ugco_personasignificativa"], actions: READ },
      { collections: ["ugco_documentocaso", "ugco_casoespecialidad", "ugco_comiteoncologico", "ugco_comitecaso", "ugco_equiposeguimiento", "ugco_equipomiembro"], actions: READ },
      { collections: ALL_REF, actions: READ },
      { collections: ALL_ALMA, actions: READ },
    ],
  },
];

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║  Observaciones + Roles Operacionales           ║");
  console.log("╚═══════════════════════════════════════════════╝");

  // ── PART 1: UGCO_ObservacionEvento ──
  console.log("\n── 1. UGCO_ObservacionEvento ──");
  try {
    await api("POST", "collections:create", {
      name: "ugco_observacionevento", title: "Observación de Evento",
      fields: [], autoGenId: true, createdAt: true, updatedAt: true, createdBy: true, updatedBy: true, sortable: true,
    });
    console.log("  ✅ Collection created");
  } catch { console.log("  ℹ️  Already exists"); }

  for (const f of OBS_FIELDS) {
    try { await api("POST", "collections/ugco_observacionevento/fields:create", buildField(f)); } catch {}
  }
  console.log(`  ✅ ${OBS_FIELDS.length} fields`);

  for (const rel of OBS_RELATIONSHIPS) {
    const name = (rel.field as any).name;
    try {
      await api("POST", `collections/${rel.collection}/fields:create`, rel.field);
      console.log(`  ✅ ${rel.collection}.${name}`);
    } catch { console.log(`  ℹ️  ${rel.collection}.${name} exists`); }
  }

  // ── PART 2: Delete old roles, create new ──
  console.log("\n── 2. Roles ──");

  // Delete old generic roles
  for (const old of OLD_ROLES) {
    try {
      await api("POST", `roles:destroy?filterByTk=${old}`, {});
      console.log(`  🗑️  Deleted: ${old}`);
    } catch { console.log(`  ℹ️  ${old} (not found)`); }
  }

  // Create new operational roles
  for (const role of NEW_ROLES) {
    try {
      await api("POST", "roles:create", role);
      console.log(`  ✅ ${role.name}`);
    } catch { console.log(`  ℹ️  ${role.name} exists`); }
  }

  // ── PART 3: ACL Permissions ──
  console.log("\n── 3. ACL Permissions ──");
  for (const rp of ROLE_PERMS) {
    let grantCount = 0;
    for (const grant of rp.grants) {
      for (const col of grant.collections) {
        // Create resource
        try { await api("POST", `roles/${rp.role}/resources:create`, { name: col, usingActionsConfig: true }); } catch {}

        for (const action of grant.actions) {
          try {
            await api("POST", `roles/${rp.role}/resources/${col}/actions:create`, { name: action });
            grantCount++;
          } catch {}
        }
      }
    }
    console.log(`  ✅ ${rp.role}: ${grantCount} grants`);
  }

  // ── PART 4: RLS for observaciones (append-only: no update/destroy for non-jefatura) ──
  console.log("\n── 4. RLS: Observaciones append-only ──");
  const appendOnlyRoles = [
    "ugco_enfermera_gestora", "ugco_medico_referente", "ugco_medico_ref_tecnico",
    "ugco_tens_gestora", "ugco_administrativa",
  ];
  for (const role of appendOnlyRoles) {
    try {
      await api("POST", `roles/${role}/resources:update?filterByTk=ugco_observacionevento`, {
        name: "ugco_observacionevento",
        usingConfig: "individual",
        actions: [
          { name: "list" },
          { name: "get" },
          { name: "create" },
          // NO update, NO destroy — append only
        ],
      });
      console.log(`  ✅ ${role}: observaciones = append-only`);
    } catch (e: any) {
      console.log(`  ❌ ${role}: ${e.message?.slice(0, 100)}`);
    }
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`✅ OK: ${okCount} | ❌ Err: ${errCount}`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
