/**
 * manage-workflows.ts - Gestion de workflows NocoBase via API
 *
 * Uso:
 *   tsx shared/scripts/manage-workflows.ts list [--enabled true]
 *   tsx shared/scripts/manage-workflows.ts get <id>
 *   tsx shared/scripts/manage-workflows.ts nodes <id>           # listar nodos del workflow
 *   tsx shared/scripts/manage-workflows.ts enable <id>
 *   tsx shared/scripts/manage-workflows.ts disable <id>
 *   tsx shared/scripts/manage-workflows.ts trigger <id>         # ejecutar manualmente
 *   tsx shared/scripts/manage-workflows.ts executions <id> [--limit 10]   # ver ejecuciones
 *   tsx shared/scripts/manage-workflows.ts delete <id>
 */

import { createClient, log } from './ApiClient';

const client = createClient();

function parseArgs(args: string[]): { flags: Record<string, string>, positional: string[] } {
    const flags: Record<string, string> = {};
    const positional: string[] = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            flags[args[i].slice(2)] = args[i + 1] || '';
            i++;
        } else {
            positional.push(args[i]);
        }
    }
    return { flags, positional };
}

async function listWorkflows(flags: Record<string, string>) {
    log('📋 Workflows...\n', 'cyan');

    const params: Record<string, unknown> = { pageSize: 200, sort: ['-createdAt'] };
    if (flags.enabled !== undefined) {
        params.filter = { enabled: flags.enabled === 'true' };
    }

    const response = await client.get('/workflows:list', params);
    const workflows = response.data || [];

    if (workflows.length === 0) {
        log('Sin workflows.', 'yellow');
        return;
    }

    log(`Total: ${workflows.length} workflow(s)\n`, 'green');

    for (const wf of workflows) {
        const status = wf.enabled ? '🟢' : '🔴';
        const type = wf.type || 'N/A';
        const executed = wf.executed || 0;
        log(`  ${status} [${wf.id}] ${wf.title || '(sin titulo)'}`, 'white');
        log(`      Tipo: ${type}  |  Ejecutado: ${executed} veces  |  Habilitado: ${wf.enabled ? 'Si' : 'No'}`, 'gray');
    }
}

async function getWorkflow(id: string) {
    log(`🔍 Workflow ${id}...\n`, 'cyan');
    const response = await client.get('/workflows:get', {
        filterByTk: id,
    });
    const wf = response.data;

    log(`ID: ${wf.id}`, 'white');
    log(`Titulo: ${wf.title || 'N/A'}`, 'white');
    log(`Tipo: ${wf.type || 'N/A'}`, 'white');
    log(`Habilitado: ${wf.enabled ? 'Si' : 'No'}`, 'white');
    log(`Ejecutado: ${wf.executed || 0} veces`, 'white');
    log(`Descripcion: ${wf.description || 'N/A'}`, 'white');
    log(`\nConfiguracion:`, 'cyan');
    log(JSON.stringify(wf.config || {}, null, 2), 'gray');
}

async function listNodes(workflowId: string) {
    log(`📋 Nodos del workflow ${workflowId}...\n`, 'cyan');

    const response = await client.get('/flow_nodes:list', {
        filter: { workflowId: parseInt(workflowId) },
        sort: ['id'],
        pageSize: 200,
    });
    const nodes = response.data || [];

    if (nodes.length === 0) {
        log('Sin nodos.', 'yellow');
        return;
    }

    log(`Total: ${nodes.length} nodo(s)\n`, 'green');

    for (const node of nodes) {
        log(`  [${node.id}] ${node.title || '(sin titulo)'}`, 'white');
        log(`      Tipo: ${node.type}  |  Upstream: ${node.upstreamId || 'inicio'}`, 'gray');
    }
}

async function enableWorkflow(id: string) {
    log(`🟢 Habilitando workflow ${id}...\n`, 'cyan');
    await client.post(`/workflows:update?filterByTk=${id}`, {
        enabled: true,
    });
    log(`✅ Workflow ${id} habilitado.`, 'green');
}

async function disableWorkflow(id: string) {
    log(`🔴 Deshabilitando workflow ${id}...\n`, 'cyan');
    await client.post(`/workflows:update?filterByTk=${id}`, {
        enabled: false,
    });
    log(`✅ Workflow ${id} deshabilitado.`, 'green');
}

async function triggerWorkflow(id: string) {
    log(`▶️  Ejecutando workflow ${id}...\n`, 'cyan');
    try {
        const response = await client.post(`/workflows/${id}:trigger`, {});
        log(`✅ Workflow ${id} ejecutado.`, 'green');
        if (response.data) {
            log(JSON.stringify(response.data, null, 2), 'gray');
        }
    } catch (err: unknown) {
        // Some workflows need specific trigger conditions
        log(`⚠️  ${(err instanceof Error ? err.message : String(err))}`, 'yellow');
        log('   Nota: Algunos workflows solo se ejecutan con triggers especificos (collection event, schedule, etc.)', 'gray');
    }
}

async function listExecutions(workflowId: string, flags: Record<string, string>) {
    const limit = parseInt(flags.limit || '10');
    log(`📋 Ejecuciones del workflow ${workflowId} (ultimas ${limit})...\n`, 'cyan');

    const response = await client.get('/executions:list', {
        filter: { workflowId: parseInt(workflowId) },
        sort: ['-createdAt'],
        pageSize: limit,
    });
    const executions = response.data || [];

    if (executions.length === 0) {
        log('Sin ejecuciones.', 'yellow');
        return;
    }

    const statusMap: Record<number, string> = {
        0: '⏳ Pendiente',
        1: '✅ Completado',
        [-1]: '❌ Fallido',
        [-2]: '🚫 Cancelado',
    };

    log(`Total mostradas: ${executions.length}\n`, 'green');

    for (const exec of executions) {
        const status = statusMap[exec.status] || `? (${exec.status})`;
        const date = exec.createdAt ? new Date(exec.createdAt).toLocaleString() : 'N/A';
        log(`  [${exec.id}] ${status}`, 'white');
        log(`      Fecha: ${date}`, 'gray');
    }
}

async function deleteWorkflow(id: string) {
    log(`🗑️  Eliminando workflow ${id}...\n`, 'cyan');
    await client.post(`/workflows:destroy?filterByTk=${id}`, {});
    log(`✅ Workflow ${id} eliminado.`, 'green');
}

async function main() {
    const args = process.argv.slice(2);
    const { flags, positional } = parseArgs(args);
    const command = positional[0];

    try {
        switch (command) {
            case 'list':
                await listWorkflows(flags);
                break;
            case 'get':
                if (!positional[1]) { log('❌ Uso: get <id>', 'red'); process.exit(1); }
                await getWorkflow(positional[1]);
                break;
            case 'nodes':
                if (!positional[1]) { log('❌ Uso: nodes <workflowId>', 'red'); process.exit(1); }
                await listNodes(positional[1]);
                break;
            case 'enable':
                if (!positional[1]) { log('❌ Uso: enable <id>', 'red'); process.exit(1); }
                await enableWorkflow(positional[1]);
                break;
            case 'disable':
                if (!positional[1]) { log('❌ Uso: disable <id>', 'red'); process.exit(1); }
                await disableWorkflow(positional[1]);
                break;
            case 'trigger':
                if (!positional[1]) { log('❌ Uso: trigger <id>', 'red'); process.exit(1); }
                await triggerWorkflow(positional[1]);
                break;
            case 'executions':
                if (!positional[1]) { log('❌ Uso: executions <workflowId> [--limit 10]', 'red'); process.exit(1); }
                await listExecutions(positional[1], flags);
                break;
            case 'delete':
                if (!positional[1]) { log('❌ Uso: delete <id>', 'red'); process.exit(1); }
                await deleteWorkflow(positional[1]);
                break;
            default:
                log('Uso: manage-workflows.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list [--enabled true]              Listar workflows', 'gray');
                log('  get <id>                           Detalle del workflow', 'gray');
                log('  nodes <id>                         Listar nodos', 'gray');
                log('  enable <id>                        Habilitar workflow', 'gray');
                log('  disable <id>                       Deshabilitar workflow', 'gray');
                log('  trigger <id>                       Ejecutar manualmente', 'gray');
                log('  executions <id> [--limit 10]       Ver ejecuciones', 'gray');
                log('  delete <id>                        Eliminar workflow', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
