/**
 * TEMP_06 — Rename críptic role r_gd0z1pmdmii to cirujano_residente
 * 
 * NocoBase doesn't allow renaming role.name (it's the PK), so we:
 * 1. Get the current role details
 * 2. Ensure the title is descriptive
 * 3. Report what we can do
 */
import { createClient, log } from '../ApiClient';
const client = createClient();

async function main() {
  log('\n── ROLE RENAME AUDIT ──\n', 'cyan');

  // Get the críptic role details
  try {
    const resp = await client.get('/roles:get?filterByTk=r_gd0z1pmdmii', {}) as Record<string, unknown>;
    const role = (resp.data || resp) as Record<string, unknown>;
    log(`  Current: name=${role.name}, title=${role.title}`, 'white');

    // Check if title already set
    if (role.title === 'Cirujano Residente') {
      log('  ✅ Title already correct, no action needed', 'green');
      return;
    }

    // Update title to something descriptive
    await client.post('/roles:update?filterByTk=r_gd0z1pmdmii', {
      title: 'Cirujano Residente',
    });
    log('  ✅ Title updated to "Cirujano Residente"', 'green');

    // Verify
    const verify = await client.get('/roles:get?filterByTk=r_gd0z1pmdmii', {}) as Record<string, unknown>;
    const updated = (verify.data || verify) as Record<string, unknown>;
    log(`  Verified: name=${updated.name}, title=${updated.title}`, 'green');

    // Note: NocoBase doesn't support renaming role.name (PK)
    // The internal name r_gd0z1pmdmii will remain, but the display title is now clear
    log('\n  ⚠️ Note: role.name is a PK and cannot be renamed via API.', 'yellow');
    log('  The display title "Cirujano Residente" is now set.', 'yellow');

  } catch (e: unknown) {
    log(`  ❌ Error: ${e instanceof Error ? e.message : String(e)}`, 'red');
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });
