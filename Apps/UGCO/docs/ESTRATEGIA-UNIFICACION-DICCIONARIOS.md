# Estrategia de Unificación de Diccionarios

**Fecha**: 2025-11-26
**Objetivo**: Resolver conflictos y solapamientos entre las múltiples fuentes de datos (DEIS, HL7, Local) para poblar las tablas maestras `REF_`.

---

## 1. El Problema: Solapamiento de Datos

Hemos detectado que la misma información (ej. Diagnósticos, Exámenes) existe en múltiples archivos:
*   **Fuente Oficial (DEIS)**: Códigos estandarizados (CIE-10, Arancel FONASA).
*   **Fuente Local (UGCO)**: Nombres coloquiales, códigos internos antiguos.
*   **Fuente HL7**: Estándares de interoperabilidad.

## 2. La Solución: Jerarquía de Verdad

Para unificar sin perder datos, aplicaremos la siguiente **Regla de Precedencia**:

1.  🥇 **Nivel 1: Oficial (DEIS / HL7)**
    *   Es la **Fuente de Verdad** para el `codigo_oficial` y la `descripcion` estándar.
    *   *Ejemplo*: CIE-10 C50.9 "Tumor maligno de la mama..." (DEIS).

2.  🥈 **Nivel 2: Local (UGCO)**
    *   Se usa para **Enriquecer** o **Mapear**.
    *   Si el código local corresponde a uno oficial -> Se guarda en `codigo_map_legacy`.
    *   Si el código local NO existe en el oficial -> Se crea como nuevo registro con `sistema_cod = 'LOCAL'`.

3.  🥉 **Nivel 3: Legacy/Histórico**
    *   Datos obsoletos que solo sirven para mostrar registros antiguos. Se marcan como `activo = false`.

---

## 3. Estrategia por Dominio

### A. Diagnósticos (CIE-10)
*   **Base**: `DEIS...Anexo_4.json` (Carga masiva).
*   **Cruce**: Si el Excel local tiene diagnósticos, buscamos su equivalente CIE-10.
    *   *Match*: Guardamos el ID local en la columna `codigo_map_legacy` del registro CIE-10.
    *   *No Match*: (Raro en CIE-10) Se evalúa caso a caso.

### B. Procedimientos y Exámenes
*   **Base**: `DEIS...Anexo_8.json` (Arancel FONASA / Prestaciones).
*   **Cruce**: `UGCO...DICCIONARIO_EX_Y_PROCE.json`.
    *   Muchos exámenes locales ("Scanner Tórax") deben mapearse al código oficial ("Tomografía computarizada de tórax...").
    *   **Acción**: Script de seeding intentará coincidencia por nombre (fuzzy match) o requerirá mapeo manual asistido.

### C. Establecimientos
*   **Base**: `DEIS...Anexo_1.json`.
*   **Local**: Listas de derivación.
    *   Se usa el código DEIS como `codigo_oficial`.

---

## 4. Flujo de Trabajo Propuesto (Seeding)

1.  **Paso 1: Carga Maestra (Oficial)**
    *   Ejecutar scripts que cargan DEIS y HL7 primero. Esto crea el "esqueleto" estándar.

2.  **Paso 2: Enriquecimiento (Local)**
    *   Ejecutar scripts que leen los diccionarios locales.
    *   Buscan el registro oficial correspondiente.
    *   **UPDATE**: Si lo encuentran, actualizan `codigo_map_legacy`.
    *   **INSERT**: Si no lo encuentran, insertan un nuevo registro marcado como LOCAL.

3.  **Paso 3: Validación Humana**
    *   Generar un reporte de "Registros Locales Sin Mapeo Oficial" para que un experto decida si se homologan o se quedan como locales.
