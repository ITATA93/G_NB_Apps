# Evaluación del Modelo de Datos UGCO

**Fecha**: 2025-11-26
**Objetivo**: Evaluar la documentación de base de datos (`UGCO/BD/`) y definir estrategias de poblado.

## 1. Evaluación General

La documentación actual en `UGCO/BD/` es **robusta y bien estructurada**.
- ✅ **Separación clara**: Distingue entre tablas de referencia (`REF`), operacionales (`UGCO`) y espejos externos (`ALMA`).
- ✅ **Detalle técnico**: Incluye DDL SQL y diccionarios de datos con tipos y nulidad.
- ✅ **Integridad**: Define claves foráneas (FK) teóricas para mantener la consistencia.

## 2. Análisis por Categoría y Estrategia de Poblado

### A. Tablas Espejo ALMA (`ALMA_*.md`)
*Archivos: `ALMA_Paciente`, `ALMA_Episodio`, `ALMA_Diagnostico`, etc.*

*   **Estado Actual**: Documentadas como "simplificaciones para pruebas".
*   **Propósito**: Servir como caché local o vista materializada de los datos de TrakCare.
*   **Estrategia de Poblado Recomendada**:
    1.  **Ideal (Producción)**: Uso del plugin **Data Source External (MSSQL)**.
        *   Conectar NocoBase directamente a la vista SQL de SIDRA.
        *   No requiere "llenar" tablas locales, se consultan en vivo.
    2.  **Alternativa (Si no hay acceso directo)**: Sincronización programada (ETL).
        *   Script `sync-alma-data.ts` que corre cada 30 min.
        *   Lee de SIDRA -> Escribe/Actualiza en NocoBase (`ALMA_Paciente`).

### B. Tablas de Referencia (`REF_*.md`)
*Archivos: `REF_OncoEspecialidad`, `REF_OncoTNM`, etc.*

*   **Estado Actual**: Listas estáticas bien definidas.
*   **Estrategia de Poblado**:
    *   **Carga Inicial (Seed)**: Deben cargarse una única vez al desplegar el sistema.
    *   **Acción**: Crear un script `seeds/load-refs.ts` que lea archivos JSON/CSV y pueble estas tablas automáticamente. Evitar entrada manual para garantizar IDs consistentes entre entornos (Dev/Prod).

### C. Tablas Operacionales (`UGCO_*.md`)
*Archivos: `UGCO_CasoOncologico`, `UGCO_Comite`, etc.*

*   **Estado Actual**: Tablas transaccionales complejas.
*   **Estrategia de Poblado (UX/UI)**:
    *   **Manual (Formularios)**: La mayoría de los datos son ingresados por clínicos.
    *   **Automático (Backend)**:
        *   `UGCO_COD01`: Debe generarse automáticamente (ej. Trigger o Workflow de NocoBase) siguiendo el patrón `ONC-{YYYY}-{SEQ}`.
        *   `fecha_creacion`, `creado_por`: Automático por NocoBase.
    *   **Derivado (Link)**:
        *   Al seleccionar un paciente (de `ALMA_Paciente`), el sistema debe pre-llenar datos demográficos en la vista, pero NO duplicarlos en la tabla `UGCO_CasoOncologico` (solo guardar `paciente_id`).

## 3. Hallazgos y Recomendaciones

### 🔴 Hallazgo 1: Ambigüedad en Tablas ALMA
La documentación dice "réplica/staging", pero el resumen dice "tablas externas no están aquí".
*   **Recomendación**: Definir si usaremos **Tablas Virtuales (Foreign Data Wrapper)** o **Tablas Locales Sincronizadas**.
    *   *Sugerencia*: Usar **Tablas Virtuales** (Plugin SQL) para evitar duplicidad y problemas de sincronización. Si el rendimiento es malo, pasar a Tablas Locales Sincronizadas.

### 🟡 Hallazgo 2: Generación de IDs
No se especifica cómo se genera `UGCO_COD01`.
*   **Recomendación**: Implementar un "Sequence" en PostgreSQL o un campo "Autonumber" en NocoBase para garantizar unicidad y formato.

### 🟢 Hallazgo 3: Modelo de Datos Clínicos
El modelo oncológico (TNM, Estadios) es correcto y sigue estándares internacionales (mCODE/ICD-O).

## 4. Plan de Acción Sugerido

1.  **Validar Conexión ALMA**: Confirmar si podemos usar el plugin MSSQL para leer `ALMA_Paciente` en tiempo real.
2.  **Crear Seeds**: Escribir scripts para poblar las tablas `REF_*`.
3.  **Prototipar Formulario**: Crear la pantalla de "Nuevo Caso" en NocoBase para validar el flujo de ingreso manual.
