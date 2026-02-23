
# REF_OncoBaseDiagnostico

Catálogo de **base del diagnóstico** oncológico: histología, citología, imagen, clínica, etc.  
Se puede referenciar desde `UGCO_CasoOncologico.base_diagnostico_id`.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoBaseDiagnostico
-- Base del diagnóstico (histológico, imagen, etc.)
-- =========================================

CREATE TABLE REF_OncoBaseDiagnostico (
    id_base      SERIAL PRIMARY KEY,

    codigo       VARCHAR(50)  NOT NULL UNIQUE,  -- HISTO, CITO, IMAGEN, CLINICO, AUTOPSIA, etc.
    nombre       VARCHAR(255) NOT NULL,         -- Histológico, Citológico, Imagen, Clínico, etc.
    descripcion  TEXT,

    es_histologico BOOLEAN NOT NULL DEFAULT FALSE,
    activo       BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo         | Tipo lógico  | PK | Nulo | Descripción                                            |
|---------------|-------------|----|------|--------------------------------------------------------|
| id_base       | entero      | ✔  | No   | Identificador interno de la base diagnóstica.          |
| codigo        | texto corto |    | No   | Código técnico: HISTO, CITO, IMAGEN, CLINICO, etc.     |
| nombre        | texto       |    | No   | Nombre visible de la base diagnóstica.                 |
| descripcion   | texto       |    | Sí   | Descripción o aclaraciones adicionales.                |
| es_histologico| booleano    |    | No   | TRUE si corresponde a confirmación histológica.        |
| activo        | booleano    |    | No   | TRUE si está disponible para uso.                      |
