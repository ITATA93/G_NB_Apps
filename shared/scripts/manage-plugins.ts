/**
 * manage-plugins.ts - Gestión de plugins NocoBase via API
 *
 * Uso:
 *   tsx shared/scripts/manage-plugins.ts list                     # listar todos los plugins
 *   tsx shared/scripts/manage-plugins.ts list --enabled           # solo plugins habilitados
 *   tsx shared/scripts/manage-plugins.ts list --disabled          # solo plugins deshabilitados
 *   tsx shared/scripts/manage-plugins.ts get <name>               # detalle de un plugin
 *   tsx shared/scripts/manage-plugins.ts enable <name>            # habilitar plugin
 *   tsx shared/scripts/manage-plugins.ts disable <name>           # deshabilitar plugin
 *   tsx shared/scripts/manage-plugins.ts search <term>            # buscar plugins por nombre
 *   tsx shared/scripts/manage-plugins.ts builtin                  # listar plugins built-in
 */

import { createClient, log } from './ApiClient';

const client = createClient();

function parseArgs(args: string[]): { flags: Record<string, string>, positional: string[] } {
    const flags: Record<string, string> = {};
    const positional: string[] = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            const key = args[i].slice(2);
            // Boolean flags (no value)
            if (i + 1 >= args.length || args[i + 1]?.startsWith('--')) {
                flags[key] = 'true';
            } else {
                flags[key] = args[i + 1] || '';
                i++;
            }
        } else {
            positional.push(args[i]);
        }
    }
    return { flags, positional };
}

interface PluginInfo {
    id?: number;
    name: string;
    packageName?: string;
    version?: string;
    enabled?: boolean;
    installed?: boolean;
    builtIn?: boolean;
    compressedFileUrl?: string;
    description?: string;
    displayName?: string;
    createdAt?: string;
    updatedAt?: string;
}

async function listPlugins(filter?: 'enabled' | 'disabled') {
    log('🔌 Listando plugins...\n', 'cyan');

    const response = await client.get('/applicationPlugins:list', {
        pageSize: 200,
        sort: ['name']
    });
    let plugins: PluginInfo[] = response.data || [];

    if (filter === 'enabled') {
        plugins = plugins.filter(p => p.enabled);
        log(`  Filtro: Solo habilitados\n`, 'yellow');
    } else if (filter === 'disabled') {
        plugins = plugins.filter(p => !p.enabled);
        log(`  Filtro: Solo deshabilitados\n`, 'yellow');
    }

    if (plugins.length === 0) {
        log('No se encontraron plugins.', 'yellow');
        return;
    }

    const enabledCount = plugins.filter(p => p.enabled).length;
    const disabledCount = plugins.filter(p => !p.enabled).length;
    const builtInCount = plugins.filter(p => p.builtIn).length;

    log(`  Total: ${plugins.length} plugin(s)  |  ✅ ${enabledCount} habilitados  |  ❌ ${disabledCount} deshabilitados  |  📦 ${builtInCount} built-in\n`, 'green');

    // Group by status
    const enabled = plugins.filter(p => p.enabled);
    const disabled = plugins.filter(p => !p.enabled);

    if (enabled.length > 0 && filter !== 'disabled') {
        log('  ✅ Habilitados:', 'green');
        for (const p of enabled) {
            const builtIn = p.builtIn ? ' [built-in]' : '';
            const version = p.version ? ` v${p.version}` : '';
            log(`    ${p.displayName || p.name}${version}${builtIn}`, 'white');
            log(`      nombre: ${p.name}  |  paquete: ${p.packageName || 'N/A'}`, 'gray');
        }
    }

    if (disabled.length > 0 && filter !== 'enabled') {
        log('\n  ❌ Deshabilitados:', 'red');
        for (const p of disabled) {
            const builtIn = p.builtIn ? ' [built-in]' : '';
            const version = p.version ? ` v${p.version}` : '';
            log(`    ${p.displayName || p.name}${version}${builtIn}`, 'white');
            log(`      nombre: ${p.name}  |  paquete: ${p.packageName || 'N/A'}`, 'gray');
        }
    }
}

async function getPlugin(name: string) {
    log(`🔍 Obteniendo plugin "${name}"...\n`, 'cyan');

    const response = await client.get('/applicationPlugins:list', {
        filter: { name },
        pageSize: 10
    });
    const plugins = response.data || [];
    const plugin = plugins.find((p: PluginInfo) => p.name === name);

    if (!plugin) {
        log(`❌ Plugin "${name}" no encontrado.`, 'red');
        log('  Usa "list" para ver todos los plugins disponibles.', 'gray');
        return;
    }

    const status = plugin.enabled ? '✅ Habilitado' : '❌ Deshabilitado';
    log(`  Plugin: ${plugin.displayName || plugin.name}`, 'white');
    log(`  Estado: ${status}`, plugin.enabled ? 'green' : 'red');
    log(`  Nombre: ${plugin.name}`, 'gray');
    log(`  Paquete: ${plugin.packageName || 'N/A'}`, 'gray');
    log(`  Versión: ${plugin.version || 'N/A'}`, 'gray');
    log(`  Built-in: ${plugin.builtIn ? 'Sí' : 'No'}`, 'gray');
    log(`  Instalado: ${plugin.installed ? 'Sí' : 'No'}`, 'gray');
    log(`  Creado: ${plugin.createdAt || 'N/A'}`, 'gray');
    log(`  Actualizado: ${plugin.updatedAt || 'N/A'}`, 'gray');
    if (plugin.description) {
        log(`  Descripción: ${plugin.description}`, 'gray');
    }

    log('\n  Respuesta completa:', 'white');
    log(JSON.stringify(plugin, null, 2), 'gray');
}

async function enablePlugin(name: string) {
    log(`✅ Habilitando plugin "${name}"...\n`, 'cyan');

    try {
        await client.post(`/pm:enable`, { filterByTk: name });
        log(`✅ Plugin "${name}" habilitado exitosamente.`, 'green');
        log('  ⚠️  Puede requerir reinicio del servidor para aplicar cambios.', 'yellow');
    } catch (error: unknown) {
        // Try alternative endpoint
        try {
            await client.post('/applicationPlugins:update', {
                filterByTk: name,
                enabled: true
            });
            log(`✅ Plugin "${name}" habilitado.`, 'green');
        } catch {
            log(`❌ Error habilitando plugin: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        }
    }
}

async function disablePlugin(name: string) {
    log(`❌ Deshabilitando plugin "${name}"...\n`, 'cyan');

    try {
        await client.post(`/pm:disable`, { filterByTk: name });
        log(`✅ Plugin "${name}" deshabilitado exitosamente.`, 'green');
        log('  ⚠️  Puede requerir reinicio del servidor para aplicar cambios.', 'yellow');
    } catch (error: unknown) {
        try {
            await client.post('/applicationPlugins:update', {
                filterByTk: name,
                enabled: false
            });
            log(`✅ Plugin "${name}" deshabilitado.`, 'green');
        } catch {
            log(`❌ Error deshabilitando plugin: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        }
    }
}

async function searchPlugins(term: string) {
    log(`🔎 Buscando plugins: "${term}"...\n`, 'cyan');

    const response = await client.get('/applicationPlugins:list', { pageSize: 200 });
    const allPlugins: PluginInfo[] = response.data || [];

    const termLower = term.toLowerCase();
    const matches = allPlugins.filter(p =>
        p.name?.toLowerCase().includes(termLower) ||
        p.displayName?.toLowerCase().includes(termLower) ||
        p.packageName?.toLowerCase().includes(termLower) ||
        p.description?.toLowerCase().includes(termLower)
    );

    if (matches.length === 0) {
        log(`  No se encontraron plugins que coincidan con "${term}".`, 'yellow');
        return;
    }

    log(`  Encontrados: ${matches.length} resultado(s)\n`, 'green');
    for (const p of matches) {
        const status = p.enabled ? '✅' : '❌';
        const version = p.version ? ` v${p.version}` : '';
        log(`  ${status} ${p.displayName || p.name}${version}`, 'white');
        log(`      nombre: ${p.name}  |  paquete: ${p.packageName || 'N/A'}`, 'gray');
    }
}

async function listBuiltIn() {
    log('📦 Plugins built-in...\n', 'cyan');

    const response = await client.get('/applicationPlugins:list', { pageSize: 200 });
    const allPlugins: PluginInfo[] = response.data || [];
    const builtIn = allPlugins.filter(p => p.builtIn);

    if (builtIn.length === 0) {
        log('  No se encontraron plugins built-in.', 'yellow');
        return;
    }

    log(`  Total: ${builtIn.length} plugin(s) built-in\n`, 'green');
    for (const p of builtIn) {
        const status = p.enabled ? '✅' : '❌';
        log(`  ${status} ${p.displayName || p.name}`, 'white');
        log(`      nombre: ${p.name}`, 'gray');
    }
}

async function main() {
    const args = process.argv.slice(2);
    const { flags, positional } = parseArgs(args);
    const command = positional[0];

    try {
        switch (command) {
            case 'list': {
                const filter = flags.enabled ? 'enabled' : flags.disabled ? 'disabled' : undefined;
                await listPlugins(filter);
                break;
            }
            case 'get':
                if (!positional[1]) { log('❌ Uso: get <nombre>', 'red'); process.exit(1); }
                await getPlugin(positional[1]);
                break;
            case 'enable':
                if (!positional[1]) { log('❌ Uso: enable <nombre>', 'red'); process.exit(1); }
                await enablePlugin(positional[1]);
                break;
            case 'disable':
                if (!positional[1]) { log('❌ Uso: disable <nombre>', 'red'); process.exit(1); }
                await disablePlugin(positional[1]);
                break;
            case 'search':
                if (!positional[1]) { log('❌ Uso: search <término>', 'red'); process.exit(1); }
                await searchPlugins(positional[1]);
                break;
            case 'builtin':
                await listBuiltIn();
                break;
            default:
                log('Uso: manage-plugins.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list [--enabled|--disabled]   Listar plugins', 'gray');
                log('  get <nombre>                  Detalle de un plugin', 'gray');
                log('  enable <nombre>               Habilitar plugin', 'gray');
                log('  disable <nombre>              Deshabilitar plugin', 'gray');
                log('  search <término>              Buscar plugins', 'gray');
                log('  builtin                       Listar plugins built-in', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
