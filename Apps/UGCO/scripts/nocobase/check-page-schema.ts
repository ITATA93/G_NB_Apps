/**
 * check-page-schema.ts - Ver schema de una página
 */

import { createClient, log } from '../../../../shared/scripts/ApiClient.js';

const client = createClient();

async function main() {
    const pageSchemaUid = process.argv[2] || 'obvlagr8vi';

    log(`Obteniendo schema de: ${pageSchemaUid}`, 'cyan');

    const schema = await client.get(`/uiSchemas:getProperties/${pageSchemaUid}`);

    console.log(JSON.stringify(schema.data, null, 2));
}

main();
