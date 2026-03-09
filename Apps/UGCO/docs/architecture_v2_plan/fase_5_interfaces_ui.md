# FASE 5: Interfaces de Usuario (NocoBase UI Pages)

## 1. Justificación Arquitectónica

Una base de datos sofisticada es inútil si la presentación es abrumadora. La clave es **segregar las vistas por Rol**. Médicos necesitan contexto longitudinal profundo. Enfermeras navegadoras necesitan un inbox de tareas urgente. La Jefatura necesita indicadores agregados.

---

## 2. Mapa de Navegación (Menús NocoBase)

### 2.1 Menú: "Navegación Oncológica" (Rol: Enfermería)

Centro de Comando Logístico.

#### Página: Inbox de Alertas

- *Data Source*: `ugco_tareas`
- *Filtros*: `estado` NOT IN (Completada, Anulada)
- *Sort*: `prioridad_clinica` DESC, `dias_restantes` ASC
- *Visualización*: Table View con colores de semáforo en columna `dias_restantes`

#### Página: Kanban de Tareas

- *Data Source*: `ugco_tareas`
- *Vista*: Kanban nativa de NocoBase
- *Agrupación*: Campo `estado`
- *Tarjeta muestra*: Paciente (RUT + Nombre), Tipo Tarea, Días Restantes

#### Página: Pacientes Activos

- *Data Source*: `ugco_casos` con lookup a `ugco_pacientes`
- *Filtro*: `estado_viaje` NOT IN (Egresado)
- *Sort*: `fecha_ingreso_ugco` DESC

#### Página: Alertas GES

- *Data Source*: `ugco_garantias_ges`
- *Filtro*: `estado_garantia` = Vigente AND `dias_restantes` < 15
- *Sort*: `dias_restantes` ASC
- *Propósito*: Lista pura de garantías GES próximas a vencer

### 2.2 Menú: "Grupos Clínicos" (Rol: Médicos y Comités)

Un submenú por cada especialidad. Todos apuntan al mismo backend unificado.

#### Subpáginas: Tórax / Mama / Digestivo Alto / Digestivo Bajo / Cabeza y Cuello / Urología / Hematología / Endocrinología / Sarcoma

- *Data Source*: `ugco_casos` con lookup a `ugco_pacientes`
- *Filtro Inyectado*: `especialidad_id` = (la correspondiente al sub-menú)
- *Experiencia*: El médico de tórax solo ve sus pacientes de pulmón

### 2.3 Menú: "Comités Oncológicos"

#### Página: Sesiones de Comité

- *Data Source*: `ugco_comite_sesiones`
- *Sort*: `fecha_sesion` DESC
- *Acciones*: Crear nueva sesión, Abrir sesión para agregar presentaciones

#### Página: Casos en Comité (Sub-table o Drawer)

- *Data Source*: `ugco_comite_presentaciones`
- *Filtro*: Por sesión seleccionada
- *Acciones*: Agregar caso a sesión, Registrar resolución

### 2.4 Menú: "Dashboard y Reportes" (Rol: Jefatura / Registrador RHC)

#### Página: Dashboard Gerencial

- *Bloque 1 (Gráfico Barras)*: Casos nuevos por mes (últimos 12 meses)
- *Bloque 2 (Gráfico Torta)*: Distribución por Etapa Clínica
- *Bloque 3 (KPI Card)*: Tiempo promedio Diagnóstico → Primer Tratamiento (días)
- *Bloque 4 (KPI Card)*: % Cumplimiento GES (Garantías Cumplidas / Total)
- *Bloque 5 (Gráfico Barras)*: Tareas vencidas vs cumplidas por mes

#### Página: Exportación RHC (MINSAL)

- *Data Source*: Vista cruzada de `ugco_casos` + `ugco_pacientes` + `ugco_eventos`
- *Propósito*: Tabla plana con TODAS las variables del Registro Hospitalario de Cáncer, lista para descargar como CSV/Excel y enviar al MINSAL
- *Campos proyectados*: RUT, Nombres, Fecha Nacimiento, Sexo, Comuna, CIE-O Topo/Morfo, Base Diagnóstica, TNM, Etapa, Tratamientos recibidos, Estado paciente, Fecha defunción

---

## 3. El Diseño del "Drawer" (Ficha 360 del Paciente)

Pieza maestra de UI. Al hacer clic en un paciente, se abre un Drawer con Tabs:

### Tab 1: Resumen Clínico

- Bloque `Details` con campos de `ugco_casos` + `ugco_pacientes`
- Muestra: RUT, Edad, Comuna, Especialidad, CIE-O, TNM, Etapa, GES
- Incluye el campo `estado_viaje` con badge de color

### Tab 2: Línea de Tiempo

- Bloque `Timeline` nativo de NocoBase
- *Data Source*: `ugco_eventos` (relación HasMany desde `ugco_casos`)
- *Configuración*:
  - Título del nodo: `tipo_evento.nombre_display` + `fecha_clinica`
  - Cuerpo: `resumen_titulo`
  - Metadatos: `profesional_id`, `institucion_ejecutora`
- Botón embebido: "+ Registrar Evento" (modal para nuevo hito)

### Tab 3: Garantías GES

- Bloque `Table` con `ugco_garantias_ges` filtrado por caso
- Muestra semáforo visual de días restantes por cada garantía

### Tab 4: Tareas de Navegación

- Bloque `Table` con `ugco_tareas` filtrado por caso
- Muestra estado y días restantes de cada tarea pendiente

### Tab 5: Historial de Comités

- Bloque `Table` con `ugco_comite_presentaciones` filtrado por caso
- Muestra sesión, decisión, centro de derivación
