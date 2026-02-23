
# REF_OncoEstadioClinico

Catálogo de **estadios clínicos** (I, II, IIIA, IIIB, IV, etc.), eventualmente por localización y sistema (TNM, FIGO).  
Puede referenciarse desde `UGCO_CasoOncologico.estadio_clinico_id`.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoEstadioClinico
-- Estadios clínicos por sistema (TNM, FIGO, etc.)
-- =========================================

CREATE TABLE REF_OncoEstadioClinico (
    id_estadio   SERIAL PRIMARY KEY,

    sistema      VARCHAR(50)  NOT NULL,       -- TNM, FIGO, otro
    codigo       VARCHAR(20)  NOT NULL,       -- I, II, IIIA, IIIB, IV, etc.
    nombre       VARCHAR(255) NOT NULL,       -- Nombre completo si se requiere
    localizacion VARCHAR(100),                -- Órgano o tumor al que aplica (Mama, Colon, etc.)

    activo       BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo       | Tipo lógico  | PK | Nulo | Descripción                                      |
|-------------|-------------|----|------|--------------------------------------------------|
| id_estadio  | entero      | ✔  | No   | Identificador interno del estadio clínico.       |
| sistema     | texto corto |    | No   | Sistema de referencia (TNM, FIGO, etc.).         |
| codigo      | texto corto |    | No   | Código del estadio (I, II, IIIA, IIIB, IV...).   |
| nombre      | texto       |    | No   | Nombre completo o descripción del estadio.       |
| localizacion| texto       |    | Sí   | Órgano/tumor específico (si se define así).      |
| activo      | booleano    |    | No   | TRUE si está disponible para uso.                |
