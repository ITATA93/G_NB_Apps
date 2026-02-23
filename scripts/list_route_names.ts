
import { ApiClient } from '../shared/scripts/ApiClient.js';
import * as dotenv from 'dotenv';
dotenv.config();

const api = new ApiClient();

async function listNames() {
    const res = await api.get('desktopRoutes:list', { pageSize: 50, sort: '-createdAt' });
    const routes = res?.data || [];
    console.log(`Dumping ${routes.length} route names/paths:`);
    routes.forEach(r => {
        console.log(`ID: ${r.id} | Name: "${r.name}" | Path: "${r.path}"`);
    });
}
listNames();
