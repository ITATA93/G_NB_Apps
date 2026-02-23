/**
 * manage-api-keys.ts - Gestión de API Keys NocoBase via API
 *
 * Usa el plugin: api-keys
 *
 * Uso:
 *   tsx shared/scripts/manage-api-keys.ts list                            # listar API keys
 *   tsx shared/scripts/manage-api-keys.ts create --name n [--role r] [--expiresIn d] # crear key
 *   tsx shared/scripts/manage-api-keys.ts delete <id>                     # eliminar/revocar key
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

async function listKeys() {
    log('🔑 API Keys configuradas...\n', 'cyan');

    try {
        const response = await client.get('/apiKeys:list', {
            pageSize: 100,
            sort: ['-createdAt'],
            appends: ['role'],
        });
        const raw = response.data || response;
        const keys = Array.isArray(raw) ? raw : (raw.data || raw.rows || []);

        if (!Array.isArray(keys) || keys.length === 0) {
            log('  Sin API keys configuradas.', 'yellow');
            log('  Crea una con: manage-api-keys.ts create --name "Mi integración"', 'gray');
            return;
        }

        log(`  Total: ${keys.length} key(s)\n`, 'green');

        for (const k of keys) {
            const roleName = k.role?.title || k.role?.name || k.roleName || 'N/A';
            const fecha = k.createdAt ? new Date(k.createdAt).toLocaleString('es-CL') : 'N/A';
            const expires = k.expiresAt ? new Date(k.expiresAt).toLocaleString('es-CL') : 'Sin expiración';

            log(`  🔑 [${k.id}] ${k.name || 'Sin nombre'}`, 'white');
            log(`      Rol: ${roleName}  |  Creada: ${fecha}`, 'gray');
            log(`      Expira: ${expires}`, 'gray');
            if (k.token) {
                const masked = k.token.substring(0, 20) + '...';
                log(`      Token: ${masked}`, 'gray');
            }
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function createKey(flags: Record<string, string>) {
    if (!flags.name) {
        log('❌ Parámetro requerido: --name <nombre>', 'red');
        log('   Opcionales: --role <nombre_rol> --expiresIn <días>', 'gray');
        process.exit(1);
    }

    log(`🔑 Creando API Key "${flags.name}"...\n`, 'cyan');

    const data: Record<string, unknown> = { name: flags.name };
    if (flags.role) data.roleName = flags.role;
    if (flags.expiresIn) {
        const days = parseInt(flags.expiresIn);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
        data.expiresAt = expiresAt.toISOString();
    }

    try {
        const response = await client.post('/apiKeys:create', data);
        const key = response.data || response;
        log(`✅ API Key creada: [${key.id}] ${key.name}`, 'green');
        if (key.token) {
            log(`\n  ⚠️  GUARDA ESTE TOKEN - No se mostrará de nuevo:\n`, 'yellow');
            log(`  ${key.token}`, 'white');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function deleteKey(id: string) {
    log(`🗑️  Revocando API Key ${id}...\n`, 'cyan');
    try {
        await client.delete(`/apiKeys:destroy/${id}`);
        log('✅ API Key revocada.', 'green');
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
            case 'list': await listKeys(); break;
            case 'create': await createKey(flags); break;
            case 'delete':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await deleteKey(positional[1]); break;
            default:
                log('Uso: manage-api-keys.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list                                   Listar API keys', 'gray');
                log('  create --name n [--role r] [--expiresIn d]  Crear API key', 'gray');
                log('  delete <id>                            Revocar API key', 'gray');
                log('\nEjemplos:', 'white');
                log('  create --name "Integración HIS" --role root', 'gray');
                log('  create --name "Dashboard" --role member --expiresIn 90', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
