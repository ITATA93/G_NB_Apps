
# REF_OncoGradoHistologico

Catálogo de **grado histológico / diferenciación tumoral**.  
Puede referenciarse desde `UGCO_CasoOncologico.grado_histologico_id`.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoGradoHistologico
-- Grado histológico / diferenciación tumoral
-- =========================================

CREATE TABLE REF_OncoGradoHistologico (
    id_grado     SERIAL PRIMARY KEY,

    codigo       VARCHAR(20)  NOT NULL UNIQUE, -- G1, G2, G3, GX, WELL, MOD, POOR, etc.
    nombre       VARCHAR(255) NOT NULL,        -- Bien diferenciado, Moderadamente diferenciado...
    descripcion  TEXT,
    activo       BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo      | Tipo lógico  | PK | Nulo | Descripción                                   |
|------------|-------------|----|------|-----------------------------------------------|
| id_grado   | entero      | ✔  | No   | Identificador interno del grado histológico.  |
| codigo     | texto corto |    | No   | Código: G1, G2, G3, GX, WELL, MOD, POOR, etc. |
| nombre     | texto       |    | No   | Nombre visible del grado.                     |
| descripcion| texto       |    | Sí   | Descripción adicional.                         |
| activo     | booleano    |    | No   | TRUE si está disponible para uso.             |
