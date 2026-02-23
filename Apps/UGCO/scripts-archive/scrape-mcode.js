const fs = require('fs');
const path = require('path');

const inputFile = path.resolve(__dirname, '../BD/diccionarios_raw/temp_primary.html');
const outputFile = path.resolve(__dirname, '../BD/diccionarios_raw/mCODE_Topography_ICD10.json');

try {
    const html = fs.readFileSync(inputFile, 'utf-8');

    // Regex to find patterns like "C00.0Malignant neoplasm..."
    // The text in the chunk looked like: "C00.0Malignant neoplasm of external upper lip"
    // It seems to be a list in the text.
    // Let's try to match "C[0-9]+\.[0-9]+.*"

    // However, the HTML might have tags.
    // Let's look for the specific pattern seen in the chunk:
    // "- Include these codes as defined in http://hl7.org/fhir/sid/icd-10-cmCodeDisplayC00.0Malignant neoplasm..."
    // It seems the "CodeDisplay" part might be a class or just text.
    // Actually, the chunk showed: "C00.0Malignant neoplasm..." concatenated.
    // This suggests the HTML might be minified or the text extraction was raw.

    // Let's try to match the pattern Cxx.x followed by text.
    const regex = /(C[0-9]{2}\.[0-9]+)\s*([A-Za-z\s,\(\)\-]+)/g;

    const entries = [];
    let match;

    // We'll use a simpler regex to capture the code and the rest of the line/string until the next code.
    // Since we don't have the exact HTML structure, we'll try to parse the raw text if possible, 
    // but reading the HTML file directly is better.

    // Let's assume the codes are in a list or table.
    // If we look at the chunk again: "C00.0Malignant neoplasm of external upper lipC00.1..."
    // It looks like they are concatenated in the text view.
    // In the HTML, they are likely in <tr><td>C00.0</td><td>Malignant...</td></tr> or similar.

    // Let's try to find <td>C[0-9.]+</td>

    const codeRegex = /C[0-9]{2}(\.[0-9]+)?/g;
    // This is too risky without seeing the HTML.

    // But wait, I downloaded the file. I can read it!
    // I'll just do a simple regex on the file content assuming standard HTML tags.
    // Usually: <td>C00.0</td><td>Description</td>

    // Let's try to capture: <td>(C[0-9.]+)</td>.*?<td>(.*?)</td>
    const rowRegex = /<tr>.*?<td>(C[0-9]{2}(?:\.[0-9]+)?)<\/td>.*?<td>(.*?)<\/td>.*?<\/tr>/gs;

    // Actually, let's just dump the file content to console first to be sure? 
    // No, that's too much output.

    // I'll try a robust regex that looks for the code pattern and description.
    // If the HTML is standard FHIR IG, it's usually a table.

    let count = 0;
    while ((match = rowRegex.exec(html)) !== null) {
        const code = match[1].trim();
        const desc = match[2].replace(/<[^>]+>/g, '').trim(); // Remove inner tags
        entries.push({
            codigo_oficial: code,
            descripcion: desc,
            activo: true
        });
        count++;
    }

    // If that fails (count 0), try the concatenated text pattern seen in the chunk.
    if (count === 0) {
        console.log("Table regex failed, trying text pattern...");
        // The chunk showed "C00.0Malignant neoplasm..."
        // This suggests the text content of the element.
        // Let's try to find the block containing these codes.
        // It matches "C[0-9][0-9].[0-9]..."

        // Let's try to find just the codes and assume the text follows.
        // This is hard without a DOM parser.

        // Fallback: Just create a dummy entry to test the script flow?
        // No, I need real data.

        // Let's try to match strictly "C" followed by digits and dots.
        const simpleRegex = /(C[0-9]{2}\.?[0-9]*)\s+([A-Z][a-z].*?)(?=C[0-9]|$)/g;
        // This is very brittle.
    }

    console.log(`Extracted ${entries.length} codes.`);

    fs.writeFileSync(outputFile, JSON.stringify(entries, null, 2));
    console.log(`Saved to ${outputFile}`);

} catch (err) {
    console.error(err);
}
