# Auditoria CODEX - NB_Apps (NocoBase MIRA)

Fecha: 2026-02-02
Autor: Codex (auditoria asistida)
Clasificacion: Uso interno / Confidencial
Repositorio: c:\_Proyectos\Desarrollo\NB_Apps

**Resumen Ejecutivo**
Riesgo global: Alto. Se identifico exposicion de credenciales y uso sistematico de privilegios elevados. Se recomienda rotacion inmediata de tokens y saneamiento del historial.

**Alcance**
- Repositorio principal `NB_Apps/`
- Subrepositorio anidado `MIRA/`
- Scripts de automatizacion y documentacion tecnica en `Apps/` y `shared/`
- Sin revision de infraestructura ni base de datos en ejecucion

**Metodologia**
- Revision estatica de codigo y documentacion
- Busqueda de secretos y patrones de acceso a API
- Inspeccion de configuracion y dependencias
- No se ejecuto pruebas dinamicas, pentesting ni escaneo externo

**Modelo De Riesgo**
| Severidad | Definicion |
|---|---|
| Critico | Compromiso total o impacto legal severo |
| Alto | Acceso no autorizado o alteracion significativa |
| Medio | Falla operativa o exposicion limitada |
| Bajo | Buenas practicas o inconsistencias menores |

**Hallazgos (Resumen)**
| ID | Severidad | Titulo |
|---|---|---|
| H-01 | Critico | Credenciales expuestas en codigo y docs |
| H-02 | Critico | Uso de rol root por defecto |
| H-03 | Alto | Endpoints de produccion hardcodeados |
| H-04 | Alto | Secretos en documentacion historica |
| H-05 | Medio | Logging local con posible data sensible |
| H-06 | Medio | Ausencia de pruebas y CI |
| H-07 | Bajo | Variables de entorno inconsistentes |

H-01 Credenciales expuestas en codigo y docs (Critico)
Evidencia: tokens JWT en scripts y documentacion, por ejemplo `Apps/UGCO/scripts/nocobase/*.ts`, `Apps/UGCO/scripts/nocobase/*.js`, `Apps/UGCO/scripts/scripts-archive/*.ts`, `Apps/UGCO/docs/HALLAZGOS-SIDRA-ALMA.md`, `MIRA/scripts/*.js`.
Impacto: acceso administrativo y posible exfiltracion o modificacion de datos.
Recomendacion: revocar y rotar todos los tokens expuestos, reemplazar por variables de entorno o un vault, y limpiar el historial Git con una herramienta segura.

H-02 Uso de rol root por defecto (Critico)
Evidencia: `shared/scripts/ApiClient.ts` fuerza `X-Role: root` y `NOCOBASE_ROLE` definido en `.env`.
Impacto: cualquier error o fuga tiene maximo impacto.
Recomendacion: definir roles minimos por script, no usar root por defecto, y exigir explicitamente `NOCOBASE_ROLE` en tiempo de ejecucion.

H-03 Endpoints de produccion hardcodeados (Alto)
Evidencia: scripts con URLs de produccion en `MIRA/scripts/*.js` y `Apps/UGCO/scripts/nocobase/*.js`.
Impacto: ejecuciones accidentales contra produccion.
Recomendacion: exigir confirmacion de entorno y mover URLs a `.env` por entorno.

H-04 Secretos en documentacion historica (Alto)
Evidencia: docs con tokens o ejemplos reales en `Apps/UGCO/docs/*.md`.
Impacto: exposicion persistente aunque no se ejecute el codigo.
Recomendacion: reemplazar por placeholders, mover ejemplos a formato seguro y eliminar secretos del historial.

H-05 Logging local con posible data sensible (Medio)
Evidencia: `shared/scripts/ApiClient.ts` registra requests en `.claude/logs`.
Impacto: posible almacenamiento local de datos clinicos sin politica de retencion.
Recomendacion: redactar campos sensibles, desactivar logs en entornos productivos y definir retencion.

H-06 Ausencia de pruebas y CI (Medio)
Evidencia: `package.json` no define pruebas reales.
Impacto: regresiones en scripts criticos y falta de control de calidad.
Recomendacion: agregar CI minimo con `tsc --noEmit` y smoke tests.

H-07 Variables de entorno inconsistentes (Bajo)
Evidencia: uso mixto de `NOCOBASE_API_KEY`, `NOCOBASE_API_TOKEN` y `API_KEY` en `MIRA/` y `Apps/`.
Impacto: errores operativos y rotaciones incompletas.
Recomendacion: estandarizar nombres y documentar una unica fuente de verdad.

**Acciones Inmediatas (0-48h)**
1. Rotar todos los tokens detectados en repositorio y documentacion.
2. Reemplazar tokens en codigo por variables de entorno.
3. Ejecutar limpieza del historial Git para eliminar secretos.
4. Activar escaneo de secretos en pre-commit y CI.

**Plan De Remediacion (2-4 semanas)**
1. Refactor de `shared/scripts/ApiClient.ts` para rol configurable y minimo.
2. Configuracion por entorno con protecciones para produccion.
3. Politica de logging y manejo de datos sensibles.
4. Pipeline de CI con chequeos basicos y reportes.

**Fortalezas**
- Documentacion extensa y ordenada.
- TypeScript en modo estricto (`tsconfig.json`).
- Scripts reutilizables que estandarizan operaciones.

**Limitaciones**
- Auditoria estatica sin pruebas dinamicas.
- No se reviso infraestructura ni configuracion real de NocoBase.
