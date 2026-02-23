
# Modelo de Datos UGCO – Gestión Oncológica

Este README documenta el modelo de datos propuesto para la **Unidad de Gestión Oncológica (UGCO)**, pensado para implementarse en un motor SQL (y sobre él en NocoBase) integrado con ALMA y alineado conceptualmente con FHIR/mCODE.

---

## 1. Convenciones de diseño

- **Prefijos de tablas**
  - `UGCO_...` → Tablas de **negocio** (casos, eventos, tareas, comités, documentos, equipos, contactos).
  - `REF_...` → Tablas de **catálogo** / diccionario (estados, tipos, especialidades, etc.).

- **Identificadores interoperables (`UGCO_COD01…UGCO_COD04`)**
  - Se usan en varias tablas para permitir:
    - un código interno estable (UGCO_COD01),
    - y hasta tres códigos externos (SIGO, otros HIS, registros regionales, FHIR identifier, etc.).
  - Ejemplo: `UGCO_COD01 = ONC-00024` para un caso oncológico.

- **Relación con ALMA**
  - Campos como `paciente_id`, `episodio_alma_id`, `diag_alma_id` son **FK lógicas** hacia tablas ya existentes en el SQL de ALMA.
  - La app UGCO:
    - **lee** datos maestros/demográficos de ALMA,
    - pero mantiene su propia capa de gestión (casos, tareas, comités, documentos, etc.).

- **Inspiración FHIR/mCODE (sin guardar FHIR “crudo”)**
  - `UGCO_CasoOncologico` ≈ `Condition` (perfil PrimaryCancerCondition de mCODE).
  - `UGCO_EventoClinico` ≈ combinación de `Procedure` / `Observation`.
  - `UGCO_Tarea` ≈ `Task`.
  - La BD es **relacional clásica**, pero pensada para mapearse a recursos FHIR cuando se requiera.

---

## 2. Arquitectura general de entidades

A muy alto nivel:

- **Paciente y contexto del caso**
  - `UGCO_CasoOncologico`: núcleo del episodio oncológico (diagnóstico, TNM, estado clínico/administrativo, intención terapéutica, seguimiento).
  - `UGCO_CasoEspecialidad`: asigna el caso a una o varias especialidades (Digestivo alto, Urología, etc.).
  - `UGCO_ContactoPaciente`: datos de contacto y residencia del paciente.
  - `UGCO_PersonaSignificativa`: cuidador/persona significativa con teléfonos y correo.
  - Catálogos: `REF_OncoEspecialidad`, `REF_OncoEstadoCaso`, `REF_OncoEstadoClinico`, `REF_OncoEstadoAdm`, `REF_OncoIntencionTrat`.

- **Eventos clínicos y tareas**
  - `UGCO_EventoClinico`: exámenes, cirugías, QT, RT, otros eventos relevantes.
    - Siempre ligados al paciente y opcionalmente al caso y al episodio de ALMA.
  - `UGCO_Tarea`: task manager (tareas clínicas ligadas a paciente/caso/evento y tareas internas).
  - `UGCO_EquipoSeguimiento` y `UGCO_EquipoMiembro`: equipos (enfermería, gestión) y sus miembros.
  - Catálogos: `REF_OncoTipoActividad`, `REF_OncoEstadoActividad`.

- **Comité oncológico y documentos**
  - `UGCO_ComiteOncologico`: sesiones de comité oncológico.
  - `UGCO_ComiteCaso`: casos discutidos en cada comité, con decisiones y plan terapéutico.
  - `UGCO_DocumentoCaso`: gestor documental (informes, notificaciones, imágenes) asociados a caso/evento.

---

## 3. Listado maestro de tablas y archivos

### 3.1. Tablas UGCO (negocio)

| Tabla                     | Archivo de definición              | Descripción breve                                                                       |
|---------------------------|------------------------------------|-----------------------------------------------------------------------------------------|
| `UGCO_CasoOncologico`     | `UGCO_CasoOncologico.md` / `.txt`  | Episodio oncológico por paciente (diagnóstico, TNM, estados, intención, seguimiento).   |
| `UGCO_CasoEspecialidad`   | `UGCO_CasoEspecialidad.md`         | Relación caso ↔ especialidad/grupo (ej. Digestivo alto, Urología, etc.).               |
| `UGCO_EventoClinico`      | `UGCO_EventoClinico.md`            | Eventos clínicos (exámenes, cirugías, QT/RT, otros) ligados al paciente/caso.          |
| `UGCO_Tarea`              | `UGCO_Tarea.md`                    | Tareas clínicas e internas (task manager), asociadas a casos y eventos.                 |
| `UGCO_ContactoPaciente`   | `UGCO_ContactoPaciente.md`         | Datos de contacto y residencia del paciente.                                            |
| `UGCO_PersonaSignificativa` | `UGCO_PersonaSignificativa.md`   | Persona significativa / cuidador principal del paciente.                                |
| `UGCO_DocumentoCaso`      | `UGCO_DocumentoCaso.md`            | Documentos asociados a caso/evento (informes, notificaciones, imágenes, etc.).          |
| `UGCO_EquipoSeguimiento`  | `UGCO_EquipoSeguimiento.md`        | Equipos de seguimiento (enfermería/gestión) vinculados a especialidades.                |
| `UGCO_EquipoMiembro`      | `UGCO_EquipoMiembro.md`            | Miembros (usuarios) de cada equipo de seguimiento y su rol.                             |
| `UGCO_ComiteOncologico`   | `UGCO_ComiteOncologico.md`         | Sesiones de comité oncológico (fecha, tipo, especialidad, lugar).                       |
| `UGCO_ComiteCaso`         | `UGCO_ComiteCaso.md`               | Casos discutidos en cada comité, con decisión y plan terapéutico.                       |

### 3.2. Tablas REF (catálogos)

| Tabla                     | Archivo de definición              | Descripción breve                                                                       |
|---------------------------|------------------------------------|-----------------------------------------------------------------------------------------|
| `REF_OncoEspecialidad`    | `REF_OncoEspecialidad.md`          | Especialidades/grupos oncológicos (Digestivo alto, Urología, etc.).                    |
| `REF_OncoTipoActividad`   | `REF_OncoTipoActividad.md`         | Tipos de tarea/actividad (Examen, Interconsulta, Control, Gestión interna…).          |
| `REF_OncoEstadoActividad` | `REF_OncoEstadoActividad.md`       | Estados de tarea (Pendiente, En curso, Completada, Vencida, Cancelada…).              |
| `REF_OncoEstadoCaso`      | `REF_OncoEstadoCaso.md`            | Estados del caso (Activo, En seguimiento, Cerrado, Perdido, Fallecido, Derivado…).    |
| `REF_OncoEstadoClinico`   | `REF_OncoEstadoClinico.md`         | Estado clínico del diagnóstico (Sospecha, Confirmado, No cáncer, Recaída…).           |
| `REF_OncoEstadoAdm`       | `REF_OncoEstadoAdm.md`             | Estado administrativo del caso (Proceso diagnóstico, Etapificación, Tratamiento…).    |
| `REF_OncoIntencionTrat`   | `REF_OncoIntencionTrat.md`         | Intención terapéutica (Curativo, Paliativo, Diagnóstico, Profiláctico…).              |

> Cada archivo `.md` contiene:
> - el `CREATE TABLE` de referencia (DDL), y  
> - el diccionario de campos correspondiente.

---

## 4. Instructivo: cómo funcionan las bases y cómo usarlas

Esta sección está pensada como guía práctica para TI y para la configuración en NocoBase.

### 4.1. Orden recomendado de creación en el motor SQL

1. **Crear catálogos (`REF_...`)**
   - `REF_OncoEspecialidad`
   - `REF_OncoTipoActividad`
   - `REF_OncoEstadoActividad`
   - `REF_OncoEstadoCaso`
   - `REF_OncoEstadoClinico`
   - `REF_OncoEstadoAdm`
   - `REF_OncoIntencionTrat`

2. **Crear tablas de negocio UGCO núcleo**
   - `UGCO_CasoOncologico`
   - `UGCO_CasoEspecialidad`
   - `UGCO_EventoClinico`
   - `UGCO_Tarea`

3. **Crear tablas de contexto y soporte**
   - `UGCO_ContactoPaciente`
   - `UGCO_PersonaSignificativa`
   - `UGCO_DocumentoCaso`

4. **Crear tablas de equipos y comités**
   - `UGCO_EquipoSeguimiento`
   - `UGCO_EquipoMiembro`
   - `UGCO_ComiteOncologico`
   - `UGCO_ComiteCaso`

5. **Agregar claves foráneas según el HIS real**
   - `paciente_id` → tabla de pacientes de ALMA.
   - `episodio_alma_id` → tabla de episodios de ALMA.
   - `diag_alma_id` → tabla de diagnósticos de ALMA.
   - Catálogos `REF_...` → establecer `FOREIGN KEY` desde las tablas UGCO.

### 4.2. Flujo funcional (cómo se usan las tablas en la práctica)

#### 4.2.1. Alta de un caso oncológico

1. Desde ALMA se identifica un paciente y un diagnóstico sospechoso/confirmado.
2. UGCO crea un registro en `UGCO_CasoOncologico`:
   - asigna `UGCO_COD01` (código de caso, p.ej. ONC-00024),
   - vincula a `paciente_id`, `episodio_alma_id`, `diag_alma_id`,
   - define estado clínico, administrativo, intención terapéutica.
3. Según la especialidad responsable:
   - se registra uno o varios `UGCO_CasoEspecialidad` apuntando a `REF_OncoEspecialidad`.
4. Se completan o sincronizan datos de contacto:
   - `UGCO_ContactoPaciente` y `UGCO_PersonaSignificativa`.

#### 4.2.2. Eventos clínicos y seguimiento

1. Cuando se solicita o realiza un examen/cirugía/QT/RT:
   - se registra o sincroniza un `UGCO_EventoClinico`:
     - siempre con `paciente_id`,
     - y, si corresponde, con `caso_id` y `episodio_alma_id`.
2. Para asegurar el seguimiento:
   - se crean registros en `UGCO_Tarea`:
     - ligando la tarea al `caso_id` y/o `evento_id`,
     - seleccionando `tipo_tarea_id` y `estado_tarea_id`.
3. Los equipos de enfermería/gestión:
   - se configuran en `UGCO_EquipoSeguimiento` + `UGCO_EquipoMiembro`,
   - se usan como responsables de tareas (`equipo_id`) y casos.

#### 4.2.3. Comité oncológico

1. Cada sesión se registra en `UGCO_ComiteOncologico` (fecha, tipo, especialidad).
2. Los casos discutidos se registran en `UGCO_ComiteCaso`:
   - se vinculan `comite_id` y `caso_id`,
   - se documentan `decision_resumen`, `plan_tratamiento` y acuerdos.
3. Si del comité salen acciones concretas:
   - se marcan `requiere_tareas = TRUE` en `UGCO_ComiteCaso`,
   - y se generan las tareas correspondientes en `UGCO_Tarea`.
4. Documentos relevantes (actas, informes, notificaciones):
   - se almacenan en `UGCO_DocumentoCaso` ligados al caso/evento.

### 4.3. Integración con NocoBase (visión rápida)

- Cada tabla (`UGCO_...` y `REF_...`) se modela como una **collection** en NocoBase.
- Las relaciones (FK) se configuran como:
  - `belongsTo` / `hasMany` entre las colecciones apropiadas.
- Para la operación clínica:
  - se pueden crear vistas/formularios:
    - **Ficha de caso** (basada en `UGCO_CasoOncologico` + relaciones),
    - **Panel de tareas por equipo/especialidad** (`UGCO_Tarea` + `UGCO_EquipoSeguimiento`),
    - **Módulo de comité** (`UGCO_ComiteOncologico` + `UGCO_ComiteCaso` + `UGCO_DocumentoCaso`).

---

## 5. Extensiones futuras sugeridas

Aunque el modelo actual es operativo, se deja espacio para:

- Nuevos catálogos:
  - `REF_OncoTipoDocumento` (clasificar documentos por tipo).
  - `REF_OncoECOG` (valores ECOG estandarizados).
  - Tablas TNM parametrizadas (listas de T, N, M por tumor, si se necesitan reglas más estrictas).

- Integración FHIR/mCODE:
  - Definir una capa de mapeo donde cada fila de `UGCO_CasoOncologico`, `UGCO_EventoClinico` y `UGCO_Tarea`
    se transforme en recursos FHIR (`Condition`, `Procedure`, `Observation`, `Task`) usando los campos `UGCO_COD01..04`
    como `identifier`.

---

## 6. Uso recomendado del paquete de archivos

1. Usar este `README_UGCO_Modelo.md` como **documento maestro** del modelo de datos.
2. Para la implementación:
   - ir a cada archivo `.md` de tabla y tomar el `CREATE TABLE` + diccionario.
3. Para la documentación clínica/funcional:
   - compartir este README con el equipo UGCO, enfermería y gestión,
   - marcar qué campos serán obligatorios en la práctica (además de lo que marca el SQL).

Si en algún punto decides añadir nuevas tablas o catálogos, basta con:
- agregar el nuevo archivo `.md` con su DDL + diccionario, y
- sumar su fila a la tabla de “Listado maestro de tablas” en este README.
