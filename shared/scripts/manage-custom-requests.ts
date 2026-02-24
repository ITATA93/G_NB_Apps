/**
 * manage-custom-requests.ts - Gestión de Custom Requests (acciones HTTP personalizadas) NocoBase via API
 *
 * Usa el plugin: action-custom-request
 *
 * Uso:
 *   tsx shared/scripts/manage-custom-requests.ts list                     # listar custom requests
 *   tsx shared/scripts/manage-custom-requests.ts get <id>                 # detalle
 *   tsx shared/scripts/manage-custom-requests.ts create --name n --url u  # crear
 *   tsx shared/scripts/manage-custom-requests.ts update <id> --url u      # actualizar
 *   tsx shared/scripts/manage-custom-requests.ts delete <id>              # eliminar
 *   tsx shared/scripts/manage-custom-requests.ts send <id>                # ejecutar/enviar request
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

async function listRequests() {
    log('🌐 Custom Requests configurados...\n', 'cyan');

    try {
        const response = await client.get('/customRequests:list', { pageSize: 50 });
        const raw = response.data || response;
        const requests = Array.isArray(raw) ? raw : (raw.data || raw.rows || []);

        if (!Array.isArray(requests) || requests.length === 0) {
            log('  Sin custom requests configurados.', 'yellow');
            log('  Crea uno con: manage-custom-requests.ts create --name "API HIS" --url https://...', 'gray');
            return;
        }

        log(`  Total: ${requests.length} request(s)\n`, 'green');

        for (const r of requests) {
            const method = r.options?.method?.toUpperCase() || 'GET';
            const url = r.options?.url || 'N/A';
            log(`  🌐 [${r.id}] ${r.key || r.name || 'Sin nombre'}`, 'white');
            log(`      ${method} ${url}`, 'gray');
            if (r.options?.headers) log(`      Headers: ${Object.keys(r.options.headers).length} definidos`, 'gray');
            if (r.options?.data) log(`      Body: Sí`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function getRequest(id: string) {
    log(`🌐 Detalle del custom request ${id}...\n`, 'cyan');

    try {
        const response = await client.get('/customRequests:get', { filterByTk: id });
        const req = response.data || response;
        log(JSON.stringify(req, null, 2), 'white');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function createRequest(flags: Record<string, string>) {
    if (!flags.url) {
        log('❌ Parámetro requerido: --url <url_destino>', 'red');
        log('   Opcionales: --name n --method GET|POST --headers json --body json', 'gray');
        process.exit(1);
    }

    log(`➕ Creando custom request...\n`, 'cyan');

    const options: Record<string, unknown> = {
        url: flags.url,
        method: (flags.method || 'GET').toLowerCase(),
    };

    if (flags.headers) {
        try { options.headers = JSON.parse(flags.headers); } catch { /* ignore */ }
    }
    if (flags.body) {
        try { options.data = JSON.parse(flags.body); } catch { options.data = flags.body; }
    }
    if (flags.timeout) options.timeout = parseInt(flags.timeout);

    const data: Record<string, unknown> = {
        key: flags.name || flags.key || `custom_${Date.now()}`,
        options,
    };

    try {
        const response = await client.post('/customRequests:create', data);
        const req = response.data || response;
        log(`✅ Custom request creado: [${req.id}] ${req.key}`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function updateRequest(id: string, flags: Record<string, string>) {
    log(`✏️  Actualizando custom request ${id}...\n`, 'cyan');

    try {
        const current = await client.get('/customRequests:get', { filterByTk: id });
        const req = current.data || current;
        const options = req.options || {};

        if (flags.url) options.url = flags.url;
        if (flags.method) options.method = flags.method.toLowerCase();
        if (flags.headers) {
            try { options.headers = JSON.parse(flags.headers); } catch { /* ignore */ }
        }
        if (flags.body) {
            try { options.data = JSON.parse(flags.body); } catch { options.data = flags.body; }
        }

        const data: Record<string, unknown> = { options };
        if (flags.name) data.key = flags.name;

        await client.post('/customRequests:update', { ...data, filterByTk: id });
        log('✅ Custom request actualizado.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function deleteRequest(id: string) {
    log(`🗑️  Eliminando custom request ${id}...\n`, 'cyan');
    try {
        await client.post('/customRequests:destroy', { filterByTk: id });
        log('✅ Custom request eliminado.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function sendRequest(id: string) {
    log(`🚀 Ejecutando custom request ${id}...\n`, 'cyan');
    try {
        const response = await client.post('/customRequests:send', { filterByTk: id });
        const result = response.data || response;
        log('✅ Request ejecutado. Respuesta:', 'green');
        log(JSON.stringify(result, null, 2), 'white');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        const axiosErr = error as { response?: { data?: unknown } };
        if (axiosErr.response?.data) {
            log(`  Detalle: ${JSON.stringify(axiosErr.response.data)}`, 'gray');
        }
    }
}

async function main() {
    const args = process.argv.slice(2);
    const { flags, positional } = parseArgs(args);
    const command = positional[0];

    try {
        switch (command) {
            case 'list': await listRequests(); break;
            case 'get':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await getRequest(positional[1]); break;
            case 'create': await createRequest(flags); break;
            case 'update':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await updateRequest(positional[1], flags); break;
            case 'delete':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await deleteRequest(positional[1]); break;
            case 'send':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await sendRequest(positional[1]); break;
            default:
                log('Uso: manage-custom-requests.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list                                   Listar custom requests', 'gray');
                log('  get <id>                               Detalle del request', 'gray');
                log('  create --url u [--name n] [--method m] Crear custom request', 'gray');
                log('  update <id> --url u [--method m]       Actualizar', 'gray');
                log('  delete <id>                            Eliminar', 'gray');
                log('  send <id>                              Ejecutar request', 'gray');
                log('\nOpciones:', 'white');
                log('  --url https://api.ejemplo.cl/endpoint  URL destino', 'gray');
                log('  --method POST                          Método HTTP (GET por defecto)', 'gray');
                log('  --headers \'{"Auth":"Bearer x"}\'        Headers como JSON', 'gray');
                log('  --body \'{"campo":"valor"}\'             Body como JSON', 'gray');
                log('\nEjemplos:', 'white');
                log('  create --name api-his --url https://his.hospital.cl/api/patients --method GET', 'gray');
                log('  create --name webhook-lab --url https://lab.cl/hook --method POST', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
