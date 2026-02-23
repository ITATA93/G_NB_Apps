/**
 * Auditoría completa: Estado actual vs App Blueprint
 */

import { createClient } from '../shared/scripts/ApiClient';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

interface BlueprintAudit {
  timestamp: string;
  collections: {
    expected: string[];
    found: string[];
    missing: string[];
    extra: string[];
  };
  roles: {
    expected: string[];
    found: string[];
    missing: string[];
  };
  summary: {
    collectionsMatch: boolean;
    rolesMatch: boolean;
    overallStatus: 'PASS' | 'PARTIAL' | 'FAIL';
  };
}

async function auditBlueprint(): Promise<BlueprintAudit> {
  console.log('🔍 Auditoría: Estado actual vs Blueprint\n');
  
  const client = createClient();
  
  // Leer blueprint
  const blueprintPath = path.join(process.cwd(), 'app-spec', 'app.yaml');
  const blueprintContent = fs.readFileSync(blueprintPath, 'utf-8');
  const blueprint = yaml.parse(blueprintContent);
  
  const audit: BlueprintAudit = {
    timestamp: new Date().toISOString(),
    collections: {
      expected: [],
      found: [],
      missing: [],
      extra: [],
    },
    roles: {
      expected: [],
      found: [],
      missing: [],
    },
    summary: {
      collectionsMatch: false,
      rolesMatch: false,
      overallStatus: 'FAIL',
    },
  };
  
  // COLECCIONES ESPERADAS del blueprint
  console.log('📦 Extrayendo colecciones del blueprint...');
  audit.collections.expected = blueprint.data_model.collections.map(
    (c: any) => c.name
  );
  console.log(`   Esperadas: ${audit.collections.expected.length}`);
  audit.collections.expected.forEach(name => console.log(`     - ${name}`));
  
  // COLECCIONES ACTUALES en NocoBase
  console.log('\n📡 Consultando colecciones en NocoBase...');
  const collectionsResponse = await client.get('/collections:list', {
    paginate: false,
  });
  
  audit.collections.found = collectionsResponse.data
    .map((c: any) => c.name)
    .filter((name: string) => !name.startsWith('_')); // Filtrar colecciones del sistema
  
  console.log(`   Encontradas: ${audit.collections.found.length}`);
  
  // COMPARAR
  audit.collections.missing = audit.collections.expected.filter(
    (name) => !audit.collections.found.includes(name)
  );
  
  audit.collections.extra = audit.collections.found.filter(
    (name) => !audit.collections.expected.includes(name)
  );
  
  // ROLES ESPERADOS
  console.log('\n👥 Extrayendo roles del blueprint...');
  audit.roles.expected = blueprint.roles.map((r: any) => r.name);
  console.log(`   Esperados: ${audit.roles.expected.length}`);
  audit.roles.expected.forEach(name => console.log(`     - ${name}`));
  
  // ROLES ACTUALES
  console.log('\n📡 Consultando roles en NocoBase...');
  const rolesResponse = await client.get('/roles:list', {
    paginate: false,
  });
  
  audit.roles.found = rolesResponse.data.map((r: any) => r.title || r.name);
  console.log(`   Encontrados: ${audit.roles.found.length}`);
  
  // COMPARAR
  audit.roles.missing = audit.roles.expected.filter(
    (name) => !audit.roles.found.some((found) => found.includes(name))
  );
  
  // RESUMEN
  audit.summary.collectionsMatch = audit.collections.missing.length === 0;
  audit.summary.rolesMatch = audit.roles.missing.length === 0;
  
  if (audit.summary.collectionsMatch && audit.summary.rolesMatch) {
    audit.summary.overallStatus = 'PASS';
  } else if (audit.collections.missing.length < audit.collections.expected.length / 2) {
    audit.summary.overallStatus = 'PARTIAL';
  } else {
    audit.summary.overallStatus = 'FAIL';
  }
  
  return audit;
}

// Ejecutar
auditBlueprint()
  .then((audit) => {
    // Guardar reporte
    const reportPath = path.join(process.cwd(), 'docs', `blueprint-audit-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(audit, null, 2));
    
    // Reporte en consola
    console.log('\n' + '═'.repeat(70));
    console.log('📊 RESUMEN DE AUDITORÍA');
    console.log('═'.repeat(70));
    
    console.log('\n📦 COLECCIONES:');
    console.log(`   Esperadas:  ${audit.collections.expected.length}`);
    console.log(`   Encontradas: ${audit.collections.found.length}`);
    console.log(`   ${audit.collections.missing.length === 0 ? '✅' : '❌'} Faltantes:  ${audit.collections.missing.length}`);
    if (audit.collections.missing.length > 0) {
      audit.collections.missing.forEach(name => console.log(`        - ${name}`));
    }
    console.log(`   ℹ️  Extras:     ${audit.collections.extra.length}`);
    
    console.log('\n👥 ROLES:');
    console.log(`   Esperados:   ${audit.roles.expected.length}`);
    console.log(`   Encontrados: ${audit.roles.found.length}`);
    console.log(`   ${audit.roles.missing.length === 0 ? '✅' : '❌'} Faltantes:   ${audit.roles.missing.length}`);
    if (audit.roles.missing.length > 0) {
      audit.roles.missing.forEach(name => console.log(`        - ${name}`));
    }
    
    console.log('\n🎯 ESTADO GENERAL:');
    const statusIcon = audit.summary.overallStatus === 'PASS' ? '✅' : 
                      audit.summary.overallStatus === 'PARTIAL' ? '⚠️' : '❌';
    console.log(`   ${statusIcon} ${audit.summary.overallStatus}`);
    
    console.log('\n═'.repeat(70));
    console.log(`\n✅ Reporte guardado: ${reportPath}\n`);
    
    process.exit(audit.summary.overallStatus === 'PASS' ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
