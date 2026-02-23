# Diseño de Interfaz de Usuario - [NOMBRE_APP]

**Última Actualización**: YYYY-MM-DD
**Versión**: 0.1.0

---

## Descripción General

[Descripción del diseño de UI de la aplicación - 2-3 párrafos explicando la filosofía de diseño y experiencia de usuario]

---

## Principios de Diseño

### 1. Simplicidad

- Interfaz limpia y minimalista
- Flujos de trabajo claros
- Reducir clics necesarios para tareas comunes

### 2. Consistencia

- Componentes reutilizables
- Patrones de interacción uniformes
- Terminología consistente

### 3. Accesibilidad

- Contraste adecuado para legibilidad
- Navegación por teclado
- Etiquetas descriptivas para lectores de pantalla

### 4. Eficiencia

- Atajos de teclado para usuarios avanzados
- Acciones en lote para operaciones múltiples
- Búsqueda y filtros rápidos

---

## Estructura de Navegación

```
┌─────────────────────────────────────────────────────────┐
│  [Logo]  [NOMBRE_APP]         Usuario: [Nombre] [▼]     │
├─────────────────────────────────────────────────────────┤
│  Dashboard │ [Módulo 1] │ [Módulo 2] │ Configuración    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Contenido Principal]                                  │
│                                                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Menú Principal

- **Dashboard**: Vista general con métricas clave
- **[Módulo 1]**: [Descripción del módulo principal]
- **[Módulo 2]**: [Descripción del segundo módulo]
- **Configuración**: Ajustes y administración

### Navegación Secundaria

- Breadcrumbs para ubicación actual
- Menú lateral colapsable para sub-secciones
- Tabs para vistas relacionadas

---

## Vistas Principales

### 1. Dashboard

**Propósito**: Resumen ejecutivo y métricas clave

**Componentes**:
- KPI Cards (4-6 métricas principales)
- Gráficos de tendencias
- Tabla de últimas actividades
- Alertas y notificaciones

**Wireframe**:
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  KPI Card 1  │  KPI Card 2  │  KPI Card 3  │  KPI Card 4  │
│  [Número]    │  [Número]    │  [Número]    │  [Número]    │
│  [Título]    │  [Título]    │  [Título]    │  [Título]    │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌─────────────────────────────┬─────────────────────────────┐
│  Gráfico de Tendencia       │  Últimas Actividades        │
│  [Chart]                    │  [Table]                    │
│                             │                             │
└─────────────────────────────┴─────────────────────────────┘
```

### 2. Vista de Listado

**Propósito**: Explorar y filtrar registros de una colección

**Componentes**:
- Barra de búsqueda y filtros
- Tabla con columnas configurables
- Paginación
- Acciones en lote
- Botón de crear nuevo

**Wireframe**:
```
┌─────────────────────────────────────────────────────────┐
│  [🔍 Buscar...]  [Filtros ▼]  [Columnas ▼]  [+ Nuevo]   │
├─────────────────────────────────────────────────────────┤
│  ☐ │ Col 1     │ Col 2    │ Col 3    │ Col 4 │ Acciones│
│  ☐ │ Valor 1   │ Valor 2  │ Valor 3  │ Val 4 │ [⋮]     │
│  ☐ │ Valor 1   │ Valor 2  │ Valor 3  │ Val 4 │ [⋮]     │
│  ☐ │ Valor 1   │ Valor 2  │ Valor 3  │ Val 4 │ [⋮]     │
├─────────────────────────────────────────────────────────┤
│  Mostrando 1-20 de 150          [◀] [1][2][3][▶]       │
└─────────────────────────────────────────────────────────┘
```

**Funcionalidades**:
- Ordenamiento por columnas
- Filtros múltiples combinables
- Exportar a Excel/PDF
- Selección múltiple para acciones en lote

### 3. Formulario de Creación/Edición

**Propósito**: Crear o modificar un registro

**Componentes**:
- Campos agrupados por secciones
- Validación en tiempo real
- Botones de guardar/cancelar
- Indicadores de campos requeridos

**Wireframe**:
```
┌─────────────────────────────────────────────────────────┐
│  ← Volver                        [Título del Registro]  │
├─────────────────────────────────────────────────────────┤
│  Sección 1: Información General                         │
│  ┌───────────────────┐  ┌───────────────────┐          │
│  │ Campo 1 *         │  │ Campo 2           │          │
│  │ [Input]           │  │ [Input]           │          │
│  └───────────────────┘  └───────────────────┘          │
│                                                         │
│  Sección 2: Detalles                                    │
│  ┌───────────────────────────────────────────┐          │
│  │ Campo 3 *                                 │          │
│  │ [Textarea]                                │          │
│  └───────────────────────────────────────────┘          │
│                                                         │
│  ┌───────────────────┐  ┌───────────────────┐          │
│  │ Campo 4           │  │ Campo 5 *         │          │
│  │ [Select ▼]        │  │ [Date Picker]     │          │
│  └───────────────────┘  └───────────────────┘          │
├─────────────────────────────────────────────────────────┤
│                           [Cancelar]  [Guardar]         │
└─────────────────────────────────────────────────────────┘
```

**Validaciones**:
- Campos requeridos marcados con *
- Validación en tiempo real
- Mensajes de error claros
- Confirmación antes de descartar cambios

### 4. Vista de Detalle

**Propósito**: Ver información completa de un registro

**Componentes**:
- Información en modo lectura
- Botones de acción (Editar, Eliminar, etc.)
- Tabs para información relacionada
- Historial de cambios

**Wireframe**:
```
┌─────────────────────────────────────────────────────────┐
│  ← Volver           [Título del Registro]  [Editar] [⋮] │
├─────────────────────────────────────────────────────────┤
│  Información │ Relacionados │ Historial                 │
├─────────────────────────────────────────────────────────┤
│  Sección 1: Información General                         │
│  Campo 1:  Valor 1                                      │
│  Campo 2:  Valor 2                                      │
│                                                         │
│  Sección 2: Detalles                                    │
│  Campo 3:  Valor 3                                      │
│  Campo 4:  Valor 4                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Componentes Reutilizables

### Botones

| Tipo | Apariencia | Uso |
|------|-----------|-----|
| Primario | [Azul sólido] | Acción principal (Guardar, Crear) |
| Secundario | [Azul borde] | Acción secundaria (Cancelar) |
| Peligro | [Rojo sólido] | Acciones destructivas (Eliminar) |
| Icono | [Solo icono] | Acciones rápidas (Editar, Ver) |

### Formularios

**Tipos de Campos**:
- Input de texto (corto y largo)
- Textarea (multilínea)
- Select/Dropdown
- Checkbox y Radio
- Date Picker
- File Upload
- Rich Text Editor (para descripciones largas)

**Estados**:
- Default
- Focus
- Error
- Disabled
- Success

### Tablas

**Características**:
- Headers fijos en scroll
- Columnas redimensionables
- Ordenamiento bidireccional
- Paginación o scroll infinito
- Acciones por fila (menú de 3 puntos)

### Modales y Diálogos

**Tipos**:
- Confirmación (Sí/No)
- Formulario en modal
- Información (Solo OK)
- Alerta (Advertencia o Error)

---

## Paleta de Colores

### Colores Principales

| Color | Hex | Uso |
|-------|-----|-----|
| Primario | #[COLOR] | Botones principales, enlaces |
| Secundario | #[COLOR] | Elementos de apoyo |
| Éxito | #28a745 | Confirmaciones, estados OK |
| Advertencia | #ffc107 | Alertas, estados pendientes |
| Error | #dc3545 | Errores, validaciones fallidas |
| Información | #17a2b8 | Mensajes informativos |

### Colores de Fondo

| Color | Hex | Uso |
|-------|-----|-----|
| Fondo Principal | #ffffff | Contenido principal |
| Fondo Secundario | #f8f9fa | Sidebar, headers |
| Fondo Hover | #e9ecef | Estados hover |

### Texto

| Color | Hex | Uso |
|-------|-----|-----|
| Texto Principal | #212529 | Texto de contenido |
| Texto Secundario | #6c757d | Etiquetas, descripciones |
| Texto Deshabilitado | #adb5bd | Estados disabled |

---

## Tipografía

### Fuentes

- **Familia Principal**: [Nombre de fuente] (ej: Inter, Roboto, Open Sans)
- **Fuente Monoespaciada**: [Nombre] (para códigos, IDs)

### Tamaños

| Uso | Tamaño | Peso |
|-----|--------|------|
| H1 (Títulos de página) | 32px | Bold |
| H2 (Secciones) | 24px | Bold |
| H3 (Subsecciones) | 20px | Semibold |
| Cuerpo | 14px | Regular |
| Pequeño | 12px | Regular |
| Etiquetas | 12px | Medium |

---

## Iconografía

**Librería**: [Font Awesome / Material Icons / Custom]

**Iconos Estándar**:
- ➕ Crear/Agregar
- ✏️ Editar
- 🗑️ Eliminar
- 👁️ Ver
- 🔍 Buscar
- ⚙️ Configuración
- 📊 Reportes
- ⬇️ Descargar
- ↻ Refrescar

---

## Estados de la UI

### Carga (Loading)

- Spinner para acciones en proceso
- Skeleton screens para carga inicial
- Progress bar para operaciones largas

### Vacío (Empty States)

```
┌─────────────────────────────────────────┐
│                                         │
│           [Icono ilustrativo]           │
│                                         │
│     No hay registros para mostrar       │
│                                         │
│     [+ Crear Primer Registro]           │
│                                         │
└─────────────────────────────────────────┘
```

### Error

```
┌─────────────────────────────────────────┐
│  ⚠️  Error al cargar los datos          │
│                                         │
│  [Mensaje descriptivo del error]        │
│                                         │
│     [Reintentar]  [Contactar Soporte]   │
└─────────────────────────────────────────┘
```

---

## Responsive Design

### Breakpoints

| Dispositivo | Ancho | Ajustes |
|------------|-------|---------|
| Desktop | ≥1200px | Layout completo |
| Tablet | 768-1199px | Sidebar colapsable |
| Mobile | <768px | Navegación hamburguesa |

### Adaptaciones Mobile

- Menú lateral convertido a hamburguesa
- Tablas con scroll horizontal
- Formularios apilados verticalmente
- Botones de ancho completo

---

## Flujos de Usuario

### Flujo de Creación de Registro

1. Usuario hace clic en "+ Nuevo"
2. Se abre formulario de creación
3. Usuario completa campos requeridos
4. Sistema valida en tiempo real
5. Usuario hace clic en "Guardar"
6. Sistema muestra confirmación
7. Usuario es redirigido a vista de detalle

### Flujo de Edición de Registro

1. Usuario selecciona registro de la lista
2. Se abre vista de detalle
3. Usuario hace clic en "Editar"
4. Formulario se habilita para edición
5. Usuario modifica campos
6. Sistema valida cambios
7. Usuario hace clic en "Guardar"
8. Sistema muestra confirmación

### Flujo de Eliminación

1. Usuario selecciona registro
2. Usuario hace clic en "Eliminar"
3. Sistema muestra modal de confirmación
4. Usuario confirma la acción
5. Sistema elimina y muestra confirmación
6. Vista se actualiza

---

## Mensajes y Notificaciones

### Tipos de Mensajes

**Toast Notifications** (esquina superior derecha):
- ✅ Éxito: "Registro guardado correctamente"
- ⚠️ Advertencia: "Algunos campos no se guardaron"
- ❌ Error: "Error al guardar. Intente nuevamente"
- ℹ️ Información: "Sincronización completada"

**Alertas en Página**:
- Alertas persistentes sobre formularios
- Mensajes de validación
- Advertencias de datos faltantes

---

## Accesibilidad (A11y)

### Estándares

- **WCAG 2.1 Level AA** compliance
- Contraste mínimo de 4.5:1 para texto
- Navegación completa por teclado
- Etiquetas ARIA para lectores de pantalla

### Checklist

- [ ] Todos los inputs tienen labels
- [ ] Imágenes tienen alt text
- [ ] Navegación por Tab lógica
- [ ] Focus visible en elementos interactivos
- [ ] Mensajes de error asociados a campos
- [ ] Contraste adecuado verificado

---

## Mockups y Assets

**Ubicación**: [../assets/mockups/](../assets/mockups/)

- Mockups de alta fidelidad por vista
- Assets exportados (iconos, logos)
- Style guide visual

---

## Herramientas de Diseño

- **Prototipado**: [Figma / Adobe XD / Sketch]
- **Iconos**: [Font Awesome / Material Icons]
- **Paleta de colores**: [Coolors / Adobe Color]

---

## Referencias

- [Guía de Estilo de NocoBase](https://docs.nocobase.com/)
- [Material Design Guidelines](https://material.io/design)
- [WCAG 2.1 Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Versión**: 0.1.0
**Diseñado por**: [Nombre]
**Próxima Revisión**: YYYY-MM-DD
