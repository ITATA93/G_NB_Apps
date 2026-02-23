/**
 * capture-ui-calls.ts - Capturar las llamadas de red cuando NocoBase crea una página
 *
 * Este script abre un navegador, hace login en NocoBase, y captura todas las
 * llamadas API cuando el usuario crea una página manualmente.
 */

import { chromium } from 'playwright';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.NOCOBASE_BASE_URL || 'https://mira.hospitaldeovalle.cl';

async function main() {
    console.log('=== CAPTURANDO LLAMADAS DE UI DE NOCOBASE ===\n');
    console.log('URL:', BASE_URL);

    const browser = await chromium.launch({
        headless: false,  // Visible para que puedas interactuar
        slowMo: 100
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // Capturar todas las llamadas de red
    const apiCalls: any[] = [];

    page.on('request', async request => {
        const url = request.url();
        if (url.includes('/api/') && (
            url.includes(':create') ||
            url.includes(':insert') ||
            url.includes(':update') ||
            url.includes('uiSchemas') ||
            url.includes('desktopRoutes')
        )) {
            console.log('\n>> REQUEST:', request.method(), url);
            const postData = request.postData();
            if (postData) {
                console.log('   REQUEST BODY:', postData);
            }
        }
    });

    page.on('response', async response => {
        const url = response.url();
        if (url.includes('/api/') && (
            url.includes(':create') ||
            url.includes(':insert') ||
            url.includes('uiSchemas') ||
            url.includes('desktopRoutes')
        )) {
            try {
                const body = await response.json();
                apiCalls.push({
                    url: url,
                    method: response.request().method(),
                    status: response.status(),
                    body: body
                });
                console.log('<< RESPONSE:', response.status(), url.substring(0, 80));
                console.log('   Body:', JSON.stringify(body).substring(0, 200));
            } catch (e) {
                // No es JSON
            }
        }
    });

    // Navegar a NocoBase
    console.log('\n1. Navegando a NocoBase...');
    await page.goto(BASE_URL + '/admin');

    console.log('\n========================================');
    console.log('INSTRUCCIONES:');
    console.log('1. Haz login si es necesario');
    console.log('2. Ve a UGCO Oncología');
    console.log('3. Haz clic en "+ Añadir elemento al menú"');
    console.log('4. Selecciona "Página"');
    console.log('5. Escribe un nombre (ej: "Test_Browser")');
    console.log('6. Guarda la página');
    console.log('');
    console.log('Las llamadas API se capturarán automáticamente.');
    console.log('Presiona Ctrl+C cuando termines.');
    console.log('========================================\n');

    // Esperar hasta que el usuario cierre o presione Ctrl+C
    await new Promise((resolve) => {
        process.on('SIGINT', () => {
            console.log('\n\n=== RESUMEN DE LLAMADAS API ===\n');
            for (const call of apiCalls) {
                console.log(`${call.method} ${call.url}`);
                console.log('Response:', JSON.stringify(call.body, null, 2).substring(0, 500));
                console.log('---');
            }
            resolve(null);
        });
    });

    await browser.close();
}

main().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
