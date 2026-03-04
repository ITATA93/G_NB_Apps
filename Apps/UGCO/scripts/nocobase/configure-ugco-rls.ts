/**
 * configure-ugco-rls.ts  (P2-02)
 *
 * Configura Row-Level Security (RLS) para los roles UGCO.
 * Aplica scope filters en las acciones ACL para restringir qué registros
 * puede ver/editar cada rol según el estado del caso.
 *
 * Implementación:
 *   NocoBase ACL soporta scopes via `actions[n].scope` en el resource.
 *   Un scope es un filtro JSON que se aplica automáticamente en cada query.
 *
 * Reglas RLS aplicadas:
 *   - coordinador_ugco: list/get onco_casos sin restricción de estado
 *     update onco_casos solo si estado IN [activo, tratamiento, seguimiento]
 *   - enfermera_ugco: list/get onco_casos solo activos/seguimiento/tratamiento
 *     (no ve fallecidos ni perdidos de vista por defecto)
 *   - enfermera_gestora_onco: idem enfermera_ugco
 *   - medico_oncologo: puede crear/editar onco_casos en cualquier estado
 *     pero update solo si estado != "egresado" ni "fallecido"
 *   - admin_ugco: sin restricciones (ya configurado con CRUD total)
 *
 * Uso:
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/configure-ugco-rls.ts --dry-run
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/configure-ugco-rls.ts
 */

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;
const DRY  = process.argv.includes("--dry-run");

async function api(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(`${BASE}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
}

// ── Definición de RLS por rol ─────────────────────────────────────────────────

interface ScopedAction {
  name: string;
  scope?: object;  // Si undefined = sin scope (acceso libre)
}

interface RlsRule {
  roleName: string;
  description: string;
  collection: string;
  actions: ScopedAction[];
}

// Estados activos del workflow clínico
const ACTIVE_STATES = ["activo", "seguimiento", "tratamiento"];
const MODIFIABLE_STATES = ["activo", "seguimiento", "tratamiento"];

const RLS_RULES: RlsRule[] = [
  // ── medico_oncologo: puede ver todo, editar solo activos ─────────────────
  {
    roleName: "medico_oncologo",
    description: "Médico oncólogo — ve todo, edita solo casos en workflow activo",
    collection: "onco_casos",
    actions: [
      { name: "list" },   // Sin scope: ve todos los casos
      { name: "get" },
      { name: "create" },
      { name: "export" },
      {
        name: "update",
        scope: {
          filter: {
            estado: { $in: MODIFIABLE_STATES },
          },
        },
      },
    ],
  },

  // ── coordinador_ugco: ve todo, edita solo activos ────────────────────────
  {
    roleName: "coordinador_ugco",
    description: "Coordinador UGCO — ve todos los casos, edita solo activos/seguimiento",
    collection: "onco_casos",
    actions: [
      { name: "list" },
      { name: "get" },
      { name: "export" },
      {
        name: "update",
        scope: {
          filter: {
            estado: { $in: MODIFIABLE_STATES },
          },
        },
      },
    ],
  },

  // ── enfermera_ugco: solo ve casos activos/seguimiento/tratamiento ────────
  {
    roleName: "enfermera_ugco",
    description: "Enfermera UGCO — solo ve casos en workflow activo (no fallecidos/perdidos)",
    collection: "onco_casos",
    actions: [
      {
        name: "list",
        scope: {
          filter: {
            estado: { $in: ACTIVE_STATES },
          },
        },
      },
      {
        name: "get",
        scope: {
          filter: {
            estado: { $in: ACTIVE_STATES },
          },
        },
      },
    ],
  },

  // ── enfermera_gestora_onco: idem enfermera_ugco ──────────────────────────
  {
    roleName: "enfermera_gestora_onco",
    description: "Enfermera gestora — solo ve casos en workflow activo",
    collection: "onco_casos",
    actions: [
      {
        name: "list",
        scope: {
          filter: {
            estado: { $in: ACTIVE_STATES },
          },
        },
      },
      {
        name: "get",
        scope: {
          filter: {
            estado: { $in: ACTIVE_STATES },
          },
        },
      },
    ],
  },

  // ── ugco_garantias_ges: enfermeras solo ven garantías de casos activos ───
  {
    roleName: "enfermera_ugco",
    description: "Enfermera UGCO — garantías GES solo de casos activos",
    collection: "ugco_garantias_ges",
    actions: [
      {
        name: "list",
        scope: {
          filter: {
            estado_garantia: { $in: ["EN_PLAZO", "PROXIMA_VENCER", "VENCIDA"] },
          },
        },
      },
      {
        name: "get",
        scope: {
          filter: {
            estado_garantia: { $in: ["EN_PLAZO", "PROXIMA_VENCER", "VENCIDA"] },
          },
        },
      },
      { name: "create" },
      { name: "update" },
    ],
  },

  // ── coordinador: garantías GES — todo excepto cumplidas ─────────────────
  {
    roleName: "coordinador_ugco",
    description: "Coordinador UGCO — garantías GES excluyendo CUMPLIDAS",
    collection: "ugco_garantias_ges",
    actions: [
      { name: "list" },
      { name: "get" },
      { name: "create" },
      {
        name: "update",
        scope: {
          filter: {
            estado_garantia: { $ne: "CUMPLIDA" },
          },
        },
      },
    ],
  },
];

// ── Aplicar RLS a un rol/colección ───────────────────────────────────────────

async function applyRls(rule: RlsRule): Promise<{ ok: number; fail: number }> {
  let ok = 0, fail = 0;

  const resourceBody = {
    name: rule.collection,
    usingConfig: "individual",
    actions: rule.actions.map(a => ({
      name: a.name,
      ...(a.scope ? { scope: a.scope } : {}),
    })),
  };

  if (DRY) {
    const scopedActions = rule.actions.filter(a => a.scope).map(a => a.name);
    console.log(`  [DRY-RUN] ${rule.collection}: ${rule.actions.length} acciones, ${scopedActions.length} con scope (${scopedActions.join(", ")})`);
    return { ok: 1, fail: 0 };
  }

  // Intentar UPDATE primero (recurso ya existe desde configure-ugco-rbac.ts)
  try {
    await api("POST", `roles/${rule.roleName}/resources:update?filterByTk=${rule.collection}`, resourceBody);
    process.stdout.write("↻");
    ok++;
  } catch (_e) {
    // Si no existe, crear
    try {
      await api("POST", `roles/${rule.roleName}/resources:create`, resourceBody);
      process.stdout.write("✓");
      ok++;
    } catch (e: any) {
      process.stdout.write("✗");
      fail++;
    }
  }

  return { ok, fail };
}

async function main(): Promise<void> {
  console.log("=== CONFIGURE UGCO RLS (P2-02) ===");
  console.log(`Instance: ${BASE}`);
  if (DRY) console.log("  [DRY-RUN] Sin aplicar cambios\n");
  else console.log("");

  // Verificar roles
  console.log("▶ Verificando roles...");
  const rolesResult = await api("GET", "roles:list?pageSize=100");
  const existingRoles = new Set((rolesResult.data || []).map((r: any) => r.name));

  const affectedRoles = [...new Set(RLS_RULES.map(r => r.roleName))];
  for (const role of affectedRoles) {
    if (!existingRoles.has(role)) {
      console.warn(`  ⚠ Rol ${role} NO existe — skipping sus reglas`);
    } else {
      console.log(`  ✅ ${role}`);
    }
  }

  let totalOk = 0, totalFail = 0;

  // Aplicar RLS por rol/colección
  // Agrupar por rol + colección para evitar sobreescrituras
  const grouped = new Map<string, RlsRule>();
  for (const rule of RLS_RULES) {
    const key = `${rule.roleName}::${rule.collection}`;
    if (grouped.has(key)) {
      // Merge actions
      const existing = grouped.get(key)!;
      const existingNames = new Set(existing.actions.map(a => a.name));
      for (const action of rule.actions) {
        if (!existingNames.has(action.name)) {
          existing.actions.push(action);
        }
      }
    } else {
      grouped.set(key, { ...rule, actions: [...rule.actions] });
    }
  }

  for (const [key, rule] of grouped) {
    if (!existingRoles.has(rule.roleName)) continue;
    console.log(`\n▶ RLS: ${rule.roleName} → ${rule.collection}`);
    console.log(`  ${rule.description}`);
    const result = await applyRls(rule);
    totalOk += result.ok;
    totalFail += result.fail;
    await new Promise(r => setTimeout(r, 200));
  }

  if (!DRY) console.log("");
  console.log("\n" + "─".repeat(50));
  console.log(`✅ RLS configurado: ${totalOk} recursos  ❌ Fallos: ${totalFail}`);
  console.log("\nReglas aplicadas:");
  console.log("  medico_oncologo: update solo en casos activos/seguimiento/tratamiento");
  console.log("  coordinador_ugco: idem médico para update");
  console.log("  enfermera_ugco/gestora: list/get solo casos activos (no fallecidos/perdidos)");
  console.log("  enfermera_ugco: garantías GES solo en estados activos");
  if (DRY) console.log("\n[DRY-RUN] Ejecutar sin --dry-run para aplicar.");
}

main().catch(console.error);
