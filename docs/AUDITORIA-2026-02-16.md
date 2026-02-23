# 🔍 AUDITORÍA COMPLETA — AG_NB_Apps

**Fecha**: 2026-02-16T19:57:00-03:00  
**Auditor**: Antigravity Agent  
**Proyecto**: AG_NB_Apps (NocoBase Management)  
**Ubicación**: `C:\_Repositorio\AG_Proyectos\AG_NB_Apps`  
**Commit HEAD**: `cdc7a54` — chore: remediación estructural ecosistema AG (2026-02-16)

---

## 📊 RESUMEN EJECUTIVO

| Dimensión | Score | Veredicto |
|-----------|-------|-----------|
| **Estructura de Proyecto** | 🟡 75% | Archivos sueltos en raíz |
| **Documentación** | 🟡 70% | Desactualizada y con inconsistencias |
| **Seguridad** | 🟢 90% | `.env` protegido, `.gitignore` presente |
| **Calidad de Código** | 🟡 65% | Sin tests, sin linter, archivos duplicados |
| **Git Hygiene** | 🟡 70% | Solo 1 commit, branch única, archivo sin trackear |
| **Compliance AG Standards** | 🟡 72% | Nomenclatura parcialmente migrada |
| **Operatividad Scripts** | 🟢 90% | 97% scripts funcionales (validación previa) |
| **Blueprint Compliance** | 🟡 75% | Blueprint definido, UI sin confirmar |

### **Score Global: 🟡 76/100 — FUNCIONAL CON DEUDA TÉCNICA**

---

## 1. 📁 ESTRUCTURA DE PROYECTO

### ✅ Aspectos Positivos
- Directorio `.agent/` con rules (10), skills (1), workflows (6) — bien organizado
- `app-spec/app.yaml` — Blueprint centralizador definido (399 líneas, completo)
- Separación `Apps/UGCO`, `Apps/BUHO`, `Apps/_APP_TEMPLATE`
- `shared/scripts/` con 36 scripts TypeScript reutilizables
- `scripts/` con utilidades Python y PowerShell

### ❌ HALLAZGO CRÍTICO: 8 archivos sueltos en la raíz

Archivos que **NO deberían estar en la raíz**:

| Archivo | Tamaño | Acción Recomendada |
|---------|--------|-------------------|
| `route_names.txt` | 3.3 KB | → Mover a `docs/debug/` o eliminar (output de script, todos "undefined") |
| `routes_dump.txt` | 271 B | → Mover a `docs/debug/` o eliminar (output vacío) |
| `schema_onco_casos.txt` | 1.1 KB | → Mover a `Apps/UGCO/docs/schemas/` |
| `schema_schedule.txt` | 1.2 KB | → Mover a `Apps/UGCO/docs/schemas/` o `docs/schemas/` |
| `validation_debug.txt` | 2.0 KB | → Mover a `docs/debug/` o eliminar |
| `validation_output.txt` | 2.1 KB | → Mover a `docs/debug/` o eliminar (encoding roto: UTF-16 LE) |
| `validation_output_utf8.txt` | 822 B | → Mover a `docs/debug/` o eliminar |
| `AGENT_START_PROMPT.md` | 2.2 KB | → Mover a `.agent/` o `docs/guides/` |

### ⚠️ Carpeta `global_templates/` (2 archivos)
- `GEMINI.md` y `browserAllowlist.txt` — Son templates globales que pertenecen a `~/.gemini/`, no al proyecto.
- **Recomendación**: Mover a `docs/templates/` o eliminar si ya existen en la ubicación global.

### ⚠️ Carpeta `MIRA/` — Subódulo o copia legacy
- Contiene 108 archivos incluyendo scripts, docs, `mira.ts`, `collections.txt`, `root_schema.json`
- Similar en contenido a `shared/scripts/` → posible **duplicación**
- **Acción**: Clarificar si es submodule git o copia legacy. Si es legacy, archivar.

### ⚠️ UGCO tiene archivos temporales en raíz
- `temp-collections-full.json` (9.7 KB) y `temp-datasources-report.json` (66 KB)
- **Acción**: Mover a `Apps/UGCO/backups/` o eliminar.

---

## 2. 📚 DOCUMENTACIÓN

### ✅ Archivos Presentes
| Archivo | Estado | Nota |
|---------|--------|------|
| `README.md` | 🟡 Parcial | Nombre dice "NB_Apps" en vez de "AG_NB_Apps", estructura no coincide 100% |
| `GEMINI.md` | ✅ OK | Completo, identidad + reglas + clasificador |
| `CLAUDE.md` | ✅ OK | Correcto para Claude Code |
| `CONTEXT_GEMINI_3.0.md` | 🟡 Encoding | Caracteres corruptos (Ã¡ÃºÃ­) — encoding incorrecto |
| `CONTRIBUTING.md` | 🟡 Desactualizado | Estructura de proyecto en CONTRIBUTING.md no refleja la estructura real (dice `MIRA/UGCO/` en vez de `Apps/UGCO/`) |
| `CHANGELOG.md` | 🔴 Mínimo | Solo 1 entrada (2026-02-04), versión 1.0.0 |
| `VALIDATION_SUMMARY.md` | ✅ OK | Completo, validación del 2026-02-04 |
| `docs/TODO.md` | 🟡 Vacío | Backlog "por definir" |
| `docs/DEVLOG.md` | 🟡 Mínimo | Solo 1 entrada (remediación batch) |

### ❌ Inconsistencia: Nombres del proyecto mezclados
- `README.md` línea 1: "# NB_Apps" → debería ser "# AG_NB_Apps"
- `CONTRIBUTING.md` línea 1: "Guía de Contribución - NB_Apps" → "AG_NB_Apps"
- `CONTRIBUTING.md` estructura dice `MIRA/UGCO/` pero la realidad es `Apps/UGCO/`
- `package.json` name: "ag-nb-apps" ✅ (correcto)
- `NB_Apps.code-workspace` → debería ser `AG_NB_Apps.code-workspace`

### ❌ CONTEXT_GEMINI_3.0.md tiene encoding corrupto
- Múltiples `Ã¡`, `Ãº`, `Ã³` visibles — archivo fue guardado con encoding incorrecto.

---

## 3. 🔒 SEGURIDAD

### ✅ Aspectos Positivos
| Check | Estado |
|-------|--------|
| `.env` en `.gitignore` | ✅ PASS |
| `.env.example` sin secretos | ✅ PASS |
| No hay tokens/API keys en código | ✅ PASS |
| Reglas anti-destructivas en GEMINI.md | ✅ PASS |
| Claude logs ignorados | ✅ PASS |

### ⚠️ Observaciones
- `xlsx` (v0.18.5) tiene vulnerabilidad de **Prototype Pollution** (severidad ALTA, sin fix)
- `framer-motion` y `lucide-react` son dependencias **frontend** que no deberían estar en un proyecto de scripts CLI → probablemente arrastradas por copiar/pegar. **Recomendación**: Eliminar si no se usan.

---

## 4. 🧪 CALIDAD DE CÓDIGO

### ❌ HALLAZGOS CRÍTICOS

| Dimensión | Estado | Detalle |
|-----------|--------|---------|
| **Tests** | 🔴 AUSENTE | `"test": "echo \"Error: no test specified\""` — No hay tests |
| **Linter** | 🔴 AUSENTE | No hay ESLint ni Prettier configurados |
| **TypeScript strict** | ✅ OK | `strict: true` en tsconfig.json |
| **Node.js type** | ✅ OK | `"type": "module"` + ES2020 target |

### ⚠️ Archivos duplicados (JS + TS)
En `Apps/UGCO/scripts/` hay versiones JS y TS del mismo script:
- `inspect-datasources.js` (10.5 KB) + `inspect-datasources.ts` (9.5 KB)
- `test-connection.js` (9.3 KB) + `test-connection.ts` (2.0 KB)
- `fetch-hl7-codesystems.js` (2.1 KB) + `fetch-hl7-codesystems.ts` (2.6 KB)

**Acción**: Eliminar las versiones `.js` legacy y mantener solo `.ts`.

### ⚠️ Scripts-archive masivo
- `Apps/UGCO/scripts-archive/` contiene **82 archivos** archivados
- `Apps/UGCO/scripts/nocobase/` contiene **60 archivos** activos
- Total UGCO scripts: **165 archivos** — requiere limpieza y consolidación

### ⚠️ Dependencias innecesarias en package.json
| Paquete | Uso Probable | Acción |
|---------|-------------|--------|
| `framer-motion` (^12.23.24) | Frontend React animation | 🔴 Eliminar |
| `lucide-react` (^0.555.0) | React icon library | 🔴 Eliminar |
| `xlsx` (^0.18.5) | Procesamiento Excel + vuln | ⚠️ Evaluar reemplazo |

---

## 5. 🌳 GIT HYGIENE

### Estado actual: Branch `master`, limpio (1 untracked file)

| Check | Estado | Detalle |
|-------|--------|---------|
| Branch primaria | ✅ `master` | OK |
| Working tree | 🟡 | 1 archivo untracked: `.agent/rules/project-rules.md` |
| Historial | 🔴 | Solo 1 commit visible (`cdc7a54`) |
| `.gitignore` | ✅ | Completo, cubre .env, node_modules, python cache, IDEs |
| Branching strategy | 🟡 Documented | Descrito en CONTRIBUTING.md pero no evidencia de uso |

### Acción inmediata
- Trackear `.agent/rules/project-rules.md` con `git add`

---

## 6. 📋 COMPLIANCE AG STANDARDS

### Checklist de Normalización AG

| Requisito | Estado | Nota |
|-----------|--------|------|
| Prefijo `AG_` en nombre | ✅ | Directorio: `AG_NB_Apps` |
| `GEMINI.md` | ✅ | Presente y completo |
| `CLAUDE.md` | ✅ | Presente y correcto |
| `CONTEXT_GEMINI_3.0.md` | 🟡 | Presente pero encoding corrupto |
| `CHANGELOG.md` | 🟡 | Presente pero mínimo |
| `README.md` | 🟡 | Presente pero título usa nombre viejo |
| `CONTRIBUTING.md` | 🟡 | Presente pero estructura desactualizada |
| `docs/TODO.md` | 🟡 | Presente pero vacío |
| `docs/DEVLOG.md` | 🟡 | Presente pero mínimo |
| `.gitignore` | ✅ | Presente y completo |
| `.env.example` | ✅ | Presente |
| `package.json` name correcto | ✅ | `ag-nb-apps` |
| Git inicializado | ✅ | Sí |
| Workspace file | 🟡 | Nombre debería ser `AG_NB_Apps.code-workspace` |

---

## 7. 🏗️ BLUEPRINT vs. REALIDAD

### Colecciones en Blueprint (`app-spec/app.yaml`)
| Colección | En Blueprint | Estado Real |
|-----------|-------------|-------------|
| `staff` | ✅ | ⚠️ No verificado (sin conexión) |
| `departments` | ✅ | ✅ Confirmado (validation_debug.txt) |
| `activity_types` | ✅ | ⚠️ No verificado |
| `schedule_blocks` | ✅ | ✅ 8 campos (schema_schedule.txt) |
| `activity_blocks` | ✅ | ⚠️ No verificado |
| `onco_casos` | ✅ | ✅ 6 campos (schema_onco_casos.txt) pero falta `responsible_doctor_id` del blueprint |
| `onco_episodios` | ✅ | ⚠️ No verificado |
| `onco_comite_sesiones` | ✅ | ⚠️ No verificado |
| `onco_comite_casos` | ✅ | ⚠️ No verificado |
| `ref_comuna` | ✅ | ⚠️ No verificado |
| `ref_nacionalidad` | ✅ | ⚠️ No verificado |

### ⚠️ Discrepancia encontrada: `onco_casos`
- Blueprint define 6 campos + `responsible_doctor_id` (belongsTo staff)
- Schema real muestra 6 campos + `paciente_id` (no en blueprint)
- **Falta**: `responsible_doctor_id`
- **Sobra**: `paciente_id`

### ⚠️ Discrepancia encontrada: `schedule_blocks`
- Blueprint: FK `responsible_staff_id`, `department_id`, `activity_type_id`
- Real: `staffId`, `activityTypeId` (no `department_id`)
- Convención de nombres FK inconsistente (snake_case vs camelCase)

### Roles en Blueprint
| Rol | En Blueprint | Estado Real (última validación) |
|-----|-------------|------|
| `Administrador Clínico` | ✅ | ❓ No detectado en validación previa |
| `Médico Oncólogo` | ✅ | ❓ No detectado |
| `Coordinador Pabellón` | ✅ | ❓ No detectado |
| `Cirujano Residente` | — | ✅ Existe en el sistema pero NO en blueprint |

### UI/Pages: No validado (requiere conexión browser o API)

---

## 8. ⚡ ACCIONES RECOMENDADAS (Priorizadas)

### 🔴 Prioridad ALTA (Deuda técnica crítica)

1. **Limpiar raíz**: Mover los 8 archivos sueltos a subdirectorios apropiados
2. **Fix encoding CONTEXT_GEMINI_3.0.md**: Regenerar el archivo con UTF-8 correcto
3. **Actualizar README.md**: Cambiar título a "AG_NB_Apps", actualizar estructura
4. **Eliminar dependencias innecesarias**: `framer-motion`, `lucide-react`
5. **Trackear archivo pendiente**: `git add .agent/rules/project-rules.md`

### 🟡 Prioridad MEDIA (Mejora de calidad)

6. **Actualizar CONTRIBUTING.md**: Estructura real del proyecto (no la legacy `MIRA/`)
7. **Eliminar archivos JS duplicados**: Mantener solo las versiones `.ts`
8. **Actualizar CHANGELOG.md**: Reflejar todas las actividades desde Feb-04
9. **Renombrar workspace**: `NB_Apps.code-workspace` → `AG_NB_Apps.code-workspace`
10. **Evaluar `global_templates/`**: Eliminar o mover si ya existen globalmente

### 🟢 Prioridad BAJA (Mejora a futuro)

11. **Configurar ESLint + Prettier**: Para calidad de código consistente
12. **Agregar tests unitarios**: Al menos para `ApiClient.ts` y scripts core
13. **Ejecutar auditoría blueprint vs NocoBase**: `/nocobase-audit` con conexión activa
14. **Consolidar UGCO scripts**: 165 archivos requieren revisión
15. **Evaluar reemplazo de `xlsx`**: Por `exceljs` sin vulnerabilidades

---

## 📝 NOTAS DEL AUDITOR

1. El proyecto está **operacionalmente funcional** — la validación de Feb-04 confirmó 97%+ scripts OK y conectividad activa con NocoBase 1.9.14.
2. La deuda principal es **organizacional**: archivos sueltos, documentación desactualizada, y restos de la migración desde `NB_Apps` a `AG_NB_Apps`.
3. La carpeta `MIRA/` en raíz es confusa: el README la describe como "submodulo git" pero contiene 108 archivos que solapan con `shared/scripts/`. Necesita clarificación urgente.
4. No se pudo validar el estado actual de NocoBase (requiere conectividad al servidor) — las verificaciones de schema fueron basadas en outputs previos guardados como `.txt`.

---

**Generado**: 2026-02-16T19:57:00-03:00  
**Por**: Antigravity Agent  
**Siguiente acción sugerida**: Resolver los items de Prioridad ALTA y luego ejecutar `/nocobase-audit` con conexión activa.
