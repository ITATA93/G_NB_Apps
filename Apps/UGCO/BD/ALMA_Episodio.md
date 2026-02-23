
# ALMA_Episodio

Tabla de **episodios/atenciones** de ALMA (hospitalización, urgencia, ambulatorio).  
Se usa para vincular casos y eventos oncológicos con la atención clínica de origen.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: ALMA_Episodio
-- Episodios / atenciones clínicas
-- =========================================

CREATE TABLE ALMA_Episodio (
    episodio_id        INTEGER PRIMARY KEY,      -- ID de episodio en ALMA
    paciente_id        INTEGER NOT NULL,         -- FK -> ALMA_Paciente(paciente_id)

    tipo_episodio      VARCHAR(50),             -- HOSPITALARIO, CONSULTA_EXT, URGENCIA, etc.
    fecha_ingreso      TIMESTAMP NOT NULL,
    fecha_egreso       TIMESTAMP,

    establecimiento    VARCHAR(100),
    servicio           VARCHAR(100),            -- servicio clínico
    unidad             VARCHAR(100),            -- unidad/pabellón/sala si aplica
    profesional_tratante VARCHAR(150),          -- nombre o ID externo del médico tratante

    motivo_consulta    TEXT,
    resumen_alta       TEXT,

    fecha_ultima_actualizacion TIMESTAMP,
    activo             BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo                    | Tipo lógico  | PK | Nulo | Descripción                                                       |
|--------------------------|-------------|----|------|-------------------------------------------------------------------|
| episodio_id              | entero      | ✔  | No   | Identificador del episodio en ALMA.                               |
| paciente_id              | entero (FK) |    | No   | Paciente al que pertenece el episodio.                            |
| tipo_episodio            | texto corto |    | Sí   | Tipo de atención (hospitalaria, ambulatoria, urgencia, etc.).     |
| fecha_ingreso            | fecha/hora  |    | No   | Fecha/hora de ingreso.                                            |
| fecha_egreso             | fecha/hora  |    | Sí   | Fecha/hora de egreso, si aplica.                                  |
| establecimiento          | texto       |    | Sí   | Establecimiento donde se atiende.                                 |
| servicio                 | texto       |    | Sí   | Servicio clínico responsable.                                     |
| unidad                   | texto       |    | Sí   | Unidad/sala/pabellón.                                             |
| profesional_tratante     | texto       |    | Sí   | Profesional tratante principal (texto o ID externo).              |
| motivo_consulta          | texto       |    | Sí   | Motivo de consulta o resumen de ingreso.                          |
| resumen_alta             | texto       |    | Sí   | Resumen de alta/motivo de egreso.                                 |
| fecha_ultima_actualizacion | fecha/hora|    | Sí   | Fecha de último refresco desde ALMA.                              |
| activo                   | booleano    |    | No   | TRUE si el episodio está vigente en la réplica.                   |
