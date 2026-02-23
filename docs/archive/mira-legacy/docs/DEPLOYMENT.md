# Guía de Deployment - MIRA (Hospital de Ovalle)

Esta guía detalla el proceso de deployment de la plataforma MIRA y sus aplicaciones (UGCO, BUHO) en el entorno de producción del Hospital de Ovalle. Las aplicaciones UGCO y BUHO están ubicadas en `/Apps/`, mientras que los recursos compartidos están en `/shared/`.

## Tabla de Contenidos

- [Prerequisitos](#prerequisitos)
- [Entornos](#entornos)
- [Proceso de Deployment](#proceso-de-deployment)
- [Configuración de Producción](#configuración-de-producción)
- [Checklist Pre-Deployment](#checklist-pre-deployment)
- [Procedimientos de Rollback](#procedimientos-de-rollback)
- [Monitoreo Post-Deployment](#monitoreo-post-deployment)

---

## Prerequisitos

### Accesos Necesarios

- [ ] Acceso a instancia de NocoBase: `https://nocobase.hospitaldeovalle.cl`
- [ ] Credenciales de API con rol apropiado
- [ ] Acceso a repositorio git (lectura/escritura)
- [ ] Acceso SSH al servidor (si aplica)
- [ ] Credenciales de bases de datos (PostgreSQL/MySQL para MIRA, SQL Server para SIDRA)

### Herramientas Requeridas

```bash
# Node.js y npm
node --version  # v16+
npm --version   # v8+

# TypeScript
npm install -g typescript tsx

# Git
git --version

# Python (para scripts globales)
python --version  # Python 3.8+
```

---

## Entornos

### Desarrollo (Local)

```env
NOCOBASE_BASE_URL=http://localhost:13000/api
NOCOBASE_API_KEY=<dev_token>
NODE_ENV=development
```

### Staging (Pre-producción)

```env
NOCOBASE_BASE_URL=https://nocobase-staging.hospitaldeovalle.cl/api
NOCOBASE_API_KEY=<staging_token>
NODE_ENV=staging
```

### Producción

```env
NOCOBASE_BASE_URL=https://nocobase.hospitaldeovalle.cl/api
NOCOBASE_API_KEY=<prod_token>
NODE_ENV=production
```

---

## Proceso de Deployment

### Fase 1: Preparación (1-2 días antes)

#### 1.1. Revisar Cambios

```bash
# Ver commits desde último deployment
git log --oneline <last-tag>..HEAD

# Revisar archivos modificados
git diff <last-tag>..HEAD --stat
```

#### 1.2. Ejecutar Tests Locales

```bash
cd MIRA

# Instalar dependencias
npm install

# Ejecutar tests (si existen)
npm test

# Verificar build (si aplica)
npm run build
```

#### 1.3. Backup de Configuración Actual

```bash
# Exportar colecciones actuales
node Apps/UGCO/scripts/list-collections.ts > backup/collections-$(date +%Y%m%d).json

# Backup de UI schemas (si aplica)
# Ejecutar script de backup de schemas
```

### Fase 2: Deployment de Modelo de Datos

#### 2.1. Revisar Blueprint

```bash
# Revisar app-spec/app.yaml para cambios
cat app-spec/app.yaml
```

#### 2.2. Aplicar Cambios de Colecciones

```bash
# Opción A: Usando script de configuración
cd scripts
python nocobase_configure.py

# Opción B: Usando scripts TypeScript
cd Apps/UGCO/scripts
tsx check-sql-sync.ts  # Verificar sincronización
```

#### 2.3. Verificar Integridad

```bash
# Verificar que colecciones se crearon correctamente
node Apps/UGCO/scripts/list-collections.ts

# Verificar relaciones
# tsx verify-relationships.ts (si existe)
```

### Fase 3: Deployment de Datos Maestros

#### 3.1. Seed de Datos de Referencia

```bash
cd Apps/UGCO/scripts/nocobase

# Seed de referencias oncológicas
# tsx seed-references.ts (si existe)

# Seed de datos DEIS
# tsx seed-deis.ts (si existe)

# Verificar que datos se cargaron
node ../list-collections.ts
```

#### 3.2. Verificar Diccionarios

```bash
# Verificar que diccionarios HL7 están cargados
# Revisar colecciones de referencia en NocoBase UI
```

### Fase 4: Deployment de UI

#### 4.1. Configurar Páginas y Menús

```bash
# Ejecutar scripts de creación de UI (si aplica)
# Nota: Actualmente se configura manualmente en NocoBase UI
```

#### 4.2. Configurar Permisos

```bash
# Verificar roles y permisos según app-spec/app.yaml
# Configurar en NocoBase UI:
# - Roles: Administrador Clínico, Médico Oncólogo, etc.
# - Permisos: Ver, Crear, Editar, Eliminar por colección
```

### Fase 5: Verificación Post-Deployment

#### 5.1. Tests de Integración

```bash
# Test de conexión
node Apps/UGCO/scripts/test-connection.ts

# Verificar datasources
node Apps/UGCO/scripts/inspect-datasources.ts

# Verificar sincronización SQL (ALMA)
node Apps/UGCO/scripts/check-sql-sync-simple.js
```

#### 5.2. Tests Funcionales (Manual)

- [ ] Login con diferentes roles
- [ ] Crear caso oncológico de prueba
- [ ] Verificar que formularios funcionan
- [ ] Probar búsquedas y filtros
- [ ] Verificar que workflows funcionan (si aplica)
- [ ] Eliminar datos de prueba

---

## Configuración de Producción

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# NocoBase Production
NOCOBASE_BASE_URL=https://nocobase.hospitaldeovalle.cl/api
NOCOBASE_API_KEY=<TOKEN_PRODUCCION>
NOCOBASE_ROLE=root

# Seguridad
NOCOBASE_VERIFY_SSL=true
NOCOBASE_TIMEOUT_SECONDS=30

# Logging
LOG_LEVEL=info
NODE_ENV=production
```

### Configuración de Bases de Datos

#### PostgreSQL (MIRA - Read/Write)

```env
SQL_DIALECT=postgres
SQL_HOST=localhost
SQL_PORT=5432
SQL_DATABASE=mira_production
SQL_USERNAME=mira_user
SQL_PASSWORD=<SECURE_PASSWORD>
```

#### SQL Server (SIDRA - Read-Only)

```env
SIDRA_HOST=sidra.hospitaldeovalle.cl
SIDRA_PORT=1433
SIDRA_DATABASE=SIDRA
SIDRA_USERNAME=readonly_user
SIDRA_PASSWORD=<SECURE_PASSWORD>
```

---

## Checklist Pre-Deployment

### Checklist de Código

- [ ] Todos los commits siguen convenciones
- [ ] No hay archivos `.env` con secretos en el repo
- [ ] Dependencias actualizadas y sin vulnerabilidades
- [ ] Scripts deprecados marcados claramente
- [ ] Documentación actualizada

### Checklist de Configuración

- [ ] Variables de entorno de producción configuradas
- [ ] Credenciales de API verificadas
- [ ] Backup de configuración actual realizado
- [ ] Plan de rollback preparado
- [ ] Equipo notificado del deployment

### Checklist de Testing

- [ ] Tests locales ejecutados y pasando
- [ ] Scripts de migración probados en staging
- [ ] Verificación de integridad de datos
- [ ] Tests de integración con ALMA (TrakCare)

### Checklist de Comunicación

- [ ] Usuarios notificados del deployment (si downtime)
- [ ] Ventana de mantenimiento coordinada
- [ ] Equipo de soporte preparado
- [ ] Documentación de usuario actualizada (si aplica)

---

## Procedimientos de Rollback

### Escenario 1: Error en Migración de Datos

```bash
# 1. Detener procesos activos

# 2. Restaurar backup de colecciones
# (Procedimiento específico según backup realizado)

# 3. Verificar integridad
node Apps/UGCO/scripts/list-collections.ts

# 4. Notificar al equipo
```

### Escenario 2: Error en Configuración de UI

```bash
# 1. Revertir cambios de UI en NocoBase admin panel
# 2. Restaurar schemas desde backup (si aplica)
# 3. Verificar funcionalidad
```

### Escenario 3: Rollback Completo de Versión

```bash
# 1. Identificar última versión estable
git log --oneline

# 2. Crear rama de rollback
git checkout -b rollback/<version>

# 3. Revertir a commit estable
git revert <commit-hash>

# 4. Re-deploy desde rama rollback

# 5. Notificar incidente y crear post-mortem
```

---

## Monitoreo Post-Deployment

### Primeras 24 Horas

- [ ] Verificar logs de errores cada 2 horas
- [ ] Monitorear uso de API (rate limits, timeouts)
- [ ] Revisar feedback de usuarios
- [ ] Verificar performance de queries

### Primera Semana

- [ ] Revisar métricas de uso
- [ ] Identificar bugs reportados
- [ ] Documentar lecciones aprendidas
- [ ] Planificar hotfixes si es necesario

### Métricas Clave

| Métrica | Objetivo | Umbral de Alerta |
|---------|----------|------------------|
| Uptime | > 99.5% | < 99% |
| Response Time (API) | < 500ms | > 2s |
| Error Rate | < 0.5% | > 2% |
| Casos Creados/Día | Según baseline | -50% de baseline |

---

## Troubleshooting Común

### Error: "Cannot connect to NocoBase API"

```bash
# Verificar URL y token
curl -H "Authorization: Bearer $NOCOBASE_API_KEY" \
     $NOCOBASE_BASE_URL

# Revisar firewall y DNS
ping nocobase.hospitaldeovalle.cl
```

### Error: "Timeout en queries SQL (SIDRA)"

```bash
# Aumentar timeout en .env
NOCOBASE_TIMEOUT_SECONDS=60

# Verificar conexión a SIDRA
# Revisar logs de SQL Server
```

### Error: "Colección no encontrada"

```bash
# Listar colecciones actuales
node Apps/UGCO/scripts/list-collections.ts

# Re-ejecutar configuración
cd scripts && python nocobase_configure.py
```

---

## Recursos Adicionales

- [OPERATIONS.md](./OPERATIONS.md) - Operaciones de mantenimiento
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Solución de problemas
- [ARQUITECTURA.md](./ARQUITECTURA.md) - Arquitectura del sistema
- [UGCO/README.md](../UGCO/README.md) - Documentación de UGCO

---

## Historial de Deployments

| Fecha | Versión | Cambios | Responsable | Resultado |
|-------|---------|---------|-------------|-----------|
| 2026-01-25 | - | Auditoría y limpieza de código | Equipo MIRA | ✅ Exitoso |
| TBD | 1.0.0 | Primer deployment UGCO Fase 1 | TBD | Pendiente |

---

**Última actualización**: 2026-01-25
**Mantenido por**: Equipo MIRA - Hospital de Ovalle
**Revisión**: Antes de cada deployment mayor
