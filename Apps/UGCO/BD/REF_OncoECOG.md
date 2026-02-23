
# REF_OncoECOG

Catálogo de la **escala de performance ECOG**.  
Puede referenciarse desde `UGCO_CasoOncologico` (ECOG inicial) u otras tablas de seguimiento.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoECOG
-- Catálogo ECOG
-- =========================================

CREATE TABLE REF_OncoECOG (
    id_ecog      SERIAL PRIMARY KEY,

    valor        INTEGER     NOT NULL UNIQUE, -- 0, 1, 2, 3, 4
    codigo       VARCHAR(10) NOT NULL,        -- "0","1","2","3","4" (si se quiere manejar como texto)
    descripcion  VARCHAR(255) NOT NULL,
    activo       BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo       | Tipo lógico | PK | Nulo | Descripción                                      |
|-------------|------------|----|------|--------------------------------------------------|
| id_ecog     | entero     | ✔  | No   | Identificador interno del valor ECOG.            |
| valor       | entero     |    | No   | Valor numérico ECOG (0–4).                       |
| codigo      | texto      |    | No   | Código en texto (en general igual a `valor`).    |
| descripcion | texto      |    | No   | Descripción oficial de la categoría ECOG.        |
| activo      | booleano   |    | No   | TRUE si el valor está disponible para uso.       |
