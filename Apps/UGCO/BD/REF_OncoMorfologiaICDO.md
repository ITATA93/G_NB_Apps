
# REF_OncoMorfologiaICDO

Catálogo de **morfologías ICD-O** (tipo histológico y comportamiento).  
Opcionalmente referenciado desde `UGCO_CasoOncologico.morfologia_icdo` y `comportamiento_icdo`.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoMorfologiaICDO
-- Catálogo de morfologías ICD-O
-- =========================================

CREATE TABLE REF_OncoMorfologiaICDO (
    id_morf          SERIAL PRIMARY KEY,      -- 1. Código Interno NocoBase

    -- 6-Code Schema
    codigo_alma      VARCHAR(50),             -- 2. Trazabilidad (ID en ALMA)
    codigo_oficial   VARCHAR(10) NOT NULL,    -- 3. Estándar (ICD-O Morphology) - Ej: 8140
    codigo_map_snomed VARCHAR(50),            -- 4. Interoperabilidad (SNOMED CT)
    codigo_map_deis   VARCHAR(50),            -- 5. Reportes (DEIS)
    codigo_map_legacy VARCHAR(50),            -- 6. Legacy/Local

    comportamiento   VARCHAR(5)  NOT NULL,          -- /0, /1, /2, /3, etc.
    descripcion      VARCHAR(255) NOT NULL,         -- "Adenocarcinoma", "Carcinoma ductal", etc.

    es_maligno       BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Metadatos FHIR
    sistema_cod      VARCHAR(100) DEFAULT 'http://terminology.hl7.org/CodeSystem/icd-o-3',
    
    activo           BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT ux_morf_comport UNIQUE (codigo_oficial, comportamiento)
);
```

---

## Diccionario de campos

| Campo            | Tipo lógico  | PK | Nulo | Descripción                                                           |
|------------------|-------------|----|------|-----------------------------------------------------------------------|
| id_morf          | entero      | ✔  | No   | 1. Identificador interno NocoBase.                    |
| codigo_alma      | texto corto |    | Sí   | 2. Trazabilidad ALMA.                                 |
| codigo_oficial   | texto corto |    | No   | 3. Código ICD-O Morfología (Ej: 8140).                |
| codigo_map_snomed| texto corto |    | Sí   | 4. Mapeo SNOMED CT.                                   |
| codigo_map_deis  | texto corto |    | Sí   | 5. Código DEIS.                                       |
| codigo_map_legacy| texto corto |    | Sí   | 6. Código Legacy.                                     |
| comportamiento   | texto corto |    | No   | Código de comportamiento (/0, /1, /2, /3, etc.).                      |
| descripcion      | texto       |    | No   | Descripción del tipo histológico.                                     |
| es_maligno       | booleano    |    | No   | TRUE si corresponde a comportamiento maligno.                          |
| sistema_cod      | texto       |    | Sí   | URI del sistema de codificación (FHIR).                               |
| activo           | booleano    |    | No   | TRUE si la morfología está disponible.                                 |
