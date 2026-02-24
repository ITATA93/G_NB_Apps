# 🏥 PROMPT: Aplicación "Entrega de Turno" para NocoBase (G_NB_Apps)

## Contexto del Proyecto

Eres el agente arquitecto del proyecto **G_NB_Apps** (NocoBase Management).
Tu objetivo es crear el módulo **ENTREGA** — una aplicación web de **Entrega de Turno Médica** 
para el Hospital Dr. Antonio Tirado Lanas de Ovalle.

### ¿Qué es la Entrega de Turno?
Es el proceso clínico donde el equipo médico saliente informa al equipo entrante sobre:
- Estado actual de cada paciente hospitalizado
- Diagnósticos activos
- Plan de tratamiento vigente
- Eventos relevantes del turno (cirugías, interconsultas, ingresos, altas, fallecidos)
- Pendientes y observaciones críticas

Actualmente se hace con un **Excel de 32 hojas** (una por servicio: MQ1, MQ2, MQ3, UTI, UCI, etc.)
que se llena manualmente. Esta app lo reemplaza con datos en vivo desde ALMA/IRIS.

---

## 🔌 Fuente de Datos: ALMA/TrakCare (InterSystems IRIS)

La app se alimenta de la query SQL `entrega_turno_hospitalizados.sql` del proyecto `G_Consultas`.
El ETL trae los datos a NocoBase via API. Las queries principales son:

### Campos del Censo (Q1 - la query maestra)
```
SERVICIO           -- Código del servicio (MQ1, MQ2, PCER, UCI, UTI, CIBU, etc.)
DESC_SERVICIO      -- Nombre largo del servicio
SALA               -- Número de sala
CAMA               -- Número de cama
NOMBRE_PACIENTE    -- Apellido, Nombre
MEDICO_TRATANTE    -- Médico que admitió (= "Cirujano" en el Excel)
COD_MEDICO         -- Código del médico en ALMA
RUT                -- RUT del paciente (identifier)
NRO_FICHA          -- Número de ficha clínica
FECHA_NACIMIENTO   -- Fecha de nacimiento
EDAD               -- Edad en años
SEXO               -- Masculino/Femenino
F_INGRESO          -- Fecha de ingreso
HORA_INGRESO       -- Hora de ingreso
F_PROBABLE_ALTA    -- Fecha probable de alta (si se programó)
ALTA_CONFIRMADA    -- Flag de alta confirmada
DIAS_HOSPITALIZACION -- Días desde el ingreso
DX_PRINCIPAL       -- Diagnóstico principal (texto)
TIPO_ADMISION      -- 'I' = Internado
ESTADO_VISITA      -- 'A' = Activo
F_ALTA_MEDICA      -- Fecha de alta médica (si existe)
ALTA_MEDICA_FLAG   -- Flag sí/no
ALERGIAS           -- Alergias del paciente
VIP                -- Flag VIP
TELEFONO           -- Teléfono del paciente
MEDICO_REFERENCIA  -- Médico de referencia interna
SERVICIO_PADRE     -- Ward padre (agrupación)
DESC_SERVICIO_PADRE -- Nombre del ward padre
ID_EPISODIO        -- ID único del episodio (PA_Adm.PAADM_RowID)
```

### Queries Complementarias
| Query | Datos | Uso en la Entrega |
|---|---|---|
| Q2 | Diagnósticos por paciente | Lista completa de Dx activos |
| Q3 | Resumen por servicio | Dashboard de ocupación |
| Q6 | Altas del día | Panel de altas |
| Q8 | Cirugías/Procedimientos | Operados del turno |
| Q9 | Órdenes pendientes | Pendientes por paciente |
| Q10 | Ingresos del día | Pacientes nuevos |
| Q11 | Fallecidos del día | Panel de fallecidos |
| Q12 | Operados en el turno | Cirugías realizadas |
| Q13 | Interconsultas internas | IC pendientes/realizadas |
| Q14 | Endoscopias pendientes | Procedimientos pendientes |

---

## 📐 Modelo de Datos NocoBase

### Colecciones Principales

#### 1. `et_servicios` — Catálogo de Servicios Hospitalarios
Mapeo de los servicios donde se hospitalizan pacientes.

| Campo | Tipo | Descripción | Ejemplo |
|---|---|---|---|
| `codigo` | string, unique, required | Código ALMA (CT_Loc) | MQ1, MQ2, UCI |
| `nombre` | string | Nombre descriptivo | Medicina Quirúrgica 1 |
| `codigo_padre` | string | Servicio padre | CIRUGIA |
| `especialidad_id` | belongsTo → et_especialidades | Especialidad principal | Cirugía General |
| `capacidad_camas` | integer | Nº camas total | 30 |
| `activo` | boolean | Servicio activo | true |

**Seed inicial de servicios:**
```yaml
- { codigo: MQ1, nombre: "Medicina Quirúrgica 1", especialidad: "Medicina Interna" }
- { codigo: MQ2, nombre: "Medicina Quirúrgica 2", especialidad: "Medicina Interna" }
- { codigo: MQ3, nombre: "Medicina Quirúrgica 3", especialidad: "Cirugía General" }
- { codigo: PCER, nombre: "Pensionado Cerrado", especialidad: "Multidisciplinario" }
- { codigo: UCI, nombre: "Unidad Cuidados Intensivos", especialidad: "Medicina Intensiva" }
- { codigo: UTI, nombre: "Unidad Tratamiento Intermedio", especialidad: "Medicina Intensiva" }
- { codigo: CIBU, nombre: "Cirugía Infantil", especialidad: "Cirugía Infantil" }
- { codigo: PED, nombre: "Pediatría", especialidad: "Pediatría" }
- { codigo: OBST, nombre: "Obstetricia", especialidad: "Obstetricia/Ginecología" }
- { codigo: GIN, nombre: "Ginecología", especialidad: "Obstetricia/Ginecología" }
- { codigo: NEO, nombre: "Neonatología", especialidad: "Neonatología" }
- { codigo: TRAU, nombre: "Traumatología", especialidad: "Traumatología" }
- { codigo: TEST, nombre: "Test/Desarrollo", especialidad: "N/A", activo: false }
```

#### 2. `et_especialidades` — Catálogo de Especialidades Médicas

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | string, unique, required | Nombre de especialidad |
| `codigo` | string, unique | Código corto |
| `activa` | boolean | Especialidad activa |

**Seed:**
```yaml
- { nombre: "Medicina Interna", codigo: "MI" }
- { nombre: "Cirugía General", codigo: "CG" }
- { nombre: "Medicina Intensiva", codigo: "MINT" }
- { nombre: "Pediatría", codigo: "PED" }
- { nombre: "Obstetricia/Ginecología", codigo: "OBG" }
- { nombre: "Traumatología", codigo: "TRAU" }
- { nombre: "Neonatología", codigo: "NEO" }
- { nombre: "Cirugía Infantil", codigo: "CI" }
- { nombre: "Multidisciplinario", codigo: "MULTI" }
```

#### 3. `et_usuarios` — Usuarios de la Entrega (Médicos, Enfermeros)

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | string, required | Nombre completo |
| `rut` | string, unique | RUT del profesional |
| `codigo_alma` | string | Código CTPCP en ALMA |
| `cargo` | enum | Médico, Enfermero/a, Interno, Becado |
| `especialidad` | string | Especialidad (informativo) |
| `email` | string | Email institucional |
| `activo` | boolean | Activo |

> **Nota**: El acceso a servicios NO se controla aquí sino a nivel de **páginas del menú NocoBase**.
> Ver sección "Interfaz UI" para el modelo de ventanas por página.

#### 4. `et_pacientes_censo` — Censo de Hospitalizados (Sync desde ALMA)

Tabla **100% read-only**, sincronizada automáticamente desde la Q1.
Nunca se edita manualmente. La edición la hace el médico en `et_entrega_paciente`.

| Campo | Tipo | Source ALMA | Descripción |
|---|---|---|---|
| `id_episodio` | string, unique, required | ID_EPISODIO | PK del episodio en ALMA |
| `rut` | string | RUT | RUT paciente |
| `nro_ficha` | string | NRO_FICHA | Ficha clínica |
| `nombre` | string | NOMBRE_PACIENTE | Apellido, Nombre |
| `edad` | integer | EDAD | Edad en años |
| `sexo` | string | SEXO | M/F |
| `servicio_id` | belongsTo → et_servicios | SERVICIO | Servicio físico actual (UCI, MQ1...) |
| `sala` | string | SALA | Número de sala |
| `cama` | string | CAMA | Número de cama |
| `medico_tratante_alma` | string | MEDICO_TRATANTE | Médico que admitió (ALMA) |
| `cod_medico` | string | COD_MEDICO | Código ALMA del médico |
| `especialidad_clinica` | string | SERVICIO_PADRE / derivado | **Especialidad clínica** (Medicina, Cirugía...) |
| `f_ingreso` | datetime | F_INGRESO | Fecha y hora ingreso |
| `dias_hospitalizacion` | integer | DIAS_HOSPITALIZACION | Días desde ingreso |
| `dx_principal` | text | DX_PRINCIPAL | Diagnóstico principal |
| `f_probable_alta` | date | F_PROBABLE_ALTA | Fecha probable alta |
| `alta_confirmada` | boolean | ALTA_CONFIRMADA | Alta confirmada S/N |
| `f_alta_medica` | date | F_ALTA_MEDICA | Fecha alta médica |
| `alergias` | text | ALERGIAS | Alergias conocidas |
| `vip` | boolean | VIP | Flag VIP |
| `telefono` | string | TELEFONO | Teléfono contacto |
| `servicio_padre` | string | SERVICIO_PADRE | Ward padre |
| `caso_social` | boolean | - | **🚩 Caso social/sociosanitario** (sin red de apoyo, alta médica pero no puede irse) |
| `motivo_caso_social` | text | - | Motivo del caso social (editable) |
| `ultima_sync` | datetime | - | Timestamp última sincronización |

> **Nota**: `caso_social` y `motivo_caso_social` son los únicos campos editables
> en el censo. Se marcan desde la Vista Global o desde la página de especialidad.

#### 5. `et_diagnosticos` — Diagnósticos por Paciente (Sync Q2)

| Campo | Tipo | Source ALMA |
|---|---|---|
| `paciente_censo_id` | belongsTo → et_pacientes_censo | JOIN por episodio |
| `tipo_dx` | string | TIPO_DX (P=Principal, S=Secundario) |
| `diagnostico` | text | DIAGNOSTICO |
| `cod_cie` | string | COD_CIE |
| `fecha_dx` | date | FECHA_DX |
| `activo` | boolean | ACTIVO |

#### 6. `et_cotratancia` — Asignación de Cotratancia / Seguimiento 🆕

Permite que un paciente de una especialidad aparezca en la entrega de **otra**
especialidad. Ej: paciente de Medicina que necesita evaluación diaria por Cirugía.

| Campo | Tipo | Descripción |
|---|---|---|
| `paciente_censo_id` | belongsTo → et_pacientes_censo | Paciente |
| `especialidad_origen` | string | Especialidad dueña del paciente (Medicina) |
| `especialidad_destino` | string | Especialidad que debe evaluarlo (Cirugía) |
| `tipo` | enum | **cotratancia** (eval. diaria) o **seguimiento** (seguimiento puntual) |
| `motivo` | text | Motivo de la cotratancia/seguimiento |
| `solicitado_por_id` | belongsTo → et_usuarios | Quién solicitó |
| `fecha_inicio` | date | Desde cuándo |
| `fecha_fin` | date, nullable | Hasta cuándo (null = vigente) |
| `activa` | boolean | ¿Vigente? |
| `notas` | text | Notas del seguimiento |

> **Ejemplo**: Paciente Juan Pérez (Medicina Interna) necesita evaluación diaria
> por Cirugía. Se crea un registro de cotratancia:
> - `especialidad_origen = "Medicina Interna"`
> - `especialidad_destino = "Cirugía General"`
> - `tipo = "cotratancia"`
> - Ahora Juan Pérez aparece en la página de Cirugía General también.

#### 7. `et_turnos` — Registro de Entregas de Turno

Cada entrega se crea **por especialidad** para un turno específico.

| Campo | Tipo | Descripción |
|---|---|---|
| `fecha` | date, required | Fecha de la entrega |
| `turno` | enum | Mañana (08:00), Tarde (14:00), Noche (20:00) |
| `especialidad` | string, required | Especialidad de esta entrega |
| `responsable_saliente_id` | belongsTo → et_usuarios | Quién entrega |
| `responsable_entrante_id` | belongsTo → et_usuarios | Quién recibe |
| `estado` | enum | borrador, en_curso, completada, firmada |
| `observaciones_generales` | text | Notas generales del turno |
| `firma_saliente` | boolean | Firma digital saliente |
| `firma_entrante` | boolean | Firma digital entrante |
| `created_at` | datetime | Creación automática |

#### 8. `et_entrega_paciente` — Detalle Editable por Paciente en cada Entrega

Aquí es donde el médico **edita en NocoBase** el resumen, plan y pendientes.
Cada registro es un paciente dentro de una entrega de turno específica.
Al crear nueva entrega, se copian los datos del turno anterior (herencia).

| Campo | Tipo | Descripción |
|---|---|---|
| `turno_id` | belongsTo → et_turnos | Entrega de turno padre |
| `paciente_censo_id` | belongsTo → et_pacientes_censo | Paciente del censo |
| `es_cotratancia` | boolean | ¿Incluido por cotratancia/seguimiento? |
| `tipo_inclusion` | enum | propio, cotratancia, seguimiento |
| `resumen_historia` | text (rich) | **Resumen Historia** (editable en NocoBase) |
| `plan_tratamiento` | text (rich) | **Plan de Tratamiento** (editable en NocoBase) |
| `pendientes` | text | **Pendientes** (editable en NocoBase) |
| `medico_tratante_id` | belongsTo → et_usuarios | **Médico tratante** (seleccionable) |
| `estado_paciente` | enum | estable, inestable, grave, crítico, alta_programada |
| `eventos_turno` | text | Eventos relevantes de este turno |
| `fue_operado` | boolean | ¿Fue operado este turno? |
| `procedimiento` | text | Detalle del procedimiento (si aplica) |
| `interconsulta` | text | Interconsultas solicitadas/respondidas |
| `modificado_por_id` | belongsTo → et_usuarios | Último en editar |

> **Herencia**: Al crear nueva entrega, `resumen_historia`, `plan_tratamiento`,
> `pendientes` y `medico_tratante_id` se **copian del turno anterior**.
> El médico solo modifica lo que cambió.

#### 9. `et_eventos_turno` — Eventos Relevantes (Sync Q6, Q10, Q11, Q12)

| Campo | Tipo | Descripción |
|---|---|---|
| `turno_id` | belongsTo → et_turnos | Entrega padre |
| `tipo_evento` | enum | ingreso, alta, fallecimiento, cirugia, interconsulta |
| `paciente_censo_id` | belongsTo → et_pacientes_censo | Paciente (si aplica) |
| `descripcion` | text | Descripción del evento |
| `fecha_hora` | datetime | Cuándo ocurrió |
| `servicio_id` | belongsTo → et_servicios | Servicio |
| `source_alma` | boolean | ¿Vino de ALMA automáticamente? |

#### 10. `et_entrega_enfermeria` — Entrega de Enfermería (por Servicio) 🆕

Entrega de turno de **enfermería**, organizada por **servicio físico** (MQ1, UCI, PED...).
Es una tabla separada de la entrega médica. Los campos marcados con 🔄 se
sincronizan automáticamente desde ALMA vía el reporte ZEN
(`Region.CLXX.Reports.ZEN.Hospitalizado.EntregaTurnoHosp`).

**Campos de cabecera (por turno/servicio):**

| Campo | Tipo | Descripción |
|---|---|---|
| `fecha` | date, required | Fecha de la entrega |
| `turno` | enum | Mañana, Tarde, Noche |
| `servicio_id` | belongsTo → et_servicios | **Servicio físico** (MQ1, UCI, PED...) |
| `enfermera_saliente_id` | belongsTo → et_usuarios | Enfermera que entrega |
| `enfermera_entrante_id` | belongsTo → et_usuarios | Enfermera que recibe |
| `firma_saliente` | boolean | Firma enfermera saliente |
| `firma_entrante` | boolean | Firma enfermera entrante |

**Campos por paciente (1 registro por paciente por turno):**

| Campo | Tipo | Source | Descripción |
|---|---|---|---|
| `paciente_censo_id` | belongsTo → et_pacientes_censo | - | Paciente |
| `enfermera_cargo_id` | belongsTo → et_usuarios | Manual | **Enfermera a cargo** del paciente |
| `dx_confirmados` | text | 🔄 ZEN col 9 | Diagnósticos confirmados |
| `dx_preoperatorio` | text | 🔄 ZEN col 10 | Diagnóstico preoperatorio |
| `cirugia_procedimiento` | text | 🔄 ZEN col 11 | Cirugía/Procedimiento principal |
| `fecha_agendada` | date | 🔄 ZEN col 12 | Fecha agendada cirugía |
| `hora_agendada` | time | 🔄 ZEN col 13 | Hora agendada |
| `quirofano` | string | 🔄 ZEN col 14 | Quirófano asignado |
| `estado_cirugia` | string | 🔄 ZEN col 15 | Estado de la cirugía |
| `dispositivo_invasivo` | text | 🔄 ZEN col 16 | Dispositivo invasivo (VVP, CVC, SNG...) |
| `fecha_instalacion` | date | 🔄 ZEN col 17 | Fecha instalación dispositivo |
| `ubicacion_lateralidad` | string | 🔄 ZEN col 18 | Ubicación y lateralidad |
| `dias_instalado` | integer | 🔄 ZEN col 19 | Días instalado |
| `comentarios_instalacion` | text | 🔄 ZEN col 20 | Comentarios instalación |
| `egreso_diuresis` | decimal | 🔄 ZEN col 21 | Egreso diuresis (ml) |
| `egreso_drenaje` | decimal | 🔄 ZEN col 41 | Egreso drenaje (ml) |
| `egreso_drenaje_3` | decimal | 🔄 ZEN col 42 | Egreso drenaje 3 |
| `egreso_drenaje_4` | decimal | 🔄 ZEN col 43 | Egreso drenaje 4 |
| `egreso_drenaje_5` | decimal | 🔄 ZEN col 44 | Egreso drenaje 5 |
| `lab_pendientes` | text | 🔄 ZEN col 22 | Laboratorio (exámenes) |
| `img_pendientes` | text | 🔄 ZEN col 23 | Imagenología pendiente |
| `fc` | decimal | 🔄 ZEN col 24 | Frecuencia cardíaca |
| `pa_sistolica` | decimal | 🔄 ZEN col 25 | Presión arterial sistólica |
| `pa_diastolica` | decimal | 🔄 ZEN col 26 | Presión arterial diastólica |
| `fr` | decimal | 🔄 ZEN col 27 | Frecuencia respiratoria |
| `sat_o2` | decimal | 🔄 ZEN col 28 | Saturación O2 |
| `temperatura` | decimal | 🔄 ZEN col 29 | Temperatura axilar |
| `hgt` | decimal | 🔄 ZEN col 30 | Hemoglucotest |
| `eva_dolor` | decimal | 🔄 ZEN col 31 | Escala del dolor (EVA) |
| `hgt_insulina` | decimal | 🔄 ZEN col 32 | HGT para insulina |
| `clasificacion_insulina` | string | 🔄 ZEN col 33 | Clasificación insulina |
| `tipo_insulina` | string | 🔄 ZEN col 34 | Tipo de insulina |
| `dosis_insulina` | decimal | 🔄 ZEN col 35 | Dosis administrada insulina |
| `sitio_puncion_insulina` | string | 🔄 ZEN col 36 | Sitio anatómico punción |
| `comentarios_insulina` | text | 🔄 ZEN col 37 | Comentarios zona punción |
| `ic_internas_pendientes` | text | 🔄 ZEN col 38 | Interconsultas internas pendientes |
| `medicamentos` | text | 🔄 ZEN col 39 | Medicamentos (lista completa) |
| `alergias` | text | 🔄 ZEN col 40 | Alergias |
| `escala_caidas` | string | 🔄 ZEN col 45 | Resultado Escala Caídas (J.H.Downton) |
| `riesgo_dependencia` | string | 🔄 ZEN col 46 | Categorización Riesgo Dependencia |
| `regimen` | text | 🔄 ZEN col 47 | Régimen alimentario |
| `observaciones` | text | Manual | Observaciones de enfermería |
| `cuidados_especiales` | text (rich) | Manual | Cuidados especiales |
| `incidentes` | text | Manual | Incidentes o caídas |

> **Fuente**: El reporte ZEN `Region.CLXX.Reports.ZEN.Hospitalizado.EntregaTurnoHosp`
> ya tiene estos 48 campos en producción en ALMA. Se puede exportar como Excel
> o consumir vía API. Los campos manuales (enfermera a cargo, observaciones,
> cuidados especiales, incidentes) se editan en NocoBase.
>
> **Diferencia con entrega médica**: Enfermería se organiza por **servicio físico**
> (MQ1, UCI, PED), no por especialidad clínica. La enfermera de MQ1 ve todos
> los pacientes de MQ1 sin importar si son de Medicina o Cirugía.

---

## 🔐 Roles y Permisos

### Principio: Páginas por ESPECIALIDAD CLÍNICA + visibilidad por rol NocoBase

Las páginas NO son por ubicación física (UCI, MQ1) sino por **especialidad clínica**.
Un paciente de Medicina en UCI aparece en la página "Medicina", no en "UCI".
Esto se logra filtrando por `especialidad_clinica` (derivado del servicio padre
o del médico tratante), no por el ward físico.

| Rol NocoBase | Páginas visibles | Permisos |
|---|---|---|
| **Médico Medicina** | Medicina Interna, Dashboard, Vista Global | CRUD entrega, leer censo |
| **Médico Cirugía** | Cirugía General, Dashboard, Vista Global | CRUD entrega, leer censo |
| **Médico Intensivista** | UCI/UTI, Dashboard, Vista Global | CRUD entrega |
| **Médico Pediatría** | Pediatría, Dashboard, Vista Global | CRUD entrega, leer censo |
| **Médico Obst-Gin** | Obst/Gin, Dashboard, Vista Global | CRUD entrega, leer censo |
| **Traumatología** | Traumatología, Dashboard, Vista Global | CRUD entrega, leer censo |
| **Enfermería MQ1** | Enf. MQ1, Dashboard | CRUD entrega enfermería MQ1 |
| **Enfermería UCI** | Enf. UCI, Dashboard | CRUD entrega enfermería UCI |
| **Jefe de Servicio** | Sus páginas + Historial + Vista Global | CRUD + firmar + crear turno |
| **Administrador Clínico** | **TODAS las páginas** | Full access |
| **Solo Lectura** | Todas las páginas | Solo ver |

> **Caso especial: UCI/UTI.** Los intensivistas pueden tener una página propia
> que muestre TODOS los pacientes en UCI/UTI (sin importar especialidad).
> Pero la entrega del paciente la hace el médico de su especialidad.

### Cómo funciona en NocoBase:

1. **Se crean páginas por especialidad** (Medicina, Cirugía, Pediatría, etc.)
2. Cada página muestra pacientes donde:
   - `especialidad_clinica = "Medicina Interna"` (pacientes propios)
   - **O** tienen una `et_cotratancia` activa hacia esa especialidad
3. Se crean **roles en NocoBase** que agrupan las páginas visibles
4. A cada usuario se le asigna el rol correspondiente
5. El usuario abre NocoBase y ve solo las páginas de su especialidad

> **Esto usa la funcionalidad nativa de NocoBase**: Menu → Configure → Role-based menu visibility.

---

## 🖥️ Interfaz UI (Páginas NocoBase)

### Menú Principal — Una página por especialidad

Cada especialidad es una **página** que muestra sus pacientes sin importar su
ubicación física. Un paciente de medicina en UCI aparece en "Medicina Interna".

```text
📋 Entrega de Turno
  ├── 📊 Dashboard                → Gráficos, rankings, resumen global
  │
  ├── 🌐 Vista Global              → TODOS los pacientes + cotratancia + casos sociales
  │
  ├── 🩺 Medicina Interna          → Entrega médica MI
  ├── 🩺 Cirugía General            → Entrega médica CG
  ├── 🩺 Pediatría                 → Entrega médica PED
  ├── 🩺 Obstetricia / Ginecología  → Entrega médica Obst/Gin
  ├── 🩺 Neonatología              → Entrega médica NEO
  ├── 🩺 Traumatología             → Entrega médica TRAU
  ├── 🩺 UCI / UTI (Intensivo)     → Entrega médica intensivistas
  │
  ├── 👩‍⚕️ Enfermería MQ1           → Entrega enfermería MQ1
  ├── 👩‍⚕️ Enfermería MQ2           → Entrega enfermería MQ2
  ├── 👩‍⚕️ Enfermería MQ3           → Entrega enfermería MQ3
  ├── 👩‍⚕️ Enfermería UCI           → Entrega enfermería UCI
  ├── 👩‍⚕️ Enfermería UTI           → Entrega enfermería UTI
  ├── 👩‍⚕️ Enfermería PED           → Entrega enfermería PED
  ├── 👩‍⚕️ Enfermería OBST          → Entrega enfermería OBST
  ├── 👩‍⚕️ ... (una por servicio)
  │
  ├── 📜 Historial                 → Entregas pasadas (médicas + enfermería)
  └── ⚙️ Configuración (Admin)
       ├── Servicios
       ├── Especialidades
       └── Usuarios
```

> **Entrega Médica** = por especialidad clínica (Medicina, Cirugía...)
> **Entrega Enfermería** = por servicio físico (MQ1, UCI, PED...)
> Cada enfermera selecciona la **enfermera a cargo** del turno.

### Página: Dashboard (`et_dashboard`)

**Gráficos y métricas globales:**
- **Cards de resumen**: Total hospitalizados, por servicio, ingresos hoy, altas hoy
- **Gráfico de barras**: Pacientes por especialidad clínica
- **Gráfico de pie**: Ocupación por servicio físico
- **Ranking mayor estadía**: Top 20 pacientes con más días hospitalizados
- **Casos sociales**: Lista de pacientes marcados como caso social/sociosanitario
- **Indicadores de alerta**: Pacientes >30 días, sin Dx, sin plan, casos sociales
- **Tabla resumen**: Servicio | Ocupación | Ingresos | Altas | Casos Sociales | Pendientes

### Página: Vista Global (`et_vista_global`)

Muestra **TODOS los pacientes hospitalizados** de todas las especialidades.
Permite asignar cotratancia/seguimiento y marcar casos sociales.

- **Tabla completa**: Todos los pacientes del censo
- **Columnas**: Ubicación | Cama | Nombre | Especialidad | Dx | Médico | Días | 🚩Social
- **Acciones por paciente**:
  - **🔄 Asignar Cotratancia**: Seleccionar especialidad destino + motivo
  - **👁️ Asignar Seguimiento**: Seguimiento puntual por otra especialidad
  - **🚩 Marcar Caso Social**: Paciente sin red de apoyo / sociosanitario
  - **❌ Remover asignación**: Finalizar cotratancia/seguimiento
- **Filtros**: Por servicio físico, por especialidad, por médico, solo casos sociales
- **Visible para**: Todos los roles (con permisos de edición para Jefes y Admin)

### Página por Especialidad (ej: `et_medicina`, `et_cirugia`, etc.) — LAS MÁS IMPORTANTES

Cada página muestra:
1. **Pacientes propios**: `especialidad_clinica = "Cirugía General"`
2. **Pacientes en cotratancia** hacia esta especialidad: badge 🔄

**Sección superior: Censo de la especialidad**
- **Tabla** con pacientes propios + cotratancias (agrupados por ubicación física)
- **Columnas**: Ubicación | Cama | Nombre | RUT | Edad | Dx | Médico | Días | Estado | Tipo (🏠/🔄)
- **Click en paciente**: Panel lateral con datos ALMA + campos de la última entrega
- **Campos editables en `et_entrega_paciente`** (dentro de NocoBase):
  - **Resumen Historia** (rich text)
  - **Plan de Tratamiento** (rich text)
  - **Pendientes** (texto)
  - **Médico Tratante** (dropdown de et_usuarios)
  - **Estado** (dropdown)

**Sección inferior: Entrega del turno**
- **Botón "Iniciar Entrega"**: Selecciona turno (Mañana/Tarde/Noche)
- Genera snapshot de todos los pacientes (propios + cotratancias)
- **Firma**: Responsable saliente y entrante firman al completar
- **Vista de impresión**: Formato similar al Excel original

### Página: Entrega Enfermería (ej: `et_enf_mq1`, `et_enf_uci`) 🆕

Organizada por **servicio físico** (no por especialidad). Muestra TODOS
los pacientes del servicio sin importar especialidad.

- **Tabla**: Todos los pacientes del servicio (Data Scope: `servicio_id = "MQ1"`)
- **Columnas**: Cama | Nombre | Dx | Estado Enf. | Cuidados | Vías | Medicamentos
- **Campos editables en `et_entrega_enfermeria`**:
  - Enfermera a cargo (dropdown)
  - Cuidados de enfermería (rich text)
  - Vías venosas, sondas, drenajes
  - Medicamentos del turno
  - Signos vitales
  - Observaciones e incidentes
- **Firma**: Enfermera saliente y entrante

### Página: Historial (`et_historial`)
- **Búsqueda** por fecha, servicio, especialidad, paciente
- **Tabs**: Entregas Médicas | Entregas Enfermería
- **Vista de cada entrega pasada** (read-only)
- **Exportar a PDF/Excel**

---

## 🔄 Workflows NocoBase

### 1. Sync Censo ALMA → NocoBase
```
Trigger: Cron cada 30 min o botón manual
Action:
  1. Ejecutar Q1 contra IRIS via Python ETL (G_Consultas)
  2. Upsert resultados en et_pacientes_censo (key: id_episodio)
  3. Marcar pacientes que ya no están (alta) como inactivos
  4. Ejecutar Q2 → actualizar et_diagnosticos
  5. Ejecutar Q6,Q10,Q11,Q12 → crear et_eventos_turno
  6. Actualizar timestamp de sync
```

### 2. Crear Entrega de Turno
```
Trigger: Usuario presiona "Iniciar Entrega"
Action:
  1. Crear registro en et_turnos con fecha, turno
  2. Asociar las ventanas habilitadas del usuario al turno
  3. Para cada paciente del censo en esas ventanas:
     a. Crear registro en et_entrega_paciente
     b. Copiar plan_tratamiento del turno anterior (si existe)
     c. Popular eventos del turno desde et_eventos_turno
  4. Estado = "en_curso"
```

### 3. Firmar y Cerrar Entrega
```
Trigger: Ambos responsables firman
Action:
  1. Estado = "firmada"
  2. Bloquear edición
  3. Generar snapshot para auditoría
```

---

## 📊 Mapeo Excel → NocoBase

El Excel original (ENTREGA.xlsx) tiene estas columnas por hoja/servicio:

| Col Excel | Campo NocoBase | Source |
|---|---|---|
| A: SALA | `et_pacientes_censo.cama` | ALMA Q1 |
| B: NOMBRE | `et_pacientes_censo.nombre` | ALMA Q1 |
| C: CIRUJANO | `et_pacientes_censo.medico_tratante` | ALMA Q1 |
| D: RUT | `et_pacientes_censo.rut` | ALMA Q1 |
| E: EDAD | `et_pacientes_censo.edad` | ALMA Q1 |
| F: F.INGRESO | `et_pacientes_censo.f_ingreso` | ALMA Q1 |
| G: F.P.ALTA | `et_pacientes_censo.f_probable_alta` | ALMA Q1 |
| H: DH | `et_pacientes_censo.dias_hospitalizacion` | ALMA Q1 |
| I: DIAG.QUIRÚRGICO | `et_pacientes_censo.dx_principal` | ALMA Q1 |
| J: PLAN TTO | `et_entrega_paciente.plan_tratamiento` | **Manual (médico)** |
| K: INDICACIONES | `et_entrega_paciente.indicaciones` | **Manual (médico)** |
| L: PENDIENTES | `et_entrega_paciente.pendientes` | **Manual (médico)** |
| M: OBSERVACIONES | `et_entrega_paciente.eventos_turno` | **Manual + ALMA** |
| (nueva): ESTADO | `et_entrega_paciente.estado_paciente` | **Manual (médico)** |

**Cada hoja del Excel (MQ1, MQ2, etc.) se reemplazan por páginas de especialidad que
agrupan pacientes por su especialidad clínica, independiente de su ubicación física.**

---

## 🛠️ Plan de Implementación

### Fase 1: Fundación (Colecciones + Seed)
1. Crear colecciones: `et_especialidades`, `et_servicios`, `et_usuarios`
2. Seed de datos iniciales (servicios, especialidades)
3. Crear roles y permisos base
4. UI: Páginas de configuración (Admin)

### Fase 2: Censo Sync
1. Crear colección `et_pacientes_censo` y `et_diagnosticos`
2. Script ETL Python: Q1 → NocoBase API (upsert)
3. UI: Página de Censo con filtros
4. Workflow de sync automático

### Fase 3: Páginas por Especialidad
1. Crear una página NocoBase por cada especialidad (Medicina, Cirugía, Pediatría, etc.)
2. En cada página: bloque Table con Data Scope `especialidad_clinica = "X"`
3. Colecciones `et_turnos`, `et_entrega_paciente`, `et_eventos_turno`
4. Formulario de entrega integrado en cada página
5. Lógica de herencia de plan (copiar turno anterior)

### Fase 4: Roles y Polish
1. Crear roles NocoBase por especialidad (Médico MI, Médico CG, etc.)
2. Configurar visibilidad de menú por rol
3. Dashboard con indicadores
4. Historial y búsqueda
5. Firma digital y cierre
6. Exportación PDF/Excel

---

## ⚙️ Integración Técnica

### ETL: G_Consultas → NocoBase
```python
# Archivo: G_Consultas/Consultas_live/sync_entrega_turno.py
# Usa db_config.py para conexión ALMA
# Ejecuta Q1 → upsert via NocoBase REST API

from herramientas.python.db_config import conectar_alma
import requests

NOCOBASE_URL = os.getenv('NOCOBASE_BASE_URL')
NOCOBASE_KEY = os.getenv('NOCOBASE_API_KEY')

def sync_censo():
    """Ejecuta Q1 y upsert a NocoBase et_pacientes_censo"""
    conn = conectar_alma()
    # ... ejecutar Q1 ...
    for row in rows:
        requests.post(f"{NOCOBASE_URL}/api/et_pacientes_censo:upsert",
            headers={"Authorization": f"Bearer {NOCOBASE_KEY}"},
            json={
                "filterKeys": ["id_episodio"],
                "values": { ... }  # mapeo de campos
            })
```

### Conexión ALMA (referencia)
```
Motor: InterSystems IRIS
Servidor: 10.63.180.25:51773  
BD: LIVE-CLOV
Esquema: SQLUser
Fechas: Mumps horolog (DATEADD('dd', campo, '1840-12-31'))
Credenciales: .env (db_config.py)
⚠️ SOLO SELECT con TOP. NUNCA modificar datos.
```

---

## 📌 Notas Importantes

1. **El plan de tratamiento no viene de ALMA** — el texto del plan está en un stream protegido
   de IRIS (`websys.Document`) al que no tenemos acceso SQL. Por eso es campo manual.
2. **La entrega es por ESPECIALIDAD CLÍNICA** — cada especialidad tiene su propia página.
   Un paciente de medicina en UCI aparece en la página "Medicina", no en "UCI".
   El campo `especialidad_clinica` se deriva del servicio padre o médico tratante.
3. **Los datos de ALMA son read-only** en NocoBase — nunca se escriben de vuelta a IRIS.
4. **Ubicación vs Especialidad**: `servicio_id` = dónde está físicamente (UCI, MQ1).
   `especialidad_clinica` = a qué especialidad pertenece clínicamente (Medicina, Cirugía).
4. **Herencia de plan**: Cuando se crea una nueva entrega, el plan del turno anterior
   se copia automáticamente al nuevo. El médico solo modifica lo que cambió.
5. **Prefijo `et_`** en todas las colecciones para namespace (Entrega de Turno).
6. **Auditoría**: Toda entrega firmada es inmutable para trazabilidad clínica.
