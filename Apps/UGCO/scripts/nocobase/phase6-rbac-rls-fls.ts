/**
 * Phase 6+7 — RBAC roles + RLS (scope filters) + FLS (field-level security)
 * UGCO rebuild from scratch
 *
 * Usage: npx tsx Apps/UGCO/scripts/nocobase/phase6-rbac-rls-fls.ts
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
  const text = await res.text();
  if (!res.ok) {
    if (text.includes("already exists") || text.includes("duplicate")) { return null; }
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  }
  okCount++;
  return text ? JSON.parse(text) : {};
}

// ═══════════════════════════════════════════════════════════
// PART A — RBAC ROLES
// ═══════════════════════════════════════════════════════════

const ROLES = [
  { name: "admin_ugco", title: "Administrador UGCO", description: "Acceso completo a todas las colecciones UGCO" },
  { name: "medico_oncologo", title: "Médico Oncólogo", description: "CRUD casos, episodios, eventos; lectura catálogos" },
  { name: "coordinador_ugco", title: "Coordinador UGCO", description: "CRUD en todo excepto configuración" },
  { name: "enfermera_ugco", title: "Enfermera UGCO", description: "CRUD casos/eventos/tareas; lectura catálogos" },
  { name: "enfermera_gestora_onco", title: "Enfermera Gestora Oncología", description: "CRUD completo excepto eliminar casos" },
];

// ═══════════════════════════════════════════════════════════
// PART B — ACL (permissions per role per collection)
// ═══════════════════════════════════════════════════════════

// All UGCO and REF collections
const UGCO_COLLECTIONS = [
  "ugco_casooncologico", "ugco_eventoclinico", "ugco_casoespecialidad",
  "ugco_tarea", "ugco_documentocaso", "ugco_contactopaciente",
  "ugco_personasignificativa", "ugco_equiposeguimiento", "ugco_equipomiembro",
  "ugco_comiteoncologico", "ugco_comitecaso",
];

const REF_COLLECTIONS = [
  "ref_oncoespecialidad", "ref_oncoestadocaso", "ref_oncoestadoclinico",
  "ref_oncoestadoadm", "ref_oncointenciontrat", "ref_oncotipoactividad",
  "ref_oncoestadoactividad", "ref_cie10", "ref_oncodiagnostico",
  "ref_oncomorfologiaicdo", "ref_oncotopografiaicdo", "ref_oncoestadio",
  "ref_oncotnm_t", "ref_oncotnm_m", "ref_oncofigo",
  "ref_oncogradohistologico", "ref_oncoetapificacion", "ref_oncobasediagnostico",
  "ref_oncoecog", "ref_oncotipodocumento",
];

const ALMA_COLLECTIONS = [
  "alma_paciente", "alma_episodio", "alma_diagnostico",
  "alma_interconsulta", "alma_ordenexamen",
];

// Permission matrix: role → collections → actions
type Actions = ("list" | "get" | "create" | "update" | "destroy")[];
interface RolePerms {
  role: string;
  grants: { collections: string[]; actions: Actions }[];
}

const ALL_ACTIONS: Actions = ["list", "get", "create", "update", "destroy"];
const READ_ONLY: Actions = ["list", "get"];
const CRUD_NO_DELETE: Actions = ["list", "get", "create", "update"];

const ROLE_PERMS: RolePerms[] = [
  {
    role: "admin_ugco",
    grants: [
      { collections: [...UGCO_COLLECTIONS, ...REF_COLLECTIONS], actions: ALL_ACTIONS },
      { collections: ALMA_COLLECTIONS, actions: READ_ONLY },
    ],
  },
  {
    role: "medico_oncologo",
    grants: [
      { collections: ["ugco_casooncologico", "ugco_eventoclinico", "ugco_casoespecialidad", "ugco_comitecaso"], actions: ALL_ACTIONS },
      { collections: ["ugco_tarea", "ugco_documentocaso", "ugco_contactopaciente", "ugco_personasignificativa"], actions: CRUD_NO_DELETE },
      { collections: ["ugco_comiteoncologico"], actions: READ_ONLY },
      { collections: [...REF_COLLECTIONS, ...ALMA_COLLECTIONS], actions: READ_ONLY },
    ],
  },
  {
    role: "coordinador_ugco",
    grants: [
      { collections: UGCO_COLLECTIONS, actions: ALL_ACTIONS },
      { collections: REF_COLLECTIONS, actions: READ_ONLY },
      { collections: ALMA_COLLECTIONS, actions: READ_ONLY },
    ],
  },
  {
    role: "enfermera_ugco",
    grants: [
      { collections: ["ugco_casooncologico", "ugco_eventoclinico", "ugco_tarea", "ugco_contactopaciente", "ugco_personasignificativa"], actions: CRUD_NO_DELETE },
      { collections: ["ugco_documentocaso"], actions: ALL_ACTIONS },
      { collections: ["ugco_casoespecialidad", "ugco_comiteoncologico", "ugco_comitecaso", "ugco_equiposeguimiento", "ugco_equipomiembro"], actions: READ_ONLY },
      { collections: [...REF_COLLECTIONS, ...ALMA_COLLECTIONS], actions: READ_ONLY },
    ],
  },
  {
    role: "enfermera_gestora_onco",
    grants: [
      { collections: UGCO_COLLECTIONS.filter(c => c !== "ugco_equiposeguimiento" && c !== "ugco_equipomiembro"), actions: CRUD_NO_DELETE },
      { collections: ["ugco_equiposeguimiento", "ugco_equipomiembro"], actions: READ_ONLY },
      { collections: REF_COLLECTIONS, actions: READ_ONLY },
      { collections: ALMA_COLLECTIONS, actions: READ_ONLY },
    ],
  },
];

// ═══════════════════════════════════════════════════════════
// PART C — RLS (Row-Level Security via scope filters)
// ═══════════════════════════════════════════════════════════

// RLS: restrict what rows certain roles can see
interface RLSRule {
  role: string;
  collection: string;
  action: string;
  scope: object;  // filter applied to query
}

const RLS_RULES: RLSRule[] = [
  // Enfermera UGCO can only see active cases
  {
    role: "enfermera_ugco",
    collection: "ugco_casooncologico",
    action: "list",
    scope: { fallecido: { $ne: true } },
  },
  // Enfermera gestora — same restriction
  {
    role: "enfermera_gestora_onco",
    collection: "ugco_casooncologico",
    action: "list",
    scope: { fallecido: { $ne: true } },
  },
];

// ═══════════════════════════════════════════════════════════
// PART D — FLS (Field-Level Security)
// ═══════════════════════════════════════════════════════════

// FLS: restrict which fields can be updated by non-admin roles
interface FLSRule {
  role: string;
  collection: string;
  action: string;
  fields: string[];  // fields that ARE allowed (whitelist for update)
}

// Protected fields: estadio_clinico, codigo_cie10, diagnostico_principal, tnm_*, figo
// Only admin and médico can update these staging/diagnosis fields
const CASE_SAFE_FIELDS = [
  "estado_adm_id", "estado_seguimiento_id", "fecha_ultimo_contacto",
  "comentarios", "creado_por", "modificado_por",
];

const FLS_RULES: FLSRule[] = [
  {
    role: "enfermera_ugco",
    collection: "ugco_casooncologico",
    action: "update",
    fields: CASE_SAFE_FIELDS,
  },
  {
    role: "enfermera_gestora_onco",
    collection: "ugco_casooncologico",
    action: "update",
    fields: [...CASE_SAFE_FIELDS, "estado_clinico_id", "intencion_trat_id"],
  },
];

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║  Phase 6+7 — RBAC + RLS + FLS                 ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  // A. Create roles
  console.log("── PART A: Roles ──\n");
  for (const role of ROLES) {
    try {
      await api("POST", "roles:create", role);
      console.log(`  ✅ Role: ${role.name}`);
    } catch (e: any) {
      if (e.message.includes("already exists") || e.message.includes("duplicate")) {
        console.log(`  ℹ️  Role ${role.name} exists`);
      } else {
        console.error(`  ❌ Role ${role.name}: ${e.message}`);
        errCount++;
      }
    }
  }

  // B. ACL permissions
  console.log("\n── PART B: ACL Permissions ──\n");
  for (const rp of ROLE_PERMS) {
    let grantCount = 0;
    for (const grant of rp.grants) {
      for (const col of grant.collections) {
        for (const action of grant.actions) {
          try {
            await api("POST", `roles/${rp.role}/resources:create`, {
              name: col,
              usingActionsConfig: true,
            });
          } catch { /* ignore if exists */ }

          try {
            await api("POST", `roles/${rp.role}/resources/${col}/actions:create`, {
              name: action,
              fields: [],  // all fields by default
            });
            grantCount++;
          } catch { /* skip dupes */ }
        }
      }
    }
    console.log(`  ✅ ${rp.role}: ${grantCount} action grants`);
  }

  // C. RLS scope filters
  console.log("\n── PART C: RLS Scope Filters ──\n");
  for (const rule of RLS_RULES) {
    try {
      // Update the action with a scope filter
      await api("POST", `roles/${rule.role}/resources/${rule.collection}/actions:update?filterByTk=${rule.action}`, {
        name: rule.action,
        scope: rule.scope,
      });
      console.log(`  ✅ RLS: ${rule.role} → ${rule.collection}:${rule.action}`);
    } catch (e: any) {
      console.error(`  ❌ RLS: ${e.message}`);
      errCount++;
    }
  }

  // D. FLS field restrictions
  console.log("\n── PART D: FLS Field Restrictions ──\n");
  for (const rule of FLS_RULES) {
    try {
      await api("POST", `roles/${rule.role}/resources/${rule.collection}/actions:update?filterByTk=${rule.action}`, {
        name: rule.action,
        fields: rule.fields,
      });
      console.log(`  ✅ FLS: ${rule.role} → ${rule.collection}:${rule.action} (${rule.fields.length} fields)`);
    } catch (e: any) {
      console.error(`  ❌ FLS: ${e.message}`);
      errCount++;
    }
  }

  console.log(`\n${"═".repeat(50)}`);
  console.log(`✅ OK: ${okCount} | ❌ Err: ${errCount}`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
