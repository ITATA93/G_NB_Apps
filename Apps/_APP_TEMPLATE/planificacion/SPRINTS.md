# Planificación de Sprints - [NOMBRE_APP]

**Última Actualización**: YYYY-MM-DD
**Duración de Sprint**: 2 semanas
**Equipo**: [Listar miembros del equipo]

---

## Sprint Backlog

### Sprint 1: Preparación y Diseño

**Fechas**: YYYY-MM-DD a YYYY-MM-DD
**Objetivo**: Establecer fundación del proyecto y diseño inicial
**Fase del Proyecto**: Fase 0 y 1

**Stories**:

| ID | Historia de Usuario | Puntos | Asignado a | Estado |
|----|---------------------|--------|------------|--------|
| S1-001 | Como developer, quiero un ambiente de desarrollo configurado para empezar a trabajar | 3 | [Nombre] | ⏳ Pendiente |
| S1-002 | Como arquitecto, quiero un diagrama ER completo para entender el modelo de datos | 5 | [Nombre] | ⏳ Pendiente |
| S1-003 | Como PO, quiero wireframes de las pantallas principales para validar UX | 5 | [Nombre] | ⏳ Pendiente |
| S1-004 | Como developer, quiero documentación de colecciones para empezar la configuración | 3 | [Nombre] | ⏳ Pendiente |

**Tareas Técnicas**:
- [ ] Configurar repositorio Git
- [ ] Configurar NocoBase local
- [ ] Crear estructura de carpetas
- [ ] Crear documentación base (README, ARQUITECTURA)
- [ ] Definir convenciones de nomenclatura

**Definition of Done**:
- Ambiente funcional para todos los developers
- Diagrama ER aprobado por stakeholders
- Wireframes validados
- Documentación base completa

**Retrospectiva**: [A completar al final del sprint]

---

### Sprint 2: Configuración de Colecciones Principales

**Fechas**: YYYY-MM-DD a YYYY-MM-DD
**Objetivo**: Crear colecciones críticas del sistema
**Fase del Proyecto**: Fase 2

**Stories**:

| ID | Historia de Usuario | Puntos | Asignado a | Estado |
|----|---------------------|--------|------------|--------|
| S2-001 | Como usuario, quiero crear [entidad principal] para gestionar [datos] | 8 | [Nombre] | ⏳ Pendiente |
| S2-002 | Como usuario, quiero vincular [entidad A] con [entidad B] para ver relaciones | 5 | [Nombre] | ⏳ Pendiente |
| S2-003 | Como developer, quiero scripts de configuración para automatizar setup | 5 | [Nombre] | ⏳ Pendiente |

**Tareas Técnicas**:
- [ ] Crear colección [nombre_1] con campos y validaciones
- [ ] Crear colección [nombre_2] con campos y validaciones
- [ ] Establecer relación hasMany entre [A] y [B]
- [ ] Crear índices en campos de búsqueda
- [ ] Script configure.ts funcional

**Definition of Done**:
- Todas las colecciones principales creadas
- Relaciones funcionando correctamente
- Scripts de configuración versionados en Git
- Documentación actualizada en BD/colecciones/

**Retrospectiva**: [A completar al final del sprint]

---

### Sprint 3: Seed de Datos y Colecciones Secundarias

**Fechas**: YYYY-MM-DD a YYYY-MM-DD
**Objetivo**: Completar modelo de datos y cargar datos de referencia
**Fase del Proyecto**: Fase 2 y 3

**Stories**:

| ID | Historia de Usuario | Puntos | Asignado a | Estado |
|----|---------------------|--------|------------|--------|
| S3-001 | Como usuario, quiero catálogos precargados para no ingresarlos manualmente | 5 | [Nombre] | ⏳ Pendiente |
| S3-002 | Como developer, quiero datos de ejemplo para testing | 3 | [Nombre] | ⏳ Pendiente |
| S3-003 | Como usuario, quiero [colecciones secundarias] para completar funcionalidad | 8 | [Nombre] | ⏳ Pendiente |

**Tareas Técnicas**:
- [ ] Preparar archivos JSON de datos de referencia
- [ ] Script seed-references.ts funcional
- [ ] Cargar catálogos (especialidades, códigos ICD-10, etc.)
- [ ] Crear colecciones secundarias restantes
- [ ] Validar integridad de datos cargados

**Definition of Done**:
- Todos los catálogos cargados sin errores
- Datos de ejemplo disponibles para testing
- Scripts de seed son idempotentes
- Todas las colecciones del modelo creadas

**Retrospectiva**: [A completar al final del sprint]

---

### Sprint 4: Integración con ALMA/SIDRA

**Fechas**: YYYY-MM-DD a YYYY-MM-DD
**Objetivo**: Conectar con sistemas externos
**Fase del Proyecto**: Fase 4

**Stories**:

| ID | Historia de Usuario | Puntos | Asignado a | Estado |
|----|---------------------|--------|------------|--------|
| S4-001 | Como usuario, quiero ver datos de pacientes de ALMA para no duplicar ingreso | 8 | [Nombre] | ⏳ Pendiente |
| S4-002 | Como developer, quiero datasource SIDRA configurado para queries en tiempo real | 5 | [Nombre] | ⏳ Pendiente |
| S4-003 | Como usuario, quiero búsqueda de pacientes rápida desde ALMA | 5 | [Nombre] | ⏳ Pendiente |

**Tareas Técnicas**:
- [ ] Configurar datasource SIDRA en NocoBase
- [ ] Mapear colecciones alma_pacientes
- [ ] Mapear colecciones alma_episodios
- [ ] Testing de performance de queries
- [ ] Implementar cache para consultas frecuentes

**Definition of Done**:
- Conexión estable a SIDRA
- Datos de ALMA visibles en UI
- Performance <2s en búsquedas
- Documentación de integración completa

**Retrospectiva**: [A completar al final del sprint]

---

### Sprint 5: UI - Dashboard y Navegación

**Fechas**: YYYY-MM-DD a YYYY-MM-DD
**Objetivo**: Crear interfaz principal de usuario
**Fase del Proyecto**: Fase 5

**Stories**:

| ID | Historia de Usuario | Puntos | Asignado a | Estado |
|----|---------------------|--------|------------|--------|
| S5-001 | Como usuario, quiero un dashboard con métricas clave para ver estado del sistema | 8 | [Nombre] | ⏳ Pendiente |
| S5-002 | Como usuario, quiero menú de navegación claro para acceder a módulos | 3 | [Nombre] | ⏳ Pendiente |
| S5-003 | Como usuario, quiero breadcrumbs para saber dónde estoy | 2 | [Nombre] | ⏳ Pendiente |

**Tareas Técnicas**:
- [ ] Crear menú principal con módulos
- [ ] Dashboard con 4-6 KPI cards
- [ ] Gráficos de tendencias
- [ ] Tabla de últimas actividades
- [ ] Breadcrumbs en todas las vistas

**Definition of Done**:
- Dashboard funcional con datos reales
- Navegación intuitiva testeada con usuarios
- Responsive design (desktop y tablet)

**Retrospectiva**: [A completar al final del sprint]

---

### Sprint 6: UI - Listados y Búsqueda

**Fechas**: YYYY-MM-DD a YYYY-MM-DD
**Objetivo**: Vistas de listado para todas las colecciones principales
**Fase del Proyecto**: Fase 5

**Stories**:

| ID | Historia de Usuario | Puntos | Asignado a | Estado |
|----|---------------------|--------|------------|--------|
| S6-001 | Como usuario, quiero listar [entidad A] con filtros para encontrar registros | 5 | [Nombre] | ⏳ Pendiente |
| S6-002 | Como usuario, quiero búsqueda rápida para encontrar registros sin filtrar | 3 | [Nombre] | ⏳ Pendiente |
| S6-003 | Como usuario, quiero exportar listados a Excel para análisis offline | 3 | [Nombre] | ⏳ Pendiente |

**Tareas Técnicas**:
- [ ] Vista de listado para [colección_1]
- [ ] Vista de listado para [colección_2]
- [ ] Vista de listado para [colección_3]
- [ ] Filtros avanzados (por fecha, estado, etc.)
- [ ] Exportación a Excel y PDF

**Definition of Done**:
- Todas las colecciones principales tienen vista de listado
- Filtros y búsqueda funcionando
- Exportación verificada

**Retrospectiva**: [A completar al final del sprint]

---

### Sprint 7: UI - Formularios y Edición

**Fechas**: YYYY-MM-DD a YYYY-MM-DD
**Objetivo**: Crear y editar registros desde UI
**Fase del Proyecto**: Fase 5

**Stories**:

| ID | Historia de Usuario | Puntos | Asignado a | Estado |
|----|---------------------|--------|------------|--------|
| S7-001 | Como usuario, quiero crear [entidad A] con formulario validado | 5 | [Nombre] | ⏳ Pendiente |
| S7-002 | Como usuario, quiero editar registros existentes fácilmente | 5 | [Nombre] | ⏳ Pendiente |
| S7-003 | Como usuario, quiero ver errores claros cuando falla validación | 3 | [Nombre] | ⏳ Pendiente |

**Tareas Técnicas**:
- [ ] Formularios de creación para colecciones principales
- [ ] Formularios de edición
- [ ] Validación en tiempo real
- [ ] Mensajes de error descriptivos
- [ ] Confirmación antes de descartar cambios

**Definition of Done**:
- Formularios funcionales para todas las colecciones
- Validaciones testeadas
- UX validada con usuarios

**Retrospectiva**: [A completar al final del sprint]

---

### Sprint 8: Workflows y Automatizaciones

**Fechas**: YYYY-MM-DD a YYYY-MM-DD
**Objetivo**: Implementar lógica de negocio automatizada
**Fase del Proyecto**: Fase 6

**Stories**:

| ID | Historia de Usuario | Puntos | Asignado a | Estado |
|----|---------------------|--------|------------|--------|
| S8-001 | Como sistema, quiero validar datos automáticamente al crear [entidad] | 5 | [Nombre] | ⏳ Pendiente |
| S8-002 | Como usuario, quiero recibir notificación cuando [evento X] ocurra | 5 | [Nombre] | ⏳ Pendiente |
| S8-003 | Como sistema, quiero actualizar [entidad B] cuando [entidad A] cambie | 5 | [Nombre] | ⏳ Pendiente |

**Tareas Técnicas**:
- [ ] Workflow de validación en afterCreate
- [ ] Workflow de notificaciones
- [ ] Workflow de actualización de relacionados
- [ ] Testing de workflows
- [ ] Logging de ejecuciones

**Definition of Done**:
- Todos los workflows críticos implementados
- Testing con datos reales completado
- Documentación de workflows

**Retrospectiva**: [A completar al final del sprint]

---

### Sprint 9: Testing y QA

**Fechas**: YYYY-MM-DD a YYYY-MM-DD
**Objetivo**: Asegurar calidad antes de producción
**Fase del Proyecto**: Fase 7

**Stories**:

| ID | Historia de Usuario | Puntos | Asignado a | Estado |
|----|---------------------|--------|------------|--------|
| S9-001 | Como QA, quiero suite de tests automatizados para regresión | 8 | [Nombre] | ⏳ Pendiente |
| S9-002 | Como usuario, quiero un sistema sin bugs críticos para trabajar confiado | 13 | [Nombre] | ⏳ Pendiente |
| S9-003 | Como admin, quiero performance aceptable para buena experiencia | 5 | [Nombre] | ⏳ Pendiente |

**Tareas Técnicas**:
- [ ] Tests E2E de flujos críticos
- [ ] Testing de permisos y roles
- [ ] Performance testing
- [ ] Bug fixing
- [ ] Testing de integración con ALMA

**Definition of Done**:
- 0 bugs críticos
- <5 bugs menores
- Tests E2E pasando
- Performance <2s verificado

**Retrospectiva**: [A completar al final del sprint]

---

### Sprint 10: Documentación y Deployment

**Fechas**: YYYY-MM-DD a YYYY-MM-DD
**Objetivo**: Documentar y desplegar a producción
**Fase del Proyecto**: Fase 8 y 9

**Stories**:

| ID | Historia de Usuario | Puntos | Asignado a | Estado |
|----|---------------------|--------|------------|--------|
| S10-001 | Como usuario nuevo, quiero manual de usuario para aprender a usar el sistema | 5 | [Nombre] | ⏳ Pendiente |
| S10-002 | Como admin IT, quiero manual técnico para soportar el sistema | 5 | [Nombre] | ⏳ Pendiente |
| S10-003 | Como stakeholder, quiero sistema en producción funcionando | 8 | [Nombre] | ⏳ Pendiente |

**Tareas Técnicas**:
- [ ] Completar documentación de usuario
- [ ] Completar documentación técnica
- [ ] Sesiones de capacitación
- [ ] Deployment a producción
- [ ] Smoke tests en producción
- [ ] Monitoreo configurado

**Definition of Done**:
- Documentación completa
- Usuarios capacitados
- Sistema en producción estable
- Backups configurados

**Retrospectiva**: [A completar al final del sprint]

---

## Velocity Tracking

| Sprint | Puntos Planeados | Puntos Completados | Velocity |
|--------|------------------|-------------------|----------|
| Sprint 1 | 16 | - | - |
| Sprint 2 | 18 | - | - |
| Sprint 3 | 16 | - | - |
| Sprint 4 | 18 | - | - |
| Sprint 5 | 13 | - | - |
| Sprint 6 | 11 | - | - |
| Sprint 7 | 13 | - | - |
| Sprint 8 | 15 | - | - |
| Sprint 9 | 26 | - | - |
| Sprint 10 | 18 | - | - |

**Velocity Promedio**: - (a calcular después de 3 sprints)

---

## Burndown Chart

[Agregar gráfico de burndown después de iniciar sprints]

---

## Ceremonias de Scrum

### Sprint Planning

**Frecuencia**: Inicio de cada sprint (cada 2 semanas)
**Duración**: 2 horas
**Participantes**: Todo el equipo
**Agenda**:
1. Revisar objetivos del sprint
2. Seleccionar stories del backlog
3. Estimar puntos
4. Asignar tareas

### Daily Standup

**Frecuencia**: Diario
**Duración**: 15 minutos
**Formato**:
- ¿Qué hice ayer?
- ¿Qué haré hoy?
- ¿Hay blockers?

### Sprint Review

**Frecuencia**: Fin de cada sprint
**Duración**: 1 hora
**Participantes**: Equipo + Stakeholders
**Agenda**:
1. Demo de funcionalidad completada
2. Feedback de stakeholders
3. Actualizar product backlog

### Sprint Retrospective

**Frecuencia**: Fin de cada sprint
**Duración**: 1 hora
**Participantes**: Equipo
**Formato**:
- ¿Qué fue bien?
- ¿Qué mejorar?
- Acciones para próximo sprint

---

## Backlog Refinement

**Frecuencia**: Mid-sprint (semanal)
**Duración**: 1 hora
**Objetivo**: Preparar stories para próximo sprint

---

## Referencias

- [PLAN-IMPLEMENTACION.md](PLAN-IMPLEMENTACION.md) - Plan general
- [ROADMAP.md](ROADMAP.md) - Visión a largo plazo
- [../CHANGELOG.md](../CHANGELOG.md) - Cambios implementados

---

**Última Actualización**: YYYY-MM-DD
**Próxima Revisión**: Después de cada sprint
