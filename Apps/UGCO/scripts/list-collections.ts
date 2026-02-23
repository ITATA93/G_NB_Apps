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
    log('║  Lista Completa de Colecciones - NocoBase UGCO            ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

    try {
        const client = createClient();

        // Obtener todas las colecciones
        log('📡 Consultando API...', 'yellow');
        const response = await client.get('/collections:list');

        const collections = response.data || [];
        log(`✓ ${collections.length} colecciones encontradas\n`, 'green');

        // Clasificar
        const ugco = collections.filter((c: any) =>
            c.name.startsWith('t_') ||
            c.title?.toLowerCase().includes('paciente') ||
            c.title?.toLowerCase().includes('oncol') ||
            c.title?.toLowerCase().includes('comite') ||
            c.title?.toLowerCase().includes('episodio') ||
            c.name === 'departments'
        );

        const system = collections.filter((c: any) =>
            c.name === 'users' ||
            c.name === 'roles' ||
            c.name.startsWith('_')
        );

        const other = collections.filter((c: any) => !ugco.includes(c) && !system.includes(c));

        // Mostrar colecciones UGCO
        if (ugco.length > 0) {
            log('═══════════════════════════════════════════════════════════', 'green');
            log('  COLECCIONES UGCO', 'green');
            log('═══════════════════════════════════════════════════════════', 'green');

            for (const col of ugco) {
                log(`\n📋 ${col.name}`, 'white');
                log(`   Título: ${col.title || 'Sin título'}`, 'cyan');
                log(`   Oculta: ${col.hidden ? 'Sí' : 'No'}`, 'white');
                log(`   Origen: ${col.origin || 'N/A'}`, 'white');

                // Obtener esquema detallado
                try {
                    const schemaRes = await client.get('/collections:get', { filterByTk: col.name });

                    if (schemaRes.data) {
                        const fields = schemaRes.data.fields || [];
                        log(`   Campos: ${fields.length}`, fields.length > 0 ? 'green' : 'yellow');

                        if (fields.length > 0) {
                            log(`\n   📝 Campos definidos:`, 'white');
                            fields.forEach((f: any) => {
                                const required = f.required ? '(requerido)' : '';
                                const relation = f.target ? `→ ${f.target}` : '';
                                log(`      • ${f.name}: ${f.type} ${required} ${relation}`, 'cyan');
                            });
                        } else {
                            log(`   ⚠️  COLECCIÓN VACÍA - Sin campos definidos`, 'yellow');
                        }
                    }
                } catch (err: any) {
                    log(`   ⚠️  Error obteniendo esquema: ${err.message}`, 'red');
                }
            }
        }

        // Mostrar colecciones del sistema
        if (system.length > 0) {
            log('\n═══════════════════════════════════════════════════════════', 'blue');
            log('  COLECCIONES DEL SISTEMA', 'blue');
            log('═══════════════════════════════════════════════════════════', 'blue');

            system.forEach((col: any) => {
                log(`\n📋 ${col.name} - "${col.title || 'Sin título'}"`, 'white');
            });
        }

        // Otras colecciones
        if (other.length > 0) {
            log('\n═══════════════════════════════════════════════════════════', 'magenta');
            log('  OTRAS COLECCIONES', 'magenta');
            log('═══════════════════════════════════════════════════════════', 'magenta');

            other.forEach((col: any) => {
                log(`\n📋 ${col.name} - "${col.title || 'Sin título'}"`, 'white');
            });
        }

        // Resumen
        log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
        log('║  RESUMEN                                                   ║', 'cyan');
        log('╚════════════════════════════════════════════════════════════╝', 'cyan');

        log(`\n📊 Total colecciones: ${collections.length}`, 'white');
        log(`   • UGCO: ${ugco.length}`, 'green');
        log(`   • Sistema: ${system.length}`, 'blue');
        log(`   • Otras: ${other.length}`, 'magenta');

        // Análisis de estado
        log(`\n💡 Análisis UGCO:`, 'yellow');

        const emptyCollections = ugco.filter((c: any) => {
            // Revisar si tiene campos en el objeto principal
            return !c.fields || c.fields.length === 0;
        });

        if (emptyCollections.length > 0) {
            log(`   ⚠️  ${emptyCollections.length} colección(es) sin campos definidos`, 'yellow');
            emptyCollections.forEach((c: any) => {
                log(`      • ${c.name} - "${c.title}"`, 'yellow');
            });
        }

        // Guardar reporte
        const report = {
            timestamp: new Date().toISOString(),
            total: collections.length,
            collections: collections,
            classification: {
                ugco: ugco.map((c: any) => ({ name: c.name, title: c.title })),
                system: system.map((c: any) => ({ name: c.name, title: c.title })),
                other: other.map((c: any) => ({ name: c.name, title: c.title }))
            }
        };

        const reportPath = path.join(__dirname, '../temp-collections-full.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
        log(`\n✓ Reporte completo guardado en: ${reportPath}`, 'green');

        log('\n', 'white');

    } catch (error: any) {
        log(`\n✗ Error: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

main();
