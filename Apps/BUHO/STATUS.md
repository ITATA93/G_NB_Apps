# BUHO — Estado del Proyecto

**Última actualización**: 2026-03-09
**Estado global**: 🟢 85% completado — Funcional en mira.imedicina.cl

## Componentes Desplegados en mira.imedicina.cl

### Colecciones (5/5) ✅

| Colección | Estado |
|---|---|
| `buho_pacientes` | ✅ Desplegada (26 campos) |
| `buho_camas` | ✅ Desplegada |
| `buho_alertas` | ✅ Desplegada |
| `buho_planes_trabajo` | ✅ Desplegada |
| `buho_parametros_riesgo` | ✅ Desplegada |

### UI Pages (6/6) ✅

- Dashboard Hospitalización, Lista Pacientes, Estado Clínico, Planes de Trabajo, Alertas, Catálogo de Camas, Parámetros de Riesgo

### Roles (3/3) ✅

- `medico_buho`, `enfermeria_buho`, `jefe_servicio_buho`

### Workflows (2/2) ✅ (disabled — habilitar en producción)

- `BUHO: Clasificar riesgo automáticamente`
- `BUHO: Alertar alta en < 2 días (diario)`

### Table Blocks ✅

- Todas las páginas tienen tabla con Filter + Add New

## Pendiente para Producción

- [ ] Conectar `buho_pacientes` a sync real con ALMA/IRIS
- [ ] Habilitar workflows en producción
- [ ] Migrar a mira.hospitaldeovalle.cl (actualmente en mira.imedicina.cl)
- [ ] Cargar catálogo real de camas
