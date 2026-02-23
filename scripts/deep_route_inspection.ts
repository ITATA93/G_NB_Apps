
import { ApiClient } from '../shared/scripts/ApiClient.js';
import * as dotenv from 'dotenv';
dotenv.config();

const api = new ApiClient();

async function inspectRoutes() {
    console.log('🔍 Inspecting Desktop Routes...\n');
    
    // Get ALL routes (filtered by Admin mostly)
    const res = await api.get('desktopRoutes:list', { 
        paginate: false,
        sort: 'sort' 
    });
    
    const routes = res?.data || [];
    console.log(`Total Routes Found: ${routes.length}`);
    
    // Dump them for analysis
    for (const r of routes) {
        console.log(`\n------------------------------------------------`);
        console.log(`ID: ${r.id} | Name: ${r.name} | Title: ${r.title}`);
        console.log(`Type: ${r.type}`);
        console.log(`Path: ${r.path}`);
        console.log(`Parent: ${r.parentId}`);
        console.log(`Schema UID: ${r.schemaUid || r.uiSchema?.uid || 'N/A'}`);
        
        if (r.uiSchema) {
            console.log(`Has UI Schema? YES (${r.uiSchema.uid})`);
        } else {
            console.log(`Has UI Schema? NO`);
        }
    }
}

inspectRoutes();
