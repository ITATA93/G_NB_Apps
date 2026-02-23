
import { ApiClient } from '../shared/scripts/ApiClient.js';
import * as dotenv from 'dotenv';
dotenv.config();

const api = new ApiClient();

// Parent UID for "UGCO" menu group (found via previous inspection)
const PARENT_MENU_UID = '3mvmkcig2o'; 

async function addMenuItem(title: string, path: string) {
    console.log(`Adding Menu Item "${title}" to Parent ${PARENT_MENU_UID}...`);
    
    try {
        const res = await api.post('uiSchemas:create', {
            type: 'void',
            'x-component': 'Menu.Item',
            'x-designer': 'Menu.Designer',
            'x-component-props': {}, // NocoBase might handle path via route matching if name matches? 
            // Actually, usually we set "name" or allow NocoBase to generate UID.
            // AND we need to link it to the route.
            // In modern NocoBase, Menu Item clicks trigger navigation. 
            // If checking "Test Page API", it had no props.
            title: title,
            parentUid: PARENT_MENU_UID
        });
        
        console.log(`✅ Menu Item Created.`, JSON.stringify(res?.data, null, 2));
        
        // Critical: How to link to the route?
        // Often we need to update the ROUTE to point to this menu schema UID?
        // Or update the Menu Item to have 'x-component-props': { 'path': ... }?
        // Let's try creating it first.
        
    } catch (e: any) {
        console.error(`❌ Failed: ${e.message}`);
    }
}

async function linkRouteToMenu(path: string, menuUid: string) {
    // We need to find the route by path and update its 'menuSchemaUid'?
    // desktopRoutes table has 'menuSchemaUid'.
    console.log(`Link route "${path}" to Menu UID "${menuUid}"...`);
    // This part is speculative but likely necessary.
}

async function main() {
    // 1. Add "Casos"
    // We will try to create a Menu Item that explicitly invokes a route?
    // Actually, let's try adding a Menu.Item with "x-component-props": { "path": "/ugco/casos" }
    
    console.log(`Adding Menu Item "Casos"...`);
    try {
        const res = await api.post('uiSchemas:create', {
            type: 'void',
            'x-component': 'Menu.Item',
            title: 'Casos (Fixed)',
            'x-component-props': { 
                // key: '/ugco/casos' // Try this?
            },
            parentUid: PARENT_MENU_UID
        });
        
        const menuUid = res?.data?.['x-uid'];
        console.log(`✅ Menu Item Created: ${menuUid}`);
        
        // NOW, update the Route to point to this menu item?
        // Query route by path
        // We know we created route '/ugco/casos'
        // But searching regular routes is hard without ID.
        // We will skip route update for a second and see if Menu Item appears.
        
    } catch(e: any) {
        console.error(e.message);
    }
}

main();
