/**
 * fix-all-sigo.ts - Script maestro para corrección completa SIGO
 *
 * Este script ejecuta en orden todos los pasos necesarios para
 * lograr compatibilidad completa con el formato SIGO de carga masiva.
 *
 * Pasos:
 *   1. Crear tablas de referencia faltantes (TNM-N, lateralidad, etc.)
 *   2. Agregar campos faltantes a colecciones existentes
 *   3. Crear relaciones FK hacia tablas de referencia
 *   4. Unificar tablas duplicadas (sexo, etc.)
 *   5. Cargar datos de referencia
 *
 * Uso:
 *   tsx Apps/UGCO/scripts/nocobase/fix-all-sigo.ts --dry-run    # simular
 *   tsx Apps/UGCO/scripts/nocobase/fix-all-sigo.ts              # ejecutar todo
 *   tsx Apps/UGCO/scripts/nocobase/fix-all-sigo.ts --step 1     # solo paso 1
 */

import { createClient, log } from '../../../../shared/scripts/ApiClient';
import { execSync } from 'child_process';
import * as path from 'path';

const client = createClient();

// ═══════════════════════════════════════════════════════════════════════════
// Configuración de pasos
// ═══════════════════════════════════════════════════════════════════════════

interface Step {
    id: number;
    name: string;
    description: string;
    script?: string;
    action?: () => Promise<boolean>;
}

const STEPS: Step[] = [
    {
        id: 1,
        name: 'Crear esquema base UGCO',
        description: 'Ejecuta create-full-schema.ts para crear las 36 colecciones base',
        script: 'create-full-schema.ts',
    },
    {
        id: 2,
        name: 'Corregir esquema para SIGO',
        description: 'Ejecuta fix-schema-sigo.ts para agregar tablas y campos SIGO',
        script: 'fix-schema-sigo.ts',
    },
    {
        id: 3,
        name: 'Unificar tablas duplicadas',
        description: 'Ejecuta unify-duplicate-tables.ts para consolidar ref_sexo, etc.',
        script: 'unify-duplicate-tables.ts',
    },
    {
        id: 4,
        name: 'Cargar datos de referencia',
        description: 'Carga datos desde diccionarios SIGO',
        script: 'seed-full-references.ts',
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// Funciones
// ═══════════════════════════════════════════════════════════════════════════

async function testConnection(): Promise<boolean> {
    try {
        const response = await client.get('/app:getLang');
        return response.status === 200;
    } catch {
        return false;
    }
}

function runScript(scriptName: string, dryRun: boolean): boolean {
    const scriptPath = path.join(__dirname, scriptName);
    const args = dryRun ? '--dry-run' : '';

    try {
        log(`\n    Ejecutando: tsx ${scriptName} ${args}`, 'gray');
        const output = execSync(`npx tsx "${scriptPath}" ${args}`, {
            encoding: 'utf-8',
            stdio: 'pipe',
            cwd: path.join(__dirname, '..', '..', '..', '..'),
        });

        // Mostrar output
        const lines = output.split('\n').filter(l => l.trim());
        for (const line of lines.slice(-10)) { // Últimas 10 líneas
            console.log('    ' + line);
        }

        return !output.includes('[ERROR]') && !output.includes('[FATAL]');
    } catch (error: any) {
        if (error.stdout) {
            console.log(error.stdout);
        }
        if (error.stderr) {
            console.error(error.stderr);
        }
        return false;
    }
}

async function runStep(step: Step, dryRun: boolean): Promise<boolean> {
    log(`\n  ┌${'─'.repeat(66)}┐`, 'cyan');
    log(`  │  PASO ${step.id}: ${step.name.padEnd(54)}│`, 'cyan');
    log(`  │  ${step.description.substring(0, 62).padEnd(62)}│`, 'gray');
    log(`  └${'─'.repeat(66)}┘`, 'cyan');

    if (step.script) {
        return runScript(step.script, dryRun);
    } else if (step.action) {
        return await step.action();
    }

    return false;
}

// ═══════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const stepArg = args.find((a, i) => args[i - 1] === '--step');
    const skipConnection = args.includes('--skip-connection');

    console.log('\n');
    console.log('  ╔════════════════════════════════════════════════════════════════════╗');
    console.log('  ║                                                                    ║');
    console.log('  ║   ███████╗██╗ ██████╗  ██████╗     ███████╗██╗██╗  ██╗            ║');
    console.log('  ║   ██╔════╝██║██╔════╝ ██╔═══██╗    ██╔════╝██║╚██╗██╔╝            ║');
    console.log('  ║   ███████╗██║██║  ███╗██║   ██║    █████╗  ██║ ╚███╔╝             ║');
    console.log('  ║   ╚════██║██║██║   ██║██║   ██║    ██╔══╝  ██║ ██╔██╗             ║');
    console.log('  ║   ███████║██║╚██████╔╝╚██████╔╝    ██║     ██║██╔╝ ██╗            ║');
    console.log('  ║   ╚══════╝╚═╝ ╚═════╝  ╚═════╝     ╚═╝     ╚═╝╚═╝  ╚═╝            ║');
    console.log('  ║                                                                    ║');
    console.log('  ║   Corrección completa del esquema UGCO para SIGO                  ║');
    console.log('  ║                                                                    ║');
    console.log('  ╚════════════════════════════════════════════════════════════════════╝\n');

    if (dryRun) {
        log('  [!] MODO DRY-RUN: No se realizarán cambios reales\n', 'yellow');
    }

    // Test conexión
    if (!skipConnection) {
        log('  Verificando conexión a NocoBase...', 'gray');
        const connected = await testConnection();
        if (!connected) {
            log('\n  [ERROR] No se puede conectar a NocoBase', 'red');
            log('  Verifica que el servidor esté corriendo y las credenciales en .env\n', 'gray');
            log('  Usa --skip-connection para omitir esta verificación\n', 'gray');
            process.exit(1);
        }
        log('  [OK] Conexión establecida\n', 'green');
    }

    // Determinar pasos a ejecutar
    const stepsToRun = stepArg
        ? STEPS.filter(s => s.id === parseInt(stepArg))
        : STEPS;

    if (stepsToRun.length === 0) {
        log(`  [ERROR] Paso ${stepArg} no encontrado. Usa 1-${STEPS.length}.\n`, 'red');
        process.exit(1);
    }

    // Ejecutar pasos
    const results: { step: Step; success: boolean }[] = [];

    for (const step of stepsToRun) {
        const success = await runStep(step, dryRun);
        results.push({ step, success });

        if (!success && !dryRun) {
            log(`\n  [!] Paso ${step.id} falló. Deteniendo ejecución.`, 'yellow');
            log('  Puedes continuar desde este paso con: --step ' + step.id + '\n', 'gray');
            break;
        }
    }

    // Resumen final
    log('\n  ' + '═'.repeat(68), 'white');
    log('  RESUMEN DE EJECUCIÓN', 'white');
    log('  ' + '═'.repeat(68), 'white');

    for (const { step, success } of results) {
        const icon = success ? '[OK]' : '[FAIL]';
        const color = success ? 'green' : 'red';
        log(`    ${icon} Paso ${step.id}: ${step.name}`, color);
    }

    const allOk = results.every(r => r.success);
    const successCount = results.filter(r => r.success).length;

    log('  ' + '─'.repeat(68), 'white');
    log(`  ${successCount}/${results.length} pasos completados ${dryRun ? '(dry-run)' : ''}`, allOk ? 'green' : 'yellow');
    log('  ' + '═'.repeat(68) + '\n', 'white');

    if (allOk && !dryRun) {
        log('  [SUCCESS] Esquema UGCO corregido para compatibilidad SIGO\n', 'green');
        log('  Próximos pasos sugeridos:', 'white');
        log('  ─────────────────────────────────────────────────', 'gray');
        log('  1. Ejecutar script Python para normalizar Excel SIGO:', 'gray');
        log('     python Apps/UGCO/scripts/python/restructure-sigo-excel.py', 'gray');
        log('  2. Verificar datos cargados en NocoBase', 'gray');
        log('  3. Configurar vistas y formularios para nuevos campos\n', 'gray');
    }
}

main().catch(err => {
    log(`\n  [FATAL] ${err.message}\n`, 'red');
    process.exit(1);
});
