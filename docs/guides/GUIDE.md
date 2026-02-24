---
depends_on: [CLAUDE.md, AGENTS.md]
impacts: []
---

# G_NB_Apps — User Guide

## Inicio Rapido

1. **Configurar entorno**: Copiar `.env.example` a `.env` y completar las variables
2. **Instalar dependencias**: `npm install`
3. **Verificar conexion**: `npm run nb:collections list`

## Comandos Disponibles

| Comando | Descripcion |
| ------- | ----------- |
| `/help` | Muestra esta guia |
| `/project-status` | Estado del proyecto (git, tareas, metricas) |
| `/quick-review` | Revision rapida de cambios recientes |
| `/team-review` | Revision paralela (codigo + tests + docs) |
| `/create-tests` | Generar tests unitarios |
| `/update-docs` | Sincronizar documentacion |
| `/insights-review` | Analisis de uso e insights |

## Agentes Disponibles

| Agente | Vendor | Uso |
| ------ | ------ | --- |
| researcher | Codex | Investigacion profunda, documentacion |
| code-reviewer | Claude | Revision de codigo, seguridad |
| code-analyst | Gemini | Analisis de arquitectura |
| doc-writer | Gemini | Documentacion del proyecto |
| test-writer | Gemini | Generacion de tests |
| db-analyst | Claude | Analisis de BD y schemas NocoBase |
| deployer | Gemini | Configuracion de deploy |

## Aplicaciones

| App | Directorio | Descripcion |
| --- | ---------- | ----------- |
| UGCO | Apps/UGCO/ | Gestion de Casos Oncologicos |
| AGENDA | Apps/AGENDA/ | Agenda Medica |
| BUHO | Apps/BUHO/ | Base de Pacientes |
| ENTREGA | Apps/ENTREGA/ | Entrega de Turno |

## Documentacion

- `CLAUDE.md` — Reglas del workspace para Claude Code
- `AGENTS.md` — Manifiesto de agentes y equipos
- `GEMINI.md` — Configuracion para Gemini CLI
- `docs/standards/` — Estandares de gobernanza
- `docs/TODO.md` — Tareas pendientes
- `docs/DEVLOG.md` — Registro de desarrollo
- `docs/audit/` — Reportes de auditoria
