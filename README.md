# G_NB_Apps — NocoBase Multi-App Management

> Satellite project in the Antigravity ecosystem.
> **Domain:** `02_HOSPITAL_PUBLICO` | **Orchestrator:** GEN_OS | **Prefix:** G_

## Proposito

Administracion y automatizacion de aplicaciones NocoBase para el Hospital de Ovalle.
Centraliza scripts de gestion de colecciones, campos, workflows, UI y permisos
para las apps clinicas desplegadas en la instancia MIRA.

| App | Descripcion | Estado |
|-----|-------------|--------|
| **UGCO** | Unidad de Gestion Clinica Oncologica | Activo |
| **ENTREGA** | Entrega de Turno Medica | Desplegado |
| **AGENDA** | Agenda Medica Hospitalaria | Blueprint |
| **BUHO** | Sistema de Gestion Clinica | En desarrollo |

## Arquitectura

```
G_NB_Apps/
  Apps/                 # Aplicaciones activas (UGCO, ENTREGA, AGENDA, BUHO)
  app-spec/             # Blueprint: app.yaml = fuente de verdad
  shared/scripts/       # 36 scripts TypeScript de gestion NocoBase API
  scripts/              # Automatizacion Python/PS1 (audit, seed, deploy)
  docs/                 # Documentacion, guias, reportes
  config/               # Configuracion del servidor
  package.json          # Dependencias Node.js + TypeScript
```

La comunicacion con NocoBase es via REST API autenticada por token.
El blueprint `app-spec/app.yaml` es la fuente de verdad para la estructura.

## Uso con Gemini CLI

```bash
# Dispatch subagente
bash .subagents/dispatch.sh reviewer "Audit collections"
bash .subagents/dispatch-team.sh code-and-review "Review UGCO changes"

# Clasificacion de complejidad antes de actuar:
#   0-1 archivos = NIVEL 1 (effort: low)
#   2-3 archivos = NIVEL 2 (effort: high)
#   4+ archivos  = NIVEL 3 (effort: max)
```

## Scripts

### Gestion de Base de Datos (TypeScript)

```bash
npx tsx shared/scripts/manage-collections.ts list
npx tsx shared/scripts/manage-fields.ts list mi_tabla
npx tsx shared/scripts/manage-workflows.ts list
npx tsx shared/scripts/manage-system.ts info
npx tsx shared/scripts/manage-permissions.ts list-roles
```

### Automatizacion (Python)

```bash
python scripts/nocobase_seed.py          # Seed data
python scripts/audit_ecosystem.py        # Auditoria del ecosistema
python scripts/ecosystem_dashboard.py    # Dashboard de estado
python scripts/agent_health_check.py     # Health check de agentes
```

## Configuracion

```bash
cp .env.example .env   # Configurar credenciales
npm install            # Instalar dependencias
npx tsx shared/scripts/manage-system.ts info   # Verificar conexion
```

**Variables requeridas:**

```env
NOCOBASE_BASE_URL=https://nocobase.ejemplo.com/api
NOCOBASE_API_KEY=tu-api-key
NOCOBASE_ROLE=root
```

**Requisitos:** Node.js >= 18, npm >= 9, instancia NocoBase con API habilitada.
