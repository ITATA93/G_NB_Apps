# 00 - Contexto del Workspace (NocoBase App Builder)

## Proposito
Este workspace usa Antigravity para operar un agente que:
- convierte requerimientos en un App Blueprint (YAML)
- configura apps completas en NocoBase (data model, roles/permisos, UI, workflows)
- verifica y documenta cambios con evidencia

## Principios
1) Blueprint-first: no cambios grandes sin actualizar app-spec/app.yaml
2) Seguridad por defecto: no secretos, no comandos destructivos
3) Repetibilidad: preferir acciones auditables (API/Swagger) cuando sea posible
4) Evidencia: todo cambio importante debe dejar rastro (plan, diff, log, checklist)

## Output esperado
Cuando se pida configuracion/entregables:
1) arbol de carpetas
2) archivos completos
3) checklist DoD
4) supuestos y como validarlos

## Estructura del Workspace
- **Apps/**: Contenedor principal de aplicaciones (ej: UGCO, BUHO).
- **Apps/_APP_TEMPLATE**: Plantilla estandar para nuevas aplicaciones.
- **MIRA/**: Recursos compartidos y documentacion legacy.
- **scripts/**: Scripts de automatizacion globales.

