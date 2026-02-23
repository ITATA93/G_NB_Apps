---
name: nocobase-intake
description: Convertir requerimientos en App Blueprint (app-spec/app.yaml).
---

# Workflow: nocobase-intake

## Objetivo
Convertir requerimientos (texto) en un App Blueprint completo (app-spec/app.yaml) y marcar supuestos.

## Pasos
1) Recolectar requerimientos minimos:
   - objetivo de la app
   - usuarios/roles
   - entidades principales (collections)
   - pantallas principales
   - integraciones/workflows
2) Generar o actualizar app-spec/app.yaml.
3) Devolver:
   - resumen del blueprint
   - decisiones y supuestos
   - checklist DoD inicial
