/**
 * list-ugco-tree.ts - List full UGCO page tree from NocoBase
 */
import { createClient } from '../../../../shared/scripts/ApiClient';

const api = createClient();

async function main() {
    // List all accessible routes as a tree
    const result = await api.get('/desktopRoutes:listAccessible', { tree: true, sort: 'sort' });
    const routes = result.data || [];

    // Find UGCO root
    const ugco = routes.find((r: any) => r.title?.includes('UGCO') || r.title?.includes('Oncolog'));

    if (!ugco) {
        // Show all top-level routes to find UGCO
        console.log('Top-level routes:');
        for (const r of routes) {
            console.log(`  ${r.id} | ${r.title} | type=${r.type} | schema=${r.schemaUid || '-'}`);
        }
        return;
    }

    function printTree(route: any, indent: string = '') {
        const schema = route.schemaUid ? `schema=${route.schemaUid}` : '';
        const tabs = route.enableTabs ? ' [TABS]' : '';
        console.log(`${indent}${route.id} | ${route.title} | ${route.type}${tabs} | ${schema}`);
        if (route.children) {
            for (const child of route.children) {
                printTree(child, indent + '  ');
            }
        }
    }

    console.log('\n=== UGCO PAGE TREE ===\n');
    printTree(ugco);
}

main().catch(e => console.error('Error:', e.response?.data || e.message));
