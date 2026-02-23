/**
 * manage-verification.ts - Gestión de proveedores de verificación NocoBase via API
 *
 * Usa el plugin: verification
 *
 * Uso:
 *   tsx shared/scripts/manage-verification.ts providers                   # listar proveedores
 *   tsx shared/scripts/manage-verification.ts provider-create --name n --type t # crear
 *   tsx shared/scripts/manage-verification.ts provider-update <id> --name n     # actualizar
 *   tsx shared/scripts/manage-verification.ts provider-delete <id>        # eliminar
 *   tsx shared/scripts/manage-verification.ts list                        # listar verificaciones
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

const typeLabels: Record<string, string> = {
    'sms-aliyun': 'SMS Aliyun',
    'sms-tencent': 'SMS Tencent',
    'email': 'Email SMTP',
};

async function listProviders() {
    log('🔐 Proveedores de verificación...\n', 'cyan');

    try {
        const response = await client.get('/verifications_providers:list', { pageSize: 50 });
        const raw = response.data || response;
        const providers = Array.isArray(raw) ? raw : (raw.data || raw.rows || []);

        if (!Array.isArray(providers) || providers.length === 0) {
            log('  Sin proveedores de verificación configurados.', 'yellow');
            log('  Configura uno con: manage-verification.ts provider-create --name "SMS" --type sms-aliyun', 'gray');
            return;
        }

        log(`  Total: ${providers.length} proveedor(es)\n`, 'green');

        for (const p of providers) {
            const tipo = typeLabels[p.type] || p.type || 'N/A';
            const def = p.default ? ' [POR DEFECTO]' : '';
            log(`  🔐 [${p.id}] ${p.title || p.name || 'Sin nombre'}${def}`, 'white');
            log(`      Tipo: ${tipo}`, 'gray');
            if (p.createdAt) log(`      Creado: ${new Date(p.createdAt).toLocaleString('es-CL')}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function createProvider(flags: Record<string, string>) {
    if (!flags.name || !flags.type) {
        log('❌ Parámetros requeridos: --name <nombre> --type <tipo>', 'red');
        log('   Tipos: sms-aliyun, sms-tencent, email', 'gray');
        log('   Opcionales: --options <json> --default true', 'gray');
        process.exit(1);
    }

    log(`➕ Creando proveedor de verificación "${flags.name}"...\n`, 'cyan');

    const data: Record<string, unknown> = {
        title: flags.name,
        type: flags.type,
    };
    if (flags.options) {
        try { data.options = JSON.parse(flags.options); } catch { /* ignore */ }
    }
    if (flags.default === 'true') data.default = true;

    try {
        const response = await client.post('/verifications_providers:create', data);
        const provider = response.data || response;
        log(`✅ Proveedor creado: [${provider.id}] ${provider.title || provider.name}`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function updateProvider(id: string, flags: Record<string, string>) {
    const data: Record<string, unknown> = {};
    if (flags.name) data.title = flags.name;
    if (flags.type) data.type = flags.type;
    if (flags.options) {
        try { data.options = JSON.parse(flags.options); } catch { /* ignore */ }
    }
    if (flags.default) data.default = flags.default === 'true';

    if (Object.keys(data).length === 0) {
        log('❌ Proporciona al menos: --name, --type, --options o --default', 'red');
        process.exit(1);
    }

    log(`✏️  Actualizando proveedor ${id}...\n`, 'cyan');
    try {
        await client.post('/verifications_providers:update', { ...data, filterByTk: id });
        log('✅ Proveedor actualizado.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function deleteProvider(id: string) {
    log(`🗑️  Eliminando proveedor ${id}...\n`, 'cyan');
    try {
        await client.post('/verifications_providers:destroy', { filterByTk: id });
        log('✅ Proveedor eliminado.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function listVerifications() {
    log('📋 Verificaciones recientes...\n', 'cyan');

    try {
        const response = await client.get('/verifications:list', {
            pageSize: 20,
            sort: ['-createdAt'],
        });
        const raw = response.data || response;
        const verifications = Array.isArray(raw) ? raw : (raw.data || raw.rows || []);

        if (!Array.isArray(verifications) || verifications.length === 0) {
            log('  Sin verificaciones registradas.', 'yellow');
            return;
        }

        log(`  Total: ${verifications.length} verificación(es)\n`, 'green');

        for (const v of verifications) {
            const status = v.status === 'verified' ? '✅' : v.status === 'expired' ? '⏰' : '⏳';
            const fecha = v.createdAt ? new Date(v.createdAt).toLocaleString('es-CL') : 'N/A';
            log(`  ${status} [${v.id}] ${v.receiver || 'N/A'}  |  Estado: ${v.status || 'N/A'}  |  ${fecha}`, 'white');
            if (v.type) log(`      Tipo: ${v.type}  |  Proveedor: ${v.providerId || 'N/A'}`, 'gray');
        }
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
            case 'providers': await listProviders(); break;
            case 'provider-create': await createProvider(flags); break;
            case 'provider-update':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await updateProvider(positional[1], flags); break;
            case 'provider-delete':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await deleteProvider(positional[1]); break;
            case 'list': await listVerifications(); break;
            default:
                log('Uso: manage-verification.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  providers                              Listar proveedores de verificación', 'gray');
                log('  provider-create --name n --type t      Crear proveedor', 'gray');
                log('  provider-update <id> --name n          Actualizar proveedor', 'gray');
                log('  provider-delete <id>                   Eliminar proveedor', 'gray');
                log('  list                                   Listar verificaciones recientes', 'gray');
                log('\nTipos de proveedor:', 'white');
                log('  sms-aliyun      SMS vía Aliyun', 'gray');
                log('  sms-tencent     SMS vía Tencent', 'gray');
                log('  email           Email SMTP', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
