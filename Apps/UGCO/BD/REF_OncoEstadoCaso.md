
# REF_OncoEstadoCaso

Catálogo de estados de seguimiento del caso oncológico UGCO.  
Se utiliza en `UGCO_CasoOncologico.estado_seguimiento_id` para marcar, por ejemplo:
- ACTIVO
- EN_SEGUIMIENTO
- CERRADO
- PERDIDO
- FALLECIDO
- DERIVADO

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoEstadoCaso
-- Catálogo de estados del caso oncológico
-- =========================================

CREATE TABLE REF_OncoEstadoCaso (
    id          SERIAL PRIMARY KEY,
    codigo      VARCHAR(50) NOT NULL UNIQUE,   -- ACTIVO, EN_SEGUIMIENTO, CERRADO, PERDIDO, FALLECIDO, DERIVADO...
    nombre      VARCHAR(255) NOT NULL,         -- Activo, En seguimiento, Cerrado, Perdido, Fallecido, Derivado...
    es_final    BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE si es estado final (cerrado, fallecido, derivado, etc.)
    activo      BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo    | Tipo lógico  | PK | Nulo | Descripción                                                                 |
|----------|-------------|----|------|-----------------------------------------------------------------------------|
| id       | entero      | ✔  | No   | Identificador interno del estado de caso.                                  |
| codigo   | texto corto |    | No   | Código técnico: ACTIVO, EN_SEGUIMIENTO, CERRADO, PERDIDO, FALLECIDO, DERIVADO, etc. |
| nombre   | texto       |    | No   | Nombre visible del estado.                                                 |
| es_final | booleano    |    | No   | TRUE si el caso se considera cerrado en este estado (cerrado, fallecido, etc.). |
| activo   | booleano    |    | No   | TRUE si el estado está disponible para uso en la app.                      |
