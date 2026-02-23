/**
 * backup-mira-oncologia.ts - Respaldo de colecciones de oncología desde MIRA
 *
 * Conecta al servidor MIRA del Hospital de Ovalle y exporta todas las
 * colecciones relacionadas con oncología a archivos JSON.
 *
 * Uso:
 *   tsx Apps/UGCO/scripts/nocobase/backup-mira-oncologia.ts
 *   tsx Apps/UGCO/scripts/nocobase/backup-mira-oncologia.ts --collections-only  # solo estructura
 *   tsx Apps/UGCO/scripts/nocobase/backup-mira-oncologia.ts --list              # solo listar
 */

import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Configuración MIRA ─────────────────────────────────────────────────────

const MIRA_CONFIG = {
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    apiKey: process.env.NOCOBASE_API_KEY || '',
};

// Patrones para identificar colecciones de oncología
const ONCOLOGIA_PATTERNS = [
    /onco/i,
    /alma/i,
    /ugco/i,
    /cancer/i,
    /tumor/i,
    /cie10/i,
    /cie-10/i,
    /morfolog/i,
    /topograf/i,
    /tnm/i,
    /estadio/i,
    /biopsia/i,
    /paciente/i,
    /diagnostico/i,
];

// ─── Cliente HTTP ───────────────────────────────────────────────────────────

function createMiraClient(): AxiosInstance {
    return axios.create({
        baseURL: MIRA_CONFIG.baseURL,
        headers: {
            'Authorization': `Bearer ${MIRA_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
        },
        timeout: 30000,
    });
}

// ─── Funciones de utilidad ──────────────────────────────────────────────────

function log(msg: string, color: string = 'white') {
    const colors: Record<string, string> = {
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        cyan: '\x1b[36m',
        gray: '\x1b[90m',
        white: '\x1b[37m',
    };
    console.log(`${colors[color] || ''}${msg}\x1b[0m`);
}

function isOncologiaCollection(name: string, title: string): boolean {
    const combined = `${name} ${title}`.toLowerCase();
    return ONCOLOGIA_PATTERNS.some(pattern => pattern.test(combined));
}

// ─── Funciones principales ──────────────────────────────────────────────────

async function listCollections(client: AxiosInstance): Promise<any[]> {
    try {
        const response = await client.get('/collections:list', {
            params: { paginate: false },
        });
        return response.data?.data || [];
    } catch (error: any) {
        log(`Error listando colecciones: ${error.message}`, 'red');
        return [];
    }
}

async function getCollectionFields(client: AxiosInstance, collectionName: string): Promise<any[]> {
    try {
        const response = await client.get(`/collections/${collectionName}/fields:list`, {
            params: { paginate: false },
        });
        return response.data?.data || [];
    } catch (error: any) {
        return [];
    }
}

async function getCollectionData(client: AxiosInstance, collectionName: string): Promise<any[]> {
    try {
        const response = await client.get(`/${collectionName}:list`, {
            params: { pageSize: 10000, paginate: false },
        });
        return response.data?.data || [];
    } catch (error: any) {
        log(`    Error obteniendo datos de ${collectionName}: ${error.message}`, 'yellow');
        return [];
    }
}

async function backupCollection(
    client: AxiosInstance,
    collection: any,
    backupDir: string,
    includeData: boolean
): Promise<{ schema: boolean; data: boolean; dataCount: number }> {
    const result = { schema: false, data: false, dataCount: 0 };

    // Obtener campos/estructura
    const fields = await getCollectionFields(client, collection.name);

    const schemaData = {
        collection: {
            name: collection.name,
            title: collection.title,
            description: collection.description,
            inherit: collection.inherit,
            hidden: collection.hidden,
            template: collection.template,
            sortable: collection.sortable,
        },
        fields: fields,
        exportedAt: new Date().toISOString(),
        source: 'mira.hospitaldeovalle.cl',
    };

    // Guardar esquema
    const schemaPath = path.join(backupDir, 'schemas', `${collection.name}.schema.json`);
    fs.mkdirSync(path.dirname(schemaPath), { recursive: true });
    fs.writeFileSync(schemaPath, JSON.stringify(schemaData, null, 2), 'utf-8');
    result.schema = true;

    // Obtener y guardar datos
    if (includeData) {
        const data = await getCollectionData(client, collection.name);
        result.dataCount = data.length;

        if (data.length > 0) {
            const dataPath = path.join(backupDir, 'data', `${collection.name}.data.json`);
            fs.mkdirSync(path.dirname(dataPath), { recursive: true });
            fs.writeFileSync(dataPath, JSON.stringify({
                collection: collection.name,
                count: data.length,
                exportedAt: new Date().toISOString(),
                records: data,
            }, null, 2), 'utf-8');
            result.data = true;
        }
    }

    return result;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    const args = process.argv.slice(2);
    const listOnly = args.includes('--list');
    const collectionsOnly = args.includes('--collections-only');
    const includeData = !collectionsOnly;

    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const backupDir = path.join(__dirname, '..', '..', 'backups', `mira-oncologia-${timestamp}`);

    console.log('\n');
    log('╔════════════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  BACKUP MIRA - Colecciones de Oncología                           ║', 'cyan');
    log('║  Hospital Dr. Antonio Tirado Lanas de Ovalle                      ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════════════╝', 'cyan');

    log(`\n  Servidor: ${MIRA_CONFIG.baseURL}`, 'gray');
    log(`  Destino:  ${backupDir}`, 'gray');

    // Crear cliente
    const client = createMiraClient();

    // Verificar conexión
    log('\n  Verificando conexión...', 'gray');
    try {
        await client.get('/app:getLang');
        log('  [OK] Conexión establecida\n', 'green');
    } catch (error: any) {
        log(`\n  [ERROR] No se puede conectar a MIRA: ${error.message}`, 'red');
        log('  Verifica que el servidor esté accesible y el token sea válido.\n', 'gray');
        process.exit(1);
    }

    // Listar todas las colecciones
    log('  Obteniendo lista de colecciones...', 'gray');
    const allCollections = await listCollections(client);
    log(`  Total colecciones en MIRA: ${allCollections.length}\n`, 'white');

    // Filtrar colecciones de oncología
    const oncoCollections = allCollections.filter(c =>
        isOncologiaCollection(c.name || '', c.title || '')
    );

    log(`  Colecciones de oncología encontradas: ${oncoCollections.length}`, 'cyan');
    log('  ' + '─'.repeat(60), 'gray');

    // Mostrar lista
    for (const col of oncoCollections) {
        log(`    ${col.name.padEnd(35)} ${col.title || ''}`, 'white');
    }

    if (listOnly) {
        log('\n  Modo --list: no se realizó respaldo.\n', 'yellow');
        return;
    }

    // Crear directorio de backup
    fs.mkdirSync(backupDir, { recursive: true });

    // Respaldar cada colección
    log('\n  ' + '═'.repeat(60), 'cyan');
    log('  RESPALDANDO COLECCIONES', 'cyan');
    log('  ' + '═'.repeat(60) + '\n', 'cyan');

    const results: { name: string; schema: boolean; data: boolean; count: number }[] = [];

    for (const col of oncoCollections) {
        process.stdout.write(`  ${col.name.padEnd(35)} `);

        const result = await backupCollection(client, col, backupDir, includeData);
        results.push({
            name: col.name,
            schema: result.schema,
            data: result.data,
            count: result.dataCount,
        });

        const status = result.schema ? '[OK]' : '[FAIL]';
        const dataInfo = includeData ? ` (${result.dataCount} registros)` : '';
        log(`${status}${dataInfo}`, result.schema ? 'green' : 'red');
    }

    // Crear índice del respaldo
    const indexPath = path.join(backupDir, 'index.json');
    const indexData = {
        source: 'mira.hospitaldeovalle.cl',
        exportedAt: new Date().toISOString(),
        totalCollections: oncoCollections.length,
        includesData: includeData,
        collections: results.map(r => ({
            name: r.name,
            schemaFile: `schemas/${r.name}.schema.json`,
            dataFile: r.data ? `data/${r.name}.data.json` : null,
            recordCount: r.count,
        })),
    };
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');

    // Resumen
    const successCount = results.filter(r => r.schema).length;
    const totalRecords = results.reduce((sum, r) => sum + r.count, 0);

    log('\n  ' + '━'.repeat(60), 'white');
    log('  RESUMEN DEL RESPALDO', 'white');
    log('  ' + '━'.repeat(60), 'white');
    log(`    Colecciones respaldadas: ${successCount}/${oncoCollections.length}`, 'white');
    log(`    Total registros:         ${totalRecords}`, 'white');
    log(`    Ubicación:               ${backupDir}`, 'white');
    log('  ' + '━'.repeat(60) + '\n', 'white');

    log('  Archivos generados:', 'gray');
    log(`    ${backupDir}/index.json`, 'gray');
    log(`    ${backupDir}/schemas/*.schema.json`, 'gray');
    if (includeData) {
        log(`    ${backupDir}/data/*.data.json`, 'gray');
    }
    log('', 'white');
}

main().catch(err => {
    log(`\n  [FATAL] ${err.message}\n`, 'red');
    process.exit(1);
});
