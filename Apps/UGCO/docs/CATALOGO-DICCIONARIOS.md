# Catálogo de Diccionarios Extraídos

**Fecha**: 2025-11-26
**Ubicación de Archivos**: `UGCO/BD/diccionarios_raw/`
**Total Diccionarios**: 34

Este documento lista todos los diccionarios y tablas maestras extraídos de los archivos Excel proporcionados y de las fuentes HL7 Chile. Estos archivos JSON crudos servirán como fuente para poblar las tablas `REF_` del sistema.

---

## 1. Fuentes Oficiales (DEIS 2025)
*Fuente: `DEIS_Esquema_Registros_2025_Corregido.xlsx`*

| Archivo JSON | Contenido Probable | Registros |
|--------------|--------------------|-----------|
| `..._Esquema_de_Registro.json` | Definición de campos del REM | ~213 |
| `..._Anexo_1.json` | Establecimientos de Salud | ~21 |
| `..._Anexo_2.json` | Comunas / Regiones | ~356 |
| `..._Anexo_4.json` | **Diagnósticos CIE-10** (Clave para `REF_CIE10`) | ~1083 |
| `..._Anexo_8.json` | Prestaciones / Procedimientos | ~1509 |

## 2. Diccionarios Locales UGCO
*Fuente: `UGCO_Diccionario_Local_COLUMNAS Y DICCIONARIO.xlsx`*

| Archivo JSON | Contenido Probable | Uso en Modelo |
|--------------|--------------------|---------------|
| `..._DICCIONARIO_EX_Y_PROCE.json` | Exámenes y Procedimientos Locales | `UGCO_EventoClinico` |
| `..._GESTORAS_.json` | Listado de Gestoras/Enfermeras | `REF_OncoEspecialidad` |
| `..._EXAM_DE_SANGRE...json` | Catálogo de Laboratorio | - |

## 3. Registro Hospitalario de Cáncer (RHC)
*Fuente: `Registro_Hospitalario_Cancer...xlsm`*

| Archivo JSON | Contenido Probable | Uso en Modelo |
|--------------|--------------------|---------------|
| `..._formulario.json` | Campos del formulario RHC | Validación |
| `..._casos.json` | Datos de ejemplo o estructura | - |

## 4. Estándares HL7 Chile (Interoperabilidad)
*Fuente: Web HL7 Chile / MINSAL*

| Archivo JSON | Descripción | Uso en Modelo |
|--------------|-------------|---------------|
| `HL7_SexoBiologico.json` | Códigos de Sexo (male, female, etc.) | `ALMA_Paciente` |
| `HL7_Nacionalidad.json` | Códigos de Países | `ALMA_Paciente` |
| `HL7_Prevision.json` | Códigos de Previsión (FONASA, ISAPRE) | `ALMA_Paciente` |
| `HL7_IdentidadGenero.json` | Identidad de Género (MPI) | `ALMA_Paciente` |
| `HL7_PueblosOriginarios.json` | Etnias (MPI) | `ALMA_Paciente` |

---

## Siguientes Pasos (Seeding)

Utilizaremos estos JSON para llenar las tablas de referencia:

1.  **CIE-10**: Usar `DEIS_..._Anexo_4.json` -> `REF_CIE10`.
2.  **Especialidades**: Usar `UGCO_..._GESTORAS_.json` -> `REF_OncoEspecialidad`.
3.  **Topografía/Morfología**: Buscar en `DEIS` o `RHC` (si no están explícitos, usar CSV externo).
