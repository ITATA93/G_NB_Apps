
# REF_OncoTipoEtapificacion

Catálogo de **tipo de etapificación** (clínica, patológica, post-tratamiento, etc.).  
Se puede referenciar desde `UGCO_CasoOncologico.tipo_etapificacion_id`.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoTipoEtapificacion
-- Tipo de etapificación (clínica, patológica, etc.)
-- =========================================

CREATE TABLE REF_OncoTipoEtapificacion (
    id_tipo_etap  SERIAL PRIMARY KEY,

    codigo        VARCHAR(50)  NOT NULL UNIQUE, -- CLINICA, PATOLOGICA, POST_TRAT, REETAPIF, etc.
    nombre        VARCHAR(255) NOT NULL,        -- Clínica, Patológica, Post-tratamiento, etc.
    descripcion   TEXT,
    activo        BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo         | Tipo lógico  | PK | Nulo | Descripción                                       |
|---------------|-------------|----|------|---------------------------------------------------|
| id_tipo_etap  | entero      | ✔  | No   | Identificador interno del tipo de etapificación.  |
| codigo        | texto corto |    | No   | Código técnico: CLINICA, PATOLOGICA, etc.        |
| nombre        | texto       |    | No   | Nombre visible del tipo de etapificación.         |
| descripcion   | texto       |    | Sí   | Descripción o aclaraciones adicionales.           |
| activo        | booleano    |    | No   | TRUE si está disponible para uso.                 |
