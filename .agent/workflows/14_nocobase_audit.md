---
name: nocobase-audit
description: Auditar estado real vs app-spec/app.yaml y reportar PASS/FAIL.
---

# Workflow: nocobase-audit

## Objetivo
Comparar estado real vs app-spec/app.yaml y producir reporte PASS/FAIL.

## Pasos
1) Cargar app-spec/app.yaml.
2) Validar (segun capacidades):
   - collections esperadas existen
   - endpoints CRUD basicos responden (si hay API)
   - roles/permisos (checklist manual si no hay API)
3) Salida:
   - reporte con hallazgos
   - acciones correctivas
