# Requerimientos de Bibliografía para Seeding

**Fecha**: 2025-11-26
**Objetivo**: Recopilar las fuentes oficiales para poblar los catálogos maestros con el "Esquema de 6 Códigos".

Para garantizar la interoperabilidad, necesitamos que nos proporciones (o indiques la fuente de) los siguientes listados:

---

## 1. CIE-10 (Diagnósticos)
*Tabla: `REF_CIE10`*

Necesitamos un archivo (Excel/CSV) con:
*   [ ] **Código CIE-10** (ej. C50.9)
*   [ ] **Descripción Oficial** (Glosa DEIS)
*   [ ] *Opcional*: Mapeo a SNOMED CT (si existe)

> **Pregunta**: ¿Tienes el maestro de diagnósticos del DEIS o usamos el estándar internacional de la OMS?

## 2. CIE-O-3 (Oncología)
*Tablas: `REF_OncoTopografiaICDO`, `REF_OncoMorfologiaICDO`*

Necesitamos la versión oficial vigente en Chile (normalmente CIE-O-3.1 o 3.2):
*   [ ] **Listado de Topografías** (C00.0 - C80.9)
*   [ ] **Listado de Morfologías** (8000/0 - 9992/3)

## 3. Especialidades Oncológicas
*Tabla: `REF_OncoEspecialidad`*

Necesitamos definir los códigos internos y sus equivalencias:
*   [ ] **Listado de Comités/Equipos** (ej. "Digestivo Alto", "Cabeza y Cuello")
*   [ ] **Código DEIS** asociado (si reportan estadisticas por grupo)

## 4. Mapeos de Interoperabilidad (SNOMED / DEIS)

Para completar las columnas `codigo_map_snomed` y `codigo_map_deis`, necesitamos saber:
*   ¿Existe algún documento de homologación vigente en el hospital?
*   ¿O debemos dejar estos campos vacíos para una segunda etapa?

---

## Formato de Entrega Ideal
Un archivo Excel con pestañas por catálogo, o archivos CSV individuales.

📂 **Ubicación de Archivos**:
Por favor deposita los archivos en la carpeta:
`UGCO/BD/data/`

Ejemplo:
- `UGCO/BD/data/CIE10_2019.xlsx`
- `UGCO/BD/data/ICDO_Topografia.csv`

