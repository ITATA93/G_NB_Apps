---
name: nocobase-configure-api
description: Aplicar/verificar partes del blueprint via HTTP API (API key) y swagger.
---

# Workflow: nocobase-configure-api

## Objetivo
Aplicar y/o verificar partes del blueprint via HTTP API.

## Pasos
1) Validar conectividad:
   - usar scripts/nocobase_call.py contra un endpoint permitido
2) Obtener swagger (si esta disponible):
   - ejecutar scripts/nocobase_swagger_dump.py
3) Con swagger:
   - no adivinar endpoints
   - ejecutar acciones resource:action necesarias
4) Evidencia:
   - comandos ejecutados (sin exponer API key)
   - resultados (status codes y resumen)
