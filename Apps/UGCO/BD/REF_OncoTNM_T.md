
# REF_OncoTNM_T

Catálogo de valores **T** del sistema TNM (tumor primario).  
Opcionalmente referenciado desde `UGCO_CasoOncologico.tnm_t`.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoTNM_T
-- Valores T del sistema TNM
-- =========================================

CREATE TABLE REF_OncoTNM_T (
    id_tnm_t    SERIAL PRIMARY KEY,

    codigo      VARCHAR(10)  NOT NULL,         -- Tis, T0, T1, T1a, T2, etc.
    descripcion VARCHAR(255) NOT NULL,
    localizacion VARCHAR(100),                 -- Órgano o localización opcional (ej. "Mama", "Colon")
    activo      BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo       | Tipo lógico  | PK | Nulo | Descripción                               |
|-------------|-------------|----|------|-------------------------------------------|
| id_tnm_t    | entero      | ✔  | No   | Identificador interno del valor T.        |
| codigo      | texto corto |    | No   | Código T (Tis, T0, T1, T2, etc.).         |
| descripcion | texto       |    | No   | Descripción del nivel T.                  |
| localizacion| texto       |    | Sí   | Órgano/localización a la que aplica.      |
| activo      | booleano    |    | No   | TRUE si está disponible para uso.         |
