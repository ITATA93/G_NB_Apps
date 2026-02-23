/**
 * manage-apps.ts - Gestión de sub-aplicaciones NocoBase via API
 *
 * Usa el plugin: multi-app-manager
 *
 * Uso:
 *   tsx shared/scripts/manage-apps.ts list                                # listar sub-apps
 *   tsx shared/scripts/manage-apps.ts get <name>                          # detalle
 *   tsx shared/scripts/manage-apps.ts create --name n [--displayName d]   # crear sub-app
 *   tsx shared/scripts/manage-apps.ts update <name> --displayName d       # actualizar
 *   tsx shared/scripts/manage-apps.ts delete <name>                       # eliminar
 *   tsx shared/scripts/manage-apps.ts start <name>                        # iniciar sub-app
 *   tsx shared/scripts/manage-apps.ts stop <name>                         # detener sub-app
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

const statusIcons: Record<string, string> = {
    running: '🟢',
    stopped: '🔴',
    initializing: '🟡',
    error: '❌',
};

async function listApps() {
    log('📱 Sub-aplicaciones...\n', 'cyan');

    try {
        const response = await client.get('/applications:list', { pageSize: 50 });
        const raw = response.data || response;
        const apps = Array.isArray(raw) ? raw : (raw.data || raw.rows || []);

        if (!Array.isArray(apps) || apps.length === 0) {
            log('  Sin sub-aplicaciones configuradas.', 'yellow');
            log('  Crea una con: manage-apps.ts create --name "mi-app"', 'gray');
            return;
        }

        log(`  Total: ${apps.length} sub-aplicación(es)\n`, 'green');

        for (const app of apps) {
            const icon = statusIcons[app.status] || '❓';
            log(`  ${icon} [${app.name}] ${app.displayName || app.name}`, 'white');
            log(`      Estado: ${app.status || 'N/A'}  |  Creada: ${app.createdAt ? new Date(app.createdAt).toLocaleString('es-CL') : 'N/A'}`, 'gray');
            if (app.cname) log(`      Dominio: ${app.cname}`, 'gray');
            if (app.options?.database) log(`      BD: ${app.options.database}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function getApp(name: string) {
    log(`📱 Detalle de la sub-aplicación "${name}"...\n`, 'cyan');

    try {
        const response = await client.get('/applications:get', { filterByTk: name });
        const app = response.data || response;
        log(JSON.stringify(app, null, 2), 'white');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function createApp(flags: Record<string, string>) {
    if (!flags.name) {
        log('❌ Parámetro requerido: --name <nombre>', 'red');
        log('   Opcionales: --displayName d --cname dominio', 'gray');
        process.exit(1);
    }

    log(`➕ Creando sub-aplicación "${flags.name}"...\n`, 'cyan');

    const data: Record<string, unknown> = { name: flags.name };
    if (flags.displayName) data.displayName = flags.displayName;
    if (flags.cname) data.cname = flags.cname;

    try {
        const response = await client.post('/applications:create', data);
        const app = response.data || response;
        log(`✅ Sub-aplicación creada: [${app.name}] ${app.displayName || app.name}`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function updateApp(name: string, flags: Record<string, string>) {
    const data: Record<string, unknown> = {};
    if (flags.displayName) data.displayName = flags.displayName;
    if (flags.cname) data.cname = flags.cname;

    if (Object.keys(data).length === 0) {
        log('❌ Proporciona al menos: --displayName o --cname', 'red');
        process.exit(1);
    }

    log(`✏️  Actualizando sub-aplicación "${name}"...\n`, 'cyan');
    try {
        await client.post('/applications:update', { ...data, filterByTk: name });
        log('✅ Sub-aplicación actualizada.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function deleteApp(name: string) {
    log(`🗑️  Eliminando sub-aplicación "${name}"...\n`, 'cyan');
    try {
        await client.post('/applications:destroy', { filterByTk: name });
        log('✅ Sub-aplicación eliminada.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function startApp(name: string) {
    log(`▶️  Iniciando sub-aplicación "${name}"...\n`, 'cyan');
    try {
        await client.post('/applications:start', { filterByTk: name });
        log('✅ Sub-aplicación iniciada.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function stopApp(name: string) {
    log(`⏹️  Deteniendo sub-aplicación "${name}"...\n`, 'cyan');
    try {
        await client.post('/applications:stop', { filterByTk: name });
        log('✅ Sub-aplicación detenida.', 'green');
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
            case 'list': await listApps(); break;
            case 'get':
                if (!positional[1]) { log('❌ Falta: <name>', 'red'); process.exit(1); }
                await getApp(positional[1]); break;
            case 'create': await createApp(flags); break;
            case 'update':
                if (!positional[1]) { log('❌ Falta: <name>', 'red'); process.exit(1); }
                await updateApp(positional[1], flags); break;
            case 'delete':
                if (!positional[1]) { log('❌ Falta: <name>', 'red'); process.exit(1); }
                await deleteApp(positional[1]); break;
            case 'start':
                if (!positional[1]) { log('❌ Falta: <name>', 'red'); process.exit(1); }
                await startApp(positional[1]); break;
            case 'stop':
                if (!positional[1]) { log('❌ Falta: <name>', 'red'); process.exit(1); }
                await stopApp(positional[1]); break;
            default:
                log('Uso: manage-apps.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list                                   Listar sub-aplicaciones', 'gray');
                log('  get <name>                             Detalle de sub-app', 'gray');
                log('  create --name n [--displayName d]      Crear sub-aplicación', 'gray');
                log('  update <name> --displayName d          Actualizar', 'gray');
                log('  delete <name>                          Eliminar sub-app', 'gray');
                log('  start <name>                           Iniciar sub-app', 'gray');
                log('  stop <name>                            Detener sub-app', 'gray');
                log('\nEjemplos:', 'white');
                log('  create --name laboratorio --displayName "Lab Clínico"', 'gray');
                log('  create --name farmacia --displayName "Farmacia" --cname farmacia.hospital.cl', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
