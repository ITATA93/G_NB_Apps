# FASE 3: Capa Longitudinal (Bitácora Inmutable)

## 1. Justificación Arquitectónica

En el rediseño radical, abandonamos la sobrescritura de campos. Todo lo que "le pasa" al paciente es un **Evento**. La colección `ugco_eventos` es un registro (Log) ordenado cronológicamente (Timeline).

**Regla de Hierro: Flujo Unidireccional**. UGCO **extrae** datos del RCE (TrakCare/ALMA) mediante queries SQL directas a la base InterSystems IRIS. UGCO **jamás escribe** de vuelta a la ficha clínica institucional. No hay mensajería HL7 ni FHIR involucrada; la integración es por ETL (Extract-Transform-Load) periódico.

---

## 2. Colección: `ugco_eventos`

### 2.1 Llaves de Contexto y Relación

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `id` | PK Auto | — | — |
| `caso_id` | BelongsTo → `ugco_casos` | Required | A quién le ocurrió |
| `tipo_evento_id` | BelongsTo → `ugco_cat_tipos_evento` | Required | Qué ocurrió |
| `id_episodio_rce` | String | Indexado, Nullable | `EpisodeID` de ALMA. Para de-duplicar eventos importados |
| `origen_dato` | Enum | Default: Manual | `Manual` (ingresado por usuario en NocoBase), `ETL_ALMA` (extraído automáticamente), `Workflow` (generado por automatización interna) |

> [!IMPORTANT]
> **La mayoría de los eventos oncológicos se ingresarán manualmente.** Procesos como Biopsias, Comités, Notificación GES, IPD, Solicitud de Pabellón, y resultados de EDA/exámenes externos **no están en ALMA**. Ver la Matriz de Disponibilidad en [Fase 3B](fase_3b_etl_alma.md).

### 2.2 Temporalidad y Trazabilidad

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `fecha_clinica` | Datetime | Required | Cuándo ocurrió en la realidad clínica |
| `fecha_registro` | Datetime | Auto | Cuándo se ingresó en NocoBase |
| `profesional_id` | BelongsTo → `users` | Nullable | Quién ejecutó la acción clínica |
| `institucion_ejecutora` | Enum | Default: Hospital_Ovalle | Hospital_Ovalle, INC, HSJ_Dios, Otro_Extrasistema |

### 2.3 Estado del Evento (Solo para Solicitudes)

Algunos eventos representan solicitudes que transitan por estados. Otros son hechos consumados.

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `estado_solicitud` | Enum | Nullable | `Solicitado`, `Agendado`, `Realizado`, `Cancelado`. Solo se usa si `ugco_cat_tipos_evento.es_solicitud` = true. Si el evento es un hecho consumado, se deja null. |
| `fecha_agendada` | Date | Nullable | Cuándo está programado (si es solicitud) |

> [!NOTE]
> **Ejemplo de Solicitud**: Tipo "Solicitud de TAC" → se crea con estado `Solicitado`. La enfermera lo mueve a `Agendado` cuando consigue hora. Se marca `Realizado` cuando se ejecuta. En ese momento, opcionalmente se crea un NUEVO evento "Resultado TAC" ya como hecho consumado.
>
> **Ejemplo de Hecho Consumado**: Tipo "Control Médico" → se inserta directamente sin `estado_solicitud`. Ya ocurrió.

### 2.4 Carga Útil (Payload Clínico)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `resumen_titulo` | String | Required | Lo que lee el médico rápido (Ej: "Endoscopía: Tumor ulcerado") |
| `detalles_json` | JSON | Nullable | Data estructurada. Ej Cirugía: `{"procedimiento": "Gastrectomía", "hallazgos": "Margen libre"}`. Ej Control: `{"peso": 65, "ECOG": 1}` |
| `texto_clinico` | Rich Text | Nullable | Resoluciones largas, actas de biopsia, evoluciones |
| `archivos_adjuntos` | Attachment | Nullable | PDFs de resultados externos |

### 2.5 Campos Especiales RHC

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `intencion_clinica` | Enum | Nullable | Curativa, Paliativa, De_Soporte |
| `estado_enfermedad` | Enum | Nullable | Respuesta_Completa, Respuesta_Parcial, Estable, Progresion |

---

## 3. Dinámica del Sistema (Event-Sourcing)

- **Inmutabilidad**: Los usuarios **NO EDITAN** eventos pasados. Si hay un error, se crea un evento de corrección (como en contabilidad clínica). NocoBase puede configurar permisos de solo escritura (Create) sin Update sobre esta colección.
- **Proyección Temporal**: Filtrar eventos por rango de fechas permite reconstruir el estado del paciente en cualquier momento del pasado.
- **De-duplicación ALMA**: El campo `id_episodio_rce` + `tipo_evento_id` permite que el ETL nocturno identifique si un evento ya fue importado, evitando duplicados.
- **Preparado para IA**: El payload JSON + texto libre son perfectos para que una IA genere "Epicrisis Automática" leyendo todos los eventos en orden cronológico.
