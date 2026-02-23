/**
 * manage-themes.ts - Gestión de temas visuales NocoBase via API
 *
 * Usa el plugin: theme-editor
 *
 * Uso:
 *   tsx shared/scripts/manage-themes.ts list                           # listar temas
 *   tsx shared/scripts/manage-themes.ts get <id>                       # detalle de un tema
 *   tsx shared/scripts/manage-themes.ts active                         # ver tema activo
 *   tsx shared/scripts/manage-themes.ts activate <id>                  # activar un tema
 *   tsx shared/scripts/manage-themes.ts create --name n [opciones]     # crear tema personalizado
 *   tsx shared/scripts/manage-themes.ts update <id> [opciones]         # actualizar tema
 *   tsx shared/scripts/manage-themes.ts delete <id>                    # eliminar tema
 *   tsx shared/scripts/manage-themes.ts export <id> [--file tema.json] # exportar tema
 *   tsx shared/scripts/manage-themes.ts import --file tema.json        # importar tema
 */

import { createClient, log } from './ApiClient';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';

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

async function listThemes() {
    log('🎨 Temas configurados...\n', 'cyan');

    try {
        const response = await client.get('/themeConfig:list', { pageSize: 50 });
        const themes = response.data || [];

        if (themes.length === 0) {
            log('  Sin temas configurados (usando tema por defecto).', 'yellow');
            return;
        }

        log(`  Total: ${themes.length} tema(s)\n`, 'green');

        for (const t of themes) {
            const active = t.default ? '🟢' : '⚪';
            const optional = t.optional ? ' [disponible]' : '';
            log(`  ${active} [${t.id}] ${t.config?.name || 'Sin nombre'}${optional}`, 'white');

            const token = t.config?.token || {};
            if (token.colorPrimary) log(`      Color primario: ${token.colorPrimary}`, 'gray');
            if (token.borderRadius != null) log(`      Border radius: ${token.borderRadius}px`, 'gray');
            if (token.colorBgBase) log(`      Fondo: ${token.colorBgBase}`, 'gray');

            const isDark = t.config?.algorithm === 'darkAlgorithm' ||
                           (Array.isArray(t.config?.algorithm) && t.config.algorithm.includes('darkAlgorithm'));
            if (isDark) log(`      Modo: 🌙 Oscuro`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function getTheme(id: string) {
    log(`🎨 Detalle del tema ${id}...\n`, 'cyan');

    try {
        const response = await client.get('/themeConfig:get', { filterByTk: id });
        const theme = response.data || response;
        log(JSON.stringify(theme, null, 2), 'white');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function getActiveTheme() {
    log('🎨 Tema activo...\n', 'cyan');

    try {
        const response = await client.get('/themeConfig:list', { filter: { default: true } });
        const themes = response.data || [];

        if (themes.length === 0) {
            log('  Usando tema por defecto del sistema.', 'yellow');
            return;
        }

        const t = themes[0];
        log(`  Tema activo: [${t.id}] ${t.config?.name || 'Sin nombre'}`, 'green');

        const token = t.config?.token || {};
        log('\n  Configuración:', 'white');
        if (token.colorPrimary) log(`    Color primario:  ${token.colorPrimary}`, 'gray');
        if (token.colorSuccess) log(`    Color éxito:     ${token.colorSuccess}`, 'gray');
        if (token.colorWarning) log(`    Color alerta:    ${token.colorWarning}`, 'gray');
        if (token.colorError) log(`    Color error:     ${token.colorError}`, 'gray');
        if (token.colorInfo) log(`    Color info:      ${token.colorInfo}`, 'gray');
        if (token.borderRadius != null) log(`    Border radius:   ${token.borderRadius}px`, 'gray');
        if (token.fontSize) log(`    Tamaño fuente:   ${token.fontSize}px`, 'gray');
        if (token.colorBgBase) log(`    Fondo base:      ${token.colorBgBase}`, 'gray');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function activateTheme(id: string) {
    log(`🎨 Activando tema ${id}...\n`, 'cyan');

    try {
        // Deactivate all themes first
        const allThemes = await client.get('/themeConfig:list', { pageSize: 50 });
        for (const t of (allThemes.data || [])) {
            if (t.default) {
                await client.post('/themeConfig:update', { filterByTk: t.id, default: false });
            }
        }

        // Activate the requested theme
        await client.post('/themeConfig:update', { filterByTk: id, default: true, optional: true });
        log('✅ Tema activado.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function createTheme(flags: Record<string, string>) {
    if (!flags.name) {
        log('❌ Parámetro requerido: --name <nombre>', 'red');
        log('   Opcionales: --primary #color --radius N --dark', 'gray');
        process.exit(1);
    }

    log(`🎨 Creando tema "${flags.name}"...\n`, 'cyan');

    const token: Record<string, unknown> = {};
    if (flags.primary) token.colorPrimary = flags.primary;
    if (flags.success) token.colorSuccess = flags.success;
    if (flags.warning) token.colorWarning = flags.warning;
    if (flags.error) token.colorError = flags.error;
    if (flags.info) token.colorInfo = flags.info;
    if (flags.radius) token.borderRadius = parseInt(flags.radius);
    if (flags.fontSize) token.fontSize = parseInt(flags.fontSize);
    if (flags.bg) token.colorBgBase = flags.bg;

    const config: Record<string, unknown> = { name: flags.name, token };
    if (flags.dark !== undefined) config.algorithm = 'darkAlgorithm';

    try {
        const response = await client.post('/themeConfig:create', {
            config,
            optional: true,
            default: false,
        });
        const theme = response.data || response;
        log(`✅ Tema creado: [${theme.id}] ${flags.name}`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function updateTheme(id: string, flags: Record<string, string>) {
    log(`✏️  Actualizando tema ${id}...\n`, 'cyan');

    try {
        // Get current theme
        const current = await client.get('/themeConfig:get', { filterByTk: id });
        const theme = current.data || current;
        const config = theme.config || {};
        const token = config.token || {};

        if (flags.name) config.name = flags.name;
        if (flags.primary) token.colorPrimary = flags.primary;
        if (flags.radius) token.borderRadius = parseInt(flags.radius);
        if (flags.fontSize) token.fontSize = parseInt(flags.fontSize);
        if (flags.bg) token.colorBgBase = flags.bg;
        if (flags.dark !== undefined) config.algorithm = 'darkAlgorithm';

        config.token = token;

        await client.post('/themeConfig:update', { filterByTk: id, config });
        log('✅ Tema actualizado.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function deleteTheme(id: string) {
    log(`🗑️  Eliminando tema ${id}...\n`, 'cyan');
    try {
        await client.post('/themeConfig:destroy', { filterByTk: id });
        log('✅ Tema eliminado.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function exportTheme(id: string, flags: Record<string, string>) {
    log(`📤 Exportando tema ${id}...\n`, 'cyan');
    try {
        const response = await client.get('/themeConfig:get', { filterByTk: id });
        const theme = response.data || response;
        const filename = flags.file || `theme_${id}.json`;
        const filepath = path.resolve(filename);
        writeFileSync(filepath, JSON.stringify(theme, null, 2));
        log(`✅ Tema exportado: ${filepath}`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function importTheme(flags: Record<string, string>) {
    if (!flags.file) {
        log('❌ Parámetro requerido: --file <tema.json>', 'red');
        process.exit(1);
    }

    const filepath = path.resolve(flags.file);
    if (!existsSync(filepath)) {
        log(`❌ Archivo no encontrado: ${filepath}`, 'red');
        process.exit(1);
    }

    log(`📥 Importando tema desde ${filepath}...\n`, 'cyan');

    try {
        const data = JSON.parse(readFileSync(filepath, 'utf-8'));
        const themeData = {
            config: data.config || data,
            optional: true,
            default: false,
        };

        const response = await client.post('/themeConfig:create', themeData);
        const theme = response.data || response;
        log(`✅ Tema importado: [${theme.id}]`, 'green');
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
            case 'list': await listThemes(); break;
            case 'get':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await getTheme(positional[1]); break;
            case 'active': await getActiveTheme(); break;
            case 'activate':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await activateTheme(positional[1]); break;
            case 'create': await createTheme(flags); break;
            case 'update':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await updateTheme(positional[1], flags); break;
            case 'delete':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await deleteTheme(positional[1]); break;
            case 'export':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await exportTheme(positional[1], flags); break;
            case 'import': await importTheme(flags); break;
            default:
                log('Uso: manage-themes.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list                                   Listar temas', 'gray');
                log('  get <id>                               Detalle de un tema', 'gray');
                log('  active                                 Ver tema activo', 'gray');
                log('  activate <id>                          Activar un tema', 'gray');
                log('  create --name n [--primary #hex] [--dark]  Crear tema', 'gray');
                log('  update <id> [--primary #hex] [--radius N]  Actualizar tema', 'gray');
                log('  delete <id>                            Eliminar tema', 'gray');
                log('  export <id> [--file tema.json]         Exportar tema a JSON', 'gray');
                log('  import --file tema.json                Importar tema desde JSON', 'gray');
                log('\nOpciones de estilo:', 'white');
                log('  --primary #1890ff    Color primario', 'gray');
                log('  --success #52c41a    Color éxito', 'gray');
                log('  --warning #faad14    Color alerta', 'gray');
                log('  --error #ff4d4f      Color error', 'gray');
                log('  --radius 6           Border radius (px)', 'gray');
                log('  --fontSize 14        Tamaño de fuente', 'gray');
                log('  --bg #ffffff         Color de fondo', 'gray');
                log('  --dark               Modo oscuro', 'gray');
                log('\nEjemplos:', 'white');
                log('  create --name "Hospital Ovalle" --primary #005eb8 --radius 4', 'gray');
                log('  create --name "Modo Oscuro" --primary #1890ff --dark', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
