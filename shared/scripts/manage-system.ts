/**
 * manage-system.ts - Gestión de configuración del sistema NocoBase via API
 *
 * Uso:
 *   tsx shared/scripts/manage-system.ts info                    # info general del sistema
 *   tsx shared/scripts/manage-system.ts settings                # ver configuración actual
 *   tsx shared/scripts/manage-system.ts set --title "Mi App"    # cambiar título
 *   tsx shared/scripts/manage-system.ts set --lang es-ES        # cambiar idioma
 *   tsx shared/scripts/manage-system.ts auth                    # ver proveedores de auth
 *   tsx shared/scripts/manage-system.ts env                     # ver variables de entorno
 *   tsx shared/scripts/manage-system.ts status                  # estado de salud del sistema
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

async function getSystemInfo() {
    log('🖥️  Información del sistema...\n', 'cyan');

    try {
        const info = await client.get('/app:getInfo');
        const data = info.data || info;

        log('  Información de la aplicación:', 'white');
        if (data.database) log(`    Base de datos: ${JSON.stringify(data.database)}`, 'gray');
        if (data.version) log(`    Versión: ${data.version}`, 'gray');
        log(JSON.stringify(data, null, 2), 'gray');
    } catch {
        log('  ⚠️  /app:getInfo no disponible', 'yellow');
    }

    // Try to get current user to verify connection
    try {
        const user = await client.get('/users:check');
        const userData = user.data || user;
        log('\n  Conexión verificada:', 'green');
        log(`    Usuario: ${userData.nickname || userData.username || userData.email || 'N/A'}`, 'gray');
        log(`    ID: ${userData.id || 'N/A'}`, 'gray');
    } catch {
        try {
            const user = await client.get('/auth:check');
            const userData = user.data || user;
            log('\n  Conexión verificada:', 'green');
            log(`    Usuario: ${userData.nickname || userData.username || userData.email || 'N/A'}`, 'gray');
        } catch {
            log('\n  ⚠️  No se pudo verificar la conexión', 'yellow');
        }
    }
}

async function getSettings() {
    log('⚙️  Configuración del sistema...\n', 'cyan');

    try {
        const response = await client.get('/systemSettings:get/1', {
            appends: ['logo']
        });
        const settings = response.data || response;

        log('  Configuración actual:', 'white');
        log(`    Título:        ${settings.title || '(sin título)'}`, 'gray');
        log(`    Logo:          ${settings.logo ? '✅ Configurado' : '❌ Sin logo'}`, 'gray');
        log(`    Idioma:        ${settings.enabledLanguages?.join(', ') || settings.lang || 'N/A'}`, 'gray');
        log(`    Permitir registro: ${settings.allowSignUp ? '✅ Sí' : '❌ No'}`, 'gray');
        log(`    SMS Auth:      ${settings.smsAuthEnabled ? '✅' : '❌'}`, 'gray');

        if (settings.options) {
            log('\n  Opciones adicionales:', 'white');
            log(JSON.stringify(settings.options, null, 2), 'gray');
        }

        log('\n  Respuesta completa:', 'white');
        log(JSON.stringify(settings, null, 2), 'gray');
    } catch (error: unknown) {
        // Try alternative endpoint
        try {
            const response = await client.get('/systemSettings:get');
            log(JSON.stringify(response.data || response, null, 2), 'white');
        } catch {
            log(`❌ Error obteniendo configuración: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        }
    }
}

async function updateSettings(flags: Record<string, string>) {
    const data: Record<string, unknown> = {};

    if (flags.title) data.title = flags.title;
    if (flags.lang) data.enabledLanguages = [flags.lang];
    if (flags['allow-signup'] !== undefined) data.allowSignUp = flags['allow-signup'] === 'true';
    if (flags['sms-auth'] !== undefined) data.smsAuthEnabled = flags['sms-auth'] === 'true';

    if (Object.keys(data).length === 0) {
        log('❌ Proporciona al menos un campo para actualizar:', 'red');
        log('   --title "Título"     Cambiar título del sistema', 'gray');
        log('   --lang es-ES         Cambiar idioma', 'gray');
        log('   --allow-signup true  Permitir registro', 'gray');
        log('   --sms-auth true      Habilitar SMS auth', 'gray');
        process.exit(1);
    }

    log('✏️  Actualizando configuración...\n', 'cyan');
    log(`  Cambios: ${JSON.stringify(data)}`, 'gray');

    try {
        await client.post('/systemSettings:update/1', data);
        log('\n✅ Configuración actualizada.', 'green');
    } catch (error: unknown) {
        try {
            await client.post('/systemSettings:update', { ...data, filterByTk: 1 });
            log('\n✅ Configuración actualizada.', 'green');
        } catch {
            log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        }
    }
}

async function getAuthProviders() {
    log('🔐 Proveedores de autenticación...\n', 'cyan');

    try {
        const response = await client.get('/authenticators:list', { pageSize: 50 });
        const providers = response.data || [];

        if (providers.length === 0) {
            log('  No se encontraron proveedores de autenticación.', 'yellow');
            return;
        }

        log(`  Total: ${providers.length} proveedor(es)\n`, 'green');
        for (const p of providers) {
            const status = p.enabled ? '✅' : '❌';
            log(`  ${status} [${p.name}] ${p.title || p.name}`, 'white');
            log(`      Tipo: ${p.authType || 'N/A'}  |  Creado: ${p.createdAt || 'N/A'}`, 'gray');
            if (p.description) log(`      Desc: ${p.description}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        log('  Nota: El endpoint /authenticators puede requerir el plugin de Auth habilitado.', 'yellow');
    }
}

async function getEnvironment() {
    log('🌐 Variables de entorno (configuradas en .env)...\n', 'cyan');

    const envVars: Record<string, string | undefined> = {
        NOCOBASE_BASE_URL: process.env.NOCOBASE_BASE_URL,
        NOCOBASE_API_KEY: process.env.NOCOBASE_API_KEY ? '***' + process.env.NOCOBASE_API_KEY.slice(-8) : undefined,
        NOCOBASE_ROLE: process.env.NOCOBASE_ROLE,
        NOCOBASE_VERIFY_SSL: process.env.NOCOBASE_VERIFY_SSL,
        NOCOBASE_TIMEOUT_SECONDS: process.env.NOCOBASE_TIMEOUT_SECONDS,
    };

    for (const [key, value] of Object.entries(envVars)) {
        const status = value ? '✅' : '⚠️ ';
        log(`  ${status} ${key}: ${value || '(no configurado)'}`, value ? 'gray' : 'yellow');
    }
}

async function getSystemStatus() {
    log('💚 Estado del sistema...\n', 'cyan');

    // Test API connectivity
    const startTime = Date.now();
    try {
        await client.get('/auth:check');
        const elapsed = Date.now() - startTime;
        log(`  ✅ API respondiendo (${elapsed}ms)`, 'green');
    } catch (error: unknown) {
        const elapsed = Date.now() - startTime;
        if (error.response?.status === 401) {
            log(`  ⚠️  API respondiendo pero token inválido (${elapsed}ms)`, 'yellow');
        } else {
            log(`  ❌ API no responde (${elapsed}ms): ${(error instanceof Error ? error.message : String(error))}`, 'red');
            return;
        }
    }

    // Count collections
    try {
        const collections = await client.get('/collections:list', { pageSize: 1 });
        const meta = collections.meta || {};
        log(`  📊 Colecciones: ${meta.count || collections.data?.length || 'N/A'} total`, 'gray');
    } catch {
        log('  ⚠️  No se pudo obtener conteo de colecciones', 'yellow');
    }

    // Count users
    try {
        const users = await client.get('/users:list', { pageSize: 1 });
        const meta = users.meta || {};
        log(`  👥 Usuarios: ${meta.count || users.data?.length || 'N/A'} total`, 'gray');
    } catch {
        log('  ⚠️  No se pudo obtener conteo de usuarios', 'yellow');
    }

    // Count workflows
    try {
        const workflows = await client.get('/workflows:list', { pageSize: 1 });
        const meta = workflows.meta || {};
        log(`  ⚡ Workflows: ${meta.count || workflows.data?.length || 'N/A'} total`, 'gray');
    } catch {
        log('  ⚠️  No se pudo obtener conteo de workflows', 'yellow');
    }

    // Check datasources
    try {
        const ds = await client.get('/dataSources:list', { pageSize: 100 });
        const sources = ds.data || [];
        log(`  🗄️  DataSources: ${sources.length} configurado(s)`, 'gray');
        for (const s of sources) {
            const status = s.enabled ? '✅' : '❌';
            log(`      ${status} ${s.displayName || s.key} (${s.type || 'N/A'})`, 'gray');
        }
    } catch {
        log('  ⚠️  No se pudo obtener datasources', 'yellow');
    }
}

async function main() {
    const args = process.argv.slice(2);
    const { flags, positional } = parseArgs(args);
    const command = positional[0];

    try {
        switch (command) {
            case 'info':
                await getSystemInfo();
                break;
            case 'settings':
                await getSettings();
                break;
            case 'set':
                await updateSettings(flags);
                break;
            case 'auth':
                await getAuthProviders();
                break;
            case 'env':
                await getEnvironment();
                break;
            case 'status':
                await getSystemStatus();
                break;
            default:
                log('Uso: manage-system.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  info                          Información general del sistema', 'gray');
                log('  settings                      Ver configuración actual', 'gray');
                log('  set --title "T" [--lang l]    Modificar configuración', 'gray');
                log('  auth                          Listar proveedores de autenticación', 'gray');
                log('  env                           Ver variables de entorno configuradas', 'gray');
                log('  status                        Estado de salud del sistema', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
