# Auditoría del Proyecto NB_Apps
**Fecha:** 2026-01-31
**Versión:** 2.0

## Resumen Ejecutivo

El proyecto ha evolucionado significativamente pero mantiene estructuras legacy que dificultan la mantenibilidad. Se recomienda una reorganización profunda para profesionalizar el código.

---

## 1. Estructura Actual vs Propuesta

### Estructura Actual (Problemas)

```
NB_Apps/
├── .agent/                    # ❌ LEGACY - Antigravity/Gemini
│   ├── rules/
│   ├── skills/
│   └── workflows/
├── .claude/                   # ✅ Activo - Claude Code
│   ├── skills/               # Mezcla de JSON y SKILL.md
│   └── ...
├── app-spec/                  # ❓ LEGACY - Solo app.yaml
├── global_templates/          # ❌ LEGACY - No usado
├── scripts/                   # ⚠️ Python scripts (4 archivos)
├── shared/scripts/            # ✅ TypeScript scripts (34)
├── Apps/UGCO/scripts/nocobase/# ⚠️ 102 scripts (muchos experimentales)
├── DR_API.md                  # ⚠️ Docs sueltos en raíz
├── DR_API_VisualOIA.md
├── *.pdf                      # ⚠️ Archivos binarios en raíz
├── AUDITORIA-2026-01-25.md   # ⚠️ Archivos de auditoría viejos
├── CLAUDE-CONFIG-2026-01-25.md
├── nul                        # ❌ Archivo basura
└── README.md                  # ❌ Desactualizado (referencia Antigravity)
```

### Estructura Propuesta

```
NB_Apps/
├── .claude/                   # Configuración Claude Code
│   ├── skills/               # Solo carpetas con SKILL.md
│   ├── hooks/
│   ├── logs/
│   ├── memory/
│   └── prompts/
├── Apps/                      # Aplicaciones
│   ├── _TEMPLATE/            # Template para nuevas apps
│   ├── UGCO/
│   │   ├── scripts/          # Scripts activos
│   │   ├── scripts-archive/  # Scripts experimentales/obsoletos
│   │   ├── docs/
│   │   └── BD/
│   └── BUHO/
├── docs/                      # Documentación global
│   ├── api/                  # Documentación de APIs
│   ├── guides/               # Guías de uso
│   └── archive/              # Auditorías anteriores
├── shared/
│   ├── scripts/              # Scripts compartidos TypeScript
│   └── python/               # Scripts Python (si se mantienen)
├── MIRA/                      # Submodulo git
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
├── package.json
├── README.md                  # Actualizado
└── tsconfig.json
```

---

## 2. Archivos a Eliminar

| Archivo/Directorio | Razón |
|--------------------|-------|
| `nul` | Archivo basura de Windows |
| `.agent/` | Legacy Antigravity, no usado |
| `app-spec/` | Legacy, solo tenía app.yaml |
| `global_templates/` | Legacy, no usado |
| `scripts/` (raíz) | Python scripts obsoletos |

---

## 3. Archivos a Mover

| Origen | Destino | Razón |
|--------|---------|-------|
| `DR_API.md` | `docs/api/` | Organización |
| `DR_API_VisualOIA.md` | `docs/api/` | Organización |
| `*.pdf` | `docs/guides/` | Organización |
| `AUDITORIA-2026-01-25.md` | `docs/archive/` | Histórico |
| `CLAUDE-CONFIG-2026-01-25.md` | `docs/archive/` | Histórico |
| `TASK.md` | `docs/` o eliminar | Revisar si está actualizado |

---

## 4. Skills - Estandarización

### Actual (Mezcla de formatos)

```
.claude/skills/
├── git-workflow.json           # ❌ Formato viejo
├── nocobase-configure.json     # ❌ Formato viejo
├── nocobase-inspect.json       # ❌ Formato viejo
├── nocobase-seed.json          # ❌ Formato viejo
├── nocobase-charts/SKILL.md    # ✅ Formato nuevo
├── nocobase-db-collections/    # ✅ Formato nuevo
└── ... (10 más en formato nuevo)
```

### Propuesto (Solo SKILL.md)

```
.claude/skills/
├── nocobase-charts/SKILL.md
├── nocobase-db-collections/SKILL.md
├── nocobase-db-datasources/SKILL.md
├── nocobase-db-fields/SKILL.md
├── nocobase-db-relationships/SKILL.md
├── nocobase-db-views/SKILL.md
├── nocobase-menu-organization/SKILL.md
├── nocobase-page-create/SKILL.md
├── nocobase-page-delete/SKILL.md
├── nocobase-page-list/SKILL.md
├── nocobase-page-verify/SKILL.md
├── nocobase-permissions/SKILL.md
├── nocobase-ui-blocks/SKILL.md
├── nocobase-workflows/SKILL.md
├── nocobase-system/SKILL.md     # NUEVO: Migrar desde nocobase-inspect.json
├── nocobase-seed/SKILL.md       # NUEVO: Migrar desde nocobase-seed.json
└── git-workflow/SKILL.md        # NUEVO: Migrar desde git-workflow.json
```

---

## 5. Scripts UGCO - Limpieza

### Análisis de 102 Scripts

| Categoría | Cantidad | Acción |
|-----------|----------|--------|
| Activos/útiles | ~15 | Mantener |
| Experimentales | ~40 | Archivar |
| Duplicados | ~25 | Eliminar |
| One-off/debug | ~22 | Eliminar |

### Scripts a Mantener (en Apps/UGCO/scripts/)

```
list-all-ugco.ts
list-ugco-pages.ts
verify-fix-pages.ts
backup-mira-oncologia.ts
deploy-specialty-tables.ts
seed-ugco-references.ts
add-fields-to-collections.ts
update-relationships.ts
```

### Scripts a Archivar (mover a scripts-archive/)

- Todos los `compare-*.ts`
- Todos los `investigate-*.ts`
- Todos los `debug-*.ts`
- Versiones alternativas (`create-page-v2.ts`, `create-page-final.ts`, etc.)

---

## 6. README.md - Reescritura Completa

### Contenido Actual (Obsoleto)
- Referencia a "Antigravity + Gemini"
- Menciona `.agent/` que ya no se usa
- Flujo de trabajo desactualizado

### Contenido Propuesto

```markdown
# NB_Apps - Plataforma NocoBase Hospital de Ovalle

Gestión de aplicaciones NocoBase para el Hospital de Ovalle (MIRA).

## Aplicaciones

- **UGCO**: Unidad de Gestión Clínica Oncológica
- **BUHO**: [Descripción pendiente]

## Estructura del Proyecto

[Diagrama actualizado]

## Inicio Rápido

1. Configurar `.env` con credenciales NocoBase
2. `npm install`
3. Usar skills de Claude Code: `/nocobase-db-collections list`

## Documentación

- [Guía de Contribución](CONTRIBUTING.md)
- [Documentación API](docs/api/)
- [Skills Disponibles](.claude/skills/)

## Claude Code

Este proyecto está optimizado para Claude Code con 14+ skills especializados.
```

---

## 7. Configuración .claude - Actualización

### settings.json - Cambios Requeridos

```json
{
  "ai": {
    "coordination": {
      "primary": "claude"
      // ELIMINAR: "secondary": "gemini-antigravity"
      // ELIMINAR: "mode": "collaborative"
    }
  },
  "skills": {
    "available": [
      // ACTUALIZAR lista con skills actuales
    ]
  },
  "workspace": {
    "structure": {
      // ELIMINAR: "blueprint": "app-spec/app.yaml"
      "docs": "docs"
    }
  }
}
```

### .claude/README.md - Actualizar

- Eliminar referencias a "coordinación con Gemini"
- Actualizar lista de skills
- Eliminar menciones a JSON skills

---

## 8. shared/scripts - Organización

### Scripts Activos (34 TypeScript)

| Script | Estado | Uso |
|--------|--------|-----|
| ApiClient.ts | ✅ Core | Cliente base |
| manage-collections.ts | ✅ Validado | CRUD colecciones |
| manage-fields.ts | ✅ Validado | CRUD campos |
| manage-workflows.ts | ✅ Validado | Gestión workflows |
| manage-charts.ts | ✅ Validado | Consultas/visualización |
| manage-permissions.ts | ✅ Validado | ACL/roles |
| manage-ui.ts | ✅ Validado | UI schemas |
| manage-datasources.ts | ✅ Validado | Conexiones externas |
| deploy-routes.ts | ✅ Validado | Crear estructura páginas |
| create-workflow.ts | ✅ Validado | Crear workflows |
| ... (24 más) | ⚠️ Pendiente | Requieren validación |

### Agregar README a shared/scripts/

Crear `shared/scripts/README.md` documentando todos los scripts disponibles.

---

## 9. Plan de Ejecución

### Fase 1: Limpieza Inmediata (5 min)
1. ❌ Eliminar `nul`
2. ❌ Eliminar `.agent/`
3. ❌ Eliminar `app-spec/`
4. ❌ Eliminar `global_templates/`

### Fase 2: Reorganización Docs (10 min)
1. 📁 Crear `docs/`, `docs/api/`, `docs/guides/`, `docs/archive/`
2. 📦 Mover documentación suelta
3. 📦 Archivar auditorías viejas

### Fase 3: Scripts UGCO (15 min)
1. 📁 Crear `Apps/UGCO/scripts-archive/`
2. 📦 Mover scripts experimentales
3. 📝 Crear índice de scripts activos

### Fase 4: Skills (10 min)
1. 🔄 Migrar JSON skills a SKILL.md
2. ❌ Eliminar archivos .json de skills
3. 📝 Actualizar settings.json

### Fase 5: Documentación (15 min)
1. 📝 Reescribir README.md
2. 📝 Actualizar .claude/README.md
3. 📝 Crear shared/scripts/README.md

### Fase 6: Configuración (5 min)
1. 📝 Actualizar .claude/settings.json
2. 📝 Limpiar referencias obsoletas

---

## 10. Beneficios Esperados

| Área | Antes | Después |
|------|-------|---------|
| Directorios raíz | 12 | 7 |
| Archivos sueltos raíz | 15 | 6 |
| Scripts UGCO | 102 | ~20 activos |
| Formatos de skills | 2 (JSON + SKILL.md) | 1 (SKILL.md) |
| Referencias legacy | Múltiples | Ninguna |
| Documentación organizada | No | Sí |

---

## Aprobación

⏳ **Pendiente de aprobación del usuario para ejecutar las fases.**

¿Proceder con la reorganización?
