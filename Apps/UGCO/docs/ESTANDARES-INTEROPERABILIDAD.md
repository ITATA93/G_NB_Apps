# Estándares de Interoperabilidad y Codificación

**Proyecto**: MIRA / UGCO
**Versión**: 1.0
**Fecha**: 2025-11-26

Este documento define los estándares técnicos para garantizar la interoperabilidad del sistema oncológico con la Red Asistencial y el ecosistema de Salud Digital de Chile.

---

## 1. Estándar de Intercambio: HL7 FHIR R4

Adoptamos **HL7 FHIR Release 4** como estándar base para el modelo de datos y la API.

### Perfiles Utilizados
*   **Core**: [HL7 FHIR CL Core Implementation Guide](https://hl7chile.cl/fhir/ig/clcore/)
*   **MPI**: [Guía de Implementación Maestro de Pacientes (MINSAL)](https://interoperabilidad.minsal.cl/fhir/ig/mpi/)
*   **Oncología**: [mCODE (minimal Common Oncology Data Elements)](https://hl7.org/fhir/us/mcode/)

### Mapeo de Recursos Principales

| Entidad UGCO | Recurso FHIR | Perfil Sugerido |
|--------------|--------------|-----------------|
| `ALMA_Paciente` | `Patient` | `MINSALPaciente` (Estricto) |
| `UGCO_CasoOncologico` | `Condition` | `mcode-primary-cancer-condition` |
| `UGCO_EventoClinico` | `Procedure` | `mcode-cancer-related-surgical-procedure` |
| `UGCO_ComiteOncologico` | `CarePlan` / `Group` | - |

---

## 2. Sistemas de Codificación (Terminologías)

Para asegurar la semántica de los datos, utilizamos los siguientes catálogos estándar:

### A. Diagnósticos
*   **Estándar**: CIE-10 (Clasificación Internacional de Enfermedades, 10ª Revisión).
*   **Fuente**: DEIS (Departamento de Estadísticas e Información de Salud).
*   **Uso**: Campo `codigo_cie10` en `UGCO_CasoOncologico`.
*   **FHIR System**: `http://hl7.org/fhir/sid/icd-10`

### B. Oncología (Topografía y Morfología)
*   **Estándar**: CIE-O-3 (Clasificación Internacional de Enfermedades para Oncología, 3ª Edición).
*   **Uso**: Campos `topografia_icdo` y `morfologia_icdo`.
*   **FHIR System**: `http://terminology.hl7.org/CodeSystem/icd-o-3`

### C. Estados Clínicos (FHIR ValueSets)
*   **Clinical Status**: `active`, `recurrence`, `relapse`, `remission`, `resolved`.
*   **Verification Status**: `unconfirmed`, `provisional`, `differential`, `confirmed`, `refuted`.

### D. Identidad y Demografía (MINSAL MPI)
Para `ALMA_Paciente`, se deben considerar las extensiones obligatorias y recomendadas del perfil `MINSALPaciente`:

**Obligatorias/Críticas:**
*   **Identidad de Género**: `https://interoperabilidad.minsal.cl/fhir/ig/mpi/StructureDefinition/IdentidadDeGenero`
*   **Pueblos Originarios**: `https://interoperabilidad.minsal.cl/fhir/ig/mpi/StructureDefinition/PueblosOriginariosPerteneciente`
*   **País de Origen**: `https://interoperabilidad.minsal.cl/fhir/ig/mpi/StructureDefinition/PaisOrigenMPI`

**Determinantes Sociales (Recomendadas):**
*   **Nivel Educacional**: `MINSALNivelEducacional`
*   **Ocupación**: `MINSALOcupacion`
*   **PRAIS**: `Prais`
*   **Religión**: `Religion`
*   **Situación de Calle**: `SituacionCalle`

---

## 3. Directrices de Implementación

1.  **Identificadores**: Todo recurso debe tener un ID interno y, cuando sea posible, un identificador oficial (RUN para pacientes).
2.  **Fechas**: Formato ISO 8601 (`YYYY-MM-DD` o `YYYY-MM-DDThh:mm:ss`).
3.  **Validación**: Los formularios de NocoBase deben validar contra los catálogos `REF_*` para evitar texto libre en campos codificados.
