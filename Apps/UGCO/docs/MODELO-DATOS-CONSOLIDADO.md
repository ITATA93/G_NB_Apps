# Modelo de Datos Consolidado: UGCO + Interoperabilidad MINSAL

**Versión**: 1.0 (Final Propuesta)
**Fecha**: 2025-11-26
**Objetivo**: Definir la estructura óptima de tablas para cumplir con **HL7 Chile Core**, **MINSAL MPI** y los requisitos operativos de **UGCO**.

---

## 1. Estrategia de Identificación (Esquema de 6 Códigos)

Para todas las tablas maestras (Catálogos/Referencia), se utilizará este esquema estándar para garantizar trazabilidad y reportabilidad.

| Campo | Descripción | Uso |
|-------|-------------|-----|
| `id` | PK Autoincremental | Clave foránea interna en NocoBase. |
| `codigo_alma` | ID TrakCare/ALMA | Para saber si un registro cambió en el origen. |
| `codigo_oficial` | Estándar (CIE-10, ICD-O) | **El dato de verdad** para interoperabilidad. |
| `codigo_map_snomed` | SNOMED CT | Para intercambio clínico avanzado (HL7 FHIR). |
| `codigo_map_deis` | Código DEIS/RIPS | Para reportes estadísticos al MINSAL. |
| `codigo_map_legacy` | Código Local Antiguo | Para migración de datos históricos. |

---

## 2. Estructura del Paciente (`ALMA_Paciente`)

Debe cumplir con el perfil **MINSAL Paciente (MPI)**.

### Campos Nucleares
*   `run`: Validado con módulo 11. Identificador principal.
*   `nombres`, `apellidos`: Separados según estándar.
*   `fecha_nacimiento`: Obligatorio.
*   `sexo_biologico`: `male`, `female`, `intersex` (ValueSet HL7).
*   `direccion`: Estructurada (Calle, Número, Comuna DEIS).
*   `prevision`: Tramo FONASA (A-D) o ISAPRE (CodeSystem MINSAL).

### Extensiones Obligatorias (Determinantes Sociales)
Estos campos son críticos para el MPI y la equidad en salud:
1.  **Identidad de Género**: Distinta del sexo biológico.
2.  **Pueblos Originarios**: Pertenencia a etnia (Mapuche, Aymara, etc.).
3.  **Nivel Educacional**: Último nivel aprobado.
4.  **Ocupación**: Ocupación actual.
5.  **PRAIS**: Si es beneficiario del programa de reparación.
6.  **País de Origen**: Nacionalidad.

---

## 3. Estructura del Caso Oncológico (`UGCO_CasoOncologico`)

Debe cumplir con el perfil **mCODE Primary Cancer Condition**.

### Diagnóstico e Histología
*   `diagnostico_principal`: FK a `REF_CIE10` (usando `codigo_oficial`).
*   `topografia`: FK a `REF_OncoTopografiaICDO` (CIE-O-3).
*   `morfologia`: FK a `REF_OncoMorfologiaICDO` (CIE-O-3).
*   `fecha_diagnostico`: Fecha de confirmación.

### Estado y Evolución (FHIR)
*   `clinical_status`: `active` (en tratamiento), `remission` (sin evidencia), `relapse` (recaída).
*   `verification_status`: `confirmed` (biopsia), `provisional` (sospecha clínica).
*   `etapificacion`: TNM (cT, cN, cM) y Estadio Clínico (I-IV).

---

## 4. Tablas de Referencia Críticas (`REF_*`)

Estas tablas deben ser pobladas (Seeding) con los archivos oficiales del DEIS/MINSAL.

### `REF_CIE10`
*   Fuente: `DEIS_Esquema_Registros_2025.xlsx`
2.  **ETL/Seeding**: Scripts que leen los Excel de `UGCO/BD/data` y llenan las columnas `codigo_oficial`, `codigo_map_deis`, etc.
3.  **Frontend**: Formularios que muestran la `descripcion` pero guardan el `id` interno.
