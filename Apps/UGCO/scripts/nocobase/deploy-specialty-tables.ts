/**
 * deploy-specialty-tables.ts - Agregar tablas de casos a paginas de especialidades UGCO
 *
 * Uso:
 *   npx tsx Apps/UGCO/scripts/nocobase/deploy-specialty-tables.ts
 *   npx tsx Apps/UGCO/scripts/nocobase/deploy-specialty-tables.ts --dry-run
 */

import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// ─── Configuracion ──────────────────────────────────────────────────────────

const colors = {
    cyan: (t: string) => `\x1b[36m${t}\x1b[0m`,
    green: (t: string) => `\x1b[32m${t}\x1b[0m`,
    yellow: (t: string) => `\x1b[33m${t}\x1b[0m`,
    red: (t: string) => `\x1b[31m${t}\x1b[0m`,
    gray: (t: string) => `\x1b[90m${t}\x1b[0m`,
    white: (t: string) => `\x1b[37m${t}\x1b[0m`,
};

function log(msg: string, color: keyof typeof colors = 'white') {
    console.log(colors[color](msg));
}

// ─── Especialidades UGCO ────────────────────────────────────────────────────

interface Specialty {
    name: string;
    schemaUid: string;
    refId: number;  // ID en UGCO_REF_oncoespecialidad
    emoji: string;
}

const SPECIALTIES: Specialty[] = [
    { name: 'Digestivo Alto', schemaUid: 'gvwu5oy6x81', refId: 1, emoji: '🔶' },
    { name: 'Digestivo Bajo', schemaUid: 'dveo8ljnh3m', refId: 2, emoji: '🟤' },
    { name: 'Mama', schemaUid: 'gd5bm7y7eeu', refId: 4, emoji: '🩷' },
    { name: 'Ginecologia', schemaUid: 'rrilka8jvxk', refId: 5, emoji: '💜' },
    { name: 'Urologia', schemaUid: '8233csa73m0', refId: 6, emoji: '💙' },
    { name: 'Torax', schemaUid: 'smwp7k0f12b', refId: 7, emoji: '🫁' },
    { name: 'Piel', schemaUid: '1zdi1oxxqwa', refId: 8, emoji: '💛' },
    { name: 'Endocrinologia', schemaUid: 'ji5zcgu1sq6', refId: 3, emoji: '💚' },
    { name: 'Hematologia', schemaUid: '3rjf7ph6m9k', refId: 9, emoji: '❤️' },
    { name: 'Sarcoma y Partes Blandas', schemaUid: 'vs2hyb9zzjy', refId: 8, emoji: '🦴' },
    { name: 'Cabeza y Cuello', schemaUid: 'wddflxghgmh', refId: 0, emoji: '🗣️' },
];

// ─── Cliente API ────────────────────────────────────────────────────────────

function createClient(): AxiosInstance {
    const apiUrl = process.env.NOCOBASE_BASE_URL;
    const apiKey = process.env.NOCOBASE_API_KEY;

    if (!apiUrl || !apiKey) {
        log('❌ Error: NOCOBASE_BASE_URL o NOCOBASE_API_KEY no configurados en .env', 'red');
        process.exit(1);
    }

    return axios.create({
        baseURL: apiUrl,
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        timeout: 30000,
    });
}

// ─── Generador de UID ───────────────────────────────────────────────────────

function generateUid(): string {
    return Math.random().toString(36).substring(2, 13);
}

// ─── Schema de Tabla para Especialidad ──────────────────────────────────────

function createTableSchema(specialty: Specialty) {
    const tableUid = generateUid();
    const actionBarUid = generateUid();
    const createActionUid = generateUid();
    const refreshActionUid = generateUid();
    const filterActionUid = generateUid();

    return {
        type: 'void',
        'x-component': 'Page',
        'x-async': true,
        'x-uid': specialty.schemaUid,
        properties: {
            grid: {
                type: 'void',
                'x-component': 'Grid',
                'x-initializer': 'page:addBlock',
                'x-uid': generateUid(),
                properties: {
                    row1: {
                        type: 'void',
                        'x-component': 'Grid.Row',
                        'x-uid': generateUid(),
                        properties: {
                            col1: {
                                type: 'void',
                                'x-component': 'Grid.Col',
                                'x-uid': generateUid(),
                                properties: {
                                    header: {
                                        type: 'void',
                                        'x-component': 'CardItem',
                                        'x-uid': generateUid(),
                                        properties: {
                                            markdown: {
                                                type: 'void',
                                                'x-component': 'Markdown.Void',
                                                'x-component-props': {
                                                    content: `# ${specialty.emoji} ${specialty.name}\n\nCasos oncologicos de la especialidad **${specialty.name}**.`
                                                },
                                                'x-uid': generateUid(),
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    row2: {
                        type: 'void',
                        'x-component': 'Grid.Row',
                        'x-uid': generateUid(),
                        properties: {
                            col1: {
                                type: 'void',
                                'x-component': 'Grid.Col',
                                'x-uid': generateUid(),
                                properties: {
                                    tableBlock: {
                                        type: 'void',
                                        'x-decorator': 'TableBlockProvider',
                                        'x-decorator-props': {
                                            collection: 'ugco_casooncologico',
                                            action: 'list',
                                            params: {
                                                pageSize: 20
                                            },
                                            showIndex: true,
                                            dragSort: false,
                                        },
                                        'x-component': 'CardItem',
                                        'x-component-props': {
                                            title: `Casos - ${specialty.name}`
                                        },
                                        'x-uid': tableUid,
                                        properties: {
                                            actions: {
                                                type: 'void',
                                                'x-component': 'ActionBar',
                                                'x-component-props': {
                                                    style: { marginBottom: 16 }
                                                },
                                                'x-initializer': 'table:configureActions',
                                                'x-uid': actionBarUid,
                                                properties: {
                                                    filter: {
                                                        type: 'void',
                                                        title: '{{ t("Filter") }}',
                                                        'x-action': 'filter',
                                                        'x-component': 'Filter.Action',
                                                        'x-component-props': {
                                                            icon: 'FilterOutlined',
                                                            useProps: '{{ useFilterActionProps }}'
                                                        },
                                                        'x-uid': filterActionUid,
                                                        'x-align': 'left',
                                                    },
                                                    refresh: {
                                                        type: 'void',
                                                        title: '{{ t("Refresh") }}',
                                                        'x-action': 'refresh',
                                                        'x-component': 'Action',
                                                        'x-component-props': {
                                                            icon: 'ReloadOutlined',
                                                            useProps: '{{ useRefreshActionProps }}'
                                                        },
                                                        'x-uid': refreshActionUid,
                                                        'x-align': 'left',
                                                    },
                                                    create: {
                                                        type: 'void',
                                                        title: '{{ t("Add new") }}',
                                                        'x-action': 'create',
                                                        'x-component': 'Action',
                                                        'x-component-props': {
                                                            type: 'primary',
                                                            icon: 'PlusOutlined',
                                                            openMode: 'drawer',
                                                        },
                                                        'x-uid': createActionUid,
                                                        'x-align': 'right',
                                                        properties: {
                                                            drawer: {
                                                                type: 'void',
                                                                title: 'Nuevo Caso',
                                                                'x-component': 'Action.Container',
                                                                'x-component-props': {},
                                                                'x-uid': generateUid(),
                                                                properties: {
                                                                    form: {
                                                                        type: 'void',
                                                                        'x-decorator': 'FormBlockProvider',
                                                                        'x-decorator-props': {
                                                                            collection: 'ugco_casooncologico',
                                                                        },
                                                                        'x-component': 'CardItem',
                                                                        'x-uid': generateUid(),
                                                                        properties: {
                                                                            formContent: {
                                                                                type: 'void',
                                                                                'x-component': 'FormV2',
                                                                                'x-component-props': {
                                                                                    useProps: '{{ useFormBlockProps }}'
                                                                                },
                                                                                'x-uid': generateUid(),
                                                                                properties: {
                                                                                    grid: {
                                                                                        type: 'void',
                                                                                        'x-component': 'Grid',
                                                                                        'x-initializer': 'form:configureFields',
                                                                                        'x-uid': generateUid(),
                                                                                    },
                                                                                    actions: {
                                                                                        type: 'void',
                                                                                        'x-component': 'ActionBar',
                                                                                        'x-component-props': {
                                                                                            layout: 'one-column',
                                                                                            style: { marginTop: 24 }
                                                                                        },
                                                                                        'x-uid': generateUid(),
                                                                                        properties: {
                                                                                            submit: {
                                                                                                type: 'void',
                                                                                                title: '{{ t("Submit") }}',
                                                                                                'x-action': 'submit',
                                                                                                'x-component': 'Action',
                                                                                                'x-component-props': {
                                                                                                    type: 'primary',
                                                                                                    useProps: '{{ useCreateActionProps }}'
                                                                                                },
                                                                                                'x-uid': generateUid(),
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            table: {
                                                type: 'array',
                                                'x-component': 'TableV2',
                                                'x-component-props': {
                                                    rowKey: 'id',
                                                    rowSelection: {
                                                        type: 'checkbox'
                                                    },
                                                    useProps: '{{ useTableBlockProps }}'
                                                },
                                                'x-initializer': 'table:configureColumns',
                                                'x-uid': generateUid(),
                                                properties: {
                                                    actions: {
                                                        type: 'void',
                                                        title: '{{ t("Actions") }}',
                                                        'x-component': 'TableV2.Column',
                                                        'x-component-props': {
                                                            width: 150,
                                                            fixed: 'right'
                                                        },
                                                        'x-initializer': 'table:configureItemActions',
                                                        'x-uid': generateUid(),
                                                        properties: {
                                                            actions: {
                                                                type: 'void',
                                                                'x-component': 'Space',
                                                                'x-component-props': { split: '|' },
                                                                'x-uid': generateUid(),
                                                                properties: {
                                                                    view: {
                                                                        type: 'void',
                                                                        title: '{{ t("View") }}',
                                                                        'x-action': 'view',
                                                                        'x-component': 'Action.Link',
                                                                        'x-component-props': {
                                                                            openMode: 'drawer'
                                                                        },
                                                                        'x-uid': generateUid(),
                                                                    },
                                                                    edit: {
                                                                        type: 'void',
                                                                        title: '{{ t("Edit") }}',
                                                                        'x-action': 'update',
                                                                        'x-component': 'Action.Link',
                                                                        'x-component-props': {
                                                                            openMode: 'drawer'
                                                                        },
                                                                        'x-uid': generateUid(),
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
    const dryRun = process.argv.includes('--dry-run');
    const singleSpecialty = process.argv.find(arg => arg.startsWith('--specialty='))?.split('=')[1];

    log('╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  UGCO Specialty Tables Deployer                            ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝', 'cyan');

    if (dryRun) {
        log('\n  [!] Modo DRY-RUN: simulando sin aplicar cambios\n', 'yellow');
    }

    const client = createClient();

    // Verificar conexion
    try {
        await client.get('/app:getLang');
        log('  ✅ Conexion verificada\n', 'green');
    } catch (_error: unknown) {
        log('  ❌ No se puede conectar al servidor\n', 'red');
        process.exit(1);
    }

    // Filtrar especialidades si se especifica una
    const specialtiesToProcess = singleSpecialty
        ? SPECIALTIES.filter(s => s.name.toLowerCase().includes(singleSpecialty.toLowerCase()))
        : SPECIALTIES;

    if (specialtiesToProcess.length === 0) {
        log(`❌ No se encontro especialidad: ${singleSpecialty}`, 'red');
        process.exit(1);
    }

    log(`📋 Procesando ${specialtiesToProcess.length} especialidad(es):\n`, 'cyan');

    let success = 0;
    let errors = 0;

    for (const specialty of specialtiesToProcess) {
        log(`  ${specialty.emoji} ${specialty.name}...`, 'white');

        if (dryRun) {
            log(`     [DRY-RUN] Se actualizaria schema ${specialty.schemaUid}`, 'yellow');
            success++;
            continue;
        }

        try {
            // Crear el schema de tabla
            const schema = createTableSchema(specialty);

            // Eliminar schema existente
            try {
                await client.post(`/uiSchemas:remove/${specialty.schemaUid}`);
                log(`     🗑️  Schema anterior eliminado`, 'gray');
            } catch (_e: unknown) {
                // Ignorar si no existe
            }

            // Insertar nuevo schema
            const response = await client.post('/uiSchemas:insert', schema);

            if (response.data) {
                log(`     ✅ Tabla agregada (Schema: ${specialty.schemaUid})`, 'green');
                success++;
            } else {
                throw new Error('No response data');
            }

        } catch (error: any) {
            const errorMsg = error.response?.data?.errors?.[0]?.message || error.message;
            log(`     ❌ Error: ${errorMsg}`, 'red');
            errors++;
        }
    }

    // Resumen
    log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'white');
    if (dryRun) {
        log('  Modo DRY-RUN completado (sin cambios aplicados)', 'yellow');
    } else {
        log(`  ✅ Especialidades actualizadas: ${success}`, 'green');
        if (errors > 0) log(`  ❌ Errores: ${errors}`, 'red');
    }
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'white');

    log('📌 Nota: Use el editor visual de NocoBase para:', 'gray');
    log('   - Agregar columnas a las tablas (clic en +)', 'gray');
    log('   - Configurar campos del formulario', 'gray');
    log('   - Ajustar filtros por especialidad', 'gray');
}

main().catch(console.error);
