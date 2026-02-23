import * as fs from 'fs';
import * as path from 'path';
import ExcelJS from 'exceljs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../BD/data');

async function analyzeSheets() {
    console.log(`Analyzing Excel files in: ${DATA_DIR}`);

    if (!fs.existsSync(DATA_DIR)) {
        console.error(`Directory not found: ${DATA_DIR}`);
        return;
    }

    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.xlsx') || f.endsWith('.xlsm'));

    for (const file of files) {
        const filePath = path.join(DATA_DIR, file);
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);
            console.log(`\nFile: ${file}`);
            console.log('Sheets:');
            workbook.eachSheet((worksheet) => {
                const rowCount = worksheet.rowCount;
                console.log(`  - ${worksheet.name} (~${rowCount} rows)`);
            });
        } catch (error) {
            console.error(`Error reading ${file}:`, error);
        }
    }
}

analyzeSheets();
