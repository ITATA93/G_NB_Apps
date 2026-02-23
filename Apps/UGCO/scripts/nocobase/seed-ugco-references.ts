/**
 * SEED UGCO REFERENCES - Cargar datos en colecciones UGCO_REF_*
 *
 * Fuentes de datos:
 * 1. Backup MIRA: ref_cie10, ref_oncotopografia, ref_oncoespecialidad, ref_oncodiagnostico
 * 2. Excel SIGO normalizado: lateralidad, extensión, previsión, sexo, grado, TNM, morfología
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import ExcelJS from 'exceljs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ══════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ══════════════════════════════════════════════════════════════════════

const MIRA_API = 'https://mira.hospitaldeovalle.cl/api';
const API_TOKEN = process.env.NOCOBASE_MIRA_TOKEN || process.env.NOCOBASE_API_KEY;
if (!API_TOKEN) {
    console.error('❌ Error: NOCOBASE_MIRA_TOKEN or NOCOBASE_API_KEY must be set in .env');
    process.exit(1);
}

const BACKUP_DIR = path.resolve(__dirname, '../../backups/mira-oncologia-20260128/data');
const SIGO_EXCEL = path.resolve(__dirname, '../../docs/SIGO_Diccionarios_Normalizados.xlsx');

const DRY_RUN = process.argv.includes('--dry-run');

// ══════════════════════════════════════════════════════════════════════
// UTILIDADES
// ══════════════════════════════════════════════════════════════════════

const colors = {
    cyan: (t: string) => `\x1b[36m${t}\x1b[0m`,
    green: (t: string) => `\x1b[32m${t}\x1b[0m`,
    yellow: (t: string) => `\x1b[33m${t}\x1b[0m`,
    red: (t: string) => `\x1b[31m${t}\x1b[0m`,
    gray: (t: string) => `\x1b[90m${t}\x1b[0m`,
    white: (t: string) => `\x1b[37m${t}\x1b[0m`,
};

async function apiRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    const url = `${MIRA_API}/${endpoint}`;
    const options: RequestInit = {
        method,
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json',
        },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`API Error ${response.status}: ${text}`);
    }
    return response.json();
}

async function insertRecords(collection: string, records: any[]): Promise<{ success: number; errors: number }> {
    let success = 0;
    let errors = 0;

    // Insertar en lotes de 50
    const batchSize = 50;
    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        if (DRY_RUN) {
            success += batch.length;
            continue;
        }

        try {
            // Intentar inserción masiva
            await apiRequest(`${collection}:create`, 'POST', batch);
            success += batch.length;
        } catch (err) {
            // Si falla, intentar uno por uno
            for (const record of batch) {
                try {
                    await apiRequest(`${collection}:create`, 'POST', record);
                    success++;
                } catch (e) {
                    errors++;
                }
            }
        }
    }

    return { success, errors };
}

// ══════════════════════════════════════════════════════════════════════
// MAPEO DE DATOS
// ══════════════════════════════════════════════════════════════════════

interface DataMapping {
    targetCollection: string;
    source: 'backup' | 'excel';
    sourceFile?: string;  // Para backup
    sheetName?: string;   // Para excel
    transform: (row: any) => any;
}

const DATA_MAPPINGS: DataMapping[] = [
    // ─── DESDE BACKUP MIRA (estructura: codigo_oficial, descripcion) ───
    {
        targetCollection: 'UGCO_REF_cie10',
        source: 'backup',
        sourceFile: 'ref_cie10.data.json',
        transform: (row) => {
            // Saltar filas de encabezado (id 1-3)
            if (row.id <= 3) return null;
            return {
                codigo: row.codigo_oficial || row.codigo,
                nombre: row.descripcion || row.nombre,
                descripcion: row.descripcion,
                activo: row.activo ?? true,
            };
        },
    },
    {
        targetCollection: 'UGCO_REF_oncotopografiaicdo',
        source: 'backup',
        sourceFile: 'ref_oncotopografia.data.json',
        transform: (row) => ({
            codigo: row.codigo_oficial || row.codigo,
            nombre: row.descripcion || row.nombre,
            descripcion: row.descripcion,
            grupo: row.grupo,
            activo: row.activo ?? true,
        }),
    },
    {
        targetCollection: 'UGCO_REF_oncoespecialidad',
        source: 'backup',
        sourceFile: 'ref_oncoespecialidad.data.json',
        transform: (row) => ({
            codigo: row.codigo_oficial || row.codigo,
            nombre: row.descripcion || row.nombre,
            descripcion: row.descripcion,
            orden: row.orden,
            activo: row.activo ?? true,
        }),
    },
    {
        targetCollection: 'UGCO_REF_oncodiagnostico',
        source: 'backup',
        sourceFile: 'ref_oncodiagnostico.data.json',
        transform: (row) => ({
            codigo: row.codigo_oficial || row.codigo,
            nombre: row.descripcion || row.nombre,
            descripcion: row.descripcion,
            activo: row.activo ?? true,
        }),
    },

    // ─── DESDE EXCEL SIGO NORMALIZADO (nombres con REF_) ───
    {
        targetCollection: 'UGCO_REF_sexo',
        source: 'excel',
        sheetName: 'REF_Sexo',
        transform: (row) => ({
            codigo: String(row['Codigo'] || row['codigo'] || row['CODIGO'] || ''),
            nombre: row['Nombre'] || row['nombre'] || row['Descripcion'] || row['NOMBRE'] || '',
            codigo_sigo: String(row['Codigo_SIGO'] || row['Codigo'] || row['CODIGO'] || ''),
            activo: true,
        }),
    },
    {
        targetCollection: 'UGCO_REF_prevision',
        source: 'excel',
        sheetName: 'REF_Prevision',
        transform: (row) => ({
            codigo: String(row['Codigo'] || row['codigo'] || row['CODIGO'] || ''),
            nombre: row['Nombre'] || row['nombre'] || row['Descripcion'] || row['NOMBRE'] || '',
            codigo_sigo: String(row['Codigo_SIGO'] || row['Codigo'] || row['CODIGO'] || ''),
            tipo: row['Tipo'] || 'prevision',
            activo: true,
        }),
    },
    {
        targetCollection: 'UGCO_REF_lateralidad',
        source: 'excel',
        sheetName: 'REF_Lateralidad',
        transform: (row) => ({
            codigo: String(row['Codigo'] || row['codigo'] || row['CODIGO'] || ''),
            nombre: row['Nombre'] || row['nombre'] || row['Descripcion'] || row['NOMBRE'] || '',
            codigo_sigo: String(row['Codigo_SIGO'] || row['Codigo'] || row['CODIGO'] || ''),
            activo: true,
        }),
    },
    {
        targetCollection: 'UGCO_REF_extension',
        source: 'excel',
        sheetName: 'REF_Extension',
        transform: (row) => ({
            codigo: String(row['Codigo'] || row['codigo'] || row['CODIGO'] || ''),
            nombre: row['Nombre'] || row['nombre'] || row['Descripcion'] || row['NOMBRE'] || '',
            codigo_sigo: String(row['Codigo_SIGO'] || row['Codigo'] || row['CODIGO'] || ''),
            activo: true,
        }),
    },
    {
        targetCollection: 'UGCO_REF_oncogradohistologico',
        source: 'excel',
        sheetName: 'REF_GradoDiferenciacion',
        transform: (row) => ({
            codigo: String(row['Codigo'] || row['codigo'] || row['CODIGO'] || ''),
            nombre: row['Nombre'] || row['nombre'] || row['Descripcion'] || row['NOMBRE'] || '',
            activo: true,
        }),
    },
    {
        targetCollection: 'UGCO_REF_oncotnm_t',
        source: 'excel',
        sheetName: 'REF_TNM_T',
        transform: (row) => ({
            codigo: String(row['Codigo'] || row['codigo'] || row['CODIGO'] || ''),
            nombre: row['Nombre'] || row['nombre'] || row['Descripcion'] || row['NOMBRE'] || '',
            activo: true,
        }),
    },
    {
        targetCollection: 'UGCO_REF_oncotnm_n',
        source: 'excel',
        sheetName: 'REF_TNM_N',
        transform: (row) => ({
            codigo: String(row['Codigo'] || row['codigo'] || row['CODIGO'] || ''),
            nombre: row['Nombre'] || row['nombre'] || row['Descripcion'] || row['NOMBRE'] || '',
            activo: true,
        }),
    },
    {
        targetCollection: 'UGCO_REF_oncotnm_m',
        source: 'excel',
        sheetName: 'REF_TNM_M',
        transform: (row) => ({
            codigo: String(row['Codigo'] || row['codigo'] || row['CODIGO'] || ''),
            nombre: row['Nombre'] || row['nombre'] || row['Descripcion'] || row['NOMBRE'] || '',
            activo: true,
        }),
    },
    {
        targetCollection: 'UGCO_REF_oncomorfologiaicdo',
        source: 'excel',
        sheetName: 'REF_Morfologia_ICDO',
        transform: (row) => ({
            codigo: String(row['Codigo'] || row['codigo'] || row['CODIGO'] || ''),
            nombre: row['Nombre'] || row['nombre'] || row['Descripcion'] || row['NOMBRE'] || '',
            comportamiento: row['Comportamiento'] || row['comportamiento'] || '',
            activo: true,
        }),
    },
    {
        targetCollection: 'UGCO_REF_comuna',
        source: 'excel',
        sheetName: 'REF_RegionComuna',
        transform: (row) => ({
            codigo: String(row['Codigo_Comuna'] || row['codigo'] || row['CODIGO'] || ''),
            nombre: row['Comuna'] || row['Nombre'] || row['nombre'] || '',
            region: row['Region'] || row['region'] || '',
            activo: true,
        }),
    },
];

// ══════════════════════════════════════════════════════════════════════
// CARGA DE DATOS
// ══════════════════════════════════════════════════════════════════════

function loadBackupData(filename: string): any[] {
    const filepath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filepath)) {
        console.log(colors.yellow(`    [!] Archivo no encontrado: ${filename}`));
        return [];
    }
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    // El backup tiene estructura { collection, count, records: [...] }
    if (data.records && Array.isArray(data.records)) {
        return data.records;
    }
    return Array.isArray(data) ? data : (data.data || []);
}

async function loadExcelSheet(sheetName: string): Promise<Record<string, unknown>[]> {
    if (!fs.existsSync(SIGO_EXCEL)) {
        console.log(colors.yellow(`    [!] Excel SIGO no encontrado: ${SIGO_EXCEL}`));
        return [];
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(SIGO_EXCEL);

    // Buscar hoja por nombre (case insensitive)
    const sheetNames = workbook.worksheets.map(ws => ws.name);
    const matchedSheet = workbook.worksheets.find(ws =>
        ws.name.toLowerCase() === sheetName.toLowerCase() ||
        ws.name.toLowerCase().includes(sheetName.toLowerCase())
    );

    if (!matchedSheet) {
        console.log(colors.yellow(`    [!] Hoja no encontrada: ${sheetName}`));
        console.log(colors.gray(`        Hojas disponibles: ${sheetNames.join(', ')}`));
        return [];
    }

    // Convert worksheet to JSON array (header row = keys)
    const rows: Record<string, unknown>[] = [];
    const headers: string[] = [];
    matchedSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
            row.eachCell((cell, colNumber) => {
                headers[colNumber] = String(cell.value || `col_${colNumber}`);
            });
        } else {
            const obj: Record<string, unknown> = {};
            row.eachCell((cell, colNumber) => {
                if (headers[colNumber]) {
                    obj[headers[colNumber]] = cell.value;
                }
            });
            if (Object.keys(obj).length > 0) rows.push(obj);
        }
    });
    return rows;
}

async function checkExistingRecords(collection: string): Promise<number> {
    try {
        const result = await apiRequest(`${collection}:list?pageSize=1`);
        return result.data?.meta?.count || result.meta?.count || 0;
    } catch {
        return 0;
    }
}

// ══════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════

async function main() {
    console.log(colors.cyan('╔════════════════════════════════════════════════════════════════════╗'));
    console.log(colors.cyan('║  SEED UGCO REFERENCES - Cargar Diccionarios                       ║'));
    console.log(colors.cyan('╚════════════════════════════════════════════════════════════════════╝'));

    console.log(colors.gray(`\n  Servidor: ${MIRA_API}`));
    console.log(colors.gray(`  Backup: ${BACKUP_DIR}`));
    console.log(colors.gray(`  Excel SIGO: ${SIGO_EXCEL}`));

    if (DRY_RUN) {
        console.log(colors.yellow('\n  [!] Modo DRY-RUN: no se insertarán datos\n'));
    }

    // Verificar conexión
    console.log(colors.gray('\n  Verificando conexión...'));
    try {
        await apiRequest('collections:list?pageSize=1');
        console.log(colors.green('  [OK] Conexión establecida\n'));
    } catch (err) {
        console.log(colors.red(`  [ERROR] No se pudo conectar: ${err}`));
        process.exit(1);
    }

    // Listar hojas disponibles en Excel
    if (fs.existsSync(SIGO_EXCEL)) {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.readFile(SIGO_EXCEL);
        console.log(colors.gray(`  Hojas en Excel SIGO: ${wb.worksheets.map(ws => ws.name).join(', ')}\n`));
    }

    let totalSuccess = 0;
    let totalErrors = 0;
    let totalSkipped = 0;

    // Procesar cada mapeo
    for (const mapping of DATA_MAPPINGS) {
        const { targetCollection, source, sourceFile, sheetName, transform } = mapping;

        // Verificar si ya tiene datos
        const existingCount = await checkExistingRecords(targetCollection);
        if (existingCount > 0) {
            console.log(colors.yellow(`  [SKIP] ${targetCollection} — ya tiene ${existingCount} registros`));
            totalSkipped++;
            continue;
        }

        // Cargar datos según la fuente
        let rawData: any[] = [];
        if (source === 'backup' && sourceFile) {
            rawData = loadBackupData(sourceFile);
        } else if (source === 'excel' && sheetName) {
            rawData = await loadExcelSheet(sheetName);
        }

        if (rawData.length === 0) {
            console.log(colors.gray(`  [SKIP] ${targetCollection} — sin datos fuente`));
            totalSkipped++;
            continue;
        }

        // Transformar datos (filter null para filas omitidas)
        const records = rawData.map(transform).filter(r => r && (r.codigo || r.nombre));

        if (records.length === 0) {
            console.log(colors.gray(`  [SKIP] ${targetCollection} — datos vacíos después de transformar`));
            totalSkipped++;
            continue;
        }

        // Insertar registros
        const prefix = DRY_RUN ? '[DRY] ' : '';
        process.stdout.write(`  ${prefix}${targetCollection} — ${records.length} registros...`);

        const result = await insertRecords(targetCollection, records);
        totalSuccess += result.success;
        totalErrors += result.errors;

        if (result.errors > 0) {
            console.log(colors.yellow(` ${result.success} OK, ${result.errors} errores`));
        } else {
            console.log(colors.green(` OK`));
        }
    }

    // Resumen final
    console.log(colors.white('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(colors.green(`  Insertados: ${totalSuccess} registros`));
    if (totalErrors > 0) {
        console.log(colors.red(`  Errores: ${totalErrors}`));
    }
    if (totalSkipped > 0) {
        console.log(colors.yellow(`  Omitidos: ${totalSkipped} colecciones`));
    }
    console.log(colors.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
}

main().catch(console.error);
