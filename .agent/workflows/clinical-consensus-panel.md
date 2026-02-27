---
description: Mesa de Consenso de Agentes Expertos Clinicos para desarrollo de aplicaciones de salud hospitalaria.
depends_on: [consensus-panel.md]
impacts: [20_clinical_app_pipeline.md]
---
# Clinical Consensus Panel — Mesa de Expertos Clinicos

Panel deliberativo tipo Mixture of Experts (MoE) con roles clinicos hospitalarios.
Emula el proceso real de desarrollo de software clinico: analisis de necesidad, validacion medica,
estandares de informatica en salud, usabilidad clinica y sintesis tecnica.

## Roles Clinicos (5 turnos secuenciales)

### Turno 1 — Analista de Necesidades Clinicas
**Agente base**: `researcher`

Elabora la necesidad clinica en detalle:
- Quien usa la aplicacion (medicos, enfermeras, tecnologos, administrativos)
- En que contexto asistencial (urgencia, hospitalizacion, consulta ambulatoria, pabellon)
- Que problema clinico resuelve o que flujo de trabajo reemplaza
- Volumetria esperada (pacientes/dia, registros/turno)
- Restricciones operacionales (turnos, conectividad, dispositivos disponibles)

**Output**: Documento de Necesidad Clinica estructurado.

### Turno 2 — Medico Experto de Dominio
**Agente base**: `code-analyst`

Revisa el documento de necesidad y valida:
- Precision clinica de la terminologia (CIE-10, SNOMED CT, CIE-O-3 si aplica)
- Flujos asistenciales realistas (no idealizar, respetar como funciona el hospital)
- Escenarios criticos y de seguridad del paciente (errores de medicacion, identificacion)
- Alertas clinicas necesarias (valores criticos, alergias, interacciones)
- Campos clinicos obligatorios vs opcionales segun contexto

**Output**: Validacion clinica con correcciones y advertencias de seguridad.

### Turno 3 — Especialista en Informatica Medica
**Agente base**: `db-analyst`

Revisa necesidad y validacion clinica, evalua:
- Modelo de datos clinico apropiado (entidad-relacion, normalizacion)
- Estandares de codificacion (CIE-10, SNOMED CT, LOINC, HL7 FHIR si aplica)
- Cumplimiento normativo: Ley 20.584 (derechos del paciente), Ley 19.628 (datos personales)
- Interoperabilidad con sistemas existentes (ALMA, TrakCare, laboratorio)
- Trazabilidad y auditoria de acciones clinicas
- Reglas de retencion y respaldo de datos clinicos

**Output**: Evaluacion de informatica medica con modelo de datos propuesto y gaps normativos.

### Turno 4 — Evaluador de Usabilidad Clinica
**Agente base**: `ui-designer`

Revisa todo lo anterior desde la perspectiva del usuario clinico:
- Carga cognitiva bajo presion asistencial (turnos de 12h, urgencias)
- Targets tactiles grandes para uso con guantes o en movimiento
- Alto contraste y legibilidad para ambientes con iluminacion variable
- Prevencion de errores: confirmaciones en acciones criticas, no eliminar sin doble check
- Flujo minimo de clicks para tareas frecuentes
- Escenarios de emergencia: acceso rapido sin navegacion profunda
- Accesibilidad WCAG 2.1 AA

**Output**: Evaluacion de usabilidad con wireframes conceptuales y recomendaciones UX.

### Turno 5 — Integrador Tecnico NocoBase
**Agente base**: `code-reviewer`

Sintetiza los 4 turnos anteriores en una especificacion implementable:
- Collections y fields para `app-spec/app.yaml`
- Roles y permisos (mapeo a roles hospitalarios reales)
- Paginas UI y bloques NocoBase
- Workflows y automatizaciones
- Integraciones con ALMA/TrakCare (campos ZEN, APIs)
- Checklist de Definition of Done (DoD)

**Output**: Borrador de `app-spec/app.yaml` + documento de consenso final.

## Invocacion

```bash
# Script dedicado (RECOMENDADO): cada agente recibe su prompt de rol clinico
# y el output acumulado de los turnos anteriores
bash .subagents/run-clinical-consensus.sh "Necesitamos una app para [descripcion clinica]"

# Alternativa via dispatch de team (sin prompt overlay por rol)
bash .subagents/dispatch-team.sh clinical-consensus "Necesitamos una app para [descripcion clinica]"
```

## Output

Archivo markdown en `docs/temp/clinical-consensus-YYYYMMDD-HHmmss.md` con:
1. Resumen ejecutivo del consenso
2. Contribucion de cada experto (5 secciones)
3. Puntos de acuerdo y divergencias resueltas
4. Borrador de app-spec/app.yaml
5. Riesgos clinicos identificados y mitigaciones
6. Checklist DoD propuesto

## Conexion con Pipeline

El output de este panel alimenta directamente el workflow `20_clinical_app_pipeline.md`,
que conecta con el pipeline NocoBase existente (intake -> spec -> configure -> audit).
