# BUHO - Gestion de Pacientes Hospitalizados

> Visualizacion y gestion del flujo de pacientes hospitalizados en el
> Hospital Dr. Antonio Tirado Lanas de Ovalle.

## Informacion de la Aplicacion

**Nombre**: BUHO - Gestion de Pacientes
**Codigo**: BUHO
**Version**: 0.1.0
**Estado**: En Desarrollo
**Prioridad**: Media

## Proposito

BUHO proporciona una interfaz visual para la gestion del flujo de pacientes
hospitalizados, permitiendo visualizar rapidamente su ubicacion, estado clinico
y plan de trabajo. Incluye un motor de reglas que automaticamente clasifica el
riesgo y prioriza acciones pendientes.

### Usuarios Objetivo

- **Medicos tratantes** - Gestion de planes de trabajo y altas
- **Enfermeria** - Seguimiento de estado de pacientes y camas
- **Jefaturas clinicas** - Dashboard de metricas y ocupacion

### Funcionalidades Principales

1. Vista Kanban de pacientes agrupados por estado de plan (Pendiente, En Curso, Listo para Alta)
2. Ficha detallada por paciente (datos clinicos, ubicacion, plan de trabajo)
3. Dashboard con metricas de ocupacion, riesgos y distribucion por servicio
4. Motor de reglas automatico que evalua riesgo y proximas acciones cada 5 minutos
5. Listado tabular para busquedas rapidas

## Estructura de Carpetas

```
BUHO/
├── README.md                    # Este archivo
├── CHANGELOG.md                 # Registro de cambios
├── STATUS.md                    # Estado actual del proyecto
├── .env.example                 # Configuracion de entorno
│
├── BD/                          # Base de Datos
│   └── BUHO_Pacientes.md       # DDL y modelo de datos
│
├── backend/                     # Servicio backend
│   ├── package.json             # Dependencias Node.js
│   ├── tsconfig.json            # Config TypeScript
│   ├── scripts/                 # Scripts de deploy
│   │   ├── register-collection.ts  # Registra coleccion en NocoBase
│   │   ├── create-ui.ts            # Crea pagina UI en NocoBase
│   │   └── init-db.ts              # Inicializa schema PostgreSQL
│   └── src/                     # Codigo fuente
│       ├── server.ts            # Express server (puerto 3001)
│       ├── schema.sql           # DDL PostgreSQL
│       └── services/
│           ├── planService.ts   # Motor de reglas de plan
│           └── logger.ts        # Winston logger
│
└── docs/                        # Documentacion
    └── DISEÑO-INTERFAZ-USUARIO.md  # Diseno de UI
```

## Modelo de Datos

### Coleccion: `buho_pacientes`

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| nombre | VARCHAR(255) | Nombre del paciente |
| rut | VARCHAR(20) | RUT del paciente |
| servicio | VARCHAR(100) | Servicio hospitalario |
| sala | VARCHAR(50) | Sala de hospitalizacion |
| cama | VARCHAR(50) | Numero de cama |
| tipo_cama | VARCHAR(50) | Tipo de cama |
| diagnostico_principal | TEXT | Diagnostico principal |
| fecha_ingreso | TIMESTAMP | Fecha de ingreso |
| fecha_probable_alta | DATE | Fecha estimada de alta |
| categorizacion | VARCHAR(50) | Categorizacion clinica (C1, C2, C3) |
| estado_plan | VARCHAR(50) | Pendiente / En Curso / Listo para Alta |
| riesgo_detectado | VARCHAR(50) | Alto / Medio / Bajo |
| proxima_accion | TEXT | Siguiente accion requerida |
| estudios_pendientes | TEXT | Estudios pendientes |

### Reglas de Clasificacion Automatica

- **C1/C2** (categorizacion) → Riesgo Alto
- Estudios pendientes no vacios → Ajuste de proxima accion
- Fecha probable de alta proxima → Prioriza para revision

## Stack Tecnologico

- **Backend**: Express 5.x + TypeScript + PostgreSQL (pg)
- **Frontend**: NocoBase UI (Kanban, Detail, Dashboard)
- **Logging**: Winston (error.log, combined.log)
- **Integracion**: NocoBase API para CRUD de pacientes

## Deploy

```bash
# Inicializar base de datos PostgreSQL
npx ts-node Apps/BUHO/backend/scripts/init-db.ts

# Registrar coleccion en NocoBase
npx ts-node Apps/BUHO/backend/scripts/register-collection.ts

# Crear pagina UI en NocoBase
npx ts-node Apps/BUHO/backend/scripts/create-ui.ts

# Iniciar servicio backend
npx ts-node Apps/BUHO/backend/src/server.ts
```

## Referencia

- UI Design: `docs/DISEÑO-INTERFAZ-USUARIO.md`
- Data Model: `BD/BUHO_Pacientes.md`
- Template: `Apps/_APP_TEMPLATE/`
