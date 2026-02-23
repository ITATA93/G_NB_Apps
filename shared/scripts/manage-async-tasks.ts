/**
 * manage-async-tasks.ts - Gestión de tareas asíncronas NocoBase via API
 *
 * Usa el plugin: async-task-manager
 *
 * Uso:
 *   tsx shared/scripts/manage-async-tasks.ts list [--status pending|running|completed|failed]
 *   tsx shared/scripts/manage-async-tasks.ts get <id>                  # detalle de una tarea
 *   tsx shared/scripts/manage-async-tasks.ts cancel <id>               # cancelar tarea
 *   tsx shared/scripts/manage-async-tasks.ts clean [--before YYYY-MM-DD]  # limpiar tareas antiguas
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

const statusIcons: Record<string, string> = {
    pending: '⏳',
    running: '🔄',
    completed: '✅',
    failed: '❌',
    cancelled: '🚫',
};

async function listTasks(flags: Record<string, string>) {
    log('📋 Tareas asíncronas...\n', 'cyan');

    const params: Record<string, unknown> = {
        pageSize: parseInt(flags.limit || '20'),
        sort: ['-createdAt'],
    };

    if (flags.status) {
        params.filter = { status: flags.status };
    }

    try {
        const response = await client.get('/asyncTasks:list', params);
        const tasks = response.data || [];
        const meta = response.meta || {};

        if (tasks.length === 0) {
            log('  Sin tareas asíncronas.', 'yellow');
            return;
        }

        log(`  Total: ${meta.count || tasks.length} tarea(s)\n`, 'green');

        for (const task of tasks) {
            const icon = statusIcons[task.status] || '❓';
            const fecha = task.createdAt ? new Date(task.createdAt).toLocaleString('es-CL') : 'N/A';
            const progress = task.progress != null ? ` ${task.progress}%` : '';

            log(`  ${icon} [${task.id}] ${task.title || task.taskType || 'Tarea'}${progress}`, 'white');
            log(`      Estado: ${task.status}  |  Tipo: ${task.taskType || 'N/A'}  |  Fecha: ${fecha}`, 'gray');
            if (task.error) log(`      Error: ${task.error}`, 'red');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function getTask(id: string) {
    log(`📋 Detalle de tarea ${id}...\n`, 'cyan');

    try {
        const response = await client.get('/asyncTasks:get', { filterByTk: id });
        const task = response.data || response;

        const icon = statusIcons[task.status] || '❓';
        log(`  ${icon} ${task.title || task.taskType || 'Tarea'}`, 'white');
        log(`  Estado:    ${task.status}`, 'gray');
        log(`  Tipo:      ${task.taskType || 'N/A'}`, 'gray');
        if (task.progress != null) log(`  Progreso:  ${task.progress}%`, 'gray');
        if (task.createdAt) log(`  Creada:    ${new Date(task.createdAt).toLocaleString('es-CL')}`, 'gray');
        if (task.updatedAt) log(`  Actualizada: ${new Date(task.updatedAt).toLocaleString('es-CL')}`, 'gray');
        if (task.error) log(`  Error:     ${task.error}`, 'red');

        if (task.result) {
            log('\n  Resultado:', 'white');
            log(JSON.stringify(task.result, null, 2), 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function cancelTask(id: string) {
    log(`🚫 Cancelando tarea ${id}...\n`, 'cyan');

    try {
        await client.post('/asyncTasks:cancel', { filterByTk: id });
        log('✅ Tarea cancelada.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function cleanTasks(flags: Record<string, string>) {
    log('🧹 Limpiando tareas completadas/fallidas...\n', 'cyan');

    try {
        const filter: Record<string, unknown> = {
            status: { $in: ['completed', 'failed', 'cancelled'] },
        };

        if (flags.before) {
            filter.createdAt = { $lt: flags.before };
            log(`  Antes de: ${flags.before}`, 'gray');
        }

        const response = await client.get('/asyncTasks:list', {
            filter,
            pageSize: 200,
        });
        const tasks = response.data || [];

        if (tasks.length === 0) {
            log('  Sin tareas para limpiar.', 'yellow');
            return;
        }

        log(`  Tareas a eliminar: ${tasks.length}`, 'gray');

        for (const task of tasks) {
            try {
                await client.post('/asyncTasks:destroy', { filterByTk: task.id });
            } catch {
                // ignore individual errors
            }
        }

        log(`✅ ${tasks.length} tarea(s) eliminada(s).`, 'green');
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
                await listTasks(flags);
                break;
            case 'get':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await getTask(positional[1]);
                break;
            case 'cancel':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await cancelTask(positional[1]);
                break;
            case 'clean':
                await cleanTasks(flags);
                break;
            default:
                log('Uso: manage-async-tasks.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list [--status s] [--limit n]          Listar tareas', 'gray');
                log('  get <id>                               Detalle de una tarea', 'gray');
                log('  cancel <id>                            Cancelar tarea en ejecución', 'gray');
                log('  clean [--before YYYY-MM-DD]            Eliminar tareas terminadas', 'gray');
                log('\nEstados posibles:', 'white');
                log('  pending, running, completed, failed, cancelled', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
