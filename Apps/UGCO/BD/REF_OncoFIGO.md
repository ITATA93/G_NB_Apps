
# REF_OncoFIGO

Catálogo de estadios **FIGO** para tumores ginecológicos.  
Puede usarse directamente o como fuente para llenar `REF_OncoEstadioClinico` con `sistema = 'FIGO'`.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoFIGO
-- Estadios FIGO para cáncer ginecológico
-- =========================================

CREATE TABLE REF_OncoFIGO (
    id_figo      SERIAL PRIMARY KEY,

    localizacion VARCHAR(100) NOT NULL,       -- Cérvix, Endometrio, Ovario, Vulva, etc.
    codigo       VARCHAR(20)  NOT NULL,       -- I, IA, IB, IIIC, IVB, etc.
    nombre       VARCHAR(255) NOT NULL,       -- Descripción resumida del estadio
    activo       BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo       | Tipo lógico  | PK | Nulo | Descripción                                   |
|-------------|-------------|----|------|-----------------------------------------------|
| id_figo     | entero      | ✔  | No   | Identificador interno del estadio FIGO.       |
| localizacion| texto       |    | No   | Localización ginecológica (cérvix, ovario...).|
| codigo      | texto corto |    | No   | Código del estadio (I, IA, IB, etc.).         |
| nombre      | texto       |    | No   | Descripción del estadio.                      |
| activo      | booleano    |    | No   | TRUE si está disponible para uso.             |
