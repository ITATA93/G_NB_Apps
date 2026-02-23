/**
 * manage-auth.ts - Gestión de autenticación y proveedores SSO NocoBase via API
 *
 * Uso:
 *   tsx shared/scripts/manage-auth.ts list                       # listar proveedores
 *   tsx shared/scripts/manage-auth.ts get <name>                 # detalle de un proveedor
 *   tsx shared/scripts/manage-auth.ts create --name sso --type oidc --title "SSO Corporativo"
 *   tsx shared/scripts/manage-auth.ts update <name> --title "Nuevo Título"
 *   tsx shared/scripts/manage-auth.ts enable <name>              # habilitar proveedor
 *   tsx shared/scripts/manage-auth.ts disable <name>             # deshabilitar proveedor
 *   tsx shared/scripts/manage-auth.ts delete <name>              # eliminar proveedor
 *   tsx shared/scripts/manage-auth.ts check                      # verificar sesión actual
 *   tsx shared/scripts/manage-auth.ts tokens                     # listar API keys/tokens
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

const AUTH_TYPES: Record<string, string> = {
    'Email/Password': 'Correo y contraseña',
    'SMS': 'Código SMS',
    'OIDC': 'OpenID Connect (SSO)',
    'SAML': 'SAML 2.0 (SSO)',
    'CAS': 'CAS (SSO)',
    'LDAP': 'LDAP / Active Directory',
    'API keys': 'API Keys',
};

async function listProviders() {
    log('🔐 Listando proveedores de autenticación...\n', 'cyan');

    try {
        const response = await client.get('/authenticators:list', {
            pageSize: 50,
            sort: ['sort']
        });
        const providers = response.data || [];

        if (providers.length === 0) {
            log('  No se encontraron proveedores de autenticación.', 'yellow');
            return;
        }

        const enabled = providers.filter((p: Record<string, unknown>) => p.enabled);
        const disabled = providers.filter((p: Record<string, unknown>) => !p.enabled);

        log(`  Total: ${providers.length} proveedor(es)  |  ✅ ${enabled.length} habilitados  |  ❌ ${disabled.length} deshabilitados\n`, 'green');

        for (const p of providers) {
            const status = p.enabled ? '✅' : '❌';
            const typeName = AUTH_TYPES[p.authType] || p.authType || 'Desconocido';
            log(`  ${status} [${p.name}] ${p.title || p.name}`, 'white');
            log(`      Tipo: ${typeName}  |  Auth Type: ${p.authType || 'N/A'}`, 'gray');
            if (p.description) log(`      Desc: ${p.description}`, 'gray');
            log(`      Creado: ${p.createdAt || 'N/A'}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        log('  Nota: El endpoint /authenticators requiere el plugin de Auth habilitado.', 'yellow');
    }
}

async function getProvider(name: string) {
    log(`🔍 Obteniendo proveedor "${name}"...\n`, 'cyan');

    try {
        const response = await client.get('/authenticators:get', {
            filterByTk: name
        });
        const provider = response.data;

        if (!provider) {
            log(`❌ Proveedor "${name}" no encontrado.`, 'red');
            return;
        }

        const status = provider.enabled ? '✅ Habilitado' : '❌ Deshabilitado';
        const typeName = AUTH_TYPES[provider.authType] || provider.authType || 'Desconocido';

        log(`  Proveedor: ${provider.title || provider.name}`, 'white');
        log(`  Nombre:    ${provider.name}`, 'gray');
        log(`  Estado:    ${status}`, provider.enabled ? 'green' : 'red');
        log(`  Tipo:      ${typeName}`, 'gray');
        log(`  Auth Type: ${provider.authType || 'N/A'}`, 'gray');
        if (provider.description) log(`  Desc:      ${provider.description}`, 'gray');
        log(`  Creado:    ${provider.createdAt || 'N/A'}`, 'gray');
        log(`  Actualizado: ${provider.updatedAt || 'N/A'}`, 'gray');

        if (provider.options) {
            log('\n  Opciones de configuración:', 'white');
            // Hide sensitive fields
            const safeOpts = { ...provider.options };
            if (safeOpts.clientSecret) safeOpts.clientSecret = '***';
            if (safeOpts.secret) safeOpts.secret = '***';
            if (safeOpts.privateKey) safeOpts.privateKey = '***';
            if (safeOpts.bindPassword) safeOpts.bindPassword = '***';
            log(JSON.stringify(safeOpts, null, 2), 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function createProvider(flags: Record<string, string>) {
    const { name, type, title } = flags;

    if (!name || !type) {
        log('❌ Se requieren --name y --type', 'red');
        log('\n  Tipos disponibles:', 'white');
        for (const [key, desc] of Object.entries(AUTH_TYPES)) {
            log(`    ${key.padEnd(20)} ${desc}`, 'gray');
        }
        process.exit(1);
    }

    log(`➕ Creando proveedor "${name}" (${type})...\n`, 'cyan');

    const data: Record<string, unknown> = {
        name,
        authType: type,
        enabled: true
    };

    if (title) data.title = title;
    if (flags.description) data.description = flags.description;

    // Build options based on type
    const options: Record<string, unknown> = {};
    if (type === 'OIDC' || type === 'oidc') {
        if (flags['client-id']) options.clientId = flags['client-id'];
        if (flags['client-secret']) options.clientSecret = flags['client-secret'];
        if (flags.issuer) options.issuer = flags.issuer;
        if (flags['redirect-uri']) options.redirectUri = flags['redirect-uri'];
    } else if (type === 'SAML' || type === 'saml') {
        if (flags['entity-id']) options.entityId = flags['entity-id'];
        if (flags['sso-url']) options.ssoUrl = flags['sso-url'];
        if (flags.certificate) options.certificate = flags.certificate;
    } else if (type === 'LDAP' || type === 'ldap') {
        if (flags.url) options.url = flags.url;
        if (flags['bind-dn']) options.bindDN = flags['bind-dn'];
        if (flags['bind-password']) options.bindPassword = flags['bind-password'];
        if (flags['search-base']) options.searchBase = flags['search-base'];
    }

    if (Object.keys(options).length > 0) {
        data.options = options;
    }

    try {
        const response = await client.post('/authenticators:create', data);
        log(`✅ Proveedor "${name}" creado exitosamente.`, 'green');
        if (response.data) {
            log(`  ID: ${response.data.id || 'N/A'}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function updateProvider(name: string, flags: Record<string, string>) {
    const data: Record<string, unknown> = {};
    if (flags.title) data.title = flags.title;
    if (flags.description) data.description = flags.description;

    if (Object.keys(data).length === 0) {
        log('❌ Proporciona al menos un campo: --title, --description', 'red');
        process.exit(1);
    }

    log(`✏️  Actualizando proveedor "${name}"...\n`, 'cyan');

    try {
        await client.post('/authenticators:update', {
            ...data,
            filterByTk: name
        });
        log(`✅ Proveedor "${name}" actualizado.`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function enableProvider(name: string) {
    log(`✅ Habilitando proveedor "${name}"...\n`, 'cyan');

    try {
        await client.post('/authenticators:update', {
            filterByTk: name,
            enabled: true
        });
        log(`✅ Proveedor "${name}" habilitado.`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function disableProvider(name: string) {
    log(`❌ Deshabilitando proveedor "${name}"...\n`, 'cyan');

    try {
        await client.post('/authenticators:update', {
            filterByTk: name,
            enabled: false
        });
        log(`✅ Proveedor "${name}" deshabilitado.`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function deleteProvider(name: string) {
    log(`🗑️  Eliminando proveedor "${name}"...\n`, 'cyan');

    try {
        await client.post('/authenticators:destroy', { filterByTk: name });
        log(`✅ Proveedor "${name}" eliminado.`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function checkSession() {
    log('🔑 Verificando sesión actual...\n', 'cyan');

    try {
        const response = await client.get('/auth:check');
        const user = response.data;

        if (user) {
            log('  ✅ Sesión activa', 'green');
            log(`  Usuario:  ${user.nickname || user.username || user.email || 'N/A'}`, 'gray');
            log(`  ID:       ${user.id || 'N/A'}`, 'gray');
            log(`  Email:    ${user.email || 'N/A'}`, 'gray');

            if (user.roles && user.roles.length > 0) {
                const roleNames = user.roles.map((r: Record<string, unknown>) => r.name || r).join(', ');
                log(`  Roles:    ${roleNames}`, 'gray');
            }

            log(`  Token:    ***${process.env.NOCOBASE_API_KEY?.slice(-8) || 'N/A'}`, 'gray');
        } else {
            log('  ❌ Sesión no válida', 'red');
        }
    } catch (error: unknown) {
        if (error.response?.status === 401) {
            log('  ❌ Token inválido o expirado', 'red');
            log('  Verifica NOCOBASE_API_KEY en tu .env', 'yellow');
        } else {
            log(`  ❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        }
    }
}

async function listTokens() {
    log('🔑 Listando API keys/tokens...\n', 'cyan');

    try {
        const response = await client.get('/apiKeys:list', {
            pageSize: 50,
            sort: ['-createdAt']
        });
        const tokens = response.data || [];

        if (tokens.length === 0) {
            log('  No se encontraron API keys.', 'yellow');
            log('  Los API keys se gestionan desde el plugin "API Keys".', 'gray');
            return;
        }

        log(`  Total: ${tokens.length} API key(s)\n`, 'green');

        for (const t of tokens) {
            const status = t.expiresAt && new Date(t.expiresAt) < new Date() ? '❌ Expirado' : '✅ Activo';
            log(`  ${status.includes('✅') ? '✅' : '❌'} [${t.id}] ${t.name || 'Sin nombre'}`, 'white');
            log(`      Rol: ${t.role || 'N/A'}  |  Creado: ${t.createdAt || 'N/A'}`, 'gray');
            if (t.expiresAt) log(`      Expira: ${t.expiresAt}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        log('  Nota: El plugin "API Keys" debe estar habilitado.', 'yellow');
    }
}

async function main() {
    const args = process.argv.slice(2);
    const { flags, positional } = parseArgs(args);
    const command = positional[0];

    try {
        switch (command) {
            case 'list':
                await listProviders();
                break;
            case 'get':
                if (!positional[1]) { log('❌ Uso: get <nombre>', 'red'); process.exit(1); }
                await getProvider(positional[1]);
                break;
            case 'create':
                await createProvider(flags);
                break;
            case 'update':
                if (!positional[1]) { log('❌ Uso: update <nombre> --campo valor', 'red'); process.exit(1); }
                await updateProvider(positional[1], flags);
                break;
            case 'enable':
                if (!positional[1]) { log('❌ Uso: enable <nombre>', 'red'); process.exit(1); }
                await enableProvider(positional[1]);
                break;
            case 'disable':
                if (!positional[1]) { log('❌ Uso: disable <nombre>', 'red'); process.exit(1); }
                await disableProvider(positional[1]);
                break;
            case 'delete':
                if (!positional[1]) { log('❌ Uso: delete <nombre>', 'red'); process.exit(1); }
                await deleteProvider(positional[1]);
                break;
            case 'check':
                await checkSession();
                break;
            case 'tokens':
                await listTokens();
                break;
            default:
                log('Uso: manage-auth.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list                          Listar proveedores de autenticación', 'gray');
                log('  get <nombre>                  Detalle de un proveedor', 'gray');
                log('  create --name n --type t      Crear proveedor', 'gray');
                log('  update <nombre> --title t     Actualizar proveedor', 'gray');
                log('  enable <nombre>               Habilitar proveedor', 'gray');
                log('  disable <nombre>              Deshabilitar proveedor', 'gray');
                log('  delete <nombre>               Eliminar proveedor', 'gray');
                log('  check                         Verificar sesión actual', 'gray');
                log('  tokens                        Listar API keys', 'gray');
                log('\nTipos de autenticación:', 'white');
                for (const [key, desc] of Object.entries(AUTH_TYPES)) {
                    log(`  ${key.padEnd(20)} ${desc}`, 'gray');
                }
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
