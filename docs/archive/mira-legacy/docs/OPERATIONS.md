# Guía de Operaciones - MIRA (Hospital de Ovalle)

Esta guía detalla los procedimientos operacionales para el mantenimiento, monitoreo y soporte de la plataforma MIRA en producción.

## Tabla de Contenidos

- [Monitoreo](#monitoreo)
- [Backup y Recovery](#backup-y-recovery)
- [Mantenimiento Rutinario](#mantenimiento-rutinario)
- [Troubleshooting Operacional](#troubleshooting-operacional)
- [Gestión de Incidentes](#gestión-de-incidentes)
- [Performance y Optimización](#performance-y-optimización)

---

## Monitoreo

### Métricas Clave

#### Disponibilidad del Sistema

| Métrica | Frecuencia | Objetivo | Acción si Falla |
|---------|-----------|----------|-----------------|
| NocoBase API Uptime | 5 min | > 99.5% | Investigar logs, reiniciar servicio |
| ALMA/SIDRA Connectivity | 15 min | > 95% | Verificar VPN, contactar IT |
| Database Availability | 5 min | 100% | Alertar DBA inmediatamente |

#### Performance

| Métrica | Frecuencia | Objetivo | Acción si Falla |
|---------|-----------|----------|-----------------|
| API Response Time (avg) | 10 min | < 500ms | Revisar queries lentos |
| API Response Time (p95) | 10 min | < 2s | Optimizar endpoints |
| Database Query Time | 10 min | < 1s | Optimizar índices |

### Scripts de Monitoreo

#### Test de Conexión

```bash
# Ejecutar cada 5 minutos (cron job)
*/5 * * * * cd /path/to/MIRA && node UGCO/scripts/test-connection.ts >> /var/log/mira/health.log 2>&1
```

#### Verificar Sincronización ALMA

```bash
# Ejecutar cada hora
0 * * * * cd /path/to/MIRA && node UGCO/scripts/check-sql-sync-simple.js >> /var/log/mira/sync.log 2>&1
```

### Herramientas de Monitoreo Recomendadas

1. **Uptime Robot** o **Pingdom**: Monitoreo de uptime externo
2. **Grafana + Prometheus**: Dashboards de métricas
3. **Sentry** o **Rollbar**: Tracking de errores
4. **ELK Stack**: Centralización de logs

---

## Backup y Recovery

### Política de Backup

#### Backups Diarios (Automáticos)

```bash
# Cron job: Todos los días a las 2 AM
0 2 * * * /path/to/scripts/backup_collections.sh
```

**Script de Backup de Colecciones:**

```bash
#!/bin/bash
# backup_collections.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mira/$DATE"

mkdir -p "$BACKUP_DIR"

# Exportar colecciones
cd /path/to/MIRA
node UGCO/scripts/list-collections.ts > "$BACKUP_DIR/collections.json"

# Exportar UI schemas (si existe script)
# node scripts/export-ui-schemas.ts > "$BACKUP_DIR/ui-schemas.json"

# Comprimir
tar -czf "/backups/mira-$DATE.tar.gz" "$BACKUP_DIR"

# Retener últimos 30 días
find /backups -name "mira-*.tar.gz" -mtime +30 -delete

echo "Backup completado: $DATE" >> /var/log/mira/backup.log
```

#### Backups Semanales (Base de Datos)

```bash
# Cron job: Domingos a las 3 AM
0 3 * * 0 /path/to/scripts/backup_database.sh
```

**Script de Backup de Base de Datos:**

```bash
#!/bin/bash
# backup_database.sh

DATE=$(date +%Y%m%d)

# PostgreSQL backup (MIRA)
pg_dump -U mira_user -h localhost mira_production > "/backups/db/mira-$DATE.sql"

# Retener últimos 90 días
find /backups/db -name "mira-*.sql" -mtime +90 -delete

echo "Database backup completado: $DATE" >> /var/log/mira/backup.log
```

### Procedimiento de Recovery

#### Escenario 1: Recuperar Colección Eliminada

```bash
# 1. Identificar backup más reciente
ls -lh /backups/mira-*.tar.gz | tail -1

# 2. Extraer backup
tar -xzf /backups/mira-20260125_020000.tar.gz

# 3. Revisar colecciones disponibles
cat 20260125_020000/collections.json

# 4. Recrear colección usando script de configuración
# (Procedimiento específico según colección)
```

#### Escenario 2: Recuperar Base de Datos Completa

```bash
# 1. Detener aplicaciones que usan la DB
systemctl stop nocobase

# 2. Restaurar desde backup
psql -U mira_user -h localhost -d mira_production < /backups/db/mira-20260125.sql

# 3. Verificar integridad
psql -U mira_user -d mira_production -c "SELECT COUNT(*) FROM onco_casos;"

# 4. Reiniciar servicios
systemctl start nocobase

# 5. Verificar funcionalidad
node Apps/UGCO/scripts/test-connection.ts
```

---

## Mantenimiento Rutinario

### Diario

- [ ] Revisar logs de errores
- [ ] Verificar métricas de performance
- [ ] Revisar queue de jobs (si aplica)

### Semanal

- [ ] Revisar espacio en disco
- [ ] Analizar queries lentos
- [ ] Revisar backups exitosos
- [ ] Actualizar documentación operacional

### Mensual

- [ ] Revisar y limpiar logs antiguos
- [ ] Auditar accesos de usuarios
- [ ] Revisar dependencias de npm (vulnerabilidades)
- [ ] Revisar métricas de uso
- [ ] Planificar optimizaciones

### Trimestral

- [ ] Revisar arquitectura y escalabilidad
- [ ] Evaluar necesidad de hardware adicional
- [ ] Actualizar runbooks
- [ ] Capacitación del equipo de soporte

---

## Troubleshooting Operacional

### Problema: API No Responde

#### Síntomas
- Timeouts en requests
- Errores 503 Service Unavailable
- Usuarios no pueden acceder

#### Diagnóstico

```bash
# 1. Verificar servicio NocoBase
systemctl status nocobase

# 2. Verificar logs
tail -n 100 /var/log/nocobase/error.log

# 3. Verificar conectividad
curl -I https://nocobase.hospitaldeovalle.cl/api

# 4. Verificar recursos del sistema
top
df -h
```

#### Solución

```bash
# 1. Reiniciar servicio
systemctl restart nocobase

# 2. Si persiste, verificar base de datos
systemctl status postgresql

# 3. Escalar a equipo de infraestructura si es necesario
```

### Problema: Sincronización ALMA Falla

#### Síntomas
- Datos de pacientes desactualizados
- Errores en check-sql-sync.js
- Campos vacíos en colecciones ALMA

#### Diagnóstico

```bash
# 1. Ejecutar script de diagnóstico
node Apps/UGCO/scripts/check-sql-sync-simple.js

# 2. Verificar conectividad a SIDRA
# ping sidra.hospitaldeovalle.cl

# 3. Revisar logs de datasource SQL
# (Ver logs en NocoBase admin)
```

#### Solución

```bash
# 1. Verificar credenciales de SIDRA
# Revisar .env

# 2. Reiniciar conexión a datasource
# (Procedimiento en NocoBase admin)

# 3. Si persiste, contactar equipo de ALMA/TrakCare
```

### Problema: Performance Degradada

#### Síntomas
- API lenta (> 2s response time)
- Usuarios reportan lentitud
- Queries SQL lentos

#### Diagnóstico

```bash
# 1. Identificar queries lentos
# Revisar logs de PostgreSQL
tail -f /var/log/postgresql/postgresql-*.log | grep "duration:"

# 2. Verificar carga del servidor
top
iostat

# 3. Identificar endpoint lento
# Revisar logs de NocoBase
```

#### Solución

```bash
# 1. Optimizar índices si es necesario
# psql -U mira_user -d mira_production
# CREATE INDEX idx_onco_casos_estado ON onco_casos(estado);

# 2. Implementar caching (si no existe)

# 3. Escalar recursos si es necesario
```

---

## Gestión de Incidentes

### Clasificación de Severidad

| Nivel | Descripción | Tiempo de Respuesta | Ejemplo |
|-------|-------------|---------------------|---------|
| **P1 - Crítico** | Sistema completamente caído | 15 min | NocoBase API down |
| **P2 - Alto** | Funcionalidad crítica afectada | 1 hora | Sincronización ALMA falla |
| **P3 - Medio** | Funcionalidad no crítica afectada | 4 horas | Reporte no se genera |
| **P4 - Bajo** | Problema cosmético o menor | 24 horas | Typo en UI |

### Procedimiento de Incidente

#### 1. Detección

- Alerta automática (monitoreo)
- Reporte de usuario
- Observación proactiva

#### 2. Clasificación

```
- Asignar severidad (P1-P4)
- Asignar responsable
- Estimar tiempo de resolución
- Notificar stakeholders (si P1 o P2)
```

#### 3. Investigación

```bash
# Recopilar información:
- Logs del sistema
- Métricas de performance
- Steps to reproduce
- Usuarios afectados
```

#### 4. Resolución

```
- Aplicar fix
- Verificar solución
- Documentar causa raíz
- Crear post-mortem (si P1)
```

#### 5. Comunicación

```
- Actualizar ticket
- Notificar a stakeholders
- Comunicar a usuarios (si aplica)
```

### Template de Post-Mortem (P1)

```markdown
# Post-Mortem: [Título del Incidente]

**Fecha**: YYYY-MM-DD
**Severidad**: P1
**Duración**: X horas

## Resumen
[Breve descripción del incidente]

## Impacto
- Usuarios afectados: X
- Downtime: X horas
- Funcionalidades afectadas: [Lista]

## Timeline
- HH:MM - Incidente detectado
- HH:MM - Equipo notificado
- HH:MM - Causa raíz identificada
- HH:MM - Fix aplicado
- HH:MM - Servicio restaurado

## Causa Raíz
[Descripción técnica de la causa]

## Solución
[Cómo se resolvió]

## Acciones Preventivas
- [ ] Acción 1
- [ ] Acción 2

## Lecciones Aprendidas
[Qué aprendimos]
```

---

## Performance y Optimización

### Métricas de Performance

#### Baseline Actual (Post-Implementación)

| Métrica | Valor Actual | Objetivo |
|---------|--------------|----------|
| Casos creados/día | - | TBD |
| Usuarios activos/día | - | TBD |
| API requests/min | - | < 1000 |
| DB size | - | Monitorear crecimiento |

### Optimizaciones Comunes

#### Índices de Base de Datos

```sql
-- Índices recomendados para UGCO
CREATE INDEX idx_onco_casos_paciente ON onco_casos(paciente_rut);
CREATE INDEX idx_onco_casos_estado ON onco_casos(estado);
CREATE INDEX idx_onco_casos_fecha ON onco_casos(fecha_ingreso);
CREATE INDEX idx_onco_episodios_caso ON onco_episodios(caso_id);
CREATE INDEX idx_onco_episodios_fecha ON onco_episodios(fecha);
```

#### Caching

```javascript
// Ejemplo de implementación de cache simple
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function getCachedCollections() {
  const cacheKey = 'collections';
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await client.get('/collections:list');
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
```

### Limpieza de Datos

#### Script de Limpieza Mensual

```bash
#!/bin/bash
# cleanup_old_logs.sh

# Eliminar logs mayores a 90 días
find /var/log/mira -name "*.log" -mtime +90 -delete

# Comprimir logs mayores a 30 días
find /var/log/mira -name "*.log" -mtime +30 -exec gzip {} \;

echo "Log cleanup completado: $(date)" >> /var/log/mira/maintenance.log
```

---

## Contactos de Emergencia

| Rol | Nombre | Contacto | Disponibilidad |
|-----|--------|----------|----------------|
| DevOps Lead | TBD | tel / email | 24/7 |
| DBA | TBD | tel / email | Horario laboral |
| Infraestructura | TBD | tel / email | 24/7 |
| Product Owner | TBD | tel / email | Horario laboral |

---

## Recursos Adicionales

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Procedimientos de deployment
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Solución de problemas técnicos
- [ARQUITECTURA.md](./ARQUITECTURA.md) - Arquitectura del sistema
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guía de contribución

---

**Última actualización**: 2026-01-25
**Mantenido por**: Equipo de Operaciones - Hospital de Ovalle
**Revisión**: Trimestral o después de cada incidente P1
