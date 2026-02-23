
# REF_OncoEstadoClinico

Catálogo de **estado clínico** del diagnóstico oncológico.  
Se usa en `UGCO_CasoOncologico.estado_clinico_id` para indicar, por ejemplo:
- SOSPECHA
- CONFIRMADO
- NO_CANCER

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoEstadoClinico
-- Catálogo de estado clínico del diagnóstico
-- =========================================

CREATE TABLE REF_OncoEstadoClinico (
    id          SERIAL PRIMARY KEY,
    codigo      VARCHAR(50) NOT NULL UNIQUE,   -- SOSPECHA, CONFIRMADO, NO_CANCER, RECAIDA, etc.
    nombre      VARCHAR(255) NOT NULL,         -- Sospecha, Confirmado, No cáncer, Recaída, etc.
    es_maligno  BOOLEAN NOT NULL DEFAULT TRUE, -- FALSE para NO_CANCER u otros estados no malignos
    activo      BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo    | Tipo lógico  | PK | Nulo | Descripción                                                              |
|----------|-------------|----|------|--------------------------------------------------------------------------|
| id       | entero      | ✔  | No   | Identificador interno del estado clínico.                                |
| codigo   | texto corto |    | No   | Código técnico: SOSPECHA, CONFIRMADO, NO_CANCER, RECAIDA, etc.          |
| nombre   | texto       |    | No   | Nombre visible del estado clínico.                                      |
| es_maligno | booleano  |    | No   | TRUE si el estado implica una neoplasia maligna activa.                 |
| activo   | booleano    |    | No   | TRUE si el estado está disponible para uso en la app.                   |
