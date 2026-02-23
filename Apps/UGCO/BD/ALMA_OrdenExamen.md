
# ALMA_OrdenExamen

Tabla de **órdenes de exámenes/procedimientos** registrada en ALMA.  
UGCO la usa para saber qué exámenes están pendientes, realizados, informados, etc.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: ALMA_OrdenExamen
-- Órdenes de exámenes / procedimientos
-- =========================================

CREATE TABLE ALMA_OrdenExamen (
    orden_id           INTEGER PRIMARY KEY,      -- ID de orden en ALMA
    paciente_id        INTEGER NOT NULL,         -- FK -> ALMA_Paciente(paciente_id)
    episodio_id        INTEGER,                  -- FK -> ALMA_Episodio(episodio_id), opcional

    tipo_orden         VARCHAR(100),             -- Imagenología, Laboratorio, Procedimiento, etc.
    codigo_examen      VARCHAR(50),              -- código del examen en ALMA
    nombre_examen      VARCHAR(255) NOT NULL,

    fecha_solicitud    TIMESTAMP NOT NULL,
    fecha_programada   TIMESTAMP,
    fecha_realizacion  TIMESTAMP,
    fecha_informe      TIMESTAMP,

    estado_orden       VARCHAR(50),              -- SOLICITADO, PROGRAMADO, REALIZADO, INFORMADO, CANCELADO...
    servicio_solicitante VARCHAR(100),
    profesional_solicitante VARCHAR(150),

    resultado_resumen  TEXT,                     -- opcional, si se replica el resumen
    url_informe        VARCHAR(500),             -- enlace al informe en visor, si aplica

    fecha_ultima_actualizacion TIMESTAMP,
    activo             BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo                    | Tipo lógico  | PK | Nulo | Descripción                                                       |
|--------------------------|-------------|----|------|-------------------------------------------------------------------|
| orden_id                 | entero      | ✔  | No   | Identificador de la orden en ALMA.                                |
| paciente_id              | entero (FK) |    | No   | Paciente al que pertenece la orden.                               |
| episodio_id              | entero (FK) |    | Sí   | Episodio asociado, si corresponde.                                |
| tipo_orden               | texto       |    | Sí   | Tipo de orden: imagen, laboratorio, procedimiento, etc.           |
| codigo_examen            | texto corto |    | Sí   | Código interno del examen/procedimiento en ALMA.                  |
| nombre_examen            | texto       |    | No   | Nombre del examen/procedimiento.                                  |
| fecha_solicitud          | fecha/hora  |    | No   | Fecha/hora en que se solicitó.                                    |
| fecha_programada         | fecha/hora  |    | Sí   | Fecha/hora programada.                                            |
| fecha_realizacion        | fecha/hora  |    | Sí   | Fecha/hora de realización.                                        |
| fecha_informe            | fecha/hora  |    | Sí   | Fecha/hora en que se informó el resultado.                        |
| estado_orden             | texto corto |    | Sí   | Estado de la orden (solicitado, realizado, informado, etc.).      |
| servicio_solicitante     | texto       |    | Sí   | Servicio que solicita el examen.                                  |
| profesional_solicitante  | texto       |    | Sí   | Profesional que solicita el examen.                               |
| resultado_resumen        | texto       |    | Sí   | Resumen del resultado, si se replica.                             |
| url_informe              | texto       |    | Sí   | Enlace al informe completo, si existe.                            |
| fecha_ultima_actualizacion | fecha/hora|    | Sí   | Fecha de último refresco desde ALMA.                              |
| activo                   | booleano    |    | No   | TRUE si la orden sigue vigente en la réplica.                     |
