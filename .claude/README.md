# Claude Code Configuration for NB_Apps

Configuración de Claude Code para el proyecto NB_Apps (MIRA - Hospital de Ovalle).

## Estructura

```
.claude/
├── settings.json              # Configuración principal
├── settings.local.json        # Permisos locales
├── README.md                  # Este archivo
│
├── skills/                    # 15 Skills NocoBase
│   ├── nocobase-db-collections/
│   ├── nocobase-db-fields/
│   ├── nocobase-db-relationships/
│   ├── nocobase-db-datasources/
│   ├── nocobase-db-views/
│   ├── nocobase-workflows/
│   ├── nocobase-charts/
│   ├── nocobase-permissions/
│   ├── nocobase-ui-blocks/
│   ├── nocobase-menu-organization/
│   ├── nocobase-page-create/
│   ├── nocobase-page-delete/
│   ├── nocobase-page-list/
│   ├── nocobase-page-verify/
│   ├── nocobase-system/
│   └── archive/               # Skills legacy (JSON)
│
├── hooks/                     # Hooks automáticos
│   ├── startup.sh
│   ├── error.sh
│   ├── api_call.sh
│   ├── task_complete.sh
│   └── file_change.sh
│
├── prompts/                   # Prompts de sistema
│   ├── system_prompt.md
│   └── coordination_protocol.md
│
├── memory/                    # Memoria persistente
│   ├── project_knowledge.json
│   └── common_issues.json
│
└── logs/                      # Logs de sesión
    └── nocobase-api-*.log
```

## Skills Disponibles

### Base de Datos

| Skill | Comando | Función |
|-------|---------|---------|
| Collections | `/nocobase-db-collections` | CRUD de tablas |
| Fields | `/nocobase-db-fields` | CRUD de campos |
| Relationships | `/nocobase-db-relationships` | Relaciones |
| Datasources | `/nocobase-db-datasources` | Conexiones externas |
| Views | `/nocobase-db-views` | Vistas SQL |

### Automatización

| Skill | Comando | Función |
|-------|---------|---------|
| Workflows | `/nocobase-workflows` | Automatizaciones |
| Charts | `/nocobase-charts` | Consultas/visualización |

### UI y Páginas

| Skill | Comando | Función |
|-------|---------|---------|
| UI Blocks | `/nocobase-ui-blocks` | Bloques visuales |
| Menu | `/nocobase-menu-organization` | Organizar menús |
| Page Create | `/nocobase-page-create` | Crear páginas |
| Page Delete | `/nocobase-page-delete` | Eliminar páginas |
| Page List | `/nocobase-page-list` | Listar páginas |
| Page Verify | `/nocobase-page-verify` | Verificar páginas |

### Sistema

| Skill | Comando | Función |
|-------|---------|---------|
| Permissions | `/nocobase-permissions` | Roles y ACL |
| System | `/nocobase-system` | Plugins, usuarios, backups |

## Scripts Compartidos

Los skills utilizan scripts en `shared/scripts/`:

```bash
# Ejemplos de uso
npx tsx shared/scripts/manage-collections.ts list
npx tsx shared/scripts/manage-workflows.ts list
npx tsx shared/scripts/manage-permissions.ts list-roles
```

Ver lista completa: `ls shared/scripts/manage-*.ts`

## Configuración

### settings.json

- `version`: 2.0.0
- `skills.available`: Lista de 15 skills activos
- `nocobase.execution_mode`: "api" (solo API, sin browser)
- `logging.retention_days`: 30

### settings.local.json

Permisos adicionales locales (no versionado).

## Logs

Los logs de llamadas API se guardan en `.claude/logs/`:

```bash
# Ver logs de hoy
cat .claude/logs/nocobase-api-$(date +%Y%m%d).log
```

## Memoria

- `project_knowledge.json`: Conocimiento del proyecto
- `common_issues.json`: Problemas comunes y soluciones

## Uso

```bash
# Iniciar Claude Code en el proyecto
cd /c/Proyectos/NB_Apps
# Usar skills con comandos slash
# /nocobase-db-collections list
# /nocobase-workflows list
```

---

**Versión**: 2.0.0
**Última actualización**: 2026-01-31
