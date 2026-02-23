# UGCO - Unidad de Gestión de Casos Oncológicos
## Hospital de Ovalle - Chile

![Estado](https://img.shields.io/badge/Estado-Planificación-blue)
![Versión](https://img.shields.io/badge/Versión-1.0.0-green)
![Plataforma](https://img.shields.io/badge/Plataforma-NocoBase-orange)

---

## 📋 Descripción

**UGCO** (Unidad de Gestión de Casos Oncológicos) es un sistema integral de gestión y seguimiento de pacientes oncológicos desarrollado sobre **NocoBase** para el Hospital de Ovalle.

El sistema se integra con **ALMA** (TrakCare), el sistema maestro de registro clínico del hospital, y permite:

- ✅ Gestión completa de casos oncológicos por especialidad
- ✅ Seguimiento longitudinal de pacientes
- ✅ Gestión de episodios oncológicos (cirugías, quimioterapias, radioterapias)
- ✅ Organización de comités oncológicos
- ✅ Registro de eventos de seguimiento
- ✅ Dashboards y métricas oncológicas
- ✅ Integración read-only con datos clínicos de ALMA

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIOS CLÍNICOS                        │
│        (Médicos, Enfermeras, Gestores de Casos)            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  NocoBase Frontend (UI)                     │
│  • Vistas de casos • Formularios • Dashboards • Reportes   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    NocoBase API                             │
└────────────┬───────────────────────────────────┬────────────┘
             │                                   │
             ▼                                   ▼
┌──────────────────────┐           ┌──────────────────────────┐
│  NocoBase Database   │           │   SQL Intermedio ALMA    │
│  ─────────────────   │           │   ───────────────────    │
│  • onco_casos        │           │   • alma_pacientes       │
│  • onco_episodios    │           │   • alma_episodios       │
│  • onco_comite_*     │           │   • alma_diagnosticos    │
│  • onco_seguimiento  │           │   (Read-Only)            │
│  (Read/Write)        │           └──────────┬───────────────┘
└──────────────────────┘                      │
                                              ▼
                                   ┌────────────────────────┐
                                   │  SISTEMA MAESTRO ALMA  │
                                   │  (TrakCare)            │
                                   │  NO SE MODIFICA        │
                                   └────────────────────────┘
```

**Principio Fundamental**: ALMA es **read-only**. Nunca se modifica desde UGCO.

---

## 📚 Documentación

### Documentos Principales

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| **[DIAGNOSTICO-COMPLETO.md](docs/DIAGNOSTICO-COMPLETO.md)** | Diagnóstico completo del sistema, análisis de infraestructura, arquitectura | ✅ Completo |
| **[DICCIONARIO-DATOS.md](docs/modelo-datos/DICCIONARIO-DATOS.md)** | Diccionario completo de datos: 10 colecciones, campos, tipos, relaciones | ✅ Completo |
| **[PLAN-IMPLEMENTACION.md](planificacion/PLAN-IMPLEMENTACION.md)** | Plan estructurado de implementación en 8 fases (10 semanas) | ✅ Completo |
| **[CHANGELOG.md](CHANGELOG.md)** | Registro de cambios del proyecto | ✅ Completo |

### Estructura de Documentación

```
UGCO/
├── README.md (este archivo)
├── CHANGELOG.md
│
├── docs/
│   ├── DIAGNOSTICO-COMPLETO.md
│   │
│   ├── arquitectura/
│   │   └── (documentos de arquitectura)
│   │
│   ├── modelo-datos/
│   │   ├── DICCIONARIO-DATOS.md
│   │   └── (diagramas ER)
│   │
│   ├── diccionarios/
│   │   └── (diccionarios específicos)
│   │
│   └── api/
│       └── (documentación de API)
│
└── planificacion/
    └── PLAN-IMPLEMENTACION.md
```

---

## 🗄️ Modelo de Datos

### Colecciones ALMA (Read-Only)

| Colección | Descripción | Campos |
|-----------|-------------|--------|
| `alma_pacientes` | Datos demográficos de pacientes | 15 campos |
| `alma_episodios` | Episodios clínicos (ingresos, consultas) | 12 campos |
| `alma_diagnosticos` | Diagnósticos CIE-10 | 11 campos |

### Colecciones UGCO (Read/Write)

| Colección | Descripción | Campos |
|-----------|-------------|--------|
| `onco_especialidades` | **Catálogo** de especialidades oncológicas | 12 campos |
| `onco_casos` | **⭐ Entidad central**: Casos oncológicos | 32 campos |
| `onco_caso_especialidades` | Relación N:N casos-especialidades | 10 campos |
| `onco_episodios` | Episodios oncológicos (cirugías, QT, RT) | 18 campos |
| `onco_seguimiento_eventos` | Eventos de seguimiento | 16 campos |
| `onco_comite_sesiones` | Sesiones del comité oncológico | 20 campos |
| `onco_comite_casos` | Casos discutidos en comité | 14 campos |

**Total**: 3 colecciones ALMA + 7 colecciones UGCO = **10 colecciones**

Ver [Diccionario de Datos](docs/modelo-datos/DICCIONARIO-DATOS.md) para detalles completos.

---

## 🚀 Plan de Implementación

### Duración Total: **10 semanas**

| Fase | Nombre | Duración | Estado |
|------|--------|----------|--------|
| **1** | Fundación | 2 semanas | ✅ En curso |
| **2** | Modelo de Datos | 2 semanas | ⏳ Pendiente |
| **3** | Servicios de Negocio | 2 semanas | ⏳ Pendiente |
| **4** | Frontend NocoBase | 3 semanas | ⏳ Pendiente |
| **5** | Configuración de Permisos | 1 semana | ⏳ Pendiente |
| **6** | Datos Maestros | 1 semana | ⏳ Pendiente |
| **7** | Pruebas | 2 semanas | ⏳ Pendiente |
| **8** | Capacitación y Despliegue | 2 semanas | ⏳ Pendiente |

**Hitos Críticos**:
- ✅ Semana 2: Modelo de datos aprobado (en curso)
- ⏳ Semana 4: Servicios de negocio funcionando
- ⏳ Semana 6: UI completo y permisos configurados
- ⏳ Semana 8: Pruebas completas finalizadas
- ⏳ Semana 10: **Sistema en producción**

Ver [Plan de Implementación](planificacion/PLAN-IMPLEMENTACION.md) para detalles completos.

---

## 💻 Stack Tecnológico

### Backend
- **NocoBase**: Plataforma principal no-code/low-code
- **Node.js**: Runtime (≥16.0.0)
- **Express.js**: Framework API REST (opcional, para MIRA)
- **PostgreSQL/MySQL**: Base de datos
- **Redis**: Caché (opcional)

### Frontend
- **NocoBase UI**: Interface de usuario (React interno)

### Integración
- **MIRA Healthcare Platform**: Capa de integración (opcional)
- **Axios**: Cliente HTTP
- **Winston**: Logging

### Herramientas
- **Git**: Control de versiones
- **Jest**: Testing
- **Postman**: Pruebas de API

---

## 🔐 Roles y Permisos

| Rol | Permisos | Usuarios Estimados |
|-----|----------|---------------------|
| **Administrador UGCO** | CRUD completo, gestión de catálogos | 2 |
| **Médico Oncólogo** | CRUD casos, episodios, seguimiento | 5-8 |
| **Enfermera Gestora** | CRUD casos, episodios, seguimiento, comités | 3-5 |
| **Administrativo UGCO** | Lectura general, gestión de comités, reportes | 2-3 |
| **Auditor** | Solo lectura | 1-2 |

**Total usuarios estimados**: 13-20 usuarios

---

## 📊 Funcionalidades Principales

### 1. Gestión de Casos Oncológicos
- Crear y editar casos
- Asignar especialidades (múltiples, con una principal)
- Registrar información oncológica completa (TNM, histología, biomarcadores)
- Asignar equipo responsable (médico, enfermera)
- Seguimiento de estado del caso

### 2. Episodios Oncológicos
- Registrar episodios: Cirugía, Quimioterapia, Radioterapia, Inmunoterapia, etc.
- Fechas de inicio/fin, duración estimada
- Resultados y complicaciones
- Profesional responsable

### 3. Seguimiento de Pacientes
- Timeline de eventos de seguimiento
- Tipos: Consulta, Examen, Resultado, Complicación, Cambio de tratamiento
- Registro de próximos controles
- Adjuntos (documentos, imágenes)

### 4. Comités Oncológicos
- Crear y gestionar sesiones de comité
- Agregar casos a la agenda
- Registrar decisiones y recomendaciones
- Actas de sesiones
- Seguimiento de acuerdos

### 5. Dashboards y Reportes
- Dashboard general UGCO
- Dashboard por especialidad
- Métricas:
  - Casos activos
  - Casos por especialidad
  - Casos por estado
  - Estadísticas de comités
- Reportes de casos nuevos, evolución, etc.

---

## 🎯 Métricas de Éxito

### Técnicas
- ✅ Tiempo de respuesta < 2 segundos
- ✅ Disponibilidad > 99%
- ✅ Cobertura de pruebas > 80%
- ✅ 0 modificaciones no autorizadas a ALMA

### Funcionales
- ✅ 100% de casos oncológicos registrados en UGCO
- ✅ Reducción de 50% en tiempo de preparación de comités
- ✅ Trazabilidad completa de seguimiento
- ✅ Reportes automáticos generados en < 5 segundos

### Adopción
- ✅ 80% de usuarios activos después de 1 mes
- ✅ < 5 incidencias críticas en el primer mes
- ✅ Satisfacción de usuarios > 7/10

---

## 📦 Instalación y Configuración

### Prerrequisitos
- NocoBase instalado y configurado
- Acceso a SQL intermedio de ALMA
- Token API de NocoBase con permisos

### Configuración

1. **Clonar repositorio**:
   ```bash
   cd C:\GIT\MIRA\UGCO
   ```

2. **Revisar documentación**:
   - Leer [DIAGNOSTICO-COMPLETO.md](docs/DIAGNOSTICO-COMPLETO.md)
   - Leer [DICCIONARIO-DATOS.md](docs/modelo-datos/DICCIONARIO-DATOS.md)
   - Leer [PLAN-IMPLEMENTACION.md](planificacion/PLAN-IMPLEMENTACION.md)

3. **Fase 2: Crear colecciones** (ver Plan de Implementación):
   ```bash
   node scripts/create-alma-collections.js
   node scripts/create-onco-collections.js
   node scripts/seed-especialidades.js
   ```

4. **Fase 4: Configurar UI en NocoBase**:
   - Crear vistas y formularios según diseño
   - Configurar dashboards

5. **Fase 5: Configurar permisos**:
   - Crear roles en NocoBase
   - Asignar permisos según matriz

---

## 🧪 Testing

### Pruebas Unitarias
```bash
npm test
```

### Pruebas de Integración
```bash
npm run test:integration
```

### Pruebas de Rendimiento
```bash
npm run test:performance
```

Ver [Plan de Implementación - Fase 7](planificacion/PLAN-IMPLEMENTACION.md#fase-7-pruebas-semanas-7-8) para detalles.

---

## 📖 Documentación Adicional

### Para Usuarios
- [ ] Manual de Usuario (a crear en Fase 8)
- [ ] Videos Tutoriales (a crear en Fase 8)
- [ ] Guías Rápidas (a crear en Fase 8)
- [ ] FAQ (a crear en Fase 8)

### Para Desarrolladores
- ✅ [Diagnóstico Completo](docs/DIAGNOSTICO-COMPLETO.md)
- ✅ [Diccionario de Datos](docs/modelo-datos/DICCIONARIO-DATOS.md)
- ✅ [Plan de Implementación](planificacion/PLAN-IMPLEMENTACION.md)
- ✅ [CHANGELOG](CHANGELOG.md)
- [ ] Documentación de API (a crear en Fase 3)
- [ ] Guía de Contribución (a crear)

### Documentación Técnica MIRA
- [MIRA README](../README.md)
- [Integración NocoBase](../docs/NOCOBASE_INTEGRATION.md)
- [Guía de Inicio Rápido NocoBase](../docs/README_NOCOBASE.md)

---

## 🤝 Equipo

### Equipo de Desarrollo (a definir)
| Rol | Nombre | Contacto |
|-----|--------|----------|
| **Líder Técnico** | TBD | - |
| **Analista de Negocio** | TBD | - |
| **Desarrollador Backend** | TBD | - |
| **Desarrollador Frontend** | TBD | - |
| **QA Tester** | TBD | - |

### Equipo Clínico (SMEs)
| Rol | Nombre | Contacto |
|-----|--------|----------|
| **Médico Oncólogo** | TBD | - |
| **Enfermera Gestora** | TBD | - |
| **Administrativo** | TBD | - |

### Stakeholders
| Rol | Nombre | Contacto |
|-----|--------|----------|
| **Sponsor del Proyecto** | TBD | - |
| **Líder Equipo Oncología** | TBD | - |
| **Admin NocoBase Hospital** | TBD | - |

---

## 🔄 Estado Actual

### Fase 1: Fundación (EN CURSO) ✅

**Completado**:
- ✅ Diagnóstico completo del sistema
- ✅ Diccionario de datos completo (10 colecciones)
- ✅ Plan de implementación estructurado (8 fases)
- ✅ Sistema de registro de cambios (CHANGELOG)
- ✅ Estructura de directorios
- ✅ Documentación base

**Pendiente**:
- [ ] Talleres con usuarios (3 talleres)
- [ ] Análisis de SQL intermedio ALMA
- [ ] Configuración de ambientes (DEV, QA)
- [ ] Scripts de creación de colecciones

**Próximos pasos**: Ver [PLAN-IMPLEMENTACION.md - Próximos Pasos](planificacion/PLAN-IMPLEMENTACION.md#16-próximos-pasos-inmediatos)

---

## 📝 Registro de Cambios

Ver [CHANGELOG.md](CHANGELOG.md) para el historial completo de cambios.

**Última actualización**: 2025-11-21

**Versión actual**: 1.0.0 (Fase de Diseño)

---

## 📞 Soporte

### Documentación
- **Diagnóstico**: [DIAGNOSTICO-COMPLETO.md](docs/DIAGNOSTICO-COMPLETO.md)
- **Modelo de Datos**: [DICCIONARIO-DATOS.md](docs/modelo-datos/DICCIONARIO-DATOS.md)
- **Plan de Implementación**: [PLAN-IMPLEMENTACION.md](planificacion/PLAN-IMPLEMENTACION.md)

### Enlaces Útiles
- **NocoBase Hospital Ovalle**: https://nocobase.hospitaldeovalle.cl/
- **Documentación NocoBase**: https://docs.nocobase.com
- **MIRA Platform**: [../README.md](../README.md)

### Contacto
- **Email**: TBD
- **Issues**: TBD (cuando se cree repositorio)

---

## 📄 Licencia

Este proyecto es propiedad del **Hospital de Ovalle** y está desarrollado para uso interno del hospital.

---

## 🙏 Agradecimientos

- Equipo de Oncología del Hospital de Ovalle
- Equipo de TI del Hospital de Ovalle
- Comunidad NocoBase
- Claude Code (asistente de desarrollo IA)

---

**UGCO - Unidad de Gestión de Casos Oncológicos**

*Mejorando el seguimiento y atención de pacientes oncológicos en el Hospital de Ovalle*

---

**Última actualización**: 2025-11-21 | **Versión**: 1.0.0 | **Estado**: Planificación
