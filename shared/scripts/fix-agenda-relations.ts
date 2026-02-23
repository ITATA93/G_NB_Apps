/**
 * Fix belongsTo relations for AGENDA module.
 * NocoBase requires foreignKey != field name. Using `_fk` suffix.
 * Run: npx tsx shared/scripts/fix-agenda-relations.ts
 */
import { createClient, log } from './ApiClient.ts';

interface RelationDef {
    collection: string;
    name: string;
    target: string;
    foreignKey: string;
    title: string;
}

const RELATIONS: RelationDef[] = [
    // ag_funcionarios
    { collection: 'ag_funcionarios', name: 'servicio', target: 'ag_servicios', foreignKey: 'servicio_fk', title: 'Servicio' },

    // ag_bloques_agenda
    { collection: 'ag_bloques_agenda', name: 'funcionario', target: 'ag_funcionarios', foreignKey: 'funcionario_fk', title: 'Funcionario' },
    { collection: 'ag_bloques_agenda', name: 'categoria', target: 'ag_categorias_actividad', foreignKey: 'categoria_fk', title: 'Categoría' },
    { collection: 'ag_bloques_agenda', name: 'servicio', target: 'ag_servicios', foreignKey: 'servicio_fk', title: 'Servicio' },

    // ag_inasistencias
    { collection: 'ag_inasistencias', name: 'funcionario', target: 'ag_funcionarios', foreignKey: 'funcionario_fk', title: 'Funcionario' },
    { collection: 'ag_inasistencias', name: 'tipo_inasistencia', target: 'ag_tipos_inasistencia', foreignKey: 'tipo_inasistencia_fk', title: 'Tipo' },

    // ag_resumen_diario
    { collection: 'ag_resumen_diario', name: 'funcionario', target: 'ag_funcionarios', foreignKey: 'funcionario_fk', title: 'Funcionario' },

    // ag_resumen_semanal
    { collection: 'ag_resumen_semanal', name: 'funcionario', target: 'ag_funcionarios', foreignKey: 'funcionario_fk', title: 'Funcionario' },
];

async function main() {
    const client = createClient();
    let created = 0;
    let errors = 0;

    log('🔗 Creando relaciones belongsTo para AGENDA...\n', 'cyan');

    for (const rel of RELATIONS) {
        try {
            await client.post(`/collections/${rel.collection}/fields:create`, {
                name: rel.name,
                type: 'belongsTo',
                interface: 'obo',
                target: rel.target,
                foreignKey: rel.foreignKey,
                uiSchema: {
                    type: 'string',
                    title: rel.title,
                    'x-component': 'AssociationField',
                    'x-component-props': { fieldNames: { label: 'id', value: 'id' } },
                },
            });
            log(`  ✅ ${rel.collection}.${rel.name} → ${rel.target}`, 'green');
            created++;
        } catch (error: unknown) {
            const errMsg = error instanceof Error ? error.message : String(error);
            log(`  ❌ ${rel.collection}.${rel.name}: ${errMsg}`, 'red');
            errors++;
        }
    }

    log(`\n📊 Relaciones: ${created} creadas, ${errors} errores\n`, errors > 0 ? 'yellow' : 'green');
}

main().catch(console.error);
