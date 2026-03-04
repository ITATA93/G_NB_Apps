/**
 * seed-cie-o-catalog.ts  (P1-04)
 *
 * Carga el catálogo CIE-O-3 en las colecciones de referencia UGCO:
 *   - UGCO_REF_oncomorfologiaicdo  (morfología: códigos XXXX/Y)
 *   - UGCO_REF_oncotopografiaicdo  (topografía: códigos CXX.X)
 *
 * Estrategia: CREATE de registros con codigo_oficial definido.
 *   Verifica primero si el código ya existe (idempotente).
 *   No elimina registros existentes con codigo_oficial=null.
 *
 * Uso:
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/seed-cie-o-catalog.ts --dry-run
 *   npx tsx --env-file=.env Apps/UGCO/scripts/nocobase/seed-cie-o-catalog.ts
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
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

// ── Catálogo CIE-O-3 Morfología ─────────────────────────────────────────────
// Formato: codigo_oficial (XXXX/Y), descripcion, comportamiento, es_maligno

interface MorfologiaRecord {
  codigo_oficial: string;
  descripcion: string;
  comportamiento: string;
  es_maligno: boolean;
  activo: boolean;
}

const MORFOLOGIA: MorfologiaRecord[] = [
  // ── Neoplasias NOS ──
  { codigo_oficial: "8000/0", descripcion: "Neoplasia benigna", comportamiento: "Benigno", es_maligno: false, activo: true },
  { codigo_oficial: "8000/1", descripcion: "Neoplasia incierta", comportamiento: "Incierto", es_maligno: false, activo: true },
  { codigo_oficial: "8000/3", descripcion: "Neoplasia maligna, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8000/6", descripcion: "Neoplasia maligna, metastásica", comportamiento: "Metastásico", es_maligno: true, activo: true },
  // ── Carcinomas epiteliales ──
  { codigo_oficial: "8010/2", descripcion: "Carcinoma in situ, NOS", comportamiento: "In situ", es_maligno: true, activo: true },
  { codigo_oficial: "8010/3", descripcion: "Carcinoma, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8020/3", descripcion: "Carcinoma indiferenciado, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8021/3", descripcion: "Carcinoma anaplásico, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  // ── Carcinoma de células escamosas ──
  { codigo_oficial: "8070/2", descripcion: "Carcinoma escamoso in situ, NOS", comportamiento: "In situ", es_maligno: true, activo: true },
  { codigo_oficial: "8070/3", descripcion: "Carcinoma de células escamosas, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8071/3", descripcion: "Carcinoma escamoso queratinizante, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8072/3", descripcion: "Carcinoma escamoso de células grandes no queratinizante", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8074/3", descripcion: "Carcinoma escamoso fusocelular", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8076/2", descripcion: "Carcinoma escamoso in situ con questionable invasión", comportamiento: "In situ", es_maligno: true, activo: true },
  { codigo_oficial: "8083/3", descripcion: "Carcinoma basaloide de células escamosas", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  // ── Adenocarcinomas ──
  { codigo_oficial: "8140/2", descripcion: "Adenocarcinoma in situ, NOS", comportamiento: "In situ", es_maligno: true, activo: true },
  { codigo_oficial: "8140/3", descripcion: "Adenocarcinoma, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8143/3", descripcion: "Adenocarcinoma serrato superficial", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8144/3", descripcion: "Adenocarcinoma de tipo intestinal", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8145/3", descripcion: "Carcinoma difuso", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8200/3", descripcion: "Carcinoma adenoide quístico", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8210/0", descripcion: "Pólipo adenomatoso, NOS", comportamiento: "Benigno", es_maligno: false, activo: true },
  { codigo_oficial: "8210/3", descripcion: "Adenocarcinoma en pólipo adenomatoso", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8211/3", descripcion: "Adenocarcinoma tubular", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8220/0", descripcion: "Poliposis adenomatosa familiar", comportamiento: "Benigno", es_maligno: false, activo: true },
  { codigo_oficial: "8240/1", descripcion: "Tumor carcinoide, NOS", comportamiento: "Incierto", es_maligno: false, activo: true },
  { codigo_oficial: "8240/3", descripcion: "Tumor neuroendocrino maligno, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8243/3", descripcion: "Carcinoma de células tipo caliciforme", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8246/3", descripcion: "Carcinoma neuroendocrino, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8249/3", descripcion: "Tumor carcinoide atípico", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8250/3", descripcion: "Adenocarcinoma lepídico, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8255/3", descripcion: "Adenocarcinoma con patrones mixtos", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8260/3", descripcion: "Adenocarcinoma papilar, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8261/2", descripcion: "Adenocarcinoma villoso in situ", comportamiento: "In situ", es_maligno: true, activo: true },
  { codigo_oficial: "8261/3", descripcion: "Adenocarcinoma en adenoma velloso", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8262/3", descripcion: "Adenocarcinoma villoglándular", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8263/2", descripcion: "Adenocarcinoma tubulovelloso in situ", comportamiento: "In situ", es_maligno: true, activo: true },
  { codigo_oficial: "8310/3", descripcion: "Adenocarcinoma de células claras", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8323/3", descripcion: "Adenocarcinoma mixto de células", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8380/3", descripcion: "Adenocarcinoma endometrioide, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8382/3", descripcion: "Adenocarcinoma endometrioide secretor", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8440/0", descripcion: "Cistoadenoma, NOS", comportamiento: "Benigno", es_maligno: false, activo: true },
  { codigo_oficial: "8440/3", descripcion: "Cistoadenocarcinoma, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8441/3", descripcion: "Cistoadenocarcinoma seroso, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8460/3", descripcion: "Cistoadenocarcinoma seroso papilar", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8470/3", descripcion: "Cistoadenocarcinoma mucinoso, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8480/3", descripcion: "Adenocarcinoma mucinoso", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8481/3", descripcion: "Adenocarcinoma productivo de mucina, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8490/3", descripcion: "Carcinoma de células en anillo de sello", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  // ── Carcinoma ductal/lobulillar de mama ──
  { codigo_oficial: "8500/2", descripcion: "Carcinoma intraductal in situ", comportamiento: "In situ", es_maligno: true, activo: true },
  { codigo_oficial: "8500/3", descripcion: "Carcinoma ductal infiltrante, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8501/2", descripcion: "Comedo-carcinoma, no infiltrante", comportamiento: "In situ", es_maligno: true, activo: true },
  { codigo_oficial: "8502/3", descripcion: "Carcinoma secretor", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8510/3", descripcion: "Carcinoma medular, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8512/3", descripcion: "Carcinoma medular con estroma linfoide", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8520/2", descripcion: "Carcinoma lobulillar in situ, NOS", comportamiento: "In situ", es_maligno: true, activo: true },
  { codigo_oficial: "8520/3", descripcion: "Carcinoma lobulillar infiltrante, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8522/2", descripcion: "Carcinoma intraductal e intralobulillar in situ", comportamiento: "In situ", es_maligno: true, activo: true },
  { codigo_oficial: "8522/3", descripcion: "Carcinoma ductal infiltrante y lobulillar", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8530/3", descripcion: "Carcinoma inflamatorio", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8541/3", descripcion: "Enfermedad de Paget y carcinoma infiltrante de mama", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  // ── Carcinoma hepatocelular / colangiocarcinoma ──
  { codigo_oficial: "8160/3", descripcion: "Colangiocarcinoma", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8170/3", descripcion: "Carcinoma hepatocelular, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8180/3", descripcion: "Carcinoma hepatocelular y colangiocarcinoma combinados", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  // ── Carcinoma de células renales ──
  { codigo_oficial: "8310/3", descripcion: "Carcinoma de células claras, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8316/3", descripcion: "Carcinoma de células renales, cromófobo", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8317/3", descripcion: "Carcinoma de células renales, sarcomatoide", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8319/3", descripcion: "Carcinoma de conductos colectores", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  // ── Carcinoma de células transicionales ──
  { codigo_oficial: "8120/2", descripcion: "Carcinoma transicional in situ", comportamiento: "In situ", es_maligno: true, activo: true },
  { codigo_oficial: "8120/3", descripcion: "Carcinoma de células transicionales, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8130/2", descripcion: "Carcinoma papilar de células transicionales, no infiltrante", comportamiento: "In situ", es_maligno: true, activo: true },
  { codigo_oficial: "8130/3", descripcion: "Carcinoma papilar de células transicionales", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  // ── Carcinoma tiroideo ──
  { codigo_oficial: "8330/3", descripcion: "Adenocarcinoma folicular, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8340/3", descripcion: "Carcinoma papilar, variante folicular", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8341/3", descripcion: "Carcinoma papilar microinvasivo", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8345/3", descripcion: "Carcinoma medular con amiloide", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8350/3", descripcion: "Carcinoma de tiroides no encapsulado con crecimiento folicular", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  // ── Melanoma ──
  { codigo_oficial: "8720/0", descripcion: "Nevus pigmentado, NOS", comportamiento: "Benigno", es_maligno: false, activo: true },
  { codigo_oficial: "8720/2", descripcion: "Melanoma in situ", comportamiento: "In situ", es_maligno: true, activo: true },
  { codigo_oficial: "8720/3", descripcion: "Melanoma maligno, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8721/3", descripcion: "Melanoma nodular", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8730/3", descripcion: "Melanoma amelanótico", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  // ── Sarcomas ──
  { codigo_oficial: "8800/3", descripcion: "Sarcoma, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8801/3", descripcion: "Sarcoma fusocelular", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8802/3", descripcion: "Sarcoma células gigantes (excepto hueso)", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8810/3", descripcion: "Fibrosarcoma, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8830/3", descripcion: "Histiocitoma fibroso maligno", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8890/3", descripcion: "Leiomiosarcoma, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8900/3", descripcion: "Rabdomiosarcoma, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8910/3", descripcion: "Rabdomiosarcoma embrionario, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8920/3", descripcion: "Rabdomiosarcoma alveolar", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8935/3", descripcion: "Tumor del estroma endometrial, maligno", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "8950/3", descripcion: "Tumor de Müller maligno mixto", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  // ── GIST ──
  { codigo_oficial: "8936/1", descripcion: "Tumor del estroma gastrointestinal, incierto", comportamiento: "Incierto", es_maligno: false, activo: true },
  { codigo_oficial: "8936/3", descripcion: "Tumor del estroma gastrointestinal, maligno", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  // ── Tumores óseos ──
  { codigo_oficial: "9180/3", descripcion: "Osteosarcoma, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9220/3", descripcion: "Condrosarcoma, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9260/3", descripcion: "Sarcoma de Ewing", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  // ── Linfomas ──
  { codigo_oficial: "9590/3", descripcion: "Linfoma maligno, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9650/3", descripcion: "Enfermedad de Hodgkin, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9651/3", descripcion: "Enfermedad de Hodgkin, predominio linfocítico", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9652/3", descripcion: "Enfermedad de Hodgkin, esclerosis nodular, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9659/3", descripcion: "Linfoma Hodgkin clásico, predominio linfocítico rico", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9670/3", descripcion: "Linfoma de células B de zona marginal esplénica", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9671/3", descripcion: "Linfoma linfoplasmacítico", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9673/3", descripcion: "Linfoma del manto", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9680/3", descripcion: "Linfoma difuso de células grandes B, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9687/3", descripcion: "Linfoma de Burkitt, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9700/3", descripcion: "Micosis fungoide", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9702/3", descripcion: "Linfoma de células T periféricas, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9714/3", descripcion: "Linfoma de células T anaplásico grande, ALK positivo", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  // ── Leucemias ──
  { codigo_oficial: "9800/3", descripcion: "Leucemia, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9823/3", descripcion: "Leucemia linfocítica crónica de células B", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9826/3", descripcion: "Leucemia linfoblástica aguda tipo Burkitt", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9835/3", descripcion: "Leucemia linfoblástica aguda de precursores B, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9836/3", descripcion: "Leucemia linfoblástica aguda de células B", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9840/3", descripcion: "Leucemia mieloide aguda con maduración", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9861/3", descripcion: "Leucemia mieloide aguda, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9863/3", descripcion: "Leucemia mieloide crónica, BCR-ABL positiva", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9875/3", descripcion: "Leucemia mieloide crónica, BCR-ABL", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  // ── Mieloma ──
  { codigo_oficial: "9731/3", descripcion: "Plasmocitoma, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9732/3", descripcion: "Mieloma múltiple", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  // ── Tumores germinales ──
  { codigo_oficial: "9060/3", descripcion: "Disgerminoma", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9061/3", descripcion: "Seminoma, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9070/3", descripcion: "Tumor del seno endodérmico", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9080/3", descripcion: "Teratoma inmaduro, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
  { codigo_oficial: "9100/3", descripcion: "Coriocarcinoma, NOS", comportamiento: "Maligno, sitio primario", es_maligno: true, activo: true },
];

// ── Catálogo CIE-O-3 Topografía ─────────────────────────────────────────────

interface TopografiaRecord {
  codigo_oficial: string;
  sitio_anatomico: string;
  grupo_tumor: string;
  descripcion: string;
  activo: boolean;
}

const TOPOGRAFIA: TopografiaRecord[] = [
  // ── Cabeza y cuello ──
  { codigo_oficial: "C00", sitio_anatomico: "Labio", grupo_tumor: "Cabeza y Cuello", descripcion: "Neoplasia maligna del labio", activo: true },
  { codigo_oficial: "C01", sitio_anatomico: "Base de la lengua", grupo_tumor: "Cabeza y Cuello", descripcion: "Neoplasia maligna de la base de la lengua", activo: true },
  { codigo_oficial: "C02", sitio_anatomico: "Otras partes de la lengua", grupo_tumor: "Cabeza y Cuello", descripcion: "Neoplasia maligna de otras partes de la lengua", activo: true },
  { codigo_oficial: "C03", sitio_anatomico: "Encía", grupo_tumor: "Cabeza y Cuello", descripcion: "Neoplasia maligna de la encía", activo: true },
  { codigo_oficial: "C04", sitio_anatomico: "Suelo de la boca", grupo_tumor: "Cabeza y Cuello", descripcion: "Neoplasia maligna del suelo de la boca", activo: true },
  { codigo_oficial: "C05", sitio_anatomico: "Paladar", grupo_tumor: "Cabeza y Cuello", descripcion: "Neoplasia maligna del paladar", activo: true },
  { codigo_oficial: "C06", sitio_anatomico: "Otras partes de la boca", grupo_tumor: "Cabeza y Cuello", descripcion: "Neoplasia maligna de otras partes y inespecíficas de la boca", activo: true },
  { codigo_oficial: "C07", sitio_anatomico: "Glándula parótida", grupo_tumor: "Cabeza y Cuello", descripcion: "Neoplasia maligna de la glándula parótida", activo: true },
  { codigo_oficial: "C08", sitio_anatomico: "Glándulas salivales", grupo_tumor: "Cabeza y Cuello", descripcion: "Neoplasia maligna de otras glándulas salivales", activo: true },
  { codigo_oficial: "C09", sitio_anatomico: "Amígdala", grupo_tumor: "Cabeza y Cuello", descripcion: "Neoplasia maligna de la amígdala", activo: true },
  { codigo_oficial: "C10", sitio_anatomico: "Orofaringe", grupo_tumor: "Cabeza y Cuello", descripcion: "Neoplasia maligna de la orofaringe", activo: true },
  { codigo_oficial: "C11", sitio_anatomico: "Nasofaringe", grupo_tumor: "Cabeza y Cuello", descripcion: "Neoplasia maligna de la nasofaringe", activo: true },
  { codigo_oficial: "C12", sitio_anatomico: "Seno piriforme", grupo_tumor: "Cabeza y Cuello", descripcion: "Neoplasia maligna del seno piriforme", activo: true },
  { codigo_oficial: "C13", sitio_anatomico: "Hipofaringe", grupo_tumor: "Cabeza y Cuello", descripcion: "Neoplasia maligna de la hipofaringe", activo: true },
  { codigo_oficial: "C14", sitio_anatomico: "Labio, cavidad oral y faringe", grupo_tumor: "Cabeza y Cuello", descripcion: "Neoplasia maligna de otras localizaciones mal definidas", activo: true },
  // ── Digestivo ──
  { codigo_oficial: "C15", sitio_anatomico: "Esófago", grupo_tumor: "Digestivo", descripcion: "Neoplasia maligna del esófago", activo: true },
  { codigo_oficial: "C16", sitio_anatomico: "Estómago", grupo_tumor: "Digestivo", descripcion: "Neoplasia maligna del estómago", activo: true },
  { codigo_oficial: "C17", sitio_anatomico: "Intestino delgado", grupo_tumor: "Digestivo", descripcion: "Neoplasia maligna del intestino delgado", activo: true },
  { codigo_oficial: "C18", sitio_anatomico: "Colon", grupo_tumor: "Digestivo", descripcion: "Neoplasia maligna del colon", activo: true },
  { codigo_oficial: "C18.0", sitio_anatomico: "Ciego", grupo_tumor: "Digestivo", descripcion: "Neoplasia maligna del ciego", activo: true },
  { codigo_oficial: "C18.2", sitio_anatomico: "Colon ascendente", grupo_tumor: "Digestivo", descripcion: "Neoplasia maligna del colon ascendente", activo: true },
  { codigo_oficial: "C18.4", sitio_anatomico: "Colon transverso", grupo_tumor: "Digestivo", descripcion: "Neoplasia maligna del colon transverso", activo: true },
  { codigo_oficial: "C18.6", sitio_anatomico: "Colon descendente", grupo_tumor: "Digestivo", descripcion: "Neoplasia maligna del colon descendente", activo: true },
  { codigo_oficial: "C18.7", sitio_anatomico: "Colon sigmoide", grupo_tumor: "Digestivo", descripcion: "Neoplasia maligna del colon sigmoide", activo: true },
  { codigo_oficial: "C19", sitio_anatomico: "Unión rectosigmoidea", grupo_tumor: "Digestivo", descripcion: "Neoplasia maligna de la unión rectosigmoidea", activo: true },
  { codigo_oficial: "C20", sitio_anatomico: "Recto", grupo_tumor: "Digestivo", descripcion: "Neoplasia maligna del recto", activo: true },
  { codigo_oficial: "C21", sitio_anatomico: "Ano y conducto anal", grupo_tumor: "Digestivo", descripcion: "Neoplasia maligna del ano y del conducto anal", activo: true },
  { codigo_oficial: "C22", sitio_anatomico: "Hígado y vías biliares intrahepáticas", grupo_tumor: "Digestivo", descripcion: "Neoplasia maligna del hígado", activo: true },
  { codigo_oficial: "C23", sitio_anatomico: "Vesícula biliar", grupo_tumor: "Digestivo", descripcion: "Neoplasia maligna de la vesícula biliar", activo: true },
  { codigo_oficial: "C24", sitio_anatomico: "Vías biliares", grupo_tumor: "Digestivo", descripcion: "Neoplasia maligna de otras partes de las vías biliares", activo: true },
  { codigo_oficial: "C25", sitio_anatomico: "Páncreas", grupo_tumor: "Digestivo", descripcion: "Neoplasia maligna del páncreas", activo: true },
  { codigo_oficial: "C26", sitio_anatomico: "Otros órganos digestivos", grupo_tumor: "Digestivo", descripcion: "Neoplasia maligna de otros órganos digestivos", activo: true },
  // ── Respiratorio ──
  { codigo_oficial: "C30", sitio_anatomico: "Fosas nasales", grupo_tumor: "Respiratorio", descripcion: "Neoplasia maligna de las fosas nasales", activo: true },
  { codigo_oficial: "C31", sitio_anatomico: "Senos paranasales", grupo_tumor: "Respiratorio", descripcion: "Neoplasia maligna de los senos paranasales", activo: true },
  { codigo_oficial: "C32", sitio_anatomico: "Laringe", grupo_tumor: "Respiratorio", descripcion: "Neoplasia maligna de la laringe", activo: true },
  { codigo_oficial: "C33", sitio_anatomico: "Tráquea", grupo_tumor: "Respiratorio", descripcion: "Neoplasia maligna de la tráquea", activo: true },
  { codigo_oficial: "C34", sitio_anatomico: "Bronquios y pulmón", grupo_tumor: "Respiratorio", descripcion: "Neoplasia maligna de los bronquios y del pulmón", activo: true },
  { codigo_oficial: "C34.1", sitio_anatomico: "Lóbulo superior, bronquio o pulmón", grupo_tumor: "Respiratorio", descripcion: "Neoplasia maligna del lóbulo superior", activo: true },
  { codigo_oficial: "C34.2", sitio_anatomico: "Lóbulo medio, bronquio o pulmón", grupo_tumor: "Respiratorio", descripcion: "Neoplasia maligna del lóbulo medio", activo: true },
  { codigo_oficial: "C34.3", sitio_anatomico: "Lóbulo inferior, bronquio o pulmón", grupo_tumor: "Respiratorio", descripcion: "Neoplasia maligna del lóbulo inferior", activo: true },
  { codigo_oficial: "C37", sitio_anatomico: "Timo", grupo_tumor: "Respiratorio", descripcion: "Neoplasia maligna del timo", activo: true },
  { codigo_oficial: "C38", sitio_anatomico: "Corazón, mediastino y pleura", grupo_tumor: "Respiratorio", descripcion: "Neoplasia maligna del corazón, mediastino y pleura", activo: true },
  { codigo_oficial: "C39", sitio_anatomico: "Otros órganos respiratorios", grupo_tumor: "Respiratorio", descripcion: "Neoplasia maligna de otros sitios del aparato respiratorio", activo: true },
  // ── Óseo y tejidos blandos ──
  { codigo_oficial: "C40", sitio_anatomico: "Hueso y cartílago articular (extremidades)", grupo_tumor: "Óseo", descripcion: "Neoplasia maligna del hueso y cartílago articular de los miembros", activo: true },
  { codigo_oficial: "C41", sitio_anatomico: "Hueso y cartílago articular (otros)", grupo_tumor: "Óseo", descripcion: "Neoplasia maligna del hueso y cartílago articular de otros sitios", activo: true },
  { codigo_oficial: "C47", sitio_anatomico: "Nervios periféricos y sistema nervioso autónomo", grupo_tumor: "Tejidos Blandos", descripcion: "Neoplasia maligna de nervios periféricos", activo: true },
  { codigo_oficial: "C48", sitio_anatomico: "Retroperitoneo y peritoneo", grupo_tumor: "Tejidos Blandos", descripcion: "Neoplasia maligna del retroperitoneo y del peritoneo", activo: true },
  { codigo_oficial: "C49", sitio_anatomico: "Tejido conjuntivo y blando", grupo_tumor: "Tejidos Blandos", descripcion: "Neoplasia maligna de otros tejidos conjuntivos y blandos", activo: true },
  // ── Piel ──
  { codigo_oficial: "C43", sitio_anatomico: "Melanoma maligno de la piel", grupo_tumor: "Piel", descripcion: "Melanoma maligno de la piel", activo: true },
  { codigo_oficial: "C44", sitio_anatomico: "Otros tumores malignos de la piel", grupo_tumor: "Piel", descripcion: "Otros tumores malignos de la piel", activo: true },
  // ── Mama ──
  { codigo_oficial: "C50", sitio_anatomico: "Mama", grupo_tumor: "Mama", descripcion: "Neoplasia maligna de la mama", activo: true },
  { codigo_oficial: "C50.1", sitio_anatomico: "Porción central de la mama", grupo_tumor: "Mama", descripcion: "Neoplasia maligna de la porción central de la mama", activo: true },
  { codigo_oficial: "C50.2", sitio_anatomico: "Cuadrante superior interno de la mama", grupo_tumor: "Mama", descripcion: "Neoplasia maligna del cuadrante superior interno", activo: true },
  { codigo_oficial: "C50.3", sitio_anatomico: "Cuadrante inferior interno de la mama", grupo_tumor: "Mama", descripcion: "Neoplasia maligna del cuadrante inferior interno", activo: true },
  { codigo_oficial: "C50.4", sitio_anatomico: "Cuadrante superior externo de la mama", grupo_tumor: "Mama", descripcion: "Neoplasia maligna del cuadrante superior externo", activo: true },
  { codigo_oficial: "C50.5", sitio_anatomico: "Cuadrante inferior externo de la mama", grupo_tumor: "Mama", descripcion: "Neoplasia maligna del cuadrante inferior externo", activo: true },
  // ── Ginecológico ──
  { codigo_oficial: "C51", sitio_anatomico: "Vulva", grupo_tumor: "Ginecología", descripcion: "Neoplasia maligna de la vulva", activo: true },
  { codigo_oficial: "C52", sitio_anatomico: "Vagina", grupo_tumor: "Ginecología", descripcion: "Neoplasia maligna de la vagina", activo: true },
  { codigo_oficial: "C53", sitio_anatomico: "Cuello del útero", grupo_tumor: "Ginecología", descripcion: "Neoplasia maligna del cuello del útero", activo: true },
  { codigo_oficial: "C54", sitio_anatomico: "Cuerpo del útero", grupo_tumor: "Ginecología", descripcion: "Neoplasia maligna del cuerpo del útero", activo: true },
  { codigo_oficial: "C55", sitio_anatomico: "Útero, porción no especificada", grupo_tumor: "Ginecología", descripcion: "Neoplasia maligna del útero, porción no especificada", activo: true },
  { codigo_oficial: "C56", sitio_anatomico: "Ovario", grupo_tumor: "Ginecología", descripcion: "Neoplasia maligna del ovario", activo: true },
  { codigo_oficial: "C57", sitio_anatomico: "Otros órganos genitales femeninos", grupo_tumor: "Ginecología", descripcion: "Neoplasia maligna de otros órganos genitales femeninos", activo: true },
  { codigo_oficial: "C58", sitio_anatomico: "Placenta", grupo_tumor: "Ginecología", descripcion: "Neoplasia maligna de la placenta", activo: true },
  // ── Genital masculino ──
  { codigo_oficial: "C60", sitio_anatomico: "Pene", grupo_tumor: "Urología", descripcion: "Neoplasia maligna del pene", activo: true },
  { codigo_oficial: "C61", sitio_anatomico: "Próstata", grupo_tumor: "Urología", descripcion: "Neoplasia maligna de la próstata", activo: true },
  { codigo_oficial: "C62", sitio_anatomico: "Testículo", grupo_tumor: "Urología", descripcion: "Neoplasia maligna del testículo", activo: true },
  { codigo_oficial: "C63", sitio_anatomico: "Otros genitales masculinos", grupo_tumor: "Urología", descripcion: "Neoplasia maligna de otros genitales masculinos", activo: true },
  // ── Urinario ──
  { codigo_oficial: "C64", sitio_anatomico: "Riñón, excepto pelvis renal", grupo_tumor: "Urología", descripcion: "Neoplasia maligna del riñón, excepto de la pelvis renal", activo: true },
  { codigo_oficial: "C65", sitio_anatomico: "Pelvis renal", grupo_tumor: "Urología", descripcion: "Neoplasia maligna de la pelvis renal", activo: true },
  { codigo_oficial: "C66", sitio_anatomico: "Uréter", grupo_tumor: "Urología", descripcion: "Neoplasia maligna del uréter", activo: true },
  { codigo_oficial: "C67", sitio_anatomico: "Vejiga urinaria", grupo_tumor: "Urología", descripcion: "Neoplasia maligna de la vejiga urinaria", activo: true },
  { codigo_oficial: "C68", sitio_anatomico: "Otros urinarios", grupo_tumor: "Urología", descripcion: "Neoplasia maligna de otros órganos urinarios", activo: true },
  // ── Ojo y SNC ──
  { codigo_oficial: "C69", sitio_anatomico: "Ojo y anexos", grupo_tumor: "Neurológico", descripcion: "Neoplasia maligna del ojo y sus anexos", activo: true },
  { codigo_oficial: "C70", sitio_anatomico: "Meninges", grupo_tumor: "Neurológico", descripcion: "Neoplasia maligna de las meninges", activo: true },
  { codigo_oficial: "C71", sitio_anatomico: "Encéfalo", grupo_tumor: "Neurológico", descripcion: "Neoplasia maligna del encéfalo", activo: true },
  { codigo_oficial: "C71.1", sitio_anatomico: "Lóbulo frontal", grupo_tumor: "Neurológico", descripcion: "Neoplasia maligna del lóbulo frontal", activo: true },
  { codigo_oficial: "C71.2", sitio_anatomico: "Lóbulo temporal", grupo_tumor: "Neurológico", descripcion: "Neoplasia maligna del lóbulo temporal", activo: true },
  { codigo_oficial: "C71.4", sitio_anatomico: "Lóbulo occipital", grupo_tumor: "Neurológico", descripcion: "Neoplasia maligna del lóbulo occipital", activo: true },
  { codigo_oficial: "C71.6", sitio_anatomico: "Cerebelo", grupo_tumor: "Neurológico", descripcion: "Neoplasia maligna del cerebelo", activo: true },
  { codigo_oficial: "C72", sitio_anatomico: "Médula espinal, nervios craneales y SNC", grupo_tumor: "Neurológico", descripcion: "Neoplasia maligna de la médula espinal", activo: true },
  // ── Endocrino ──
  { codigo_oficial: "C73", sitio_anatomico: "Tiroides", grupo_tumor: "Endocrino", descripcion: "Neoplasia maligna de la glándula tiroides", activo: true },
  { codigo_oficial: "C74", sitio_anatomico: "Glándula suprarrenal", grupo_tumor: "Endocrino", descripcion: "Neoplasia maligna de la glándula suprarrenal", activo: true },
  { codigo_oficial: "C75", sitio_anatomico: "Otras glándulas endocrinas", grupo_tumor: "Endocrino", descripcion: "Neoplasia maligna de otras glándulas endocrinas", activo: true },
  // ── Ganglios ──
  { codigo_oficial: "C77", sitio_anatomico: "Ganglios linfáticos secundarios", grupo_tumor: "Hematolinfático", descripcion: "Neoplasia maligna secundaria de ganglios linfáticos", activo: true },
  { codigo_oficial: "C77.0", sitio_anatomico: "Ganglios linfáticos de cabeza, cara y cuello", grupo_tumor: "Hematolinfático", descripcion: "Ganglios linfáticos de cabeza, cara y cuello", activo: true },
  { codigo_oficial: "C77.1", sitio_anatomico: "Ganglios linfáticos intratorácicos", grupo_tumor: "Hematolinfático", descripcion: "Ganglios linfáticos intratorácicos", activo: true },
  { codigo_oficial: "C77.2", sitio_anatomico: "Ganglios linfáticos intraabdominales", grupo_tumor: "Hematolinfático", descripcion: "Ganglios linfáticos intraabdominales", activo: true },
  { codigo_oficial: "C77.3", sitio_anatomico: "Ganglios linfáticos axilares", grupo_tumor: "Hematolinfático", descripcion: "Ganglios linfáticos axilares e ipsilaterales de miembro superior", activo: true },
  { codigo_oficial: "C77.4", sitio_anatomico: "Ganglios linfáticos inguinales", grupo_tumor: "Hematolinfático", descripcion: "Ganglios linfáticos inguinales e ipsilaterales de miembro inferior", activo: true },
  { codigo_oficial: "C77.5", sitio_anatomico: "Ganglios linfáticos pélvicos", grupo_tumor: "Hematolinfático", descripcion: "Ganglios linfáticos intrapélvicos", activo: true },
  // ── Sitio primario desconocido / múltiple ──
  { codigo_oficial: "C76", sitio_anatomico: "Otros sitios y mal definidos", grupo_tumor: "Otros", descripcion: "Neoplasia maligna de otros sitios y mal definidos", activo: true },
  { codigo_oficial: "C80", sitio_anatomico: "Sitio primario desconocido", grupo_tumor: "Otros", descripcion: "Neoplasia maligna, sitio primario desconocido", activo: true },
];

// ── Seed functions ────────────────────────────────────────────────────────────

async function seedCollection<T extends Record<string, any>>(
  collection: string,
  records: T[],
  keyField: string,
): Promise<{ created: number; skipped: number; failed: number }> {
  let created = 0, skipped = 0, failed = 0;

  for (const record of records) {
    const keyValue = record[keyField];
    const encodedKey = encodeURIComponent(keyValue);

    // Check if exists
    try {
      const exists = await api("GET", `${collection}:list?filter[${keyField}]=${encodedKey}&pageSize=1`);
      if ((exists.meta?.count ?? 0) > 0) {
        process.stdout.write(".");
        skipped++;
        continue;
      }
    } catch (_e) {
      // Collection might not be accessible — skip
      skipped++;
      continue;
    }

    if (DRY) {
      process.stdout.write("+");
      created++;
      continue;
    }

    try {
      await api("POST", `${collection}:create`, record);
      process.stdout.write("✓");
      created++;
    } catch (e: any) {
      process.stdout.write("✗");
      failed++;
    }

    await new Promise(r => setTimeout(r, 80));
  }

  return { created, skipped, failed };
}

async function main(): Promise<void> {
  console.log("=== SEED CIE-O-3 CATALOG (P1-04) ===");
  console.log(`Instance: ${BASE}`);
  if (DRY) console.log("  [DRY-RUN] Sin aplicar cambios\n");
  else console.log("");

  // ── Morfología ────────────────────────────────────────────────────────────
  console.log(`\n▶ Morfología CIE-O-3 (${MORFOLOGIA.length} códigos)...`);
  const morfResult = await seedCollection(
    "UGCO_REF_oncomorfologiaicdo",
    MORFOLOGIA,
    "codigo_oficial",
  );
  console.log(`\n  ✅ Creados: ${morfResult.created}  ⏭ Existentes: ${morfResult.skipped}  ❌ Fallos: ${morfResult.failed}`);

  // ── Topografía ────────────────────────────────────────────────────────────
  console.log(`\n▶ Topografía CIE-O-3 (${TOPOGRAFIA.length} códigos)...`);
  const topoResult = await seedCollection(
    "UGCO_REF_oncotopografiaicdo",
    TOPOGRAFIA,
    "codigo_oficial",
  );
  console.log(`\n  ✅ Creados: ${topoResult.created}  ⏭ Existentes: ${topoResult.skipped}  ❌ Fallos: ${topoResult.failed}`);

  console.log("\n" + "─".repeat(50));
  console.log(`✅ Total creados: ${morfResult.created + topoResult.created}`);
  console.log(`⏭ Total existentes (con codigo_oficial): ${morfResult.skipped + topoResult.skipped}`);
  console.log("ℹ  Registros con codigo_oficial=null (datos previos) no fueron eliminados.");
  console.log("   Para limpiarlos: filtrar en UI de NocoBase por codigo_oficial vacío.");
  if (DRY) console.log("\n[DRY-RUN] Ejecutar sin --dry-run para aplicar cambios.");
}

main().catch(console.error);
