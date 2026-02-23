/**
 * Deploy all AGENDA module fields to NocoBase collections.
 * Run: npx tsx shared/scripts/deploy-agenda-fields.ts
 */
import { createClient, log } from './ApiClient.ts';

interface FieldDef {
    name: string;
    type: string;
    interface?: string;
    title: string;
    required?: boolean;
    unique?: boolean;
    target?: string;
    foreignKey?: string;
    defaultValue?: unknown;
    uiSchema?: Record<string, unknown>;
    enum?: Array<{ value: string; label: string }>;
}

const AGENDA_FIELDS: Record<string, FieldDef[]> = {
    ag_categorias_actividad: [
        { name: 'nombre', type: 'string', interface: 'input', title: 'Nombre', required: true },
        { name: 'codigo', type: 'string', interface: 'input', title: 'Código', required: true, unique: true },
        { name: 'grupo', type: 'string', interface: 'select', title: 'Grupo', enum: [
            {value:'Clínica',label:'Clínica'},{value:'Quirúrgica',label:'Quirúrgica'},
            {value:'Policlínico',label:'Policlínico'},{value:'Oncología',label:'Oncología'},
            {value:'Administrativa',label:'Administrativa'},{value:'Otro',label:'Otro'}
        ]},
        { name: 'orden', type: 'integer', interface: 'integer', title: 'Orden' },
        { name: 'color', type: 'string', interface: 'input', title: 'Color Hex' },
        { name: 'activa', type: 'boolean', interface: 'checkbox', title: 'Activa', defaultValue: true },
    ],
    ag_tipos_inasistencia: [
        { name: 'nombre', type: 'string', interface: 'input', title: 'Nombre', required: true },
        { name: 'codigo', type: 'string', interface: 'input', title: 'Código', required: true, unique: true },
        { name: 'descripcion', type: 'text', interface: 'textarea', title: 'Descripción' },
        { name: 'activo', type: 'boolean', interface: 'checkbox', title: 'Activo', defaultValue: true },
    ],
    ag_servicios: [
        { name: 'nombre', type: 'string', interface: 'input', title: 'Nombre', required: true },
        { name: 'codigo', type: 'string', interface: 'input', title: 'Código', required: true, unique: true },
        { name: 'activo', type: 'boolean', interface: 'checkbox', title: 'Activo', defaultValue: true },
    ],
    ag_funcionarios: [
        { name: 'nombre_completo', type: 'string', interface: 'input', title: 'Nombre Completo', required: true },
        { name: 'rut', type: 'string', interface: 'input', title: 'RUT', required: true, unique: true },
        { name: 'codigo_alma', type: 'string', interface: 'input', title: 'Código ALMA' },
        { name: 'especialidad', type: 'string', interface: 'input', title: 'Especialidad' },
        { name: 'servicio_id', type: 'belongsTo', interface: 'obo', title: 'Servicio', target: 'ag_servicios', foreignKey: 'servicio_id' },
        { name: 'cargo', type: 'string', interface: 'select', title: 'Cargo', enum: [
            {value:'Médico Cirujano',label:'Médico Cirujano'},
            {value:'Médico Internista',label:'Médico Internista'},
            {value:'Médico Especialista',label:'Médico Especialista'}
        ]},
        { name: 'email', type: 'string', interface: 'email', title: 'Email' },
        { name: 'jornada_horas', type: 'integer', interface: 'integer', title: 'Jornada Semanal (hrs)' },
        { name: 'activo', type: 'boolean', interface: 'checkbox', title: 'Activo', defaultValue: true },
    ],
    ag_bloques_agenda: [
        { name: 'fecha', type: 'date', interface: 'datePicker', title: 'Fecha', required: true },
        { name: 'funcionario_id', type: 'belongsTo', interface: 'obo', title: 'Funcionario', target: 'ag_funcionarios', foreignKey: 'funcionario_id', required: true },
        { name: 'categoria_id', type: 'belongsTo', interface: 'obo', title: 'Categoría', target: 'ag_categorias_actividad', foreignKey: 'categoria_id', required: true },
        { name: 'subcategoria', type: 'string', interface: 'input', title: 'Subcategoría' },
        { name: 'hora_inicio', type: 'time', interface: 'timePicker', title: 'Hora Inicio', required: true },
        { name: 'hora_fin', type: 'time', interface: 'timePicker', title: 'Hora Fin', required: true },
        { name: 'duracion_min', type: 'integer', interface: 'integer', title: 'Duración (min)' },
        { name: 'periodo', type: 'string', interface: 'select', title: 'Período', enum: [
            {value:'AM',label:'AM'},{value:'PM',label:'PM'}
        ]},
        { name: 'servicio_id', type: 'belongsTo', interface: 'obo', title: 'Servicio', target: 'ag_servicios', foreignKey: 'servicio_id' },
        { name: 'observaciones', type: 'text', interface: 'textarea', title: 'Observaciones' },
    ],
    ag_inasistencias: [
        { name: 'fecha', type: 'date', interface: 'datePicker', title: 'Fecha', required: true },
        { name: 'funcionario_id', type: 'belongsTo', interface: 'obo', title: 'Funcionario', target: 'ag_funcionarios', foreignKey: 'funcionario_id', required: true },
        { name: 'tipo_inasistencia_id', type: 'belongsTo', interface: 'obo', title: 'Tipo', target: 'ag_tipos_inasistencia', foreignKey: 'tipo_inasistencia_id', required: true },
        { name: 'periodo', type: 'string', interface: 'select', title: 'Período', enum: [
            {value:'Completo',label:'Completo'},{value:'AM',label:'AM'},{value:'PM',label:'PM'}
        ]},
        { name: 'notas', type: 'text', interface: 'textarea', title: 'Notas' },
    ],
    ag_resumen_diario: [
        { name: 'fecha', type: 'date', interface: 'datePicker', title: 'Fecha', required: true },
        { name: 'funcionario_id', type: 'belongsTo', interface: 'obo', title: 'Funcionario', target: 'ag_funcionarios', foreignKey: 'funcionario_id', required: true },
        { name: 'total_horas', type: 'double', interface: 'number', title: 'Total Horas' },
        { name: 'hora_salida', type: 'time', interface: 'timePicker', title: 'Hora Salida' },
        { name: 'sala_count', type: 'integer', interface: 'integer', title: 'N° Sala' },
        { name: 'pab_am', type: 'integer', interface: 'integer', title: 'N° Pabellón AM' },
        { name: 'pab_pm', type: 'integer', interface: 'integer', title: 'N° Pabellón PM' },
        { name: 'poli_am', type: 'integer', interface: 'integer', title: 'N° Policlínico AM' },
        { name: 'poli_pm', type: 'integer', interface: 'integer', title: 'N° Policlínico PM' },
        { name: 'inasistencias', type: 'integer', interface: 'integer', title: 'N° Inasistencias' },
        { name: 'detalle_json', type: 'json', interface: 'json', title: 'Detalle por Categoría' },
    ],
    ag_resumen_semanal: [
        { name: 'semana_inicio', type: 'date', interface: 'datePicker', title: 'Semana Inicio (Lunes)', required: true },
        { name: 'semana_fin', type: 'date', interface: 'datePicker', title: 'Semana Fin (Domingo)', required: true },
        { name: 'funcionario_id', type: 'belongsTo', interface: 'obo', title: 'Funcionario', target: 'ag_funcionarios', foreignKey: 'funcionario_id', required: true },
        { name: 'total_horas', type: 'double', interface: 'number', title: 'Total Horas' },
        { name: 'detalle_json', type: 'json', interface: 'json', title: 'Detalle por Categoría' },
        { name: 'generado_at', type: 'date', interface: 'datetime', title: 'Generado' },
    ],
};

async function main() {
    const client = createClient();
    let totalCreated = 0;
    let totalErrors = 0;

    log('🚀 Desplegando campos AGENDA en NocoBase...\n', 'cyan');

    for (const [collection, fields] of Object.entries(AGENDA_FIELDS)) {
        log(`\n📦 ${collection} (${fields.length} campos)`, 'white');

        for (const field of fields) {
            try {
                const data: Record<string, unknown> = {
                    name: field.name,
                    type: field.type,
                    interface: field.interface || field.type,
                    uiSchema: {
                        type: 'string',
                        title: field.title,
                        'x-component': 'Input',
                    },
                };

                if (field.required) (data as Record<string, unknown>)['required'] = true;
                if (field.unique) (data as Record<string, unknown>)['unique'] = true;
                if (field.defaultValue !== undefined) (data as Record<string, unknown>)['defaultValue'] = field.defaultValue;

                if (field.type === 'belongsTo' && field.target) {
                    data.target = field.target;
                    data.foreignKey = field.foreignKey || `${field.name}`;
                    data.interface = 'obo';
                }

                if (field.enum) {
                    (data.uiSchema as Record<string, unknown>)['enum'] = field.enum;
                    (data.uiSchema as Record<string, unknown>)['x-component'] = 'Select';
                    data.interface = 'select';
                }

                await client.post(`/collections/${collection}/fields:create`, data);
                log(`  ✅ ${field.name}`, 'green');
                totalCreated++;
            } catch (error: unknown) {
                const errMsg = error instanceof Error ? error.message : String(error);
                if (errMsg.includes('duplicate') || errMsg.includes('already exists')) {
                    log(`  ⏭️  ${field.name} (ya existe)`, 'yellow');
                } else {
                    log(`  ❌ ${field.name}: ${errMsg}`, 'red');
                    totalErrors++;
                }
            }
        }
    }

    log(`\n📊 Resultado: ${totalCreated} creados, ${totalErrors} errores\n`, totalErrors > 0 ? 'yellow' : 'green');
}

main().catch(console.error);
