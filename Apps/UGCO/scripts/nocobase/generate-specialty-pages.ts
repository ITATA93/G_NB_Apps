/**
 * generate-specialty-pages.ts - Genera páginas de especialidad desde template
 *
 * Lee el template y genera 9 archivos JSON, uno por cada especialidad oncológica.
 *
 * Uso:
 *   npx tsx Apps/UGCO/scripts/nocobase/generate-specialty-pages.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Definición de Especialidades ───────────────────────────────────────────

interface Especialidad {
    id: string;
    nombre: string;
    codigo: string;
    color: string;
    icono: string;
}

const ESPECIALIDADES: Especialidad[] = [
    { id: 'digestivo_alto', nombre: 'Digestivo Alto', codigo: 'DIGESTIVO_ALTO', color: '#FF8B00', icono: '🔶' },
    { id: 'digestivo_bajo', nombre: 'Digestivo Bajo', codigo: 'DIGESTIVO_BAJO', color: '#8B4513', icono: '🟤' },
    { id: 'mama', nombre: 'Mama', codigo: 'P._MAMARIA', color: '#E91E63', icono: '🩷' },
    { id: 'ginecologia', nombre: 'Ginecología', codigo: 'P._CERVICAL', color: '#9C27B0', icono: '💜' },
    { id: 'urologia', nombre: 'Urología', codigo: 'UROLOGIA', color: '#2196F3', icono: '💙' },
    { id: 'torax', nombre: 'Tórax', codigo: 'TORAX', color: '#607D8B', icono: '🫁' },
    { id: 'piel', nombre: 'Piel y Partes Blandas', codigo: 'PIEL_Y_PARTES_BLANDAS', color: '#FFC107', icono: '💛' },
    { id: 'endocrinologia', nombre: 'Endocrinología', codigo: 'ENDOCRINOLOGIA', color: '#4CAF50', icono: '💚' },
    { id: 'hematologia', nombre: 'Hematología', codigo: 'HEMATOLOGÍA', color: '#F44336', icono: '❤️' },
];

// ─── Colores para consola ───────────────────────────────────────────────────

const colors = {
    cyan: (t: string) => `\x1b[36m${t}\x1b[0m`,
    green: (t: string) => `\x1b[32m${t}\x1b[0m`,
    yellow: (t: string) => `\x1b[33m${t}\x1b[0m`,
    red: (t: string) => `\x1b[31m${t}\x1b[0m`,
    gray: (t: string) => `\x1b[90m${t}\x1b[0m`,
    white: (t: string) => `\x1b[37m${t}\x1b[0m`,
};

function log(msg: string, color: keyof typeof colors = 'white') {
    console.log(colors[color](msg));
}

// ─── Función para reemplazar variables ──────────────────────────────────────

function replaceVariables(template: string, especialidad: Especialidad): string {
    return template
        .replace(/\{\{ESPECIALIDAD_ID\}\}/g, especialidad.id)
        .replace(/\{\{ESPECIALIDAD_NOMBRE\}\}/g, especialidad.nombre)
        .replace(/\{\{ESPECIALIDAD_CODIGO\}\}/g, especialidad.codigo)
        .replace(/\{\{ESPECIALIDAD_COLOR\}\}/g, especialidad.color)
        .replace(/\{\{ESPECIALIDAD_ICONO\}\}/g, especialidad.icono);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    log('╔════════════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  GENERATE SPECIALTY PAGES - Generador de Páginas por Especialidad ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════════════╝', 'cyan');

    // Rutas
    const uiConfigDir = path.resolve(__dirname, '../../nocobase/ui-config');
    const pagesDir = path.resolve(uiConfigDir, 'pages');
    const templatePath = path.resolve(uiConfigDir, 'especialidad-template.json');

    // Crear directorio de páginas si no existe
    if (!fs.existsSync(pagesDir)) {
        fs.mkdirSync(pagesDir, { recursive: true });
        log(`\n  [+] Creado directorio: ${pagesDir}`, 'green');
    }

    // Leer template
    log(`\n  Leyendo template: ${templatePath}`, 'gray');
    if (!fs.existsSync(templatePath)) {
        log(`\n  [ERROR] Template no encontrado: ${templatePath}`, 'red');
        process.exit(1);
    }

    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    log('  [OK] Template cargado', 'green');

    // Generar páginas para cada especialidad
    log('\n  GENERANDO PÁGINAS:', 'cyan');
    log('  ───────────────────────────────────────', 'gray');

    const generatedFiles: string[] = [];

    for (const esp of ESPECIALIDADES) {
        const pageContent = replaceVariables(templateContent, esp);
        const fileName = `especialidad-${esp.id}.json`;
        const filePath = path.resolve(pagesDir, fileName);

        // Parsear y re-serializar para validar JSON
        try {
            const parsed = JSON.parse(pageContent);

            // Actualizar metadatos
            parsed.name = `ugco-especialidad-${esp.id}`;
            parsed.title = `${esp.nombre} - Casos Oncológicos`;
            parsed.variables = {
                ESPECIALIDAD_ID: esp.id,
                ESPECIALIDAD_NOMBRE: esp.nombre,
                ESPECIALIDAD_CODIGO: esp.codigo,
                ESPECIALIDAD_COLOR: esp.color,
                ESPECIALIDAD_ICONO: esp.icono,
            };

            fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));
            log(`  ${esp.icono} ${esp.nombre.padEnd(22)} → ${fileName}`, 'white');
            generatedFiles.push(fileName);
        } catch (error: any) {
            log(`  [ERROR] ${esp.nombre}: ${error.message}`, 'red');
        }
    }

    // Copiar también el dashboard y ficha-caso a la carpeta pages
    log('\n  COPIANDO ARCHIVOS ADICIONALES:', 'cyan');
    log('  ───────────────────────────────────────', 'gray');

    const additionalFiles = [
        { src: 'dashboard-schema.json', dest: 'dashboard.json' },
        { src: 'ficha-caso-schema.json', dest: 'ficha-caso.json' },
    ];

    for (const file of additionalFiles) {
        const srcPath = path.resolve(uiConfigDir, file.src);
        const destPath = path.resolve(pagesDir, file.dest);

        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            log(`  📄 ${file.src.padEnd(26)} → ${file.dest}`, 'white');
            generatedFiles.push(file.dest);
        }
    }

    // Generar índice de páginas
    log('\n  GENERANDO ÍNDICE:', 'cyan');
    log('  ───────────────────────────────────────', 'gray');

    const pagesIndex = {
        name: 'ugco-pages-index',
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        description: 'Índice de todas las páginas UI de UGCO',
        pages: {
            dashboard: {
                file: 'dashboard.json',
                title: 'Dashboard UGCO',
                type: 'page',
            },
            fichaСaso: {
                file: 'ficha-caso.json',
                title: 'Ficha del Caso',
                type: 'drawer',
            },
            especialidades: ESPECIALIDADES.map(esp => ({
                id: esp.id,
                file: `especialidad-${esp.id}.json`,
                title: `${esp.nombre} - Casos Oncológicos`,
                color: esp.color,
                icono: esp.icono,
                codigo: esp.codigo,
            })),
        },
        totalPages: generatedFiles.length,
    };

    const indexPath = path.resolve(pagesDir, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(pagesIndex, null, 2));
    log(`  📋 Índice generado: index.json`, 'green');

    // Resumen
    log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'white');
    log(`  ✓ Páginas generadas: ${generatedFiles.length}`, 'green');
    log(`  ✓ Directorio: ${pagesDir}`, 'gray');
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`, 'white');

    // Listar archivos generados
    log('  ARCHIVOS GENERADOS:', 'cyan');
    for (const file of generatedFiles) {
        log(`    • ${file}`, 'gray');
    }
    log(`    • index.json`, 'gray');
    log('');
}

main().catch(console.error);
