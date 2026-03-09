/**
 * Clean ACL fix — delete ALL existing resources per role, then recreate with correct actions.
 *
 * Previous scripts created duplicate resources per collection. This script:
 * 1. Deletes ALL existing resources for each UGCO role
 * 2. Creates fresh resources with correct actions (by numeric ID)
 *
 * Usage: npx tsx Apps/UGCO/scripts/nocobase/fix-acl-clean.ts
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
    if (text.includes("already exists") || text.includes("duplicate")) return null;
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  }
  okCount++;
  return text ? JSON.parse(text) : {};
}

// ═══════════════════════════════════════════════════════════
// COLLECTIONS
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

// ═══════════════════════════════════════════════════════════
// ACTION PRESETS
// ═══════════════════════════════════════════════════════════

type Act = { name: string; fields?: string[]; scope?: object };
const FULL: Act[] = [{ name: "list" }, { name: "get" }, { name: "create" }, { name: "update" }, { name: "destroy" }];
const CRUD: Act[] = [{ name: "list" }, { name: "get" }, { name: "create" }, { name: "update" }];
const READ: Act[] = [{ name: "list" }, { name: "get" }];
const CREATE_READ: Act[] = [{ name: "list" }, { name: "get" }, { name: "create" }];
const APPEND_ONLY: Act[] = [{ name: "list" }, { name: "get" }, { name: "create" }];

// ═══════════════════════════════════════════════════════════
// GRANT MAP
// ═══════════════════════════════════════════════════════════

interface Grant { collection: string; actions: Act[] }

function expand(cols: string[], acts: Act[]): Grant[] {
  return cols.map(c => ({ collection: c, actions: acts }));
}

function mergeGrants(grants: Grant[]): Map<string, Act[]> {
  const m = new Map<string, Act[]>();
  for (const g of grants) {
    const ex = m.get(g.collection) || [];
    for (const a of g.actions) {
      if (!ex.find(e => e.name === a.name)) ex.push(a);
    }
    m.set(g.collection, ex);
  }
  return m;
}

const ROLES: { role: string; grants: Grant[] }[] = [
  // Jefatura
  ...["ugco_enfermera_jefe", "ugco_medico_jefe", "ugco_enfermera_subrogante", "ugco_medico_subrogante"].map(r => ({
    role: r,
    grants: [...expand([...ALL_UGCO, ...ALL_REF], FULL), ...expand(ALL_ALMA, READ)],
  })),
  // Enfermera Gestora
  {
    role: "ugco_enfermera_gestora",
    grants: [
      ...expand(["ugco_casooncologico", "ugco_eventoclinico", "ugco_casoespecialidad", "ugco_contactopaciente", "ugco_personasignificativa", "ugco_documentocaso"], CRUD),
      ...expand(["ugco_tarea"], CRUD),
      ...expand(["ugco_observacionevento"], APPEND_ONLY),
      ...expand(["ugco_comiteoncologico", "ugco_comitecaso"], CRUD),
      ...expand(["ugco_equiposeguimiento", "ugco_equipomiembro"], READ),
      ...expand(ALL_REF, READ), ...expand(ALL_ALMA, READ),
    ],
  },
  // Médico Referente
  {
    role: "ugco_medico_referente",
    grants: [
      ...expand(["ugco_casooncologico", "ugco_eventoclinico", "ugco_casoespecialidad"], FULL),
      ...expand(["ugco_tarea", "ugco_documentocaso"], CRUD),
      ...expand(["ugco_observacionevento"], APPEND_ONLY),
      ...expand(["ugco_comiteoncologico", "ugco_comitecaso"], CRUD),
      ...expand(["ugco_contactopaciente", "ugco_personasignificativa"], CRUD),
      ...expand(["ugco_equiposeguimiento", "ugco_equipomiembro"], READ),
      ...expand(ALL_REF, READ), ...expand(ALL_ALMA, READ),
    ],
  },
  // Médico Ref. Técnico
  {
    role: "ugco_medico_ref_tecnico",
    grants: [
      ...expand(ALL_UGCO.filter(c => c !== "ugco_observacionevento"), CRUD),
      ...expand(["ugco_observacionevento"], APPEND_ONLY),
      ...expand(ALL_REF, READ), ...expand(ALL_ALMA, READ),
    ],
  },
  // TENS Gestora
  {
    role: "ugco_tens_gestora",
    grants: [
      ...expand(["ugco_eventoclinico", "ugco_documentocaso"], CRUD),
      ...expand(["ugco_tarea"], CRUD),
      ...expand(["ugco_observacionevento"], APPEND_ONLY),
      ...expand(["ugco_casooncologico", "ugco_casoespecialidad", "ugco_contactopaciente", "ugco_personasignificativa"], READ),
      ...expand(["ugco_comiteoncologico", "ugco_comitecaso"], READ),
      ...expand(["ugco_equiposeguimiento", "ugco_equipomiembro"], READ),
      ...expand(ALL_REF, READ), ...expand(ALL_ALMA, READ),
    ],
  },
  // Administrativa
  {
    role: "ugco_administrativa",
    grants: [
      ...expand(["ugco_tarea"], CREATE_READ),
      ...expand(["ugco_observacionevento"], APPEND_ONLY),
      ...expand(["ugco_casooncologico", "ugco_eventoclinico"], READ),
      ...expand(["ugco_contactopaciente", "ugco_personasignificativa"], READ),
      ...expand(["ugco_documentocaso", "ugco_casoespecialidad", "ugco_comiteoncologico", "ugco_comitecaso", "ugco_equiposeguimiento", "ugco_equipomiembro"], READ),
      ...expand(ALL_REF, READ), ...expand(ALL_ALMA, READ),
    ],
  },
];

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║  Clean ACL: delete dupes → create fresh       ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  for (const { role, grants } of ROLES) {
    const merged = mergeGrants(grants);

    // Step 1: Delete ALL existing resources for this role
    const listRes = await api("GET", `roles/${role}/resources:list?pageSize=500`);
    const existing = listRes?.data || [];
    if (existing.length > 0) {
      const ids = existing.map((r: any) => r.id);
      // Delete in batches
      for (const id of ids) {
        try {
          await api("POST", `roles/${role}/resources:destroy?filterByTk=${id}`, {});
        } catch { /* ignore */ }
      }
      console.log(`  🗑️  ${role}: deleted ${ids.length} old resources`);
    }

    // Step 2: Create fresh resources with actions
    let actionCount = 0;
    for (const [collection, actions] of merged) {
      try {
        // Create resource
        const created = await api("POST", `roles/${role}/resources:create`, {
          name: collection,
          usingActionsConfig: true,
        });
        const resourceId = created?.data?.id;
        if (!resourceId) {
          console.error(`  ❌ ${role}/${collection}: no ID returned`);
          errCount++;
          continue;
        }

        // Update with actions by numeric ID
        await api("POST", `roles/${role}/resources:update?filterByTk=${resourceId}`, {
          usingActionsConfig: true,
          actions,
        });
        actionCount += actions.length;
      } catch (e: any) {
        console.error(`  ❌ ${role}/${collection}: ${e.message.slice(0, 150)}`);
        errCount++;
      }
    }

    console.log(`  ✅ ${role}: ${actionCount} actions across ${merged.size} collections`);
  }

  // Verify one role
  console.log("\n── Verification ──");
  const check = await api("GET", "roles/ugco_administrativa/resources:list?pageSize=50&appends[]=actions");
  const resources = check?.data || [];
  const withActions = resources.filter((r: any) => r.actions?.length > 0);
  console.log(`  ugco_administrativa: ${resources.length} resources, ${withActions.length} with actions`);
  const caso = resources.find((r: any) => r.name === "ugco_casooncologico");
  if (caso) console.log(`  ugco_casooncologico: [${caso.actions.map((a: any) => a.name).join(", ")}]`);
  const obs = resources.find((r: any) => r.name === "ugco_observacionevento");
  if (obs) console.log(`  ugco_observacionevento: [${obs.actions.map((a: any) => a.name).join(", ")}]`);

  console.log(`\n${"═".repeat(50)}`);
  console.log(`✅ OK: ${okCount} | ❌ Err: ${errCount}`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
