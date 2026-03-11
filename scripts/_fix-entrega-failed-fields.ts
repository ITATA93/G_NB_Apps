/**
 * _fix-entrega-failed-fields.ts
 *
 * Fixes 2 fields that failed in deploy-entrega-phase2-collections.ts:
 *   1. et_turnos.pdf_generado    — 'attachment' unsupported → use 'text' (store URL)
 *   2. et_notas_clinicas.contenido — 'richText' unsupported → use 'text' (with TextArea UI)
 */
import { createClient, log } from '../shared/scripts/ApiClient';

const client = createClient();

async function fixField(collection: string, name: string, type: string, title: string, required = false) {
  try {
    await client.post(`/collections/${collection}/fields:create`, {
      name,
      type,
      required,
      uiSchema: {
        title,
        'x-component': type === 'text' ? 'Input.TextArea' : 'Input',
      },
    });
    log(`✅ ${collection}.${name} (${type}) — creado`, 'green');
  } catch (err: any) {
    const msg = err?.response?.data?.errors?.[0]?.message || err.message || '';
    if (msg.includes('already exists') || msg.includes('duplicate')) {
      log(`⚠️  ${collection}.${name} ya existe`, 'yellow');
    } else {
      log(`❌ ${collection}.${name}: ${msg}`, 'red');
    }
  }
}

async function main() {
  log('── Fix: campos fallidos Fase 2 ──', 'cyan');

  // 1. et_turnos.pdf_generado (attachment unsupported → text URL)
  await fixField('et_turnos', 'pdf_generado', 'text', 'PDF Generado (URL)');

  // 2. et_notas_clinicas.contenido (richText unsupported → text)
  await fixField('et_notas_clinicas', 'contenido', 'text', 'Contenido', true);

  log('\n✅ Fix completado', 'green');
}

main().catch(err => {
  log(`❌ ${err.message}`, 'red');
  process.exit(1);
});
