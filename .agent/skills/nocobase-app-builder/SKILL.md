---
name: nocobase-app-builder
description: Disena, configura y audita apps completas en NocoBase a partir de un App Blueprint (YAML) usando UI automation y/o HTTP API.
---

# NocoBase App Builder Skill

## Cuando se activa
- "Configura una app en NocoBase"
- "Crea collections/fields y pantallas en NocoBase"
- "Automatiza configuracion de NocoBase con un blueprint"

## Objetivo
Blueprint -> Apply -> Audit -> Evidence

## ⚠️ ESTÁNDAR OBLIGATORIO: Page & Block Deployment
> **SIEMPRE lee `docs/standards/nocobase-page-block-deployment.md` ANTES de crear páginas o bloques.**
>
> Key discovery: Los bloques van en el `schemaUid` del hijo `type=tabs`, NO en el de la página.

## Protocolo
1) Actualizar el blueprint antes de cambios grandes.
2) Elegir modo:
   - UI para configuracion visual / administrativa
   - API para seed/auditoria/tareas repetibles (preferir swagger)
   - Hybrid por defecto
3) Para deployments de UI (páginas, bloques, menús):
   - Usar `deploy-routes.ts` para crear menús + páginas
   - Usar `deploy-blocks.ts` para insertar bloques en páginas
   - Seguir el estándar de `docs/standards/nocobase-page-block-deployment.md`
4) Seguridad:
   - no escribir secretos
   - pedir review antes de terminal/browser si la policy lo requiere
5) Evidencia:
   - checklist DoD PASS/FAIL
   - resumen de cambios y verificacion

## Herramientas locales
- `shared/scripts/deploy-routes.ts` — Crear menús + páginas
- `shared/scripts/deploy-blocks.ts` — Insertar bloques (tablas) en páginas
- `shared/scripts/add-block-to-page.ts` — Agregar bloque individual
- `shared/scripts/ApiClient.ts` — Cliente HTTP para NocoBase API
- `scripts/nocobase_call.py` — Cliente HTTP genérico
- `scripts/nocobase_swagger_dump.py` — Extractor OpenAPI
- `scripts/nocobase_seed.py` — Seeder de datos
