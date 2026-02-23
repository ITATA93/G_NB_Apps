/**
 * TEMP_07 — Discover onco_* collections and their fields
 */
import { createClient, log } from '../ApiClient';
const client = createClient();

async function main() {
  log('\n── ONCOLOGÍA COLLECTIONS ──\n', 'cyan');

  const prefixes = ['onco_'];
  const collectionsResp = await client.get('/collections', { paginate: false }) as { data: Record<string, unknown>[] };
  const collections = (collectionsResp.data || collectionsResp) as Record<string, unknown>[];
  
  for (const col of collections) {
    const name = col.name as string;
    if (!prefixes.some(p => name.startsWith(p))) continue;
    
    log(`\n📋 ${name} — "${col.title || '(no title)'}"`, 'cyan');
    log(`   category: ${col.category || 'none'}, hidden: ${col.hidden || false}`, 'gray');
    
    // Get fields
    try {
      const fieldsResp = await client.get(`/collections/${name}/fields:list`, { paginate: false }) as { data: Record<string, unknown>[] };
      const fields = (fieldsResp.data || fieldsResp) as Record<string, unknown>[];
      const userFields = fields.filter(f => 
        !['id', 'createdAt', 'updatedAt', 'createdById', 'updatedById', 'sort'].includes(f.name as string)
      );
      
      for (const f of userFields) {
        const rel = f.target ? ` → ${f.target}` : '';
        log(`   - ${f.name}: ${f.type} (${f.interface || 'none'})${rel}`, 'white');
      }
      log(`   Total custom fields: ${userFields.length}`, 'green');
    } catch (_e) {
      log(`   ❌ Could not fetch fields`, 'red');
    }
  }

  // Also check ugco_*
  log('\n── UGCO COLLECTIONS ──\n', 'cyan');
  for (const col of collections) {
    const name = col.name as string;
    if (!name.startsWith('ugco_')) continue;
    log(`📋 ${name} — "${col.title || '(no title)'}"`, 'cyan');
    try {
      const fieldsResp = await client.get(`/collections/${name}/fields:list`, { paginate: false }) as { data: Record<string, unknown>[] };
      const fields = (fieldsResp.data || fieldsResp) as Record<string, unknown>[];
      const userFields = fields.filter(f => 
        !['id', 'createdAt', 'updatedAt', 'createdById', 'updatedById', 'sort'].includes(f.name as string)
      );
      for (const f of userFields) {
        log(`   - ${f.name}: ${f.type} (${f.interface || 'none'})`, 'white');
      }
    } catch (_e) {
      log(`   ❌ Could not fetch fields`, 'red');
    }
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
