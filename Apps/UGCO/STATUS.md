# Estado del Proyecto - UGCO

**Ultima Actualizacion**: 2026-02-26
**Version Actual**: 2.0.0
**Estado General**: Implementado (Produccion)

## Resumen Ejecutivo

UGCO (Unidad de Gestion en Cancer y Oncologia) esta completamente implementada
en produccion (mira.hospitaldeovalle.cl). 45+ colecciones desplegadas incluyendo
27 catalogos de referencia, 3 tablas ALMA mirror, 11 tablas core UGCO y 4 tablas
secundarias. UI con 19 paginas + 2 grupos, 4 workflows activos, 3 roles de acceso,
dashboard con KPIs y pagina de reportes con exportacion.

## Fase Actual

**Fase**: 8 - Completada (todas las fases)
**Progreso**: 95%

### Fases Completadas

- [x] Fase 1: Planificacion y Blueprint (documentacion completa)
- [x] Fase 2: Deploy de catalogos REF (27 colecciones de referencia)
- [x] Fase 2b: Deploy de colecciones core UGCO (15 tablas)
- [x] Fase 3: Configuracion de relaciones FK entre colecciones
- [x] Fase 4: Carga de datos de referencia (95 registros en 12 catalogos)
- [x] Fase 5: UI - 19 paginas con bloques de tabla (9 especialidades, dashboard, tareas, reportes, configuracion)
- [x] Fase 6: 4 workflows de automatizacion (codigo auto, log estados, tarea comite, check diario)
- [x] Fase 7: 3 roles (medico_oncologo, enfermera_ugco, coordinador_ugco) + acceso menu
- [x] Fase 8: Dashboard con KPIs, charts, tablas + Reportes con exportacion

### Pendiente (manual)

- [ ] Configurar permisos ACL granulares por coleccion (via UI NocoBase - API no soporta)
- [ ] Integracion lectura ALMA/TrakCare (datasource externo SQL Server)
- [ ] Pruebas de aceptacion con usuarios finales

## Metricas del Proyecto

| Metrica | Valor | Objetivo | Estado |
|---------|-------|----------|--------|
| Documentacion | Completa | Completa | 100% |
| Colecciones desplegadas | 45+ | 45+ | 100% |
| Datos de referencia | 95 registros | 95+ | 100% |
| Paginas UI | 19 + 2 grupos | 15+ | 100% |
| Workflows | 4 activos | 4 | 100% |
| Dashboards | 1 (5 rows, 10+ blocks) | 1 | 100% |
| Reportes | 1 (5 tablas exportables) | 1 | 100% |
| Roles/Permisos | 3 roles + menu | 3 roles + ACL | 80% |
| Integracion ALMA | Diseñada | Lectura | 10% |

## Progreso por Componente

| Componente | Estado | Progreso |
|------------|--------|----------|
| Documentacion | Completa | 100% |
| Schema/Colecciones | Desplegado en produccion | 100% |
| Datos de referencia | Cargados (12 catalogos) | 100% |
| Frontend/UI | 19 paginas operativas | 95% |
| Workflows | 4 activos en produccion | 100% |
| Dashboard | Operativo con KPIs y charts | 100% |
| Reportes | Tablas completas con export | 100% |
| Roles/Permisos | Roles creados, menu OK, ACL pendiente manual | 80% |
| Integracion ALMA | Diseñada, pendiente datasource | 10% |
| Testing | Pendiente UAT | 5% |

## Arquitectura de Paginas UI

```text
Oncologia (UGCO)
  |-- Dashboard (KPIs, charts, tablas resumen)
  |-- Especialidades/
  |   |-- Digestivo Alto, Digestivo Bajo, Mama, Ginecologia
  |   |-- Urologia, Torax, Piel y Partes Blandas
  |   |-- Endocrinologia, Hematologia
  |-- Tareas Pendientes
  |-- Reportes (exportacion completa)
  |-- Configuracion/
      |-- Especialidades, Equipos de Seguimiento, Catalogos REF
```

## Workflows Activos

| ID | Nombre | Tipo | Trigger |
| --- | --- | --- | --- |
| 350480863395840 | Asignar codigo al crear caso | collection | on create |
| 350480863395843 | Log cambio de estado | collection | on update |
| 350480863395845 | Tarea al agregar caso a comite | collection | on create |
| 350480863395847 | Verificar tareas vencidas | schedule | diario 8AM |
