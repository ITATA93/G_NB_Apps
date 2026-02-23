/**
 * add-ugco-to-main-menu.ts - Agregar UGCO al menú principal junto a INICIO
 */

import axios from 'axios';

const client = axios.create({
    baseURL: 'https://mira.hospitaldeovalle.cl/api',
    headers: {
        'Authorization': 'Bearer ' + (process.env.NOCOBASE_API_KEY || ''),
    },
});

const colors = {
    cyan: (t: string) => `\x1b[36m${t}\x1b[0m`,
    green: (t: string) => `\x1b[32m${t}\x1b[0m`,
    yellow: (t: string) => `\x1b[33m${t}\x1b[0m`,
    red: (t: string) => `\x1b[31m${t}\x1b[0m`,
    gray: (t: string) => `\x1b[90m${t}\x1b[0m`,
};

function log(msg: string, color: keyof typeof colors = 'cyan') {
    console.log(colors[color](msg));
}

async function main() {
    log('╔════════════════════════════════════════════════════════════════════╗');
    log('║  AGREGAR UGCO AL MENÚ PRINCIPAL (JUNTO A INICIO)                  ║');
    log('╚════════════════════════════════════════════════════════════════════╝');

    // 1. Buscar el parent de INICIO (1o5y8dftms0) en todos los schemas
    log('\n1. Buscando estructura del menú donde está INICIO...', 'gray');

    try {
        // Obtener todos los schemas y buscar cuál tiene a 1o5y8dftms0 como hijo
        const res = await client.get('/uiSchemas:list?pageSize=1000');
        const schemas = res.data?.data || [];

        log(`   Total schemas: ${schemas.length}`, 'gray');

        // Para cada schema que sea Menu, obtener su estructura completa
        for (const s of schemas) {
            if (s['x-component'] === 'Menu') {
                log(`\n   Verificando menú: ${s['x-uid']}`, 'gray');

                try {
                    const menuRes = await client.get(`/uiSchemas:getJsonSchema/${s['x-uid']}`);
                    const menu = menuRes.data?.data;

                    // Buscar INICIO en las propiedades
                    function findInicio(obj: any, path: string[] = []): string[] | null {
                        if (obj['x-uid'] === '1o5y8dftms0') {
                            return path;
                        }
                        if (obj.properties) {
                            for (const [key, val] of Object.entries(obj.properties)) {
                                const result = findInicio(val as any, [...path, key]);
                                if (result) return result;
                            }
                        }
                        return null;
                    }

                    const path = findInicio(menu);
                    if (path) {
                        log(`   [ENCONTRADO] INICIO está en: ${s['x-uid']}`, 'green');
                        log(`     Path: ${path.join(' > ')}`, 'gray');

                        // Mostrar estructura del menú
                        log('\n   Estructura del menú:', 'cyan');
                        if (menu.properties) {
                            for (const [key, val] of Object.entries(menu.properties) as any) {
                                log(`     - ${val.title || key} [${val['x-uid']}]`, 'white');
                            }
                        }
                    }
                } catch (e: any) {
                    // Ignorar errores
                }
            }
        }
    } catch (e: any) {
        log(`   Error: ${e.message}`, 'red');
    }

    // 2. Buscar schemas que contengan "1o5y8dftms0" directamente
    log('\n\n2. Buscando parent directo de INICIO...', 'gray');
    try {
        const res = await client.get('/uiSchemas:list?pageSize=2000');
        const schemas = res.data?.data || [];

        // Obtener cada schema y buscar si tiene INICIO como propiedad
        let foundParent = false;

        for (const s of schemas) {
            try {
                const fullRes = await client.get(`/uiSchemas:getJsonSchema/${s['x-uid']}`);
                const full = fullRes.data?.data;

                if (full?.properties) {
                    for (const [key, val] of Object.entries(full.properties) as any) {
                        if (val['x-uid'] === '1o5y8dftms0') {
                            log(`   [ENCONTRADO] Parent de INICIO: ${s['x-uid']}`, 'green');
                            log(`     Component: ${full['x-component']}`, 'gray');
                            log(`     Title: ${full.title || '(sin título)'}`, 'gray');

                            // Mostrar hermanos de INICIO
                            log('\n     Hermanos de INICIO:', 'cyan');
                            for (const [k, v] of Object.entries(full.properties) as any) {
                                log(`       - ${v.title || k} [${v['x-uid']}] (${v['x-component']})`, 'white');
                            }

                            foundParent = true;
                            break;
                        }
                    }
                }

                if (foundParent) break;
            } catch (e: any) {
                // Ignorar errores de schemas individuales
            }
        }

        if (!foundParent) {
            log('   INICIO no encontrado como hijo directo de ningún schema', 'yellow');
        }
    } catch (e: any) {
        log(`   Error: ${e.message}`, 'red');
    }

    // 3. Intentar obtener ancestors de INICIO
    log('\n\n3. Intentando API alternativa para encontrar parent...', 'gray');

    const possibleParentEndpoints = [
        '/uiSchemas:getParentProperty/1o5y8dftms0',
        '/uiSchemas:getParent/1o5y8dftms0',
    ];

    for (const ep of possibleParentEndpoints) {
        try {
            const res = await client.get(ep);
            log(`   [OK] ${ep}`, 'green');
            log(`     ${JSON.stringify(res.data?.data)}`, 'gray');
        } catch (e: any) {
            if (e.response?.status !== 404) {
                log(`   [--] ${ep}: ${e.response?.status}`, 'yellow');
            }
        }
    }
}

main().catch(console.error);
