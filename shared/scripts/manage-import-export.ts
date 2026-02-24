/**
 * manage-import-export.ts - Importar y exportar datos de colecciones NocoBase via API
 *
 * Usa los plugins: action-import, action-export
 *
 * Uso:
 *   tsx shared/scripts/manage-import-export.ts export <coleccion> [--format csv|xlsx] [--file salida]
 *   tsx shared/scripts/manage-import-export.ts import <coleccion> --file datos.xlsx
 *   tsx shared/scripts/manage-import-export.ts template <coleccion> [--file plantilla.xlsx]
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

async function exportCollection(collection: string, flags: Record<string, string>) {
    log(`📤 Exportando colección "${collection}"...\n`, 'cyan');

    // Get fields to export
    try {
        const fieldsResp = await client.get(`/collections/${collection}/fields:list`, {
            paginate: false,
        });
        const fields = (fieldsResp.data || []).filter((f: Record<string, unknown>) =>
            !['password', 'sort'].includes(String(f.type)) &&
            !['createdBy', 'updatedBy'].includes(String(f.interface))
        );

        const columns = fields.map((f: Record<string, unknown>) => ({
            dataIndex: [f.name],
            title: f.title || f.name,
        }));

        log(`  Campos a exportar: ${columns.length}`, 'gray');
        log(`  Campos: ${columns.map((c: { dataIndex: unknown[] }) => c.dataIndex[0]).join(', ')}`, 'gray');

        // Use the export API
        const axiosClient = client.getClient();
        const response = await axiosClient.post(
            `${client.getBaseUrl()}/${collection}:export`,
            { columns },
            {
                responseType: 'arraybuffer',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const format = flags.format || 'xlsx';
        const filename = flags.file || `${collection}_export_${new Date().toISOString().split('T')[0]}.${format}`;
        const filepath = path.resolve(filename);

        writeFileSync(filepath, Buffer.from(response.data));
        log(`\n✅ Exportado: ${filepath}`, 'green');
        log(`   Tamaño: ${(response.data.byteLength / 1024).toFixed(1)} KB`, 'gray');
    } catch (error: unknown) {
        log(`❌ Error exportando: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        const axiosErr = error as { response?: { status?: number } };
        if (axiosErr.response?.status === 404) {
            log('  Nota: El plugin action-export debe estar habilitado.', 'yellow');
        }
    }
}

async function importCollection(collection: string, flags: Record<string, string>) {
    if (!flags.file) {
        log('❌ Parámetro requerido: --file <ruta_archivo.xlsx>', 'red');
        process.exit(1);
    }

    const filepath = path.resolve(flags.file);
    if (!existsSync(filepath)) {
        log(`❌ Archivo no encontrado: ${filepath}`, 'red');
        process.exit(1);
    }

    log(`📥 Importando a colección "${collection}"...\n`, 'cyan');
    log(`  Archivo: ${filepath}`, 'gray');

    try {
        const fileData = readFileSync(filepath);
        const FormData = (await import('form-data')).default;
        const form = new FormData();
        form.append('file', fileData, {
            filename: path.basename(filepath),
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const axiosClient = client.getClient();
        const response = await axiosClient.post(
            `${client.getBaseUrl()}/${collection}:import`,
            form,
            { headers: form.getHeaders() }
        );

        const result = response.data?.data || response.data;
        log(`\n✅ Importación completada.`, 'green');
        if (result) {
            log(`  Resultado: ${JSON.stringify(result)}`, 'gray');
        }
    } catch (error: unknown) {
        log(`❌ Error importando: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        const axiosErr = error as { response?: { data?: unknown } };
        if (axiosErr.response?.data) {
            log(`  Detalle: ${JSON.stringify(axiosErr.response.data)}`, 'gray');
        }
    }
}

async function downloadTemplate(collection: string, flags: Record<string, string>) {
    log(`📋 Descargando plantilla de importación para "${collection}"...\n`, 'cyan');

    try {
        const fieldsResp = await client.get(`/collections/${collection}/fields:list`, {
            paginate: false,
        });
        const fields = (fieldsResp.data || []).filter((f: Record<string, unknown>) =>
            !['password', 'sort', 'context'].includes(String(f.type)) &&
            !['createdBy', 'updatedBy', 'createdAt', 'updatedAt', 'id'].includes(String(f.interface)) &&
            f.name !== 'id' && f.name !== 'createdAt' && f.name !== 'updatedAt'
        );

        log(`  Campos para importación:`, 'white');
        for (const f of fields) {
            const required = f.required ? ' [REQUERIDO]' : '';
            log(`    ${f.name} (${f.type}): ${f.title || f.name}${required}`, 'gray');
        }

        // Try to download the actual import template
        try {
            const axiosClient = client.getClient();
            const columns = fields.map((f: Record<string, unknown>) => ({
                dataIndex: [f.name],
                title: f.title || f.name,
            }));

            const response = await axiosClient.post(
                `${client.getBaseUrl()}/${collection}:export`,
                { columns },
                {
                    responseType: 'arraybuffer',
                    params: { 'filter': JSON.stringify({ id: { $eq: -1 } }) },
                }
            );

            const filename = flags.file || `${collection}_template.xlsx`;
            const filepath = path.resolve(filename);
            writeFileSync(filepath, Buffer.from(response.data));
            log(`\n✅ Plantilla guardada: ${filepath}`, 'green');
        } catch {
            log('\n⚠️  No se pudo descargar la plantilla. Usa los campos de arriba para crear tu Excel.', 'yellow');
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
            case 'export':
                if (!positional[1]) { log('❌ Falta: <coleccion>', 'red'); process.exit(1); }
                await exportCollection(positional[1], flags);
                break;
            case 'import':
                if (!positional[1]) { log('❌ Falta: <coleccion>', 'red'); process.exit(1); }
                await importCollection(positional[1], flags);
                break;
            case 'template':
                if (!positional[1]) { log('❌ Falta: <coleccion>', 'red'); process.exit(1); }
                await downloadTemplate(positional[1], flags);
                break;
            default:
                log('Uso: manage-import-export.ts <comando> [opciones]\n', 'cyan');
                log('Comandos:', 'white');
                log('  export <coleccion> [--file salida.xlsx]  Exportar datos a Excel', 'gray');
                log('  import <coleccion> --file datos.xlsx     Importar datos desde Excel', 'gray');
                log('  template <coleccion> [--file tmpl.xlsx]  Descargar plantilla de importación', 'gray');
                log('\nEjemplos:', 'white');
                log('  export users --file usuarios.xlsx', 'gray');
                log('  template pacientes --file plantilla.xlsx', 'gray');
                log('  import pacientes --file datos_pacientes.xlsx', 'gray');
                break;
        }
    } catch (error: unknown) {
        log(`\n❌ Error: ${(error instanceof Error ? error.message : String(error))}`, 'red');
        process.exit(1);
    }
}

main();
