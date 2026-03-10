---
name: nocobase-intake
description: Convertir requerimientos en App Blueprint (app-spec/app.yaml) con especificación funcional completa.
---

# Workflow: nocobase-intake

## Objetivo
Convertir requerimientos (texto) en un App Blueprint completo (app-spec/app.yaml) que incluya
tanto el modelo de datos como la especificación funcional de la aplicación.

## Pasos

### 1) Recolectar requerimientos mínimos (infraestructura)
- Objetivo de la app
- Usuarios/roles y sus responsabilidades
- Entidades principales (collections) con campos y relaciones
- Pantallas principales
- Integraciones/workflows

### 2) Documentar especificación funcional (OBLIGATORIO)
Para cada módulo de la app, generar la sección `functional_spec`:

#### a) User Journeys
Para **cada rol principal**, documentar al menos 1 flujo paso a paso:
- ID único (UJ-XX-NN)
- Actor y frecuencia de uso
- Precondiciones
- Pasos secuenciales con: acción, page_key, interacción esperada, resultado
- Postcondiciones

#### b) Page Specs (Composición de Páginas)
Para **cada página**, especificar:
- Layout (full_width, sidebar, tabs)
- Bloques contenidos (table, form, chart, kanban, calendar, stat_cards)
- Data scope y filtros disponibles
- Columnas con anchos sugeridos y formato (tags, badges, truncate)
- Acciones por fila (drawer, modal, inline_toggle)
- Acciones bulk (iniciar proceso, exportar)
- Formularios de detalle en drawer/modal con secciones (read-only vs editable)

#### c) State Machines
Para entidades con ciclo de vida (estados), documentar:
- Estado inicial
- Transiciones válidas (from → to) con trigger y side_effects
- Estados terminales
- Constraints (quién puede hacer qué transición)

#### d) Business Rules
Reglas de validación y lógica que deben implementarse:
- ID único (BR-XX-NN)
- Descripción en lenguaje natural
- Entidad/campo afectado
- Lógica de la regla (condición + efecto)
- Roles requeridos (si aplica)

### 3) Generar o actualizar app-spec/app.yaml
Incluir TODAS las secciones:
- `data_model` (collections, fields, relations)
- `roles` (permisos CRUD)
- `ui` (menus, pages)
- `functional_spec` (user_journeys, page_specs, state_machines, business_rules)
- `seed` (datos iniciales)
- `workflows` (automaciones)

### 4) Devolver
- Resumen del blueprint
- Mapa de user journeys (tabla: ID | Actor | Nombre)
- Decisiones y supuestos marcados
- Checklist DoD inicial

## Validación de Completitud
Antes de considerar el intake completo, verificar:
- [ ] Cada rol tiene al menos 1 user journey documentado
- [ ] Cada page_key en ui.pages tiene un page_spec correspondiente
- [ ] Cada enum con ciclo de vida tiene state_machine documentada
- [ ] Cada página tiene data_scope explícito (no depender de defaults)
- [ ] Las interacciones (drawer, modal) especifican qué campos muestran
