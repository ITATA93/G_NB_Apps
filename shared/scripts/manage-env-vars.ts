/**
 * manage-env-vars.ts - Gestión de variables de entorno NocoBase via API
 *
 * Usa el plugin: environment-variables
 *
 * Uso:
 *   tsx shared/scripts/manage-env-vars.ts list                         # listar variables
 *   tsx shared/scripts/manage-env-vars.ts get <nombre>                 # obtener valor
 *   tsx shared/scripts/manage-env-vars.ts set --name n --value v       # crear o actualizar variable
 *   tsx shared/scripts/manage-env-vars.ts delete <nombre>              # eliminar variable
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

async function listVars() {
    log('🔐 Variables de entorno del sistema...\n', 'cyan');

    try {
        const response = await client.get('/environmentVariables:list', {
            pageSize: 100,
            sort: ['name'],
        });
        const vars = response.data || [];

        if (vars.length === 0) {
            log('  Sin variables de entorno configuradas.', 'yellow');
            log('  Crea una con: manage-env-vars.ts set --name MI_VAR --value "valor"', 'gray');
            return;
        }

        log(`  Total: ${vars.length} variable(s)\n`, 'green');

        const maxName = Math.max(...vars.map((v: Record<string, unknown>) => String(v.name || '').length), 10);

        log(`  ${'NOMBRE'.padEnd(maxName)}  TIPO      VALOR`, 'white');
        log(`  ${'─'.repeat(maxName)}  ────────  ─────────────────────────────`, 'gray');

        for (const v of vars) {
            const name = (v.name || '').padEnd(maxName);
            const type = (v.type || 'text').padEnd(8);
            const value = v.type === 'secret' ? '••••••••' : (v.value || '(vacío)');
            log(`  ${name}  ${type}  ${value}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function getVar(name: string) {
    log(`🔐 Variable: ${name}...\n`, 'cyan');

    try {
        const response = await client.get('/environmentVariables:list', {
            filter: { name },
        });
        const vars = response.data || [];

        if (vars.length === 0) {
            log(`  Variable "${name}" no encontrada.`, 'yellow');
            return;
        }

        const v = vars[0];
        log(`  Nombre:      ${v.name}`, 'white');
        log(`  Tipo:        ${v.type || 'text'}`, 'gray');
        log(`  Valor:       ${v.type === 'secret' ? '••••••••' : (v.value || '(vacío)')}`, 'gray');
        if (v.createdAt) log(`  Creada:      ${new Date(v.createdAt).toLocaleString('es-CL')}`, 'gray');
        if (v.updatedAt) log(`  Actualizada: ${new Date(v.updatedAt).toLocaleString('es-CL')}`, 'gray');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function setVar(flags: Record<string, string>) {
    if (!flags.name) {
        log('❌ Parámetro requerido: --name <nombre>', 'red');
        log('   Opciones: --value <valor> --type <text|secret>', 'gray');
        process.exit(1);
    }

    // Check if variable exists
    try {
        const existing = await client.get('/environmentVariables:list', {
            filter: { name: flags.name },
        });
        const vars = existing.data || [];

        const data: Record<string, unknown> = {
            name: flags.name,
            value: flags.value || '',
        };
        if (flags.type) data.type = flags.type;

        if (vars.length > 0) {
            log(`✏️  Actualizando variable "${flags.name}"...\n`, 'cyan');
            await client.post('/environmentVariables:update', {
                ...data,
                filterByTk: vars[0].id,
            });
            log(`✅ Variable "${flags.name}" actualizada.`, 'green');
        } else {
            log(`➕ Creando variable "${flags.name}"...\n`, 'cyan');
            if (!data.type) data.type = 'text';
            await client.post('/environmentVariables:create', data);
            log(`✅ Variable "${flags.name}" creada.`, 'green');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function deleteVar(name: string) {
    log(`🗑️  Eliminando variable "${name}"...\n`, 'cyan');

    try {
        const existing = await client.get('/environmentVariables:list', {
            filter: { name },
        });
        const vars = existing.data || [];

        if (vars.length === 0) {
            log(`  Variable "${name}" no encontrada.`, 'yellow');
            return;
        }

        await client.post('/environmentVariables:destroy', { filterByTk: vars[0].id });
        log(`✅ Variable "${name}" eliminada.`, 'green');
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
                await listVars();
                break;
            case 'get':
                if (!positional[1]) { log('❌ Falta: <nombre>', 'red'); process.exit(1); }
                await getVar(positional[1]);
                break;
            case 'set':
                await setVar(flags);
                break;
            case 'delete':
                if (!positional[1]) { log('❌ Falta: <nombre>', 'red'); process.exit(1); }
                await deleteVar(positional[1]);
                break;
            default:
                log('Uso: manage-env-vars.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list                                   Listar variables de entorno', 'gray');
                log('  get <nombre>                           Ver detalle de una variable', 'gray');
                log('  set --name n --value v [--type t]      Crear o actualizar variable', 'gray');
                log('  delete <nombre>                        Eliminar variable', 'gray');
                log('\nTipos:', 'white');
                log('  text    - Valor visible (por defecto)', 'gray');
                log('  secret  - Valor oculto (cifrado)', 'gray');
                log('\nEjemplos:', 'white');
                log('  set --name HIS_API_URL --value "https://his.hospital.cl/api"', 'gray');
                log('  set --name HIS_API_KEY --value "sk-123..." --type secret', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
