/**
 * manage-localization.ts - Gestión de traducciones/localización NocoBase via API
 *
 * Uso:
 *   tsx shared/scripts/manage-localization.ts list                # listar traducciones
 *   tsx shared/scripts/manage-localization.ts list --module ui    # filtrar por módulo
 *   tsx shared/scripts/manage-localization.ts get <id>            # detalle de una traducción
 *   tsx shared/scripts/manage-localization.ts create --module ui --text "Hello" --translation "Hola"
 *   tsx shared/scripts/manage-localization.ts update <id> --translation "Nueva traducción"
 *   tsx shared/scripts/manage-localization.ts delete <id>         # eliminar traducción
 *   tsx shared/scripts/manage-localization.ts search <texto>      # buscar por texto original
 *   tsx shared/scripts/manage-localization.ts langs               # idiomas disponibles
 *   tsx shared/scripts/manage-localization.ts stats               # estadísticas de traducciones
 *   tsx shared/scripts/manage-localization.ts export --lang es-ES --file traducciones.json  # exportar
 *   tsx shared/scripts/manage-localization.ts import --file traducciones.json  # importar
 */

import { createClient, log } from './ApiClient';
import fs from 'fs';
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

async function listTranslations(flags: Record<string, string>) {
    log('🌐 Listando traducciones...\n', 'cyan');

    const params: Record<string, unknown> = {
        pageSize: parseInt(flags.limit || '50'),
        sort: ['-createdAt']
    };

    if (flags.module) {
        params.filter = { module: flags.module };
    }
    if (flags.lang) {
        params.filter = { ...(params.filter as Record<string, unknown> || {}), locale: flags.lang };
    }

    try {
        const response = await client.get('/localizationTexts:list', params);
        const texts = response.data || [];
        const meta = response.meta || {};

        if (texts.length === 0) {
            log('  No se encontraron traducciones.', 'yellow');
            return;
        }

        log(`  Total: ${meta.count || texts.length} traducción(es)  |  Mostrando: ${texts.length}\n`, 'green');

        for (const t of texts) {
            const hasTranslation = t.translations && t.translations.length > 0;
            const status = hasTranslation ? '✅' : '⚠️ ';

            log(`  ${status} [${t.id}] "${t.text}"`, 'white');
            log(`      Módulo: ${t.module || 'N/A'}  |  Batch: ${t.batch || 'N/A'}`, 'gray');

            if (hasTranslation) {
                for (const tr of t.translations) {
                    log(`      🌍 ${tr.locale || '?'}: "${tr.translation}"`, 'gray');
                }
            } else {
                log(`      ⚠️  Sin traducción`, 'yellow');
            }
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        log('  Nota: El plugin de Localization debe estar habilitado.', 'yellow');
    }
}

async function getTranslation(id: string) {
    log(`🔍 Obteniendo traducción ${id}...\n`, 'cyan');

    try {
        const response = await client.get('/localizationTexts:get', {
            filterByTk: id,
            appends: ['translations']
        });
        const text = response.data;

        if (!text) {
            log(`❌ Traducción ${id} no encontrada.`, 'red');
            return;
        }

        log(`  Texto original: "${text.text}"`, 'white');
        log(`  ID:     ${text.id}`, 'gray');
        log(`  Módulo: ${text.module || 'N/A'}`, 'gray');
        log(`  Batch:  ${text.batch || 'N/A'}`, 'gray');

        if (text.translations && text.translations.length > 0) {
            log('\n  Traducciones:', 'white');
            for (const tr of text.translations) {
                log(`    🌍 [${tr.locale}] "${tr.translation}"`, 'gray');
            }
        } else {
            log('\n  ⚠️  Sin traducciones disponibles.', 'yellow');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function createTranslation(flags: Record<string, string>) {
    const { module, text, translation, lang } = flags;
    const locale = lang || 'es-ES';

    if (!text) {
        log('❌ Se requiere --text "texto original"', 'red');
        process.exit(1);
    }

    log(`➕ Creando traducción: "${text}" → "${translation || '(pendiente)'}"\n`, 'cyan');

    try {
        // Create the text entry
        const textResponse = await client.post('/localizationTexts:create', {
            module: module || 'client',
            text
        });
        const textId = textResponse.data?.id;

        // If translation provided, create translation
        if (translation && textId) {
            await client.post('/localizationTranslations:create', {
                textId,
                locale,
                translation
            });
            log(`✅ Traducción creada: "${text}" → "${translation}" (${locale})`, 'green');
        } else {
            log(`✅ Texto creado (ID: ${textId}). Usa "update" para añadir la traducción.`, 'green');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function updateTranslation(id: string, flags: Record<string, string>) {
    const { translation, lang } = flags;
    const locale = lang || 'es-ES';

    if (!translation) {
        log('❌ Se requiere --translation "texto traducido"', 'red');
        process.exit(1);
    }

    log(`✏️  Actualizando traducción ${id}...\n`, 'cyan');

    try {
        // Try updating via localizationTranslations
        await client.post('/localizationTranslations:update', {
            filterByTk: id,
            translation,
            locale
        });
        log(`✅ Traducción actualizada.`, 'green');
    } catch {
        // Try alternative: update the text
        try {
            await client.post('/localizationTexts:update', {
                filterByTk: id,
                translations: [{ locale, translation }]
            });
            log(`✅ Traducción actualizada (vía texto).`, 'green');
        } catch (error: unknown) {
            log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        }
    }
}

async function deleteTranslation(id: string) {
    log(`🗑️  Eliminando traducción ${id}...\n`, 'cyan');

    try {
        await client.post('/localizationTexts:destroy', { filterByTk: id });
        log(`✅ Traducción ${id} eliminada.`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function searchTranslations(term: string) {
    log(`🔎 Buscando traducciones: "${term}"...\n`, 'cyan');

    try {
        const response = await client.get('/localizationTexts:list', {
            filter: {
                text: { $includes: term }
            },
            pageSize: 50,
            appends: ['translations']
        });
        const texts = response.data || [];

        if (texts.length === 0) {
            log(`  No se encontraron traducciones para "${term}".`, 'yellow');
            return;
        }

        log(`  Encontrados: ${texts.length} resultado(s)\n`, 'green');

        for (const t of texts) {
            log(`  [${t.id}] "${t.text}"`, 'white');
            if (t.translations?.length > 0) {
                for (const tr of t.translations) {
                    log(`      🌍 [${tr.locale}] "${tr.translation}"`, 'gray');
                }
            }
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function listLanguages() {
    log('🌍 Idiomas disponibles...\n', 'cyan');

    try {
        // Try to get system settings for enabled languages
        const response = await client.get('/systemSettings:get/1');
        const settings = response.data;

        if (settings?.enabledLanguages) {
            log(`  Idiomas habilitados: ${settings.enabledLanguages.length}\n`, 'green');
            for (const lang of settings.enabledLanguages) {
                log(`    ✅ ${lang}`, 'white');
            }
        } else {
            log('  No se pudo obtener la lista de idiomas del sistema.', 'yellow');
        }
    } catch {
        // Fallback: list common languages
        log('  Idiomas comunes en NocoBase:', 'white');
        const langs = [
            { code: 'en-US', name: 'English (US)' },
            { code: 'es-ES', name: 'Español (España)' },
            { code: 'zh-CN', name: 'Chino (Simplificado)' },
            { code: 'pt-BR', name: 'Portugués (Brasil)' },
            { code: 'ja-JP', name: 'Japonés' },
            { code: 'ko-KR', name: 'Coreano' },
            { code: 'fr-FR', name: 'Francés' },
            { code: 'de-DE', name: 'Alemán' },
        ];
        for (const l of langs) {
            log(`    ${l.code.padEnd(8)} ${l.name}`, 'gray');
        }
    }
}

async function translationStats() {
    log('📊 Estadísticas de traducciones...\n', 'cyan');

    try {
        const response = await client.get('/localizationTexts:list', {
            pageSize: 500,
            appends: ['translations']
        });
        const texts = response.data || [];
        const meta = response.meta || {};

        const total = meta.count || texts.length;
        const withTranslation = texts.filter((t: Record<string, unknown>) => (t.translations as unknown[] | undefined)?.length && (t.translations as unknown[]).length > 0).length;
        const withoutTranslation = texts.filter((t: Record<string, unknown>) => !t.translations || (t.translations as unknown[]).length === 0).length;
        const coverage = total > 0 ? ((withTranslation / total) * 100).toFixed(1) : '0';

        log(`  Total textos:      ${total}`, 'white');
        log(`  Con traducción:    ${withTranslation} ✅`, 'green');
        log(`  Sin traducción:    ${withoutTranslation} ⚠️`, withoutTranslation > 0 ? 'yellow' : 'green');
        log(`  Cobertura:         ${coverage}%`, 'white');

        // Group by module
        const byModule: Record<string, number> = {};
        for (const t of texts) {
            const module = t.module || 'sin módulo';
            byModule[module] = (byModule[module] || 0) + 1;
        }

        if (Object.keys(byModule).length > 1) {
            log('\n  Por módulo:', 'white');
            for (const [module, count] of Object.entries(byModule).sort((a, b) => b[1] - a[1])) {
                log(`    ${module.padEnd(25)} ${count} texto(s)`, 'gray');
            }
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function exportTranslations(flags: Record<string, string>) {
    const locale = flags.lang || 'es-ES';
    const filename = flags.file || `translations-${locale}.json`;

    log(`📤 Exportando traducciones (${locale})...\n`, 'cyan');

    try {
        const response = await client.get('/localizationTexts:list', {
            pageSize: 1000,
            appends: ['translations']
        });
        const texts = response.data || [];

        const exported: Record<string, string> = {};
        for (const t of texts) {
            const translation = t.translations?.find((tr: Record<string, unknown>) => tr.locale === locale);
            if (translation) {
                exported[t.text] = translation.translation;
            }
        }

        const outputPath = path.resolve(process.cwd(), filename);
        fs.writeFileSync(outputPath, JSON.stringify(exported, null, 2), 'utf-8');

        log(`✅ Exportadas ${Object.keys(exported).length} traducciones: ${outputPath}`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function importTranslations(flags: Record<string, string>) {
    const filePath = flags.file;
    const locale = flags.lang || 'es-ES';

    if (!filePath) {
        log('❌ Se requiere --file <archivo.json>', 'red');
        process.exit(1);
    }

    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
        log(`❌ Archivo no encontrado: ${resolvedPath}`, 'red');
        process.exit(1);
    }

    log(`📥 Importando traducciones desde ${path.basename(resolvedPath)} (${locale})...\n`, 'cyan');

    try {
        const content = fs.readFileSync(resolvedPath, 'utf-8');
        const translations: Record<string, string> = JSON.parse(content);

        let created = 0;
        let errors = 0;

        for (const [text, translation] of Object.entries(translations)) {
            try {
                // Create text + translation
                const textResponse = await client.post('/localizationTexts:create', {
                    module: 'client',
                    text
                });
                const textId = textResponse.data?.id;

                if (textId) {
                    await client.post('/localizationTranslations:create', {
                        textId,
                        locale,
                        translation
                    });
                }
                created++;
            } catch {
                errors++;
            }
        }

        log(`✅ Importación completada: ${created} creadas, ${errors} errores`, created > 0 ? 'green' : 'yellow');
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
            case 'list':
                await listTranslations(flags);
                break;
            case 'get':
                if (!positional[1]) { log('❌ Uso: get <id>', 'red'); process.exit(1); }
                await getTranslation(positional[1]);
                break;
            case 'create':
                await createTranslation(flags);
                break;
            case 'update':
                if (!positional[1]) { log('❌ Uso: update <id> --translation "texto"', 'red'); process.exit(1); }
                await updateTranslation(positional[1], flags);
                break;
            case 'delete':
                if (!positional[1]) { log('❌ Uso: delete <id>', 'red'); process.exit(1); }
                await deleteTranslation(positional[1]);
                break;
            case 'search':
                if (!positional[1]) { log('❌ Uso: search <texto>', 'red'); process.exit(1); }
                await searchTranslations(positional[1]);
                break;
            case 'langs':
                await listLanguages();
                break;
            case 'stats':
                await translationStats();
                break;
            case 'export':
                await exportTranslations(flags);
                break;
            case 'import':
                await importTranslations(flags);
                break;
            default:
                log('Uso: manage-localization.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list [--module m] [--lang l]   Listar traducciones', 'gray');
                log('  get <id>                       Detalle de una traducción', 'gray');
                log('  create --text t --translation t Crear traducción', 'gray');
                log('  update <id> --translation t    Actualizar traducción', 'gray');
                log('  delete <id>                    Eliminar traducción', 'gray');
                log('  search <texto>                 Buscar traducciones', 'gray');
                log('  langs                          Idiomas disponibles', 'gray');
                log('  stats                          Estadísticas de cobertura', 'gray');
                log('  export --lang es-ES [--file f] Exportar traducciones', 'gray');
                log('  import --file f [--lang es-ES] Importar traducciones', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
