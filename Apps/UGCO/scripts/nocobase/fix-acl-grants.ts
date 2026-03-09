/**
 * Fix ACL grants — uses resources:update with numeric resource ID
 *
 * The previous attempt used collection name as filterByTk which silently failed.
 * Must use the numeric resource ID.
 *
 * Usage: npx tsx Apps/UGCO/scripts/nocobase/fix-acl-grants.ts
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
// ACTION SETS
// ═══════════════════════════════════════════════════════════

type Act = { name: string; fields?: string[]; scope?: object };
const FULL: Act[] = [{ name: "list" }, { name: "get" }, { name: "create" }, { name: "update" }, { name: "destroy" }];
const CRUD: Act[] = [{ name: "list" }, { name: "get" }, { name: "create" }, { name: "update" }];
const READ: Act[] = [{ name: "list" }, { name: "get" }];
const CREATE_READ: Act[] = [{ name: "list" }, { name: "get" }, { name: "create" }];
const APPEND_ONLY: Act[] = [{ name: "list" }, { name: "get" }, { name: "create" }];

// ═══════════════════════════════════════════════════════════
// PERMISSION MAP: role → collection → actions
// ═══════════════════════════════════════════════════════════

interface Grant { collection: string; actions: Act[] }

function expand(collections: string[], actions: Act[]): Grant[] {
  return collections.map(c => ({ collection: c, actions }));
}

function mergeGrants(grants: Grant[]): Map<string, Act[]> {
  const merged = new Map<string, Act[]>();
  for (const g of grants) {
    const existing = merged.get(g.collection) || [];
    for (const act of g.actions) {
      if (!existing.find(a => a.name === act.name)) existing.push(act);
    }
    merged.set(g.collection, existing);
  }
  return merged;
}

const ROLE_GRANTS: { role: string; grants: Grant[] }[] = [
  // ── Jefatura (full access) ──
  ...["ugco_enfermera_jefe", "ugco_medico_jefe", "ugco_enfermera_subrogante", "ugco_medico_subrogante"].map(role => ({
    role,
    grants: [
      ...expand([...ALL_UGCO, ...ALL_REF], FULL),
      ...expand(ALL_ALMA, READ),
    ],
  })),
  // ── Enfermera Gestora ──
  {
    role: "ugco_enfermera_gestora",
    grants: [
      ...expand(["ugco_casooncologico", "ugco_eventoclinico", "ugco_casoespecialidad", "ugco_contactopaciente", "ugco_personasignificativa", "ugco_documentocaso"], CRUD),
      ...expand(["ugco_tarea"], CRUD),
      ...expand(["ugco_observacionevento"], APPEND_ONLY),
      ...expand(["ugco_comiteoncologico", "ugco_comitecaso"], CRUD),
      ...expand(["ugco_equiposeguimiento", "ugco_equipomiembro"], READ),
      ...expand(ALL_REF, READ),
      ...expand(ALL_ALMA, READ),
    ],
  },
  // ── Médico Referente ──
  {
    role: "ugco_medico_referente",
    grants: [
      ...expand(["ugco_casooncologico", "ugco_eventoclinico", "ugco_casoespecialidad"], FULL),
      ...expand(["ugco_tarea", "ugco_documentocaso"], CRUD),
      ...expand(["ugco_observacionevento"], APPEND_ONLY),
      ...expand(["ugco_comiteoncologico", "ugco_comitecaso"], CRUD),
      ...expand(["ugco_contactopaciente", "ugco_personasignificativa"], CRUD),
      ...expand(["ugco_equiposeguimiento", "ugco_equipomiembro"], READ),
      ...expand(ALL_REF, READ),
      ...expand(ALL_ALMA, READ),
    ],
  },
  // ── Médico Ref. Técnico ──
  {
    role: "ugco_medico_ref_tecnico",
    grants: [
      ...expand(ALL_UGCO.filter(c => c !== "ugco_observacionevento"), CRUD),
      ...expand(["ugco_observacionevento"], APPEND_ONLY),
      ...expand(ALL_REF, READ),
      ...expand(ALL_ALMA, READ),
    ],
  },
  // ── TENS Gestora ──
  {
    role: "ugco_tens_gestora",
    grants: [
      ...expand(["ugco_eventoclinico", "ugco_documentocaso"], CRUD),
      ...expand(["ugco_tarea"], CRUD),
      ...expand(["ugco_observacionevento"], APPEND_ONLY),
      ...expand(["ugco_casooncologico", "ugco_casoespecialidad", "ugco_contactopaciente", "ugco_personasignificativa"], READ),
      ...expand(["ugco_comiteoncologico", "ugco_comitecaso"], READ),
      ...expand(["ugco_equiposeguimiento", "ugco_equipomiembro"], READ),
      ...expand(ALL_REF, READ),
      ...expand(ALL_ALMA, READ),
    ],
  },
  // ── Administrativa ──
  {
    role: "ugco_administrativa",
    grants: [
      ...expand(["ugco_tarea"], CREATE_READ),
      ...expand(["ugco_observacionevento"], APPEND_ONLY),
      ...expand(["ugco_casooncologico", "ugco_eventoclinico"], READ),
      ...expand(["ugco_contactopaciente", "ugco_personasignificativa"], READ),
      ...expand(["ugco_documentocaso", "ugco_casoespecialidad", "ugco_comiteoncologico", "ugco_comitecaso", "ugco_equiposeguimiento", "ugco_equipomiembro"], READ),
      ...expand(ALL_REF, READ),
      ...expand(ALL_ALMA, READ),
    ],
  },
];

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log("╔═══════════════════════════════════════════════╗");
  console.log("║  Fix ACL Grants (by numeric resource ID)      ║");
  console.log("╚═══════════════════════════════════════════════╝\n");

  for (const { role, grants } of ROLE_GRANTS) {
    const merged = mergeGrants(grants);

    // Step 1: get all existing resource IDs for this role
    const listRes = await api("GET", `roles/${role}/resources:list?pageSize=200`);
    const existing: Map<string, number> = new Map();
    for (const r of (listRes?.data || [])) {
      existing.set(r.name, r.id);
    }

    let actionCount = 0;

    for (const [collection, actions] of merged) {
      let resourceId = existing.get(collection);

      // Create resource if not exists
      if (!resourceId) {
        try {
          const created = await api("POST", `roles/${role}/resources:create`, {
            name: collection,
            usingActionsConfig: true,
          });
          resourceId = created?.data?.id;
        } catch { /* exists */ }

        // Re-fetch to get ID
        if (!resourceId) {
          const re = await api("GET", `roles/${role}/resources:list?pageSize=200`);
          resourceId = (re?.data || []).find((r: any) => r.name === collection)?.id;
        }
      }

      if (!resourceId) {
        console.error(`  ❌ ${role}/${collection}: no resource ID`);
        errCount++;
        continue;
      }

      // Step 2: update by numeric ID with actions
      try {
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

  console.log(`\n${"═".repeat(50)}`);
  console.log(`✅ OK: ${okCount} | ❌ Err: ${errCount}`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
