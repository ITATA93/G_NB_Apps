import { createClient, log } from '../../../shared/scripts/ApiClient';
import chalk from 'chalk';
import readline from 'readline';

// Colecciones a eliminar (las 5 vacías de UGCO)
const COLLECTIONS_TO_DELETE = [
    { name: 't_fcwwwzv1d9m', title: 'Episodio Oncologico' },
    { name: 't_y8hbbtkjgl3', title: 'Oncologia' },
    { name: 't_uralzvq4vg1', title: 'Pacientes_Hospitalizados' },
    { name: 't_6xbh17pki1d', title: 'Pacientes' },
    { name: 't_pkg68r6rprd', title: 'Comite Oncologico' }
];

function askConfirmation(question: string): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            const normalized = answer.toLowerCase().trim();
            resolve(normalized === 's' || normalized === 'si' || normalized === 'y' || normalized === 'yes');
        });
    });
}

async function main() {
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  Eliminar Colecciones Vacías - NocoBase UGCO              ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

    const client = createClient();

    // Verificar conexión
    log('🔍 Verificando conexión...', 'yellow');
    try {
        await client.get('/auth:check');
        log('✓ Conexión exitosa\n', 'green');
    } catch (e) {
        log('✗ No se pudo conectar a NocoBase', 'red');
        return;
    }

    // Mostrar colecciones a eliminar
    log('⚠️  ADVERTENCIA: Se eliminarán las siguientes colecciones:', 'red');
    log('═══════════════════════════════════════════════════════════', 'red');

    COLLECTIONS_TO_DELETE.forEach((col, idx) => {
        log(`\n${idx + 1}. ${col.name}`, 'yellow');
        log(`   Título: ${col.title}`, 'yellow');
        log(`   Campos: 0 (vacía)`, 'yellow');
    });

    log('\n═══════════════════════════════════════════════════════════', 'red');
    log('\n⚠️  Esta acción NO se puede deshacer', 'red');
    log('⚠️  Las colecciones serán eliminadas permanentemente\n', 'red');

    // Pedir confirmación
    const confirm = await askConfirmation('¿Estás SEGURO de que quieres eliminar estas colecciones? (s/n): ');

    if (!confirm) {
        log('\n✗ Operación cancelada por el usuario', 'yellow');
        log('  No se realizaron cambios\n', 'yellow');
        return;
    }

    log('\n🔄 Iniciando eliminación de colecciones...\n', 'cyan');

    const results: any = {
        deleted: [],
        failed: [],
        errors: []
    };

    // Eliminar cada colección
    for (let i = 0; i < COLLECTIONS_TO_DELETE.length; i++) {
        const col = COLLECTIONS_TO_DELETE[i];

        log(`[${i + 1}/${COLLECTIONS_TO_DELETE.length}] Eliminando: ${col.name} (${col.title})`, 'cyan');

        try {
            // Verificar que existe antes de eliminar
            // Note: getCollectionSchema might throw if not found or return null depending on implementation
            // Here we assume client.get returns data or throws
            try {
                await client.get('/collections:get', { filterByTk: col.name });
            } catch (e: any) {
                if (e.response && e.response.status === 404) {
                    log(`  ℹ  La colección ya no existe`, 'yellow');
                    continue;
                }
                // If other error, let it bubble up or handle?
                // Assuming if we can't get it, we can't delete it or it doesn't exist.
            }

            // Eliminar
            await client.post('/collections:destroy', { filterByTk: col.name });

            log(`  ✓ Eliminada exitosamente`, 'green');
            results.deleted.push(col);

        } catch (error: any) {
            log(`  ✗ Error: ${error.message}`, 'red');
            results.failed.push(col);
            results.errors.push({
                collection: col.name,
                error: error.message
            });
        }
    }

    // Resumen
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  RESUMEN                                                   ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝', 'cyan');

    log(`\n📊 Resultados:`, 'white');
    log(`   ✓ Eliminadas: ${results.deleted.length}`, results.deleted.length > 0 ? 'green' : 'white');
    log(`   ✗ Fallidas: ${results.failed.length}`, results.failed.length > 0 ? 'red' : 'white');

    if (results.deleted.length > 0) {
        log(`\n✓ Colecciones eliminadas:`, 'green');
        results.deleted.forEach((col: any) => {
            log(`   • ${col.name} - "${col.title}"`, 'green');
        });
    }

    if (results.failed.length > 0) {
        log(`\n✗ Colecciones que no se pudieron eliminar:`, 'red');
        results.failed.forEach((col: any) => {
            log(`   • ${col.name} - "${col.title}"`, 'red');
        });

        log(`\n💡 Errores detallados:`, 'yellow');
        results.errors.forEach((err: any) => {
            log(`   • ${err.collection}: ${err.error}`, 'yellow');
        });
    }

    log('\n═══════════════════════════════════════════════════════════', 'white');

    if (results.deleted.length === COLLECTIONS_TO_DELETE.length) {
        log('✅ OPERACIÓN COMPLETADA EXITOSAMENTE', 'green');
    } else if (results.deleted.length > 0) {
        log('⚠️  OPERACIÓN COMPLETADA CON ERRORES', 'yellow');
    } else {
        log('✗ OPERACIÓN FALLIDA', 'red');
    }

    log('');
}

main().catch(error => {
    log(`\n✗ Error fatal: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
