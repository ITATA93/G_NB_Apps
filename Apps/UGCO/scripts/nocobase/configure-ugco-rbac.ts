/**
 * configure-ugco-rbac.ts  (P1-03 + P2-01)
 *
 * Configura RBAC para las colecciones onco_* y ugco_garantias_ges.
 * Aplica inmutabilidad de onco_episodios (solo admin puede modificar).
 *
 * Roles existentes en producción:
 *   - admin_ugco          → CRUD completo en todo UGCO
 *   - medico_oncologo     → Ver + crear casos/episodios, sin delete en episodios
 *   - coordinador_ugco    → CRUD comité, ver casos
 *   - enfermera_ugco      → Ver casos, CRUD tareas propias
 *   - enfermera_gestora_onco → Similar a enfermera_ugco
 *   - member              → Sin acceso a onco_* (no médico)
 *
 * Inmutabilidad de onco_episodios (P1-03):
 *   - medico_oncologo: list + get + create (NO update, NO destroy)
 *   - admin_ugco: list + get + create + update + destroy
 *   Principio: los eventos clínicos son inmutables por responsabilidad médico-legal.
 *   Para corregir un episodio, se crea un nuevo episodio de tipo "corrección".
 *
 * Uso:
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/configure-ugco-rbac.ts
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/configure-ugco-rbac.ts --dry-run
 */

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;
const DRY  = process.argv.includes("--dry-run");

async function api(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
}

// ── Definición de permisos por rol ────────────────────────────────────────────────

type Action = "list" | "get" | "create" | "update" | "destroy" | "export";

interface CollectionGrant {
  collection: string;
  actions: Action[];
}

interface RoleConfig {
  roleName: string;
  description: string;
  grants: CollectionGrant[];
}

// Colecciones principales
const ONCO_CORE = ["onco_casos", "onco_episodios", "onco_comite_sesiones", "onco_comite_casos"];
const ONCO_REF  = [
  "UGCO_REF_cie10", "UGCO_REF_oncoespecialidad", "UGCO_REF_oncodiagnostico",
  "UGCO_REF_oncoecog", "UGCO_REF_oncoestadoadm", "UGCO_REF_oncoestadocaso",
  "UGCO_REF_oncoestadoclinico", "UGCO_REF_oncomorfologiaicdo", "UGCO_REF_oncotopografiaicdo",
  "UGCO_REF_oncotnm_t", "UGCO_REF_oncotnm_n", "UGCO_REF_oncotnm_m",
  "UGCO_REF_oncofigo", "UGCO_REF_oncogradohistologico", "UGCO_REF_lateralidad",
  "UGCO_REF_extension", "UGCO_REF_prevision", "UGCO_REF_sexo",
];

const ROLE_CONFIGS: RoleConfig[] = [
  // ── admin_ugco: acceso total ────────────────────────────────────────────────────
  {
    roleName: "admin_ugco",
    description: "Administrador UGCO — acceso total a todas las colecciones onco_*",
    grants: [
      ...ONCO_CORE.map(c => ({ collection: c, actions: ["list", "get", "create", "update", "destroy", "export"] as Action[] })),
      { collection: "ugco_garantias_ges", actions: ["list", "get", "create", "update", "destroy"] as Action[] },
      ...ONCO_REF.map(c => ({ collection: c, actions: ["list", "get", "create", "update", "destroy"] as Action[] })),
    ],
  },

  // ── medico_oncologo: ver + crear, SIN modificar/eliminar episodios ──────────────
  {
    roleName: "medico_oncologo",
    description: "Médico Oncólogo — CRUD en casos, episodios de solo creación (inmutabilidad)",
    grants: [
      { collection: "onco_casos",            actions: ["list", "get", "create", "update", "export"] as Action[] },
      { collection: "onco_episodios",        actions: ["list", "get", "create"] as Action[] },  // SIN update/destroy (inmutabilidad)
      { collection: "onco_comite_sesiones",  actions: ["list", "get"] as Action[] },
      { collection: "onco_comite_casos",     actions: ["list", "get", "create"] as Action[] },
      { collection: "ugco_garantias_ges",    actions: ["list", "get"] as Action[] },
      ...ONCO_REF.map(c => ({ collection: c, actions: ["list", "get"] as Action[] })),
    ],
  },

  // ── coordinador_ugco: CRUD comité + ver casos ────────────────────────────────────
  {
    roleName: "coordinador_ugco",
    description: "Coordinador UGCO — CRUD en comité, solo lectura en casos/episodios",
    grants: [
      { collection: "onco_casos",            actions: ["list", "get", "export"] as Action[] },
      { collection: "onco_episodios",        actions: ["list", "get"] as Action[] },
      { collection: "onco_comite_sesiones",  actions: ["list", "get", "create", "update", "destroy"] as Action[] },
      { collection: "onco_comite_casos",     actions: ["list", "get", "create", "update", "destroy"] as Action[] },
      { collection: "ugco_garantias_ges",    actions: ["list", "get", "create", "update"] as Action[] },
      ...ONCO_REF.map(c => ({ collection: c, actions: ["list", "get"] as Action[] })),
    ],
  },

  // ── enfermera_ugco: lectura + GES ───────────────────────────────────────────────
  {
    roleName: "enfermera_ugco",
    description: "Enfermera UGCO — lectura de casos/episodios, CRUD en garantías GES",
    grants: [
      { collection: "onco_casos",            actions: ["list", "get"] as Action[] },
      { collection: "onco_episodios",        actions: ["list", "get"] as Action[] },
      { collection: "onco_comite_sesiones",  actions: ["list", "get"] as Action[] },
      { collection: "onco_comite_casos",     actions: ["list", "get"] as Action[] },
      { collection: "ugco_garantias_ges",    actions: ["list", "get", "create", "update"] as Action[] },
      ...ONCO_REF.map(c => ({ collection: c, actions: ["list", "get"] as Action[] })),
    ],
  },

  // ── enfermera_gestora_onco: similar a enfermera_ugco ─────────────────────────────
  {
    roleName: "enfermera_gestora_onco",
    description: "Enfermera Gestora Oncología — lectura + gestión de GES",
    grants: [
      { collection: "onco_casos",            actions: ["list", "get"] as Action[] },
      { collection: "onco_episodios",        actions: ["list", "get"] as Action[] },
      { collection: "onco_comite_sesiones",  actions: ["list", "get"] as Action[] },
      { collection: "onco_comite_casos",     actions: ["list", "get"] as Action[] },
      { collection: "ugco_garantias_ges",    actions: ["list", "get", "create", "update"] as Action[] },
      ...ONCO_REF.map(c => ({ collection: c, actions: ["list", "get"] as Action[] })),
    ],
  },
];

// ── Aplicar grants a un rol ───────────────────────────────────────────────────────
async function applyRoleGrants(role: RoleConfig): Promise<void> {
  console.log(`\n▶ Rol: ${role.roleName}`);
  console.log(`  ${role.description}`);

  let ok = 0, fail = 0;

  for (const grant of role.grants) {
    const { collection, actions } = grant;

    for (const action of actions) {
      const grantPath = `roles/${role.roleName}/resources:create`;

      if (DRY) {
        process.stdout.write(".");
        ok++;
        continue;
      }

      try {
        // NocoBase ACL API: crear permiso por colección + acción
        await api("POST", grantPath, {
          name: collection,
          usingConfig: "individual",
          actions: [{ name: action }],
        });
        process.stdout.write("✓");
        ok++;
      } catch (e: any) {
        // Si ya existe, intentar actualizar
        try {
          await api("POST", `roles/${role.roleName}/resources:update?filterByTk=${collection}`, {
            name: collection,
            usingConfig: "individual",
            actions: [...actions.map(a => ({ name: a }))],
          });
          process.stdout.write("↻");
          ok++;
          break; // Una vez actualizado, pasar al siguiente collection
        } catch (_e2) {
          process.stdout.write("✗");
          fail++;
        }
      }

      await new Promise(r => setTimeout(r, 100));
    }
  }

  console.log(`\n  ✅ OK: ${ok}  ❌ Fail: ${fail}`);
}

async function main(): Promise<void> {
  console.log("=== CONFIGURE UGCO RBAC (P1-03 + P2-01) ===");
  console.log(`Instance: ${BASE}`);
  if (DRY) console.log("  [DRY-RUN] Sin aplicar cambios\n");
  else console.log("");

  // Verificar que los roles existen
  console.log("▶ Verificando roles existentes...");
  const rolesResult = await api("GET", "roles:list?pageSize=100");
  const existingRoles = new Set((rolesResult.data || []).map((r: any) => r.name));

  for (const config of ROLE_CONFIGS) {
    if (!existingRoles.has(config.roleName)) {
      console.warn(`  ⚠ Rol ${config.roleName} NO existe en el sistema — skipping`);
    } else {
      console.log(`  ✅ ${config.roleName}`);
    }
  }

  // Aplicar permisos
  console.log("\n▶ Aplicando grants...");
  for (const config of ROLE_CONFIGS) {
    if (!existingRoles.has(config.roleName)) continue;
    await applyRoleGrants(config);
  }

  console.log("\n" + "─".repeat(50));
  console.log("✅ RBAC configurado");
  console.log("\nInmutabilidad aplicada:");
  console.log("  onco_episodios: medico_oncologo solo puede list/get/create (sin update/destroy)");
  console.log("  onco_episodios: admin_ugco tiene acceso total");
  if (DRY) console.log("\n  [DRY-RUN] sin cambios en producción");
}

main().catch(console.error);
