# Diagnóstico Completo - Aplicación UGCO
## Unidad de Gestión de Casos Oncológicos - Hospital de Ovalle

**Fecha de Diagnóstico**: 2025-11-21
**Versión**: 1.0.0
**Estado**: Análisis Inicial

---

## 1. RESUMEN EJECUTIVO

### 1.1 Objetivo del Sistema
Desarrollar una aplicación de **Gestión y Seguimiento Oncológico** en NocoBase para el Hospital de Ovalle (Chile) que:
- Se integre con el sistema maestro ALMA (TrakCare) vía SQL intermedio
- Gestione casos oncológicos por especialidades
- Facilite el seguimiento de comités oncológicos
- Permita registro de episodios y eventos de seguimiento
- Sea escalable para albergar múltiples instancias (UGCO es la primera)

### 1.2 Contexto Tecnológico
- **Sistema Maestro**: ALMA (basado en TrakCare)
- **Plataforma de Desarrollo**: NocoBase (https://nocobase.hospitaldeovalle.cl/)
- **Capa de Integración**: MIRA Healthcare Platform
- **SQL Intermedio**: Ya conectado y disponible como fuente de datos en NocoBase
- **Principio Fundamental**: ALMA es read-only, nunca se modifica desde NocoBase

---

## 2. ANÁLISIS DE LA INFRAESTRUCTURA ACTUAL

### 2.1 Plataforma MIRA - Estado Actual

#### 2.1.1 Estructura de Directorios
```
C:\GIT\MIRA\
├── .env                              # Configuración con credenciales NocoBase
├── .env.example                      # Plantilla de configuración
├── package.json                      # Dependencias Node.js
├── test-nocobase-connection.js      # Script de prueba de conexión
│
├── src/
│   ├── api/
│   │   ├── health.js                # Health check endpoints
│   │   ├── nocobaseRoutes.js       # Rutas específicas NocoBase
│   │   └── routes.js                # Rutas generales
│   │
│   ├── config/                      # Configuraciones generales
│   │
│   ├── controllers/
│   │   └── nocobaseController.js   # Controlador NocoBase
│   │
│   ├── datawarehouse/
│   │   └── dataWarehouseManager.js # Gestor de data warehouse
│   │
│   ├── integrations/
│   │   ├── hl7/
│   │   │   └── hl7Parser.js        # Parser HL7 v2.x
│   │   ├── fhir/
│   │   │   └── fhirClient.js       # Cliente FHIR R4
│   │   └── nocobase/
│   │       └── client.js            # ✅ Cliente NocoBase (CRÍTICO)
│   │
│   ├── models/                      # Modelos de datos
│   ├── services/
│   │   ├── nocobaseService.js      # ✅ Servicio NocoBase (CRÍTICO)
│   │   └── noCodeBaseEngine.js     # Motor NoCode
│   │
│   ├── utils/                       # Utilidades
│   └── index.js                     # Punto de entrada principal
│
├── docs/
│   ├── NOCOBASE_INTEGRATION.md     # Documentación completa integración
│   └── README_NOCOBASE.md          # Guía de inicio rápido
│
├── examples/
│   └── nocobase-integration-examples.js
│
├── tests/                           # Pruebas unitarias
├── public/                          # Archivos estáticos
└── logs/                            # Logs del sistema
```

#### 2.1.2 Componentes Clave Implementados

**✅ NocoBaseClient** (`src/integrations/nocobase/client.js`)
- Cliente HTTP con axios
- Autenticación: Token API y Usuario/Contraseña
- CRUD completo sobre colecciones NocoBase
- Logging automático de requests/responses
- Interceptores de errores
- Métodos disponibles:
  - `authenticate()` - Autenticación con credenciales
  - `getCollections()` - Listar todas las colecciones
  - `getRecords(collection, params)` - Obtener registros
  - `getRecord(collection, id)` - Obtener registro por ID
  - `createRecord(collection, data)` - Crear registro
  - `updateRecord(collection, id, data)` - Actualizar registro
  - `deleteRecord(collection, id)` - Eliminar registro
  - `query(collection, query)` - Consulta personalizada
  - `batchCreate(collection, records)` - Creación por lotes
  - `getCollectionSchema(collection)` - Obtener esquema
  - `testConnection()` - Test de conexión
  - `getCurrentUser()` - Información del usuario actual

**✅ NocoBaseService** (`src/services/nocobaseService.js`)
- Singleton pattern
- Capa de lógica de negocio sobre el cliente
- Métodos específicos para entidades clínicas:
  - `syncPatients()` - Sincronizar pacientes
  - `createPatient()` - Crear paciente
  - `getAppointments()` - Obtener citas
  - `createAppointment()` - Crear cita
  - `getMedicalRecords()` - Obtener registros médicos
  - `createMedicalRecord()` - Crear registro médico
  - `getLabResults()` - Obtener resultados de laboratorio
  - `createLabResult()` - Crear resultado de laboratorio
  - `getMedications()` - Obtener medicamentos
  - `customQuery()` - Consulta personalizada
  - `batchSync()` - Sincronización por lotes
  - `healthCheck()` - Health check

**✅ Configuración Existente** (`.env`)
```env
# NocoBase Configuration (Hospital de Ovalle)
NOCOBASE_API_URL=https://nocobase.hospitaldeovalle.cl/api
NOCOBASE_API_TOKEN=eyJhbGci... (JWT válido hasta 2075)
NOCOBASE_APP_NAME=hospital_ovalle
```

#### 2.1.3 Dependencias Instaladas
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.4.0",
    "dotenv": "^16.3.1",
    "winston": "^3.9.0",        // Logging
    "sequelize": "^6.32.1",      // ORM SQL
    "pg": "^8.11.1",             // PostgreSQL
    "mysql2": "^3.5.2",          // MySQL
    "mongodb": "^5.7.0",         // MongoDB
    "redis": "^4.6.7",           // Redis
    "hl7": "^1.2.0",             // HL7 parser
    "fhir-kit-client": "^1.9.1"  // FHIR client
  }
}
```

### 2.2 Capacidades Actuales

#### ✅ Implementado y Funcional
1. **Conexión con NocoBase Hospital de Ovalle**
   - URL: https://nocobase.hospitaldeovalle.cl/api
   - Autenticación: Token JWT (rol: root, expira: 2075)
   - Test de conexión disponible

2. **Cliente HTTP NocoBase**
   - CRUD completo
   - Consultas personalizadas
   - Operaciones por lotes
   - Manejo de errores robusto
   - Logging automático

3. **Servicios de Negocio**
   - Sincronización de datos
   - Gestión de pacientes
   - Gestión de citas
   - Registros médicos
   - Resultados de laboratorio

4. **Integración HL7/FHIR**
   - Parser HL7 v2.x
   - Cliente FHIR R4
   - Conversión bidireccional

5. **Infraestructura**
   - Data warehouse híbrido
   - Caché Redis
   - Logging con Winston
   - Health checks

#### ❌ No Implementado (Pendiente para UGCO)
1. **Modelo de datos oncológico específico**
2. **Colecciones UGCO en NocoBase**
3. **Lógica de negocio oncológica**
4. **Vistas y formularios específicos UGCO**
5. **Flujos de trabajo oncológicos**
6. **Permisos y roles específicos**
7. **Reportes oncológicos**
8. **Integración con comités**

---

## 3. MODELO DE DATOS PROPUESTO

### 3.1 Arquitectura de Datos

#### 3.1.1 Principios de Diseño
1. **Separación clara**: Datos de ALMA (read-only) vs. Datos UGCO (CRUD)
2. **Nomenclatura consistente**:
   - Prefijo `alma_` para colecciones espejo de ALMA
   - Prefijo `onco_` para colecciones propias de oncología
   - Snake_case para nombres de colecciones y campos
3. **Relaciones explícitas**: Usar claves foráneas para mantener integridad referencial
4. **Auditoría completa**: Campos `created_at`, `updated_at`, `created_by`, `updated_by` en todas las colecciones UGCO

#### 3.1.2 Colecciones ALMA (Read-Only)

Estas colecciones son **vistas o tablas espejo** del SQL intermedio conectado a NocoBase. **NO se modifican desde UGCO**.

##### `alma_pacientes`
Datos demográficos oficiales de pacientes desde ALMA.

**Campos principales**:
```javascript
{
  id: number,                    // ID interno ALMA
  rut: string,                   // RUT del paciente (único)
  nombre: string,                // Nombre completo
  fecha_nacimiento: date,        // Fecha de nacimiento
  sexo: string,                  // M/F/Otro
  direccion: string,             // Dirección
  telefono: string,              // Teléfono
  email: string,                 // Email
  prevision: string,             // FONASA/ISAPRE/etc.
  created_at: datetime,          // Fecha de creación en ALMA
  updated_at: datetime           // Última actualización en ALMA
}
```

##### `alma_episodios`
Episodios clínicos (ingresos, consultas, procedimientos) desde ALMA.

**Campos principales**:
```javascript
{
  id: number,                    // ID interno ALMA
  id_paciente: number,           // FK -> alma_pacientes.id
  tipo_episodio: string,         // Hospitalización/Consulta/Procedimiento
  fecha_inicio: datetime,        // Fecha de inicio
  fecha_fin: datetime,           // Fecha de fin (null si activo)
  servicio: string,              // Servicio clínico
  estado: string,                // Activo/Cerrado/Anulado
  created_at: datetime,
  updated_at: datetime
}
```

##### `alma_diagnosticos`
Diagnósticos clínicos oficiales (CIE-10) desde ALMA.

**Campos principales**:
```javascript
{
  id: number,                    // ID interno ALMA
  id_episodio: number,           // FK -> alma_episodios.id
  id_paciente: number,           // FK -> alma_pacientes.id
  codigo_cie10: string,          // Código CIE-10
  descripcion: string,           // Descripción del diagnóstico
  tipo: string,                  // Principal/Secundario
  fecha_diagnostico: datetime,   // Fecha del diagnóstico
  created_at: datetime,
  updated_at: datetime
}
```

#### 3.1.3 Colecciones UGCO (Read/Write)

Estas colecciones son **propias de la aplicación UGCO** y se crean en el esquema de NocoBase con permisos completos de CRUD.

##### `onco_especialidades`
Catálogo de especialidades oncológicas.

**Campos**:
```javascript
{
  id: number,                    // PK autoincremental
  nombre: string,                // Ej: "Digestivo alto", "Digestivo bajo", "Mama"
  descripcion: text,             // Descripción detallada
  codigo: string,                // Código interno único
  color: string,                 // Color para UI (hex: #FF5733)
  activo: boolean,               // true/false
  orden: number,                 // Para ordenamiento en UI
  created_at: datetime,
  updated_at: datetime,
  created_by: number,            // FK -> users.id
  updated_by: number             // FK -> users.id
}
```

**Valores iniciales sugeridos**:
- Digestivo alto
- Digestivo bajo
- Mama
- Ginecológico
- Urológico
- Pulmón
- Cabeza y cuello
- Hematología
- Melanoma y piel
- Otros tumores sólidos

##### `onco_casos`
Casos oncológicos principales. **Es la entidad central de UGCO**.

**Campos**:
```javascript
{
  id: number,                    // PK autoincremental
  codigo_caso: string,           // Código único generado (ej: "UGCO-2024-001")

  // Referencias a ALMA (read-only)
  id_paciente_alma: number,      // FK -> alma_pacientes.id (REQUERIDO)
  id_episodio_indice: number,    // FK -> alma_episodios.id (opcional, episodio índice)
  id_diagnostico_indice: number, // FK -> alma_diagnosticos.id (opcional, diagnóstico índice)

  // Datos propios del caso
  fecha_ingreso_ugco: date,      // Fecha de ingreso al seguimiento UGCO
  estado: string,                // "Activo", "Seguimiento", "Alta", "Fallecido", "Perdido"

  // Información oncológica
  tipo_tumor: string,            // Clasificación del tumor
  estadio: string,               // Estadio TNM
  histologia: string,            // Tipo histológico

  // Equipo y responsables
  medico_tratante: number,       // FK -> users.id
  enfermera_gestora: number,     // FK -> users.id

  // Metadata
  observaciones: text,           // Notas generales del caso
  activo: boolean,               // true/false
  created_at: datetime,
  updated_at: datetime,
  created_by: number,
  updated_by: number
}
```

**Índices sugeridos**:
- Único: `codigo_caso`
- Index: `id_paciente_alma`, `estado`, `fecha_ingreso_ugco`

##### `onco_caso_especialidades`
Relación N:N entre casos y especialidades. **Un caso puede pertenecer a múltiples especialidades**.

**Campos**:
```javascript
{
  id: number,                    // PK autoincremental
  id_caso: number,               // FK -> onco_casos.id (REQUERIDO)
  id_especialidad: number,       // FK -> onco_especialidades.id (REQUERIDO)
  es_principal: boolean,         // true si es la especialidad principal
  fecha_asignacion: date,        // Fecha de asignación
  activo: boolean,               // true/false
  created_at: datetime,
  updated_at: datetime,
  created_by: number,
  updated_by: number
}
```

**Restricciones**:
- Unique constraint: (`id_caso`, `id_especialidad`)
- Solo puede haber un registro con `es_principal = true` por caso

##### `onco_episodios`
Episodios oncológicos específicos (cirugías, quimioterapias, radioterapias, etc.).

**Campos**:
```javascript
{
  id: number,                    // PK autoincremental
  id_caso: number,               // FK -> onco_casos.id (REQUERIDO)
  id_especialidad: number,       // FK -> onco_especialidades.id

  tipo_episodio: string,         // "Cirugía", "Quimioterapia", "Radioterapia", "Consulta", "Hospitalización"
  fecha_inicio: datetime,        // Fecha de inicio del episodio
  fecha_fin: datetime,           // Fecha de fin (null si en curso)

  // Detalles del episodio
  descripcion: text,             // Descripción detallada
  resultado: text,               // Resultado del episodio
  profesional_responsable: number, // FK -> users.id
  lugar: string,                 // Lugar donde se realizó

  // Referencias a ALMA (opcional)
  id_episodio_alma: number,      // FK -> alma_episodios.id (si corresponde)

  estado: string,                // "Planificado", "En curso", "Completado", "Cancelado"
  activo: boolean,
  created_at: datetime,
  updated_at: datetime,
  created_by: number,
  updated_by: number
}
```

##### `onco_comite_sesiones`
Sesiones del comité oncológico.

**Campos**:
```javascript
{
  id: number,                    // PK autoincremental
  codigo_sesion: string,         // Código único (ej: "COM-2024-05-15")
  fecha_sesion: datetime,        // Fecha y hora de la sesión
  tipo_comite: string,           // "Regular", "Extraordinario", "Urgente"
  lugar: string,                 // Lugar de la sesión

  // Asistencia
  asistentes: json,              // Array de IDs de usuarios asistentes
  moderador: number,             // FK -> users.id

  // Estado
  estado: string,                // "Programado", "En curso", "Finalizado", "Cancelado"
  acta: text,                    // Acta de la sesión

  created_at: datetime,
  updated_at: datetime,
  created_by: number,
  updated_by: number
}
```

##### `onco_comite_casos`
Casos discutidos en cada sesión del comité.

**Campos**:
```javascript
{
  id: number,                    // PK autoincremental
  id_sesion: number,             // FK -> onco_comite_sesiones.id (REQUERIDO)
  id_caso: number,               // FK -> onco_casos.id (REQUERIDO)

  orden: number,                 // Orden de presentación en la sesión
  motivo_presentacion: text,     // Por qué se presenta el caso
  resumen_presentacion: text,    // Resumen de lo discutido
  decision: text,                // Decisión del comité
  recomendaciones: text,         // Recomendaciones específicas

  estado: string,                // "Pendiente", "Presentado", "Derivado"
  created_at: datetime,
  updated_at: datetime,
  created_by: number,
  updated_by: number
}
```

##### `onco_seguimiento_eventos`
Eventos de seguimiento por especialidad.

**Campos**:
```javascript
{
  id: number,                    // PK autoincremental
  id_caso: number,               // FK -> onco_casos.id (REQUERIDO)
  id_especialidad: number,       // FK -> onco_especialidades.id

  tipo_evento: string,           // "Consulta", "Examen", "Resultado", "Complicación", "Nota"
  fecha_evento: datetime,        // Fecha del evento
  descripcion: text,             // Descripción del evento

  // Resultados y seguimiento
  resultado: text,               // Resultado o hallazgo
  conducta: text,                // Conducta a seguir
  proximo_control: date,         // Fecha del próximo control

  profesional: number,           // FK -> users.id (profesional que registra)
  activo: boolean,
  created_at: datetime,
  updated_at: datetime,
  created_by: number,
  updated_by: number
}
```

### 3.2 Diagrama de Relaciones

```
┌─────────────────────┐
│  alma_pacientes     │ (Read-Only)
│  ─────────────────  │
│  • id               │
│  • rut              │
│  • nombre           │
│  • ...              │
└──────────┬──────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐
│  alma_episodios     │ (Read-Only)
│  ─────────────────  │
│  • id               │
│  • id_paciente      │
│  • tipo_episodio    │
└──────────┬──────────┘
           │
           │ 1:N
           ▼
┌─────────────────────┐
│  alma_diagnosticos  │ (Read-Only)
│  ─────────────────  │
│  • id               │
│  • id_episodio      │
│  • codigo_cie10     │
└──────────┬──────────┘
           │
           │ Referencias
           │
           ▼
┌─────────────────────────────────────────────┐
│  onco_casos                                 │ (Read/Write) ⭐ ENTIDAD CENTRAL
│  ───────────────────────────────────────    │
│  • id                                       │
│  • codigo_caso                              │
│  • id_paciente_alma ────────────────┐       │
│  • id_episodio_indice               │       │
│  • id_diagnostico_indice            │       │
│  • estado                           │       │
│  • medico_tratante                  │       │
└─────────┬───────────────────────────┘       │
          │                                   │
          │ N:N                               │ 1:N
          ▼                                   │
┌─────────────────────┐                       │
│ onco_especialidades │ (Read/Write)          │
│ ─────────────────── │                       │
│ • id                │                       │
│ • nombre            │◄──────┐               │
│ • codigo            │       │               │
└─────────┬───────────┘       │               │
          │                   │               │
          │ N:N               │               │
          ▼                   │               │
┌───────────────────────┐     │               │
│ onco_caso_especialida │     │               │
│ ───────────────────── │     │               │
│ • id_caso             │     │               │
│ • id_especialidad     │     │               │
│ • es_principal        │     │               │
└───────────────────────┘     │               │
                              │               │
          ┌───────────────────┴───────────────┤
          │                                   │
          │ 1:N                               │ 1:N
          ▼                                   ▼
┌─────────────────────┐           ┌─────────────────────┐
│ onco_episodios      │           │ onco_seguimiento_ev │
│ ─────────────────── │           │ ─────────────────── │
│ • id                │           │ • id                │
│ • id_caso           │           │ • id_caso           │
│ • tipo_episodio     │           │ • id_especialidad   │
│ • fecha_inicio      │           │ • tipo_evento       │
└─────────────────────┘           └─────────────────────┘

          ┌───────────────────────────────────┐
          │ 1:N                               │ 1:N
          ▼                                   ▼
┌─────────────────────┐           ┌─────────────────────┐
│ onco_comite_sesione │           │ onco_comite_casos   │
│ ─────────────────── │   1:N     │ ─────────────────── │
│ • id                │───────────│ • id_sesion         │
│ • fecha_sesion      │           │ • id_caso           │
│ • estado            │           │ • decision          │
└─────────────────────┘           └─────────────────────┘
```

---

## 4. ARQUITECTURA DEL SISTEMA

### 4.1 Capas de la Aplicación

```
┌────────────────────────────────────────────────────────────────┐
│                     USUARIOS CLÍNICOS                          │
│         (Médicos, Enfermeras, Gestores de Casos)               │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                   CAPA DE PRESENTACIÓN                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        NocoBase UI (Frontend)                            │  │
│  │  • Vistas de casos oncológicos                           │  │
│  │  • Formularios de ingreso/edición                        │  │
│  │  • Dashboards por especialidad                           │  │
│  │  • Filtros y búsquedas                                   │  │
│  │  • Calendarios de comités                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────┐
│              CAPA DE API / LÓGICA DE NEGOCIO                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        NocoBase API                                       │  │
│  │  • REST API nativa de NocoBase                           │  │
│  │  • Endpoints /collections:list, :create, :update, etc.   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                       │
│                         ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        MIRA Healthcare Platform (opcional)               │  │
│  │  • NocoBaseService (lógica de negocio adicional)         │  │
│  │  • Validaciones oncológicas                              │  │
│  │  • Cálculos y métricas                                   │  │
│  │  • Sincronización batch                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────────┐
│                   CAPA DE DATOS                                │
│                                                                 │
│  ┌─────────────────────┐        ┌─────────────────────┐        │
│  │  NocoBase Database  │        │  SQL Intermedio     │        │
│  │  ─────────────────  │        │  ─────────────────  │        │
│  │  • onco_casos       │        │  • alma_pacientes   │        │
│  │  • onco_episodios   │        │  • alma_episodios   │        │
│  │  • onco_comite_*    │        │  • alma_diagnosticos│        │
│  │  • onco_seguimiento │        │    (Read-Only)      │        │
│  │  (Read/Write)       │        └──────────┬──────────┘        │
│  └─────────────────────┘                   │                   │
│                                            │                   │
└────────────────────────────────────────────┼───────────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────┐
                              │   SISTEMA MAESTRO ALMA   │
                              │   (TrakCare)             │
                              │   NO SE MODIFICA         │
                              └──────────────────────────┘
```

### 4.2 Flujo de Datos

#### 4.2.1 Lectura de Datos de ALMA
```
ALMA (TrakCare)
  │
  └──> SQL Intermedio (sincronización automática o periódica)
         │
         └──> NocoBase (vista/tabla espejo: alma_*)
                │
                └──> Frontend NocoBase (solo lectura)
```

#### 4.2.2 Escritura de Datos UGCO
```
Usuario UGCO
  │
  └──> Frontend NocoBase (formularios)
         │
         └──> NocoBase API (/onco_casos:create, :update, etc.)
                │
                └──> NocoBase Database (onco_*)
```

#### 4.2.3 Flujo Completo: Crear Caso Oncológico
```
1. Usuario selecciona paciente desde alma_pacientes (read-only)
2. Usuario completa formulario de nuevo caso oncológico
3. Frontend envía POST /onco_casos:create con:
   {
     id_paciente_alma: 12345,
     fecha_ingreso_ugco: "2024-01-15",
     estado: "Activo",
     tipo_tumor: "Adenocarcinoma gástrico",
     medico_tratante: 67
   }
4. NocoBase crea registro en onco_casos
5. Usuario asigna especialidades via POST /onco_caso_especialidades:create
6. Sistema genera código único del caso (ej: UGCO-2024-001)
7. Caso queda disponible en vistas y dashboards
```

---

## 5. ANÁLISIS DE DEPENDENCIAS Y TECNOLOGÍAS

### 5.1 Stack Tecnológico Completo

#### 5.1.1 Backend
| Componente | Tecnología | Versión | Estado | Propósito UGCO |
|------------|-----------|---------|--------|----------------|
| **Runtime** | Node.js | >=16.0.0 | ✅ | Runtime para MIRA (opcional) |
| **Framework** | Express.js | 4.18.2 | ✅ | API REST de MIRA (opcional) |
| **ORM SQL** | Sequelize | 6.32.1 | ✅ | Acceso a data warehouse (opcional) |
| **NocoBase** | NocoBase | - | ✅ | **Plataforma principal UGCO** |
| **DB SQL** | PostgreSQL/MySQL | - | ✅ | Base de datos de NocoBase |
| **Caché** | Redis | 6.0+ | ✅ | Caché de MIRA (opcional) |

#### 5.1.2 Frontend
| Componente | Tecnología | Estado | Propósito UGCO |
|------------|-----------|--------|----------------|
| **UI Framework** | NocoBase UI | ✅ | **Interface principal UGCO** |
| **Componentes** | React (interno NocoBase) | ✅ | Componentes de formularios y vistas |

#### 5.1.3 Integración
| Componente | Tecnología | Versión | Estado | Propósito UGCO |
|------------|-----------|---------|--------|----------------|
| **HTTP Client** | Axios | 1.4.0 | ✅ | Cliente HTTP de MIRA a NocoBase |
| **Logging** | Winston | 3.9.0 | ✅ | Logs de integración |
| **HL7 Parser** | hl7 | 1.2.0 | ✅ | Futuro: Integración HL7 con ALMA |
| **FHIR Client** | fhir-kit-client | 1.9.1 | ✅ | Futuro: Interoperabilidad FHIR |

### 5.2 Dependencias Críticas para UGCO

#### 5.2.1 Obligatorias
- **NocoBase**: Plataforma principal (ya instalada y configurada)
- **SQL Intermedio de ALMA**: Ya conectado como fuente de datos

#### 5.2.2 Opcionales (MIRA)
- **MIRA Platform**: Solo si se requiere lógica de negocio adicional compleja
- Validaciones personalizadas oncológicas
- Reportes complejos
- Integraciones adicionales (HL7, FHIR)

---

## 6. ESTADO ACTUAL DEL PROYECTO UGCO

### 6.1 Archivos Existentes

```
C:\GIT\MIRA\UGCO\
└── Promp.txt  (Prompt con requisitos iniciales)
```

### 6.2 Requisitos Documentados (Promp.txt)

#### ✅ Claramente Definido
1. **Contexto**: Sistema para Hospital de Ovalle, integración con ALMA vía SQL
2. **Principios**: ALMA read-only, datos oncológicos en NocoBase
3. **Modelo de datos**: Colecciones alma_* y onco_* bien definidas
4. **Relaciones**: Estructura de relaciones clara
5. **Nomenclatura**: snake_case, prefijos consistentes

#### ⚠️ Requiere Definición Adicional
1. **Roles y permisos**: Definir roles clínicos específicos
2. **Flujos de trabajo**: Detallar procesos de negocio paso a paso
3. **Reglas de negocio**: Validaciones, cálculos, automatizaciones
4. **Vistas e interfaces**: Mockups o wireframes de UI
5. **Reportes requeridos**: Especificar indicadores y reportes
6. **Integraciones adicionales**: Definir si se requieren otras integraciones
7. **Migraciones**: Estrategia para cargar datos históricos (si aplica)

### 6.3 Brechas Identificadas

#### 6.3.1 Documentación
- ❌ No existe documentación de arquitectura
- ❌ No existe diccionario de datos formal
- ❌ No existe registro de cambios (CHANGELOG)
- ❌ No existen guías de usuario
- ❌ No existe plan de pruebas

#### 6.3.2 Código
- ❌ No existe código específico UGCO
- ❌ No existen servicios oncológicos en MIRA
- ❌ No existen validaciones de negocio oncológicas
- ❌ No existen scripts de creación de colecciones NocoBase

#### 6.3.3 Configuración
- ❌ No existe configuración específica UGCO en .env
- ❌ No existen scripts de inicialización de datos maestros

#### 6.3.4 Base de Datos
- ❌ No existen colecciones onco_* creadas en NocoBase
- ❌ No existe esquema de permisos configurado

---

## 7. PRÓXIMOS PASOS RECOMENDADOS

### 7.1 Fase 1: Fundación (Semana 1-2)

#### 7.1.1 Documentación Base
- [x] Diagnóstico completo (este documento)
- [ ] Diccionario de datos completo
- [ ] Documento de arquitectura detallada
- [ ] Documento de requisitos funcionales
- [ ] Plan de implementación en fases

#### 7.1.2 Infraestructura
- [ ] Crear estructura de directorios UGCO en C:\GIT\MIRA\UGCO
- [ ] Configurar variables de entorno específicas UGCO
- [ ] Configurar logging específico
- [ ] Crear repositorio de documentación

### 7.2 Fase 2: Modelo de Datos (Semana 2-3)

#### 7.2.1 Colecciones ALMA
- [ ] Verificar existencia de tablas/vistas alma_* en SQL intermedio
- [ ] Documentar esquema actual de ALMA
- [ ] Crear vistas en NocoBase para alma_pacientes, alma_episodios, alma_diagnosticos
- [ ] Configurar permisos read-only

#### 7.2.2 Colecciones UGCO
- [ ] Crear colección onco_especialidades
- [ ] Crear colección onco_casos
- [ ] Crear colección onco_caso_especialidades
- [ ] Crear colección onco_episodios
- [ ] Crear colección onco_comite_sesiones
- [ ] Crear colección onco_comite_casos
- [ ] Crear colección onco_seguimiento_eventos
- [ ] Configurar relaciones entre colecciones
- [ ] Configurar permisos CRUD por rol

### 7.3 Fase 3: Servicios de Negocio (Semana 3-4)

#### 7.3.1 Servicios MIRA (opcional)
- [ ] Crear `src/services/ugcoService.js`
- [ ] Implementar lógica de negocio oncológica
- [ ] Crear validaciones personalizadas
- [ ] Implementar generación de código de caso
- [ ] Crear cálculos de métricas oncológicas

#### 7.3.2 API Endpoints (opcional)
- [ ] Crear rutas API específicas UGCO
- [ ] Implementar endpoints de reportes
- [ ] Configurar autenticación y autorización

### 7.4 Fase 4: Frontend NocoBase (Semana 4-6)

#### 7.4.1 Vistas de Casos
- [ ] Diseñar vista de listado de casos
- [ ] Diseñar formulario de creación de caso
- [ ] Diseñar formulario de edición de caso
- [ ] Implementar filtros por especialidad
- [ ] Implementar búsqueda de casos

#### 7.4.2 Vistas de Comité
- [ ] Diseñar vista de sesiones de comité
- [ ] Diseñar formulario de creación de sesión
- [ ] Diseñar vista de casos en sesión
- [ ] Implementar actas de comité

#### 7.4.3 Vistas de Seguimiento
- [ ] Diseñar vista de eventos de seguimiento
- [ ] Diseñar formulario de registro de evento
- [ ] Implementar calendario de seguimientos

#### 7.4.4 Dashboards
- [ ] Dashboard general UGCO
- [ ] Dashboard por especialidad
- [ ] Dashboard de comités
- [ ] Indicadores y métricas

### 7.5 Fase 5: Configuración de Permisos (Semana 6)

#### 7.5.1 Roles
- [ ] Definir roles: Médico Oncólogo, Enfermera Gestora, Administrativo, Auditor
- [ ] Crear roles en NocoBase
- [ ] Asignar usuarios a roles

#### 7.5.2 Permisos
- [ ] Configurar permisos read-only en alma_*
- [ ] Configurar permisos CRUD en onco_* por rol
- [ ] Configurar permisos a nivel de campo
- [ ] Configurar permisos a nivel de registro

### 7.6 Fase 6: Datos Maestros (Semana 7)

#### 7.6.1 Catálogos
- [ ] Cargar especialidades oncológicas
- [ ] Configurar tipos de episodios
- [ ] Configurar tipos de eventos de seguimiento
- [ ] Configurar estados de casos

### 7.7 Fase 7: Pruebas (Semana 7-8)

#### 7.7.1 Pruebas Funcionales
- [ ] Crear casos de prueba
- [ ] Pruebas de CRUD en todas las colecciones
- [ ] Pruebas de permisos
- [ ] Pruebas de flujos de trabajo completos

#### 7.7.2 Pruebas de Integración
- [ ] Pruebas de lectura desde ALMA
- [ ] Pruebas de relaciones entre colecciones
- [ ] Pruebas de reportes

### 7.8 Fase 8: Capacitación y Despliegue (Semana 9-10)

#### 7.8.1 Documentación de Usuario
- [ ] Manual de usuario
- [ ] Guías de procedimientos
- [ ] FAQs

#### 7.8.2 Capacitación
- [ ] Capacitación a médicos oncólogos
- [ ] Capacitación a enfermeras gestoras
- [ ] Capacitación a administrativos

#### 7.8.3 Despliegue
- [ ] Piloto con un grupo reducido
- [ ] Recolección de feedback
- [ ] Ajustes finales
- [ ] Despliegue general

---

## 8. RIESGOS Y MITIGACIONES

### 8.1 Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **SQL intermedio no tiene todos los datos necesarios de ALMA** | Media | Alto | Coordinar con TI para crear vistas adicionales antes de iniciar desarrollo |
| **Permisos insuficientes en NocoBase** | Baja | Alto | Validar permisos de token API root antes de comenzar |
| **Rendimiento de consultas complejas** | Media | Medio | Implementar índices adecuados, usar caché Redis si es necesario |
| **Conflictos de integridad referencial** | Baja | Medio | Definir constraints claros en el modelo de datos |
| **Pérdida de conexión con ALMA** | Media | Alto | Implementar mecanismos de retry, alertas de monitoreo |

### 8.2 Riesgos Funcionales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Requisitos oncológicos incompletos** | Alta | Alto | Realizar talleres con oncólogos antes de desarrollar |
| **Cambios en flujos de trabajo durante desarrollo** | Media | Medio | Desarrollo iterativo con validación continua |
| **Resistencia al cambio de usuarios** | Media | Alto | Capacitación temprana, piloto con early adopters |
| **Falta de datos históricos** | Baja | Medio | Definir estrategia de migración de datos históricos |

### 8.3 Riesgos de Proyecto

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Falta de disponibilidad de usuarios clave** | Media | Medio | Planificar sesiones con anticipación, grabar sesiones |
| **Cambios en prioridades del hospital** | Baja | Alto | Mantener comunicación constante con sponsor del proyecto |
| **Falta de recursos de desarrollo** | Baja | Alto | Priorizar funcionalidades core, desarrollo en fases |

---

## 9. RECURSOS NECESARIOS

### 9.1 Recursos Humanos

#### 9.1.1 Equipo de Desarrollo
- **Desarrollador Backend**: 1 persona (Node.js, NocoBase API)
- **Desarrollador Frontend**: 1 persona (NocoBase UI, React)
- **DBA**: 0.5 persona (diseño de modelo de datos, optimización)
- **QA**: 0.5 persona (pruebas funcionales)
- **Duración estimada**: 10 semanas

#### 9.1.2 Equipo Clínico (SME - Subject Matter Experts)
- **Médico Oncólogo**: 2-3 horas/semana (validación de requisitos)
- **Enfermera Gestora de Casos**: 2-3 horas/semana (validación de flujos)
- **Administrativo**: 1-2 horas/semana (validación de reportes)

#### 9.1.3 Equipo de TI Hospital
- **Administrador SQL/ALMA**: Disponibilidad para crear vistas adicionales
- **Administrador NocoBase**: Soporte en configuración de permisos

### 9.2 Recursos Técnicos

#### 9.2.1 Ya Disponibles ✅
- Servidor NocoBase Hospital de Ovalle
- Token API con permisos root
- Cliente MIRA funcionando
- SQL intermedio de ALMA

#### 9.2.2 Por Confirmar
- Acceso a documentación técnica de ALMA
- Esquema de datos de SQL intermedio
- Catálogos de valores (CIE-10, especialidades, etc.)

---

## 10. MÉTRICAS DE ÉXITO

### 10.1 Métricas Técnicas
- ✅ Tiempo de respuesta de consultas < 2 segundos
- ✅ Disponibilidad del sistema > 99%
- ✅ Sincronización de datos ALMA sin errores
- ✅ 0 modificaciones no autorizadas a datos de ALMA

### 10.2 Métricas Funcionales
- ✅ 100% de casos oncológicos registrados en UGCO
- ✅ Reducción de 50% en tiempo de preparación de comités
- ✅ Trazabilidad completa de seguimiento de pacientes
- ✅ Reportes automáticos generados en < 5 segundos

### 10.3 Métricas de Adopción
- ✅ 80% de usuarios activos después de 1 mes
- ✅ < 5 incidencias críticas en el primer mes
- ✅ Satisfacción de usuarios > 7/10

---

## 11. CONCLUSIONES

### 11.1 Fortalezas del Proyecto
1. **Infraestructura sólida**: MIRA y NocoBase ya funcionando
2. **Integración con ALMA ya existente**: SQL intermedio disponible
3. **Token API con permisos completos**: No hay restricciones técnicas
4. **Modelo de datos bien definido**: Requisitos claros en Promp.txt
5. **Separación clara de responsabilidades**: ALMA read-only vs. UGCO read/write

### 11.2 Desafíos Principales
1. **Validación de requisitos oncológicos**: Necesita input de expertos clínicos
2. **Diseño de UI/UX**: Requiere diseño centrado en el usuario clínico
3. **Gestión del cambio**: Adopción por parte del equipo oncológico
4. **Calidad de datos**: Dependencia de la calidad de datos en ALMA

### 11.3 Recomendación Final
**El proyecto UGCO es técnicamente viable y está bien posicionado para el éxito.**

Se recomienda:
1. **Iniciar con Fase 1-2**: Fundación y modelo de datos (4 semanas)
2. **Validar con usuarios clínicos antes de Fase 4**: Asegurar que la UI cumple necesidades
3. **Desarrollo iterativo**: Liberar funcionalidades en fases para feedback temprano
4. **Priorizar la capacitación**: Invertir tiempo en entrenar a usuarios

---

## 12. ANEXOS

### 12.1 Enlaces Útiles
- **NocoBase Hospital Ovalle**: https://nocobase.hospitaldeovalle.cl/
- **Documentación NocoBase**: https://docs.nocobase.com
- **MIRA Docs**: C:\GIT\MIRA\docs\

### 12.2 Contactos Clave
- TBD: Sponsor del proyecto
- TBD: Líder equipo oncología
- TBD: Administrador NocoBase

### 12.3 Historial de Revisiones
| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0.0 | 2025-11-21 | Claude Code | Diagnóstico inicial completo |

---

**Documento generado por**: Claude Code
**Fecha**: 2025-11-21
**Estado**: DRAFT - Pendiente de revisión con stakeholders
