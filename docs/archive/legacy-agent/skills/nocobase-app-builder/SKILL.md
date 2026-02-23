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

## Protocolo
1) Actualizar el blueprint antes de cambios grandes.
2) Elegir modo:
   - UI para configuracion visual / administrativa
   - API para seed/auditoria/tareas repetibles (preferir swagger)
   - Hybrid por defecto
3) Seguridad:
   - no escribir secretos
   - pedir review antes de terminal/browser si la policy lo requiere
4) Evidencia:
   - checklist DoD PASS/FAIL
   - resumen de cambios y verificacion

## Herramientas locales
- scripts/nocobase_call.py
- scripts/nocobase_swagger_dump.py
- scripts/nocobase_seed.py
