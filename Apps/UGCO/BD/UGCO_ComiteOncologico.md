
# UGCO_ComiteOncologico

Representa una sesión de comité oncológico (tumor board), donde se discuten uno o más casos.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: UGCO_ComiteOncologico
-- Sesiones de comité oncológico
-- =========================================

CREATE TABLE UGCO_ComiteOncologico (
    id_comite        SERIAL PRIMARY KEY,

    -- Identificadores opcionales
    UGCO_COD01       VARCHAR(50) UNIQUE,
    UGCO_COD02       VARCHAR(50),
    UGCO_COD03       VARCHAR(50),
    UGCO_COD04       VARCHAR(50),

    fecha_comite     TIMESTAMP NOT NULL,
    nombre           VARCHAR(255),                -- ej. "Comité Digestivo", "Comité General"
    tipo_comite      VARCHAR(100),               -- texto libre o futuro catálogo
    especialidad_id  INTEGER,                    -- FK → REF_OncoEspecialidad(id), opcional

    lugar            VARCHAR(255),
    observaciones    TEXT,

    creado_por       VARCHAR(100) NOT NULL,
    fecha_creacion   TIMESTAMP NOT NULL DEFAULT NOW(),
    modificado_por   VARCHAR(100),
    fecha_modificacion TIMESTAMP
);
```

---

## Diccionario de campos

| Campo              | Tipo lógico  | PK | Nulo | Descripción                                                                 |
|--------------------|-------------|----|------|-----------------------------------------------------------------------------|
| id_comite          | entero      | ✔  | No   | Identificador interno de la sesión de comité.                               |
| UGCO_COD01         | texto corto |    | Sí   | Código interno UGCO del comité (si se usa).                                |
| UGCO_COD02         | texto corto |    | Sí   | Identificador externo (si se enlaza a otro sistema).                       |
| UGCO_COD03         | texto corto |    | Sí   | Segundo identificador externo.                                             |
| UGCO_COD04         | texto corto |    | Sí   | Reservado para interoperabilidad futura.                                   |
| fecha_comite       | fecha/hora  |    | No   | Fecha y hora de realización del comité.                                    |
| nombre             | texto       |    | Sí   | Nombre de la sesión de comité (ej. “Comité Digestivo”, “Comité General”).  |
| tipo_comite        | texto       |    | Sí   | Tipo de comité (puede usarse como texto libre o futuro catálogo).          |
| especialidad_id    | entero (FK) |    | Sí   | Especialidad principal del comité (`REF_OncoEspecialidad`).                |
| lugar              | texto       |    | Sí   | Lugar físico o virtual (sala, plataforma) donde se realiza el comité.      |
| observaciones      | texto       |    | Sí   | Notas generales de la sesión.                                              |
| creado_por         | texto corto |    | No   | Usuario que creó el registro del comité.                                   |
| fecha_creacion     | fecha/hora  |    | No   | Fecha/hora de creación del registro.                                       |
| modificado_por     | texto corto |    | Sí   | Último usuario que modificó el registro.                                   |
| fecha_modificacion | fecha/hora  |    | Sí   | Fecha/hora de última modificación.                                         |
