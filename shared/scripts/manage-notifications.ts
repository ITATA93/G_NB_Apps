/**
 * manage-notifications.ts - Gestión de notificaciones NocoBase via API
 *
 * Usa los plugins: notification-manager, notification-in-app-message
 *
 * Uso:
 *   tsx shared/scripts/manage-notifications.ts channels                # listar canales
 *   tsx shared/scripts/manage-notifications.ts channel-get <id>        # detalle de canal
 *   tsx shared/scripts/manage-notifications.ts channel-create --name n --type t  # crear canal
 *   tsx shared/scripts/manage-notifications.ts channel-update <id> --title t     # actualizar
 *   tsx shared/scripts/manage-notifications.ts channel-delete <id>     # eliminar canal
 *   tsx shared/scripts/manage-notifications.ts send --channel c --to email --subject s --body b  # enviar
 *   tsx shared/scripts/manage-notifications.ts logs [--limit 20]       # ver logs de envío
 *   tsx shared/scripts/manage-notifications.ts messages [--limit 20]   # mensajes in-app del usuario
 *   tsx shared/scripts/manage-notifications.ts read <id>               # marcar mensaje como leído
 *   tsx shared/scripts/manage-notifications.ts read-all                # marcar todos como leídos
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

const channelTypeMap: Record<string, string> = {
    'email': 'Correo electrónico',
    'in-app-message': 'Mensaje in-app',
    'sms': 'SMS',
};

async function listChannels() {
    log('📢 Listando canales de notificación...\n', 'cyan');
    try {
        const response = await client.get('/notificationChannels:list', { pageSize: 100 });
        const channels = response.data || [];

        if (channels.length === 0) {
            log('  No hay canales configurados.', 'yellow');
            log('  Crea uno con: manage-notifications.ts channel-create --name "email" --type email', 'gray');
            return;
        }

        const enabled = channels.filter((c: Record<string, unknown>) => c.enabled !== false);
        const disabled = channels.filter((c: Record<string, unknown>) => c.enabled === false);

        log(`  Total: ${channels.length} canal(es)  |  ✅ ${enabled.length} habilitados  |  ❌ ${disabled.length} deshabilitados\n`, 'green');

        for (const ch of channels) {
            const status = ch.enabled !== false ? '✅' : '❌';
            const tipo = channelTypeMap[ch.notificationType] || ch.notificationType || 'N/A';
            log(`  ${status} [${ch.id}] ${ch.title || ch.name}`, 'white');
            log(`      Nombre: ${ch.name}  |  Tipo: ${tipo}`, 'gray');
            if (ch.description) log(`      Desc: ${ch.description}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function getChannel(id: string) {
    log(`📢 Detalle del canal ${id}...\n`, 'cyan');
    try {
        const response = await client.get(`/notificationChannels:get`, { filterByTk: id });
        const ch = response.data || response;
        log(JSON.stringify(ch, null, 2), 'white');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function createChannel(flags: Record<string, string>) {
    if (!flags.name || !flags.type) {
        log('❌ Parámetros requeridos: --name <nombre> --type <tipo>', 'red');
        log('   Tipos: email, in-app-message, sms', 'gray');
        process.exit(1);
    }

    log('➕ Creando canal de notificación...\n', 'cyan');

    const data: Record<string, unknown> = {
        name: flags.name,
        notificationType: flags.type,
        title: flags.title || flags.name,
        enabled: true,
    };

    if (flags.description) data.description = flags.description;
    if (flags.options) data.options = JSON.parse(flags.options);

    try {
        const response = await client.post('/notificationChannels:create', data);
        const ch = response.data || response;
        log(`✅ Canal creado: [${ch.id}] ${ch.title || ch.name}`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function updateChannel(id: string, flags: Record<string, string>) {
    const data: Record<string, unknown> = {};
    if (flags.title) data.title = flags.title;
    if (flags.name) data.name = flags.name;
    if (flags.description) data.description = flags.description;
    if (flags.enabled !== undefined) data.enabled = flags.enabled === 'true';

    if (Object.keys(data).length === 0) {
        log('❌ Proporciona al menos un campo: --title, --name, --description, --enabled', 'red');
        process.exit(1);
    }

    log(`✏️  Actualizando canal ${id}...\n`, 'cyan');
    try {
        await client.post(`/notificationChannels:update`, { ...data, filterByTk: id });
        log('✅ Canal actualizado.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function deleteChannel(id: string) {
    log(`🗑️  Eliminando canal ${id}...\n`, 'cyan');
    try {
        await client.post(`/notificationChannels:destroy`, { filterByTk: id });
        log('✅ Canal eliminado.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function sendNotification(flags: Record<string, string>) {
    if (!flags.channel) {
        log('❌ Parámetro requerido: --channel <nombre_canal>', 'red');
        log('   Opciones: --to <email> --subject <asunto> --body <cuerpo>', 'gray');
        process.exit(1);
    }

    log('📨 Enviando notificación...\n', 'cyan');

    const receivers: Record<string, unknown> = {};
    const message: Record<string, unknown> = {};

    if (flags.to) {
        receivers.to = flags.to.split(',');
        if (flags.cc) receivers.cc = flags.cc.split(',');
    }

    if (flags.subject) message.subject = flags.subject;
    if (flags.body) message.html = flags.body;
    if (flags.content) message.content = flags.content;

    const data: Record<string, unknown> = {
        channelName: flags.channel,
        receivers,
        message,
    };

    try {
        const response = await client.post('/notifications:send', data);
        log(`✅ Notificación enviada: ${JSON.stringify(response.data || response)}`, 'green');
    } catch (error: unknown) {
        log(`❌ Error enviando: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function listLogs(limit: string) {
    const pageSize = parseInt(limit) || 20;
    log(`📋 Últimos ${pageSize} logs de notificación...\n`, 'cyan');
    try {
        const response = await client.get('/notificationSendLogs:list', {
            pageSize,
            sort: ['-createdAt'],
        });
        const raw = response.data || response;
        const logs_data = Array.isArray(raw) ? raw : (raw.data || raw.rows || []);

        if (!Array.isArray(logs_data) || logs_data.length === 0) {
            log('  Sin logs de envío.', 'yellow');
            return;
        }

        log(`  Total en página: ${logs_data.length}\n`, 'green');
        for (const l of logs_data) {
            const status = l.state === 'success' ? '✅' : l.state === 'failed' ? '❌' : '⏳';
            const fecha = l.createdAt ? new Date(l.createdAt).toLocaleString('es-CL') : 'N/A';
            log(`  ${status} [${l.id}] Canal: ${l.channelName || 'N/A'}  |  Estado: ${l.state || 'N/A'}`, 'white');
            log(`      Receptor: ${l.receiver || 'N/A'}  |  Fecha: ${fecha}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function listMessages(limit: string) {
    const pageSize = parseInt(limit) || 20;
    log(`💬 Mensajes in-app del usuario actual...\n`, 'cyan');
    try {
        const response = await client.get('/myInAppMessages:list', {
            pageSize,
            sort: ['-createdAt'],
        });
        const raw = response.data || response;
        const messages = Array.isArray(raw) ? raw : (raw.data || raw.rows || []);

        if (!Array.isArray(messages) || messages.length === 0) {
            log('  Sin mensajes.', 'yellow');
            return;
        }

        log(`  Total en página: ${messages.length}\n`, 'green');
        for (const m of messages) {
            const read = m.read ? '📖' : '📩';
            const fecha = m.createdAt ? new Date(m.createdAt).toLocaleString('es-CL') : 'N/A';
            log(`  ${read} [${m.id}] ${m.title || '(sin título)'}`, 'white');
            log(`      Fecha: ${fecha}  |  Leído: ${m.read ? 'Sí' : 'No'}`, 'gray');
            if (m.content) log(`      Contenido: ${m.content.slice(0, 100)}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function markAsRead(id: string) {
    log(`📖 Marcando mensaje ${id} como leído...\n`, 'cyan');
    try {
        await client.post(`/myInAppMessages:update`, { filterByTk: id, read: true });
        log('✅ Mensaje marcado como leído.', 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function markAllAsRead() {
    log('📖 Marcando todos los mensajes como leídos...\n', 'cyan');
    try {
        await client.post('/myInAppMessages:update', { filter: { read: false }, read: true });
        log('✅ Todos los mensajes marcados como leídos.', 'green');
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
            case 'channels':
                await listChannels();
                break;
            case 'channel-get':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await getChannel(positional[1]);
                break;
            case 'channel-create':
                await createChannel(flags);
                break;
            case 'channel-update':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await updateChannel(positional[1], flags);
                break;
            case 'channel-delete':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await deleteChannel(positional[1]);
                break;
            case 'send':
                await sendNotification(flags);
                break;
            case 'logs':
                await listLogs(flags.limit || '20');
                break;
            case 'messages':
                await listMessages(flags.limit || '20');
                break;
            case 'read':
                if (!positional[1]) { log('❌ Falta: <id>', 'red'); process.exit(1); }
                await markAsRead(positional[1]);
                break;
            case 'read-all':
                await markAllAsRead();
                break;
            default:
                log('Uso: manage-notifications.ts <comando> [opciones]\n', 'cyan');
                log('Comandos de Canales:', 'white');
                log('  channels                               Listar canales de notificación', 'gray');
                log('  channel-get <id>                       Detalle de un canal', 'gray');
                log('  channel-create --name n --type t       Crear canal (email, in-app-message, sms)', 'gray');
                log('  channel-update <id> --title t          Actualizar canal', 'gray');
                log('  channel-delete <id>                    Eliminar canal', 'gray');
                log('\nComandos de Envío:', 'white');
                log('  send --channel c --to e --subject s --body b  Enviar notificación', 'gray');
                log('  logs [--limit 20]                      Ver logs de envío', 'gray');
                log('\nMensajes In-App:', 'white');
                log('  messages [--limit 20]                  Ver mensajes del usuario', 'gray');
                log('  read <id>                              Marcar mensaje como leído', 'gray');
                log('  read-all                               Marcar todos como leídos', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
