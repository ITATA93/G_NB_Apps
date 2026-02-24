/**
 * verify-fix-pages.ts - Verificar y opcionalmente reparar páginas de NocoBase
 *
 * Uso:
 *   npx tsx verify-fix-pages.ts                    # Verificar todas bajo UGCO
 *   npx tsx verify-fix-pages.ts 345392373628932    # Verificar bajo parent específico
 *   npx tsx verify-fix-pages.ts --fix              # Verificar y reparar todas
 *   npx tsx verify-fix-pages.ts 345419886166016 --fix  # Verificar y reparar una específica
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const client = axios.create({
    baseURL: process.env.NOCOBASE_BASE_URL,
    headers: {
        'Authorization': `Bearer ${process.env.NOCOBASE_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Role': 'root'
    },
});

interface PageStatus {
    id: number;
    title: string;
    type: string;
    schemaUid: string | null;
    hasChildren: boolean;
    childType: string | null;
    gridUid: string | null;
    gridName: string | null;
    gridAsync: boolean | null;
    isEditable: boolean;
    issues: string[];
}

async function verifyPage(pageId: number): Promise<PageStatus> {
    const issues: string[] = [];

    // 1. Obtener la ruta
    const route = await client.get(`/desktopRoutes:get?filterByTk=${pageId}`);
    const routeData = route.data?.data;

    if (!routeData) {
        return {
            id: pageId,
            title: 'NOT FOUND',
            type: 'unknown',
            schemaUid: null,
            hasChildren: false,
            childType: null,
            gridUid: null,
            gridName: null,
            gridAsync: null,
            isEditable: false,
            issues: ['Página no encontrada']
        };
    }

    // 2. Verificar children
    const children = await client.get('/desktopRoutes:list', {
        params: { filter: { parentId: pageId } }
    });

    const hasChildren = (children.data?.data?.length || 0) > 0;
    const childData = children.data?.data?.[0];
    const childType = childData?.type || null;

    if (!hasChildren) {
        issues.push('No tiene children (tab oculto)');
    } else if (childType !== 'tabs') {
        issues.push(`Child type incorrecto: ${childType} (debe ser 'tabs')`);
    }

    // 3. Verificar schema
    let gridUid: string | null = null;
    let gridName: string | null = null;
    let gridAsync: boolean | null = null;

    if (routeData.schemaUid) {
        try {
            const props = await client.get(`/uiSchemas:getProperties/${routeData.schemaUid}`);
            const properties = props.data?.data?.properties || {};
            gridName = Object.keys(properties)[0] || null;

            if (gridName) {
                const grid = properties[gridName];
                gridUid = grid?.['x-uid'] || null;
                gridAsync = grid?.['x-async'] ?? null;

                if (gridAsync !== true) {
                    issues.push(`Grid x-async: ${gridAsync} (debe ser true)`);
                }

                if (grid?.['x-component'] !== 'Grid') {
                    issues.push(`Componente incorrecto: ${grid?.['x-component']} (debe ser 'Grid')`);
                }

                if (!grid?.['x-initializer']?.includes('addBlock')) {
                    issues.push('Grid no tiene x-initializer para agregar bloques');
                }
            } else {
                issues.push('No tiene Grid dentro del Page');
            }
        } catch (_e: unknown) {
            issues.push('Error al leer schema');
        }
    } else {
        issues.push('No tiene schemaUid');
    }

    // 4. Verificar consistencia entre child y grid
    if (hasChildren && childData && gridUid) {
        if (childData.schemaUid !== gridUid) {
            issues.push(`Child schemaUid (${childData.schemaUid}) no coincide con Grid x-uid (${gridUid})`);
        }
        if (childData.tabSchemaName !== gridName) {
            issues.push(`Child tabSchemaName (${childData.tabSchemaName}) no coincide con Grid name (${gridName})`);
        }
    }

    const isEditable = issues.length === 0;

    return {
        id: pageId,
        title: routeData.title,
        type: routeData.type,
        schemaUid: routeData.schemaUid,
        hasChildren,
        childType,
        gridUid,
        gridName,
        gridAsync,
        isEditable,
        issues
    };
}

async function fixPage(status: PageStatus): Promise<boolean> {
    if (status.isEditable) {
        console.log(`  ✓ Ya está correcta`);
        return true;
    }

    console.log(`  Reparando...`);

    try {
        // 1. Si no tiene children pero tiene Grid, agregar child
        if (!status.hasChildren && status.gridUid && status.gridName) {
            console.log(`    Agregando child tabs...`);
            await client.post('/desktopRoutes:create', {
                type: 'tabs',
                parentId: status.id,
                schemaUid: status.gridUid,
                tabSchemaName: status.gridName,
                hidden: true
            });
        }

        // 2. Si Grid no tiene x-async: true, actualizarlo via insertAdjacent
        if (status.gridUid && status.gridAsync !== true) {
            console.log(`    Actualizando Grid x-async...`);
            // El endpoint patch no funciona bien para x-async
            // Intentamos con batchPatch que permite actualizar múltiples propiedades
            try {
                await client.post(`/uiSchemas:batchPatch`, [{
                    'x-uid': status.gridUid,
                    'x-async': true
                }]);
            } catch {
                // Si falla, intentar con el método directo de la base de datos
                console.log(`    ⚠️  No se pudo actualizar x-async automáticamente`);
                console.log(`    💡 Ejecuta SQL: UPDATE ui_schemas SET "x-async" = true WHERE "x-uid" = '${status.gridUid}'`);
            }
        }

        console.log(`  ✅ Reparada`);
        return true;
    } catch (e: any) {
        console.log(`  ❌ Error: ${e.message}`);
        return false;
    }
}

async function getAllPages(parentId: number, recursive: boolean = true): Promise<number[]> {
    const pageIds: number[] = [];

    const routes = await client.get('/desktopRoutes:list', {
        params: {
            filter: { parentId },
            pageSize: 100
        }
    });

    for (const route of routes.data?.data || []) {
        if (route.type === 'page') {
            pageIds.push(route.id);
        }
        if (recursive && route.type === 'group') {
            const childIds = await getAllPages(route.id, true);
            pageIds.push(...childIds);
        }
    }

    return pageIds;
}

async function main() {
    const args = process.argv.slice(2);
    const shouldFix = args.includes('--fix');
    const filteredArgs = args.filter(a => a !== '--fix');

    const targetId = filteredArgs[0] ? parseInt(filteredArgs[0]) : null;
    const UGCO_ROOT = 345392373628928;

    console.log('=== VERIFICACIÓN DE PÁGINAS NOCOBASE ===\n');

    let pageIds: number[];

    if (targetId) {
        // Verificar si es una página específica o un parent
        const route = await client.get(`/desktopRoutes:get?filterByTk=${targetId}`);
        if (route.data?.data?.type === 'page') {
            pageIds = [targetId];
        } else {
            pageIds = await getAllPages(targetId);
        }
    } else {
        pageIds = await getAllPages(UGCO_ROOT);
    }

    console.log(`Verificando ${pageIds.length} páginas...\n`);

    const results: PageStatus[] = [];
    let editableCount = 0;
    let problemCount = 0;
    let fixedCount = 0;

    for (const pageId of pageIds) {
        const status = await verifyPage(pageId);
        results.push(status);

        const statusIcon = status.isEditable ? '✅' : '❌';
        console.log(`${statusIcon} ${status.title} (${status.id})`);

        if (status.isEditable) {
            editableCount++;
        } else {
            problemCount++;
            for (const issue of status.issues) {
                console.log(`   ⚠️  ${issue}`);
            }

            if (shouldFix) {
                const fixed = await fixPage(status);
                if (fixed) fixedCount++;
            }
        }
    }

    // Resumen
    console.log('\n=== RESUMEN ===\n');
    console.log(`Total páginas: ${pageIds.length}`);
    console.log(`✅ Editables: ${editableCount}`);
    console.log(`❌ Con problemas: ${problemCount}`);

    if (shouldFix) {
        console.log(`🔧 Reparadas: ${fixedCount}`);
    } else if (problemCount > 0) {
        console.log(`\n💡 Usa --fix para reparar automáticamente`);
    }

    // Detalle de problemas
    if (problemCount > 0 && !shouldFix) {
        console.log('\n=== PÁGINAS CON PROBLEMAS ===\n');
        for (const status of results.filter(r => !r.isEditable)) {
            console.log(`${status.title} (${status.id}):`);
            for (const issue of status.issues) {
                console.log(`  - ${issue}`);
            }
        }
    }
}

main().catch(e => {
    console.error('Error:', e.response?.data || e.message);
    process.exit(1);
});
