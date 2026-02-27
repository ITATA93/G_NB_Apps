/**
 * inspect-schema.ts - Inspect UI schema structure for debugging
 */
import { createClient } from '../../../../shared/scripts/ApiClient';
const api = createClient();

async function inspect(schemaUid: string, label: string) {
    console.log(`\n=== ${label} (${schemaUid}) ===`);
    try {
        const result = await api.get(`/uiSchemas:getJsonSchema/${schemaUid}`);
        // Print structure (truncated)
        function printTree(obj: any, indent: string = '', depth: number = 0) {
            if (!obj || typeof obj !== 'object' || depth > 6) return;
            const comp = obj['x-component'] || '';
            const uid = obj['x-uid'] || '';
            const init = obj['x-initializer'] || '';
            const async = obj['x-async'] ? ' ASYNC' : '';
            if (comp || uid) {
                console.log(`${indent}${comp}${uid ? ` uid=${uid}` : ''}${init ? ` init=${init}` : ''}${async}`);
            }
            if (obj.properties) {
                for (const key of Object.keys(obj.properties)) {
                    console.log(`${indent}  [${key}]:`);
                    printTree(obj.properties[key], indent + '    ', depth + 1);
                }
            }
        }
        printTree(result.data);
    } catch (err: any) {
        console.log(`  Error: ${err.message}`);
    }
}

async function main() {
    // Existing working page (Casos Oncológicos)
    await inspect('4jwmen74y6r', 'Casos Oncologicos - PAGE schema');
    await inspect('kkcolmf4bc7', 'Casos Oncologicos - TAB schema');

    // New page (Digestivo Alto)
    await inspect('lalj02ytpqr', 'Digestivo Alto - PAGE schema');
}

main().catch(console.error);
