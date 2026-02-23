# [NOMBRE_APP] - Template de Aplicación NocoBase

> 📋 Este es el template estándar para todas las aplicaciones NocoBase en MIRA.
> Copiar esta estructura para crear nuevas aplicaciones.

## Información de la Aplicación

**Nombre**: [Nombre completo de la aplicación]
**Código**: [CÓDIGO_APP] (ej: UGCO, BUHO, SGQ)
**Versión**: 0.1.0
**Estado**: 🚧 En Desarrollo
**Responsable**: [Equipo/Persona]
**Prioridad**: [Alta/Media/Baja]

## Propósito

[Descripción breve del propósito de la aplicación - 2-3 párrafos]

### Usuarios Objetivo

- [Tipo de usuario 1] - [Rol/Responsabilidad]
- [Tipo de usuario 2] - [Rol/Responsabilidad]

### Funcionalidades Principales

1. [Funcionalidad 1]
2. [Funcionalidad 2]
3. [Funcionalidad 3]

---

## Estructura de Carpetas

```
[CÓDIGO_APP]/
├── README.md                    # Este archivo
├── CHANGELOG.md                 # Registro de cambios
├── STATUS.md                    # Estado actual del proyecto
│
├── BD/                          # Base de Datos
│   ├── README_Modelo.md         # Descripción del modelo de datos
│   ├── RESUMEN-TABLAS.md        # Inventario de tablas
│   ├── colecciones/             # Definiciones de colecciones (.md)
│   ├── diccionarios/            # Diccionarios y datos maestros
│   ├── referencias/             # Tablas de referencia
│   └── data/                    # Datos de ejemplo/seed
│
├── docs/                        # Documentación
│   ├── ARQUITECTURA.md          # Arquitectura de la aplicación
│   ├── DISEÑO-UI.md             # Diseño de interfaz de usuario
│   ├── DISEÑO-TECNICO.md        # Diseño técnico
│   ├── MANUAL-USUARIO.md        # Manual de usuario
│   ├── MANUAL-TECNICO.md        # Manual técnico
│   ├── TROUBLESHOOTING.md       # Solución de problemas
│   └── arquitectura/            # Diagramas y reportes
│
├── planificacion/               # Planificación del proyecto
│   ├── PLAN-IMPLEMENTACION.md   # Plan de implementación
│   ├── ROADMAP.md               # Roadmap de features
│   └── SPRINTS.md               # Planificación de sprints
│
├── scripts/                     # Scripts de automatización
│   ├── README.md                # Catálogo de scripts
│   ├── configure/               # Scripts de configuración
│   ├── seed/                    # Scripts de seeding
│   ├── inspect/                 # Scripts de inspección
│   ├── test/                    # Scripts de testing
│   └── utils/                   # Utilidades compartidas
│
└── assets/                      # Recursos estáticos
    ├── images/                  # Imágenes y logos
    ├── mockups/                 # Mockups de UI
    └── diagrams/                # Diagramas (source)
```

---

## Modelo de Datos

### Colecciones

| Colección | Propósito | Campos | Estado |
|-----------|-----------|--------|--------|
| [nombre_coleccion] | [Descripción] | [N] | ✅/🚧/⏳ |

Ver [BD/README_Modelo.md](BD/README_Modelo.md) para detalles completos.

### Relaciones

```
[Colección A] ---< [Colección B] (hasMany)
[Colección C] >--- [Colección D] (belongsTo)
```

### Integraciones

- **ALMA/SIDRA**: [Descripción de integración read-only]
- **[Otro Sistema]**: [Descripción]

---

## Fases de Implementación

### Fase 1: Fundación (Semanas 1-2)
- [ ] Definición de modelo de datos
- [ ] Creación de colecciones base
- [ ] Configuración de relaciones
- [ ] Documentación inicial

### Fase 2: Desarrollo Core (Semanas 3-4)
- [ ] Implementación de funcionalidades principales
- [ ] Configuración de UI básica
- [ ] Seed de datos de referencia
- [ ] Tests unitarios

### Fase 3: UI y UX (Semanas 5-6)
- [ ] Diseño de interfaces
- [ ] Implementación de vistas
- [ ] Formularios y validaciones
- [ ] Navegación y menús

### Fase 4: Integración (Semanas 7-8)
- [ ] Integración con ALMA/SIDRA
- [ ] Integración con otros sistemas
- [ ] Sincronización de datos
- [ ] Tests de integración

### Fase 5: Testing y Refinamiento (Semanas 9-10)
- [ ] Testing completo
- [ ] Ajustes de UI/UX
- [ ] Optimización de performance
- [ ] Corrección de bugs

### Fase 6: Capacitación y Despliegue (Semanas 11-12)
- [ ] Manual de usuario
- [ ] Capacitación de usuarios
- [ ] Deployment a producción
- [ ] Monitoreo inicial

---

## Scripts Disponibles

### Configuración

```bash
# Configurar colecciones
node scripts/configure/setup-collections.js

# Configurar permisos
node scripts/configure/setup-permissions.js
```

### Seeding

```bash
# Cargar datos de referencia
node scripts/seed/seed-references.js

# Cargar datos de ejemplo
node scripts/seed/seed-sample-data.js
```

### Inspección

```bash
# Verificar configuración
node scripts/inspect/check-configuration.js

# Listar colecciones
node scripts/inspect/list-collections.js
```

Ver [scripts/README.md](scripts/README.md) para catálogo completo.

---

## Tecnologías

- **Platform**: NocoBase
- **Base de Datos**: PostgreSQL/MySQL (MIRA read/write)
- **Integración**: SQL Server (SIDRA read-only)
- **Scripts**: Node.js, TypeScript, Python
- **API**: NocoBase REST API

---

## Configuración

### Variables de Entorno

```env
# Copiar y configurar
cp .env.example .env
```

Variables requeridas:
```env
NOCOBASE_API_URL=https://nocobase.hospitaldeovalle.cl/api
NOCOBASE_API_TOKEN=tu_token_aqui
```

### Instalación

```bash
# Desde directorio de la aplicación
npm install

# Ejecutar configuración inicial
node scripts/configure/setup-collections.js
```

---

## Estado Actual

Ver [STATUS.md](STATUS.md) para estado detallado.

**Resumen**:
- Fase actual: [N]
- Progreso: [X%]
- Colecciones: [N] de [Total]
- Features implementadas: [N] de [Total]

---

## Roadmap

Ver [planificacion/ROADMAP.md](planificacion/ROADMAP.md).

**Próximas Features**:
1. [Feature 1]
2. [Feature 2]
3. [Feature 3]

---

## Equipo

| Rol | Nombre | Contacto |
|-----|--------|----------|
| Product Owner | [Nombre] | [Email] |
| Tech Lead | [Nombre] | [Email] |
| Developer | [Nombre] | [Email] |

---

## Recursos Adicionales

- [Documentación MIRA](../../MIRA/README.md)
- [Guía de Contribución](../../CONTRIBUTING.md)
- [Deployment Guide](../../MIRA/docs/DEPLOYMENT.md)
- [Operations Guide](../../MIRA/docs/OPERATIONS.md)

---

**Última Actualización**: [Fecha]
**Versión del Template**: 1.0.0
