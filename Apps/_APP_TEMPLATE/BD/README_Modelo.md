# Modelo de Datos - [NOMBRE_APP]

## Descripción General

[Descripción del modelo de datos de la aplicación - 2-3 párrafos explicando el propósito y alcance del modelo]

---

## Diagrama Entidad-Relación

```
┌─────────────────┐       ┌─────────────────┐
│  Entidad A      │──<>───│  Entidad B      │
│                 │       │                 │
│ - campo_1       │       │ - campo_1       │
│ - campo_2       │       │ - campo_2       │
│ - entidad_b_id  │       │                 │
└─────────────────┘       └─────────────────┘
```

[Agregar diagrama más detallado en assets/diagrams/]

---

## Colecciones (Tablas)

### Resumen

| Colección | Propósito | Campos | Relaciones | Estado |
|-----------|-----------|--------|------------|--------|
| [nombre] | [Descripción breve] | [N] | [N] | ✅/🚧/⏳ |

Ver archivos individuales en [colecciones/](colecciones/) para detalles completos.

---

## Relaciones

### hasMany (Uno a Muchos)

```
[Colección Padre] 1 ──< N [Colección Hija]
```

| Padre | Hija | Foreign Key | Descripción |
|-------|------|-------------|-------------|
| [tabla_padre] | [tabla_hija] | [campo_fk] | [Descripción de la relación] |

### belongsTo (Muchos a Uno)

```
[Colección Hija] N >── 1 [Colección Padre]
```

| Hija | Padre | Foreign Key | Descripción |
|------|-------|-------------|-------------|
| [tabla_hija] | [tabla_padre] | [campo_fk] | [Descripción de la relación] |

### belongsToMany (Muchos a Muchos)

```
[Colección A] N ──< >── N [Colección B]
              (a través de tabla_intermedia)
```

| Colección A | Colección B | Tabla Intermedia | Descripción |
|-------------|-------------|------------------|-------------|
| [tabla_a] | [tabla_b] | [tabla_ab] | [Descripción de la relación] |

---

## Integraciones Externas

### ALMA/SIDRA (Read-Only)

**Datasource**: SQL Server - SIDRA

**Colecciones Integradas**:
- `alma_[tabla]` - [Descripción]

**Importante**: Estas colecciones son **read-only**. No se debe modificar data en ALMA.

### Otros Sistemas

[Documentar otras integraciones si aplican]

---

## Índices

| Colección | Campo(s) | Tipo | Propósito |
|-----------|----------|------|-----------|
| [tabla] | [campo] | Index/Unique | [Mejorar performance de...] |

---

## Validaciones

### A Nivel de Base de Datos

| Colección | Campo | Validación | Regla |
|-----------|-------|------------|-------|
| [tabla] | [campo] | Required | No puede ser nulo |
| [tabla] | [campo] | Unique | Debe ser único |
| [tabla] | [campo] | Format | Debe cumplir patrón [regex] |

### A Nivel de Aplicación

[Documentar validaciones implementadas en NocoBase o scripts]

---

## Datos de Referencia (Maestros)

**Ubicación**: [referencias/](referencias/) y [diccionarios/](diccionarios/)

### Catálogos

| Colección | Registros | Fuente | Frecuencia de Actualización |
|-----------|-----------|--------|----------------------------|
| ref_[nombre] | ~[N] | [HL7/DEIS/Manual] | [Mensual/Anual/Estático] |

---

## Estrategia de Seeding

### Datos de Referencia

```bash
# Cargar datos de referencia
node scripts/seed/seed-references.js
```

**Orden de Carga**:
1. Catálogos básicos (ref_*)
2. Datos maestros
3. Datos de ejemplo (solo desarrollo)

### Datos de Ejemplo

```bash
# Solo en ambiente de desarrollo
node scripts/seed/seed-sample-data.js
```

---

## Convenciones de Nomenclatura

### Colecciones (Tablas)
- Minúsculas con guiones bajos: `nombre_tabla`
- Plural para colecciones de datos: `casos`, `episodios`
- Prefijo para referencias: `ref_[nombre]`
- Prefijo para integración ALMA: `alma_[nombre]`

### Campos
- Minúsculas con guiones bajos: `nombre_campo`
- IDs: `[tabla]_id` (ej: `paciente_id`)
- Fechas: `fecha_[evento]` (ej: `fecha_ingreso`)
- Estados: `estado` o `estado_[contexto]`
- Flags booleanos: `is_[condicion]` (ej: `is_active`)

### Foreign Keys
- Formato: `[tabla_referenciada]_id`
- Ejemplo: `paciente_id`, `especialidad_id`

---

## Migración de Datos

[Documentar estrategia de migración de datos existentes si aplica]

---

## Performance

### Consideraciones

- Índices en campos de búsqueda frecuente
- Paginación en listados grandes
- Cache para datos de referencia

### Optimizaciones Planeadas

- [ ] [Optimización 1]
- [ ] [Optimización 2]

---

## Auditoría

### Campos de Auditoría

Todas las colecciones principales incluyen:
- `created_at` - Fecha de creación
- `updated_at` - Fecha de última modificación
- `created_by` - Usuario que creó
- `updated_by` - Usuario que modificó

---

## Referencias

- [Documentación de NocoBase](https://docs.nocobase.com/)
- [app-spec/app.yaml](../../app-spec/app.yaml) - Blueprint del proyecto
- [Documentación de colecciones](colecciones/) - Detalles de cada tabla

---

**Última Actualización**: YYYY-MM-DD
**Versión del Modelo**: 0.1.0
