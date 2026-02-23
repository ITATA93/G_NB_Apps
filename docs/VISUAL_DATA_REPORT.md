# 📊 Reporte de Datos de Prueba (Seed Data)

**Fecha**: 2026-02-05
**Objetivo**: Poblar tablas para pruebas de complejidad visual (Gráficos, Calendarios).

## 🗃️ Datos Generados

| Módulo | Cantidad | Descripción del Contenido | Para probar... |
|--------|----------|---------------------------|----------------|
| **Oncología (Casos)** | 30 | Pacientes con RUT random, diagnósticos variados (Mama, Pulmón, Colon), estados (Ingresado, Fallecido). | **Gráficos de Torta** (Diagnósticos), **Barras** (Estado), **Filtros**. |
| **Pabellón (Agenda)** | 20 | Bloques horarios vinculados a Staff y Tipo de Actividad. Fechas +/- 30 días. | **Vista Calendario**, **Cronograma**, Visualización de solapamientos. |
| **Personal (Staff)** | 1+ | Médicos/Enfermeros dummy si no existían. | Relaciones, Selectores. |
| **Tipos de Actividad** | 3+ | Consulta, Cirugía, Comité (con colores asignados). | Código de colores en calendario. |

## 🧪 Cómo Verificar Visualmente
1.  **Ingresar a NocoBase**: `https://mira.hospitaldeovalle.cl` (o localhost)
2.  **Ir a "Oncología"**: Verificar que la tabla tenga datos variados. Intentar crear un gráfico "Casos por Diagnóstico".
3.  **Ir a "Pabellón / Agenda"**: Verificar la vista de Calendario. Deberían verse bloques de colores.

## 🛠️ Herramientas
- Script utilizado: `scripts/seed-mock-data.ts`
- Librería de datos: `@faker-js/faker`
