
# REF_OncoTopografiaICDO

Catálogo de **topografías ICD-O** (sitio anatómico del tumor).  
Opcionalmente referenciado desde `UGCO_CasoOncologico.topografia_icdo`.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoTopografiaICDO
-- Catálogo de topografías ICD-O
-- =========================================

CREATE TABLE REF_OncoTopografiaICDO (
    id_topo         SERIAL PRIMARY KEY,       -- 1. Código Interno NocoBase

    -- 6-Code Schema
    codigo_alma     VARCHAR(50),              -- 2. Trazabilidad (ID en ALMA)
    codigo_oficial  VARCHAR(10) NOT NULL,     -- 3. Estándar (ICD-O Topography) - Ej: C18.7
    codigo_map_snomed VARCHAR(50),            -- 4. Interoperabilidad (SNOMED CT)
    codigo_map_deis   VARCHAR(50),            -- 5. Reportes (DEIS)
    codigo_map_legacy VARCHAR(50),            -- 6. Legacy/Local

    descripcion     VARCHAR(255) NOT NULL,          -- "Estómago, antro", "Colon sigmoideo", etc.

    sitio_anatomico VARCHAR(100),                   -- "Estómago", "Colon", "Mama", etc.
    grupo_tumor     VARCHAR(100),                   -- agrupación libre adicional
    especialidad_id INTEGER,                        -- FK → REF_OncoEspecialidad(id)
    
    -- Metadatos FHIR
    sistema_cod     VARCHAR(100) DEFAULT 'http://terminology.hl7.org/CodeSystem/icd-o-3',
    version         VARCHAR(20),
    
    activo          BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo            | Tipo lógico  | PK | Nulo | Descripción                                                           |
|------------------|-------------|----|------|-----------------------------------------------------------------------|
| id_topo          | entero      | ✔  | No   | 1. Identificador interno NocoBase.                    |
| codigo_alma      | texto corto |    | Sí   | 2. Trazabilidad ALMA.                                 |
| codigo_oficial   | texto corto |    | No   | 3. Código ICD-O Topografía (Ej: C18.7).               |
| codigo_map_snomed| texto corto |    | Sí   | 4. Mapeo SNOMED CT.                                   |
| codigo_map_deis  | texto corto |    | Sí   | 5. Código DEIS.                                       |
| codigo_map_legacy| texto corto |    | Sí   | 6. Código Legacy.                                     |
| descripcion      | texto       |    | No   | Descripción detallada del sitio anatómico.                            |
| sitio_anatomico  | texto       |    | Sí   | Sitio anatómico resumido: estómago, colon, mama, etc.                 |
| grupo_tumor      | texto       |    | Sí   | Agrupación clínica adicional ligada a tipo de tumor.                  |
| especialidad_id  | entero (FK) |    | Sí   | Especialidad responsable (`REF_OncoEspecialidad`).                    |
| sistema_cod      | texto       |    | Sí   | URI del sistema de codificación (FHIR).                               |
| activo           | booleano    |    | No   | TRUE si la topografía está disponible.                                |
