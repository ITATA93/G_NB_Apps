# 60 - Modos de ejecucion (UI vs API vs Hybrid)

## UI (Browser Agent)
Usar cuando:
- necesitas configurar UI (pages/blocks/actions) y no hay endpoint claro
- quieres evidencia visual

## API (HTTP)
Usar cuando:
- quieres repetibilidad y auditoria
- tienes API Key y permisos
- puedes descubrir endpoints con swagger

## Hybrid (recomendado)
- UI para configuracion visual
- API para seed, auditoria y tareas repetibles
