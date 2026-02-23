# 50 - App Blueprint (NocoBase) como contrato

## Source of truth
- app-spec/app.yaml es la fuente de verdad.
- Toda configuracion relevante debe reflejarse alli.

## Que cubre el blueprint
- Modelo de datos: collections, fields, relaciones (alto nivel)
- Roles/permisos: rol minimo para automatizacion + roles de negocio
- UI: menus y paginas (alto nivel)
- Workflows: triggers y estados (alto nivel)
- Seed: datos iniciales (opcional)

## Reglas
- Cambios grandes: editar primero blueprint, luego aplicar
- Cambios urgentes en UI: permitir, pero luego backport al blueprint
