
# REF_OncoEspecialidad

Catálogo de especialidades/grupos oncológicos usados para agrupar pacientes por equipos/enfermeras (ej. Digestivo alto, Urología, Mama, etc.).

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoEspecialidad
-- Catálogo de especialidades oncológicas
-- =========================================

CREATE TABLE REF_OncoEspecialidad (
    id          SERIAL PRIMARY KEY,       -- 1. Código Interno NocoBase
    
    -- 6-Code Schema
    codigo_alma     VARCHAR(50),              -- 2. Trazabilidad (ID en ALMA)
    codigo_oficial  VARCHAR(50) NOT NULL UNIQUE, -- 3. Estándar (DIG_ALTO, UROLO, etc.)
    codigo_map_snomed VARCHAR(50),            -- 4. Interoperabilidad (SNOMED CT)
    codigo_map_deis   VARCHAR(50),            -- 5. Reportes (DEIS)
    codigo_map_legacy VARCHAR(50),            -- 6. Legacy/Local

    nombre      VARCHAR(255) NOT NULL,         -- Digestivo alto, Urología oncológica...
    activo      BOOLEAN NOT NULL DEFAULT TRUE  -- para ocultar/mostrar en la app
);
```

> Ajusta `SERIAL`/tipos según el motor (Postgres, MySQL, etc.).  
> Esta tabla se usa como FK desde UGCO_CasoEspecialidad.

---

## Diccionario de campos

| Campo   | Tipo lógico  | PK | Nulo | Descripción                                                                 |
|---------|--------------|----|------|-----------------------------------------------------------------------------|
| id      | entero       | ✔  | No   | 1. Identificador interno NocoBase.                          |
| codigo_alma | texto corto |    | Sí   | 2. Trazabilidad ALMA.                                       |
| codigo_oficial | texto corto |    | No   | 3. Código Técnico (DIG_ALTO, UROLO).                        |
| codigo_map_snomed | texto corto |    | Sí   | 4. Mapeo SNOMED CT.                                         |
| codigo_map_deis | texto corto |    | Sí   | 5. Código DEIS.                                             |
| codigo_map_legacy | texto corto |    | Sí   | 6. Código Legacy.                                           |
| nombre  | texto        |    | No   | Nombre visible de la especialidad/grupo de pacientes.                       |
| activo  | booleano     |    | No   | Indica si la especialidad está disponible para uso en la app (TRUE/FALSE).  |
