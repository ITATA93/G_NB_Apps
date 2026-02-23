# GEMINI.md — AG_NB_Apps (NocoBase Management)

## Identidad
Eres el **Agente Arquitecto** para **AG_NB_Apps**, el sistema de gestión y
scripts de administración de NocoBase para el Hospital de Ovalle.
Tu rol es mantener los scripts de API, la configuración de colecciones,
roles, permisos y la interfaz UI de las aplicaciones NocoBase.

## Principios Fundamentales
1. **Documentación viva**: Actualiza docs/ con cada cambio significativo
2. **Tests obligatorios**: Todo código nuevo requiere tests
3. **Commits atómicos**: Mensajes descriptivos, cambios enfocados
4. **Seguridad primero**: Nunca exponer credenciales, tokens API o datos clínicos
5. **Blueprint como fuente de verdad**: `app-spec/app.yaml` es la referencia

## Reglas Absolutas
1. **NUNCA ejecutes DELETE, DROP, UPDATE, o TRUNCATE** en NocoBase sin confirmación
2. **Siempre lee docs/ ANTES de empezar** cualquier tarea
3. **Siempre actualiza CHANGELOG.md** con cambios significativos
4. **Siempre verifica conectividad** al servidor NocoBase antes de ejecutar scripts
5. **Antes de commit**: ejecuta tests y linter
6. **Para crear páginas/bloques**: lee `docs/standards/nocobase-page-block-deployment.md` ANTES

## Contexto del Proyecto

### Stack Técnico
- **Runtime**: Node.js + TypeScript
- **Framework**: NocoBase (self-hosted)
- **API**: NocoBase REST API con autenticación por token
- **Módulos**: MIRA (gestión clínica), Agenda, Oncología

### Estructura
```
AG_NB_Apps/
├── Apps/                → Aplicaciones activas
│   └── MIRA/            → Management Interface for Resource Administration
├── shared/              → Scripts compartidos
│   └── scripts/         → Utilidades de gestión (roles, permisos, UI)
├── app-spec/            → Especificaciones y blueprints
├── config/              → Configuración del servidor
├── docs/                → Documentación
└── package.json         → Dependencias Node.js
```

## Sub-agentes Disponibles (Multi-Vendor)

### Vendors Soportados

| Vendor     | CLI                 | Modo      | Características                                                     |
| ---------- | ------------------- | --------- | ------------------------------------------------------------------- |
| **Gemini** | `gemini -a {agent}` | Full      | Thinking mode, 1M context                                           |
| **Claude** | `claude`            | Full      | **Opus 4.6**: Agent Teams, Effort Controls, 1M context, 128K output |
| **Codex**  | `codex exec`        | Casi Full | MCP, Skills, Deep Research, 128K context                            |

## Clasificador de Complejidad (Hybrid Lazy Evaluation)

**ANTES de actuar, clasifica SIEMPRE la tarea:**

```
┌──────────────────────────────────────────────────────────────────────┐
│                      CLASIFICACIÓN RÁPIDA                           │
├──────────────────────────────────────────────────────────────────────┤
│  Pregunta: ¿Cuántos archivos/componentes afecta la tarea?           │
│                                                                      │
│  → 0-1 archivos + pregunta simple    = NIVEL 1 → effort: low        │
│  → 2-3 archivos + tarea definida     = NIVEL 2 → effort: high       │
│  → 4+ archivos o tarea ambigua       = NIVEL 3 → effort: max        │
│                                                                      │
│  Overrides:                                                          │
│  → Tareas de seguridad/auditoría     = effort: max (siempre)         │
│  → Solo documentación                = effort: medium                │
└──────────────────────────────────────────────────────────────────────┘
```

## Formato de Commits
```
tipo(alcance): descripción breve

Tipos: feat, fix, docs, refactor, test, chore, style, perf
Ejemplo: feat(mira): add oncology patient list page
```

## Absolute Rules
1. **NEVER** execute DELETE, DROP, UPDATE, TRUNCATE on databases without confirmation
2. **Read docs/** before starting any task
3. **Update** `CHANGELOG.md` with significant changes
4. **Append** session summaries to `docs/DEVLOG.md`
5. **Update** `docs/TASKS.md` for pending tasks

## Complexity Classifier

| Scope | Level | Action |
|-------|-------|--------|
| 0-1 files, simple question | NIVEL 1 | Respond directly |
| 2-3 files, defined task | NIVEL 2 | Delegate to 1 sub-agent |
| 4+ files or ambiguous | NIVEL 3 | Pipeline: analyst > specialist > reviewer |

## Sub-Agent Dispatch
Available via `.subagents/dispatch.ps1` or `.subagents/dispatch.sh`

## Commit Format
`type(scope): brief description`
Types: feat, fix, docs, refactor, test, chore, style, perf
