# Add Blocks to Pages
# UGCO
Write-Host "Adding blocks to UGCO pages..."
npx tsx shared/scripts/add-block-to-page.ts 346483314196484 onco_casos --type table
npx tsx shared/scripts/add-block-to-page.ts 346483314196487 onco_comite_sesiones --type table

# SGQ
Write-Host "Adding blocks to SGQ pages..."
npx tsx shared/scripts/add-block-to-page.ts 346483316293635 schedule_blocks --type table
npx tsx shared/scripts/add-block-to-page.ts 346483316293638 activity_types --type table

# Admin
Write-Host "Adding blocks to Admin pages..."
npx tsx shared/scripts/add-block-to-page.ts 346483316293643 staff --type table
npx tsx shared/scripts/add-block-to-page.ts 346483316293646 departments --type table

# Create Roles
Write-Host "Creating Roles..."
npx tsx shared/scripts/manage-roles.ts create --name "admin_clinico" --title "Administrador Clínico"
npx tsx shared/scripts/manage-roles.ts create --name "medico_onco" --title "Médico Oncólogo"
npx tsx shared/scripts/manage-roles.ts create --name "coord_pabellon" --title "Coordinador Pabellón"

# Grant Permissions - Admin Clinico
Write-Host "Granting Admin Clinico permissions..."
npx tsx shared/scripts/manage-roles.ts grant admin_clinico staff --actions list, create, update, view
npx tsx shared/scripts/manage-roles.ts grant admin_clinico onco_casos --actions list, create, update, view
npx tsx shared/scripts/manage-roles.ts grant admin_clinico schedule_blocks --actions list, create, update, view, destroy

# Grant Permissions - Medico Onco
Write-Host "Granting Medico Onco permissions..."
npx tsx shared/scripts/manage-roles.ts grant medico_onco onco_casos --actions list, view, update
npx tsx shared/scripts/manage-roles.ts grant medico_onco onco_episodios --actions list, create, view
npx tsx shared/scripts/manage-roles.ts grant medico_onco onco_comite_sesiones --actions list, view

# Grant Permissions - Coordinador Pabellon
Write-Host "Granting Coordinator Pabellon permissions..."
npx tsx shared/scripts/manage-roles.ts grant coord_pabellon schedule_blocks --actions list, create, update, view
npx tsx shared/scripts/manage-roles.ts grant coord_pabellon activity_blocks --actions list, view
npx tsx shared/scripts/manage-roles.ts grant coord_pabellon staff --actions list, view

Write-Host "Configuration Complete!"
