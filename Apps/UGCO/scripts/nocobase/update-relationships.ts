/**
 * update-relationships.ts - Actualizar relaciones belongsTo para apuntar a tablas UGCO_
 *
 * Las relaciones existentes apuntan a las tablas sin prefijo.
 * Este script las actualiza para apuntar a las nuevas tablas UGCO_.
 *
 * Uso:
 *   npx tsx Apps/UGCO/scripts/nocobase/update-relationships.ts --dry-run
 *   npx tsx Apps/UGCO/scripts/nocobase/update-relationships.ts
 */

import axios, { AxiosInstance } from 'axios';

// ─── Configuración MIRA ─────────────────────────────────────────────────────

const MIRA_CONFIG = {
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    apiKey: process.env.NOCOBASE_API_KEY || '',
};

const DRY_RUN = process.argv.includes('--dry-run');

// ─── Mapeo de targets viejos a nuevos ───────────────────────────────────────

const TARGET_MAPPING: Record<string, string> = {
    // REF tables
    'ref_oncomorfologia': 'UGCO_REF_oncomorfologiaicdo',
    'ref_oncotopografia': 'UGCO_REF_oncotopografiaicdo',
    'ref_cie10': 'UGCO_REF_cie10',
    'ref_oncoespecialidad': 'UGCO_REF_oncoespecialidad',
    'ref_oncodiagnostico': 'UGCO_REF_oncodiagnostico',
    'ref_oncoecog': 'UGCO_REF_oncoecog',
    'ref_oncoestadio_clinico': 'UGCO_REF_oncoestadio_clinico',
    'ref_oncoestadoactividad': 'UGCO_REF_oncoestadoactividad',
    'ref_oncoestadoadm': 'UGCO_REF_oncoestadoadm',
    'ref_oncoestadocaso': 'UGCO_REF_oncoestadocaso',
    'ref_oncoestadoclinico': 'UGCO_REF_oncoestadoclinico',
    'ref_oncofigo': 'UGCO_REF_oncofigo',
    'ref_oncogradohistologico': 'UGCO_REF_oncogradohistologico',
    'ref_oncointenciontrat': 'UGCO_REF_oncointenciontrat',
    'ref_oncotipoactividad': 'UGCO_REF_oncotipoactividad',
    'ref_oncotipodocumento': 'UGCO_REF_oncotipodocumento',
    'ref_oncotipoetapificacion': 'UGCO_REF_oncotipoetapificacion',
    'ref_oncotnm_m': 'UGCO_REF_oncotnm_m',
    'ref_oncotnm_t': 'UGCO_REF_oncotnm_t',
    'ref_oncotnm_n': 'UGCO_REF_oncotnm_n',
    'ref_oncobasediagnostico': 'UGCO_REF_oncobasediagnostico',
    'ref_lateralidad': 'UGCO_REF_lateralidad',
    'ref_extension': 'UGCO_REF_extension',
    'ref_prevision': 'UGCO_REF_prevision',
    'ref_sexo': 'UGCO_REF_sexo',
    'ref_comuna': 'UGCO_REF_comuna',
    'ref_establecimiento_deis': 'UGCO_REF_establecimiento_deis',
    // ALMA tables
    'alma_paciente': 'UGCO_ALMA_paciente',
    'alma_episodio': 'UGCO_ALMA_episodio',
    'alma_diagnostico': 'UGCO_ALMA_diagnostico',
    // UGCO tables (lowercase to UGCO_)
    'ugco_equiposeguimiento': 'UGCO_equiposeguimiento',
    'ugco_casooncologico': 'UGCO_casooncologico',
    'ugco_comiteoncologico': 'UGCO_comiteoncologico',
    'ugco_contactopaciente': 'UGCO_contactopaciente',
    'ugco_eventoclinico': 'UGCO_eventoclinico',
    'ugco_tarea': 'UGCO_tarea',
    'ugco_comitecaso': 'UGCO_comitecaso',
};

// ─── Colecciones a revisar ──────────────────────────────────────────────────

const COLLECTIONS_TO_CHECK = [
    'ugco_casooncologico',
    'ugco_comiteoncologico',
    'UGCO_ALMA_paciente',
    'UGCO_ALMA_episodio',
    'UGCO_ALMA_diagnostico',
    'UGCO_REF_oncodiagnostico',
    'UGCO_REF_oncotopografiaicdo',
    'UGCO_equiposeguimiento',
    'UGCO_contactopaciente',
    'UGCO_eventoclinico',
    'UGCO_tarea',
    'UGCO_comitecaso',
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

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    log('╔════════════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  UPDATE RELATIONSHIPS TO UGCO_ TABLES                             ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════════════╝', 'cyan');

    log(`\n  Servidor: ${MIRA_CONFIG.baseURL}`, 'gray');

    if (DRY_RUN) {
        log('\n  [!] Modo DRY-RUN: no se actualizarán relaciones\n', 'yellow');
    }

    const client = axios.create({
        baseURL: MIRA_CONFIG.baseURL,
        headers: {
            'Authorization': `Bearer ${MIRA_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
        },
    });

    // Verificar conexión
    log('\n  Verificando conexión...', 'gray');
    try {
        await client.get('/app:getLang');
        log('  [OK] Conexión establecida\n', 'green');
    } catch (error: any) {
        log(`\n  [ERROR] No se puede conectar: ${error.message}`, 'red');
        process.exit(1);
    }

    let totalUpdated = 0;
    let totalErrors = 0;
    let totalSkipped = 0;

    for (const collectionName of COLLECTIONS_TO_CHECK) {
        log(`\n  Revisando ${collectionName}...`, 'gray');

        // Obtener campos de la colección
        let fields: any[] = [];
        try {
            const response = await client.get(`/collections/${collectionName}/fields:list`);
            fields = response.data?.data || [];
        } catch (error: any) {
            log(`    [SKIP] No se pudo obtener campos: ${error.response?.data?.errors?.[0]?.message || error.message}`, 'yellow');
            totalSkipped++;
            continue;
        }

        // Filtrar solo relaciones belongsTo
        const belongsToFields = fields.filter(f => f.type === 'belongsTo');

        if (belongsToFields.length === 0) {
            log(`    Sin relaciones belongsTo`, 'gray');
            continue;
        }

        for (const field of belongsToFields) {
            const oldTarget = field.target;
            const newTarget = TARGET_MAPPING[oldTarget];

            if (!newTarget) {
                // No hay mapeo, verificar si ya apunta a UGCO_
                if (oldTarget?.startsWith('UGCO_')) {
                    log(`    ${field.name} → ${oldTarget} (ya actualizado)`, 'gray');
                } else {
                    log(`    ${field.name} → ${oldTarget} (sin mapeo definido)`, 'yellow');
                }
                continue;
            }

            if (oldTarget === newTarget) {
                log(`    ${field.name} → ${oldTarget} (sin cambios)`, 'gray');
                continue;
            }

            // Actualizar la relación
            log(`    ${field.name}: ${oldTarget} → ${newTarget}`, 'cyan');

            if (DRY_RUN) {
                log(`      [DRY] Se actualizaría`, 'yellow');
                totalUpdated++;
                continue;
            }

            try {
                // NocoBase usa filterByTk como query param
                await client.post(`/collections/${collectionName}/fields:update?filterByTk=${field.name}`, {
                    target: newTarget,
                });
                log(`      [OK] Actualizado`, 'green');
                totalUpdated++;
            } catch (error: any) {
                const msg = error.response?.data?.errors?.[0]?.message || error.message;
                // Si falla, intentar con otro formato
                try {
                    await client.post(`/collections:setFields?filterByTk=${collectionName}`, {
                        fields: [{
                            name: field.name,
                            target: newTarget,
                        }],
                    });
                    log(`      [OK] Actualizado (método alternativo)`, 'green');
                    totalUpdated++;
                } catch (error2: any) {
                    const msg2 = error2.response?.data?.errors?.[0]?.message || error2.message;
                    log(`      [ERROR] ${msg} / ${msg2}`, 'red');
                    totalErrors++;
                }
            }
        }
    }

    log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'white');
    log(`  Relaciones actualizadas: ${totalUpdated}`, totalUpdated > 0 ? 'green' : 'gray');
    if (totalErrors > 0) {
        log(`  Errores: ${totalErrors}`, 'red');
    }
    if (totalSkipped > 0) {
        log(`  Colecciones omitidas: ${totalSkipped}`, 'yellow');
    }
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`, 'white');
}

main().catch(console.error);
