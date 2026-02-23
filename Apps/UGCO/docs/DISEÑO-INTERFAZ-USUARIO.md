# Diseño de Interfaz de Usuario (UI/UX) - UGCO

**Objetivo**: Definir la experiencia visual y funcional para los gestores de casos oncológicos en NocoBase.

## 1. Principios de Diseño
- **Claridad Clínica**: La información vital (diagnóstico, etapa, estado) debe ser visible de un vistazo.
- **Navegación Centrada en el Paciente**: Todo gira en torno a la "Ficha del Paciente".
- **Eficiencia**: Minimizar clics para tareas comunes (registrar evento, cambiar estado).

## 2. Estructura de Navegación (Menú Lateral)

| Ítem | Icono | Descripción |
|------|-------|-------------|
| **Dashboard** | 📊 | Vista general de métricas (Casos activos, tiempos de espera). |
| **Mis Pacientes** | 👥 | Lista de pacientes asignados al usuario. |
| **Todos los Casos** | 📂 | Buscador avanzado de casos oncológicos. |
| **Comités** | 📅 | Gestión de reuniones y tablas de decisión. |
| **Configuración** | ⚙️ | Administración de catálogos (solo admin). |

## 3. Vistas Principales

### A. Ventana de Inicio (Dashboard General)
**Objetivo**: Visión global del servicio oncológico.
**Indicadores Clave**:
-   **Resumen por Especialidad**: Tabla/Gráfico con casos activos por comité (Mama, Digestivo, Urología).
-   **Alertas de Gestión**:
    -   🚨 Controles Atrasados.
    -   ⏳ Estudios Pendientes (Laboratorio, Imágenes, Endoscopías) > X días.
    -   📩 Interconsultas sin respuesta.

### B. Ventana de Seguimiento (Por Especialidad)
**Objetivo**: Gestión operativa para cada equipo (ej. Equipo de Mama).
**Filtros Rápidos**: "Mis Pacientes", "Con Estudios Pendientes", "Próximo Control esta semana".
**Tabla de Pacientes**:
-   **Paciente**: Nombre + RUN.
-   **Estado**: Semáforo (🔴 Atrasado, 🟡 Pendiente, 🟢 Al día).
-   **Próximo Control**: Fecha (Destaque si es hoy/mañana).
-   **Pendientes**: Iconos activos si falta:
    -   🩸 Laboratorio
    -   📷 Imágenes (TC, RM)
    -   🔭 Endoscopía
    -   📄 Biopsia
-   **Interconsultas**: Estado de derivaciones.

### C. Ficha del Paciente (Visión Longitudinal)
**Cabecera**: Datos demográficos + Alertas (GES).
**Pestañas**:
1.  **Resumen del Caso**: Diagnóstico, Etapa, Tratamiento Actual.
2.  **Seguimiento y Controles**:
    -   Historial de controles realizados.
    -   **Próximo Control**: Fecha y objetivo.
3.  **Estudios y Procedimientos**:
    -   Lista de solicitudes (Laboratorio, Imágenes, Endoscopías).
    -   Estado: Solicitado / Agendado / Informado.
4.  **Interconsultas**: Derivaciones a otras especialidades.
5.  **Comités**: Historial de presentaciones y resoluciones.

## 4. Interacciones Clave
-   **Crear Caso**: Botón flotante "+" en la vista de Pacientes.
-   **Agendar Comité**: Acción directa desde la ficha del caso.
-   **Cerrar Caso**: Modal de confirmación con motivo de cierre (Fallecimiento, Alta, Traslado).

## 5. Paleta de Colores (Sugerida para NocoBase)
-   **Primario**: Azul Clínico (`#0052CC`) - Para acciones principales.
-   **Alerta**: Rojo Suave (`#FF5630`) - Para retrasos GES o estados críticos.
-   **Éxito**: Verde (`#36B37E`) - Para casos cerrados o tareas completadas.
-   **Fondo**: Gris Neutro (`#F4F5F7`) - Para reducir fatiga visual.

## 6. Configuración Técnica (NocoBase)

### Colección: `ugco_casooncologico`

| Campo | Componente UI | Configuración |
| :--- | :--- | :--- |
| `clinical_status` | Select | Opciones: Activo (Verde), Suspendido (Naranja), Cerrado (Gris) |
| `proximo_control` | DatePicker | Formato: YYYY-MM-DD |
| `diagnostico_cie10` | AssociationSelect | Mostrar: Código + Descripción |

### Colección: `ugco_evento`

| Campo | Componente UI | Configuración |
| :--- | :--- | :--- |
| `tipo_evento` | Select | Opciones: Control, Imagen, Biopsia, Comité |
| `estado` | Select | Opciones: Solicitado, Agendado, Realizado |
