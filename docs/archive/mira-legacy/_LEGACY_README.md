# ⚠️ MIRA/ — Directorio Legacy

> **Estado**: LEGACY — No modificar. Contenido preservado como referencia histórica.

## ¿Qué es esto?

Este directorio contiene la estructura original del proyecto antes de la migración a `AG_NB_Apps`.
Fue mantenido como referencia pero **no debe usarse para desarrollo activo**.

## Contenido

- **97 scripts JavaScript** en `scripts/` — versiones legacy de scripts ahora en TypeScript
- **Documentación** en `docs/` — documentación técnica original de MIRA
- `collections.txt` — dump histórico de colecciones
- `mira.ts` — archivo de configuración original
- `root_schema.json` — schema raíz de UI

## Ubicación recomendada del código actual

| Necesitas... | Usa... |
|---|---|
| Scripts TypeScript | `shared/scripts/` (36 scripts) |
| Scripts UGCO | `Apps/UGCO/scripts/` |
| Documentación | `docs/` |
| Blueprint | `app-spec/app.yaml` |

## Política

- **No agregar archivos nuevos aquí**
- **No referenciar desde código activo**
- Este directorio será evaluado para archivado o eliminación en futuras sesiones

---

*Marcado como LEGACY: 2026-02-16*
