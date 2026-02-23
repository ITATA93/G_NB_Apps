
import { ApiClient } from '../shared/scripts/ApiClient.js';
import * as dotenv from 'dotenv';
dotenv.config();

const api = new ApiClient();
const MENU_UID = 'j3v70txtnoq'; // Created in previous step
const TARGET_PATH = '/ugco/casos';

async function link() {
    console.log(`Link route "${TARGET_PATH}" to Menu UID "${MENU_UID}"...`);
    
    // 1. Find the Route
    try {
        // Fetch top 50 recent
        const res = await api.get('desktopRoutes:list', { 
            pageSize: 50,
            sort: '-createdAt'
        });
        
        const routes = res?.data || [];
        // Find matching path manually by TITLE
        const route = routes.find((r: any) => r.title === 'Casos');
        
        if (!route) {
            console.error('❌ Route not found by TITLE "Casos" in recent items.');
            // Dump titles to see what's there
             console.log('Available Titles:', routes.map((r:any) => r.title).join(', '));
            return;
        }
        console.log(`✅ Found Route: [${route.id}] ${route.title} (${route.path})`);
        
        // 2. Update Route
        await api.post(`desktopRoutes:update?filterByTk=${route.id}`, {
            menuSchemaUid: MENU_UID
        });
        console.log(`✅ Route linked successfully!`);
        
    } catch(e: any) {
        console.error(e.message);
    }
}

link();
