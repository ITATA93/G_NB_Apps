const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
    console.error('Usage: node scrape-hl7.js <inputHtml> <outputJson>');
    process.exit(1);
}

try {
    const html = fs.readFileSync(inputFile, 'utf-8');

    // Find the codes table
    // <table class="codes"><tr><td style="white-space:nowrap"><b>Code</b></td><td><b>Display</b></td></tr>

    const tableRegex = /<table class="codes">([\s\S]*?)<\/table>/;
    const tableMatch = html.match(tableRegex);

    if (!tableMatch) {
        console.error('Could not find <table class="codes"> in the file.');
        process.exit(1);
    }

    const tableContent = tableMatch[1];
    const rows = tableContent.match(/<tr>([\s\S]*?)<\/tr>/g);

    const entries = [];

    if (rows) {
        for (const row of rows) {
            // Skip header row if it contains <b>Code</b>
            if (row.includes('<b>Code</b>')) continue;

            // Extract cells
            const cells = row.match(/<td.*?>([\s\S]*?)<\/td>/g);
            if (cells && cells.length >= 2) {
                // Clean up cell 1 (Code)
                let code = cells[0].replace(/<[^>]+>/g, '').trim(); // Remove tags

                // Determine Display column index
                // If 3 columns, usually Code | System | Display. So Display is index 2.
                // If 2 columns, usually Code | Display. So Display is index 1.
                let displayIndex = 1;
                if (cells.length >= 3) {
                    displayIndex = 2;
                }

                // Clean up Display
                let display = cells[displayIndex].replace(/<[^>]+>/g, '').trim();

                if (code && display) {
                    entries.push({
                        codigo_oficial: code,
                        descripcion: display,
                        activo: true
                    });
                }
            }
        }
    }

    console.log(`Extracted ${entries.length} codes from ${path.basename(inputFile)}`);
    fs.writeFileSync(outputFile, JSON.stringify(entries, null, 2));

} catch (err) {
    console.error(err);
    process.exit(1);
}
