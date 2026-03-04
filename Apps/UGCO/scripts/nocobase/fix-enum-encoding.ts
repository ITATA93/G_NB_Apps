/**
 * fix-enum-encoding.ts  (P1-06)
 *
 * Corrige el encoding de valores enum en la UI de UGCO.
 * Problema: "Cirugía" aparece como "Cirug◆a", "Quimioterapia" truncado, etc.
 * Causa: Los enum options se guardaron con encoding incorrecto durante el seed.
 *
 * Estrategia:
 *   1. Para cada campo con enum corrupto, parchea el x-component-props.options
 *      con los valores correctos usando uiSchema:patch
 *   2. También actualiza el uiSchema en el field de la colección
 *
 * Uso:
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/fix-enum-encoding.ts
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/fix-enum-encoding.ts --dry-run
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

// ── Correcciones de enum por campo ────────────────────────────────────────────────

interface EnumFix {
  collection: string;
  fieldName: string;
  description: string;
  correctOptions: Array<{ value: string; label: string; color?: string }>;
}

const ENUM_FIXES: EnumFix[] = [
  // onco_episodios.tipo_episodio
  {
    collection: "onco_episodios",
    fieldName: "tipo_episodio",
    description: "Tipos de episodio clínico (Cirugía → Cirug◆a)",
    correctOptions: [
      { value: "consulta",        label: "Consulta",           color: "blue" },
      { value: "biopsia",         label: "Biopsia",            color: "orange" },
      { value: "cirugia",         label: "Cirugía",            color: "red" },
      { value: "quimioterapia",   label: "Quimioterapia",      color: "purple" },
      { value: "radioterapia",    label: "Radioterapia",       color: "volcano" },
      { value: "imagenologia",    label: "Imagenología",       color: "cyan" },
      { value: "laboratorio",     label: "Laboratorio",        color: "geekblue" },
      { value: "control",         label: "Control",            color: "green" },
      { value: "interconsulta",   label: "Interconsulta",      color: "gold" },
      { value: "comite",          label: "Comité Oncológico",  color: "magenta" },
      { value: "otro",            label: "Otro",               color: "default" },
    ],
  },
  // onco_casos.estado
  {
    collection: "onco_casos",
    fieldName: "estado",
    description: "Estado del caso oncológico",
    correctOptions: [
      { value: "activo",        label: "Activo",               color: "green" },
      { value: "seguimiento",   label: "Seguimiento",          color: "blue" },
      { value: "tratamiento",   label: "En Tratamiento",       color: "cyan" },
      { value: "egresado",      label: "Egresado",             color: "default" },
      { value: "fallecido",     label: "Fallecido",            color: "red" },
      { value: "perdido",       label: "Perdido de Vista",     color: "orange" },
    ],
  },
  // onco_casos.especialidad — valores reales en BD son snake_case
  {
    collection: "onco_casos",
    fieldName: "especialidad",
    description: "Especialidad oncológica (valores reales: digestivo_alto, mama, etc.)",
    correctOptions: [
      { value: "digestivo_alto",       label: "Digestivo Alto",           color: "orange" },
      { value: "digestivo_bajo",       label: "Digestivo Bajo",           color: "default" },
      { value: "mama",                 label: "Mama",                     color: "pink" },
      { value: "ginecologia",          label: "Ginecología",              color: "purple" },
      { value: "urologia",             label: "Urología",                 color: "blue" },
      { value: "torax",                label: "Tórax",                    color: "cyan" },
      { value: "piel_partes_blandas",  label: "Piel y Partes Blandas",   color: "gold" },
      { value: "endocrinologia",       label: "Endocrinología",           color: "green" },
      { value: "hematologia",          label: "Hematología",              color: "red" },
      { value: "otro",                 label: "Otra Especialidad",        color: "default" },
    ],
  },
  // onco_casos.estadio_clinico
  {
    collection: "onco_casos",
    fieldName: "estadio_clinico",
    description: "Estadio clínico TNM",
    correctOptions: [
      { value: "I",    label: "Estadio I",    color: "green" },
      { value: "II",   label: "Estadio II",   color: "blue" },
      { value: "III",  label: "Estadio III",  color: "orange" },
      { value: "IV",   label: "Estadio IV",   color: "red" },
      { value: "0",    label: "In Situ (0)",  color: "cyan" },
      { value: "N/A",  label: "No Estadiado", color: "default" },
    ],
  },
  // onco_comite_casos.prioridad
  {
    collection: "onco_comite_casos",
    fieldName: "prioridad",
    description: "Prioridad de presentación en comité",
    correctOptions: [
      { value: "urgente",   label: "Urgente",  color: "red" },
      { value: "alta",      label: "Alta",     color: "orange" },
      { value: "media",     label: "Media",    color: "gold" },
      { value: "baja",      label: "Baja",     color: "default" },
    ],
  },
];

async function main(): Promise<void> {
  console.log("=== FIX ENUM ENCODING (P1-06) ===");
  console.log(`Instance: ${BASE}`);
  if (DRY) console.log("  [DRY-RUN] Sin aplicar cambios\n");
  else console.log("");

  let ok = 0, fail = 0;

  for (const fix of ENUM_FIXES) {
    console.log(`\n▶ ${fix.collection}.${fix.fieldName}`);
    console.log(`  ${fix.description}`);

    // 1. Obtener el campo actual para ver su uiSchema uid
    let fieldData: any;
    try {
      const result = await api("GET", `collections/${fix.collection}/fields:list?pageSize=100`);
      fieldData = (result.data || []).find((f: any) => f.name === fix.fieldName);
    } catch (e: any) {
      console.warn(`  ⚠ Error obteniendo campo: ${e.message}`);
      fail++;
      continue;
    }

    if (!fieldData) {
      console.warn(`  ⚠ Campo ${fix.fieldName} no encontrado en ${fix.collection}`);
      continue;
    }

    console.log(`  Field ID: ${fieldData.id} | Tipo: ${fieldData.type} | Interface: ${fieldData.interface}`);

    const uiSchemaUid = fieldData.uiSchema?.["x-uid"];
    const currentEnum = fieldData.uiSchema?.enum;

    if (currentEnum) {
      console.log(`  Options actuales: ${JSON.stringify(currentEnum).slice(0, 120)}...`);
    }

    // 2. Si tiene uiSchema uid, parchear via uiSchemas:patch
    if (uiSchemaUid) {
      console.log(`  uiSchema uid: ${uiSchemaUid}`);

      if (DRY) {
        console.log(`  [DRY-RUN] Parchearía options con ${fix.correctOptions.length} valores correctos`);
        ok++;
        continue;
      }

      try {
        await api("POST", "uiSchemas:patch", {
          "x-uid": uiSchemaUid,
          enum: fix.correctOptions,
        });
        console.log(`  ✅ Opciones corregidas (${fix.correctOptions.length} valores)`);
        ok++;
      } catch (e: any) {
        console.error(`  ❌ uiSchemas:patch falló: ${e.message}`);

        // Fallback: actualizar via collections/fields:update
        try {
          await api("POST", `collections/${fix.collection}/fields:update?filterByTk=${fieldData.id}`, {
            uiSchema: {
              ...fieldData.uiSchema,
              enum: fix.correctOptions,
            },
          });
          console.log(`  ✅ Corregido via fields:update`);
          ok++;
        } catch (e2: any) {
          console.error(`  ❌ fields:update también falló: ${e2.message}`);
          fail++;
        }
      }
    } else {
      // Sin uiSchema uid — actualizar directamente el campo
      console.log("  Sin uiSchema uid — actualizando via fields:update");

      if (DRY) {
        console.log(`  [DRY-RUN] Actualizaría enum del campo`);
        ok++;
        continue;
      }

      try {
        await api("POST", `collections/${fix.collection}/fields:update?filterByTk=${fieldData.id}`, {
          uiSchema: {
            ...(fieldData.uiSchema || {}),
            enum: fix.correctOptions,
          },
        });
        console.log(`  ✅ Enum actualizado`);
        ok++;
      } catch (e: any) {
        console.error(`  ❌ Error: ${e.message}`);
        fail++;
      }
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log("\n" + "─".repeat(50));
  console.log(`✅ Corregidos: ${ok}  ❌ Fallidos: ${fail}`);
  console.log("\nRecarga la UI de NocoBase para ver los cambios de encoding.");
}

main().catch(console.error);
