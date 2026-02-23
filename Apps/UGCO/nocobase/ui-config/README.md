# Configuración UI - UGCO Gestión Oncológica

## Estructura de Archivos

```
ui-config/
├── menu-config.json           # Estructura del menú lateral
├── dashboard-schema.json      # Dashboard con KPIs
├── especialidad-template.json # Template para páginas de especialidad
├── ficha-caso-schema.json     # Detalle del caso con tabs
└── README.md                  # Este archivo
```

## Implementación en NocoBase

### 1. Menú Lateral

El archivo `menu-config.json` define la estructura de navegación:

- **Dashboard General**: KPIs y métricas globales
- **Especialidades** (9): Una página por cada especialidad oncológica
  - Digestivo Alto (#FF8B00)
  - Digestivo Bajo (#8B4513)
  - Mama (#E91E63)
  - Ginecología (#9C27B0)
  - Urología (#2196F3)
  - Tórax (#607D8B)
  - Piel y Partes Blandas (#FFC107)
  - Endocrinología (#4CAF50)
  - Hematología (#F44336)
- **Comités Oncológicos**: Gestión de sesiones
- **Tareas Pendientes**: Lista de tareas por completar
- **Reportes**: Generación de informes
- **Configuración**: Catálogos y equipos

### 2. Dashboard

Componentes del Dashboard (`dashboard-schema.json`):

| Bloque | Tipo | Descripción |
|--------|------|-------------|
| KPIs | Statistic x4 | Casos totales, críticos, pendientes, al día |
| Casos por Especialidad | Chart (barras) | Distribución de casos activos |
| Alertas Urgentes | List | Controles vencidos, biopsias pendientes |
| Flujo de Estados | Pipeline | Diagnóstico → Etapificación → Tratamiento → Seguimiento |
| Próximos Comités | Table | Sesiones programadas |

### 3. Página de Especialidad

Template replicable (`especialidad-template.json`):

| Sección | Componentes |
|---------|-------------|
| Header | Título + Botón "Nuevo Caso" |
| KPIs | 4 indicadores filtrados por especialidad |
| Filtros | Estado, Médico, Búsqueda |
| Lista | Tabla de casos con semáforo |
| Kanban | Vista por estado administrativo |

**Variables del Template:**
- `{{ESPECIALIDAD_ID}}`: Identificador (ej: "mama")
- `{{ESPECIALIDAD_NOMBRE}}`: Nombre display (ej: "Mama")
- `{{ESPECIALIDAD_CODIGO}}`: Código en BD (ej: "P._MAMARIA")
- `{{ESPECIALIDAD_COLOR}}`: Color hex (ej: "#E91E63")

### 4. Ficha del Caso

Drawer con tabs (`ficha-caso-schema.json`):

| Tab | Contenido |
|-----|-----------|
| 📋 Resumen | Diagnóstico, TNM, Tratamiento, Contacto |
| 📈 Timeline | Línea de tiempo de eventos |
| 🏥 Eventos | Tabla de eventos clínicos |
| 🔬 Estudios | Labs, imágenes, biopsias |
| 👥 Comités | Historial de presentaciones |
| ✅ Tareas | Pendientes del caso |

### 5. Sistema de Semáforo

| Color | Condición |
|-------|-----------|
| 🔴 Rojo | Control vencido > 7 días OR tarea crítica pendiente |
| 🟡 Amarillo | Control vence en < 7 días OR tarea pendiente |
| 🟢 Verde | Sin pendientes ni alertas |

## Pasos de Implementación

### Paso 1: Configurar Menú en NocoBase

1. Ir a **Settings > UI Editor**
2. Crear grupo "UGCO Oncología"
3. Agregar páginas según `menu-config.json`

### Paso 2: Crear Dashboard

1. Crear página "Dashboard UGCO"
2. Agregar bloques:
   - 4x Statistic (KPIs)
   - 1x Chart (barras horizontales)
   - 1x Table (alertas)
   - 1x Table (comités)

### Paso 3: Crear Páginas de Especialidad

Para cada especialidad:
1. Duplicar template
2. Reemplazar variables
3. Configurar filtros por `especialidad_principal.codigo`

### Paso 4: Configurar Ficha del Caso

1. Crear Drawer "Ficha Caso"
2. Agregar Tabs con 6 pestañas
3. Vincular tablas relacionadas

### Paso 5: Configurar Kanban

1. Agregar bloque Kanban
2. Configurar columnas (estados administrativos)
3. Habilitar drag & drop

## Colecciones Utilizadas

| Colección | Uso |
|-----------|-----|
| ugco_casooncologico | Tabla principal de casos |
| ugco_eventoclinico | Eventos y timeline |
| ugco_tarea | Gestión de tareas |
| ugco_comiteoncologico | Sesiones de comité |
| ugco_comitecaso | Casos en comité |
| UGCO_REF_* | Catálogos de referencia |
| UGCO_ALMA_paciente | Datos del paciente |

## Notas de Desarrollo

- Los schemas JSON son **templates de referencia**, no configuración directa de NocoBase
- NocoBase usa su propio sistema de schemas (x-designer)
- Implementación real requiere UI Editor de NocoBase
- Los filtros dinámicos usan sintaxis `{{variable}}`
