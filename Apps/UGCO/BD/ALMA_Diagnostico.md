
# ALMA_Diagnostico

Tabla de **diagnósticos clínicos** registrados en ALMA, usualmente ligados a un episodio.  
UGCO la usa para enlazar el caso oncológico con el diagnóstico de origen.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: ALMA_Diagnostico
-- Diagnósticos CIE-10 de ALMA
-- =========================================

CREATE TABLE ALMA_Diagnostico (
    diag_id            INTEGER PRIMARY KEY,      -- ID de diagnóstico en ALMA
    episodio_id        INTEGER NOT NULL,         -- FK -> ALMA_Episodio(episodio_id)
    paciente_id        INTEGER NOT NULL,         -- FK -> ALMA_Paciente(paciente_id)

    tipo_diagnostico   VARCHAR(50),             -- PRINCIPAL, SECUNDARIO, COMORB, etc.
    codigo_cie10       VARCHAR(10) NOT NULL,
    descripcion        VARCHAR(255),

    fecha_registro     TIMESTAMP NOT NULL,
    profesional_registra VARCHAR(150),

    es_oncologico      BOOLEAN NOT NULL DEFAULT FALSE,

    fecha_ultima_actualizacion TIMESTAMP,
    activo             BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo                    | Tipo lógico  | PK | Nulo | Descripción                                                       |
|--------------------------|-------------|----|------|-------------------------------------------------------------------|
| diag_id                  | entero      | ✔  | No   | Identificador del diagnóstico en ALMA.                            |
| episodio_id              | entero (FK) |    | No   | Episodio en el que se registra el diagnóstico.                    |
| paciente_id              | entero (FK) |    | No   | Paciente al que corresponde el diagnóstico.                       |
| tipo_diagnostico         | texto corto |    | Sí   | Tipo de diagnóstico (principal, secundario, comorbilidad, etc.).  |
| codigo_cie10             | texto corto |    | No   | Código CIE-10 del diagnóstico.                                    |
| descripcion              | texto       |    | Sí   | Descripción libre (si existe en ALMA o se arma localmente).       |
| fecha_registro           | fecha/hora  |    | No   | Fecha/hora de registro del diagnóstico.                           |
| profesional_registra     | texto       |    | Sí   | Profesional que registró el diagnóstico.                          |
| es_oncologico            | booleano    |    | No   | TRUE si se considera diagnóstico oncológico relevante.            |
| fecha_ultima_actualizacion | fecha/hora|    | Sí   | Fecha de último refresco desde ALMA.                              |
| activo                   | booleano    |    | No   | TRUE si el diagnóstico sigue vigente en la réplica.               |
