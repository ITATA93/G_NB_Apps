# Manual Técnico - [NOMBRE_APP]

**Última Actualización**: YYYY-MM-DD
**Versión**: 0.1.0
**Audiencia**: Administradores, DevOps, Desarrolladores

---

## Introducción

Este manual técnico proporciona información detallada para la administración, mantenimiento y troubleshooting de [NOMBRE_APP].

---

## Índice

1. [Instalación y Configuración](#instalación-y-configuración)
2. [Administración](#administración)
3. [Mantenimiento](#mantenimiento)
4. [Monitoring](#monitoring)
5. [Backup y Recovery](#backup-y-recovery)
6. [Troubleshooting](#troubleshooting)
7. [APIs y Integraciones](#apis-y-integraciones)

---

## Instalación y Configuración

### Requisitos del Sistema

**Servidor**:
- CPU: 4+ cores
- RAM: 8+ GB
- Disco: 100+ GB SSD
- OS: Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+

**Software**:
- Node.js: 18.x o superior
- PostgreSQL: 14.x o MySQL 8.x
- Nginx/Apache (como proxy reverso)
- PM2 (para gestión de procesos)

### Instalación Inicial

#### 1. Clonar Repositorio

```bash
git clone [URL_REPOSITORIO]
cd NB_Apps/Apps/[NOMBRE_APP]
```

#### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
nano .env
```

**Variables Requeridas**:
```env
# NocoBase API
NOCOBASE_API_URL=https://nocobase.hospitaldeovalle.cl/api
NOCOBASE_API_TOKEN=tu_token_aqui

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=app_database
DB_USER=app_user
DB_PASSWORD=tu_password_aqui

# ALMA/SIDRA (si aplica)
SIDRA_HOST=sidra.hospitaldeovalle.cl
SIDRA_PORT=1433
SIDRA_DATABASE=SIDRA
SIDRA_USERNAME=readonly_user
SIDRA_PASSWORD=tu_password_aqui
```

#### 3. Instalar Dependencias

```bash
cd MIRA  # O el directorio de NocoBase
npm install
```

#### 4. Configurar Colecciones

```bash
# Ejecutar script de configuración
node scripts/configure/configure.ts
```

#### 5. Cargar Datos de Referencia

```bash
# Seed de datos maestros
node scripts/seed/seed-references.ts
```

#### 6. Iniciar Aplicación

```bash
# Desarrollo
npm run dev

# Producción
npm run build
pm2 start npm --name "nocobase-[app]" -- start
```

### Configuración de Nginx (Proxy Reverso)

```nginx
server {
    listen 80;
    server_name [dominio];

    location / {
        proxy_pass http://localhost:13000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Configuración de SSL

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d [dominio]
```

---

## Administración

### Gestión de Usuarios y Roles

#### Crear Usuario

**Vía UI**:
1. Ir a Configuración > Usuarios
2. Hacer clic en "Crear Usuario"
3. Completar formulario
4. Asignar rol
5. Guardar

**Vía API**:
```bash
curl -X POST https://nocobase.hospitaldeovalle.cl/api/users:create \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "username": "usuario",
    "password": "password_seguro",
    "roles": ["usuario"]
  }'
```

#### Gestionar Roles

**Roles Predefinidos**:
| Rol | Descripción | Permisos |
|-----|-------------|----------|
| admin | Administrador | Acceso completo |
| usuario | Usuario estándar | CRUD limitado |
| readonly | Solo lectura | Ver y exportar |

**Crear Rol Personalizado**:
1. Ir a Configuración > Roles
2. Hacer clic en "Crear Rol"
3. Definir permisos por colección
4. Guardar

### Gestión de Colecciones

#### Listar Colecciones

```bash
node scripts/inspect/list-collections.ts
```

#### Inspeccionar Colección

```bash
node scripts/inspect/inspect-collection.ts <nombre_coleccion>
```

Salida ejemplo:
```json
{
  "name": "casos_oncologicos",
  "fields": [...],
  "indexes": [...],
  "associations": [...]
}
```

#### Crear Nueva Colección

**Vía Script**:
```bash
node scripts/configure/create-collection.ts --name nueva_coleccion --fields fields.json
```

**Vía UI**:
1. Ir a Configuración > Colecciones
2. Hacer clic en "+ Nueva Colección"
3. Definir campos y relaciones
4. Guardar

#### Modificar Colección Existente

```bash
node scripts/configure/update-collection.ts --name coleccion --add-field nuevo_campo
```

### Gestión de Workflows

#### Listar Workflows

**Vía UI**: Configuración > Workflows

**Vía API**:
```bash
curl -X GET https://nocobase.hospitaldeovalle.cl/api/workflows:list \
  -H "Authorization: Bearer <token>"
```

#### Activar/Desactivar Workflow

**Vía UI**:
1. Ir a Configuración > Workflows
2. Seleccionar workflow
3. Toggle "Activo/Inactivo"

**Vía Script**:
```bash
node scripts/configure/toggle-workflow.ts --name nombre_workflow --status inactive
```

---

## Mantenimiento

### Rutinas de Mantenimiento

#### Diario

- [ ] Verificar logs de errores
- [ ] Monitorear uso de recursos
- [ ] Verificar jobs fallidos

#### Semanal

- [ ] Backup completo de base de datos
- [ ] Revisar queries lentas
- [ ] Limpiar logs antiguos
- [ ] Verificar espacio en disco

#### Mensual

- [ ] Actualizar dependencias de seguridad
- [ ] Revisar y optimizar índices
- [ ] Auditar usuarios y permisos
- [ ] Generar reporte de uso

### Actualización de la Aplicación

#### 1. Backup Previo

```bash
# Backup de BD
pg_dump -U app_user app_database > backup_$(date +%Y%m%d).sql

# Backup de código
tar -czf backup_code_$(date +%Y%m%d).tar.gz /path/to/app
```

#### 2. Actualizar Código

```bash
git fetch origin
git checkout <nueva_version>
npm install
```

#### 3. Migrar Base de Datos

```bash
npm run migrate
```

#### 4. Reiniciar Aplicación

```bash
pm2 restart nocobase-[app]
```

#### 5. Verificar

```bash
# Verificar que la app responde
curl https://[dominio]/api/health

# Verificar logs
pm2 logs nocobase-[app]
```

### Limpieza de Datos

#### Eliminar Logs Antiguos

```bash
# Logs > 30 días
find /path/to/logs -name "*.log" -mtime +30 -delete
```

#### Limpiar Archivos Temporales

```bash
# Archivos temp de uploads
find /path/to/storage/temp -mtime +7 -delete
```

#### Vacuum de Base de Datos (PostgreSQL)

```bash
psql -U app_user -d app_database -c "VACUUM ANALYZE;"
```

---

## Monitoring

### Métricas Clave

| Métrica | Umbral Normal | Umbral Crítico | Acción |
|---------|--------------|----------------|--------|
| CPU | <70% | >90% | Escalar recursos |
| RAM | <80% | >95% | Investigar memory leaks |
| Disco | <70% | >85% | Limpiar o expandir |
| Tiempo de respuesta API | <500ms | >2s | Optimizar queries |

### Herramientas de Monitoring

#### PM2 Monitoring

```bash
# Ver status
pm2 status

# Ver logs en tiempo real
pm2 logs nocobase-[app]

# Ver métricas
pm2 monit
```

#### Monitoring de Base de Datos

**PostgreSQL**:
```sql
-- Queries lentas
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Conexiones activas
SELECT count(*) FROM pg_stat_activity;

-- Tamaño de tablas
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Logs de Aplicación

**Ubicación**: `/path/to/app/logs/`

**Tipos de Logs**:
- `app.log` - Log general de aplicación
- `error.log` - Errores
- `access.log` - Accesos HTTP
- `query.log` - Queries de BD (si está habilitado)

**Ver logs en tiempo real**:
```bash
tail -f logs/app.log
```

**Buscar errores**:
```bash
grep -i "error" logs/app.log
```

### Alertas

Configurar alertas para:
- Uso de CPU > 85%
- Uso de RAM > 90%
- Disco < 15% libre
- Errores 500 > 10/min
- Tiempo de respuesta > 3s

---

## Backup y Recovery

### Estrategia de Backup

| Tipo | Frecuencia | Retención | Método |
|------|-----------|-----------|--------|
| Completo | Semanal | 4 semanas | pg_dump / mysqldump |
| Incremental | Diario | 7 días | WAL archiving (PostgreSQL) |
| Archivos | Diario | 30 días | rsync |

### Backup de Base de Datos

#### PostgreSQL

**Backup Completo**:
```bash
pg_dump -U app_user -Fc app_database > backup_$(date +%Y%m%d).dump
```

**Backup con Compresión**:
```bash
pg_dump -U app_user app_database | gzip > backup_$(date +%Y%m%d).sql.gz
```

**Backup Automático (Cron)**:
```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 2 AM
0 2 * * * /path/to/backup-script.sh
```

#### MySQL

```bash
mysqldump -u app_user -p app_database > backup_$(date +%Y%m%d).sql
```

### Backup de Archivos

```bash
# Backup de storage (uploads, etc.)
rsync -avz /path/to/storage/ /backup/storage_$(date +%Y%m%d)/

# Backup de configuración
rsync -avz /path/to/app/.env /backup/config/
```

### Restauración

#### Restaurar Base de Datos

**PostgreSQL**:
```bash
# Desde dump custom format
pg_restore -U app_user -d app_database backup.dump

# Desde SQL
psql -U app_user -d app_database < backup.sql
```

**MySQL**:
```bash
mysql -u app_user -p app_database < backup.sql
```

#### Restaurar Archivos

```bash
rsync -avz /backup/storage_YYYYMMDD/ /path/to/storage/
```

### Procedimiento de Disaster Recovery

1. **Evaluar el daño**
   - ¿Qué se perdió? (BD, archivos, configuración)
   - ¿Cuál es el último backup válido?

2. **Preparar ambiente**
   - Verificar que el servidor esté operativo
   - Instalar software necesario

3. **Restaurar base de datos**
   - Usar backup más reciente
   - Verificar integridad de datos

4. **Restaurar archivos**
   - Copiar archivos de storage
   - Restaurar configuración (.env)

5. **Verificar**
   - Iniciar aplicación
   - Ejecutar tests de humo
   - Verificar funcionalidades críticas

6. **Documentar**
   - Registrar el incidente
   - Documentar lecciones aprendidas

---

## Troubleshooting

### Problemas Comunes

#### 1. Aplicación No Responde

**Síntomas**: HTTP 502/503

**Causas Posibles**:
- App caída
- Recursos insuficientes
- Problema de red

**Diagnóstico**:
```bash
# Verificar proceso
pm2 status

# Verificar logs
pm2 logs nocobase-[app] --lines 100

# Verificar recursos
top
df -h
```

**Solución**:
```bash
# Reiniciar app
pm2 restart nocobase-[app]

# Si no funciona, rebuild
pm2 delete nocobase-[app]
npm run build
pm2 start npm --name "nocobase-[app]" -- start
```

#### 2. Queries Lentas

**Síntomas**: Tiempo de respuesta > 2s

**Diagnóstico**:
```sql
-- PostgreSQL
SELECT query, mean_time
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC;
```

**Solución**:
- Agregar índices a campos de búsqueda
- Optimizar query (evitar SELECT *)
- Implementar cache

#### 3. Error de Conexión a BD

**Síntomas**: "ECONNREFUSED" o "authentication failed"

**Verificar**:
```bash
# PostgreSQL
psql -U app_user -d app_database

# MySQL
mysql -u app_user -p app_database
```

**Solución**:
- Verificar credenciales en .env
- Verificar que BD esté corriendo
- Verificar firewall/networking

**Detalles completos**: Ver [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## APIs y Integraciones

### Autenticación

**Obtener Token**:
```bash
curl -X POST https://nocobase.hospitaldeovalle.cl/api/auth:signIn \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@example.com",
    "password": "password"
  }'
```

**Respuesta**:
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Endpoints Principales

#### Listar Registros

```bash
curl -X GET "https://nocobase.hospitaldeovalle.cl/api/[coleccion]:list?page=1&pageSize=20" \
  -H "Authorization: Bearer <token>"
```

#### Crear Registro

```bash
curl -X POST https://nocobase.hospitaldeovalle.cl/api/[coleccion]:create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "campo1": "valor1",
    "campo2": "valor2"
  }'
```

#### Actualizar Registro

```bash
curl -X PUT https://nocobase.hospitaldeovalle.cl/api/[coleccion]:update?filterByTk=<id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "campo1": "nuevo_valor"
  }'
```

#### Eliminar Registro

```bash
curl -X DELETE "https://nocobase.hospitaldeovalle.cl/api/[coleccion]:destroy?filterByTk=<id>" \
  -H "Authorization: Bearer <token>"
```

### Rate Limiting

- **Límite**: 100 requests/minuto por usuario
- **Headers de respuesta**:
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 75
  X-RateLimit-Reset: 1234567890
  ```

### Webhooks

**Configurar Webhook**:
1. Ir a Configuración > Webhooks
2. Crear nuevo webhook
3. Definir:
   - URL de destino
   - Eventos que disparan (create, update, delete)
   - Colecciones monitoreadas

**Payload Ejemplo**:
```json
{
  "event": "create",
  "collection": "casos_oncologicos",
  "data": {
    "id": 123,
    "campo1": "valor1"
  },
  "timestamp": "2026-01-25T12:00:00Z"
}
```

---

## Seguridad

### Auditoría de Seguridad

#### Revisar Usuarios Activos

```sql
SELECT username, email, last_login
FROM users
WHERE status = 'active'
ORDER BY last_login DESC;
```

#### Revisar Permisos

```bash
node scripts/inspect/audit-permissions.ts
```

### Hardening

**Checklist**:
- [ ] Deshabilitar usuario root de BD
- [ ] Usar HTTPS en producción
- [ ] Configurar firewall (solo puertos necesarios)
- [ ] Habilitar 2FA para admins
- [ ] Rotar tokens/contraseñas periódicamente
- [ ] Mantener dependencias actualizadas

### Logs de Auditoría

**Habilitar Auditoría**:
```env
ENABLE_AUDIT_LOG=true
AUDIT_LOG_FILE=logs/audit.log
```

**Eventos Auditados**:
- Login/Logout
- Creación/Modificación/Eliminación de registros
- Cambios de permisos
- Cambios de configuración

---

## Apéndices

### A. Variables de Entorno

Ver [.env.example](../.env.example) para lista completa.

### B. Scripts Útiles

| Script | Ubicación | Propósito |
|--------|-----------|-----------|
| configure.ts | scripts/configure/ | Configurar colecciones |
| seed-references.ts | scripts/seed/ | Cargar datos maestros |
| list-collections.ts | scripts/inspect/ | Listar colecciones |
| health-check.ts | scripts/test/ | Verificar estado del sistema |

### C. Arquitectura

Ver [ARQUITECTURA.md](ARQUITECTURA.md) para diagrama completo.

### D. Referencias

- [NocoBase Documentation](https://docs.nocobase.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

---

**Para soporte técnico avanzado**, contactar al equipo de desarrollo.

**Versión**: 0.1.0
**Última Actualización**: YYYY-MM-DD
