
# REF_OncoTNM_M

Catálogo de valores **M** del sistema TNM (metástasis a distancia).  
Opcionalmente referenciado desde `UGCO_CasoOncologico.tnm_m`.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoTNM_M
-- Valores M del sistema TNM
-- =========================================

CREATE TABLE REF_OncoTNM_M (
    id_tnm_m    SERIAL PRIMARY KEY,

    codigo      VARCHAR(10)  NOT NULL,         -- M0, M1, etc.
    descripcion VARCHAR(255) NOT NULL,
    localizacion VARCHAR(100),                 -- Opcional, si aplica
    activo      BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo       | Tipo lógico  | PK | Nulo | Descripción                               |
|-------------|-------------|----|------|-------------------------------------------|
| id_tnm_m    | entero      | ✔  | No   | Identificador interno del valor M.        |
| codigo      | texto corto |    | No   | Código M (M0, M1, etc.).                  |
| descripcion | texto       |    | No   | Descripción del nivel M.                  |
| localizacion| texto       |    | Sí   | Órgano/localización a la que aplica.      |
| activo      | booleano    |    | No   | TRUE si está disponible para uso.         |
