# UGCO App — Analisis Critico y Plan de Mejoras

**Fecha:** 2026-03-02
**Instancia:** mira.hospitaldeovalle.cl (produccion)
**Version NocoBase:** 1.9.14
**Paginas UGCO analizadas:** 16 (4 core + Dashboard + 9 Especialidades + 3 Config)

---

## 1. Estado Actual — Resumen Ejecutivo

| Aspecto | Estado | Nota |
|---------|--------|------|
| Colecciones core (4) | OK | 1,035 casos / 2,529 episodios / 86 sesiones / 605 comite |
| Relaciones | PARCIAL | belongsTo funciona, pero hasMany no se expone en UI |
| CRUD (crear/editar/borrar) | CRITICO | Las 4 paginas principales son READ-ONLY |
| Filtros y busqueda | CRITICO | Ninguna pagina core tiene filtros habilitados |
| Dashboard | ROTO | Todos los bloques apuntan a colecciones UGCO_* vacias |
| Especialidades (9 paginas) | ROTO | Sin filtros por especialidad, "No hay datos", formularios vacios |
| Reportes | PARCIAL | 5 tablas pero apuntan a colecciones legacy vacias |
| Tareas Pendientes | VACIO | Sin datos, sin campos estado_tarea/caso/paciente |
| Headers Markdown | OK | 4 headers descriptivos insertados |
| Datos de prueba | OK | 4,255 registros simulados realistas |

---

## 2. Analisis Critico por Pagina

### 2.1 Casos Oncologicos (326 bloques)

**Lo bueno:**
- Tabla carga correctamente con 1,035 registros
- Columnas visibles: Fecha Ingreso, Acciones, Observaciones, ID Paciente, RUT Paciente, Diagnostico Principal, Estado del Caso, Nombre Paciente, Estadio Clinico, Codigo CIE-10
- Tags de colores en Estado (Cuidados Paliativos, En Tratamiento, Fallecido, En Comite, Alta)
- Header Markdown descriptivo visible

**Problemas encontrados:**
1. **SIN FILTROS** — El clinico no puede buscar por RUT, nombre ni diagnostico. Con 1,035 casos esto es inutilizable
2. **SIN BOTONES CRUD** — No hay "Crear nuevo", "Editar" ni "Eliminar". Solo lectura
3. **Fechas en formato ISO raw** — Muestra `2025-12-29T00:00:00.000Z` en vez de `29/12/2025`
4. **Observaciones en latin** — Los datos simulados usan texto Lorem ipsum, no es realista
5. **Columna "Acciones" vacia** — Existe header pero no hay botones de accion configurados
6. **Sin detalle expandible** — No hay click-to-expand para ver episodios del caso
7. **Sin sort por defecto** — Deberia mostrar los mas recientes primero
8. **Campo `responsible_doctor` no visible** — La relacion belongsTo existe pero no tiene columna

### 2.2 Episodios (494 bloques)

**Lo bueno:**
- 2,529 registros cargando correctamente
- Columnas: Fecha, Descripcion, caso_id, Tipo de Episodio, Estado, Notas Clinicas, Resultado, Caso Oncologico
- Tags de colores en Tipo (Biopsia, Cirugia, Quimioterapia, Consulta, Imagen, Control)
- Tags de colores en Estado (Completado, Programado, Cancelado)
- Caso Oncologico como link clickeable (muestra ID)

**Problemas encontrados:**
1. **SIN FILTROS** — No se puede filtrar por tipo, estado, caso ni fecha
2. **SIN BOTONES CRUD** — Solo lectura
3. **`caso_id` como numero raw** — Muestra "31", "32" en vez del nombre/RUT del paciente
4. **Fechas ISO raw** — Mismo problema de formato
5. **"Cirugia" muestra caracter roto** — Se ve `Cirug◆a` (encoding UTF-8 corrupto en el enum)
6. **Sin orden por fecha** — Deberia mostrar los mas recientes primero
7. **Notas clinicas truncadas** — Texto largo cortado sin opcion de expandir

### 2.3 Sesiones de Comite (137 bloques)

**Lo bueno:**
- 86 sesiones cargando
- Header descriptivo visible

**Problemas CRITICOS:**
1. **SOLO 2 COLUMNAS** — Muestra solo "Fecha de Sesion" y "Acta". Faltan 5 campos: tipo_comite, numero_sesion, asistentes, estado_sesion, casos_presentados
2. **SIN CRUD** — Solo lectura
3. **SIN FILTROS**
4. **Fechas ISO raw**
5. **No muestra cuantos casos tiene cada sesion** — Sin relacion visible a comite_casos
6. **Sin numero de sesion correlativo** — Campo existe en BD pero no en tabla

### 2.4 Casos en Comite (137 bloques)

**Lo bueno:**
- 605 registros
- Columna "Decision del Comite" con texto clinico real
- Header descriptivo

**Problemas CRITICOS:**
1. **SOLO 2 COLUMNAS** — Solo "Decision del Comite" y "Fecha de Presentacion". Faltan 7 campos: caso (paciente), sesion, prioridad, recomendacion, observaciones, votacion, responsable_seguimiento
2. **SIN CRUD**
3. **SIN FILTROS**
4. **No identifica el paciente** — No se sabe a quien pertenece cada decision
5. **No identifica la sesion** — No se sabe en que sesion se tomo la decision

### 2.5 Dashboard (104 bloques) — ROTO

**Estado: COMPLETAMENTE INUTIL**

- 3 bloques de tabla: "Casos Oncologicos Activos", "Tareas Pendientes", "Ultimos Eventos Clinicos"
- 2 bloques de graficos (Bar chart + Pie chart)
- **TODOS muestran "No hay datos"** porque apuntan a colecciones UGCO_* legacy que tienen 0 registros
- Los datos reales estan en `onco_*` (4,255 registros) pero el Dashboard no los usa
- Console error: `Cannot read properties of undefined (reading 'measures')`

### 2.6 Especialidades (9 paginas) — ROTAS

**Estado: COMPLETAMENTE INUTILES**

- Las 9 paginas (Digestivo Alto/Bajo, Mama, Ginecologia, Urologia, Torax, Piel, Endocrinologia, Hematologia) usan `UGCO_casooncologico` (0 registros)
- **NINGUNA tiene filtro por especialidad** — Todas muestran la misma tabla sin filtrar
- Tienen boton "+ Anadir nuevo" pero el formulario esta **completamente vacio** (0 campos)
- La tabla pivot `UGCO_casoespecialidad` existe pero nunca se usa en la UI

### 2.7 Tareas Pendientes — VACIO

- Coleccion `UGCO_tarea` tiene 0 registros
- Columnas: Codigo UGCO 01, Titulo, Fecha vencimiento, Responsable, Comentarios
- **Faltan**: estado_tarea, caso vinculado, paciente, prioridad
- Tiene boton "+ Anadir nuevo" con formulario

### 2.8 Reportes — PARCIALMENTE ROTO

- 5 bloques de tabla con Filtro + Exportar
- "Reporte: Todos los Casos Oncologicos" -> `UGCO_casooncologico` = **"No hay datos"** (0 registros)
- "Reporte: Eventos Clinicos" -> `UGCO_eventoclinico` = **"No hay datos"**
- "Reporte: Tareas" -> `UGCO_tarea` = **"No hay datos"**
- Columnas de Comite referencian campos inexistentes (fecha_sesion, lugar, estado en vez de fecha_comite, tipo_comite)
- Boton "Exportar" existe pero no hay nada que exportar

### 2.9 Configuracion (3 paginas) — PARCIAL

- **Especialidades**: OK, muestra 9 especialidades con nombre, codigo, activo
- **Equipos de Seguimiento**: Tiene datos pero falta columna de especialidad vinculada
- **Catalogos REF**: Solo muestra 1 tabla (`UGCO_REF_oncoestadoadm`) de las 27+ tablas REF que existen

---

## 3. Problemas Transversales

### 3.1 Dualidad de Colecciones (CRITICO)
Existen **dos sets de colecciones** para los mismos datos:

| Coleccion nueva (con datos) | Coleccion legacy (vacia) | Usada en |
|------------------------------|--------------------------|----------|
| `onco_casos` (1,035) | `UGCO_casooncologico` (0) | Dashboard, Especialidades, Reportes usan la LEGACY |
| `onco_episodios` (2,529) | `UGCO_eventoclinico` (0) | Dashboard, Reportes usan la LEGACY |
| `onco_comite_sesiones` (86) | `UGCO_comiteoncologico` (?) | Reportes usa la LEGACY |
| `onco_comite_casos` (605) | `UGCO_comitecaso` (?) | Reportes usa la LEGACY |

**Las 4 paginas principales usan las nuevas (OK), pero Dashboard, Especialidades, Reportes apuntan a las legacy vacias.**

### 3.2 Sin CRUD en paginas principales
Las 4 paginas core (Casos, Episodios, Sesiones, Comite) no tienen:
- Boton "Crear nuevo"
- Boton "Editar" por fila
- Boton "Eliminar" por fila
- Formulario de creacion/edicion

### 3.3 Sin filtros en ninguna pagina core
Ningun bloque de tabla de las paginas principales tiene filtro habilitado. En una app con 4,255 registros, esto es inaceptable.

### 3.4 Formato de fechas
Todas las fechas se muestran como `2025-12-29T00:00:00.000Z` en vez del formato local `29/12/2025`.

### 3.5 Encoding corrupto
El tipo de episodio "Cirugia" se muestra como `Cirug◆a` — caracter Unicode corrompido.

---

## 4. Plan de Mejoras — Priorizado

### P0 — CRITICO (sin esto la app es inutilizable)

| # | Mejora | Paginas afectadas | Esfuerzo |
|---|--------|-------------------|----------|
| 1 | **Agregar filtros** a las 4 tablas principales (buscar por RUT, nombre, diagnostico, estado, fecha) | Casos, Episodios, Sesiones, Comite | Medio |
| 2 | **Agregar CRUD** completo: boton crear, editar inline, eliminar con confirmacion | Casos, Episodios, Sesiones, Comite | Alto |
| 3 | **Reconectar Dashboard** a colecciones `onco_*` en vez de `UGCO_*` | Dashboard | Medio |
| 4 | **Reconectar Reportes** a colecciones `onco_*` | Reportes | Medio |

### P1 — ALTO (usabilidad basica)

| # | Mejora | Paginas afectadas | Esfuerzo |
|---|--------|-------------------|----------|
| 5 | **Agregar columnas faltantes** en Sesiones (numero_sesion, tipo_comite, estado_sesion, cant. casos) | Sesiones | Bajo |
| 6 | **Agregar columnas faltantes** en Comite (paciente, sesion, prioridad, recomendacion) | Comite | Bajo |
| 7 | **Formatear fechas** a formato local (DD/MM/YYYY) en todas las tablas | Todas | Bajo |
| 8 | **Reconectar Especialidades** a `onco_casos` con filtro por especialidad via pivot table | Especialidades (9 paginas) | Alto |
| 9 | **Corregir encoding** de "Cirugia" y otros valores con tilde | Episodios | Bajo |
| 10 | **Ordenar por fecha DESC** por defecto en todas las tablas | Todas | Bajo |

### P2 — MEDIO (experiencia clinica)

| # | Mejora | Paginas afectadas | Esfuerzo |
|---|--------|-------------------|----------|
| 11 | **Detalle expandible** en Casos: click abre panel con episodios y presentaciones comite | Casos | Alto |
| 12 | **Mostrar nombre paciente** en vez de caso_id numerico en Episodios y Comite | Episodios, Comite | Bajo |
| 13 | **Completar formularios** de Especialidades (actualmente vacios al crear) | Especialidades | Medio |
| 14 | **Agregar campos** a Tareas: estado_tarea, caso vinculado, paciente, prioridad | Tareas | Medio |
| 15 | **Graficos funcionales** en Dashboard con datos reales (distribucion por estado, por especialidad, timeline) | Dashboard | Alto |

### P3 — BAJO (mejoras futuras)

| # | Mejora | Esfuerzo |
|---|--------|----------|
| 16 | Limpiar colecciones UGCO_* legacy vacias | Bajo |
| 17 | Completar Catalogos REF (mostrar las 27+ tablas, no solo 1) | Medio |
| 18 | Agregar campo medico_responsable visible en Casos | Bajo |
| 19 | Agregar workflows automaticos (alerta vencimiento seguimiento, recordatorio comite) | Alto |
| 20 | Agregar permisos por rol (oncologo vs enfermera vs admin) | Medio |

---

## 5. Metricas de Calidad

| Metrica | Valor | Target |
|---------|-------|--------|
| Paginas que cargan sin error | 14/16 (87%) | 100% |
| Paginas con datos visibles | 6/16 (37%) | 100% |
| Paginas con CRUD funcional | 3/16 (19%) — solo Especialidades, Tareas, Equipos | 100% |
| Paginas con filtros | 0/16 (0%) | 100% |
| Colecciones con datos | 4/11 core (36%) | 100% |
| Console errors | 7 | 0 |
| Campos visibles vs existentes | ~40% | >80% |

---

## 6. Conclusion

La app UGCO tiene una **base solida** en cuanto a modelo de datos (12 campos en casos, 8 en episodios, relaciones belongsTo/hasMany correctas, 4,255 registros de prueba). Sin embargo, la **capa de presentacion esta severamente incompleta**:

- Las 4 paginas principales son read-only sin filtros — un clinico no puede trabajar con esto
- El Dashboard, Especialidades y Reportes apuntan a colecciones vacias (legacy) — completamente inutiles
- Solo el 37% de las paginas muestra datos reales
- Solo el 40% de los campos definidos en BD son visibles en la UI

**Prioridad inmediata**: Items P0 (1-4) harian la app minimamente funcional. Items P1 (5-10) la harian usable para un piloto clinico.
