# [Nombre de la Colección]

**Nombre Técnico**: `nombre_coleccion`
**Título en UI**: [Título que ve el usuario]
**Tipo**: Propia (Read/Write) | Referencia | Integrada (Read-Only)

---

## Descripción

[Descripción de 2-3 párrafos sobre el propósito de esta colección, qué datos almacena y cómo se usa en la aplicación]

---

## Campos

| Campo | Tipo | Requerido | Único | Descripción | Ejemplo |
|-------|------|-----------|-------|-------------|---------|
| `id` | bigInteger | ✅ | ✅ | Identificador único | 1 |
| `campo_texto` | string | ✅ | ❌ | Descripción del campo | "Valor ejemplo" |
| `campo_fecha` | date | ❌ | ❌ | Fecha de [evento] | 2026-01-25 |
| `campo_numero` | integer | ❌ | ❌ | Cantidad de [algo] | 42 |
| `campo_boolean` | boolean | ❌ | ❌ | Indica si [condición] | true |
| `campo_relacion_id` | bigInteger | ✅ | ❌ | FK a [tabla_padre] | 5 |
| `created_at` | datetime | ✅ | ❌ | Fecha de creación | 2026-01-25 10:30:00 |
| `updated_at` | datetime | ✅ | ❌ | Fecha de última actualización | 2026-01-25 15:45:00 |
| `created_by` | bigInteger | ✅ | ❌ | Usuario que creó | 1 |
| `updated_by` | bigInteger | ✅ | ❌ | Usuario que modificó | 1 |

### Descripción Detallada de Campos

#### campo_texto
- **Validaciones**: Mínimo 3 caracteres, máximo 255
- **Formato**: Texto libre
- **Valores permitidos**: Cualquier texto
- **Ejemplo**: "Descripción de ejemplo"

#### campo_fecha
- **Validaciones**: Formato ISO YYYY-MM-DD
- **Formato**: Date
- **Valores permitidos**: Fechas válidas
- **Ejemplo**: 2026-01-25

#### campo_relacion_id
- **Validaciones**: Debe existir en [tabla_padre]
- **Formato**: Integer positivo
- **Relación**: belongsTo -> [tabla_padre]

---

## Relaciones

### Relaciones Salientes (esta colección → otras)

| Tipo | Colección Destino | FK | Descripción |
|------|-------------------|----|-|
| belongsTo | tabla_padre | campo_relacion_id | [Descripción de la relación] |

### Relaciones Entrantes (otras → esta colección)

| Tipo | Colección Origen | FK | Descripción |
|------|------------------|----|----|
| hasMany | tabla_hija | nombre_coleccion_id | [Descripción de la relación] |

---

## Índices

| Nombre | Campos | Tipo | Propósito |
|--------|--------|------|-----------|
| idx_campo_texto | campo_texto | Index | Mejorar búsquedas por texto |
| idx_campo_fecha | campo_fecha | Index | Filtrado por fecha |
| idx_campo_relacion | campo_relacion_id | Index | Join performance |

---

## Validaciones

### A Nivel de Base de Datos

- `id`: NOT NULL, PRIMARY KEY, AUTO_INCREMENT
- `campo_texto`: NOT NULL, VARCHAR(255)
- `campo_fecha`: NULL, DATE
- `campo_relacion_id`: NOT NULL, FOREIGN KEY -> tabla_padre(id)

### A Nivel de Aplicación (NocoBase)

```javascript
{
  name: 'campo_texto',
  type: 'string',
  validate: {
    notEmpty: true,
    len: [3, 255]
  }
}
```

---

## Permisos

| Rol | Create | Read | Update | Delete |
|-----|--------|------|--------|--------|
| admin | ✅ | ✅ | ✅ | ✅ |
| usuario | ✅ | ✅ | ✅ (own) | ❌ |
| readonly | ❌ | ✅ | ❌ | ❌ |

---

## Workflows Asociados

### Workflow 1: [Nombre del Workflow]

**Trigger**: afterCreate
**Descripción**: [Qué hace el workflow]

**Pasos**:
1. Validar campo_x
2. Actualizar tabla_relacionada
3. Enviar notificación

---

## Datos de Ejemplo

```json
{
  "id": 1,
  "campo_texto": "Valor de ejemplo",
  "campo_fecha": "2026-01-25",
  "campo_numero": 42,
  "campo_boolean": true,
  "campo_relacion_id": 5,
  "created_at": "2026-01-25T10:30:00Z",
  "updated_at": "2026-01-25T15:45:00Z",
  "created_by": 1,
  "updated_by": 1
}
```

---

## Queries Comunes

### Listar registros activos

```sql
SELECT * FROM nombre_coleccion
WHERE campo_boolean = true
ORDER BY created_at DESC
LIMIT 20;
```

### Buscar por texto

```sql
SELECT * FROM nombre_coleccion
WHERE campo_texto LIKE '%búsqueda%';
```

### Con relaciones

```sql
SELECT nc.*, tp.nombre as nombre_padre
FROM nombre_coleccion nc
LEFT JOIN tabla_padre tp ON nc.campo_relacion_id = tp.id
WHERE nc.campo_fecha >= '2026-01-01';
```

---

## Tamaño Estimado

**Registros Estimados**: ~[N] registros
**Crecimiento**: [N] registros/mes
**Tamaño Proyectado a 1 año**: ~[X] MB

---

## Consideraciones de Performance

- Índice en `campo_texto` para búsquedas rápidas
- Paginación recomendada: 20-50 registros por página
- Cache de [datos específicos] si aplica

---

## Migración de Datos

[Si aplica, documentar cómo migrar datos de sistema anterior]

---

## Auditoría

Esta colección incluye campos de auditoría estándar:
- `created_at`, `created_by`: Quién y cuándo creó
- `updated_at`, `updated_by`: Quién y cuándo modificó por última vez

Ver logs de auditoría en `logs/audit.log` filtrando por `collection: nombre_coleccion`.

---

## Referencias

- [README del Modelo](../README_Modelo.md) - Modelo de datos completo
- [Script de configuración](../../scripts/configure/configure.ts)
- [Script de seed](../../scripts/seed/seed-[nombre].ts) - Si aplica

---

**Última Actualización**: YYYY-MM-DD
**Versión**: 1.0
**Estado**: ✅ Completada | 🚧 En Progreso | ⏳ Pendiente
