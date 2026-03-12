---
name: nocobase-generate-spec
description: Generar el YAML blueprint completo con especificación funcional, sin ejecutar acciones.
---

# Workflow: nocobase-generate-spec

## Objetivo
Dado un set de requerimientos claros, producir app-spec/app.yaml listo para aplicar,
incluyendo la sección `functional_spec` obligatoria.

## Reglas
- No ejecutar terminal ni navegar salvo que el usuario lo pida.
- Output final: archivo YAML completo.

## Secciones Obligatorias del YAML

1. **Metadata**: `app.name`, `app.version`, `app.description`
2. **NocoBase Config**: `nocobase.base_url_env`, `api_key_env`
3. **Data Model**: `collections` con `fields`, tipos, relaciones
4. **Roles**: Permisos CRUD por colección
5. **UI**: Menús jerárquicos + páginas (`page_key`)
6. **Functional Spec** (OBLIGATORIO):
   - `user_journeys`: Flujos paso a paso por rol
   - `page_specs`: Composición de bloques por página
   - `state_machines`: Transiciones de estado por entidad
   - `business_rules`: Validaciones y lógica de negocio
7. **Seed**: Datos iniciales
8. **Workflows**: Automaciones y triggers
9. **AI Configuration** (NocoBase 2.0+):
   - Configuración para agentes y shortcuts ("AI Employees")
   - Acceso a base de conocimiento (documentos subidos, embeddings)
   - Permisos y variables de contexto en prompts

## Criterio de Calidad

### ❌ INSUFICIENTE (solo maquetación)
```yaml
pages:
  - key: 'mi_pagina'
    type: 'table'
    collection: 'mi_coleccion'
    columns: ['campo1', 'campo2']
    actions: ['create', 'view']
```

### ✅ COMPLETO (especificación funcional)
```yaml
pages:
  - key: 'mi_pagina'
    type: 'table'
    collection: 'mi_coleccion'
    columns: ['campo1', 'campo2']
    actions: ['create', 'view']

functional_spec:
  page_specs:
    - key: 'mi_pagina'
      layout: 'full_width'
      blocks:
        - type: 'table'
          collection: 'mi_coleccion'
          data_scope: { status: 'active' }
          columns:
            - { field: 'campo1', width: 200 }
            - { field: 'campo2', width: 150, tag_colors: {...} }
          row_actions:
            - { label: 'Editar', type: 'drawer', sections: [...] }
  user_journeys:
    - id: UJ-01
      actor: 'Usuario Principal'
      steps:
        - { action: 'Abrir página', page_key: 'mi_pagina', expects: '...' }
```

## Checklist Pre-Entrega
- [ ] Cada page_key tiene page_spec correspondiente en functional_spec
- [ ] Cada rol tiene al menos 1 user_journey
- [ ] Enums con ciclo de vida tienen state_machine
- [ ] Formularios de detalle especifican secciones y campos
- [ ] Data scopes explícitos en todas las páginas filtradas
