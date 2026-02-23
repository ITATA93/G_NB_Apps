
# UGCO_Tarea

Task manager para UGCO. Registra tareas clínicas asociadas a pacientes/casos/eventos y tareas internas (sin paciente), inspirado en FHIR Task.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: UGCO_Tarea
-- Task manager clínico + interno
-- =========================================

CREATE TABLE UGCO_Tarea (
    id_tarea           SERIAL PRIMARY KEY,

    -- Identificadores interoperables (opcionales en V1)
    UGCO_COD01         VARCHAR(50) UNIQUE,
    UGCO_COD02         VARCHAR(50),
    UGCO_COD03         VARCHAR(50),
    UGCO_COD04         VARCHAR(50),

    -- Vínculos
    paciente_id        INTEGER,                       -- NULL si es tarea interna
    caso_id            INTEGER,                       -- FK → UGCO_CasoOncologico(id_caso)
    evento_id          INTEGER,                       -- FK → UGCO_EventoClinico(id_evento)

    es_interna         BOOLEAN NOT NULL DEFAULT FALSE, -- FALSE = clínica, TRUE = interna

    tipo_tarea_id      INTEGER NOT NULL,              -- FK → REF_OncoTipoActividad(id)
    estado_tarea_id    INTEGER NOT NULL,              -- FK → REF_OncoEstadoActividad(id)

    titulo             VARCHAR(255) NOT NULL,
    descripcion        TEXT,

    fecha_creacion     TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_vencimiento  TIMESTAMP,
    fecha_inicio       TIMESTAMP,
    fecha_cierre       TIMESTAMP,

    responsable_usuario VARCHAR(100),
    equipo_id          INTEGER,                       -- FK → UGCO_EquipoSeguimiento(id), si existe
    comentarios        TEXT
);
```

> Agrega luego los `FOREIGN KEY` según el nombre final de tus tablas (`UGCO_CasoOncologico`, `UGCO_EventoClinico`, `REF_OncoTipoActividad`, `REF_OncoEstadoActividad`, etc.).

---

## Diccionario de campos

| Campo               | Tipo lógico   | PK | Nulo | Descripción                                                                 |
|---------------------|---------------|----|------|-----------------------------------------------------------------------------|
| id_tarea            | entero        | ✔  | No   | Identificador interno de la tarea.                                          |
| UGCO_COD01          | texto corto   |    | Sí   | Código interno de la tarea (si se expone a otros sistemas).                |
| UGCO_COD02          | texto corto   |    | Sí   | Id de la tarea en otro sistema (si aplica).                                |
| UGCO_COD03          | texto corto   |    | Sí   | Segundo identificador externo.                                             |
| UGCO_COD04          | texto corto   |    | Sí   | Reservado para interoperabilidad futura.                                   |
| paciente_id         | entero (FK)   |    | Sí   | Paciente asociado (nulo si es tarea interna administrativa).              |
| caso_id             | entero (FK)   |    | Sí   | Caso oncológico UGCO asociado.                                             |
| evento_id           | entero (FK)   |    | Sí   | Evento clínico asociado (ej. seguimiento de un examen).                    |
| es_interna          | booleano      |    | No   | FALSE = tarea clínica; TRUE = tarea interna sin paciente.                  |
| tipo_tarea_id       | entero (FK)   |    | No   | Tipo de tarea (examen, control, IC, gestión interna, etc.).                |
| estado_tarea_id     | entero (FK)   |    | No   | Estado de la tarea (pendiente, en curso, completada, vencida, etc.).      |
| titulo              | texto         |    | No   | Título corto de la tarea.                                                  |
| descripcion         | texto         |    | Sí   | Detalle de la tarea.                                                       |
| fecha_creacion      | fecha/hora    |    | No   | Fecha/hora de creación de la tarea.                                        |
| fecha_vencimiento   | fecha/hora    |    | Sí   | Fecha/hora objetivo para resolver la tarea.                                |
| fecha_inicio        | fecha/hora    |    | Sí   | Momento en que alguien empezó a trabajar la tarea.                         |
| fecha_cierre        | fecha/hora    |    | Sí   | Momento en que se marca como completada/cerrada.                           |
| responsable_usuario | texto corto   |    | Sí   | Usuario responsable principal de la tarea.                                 |
| equipo_id           | entero (FK)   |    | Sí   | Equipo de seguimiento responsable (si se modela).                          |
| comentarios         | texto         |    | Sí   | Notas internas adicionales.                                                |
