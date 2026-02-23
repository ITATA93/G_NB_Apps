/**
 * TEMP_10 — Find the actual tab schemas where content should be inserted
 * and insert table blocks there
 */
import { createClient, log } from '../ApiClient';
const client = createClient();

function uid() {
  return Math.random().toString(36).slice(2, 14);
}

// Page configs: menuUid -> collection + columns
const pageConfigs: Record<string, { collection: string; columns: string[] }> = {
  'et_dashboard': { collection: 'et_pacientes_censo', columns: ['sala', 'cama', 'nombre', 'especialidad_clinica', 'medico_tratante_alma', 'dx_principal'] },
  'et_vista_global': { collection: 'et_pacientes_censo', columns: ['cama', 'nombre', 'especialidad_clinica', 'dx_principal', 'medico_tratante_alma', 'dias_hospitalizacion', 'caso_social'] },
  'et_medicina': { collection: 'et_entrega_paciente', columns: ['paciente_censo_id', 'dx_principal', 'plan_tratamiento', 'pendientes', 'estado_paciente'] },
  'et_cirugia': { collection: 'et_entrega_paciente', columns: ['paciente_censo_id', 'dx_principal', 'plan_tratamiento', 'pendientes', 'estado_paciente'] },
  'et_pediatria': { collection: 'et_entrega_paciente', columns: ['paciente_censo_id', 'dx_principal', 'plan_tratamiento', 'pendientes', 'estado_paciente'] },
  'et_obst_gin': { collection: 'et_entrega_paciente', columns: ['paciente_censo_id', 'dx_principal', 'plan_tratamiento', 'pendientes', 'estado_paciente'] },
  'et_neonatologia': { collection: 'et_entrega_paciente', columns: ['paciente_censo_id', 'dx_principal', 'plan_tratamiento', 'pendientes', 'estado_paciente'] },
  'et_traumatologia': { collection: 'et_entrega_paciente', columns: ['paciente_censo_id', 'dx_principal', 'plan_tratamiento', 'pendientes', 'estado_paciente'] },
  'et_uci_uti': { collection: 'et_entrega_paciente', columns: ['paciente_censo_id', 'dx_principal', 'plan_tratamiento', 'pendientes', 'estado_paciente'] },
  'et_historial': { collection: 'et_turnos', columns: ['fecha', 'turno', 'especialidad', 'estado'] },
  'et_enf_mq1': { collection: 'et_entrega_enfermeria', columns: ['paciente_censo_id', 'dx_confirmados', 'dispositivo_invasivo', 'medicamentos', 'observaciones'] },
  'et_enf_mq2': { collection: 'et_entrega_enfermeria', columns: ['paciente_censo_id', 'dx_confirmados', 'dispositivo_invasivo', 'medicamentos', 'observaciones'] },
  'et_enf_mq3': { collection: 'et_entrega_enfermeria', columns: ['paciente_censo_id', 'dx_confirmados', 'dispositivo_invasivo', 'medicamentos', 'observaciones'] },
  'et_enf_uci': { collection: 'et_entrega_enfermeria', columns: ['paciente_censo_id', 'dx_confirmados', 'dispositivo_invasivo', 'medicamentos', 'observaciones'] },
  'et_enf_uti': { collection: 'et_entrega_enfermeria', columns: ['paciente_censo_id', 'dx_confirmados', 'dispositivo_invasivo', 'medicamentos', 'observaciones'] },
  'et_enf_ped': { collection: 'et_entrega_enfermeria', columns: ['paciente_censo_id', 'dx_confirmados', 'dispositivo_invasivo', 'medicamentos', 'observaciones'] },
  'et_enf_obst': { collection: 'et_entrega_enfermeria', columns: ['paciente_censo_id', 'dx_confirmados', 'dispositivo_invasivo', 'medicamentos', 'observaciones'] },
};

function buildTableSchema(collection: string, columns: string[]) {
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
    _isJSONSchemaObject: true, version: '2.0', type: 'void',
    'x-component': 'Grid', 'x-initializer': 'page:addBlock',
    properties: {
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
    }
  };
}

async function main() {
  // Step 1: Get all desktop routes to find tabs
  log('\n=== Getting route → tab mapping ===\n', 'cyan');
  const routesResp = await client.get('/desktopRoutes:list', { pageSize: 200, sort: ['id'] }) as { 
    data: { id: number; title?: string; type?: string; schemaUid?: string; menuSchemaUid?: string; parentId?: number }[] 
  };
  const routes = routesResp.data || [];
  
  // Build parent-children map
  const childMap = new Map<number, typeof routes>();
  for (const r of routes) {
    if (r.parentId) {
      if (!childMap.has(r.parentId)) childMap.set(r.parentId, []);
      childMap.get(r.parentId)!.push(r);
    }
  }

  // Find all ENTREGA/ENF page routes and their tab children
  const pageRoutes = routes.filter(r => r.type === 'page' && r.menuSchemaUid && pageConfigs[r.menuSchemaUid]);
  
  log(`  Found ${pageRoutes.length} page routes to fill\n`, 'white');

  for (const pageRoute of pageRoutes) {
    const config = pageConfigs[pageRoute.menuSchemaUid!];
    if (!config) continue;
    
    // Find the tab child
    const children = childMap.get(pageRoute.id) || [];
    const tabRoute = children.find(c => c.type === 'tabs');
    
    const targetUid = tabRoute?.schemaUid || pageRoute.schemaUid;
    if (!targetUid) {
      log(`  ⚠️ ${pageRoute.title}: no target schema found`, 'yellow');
      continue;
    }

    log(`  ${pageRoute.title} → tab schema: ${targetUid}`, 'gray');

    // Check if tab schema already has content
    try {
      const tabSchema = await client.get(`/uiSchemas:getJsonSchema/${targetUid}`) as { data: { properties?: Record<string, unknown> } };
      const hasContent = Object.keys(tabSchema.data?.properties || {}).length > 0;
      if (hasContent) {
        log(`    ✅ Already has content, skipping`, 'green');
        continue;
      }
    } catch {
      log(`    Tab schema doesn't exist yet, will create fresh`, 'yellow');
    }

    // Insert table block into the tab schema
    const tableSchema = buildTableSchema(config.collection, config.columns);
    try {
      await client.post(`/uiSchemas:insertAdjacent/${targetUid}?position=beforeEnd`, { schema: tableSchema });
      log(`    ✅ Table block added (${config.collection}, ${config.columns.length} cols)`, 'green');
    } catch (err: unknown) {
      log(`    ❌ Failed: ${err instanceof Error ? err.message : ''}`, 'red');
    }
  }

  log('\n=== DONE — Reload browser ===\n', 'cyan');
}

main().catch(e => { console.error(e.message); process.exit(1); });
