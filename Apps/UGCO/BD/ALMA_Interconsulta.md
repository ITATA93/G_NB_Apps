
# ALMA_Interconsulta

Tabla de **interconsultas** registrada en ALMA.  
UGCO la usa para mostrar interconsultas pendientes, respondidas, especialidades involucradas, etc.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: ALMA_Interconsulta
-- Interconsultas
-- =========================================

CREATE TABLE ALMA_Interconsulta (
    interconsulta_id   INTEGER PRIMARY KEY,      -- ID de interconsulta en ALMA
    paciente_id        INTEGER NOT NULL,         -- FK -> ALMA_Paciente(paciente_id)
    episodio_id        INTEGER,                  -- FK -> ALMA_Episodio(episodio_id), opcional

    especialidad_solicitada VARCHAR(100) NOT NULL,
    servicio_solicitante    VARCHAR(100),
    profesional_solicitante VARCHAR(150),

    motivo_solicitud   TEXT,
    prioridad          VARCHAR(50),             -- RUTINA, URGENTE, etc.

    fecha_solicitud    TIMESTAMP NOT NULL,
    fecha_aceptacion   TIMESTAMP,
    fecha_respuesta    TIMESTAMP,

    estado_ic          VARCHAR(50),             -- PENDIENTE, ACEPTADA, EN_CURSO, RESPONDIDA, RECHAZADA, CANCELADA
    profesional_responde VARCHAR(150),
    respuesta_resumen  TEXT,

    fecha_ultima_actualizacion TIMESTAMP,
    activo             BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo                    | Tipo lógico  | PK | Nulo | Descripción                                                       |
|--------------------------|-------------|----|------|-------------------------------------------------------------------|
| interconsulta_id         | entero      | ✔  | No   | Identificador de la interconsulta en ALMA.                        |
| paciente_id              | entero (FK) |    | No   | Paciente al que corresponde la interconsulta.                     |
| episodio_id              | entero (FK) |    | Sí   | Episodio asociado, si corresponde.                                |
| especialidad_solicitada  | texto       |    | No   | Especialidad o servicio al que se dirige la interconsulta.        |
| servicio_solicitante     | texto       |    | Sí   | Servicio que solicita la interconsulta.                           |
| profesional_solicitante  | texto       |    | Sí   | Profesional que solicita.                                         |
| motivo_solicitud         | texto       |    | Sí   | Descripción libre del motivo.                                     |
| prioridad                | texto corto |    | Sí   | Prioridad (rutina, urgente, etc.).                                |
| fecha_solicitud          | fecha/hora  |    | No   | Fecha/hora de solicitud.                                          |
| fecha_aceptacion         | fecha/hora  |    | Sí   | Fecha/hora de aceptación, si se registra.                         |
| fecha_respuesta          | fecha/hora  |    | Sí   | Fecha/hora de respuesta.                                          |
| estado_ic                | texto corto |    | Sí   | Estado de la interconsulta.                                       |
| profesional_responde     | texto       |    | Sí   | Profesional que responde.                                         |
| respuesta_resumen        | texto       |    | Sí   | Resumen de la respuesta.                                          |
| fecha_ultima_actualizacion | fecha/hora|    | Sí   | Fecha de último refresco desde ALMA.                              |
| activo                   | booleano    |    | No   | TRUE si la interconsulta sigue vigente en la réplica.             |
