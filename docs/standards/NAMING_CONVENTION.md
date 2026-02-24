# Convención de Nombres — Colecciones NocoBase

## Prefijos Oficiales

| Prefijo | Significado | ¿Quién escribe? | Ejemplo |
|---------|------------|-----------------|---------|
| `ALMA_` | Mirror read-only de ALMA/TrakCare IRIS | ETL sync (G_Consultas) | `ALMA_Pacientes`, `ALMA_H_CIE10` |
| `ref_` | Catálogos de referencia normalizados | Seed scripts | `ref_cie10`, `ref_prevision` |
| `onco_` | Datos módulo Oncología (UGCO) | Aplicación | `onco_casos`, `onco_episodios` |
| `et_` | Datos módulo Entrega de Turno | App + ETL | `et_pacientes_censo`, `et_turnos` |
| (sin prefijo) | Datos app general (agenda, rrhh) | Aplicación | `staff`, `schedule_blocks` |

## Prefijos Legacy (NO usar para nuevas colecciones)

| Prefijo | Estado | Notas |
|---------|--------|-------|
| `UGCO_REF_*` | 🟡 Contienen datos valiosos (CIE-10 12K, morfología 1K) | Migrar a `ref_*` cuando se re-seedee |
| `BUHO_*` | 🔴 Legacy | 3 registros, evaluar eliminación |
| `wf_*` | 🟡 Workflow origins/destinos | 17-19 registros, evaluar consolidación |

## Reglas

1. **Una tabla por concepto** — nunca crear variantes (`_full`, `_2`, `_v2`)
2. **`ALMA_` es read-only** — nunca escribir de vuelta a IRIS desde NocoBase
3. **Nuevas queries ALMA** → usar `ALMA_` + nombre descriptivo (ej: `ALMA_Hospitalizados`)
4. **Catálogos compartidos** → `ref_` + concepto (ej: `ref_servicio_clinico`)
5. **Módulos nuevos** → prefijo de 2-3 letras (ej: `et_` para Entrega, `onco_` para Oncología)
6. **Snake_case obligatorio** para colecciones nuevas. Las `ALMA_*` mantienen PascalCase por compatibilidad.

## Inventario Post-Limpieza (90 colecciones)

- `ALMA_*`: 32 (mirrors IRIS)
- `UGCO_REF_*`: 11 (catálogos con datos, legacy)
- `ref_*`: 15 (catálogos normalizados)
- `et_*`: 10 (Entrega de Turno)
- `onco_*`: 4 (Oncología)
- App general: 8 (staff, schedule, etc.)
- Otros: 10 (roles, users, wf_*, etc.)
