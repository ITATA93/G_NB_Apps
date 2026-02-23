---
name: nocobase-db-views
description: Gestionar vistas SQL de base de datos en NocoBase. Listar, consultar y crear vistas SQL.
argument-hint: <command> [name]
disable-model-invocation: false
allowed-tools: Bash(npx tsx:*), Read
---

# Gestión de Vistas SQL NocoBase

Administra vistas SQL en la base de datos de NocoBase.

## Script Principal

```bash
npx tsx shared/scripts/manage-db-views.ts <comando> [opciones]
```

## Comandos Disponibles

### Listar vistas
```bash
npx tsx shared/scripts/manage-db-views.ts list
```

### Ver detalle de una vista
```bash
npx tsx shared/scripts/manage-db-views.ts get <nombre_vista>
```

### Ejecutar consulta de una vista
```bash
npx tsx shared/scripts/manage-db-views.ts query <nombre_vista>
```

## Crear Vistas SQL

Las vistas SQL se crean directamente en PostgreSQL:

```sql
-- Conectar a PostgreSQL
psql -h localhost -U nocobase -d nocobase

-- Crear vista
CREATE VIEW v_casos_activos AS
SELECT
    c.id,
    c.codigo,
    c.fecha_ingreso,
    p.nombre as paciente_nombre,
    p.rut as paciente_rut,
    e.nombre as especialidad
FROM ugco_casooncologico c
JOIN pacientes p ON c.paciente_id = p.id
JOIN especialidades e ON c.especialidad_id = e.id
WHERE c.estado = 'activo';

-- Verificar
SELECT * FROM v_casos_activos LIMIT 10;
```

## Sincronizar Vista con NocoBase

Después de crear la vista en PostgreSQL, sincronízala con NocoBase:

1. **Via UI**: Ir a Collections → Sync → Seleccionar la vista
2. **Via API**: Las vistas aparecen automáticamente en `/dbViews:list`

## Ejemplo: Vista de Resumen de Casos

```sql
-- Vista con estadísticas por especialidad
CREATE VIEW v_resumen_especialidades AS
SELECT
    e.nombre as especialidad,
    COUNT(c.id) as total_casos,
    COUNT(CASE WHEN c.estado = 'activo' THEN 1 END) as casos_activos,
    COUNT(CASE WHEN c.estado = 'cerrado' THEN 1 END) as casos_cerrados,
    MAX(c.fecha_ingreso) as ultimo_ingreso
FROM especialidades e
LEFT JOIN ugco_casooncologico c ON e.id = c.especialidad_id
GROUP BY e.id, e.nombre
ORDER BY total_casos DESC;
```

## Usar Vista como Colección

Una vez sincronizada, la vista se puede usar como colección de solo lectura:

```bash
# Via API
curl "${NOCOBASE_BASE_URL}/api/v_casos_activos:list"

# Con filtros
curl "${NOCOBASE_BASE_URL}/api/v_casos_activos:list?filter[especialidad][$eq]=Mama"
```

## Vistas Materializadas

Para mejor rendimiento en vistas complejas:

```sql
-- Crear vista materializada
CREATE MATERIALIZED VIEW mv_estadisticas_diarias AS
SELECT
    DATE(fecha_ingreso) as fecha,
    COUNT(*) as ingresos,
    COUNT(DISTINCT paciente_id) as pacientes_unicos
FROM ugco_casooncologico
GROUP BY DATE(fecha_ingreso)
ORDER BY fecha DESC;

-- Refrescar datos
REFRESH MATERIALIZED VIEW mv_estadisticas_diarias;
```

## API Endpoints

| Operación | Endpoint |
|-----------|----------|
| Listar | `GET /dbViews:list` |
| Obtener | `GET /dbViews:get` |
| Consultar | `GET /dbViews:query` |

## Consideraciones

- Las vistas son de **solo lectura** en NocoBase
- Los cambios en el schema de PostgreSQL requieren resincronización
- Las vistas materializadas necesitan refresh manual
- Usar índices en las tablas base para mejor rendimiento

## Plugin Requerido

Requiere el plugin `collection-sql` habilitado en NocoBase.

```bash
# Verificar plugins
npx tsx shared/scripts/manage-plugins.ts list
```

## Variables de Entorno

- `NOCOBASE_BASE_URL`: URL de la API
- `NOCOBASE_API_KEY`: Token de autenticación
