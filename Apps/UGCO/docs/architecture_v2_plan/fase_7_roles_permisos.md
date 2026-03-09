# FASE 7: Roles, Permisos y Seguridad

## 1. Justificación Arquitectónica

En un sistema clínico, los permisos no son un feature opcional sino un **requisito legal y ético**. La enfermera no debería poder editar el TNM. El médico de Tórax no debería ver los datos de la paciente de Mama (salvo que sea Administrador). Y nadie excepto un Registrador debería poder exportar la sábana RHC completa.

---

## 2. Definición de Roles NocoBase

### 2.1 Administrador Clínico UGCO

- **Quién**: Jefe de la Unidad de Gestión del Cáncer
- **Permisos**: CRUD total sobre todas las colecciones `ugco_*`. Gestión de catálogos. Acceso a Dashboard y Exportación RHC.

### 2.2 Médico Oncólogo

- **Quién**: Médicos especialistas asignados a sub-unidades
- **Permisos**:
  - `ugco_pacientes`: Solo lectura
  - `ugco_casos`: Lectura. Edición limitada a campos clínicos (TNM, Etapa, Estado). No puede eliminar.
  - `ugco_eventos`: Crear (registrar hitos clínicos). No puede editar ni eliminar (inmutabilidad).
  - `ugco_comite_presentaciones`: Crear y editar resoluciones.
  - `ugco_tareas`: Solo lectura (ver pero no gestionar tareas logísticas).
  - `ugco_garantias_ges`: Solo lectura.
- **Filtro de Datos (Row-Level)**: Idealmente, solo ve `ugco_casos` donde `especialidad_id` coincide con su sub-unidad asignada.

### 2.3 Enfermera Navegadora

- **Quién**: Enfermeras de la UGCO que gestionan los flujos logísticos
- **Permisos**:
  - `ugco_pacientes`: Lectura + Edición de datos de contacto (teléfono, correo).
  - `ugco_casos`: Solo lectura (no modifica diagnósticos ni TNM).
  - `ugco_eventos`: Crear (registrar contactos de enfermería). No editar ni eliminar.
  - `ugco_tareas`: CRUD completo (crear, actualizar estado, cerrar tareas).
  - `ugco_garantias_ges`: Solo lectura.
  - `ugco_comite_sesiones`: Solo lectura.
- **Dashboard principal**: Inbox de Alertas y Kanban de Tareas.

### 2.4 Registrador RHC

- **Quién**: Personal encargado del reporte al MINSAL
- **Permisos**:
  - `ugco_pacientes` + `ugco_casos` + `ugco_eventos`: Solo lectura.
  - Dashboard: Acceso a la página de Exportación RHC.
  - Puede ejecutar la exportación CSV/Excel.
- **No puede**: Modificar ningún dato clínico ni operativo.

### 2.5 Solo Lectura (Consultas)

- **Quién**: Personal de apoyo, auditores, directivos
- **Permisos**: Solo lectura sobre todas las colecciones. Sin acceso a datos sensibles de contacto del paciente.

---

## 3. Permisos por Campo (Field-Level Security)

| Colección | Campos Restringidos | Quién puede editar |
|-----------|--------------------|--------------------|
| `ugco_casos` | `tnm_t/n/m`, `etapa_clinica`, `clase_tnm` | Solo Médico Oncólogo y Admin |
| `ugco_casos` | `estado_viaje`, `causa_egreso` | Solo Workflows automáticos o Admin |
| `ugco_pacientes` | `rut`, `nombres`, `apellidos` | Solo Admin (datos inmutables) |
| `ugco_pacientes` | `telefono_contacto`, `correo` | Enfermera Navegadora y Admin |
| `ugco_eventos` | Todos (inmutable) | Crear: Médico/Enfermera. Editar/Eliminar: Nadie |
| `ugco_garantias_ges` | Todos | Solo Admin y Workflows |

---

## 4. Seguridad de Datos Clínicos

- **Principio de mínimo privilegio**: Cada rol solo accede a lo estrictamente necesario.
- **Audit Trail**: Todos los cambios quedan registrados via `updated_at` / `updated_by` de NocoBase.
- **Datos sensibles**: RUT y datos de contacto deben estar protegidos. En caso de que NocoBase no soporte encriptación at-rest nativa, documentar como riesgo aceptado.
- **Sin exposición de credenciales**: Las API Keys de NocoBase y las credenciales ODBC de ALMA nunca se commiten al repositorio (están en `.env`).
