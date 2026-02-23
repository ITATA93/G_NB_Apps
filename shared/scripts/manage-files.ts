/**
 * manage-files.ts - Gestión de archivos y attachments NocoBase via API
 *
 * Uso:
 *   tsx shared/scripts/manage-files.ts list                       # listar archivos
 *   tsx shared/scripts/manage-files.ts list --collection storages  # listar storages configurados
 *   tsx shared/scripts/manage-files.ts get <id>                   # detalle de un archivo
 *   tsx shared/scripts/manage-files.ts upload --file ./mi-archivo.pdf  # subir archivo
 *   tsx shared/scripts/manage-files.ts upload --file ./foto.jpg --storage local  # subir a storage específico
 *   tsx shared/scripts/manage-files.ts delete <id>                # eliminar archivo
 *   tsx shared/scripts/manage-files.ts storages                   # listar storages configurados
 *   tsx shared/scripts/manage-files.ts storage-get <id>           # detalle de un storage
 *   tsx shared/scripts/manage-files.ts stats                      # estadísticas de archivos
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
    if (!bytes || bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleString('es-CL', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    } catch {
        return dateStr;
    }
}

const MIME_ICONS: Record<string, string> = {
    'image': '🖼️ ',
    'application/pdf': '📄',
    'application/json': '📋',
    'text': '📝',
    'video': '🎥',
    'audio': '🎵',
    'application/zip': '📦',
    'application/x-rar': '📦',
    'application/vnd.ms-excel': '📊',
    'application/vnd.openxmlformats-officedocument.spreadsheetml': '📊',
    'application/msword': '📝',
    'application/vnd.openxmlformats-officedocument.wordprocessingml': '📝',
};

function getMimeIcon(mime: string): string {
    if (!mime) return '📎';
    for (const [key, icon] of Object.entries(MIME_ICONS)) {
        if (mime.startsWith(key)) return icon;
    }
    return '📎';
}

async function listFiles(flags: Record<string, string>) {
    log('📁 Listando archivos...\n', 'cyan');

    const params: Record<string, unknown> = {
        pageSize: parseInt(flags.limit || '50'),
        sort: ['-createdAt']
    };

    if (flags.type) {
        params.filter = { mimetype: { $includes: flags.type } };
    }

    try {
        const response = await client.get('/attachments:list', params);
        const files = response.data || [];
        const meta = response.meta || {};

        if (files.length === 0) {
            log('  No se encontraron archivos.', 'yellow');
            return;
        }

        log(`  Total: ${meta.count || files.length} archivo(s)  |  Mostrando: ${files.length}\n`, 'green');

        for (const f of files) {
            const icon = getMimeIcon(f.mimetype);
            const size = formatSize(f.size);
            const date = f.createdAt ? formatDate(f.createdAt) : 'N/A';

            log(`  ${icon} [${f.id}] ${f.title || f.filename || 'Sin nombre'}`, 'white');
            log(`      Archivo: ${f.filename || 'N/A'}  |  Tipo: ${f.mimetype || 'N/A'}  |  Tamaño: ${size}`, 'gray');
            log(`      Fecha: ${date}  |  Storage: ${f.storageId || 'default'}`, 'gray');
            if (f.url) log(`      URL: ${f.url}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error listando archivos: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function getFile(id: string) {
    log(`🔍 Obteniendo archivo ${id}...\n`, 'cyan');

    try {
        const response = await client.get('/attachments:get', {
            filterByTk: id
        });
        const file = response.data;

        if (!file) {
            log(`❌ Archivo ${id} no encontrado.`, 'red');
            return;
        }

        const icon = getMimeIcon(file.mimetype);
        log(`  ${icon} Archivo: ${file.title || file.filename || 'Sin nombre'}`, 'white');
        log(`  ID:        ${file.id}`, 'gray');
        log(`  Filename:  ${file.filename || 'N/A'}`, 'gray');
        log(`  Tipo MIME: ${file.mimetype || 'N/A'}`, 'gray');
        log(`  Tamaño:    ${formatSize(file.size)}`, 'gray');
        log(`  Storage:   ${file.storageId || 'default'}`, 'gray');
        log(`  Creado:    ${file.createdAt ? formatDate(file.createdAt) : 'N/A'}`, 'gray');
        if (file.url) log(`  URL:       ${file.url}`, 'gray');
        if (file.path) log(`  Path:      ${file.path}`, 'gray');

        log('\n  Respuesta completa:', 'white');
        log(JSON.stringify(file, null, 2), 'gray');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function uploadFile(flags: Record<string, string>) {
    const filePath = flags.file;
    if (!filePath) {
        log('❌ Se requiere --file <ruta_archivo>', 'red');
        process.exit(1);
    }

    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
        log(`❌ Archivo no encontrado: ${resolvedPath}`, 'red');
        process.exit(1);
    }

    const filename = path.basename(resolvedPath);
    const stat = fs.statSync(resolvedPath);

    log(`📤 Subiendo archivo: ${filename} (${formatSize(stat.size)})...\n`, 'cyan');

    try {
        const FormData = (await import('form-data')).default;
        const formData = new FormData();
        formData.append('file', fs.createReadStream(resolvedPath));

        if (flags.storage) {
            formData.append('storageId', flags.storage);
        }

        const axiosClient = client.getClient();
        const response = await axiosClient.post('/attachments:create', formData, {
            headers: {
                ...formData.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        const result = response.data?.data || response.data;
        log(`✅ Archivo subido exitosamente.`, 'green');
        if (result?.id) log(`  ID: ${result.id}`, 'gray');
        if (result?.url) log(`  URL: ${result.url}`, 'gray');
        if (result?.filename) log(`  Nombre: ${result.filename}`, 'gray');
    } catch (error: unknown) {
        log(`❌ Error subiendo archivo: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        log('  Nota: Puede requerir el paquete "form-data" instalado.', 'yellow');
        log('  Instalar con: npm install form-data', 'gray');
    }
}

async function deleteFile(id: string) {
    log(`🗑️  Eliminando archivo ${id}...\n`, 'cyan');

    try {
        await client.post('/attachments:destroy', { filterByTk: id });
        log(`✅ Archivo ${id} eliminado.`, 'green');
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function listStorages() {
    log('💾 Listando storages configurados...\n', 'cyan');

    try {
        const response = await client.get('/storages:list', { pageSize: 50 });
        const storages = response.data || [];

        if (storages.length === 0) {
            log('  No se encontraron storages.', 'yellow');
            return;
        }

        log(`  Total: ${storages.length} storage(s)\n`, 'green');

        for (const s of storages) {
            const isDefault = s.default ? ' ⭐ DEFAULT' : '';
            const status = s.default ? '✅' : '📦';
            log(`  ${status} [${s.id}] ${s.title || s.name || 'Sin nombre'}${isDefault}`, 'white');
            log(`      Tipo: ${s.type || 'N/A'}  |  Nombre: ${s.name || 'N/A'}`, 'gray');
            if (s.baseUrl) log(`      Base URL: ${s.baseUrl}`, 'gray');
            if (s.path) log(`      Path: ${s.path}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        log('  Nota: El plugin de File Storage debe estar habilitado.', 'yellow');
    }
}

async function getStorage(id: string) {
    log(`🔍 Obteniendo storage ${id}...\n`, 'cyan');

    try {
        const response = await client.get('/storages:get', {
            filterByTk: id
        });
        const storage = response.data;

        if (!storage) {
            log(`❌ Storage ${id} no encontrado.`, 'red');
            return;
        }

        log(`  Storage: ${storage.title || storage.name || 'Sin nombre'}`, 'white');
        log(`  ID:      ${storage.id}`, 'gray');
        log(`  Tipo:    ${storage.type || 'N/A'}`, 'gray');
        log(`  Nombre:  ${storage.name || 'N/A'}`, 'gray');
        log(`  Default: ${storage.default ? 'Sí ⭐' : 'No'}`, 'gray');
        if (storage.baseUrl) log(`  Base URL: ${storage.baseUrl}`, 'gray');
        if (storage.path) log(`  Path:     ${storage.path}`, 'gray');

        // Hide sensitive options
        if (storage.options) {
            const safeOpts = { ...storage.options };
            if (safeOpts.accessKeyId) safeOpts.accessKeyId = '***' + safeOpts.accessKeyId.slice(-4);
            if (safeOpts.secretAccessKey) safeOpts.secretAccessKey = '***';
            log('\n  Opciones:', 'white');
            log(JSON.stringify(safeOpts, null, 2), 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
    }
}

async function fileStats() {
    log('📊 Estadísticas de archivos...\n', 'cyan');

    try {
        const response = await client.get('/attachments:list', {
            pageSize: 200,
            sort: ['-createdAt']
        });
        const files = response.data || [];
        const meta = response.meta || {};

        const totalCount = meta.count || files.length;
        const totalSize = files.reduce((sum: number, f: Record<string, unknown>) => sum + ((f.size as number) || 0), 0);

        // Group by MIME type
        const byType: Record<string, { count: number; size: number }> = {};
        for (const f of files) {
            const type = f.mimetype?.split('/')[0] || 'desconocido';
            if (!byType[type]) byType[type] = { count: 0, size: 0 };
            byType[type].count++;
            byType[type].size += f.size || 0;
        }

        log(`  Total archivos: ${totalCount}`, 'white');
        log(`  Tamaño total:   ${formatSize(totalSize)}`, 'white');

        log('\n  Por tipo:', 'white');
        for (const [type, data] of Object.entries(byType).sort((a, b) => b[1].count - a[1].count)) {
            log(`    ${type.padEnd(15)} ${String(data.count).padStart(4)} archivo(s)  |  ${formatSize(data.size)}`, 'gray');
        }

        // Recent files
        if (files.length > 0) {
            log('\n  Últimos 5 archivos:', 'white');
            for (const f of files.slice(0, 5)) {
                const icon = getMimeIcon(f.mimetype);
                const date = f.createdAt ? formatDate(f.createdAt) : 'N/A';
                log(`    ${icon} ${f.filename || 'N/A'} (${formatSize(f.size)}) - ${date}`, 'gray');
            }
        }
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
                await listFiles(flags);
                break;
            case 'get':
                if (!positional[1]) { log('❌ Uso: get <id>', 'red'); process.exit(1); }
                await getFile(positional[1]);
                break;
            case 'upload':
                await uploadFile(flags);
                break;
            case 'delete':
                if (!positional[1]) { log('❌ Uso: delete <id>', 'red'); process.exit(1); }
                await deleteFile(positional[1]);
                break;
            case 'storages':
                await listStorages();
                break;
            case 'storage-get':
                if (!positional[1]) { log('❌ Uso: storage-get <id>', 'red'); process.exit(1); }
                await getStorage(positional[1]);
                break;
            case 'stats':
                await fileStats();
                break;
            default:
                log('Uso: manage-files.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  list [--type image] [--limit 50]  Listar archivos', 'gray');
                log('  get <id>                          Detalle de un archivo', 'gray');
                log('  upload --file ./archivo.pdf       Subir archivo', 'gray');
                log('  delete <id>                       Eliminar archivo', 'gray');
                log('  storages                          Listar storages configurados', 'gray');
                log('  storage-get <id>                  Detalle de un storage', 'gray');
                log('  stats                             Estadísticas de archivos', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
