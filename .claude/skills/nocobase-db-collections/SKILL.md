---
name: nocobase-db-collections
description: Gestionar colecciones (tablas) en NocoBase. Crear, listar, actualizar, eliminar, clonar colecciones y exportar schemas.
argument-hint: <command> [options]
disable-model-invocation: false
allowed-tools: Bash(npx tsx:*), Read
---

# Gestión de Colecciones NocoBase

Administra colecciones (tablas) en NocoBase via API.

## Script Principal

```bash
npx tsx shared/scripts/manage-collections.ts <comando> [opciones]
```

## Comandos Disponibles

### Listar colecciones
```bash
npx tsx shared/scripts/manage-collections.ts list
npx tsx shared/scripts/manage-collections.ts list --datasource main
```

### Ver detalle de colección
```bash
npx tsx shared/scripts/manage-collections.ts get <nombre>
npx tsx shared/scripts/manage-collections.ts get ugco_casooncologico
```

### Crear colección
```bash
npx tsx shared/scripts/manage-collections.ts create --name pacientes --title "Pacientes"
npx tsx shared/scripts/manage-collections.ts create --name casos --title "Casos" --category oncologia
```

### Actualizar colección
```bash
npx tsx shared/scripts/manage-collections.ts update <nombre> --title "Nuevo Titulo"
npx tsx shared/scripts/manage-collections.ts update pacientes --hidden true
```

### Eliminar colección
```bash
npx tsx shared/scripts/manage-collections.ts delete <nombre>
```

### Exportar schema (campos + estructura)
```bash
npx tsx shared/scripts/manage-collections.ts schema <nombre>
```

### Contar registros
```bash
npx tsx shared/scripts/manage-collections.ts count <nombre>
```

### Clonar colección
```bash
npx tsx shared/scripts/manage-collections.ts clone <origen> --name <destino>
npx tsx shared/scripts/manage-collections.ts clone ugco_casooncologico --name ugco_casos_archivo
```

## Campos Automáticos

Al crear una colección, se generan automáticamente:
- `id` - Clave primaria autoincremental
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de actualización
- `createdById` - Usuario que creó
- `updatedById` - Usuario que actualizó
- `sort` - Campo para ordenamiento

## API Endpoints

| Operación | Endpoint |
|-----------|----------|
| Listar | `GET /collections:list` |
| Obtener | `GET /collections:get?filterByTk=<name>` |
| Crear | `POST /collections:create` |
| Actualizar | `POST /collections:update` |
| Eliminar | `POST /collections:destroy` |

## Ejemplo de Schema de Colección

```json
{
  "name": "pacientes",
  "title": "Pacientes",
  "fields": [
    {
      "name": "nombre",
      "type": "string",
      "interface": "input",
      "title": "Nombre"
    },
    {
      "name": "rut",
      "type": "string",
      "interface": "input",
      "title": "RUT",
      "unique": true
    }
  ]
}
```

## Datasources

NocoBase soporta múltiples datasources:
- `main` - Base de datos principal (PostgreSQL)
- Datasources externos conectados

Para listar colecciones de otro datasource:
```bash
npx tsx shared/scripts/manage-collections.ts list --datasource external_db
```

## Variables de Entorno

- `NOCOBASE_BASE_URL`: URL de la API
- `NOCOBASE_API_KEY`: Token de autenticación
