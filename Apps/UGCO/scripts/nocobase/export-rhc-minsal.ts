/**
 * export-rhc-minsal.ts  (P2-06)
 *
 * Exporta datos del Registro Hospitalario de Cáncer (RHC) en formato MINSAL.
 * Genera un archivo CSV con las variables requeridas por el estándar RHC.
 *
 * Ref: DIRECTRICES_Y_LINEAMIENTOS_PARA_LOS_REGISTROS_HOSPITALARIOS_DE_CANCER_RHC.pdf
 *
 * Variables RHC incluidas:
 *   Demográficas: RUT, nombre, apellidos, fecha_nacimiento, sexo, domicilio
 *   Clínicas: fecha_ingreso, diagnostico_principal, especialidad, estadio_clinico
 *   Morfología: tipo_histologico, topografia_cieo (si disponible)
 *   Tratamiento: tipo_episodio (de onco_episodios)
 *   Estado: estado actual del caso, fecha última actualización
 *
 * Uso:
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/export-rhc-minsal.ts
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/export-rhc-minsal.ts --year=2025
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/export-rhc-minsal.ts --output=rhc-export.csv
 */

import * as fs from "fs";
import * as path from "path";

const BASE = process.env.NOCOBASE_BASE_URL!;
const KEY  = process.env.NOCOBASE_API_KEY!;

const yearArg  = process.argv.find(a => a.startsWith("--year="))?.split("=")[1];
const outputArg = process.argv.find(a => a.startsWith("--output="))?.split("=")[1];
const YEAR = yearArg ? parseInt(yearArg) : new Date().getFullYear() - 1;
const OUTPUT_FILE = outputArg || `docs/reports/rhc-minsal-${YEAR}.csv`;

async function api(method: string, path_: string): Promise<any> {
  const res = await fetch(`${BASE}/${path_}`, {
    method,
    headers: { Authorization: `Bearer ${KEY}` },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path_} → ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

// ── Escapar valor CSV ─────────────────────────────────────────────────────────────
function csvEscape(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toRow(fields: unknown[]): string {
  return fields.map(csvEscape).join(",");
}

// ── Formatear fecha ───────────────────────────────────────────────────────────────
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ── Encabezados RHC MINSAL ────────────────────────────────────────────────────────
const RHC_HEADERS = [
  // Identificación
  "RUT",
  "NOMBRE",
  "APELLIDO_PATERNO",
  "APELLIDO_MATERNO",
  "FECHA_NACIMIENTO",
  "SEXO",
  // Diagnóstico
  "ESPECIALIDAD",
  "FECHA_INGRESO",
  "DIAGNOSTICO_PRINCIPAL",
  "ESTADIO_CLINICO",
  "TNM_T",
  "TNM_N",
  "TNM_M",
  // Episodios de tratamiento
  "TIPOS_EPISODIO",
  "FECHA_PRIMER_EPISODIO",
  "FECHA_ULTIMO_EPISODIO",
  "TOTAL_EPISODIOS",
  // Estado
  "ESTADO_CASO",
  "FECHA_ULTIMA_ACTUALIZACION",
  // Metadatos
  "ID_CASO",
  "OBSERVACIONES",
];

async function main(): Promise<void> {
  console.log("=== EXPORTACIÓN RHC MINSAL (P2-06) ===");
  console.log(`Instancia: ${BASE}`);
  console.log(`Año de referencia: ${YEAR}`);
  console.log(`Archivo de salida: ${OUTPUT_FILE}\n`);

  // 1. Obtener todos los casos (con paginación)
  console.log("▶ Obteniendo casos oncológicos...");
  const allCases: any[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const result = await api("GET",
      `onco_casos:list?pageSize=${pageSize}&page=${page}&sort=-fecha_ingreso&appends[]=episodios`
    );
    const data: any[] = result.data || [];
    if (data.length === 0) break;
    allCases.push(...data);
    console.log(`  Página ${page}: ${data.length} casos (total: ${allCases.length})`);
    if (data.length < pageSize) break;
    page++;
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`  Total casos: ${allCases.length}`);

  // 2. Filtrar por año si se especificó
  const filteredCases = yearArg
    ? allCases.filter(c => {
        const d = new Date(c.fecha_ingreso || c.createdAt || "");
        return d.getFullYear() === YEAR;
      })
    : allCases;

  console.log(`  Casos para exportar: ${filteredCases.length}${yearArg ? ` (año ${YEAR})` : ""}`);

  if (filteredCases.length === 0) {
    console.log("  ⚠ No hay casos para exportar");
    return;
  }

  // 3. Obtener episodios para cada caso (batch)
  console.log("\n▶ Obteniendo episodios por caso...");
  const episodiosByCaso: Record<number, any[]> = {};
  let episodiosPage = 1;
  const allEpisodios: any[] = [];

  while (true) {
    const result = await api("GET",
      `onco_episodios:list?pageSize=200&page=${episodiosPage}&sort=fecha`
    );
    const data: any[] = result.data || [];
    if (data.length === 0) break;
    allEpisodios.push(...data);
    if (data.length < 200) break;
    episodiosPage++;
    await new Promise(r => setTimeout(r, 200));
  }

  for (const ep of allEpisodios) {
    const casoId = ep.caso_id;
    if (!episodiosByCaso[casoId]) episodiosByCaso[casoId] = [];
    episodiosByCaso[casoId].push(ep);
  }
  console.log(`  Total episodios cargados: ${allEpisodios.length}`);

  // 4. Construir CSV
  console.log("\n▶ Generando CSV...");
  const rows: string[] = [RHC_HEADERS.join(",")];

  for (const caso of filteredCases) {
    const episodios = episodiosByCaso[caso.id] || [];
    const tipos = [...new Set(episodios.map((e: any) => e.tipo_episodio).filter(Boolean))].join("|");
    const fechaPrimera = episodios[0]?.fecha || "";
    const fechaUltima  = episodios[episodios.length - 1]?.fecha || "";

    // Parsear nombre completo (puede estar en paciente_nombre como "Nombre Apellido")
    const nombreCompleto = caso.paciente_nombre || "";
    const partes = nombreCompleto.trim().split(/\s+/);
    const nombre = partes[0] || "";
    const apellidoPaterno = partes[1] || "";
    const apellidoMaterno = partes[2] || "";

    const row = [
      caso.rut_paciente || "",
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      formatDate(caso.fecha_nacimiento),
      caso.sexo || "",
      caso.especialidad || "",
      formatDate(caso.fecha_ingreso),
      caso.diagnostico_principal || "",
      caso.estadio_clinico || "",
      caso.tnm_t || "",
      caso.tnm_n || "",
      caso.tnm_m || "",
      tipos,
      formatDate(fechaPrimera),
      formatDate(fechaUltima),
      episodios.length,
      caso.estado || "",
      formatDate(caso.updatedAt),
      caso.id,
      caso.observaciones || "",
    ];

    rows.push(toRow(row));
  }

  // 5. Guardar archivo
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Agregar BOM para que Excel en Windows abra correctamente con UTF-8
  const BOM = "\uFEFF";
  fs.writeFileSync(OUTPUT_FILE, BOM + rows.join("\n"), "utf-8");

  console.log("\n" + "─".repeat(50));
  console.log(`✅ Exportación RHC completada`);
  console.log(`   Archivo: ${OUTPUT_FILE}`);
  console.log(`   Filas: ${rows.length - 1} casos + encabezado`);
  console.log(`\nNota: Columnas TNM, fecha_nacimiento y sexo pueden estar vacías`);
  console.log("si no se registraron durante el ingreso del caso.");
}

main().catch(console.error);
