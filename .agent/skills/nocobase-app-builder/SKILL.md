---
name: nocobase-app-builder
description: Disena, configura y audita apps completas en NocoBase a partir de un App Blueprint (YAML) con especificación funcional.
---

# NocoBase App Builder Skill

## Cuando se activa
- "Configura una app en NocoBase"
- "Crea collections/fields y pantallas en NocoBase"
- "Automatiza configuracion de NocoBase con un blueprint"
- "Despliega una aplicación en NocoBase"
- "Genera blueprint funcional para NocoBase"

## Objetivo
Blueprint → Functional Analysis → Apply → Verify Journeys → Evidence

## ⚠️ ESTÁNDAR OBLIGATORIO: Page & Block Deployment
> **SIEMPRE lee `docs/standards/nocobase-page-block-deployment.md` ANTES de crear páginas o bloques.**
>
> Key discovery: Los bloques van en el `schemaUid` del hijo `type=tabs`, NO en el de la página.

## ⚠️ ESTÁNDAR OBLIGATORIO: Especificación Funcional
> **NUNCA despliegues una app sin sección `functional_spec` en el blueprint.**
>
> Un blueprint sin functional_spec produce solo maquetación básica (tablas planas),
> no una aplicación funcional con flujos de usuario, interacciones y reglas de negocio.

## Protocolo

### 1) Validar Blueprint
Antes de cualquier cambio:
a) Verificar que `functional_spec` existe para el módulo a configurar
b) **Si no existe → DETENER y generarla** usando workflow `10_nocobase_intake.md`
c) Validar que cada `page_key` en `ui.pages` tiene un `page_spec` correspondiente
d) Validar que cada rol tiene al menos 1 `user_journey` documentado
e) Validar que entidades con enums de ciclo de vida tienen `state_machine`

### 2) Análisis Funcional Pre-Deploy
Leer del `functional_spec`:
- **user_journeys** → Entender CÓMO usan la app los usuarios
- **page_specs** → Saber qué bloques, drawers, modals y filtros configurar
- **state_machines** → Planificar workflows de transición de estados
- **business_rules** → Identificar validaciones a implementar
Generar lista priorizada de configuraciones respetando dependencias

### 3) Elegir modo de ejecución
- **UI (browser)**: Para configuración visual / administrativa
- **API (scripts)**: Para seed/auditoría/tareas repetibles (preferir swagger)
- **Hybrid**: Por defecto (API para datos, browser para UI)

### 4) Ejecutar Deploy
Para deployments de UI (páginas, bloques, menús):
- Usar `deploy-routes.ts` para crear menús + páginas
- Usar `deploy-blocks.ts` para insertar bloques en páginas
- Seguir el estándar de `docs/standards/nocobase-page-block-deployment.md`

Para cada página, configurar según su `page_spec`:
- Bloques (table, form, chart, kanban, calendar, stat_cards)
- Data scopes y filtros
- Columnas con formato (anchos, tags, badges, truncate)
- Row actions (drawer con secciones, modal, inline_toggle)
- Bulk actions
- Formularios de detalle con secciones read-only vs editable

### 5) Seguridad
- No escribir secretos en archivos versionados
- Pedir review antes de terminal/browser si la policy lo requiere

### 6) Verificación Funcional
No basta con "la página abre". Verificar:

| Nivel | Qué verificar | Criterio PASS |
|-------|---------------|---------------|
| L1 Estructural | Páginas existen, menús visibles | Todas las page_keys del blueprint están en NocoBase |
| L2 Composición | Bloques correctos por página | Cada page_spec tiene sus bloques configurados |
| L3 Interacción | Drawers, modals, filtros | Click en fila abre el panel correcto con campos correctos |
| L4 Journeys | Flujos end-to-end | Cada user_journey se puede completar paso a paso |
| L5 Reglas | Validaciones y estados | State machines respetadas, business rules aplicadas |

### 7) Evidencia
- Checklist DoD PASS/FAIL **por user_journey** (no solo por página)
- Captura de cada página desplegada
- Validación de data scopes y acciones
- Desviaciones documentadas con workarounds

## Herramientas locales
- `shared/scripts/deploy-routes.ts` — Crear menús + páginas
- `shared/scripts/deploy-blocks.ts` — Insertar bloques (tablas) en páginas
- `shared/scripts/add-block-to-page.ts` — Agregar bloque individual
- `shared/scripts/ApiClient.ts` — Cliente HTTP para NocoBase API
- `scripts/nocobase_call.py` — Cliente HTTP genérico
- `scripts/nocobase_swagger_dump.py` — Extractor OpenAPI
- `scripts/nocobase_seed.py` — Seeder de datos

## Contraste: Maquetación vs Funcionalidad

### ❌ Solo Maquetación (INSUFICIENTE)
El agente crea páginas con tablas planas, sin filtros, sin drawers,
sin acciones contextuales. El usuario ve datos pero no puede trabajar.

### ✅ Especificación Funcional (CORRECTO)
El agente configura páginas con bloques compuestos, data scopes,
drawers con secciones de detalle, acciones bulk, y valida que
los user journeys completos funcionan end-to-end.
