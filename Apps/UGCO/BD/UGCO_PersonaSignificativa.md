
# UGCO_PersonaSignificativa

Datos de contacto de la persona significativa o cuidador principal del paciente, similar a la sección “Datos de contacto de Persona Significativa” de SIGO.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: UGCO_PersonaSignificativa
-- Persona significativa / cuidador del paciente
-- =========================================

CREATE TABLE UGCO_PersonaSignificativa (
    id_persona_sig     SERIAL PRIMARY KEY,

    paciente_id        INTEGER NOT NULL,          -- FK → alma_pacientes(id)
    caso_id            INTEGER,                   -- FK → UGCO_CasoOncologico(id_caso), opcional

    nombre_completo    VARCHAR(255) NOT NULL,
    parentesco         VARCHAR(100),              -- Hijo/a, Cónyuge, Hermano/a, Amigo/a, etc.
    telefono_1         VARCHAR(50),
    telefono_2         VARCHAR(50),
    email              VARCHAR(255),

    vive_con_paciente  BOOLEAN,
    es_cuidador_principal BOOLEAN,

    fuente_dato        VARCHAR(50),               -- ALMA / SIGO / MANUAL
    observaciones      TEXT,

    creado_por         VARCHAR(100) NOT NULL,
    fecha_creacion     TIMESTAMP NOT NULL DEFAULT NOW(),
    modificado_por     VARCHAR(100),
    fecha_modificacion TIMESTAMP
);
```

---

## Diccionario de campos

| Campo                 | Tipo lógico  | PK | Nulo | Descripción                                                                 |
|-----------------------|-------------|----|------|-----------------------------------------------------------------------------|
| id_persona_sig        | entero      | ✔  | No   | Identificador interno de la persona significativa.                          |
| paciente_id           | entero (FK) |    | No   | Paciente en ALMA al que está asociada (`alma_pacientes`).                   |
| caso_id               | entero (FK) |    | Sí   | Caso oncológico UGCO relacionado, si se quiere asociar a un caso específico.|
| nombre_completo       | texto       |    | No   | Nombre completo de la persona significativa.                                |
| parentesco            | texto       |    | Sí   | Relación con el paciente (Hijo/a, Cónyuge, Hermano/a, Amigo/a, etc.).       |
| telefono_1            | texto corto |    | Sí   | Teléfono de contacto principal.                                             |
| telefono_2            | texto corto |    | Sí   | Teléfono de contacto secundario.                                            |
| email                 | texto       |    | Sí   | Correo electrónico de la persona significativa.                             |
| vive_con_paciente     | booleano    |    | Sí   | TRUE si vive en el mismo hogar que el paciente.                             |
| es_cuidador_principal | booleano    |    | Sí   | TRUE si se considera el cuidador principal del paciente.                    |
| fuente_dato           | texto corto |    | Sí   | Origen de la información: ALMA, SIGO, MANUAL, otro.                         |
| observaciones         | texto       |    | Sí   | Notas adicionales sobre la persona significativa.                           |
| creado_por            | texto corto |    | No   | Usuario que creó el registro en UGCO.                                       |
| fecha_creacion        | fecha/hora  |    | No   | Fecha/hora de creación del registro.                                        |
| modificado_por        | texto corto |    | Sí   | Último usuario que modificó el registro.                                    |
| fecha_modificacion    | fecha/hora  |    | Sí   | Fecha/hora de última modificación.                                          |
