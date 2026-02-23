/**
 * manage-fields.ts - CRUD de campos de colecciones NocoBase via API
 *
 * Uso:
 *   tsx shared/scripts/manage-fields.ts list <collection>
 *   tsx shared/scripts/manage-fields.ts get <collection> <fieldName>
 *   tsx shared/scripts/manage-fields.ts create <collection> --name rut --type string --interface input --title "RUT"
 *   tsx shared/scripts/manage-fields.ts update <collection> <fieldName> --title "Nuevo Titulo"
 *   tsx shared/scripts/manage-fields.ts delete <collection> <fieldName>
 *   tsx shared/scripts/manage-fields.ts interfaces                    # listar interfaces disponibles
 */

import { createClient, log } from './ApiClient';

const client = createClient();

function parseArgs(args: string[]): { flags: Record<string, string>, positional: string[] } {
    const flags: Record<string, string> = {};
    const positional: string[] = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            flags[args[i].slice(2)] = args[i + 1] || '';
            i++;
        } else {
            positional.push(args[i]);
        }
    }
    return { flags, positional };
}

const FIELD_TYPES = [
    'boolean', 'integer', 'bigInt', 'double', 'decimal', 'string', 'text',
    'date', 'dateOnly', 'time', 'json', 'jsonb', 'array',
    'belongsTo', 'hasOne', 'hasMany', 'belongsToMany',
    'uid', 'uuid', 'sort', 'password', 'sequence',
    'nanoid', 'virtual', 'formula', 'context', 'snapshot'
];

const INTERFACE_MAP: Record<string, string> = {
    input: 'Texto corto',
    textarea: 'Texto largo',
    richText: 'Texto enriquecido',
    phone: 'Telefono',
    email: 'Email',
    url: 'URL',
    integer: 'Entero',
    number: 'Numero',
    percent: 'Porcentaje',
    checkbox: 'Casilla',
    select: 'Seleccion simple',
    multipleSelect: 'Seleccion multiple',
    radioGroup: 'Radio buttons',
    checkboxGroup: 'Grupo de casillas',
    datetime: 'Fecha y hora',
    date: 'Solo fecha',
    time: 'Solo hora',
    markdown: 'Markdown',
    json: 'JSON',
    password: 'Password',
    color: 'Color',
    icon: 'Icono',
    attachment: 'Archivo adjunto',
    'm2o': 'Muchos a uno (belongsTo)',
    'o2m': 'Uno a muchos (hasMany)',
    'm2m': 'Muchos a muchos (belongsToMany)',
    'o2o': 'Uno a uno (hasOne)',
    id: 'ID',
    sequence: 'Secuencia auto',
    formula: 'Formula calculada',
    createdAt: 'Fecha creacion',
    updatedAt: 'Fecha actualizacion',
    createdBy: 'Creado por',
    updatedBy: 'Actualizado por',
};

async function listFields(collection: string) {
    log(`📋 Campos de coleccion "${collection}"...\n`, 'cyan');
    const response = await client.get(`/collections/${collection}/fields:list`, {
        pageSize: 200,
        sort: ['sort']
    });
    const fields = response.data || [];

    if (fields.length === 0) {
        log('Sin campos definidos.', 'yellow');
        return;
    }

    log(`Total: ${fields.length} campo(s)\n`, 'green');

    const maxName = Math.max(...fields.map((f: Record<string, unknown>) => (f.name || '').length), 4);
    const maxType = Math.max(...fields.map((f: Record<string, unknown>) => (f.type || '').length), 4);

    log(`  ${'NOMBRE'.padEnd(maxName)}  ${'TIPO'.padEnd(maxType)}  INTERFAZ          TITULO`, 'gray');
    log(`  ${'─'.repeat(maxName)}  ${'─'.repeat(maxType)}  ${'─'.repeat(16)}  ${'─'.repeat(20)}`, 'gray');

    for (const f of fields) {
        const iface = f.interface || '';
        const title = f.uiSchema?.title || f.title || '';
        const required = f.required ? ' *' : '';
        const pk = f.primaryKey ? ' [PK]' : '';
        log(`  ${(f.name || '').padEnd(maxName)}  ${(f.type || '').padEnd(maxType)}  ${iface.padEnd(16)}  ${title}${required}${pk}`, 'white');
    }
}

async function getField(collection: string, fieldName: string) {
    log(`🔍 Campo "${fieldName}" de "${collection}"...\n`, 'cyan');
    const response = await client.get(`/collections/${collection}/fields:get`, {
        filterByTk: fieldName
    });
    log(JSON.stringify(response.data, null, 2), 'white');
}

async function createField(collection: string, flags: Record<string, string>) {
    const { name, type, title } = flags;
    const iface = flags['interface'];

    if (!name || !type) {
        log('❌ Se requiere --name y --type', 'red');
        log(`   Tipos validos: ${FIELD_TYPES.join(', ')}`, 'gray');
        process.exit(1);
    }

    log(`➕ Creando campo "${name}" en "${collection}"...\n`, 'cyan');

    const data: Record<string, unknown> = {
        name,
        type,
    };

    if (iface) data.interface = iface;
    if (title) {
        data.uiSchema = {
            title,
            'x-component': getComponentForInterface(iface || type),
        };
    }

    // Opciones adicionales
    if (flags.required === 'true') data.required = true;
    if (flags.unique === 'true') data.unique = true;
    if (flags.defaultValue) data.defaultValue = flags.defaultValue;
    if (flags.description) {
        data.uiSchema = data.uiSchema || {};
        data.uiSchema.description = flags.description;
    }

    // Para campos select/enum
    if (flags.options) {
        try {
            data.uiSchema = data.uiSchema || {};
            data.uiSchema.enum = JSON.parse(flags.options);
        } catch {
            log('❌ --options debe ser JSON valido, ej: [{"value":"a","label":"A"}]', 'red');
            process.exit(1);
        }
    }

    // Para relaciones (belongsTo, hasMany, belongsToMany, hasOne)
    if (['belongsTo', 'hasMany', 'belongsToMany', 'hasOne'].includes(type)) {
        if (!flags.target) {
            log('❌ Se requiere --target para relaciones', 'red');
            process.exit(1);
        }
        data.target = flags.target;
        if (flags.foreignKey) data.foreignKey = flags.foreignKey;
        if (flags.targetKey) data.targetKey = flags.targetKey;
        if (flags.sourceKey) data.sourceKey = flags.sourceKey;
        if (flags.through) data.through = flags.through;
        if (flags.otherKey) data.otherKey = flags.otherKey;

        // UI Schema para relaciones
        data.uiSchema = data.uiSchema || {};
        data.uiSchema['x-component'] = 'AssociationField';
        data.uiSchema['x-component-props'] = {
            multiple: ['hasMany', 'belongsToMany'].includes(type)
        };
        if (flags.labelField) {
            data.uiSchema['x-component-props'].fieldNames = {
                label: flags.labelField,
                value: 'id'
            };
        }
    }

    await client.post(`/collections/${collection}/fields:create`, data);
    log(`✅ Campo "${name}" creado en "${collection}".`, 'green');
}

function getComponentForInterface(iface: string): string {
    const map: Record<string, string> = {
        input: 'Input',
        textarea: 'Input.TextArea',
        richText: 'RichText',
        integer: 'InputNumber',
        number: 'InputNumber',
        percent: 'Percent',
        checkbox: 'Checkbox',
        select: 'Select',
        multipleSelect: 'Select',
        radioGroup: 'Radio.Group',
        checkboxGroup: 'Checkbox.Group',
        datetime: 'DatePicker',
        date: 'DatePicker',
        time: 'TimePicker',
        email: 'Input',
        phone: 'Input',
        url: 'Input.URL',
        password: 'Password',
        json: 'Input.JSON',
        markdown: 'Markdown',
        color: 'ColorSelect',
        attachment: 'Upload.Attachment',
    };
    return map[iface] || 'Input';
}

async function updateField(collection: string, fieldName: string, flags: Record<string, string>) {
    log(`✏️  Actualizando campo "${fieldName}" en "${collection}"...\n`, 'cyan');
    const data: Record<string, unknown> = {};

    if (flags.title) {
        data.uiSchema = { title: flags.title };
    }
    if (flags['interface']) data.interface = flags['interface'];
    if (flags.required !== undefined) data.required = flags.required === 'true';
    if (flags.unique !== undefined) data.unique = flags.unique === 'true';
    if (flags.defaultValue) data.defaultValue = flags.defaultValue;
    if (flags.description) {
        data.uiSchema = data.uiSchema || {};
        data.uiSchema.description = flags.description;
    }

    if (Object.keys(data).length === 0) {
        log('❌ Proporciona al menos un campo para actualizar', 'red');
        process.exit(1);
    }

    await client.post(`/collections/${collection}/fields:update`, {
        ...data,
        filterByTk: fieldName
    });
    log(`✅ Campo "${fieldName}" actualizado.`, 'green');
}

async function deleteField(collection: string, fieldName: string) {
    log(`🗑️  Eliminando campo "${fieldName}" de "${collection}"...\n`, 'cyan');
    await client.post(`/collections/${collection}/fields:destroy?filterByTk=${fieldName}`, {});
    log(`✅ Campo "${fieldName}" eliminado.`, 'green');
}

async function listInterfaces() {
    log('📋 Interfaces de campo disponibles:\n', 'cyan');
    for (const [key, desc] of Object.entries(INTERFACE_MAP)) {
        log(`  ${key.padEnd(20)} ${desc}`, 'white');
    }
}

async function main() {
    const args = process.argv.slice(2);
    const { flags, positional } = parseArgs(args);
    const command = positional[0];

    try {
        switch (command) {
            case 'list':
                if (!positional[1]) { log('❌ Uso: list <collection>', 'red'); process.exit(1); }
                await listFields(positional[1]);
                break;
            case 'get':
                if (!positional[1] || !positional[2]) { log('❌ Uso: get <collection> <fieldName>', 'red'); process.exit(1); }
                await getField(positional[1], positional[2]);
                break;
            case 'create':
                if (!positional[1]) { log('❌ Uso: create <collection> --name n --type t', 'red'); process.exit(1); }
                await createField(positional[1], flags);
                break;
            case 'update':
                if (!positional[1] || !positional[2]) { log('❌ Uso: update <collection> <field> --campo valor', 'red'); process.exit(1); }
                await updateField(positional[1], positional[2], flags);
                break;
            case 'delete':
                if (!positional[1] || !positional[2]) { log('❌ Uso: delete <collection> <fieldName>', 'red'); process.exit(1); }
                await deleteField(positional[1], positional[2]);
                break;
            case 'interfaces':
                await listInterfaces();
                break;
            default:
                log('Uso: manage-fields.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list <collection>                             Listar campos', 'gray');
                log('  get <collection> <field>                      Detalle de campo', 'gray');
                log('  create <col> --name n --type t [--interface i] [--title t]  Crear campo', 'gray');
                log('  update <col> <field> --title t                Actualizar campo', 'gray');
                log('  delete <col> <field>                          Eliminar campo', 'gray');
                log('  interfaces                                    Listar interfaces', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
