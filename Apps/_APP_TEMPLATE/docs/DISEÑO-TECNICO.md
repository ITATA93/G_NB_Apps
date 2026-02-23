# Diseño Técnico - [NOMBRE_APP]

**Última Actualización**: YYYY-MM-DD
**Versión**: 0.1.0

---

## Descripción General

[Descripción técnica detallada de la implementación - 2-3 párrafos explicando el enfoque técnico y decisiones de diseño]

---

## Stack Tecnológico

### Frontend

| Componente | Tecnología | Versión | Propósito |
|------------|-----------|---------|-----------|
| Framework UI | NocoBase UI (React) | 1.x | Interfaz de usuario |
| State Management | React Context / Redux | - | Gestión de estado |
| HTTP Client | Axios | 1.x | Llamadas a API |
| Date Handling | date-fns | 2.x | Manejo de fechas |

### Backend

| Componente | Tecnología | Versión | Propósito |
|------------|-----------|---------|-----------|
| Runtime | Node.js | 18+ | Entorno de ejecución |
| Framework | NocoBase Server (Koa) | 1.x | Servidor y API |
| ORM | Sequelize | 6.x | Abstracción de base de datos |
| Validación | Joi / Yup | - | Validación de datos |

### Base de Datos

| Componente | Tecnología | Versión | Propósito |
|------------|-----------|---------|-----------|
| BD Principal | PostgreSQL / MySQL | 14+ / 8+ | Datos de la aplicación |
| Integración | SQL Server (SIDRA) | - | Conexión a ALMA/TrakCare |

### Herramientas de Desarrollo

| Herramienta | Propósito |
|-------------|-----------|
| TypeScript | Tipado estático para scripts |
| ESLint | Linting de código |
| Prettier | Formateo de código |
| Git | Control de versiones |

---

## Modelo de Datos

### Diagrama ER Simplificado

```
┌─────────────────┐       ┌─────────────────┐
│  Entidad A      │──<>───│  Entidad B      │
│                 │       │                 │
│ PK: id          │       │ PK: id          │
│ FK: entidad_b_id│       │                 │
│     campo_1     │       │     campo_1     │
│     campo_2     │       │     campo_2     │
└─────────────────┘       └─────────────────┘
```

**Detalles completos**: Ver [../BD/README_Modelo.md](../BD/README_Modelo.md)

### Colecciones Principales

| Colección | Propósito | Campos Clave | Relaciones |
|-----------|-----------|--------------|------------|
| [nombre_coleccion] | [Descripción] | id, campo_1, campo_2 | hasMany: [otra_coleccion] |

---

## API y Endpoints

### API REST Automática (NocoBase)

NocoBase genera automáticamente endpoints CRUD para cada colección:

```
GET    /api/[collection]:list       # Listar registros
GET    /api/[collection]:get        # Obtener un registro
POST   /api/[collection]:create     # Crear registro
PUT    /api/[collection]:update     # Actualizar registro
DELETE /api/[collection]:destroy    # Eliminar registro
```

### Endpoints Personalizados

| Endpoint | Método | Descripción | Parámetros |
|----------|--------|-------------|------------|
| `/api/custom/[nombre]` | POST | [Descripción] | `{param1, param2}` |

### Autenticación

**Tipo**: JWT (JSON Web Token)

**Headers Requeridos**:
```http
Authorization: Bearer <token>
X-Role: <role_name>  # Opcional
```

**Obtener Token**:
```bash
curl -X POST https://nocobase.hospitaldeovalle.cl/api/auth:signIn \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

---

## Workflows y Automatizaciones

### Workflow 1: [Nombre del Workflow]

**Trigger**: [Evento que lo dispara, ej: afterCreate en colección X]

**Pasos**:
1. Validar datos de entrada
2. Llamar a servicio externo (si aplica)
3. Actualizar colecciones relacionadas
4. Enviar notificación

**Ejemplo de Configuración**:
```json
{
  "trigger": "afterCreate",
  "collection": "nombre_coleccion",
  "steps": [
    {
      "type": "validation",
      "rules": {...}
    },
    {
      "type": "api_call",
      "endpoint": "..."
    }
  ]
}
```

### Workflow 2: [Nombre del Workflow]

[Documentar otros workflows importantes]

---

## Scripts de Automatización

### Scripts de Configuración

**Ubicación**: [scripts/configure/](../scripts/configure/)

| Script | Propósito | Uso |
|--------|-----------|-----|
| `configure.ts` | Crear/actualizar colecciones | `node scripts/configure/configure.ts` |
| `update-fields.ts` | Modificar campos de colección | `node scripts/configure/update-fields.ts <collection>` |

### Scripts de Seed

**Ubicación**: [scripts/seed/](../scripts/seed/)

| Script | Propósito | Uso |
|--------|-----------|-----|
| `seed-references.ts` | Cargar datos de referencia | `node scripts/seed/seed-references.ts` |
| `seed-sample-data.ts` | Cargar datos de ejemplo | `node scripts/seed/seed-sample-data.ts` |

### Scripts de Inspección

**Ubicación**: [scripts/inspect/](../scripts/inspect/)

| Script | Propósito | Uso |
|--------|-----------|-----|
| `list-collections.ts` | Listar todas las colecciones | `node scripts/inspect/list-collections.ts` |
| `inspect-collection.ts` | Ver detalles de una colección | `node scripts/inspect/inspect-collection.ts <name>` |

---

## Integraciones

### ALMA/TrakCare vía SIDRA

**Datasource Configuration**:
```javascript
{
  "name": "sidra",
  "type": "mssql",
  "host": "sidra.hospitaldeovalle.cl",
  "port": 1433,
  "database": "SIDRA",
  "username": process.env.SIDRA_USERNAME,
  "password": process.env.SIDRA_PASSWORD,
  "options": {
    "encrypt": true,
    "trustServerCertificate": false
  }
}
```

**Colecciones Integradas**:
```javascript
{
  "name": "alma_pacientes",
  "datasource": "sidra",
  "tableName": "PAC_Pacientes",
  "readonly": true,
  "fields": [
    {
      "name": "id",
      "type": "bigInteger",
      "primaryKey": true
    },
    // ... otros campos
  ]
}
```

**Importante**:
- ⚠️ Todas las colecciones `alma_*` son **read-only**
- No usar workflows que modifiquen datos ALMA
- Cache de consultas frecuentes recomendado

### Otras Integraciones

[Documentar otras integraciones si aplican]

---

## Validaciones

### Validación a Nivel de Colección

**Ejemplo**:
```javascript
{
  "name": "campo_email",
  "type": "string",
  "validate": {
    "isEmail": true,
    "notEmpty": true
  }
}
```

### Validación Personalizada

**Ubicación**: `plugins/[app-name]/src/validators/`

**Ejemplo**:
```typescript
export function validateRUT(rut: string): boolean {
  // Lógica de validación de RUT chileno
  const cleanRut = rut.replace(/[.-]/g, '');
  // ... validación
  return isValid;
}
```

---

## Permisos y Roles

### Matriz de Permisos

| Rol | Colección A | Colección B | Colección C | Workflows |
|-----|------------|------------|------------|-----------|
| Admin | CRUD | CRUD | CRUD | Execute |
| Usuario | CR | CRU | R | - |
| ReadOnly | R | R | R | - |

**Detalles**: Ver [README_Modelo.md](../BD/README_Modelo.md)

### Configuración de Rol

**Ejemplo**:
```javascript
{
  "name": "Usuario",
  "permissions": [
    {
      "collection": "nombre_coleccion",
      "actions": ["create", "read"]
    }
  ]
}
```

---

## Performance y Optimización

### Índices de Base de Datos

| Colección | Campo(s) | Tipo | Propósito |
|-----------|----------|------|-----------|
| [tabla] | [campo] | Index | Mejorar búsquedas por [campo] |
| [tabla] | [campo1, campo2] | Composite | Búsquedas combinadas |

### Cache

**Estrategia**:
- Datos de referencia: Cache de 24 horas
- Datos ALMA: Cache de 1 hora
- Datos dinámicos: No cache

**Implementación**:
```javascript
// Ejemplo de cache en workflow
const cachedData = await cache.get('ref_especialidades');
if (!cachedData) {
  const data = await fetchFromDB();
  await cache.set('ref_especialidades', data, { ttl: 86400 });
}
```

### Paginación

**Configuración por Defecto**:
- Tamaño de página: 20 registros
- Máximo: 100 registros por página

**Uso**:
```javascript
GET /api/coleccion:list?page=1&pageSize=20
```

---

## Testing

### Estrategia de Testing

| Tipo | Herramienta | Cobertura Objetivo |
|------|-------------|-------------------|
| Unitario | Jest | 80% |
| Integración | Supertest | 60% |
| E2E | [Cypress / Playwright] | Crítico |

### Scripts de Testing

**Ubicación**: [scripts/test/](../scripts/test/)

```bash
# Ejecutar tests
npm run test

# Tests con cobertura
npm run test:coverage

# Tests E2E
npm run test:e2e
```

### Casos de Prueba Críticos

1. **Creación de registro con validaciones**
2. **Actualización de registro con relaciones**
3. **Eliminación con verificación de integridad**
4. **Autenticación y autorización**
5. **Workflows automáticos**

---

## Deployment

### Ambientes

| Ambiente | URL | Base de Datos | Propósito |
|----------|-----|---------------|-----------|
| Desarrollo | localhost:13000 | dev_db | Desarrollo local |
| Staging | staging.hospitaldeovalle.cl | staging_db | Pruebas pre-producción |
| Producción | nocobase.hospitaldeovalle.cl | prod_db | Uso real |

### Proceso de Deploy

1. **Build**:
   ```bash
   npm run build
   ```

2. **Migración de BD**:
   ```bash
   npm run migrate
   ```

3. **Seed de datos de referencia**:
   ```bash
   node scripts/seed/seed-references.ts
   ```

4. **Reiniciar servidor**:
   ```bash
   pm2 restart nocobase
   ```

**Detalles completos**: Ver [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Logging y Monitoreo

### Niveles de Log

| Nivel | Uso | Ejemplo |
|-------|-----|---------|
| DEBUG | Debugging detallado | Variables, flujo de ejecución |
| INFO | Información general | Inicio de operaciones |
| WARNING | Advertencias | Datos faltantes no críticos |
| ERROR | Errores recuperables | Validaciones fallidas |
| CRITICAL | Errores críticos | Fallo de conexión a BD |

### Configuración de Logs

```javascript
// .env
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### Métricas de Monitoreo

- Tiempo de respuesta de API
- Queries lentas (>1s)
- Errores por hora
- Uso de memoria

---

## Seguridad

### Validación de Input

- Sanitización de inputs de usuario
- Validación de tipos de datos
- Prevención de SQL injection (via ORM)
- Prevención de XSS (sanitización de HTML)

### Encriptación

- **En tránsito**: HTTPS/TLS 1.2+
- **En reposo**: BD con encriptación (si disponible)
- **Secretos**: Variables de entorno, nunca en código

### Auditoría

Todos los registros incluyen:
- `created_by`: Usuario que creó
- `updated_by`: Usuario que modificó
- `created_at`: Timestamp de creación
- `updated_at`: Timestamp de última modificación

---

## Troubleshooting

### Problemas Comunes

| Problema | Causa Probable | Solución |
|----------|---------------|----------|
| Error 401 | Token expirado | Re-autenticarse |
| Error 403 | Permisos insuficientes | Verificar rol del usuario |
| Colecciones no aparecen | Cache desactualizado | Refrescar o limpiar cache |

**Detalles completos**: Ver [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## Decisiones Técnicas (TDR)

### TDR-001: Uso de TypeScript para Scripts

**Fecha**: YYYY-MM-DD
**Estado**: Aceptado

**Contexto**: Scripts en JavaScript carecen de tipado

**Decisión**: Migrar scripts críticos a TypeScript

**Consecuencias**:
- ✅ Mejor detección de errores
- ✅ Autocompletado en IDEs
- ⚠️ Requiere compilación

### TDR-002: Cliente API Compartido

**Fecha**: YYYY-MM-DD
**Estado**: Aceptado

**Contexto**: Código duplicado en múltiples scripts

**Decisión**: Crear `ApiClient.ts` reutilizable

**Consecuencias**:
- ✅ DRY (Don't Repeat Yourself)
- ✅ Mantenimiento centralizado
- ✅ Lógica de reintentos unificada

---

## Diagramas Técnicos

### Flujo de Autenticación

```
┌──────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│Client│────>│NocoBase  │────>│Database  │────>│Response  │
│      │ POST│API /auth │ Query│Users     │Token│{token}   │
└──────┘     └──────────┘     └──────────┘     └──────────┘
```

### Flujo de Creación de Registro

```
┌──────┐  POST   ┌──────────┐ Validate ┌──────────┐ beforeCreate
│Client│────────>│NocoBase  │─────────>│Workflow  │─────────────>
│      │         │API       │          │Engine    │
└──────┘         └──────────┘          └──────────┘
                      │                       │
                      │ Save                  │ afterCreate
                      v                       v
                 ┌──────────┐            ┌──────────┐
                 │Database  │            │Notify    │
                 └──────────┘            └──────────┘
```

---

## Referencias

- [Documentación de NocoBase](https://docs.nocobase.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [ARQUITECTURA.md](ARQUITECTURA.md) - Visión arquitectónica de alto nivel
- [README_Modelo.md](../BD/README_Modelo.md) - Modelo de datos detallado

---

**Versión**: 0.1.0
**Autor**: [Nombre]
**Próxima Revisión**: YYYY-MM-DD
