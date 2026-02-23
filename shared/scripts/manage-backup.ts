/**
 * manage-backup.ts - Gestión de backups NocoBase via API
 *
 * Uso:
 *   tsx shared/scripts/manage-backup.ts list                      # listar backups existentes
 *   tsx shared/scripts/manage-backup.ts create                    # crear nuevo backup
 *   tsx shared/scripts/manage-backup.ts create --name "pre-deploy" # backup con nombre descriptivo
 *   tsx shared/scripts/manage-backup.ts download <id>             # descargar backup
 *   tsx shared/scripts/manage-backup.ts restore <id>              # restaurar backup
 *   tsx shared/scripts/manage-backup.ts delete <id>               # eliminar backup
 *   tsx shared/scripts/manage-backup.ts status                    # estado del sistema de backup
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

function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDate(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleString('es-CL', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    } catch {
        return dateStr;
    }
}

async function listBackups() {
    log('💾 Listando backups...\n', 'cyan');

    try {
        const response = await client.get('/backupFiles:list', {
            sort: ['-createdAt'],
            pageSize: 50
        });
        const backups = response.data || [];

        if (backups.length === 0) {
            log('  No se encontraron backups.', 'yellow');
            log('  Usa "create" para crear uno nuevo.', 'gray');
            return;
        }

        log(`  Total: ${backups.length} backup(s)\n`, 'green');

        for (const b of backups) {
            const statusMap: Record<string, string> = {
                ok: '✅',
                succeed: '✅',
                failed: '❌',
                in_progress: '⏳',
                pending: '🕐',
            };
            const status = statusMap[b.status] || '❓';
            const size = b.fileSize ? formatSize(b.fileSize) : 'N/A';
            const date = b.createdAt ? formatDate(b.createdAt) : 'N/A';
            const name = b.name || b.id || 'Sin nombre';

            log(`  ${status} [${b.id}] ${name}`, 'white');
            log(`      Fecha: ${date}  |  Tamaño: ${size}  |  Estado: ${b.status || 'N/A'}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error listando backups: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        log('  Nota: El plugin de Backup & Restore debe estar habilitado.', 'yellow');
        log('  Verifica con: manage-plugins.ts get backup-restore', 'gray');
    }
}

async function createBackup(flags: Record<string, string>) {
    const name = flags.name || `backup-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}`;

    log(`💾 Creando backup "${name}"...\n`, 'cyan');
    log('  ⏳ Esto puede tomar unos minutos dependiendo del tamaño de la BD.', 'yellow');

    try {
        const response = await client.post('/backupFiles:create', {});
        const backup = response.data;

        if (backup) {
            log(`\n✅ Backup creado exitosamente.`, 'green');
            log(`  ID: ${backup.id || 'N/A'}`, 'gray');
            log(`  Estado: ${backup.status || 'N/A'}`, 'gray');
            if (backup.fileSize) log(`  Tamaño: ${formatSize(backup.fileSize)}`, 'gray');
        } else {
            log(`\n✅ Backup solicitado. Verifica el estado con "list".`, 'green');
        }
    } catch (error: unknown) {
        log(`❌ Error creando backup: ${(error instanceof Error ? error.message : String(error))}`, 'red');

        // Try alternative endpoint
        try {
            await client.post('/backup:run', {});
            log(`✅ Backup solicitado via endpoint alternativo.`, 'green');
        } catch {
            log('  Nota: El plugin de Backup & Restore debe estar habilitado.', 'yellow');
        }
    }
}

async function downloadBackup(id: string) {
    log(`⬇️  Descargando backup ${id}...\n`, 'cyan');

    try {
        const axiosClient = client.getClient();
        const response = await axiosClient.get(`/backupFiles:download/${id}`, {
            responseType: 'arraybuffer'
        });

        const filename = `backup-${id}-${Date.now()}.nbdata`;
        const outputPath = path.resolve(process.cwd(), filename);

        fs.writeFileSync(outputPath, response.data);
        log(`✅ Backup descargado: ${outputPath}`, 'green');
        log(`  Tamaño: ${formatSize(response.data.length)}`, 'gray');
    } catch (error: unknown) {
        log(`❌ Error descargando backup: ${(error instanceof Error ? error.message : String(error))}`, 'red');

        // Try alternative
        try {
            const url = `${client.getBaseUrl()}/backupFiles/${id}:download`;
            log(`  Intenta descargarlo manualmente desde: ${url}`, 'yellow');
        } catch {
            // ignore
        }
    }
}

async function restoreBackup(id: string) {
    log(`🔄 Restaurando backup ${id}...\n`, 'cyan');
    log('  ⚠️  ADVERTENCIA: Esto restaurará la base de datos al estado del backup.', 'red');
    log('  ⚠️  Los datos actuales pueden ser sobreescritos.', 'red');
    log('  ⏳ Procediendo con la restauración...', 'yellow');

    try {
        const response = await client.post(`/backupFiles:restore`, {
            filterByTk: id
        });
        log(`\n✅ Backup ${id} restaurado exitosamente.`, 'green');
        if (response.data) {
            log(JSON.stringify(response.data, null, 2), 'gray');
        }
        log('\n  ⚠️  Puede requerir reinicio del servidor.', 'yellow');
    } catch (error: unknown) {
        log(`❌ Error restaurando backup: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function deleteBackup(id: string) {
    log(`🗑️  Eliminando backup ${id}...\n`, 'cyan');

    try {
        await client.post('/backupFiles:destroy', { filterByTk: id });
        log(`✅ Backup ${id} eliminado.`, 'green');
    } catch (error: unknown) {
        log(`❌ Error eliminando backup: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function backupStatus() {
    log('📊 Estado del sistema de backup...\n', 'cyan');

    // Check if backup plugin is enabled
    try {
        const pluginResponse = await client.get('/applicationPlugins:list', {
            filter: { name: { $like: '%backup%' } },
            pageSize: 10
        });
        const plugins = pluginResponse.data || [];
        const backupPlugin = plugins.find((p: Record<string, unknown>) =>
            p.name?.includes('backup') || p.packageName?.includes('backup')
        );

        if (backupPlugin) {
            const status = backupPlugin.enabled ? '✅ Habilitado' : '❌ Deshabilitado';
            log(`  Plugin Backup: ${status}`, backupPlugin.enabled ? 'green' : 'red');
            log(`    Nombre: ${backupPlugin.name}`, 'gray');
            log(`    Versión: ${backupPlugin.version || 'N/A'}`, 'gray');
        } else {
            log('  ⚠️  Plugin de backup no encontrado.', 'yellow');
        }
    } catch {
        log('  ⚠️  No se pudo verificar el plugin de backup.', 'yellow');
    }

    // List backups summary
    try {
        const response = await client.get('/backupFiles:list', {
            sort: ['-createdAt'],
            pageSize: 5
        });
        const backups = response.data || [];

        log(`\n  Backups recientes: ${backups.length}`, 'white');

        if (backups.length > 0) {
            const latest = backups[0];
            log(`  Último backup:`, 'white');
            log(`    Fecha: ${latest.createdAt ? formatDate(latest.createdAt) : 'N/A'}`, 'gray');
            log(`    Estado: ${latest.status || 'N/A'}`, 'gray');
            log(`    Tamaño: ${latest.fileSize ? formatSize(latest.fileSize) : 'N/A'}`, 'gray');

            const totalSize = backups.reduce((sum: number, b: Record<string, unknown>) => sum + ((b.fileSize as number) || 0), 0);
            log(`\n  Espacio total usado: ${formatSize(totalSize)}`, 'gray');
        }
    } catch {
        log('  ⚠️  No se pudo obtener información de backups.', 'yellow');
    }
}

async function main() {
    const args = process.argv.slice(2);
    const { flags, positional } = parseArgs(args);
    const command = positional[0];

    try {
        switch (command) {
            case 'list':
                await listBackups();
                break;
            case 'create':
                await createBackup(flags);
                break;
            case 'download':
                if (!positional[1]) { log('❌ Uso: download <id>', 'red'); process.exit(1); }
                await downloadBackup(positional[1]);
                break;
            case 'restore':
                if (!positional[1]) { log('❌ Uso: restore <id>', 'red'); process.exit(1); }
                await restoreBackup(positional[1]);
                break;
            case 'delete':
                if (!positional[1]) { log('❌ Uso: delete <id>', 'red'); process.exit(1); }
                await deleteBackup(positional[1]);
                break;
            case 'status':
                await backupStatus();
                break;
            default:
                log('Uso: manage-backup.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list                          Listar backups existentes', 'gray');
                log('  create [--name "desc"]        Crear nuevo backup', 'gray');
                log('  download <id>                 Descargar backup', 'gray');
                log('  restore <id>                  Restaurar backup (⚠️  sobreescribe datos)', 'gray');
                log('  delete <id>                   Eliminar backup', 'gray');
                log('  status                        Estado del sistema de backup', 'gray');
                log('\nRequisitos:', 'white');
                log('  Plugin "backup-restore" debe estar habilitado.', 'gray');
                log('  Verificar con: manage-plugins.ts search backup', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
