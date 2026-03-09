# ENTREGA — Estado del Proyecto

**Última actualización**: 2026-03-09
**Estado global**: 🟢 90% completado — Funcional en mira.imedicina.cl

## Componentes Desplegados en mira.imedicina.cl

### Colecciones (10/10) ✅

Todas previamente desplegadas (et_turnos, et_pacientes_censo, et_entrega_paciente, et_entrega_enfermeria, et_servicios, et_especialidades, et_usuarios_turno, et_novedades, et_indicadores, et_log_sync)

### UI Pages (17/17) ✅

**Entrega Médica**: Dashboard, Vista Global, Medicina Interna, Cirugía General, Pediatría, Obst/Ginecología, Neonatología, Traumatología, UCI/UTI, Historial
**Enfermería**: Enf. MQ1, MQ2, MQ3, UCI, UTI, PED, OBST

### Roles (11/11) ✅

Previamente desplegados

### Workflows (3/3) ✅ (disabled — habilitar en producción)

- `ENTREGA: Sync censo ALMA → et_pacientes_censo` (cron 30min placeholder)
- `ENTREGA: Registrar nueva entrega de turno`
- `ENTREGA: Cerrar turno con ambas firmas`

### Table Blocks ✅

- Todas las páginas con tabla + Filter + Add New

## Pendiente para Producción

- [ ] Configurar URL real del ETL ALMA en workflow sync_censo_alma
- [ ] Habilitar workflows en producción
- [ ] Migrar a mira.hospitaldeovalle.cl
- [ ] Cargar seed: especialidades, servicios
