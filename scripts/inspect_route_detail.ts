
import { ApiClient } from '../shared/scripts/ApiClient.js';
import * as dotenv from 'dotenv';
dotenv.config();

const api = new ApiClient();

async function inspectRoute(id: string) {
    console.log(`🔍 Inspecting Route ID: ${id}...\n`);
    
    try {
        const res = await api.get('desktopRoutes:get', { filterByTk: id });
        const route = res?.data;
        
        console.log(JSON.stringify(route, null, 2));
        
        if (route?.schemaUid) {
            console.log(`\n✅ Schema UID found: ${route.schemaUid}`);
        } else {
             console.log(`\n❌ Schema UID MISSING`);
        }
    } catch (e: any) {
        console.error(e.message);
    }
}

// ID obtained from previous run logs
inspectRoute('346662211747841'); 
