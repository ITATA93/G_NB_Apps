/**
 * fix_fk_naming.ts — Reconciliar FK naming convention en schedule_blocks
 *
 * La coleccion schedule_blocks usa camelCase en algunos FK (ej: activityTypeId)
 * mientras que la convencion del proyecto es snake_case (activity_type_id).
 * Este script audita y opcionalmente renombra los campos FK.
 *
 * Uso:
 *   npx tsx scripts/fix_fk_naming.ts                  # Auditar (solo lectura)
 *   npx tsx scripts/fix_fk_naming.ts --fix             # Aplicar correccion
 *   npx tsx scripts/fix_fk_naming.ts --dry-run         # Simular correccion
 *   npx tsx scripts/fix_fk_naming.ts --collection <name>  # Auditar coleccion especifica
 */

import { createClient, log, logAction } from '../shared/scripts/ApiClient.js';

const api = createClient();
const FIX_MODE = process.argv.includes('--fix');
const DRY_RUN = process.argv.includes('--dry-run');

function getTargetCollection(): string | null {
    const idx = process.argv.indexOf('--collection');
    if (idx !== -1 && process.argv[idx + 1]) {
        return process.argv[idx + 1];
    }
    return null;
}

// Collections con FK potencialmente inconsistentes
const AUDIT_COLLECTIONS = [
    'schedule_blocks',
    'activity_blocks',
    'activity_types',
];

// Mapeo de camelCase -> snake_case para FK conocidos
const FK_RENAME_MAP: Record<string, string> = {
    activityTypeId: 'activity_type_id',
    staffId: 'staff_id',
    serviceId: 'service_id',
    scheduleId: 'schedule_id',
    blockTypeId: 'block_type_id',
    createdById: 'created_by_id',
    updatedById: 'updated_by_id',
};

interface FieldInfo {
    name: string;
    type: string;
    interface: string;
    foreignKey?: string;
    target?: string;
}

async function auditCollection(collectionName: string): Promise<FieldInfo[]> {
    log(`\n  Auditando: ${collectionName}`, 'cyan');
    const camelCaseFields: FieldInfo[] = [];

    try {
        const result = await api.get(`/collections/${collectionName}/fields:list`, {
            pageSize: 200,
        });
        const fields = (result as { data?: FieldInfo[] }).data || [];

        for (const field of fields) {
            const isCamelCase = /[a-z][A-Z]/.test(field.name);
            const isFk = field.type === 'belongsTo' || field.type === 'hasMany' ||
                         field.name.endsWith('Id') || field.name.endsWith('_id');

            if (isCamelCase && isFk) {
                const suggestedName = FK_RENAME_MAP[field.name] ||
                    field.name.replace(/([A-Z])/g, '_$1').toLowerCase();
                log(`    [ISSUE] "${field.name}" (${field.type}) -> sugerido: "${suggestedName}"`, 'yellow');
                camelCaseFields.push(field);
            } else if (isCamelCase) {
                log(`    [INFO]  "${field.name}" (${field.type}) — camelCase no-FK`, 'gray');
            }
        }

        if (camelCaseFields.length === 0) {
            log(`    [OK] Sin FK camelCase encontrados`, 'green');
        } else {
            log(`    [WARN] ${camelCaseFields.length} FK camelCase encontrados`, 'yellow');
        }
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        log(`    [ERROR] No se pudo auditar: ${msg}`, 'red');
    }

    return camelCaseFields;
}

async function fixField(collectionName: string, oldName: string, newName: string): Promise<boolean> {
    if (DRY_RUN) {
        log(`    [DRY RUN] Renombrar: ${collectionName}.${oldName} -> ${newName}`, 'yellow');
        return true;
    }

    try {
        // NocoBase no permite renombrar campos directamente.
        // Estrategia: crear campo nuevo, migrar datos, eliminar viejo.
        log(`    [INFO] Renombrado de campos NocoBase requiere migracion manual:`, 'gray');
        log(`           1. Crear campo "${newName}" en "${collectionName}"`, 'gray');
        log(`           2. Migrar datos de "${oldName}" a "${newName}" via SQL/API`, 'gray');
        log(`           3. Actualizar UI schemas que referencien "${oldName}"`, 'gray');
        log(`           4. Eliminar campo "${oldName}"`, 'gray');
        log(`    [SKIP] Aplicacion automatica no soportada — requiere migracion manual`, 'yellow');
        return false;
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        log(`    [ERROR] ${msg}`, 'red');
        return false;
    }
}

async function main() {
    log('\n============================================================', 'cyan');
    log('  Auditoria FK Naming Convention (snake_case vs camelCase)', 'cyan');
    log('============================================================\n', 'cyan');

    if (DRY_RUN) log('[DRY RUN] Simulacion\n', 'yellow');
    if (FIX_MODE) log('[FIX MODE] Intentar aplicar correcciones\n', 'yellow');

    const targetCollection = getTargetCollection();
    const collectionsToAudit = targetCollection ? [targetCollection] : AUDIT_COLLECTIONS;

    let totalIssues = 0;
    const issuesByCollection: Record<string, FieldInfo[]> = {};

    for (const col of collectionsToAudit) {
        const issues = await auditCollection(col);
        totalIssues += issues.length;
        if (issues.length > 0) {
            issuesByCollection[col] = issues;
        }
    }

    // Aplicar fix si se solicito
    if (FIX_MODE && totalIssues > 0) {
        log('\n── Aplicando correcciones ──\n', 'cyan');
        for (const [col, fields] of Object.entries(issuesByCollection)) {
            for (const field of fields) {
                const newName = FK_RENAME_MAP[field.name] ||
                    field.name.replace(/([A-Z])/g, '_$1').toLowerCase();
                await fixField(col, field.name, newName);
            }
        }
    }

    logAction('FK_NAMING_AUDIT', {
        collections: collectionsToAudit.length,
        totalIssues,
        fixMode: FIX_MODE,
        dryRun: DRY_RUN,
    });

    // Resumen
    log('\n============================================================', totalIssues === 0 ? 'green' : 'yellow');
    log(`  Auditoria completada: ${totalIssues} inconsistencias en ${collectionsToAudit.length} colecciones`, 'white');
    if (totalIssues > 0) {
        log('  NOTA: NocoBase no soporta rename de campos via API.', 'yellow');
        log('        Requiere migracion manual (crear nuevo, migrar datos, eliminar viejo).', 'yellow');
    }
    log('============================================================\n', totalIssues === 0 ? 'green' : 'yellow');
}

main().catch(err => {
    log(`\n[FATAL] ${err instanceof Error ? err.message : String(err)}`, 'red');
    process.exit(1);
});
