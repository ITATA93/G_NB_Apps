# Arquitectura - [NOMBRE_APP]

**Última Actualización**: YYYY-MM-DD
**Versión**: 0.1.0

---

## Descripción General

[Descripción de alto nivel de la arquitectura de la aplicación - 2-3 párrafos explicando el enfoque arquitectónico]

---

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (NocoBase UI)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Vistas     │  │  Formularios │  │   Reportes   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    Backend (NocoBase API)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Collections  │  │  Workflows   │  │   Plugins    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      Capa de Datos                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL/  │  │  ALMA/SIDRA  │  │   Archivos   │      │
│  │   MySQL      │  │  (Read-Only) │  │  (Storage)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Componentes Principales

### Frontend

**Tecnología**: NocoBase UI (React-based)

**Componentes**:
- **Vistas de Listado**: Tablas con filtros y paginación
- **Formularios**: Creación y edición de registros
- **Dashboards**: Visualización de métricas y KPIs
- **Reportes**: Generación de reportes en PDF/Excel

**Responsabilidades**:
- Presentación de datos
- Interacción con usuario
- Validación de formularios (nivel UI)

### Backend/API

**Tecnología**: NocoBase Server (Node.js + Koa)

**Componentes**:
- **Collections**: Definición de modelos de datos
- **Workflows**: Automatizaciones y procesos de negocio
- **Plugins**: Extensiones personalizadas
- **API REST**: Endpoints CRUD automáticos

**Responsabilidades**:
- Lógica de negocio
- Validaciones (nivel servidor)
- Gestión de permisos y roles
- Orquestación de workflows

### Base de Datos

**Tecnología Principal**: PostgreSQL/MySQL

**Componentes**:
- **Tablas Propias**: Datos de la aplicación (read/write)
- **Tablas de Referencia**: Catálogos y maestros
- **Tablas Integradas**: ALMA/SIDRA via SIDRA datasource (read-only)

**Responsabilidades**:
- Persistencia de datos
- Integridad referencial
- Índices y optimización

---

## Patrones Arquitectónicos

### 1. Modelo en Capas

```
┌─────────────────┐
│  Presentación   │  → UI/UX, Formularios, Vistas
├─────────────────┤
│  Aplicación     │  → Workflows, Validaciones, Lógica de Negocio
├─────────────────┤
│  Datos          │  → Collections, Relaciones, Persistencia
└─────────────────┘
```

### 2. API-First

- Toda funcionalidad disponible vía API REST
- Separación clara entre frontend y backend
- Permite integraciones externas

### 3. Event-Driven (Workflows)

- Eventos: afterCreate, beforeUpdate, etc.
- Workflows automáticos basados en eventos
- Notificaciones y alertas

---

## Flujo de Datos

### Flujo de Escritura (Create/Update)

```
Usuario → Formulario → Validación UI → API Request
                                            ↓
                                    Validación Backend
                                            ↓
                                    Workflow (beforeSave)
                                            ↓
                                    Guardar en BD
                                            ↓
                                    Workflow (afterSave)
                                            ↓
                                    Respuesta al Cliente
```

### Flujo de Lectura

```
Usuario → Vista → API Request → Backend
                                    ↓
                            Aplicar filtros/permisos
                                    ↓
                            Query a Base de Datos
                                    ↓
                            Formatear respuesta
                                    ↓
                            Respuesta al Cliente
```

---

## Integraciones

### ALMA/TrakCare (vía SIDRA)

**Tipo**: Read-Only
**Protocolo**: SQL Server Connection
**Datasource**: `sidra` configurado en NocoBase

**Colecciones Integradas**:
- `alma_[tabla]` - Prefijo para todas las tablas de ALMA

**Consideraciones**:
- ⚠️ No modificar datos en ALMA
- Cache de consultas frecuentes
- Sincronización unidireccional ALMA → MIRA

### Otros Sistemas

[Documentar otras integraciones si aplican]

---

## Seguridad

### Autenticación

- **Método**: NocoBase Authentication
- **Tokens**: JWT con expiración
- **SSO**: [Configurar si aplica]

### Autorización

**Roles Principales**:
| Rol | Permisos | Descripción |
|-----|----------|-------------|
| Admin | Full Access | Administrador del sistema |
| Usuario | CRUD limitado | Usuario estándar de la aplicación |
| ReadOnly | Solo lectura | Consultas y reportes |

**Matriz de Permisos**: Ver [../BD/README_Modelo.md](../BD/README_Modelo.md)

### Protección de Datos

- Encriptación en tránsito (HTTPS)
- Encriptación en reposo (BD cifrada)
- Auditoría de cambios (created_by, updated_by)

---

## Escalabilidad

### Estrategias Actuales

- Paginación en listados grandes
- Índices en campos de búsqueda frecuente
- Cache de datos de referencia

### Consideraciones Futuras

- [ ] Load balancing de NocoBase
- [ ] Réplicas de lectura de BD
- [ ] CDN para assets estáticos
- [ ] Queue system para workflows pesados

---

## Monitoreo y Observabilidad

### Métricas Clave

- Tiempo de respuesta de API
- Uso de CPU/memoria
- Queries lentas en BD
- Errores y excepciones

### Logging

- Nivel: Info, Warning, Error
- Destino: [Configurar destino de logs]
- Retención: [Definir política]

### Alertas

[Definir umbrales y notificaciones]

---

## Tecnologías y Dependencias

### Stack Principal

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Frontend | NocoBase UI (React) | 1.x |
| Backend | NocoBase Server (Node.js) | 1.x |
| Base de Datos | PostgreSQL/MySQL | 14+/8+ |
| ORM | Sequelize | 6.x |

### Dependencias Principales

- `axios` - HTTP client para integraciones
- `moment`/`date-fns` - Manejo de fechas
- [Listar otras dependencias clave]

---

## Decisiones Arquitectónicas (ADR)

### ADR-001: Uso de NocoBase como Plataforma

**Estado**: Aceptado
**Fecha**: YYYY-MM-DD

**Contexto**: Necesidad de desarrollo rápido de aplicaciones CRUD

**Decisión**: Usar NocoBase como plataforma base

**Consecuencias**:
- ✅ Desarrollo acelerado
- ✅ UI consistente
- ⚠️ Dependencia de NocoBase
- ⚠️ Limitaciones de customización profunda

### ADR-002: Integración Read-Only con ALMA

**Estado**: Aceptado
**Fecha**: YYYY-MM-DD

**Contexto**: Datos maestros en ALMA/TrakCare

**Decisión**: Conexión read-only vía SIDRA datasource

**Consecuencias**:
- ✅ No riesgo de corrupción de datos ALMA
- ✅ Acceso directo a datos actualizados
- ⚠️ Performance dependiente de SIDRA
- ⚠️ Requiere cache para consultas frecuentes

---

## Roadmap Arquitectónico

### Fase Actual (v0.1 - v0.5)

- Modelo de datos básico
- CRUD de colecciones principales
- Integración inicial con ALMA

### Próxima Fase (v0.6 - v1.0)

- Workflows automáticos
- Reportes avanzados
- Optimización de performance

### Futuro (v1.1+)

- APIs públicas para integraciones
- Arquitectura de microservicios (si escala lo requiere)
- Machine Learning para predicciones

---

## Referencias

- [NocoBase Documentation](https://docs.nocobase.com/)
- [README del Modelo de Datos](../BD/README_Modelo.md)
- [Diseño Técnico](DISEÑO-TECNICO.md)

---

**Versión**: 0.1.0
**Revisado por**: [Nombre]
**Próxima Revisión**: YYYY-MM-DD
