# Auditoría Visual UGCO — mira.imedicina.cl
**Fecha:** 2026-03-07
**Instancia:** https://mira.imedicina.cl/admin/
**Método:** Screenshots automáticos de todas las páginas UGCO
**Total páginas verificadas:** 20 (18 con bloques, 2 vacías)

---

## Resumen Ejecutivo

| Categoría | Cantidad |
|-----------|----------|
| Problemas CRÍTICOS | 5 |
| Problemas ESTRUCTURALES | 4 |
| Páginas funcionando correctamente | 3 |
| Errores de consola | 0 |
| Errores de red | 0 |

**Estado general: La aplicación tiene la estructura de menú completa y los catálogos REF con datos, pero TODAS las tablas operacionales están vacías, no existen gráficos, las FK muestran IDs numéricos, y Reportes/Ficha 360° están sin contenido.**

---

## PROBLEMAS CRÍTICOS

### C1. TODAS LAS TABLAS OPERACIONALES VACÍAS — "No hay datos"
**Severidad:** CRÍTICA
**Páginas afectadas:** 15 de 18 páginas con bloques

A pesar de haber ejecutado el script de seeding que reportó 8.383 registros insertados con 0 errores, **ninguna tabla operacional muestra datos**:

| Página | Tabla | Estado |
|--------|-------|--------|
| Dashboard | Casos Oncológicos Activos | No hay datos |
| Dashboard | Casos en Comité | No hay datos |
| Casos Oncológicos | Casos Oncológicos | No hay datos |
| Episodios | Eventos Clínicos | No hay datos |
| Sesiones de Comité | Sesiones de Comité | No hay datos |
| Casos en Comité | Casos en Comité | No hay datos |
| Digestivo Alto | Casos — Digestivo Alto | No hay datos |
| Digestivo Bajo | Casos — Digestivo Bajo | No hay datos |
| Mama | Casos — Mama | No hay datos |
| Ginecología | Casos — Ginecología | No hay datos |
| Urología | Casos — Urología | No hay datos |
| Tórax | Casos — Tórax | No hay datos |
| Piel y Partes Blandas | Casos — Piel y Partes Blandas | No hay datos |
| Endocrinología | Casos — Endocrinología | No hay datos |
| Hematología | Casos — Hematología | No hay datos |
| Tareas Pendientes | Tareas | No hay datos |
| Equipos de Seguimiento | Equipos | No hay datos |

**Hipótesis:** El script de seeding pudo haber apuntado a la instancia incorrecta (hospitaldeovalle.cl en vez de imedicina.cl), o la instancia fue reiniciada/recreada después del seeding.

**Acción requerida:** Verificar vía API si existen datos (`ugco_casooncologico:list`). Si no existen, re-ejecutar el seeding apuntando explícitamente a mira.imedicina.cl.

---

### C2. DASHBOARD SIN GRÁFICOS
**Severidad:** CRÍTICA
**Página:** Dashboard

El Dashboard solo contiene 2 bloques de tabla:
1. "Casos Oncológicos Activos" (tabla)
2. "Casos en Comité" (tabla)

**Faltan completamente:**
- Gráfico de barras: Casos por Especialidad
- Gráfico de torta: Casos por Estado Clínico
- Gráfico de línea: Casos por Mes de Ingreso
- Estadísticas numéricas (total casos activos, pendientes, etc.)

**Causa:** Los bloques de tipo `ChartRenderer` (plugin `data-visualization`) nunca fueron creados en el schema del Dashboard. El script `create-ugco-charts.ts` existe en `Apps/UGCO/scripts/` pero NO fue incluido en el pipeline de deployment (`deploy-to-imed.sh`).

---

### C3. CAMPOS FK MUESTRAN IDs NUMÉRICOS EN VEZ DE NOMBRES
**Severidad:** CRÍTICA
**Páginas afectadas:** Todas las tablas operacionales

Los campos de relación (belongsTo) muestran el ID numérico crudo en lugar del nombre legible:

| Página | Columna visible | Debería mostrar |
|--------|----------------|-----------------|
| Dashboard / Casos Oncológicos | "Estado Clinico ID" | Nombre del estado (Sospecha, Confirmado, etc.) |
| Dashboard / Casos Oncológicos | "Estado Administrativo ID" | Nombre del estado (Activo, Seguimiento, etc.) |
| Casos Oncológicos | "Paciente ID" | Nombre del paciente |
| Casos Oncológicos | "Estado Seguimiento ID" | Nombre del estado |
| Sesiones de Comité | "Especialidad ID" | Nombre de la especialidad |
| Casos en Comité | "Comité ID" | Nombre de la sesión |
| Casos en Comité | "Caso ID" | Código UGCO del caso |
| Tareas Pendientes | "Tipo Tarea ID" | Nombre del tipo |
| Tareas Pendientes | "Estado Tarea ID" | Nombre del estado |
| Equipos de Seguimiento | "Especialidad ID" | Nombre de la especialidad |

**Causa:** Los schemas de tabla usan los campos `_id` (integer) directamente en lugar de usar los campos de relación `belongsTo` con `x-component-props.fieldNames` que resuelven al campo `nombre` de la tabla referenciada.

**Fix requerido:** Reconfigurar cada columna para usar el campo de asociación en lugar del campo `_id` crudo. Ejemplo: en vez de `estado_clinico_id` (integer), usar `estado_clinico` (association) con `fieldNames: { label: 'nombre', value: 'id' }`.

---

### C4. PÁGINA REPORTES COMPLETAMENTE VACÍA
**Severidad:** CRÍTICA
**Página:** Reportes

La página solo muestra el título "Reportes" sobre un fondo gris claro. No contiene NINGÚN bloque:
- Sin gráficos
- Sin tablas resumen
- Sin filtros de fecha
- Sin estadísticas

**Acción requerida:** Diseñar y crear bloques de reportes (gráficos de tendencia, tablas resumen por período, KPIs).

---

### C5. FICHA 360° PACIENTE VACÍA EN IMEDICINA.CL
**Severidad:** CRÍTICA
**Página:** Ficha 360° Paciente

En mira.imedicina.cl, esta página está completamente vacía (solo título).

**Referencia:** En mira.hospitaldeovalle.cl, la Ficha 360° tiene un formulario completo:
- Sección "1. Datos Generales del Caso": Nombre Paciente, RUT Paciente, Especialidad (dropdown), Diagnóstico Principal, Código CIE-10, Estadio Clínico (dropdown), Estado del Caso (dropdown), Fecha Ingreso (datepicker), Observaciones
- Sección "2. Episodios Clínicos": Tabla con filtro

**Causa:** El schema de Ficha 360° no fue incluido en el script de deployment. Este formulario fue creado manualmente en hospitaldeovalle.cl y no tiene un script de replicación.

---

## PROBLEMAS ESTRUCTURALES

### E1. PÁGINAS DE ESPECIALIDAD SIN FILTRO POR ESPECIALIDAD
**Páginas afectadas:** 9 (Digestivo Alto, Digestivo Bajo, Mama, Ginecología, Urología, Tórax, Piel y Partes Blandas, Endocrinología, Hematología)

Todas las páginas de especialidad muestran la tabla `UGCO_CasoOncologico` (via `UGCO_CasoEspecialidad`) pero **sin un filtro predeterminado por especialidad**. Esto significa que incluso con datos, TODAS las especialidades mostrarían los mismos casos (todos).

Cada página debería tener un `filter` en el `x-decorator-props` del bloque que filtre por `especialidad_id` correspondiente.

**Columnas visibles en especialidades:**
- Código UGCO, Código CIE-10, Diagnóstico Principal, Fecha Diagnóstico, TNM T, TNM N, TNM M, Estadio Clínico
- Ginecología agrega: FIGO (correcto — campo específico)
- Todas idénticas excepto Ginecología

---

### E2. ENCABEZADOS DE COLUMNAS EXPONEN NOMBRES TÉCNICOS
Múltiples columnas muestran el nombre interno del campo en lugar de un título legible:

| Campo técnico | Título actual | Título esperado |
|--------------|---------------|-----------------|
| estado_clinico_id | "Estado Clinico ID" | "Estado Clínico" |
| estado_adm_id | "Estado Administrativo ID" | "Estado Administrativo" |
| estado_seguimiento_id | "Estado Seguimiento ID" | "Estado de Seguimiento" |
| paciente_id | "Paciente ID" | "Paciente" |
| tipo_tarea_id | "Tipo Tarea ID" | "Tipo de Tarea" |
| estado_tarea_id | "Estado Tarea ID" | "Estado" |
| comite_id | "Comité ID" | "Sesión de Comité" |
| caso_id | "Caso ID" | "Caso Oncológico" |
| especialidad_id | "Especialidad ID" | "Especialidad" |

---

### E3. DASHBOARD — FALTAN COLUMNAS INFORMATIVAS
Las 2 tablas del Dashboard muestran columnas poco útiles para un resumen:

**Tabla "Casos Oncológicos Activos":**
- Tiene: Código UGCO, Código CIE-10, Diagnóstico Principal, Fecha Diagnóstico, Estadio Clínico, Estado Clinico ID, Estado Administrativo ID
- Falta: Nombre Paciente, RUT, Especialidad, Días desde ingreso

**Tabla "Casos en Comité":**
- Tiene: Caso ID, Decisión Resumen, Plan Tratamiento, Responsable Seguimiento
- Falta: Nombre Paciente, Especialidad, Fecha Comité

---

### E4. GARANTÍAS GES EXISTE EN HOSPITALDEOVALLE.CL PERO NO EN IMEDICINA.CL
La página "Garantías GES — Semáforo de Plazos" existe en hospitaldeovalle.cl pero no fue desplegada en imedicina.cl. No estaba en el plan original de UGCO pero existe como funcionalidad.

---

## FUNCIONANDO CORRECTAMENTE

### OK1. Estructura de Menú
El menú lateral es correcto y completo:
```
UGCO
├── Dashboard
├── Casos Oncológicos
├── Episodios
├── Comité
│   ├── Sesiones de Comité
│   └── Casos en Comité
├── Especialidades
│   ├── Digestivo Alto ... Hematología (9 páginas)
├── Tareas Pendientes
├── Reportes
├── Configuración
│   ├── Especialidades (Catálogo)
│   ├── Equipos de Seguimiento
│   └── Catálogos REF
└── Ficha 360° Paciente
```
Total: 20 páginas desplegadas correctamente.

### OK2. Especialidades (Catálogo)
Muestra 9 especialidades con datos correctos:
1. HEMATO — Hematología ✓
2. ENDOCR — Endocrinología ✓
3. PIEL — Piel y Partes Blandas ✓
4. TORAX — Tórax ✓
5. UROLO — Urología ✓
6. GINECO — Ginecología ✓
7. MAMA — Mama ✓
8. DIG_BAJO — Digestivo Bajo ✓
9. DIG_ALTO — Digestivo Alto ✓

Columnas: Código Oficial, Nombre, Activo (checkbox verde). Total 9 elementos.

### OK3. Catálogos REF
Muestra múltiples tablas de referencia con datos completos:
- **Estados de Caso** (6): Activo, Seguimiento, Cerrado, Perdido, Fallecido, Derivado
- **Estados Clínicos** (4): Sospecha, Confirmado, No cáncer, Recaída
- **Estados Administrativos** (visible parcialmente al scroll)
- Cada tabla con columnas: Código, Nombre, campos booleanos específicos, Activo

---

## PLAN DE CORRECCIÓN (Priorizado)

| # | Prioridad | Acción | Esfuerzo |
|---|-----------|--------|----------|
| 1 | P0 | Verificar/re-ejecutar seeding de datos en imedicina.cl | 5 min |
| 2 | P0 | Crear bloques de gráficos en Dashboard (bar, pie, line) | 30 min |
| 3 | P0 | Reconfigurar columnas FK para usar asociaciones (no IDs) | 45 min |
| 4 | P1 | Crear contenido de página Reportes (gráficos + KPIs) | 45 min |
| 5 | P1 | Desplegar schema de Ficha 360° Paciente | 30 min |
| 6 | P1 | Agregar filtros por especialidad a las 9 páginas | 20 min |
| 7 | P2 | Renombrar títulos de columnas (quitar "ID") | 15 min |
| 8 | P2 | Agregar columnas informativas al Dashboard | 15 min |

---

## Screenshots Capturados

Todos los screenshots se encuentran en:
`docs/ui-validation/screenshots/verify-351545*.png`

| Archivo | Página |
|---------|--------|
| verify-351545172230147 | Dashboard |
| verify-351545172230148 | Dashboard (scroll) |
| verify-351545174327296 | Casos Oncológicos |
| verify-351545174327298 | Episodios |
| verify-351545174327301 | Sesiones de Comité |
| verify-351545176424448 | Casos en Comité |
| verify-351545176424451 | Digestivo Alto |
| verify-351545176424454 | Digestivo Bajo |
| verify-351545176424457 | Mama |
| verify-351545176424460 | Ginecología |
| verify-351545178521600 | Urología |
| verify-351545178521603 | Tórax |
| verify-351545178521606 | Piel y Partes Blandas |
| verify-351545178521609 | Endocrinología |
| verify-351545178521612 | Hematología |
| verify-351545178521615 | Tareas Pendientes |
| verify-351545180618752 | Reportes |
| verify-351545180618756 | Especialidades (Catálogo) |
| verify-351545180618759 | Equipos de Seguimiento |
| verify-351545180618761 | Catálogos REF |
| verify-351545180618763 | Ficha 360° Paciente |

**Referencia hospitaldeovalle.cl:**
| verify-351440432070656 | Garantías GES (hospitaldeovalle) |
| verify-351445842722816 | Ficha 360° Paciente (hospitaldeovalle) |
