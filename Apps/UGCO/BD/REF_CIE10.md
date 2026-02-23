# REF_CIE10

Catálogo de **Clasificación Internacional de Enfermedades, 10ª Revisión (CIE-10)**.
Utilizado para la codificación diagnóstica principal y secundaria.

> **Fuente Oficial**: DEIS (Departamento de Estadísticas e Información de Salud) - MINSAL Chile.

---

## DDL (SQL de referencia)

```sql
CREATE TABLE REF_CIE10 (
    id              SERIAL PRIMARY KEY,       -- 1. Código Interno NocoBase
    
    -- 6-Code Schema
    codigo_alma     VARCHAR(50),              -- 2. Trazabilidad (ID en ALMA)
    codigo_oficial  VARCHAR(10) NOT NULL,     -- 3. Estándar (CIE-10) - Ej: C50.9
    codigo_map_snomed VARCHAR(50),            -- 4. Interoperabilidad (SNOMED CT)
    codigo_map_deis   VARCHAR(50),            -- 5. Reportes (DEIS/RIPS)
    codigo_map_legacy VARCHAR(50),            -- 6. Legacy/Local
    
    descripcion     VARCHAR(255) NOT NULL,    -- Ej: Tumor maligno de la mama, parte no especificada
    capitulo        VARCHAR(10),              -- Ej: II
    grupo           VARCHAR(50),              -- Ej: C00-C97
    categoria       VARCHAR(10),              -- Ej: C50
    
    -- Metadatos FHIR
    sistema_cod     VARCHAR(100) DEFAULT 'http://hl7.org/fhir/sid/icd-10',
    version         VARCHAR(20) DEFAULT '2019',
    activo          BOOLEAN DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo             | Tipo        | Descripción                                      | FHIR Mapping |
|-------------------|-------------|--------------------------------------------------|--------------|
| id                | entero (PK) | Identificador interno NocoBase.                  | `id`         |
| codigo_alma       | texto corto | ID de trazabilidad con ALMA/TrakCare.            | `identifier` |
| codigo_oficial    | texto corto | Código CIE-10 estándar (Ej: C50.9).              | `code`       |
| codigo_map_snomed | texto corto | Mapeo a SNOMED CT.                               | `coding`     |
| codigo_map_deis   | texto corto | Código para reportes DEIS.                       | -            |
| codigo_map_legacy | texto corto | Código de sistemas antiguos.                     | -            |
| descripcion       | texto       | Glosa oficial del diagnóstico.                   | `display`    |
| capitulo    | texto corto | Capítulo CIE-10 (números romanos).               | -                     |
| sistema_cod | texto       | URI del sistema de codificación.                 | `system`              |

## Ejemplo de Datos (Oncología)

| codigo | descripcion |
|--------|-------------|
| C18.9  | Tumor maligno del colon, parte no especificada |
| C34.9  | Tumor maligno de los bronquios o del pulmón, parte no especificada |
| C50.9  | Tumor maligno de la mama, parte no especificada |
| C61    | Tumor maligno de la próstata |
