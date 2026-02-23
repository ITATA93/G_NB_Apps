
/**
 * Deploy UI Pages via API (Based on Official Guide)
 * 
 * PROTOCOL:
 * 1. Create Group/Page Route -> Get Grid UID
 * 2. Create Block (Table) -> Get Block UID & Action Column UID
 * 3. Add Columns -> Uses Block UID
 * 4. Add Actions (Global/Row) -> Uses Block UID / Action Col UID
 */

import { ApiClient } from '../shared/scripts/ApiClient.js';
import * as dotenv from 'dotenv';
dotenv.config();

const api = new ApiClient();
const SLEEP_MS = 500;

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- PRE-DEFINED UI SPEC ---
const UI_SPEC = {
    groups: [
        {
            name: 'ugco', title: 'Oncología (UGCO)', icon: 'HeartPulse',
            pages: [
                {
                    name: 'ugco.casos', title: 'Casos', path: '/ugco/casos', collection: 'onco_casos',
                    columns: ['paciente_rut', 'fecha_ingreso', 'diagnostico_principal', 'estado'],
                    actions: ['addNew', 'view', 'edit', 'delete']
                },
                {
                    name: 'ugco.agenda', title: 'Agenda Pabellón', path: '/ugco/agenda', collection: 'schedule_blocks', 
                    type: 'Calendar', // Special handling
                    columns: ['start_time', 'end_time', 'activity_type', 'staff'],
                    actions: ['addNew', 'view', 'edit']
                }
            ]
        }
    ]
};

async function deployGroup(groupDef: any) {
    console.log(`\n📂 Deploying Group: ${groupDef.title}...`);
    
    // 1. Create Group
    // Try to find existing first to avoid dupes? (Simplified: Create always, API handles dupes/errors usually, or we catch)
    let groupId;
    try {
        const res = await api.post('desktopRoutes:create', {
            type: 'group',
            title: groupDef.title,
            icon: groupDef.icon,
            name: groupDef.name // internal name
        });
        groupId = res?.data?.id || res?.data?.uid;
        console.log(`   ✅ Group Created/Found. ID: ${groupId}`);
    } catch (e: any) {
        console.log(`   ⚠️ Group creation note: ${e.message}`);
        // Fallback: Need to search for it if it failed? Assuming it returns object on 400? 
        // For now, proceed if we have an ID, else abort.
        if (!groupId) return;
    }

    if (!groupId) return;

    // 2. Deploy Pages
    for (const pageDef of groupDef.pages) {
        await deployPage(groupId, pageDef);
    }
}

async function deployPage(parentId: any, pageDef: any) {
    console.log(`\n  📄 Deploying Page: ${pageDef.title} (${pageDef.path})...`);
    
    // 1. Create Page Route
    let gridUid;
    try {
        const res = await api.post('desktopRoutes:create', {
            type: 'page',
            title: pageDef.title,
            name: pageDef.name,
            path: pageDef.path,
            parentId: parentId
        });
        
        const pageData = res?.data;
        console.log(`     🔍 DEBUG RESPONSE:`, JSON.stringify(pageData, null, 2));

        gridUid = pageData?.schemaUid || pageData?.gridUid || pageData?.uid; 
        
        // If still undefined, maybe check 'uiSchema'?
        if (!gridUid && pageData?.uiSchema) {
            gridUid = pageData.uiSchema.uid;
        }

        // --- MANUAL BINDING FIX ---
        if (!gridUid) {
            console.log('     ⚠️ No Grid UID auto-generated. Creating manual layout...');
            
            const gridRes = await api.post('uiSchemas:create', {
                type: 'void',
                'x-component': 'Grid',
                'x-designer': 'Grid.Designer'
            });
            console.log(`     🔍 DEBUG GRID CREATE:`, JSON.stringify(gridRes, null, 2));

            gridUid = gridRes?.data?.['x-uid'] || gridRes?.data?.uid || gridRes?.data?.id;
            
            if (gridUid) {
                 console.log(`     ✅ Manual Grid Created: ${gridUid}`);
                 // 2. Bind it to the route
                 // Route ID is pageData.id
                 const routeId = pageData?.id;
                 if (routeId) {
                     await api.post(`desktopRoutes:update?filterByTk=${routeId}`, {
                         schemaUid: gridUid
                     });
                     console.log(`     🔗 Route bound to Grid UID.`);
                 }
            }
        }
        // --------------------------

        console.log(`     ✅ Page Route Configured. Grid UID: ${gridUid}`);
    } catch (e: any) {
        console.error(`     ❌ Failed to create page route: ${e.message}`);
        return;
    }

    if (!gridUid) {
        console.error('     ❌ No Grid UID returned. Cannot add blocks.');
        return;
    }

    await delay(SLEEP_MS);

    // 2. Create Block (Table or Calendar)
    // NOTE: The Guide says use 'uiSchemas:create' with parentUid = gridUid
    const componentType = pageDef.type === 'Calendar' ? 'Calendar' : 'Table'; // Simplified
    
    console.log(`     🧱 Adding Block (${componentType}) for collection: ${pageDef.collection}...`);
    
    let blockUid, actionColUid;
    try {
        const res = await api.post('uiSchemas:create', {
            componentName: componentType, // "Table" or "Calendar"
            collection: pageDef.collection,
            parentUid: gridUid,
            'x-decorator': 'BlockItem', // Often needed to wrap it in the grid
            'x-component': componentType === 'Calendar' ? 'CalendarV2' : 'TableV2' // NocoBase 1.0+ uses V2 usually? Guide says "Table". Let's try high level "Table" first.
        });
        
        // Response analysis
        const block = res?.data;
        blockUid = block?.uid || block?.id;
        
        // Find action column if it's a table
        // Sometimes it's returned as a specific property, or we have to find the child
        actionColUid = block?.properties?.actions?.['x-uid'] || block?.actionsColumnUid; 
        
        console.log(`     ✅ Block Created. UID: ${blockUid}`);

    } catch (e: any) {
        console.error(`     ❌ Block creation failed: ${e.message}`);
        // Try fallback for "Table" string if "TableV2" failed or vice versa
        return;
    }

    if (!blockUid) return;

    // 3. Add Columns (For Tables)
    if (componentType === 'Table' && pageDef.columns) {
        console.log(`     ADDING COLUMNS: ${pageDef.columns.join(', ')}`);
        for (const col of pageDef.columns) {
            try {
                await api.post('uiSchemas:create', {
                    componentName: 'TableColumn', // Guide says TableColumn
                    fieldPath: col, // Field name in collection
                    parentUid: blockUid
                });
                process.stdout.write('.');
            } catch (e) {
                process.stdout.write('x');
            }
        }
        console.log(' Done.');
    }

    // 4. Add Actions (Global 'Add New')
    if (pageDef.actions.includes('addNew')) {
        try {
            await api.post('uiSchemas:create', {
                componentName: 'Action',
                actionType: 'addNew', // Guide says "addNew"
                collection: pageDef.collection,
                parentUid: blockUid, // Add to table header
                title: 'Nuevo'
            });
            console.log(`     ✅ Action 'Add New' added.`);
        } catch (e: any) {
            console.log(`     ⚠️ Action 'Add New' failed: ${e.message}`);
        }
    }
}

async function main() {
    console.log(`🚀 Starting UI Deployment (Guide Protocol)...`);
    
    for (const group of UI_SPEC.groups) {
        await deployGroup(group);
    }
    
    console.log(`\n✨ UI Deployment Configuration Complete.`);
}

main();
