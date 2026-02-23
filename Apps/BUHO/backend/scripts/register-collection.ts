import { createClient, log } from '../../../../shared/scripts/ApiClient';

async function main() {
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  Registro de Colección BUHO_Pacientes en NocoBase         ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

    const client = createClient();

    try {
        // 1. Verificar si la colección ya existe
        log('🔍 Verificando si la colección existe...', 'yellow');
        try {
            const check = await client.get('/collections:get', { filterByTk: 'BUHO_Pacientes' });
            if (check.data) {
                log('⚠️  La colección BUHO_Pacientes ya existe.', 'yellow');
                return;
            }
        } catch (e: any) {
            if (e.response?.status !== 404) {
                // Si es 404, es bueno (no existe). Si es otro error, reportarlo.
                // log(`Error verificando: ${e.message}`, 'red');
            }
        }

        // 2. Crear la colección (Importar desde SQL)

        log('🚀 Creando colección BUHO_Pacientes...', 'cyan');

        const collectionData = {
            name: 'BUHO_Pacientes',
            title: 'Pacientes BUHO',
            inherit: false,
            hidden: false,
            description: 'Tabla de pacientes sincronizada para proyección BUHO',
            fields: [
                { name: 'nombre', type: 'string', title: 'Nombre' },
                { name: 'rut', type: 'string', title: 'RUT' },
                { name: 'cama', type: 'string', title: 'Cama' },
                { name: 'episodio', type: 'string', title: 'Episodio' },
                { name: 'servicio', type: 'string', title: 'Servicio' },
                { name: 'sala', type: 'string', title: 'Sala' },
                { name: 'fecha_ingreso', type: 'date', title: 'Fecha Ingreso' },
                { name: 'tipo_cama', type: 'string', title: 'Tipo Cama' },
                { name: 'categorizacion', type: 'string', title: 'Categorización' },
                { name: 'diagnostico_principal', type: 'text', title: 'Diagnóstico' },
                { name: 'especialidad_medico', type: 'string', title: 'Especialidad' },
                { name: 'fecha_probable_alta', type: 'date', title: 'Fecha Alta Probable' },
                { name: 'estudios_pendientes', type: 'text', title: 'Estudios Pendientes' },
                // Campos calculados
                { name: 'estado_plan', type: 'string', title: 'Estado Plan' },
                { name: 'proxima_accion', type: 'text', title: 'Próxima Acción' },
                { name: 'riesgo_detectado', type: 'string', title: 'Riesgo' }
            ]
        };

        const response = await client.post('/collections:create', collectionData);

        if (response.data) {
            log('✅ Colección creada exitosamente!', 'green');
            log(`   ID: ${response.data.key || response.data.name}`, 'white');
        } else {
            log('⚠️  Respuesta inesperada al crear colección', 'yellow');
        }

    } catch (error: any) {
        log(`\n✗ Error fatal: ${error.message}`, 'red');
        if (error.response) {
            log(`  Status: ${error.response.status}`, 'red');
            log(`  Data: ${JSON.stringify(error.response.data)}`, 'red');
        }
    }
}

main();
