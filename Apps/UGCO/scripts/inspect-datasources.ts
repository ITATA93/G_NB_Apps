import { createClient, log } from '../../../shared/scripts/ApiClient';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  Inspección de Fuentes de Datos - NocoBase UGCO           ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

    const client = createClient();

    // Verificar conexión
    log('🔍 Verificando conexión...', 'yellow');
    // Simple check via auth
    try {
        await client.get('/auth:check');
        log('✓ Conexión exitosa\n', 'green');
    } catch (e) {
        log('✗ No se pudo conectar a NocoBase', 'red');
        return;
    }

    const results: any = {
        timestamp: new Date().toISOString(),
        dataSources: null,
        databases: null,
        connections: null,
        errors: []
    };

    // Endpoints a probar
    const endpoints = [
        { name: 'Data Sources', path: '/dataSources:list' },
        { name: 'Data Sources (detallado)', path: '/dataSources:list?paginate=false&appends=collections' },
        { name: 'Databases', path: '/databases:list' },
        { name: 'Connections', path: '/connections:list' },
        { name: 'External Data Sources', path: '/dataSourcesManager:list' },
        { name: 'SQL Collections', path: '/sql-collections:list' },
        { name: 'Data Source External MSSQL', path: '/data-source-external-mssql:list' }
    ];

    log('🔍 Explorando endpoints de fuentes de datos...\n', 'yellow');

    for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i];

        try {
            log(`[${i + 1}/${endpoints.length}] ${endpoint.name}`, 'cyan');

            // Use try-catch for individual requests to avoid stopping the loop
            let response;
            try {
                response = await client.get(endpoint.path);
            } catch (err: any) {
                if (err.response && err.response.status === 404) {
                    log(`  ℹ  Endpoint no disponible (404)`, 'yellow');
                } else {
                    throw err;
                }
                continue;
            }

            const data = response.data || response.rows || response;

            if (Array.isArray(data)) {
                log(`  ✓ ${data.length} elemento(s) encontrado(s)`, 'green');

                // Guardar según el tipo
                if (endpoint.name.includes('Data Sources')) {
                    results.dataSources = data;
                } else if (endpoint.name.includes('Database')) {
                    results.databases = data;
                } else if (endpoint.name.includes('Connection')) {
                    results.connections = data;
                }

                // Mostrar primeros elementos
                if (data.length > 0 && data.length <= 5) {
                    data.forEach((item: any, idx: number) => {
                        log(`    [${idx + 1}] ${item.name || item.key || item.id || 'Item'}`, 'white');
                        if (item.type) log(`        Tipo: ${item.type}`, 'white');
                        if (item.status) log(`        Status: ${item.status}`, 'white');
                        if (item.host) log(`        Host: ${item.host}`, 'white');
                        if (item.database) log(`        Database: ${item.database}`, 'white');
                    });
                }
            } else if (typeof data === 'object' && data !== null) {
                log(`  ✓ Datos recibidos (objeto)`, 'green');
            } else {
                log(`  ℹ  Respuesta vacía`, 'yellow');
            }

        } catch (error: any) {
            log(`  ✗ Error: ${error.message}`, 'red');
            results.errors.push({
                endpoint: endpoint.name,
                error: error.message
            });
        }
    }

    // Análisis de resultados
    log('\n═══════════════════════════════════════════════════════════', 'cyan');
    log('RESULTADOS', 'cyan');
    log('═══════════════════════════════════════════════════════════\n', 'cyan');

    // Data Sources
    if (results.dataSources && results.dataSources.length > 0) {
        log(`📊 Fuentes de datos encontradas: ${results.dataSources.length}`, 'green');
        log('═══════════════════════════════════════════════════════════', 'green');

        for (const ds of results.dataSources) {
            log(`\n  🗄️  ${ds.name || ds.key}`, 'white');
            if (ds.type) log(`     Tipo: ${ds.type}`, 'cyan');
            if (ds.options) {
                log(`     Opciones:`, 'cyan');
                if (ds.options.host) log(`       - Host: ${ds.options.host}`, 'cyan');
                if (ds.options.port) log(`       - Puerto: ${ds.options.port}`, 'cyan');
                if (ds.options.database) log(`       - Database: ${ds.options.database}`, 'cyan');
                if (ds.options.username) log(`       - Usuario: ${ds.options.username}`, 'cyan');
                if (ds.options.dialect) log(`       - Dialect: ${ds.options.dialect}`, 'cyan');
            }
            if (ds.enabled !== undefined) log(`     Habilitado: ${ds.enabled ? 'Sí' : 'No'}`, ds.enabled ? 'green' : 'yellow');
            if (ds.collections && Array.isArray(ds.collections)) {
                log(`     Colecciones: ${ds.collections.length}`, 'cyan');
                if (ds.collections.length > 0) {
                    ds.collections.forEach((col: any, idx: number) => {
                        log(`       ${idx + 1}. ${col.name || col}`, 'white');
                    });
                }
            }
        }
    } else {
        log('ℹ️  No se encontraron fuentes de datos configuradas', 'yellow');
        log('   Puede que NocoBase esté usando solo la base de datos principal\n', 'yellow');
    }

    // Databases
    if (results.databases && results.databases.length > 0) {
        log(`\n💾 Bases de datos: ${results.databases.length}`, 'green');
        log('═══════════════════════════════════════════════════════════', 'green');

        results.databases.forEach((db: any, idx: number) => {
            log(`\n  [${idx + 1}] ${db.name || db.key || 'Database'}`, 'white');
            if (db.host) log(`      Host: ${db.host}`, 'cyan');
            if (db.database) log(`      Database: ${db.database}`, 'cyan');
            if (db.type) log(`      Tipo: ${db.type}`, 'cyan');
        });
    }

    // Connections
    if (results.connections && results.connections.length > 0) {
        log(`\n🔌 Conexiones: ${results.connections.length}`, 'green');
        log('═══════════════════════════════════════════════════════════', 'green');

        results.connections.forEach((conn: any, idx: number) => {
            log(`\n  [${idx + 1}] ${conn.name || conn.key || 'Connection'}`, 'white');
            if (conn.status) log(`      Status: ${conn.status}`, 'cyan');
            if (conn.type) log(`      Tipo: ${conn.type}`, 'cyan');
        });
    }

    // Resumen
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  RESUMEN                                                   ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝', 'cyan');

    log(`\n📊 Elementos encontrados:`, 'white');
    log(`   • Fuentes de datos: ${results.dataSources?.length || 0}`, 'cyan');
    log(`   • Bases de datos: ${results.databases?.length || 0}`, 'cyan');
    log(`   • Conexiones: ${results.connections?.length || 0}`, 'cyan');

    if (results.errors.length > 0) {
        log(`\n⚠️  Errores: ${results.errors.length}`, 'yellow');
        results.errors.forEach((err: any) => {
            log(`   • ${err.endpoint}: ${err.error}`, 'yellow');
        });
    }

    // Guardar reporte
    const reportPath = path.join(__dirname, '../temp-datasources-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
    log(`\n✓ Reporte guardado en: ${reportPath}`, 'green');

    log('\n', 'white');
}

main().catch(error => {
    log(`\n✗ Error fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
