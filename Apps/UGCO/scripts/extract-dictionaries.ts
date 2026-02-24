import * as fs from 'fs';
import * as path from 'path';
import ExcelJS from 'exceljs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../BD/data');
const OUTPUT_DIR = path.resolve(__dirname, '../BD/diccionarios_raw');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Convert an ExcelJS worksheet to an array of JSON objects.
 * Uses the first row as header keys.
 */
function sheetToJson(worksheet: ExcelJS.Worksheet): Record<string, unknown>[] {
    const rows: Record<string, unknown>[] = [];
    const headers: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
            // First row = headers
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
            if (Object.keys(obj).length > 0) {
                rows.push(obj);
            }
        }
    });

    return rows;
}

async function extractDictionaries() {
    console.log(`Extracting dictionaries from: ${DATA_DIR}`);

    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.xlsx') || f.endsWith('.xlsm'));

    for (const file of files) {
        const filePath = path.join(DATA_DIR, file);
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);
            const fileBaseName = path.parse(file).name.replace(/ /g, '_');

            workbook.eachSheet((worksheet) => {
                const jsonData = sheetToJson(worksheet);

                if (jsonData.length > 0) {
                    const safeSheetName = worksheet.name.replace(/ /g, '_').replace(/[^a-zA-Z0-9_]/g, '');
                    const outputFilename = `${fileBaseName}__${safeSheetName}.json`;
                    const outputPath = path.join(OUTPUT_DIR, outputFilename);

                    const dictionary = {
                        source_file: file,
                        sheet_name: worksheet.name,
                        entry_count: jsonData.length,
                        entries: jsonData
                    };

                    fs.writeFileSync(outputPath, JSON.stringify(dictionary, null, 2));
                    console.log(`Saved: ${outputFilename} (${jsonData.length} entries)`);
                }
            });
        } catch (error: unknown) {
            console.error(`Error processing ${file}:`, error instanceof Error ? error.message : String(error));
        }
    }
}

extractDictionaries();
