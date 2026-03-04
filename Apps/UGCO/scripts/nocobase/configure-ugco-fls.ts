/**
 * configure-ugco-fls.ts  (P2-03)
 *
 * Configura Field-Level Security (FLS) para los roles UGCO.
 * Restringe qué campos puede editar cada rol en las colecciones oncológicas.
 *
 * Principio médico-legal:
 *   Los campos TNM (tnm_t, tnm_n, tnm_m, estadio_clinico) representan
 *   el estadiaje del tumor y solo deben ser modificables por el médico oncólogo
 *   o el administrador. Las enfermeras y coordinadores no deben modificar
 *   estos campos clínicos críticos.
 *
 * Implementación NocoBase ACL:
 *   Al especificar `fields` en una acción, solo se permiten esos campos.
 *   Si no se especifica `fields`, todos los campos son permitidos.
 *
 * Campos TNM protegidos en onco_casos:
 *   estadio_clinico, codigo_cie10, diagnostico_principal
 *
 * Campos permitidos para enfermeras (no-TNM):
 *   estado, observaciones, fecha_ingreso
 *
 * Campos permitidos para coordinador:
 *   estado, observaciones
 *
 * Uso:
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/configure-ugco-fls.ts --dry-run
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/configure-ugco-fls.ts
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

// ── Campos de onco_casos ──────────────────────────────────────────────────────

// Todos los campos editables en onco_casos
const ALL_CASO_FIELDS = [
  "paciente_nombre", "paciente_rut", "paciente_id",
  "estado", "especialidad", "fecha_ingreso",
  "codigo_cie10", "estadio_clinico", "diagnostico_principal",
  "observaciones", "responsible_doctor",
];

// Campos TNM/clínicos que SOLO puede editar medico_oncologo y admin_ugco
const PROTECTED_CLINICAL_FIELDS = ["estadio_clinico", "codigo_cie10", "diagnostico_principal"];

// Campos que puede editar enfermera (no clínicos)
const ENFERMERA_EDITABLE = ALL_CASO_FIELDS.filter(f => !PROTECTED_CLINICAL_FIELDS.includes(f) && !["paciente_nombre", "paciente_rut", "paciente_id", "especialidad", "responsible_doctor"].includes(f));
// = ["estado", "fecha_ingreso", "observaciones"]

// Campos que puede editar coordinador (gestión, no clínico)
const COORDINADOR_EDITABLE = ["estado", "observaciones"];

// ── Definición FLS por rol ────────────────────────────────────────────────────

interface FlsConfig {
  roleName: string;
  description: string;
  collection: string;
  updateFields: string[];  // Solo estos campos en el action update
}

const FLS_CONFIGS: FlsConfig[] = [
  // ── enfermera_ugco: no puede editar campos clínicos TNM ─────────────────
  {
    roleName: "enfermera_ugco",
    description: "Enfermera UGCO — update limitado: solo estado, fecha, observaciones",
    collection: "onco_casos",
    updateFields: ENFERMERA_EDITABLE,
  },

  // ── enfermera_gestora_onco: idem ────────────────────────────────────────
  {
    roleName: "enfermera_gestora_onco",
    description: "Enfermera gestora — update limitado: solo estado, fecha, observaciones",
    collection: "onco_casos",
    updateFields: ENFERMERA_EDITABLE,
  },

  // ── coordinador_ugco: solo puede cambiar estado y notas ─────────────────
  {
    roleName: "coordinador_ugco",
    description: "Coordinador UGCO — update limitado: solo estado y observaciones",
    collection: "onco_casos",
    updateFields: COORDINADOR_EDITABLE,
  },
];

async function applyFls(config: FlsConfig): Promise<{ ok: number; fail: number }> {
  console.log(`\n▶ FLS: ${config.roleName} → ${config.collection}`);
  console.log(`  ${config.description}`);
  console.log(`  Campos permitidos en update: ${config.updateFields.join(", ")}`);

  if (DRY) {
    console.log(`  [DRY-RUN] Aplicaría FLS con ${config.updateFields.length} campos en update`);
    return { ok: 1, fail: 0 };
  }

  // Obtener el resource actual para preservar list/get/create/export actions
  let currentResource: any = null;
  try {
    const result = await api("GET", `roles/${config.roleName}/resources:list?filter[name]=${config.collection}&pageSize=1`);
    currentResource = (result.data || [])[0];
  } catch (_e) {
    // Si no existe, crearlo
  }

  // Construir actions: preservar list/get/create/export sin fields, update con fields
  const baseActions = currentResource?.actions || [];
  const actionsMap = new Map(baseActions.map((a: any) => [a.name, a]));

  // Actualizar/agregar action update con fields restrictivos
  actionsMap.set("update", {
    name: "update",
    fields: config.updateFields,
    ...(actionsMap.has("update") ? { scope: (actionsMap.get("update") as any).scope } : {}),
  });

  const actions = [...actionsMap.values()];

  const body = {
    name: config.collection,
    usingConfig: "individual",
    actions,
  };

  try {
    // Intentar update
    await api("POST", `roles/${config.roleName}/resources:update?filterByTk=${config.collection}`, body);
    console.log(`  ✅ FLS aplicado`);
    return { ok: 1, fail: 0 };
  } catch (_e) {
    try {
      // Si no existe, crear
      await api("POST", `roles/${config.roleName}/resources:create`, body);
      console.log(`  ✅ FLS creado`);
      return { ok: 1, fail: 0 };
    } catch (e: any) {
      console.error(`  ❌ Error: ${e.message}`);
      return { ok: 0, fail: 1 };
    }
  }
}

async function main(): Promise<void> {
  console.log("=== CONFIGURE UGCO FLS (P2-03) ===");
  console.log(`Instance: ${BASE}`);
  if (DRY) console.log("  [DRY-RUN] Sin aplicar cambios\n");
  else console.log("");

  // Verificar roles
  console.log("▶ Verificando roles...");
  const rolesResult = await api("GET", "roles:list?pageSize=100");
  const existingRoles = new Set((rolesResult.data || []).map((r: any) => r.name));

  for (const config of FLS_CONFIGS) {
    if (!existingRoles.has(config.roleName)) {
      console.warn(`  ⚠ Rol ${config.roleName} NO existe — skipping`);
    } else {
      console.log(`  ✅ ${config.roleName}`);
    }
  }

  let totalOk = 0, totalFail = 0;

  for (const config of FLS_CONFIGS) {
    if (!existingRoles.has(config.roleName)) continue;
    const result = await applyFls(config);
    totalOk += result.ok;
    totalFail += result.fail;
    await new Promise(r => setTimeout(r, 300));
  }

  console.log("\n" + "─".repeat(50));
  console.log(`✅ FLS configurado: ${totalOk} recursos  ❌ Fallos: ${totalFail}`);
  console.log("\nCampos PROTEGIDOS (solo medico_oncologo y admin_ugco pueden editar):");
  console.log(`  ${PROTECTED_CLINICAL_FIELDS.join(", ")}`);
  console.log("\nCampos editables por enfermera_ugco/gestora:");
  console.log(`  ${ENFERMERA_EDITABLE.join(", ")}`);
  console.log("\nCampos editables por coordinador_ugco:");
  console.log(`  ${COORDINADOR_EDITABLE.join(", ")}`);
  if (DRY) console.log("\n[DRY-RUN] Ejecutar sin --dry-run para aplicar.");
}

main().catch(console.error);
