# Diccionario de Datos - UGCO
## Unidad de Gestión de Casos Oncológicos

**Versión**: 1.0.0
**Fecha**: 2025-11-21
**Sistema**: NocoBase + ALMA (TrakCare)

---

## ÍNDICE

1. [Introducción](#1-introducción)
2. [Convenciones](#2-convenciones)
3. [Colecciones ALMA (Read-Only)](#3-colecciones-alma-read-only)
4. [Colecciones UGCO (Read/Write)](#4-colecciones-ugco-readwrite)
5. [Tipos de Datos](#5-tipos-de-datos)
6. [Valores de Dominio](#6-valores-de-dominio)
7. [Índices y Restricciones](#7-índices-y-restricciones)
8. [Relaciones](#8-relaciones)

---

## 1. INTRODUCCIÓN

Este diccionario describe **todas las colecciones (tablas), campos, tipos de datos y relaciones** del sistema UGCO en NocoBase.

### 1.1 Propósito
- Documentar la estructura completa de datos
- Servir como referencia para desarrollo y mantenimiento
- Facilitar la integración con otros sistemas
- Asegurar consistencia en implementación

### 1.2 Alcance
- **Colecciones ALMA**: Espejo read-only de datos de TrakCare
- **Colecciones UGCO**: Datos propios de la aplicación oncológica

---

## 2. CONVENCIONES

### 2.1 Nomenclatura

#### 2.1.1 Colecciones
- **Prefijo `alma_`**: Colecciones espejo de ALMA (read-only)
- **Prefijo `onco_`**: Colecciones propias de oncología (read/write)
- **Formato**: `snake_case` (minúsculas con guiones bajos)

**Ejemplos**:
- `alma_pacientes`
- `onco_casos`
- `onco_caso_especialidades`

#### 2.1.2 Campos
- **Formato**: `snake_case` (minúsculas con guiones bajos)
- **Claves primarias**: `id`
- **Claves foráneas**: `id_<tabla>` (ej: `id_paciente`, `id_caso`)
- **Flags booleanos**: Usar adjetivos o `es_*`, `tiene_*` (ej: `activo`, `es_principal`)
- **Timestamps**: `created_at`, `updated_at`, `deleted_at`
- **Auditoría**: `created_by`, `updated_by`, `deleted_by`

**Ejemplos**:
- `id_paciente_alma`
- `fecha_ingreso_ugco`
- `es_principal`
- `created_at`

#### 2.1.3 Relaciones
- **1:N (uno a muchos)**: Campo FK en tabla "muchos"
- **N:N (muchos a muchos)**: Tabla intermedia con sufijo descriptivo
  - Formato: `<tabla1>_<tabla2>` (ej: `onco_caso_especialidades`)

### 2.2 Tipos de Datos Estándar

| Tipo NocoBase | Descripción | Ejemplos |
|---------------|-------------|----------|
| `integer` | Número entero | IDs, edades, contadores |
| `bigInteger` | Número entero grande | IDs de sistemas externos |
| `string` | Texto corto (≤255 caracteres) | Nombres, códigos, RUT |
| `text` | Texto largo | Descripciones, observaciones |
| `boolean` | Verdadero/Falso | activo, es_principal |
| `date` | Fecha (sin hora) | fecha_nacimiento, fecha_ingreso |
| `datetime` | Fecha y hora | created_at, fecha_sesion |
| `time` | Hora (sin fecha) | hora_inicio, hora_fin |
| `decimal` | Número decimal | precios, mediciones |
| `json` | Objeto JSON | configuraciones, metadatos |
| `belongsTo` | Relación N:1 | FK a otra colección |
| `hasMany` | Relación 1:N | Colección relacionada |
| `belongsToMany` | Relación N:N | Tabla intermedia |

---

## 3. COLECCIONES ALMA (READ-ONLY)

Estas colecciones son **vistas o tablas espejo** del SQL intermedio conectado desde ALMA (TrakCare). **NO se modifican desde UGCO**.

### 3.1 `alma_pacientes`

**Descripción**: Datos demográficos oficiales de pacientes desde ALMA.

**Nombre de Colección**: `alma_pacientes`

**Tipo de Acceso**: **Read-Only** (Solo lectura)

| Campo | Tipo | Nulo | Descripción | Comentarios |
|-------|------|------|-------------|-------------|
| `id` | `bigInteger` | No | Clave primaria (ID ALMA) | PK, autoincremental en ALMA |
| `rut` | `string(20)` | No | RUT del paciente | Formato: 12345678-9, Único |
| `nombre` | `string(100)` | No | Nombre completo del paciente | - |
| `fecha_nacimiento` | `date` | Sí | Fecha de nacimiento | - |
| `edad` | `integer` | Sí | Edad calculada (años) | Calculado en ALMA |
| `sexo` | `string(1)` | Sí | Sexo del paciente | M/F/O (Masculino/Femenino/Otro) |
| `direccion` | `text` | Sí | Dirección completa | - |
| `comuna` | `string(100)` | Sí | Comuna de residencia | - |
| `region` | `string(100)` | Sí | Región de residencia | - |
| `telefono` | `string(20)` | Sí | Teléfono de contacto | - |
| `telefono_2` | `string(20)` | Sí | Teléfono alternativo | - |
| `email` | `string(255)` | Sí | Correo electrónico | - |
| `prevision` | `string(100)` | Sí | Previsión de salud | FONASA/ISAPRE/CAPREDENA/etc. |
| `created_at` | `datetime` | Sí | Fecha de creación en ALMA | - |
| `updated_at` | `datetime` | Sí | Última actualización en ALMA | - |

**Índices**:
- PK: `id`
- Unique: `rut`
- Index: `nombre`, `fecha_nacimiento`

---

### 3.2 `alma_episodios`

**Descripción**: Episodios clínicos (ingresos, consultas, procedimientos) desde ALMA.

**Nombre de Colección**: `alma_episodios`

**Tipo de Acceso**: **Read-Only**

| Campo | Tipo | Nulo | Descripción | Comentarios |
|-------|------|------|-------------|-------------|
| `id` | `bigInteger` | No | Clave primaria (ID ALMA) | PK, autoincremental en ALMA |
| `id_paciente` | `bigInteger` | No | FK a alma_pacientes.id | - |
| `numero_episodio` | `string(50)` | Sí | Número de episodio en ALMA | - |
| `tipo_episodio` | `string(100)` | Sí | Tipo de episodio | Hospitalización/Consulta/Procedimiento/Urgencia |
| `fecha_inicio` | `datetime` | Sí | Fecha y hora de inicio | - |
| `fecha_fin` | `datetime` | Sí | Fecha y hora de fin | NULL si episodio activo |
| `servicio` | `string(100)` | Sí | Servicio clínico | Ej: Medicina Interna, Cirugía |
| `especialidad` | `string(100)` | Sí | Especialidad médica | - |
| `medico_responsable` | `string(200)` | Sí | Nombre del médico responsable | - |
| `estado` | `string(50)` | Sí | Estado del episodio | Activo/Cerrado/Anulado |
| `motivo_consulta` | `text` | Sí | Motivo de consulta/ingreso | - |
| `diagnostico_egreso` | `text` | Sí | Diagnóstico de egreso | - |
| `created_at` | `datetime` | Sí | Fecha de creación en ALMA | - |
| `updated_at` | `datetime` | Sí | Última actualización en ALMA | - |

**Índices**:
- PK: `id`
- FK: `id_paciente` -> `alma_pacientes.id`
- Index: `fecha_inicio`, `estado`, `tipo_episodio`

---

### 3.3 `alma_diagnosticos`

**Descripción**: Diagnósticos clínicos oficiales (CIE-10) desde ALMA.

**Nombre de Colección**: `alma_diagnosticos`

**Tipo de Acceso**: **Read-Only**

| Campo | Tipo | Nulo | Descripción | Comentarios |
|-------|------|------|-------------|-------------|
| `id` | `bigInteger` | No | Clave primaria (ID ALMA) | PK, autoincremental en ALMA |
| `id_episodio` | `bigInteger` | No | FK a alma_episodios.id | - |
| `id_paciente` | `bigInteger` | No | FK a alma_pacientes.id | - |
| `codigo_cie10` | `string(10)` | Sí | Código CIE-10 | Ej: C16.9, C18.0 |
| `descripcion` | `text` | Sí | Descripción del diagnóstico | - |
| `tipo` | `string(50)` | Sí | Tipo de diagnóstico | Principal/Secundario/Complicación |
| `fecha_diagnostico` | `datetime` | Sí | Fecha del diagnóstico | - |
| `medico` | `string(200)` | Sí | Médico que realiza el diagnóstico | - |
| `confirmado` | `boolean` | Sí | Diagnóstico confirmado | true/false |
| `created_at` | `datetime` | Sí | Fecha de creación en ALMA | - |
| `updated_at` | `datetime` | Sí | Última actualización en ALMA | - |

**Índices**:
- PK: `id`
- FK: `id_episodio` -> `alma_episodios.id`
- FK: `id_paciente` -> `alma_pacientes.id`
- Index: `codigo_cie10`, `fecha_diagnostico`, `tipo`

---

## 4. COLECCIONES UGCO (READ/WRITE)

Estas colecciones son **propias de la aplicación UGCO** y se crean en el esquema de NocoBase con permisos completos de CRUD según rol.

### 4.1 `onco_especialidades`

**Descripción**: Catálogo maestro de especialidades oncológicas.

**Nombre de Colección**: `onco_especialidades`

**Tipo de Acceso**: **Read/Write** (Admin: CRUD, Usuarios: Read)

| Campo | Tipo | Nulo | Default | Descripción | Comentarios |
|-------|------|------|---------|-------------|-------------|
| `id` | `integer` | No | autoincrement | Clave primaria | PK |
| `nombre` | `string(100)` | No | - | Nombre de la especialidad | Ej: "Digestivo alto" |
| `descripcion` | `text` | Sí | null | Descripción detallada | - |
| `codigo` | `string(20)` | No | - | Código interno único | Ej: "DIG-ALTO" |
| `color` | `string(7)` | Sí | '#6B7280' | Color en formato hexadecimal | Para UI, ej: #FF5733 |
| `icono` | `string(50)` | Sí | null | Nombre del icono (font-awesome) | Ej: "fa-stomach" |
| `orden` | `integer` | Sí | 0 | Orden de presentación en UI | Para ordenamiento |
| `activo` | `boolean` | No | true | Especialidad activa | true/false |
| `created_at` | `datetime` | No | NOW() | Fecha de creación | Automático |
| `updated_at` | `datetime` | No | NOW() | Última actualización | Automático |
| `created_by` | `integer` | Sí | - | Usuario creador | FK -> users.id |
| `updated_by` | `integer` | Sí | - | Usuario que actualizó | FK -> users.id |

**Índices**:
- PK: `id`
- Unique: `codigo`
- Index: `activo`, `orden`

**Restricciones**:
- `codigo`: Must be uppercase, alphanumeric + dash
- `color`: Must be valid hex color (#RRGGBB)

**Valores Iniciales** (seed data):
```sql
INSERT INTO onco_especialidades (nombre, codigo, color, orden) VALUES
  ('Digestivo alto', 'DIG-ALTO', '#3B82F6', 1),
  ('Digestivo bajo', 'DIG-BAJO', '#10B981', 2),
  ('Mama', 'MAMA', '#EC4899', 3),
  ('Ginecológico', 'GINE', '#8B5CF6', 4),
  ('Urológico', 'URO', '#F59E0B', 5),
  ('Pulmón', 'PULMON', '#6366F1', 6),
  ('Cabeza y cuello', 'CABEZA', '#EF4444', 7),
  ('Hematología', 'HEMATO', '#14B8A6', 8),
  ('Melanoma y piel', 'PIEL', '#F97316', 9),
  ('Otros tumores sólidos', 'OTROS', '#6B7280', 10);
```

---

### 4.2 `onco_casos`

**Descripción**: **Casos oncológicos principales. Entidad central de UGCO.**

**Nombre de Colección**: `onco_casos`

**Tipo de Acceso**: **Read/Write** (Según permisos por rol)

| Campo | Tipo | Nulo | Default | Descripción | Comentarios |
|-------|------|------|---------|-------------|-------------|
| **IDENTIFICACIÓN** | | | | | |
| `id` | `integer` | No | autoincrement | Clave primaria | PK |
| `codigo_caso` | `string(50)` | No | - | Código único del caso | Ej: "UGCO-2024-001", Único |
| **REFERENCIAS A ALMA** | | | | | |
| `id_paciente_alma` | `bigInteger` | No | - | FK a alma_pacientes.id | **REQUERIDO** |
| `id_episodio_indice` | `bigInteger` | Sí | null | FK a alma_episodios.id | Episodio índice (opcional) |
| `id_diagnostico_indice` | `bigInteger` | Sí | null | FK a alma_diagnosticos.id | Diagnóstico índice (opcional) |
| **DATOS DEL CASO** | | | | | |
| `fecha_ingreso_ugco` | `date` | No | - | Fecha de ingreso a UGCO | **REQUERIDO** |
| `fecha_alta_ugco` | `date` | Sí | null | Fecha de alta de UGCO | NULL si caso activo |
| `estado` | `string(50)` | No | 'Activo' | Estado del caso | Ver [Dominio: estado_caso](#estado_caso) |
| `subestado` | `string(100)` | Sí | null | Subestado específico | Ej: "En quimioterapia" |
| **INFORMACIÓN ONCOLÓGICA** | | | | | |
| `tipo_tumor` | `string(200)` | Sí | null | Clasificación del tumor | Ej: "Adenocarcinoma gástrico" |
| `localizacion_primaria` | `string(200)` | Sí | null | Localización del tumor primario | - |
| `estadio_inicial` | `string(50)` | Sí | null | Estadio TNM inicial | Ej: "T3N1M0 - Estadio IIIA" |
| `estadio_actual` | `string(50)` | Sí | null | Estadio TNM actual | Se actualiza con evolución |
| `histologia` | `text` | Sí | null | Tipo histológico | Descripción patológica |
| `grado_diferenciacion` | `string(50)` | Sí | null | Grado de diferenciación | Bien/Moderadamente/Pobremente diferenciado |
| `biomarcadores` | `json` | Sí | null | Biomarcadores moleculares | Ej: {"HER2": "positivo", "PD-L1": "50%"} |
| **EQUIPO RESPONSABLE** | | | | | |
| `medico_tratante` | `integer` | Sí | null | FK a users.id | Médico oncólogo responsable |
| `enfermera_gestora` | `integer` | Sí | null | FK a users.id | Enfermera gestora del caso |
| `equipo_multidisciplinario` | `json` | Sí | null | Array de IDs de equipo | Ej: [12, 45, 67] |
| **TRATAMIENTO** | | | | | |
| `plan_tratamiento` | `text` | Sí | null | Plan de tratamiento actual | Descripción general |
| `protocolo` | `string(200)` | Sí | null | Protocolo oncológico aplicado | - |
| `fecha_inicio_tratamiento` | `date` | Sí | null | Fecha de inicio de tratamiento | - |
| `intencion_tratamiento` | `string(50)` | Sí | null | Intención del tratamiento | Curativo/Paliativo/Sintomático |
| **METADATA** | | | | | |
| `observaciones` | `text` | Sí | null | Notas generales del caso | - |
| `prioridad` | `string(20)` | Sí | 'Normal' | Prioridad del caso | Baja/Normal/Alta/Urgente |
| `alerta` | `text` | Sí | null | Alertas importantes | Ej: "Alergia a platino" |
| `activo` | `boolean` | No | true | Caso activo | true/false |
| **AUDITORÍA** | | | | | |
| `created_at` | `datetime` | No | NOW() | Fecha de creación | Automático |
| `updated_at` | `datetime` | No | NOW() | Última actualización | Automático |
| `created_by` | `integer` | Sí | - | Usuario creador | FK -> users.id |
| `updated_by` | `integer` | Sí | - | Usuario que actualizó | FK -> users.id |
| `deleted_at` | `datetime` | Sí | null | Fecha de borrado lógico | Soft delete |
| `deleted_by` | `integer` | Sí | null | Usuario que eliminó | FK -> users.id |

**Índices**:
- PK: `id`
- Unique: `codigo_caso`
- FK: `id_paciente_alma` -> `alma_pacientes.id`
- FK: `id_episodio_indice` -> `alma_episodios.id`
- FK: `id_diagnostico_indice` -> `alma_diagnosticos.id`
- FK: `medico_tratante` -> `users.id`
- FK: `enfermera_gestora` -> `users.id`
- Index: `estado`, `fecha_ingreso_ugco`, `activo`

**Restricciones**:
- `codigo_caso`: Generado automáticamente, formato: `UGCO-YYYY-NNN`
- `fecha_alta_ugco >= fecha_ingreso_ugco`

**Relaciones**:
- `belongsTo` alma_pacientes (via `id_paciente_alma`)
- `belongsTo` alma_episodios (via `id_episodio_indice`)
- `belongsTo` alma_diagnosticos (via `id_diagnostico_indice`)
- `belongsToMany` onco_especialidades (via `onco_caso_especialidades`)
- `hasMany` onco_episodios
- `hasMany` onco_seguimiento_eventos
- `hasMany` onco_comite_casos

---

### 4.3 `onco_caso_especialidades`

**Descripción**: Relación N:N entre casos y especialidades oncológicas.

**Nombre de Colección**: `onco_caso_especialidades`

**Tipo de Acceso**: **Read/Write**

| Campo | Tipo | Nulo | Default | Descripción | Comentarios |
|-------|------|------|---------|-------------|-------------|
| `id` | `integer` | No | autoincrement | Clave primaria | PK |
| `id_caso` | `integer` | No | - | FK a onco_casos.id | **REQUERIDO** |
| `id_especialidad` | `integer` | No | - | FK a onco_especialidades.id | **REQUERIDO** |
| `es_principal` | `boolean` | No | false | Especialidad principal del caso | Solo una puede ser true por caso |
| `fecha_asignacion` | `date` | No | CURRENT_DATE | Fecha de asignación | - |
| `motivo` | `text` | Sí | null | Motivo de asignación | - |
| `activo` | `boolean` | No | true | Asignación activa | true/false |
| `created_at` | `datetime` | No | NOW() | Fecha de creación | Automático |
| `updated_at` | `datetime` | No | NOW() | Última actualización | Automático |
| `created_by` | `integer` | Sí | - | Usuario creador | FK -> users.id |
| `updated_by` | `integer` | Sí | - | Usuario que actualizó | FK -> users.id |

**Índices**:
- PK: `id`
- Unique: (`id_caso`, `id_especialidad`)
- FK: `id_caso` -> `onco_casos.id`
- FK: `id_especialidad` -> `onco_especialidades.id`
- Index: `activo`, `es_principal`

**Restricciones**:
- Solo puede haber **un registro con `es_principal = true`** por `id_caso`
- Al crear el primer registro para un caso, `es_principal` debe ser `true`

---

### 4.4 `onco_episodios`

**Descripción**: Episodios oncológicos específicos (cirugías, quimioterapias, radioterapias, etc.).

**Nombre de Colección**: `onco_episodios`

**Tipo de Acceso**: **Read/Write**

| Campo | Tipo | Nulo | Default | Descripción | Comentarios |
|-------|------|------|---------|-------------|-------------|
| `id` | `integer` | No | autoincrement | Clave primaria | PK |
| `id_caso` | `integer` | No | - | FK a onco_casos.id | **REQUERIDO** |
| `id_especialidad` | `integer` | Sí | null | FK a onco_especialidades.id | - |
| `tipo_episodio` | `string(100)` | No | - | Tipo de episodio | Ver [Dominio: tipo_episodio](#tipo_episodio) |
| `subtipo` | `string(100)` | Sí | null | Subtipo específico | Ej: "Lobectomía", "FOLFOX" |
| `fecha_inicio` | `datetime` | No | - | Fecha y hora de inicio | **REQUERIDO** |
| `fecha_fin` | `datetime` | Sí | null | Fecha y hora de fin | NULL si en curso |
| `duracion_estimada` | `integer` | Sí | null | Duración estimada (días) | - |
| `descripcion` | `text` | Sí | null | Descripción detallada | - |
| `objetivo` | `text` | Sí | null | Objetivo del episodio | - |
| `resultado` | `text` | Sí | null | Resultado del episodio | - |
| `complicaciones` | `text` | Sí | null | Complicaciones presentadas | - |
| `profesional_responsable` | `integer` | Sí | null | FK a users.id | - |
| `lugar` | `string(200)` | Sí | null | Lugar donde se realizó | Ej: "Pabellón 2", "Hospital Ovalle" |
| `id_episodio_alma` | `bigInteger` | Sí | null | FK a alma_episodios.id | Si corresponde a episodio en ALMA |
| `estado` | `string(50)` | No | 'Planificado' | Estado del episodio | Ver [Dominio: estado_episodio](#estado_episodio) |
| `activo` | `boolean` | No | true | Episodio activo | true/false |
| `created_at` | `datetime` | No | NOW() | Fecha de creación | Automático |
| `updated_at` | `datetime` | No | NOW() | Última actualización | Automático |
| `created_by` | `integer` | Sí | - | Usuario creador | FK -> users.id |
| `updated_by` | `integer` | Sí | - | Usuario que actualizó | FK -> users.id |

**Índices**:
- PK: `id`
- FK: `id_caso` -> `onco_casos.id`
- FK: `id_especialidad` -> `onco_especialidades.id`
- FK: `profesional_responsable` -> `users.id`
- FK: `id_episodio_alma` -> `alma_episodios.id`
- Index: `tipo_episodio`, `fecha_inicio`, `estado`

---

### 4.5 `onco_comite_sesiones`

**Descripción**: Sesiones del comité oncológico.

**Nombre de Colección**: `onco_comite_sesiones`

**Tipo de Acceso**: **Read/Write**

| Campo | Tipo | Nulo | Default | Descripción | Comentarios |
|-------|------|------|---------|-------------|-------------|
| `id` | `integer` | No | autoincrement | Clave primaria | PK |
| `codigo_sesion` | `string(50)` | No | - | Código único de la sesión | Ej: "COM-2024-05-15", Único |
| `fecha_sesion` | `datetime` | No | - | Fecha y hora de la sesión | **REQUERIDO** |
| `tipo_comite` | `string(50)` | No | 'Regular' | Tipo de comité | Ver [Dominio: tipo_comite](#tipo_comite) |
| `modalidad` | `string(50)` | Sí | 'Presencial' | Modalidad de la sesión | Presencial/Virtual/Híbrida |
| `lugar` | `string(200)` | Sí | null | Lugar de la sesión | Ej: "Sala de Reuniones 3" |
| `link_reunion` | `string(500)` | Sí | null | Link de reunión virtual | URL Zoom/Teams |
| `moderador` | `integer` | Sí | null | FK a users.id | Moderador de la sesión |
| `secretario` | `integer` | Sí | null | FK a users.id | Secretario que toma acta |
| `asistentes` | `json` | Sí | null | Array de IDs de asistentes | Ej: [12, 45, 67, 89] |
| `invitados` | `json` | Sí | null | Array de invitados externos | Ej: [{"nombre": "Dr. X", "rol": "..."}] |
| `hora_inicio` | `time` | Sí | null | Hora de inicio real | - |
| `hora_fin` | `time` | Sí | null | Hora de fin real | - |
| `estado` | `string(50)` | No | 'Programada' | Estado de la sesión | Ver [Dominio: estado_sesion](#estado_sesion) |
| `acta` | `text` | Sí | null | Acta de la sesión | - |
| `resumen_ejecutivo` | `text` | Sí | null | Resumen ejecutivo | - |
| `acuerdos` | `json` | Sí | null | Array de acuerdos | Ej: [{"acuerdo": "...", "responsable": 12}] |
| `proxima_sesion` | `datetime` | Sí | null | Fecha de próxima sesión | - |
| `activo` | `boolean` | No | true | Sesión activa | true/false |
| `created_at` | `datetime` | No | NOW() | Fecha de creación | Automático |
| `updated_at` | `datetime` | No | NOW() | Última actualización | Automático |
| `created_by` | `integer` | Sí | - | Usuario creador | FK -> users.id |
| `updated_by` | `integer` | Sí | - | Usuario que actualizó | FK -> users.id |

**Índices**:
- PK: `id`
- Unique: `codigo_sesion`
- FK: `moderador` -> `users.id`
- FK: `secretario` -> `users.id`
- Index: `fecha_sesion`, `estado`, `tipo_comite`

---

### 4.6 `onco_comite_casos`

**Descripción**: Casos discutidos en cada sesión del comité.

**Nombre de Colección**: `onco_comite_casos`

**Tipo de Acceso**: **Read/Write**

| Campo | Tipo | Nulo | Default | Descripción | Comentarios |
|-------|------|------|---------|-------------|-------------|
| `id` | `integer` | No | autoincrement | Clave primaria | PK |
| `id_sesion` | `integer` | No | - | FK a onco_comite_sesiones.id | **REQUERIDO** |
| `id_caso` | `integer` | No | - | FK a onco_casos.id | **REQUERIDO** |
| `orden` | `integer` | Sí | 0 | Orden de presentación | Para ordenar en agenda |
| `presentador` | `integer` | Sí | null | FK a users.id | Profesional que presenta |
| `motivo_presentacion` | `text` | Sí | null | Por qué se presenta el caso | - |
| `resumen_presentacion` | `text` | Sí | null | Resumen de lo discutido | - |
| `decision` | `text` | Sí | null | Decisión del comité | - |
| `recomendaciones` | `text` | Sí | null | Recomendaciones específicas | - |
| `derivaciones` | `json` | Sí | null | Derivaciones a otros servicios | Ej: [{"servicio": "Cirugía", "motivo": "..."}] |
| `tiempo_presentacion` | `integer` | Sí | null | Tiempo de presentación (minutos) | - |
| `estado` | `string(50)` | No | 'Pendiente' | Estado del caso en comité | Ver [Dominio: estado_caso_comite](#estado_caso_comite) |
| `seguimiento_requerido` | `boolean` | Sí | false | Requiere seguimiento en próxima sesión | true/false |
| `activo` | `boolean` | No | true | Registro activo | true/false |
| `created_at` | `datetime` | No | NOW() | Fecha de creación | Automático |
| `updated_at` | `datetime` | No | NOW() | Última actualización | Automático |
| `created_by` | `integer` | Sí | - | Usuario creador | FK -> users.id |
| `updated_by` | `integer` | Sí | - | Usuario que actualizó | FK -> users.id |

**Índices**:
- PK: `id`
- FK: `id_sesion` -> `onco_comite_sesiones.id`
- FK: `id_caso` -> `onco_casos.id`
- FK: `presentador` -> `users.id`
- Index: `orden`, `estado`

---

### 4.7 `onco_seguimiento_eventos`

**Descripción**: Eventos de seguimiento por especialidad.

**Nombre de Colección**: `onco_seguimiento_eventos`

**Tipo de Acceso**: **Read/Write**

| Campo | Tipo | Nulo | Default | Descripción | Comentarios |
|-------|------|------|---------|-------------|-------------|
| `id` | `integer` | No | autoincrement | Clave primaria | PK |
| `id_caso` | `integer` | No | - | FK a onco_casos.id | **REQUERIDO** |
| `id_especialidad` | `integer` | Sí | null | FK a onco_especialidades.id | - |
| `tipo_evento` | `string(100)` | No | - | Tipo de evento | Ver [Dominio: tipo_evento](#tipo_evento) |
| `subtipo` | `string(100)` | Sí | null | Subtipo específico | - |
| `fecha_evento` | `datetime` | No | - | Fecha y hora del evento | **REQUERIDO** |
| `titulo` | `string(200)` | Sí | null | Título breve del evento | - |
| `descripcion` | `text` | Sí | null | Descripción detallada | - |
| `resultado` | `text` | Sí | null | Resultado o hallazgo | - |
| `conducta` | `text` | Sí | null | Conducta a seguir | - |
| `cambio_tratamiento` | `boolean` | Sí | false | Implica cambio de tratamiento | true/false |
| `detalle_cambio` | `text` | Sí | null | Detalle del cambio de tratamiento | - |
| `proximo_control` | `date` | Sí | null | Fecha del próximo control | - |
| `profesional` | `integer` | Sí | null | FK a users.id | Profesional que registra |
| `adjuntos` | `json` | Sí | null | Array de archivos adjuntos | Ej: [{"nombre": "...", "url": "..."}] |
| `activo` | `boolean` | No | true | Evento activo | true/false |
| `created_at` | `datetime` | No | NOW() | Fecha de creación | Automático |
| `updated_at` | `datetime` | No | NOW() | Última actualización | Automático |
| `created_by` | `integer` | Sí | - | Usuario creador | FK -> users.id |
| `updated_by` | `integer` | Sí | - | Usuario que actualizó | FK -> users.id |

**Índices**:
- PK: `id`
- FK: `id_caso` -> `onco_casos.id`
- FK: `id_especialidad` -> `onco_especialidades.id`
- FK: `profesional` -> `users.id`
- Index: `tipo_evento`, `fecha_evento`, `activo`

---

## 5. TIPOS DE DATOS

### 5.1 Tipos Primitivos

| Tipo NocoBase | SQL Equivalente | Tamaño | Rango | Uso |
|---------------|-----------------|--------|-------|-----|
| `integer` | INTEGER | 4 bytes | -2,147,483,648 a 2,147,483,647 | IDs, contadores |
| `bigInteger` | BIGINT | 8 bytes | -9,223,372,036,854,775,808 a 9,223,372,036,854,775,807 | IDs grandes, IDs ALMA |
| `string(n)` | VARCHAR(n) | n caracteres | 1 a 255 caracteres | Textos cortos |
| `text` | TEXT | Variable | Hasta 65,535 caracteres | Textos largos |
| `boolean` | BOOLEAN | 1 byte | true/false | Flags |
| `date` | DATE | 3 bytes | 1000-01-01 a 9999-12-31 | Fechas sin hora |
| `datetime` | DATETIME | 8 bytes | 1000-01-01 00:00:00 a 9999-12-31 23:59:59 | Fechas con hora |
| `time` | TIME | 3 bytes | 00:00:00 a 23:59:59 | Horas |
| `decimal(p,s)` | DECIMAL(p,s) | Variable | Precisión p, escala s | Números decimales exactos |
| `json` | JSON | Variable | - | Objetos JSON |

### 5.2 Tipos Especiales NocoBase

| Tipo | Descripción | Uso en UGCO |
|------|-------------|-------------|
| `belongsTo` | Relación N:1 | FK a otra colección |
| `hasMany` | Relación 1:N | Colección relacionada inversa |
| `belongsToMany` | Relación N:N | Tabla intermedia |
| `attachment` | Archivo adjunto | Documentos, imágenes |
| `richText` | Texto enriquecido (HTML) | Actas, informes |
| `uuid` | Identificador UUID | IDs universales |

---

## 6. VALORES DE DOMINIO

### 6.1 `estado_caso`
**Colección**: `onco_casos.estado`

| Valor | Descripción | Flujo |
|-------|-------------|-------|
| `Activo` | Caso en seguimiento activo | Estado inicial |
| `Seguimiento` | En seguimiento periódico | Después de tratamiento |
| `Alta` | Dado de alta de UGCO | Estado final |
| `Fallecido` | Paciente fallecido | Estado final |
| `Perdido` | Perdido en seguimiento | Estado final |
| `Derivado` | Derivado a otro centro | Estado final |
| `Suspendido` | Seguimiento suspendido temporalmente | Temporal |

### 6.2 `tipo_episodio`
**Colección**: `onco_episodios.tipo_episodio`

| Valor | Descripción | Ejemplo |
|-------|-------------|---------|
| `Cirugía` | Procedimiento quirúrgico | Gastrectomía, Mastectomía |
| `Quimioterapia` | Tratamiento con quimioterapia | FOLFOX, AC-T |
| `Radioterapia` | Tratamiento con radiación | RT neoadyuvante |
| `Inmunoterapia` | Tratamiento con inmunoterapia | Pembrolizumab |
| `Terapia dirigida` | Terapia molecular dirigida | Trastuzumab |
| `Hospitalización` | Ingreso hospitalario | Complicación, cuidados paliativos |
| `Consulta` | Consulta ambulatoria | Consulta de seguimiento |
| `Procedimiento` | Procedimiento diagnóstico/terapéutico | Biopsia, endoscopía |
| `Cuidados paliativos` | Cuidados paliativos | - |
| `Otro` | Otro tipo de episodio | - |

### 6.3 `estado_episodio`
**Colección**: `onco_episodios.estado`

| Valor | Descripción |
|-------|-------------|
| `Planificado` | Episodio planificado, no iniciado |
| `En curso` | Episodio en curso |
| `Completado` | Episodio completado exitosamente |
| `Suspendido` | Episodio suspendido temporalmente |
| `Cancelado` | Episodio cancelado |
| `Complicado` | Episodio con complicaciones |

### 6.4 `tipo_comite`
**Colección**: `onco_comite_sesiones.tipo_comite`

| Valor | Descripción |
|-------|-------------|
| `Regular` | Sesión regular semanal/quincenal |
| `Extraordinario` | Sesión extraordinaria |
| `Urgente` | Sesión urgente para casos críticos |
| `Multidisciplinario` | Comité multidisciplinario ampliado |

### 6.5 `estado_sesion`
**Colección**: `onco_comite_sesiones.estado`

| Valor | Descripción |
|-------|-------------|
| `Programada` | Sesión programada, no iniciada |
| `En curso` | Sesión en curso |
| `Finalizada` | Sesión finalizada |
| `Cancelada` | Sesión cancelada |
| `Pospuesta` | Sesión pospuesta |

### 6.6 `estado_caso_comite`
**Colección**: `onco_comite_casos.estado`

| Valor | Descripción |
|-------|-------------|
| `Pendiente` | Caso pendiente de presentación |
| `Presentado` | Caso presentado en sesión |
| `Diferido` | Presentación diferida para próxima sesión |
| `Derivado` | Caso derivado a otro comité/servicio |
| `Resuelto` | Caso resuelto por el comité |

### 6.7 `tipo_evento`
**Colección**: `onco_seguimiento_eventos.tipo_evento`

| Valor | Descripción |
|-------|-------------|
| `Consulta` | Consulta de seguimiento |
| `Examen` | Solicitud/realización de examen |
| `Resultado` | Resultado de examen/estudio |
| `Complicación` | Complicación presentada |
| `Nota` | Nota general de seguimiento |
| `Cambio de tratamiento` | Cambio en el plan de tratamiento |
| `Contacto telefónico` | Contacto telefónico con paciente |
| `Evaluación` | Evaluación de respuesta al tratamiento |
| `Otro` | Otro tipo de evento |

---

## 7. ÍNDICES Y RESTRICCIONES

### 7.1 Índices por Colección

#### `alma_pacientes`
```sql
PRIMARY KEY (id)
UNIQUE INDEX idx_rut (rut)
INDEX idx_nombre (nombre)
INDEX idx_fecha_nacimiento (fecha_nacimiento)
```

#### `alma_episodios`
```sql
PRIMARY KEY (id)
FOREIGN KEY (id_paciente) REFERENCES alma_pacientes(id)
INDEX idx_fecha_inicio (fecha_inicio)
INDEX idx_estado (estado)
INDEX idx_tipo (tipo_episodio)
```

#### `alma_diagnosticos`
```sql
PRIMARY KEY (id)
FOREIGN KEY (id_episodio) REFERENCES alma_episodios(id)
FOREIGN KEY (id_paciente) REFERENCES alma_pacientes(id)
INDEX idx_codigo_cie10 (codigo_cie10)
INDEX idx_fecha (fecha_diagnostico)
```

#### `onco_especialidades`
```sql
PRIMARY KEY (id)
UNIQUE INDEX idx_codigo (codigo)
INDEX idx_activo (activo)
INDEX idx_orden (orden)
```

#### `onco_casos`
```sql
PRIMARY KEY (id)
UNIQUE INDEX idx_codigo_caso (codigo_caso)
FOREIGN KEY (id_paciente_alma) REFERENCES alma_pacientes(id)
FOREIGN KEY (id_episodio_indice) REFERENCES alma_episodios(id)
FOREIGN KEY (id_diagnostico_indice) REFERENCES alma_diagnosticos(id)
INDEX idx_estado (estado)
INDEX idx_fecha_ingreso (fecha_ingreso_ugco)
INDEX idx_activo (activo)
FULLTEXT INDEX idx_busqueda (tipo_tumor, localizacion_primaria, observaciones)
```

#### `onco_caso_especialidades`
```sql
PRIMARY KEY (id)
UNIQUE INDEX idx_caso_especialidad (id_caso, id_especialidad)
FOREIGN KEY (id_caso) REFERENCES onco_casos(id) ON DELETE CASCADE
FOREIGN KEY (id_especialidad) REFERENCES onco_especialidades(id)
INDEX idx_principal (es_principal)
```

#### `onco_episodios`
```sql
PRIMARY KEY (id)
FOREIGN KEY (id_caso) REFERENCES onco_casos(id) ON DELETE CASCADE
FOREIGN KEY (id_especialidad) REFERENCES onco_especialidades(id)
INDEX idx_tipo (tipo_episodio)
INDEX idx_fecha (fecha_inicio)
INDEX idx_estado (estado)
```

#### `onco_comite_sesiones`
```sql
PRIMARY KEY (id)
UNIQUE INDEX idx_codigo_sesion (codigo_sesion)
INDEX idx_fecha (fecha_sesion)
INDEX idx_estado (estado)
```

#### `onco_comite_casos`
```sql
PRIMARY KEY (id)
FOREIGN KEY (id_sesion) REFERENCES onco_comite_sesiones(id) ON DELETE CASCADE
FOREIGN KEY (id_caso) REFERENCES onco_casos(id)
INDEX idx_orden (orden)
INDEX idx_estado (estado)
```

#### `onco_seguimiento_eventos`
```sql
PRIMARY KEY (id)
FOREIGN KEY (id_caso) REFERENCES onco_casos(id) ON DELETE CASCADE
FOREIGN KEY (id_especialidad) REFERENCES onco_especialidades(id)
INDEX idx_tipo (tipo_evento)
INDEX idx_fecha (fecha_evento)
INDEX idx_activo (activo)
```

### 7.2 Restricciones de Integridad

#### Restricciones de unicidad
- `alma_pacientes.rut`: UNIQUE
- `onco_especialidades.codigo`: UNIQUE
- `onco_casos.codigo_caso`: UNIQUE
- `onco_comite_sesiones.codigo_sesion`: UNIQUE
- (`onco_caso_especialidades.id_caso`, `onco_caso_especialidades.id_especialidad`): UNIQUE

#### Restricciones de integridad referencial
- Todas las FKs con `ON DELETE RESTRICT` por defecto (ALMA)
- FKs de colecciones UGCO con `ON DELETE CASCADE` donde aplique

#### Restricciones CHECK
- `onco_casos.fecha_alta_ugco >= fecha_ingreso_ugco` (si no NULL)
- `onco_episodios.fecha_fin >= fecha_inicio` (si no NULL)
- Solo un registro con `es_principal = true` por caso en `onco_caso_especialidades`

---

## 8. RELACIONES

### 8.1 Diagrama Entidad-Relación Textual

```
alma_pacientes (1) ----< (N) alma_episodios
alma_episodios (1) ----< (N) alma_diagnosticos

alma_pacientes (1) ----< (N) onco_casos
alma_episodios (1) ----< (N) onco_casos (opcional)
alma_diagnosticos (1) ----< (N) onco_casos (opcional)

onco_casos (N) ----< (N) onco_especialidades
  (via onco_caso_especialidades)

onco_casos (1) ----< (N) onco_episodios
onco_casos (1) ----< (N) onco_seguimiento_eventos
onco_casos (1) ----< (N) onco_comite_casos

onco_especialidades (1) ----< (N) onco_episodios (opcional)
onco_especialidades (1) ----< (N) onco_seguimiento_eventos (opcional)

onco_comite_sesiones (1) ----< (N) onco_comite_casos
```

### 8.2 Matriz de Relaciones

| Colección Origen | Relación | Colección Destino | Cardinalidad | Descripción |
|------------------|----------|-------------------|--------------|-------------|
| alma_pacientes | hasMany | alma_episodios | 1:N | Episodios del paciente |
| alma_episodios | belongsTo | alma_pacientes | N:1 | Paciente del episodio |
| alma_episodios | hasMany | alma_diagnosticos | 1:N | Diagnósticos del episodio |
| alma_diagnosticos | belongsTo | alma_episodios | N:1 | Episodio del diagnóstico |
| onco_casos | belongsTo | alma_pacientes | N:1 | Paciente del caso |
| onco_casos | belongsTo | alma_episodios | N:1 | Episodio índice (opcional) |
| onco_casos | belongsTo | alma_diagnosticos | N:1 | Diagnóstico índice (opcional) |
| onco_casos | belongsToMany | onco_especialidades | N:N | Especialidades del caso |
| onco_casos | hasMany | onco_episodios | 1:N | Episodios oncológicos |
| onco_casos | hasMany | onco_seguimiento_eventos | 1:N | Eventos de seguimiento |
| onco_casos | hasMany | onco_comite_casos | 1:N | Presentaciones en comité |
| onco_especialidades | hasMany | onco_caso_especialidades | 1:N | Casos asignados |
| onco_comite_sesiones | hasMany | onco_comite_casos | 1:N | Casos en sesión |

---

## 9. NOTAS DE IMPLEMENTACIÓN

### 9.1 Generación Automática de Códigos

#### `onco_casos.codigo_caso`
- **Formato**: `UGCO-YYYY-NNN`
- **Ejemplo**: `UGCO-2024-001`
- **Lógica**:
  ```javascript
  // Obtener último número del año actual
  const year = new Date().getFullYear();
  const lastCase = await db.onco_casos
    .where('codigo_caso', 'like', `UGCO-${year}-%`)
    .orderBy('id', 'desc')
    .first();

  const nextNumber = lastCase
    ? parseInt(lastCase.codigo_caso.split('-')[2]) + 1
    : 1;

  const codigo = `UGCO-${year}-${String(nextNumber).padStart(3, '0')}`;
  ```

#### `onco_comite_sesiones.codigo_sesion`
- **Formato**: `COM-YYYY-MM-DD`
- **Ejemplo**: `COM-2024-05-15`
- **Lógica**:
  ```javascript
  const fecha = new Date(fecha_sesion);
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  const codigo = `COM-${year}-${month}-${day}`;

  // Si ya existe, agregar sufijo incremental
  let suffix = '';
  let counter = 1;
  while (await exists(codigo + suffix)) {
    suffix = `-${counter}`;
    counter++;
  }
  return codigo + suffix;
  ```

### 9.2 Validaciones de Negocio

#### Al crear caso oncológico:
1. Verificar que `id_paciente_alma` existe en `alma_pacientes`
2. Generar automáticamente `codigo_caso`
3. Si no se especifica, `fecha_ingreso_ugco` = fecha actual
4. Crear automáticamente al menos una especialidad con `es_principal = true`

#### Al asignar especialidad a caso:
1. Si es la primera especialidad, forzar `es_principal = true`
2. Si `es_principal = true`, actualizar otras a `false`
3. No permitir eliminar la última especialidad de un caso

#### Al crear sesión de comité:
1. Generar automáticamente `codigo_sesion`
2. Validar que `fecha_sesion` sea futura (para nuevas sesiones)

### 9.3 Soft Delete

Las siguientes colecciones implementan soft delete (borrado lógico):
- `onco_casos` (campo `deleted_at`)

Las consultas deben filtrar por `deleted_at IS NULL` o usar scope `activo = true`.

---

## 10. CHANGELOG DEL DICCIONARIO

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2025-11-21 | Versión inicial del diccionario de datos |

---

**Documento generado por**: Claude Code
**Última actualización**: 2025-11-21
**Estado**: DRAFT - Pendiente de validación con equipo técnico
