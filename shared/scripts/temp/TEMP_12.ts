/**
 * TEMP_12 — Insert table blocks into the _tabs schemas for ENTREGA pages
 * First creates proper tab structure, then inserts table blocks
 */
import { createClient, log } from '../ApiClient';
const client = createClient();

function uid() {
  return Math.random().toString(36).slice(2, 14);
}

// Mapping: tab schemaUid -> { collection, columns, title }
const tabConfigs: { tabUid: string; title: string; collection: string; columns: string[] }[] = [
  // Entrega de Turno pages
  { tabUid: '8dnirm1iban_tabs', title: 'Dashboard', collection: 'et_pacientes_censo', columns: ['sala', 'cama', 'nombre', 'especialidad_clinica', 'medico_tratante_alma', 'dx_principal'] },
  { tabUid: 'g2oonlkvguw_tabs', title: 'Vista Global', collection: 'et_pacientes_censo', columns: ['cama', 'nombre', 'especialidad_clinica', 'dx_principal', 'medico_tratante_alma', 'dias_hospitalizacion'] },
  { tabUid: '5bcr7inja0u_tabs', title: 'Medicina Interna', collection: 'et_entrega_paciente', columns: ['paciente_censo_id', 'dx_principal', 'plan_tratamiento', 'pendientes', 'estado_paciente'] },
  { tabUid: 'lhkjhpaysoj_tabs', title: 'Cirugía General', collection: 'et_entrega_paciente', columns: ['paciente_censo_id', 'dx_principal', 'plan_tratamiento', 'pendientes', 'estado_paciente'] },
  { tabUid: 'blfynskvl48_tabs', title: 'Pediatría', collection: 'et_entrega_paciente', columns: ['paciente_censo_id', 'dx_principal', 'plan_tratamiento', 'pendientes', 'estado_paciente'] },
  { tabUid: '7hsfk084jcx_tabs', title: 'Obst/Ginecología', collection: 'et_entrega_paciente', columns: ['paciente_censo_id', 'dx_principal', 'plan_tratamiento', 'pendientes', 'estado_paciente'] },
  { tabUid: 'hxeobhrflay_tabs', title: 'Neonatología', collection: 'et_entrega_paciente', columns: ['paciente_censo_id', 'dx_principal', 'plan_tratamiento', 'pendientes', 'estado_paciente'] },
  { tabUid: 'dfhhiy8gbhe_tabs', title: 'Traumatología', collection: 'et_entrega_paciente', columns: ['paciente_censo_id', 'dx_principal', 'plan_tratamiento', 'pendientes', 'estado_paciente'] },
  { tabUid: 'm0egbk32x5o_tabs', title: 'UCI / UTI', collection: 'et_entrega_paciente', columns: ['paciente_censo_id', 'dx_principal', 'plan_tratamiento', 'pendientes', 'estado_paciente'] },
  { tabUid: 'kqwbf3hjd4t_tabs', title: 'Historial', collection: 'et_turnos', columns: ['fecha', 'turno', 'especialidad', 'estado'] },
  // Enfermería pages
  { tabUid: 'ad6ldi72aac_tabs', title: 'Enf. MQ1', collection: 'et_entrega_enfermeria', columns: ['paciente_censo_id', 'dx_confirmados', 'dispositivo_invasivo', 'medicamentos', 'observaciones'] },
  { tabUid: '2xub2btulu5_tabs', title: 'Enf. MQ2', collection: 'et_entrega_enfermeria', columns: ['paciente_censo_id', 'dx_confirmados', 'dispositivo_invasivo', 'medicamentos', 'observaciones'] },
  { tabUid: '79icnuq3c9a_tabs', title: 'Enf. MQ3', collection: 'et_entrega_enfermeria', columns: ['paciente_censo_id', 'dx_confirmados', 'dispositivo_invasivo', 'medicamentos', 'observaciones'] },
  { tabUid: 'wx8kbcai3l6_tabs', title: 'Enf. UCI', collection: 'et_entrega_enfermeria', columns: ['paciente_censo_id', 'dx_confirmados', 'dispositivo_invasivo', 'medicamentos', 'observaciones'] },
  { tabUid: '2ej3hd6v7ar_tabs', title: 'Enf. UTI', collection: 'et_entrega_enfermeria', columns: ['paciente_censo_id', 'dx_confirmados', 'dispositivo_invasivo', 'medicamentos', 'observaciones'] },
  { tabUid: 'sd0pjh1bkra_tabs', title: 'Enf. PED', collection: 'et_entrega_enfermeria', columns: ['paciente_censo_id', 'dx_confirmados', 'dispositivo_invasivo', 'medicamentos', 'observaciones'] },
  { tabUid: 'dc4p3a6vlx3_tabs', title: 'Enf. OBST', collection: 'et_entrega_enfermeria', columns: ['paciente_censo_id', 'dx_confirmados', 'dispositivo_invasivo', 'medicamentos', 'observaciones'] },
];

function buildTableGrid(collection: string, columns: string[]) {
  const gridRowUid = uid();
  const gridColUid = uid();
  const blockUid = uid();
  const tableUid = uid();
  const actionsUid = uid();

  const columnProps: Record<string, unknown> = {};
  for (const col of columns) {
    columnProps[uid()] = {
      _isJSONSchemaObject: true, version: '2.0', type: 'void',
      'x-decorator': 'TableV2.Column.Decorator', 'x-component': 'TableV2.Column',
      properties: {
        [col]: {
          _isJSONSchemaObject: true, version: '2.0',
          'x-collection-field': `${collection}.${col}`,
          'x-component': 'CollectionField', 'x-component-props': {},
          'x-read-pretty': true, 'x-decorator': null, 'x-decorator-props': {},
        }
      }
    };
  }

  return {
    [gridRowUid]: {
      _isJSONSchemaObject: true, version: '2.0', type: 'void', 'x-component': 'Grid.Row',
      properties: {
        [gridColUid]: {
          _isJSONSchemaObject: true, version: '2.0', type: 'void', 'x-component': 'Grid.Col',
          properties: {
            [blockUid]: {
              _isJSONSchemaObject: true, version: '2.0', type: 'void',
              'x-decorator': 'TableBlockProvider',
              'x-acl-action': `${collection}:list`,
              'x-decorator-props': {
                collection, dataSource: 'main', action: 'list',
                params: { pageSize: 50 }, rowKey: 'id', showIndex: true, dragSort: false,
              },
              'x-component': 'CardItem', 'x-filter-targets': [],
              properties: {
                [actionsUid]: {
                  _isJSONSchemaObject: true, version: '2.0', type: 'void',
                  'x-initializer': 'table:configureActions', 'x-component': 'ActionBar',
                  'x-component-props': { style: { marginBottom: 'var(--nb-spacing)' } },
                },
                [tableUid]: {
                  _isJSONSchemaObject: true, version: '2.0', type: 'array',
                  'x-initializer': 'table:configureColumns', 'x-component': 'TableV2',
                  'x-component-props': { rowKey: 'id', rowSelection: { type: 'checkbox' } },
                  properties: columnProps,
                }
              }
            }
          }
        }
      }
    }
  };
}

async function main() {
  log('\n=== Inserting table blocks into _tabs schemas ===\n', 'cyan');

  // First, let's look at what a working tab looks like (Buscar Paciente uses tab 0os35cl0afn)
  log('Reference: Examining working tab schema...', 'gray');
  try {
    const ref = await client.get('/uiSchemas:getJsonSchema/0os35cl0afn') as { data: Record<string, unknown> };
    log(`  Working tab component: ${ref.data?.['x-component']}`, 'gray');
    log(`  Working tab props: ${Object.keys(ref.data?.properties || {}).length}`, 'gray');
    const firstProp = Object.entries(ref.data?.properties || {})[0];
    if (firstProp) {
      const [key, val] = firstProp;
      const v = val as Record<string, unknown>;
      log(`  First child: ${key} component=${v['x-component']}`, 'gray');
    }
  } catch { log('  Could not read reference tab', 'yellow'); }

  // For each tab, we need to:
  // 1. First create a proper Tabs.TabPane child
  // 2. Then in that TabPane, add the Grid with table block
  for (const config of tabConfigs) {
    log(`\n  ${config.title} → ${config.tabUid}`, 'white');
    
    const tabPaneUid = uid();
    const gridUid = uid();
    const tableGrid = buildTableGrid(config.collection, config.columns);

    // Create TabPane with Grid content
    const tabPaneSchema = {
      _isJSONSchemaObject: true,
      version: '2.0',
      type: 'void',
      title: config.title,
      'x-component': 'Tabs.TabPane',
      'x-designer': 'Tabs.Designer',
      'x-component-props': {},
      properties: {
        [gridUid]: {
          _isJSONSchemaObject: true,
          version: '2.0',
          type: 'void',
          'x-component': 'Grid',
          'x-initializer': 'page:addBlock',
          properties: tableGrid,
        }
      }
    };

    try {
      await client.post(`/uiSchemas:insertAdjacent/${config.tabUid}?position=beforeEnd`, {
        schema: {
          ...tabPaneSchema,
          'x-uid': tabPaneUid,
          name: tabPaneUid,
        }
      });
      log(`    ✅ TabPane + Table created (${config.collection})`, 'green');
    } catch (err: unknown) {
      log(`    ❌ ${err instanceof Error ? err.message : String(err)}`, 'red');
    }
  }

  log('\n=== DONE — Reload browser ===\n', 'cyan');
}

main().catch(e => { console.error(e.message); process.exit(1); });
