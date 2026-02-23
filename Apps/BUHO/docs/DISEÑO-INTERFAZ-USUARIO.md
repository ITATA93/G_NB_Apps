# Diseño de Interfaz de Usuario - Proyecto BUHO (Gestión de Pacientes)

## 1. Visión General
El objetivo es proporcionar una interfaz visual para la gestión del flujo de pacientes hospitalizados, permitiendo visualizar rápidamente su ubicación, estado clínico y plan de trabajo.

## 2. Estructura del Menú
*   **Dashboard General**: Vista de alto nivel (métricas).
*   **Gestión de Camas (Kanban)**: Vista principal de trabajo.
*   **Listado de Pacientes**: Vista tabular para búsquedas.

## 3. Definición de Vistas

### 3.1. Gestión de Camas (Vista Kanban)
**Objetivo**: Visualizar el flujo de pacientes según su estado en el plan de trabajo.

*   **Agrupación**: Por campo `estado_plan` (Pendiente -> En Curso -> Listo para Alta).
*   **Tarjeta del Paciente (Card)**:
    *   **Título**: `nombre` (Negrita).
    *   **Subtítulo**: `cama` - `servicio`.
    *   **Etiquetas (Tags)**:
        *   `riesgo_detectado` (Color: Alto=Rojo, Medio=Naranja, Bajo=Verde).
        *   `categorizacion`.
    *   **Cuerpo**: `diagnostico_principal` (truncado).
    *   **Acciones**: Botón "Ver Ficha", Botón "Editar Plan".

### 3.2. Ficha del Paciente (Drawer/Modal)
**Objetivo**: Ver y editar el detalle completo de un paciente.

*   **Cabecera**:
    *   Datos demográficos: `nombre`, `rut`.
    *   Ubicación: `servicio`, `sala`, `cama`.
*   **Pestaña 1: Clínico**:
    *   `fecha_ingreso`, `fecha_probable_alta`.
    *   `diagnostico_principal`.
    *   `categorizacion`, `tipo_cama`.
*   **Pestaña 2: Plan de Trabajo**:
    *   `estado_plan` (Select).
    *   `proxima_accion` (Textarea).
    *   `riesgo_detectado` (Select).
    *   `estudios_pendientes` (Textarea).

### 3.3. Dashboard (Métricas)
**Objetivo**: Resumen gerencial.

*   **Tarjetas de Estadísticas**:
    *   Total Pacientes Hospitalizados.
    *   Pacientes "Listo para Alta" (para gestión de egreso).
    *   Pacientes con Riesgo "Alto".
*   **Gráfico de Torta**: Distribución por `servicio`.

## 4. Configuración Técnica (NocoBase)

### Colección: `buho_pacientes`

| Campo | Componente UI | Configuración |
| :--- | :--- | :--- |
| `estado_plan` | Select | Opciones: Pendiente (Gris), En Curso (Azul), Listo para Alta (Verde) |
| `riesgo_detectado` | Select | Opciones: Alto (Rojo), Medio (Naranja), Bajo (Verde) |
| `fecha_ingreso` | DatePicker | Formato: YYYY-MM-DD HH:mm |
