
# REF_OncoDiagnostico

Diccionario de **diagnósticos oncológicos** basados en CIE-10.  
Se usa para seleccionar el diagnóstico principal del caso en `UGCO_CasoOncologico`.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoDiagnostico
-- Catálogo de diagnósticos oncológicos (CIE-10)
-- =========================================

CREATE TABLE REF_OncoDiagnostico (
    id_dg             SERIAL PRIMARY KEY,

    codigo_cie10      VARCHAR(10)  NOT NULL UNIQUE, -- C16, C18.9, C50.9, etc.
    nombre_dx         VARCHAR(255) NOT NULL,        -- Descripción corta: "Cáncer gástrico", etc.

    -- Clasificación clínica / de gestión
    grupo_tumor       VARCHAR(100),                 -- "Gástrico", "Colon-recto", "Próstata", etc.
    especialidad_id   INTEGER,                      -- FK → REF_OncoEspecialidad(id)
    es_maligno        BOOLEAN NOT NULL DEFAULT TRUE,
    es_in_situ        BOOLEAN NOT NULL DEFAULT FALSE,
    es_hematologico   BOOLEAN NOT NULL DEFAULT FALSE,

    activo            BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo           | Tipo lógico  | PK | Nulo | Descripción                                                           |
|-----------------|-------------|----|------|-----------------------------------------------------------------------|
| id_dg           | entero      | ✔  | No   | Identificador interno del diagnóstico oncológico.                     |
| codigo_cie10    | texto corto |    | No   | Código CIE-10 (C00–C97, D00–D09, etc.).                               |
| nombre_dx       | texto       |    | No   | Nombre del diagnóstico: etiqueta amigable para selección en UGCO.     |
| grupo_tumor     | texto       |    | Sí   | Agrupación clínica: gástrico, colon-recto, próstata, mama, etc.       |
| especialidad_id | entero (FK) |    | Sí   | Relación con `REF_OncoEspecialidad` (enfermera/equipo responsable).   |
| es_maligno      | booleano    |    | No   | TRUE si corresponde a neoplasia maligna.                              |
| es_in_situ      | booleano    |    | No   | TRUE si corresponde a lesión in situ.                                 |
| es_hematologico | booleano    |    | No   | TRUE para leucemias, linfomas, mielomas, etc.                         |
| activo          | booleano    |    | No   | TRUE si el diagnóstico está disponible para selección.                |
