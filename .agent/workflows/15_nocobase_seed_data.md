---
name: nocobase-seed-data
description: Cargar seed data definido en app-spec/app.yaml via API.
---

# Workflow: nocobase-seed-data

## Objetivo
Cargar seed data definido en app-spec/app.yaml.

## Pasos
1) Confirmar NOCOBASE_BASE_URL y NOCOBASE_API_KEY en entorno.
2) Ejecutar (terminal):
   - python scripts/nocobase_seed.py --spec app-spec/app.yaml
3) Verificar:
   - GET /api/<collection>:list refleja nuevos registros (si aplica)
