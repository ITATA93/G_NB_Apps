---
name: nocobase-db-fields
description: Gestionar campos de colecciones en NocoBase. Crear, listar, actualizar, eliminar campos y ver interfaces disponibles.
argument-hint: <command> <collection> [options]
disable-model-invocation: false
allowed-tools: Bash(npx tsx:*), Read
---

# Gestión de Campos NocoBase

Administra campos de colecciones en NocoBase via API.

## Script Principal

```bash
npx tsx shared/scripts/manage-fields.ts <comando> [opciones]
```

## Comandos Disponibles

### Listar campos de una colección
```bash
npx tsx shared/scripts/manage-fields.ts list <collection>
npx tsx shared/scripts/manage-fields.ts list ugco_casooncologico
```

### Ver detalle de un campo
```bash
npx tsx shared/scripts/manage-fields.ts get <collection> <fieldName>
npx tsx shared/scripts/manage-fields.ts get pacientes rut
```

### Crear campo
```bash
npx tsx shared/scripts/manage-fields.ts create <collection> --name <nombre> --type <tipo> [opciones]

# Ejemplos
npx tsx shared/scripts/manage-fields.ts create pacientes --name rut --type string --interface input --title "RUT"
npx tsx shared/scripts/manage-fields.ts create pacientes --name edad --type integer --interface integer --title "Edad"
npx tsx shared/scripts/manage-fields.ts create pacientes --name activo --type boolean --interface checkbox --title "Activo"
npx tsx shared/scripts/manage-fields.ts create pacientes --name notas --type text --interface textarea --title "Notas"
```

### Actualizar campo
```bash
npx tsx shared/scripts/manage-fields.ts update <collection> <fieldName> --title "Nuevo Titulo"
npx tsx shared/scripts/manage-fields.ts update pacientes rut --required true
```

### Eliminar campo
```bash
npx tsx shared/scripts/manage-fields.ts delete <collection> <fieldName>
```

### Ver interfaces disponibles
```bash
npx tsx shared/scripts/manage-fields.ts interfaces
```

## Tipos de Campo Disponibles

### Básicos
| Tipo | Descripción |
|------|-------------|
| `string` | Texto corto |
| `text` | Texto largo |
| `integer` | Entero |
| `bigInt` | Entero grande |
| `double` | Decimal |
| `decimal` | Decimal preciso |
| `boolean` | Verdadero/Falso |
| `date` | Fecha |
| `dateOnly` | Solo fecha |
| `time` | Solo hora |
| `json` / `jsonb` | JSON |
| `array` | Arreglo |

### Relaciones
| Tipo | Descripción |
|------|-------------|
| `belongsTo` | Muchos a uno |
| `hasOne` | Uno a uno |
| `hasMany` | Uno a muchos |
| `belongsToMany` | Muchos a muchos |

### Especiales
| Tipo | Descripción |
|------|-------------|
| `uid` | ID único |
| `uuid` | UUID |
| `sequence` | Secuencia auto |
| `sort` | Ordenamiento |
| `password` | Contraseña |
| `formula` | Fórmula calculada |
| `virtual` | Campo virtual |

## Interfaces de Campo

| Interface | Descripción |
|-----------|-------------|
| `input` | Texto corto |
| `textarea` | Texto largo |
| `richText` | Texto enriquecido |
| `integer` | Número entero |
| `number` | Número decimal |
| `percent` | Porcentaje |
| `checkbox` | Casilla de verificación |
| `select` | Selección simple |
| `multipleSelect` | Selección múltiple |
| `radioGroup` | Botones de radio |
| `datetime` | Fecha y hora |
| `date` | Solo fecha |
| `time` | Solo hora |
| `email` | Email |
| `phone` | Teléfono |
| `url` | URL |
| `password` | Contraseña |
| `attachment` | Archivo adjunto |
| `m2o` | Relación muchos a uno |
| `o2m` | Relación uno a muchos |
| `m2m` | Relación muchos a muchos |

## Opciones Adicionales

| Opción | Descripción |
|--------|-------------|
| `--required true` | Campo obligatorio |
| `--unique true` | Valor único |
| `--defaultValue "valor"` | Valor por defecto |
| `--description "texto"` | Descripción del campo |
| `--options '[...]'` | Opciones para select (JSON) |

## Crear Campo con Opciones (Select)

```bash
npx tsx shared/scripts/manage-fields.ts create pacientes \
  --name estado \
  --type string \
  --interface select \
  --title "Estado" \
  --options '[{"value":"activo","label":"Activo"},{"value":"inactivo","label":"Inactivo"}]'
```

## API Endpoints

| Operación | Endpoint |
|-----------|----------|
| Listar | `GET /collections/{col}/fields:list` |
| Obtener | `GET /collections/{col}/fields:get` |
| Crear | `POST /collections/{col}/fields:create` |
| Actualizar | `POST /collections/{col}/fields:update` |
| Eliminar | `POST /collections/{col}/fields:destroy` |

## Variables de Entorno

- `NOCOBASE_BASE_URL`: URL de la API
- `NOCOBASE_API_KEY`: Token de autenticación
