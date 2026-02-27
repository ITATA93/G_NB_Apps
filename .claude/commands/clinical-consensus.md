Ejecuta una Mesa de Consenso de Agentes Expertos Clinicos para desarrollar una aplicacion de salud hospitalaria en NocoBase.

## Instrucciones

Vas a emular un panel deliberativo de 5 expertos clinicos. Ejecuta cada turno como un subagente Task independiente, pasando el output acumulado de los turnos anteriores como contexto al siguiente.

La necesidad clinica del usuario es: {{input}}

## Turno 1 — Analista de Necesidades Clinicas

Lanza un subagente Task con este prompt:
"Eres un Analista de Necesidades Clinicas hospitalario. Elabora la siguiente necesidad clinica en detalle:
- Quien usa la app (medicos, enfermeras, tecnologos, administrativos)
- En que contexto asistencial (urgencia, hospitalizacion, consulta, pabellon)
- Que problema clinico resuelve o que flujo de trabajo manual reemplaza
- Volumetria esperada (pacientes/dia, registros/turno)
- Restricciones operacionales (turnos, conectividad, dispositivos)
- Integraciones necesarias (ALMA, TrakCare, laboratorio)
Necesidad: [la necesidad del usuario]"

## Turno 2 — Medico Experto de Dominio

Lanza un subagente Task con el output del Turno 1 como contexto:
"Eres un Medico Experto de Dominio. Revisa el documento de necesidad clinica y valida:
- Precision de la terminologia medica (CIE-10, SNOMED CT, CIE-O-3)
- Flujos asistenciales realistas (como realmente funciona el hospital)
- Escenarios criticos de seguridad del paciente
- Alertas clinicas necesarias (valores criticos, alergias, interacciones)
- Campos clinicos obligatorios vs opcionales"

## Turno 3 — Especialista en Informatica Medica

Lanza un subagente Task con los outputs de Turnos 1-2:
"Eres un Especialista en Informatica Medica. Evalua:
- Modelo de datos clinico apropiado (entidades, relaciones, normalizacion)
- Estandares de codificacion (CIE-10, SNOMED CT, LOINC, HL7 FHIR)
- Cumplimiento normativo: Ley 20.584 (derechos del paciente), Ley 19.628 (datos personales)
- Interoperabilidad con ALMA/TrakCare
- Trazabilidad y auditoria de acciones clinicas"

## Turno 4 — Evaluador de Usabilidad Clinica

Lanza un subagente Task con los outputs de Turnos 1-3:
"Eres un Evaluador de Usabilidad Clinica hospitalaria. Evalua:
- Carga cognitiva bajo presion asistencial (turnos 12h, urgencias)
- Targets tactiles grandes, alto contraste, legibilidad
- Prevencion de errores: confirmaciones en acciones criticas
- Flujo minimo de clicks para tareas frecuentes
- Escenarios de emergencia: acceso rapido sin navegacion profunda
- Accesibilidad WCAG 2.1 AA"

## Turno 5 — Integrador Tecnico NocoBase

Lanza un subagente Task con TODOS los outputs anteriores (Turnos 1-4):
"Eres un Integrador Tecnico NocoBase para hospitales. Sintetiza todo en:
- Collections y fields para app-spec/app.yaml
- Roles y permisos (mapeo a roles hospitalarios reales)
- Paginas UI y bloques NocoBase
- Workflows y automatizaciones
- Integraciones con ALMA/TrakCare
- Checklist DoD

Produce un borrador de app-spec/app.yaml en YAML y un resumen ejecutivo del consenso."

## Formato de Output Final

Presenta el documento de consenso completo con:
1. Resumen ejecutivo
2. Contribucion de cada experto (5 secciones)
3. Puntos de acuerdo y divergencias resueltas
4. Borrador de app-spec/app.yaml
5. Riesgos clinicos identificados y mitigaciones
6. Checklist DoD propuesto

Pregunta al usuario si aprueba el consenso antes de continuar con el pipeline de generacion (intake -> spec -> configure -> audit).
