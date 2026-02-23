# Análisis de HL7 Chile Core y Mapeo de Datos

**Fecha**: 2025-11-26
**Objetivo**: Alinear el modelo de datos UGCO y los archivos de seeding con la Guía de Implementación HL7 Chile Core v1.9.4.

## 1. Perfiles HL7 Chile Core Relevantes

Basado en la documentación oficial (https://hl7chile.cl/fhir/ig/clcore/1.9.4/), hemos identificado los siguientes perfiles obligatorios para la interoperabilidad:

### A. Paciente (`CorePacienteCl`)
*   **Uso en UGCO**: `ALMA_Paciente`
*   **Identificadores**:
    *   RUN (Cédula de Identidad) -> `identifier` (system: `https://hl7chile.cl/fhir/ig/clcore/CodeSystem/CSCodigoDNI`)
    *   Pasaporte / Otro -> `identifier`
*   **Nacionalidad**: `CodeSystem` específico de países.
*   **Previsión**: `CodeSystem` de códigos de previsión (FONASA, ISAPRE).

### B. Cobertura y Previsión (`MINSALCobertura`)
*   **Uso en UGCO**: `ALMA_Paciente` (o tabla relacionada `UGCO_Cobertura`).
*   **Requisito**: Almacenar el tramo de FONASA (A, B, C, D) o la ISAPRE específica.
*   **Perfil**: `https://interoperabilidad.minsal.cl/fhir/ig/mpi/StructureDefinition-MINSALCobertura.html`

### C. Determinantes Sociales (Extensiones MPI)
El MPI define extensiones críticas para la equidad en salud que deben estar en `ALMA_Paciente`:
*   **Nivel Educacional**: `MINSALNivelEducacional`
*   **Ocupación**: `MINSALOcupacion`
*   **Pueblos Originarios**: `PueblosOriginariosPerteneciente`
*   **Situación de Discapacidad**: `MINSALSituacionDiscapacidad`
*   **PRAIS**: Condición de reparación (Programa de Reparación y Atención Integral en Salud).
*   **Situación de Calle**: `SituacionCalle`

### D. Diagnóstico (`CoreDiagnosticoCl`)
*   **Uso en UGCO**: `UGCO_CasoOncologico` (Mapeo a `Condition`)
*   **Codificación**:
    *   Exige uso de **CIE-10** (Snomed CT es opcional pero recomendado para especificidad).
    *   Estado Clínico: `active`, `inactive`, `resolved`.

### C. Organización (`CoreOrganizacionCl`)
*   **Uso en UGCO**: `UGCO_EquipoSeguimiento`, `UGCO_ComiteOncologico`
*   **Identificadores**: DEIS del establecimiento.

---

## 2. Análisis de Archivos de Seeding (UGCO/BD/data)

Hemos analizado los archivos proporcionados para el llenado de tablas maestras:

### 📂 `DEIS_Esquema_Registros_2025_Corregido.xlsx`
*   **Contenido Probable**: Códigos oficiales del DEIS para establecimientos, comunas, y diagnósticos CIE-10.
*   **Mapeo a 6-Code Schema**:
    *   `codigo_oficial` -> Columna "CÓDIGO" del Excel.
    *   `codigo_map_deis` -> Columna "CÓDIGO" (es la fuente de verdad).
    *   `descripcion` -> Columna "GLOSA" o "DESCRIPCIÓN".

### 📂 `UGCO_Diccionario_Local_COLUMNAS Y DICCIONARIO.xlsx`
*   **Contenido Probable**: Definiciones locales de UGCO, especialidades, y estados.
*   **Mapeo a 6-Code Schema**:
    *   `id` -> ID interno actual.
    *   `codigo_map_legacy` -> Código usado actualmente en planillas Excel/Access.
    *   `codigo_alma` -> Si existe referencia a TrakCare.

### 📂 `Registro_Hospitalario_Cancer_formulario_registro_v1_0.xlsm`
*   **Contenido Probable**: Formulario del RHC (Registro Hospitalario de Cáncer) del MINSAL.
*   **Uso**: Define los campos mínimos obligatorios para el reporte nacional (Topografía, Morfología, TNM).
*   **Acción**: Verificar que `UGCO_CasoOncologico` tenga todos los campos requeridos por este formulario.

---

## 3. Estrategia de Carga (Seeding)

Para poblar las tablas `REF_` respetando el esquema de 6 códigos:

### Paso 1: Carga de CIE-10
*   **Fuente**: `DEIS_Esquema_Registros_2025_Corregido.xlsx` (Hoja Diagnósticos).
*   **Destino**: `REF_CIE10`.
*   **Lógica**:
    *   Leer Excel.
    *   Insertar `codigo_oficial` (CIE-10) y `descripcion`.
    *   Setear `sistema_cod` = `http://hl7.org/fhir/sid/icd-10`.

### Paso 2: Carga de Especialidades
*   **Fuente**: `UGCO_Diccionario_Local...xlsx`.
*   **Destino**: `REF_OncoEspecialidad`.
*   **Lógica**:
    *   Mapear nombres de equipos a códigos internos (`DIG_ALTO`, etc.).
    *   Buscar equivalencia DEIS si existe.

### Paso 3: Carga de Topografía/Morfología
*   **Fuente**: `Registro_Hospitalario_Cancer...xlsm` (Listas desplegables ocultas) o descargar CSV oficial de CIE-O-3.
*   **Destino**: `REF_OncoTopografiaICDO`, `REF_OncoMorfologiaICDO`.

---

## 4. Recomendaciones Finales

3.  **Determinantes Sociales**: Agregar campos en `ALMA_Paciente` para soportar las extensiones del MPI (Educación, Ocupación, Pueblos Originarios, PRAIS).
4.  **Validación de RUN**: Implementar algoritmo de validación de módulo 11 para el campo RUN en `ALMA_Paciente`, conforme a `CorePacienteCl`.
5.  **Homologación de Sexo**: Alinear `ALMA_Paciente.sexo` con el `ValueSet` de HL7 Chile (biológico vs identidad de género).
