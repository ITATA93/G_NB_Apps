
import { ApiClient } from '../shared/scripts/ApiClient.js';
import * as dotenv from 'dotenv';
dotenv.config();

const api = new ApiClient();

async function inspectRoutes() {
    console.log('🔍 Inspecting Desktop Routes (Simpler)...\n');
    
    // Pagination to avoid timeout
    const res = await api.get('desktopRoutes:list', { 
        pageSize: 50,
        sort: '-createdAt' // Newest first
    });
    
    const routes = res?.data || [];
    console.log(`Routes Found (Top 50): ${routes.length}`);
    
    // Search for the visible UGCO menu item UID
    const targetUid = '3mvmkcig2o';
    
    for (const r of routes) {
        // Check if schemaUid or uiSchema.uid matches
        if (r.schemaUid === targetUid || r.uiSchema?.uid === targetUid) {
             console.log(`\n FOUND VISIBLE PARENT ROUTE:`);
             console.log(`ID: ${r.id} | Name: ${r.name} | Title: ${r.title}`);
             console.log(`Schema UID: ${r.schemaUid}`);
        }
    }
}

inspectRoutes();
