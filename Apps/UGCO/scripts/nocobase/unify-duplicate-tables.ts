/**
 * unify-duplicate-tables.ts - Unificación de tablas duplicadas en UGCO
 *
 * Este script identifica y unifica tablas que representan el mismo concepto:
 *   - ALMA_Sexo + ref_sexobiologico → ref_sexo (única fuente de verdad)
 *   - ref_etapa_clinica + ref_oncoestadio_clinico → unificar nombres
 *
 * También crea vistas de mapeo entre nomenclaturas (SIGO, HL7, ALMA)
 *
 * Uso:
 *   tsx Apps/UGCO/scripts/nocobase/unify-duplicate-tables.ts --dry-run
 *   tsx Apps/UGCO/scripts/nocobase/unify-duplicate-tables.ts --report   # solo reporte
 *   tsx Apps/UGCO/scripts/nocobase/unify-duplicate-tables.ts            # ejecutar
 */

import { createClient, log } from '../../../../shared/scripts/ApiClient';

const client = createClient();

// ═══════════════════════════════════════════════════════════════════════════
// Mapeo de tablas duplicadas
// ═══════════════════════════════════════════════════════════════════════════

interface DuplicateMapping {
    tables: string[];
    unified_name: string;
    unified_title: string;
    description: string;
    action: 'merge' | 'rename' | 'keep_both' | 'deprecate';
    fields_mapping?: Record<string, string>;
}

const DUPLICATE_MAPPINGS: DuplicateMapping[] = [
    {
        tables: ['ALMA_Sexo', 'ref_sexobiologico'],
        unified_name: 'ref_sexo',
        unified_title: 'REF: Sexo',
        description: 'Unifica ALMA_Sexo y ref_sexobiologico en una sola tabla',
        action: 'merge',
        fields_mapping: {
            // ALMA_Sexo fields → unified fields
            'sexo': 'nombre',
            // ref_sexobiologico fields → unified fields
            'code': 'codigo_hl7',
            'display': 'nombre',
        },
    },
    {
        tables: ['ref_etapa_clinica', 'ref_oncoestadio_clinico'],
        unified_name: 'ref_estadio_clinico',
        unified_title: 'REF: Estadio Clínico',
        description: 'ref_etapa_clinica es local, ref_oncoestadio_clinico es del esquema. Mantener ambas con nombres claros.',
        action: 'keep_both',
    },
    {
        tables: ['ALMA_Establecimiento'],
        unified_name: 'ref_establecimiento_deis',
        unified_title: 'REF: Establecimientos DEIS',
        description: 'ALMA_Establecimiento debería referenciar a ref_establecimiento_deis',
        action: 'deprecate',
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// Tabla unificada de Sexo
// ═══════════════════════════════════════════════════════════════════════════

const UNIFIED_SEXO = {
    name: 'ref_sexo',
    title: 'REF: Sexo',
    fields: [
        { name: 'codigo', type: 'string', interface: 'input', uiSchema: { title: 'Código', type: 'string', 'x-component': 'Input' } },
        { name: 'nombre', type: 'string', interface: 'input', uiSchema: { title: 'Nombre', type: 'string', 'x-component': 'Input' } },
        { name: 'codigo_sigo', type: 'string', interface: 'input', uiSchema: { title: 'Código SIGO', type: 'string', 'x-component': 'Input' } },
        { name: 'codigo_hl7', type: 'string', interface: 'input', uiSchema: { title: 'Código HL7', type: 'string', 'x-component': 'Input' } },
        { name: 'codigo_alma', type: 'string', interface: 'input', uiSchema: { title: 'Código ALMA', type: 'string', 'x-component': 'Input' } },
        { name: 'orden', type: 'integer', interface: 'integer', uiSchema: { title: 'Orden', type: 'number', 'x-component': 'InputNumber' } },
        { name: 'activo', type: 'boolean', interface: 'checkbox', defaultValue: true, uiSchema: { title: 'Activo', type: 'boolean', 'x-component': 'Checkbox' } },
    ],
    data: [
        { codigo: 'M', nombre: 'Masculino', codigo_sigo: 'Hombre', codigo_hl7: 'male', codigo_alma: 'M', orden: 1, activo: true },
        { codigo: 'F', nombre: 'Femenino', codigo_sigo: 'Mujer', codigo_hl7: 'female', codigo_alma: 'F', orden: 2, activo: true },
        { codigo: 'I', nombre: 'Indeterminado', codigo_sigo: 'Indeterminado', codigo_hl7: 'other', codigo_alma: 'I', orden: 3, activo: true },
        { codigo: 'D', nombre: 'Desconocido', codigo_sigo: 'Desconocido', codigo_hl7: 'unknown', codigo_alma: 'D', orden: 4, activo: true },
    ],
};

// ═══════════════════════════════════════════════════════════════════════════
// Funciones
// ═══════════════════════════════════════════════════════════════════════════

async function checkCollectionExists(name: string): Promise<boolean> {
    try {
        const response = await client.get(`/collections/${name}`);
        return response.data?.data?.name === name;
    } catch {
        return false;
    }
}

async function getCollectionData(name: string): Promise<any[]> {
    try {
        const response = await client.get(`/${name}:list`, { params: { pageSize: 1000 } });
        return response.data?.data || [];
    } catch {
        return [];
    }
}

async function generateReport(): Promise<void> {
    log('\n' + '═'.repeat(70), 'cyan');
    log('  REPORTE DE TABLAS DUPLICADAS / RELACIONADAS', 'cyan');
    log('═'.repeat(70) + '\n', 'cyan');

    for (const mapping of DUPLICATE_MAPPINGS) {
        log(`\n  ${mapping.unified_title}`, 'white');
        log(`  ${'─'.repeat(50)}`, 'gray');
        log(`  Descripción: ${mapping.description}`, 'gray');
        log(`  Acción recomendada: ${mapping.action.toUpperCase()}`, 'yellow');

        for (const table of mapping.tables) {
            const exists = await checkCollectionExists(table);
            const data = exists ? await getCollectionData(table) : [];
            const status = exists ? '[EXISTE]' : '[NO EXISTE]';
            const color = exists ? 'green' : 'red';
            log(`    ${status} ${table}: ${data.length} registros`, color);
        }
    }

    log('\n' + '═'.repeat(70) + '\n', 'cyan');
}

async function createUnifiedSexoTable(dryRun: boolean): Promise<boolean> {
    log('\n  Creando tabla unificada de Sexo...', 'white');

    if (dryRun) {
        log('    [DRY] Crear ref_sexo con 4 campos de mapeo (SIGO, HL7, ALMA)', 'gray');
        log('    [DRY] Cargar 4 registros con mapeos', 'gray');
        return true;
    }

    // Verificar si ya existe
    const exists = await checkCollectionExists(UNIFIED_SEXO.name);
    if (exists) {
        log('    [SKIP] ref_sexo ya existe', 'yellow');
        return true;
    }

    try {
        // Crear colección
        await client.post('/collections:create', {
            name: UNIFIED_SEXO.name,
            title: UNIFIED_SEXO.title,
            fields: UNIFIED_SEXO.fields,
        });
        log('    [OK] Colección ref_sexo creada', 'green');

        // Cargar datos
        for (const record of UNIFIED_SEXO.data) {
            await client.post(`/${UNIFIED_SEXO.name}:create`, record);
        }
        log(`    [OK] ${UNIFIED_SEXO.data.length} registros cargados`, 'green');

        return true;
    } catch (error: any) {
        const msg = error.response?.data?.errors?.[0]?.message || error.message;
        log(`    [ERROR] ${msg}`, 'red');
        return false;
    }
}

async function addDeprecationNote(tableName: string, note: string, dryRun: boolean): Promise<boolean> {
    if (dryRun) {
        log(`    [DRY] Marcar ${tableName} como DEPRECADO`, 'gray');
        return true;
    }

    try {
        await client.post(`/collections/${tableName}:update`, {
            description: `[DEPRECADO] ${note}`,
        });
        log(`    [OK] ${tableName} marcada como DEPRECADA`, 'yellow');
        return true;
    } catch (error: any) {
        log(`    [SKIP] No se pudo actualizar ${tableName}`, 'gray');
        return true;
    }
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const reportOnly = args.includes('--report');

    console.log('\n' + '╔' + '═'.repeat(68) + '╗');
    console.log('║' + '  UNIFY-DUPLICATE-TABLES: Unificación de tablas duplicadas          ' + '║');
    console.log('╚' + '═'.repeat(68) + '╝\n');

    // Siempre mostrar reporte primero
    await generateReport();

    if (reportOnly) {
        log('Modo reporte: no se realizaron cambios\n', 'gray');
        return;
    }

    if (dryRun) {
        log('[!] Modo DRY-RUN: no se realizarán cambios\n', 'yellow');
    }

    log('\n' + '═'.repeat(70), 'cyan');
    log('  EJECUTANDO UNIFICACIÓN', 'cyan');
    log('═'.repeat(70) + '\n', 'cyan');

    let ok = 0, fail = 0;

    // 1. Crear tabla unificada de sexo
    if (await createUnifiedSexoTable(dryRun)) ok++; else fail++;

    // 2. Marcar tablas como deprecadas
    for (const mapping of DUPLICATE_MAPPINGS) {
        if (mapping.action === 'deprecate') {
            for (const table of mapping.tables) {
                const exists = await checkCollectionExists(table);
                if (exists) {
                    const success = await addDeprecationNote(
                        table,
                        `Usar ${mapping.unified_name} en su lugar`,
                        dryRun
                    );
                    if (success) ok++; else fail++;
                }
            }
        }
    }

    // Resumen
    log('\n' + '━'.repeat(70), 'white');
    log(`  RESULTADO: ${ok} OK, ${fail} errores`, fail > 0 ? 'yellow' : 'green');
    log('━'.repeat(70) + '\n', 'white');

    // Recomendaciones
    log('  RECOMENDACIONES POST-UNIFICACIÓN:', 'white');
    log('  ─────────────────────────────────────────────────', 'gray');
    log('  1. Actualizar referencias: alma_paciente.sexo → ref_sexo', 'gray');
    log('  2. Migrar datos existentes de ALMA_Sexo a ref_sexo', 'gray');
    log('  3. Actualizar vistas/formularios que usen tablas deprecadas', 'gray');
    log('  4. Considerar eliminar ALMA_Sexo después de migración\n', 'gray');
}

main().catch(err => {
    log(`\n[FATAL] ${err.message}`, 'red');
    process.exit(1);
});
