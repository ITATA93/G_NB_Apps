/**
 * deploy-ugco-improve.ts - Add missing fields, fix enums, add relationships
 *
 * Addresses data model gaps found during analysis:
 *
 * 1. ugco_casooncologico: Missing fields referenced by dashboard
 *    - estado_seguimiento (select: ACTIVO, CERRADO, PERDIDO, FALLECIDO)
 *    - control_vencido (boolean)
 *    - tareas_criticas_pendientes (integer)
 *    - fecha_proximo_control (date)
 *    - especialidad_principal_id (belongsTo ref_oncoespecialidad)
 *
 * 2. ugco_eventoclinico: Expand tipo_evento enum
 *    - Add: BIOPSIA, INTERCONSULTA, IMAGENOLOGIA, LABORATORIO, COMITE
 *
 * 3. ugco_comiteoncologico: Add missing fields
 *    - fecha_sesion (alias for consistency with dashboard)
 *    - estado (select: PROGRAMADO, EN_CURSO, FINALIZADO, CANCELADO)
 *
 * 4. ugco_comitecaso: Add missing fields
 *    - orden_presentacion (integer)
 *    - motivo_presentacion (text)
 *    - decision_comite (text)
 *    - observaciones (text)
 *
 * 5. ugco_tarea: Add estado field
 *    - estado (select: PENDIENTE, EN_PROGRESO, COMPLETADA, CANCELADA, VENCIDA)
 *
 * This script is IDEMPOTENT — safe to run multiple times.
 * Uses: shared/scripts/ApiClient.js
 */

import { createClient, log } from '../../../../shared/scripts/ApiClient.js';

const api = createClient();
const DRY_RUN = process.argv.includes('--dry-run');

interface FieldToAdd {
    collection: string;
    field: Record<string, unknown>;
}

// ─── Field definitions ───────────────────────────────────────────────────────

const FIELDS_TO_ADD: FieldToAdd[] = [
    // ── ugco_casooncologico: Dashboard fields ────────────────────────────────
    {
        collection: 'UGCO_casooncologico',
        field: {
            name: 'estado_seguimiento',
            type: 'string',
            interface: 'select',
            uiSchema: {
                title: 'Estado seguimiento',
                type: 'string',
                'x-component': 'Select',
                enum: [
                    { value: 'ACTIVO', label: 'Activo', color: 'green' },
                    { value: 'EN_ESTUDIO', label: 'En estudio', color: 'blue' },
                    { value: 'EN_TRATAMIENTO', label: 'En tratamiento', color: 'cyan' },
                    { value: 'SEGUIMIENTO', label: 'Seguimiento', color: 'default' },
                    { value: 'CERRADO', label: 'Cerrado', color: 'default' },
                    { value: 'PERDIDO', label: 'Perdido de seguimiento', color: 'orange' },
                    { value: 'FALLECIDO', label: 'Fallecido', color: 'red' },
                ],
            },
            defaultValue: 'ACTIVO',
        },
    },
    {
        collection: 'UGCO_casooncologico',
        field: {
            name: 'control_vencido',
            type: 'boolean',
            interface: 'checkbox',
            uiSchema: {
                title: 'Control vencido',
                type: 'boolean',
                'x-component': 'Checkbox',
            },
            defaultValue: false,
        },
    },
    {
        collection: 'UGCO_casooncologico',
        field: {
            name: 'tareas_criticas_pendientes',
            type: 'integer',
            interface: 'integer',
            uiSchema: {
                title: 'Tareas críticas pendientes',
                type: 'number',
                'x-component': 'InputNumber',
            },
            defaultValue: 0,
        },
    },
    {
        collection: 'UGCO_casooncologico',
        field: {
            name: 'fecha_proximo_control',
            type: 'date',
            interface: 'datetime',
            uiSchema: {
                title: 'Fecha próximo control',
                type: 'string',
                'x-component': 'DatePicker',
                'x-component-props': { dateFormat: 'DD/MM/YYYY' },
            },
        },
    },
    {
        collection: 'UGCO_casooncologico',
        field: {
            name: 'especialidad_principal',
            type: 'belongsTo',
            interface: 'obo',
            foreignKey: 'especialidad_principal_id',
            target: 'UGCO_REF_oncoespecialidad',
            uiSchema: {
                title: 'Especialidad principal',
                type: 'object',
                'x-component': 'AssociationField',
                'x-component-props': { fieldNames: { label: 'nombre', value: 'id' } },
            },
        },
    },
    // ── ugco_comiteoncologico: Missing fields ────────────────────────────────
    {
        collection: 'UGCO_comiteoncologico',
        field: {
            name: 'fecha_sesion',
            type: 'date',
            interface: 'datetime',
            uiSchema: {
                title: 'Fecha sesión',
                type: 'string',
                'x-component': 'DatePicker',
                'x-component-props': { dateFormat: 'DD/MM/YYYY', showTime: true },
            },
        },
    },
    {
        collection: 'UGCO_comiteoncologico',
        field: {
            name: 'estado',
            type: 'string',
            interface: 'select',
            uiSchema: {
                title: 'Estado',
                type: 'string',
                'x-component': 'Select',
                enum: [
                    { value: 'PROGRAMADO', label: 'Programado', color: 'blue' },
                    { value: 'EN_CURSO', label: 'En curso', color: 'green' },
                    { value: 'FINALIZADO', label: 'Finalizado', color: 'default' },
                    { value: 'CANCELADO', label: 'Cancelado', color: 'red' },
                ],
            },
            defaultValue: 'PROGRAMADO',
        },
    },
    // ── ugco_comitecaso: Missing fields ───────────────────────────────────────
    {
        collection: 'UGCO_comitecaso',
        field: {
            name: 'orden_presentacion',
            type: 'integer',
            interface: 'integer',
            uiSchema: {
                title: 'Orden de presentación',
                type: 'number',
                'x-component': 'InputNumber',
            },
        },
    },
    {
        collection: 'UGCO_comitecaso',
        field: {
            name: 'motivo_presentacion',
            type: 'text',
            interface: 'textarea',
            uiSchema: {
                title: 'Motivo de presentación',
                type: 'string',
                'x-component': 'Input.TextArea',
            },
        },
    },
    {
        collection: 'UGCO_comitecaso',
        field: {
            name: 'decision_comite',
            type: 'text',
            interface: 'textarea',
            uiSchema: {
                title: 'Decisión del comité',
                type: 'string',
                'x-component': 'Input.TextArea',
            },
        },
    },
    {
        collection: 'UGCO_comitecaso',
        field: {
            name: 'observaciones',
            type: 'text',
            interface: 'textarea',
            uiSchema: {
                title: 'Observaciones',
                type: 'string',
                'x-component': 'Input.TextArea',
            },
        },
    },
    // ── ugco_tarea: Add estado field ─────────────────────────────────────────
    {
        collection: 'UGCO_tarea',
        field: {
            name: 'estado',
            type: 'string',
            interface: 'select',
            uiSchema: {
                title: 'Estado',
                type: 'string',
                'x-component': 'Select',
                enum: [
                    { value: 'PENDIENTE', label: 'Pendiente', color: 'orange' },
                    { value: 'EN_PROGRESO', label: 'En progreso', color: 'blue' },
                    { value: 'COMPLETADA', label: 'Completada', color: 'green' },
                    { value: 'CANCELADA', label: 'Cancelada', color: 'default' },
                    { value: 'VENCIDA', label: 'Vencida', color: 'red' },
                ],
            },
            defaultValue: 'PENDIENTE',
        },
    },
    {
        collection: 'UGCO_tarea',
        field: {
            name: 'prioridad',
            type: 'string',
            interface: 'select',
            uiSchema: {
                title: 'Prioridad',
                type: 'string',
                'x-component': 'Select',
                enum: [
                    { value: 'BAJA', label: 'Baja', color: 'default' },
                    { value: 'MEDIA', label: 'Media', color: 'blue' },
                    { value: 'ALTA', label: 'Alta', color: 'orange' },
                    { value: 'CRITICA', label: 'Crítica', color: 'red' },
                ],
            },
            defaultValue: 'MEDIA',
        },
    },
    // ── ugco_eventoclinico: Add estado field ─────────────────────────────────
    {
        collection: 'UGCO_eventoclinico',
        field: {
            name: 'estado',
            type: 'string',
            interface: 'select',
            uiSchema: {
                title: 'Estado',
                type: 'string',
                'x-component': 'Select',
                enum: [
                    { value: 'PENDIENTE', label: 'Pendiente', color: 'orange' },
                    { value: 'PROGRAMADO', label: 'Programado', color: 'blue' },
                    { value: 'REALIZADO', label: 'Realizado', color: 'green' },
                    { value: 'CANCELADO', label: 'Cancelado', color: 'default' },
                ],
            },
            defaultValue: 'PENDIENTE',
        },
    },
    // ── ugco_contactopaciente: Missing tipo_contacto fields ──────────────────
    {
        collection: 'UGCO_contactopaciente',
        field: {
            name: 'tipo_contacto',
            type: 'string',
            interface: 'select',
            uiSchema: {
                title: 'Tipo contacto',
                type: 'string',
                'x-component': 'Select',
                enum: [
                    { value: 'TELEFONO', label: 'Teléfono' },
                    { value: 'EMAIL', label: 'Email' },
                    { value: 'DIRECCION', label: 'Dirección' },
                    { value: 'OTRO', label: 'Otro' },
                ],
            },
        },
    },
    {
        collection: 'UGCO_contactopaciente',
        field: {
            name: 'valor_contacto',
            type: 'string',
            interface: 'input',
            uiSchema: {
                title: 'Valor de contacto',
                type: 'string',
                'x-component': 'Input',
            },
        },
    },
    {
        collection: 'UGCO_contactopaciente',
        field: {
            name: 'es_principal',
            type: 'boolean',
            interface: 'checkbox',
            uiSchema: {
                title: 'Es principal',
                type: 'boolean',
                'x-component': 'Checkbox',
            },
            defaultValue: false,
        },
    },
    {
        collection: 'UGCO_contactopaciente',
        field: {
            name: 'activo',
            type: 'boolean',
            interface: 'checkbox',
            uiSchema: {
                title: 'Activo',
                type: 'boolean',
                'x-component': 'Checkbox',
            },
            defaultValue: true,
        },
    },
];

// ─── Enum expansion: update tipo_evento to include more clinical event types ─

const TIPO_EVENTO_EXPANSION = {
    collection: 'UGCO_eventoclinico',
    fieldName: 'tipo_evento',
    newUiSchema: {
        title: 'Tipo evento',
        type: 'string',
        'x-component': 'Select',
        enum: [
            { value: 'EXAMEN', label: 'Examen', color: 'blue' },
            { value: 'CIRUGIA', label: 'Cirugía', color: 'red' },
            { value: 'QT', label: 'Quimioterapia', color: 'purple' },
            { value: 'RT', label: 'Radioterapia', color: 'orange' },
            { value: 'BIOPSIA', label: 'Biopsia', color: 'cyan' },
            { value: 'INTERCONSULTA', label: 'Interconsulta', color: 'green' },
            { value: 'IMAGENOLOGIA', label: 'Imagenología', color: 'blue' },
            { value: 'LABORATORIO', label: 'Laboratorio', color: 'default' },
            { value: 'COMITE', label: 'Comité', color: 'yellow' },
            { value: 'OTRO', label: 'Otro', color: 'default' },
        ],
    },
};

// ─── Main ────────────────────────────────────────────────────────────────────

async function addField(f: FieldToAdd): Promise<'ok' | 'skip' | 'error'> {
    const fieldName = f.field.name as string;
    if (DRY_RUN) {
        log(`  [DRY] ${f.collection}.${fieldName}`, 'gray');
        return 'ok';
    }

    try {
        await api.post(`/collections/${f.collection}/fields:create`, f.field as Record<string, unknown>);
        log(`  [OK] ${f.collection}.${fieldName}`, 'green');
        return 'ok';
    } catch (err: unknown) {
        const axErr = err as { response?: { data?: { errors?: Array<{ message?: string }> } }; message?: string };
        const msg = axErr.response?.data?.errors?.[0]?.message || (err instanceof Error ? err.message : String(err));
        if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('Unique')) {
            log(`  [SKIP] ${f.collection}.${fieldName} — already exists`, 'yellow');
            return 'skip';
        }
        log(`  [ERROR] ${f.collection}.${fieldName} — ${msg}`, 'red');
        return 'error';
    }
}

async function updateEnum(): Promise<boolean> {
    const { collection, fieldName, newUiSchema } = TIPO_EVENTO_EXPANSION;
    if (DRY_RUN) {
        log(`  [DRY] Update enum: ${collection}.${fieldName}`, 'gray');
        return true;
    }

    try {
        await api.post(`/collections/${collection}/fields:update`, {
            filterByTk: fieldName,
            uiSchema: newUiSchema,
        } as Record<string, unknown>);
        log(`  [OK] Enum expanded: ${collection}.${fieldName}`, 'green');
        return true;
    } catch (err: unknown) {
        const axErr = err as { response?: { data?: { errors?: Array<{ message?: string }> } }; message?: string };
        const msg = axErr.response?.data?.errors?.[0]?.message || (err instanceof Error ? err.message : String(err));
        log(`  [WARN] Enum update: ${collection}.${fieldName} — ${msg}`, 'yellow');
        return false;
    }
}

async function main() {
    log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  UGCO IMPROVE — Add Missing Fields & Fix Enums           ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

    if (DRY_RUN) {
        log('  ** DRY-RUN MODE — no changes will be made **\n', 'yellow');
    }

    // Group by collection for display
    const byCollection = new Map<string, FieldToAdd[]>();
    for (const f of FIELDS_TO_ADD) {
        const arr = byCollection.get(f.collection) || [];
        arr.push(f);
        byCollection.set(f.collection, arr);
    }

    let totalOk = 0, totalSkip = 0, totalErr = 0;

    for (const [collection, fields] of byCollection) {
        log(`\n── ${collection} (${fields.length} fields) ──\n`, 'cyan');
        for (const f of fields) {
            const result = await addField(f);
            if (result === 'ok') totalOk++;
            else if (result === 'skip') totalSkip++;
            else totalErr++;
        }
    }

    // Expand tipo_evento enum
    log('\n── Expand tipo_evento enum ──\n', 'cyan');
    await updateEnum();

    log('\n═══════════════════════════════════════════════════════════', 'green');
    log(`  Results: ${totalOk} added, ${totalSkip} skipped, ${totalErr} errors`, totalErr > 0 ? 'yellow' : 'green');
    log(`  Total fields defined: ${FIELDS_TO_ADD.length}`, 'green');
    log('═══════════════════════════════════════════════════════════\n', 'green');
}

main().catch(err => {
    log(`\n[FATAL] ${err.message}`, 'red');
    process.exit(1);
});
