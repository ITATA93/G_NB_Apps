---
name: clinical-app-pipeline
description: Pipeline completo de generacion de app clinica — desde consenso de expertos hasta app funcional.
depends_on: [clinical-consensus-panel.md, 10_nocobase_intake.md, 11_nocobase_generate_spec.md, 12_nocobase_configure_ui.md, 14_nocobase_audit.md]
---
# Workflow: Clinical App Pipeline

## Objetivo
Generar una aplicacion clinica funcional en NocoBase partiendo de una necesidad de salud,
pasando por deliberacion de expertos clinicos, especificacion validada, configuracion y auditoria.

## Flujo Completo

```
Necesidad Clinica
      |
      v
[1. Clinical Consensus Panel]  -- 5 expertos clinicos deliberan
      |
      v
[2. HITL Gate: Aprobacion]     -- Usuario revisa y aprueba consenso
      |
      v
[3. NocoBase Intake]           -- Convierte consenso en blueprint (app.yaml)
      |
      v
[4. Generate Spec]             -- Genera app-spec/app.yaml completo
      |
      v
[5. HITL Gate: Review Spec]    -- Usuario revisa app.yaml antes de aplicar
      |
      v
[6. Configure UI]              -- Aplica configuracion en NocoBase via API/browser
      |
      v
[7. Audit]                     -- Verifica estado vs especificacion (PASS/FAIL)
```

## Pasos Detallados

### Paso 1: Clinical Consensus Panel
- **Workflow**: `clinical-consensus-panel.md`
- **Team**: `clinical-consensus`
- **Input**: Descripcion textual de la necesidad clinica
- **Output**: Documento de consenso + borrador app.yaml

```bash
bash .subagents/dispatch-team.sh clinical-consensus "Descripcion de la necesidad clinica"
```

### Paso 2: HITL Gate — Aprobacion de Consenso
- **Accion**: Presentar documento de consenso al usuario
- **Criterio**: El usuario debe aprobar antes de continuar
- **Si rechaza**: Iterar panel con feedback del usuario

### Paso 3: NocoBase Intake
- **Workflow**: `10_nocobase_intake.md`
- **Input**: Documento de consenso aprobado (usado como requerimientos)
- **Output**: Blueprint estructurado con collections, roles, pantallas

### Paso 4: Generate Spec
- **Workflow**: `11_nocobase_generate_spec.md`
- **Input**: Blueprint del intake
- **Output**: `app-spec/app.yaml` completo y validado
- **Regla**: NO ejecutar acciones, solo generar YAML

### Paso 5: HITL Gate — Review Spec
- **Accion**: Presentar app.yaml al usuario para revision
- **Criterio**: Usuario confirma que la especificacion es correcta
- **Si rechaza**: Volver a paso 3 o 4 con correcciones

### Paso 6: Configure UI
- **Workflow**: `12_nocobase_configure_ui.md`
- **Input**: app-spec/app.yaml aprobado
- **Output**: Configuracion aplicada en NocoBase (collections, pages, blocks, permissions)

### Paso 7: Audit
- **Workflow**: `14_nocobase_audit.md`
- **Input**: app-spec/app.yaml como referencia
- **Output**: Reporte PASS/FAIL por cada item de la especificacion

## Invocacion Directa

```bash
# Pipeline completo (el orchestrator maneja los HITL gates)
bash .subagents/dispatch-team.sh clinical-app-pipeline "Necesidad clinica aqui"
```

## Notas
- Cada HITL gate es obligatorio. No se puede saltar la aprobacion humana.
- Si el audit falla, se genera un plan de remediacion automatico.
- El documento de consenso se archiva en `docs/research/` para trazabilidad.
