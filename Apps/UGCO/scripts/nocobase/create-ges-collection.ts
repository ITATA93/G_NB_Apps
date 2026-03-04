/**
 * create-ges-collection.ts  (P0-04)
 *
 * Crea la colección `ugco_garantias_ges` con todos los campos requeridos por MINSAL.
 * Script idempotente — verifica si ya existe antes de crear.
 *
 * Contexto:
 *   MINSAL exige tracking de plazos GES (Garantías Explícitas en Salud).
 *   Ref: CONDICIONES-PARA-ACCEDER-A-GES_versión-nov-2025.pdf
 *
 * Uso:
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/create-ges-collection.ts
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/create-ges-collection.ts --dry-run
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

// ── Definición de la colección ────────────────────────────────────────────────────

const COLLECTION_NAME = "ugco_garantias_ges";

const COLLECTION_DEF = {
  name: COLLECTION_NAME,
  title: "Garantías GES",
  fields: [],
};

// Los campos se crean vía collections:fields endpoint
const FIELDS: Array<{ name: string; def: object }> = [
  // Relación con onco_casos
  {
    name: "caso_id",
    def: {
      type: "bigInt",
      name: "caso_id",
      interface: "integer",
      uiSchema: {
        title: "ID Caso",
        type: "number",
        "x-component": "InputNumber",
        "x-read-pretty": true,
      },
    },
  },
  // Relación belongsTo onco_casos
  {
    name: "caso",
    def: {
      type: "belongsTo",
      name: "caso",
      foreignKey: "caso_id",
      target: "onco_casos",
      interface: "m2o",
      uiSchema: {
        title: "Caso Oncológico",
        "x-component": "AssociationField",
      },
    },
  },
  {
    name: "tipo_garantia",
    def: {
      type: "string",
      name: "tipo_garantia",
      interface: "select",
      uiSchema: {
        title: "Tipo de Garantía",
        type: "string",
        "x-component": "Select",
        enum: [
          { value: "DIAGNOSTICO",   label: "Diagnóstico",      color: "blue" },
          { value: "TRATAMIENTO",   label: "Tratamiento",      color: "purple" },
          { value: "SEGUIMIENTO",   label: "Seguimiento",      color: "cyan" },
          { value: "PALIATIVOS",    label: "Cuidados Paliativos", color: "default" },
        ],
      },
    },
  },
  {
    name: "numero_problema_ges",
    def: {
      type: "string",
      name: "numero_problema_ges",
      interface: "input",
      uiSchema: {
        title: "N° Problema GES",
        type: "string",
        "x-component": "Input",
        description: "Número de problema según MINSAL (ej: 068 - Cáncer de Mama)",
      },
    },
  },
  {
    name: "fecha_inicio",
    def: {
      type: "dateOnly",
      name: "fecha_inicio",
      interface: "date",
      uiSchema: {
        title: "Fecha Inicio Garantía",
        type: "string",
        "x-component": "DatePicker",
        "x-component-props": { dateFormat: "DD/MM/YYYY" },
      },
    },
  },
  {
    name: "fecha_limite",
    def: {
      type: "dateOnly",
      name: "fecha_limite",
      interface: "date",
      uiSchema: {
        title: "Fecha Límite",
        type: "string",
        "x-component": "DatePicker",
        "x-component-props": { dateFormat: "DD/MM/YYYY" },
      },
    },
  },
  {
    name: "estado_garantia",
    def: {
      type: "string",
      name: "estado_garantia",
      interface: "select",
      defaultValue: "EN_PLAZO",
      uiSchema: {
        title: "Estado",
        type: "string",
        "x-component": "Select",
        enum: [
          { value: "EN_PLAZO",       label: "En Plazo",           color: "green" },
          { value: "PROXIMA_VENCER", label: "Próxima a Vencer",   color: "orange" },
          { value: "VENCIDA",        label: "Vencida",            color: "red" },
          { value: "CUMPLIDA",       label: "Cumplida",           color: "default" },
          { value: "NO_APLICA",      label: "No Aplica",          color: "default" },
        ],
      },
    },
  },
  {
    name: "dias_restantes",
    def: {
      type: "integer",
      name: "dias_restantes",
      interface: "integer",
      uiSchema: {
        title: "Días Restantes",
        type: "number",
        "x-component": "InputNumber",
        description: "Calculado: fecha_limite - hoy. Negativo = vencida.",
      },
    },
  },
  {
    name: "responsable",
    def: {
      type: "string",
      name: "responsable",
      interface: "input",
      uiSchema: {
        title: "Responsable",
        type: "string",
        "x-component": "Input",
      },
    },
  },
  {
    name: "observaciones",
    def: {
      type: "text",
      name: "observaciones",
      interface: "textarea",
      uiSchema: {
        title: "Observaciones",
        type: "string",
        "x-component": "Input.TextArea",
        "x-component-props": { rows: 3 },
      },
    },
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log("=== CREATE GES COLLECTION (P0-04) ===");
  console.log(`Instance: ${BASE}`);
  if (DRY) console.log("  [DRY-RUN] Sin aplicar cambios\n");
  else console.log("");

  // 1. Verificar si la colección ya existe
  try {
    const existing = await api("GET", `collections:get?filterByTk=${COLLECTION_NAME}`);
    if (existing.data) {
      console.log(`ℹ  Colección ${COLLECTION_NAME} ya existe — verificando campos...`);

      const fieldsResult = await api("GET", `collections/${COLLECTION_NAME}/fields:list?pageSize=100`);
      const existingFields: string[] = (fieldsResult.data || []).map((f: any) => f.name);
      console.log(`   Campos existentes: ${existingFields.join(", ")}`);

      // Agregar solo los campos faltantes
      const missing = FIELDS.filter(f => !existingFields.includes(f.name));
      if (missing.length === 0) {
        console.log("   ✅ Todos los campos ya existen — nada que hacer");
        return;
      }
      console.log(`   Campos faltantes: ${missing.map(f => f.name).join(", ")}`);

      for (const { name, def } of missing) {
        await createField(name, def);
      }
      return;
    }
  } catch (_e) {
    // No existe — continuar con creación
  }

  // 2. Crear la colección
  console.log(`▶ Creando colección: ${COLLECTION_NAME}`);
  if (!DRY) {
    try {
      await api("POST", "collections:create", COLLECTION_DEF);
      console.log("  ✅ Colección creada");
    } catch (e: any) {
      if (e.message.includes("already exists") || e.message.includes("duplicate")) {
        console.log("  ℹ  Ya existía");
      } else {
        throw e;
      }
    }
    await new Promise(r => setTimeout(r, 500));
  } else {
    console.log("  [DRY-RUN] Crearía la colección");
  }

  // 3. Crear campos
  console.log(`\n▶ Creando ${FIELDS.length} campos...`);
  for (const { name, def } of FIELDS) {
    await createField(name, def);
  }

  console.log("\n" + "─".repeat(50));
  console.log("✅ Colección ugco_garantias_ges lista");
  console.log("\nSiguiente paso: Crear página UI (P1-05 create-ges-page.ts)");
}

async function createField(name: string, def: object): Promise<void> {
  console.log(`  Campo: ${name}`);
  if (DRY) {
    console.log(`  [DRY-RUN] Crearía campo ${name}`);
    return;
  }
  try {
    await api("POST", `collections/${COLLECTION_NAME}/fields:create`, def);
    console.log(`  ✅ ${name}`);
  } catch (e: any) {
    if (e.message.includes("already exists") || e.message.includes("duplicate")) {
      console.log(`  ℹ  ${name} ya existe`);
    } else {
      console.error(`  ❌ ${name}: ${e.message}`);
    }
  }
  await new Promise(r => setTimeout(r, 200));
}

main().catch(console.error);
