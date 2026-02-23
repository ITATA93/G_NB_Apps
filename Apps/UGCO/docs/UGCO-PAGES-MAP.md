# Mapa de Paginas y Colecciones UGCO

**Fecha**: 2026-01-29
**Estado**: Pendiente de implementacion

---

## Estructura de Navegacion

```
UGCO Oncologia (ID: 345392373628928)
├── Dashboard (ID: 345392373628930, Schema: xikvv7wkefy)
├── Especialidades (ID: 345392373628932)
│   ├── Digestivo Alto (ID: 345392373628934, Schema: gvwu5oy6x81)
│   ├── Digestivo Bajo (ID: 345392373628936, Schema: dveo8ljnh3m)
│   ├── Mama (ID: 345392373628938, Schema: gd5bm7y7eeu)
│   ├── Ginecologia (ID: 345392373628940, Schema: rrilka8jvxk)
│   ├── Urologia (ID: 345392375726081, Schema: 8233csa73m0)
│   ├── Torax (ID: 345392375726083, Schema: smwp7k0f12b)
│   ├── Piel (ID: 345392375726085, Schema: 1zdi1oxxqwa)
│   ├── Endocrinologia (ID: 345392375726087, Schema: ji5zcgu1sq6)
│   ├── Hematologia (ID: 345392375726089, Schema: 3rjf7ph6m9k)
│   ├── Sarcoma y Partes Blandas (ID: 345394644844546, Schema: vs2hyb9zzjy)
│   └── Cabeza y Cuello (ID: 345394646941696, Schema: wddflxghgmh)
├── Comites (ID: 345392375726091, Schema: 7nzulppifqi)
├── Tareas (ID: 345392375726093, Schema: drslbwvdzby)
└── Reportes (ID: 345392375726095, Schema: kj5musku31w)
```

---

## Colecciones UGCO Disponibles

### Colecciones Principales

| Coleccion | Titulo | Uso Previsto |
|-----------|--------|--------------|
| `ugco_casooncologico` | Caso Oncologico | Tabla principal de casos |
| `ugco_comiteoncologico` | Comite Oncologico | Sesiones de comite |
| `ugco_evento` | UGCO Eventos y Solicitudes | Eventos clinicos |
| `UGCO_tarea` | UGCO: Tarea | Gestion de tareas |

### Colecciones de Vinculacion

| Coleccion | Titulo | Descripcion |
|-----------|--------|-------------|
| `UGCO_comitecaso` | UGCO: Caso en Comite | Relacion caso-comite |
| `UGCO_contactopaciente` | UGCO: Contacto Paciente | Contactos del paciente |
| `UGCO_equiposeguimiento` | UGCO: Equipo de Seguimiento | Equipo asignado |
| `UGCO_eventoclinico` | UGCO: Evento Clinico | Eventos del caso |

### Colecciones ALMA (Datos Externos)

| Coleccion | Titulo | Uso |
|-----------|--------|-----|
| `UGCO_ALMA_paciente` | UGCO ALMA: Paciente | Datos demograficos |
| `UGCO_ALMA_diagnostico` | UGCO ALMA: Diagnostico | Diagnosticos previos |
| `UGCO_ALMA_episodio` | UGCO ALMA: Episodio | Episodios clinicos |

### Tablas de Referencia

| Coleccion | Titulo |
|-----------|--------|
| `UGCO_REF_oncoespecialidad` | Especialidades Oncologicas |
| `UGCO_REF_oncodiagnostico` | Diagnosticos Oncologicos |
| `UGCO_REF_cie10` | Clasificacion CIE-10 |
| `UGCO_REF_oncoestadocaso` | Estado de Caso |
| `UGCO_REF_oncoestadoclinico` | Estado Clinico |
| `UGCO_REF_oncoestadoadm` | Estado Administrativo |
| `UGCO_REF_oncoecog` | Escala ECOG |
| `UGCO_REF_oncofigo` | Estadios FIGO |
| `UGCO_REF_oncoestadio_clinico` | Estadios Clinicos |
| `UGCO_REF_oncogradohistologico` | Grado Histologico |
| `UGCO_REF_oncointenciontrat` | Intencion de Tratamiento |
| `UGCO_REF_oncotnm_t` | TNM - Tumor (T) |
| `UGCO_REF_oncotnm_n` | TNM - Nodulos (N) |
| `UGCO_REF_oncotnm_m` | TNM - Metastasis (M) |
| `UGCO_REF_oncotipoetapificacion` | Tipo de Etapificacion |
| `UGCO_REF_oncotipoactividad` | Tipo de Actividad |
| `UGCO_REF_oncotipodocumento` | Tipo de Documento |
| `UGCO_REF_oncomorfologiaicdo` | Morfologia ICD-O |
| `UGCO_REF_oncotopografiaicdo` | Topografia ICD-O |
| `UGCO_REF_oncobasediagnostico` | Base del Diagnostico |
| `UGCO_REF_extension` | Extension Tumoral |
| `UGCO_REF_lateralidad` | Lateralidad |
| `UGCO_REF_sexo` | Sexo |
| `UGCO_REF_prevision` | Prevision de Salud |
| `UGCO_REF_comuna` | Comunas |
| `UGCO_REF_establecimiento_deis` | Establecimientos DEIS |

---

## Plan de Contenido por Pagina

### 1. Dashboard
**Estado**: Markdown basico
**Objetivo**: Panel de indicadores y accesos rapidos

**Bloques a agregar**:
- Estadisticas resumen (total casos, casos nuevos, por especialidad)
- Accesos rapidos a especialidades
- Ultimos casos ingresados
- Tareas pendientes

### 2. Especialidades (cada una)
**Estado**: Markdown con instrucciones
**Objetivo**: Tabla de casos filtrada por especialidad

**Bloques a agregar**:
- Tabla de casos filtrada por especialidad
- Acciones: Nuevo caso, Ver detalle, Editar
- Formulario de creacion en drawer

**Coleccion principal**: `ugco_casooncologico`
**Filtro**: Por campo de especialidad

### 3. Comites
**Estado**: Markdown basico
**Objetivo**: Gestion de sesiones de comite oncologico

**Bloques a agregar**:
- Calendario de sesiones
- Tabla de sesiones
- Formulario de nueva sesion
- Lista de casos por sesion

**Colecciones**: `ugco_comiteoncologico`, `UGCO_comitecaso`

### 4. Tareas
**Estado**: Markdown basico
**Objetivo**: Gestion de tareas y seguimiento

**Bloques a agregar**:
- Kanban por estado de tarea
- Lista de tareas
- Formulario de nueva tarea

**Coleccion**: `UGCO_tarea`

### 5. Reportes
**Estado**: Markdown basico
**Objetivo**: Reportes y estadisticas

**Bloques a agregar**:
- Graficos de tendencias
- Filtros de fecha/especialidad
- Exportacion de datos

---

## Flujo de Trabajo para Edicion

### Via API (Programatico)

1. **Obtener schema actual**:
   ```bash
   npm run nb:ui -- schema <uid>
   ```

2. **Exportar schema**:
   ```bash
   npm run nb:ui -- export <uid> --file backup.json
   ```

3. **Modificar schema** (crear nuevo JSON)

4. **Actualizar via API**:
   ```
   POST /uiSchemas:patch
   Body: { "x-uid": "<uid>", ...cambios }
   ```

### Via Script Personalizado

Se creara un script para agregar bloques de tabla a las paginas de especialidades.

---

## Siguiente Paso

Crear script `add-specialty-tables.ts` para:
1. Iterar sobre cada especialidad
2. Obtener su schema actual
3. Reemplazar el markdown por tabla de casos
4. Agregar acciones CRUD
