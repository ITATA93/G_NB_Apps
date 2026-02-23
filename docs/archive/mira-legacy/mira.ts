#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Apps directory (relative to MIRA/)
const APPS_DIR = path.resolve(__dirname, '../Apps');

const program = new Command();

program
    .name('mira')
    .description('MIRA CLI - Herramienta de gestión para el proyecto NocoBase')
    .version('1.0.0');

program
    .command('test-connection')
    .description('Prueba la conexión a la API de NocoBase')
    .option('-a, --app <app>', 'Aplicación específica (ej: ugco)', 'ugco')
    .action((options) => {
        console.log(chalk.cyan(`Ejecutando prueba de conexión para ${options.app.toUpperCase()}...`));

        const scriptPath = path.join(APPS_DIR, options.app.toUpperCase(), 'scripts', 'test-connection.ts');

        try {
            execSync(`npx tsx "${scriptPath}"`, { stdio: 'inherit' });
        } catch (error) {
            console.error(chalk.red('Error ejecutando el script.'));
            process.exit(1);
        }
    });

program
    .command('list-collections')
    .description('Lista todas las colecciones de la aplicación')
    .option('-a, --app <app>', 'Aplicación específica', 'ugco')
    .action((options) => {
        const scriptPath = path.join(APPS_DIR, options.app.toUpperCase(), 'scripts', 'list-collections.ts');
        runScript(scriptPath);
    });

program
    .command('inspect-datasources')
    .description('Inspecciona fuentes de datos y conexiones')
    .option('-a, --app <app>', 'Aplicación específica', 'ugco')
    .action((options) => {
        const scriptPath = path.join(APPS_DIR, options.app.toUpperCase(), 'scripts', 'inspect-datasources.ts');
        runScript(scriptPath);
    });

program
    .command('check-sync')
    .description('Verifica estado de sincronización SQL')
    .option('-a, --app <app>', 'Aplicación específica', 'ugco')
    .action((options) => {
        const scriptPath = path.join(APPS_DIR, options.app.toUpperCase(), 'scripts', 'check-sql-sync.ts');
        runScript(scriptPath);
    });

program
    .command('delete-collections')
    .description('Elimina colecciones (Interactivo)')
    .option('-a, --app <app>', 'Aplicación específica', 'ugco')
    .action((options) => {
        const scriptPath = path.join(APPS_DIR, options.app.toUpperCase(), 'scripts', 'delete-collections.ts');
        runScript(scriptPath);
    });

program
    .command('sync')
    .description('Sincroniza definiciones de tablas (Placeholder)')
    .action(() => {
        console.log(chalk.yellow('Comando sync aún no implementado en TS.'));
    });

function runScript(scriptPath: string) {
    try {
        console.log(chalk.gray(`Ejecutando: ${scriptPath}`));
        execSync(`npx tsx "${scriptPath}"`, { stdio: 'inherit' });
    } catch (error) {
        console.error(chalk.red('Error ejecutando el script.'));
        process.exit(1);
    }
}

program.parse();
