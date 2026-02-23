# Guía de Troubleshooting - [NOMBRE_APP]

**Última Actualización**: YYYY-MM-DD
**Versión**: 0.1.0

---

## Introducción

Esta guía proporciona soluciones paso a paso para los problemas más comunes en [NOMBRE_APP].

**Formato de cada problema**:
- 🔴 **Síntoma**: Lo que observas
- 🔍 **Causa**: Por qué ocurre
- ✅ **Solución**: Cómo resolverlo
- 🛡️ **Prevención**: Cómo evitarlo en el futuro

---

## Índice de Problemas

### Aplicación
1. [Aplicación no responde (502/503)](#1-aplicación-no-responde-502503)
2. [Errores 500 Internal Server Error](#2-errores-500-internal-server-error)
3. [Página en blanco después de login](#3-página-en-blanco-después-de-login)
4. [Slow performance / Timeouts](#4-slow-performance--timeouts)

### Autenticación
5. [No puedo iniciar sesión](#5-no-puedo-iniciar-sesión)
6. [Token expirado constantemente](#6-token-expirado-constantemente)
7. [403 Forbidden en operaciones](#7-403-forbidden-en-operaciones)

### Base de Datos
8. [Error de conexión a base de datos](#8-error-de-conexión-a-base-de-datos)
9. [Queries extremadamente lentas](#9-queries-extremadamente-lentas)
10. [Pérdida de datos o corrupción](#10-pérdida-de-datos-o-corrupción)

### Colecciones y Datos
11. [Colecciones no aparecen](#11-colecciones-no-aparecen)
12. [Campos no se guardan](#12-campos-no-se-guardan)
13. [Error de validación al guardar](#13-error-de-validación-al-guardar)
14. [Relaciones rotas o datos huérfanos](#14-relaciones-rotas-o-datos-huérfanos)

### Workflows
15. [Workflow no se ejecuta](#15-workflow-no-se-ejecuta)
16. [Workflow falla en un paso](#16-workflow-falla-en-un-paso)

### Integraciones
17. [No se pueden leer datos de ALMA/SIDRA](#17-no-se-pueden-leer-datos-de-almasidra)
18. [Sincronización de datos detenida](#18-sincronización-de-datos-detenida)

### Scripts y Automatización
19. [Scripts devuelven 0 colecciones](#19-scripts-devuelven-0-colecciones)
20. [Errores al ejecutar seed](#20-errores-al-ejecutar-seed)

---

## Aplicación

### 1. Aplicación no responde (502/503)

🔴 **Síntoma**:
- Navegador muestra "502 Bad Gateway" o "503 Service Unavailable"
- La página no carga

🔍 **Causas**:
- Proceso de Node.js caído
- Nginx no puede conectar con la app
- Recursos del servidor agotados (RAM/CPU)

✅ **Solución**:

**Paso 1: Verificar proceso**
```bash
pm2 status
```

Si la app está "stopped" o "errored":
```bash
pm2 restart nocobase-[app]
```

**Paso 2: Ver logs**
```bash
pm2 logs nocobase-[app] --lines 100
```

Buscar errores como:
- `EADDRINUSE` - Puerto ya en uso
- `Out of memory` - Memoria insuficiente
- `ECONNREFUSED` - No puede conectar a BD

**Paso 3: Verificar recursos**
```bash
# CPU y RAM
top

# Espacio en disco
df -h
```

Si RAM > 95%:
```bash
# Reiniciar proceso para liberar memoria
pm2 restart nocobase-[app]

# Si persiste, escalar recursos del servidor
```

**Paso 4: Verificar Nginx**
```bash
sudo nginx -t  # Test de configuración
sudo systemctl status nginx
```

Si Nginx está caído:
```bash
sudo systemctl start nginx
```

🛡️ **Prevención**:
- Configurar PM2 para auto-restart: `pm2 startup`
- Monitorear uso de recursos
- Configurar alertas para uso > 80%

---

### 2. Errores 500 Internal Server Error

🔴 **Síntoma**:
- API devuelve error 500
- Operaciones fallan sin mensaje claro

🔍 **Causas**:
- Error en código de workflow
- Error en query de base de datos
- Excepción no manejada en plugin

✅ **Solución**:

**Paso 1: Revisar logs de aplicación**
```bash
tail -f logs/error.log
```

**Paso 2: Buscar stack trace**
```bash
grep -A 20 "Error:" logs/app.log | tail -30
```

**Paso 3: Identificar endpoint problemático**
```bash
# Ver logs de acceso con errores 500
grep " 500 " logs/access.log
```

**Paso 4: Reproducir el error**
- Intentar la misma operación
- Capturar request/response exactos

**Paso 5: Revisar workflows**
```bash
node scripts/inspect/list-workflows.ts
```

Desactivar workflows sospechosos temporalmente.

🛡️ **Prevención**:
- Implementar try-catch en código custom
- Validar datos antes de procesar
- Tests de integración

---

### 3. Página en blanco después de login

🔴 **Síntoma**:
- Login exitoso pero página queda en blanco
- No hay errores visibles en UI

🔍 **Causas**:
- Problema de permisos del rol
- Error de JavaScript en frontend
- Cache del navegador corrupto

✅ **Solución**:

**Paso 1: Revisar consola del navegador**
- Abrir DevTools (F12)
- Ver tab Console
- Buscar errores rojos

**Paso 2: Limpiar cache del navegador**
```
Ctrl + Shift + Delete (Windows)
Cmd + Shift + Delete (Mac)
```
Seleccionar "Cached images and files" y limpiar.

**Paso 3: Verificar permisos del rol**
```bash
node scripts/inspect/check-role-permissions.ts --role [nombre_rol]
```

Si no tiene permisos a colecciones:
- Ir a Configuración > Roles
- Editar rol
- Asignar permisos a colecciones necesarias

**Paso 4: Probar en incógnito**
- Si funciona en incógnito, es problema de cache

🛡️ **Prevención**:
- Asignar permisos básicos a todos los roles
- Verificar roles antes de asignar a usuarios

---

### 4. Slow Performance / Timeouts

🔴 **Síntoma**:
- Páginas tardan >5s en cargar
- Timeouts en operaciones
- UI se siente lenta

🔍 **Causas**:
- Queries sin índices
- Datos sin paginar
- Demasiados workflows ejecutándose

✅ **Solución**:

**Paso 1: Identificar queries lentas**
```sql
-- PostgreSQL
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**Paso 2: Agregar índices**
```bash
node scripts/configure/add-index.ts --collection [nombre] --fields campo1,campo2
```

**Paso 3: Verificar paginación**
- En vistas de listado, verificar que `pageSize` esté configurado
- Máximo recomendado: 50 registros por página

**Paso 4: Revisar workflows**
```bash
# Ver workflows activos
node scripts/inspect/list-workflows.ts --status active
```

Desactivar workflows no críticos temporalmente.

**Paso 5: Optimizar queries N+1**
- Usar `appends` para eager loading de relaciones
```javascript
{
  appends: ['relacion_a', 'relacion_b']
}
```

🛡️ **Prevención**:
- Crear índices en campos de búsqueda frecuente
- Siempre usar paginación
- Monitorear performance regularmente

---

## Autenticación

### 5. No puedo iniciar sesión

🔴 **Síntoma**:
- Credenciales rechazadas
- Error "Invalid email or password"

🔍 **Causas**:
- Credenciales incorrectas
- Usuario desactivado
- Problema de sincronización de usuarios

✅ **Solución**:

**Paso 1: Verificar que el usuario existe**
```bash
node scripts/inspect/check-user.ts --email usuario@example.com
```

**Paso 2: Resetear contraseña (como admin)**
```bash
node scripts/admin/reset-password.ts --email usuario@example.com
```

**Paso 3: Verificar estado del usuario**
```sql
SELECT username, email, status
FROM users
WHERE email = 'usuario@example.com';
```

Si `status = 'inactive'`:
```sql
UPDATE users
SET status = 'active'
WHERE email = 'usuario@example.com';
```

**Paso 4: Verificar configuración de autenticación**
```bash
grep -i "auth" .env
```

🛡️ **Prevención**:
- Implementar recuperación de contraseña
- Política clara de contraseñas
- No desactivar usuarios sin notificar

---

### 6. Token expirado constantemente

🔴 **Síntoma**:
- Sesión expira cada pocos minutos
- Necesitas re-autenticarte frecuentemente

🔍 **Causas**:
- TTL del token muy corto
- Reloj del servidor desincronizado
- Configuración incorrecta de JWT

✅ **Solución**:

**Paso 1: Verificar TTL del token**
```bash
grep -i "token" .env
```

Debería ver algo como:
```env
JWT_EXPIRATION=7d  # 7 días
```

Si está en minutos/horas, cambiar a días:
```env
JWT_EXPIRATION=7d
```

**Paso 2: Verificar hora del servidor**
```bash
date
timedatectl status
```

Si está desincronizado:
```bash
sudo timedatectl set-ntp true
```

**Paso 3: Reiniciar app**
```bash
pm2 restart nocobase-[app]
```

🛡️ **Prevención**:
- Configurar NTP en el servidor
- TTL recomendado: 7-30 días para usuarios
- Implementar refresh tokens

---

### 7. 403 Forbidden en operaciones

🔴 **Síntoma**:
- Operación retorna 403 Forbidden
- Mensaje: "You don't have permission"

🔍 **Causas**:
- Rol no tiene permisos para la acción
- Intentando modificar recurso de otro usuario
- Bug en configuración de permisos

✅ **Solución**:

**Paso 1: Verificar permisos del rol**
```bash
node scripts/inspect/check-role-permissions.ts --role [tu_rol]
```

**Paso 2: Ver matriz de permisos**
- Ir a Configuración > Roles
- Seleccionar tu rol
- Ver permisos por colección

**Paso 3: Agregar permisos faltantes**
- Como admin, editar el rol
- Asignar permisos necesarios (create, read, update, delete)

**Paso 4: Verificar scope de permisos**
Algunos permisos pueden estar configurados como "own" (solo propios):
- Cambiar a "all" si es necesario

🛡️ **Prevención**:
- Documentar matriz de permisos
- Revisar permisos antes de asignar roles
- Implementar tests de permisos

---

## Base de Datos

### 8. Error de conexión a base de datos

🔴 **Síntoma**:
- Error "ECONNREFUSED"
- Error "authentication failed"
- App no puede iniciar

🔍 **Causas**:
- Base de datos no está corriendo
- Credenciales incorrectas
- Firewall bloqueando conexión
- Host/puerto incorrectos

✅ **Solución**:

**Paso 1: Verificar que BD está corriendo**
```bash
# PostgreSQL
sudo systemctl status postgresql

# MySQL
sudo systemctl status mysql
```

Si está detenida:
```bash
sudo systemctl start postgresql  # o mysql
```

**Paso 2: Verificar credenciales**
```bash
# PostgreSQL
psql -U app_user -d app_database -h localhost

# MySQL
mysql -u app_user -p -h localhost app_database
```

Si falla, resetear contraseña:
```bash
# PostgreSQL
sudo -u postgres psql
postgres=# ALTER USER app_user WITH PASSWORD 'nueva_password';

# MySQL
sudo mysql
mysql> ALTER USER 'app_user'@'localhost' IDENTIFIED BY 'nueva_password';
```

**Paso 3: Verificar configuración .env**
```env
DB_HOST=localhost  # Debe coincidir
DB_PORT=5432       # PostgreSQL default
DB_NAME=app_database
DB_USER=app_user
DB_PASSWORD=tu_password
```

**Paso 4: Verificar conectividad**
```bash
# PostgreSQL
nc -zv localhost 5432

# MySQL
nc -zv localhost 3306
```

🛡️ **Prevención**:
- Documentar credenciales en gestor seguro
- Verificar BD en health checks
- Monitorear estado de BD

---

### 9. Queries extremadamente lentas

🔴 **Síntoma**:
- Queries toman >5 segundos
- Timeouts en listados grandes
- Alto uso de CPU en BD

🔍 **Causas**:
- Falta de índices
- Query sin optimizar (SELECT *, N+1)
- Tabla muy grande sin paginación

✅ **Solución**:

**Paso 1: Identificar query lenta**
```sql
-- PostgreSQL
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 5;
```

**Paso 2: Analizar EXPLAIN**
```sql
EXPLAIN ANALYZE
SELECT * FROM casos_oncologicos WHERE estado = 'activo';
```

Buscar:
- "Seq Scan" sin índice
- "Nested Loop" costoso

**Paso 3: Crear índice**
```sql
CREATE INDEX idx_casos_estado ON casos_oncologicos(estado);
```

**Paso 4: Vacuuming (PostgreSQL)**
```sql
VACUUM ANALYZE casos_oncologicos;
```

**Paso 5: Limitar resultados**
- Usar paginación
- Filtrar por fecha (últimos 6 meses, etc.)

🛡️ **Prevención**:
- Crear índices en campos de filtro/búsqueda
- Evitar SELECT *
- Siempre usar paginación
- Monitorear pg_stat_statements

---

### 10. Pérdida de datos o corrupción

🔴 **Síntoma**:
- Datos desaparecen sin explicación
- Valores cambian inesperadamente
- Errores de integridad referencial

🔍 **Causas**:
- Workflow mal configurado
- Eliminación accidental
- Bug en código
- Corrupción de disco (raro)

✅ **Solución**:

**Paso 1: DETENER OPERACIONES**
```bash
# Poner app en modo mantenimiento
pm2 stop nocobase-[app]
```

**Paso 2: Verificar integridad de BD**
```bash
# PostgreSQL
sudo -u postgres vacuumdb --analyze --verbose app_database
```

**Paso 3: Revisar logs de auditoría**
```bash
grep "DELETE\|UPDATE" logs/audit.log | grep [tabla_afectada]
```

**Paso 4: Restaurar desde backup**
Si es crítico:
```bash
# Backup de estado actual (por si acaso)
pg_dump -U app_user app_database > before_restore_$(date +%Y%m%d).sql

# Restaurar desde backup
psql -U app_user -d app_database < backup_YYYYMMDD.sql
```

**Paso 5: Investigar causa raíz**
- Revisar workflows
- Revisar scripts recientes
- Revisar logs de la aplicación

🛡️ **Prevención**:
- **Backups diarios automatizados**
- Habilitar auditoría en tablas críticas
- Soft deletes en lugar de DELETE físico
- Restricciones de integridad en BD
- Tests exhaustivos antes de deploy

---

## Colecciones y Datos

### 11. Colecciones no aparecen

🔴 **Síntoma**:
- Colecciones no se ven en UI
- Scripts retornan 0 colecciones

🔍 **Causas**:
- No están creadas
- Permisos del rol
- Cache desactualizado
- Conectado a BD/datasource incorrecta

✅ **Solución**:

**Paso 1: Verificar que existen en BD**
```bash
node scripts/inspect/list-collections.ts
```

Si retorna 0 o pocas colecciones:
```bash
# Listar directamente en BD
psql -U app_user -d app_database -c "\dt"
```

**Paso 2: Verificar configuración de datasource**
```bash
grep -i "datasource" .env
```

**Paso 3: Refrescar metadata de NocoBase**
- Ir a Configuración > Colecciones
- Hacer clic en "Refresh"

O vía API:
```bash
curl -X POST https://nocobase.hospitaldeovalle.cl/api/collections:reload \
  -H "Authorization: Bearer <admin_token>"
```

**Paso 4: Verificar permisos**
```bash
node scripts/inspect/check-role-permissions.ts --role [tu_rol]
```

Si no tienes permisos, contactar admin.

**Paso 5: Crear colecciones si no existen**
```bash
node scripts/configure/configure.ts
```

🛡️ **Prevención**:
- Documentar proceso de configuración
- Scripts idempotentes
- Verificar después de cada deploy

---

### 12. Campos no se guardan

🔴 **Síntoma**:
- Guardas formulario pero campos quedan vacíos
- Algunos campos se guardan, otros no

🔍 **Causas**:
- Campo no existe en la colección
- Validación fallando silenciosamente
- Tipo de dato incorrecto
- Campo no enviado en request

✅ **Solución**:

**Paso 1: Verificar campos de la colección**
```bash
node scripts/inspect/inspect-collection.ts [nombre_coleccion]
```

**Paso 2: Revisar logs del navegador**
- F12 > Network tab
- Buscar request de creación/actualización
- Ver payload enviado
- Ver respuesta

**Paso 3: Ver validaciones**
```bash
node scripts/inspect/check-field-validations.ts --collection [nombre] --field [campo]
```

**Paso 4: Probar vía API directamente**
```bash
curl -X POST https://nocobase.hospitaldeovalle.cl/api/[coleccion]:create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"campo_problematico": "valor"}' \
  -v
```

Ver si hay mensaje de error.

**Paso 5: Verificar tipo de dato**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = '[nombre_coleccion]'
AND column_name = '[campo_problematico]';
```

🛡️ **Prevención**:
- Validaciones claras con mensajes descriptivos
- Tests de creación/actualización
- Logging de validaciones fallidas

---

### 13. Error de validación al guardar

🔴 **Síntoma**:
- Mensaje "Validation error"
- No puedo guardar formulario

🔍 **Causas**:
- Campo requerido vacío
- Formato incorrecto (email, fecha, etc.)
- Valor duplicado en campo unique
- Regla de negocio fallando

✅ **Solución**:

**Paso 1: Leer mensaje de error**
Usualmente el error indica qué campo falla:
```
Validation error: email must be a valid email
```

**Paso 2: Ver validaciones del campo**
```bash
node scripts/inspect/inspect-collection.ts [coleccion] | grep -A 5 [campo]
```

**Paso 3: Corregir dato**
Ejemplos:
- Email inválido: Usar formato `user@example.com`
- Fecha inválida: Usar formato ISO `YYYY-MM-DD`
- Campo requerido: No dejar vacío

**Paso 4: Ver valores únicos**
Si el error es "must be unique":
```sql
SELECT [campo], COUNT(*)
FROM [tabla]
WHERE [campo] = '[valor_que_intentas_guardar]'
GROUP BY [campo];
```

Si ya existe, cambiar el valor.

🛡️ **Prevención**:
- Validación en tiempo real en UI
- Mensajes de error claros
- Documentar reglas de validación

---

### 14. Relaciones rotas o datos huérfanos

🔴 **Síntoma**:
- Relaciones no cargan
- Datos de relación aparecen como `null`
- Error "foreign key constraint"

🔍 **Causas**:
- Registro padre eliminado
- Foreign key incorrecto
- Relación mal configurada

✅ **Solución**:

**Paso 1: Verificar configuración de relación**
```bash
node scripts/inspect/inspect-collection.ts [coleccion] | grep -A 10 "associations"
```

**Paso 2: Buscar registros huérfanos**
```sql
SELECT *
FROM tabla_hija th
LEFT JOIN tabla_padre tp ON th.padre_id = tp.id
WHERE tp.id IS NULL;
```

**Paso 3: Limpiar huérfanos**
```sql
-- Opción 1: Eliminar huérfanos
DELETE FROM tabla_hija
WHERE padre_id NOT IN (SELECT id FROM tabla_padre);

-- Opción 2: Poner a NULL (si el campo lo permite)
UPDATE tabla_hija
SET padre_id = NULL
WHERE padre_id NOT IN (SELECT id FROM tabla_padre);
```

**Paso 4: Recrear relación**
Si la relación está mal configurada:
```bash
node scripts/configure/fix-association.ts \
  --source tabla_hija \
  --target tabla_padre \
  --type belongsTo \
  --foreignKey padre_id
```

🛡️ **Prevención**:
- Usar `ON DELETE CASCADE` o `ON DELETE SET NULL` en FKs
- Soft deletes en tablas padre
- Validar antes de eliminar padres

---

## Workflows

### 15. Workflow no se ejecuta

🔴 **Síntoma**:
- Evento se dispara pero workflow no corre
- No hay logs del workflow

🔍 **Causas**:
- Workflow desactivado
- Condición del trigger no se cumple
- Error silencioso en primer paso

✅ **Solución**:

**Paso 1: Verificar estado del workflow**
```bash
node scripts/inspect/list-workflows.ts | grep [nombre_workflow]
```

Si está "inactive":
```bash
node scripts/configure/toggle-workflow.ts --name [nombre] --status active
```

**Paso 2: Ver logs de workflow**
```bash
grep -i "workflow.*[nombre_workflow]" logs/app.log
```

**Paso 3: Verificar trigger**
```bash
node scripts/inspect/inspect-workflow.ts [nombre_workflow]
```

Ver:
- `trigger`: ¿Es el evento correcto? (afterCreate, beforeUpdate, etc.)
- `collection`: ¿Es la colección correcta?
- `condition`: ¿Hay condición que no se cumple?

**Paso 4: Probar manualmente**
```bash
# Disparar workflow manualmente (si tiene trigger manual)
curl -X POST https://nocobase.hospitaldeovalle.cl/api/workflows:trigger \
  -H "Authorization: Bearer <token>" \
  -d '{"workflow": "[id_workflow]"}'
```

🛡️ **Prevención**:
- Logging detallado en workflows
- Tests de workflows
- Monitorear ejecuciones fallidas

---

### 16. Workflow falla en un paso

🔴 **Síntoma**:
- Workflow empieza pero falla en un paso específico
- Error en logs

🔍 **Causas**:
- Datos faltantes
- Error en lógica del paso
- API externa no responde
- Timeout

✅ **Solución**:

**Paso 1: Identificar paso que falla**
```bash
grep -A 20 "Workflow.*error" logs/app.log
```

**Paso 2: Ver configuración del paso**
```bash
node scripts/inspect/inspect-workflow.ts [nombre_workflow] --verbose
```

**Paso 3: Depurar paso por paso**
- Desactivar pasos siguientes
- Ejecutar hasta el paso problemático
- Ver datos intermedios

**Paso 4: Manejar errores**
Agregar paso "Error Handler" después del paso problemático:
```json
{
  "type": "error_handler",
  "on_error": "continue",  // o "stop"
  "actions": [
    {
      "type": "log",
      "message": "Error en paso X: {{error}}"
    }
  ]
}
```

🛡️ **Prevención**:
- Error handling en todos los workflows
- Timeouts razonables
- Validación de datos antes de pasos críticos
- Logging de variables intermedias

---

## Integraciones

### 17. No se pueden leer datos de ALMA/SIDRA

🔴 **Síntoma**:
- Colecciones `alma_*` vacías
- Error "Connection timeout" o "Authentication failed"

🔍 **Causas**:
- Credenciales SIDRA incorrectas
- Firewall bloqueando conexión
- Servidor SIDRA caído
- Datasource mal configurado

✅ **Solución**:

**Paso 1: Verificar configuración de datasource**
```bash
grep -i "sidra" .env
```

Verificar:
```env
SIDRA_HOST=sidra.hospitaldeovalle.cl
SIDRA_PORT=1433
SIDRA_DATABASE=SIDRA
SIDRA_USERNAME=readonly_user
SIDRA_PASSWORD=tu_password
```

**Paso 2: Probar conexión directa**
```bash
# Usando sqlcmd (si está instalado)
sqlcmd -S sidra.hospitaldeovalle.cl,1433 -U readonly_user -P 'password' -d SIDRA -Q "SELECT TOP 5 * FROM PAC_Pacientes"
```

**Paso 3: Verificar conectividad de red**
```bash
# Ping al servidor
ping sidra.hospitaldeovalle.cl

# Verificar puerto abierto
nc -zv sidra.hospitaldeovalle.cl 1433
```

**Paso 4: Verificar configuración en NocoBase**
- Ir a Configuración > Datasources
- Editar datasource "sidra"
- Hacer "Test Connection"

**Paso 5: Ver logs de conexión**
```bash
grep -i "sidra\|datasource" logs/app.log | tail -50
```

🛡️ **Prevención**:
- Monitorear conexión a SIDRA
- Alertas si falla
- Credentials en vault seguro
- Health checks periódicos

---

### 18. Sincronización de datos detenida

🔴 **Síntoma**:
- Datos no se actualizan
- Datos de ALMA están desactualizados

🔍 **Causas**:
- Job de sincronización detenido
- Workflow de sync desactivado
- Error en proceso de sync

✅ **Solución**:

**Paso 1: Verificar jobs de sincronización**
```bash
# Si usa cron
crontab -l | grep sync

# Si usa PM2
pm2 list | grep sync
```

**Paso 2: Ver último sync exitoso**
```bash
grep -i "sync.*success" logs/app.log | tail -1
```

**Paso 3: Ejecutar sync manual**
```bash
node scripts/sync/sync-alma-data.ts --force
```

**Paso 4: Ver errores de sync**
```bash
grep -i "sync.*error" logs/app.log | tail -20
```

**Paso 5: Reactivar job**
```bash
# Cron
crontab -e
# Descomentar línea de sync

# PM2
pm2 restart sync-job
```

🛡️ **Prevención**:
- Monitorear última ejecución de sync
- Alertas si sync falla 2+ veces
- Logs detallados de sync

---

## Scripts y Automatización

### 19. Scripts devuelven 0 colecciones

🔴 **Síntoma**:
- Script `list-collections.ts` retorna 0 colecciones
- Pero las colecciones existen

🔍 **Causas**:
- Script usando cliente API antiguo
- Token inválido
- Datasource incorrecto

✅ **Solución**:

**Paso 1: Verificar que colecciones existen**
```bash
psql -U app_user -d app_database -c "\dt"
```

**Paso 2: Usar script actualizado**
```bash
# Script viejo (puede fallar)
node MIRA/scripts/list_collections.js

# Script nuevo (recomendado)
node MIRA/shared/scripts/list-collections.ts
```

**Paso 3: Verificar token**
```bash
# Ver token en .env
grep NOCOBASE_API_TOKEN .env

# Probar token
curl -X GET https://nocobase.hospitaldeovalle.cl/api/collections:list \
  -H "Authorization: Bearer <token>"
```

Si retorna 401:
```bash
# Re-autenticarse
curl -X POST https://nocobase.hospitaldeovalle.cl/api/auth:signIn \
  -d '{"email": "admin@example.com", "password": "password"}' \
  -H "Content-Type: application/json"
```

Copiar nuevo token a `.env`.

**Paso 4: Actualizar script a TypeScript**
Ver scripts en `MIRA/shared/scripts/` que usan `ApiClient.ts`.

🛡️ **Prevención**:
- Usar scripts TypeScript actualizados
- Deprecar scripts legacy
- Documentar scripts recomendados

---

### 20. Errores al ejecutar seed

🔴 **Síntoma**:
- Script de seed falla
- Algunos registros se crean, otros no

🔍 **Causas**:
- Datos duplicados (violación de unique)
- Relaciones faltantes (FK constraint)
- Formato de datos incorrecto

✅ **Solución**:

**Paso 1: Ver error completo**
```bash
node scripts/seed/seed-references.ts 2>&1 | tee seed-error.log
```

**Paso 2: Identificar tipo de error**

**Si es duplicado**:
```
Error: duplicate key value violates unique constraint
```

Opciones:
- Limpiar tabla antes: `TRUNCATE TABLE ref_especialidades CASCADE;`
- Usar upsert en script (INSERT ... ON CONFLICT DO UPDATE)

**Si es FK constraint**:
```
Error: insert or update on table violates foreign key constraint
```

Solución:
- Cargar datos en orden correcto (padres primero)
- Verificar que padres existen

**Paso 3: Ejecutar seed paso a paso**
Si el seed carga múltiples tablas:
```bash
node scripts/seed/seed-references.ts --only ref_especialidades
node scripts/seed/seed-references.ts --only ref_topografias
# etc.
```

**Paso 4: Validar datos de entrada**
```bash
# Ver primeros registros del archivo
head -n 5 BD/diccionarios/especialidades.json
```

Verificar formato JSON válido:
```bash
jq . BD/diccionarios/especialidades.json
```

🛡️ **Prevención**:
- Validar datos antes de seed
- Scripts idempotentes (upsert)
- Orden correcto de carga
- Tests de seed

---

## Herramientas de Diagnóstico

### Comandos Útiles

```bash
# Estado general del sistema
node scripts/test/health-check.ts

# Inspeccionar colección específica
node scripts/inspect/inspect-collection.ts [nombre]

# Ver permisos de un rol
node scripts/inspect/check-role-permissions.ts --role [nombre]

# Ver workflows activos
node scripts/inspect/list-workflows.ts --status active

# Verificar conexión a BD
node scripts/test/test-db-connection.ts

# Verificar conexión a SIDRA
node scripts/test/test-sidra-connection.ts
```

### Logs a Revisar

| Log | Ubicación | Propósito |
|-----|-----------|-----------|
| Aplicación | `logs/app.log` | Eventos generales |
| Errores | `logs/error.log` | Solo errores |
| Acceso | `logs/access.log` | Requests HTTP |
| Auditoría | `logs/audit.log` | Cambios en datos |
| PM2 | `~/.pm2/logs/` | Logs de proceso |

---

## Contacto de Soporte

Si ninguna de estas soluciones resuelve tu problema:

**Soporte Técnico**:
- Email: soporte@hospitaldeovalle.cl
- Teléfono: [+56 X XXXX XXXX]
- Horario: Lunes a Viernes, 08:00 - 18:00

**Al reportar un problema, incluir**:
1. Descripción del problema
2. Pasos para reproducir
3. Logs relevantes
4. Capturas de pantalla (si aplica)
5. Versión de la aplicación

---

## Referencias

- [Manual Técnico](MANUAL-TECNICO.md)
- [FAQ](FAQ.md)
- [Documentación de NocoBase](https://docs.nocobase.com/)

---

**Versión**: 0.1.0
**Última Actualización**: YYYY-MM-DD
