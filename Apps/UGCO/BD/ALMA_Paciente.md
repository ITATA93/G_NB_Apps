
# ALMA_Paciente

Tabla de **pacientes** proveniente de ALMA (o réplica/staging para UGCO).  
Se usa como maestro de pacientes para enlazar los casos oncológicos.

> Nota: esta estructura es una simplificación para pruebas.  
> En la integración real, se debe mapear a la estructura verdadera de ALMA.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: ALMA_Paciente
-- Maestro de pacientes (réplica desde ALMA)
-- =========================================

CREATE TABLE ALMA_Paciente (
    paciente_id        INTEGER PRIMARY KEY,      -- ID de paciente en ALMA
    run                VARCHAR(20),             -- RUN formateado, si aplica
    tipo_documento     VARCHAR(20),             -- RUN, PASAPORTE, etc.
    nro_documento      VARCHAR(30),             -- número de documento
    dv                 VARCHAR(5),              -- dígito verificador, si se usa

    nombres            VARCHAR(100) NOT NULL,
    apellido_paterno   VARCHAR(100),
    apellido_materno   VARCHAR(100),

    fecha_nacimiento   DATE,
    sexo               VARCHAR(20),             -- F, M, I, etc.
    genero             VARCHAR(50),             -- si se registra distinto de sexo
    nacionalidad       VARCHAR(100),

    prevision          VARCHAR(50),             -- FONASA A/B/C/D, ISAPRE, etc.
    sistema_prevision  VARCHAR(50),             -- opcional: público/privado, etc.

    fecha_defuncion    DATE,

    -- Campos de auditoría locales
    fecha_ultima_actualizacion TIMESTAMP,       -- última vez que se refrescó desde ALMA
    activo             BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo                    | Tipo lógico  | PK | Nulo | Descripción                                                       |
|--------------------------|-------------|----|------|-------------------------------------------------------------------|
| paciente_id              | entero      | ✔  | No   | Identificador del paciente en ALMA (o staging).                   |
| run                      | texto corto |    | Sí   | RUN formateado.                                                   |
| tipo_documento           | texto corto |    | Sí   | Tipo de documento: RUN, PASAPORTE, etc.                           |
| nro_documento            | texto corto |    | Sí   | Número del documento.                                             |
| dv                       | texto corto |    | Sí   | Dígito verificador, si aplica.                                    |
| nombres                  | texto       |    | No   | Nombres del paciente.                                             |
| apellido_paterno         | texto       |    | Sí   | Apellido paterno.                                                 |
| apellido_materno         | texto       |    | Sí   | Apellido materno.                                                 |
| fecha_nacimiento         | fecha       |    | Sí   | Fecha de nacimiento.                                              |
| sexo                     | texto corto |    | Sí   | Sexo biológico.                                                   |
| genero                   | texto corto |    | Sí   | Género, si se registra aparte.                                    |
| nacionalidad             | texto       |    | Sí   | Nacionalidad.                                                     |
| prevision                | texto corto |    | Sí   | Previsión: FONASA, ISAPRE, etc.                                   |
| sistema_prevision        | texto corto |    | Sí   | Clasificación de previsión (público/privado/otro).                |
| fecha_defuncion          | fecha       |    | Sí   | Fecha de defunción, si se conoce.                                 |
| fecha_ultima_actualizacion | fecha/hora|    | Sí   | Fecha de último refresco desde ALMA.                              |
| activo                   | booleano    |    | No   | TRUE si el paciente sigue vigente en la réplica.                  |
