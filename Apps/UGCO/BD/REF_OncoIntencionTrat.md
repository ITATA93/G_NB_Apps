
# REF_OncoIntencionTrat

Catálogo de **intención de tratamiento oncológico**.  
Se usa en `UGCO_CasoOncologico.intencion_trat_id` para indicar, por ejemplo:
- CURATIVO
- PALIATIVO
- DIAGNOSTICO
- PROFILACTICO

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoIntencionTrat
-- Catálogo de intención de tratamiento
-- =========================================

CREATE TABLE REF_OncoIntencionTrat (
    id          SERIAL PRIMARY KEY,
    codigo      VARCHAR(50) NOT NULL UNIQUE,   -- CURATIVO, PALIATIVO, DIAGNOSTICO, PROFILACTICO, etc.
    nombre      VARCHAR(255) NOT NULL,         -- Curativo, Paliativo, Diagnóstico, Profiláctico, etc.
    es_curativo BOOLEAN NOT NULL DEFAULT FALSE,
    es_paliativo BOOLEAN NOT NULL DEFAULT FALSE,
    activo      BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo      | Tipo lógico  | PK | Nulo | Descripción                                                             |
|------------|-------------|----|------|-------------------------------------------------------------------------|
| id         | entero      | ✔  | No   | Identificador interno de la intención de tratamiento.                   |
| codigo     | texto corto |    | No   | Código técnico: CURATIVO, PALIATIVO, DIAGNOSTICO, PROFILACTICO, etc.   |
| nombre     | texto       |    | No   | Nombre visible de la intención.                                        |
| es_curativo| booleano    |    | No   | TRUE si esta intención se considera curativa.                           |
| es_paliativo| booleano   |    | No   | TRUE si esta intención se considera paliativa.                          |
| activo     | booleano    |    | No   | TRUE si la intención está disponible para uso en la app.                |
