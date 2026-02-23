---
name: nocobase-db-relationships
description: Gestionar relaciones entre colecciones en NocoBase. Crear belongsTo, hasMany, belongsToMany y hasOne.
argument-hint: <type> <sourceCollection> <targetCollection> [options]
disable-model-invocation: false
allowed-tools: Bash(npx tsx:*), Read
---

# Gestión de Relaciones NocoBase

Las relaciones en NocoBase se crean como campos especiales en las colecciones.

## Tipos de Relaciones

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `belongsTo` | Muchos a uno | Paciente → Médico (muchos pacientes tienen un médico) |
| `hasMany` | Uno a muchos | Médico → Pacientes (un médico tiene muchos pacientes) |
| `hasOne` | Uno a uno | Usuario → Perfil |
| `belongsToMany` | Muchos a muchos | Estudiante ↔ Cursos |

## Script para Crear Relaciones

```bash
npx tsx shared/scripts/manage-fields.ts create <collection> \
  --name <fieldName> \
  --type <relationType> \
  --interface <interface> \
  --title "Titulo" \
  --target <targetCollection> \
  --foreignKey <foreignKeyField>
```

## Ejemplos de Relaciones

### belongsTo (Muchos a Uno)

Un caso oncológico pertenece a un paciente:

```bash
# En la colección ugco_casooncologico, crear campo que apunta a pacientes
npx tsx shared/scripts/manage-fields.ts create ugco_casooncologico \
  --name paciente \
  --type belongsTo \
  --interface m2o \
  --title "Paciente" \
  --target pacientes \
  --foreignKey paciente_id
```

**Estructura resultante:**
```
ugco_casooncologico
├── paciente_id (integer) - FK automática
└── paciente (belongsTo) - campo de relación
```

### hasMany (Uno a Muchos)

Un paciente tiene muchos casos:

```bash
# En la colección pacientes, crear campo que lista casos
npx tsx shared/scripts/manage-fields.ts create pacientes \
  --name casos \
  --type hasMany \
  --interface o2m \
  --title "Casos Oncológicos" \
  --target ugco_casooncologico \
  --foreignKey paciente_id
```

### belongsToMany (Muchos a Muchos)

Casos pueden tener múltiples médicos, médicos pueden tener múltiples casos:

```bash
# Requiere tabla intermedia
# 1. Crear tabla intermedia
npx tsx shared/scripts/manage-collections.ts create --name caso_medico --title "Caso-Médico"

# 2. Crear relación en casos
npx tsx shared/scripts/manage-fields.ts create ugco_casooncologico \
  --name medicos \
  --type belongsToMany \
  --interface m2m \
  --title "Médicos" \
  --target medicos \
  --through caso_medico

# 3. Crear relación inversa en médicos
npx tsx shared/scripts/manage-fields.ts create medicos \
  --name casos \
  --type belongsToMany \
  --interface m2m \
  --title "Casos" \
  --target ugco_casooncologico \
  --through caso_medico
```

### hasOne (Uno a Uno)

Un usuario tiene un perfil:

```bash
npx tsx shared/scripts/manage-fields.ts create users \
  --name perfil \
  --type hasOne \
  --interface o2o \
  --title "Perfil" \
  --target perfiles \
  --foreignKey user_id
```

## API para Relaciones

### Crear relación belongsTo
```typescript
await client.post('/collections/casos/fields:create', {
    name: 'paciente',
    type: 'belongsTo',
    interface: 'm2o',
    target: 'pacientes',
    foreignKey: 'paciente_id',
    targetKey: 'id',
    uiSchema: {
        title: 'Paciente',
        'x-component': 'AssociationField',
        'x-component-props': {
            multiple: false,
            fieldNames: {
                label: 'nombre',
                value: 'id'
            }
        }
    }
});
```

### Crear relación hasMany
```typescript
await client.post('/collections/pacientes/fields:create', {
    name: 'casos',
    type: 'hasMany',
    interface: 'o2m',
    target: 'casos',
    foreignKey: 'paciente_id',
    sourceKey: 'id',
    uiSchema: {
        title: 'Casos',
        'x-component': 'AssociationField',
        'x-component-props': {
            multiple: true
        }
    }
});
```

### Crear relación belongsToMany
```typescript
await client.post('/collections/casos/fields:create', {
    name: 'medicos',
    type: 'belongsToMany',
    interface: 'm2m',
    target: 'medicos',
    through: 'caso_medico',
    foreignKey: 'caso_id',
    otherKey: 'medico_id',
    targetKey: 'id',
    sourceKey: 'id',
    uiSchema: {
        title: 'Médicos',
        'x-component': 'AssociationField',
        'x-component-props': {
            multiple: true
        }
    }
});
```

## Opciones de Relación

| Opción | Descripción |
|--------|-------------|
| `target` | Colección destino |
| `foreignKey` | Campo FK en la tabla origen (belongsTo) o destino (hasMany) |
| `targetKey` | Campo PK en la tabla destino (default: 'id') |
| `sourceKey` | Campo PK en la tabla origen (default: 'id') |
| `through` | Tabla intermedia para belongsToMany |
| `otherKey` | FK hacia la otra tabla en belongsToMany |

## Interfaces de Relación

| Interface | Componente | Uso |
|-----------|------------|-----|
| `m2o` | AssociationField | belongsTo (selector simple) |
| `o2m` | AssociationField | hasMany (lista/tabla) |
| `m2m` | AssociationField | belongsToMany (selector múltiple) |
| `o2o` | AssociationField | hasOne (selector simple) |

## Consultar Datos con Relaciones

```bash
# Listar casos con paciente incluido
curl "${NOCOBASE_BASE_URL}/api/ugco_casooncologico:list?appends=paciente"

# Filtrar por relación
curl "${NOCOBASE_BASE_URL}/api/ugco_casooncologico:list?filter[paciente][nombre][$includes]=Juan"
```

## Variables de Entorno

- `NOCOBASE_BASE_URL`: URL de la API
- `NOCOBASE_API_KEY`: Token de autenticación
