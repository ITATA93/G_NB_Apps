---
name: nocobase-db-datasources
description: Gestionar datasources (conexiones a bases de datos externas) en NocoBase. Crear, listar, probar conexiones, habilitar/deshabilitar.
argument-hint: <command> [key] [options]
disable-model-invocation: false
allowed-tools: Bash(npx tsx:*), Read
---

# Gestión de DataSources NocoBase

Administra conexiones a bases de datos externas en NocoBase.

## Script Principal

```bash
npx tsx shared/scripts/manage-datasources.ts <comando> [opciones]
```

## Comandos Disponibles

### Listar datasources
```bash
npx tsx shared/scripts/manage-datasources.ts list
```

### Ver detalle de datasource
```bash
npx tsx shared/scripts/manage-datasources.ts get <key>
npx tsx shared/scripts/manage-datasources.ts get main
```

### Listar colecciones de un datasource
```bash
npx tsx shared/scripts/manage-datasources.ts collections <key>
npx tsx shared/scripts/manage-datasources.ts collections main
```

### Probar conexión
```bash
npx tsx shared/scripts/manage-datasources.ts test <key>
```

### Crear datasource
```bash
npx tsx shared/scripts/manage-datasources.ts create \
  --key <identificador> \
  --type <tipo> \
  --host <host> \
  --port <puerto> \
  --database <nombre_db> \
  --username <usuario> \
  --password <contraseña>

# Ejemplo: SQL Server
npx tsx shared/scripts/manage-datasources.ts create \
  --key sigo_db \
  --type mssql \
  --host 10.130.0.52 \
  --port 1433 \
  --database SIGO \
  --username sa \
  --password "MyPassword123"

# Ejemplo: PostgreSQL
npx tsx shared/scripts/manage-datasources.ts create \
  --key analytics \
  --type postgres \
  --host localhost \
  --port 5432 \
  --database analytics \
  --username admin \
  --password secret
```

### Habilitar/Deshabilitar
```bash
npx tsx shared/scripts/manage-datasources.ts enable <key>
npx tsx shared/scripts/manage-datasources.ts disable <key>
```

### Eliminar datasource
```bash
npx tsx shared/scripts/manage-datasources.ts delete <key>
```

### Ver estado general
```bash
npx tsx shared/scripts/manage-datasources.ts status
```

## Tipos de DataSource Soportados

| Tipo | Base de Datos |
|------|---------------|
| `main` | NocoBase (Principal - PostgreSQL) |
| `mysql` | MySQL |
| `postgres` | PostgreSQL |
| `mariadb` | MariaDB |
| `mssql` | Microsoft SQL Server |
| `oracle` | Oracle |
| `kingbase` | KingbaseES |
| `rest-api` | REST API externa |

## Opciones de Conexión

| Opción | Descripción |
|--------|-------------|
| `--key` | Identificador único del datasource |
| `--type` | Tipo de base de datos |
| `--host` | Servidor/IP |
| `--port` | Puerto |
| `--database` | Nombre de la base de datos |
| `--username` | Usuario |
| `--password` | Contraseña |
| `--display-name` | Nombre para mostrar |
| `--encrypt true` | Habilitar cifrado (MSSQL) |
| `--ssl true` | Habilitar SSL |
| `--schema` | Schema específico |

## Ejemplo: Conectar a SQL Server Externo

```bash
# 1. Crear datasource
npx tsx shared/scripts/manage-datasources.ts create \
  --key hospital_sigo \
  --type mssql \
  --host 10.130.0.52 \
  --port 1433 \
  --database SIGO \
  --username sa \
  --password "SecurePass123" \
  --encrypt true

# 2. Probar conexión
npx tsx shared/scripts/manage-datasources.ts test hospital_sigo

# 3. Ver colecciones disponibles
npx tsx shared/scripts/manage-datasources.ts collections hospital_sigo
```

## API Endpoints

| Operación | Endpoint |
|-----------|----------|
| Listar | `GET /dataSources:list` |
| Obtener | `GET /dataSources:get` |
| Crear | `POST /dataSources:create` |
| Actualizar | `POST /dataSources:update` |
| Eliminar | `POST /dataSources:destroy` |
| Probar | `POST /dataSources:testConnection` |
| Colecciones | `GET /dataSources/{key}/collections:list` |

## Acceder a Colecciones Externas

Una vez conectado el datasource, las colecciones se acceden con el prefijo del datasource:

```bash
# Listar registros de tabla externa
curl "${NOCOBASE_BASE_URL}/api/dataSources/hospital_sigo/pacientes:list"

# Crear registro en tabla externa
curl -X POST "${NOCOBASE_BASE_URL}/api/dataSources/hospital_sigo/pacientes:create" \
  -d '{"nombre":"Juan"}'
```

## Consideraciones de Seguridad

- Las contraseñas se almacenan cifradas
- Usar conexiones SSL cuando sea posible
- Limitar permisos del usuario de conexión
- No exponer credenciales en logs

## Variables de Entorno

- `NOCOBASE_BASE_URL`: URL de la API
- `NOCOBASE_API_KEY`: Token de autenticación
