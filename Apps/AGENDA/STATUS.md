# AGENDA — Estado del Proyecto

**Última actualización**: 2026-03-09
**Estado global**: 🟢 90% completado — Funcional en mira.imedicina.cl

## Componentes Desplegados en mira.imedicina.cl

### Colecciones (8/8) ✅

`ag_categorias_actividad`, `ag_tipos_inasistencia`, `ag_servicios`, `ag_funcionarios`, `ag_bloques_agenda`, `ag_inasistencias`, `ag_resumen_diario`, `ag_resumen_semanal`

### UI Pages (9/9) ✅

Dashboard, Agenda Semanal, Actividades (Bloques), Inasistencias, Resumen Diario, Resumen Semanal, Funcionarios, Categorías de Actividad, + Admin Agenda (Tipos Inasistencia, Servicios, Reportes)

### Roles (3/3) ✅

`admin_agenda`, `jefe_servicio_agenda`, `medico_agenda`

### Workflows (3/3) ✅ (disabled — habilitar en producción)

- `AGENDA: Calcular duración_min y período`
- `AGENDA: Generar resumen diario` (cron 23:00)
- `AGENDA: Generar resumen semanal` (cron lunes 06:00)

### Table Blocks ✅

- Todas las páginas con tabla + Filter + Add New

## Pendiente para Producción

- [ ] Cargar seed data: 16 categorías, 6 tipos inasistencia, 10 servicios, funcionarios
- [ ] Habilitar workflows en producción
- [ ] Migrar a mira.hospitaldeovalle.cl
- [ ] Configurar RLS por servicio para `jefe_servicio_agenda`
