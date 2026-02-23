/**
 * manage-public-forms.ts - Gestión de formularios públicos NocoBase via API
 *
 * Usa el plugin: public-forms
 *
 * Uso:
 *   tsx shared/scripts/manage-public-forms.ts list                        # listar formularios
 *   tsx shared/scripts/manage-public-forms.ts get <key>                   # detalle
 *   tsx shared/scripts/manage-public-forms.ts create --collection c --title t # crear
 *   tsx shared/scripts/manage-public-forms.ts update <key> --title t      # actualizar
 *   tsx shared/scripts/manage-public-forms.ts enable <key>                # habilitar
 *   tsx shared/scripts/manage-public-forms.ts disable <key>               # deshabilitar
 *   tsx shared/scripts/manage-public-forms.ts delete <key>                # eliminar
 */

import { createClient, log } from './ApiClient';

const client = createClient();

function parseArgs(args: string[]): { flags: Record<string, string>, positional: string[] } {
    const flags: Record<string, string> = {};
    const positional: string[] = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].slice(2);
            flags[key] = args[i + 1] || '';
            i++;
        } else {
            positional.push(args[i]);
        }
    }
    return { flags, positional };
}

async function listForms() {
    log('📝 Formularios públicos...\n', 'cyan');

    try {
        const response = await client.get('/publicForms:list', { pageSize: 50 });
        const raw = response.data || response;
        const forms = Array.isArray(raw) ? raw : (raw.data || raw.rows || []);

        if (!Array.isArray(forms) || forms.length === 0) {
            log('  Sin formularios públicos configurados.', 'yellow');
            return;
        }

        log(`  Total: ${forms.length} formulario(s)\n`, 'green');

        for (const f of forms) {
            const status = f.enabled !== false ? '✅' : '❌';
            log(`  ${status} [${f.key || f.id}] ${f.title || 'Sin título'}`, 'white');
            log(`      Colección: ${f.collection || 'N/A'}`, 'gray');
            if (f.description) log(`      Desc: ${f.description}`, 'gray');
            if (f.password) log(`      Protegido con contraseña: Sí`, 'gray');
            if (f.createdAt) log(`      Creado: ${new Date(f.createdAt).toLocaleString('es-CL')}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function getForm(key: string) {
    log(`📝 Detalle del formulario "${key}"...\n`, 'cyan');

    try {
        const response = await client.get('/publicForms:get', { filterByTk: key });
        const form = response.data || response;
        log(JSON.stringify(form, null, 2), 'white');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function createForm(flags: Record<string, string>) {
    if (!flags.collection) {
        log('❌ Parámetro requerido: --collection <nombre_coleccion>', 'red');
        log('   Opcionales: --title t --description d --password p', 'gray');
        process.exit(1);
    }

    log(`➕ Creando formulario público...\n`, 'cyan');

    const data: Record<string, unknown> = {
        collection: flags.collection,
        title: flags.title || `Formulario ${flags.collection}`,
        enabled: true,
    };
    if (flags.description) data.description = flags.description;
    if (flags.password) data.password = flags.password;

    try {
        const response = await client.post('/publicForms:create', data);
        const form = response.data || response;
        log(`✅ Formulario creado: [${form.key || form.id}] ${form.title}`, 'green');
        if (form.key) {
            log(`\n  URL pública: /public-forms/${form.key}`, 'white');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function updateForm(key: string, flags: Record<string, string>) {
    const data: Record<string, unknown> = {};
    if (flags.title) data.title = flags.title;
    if (flags.description) data.description = flags.description;
    if (flags.password) data.password = flags.password;

    if (Object.keys(data).length === 0) {
        log('❌ Proporciona al menos: --title, --description o --password', 'red');
        process.exit(1);
    }

    log(`✏️  Actualizando formulario "${key}"...\n`, 'cyan');
    try {
        await client.post('/publicForms:update', { ...data, filterByTk: key });
        log('✅ Formulario actualizado.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function toggleForm(key: string, enabled: boolean) {
    const action = enabled ? 'Habilitando' : 'Deshabilitando';
    log(`${enabled ? '✅' : '❌'} ${action} formulario "${key}"...\n`, 'cyan');
    try {
        await client.post('/publicForms:update', { filterByTk: key, enabled });
        log(`✅ Formulario ${enabled ? 'habilitado' : 'deshabilitado'}.`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function deleteForm(key: string) {
    log(`🗑️  Eliminando formulario "${key}"...\n`, 'cyan');
    try {
        await client.post('/publicForms:destroy', { filterByTk: key });
        log('✅ Formulario eliminado.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function main() {
    const args = process.argv.slice(2);
    const { flags, positional } = parseArgs(args);
    const command = positional[0];

    try {
        switch (command) {
            case 'list': await listForms(); break;
            case 'get':
                if (!positional[1]) { log('❌ Falta: <key>', 'red'); process.exit(1); }
                await getForm(positional[1]); break;
            case 'create': await createForm(flags); break;
            case 'update':
                if (!positional[1]) { log('❌ Falta: <key>', 'red'); process.exit(1); }
                await updateForm(positional[1], flags); break;
            case 'enable':
                if (!positional[1]) { log('❌ Falta: <key>', 'red'); process.exit(1); }
                await toggleForm(positional[1], true); break;
            case 'disable':
                if (!positional[1]) { log('❌ Falta: <key>', 'red'); process.exit(1); }
                await toggleForm(positional[1], false); break;
            case 'delete':
                if (!positional[1]) { log('❌ Falta: <key>', 'red'); process.exit(1); }
                await deleteForm(positional[1]); break;
            default:
                log('Uso: manage-public-forms.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list                                   Listar formularios públicos', 'gray');
                log('  get <key>                              Detalle del formulario', 'gray');
                log('  create --collection c [--title t]      Crear formulario público', 'gray');
                log('  update <key> --title t                 Actualizar formulario', 'gray');
                log('  enable <key>                           Habilitar formulario', 'gray');
                log('  disable <key>                          Deshabilitar formulario', 'gray');
                log('  delete <key>                           Eliminar formulario', 'gray');
                log('\nEjemplos:', 'white');
                log('  create --collection pacientes --title "Registro de pacientes"', 'gray');
                log('  create --collection encuestas --title "Encuesta satisfacción" --password hosp123', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
