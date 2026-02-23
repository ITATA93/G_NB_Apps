---
name: nocobase-page-verify
description: Verificar y reparar páginas de NocoBase. Usa para diagnosticar por qué una página no permite agregar bloques o editar contenido.
argument-hint: [pageId] [--fix]
disable-model-invocation: false
allowed-tools: Bash(npx tsx:*), Read
---

# Verificar Páginas de NocoBase

Verifica si las páginas tienen la estructura correcta para ser editables (permitir agregar bloques desde la UI).

## Uso

```bash
# Verificar todas las páginas bajo UGCO
npx tsx Apps/UGCO/scripts/nocobase/verify-fix-pages.ts

# Verificar páginas bajo un parent específico
npx tsx Apps/UGCO/scripts/nocobase/verify-fix-pages.ts 345392373628932

# Verificar una página específica
npx tsx Apps/UGCO/scripts/nocobase/verify-fix-pages.ts 345419886166016

# Verificar y REPARAR automáticamente
npx tsx Apps/UGCO/scripts/nocobase/verify-fix-pages.ts --fix

# Verificar y reparar una página específica
npx tsx Apps/UGCO/scripts/nocobase/verify-fix-pages.ts 345419886166016 --fix
```

## Qué Verifica

Una página es **editable** si cumple TODOS estos criterios:

### 1. Tiene children en la ruta
```
desktopRoutes:
  id: 12345
  type: page
  children:
    - type: tabs        ✓ Debe existir
      schemaUid: xyz    ✓ Debe coincidir con Grid x-uid
      tabSchemaName: abc ✓ Debe coincidir con Grid name
      hidden: true
```

### 2. Schema tiene Grid con x-async: true
```
uiSchemas:
  x-component: Page
  properties:
    [gridName]:          ✓ Nombre debe coincidir con tabSchemaName
      x-component: Grid
      x-uid: xyz         ✓ Debe coincidir con child schemaUid
      x-async: true      ✓ CRÍTICO - sin esto no es editable
      x-initializer: page:addBlock  ✓ Permite agregar bloques
```

## Problemas Comunes

| Problema | Causa | Solución |
|----------|-------|----------|
| No tiene children | Página creada manualmente o con API antigua | Agregar child tipo 'tabs' |
| Grid x-async: false | Estructura antigua | Actualizar a x-async: true |
| Child schemaUid no coincide | Inconsistencia en creación | Recrear página |
| No tiene Grid | Página vacía o corrupta | Recrear página |

## Proceso de Reparación (--fix)

1. **Si no tiene children pero tiene Grid**: Agrega child tipo 'tabs' referenciando el Grid

2. **Si Grid tiene x-async: false**: Intenta actualizar via API (puede fallar)

3. **Si hay inconsistencias graves**: Reporta para recreación manual

## Limitaciones

⚠️ **El campo `x-async` es difícil de actualizar via API** porque es un campo especial que NocoBase maneja internamente.

### Soluciones para páginas con x-async: false

**Opción 1: Recrear la página** (recomendado si está vacía)
```bash
# Eliminar y crear de nuevo
npx tsx Apps/UGCO/scripts/nocobase/delete-page.ts <pageId>
npx tsx Apps/UGCO/scripts/nocobase/create-page.ts "Nombre" <parentId>
```

**Opción 2: SQL directo** (si tiene contenido importante)
```sql
UPDATE ui_schemas
SET schema = jsonb_set(schema, '{x-async}', 'true')
WHERE "x-uid" = '<gridUid>';
```

**Opción 3: Exportar/Importar via UI**
1. Exportar el contenido de la página
2. Eliminar la página
3. Crear nueva página via API
4. Importar el contenido

## Ejemplo de Salida

```
=== VERIFICACIÓN DE PÁGINAS NOCOBASE ===

Verificando 11 páginas...

✅ 🟤 Digestivo Bajo (345419886166016)
✅ 🔶 Digestivo Alto (345419886166018)
❌ 🩷 Mama (345419886166020)
   ⚠️  No tiene children (tab oculto)
   ⚠️  Grid x-async: false (debe ser true)
✅ 💜 Ginecología (345419886166022)

=== RESUMEN ===

Total páginas: 11
✅ Editables: 9
❌ Con problemas: 2

💡 Usa --fix para reparar automáticamente
```

## Estructura Correcta (Referencia)

```
desktopRoute (page)
├── id: 345419886166016
├── title: "🟤 Digestivo Bajo"
├── type: "page"
├── schemaUid: "abc123"        ─┐
└── children:                   │
    └── [0]                     │
        ├── type: "tabs"        │
        ├── schemaUid: "xyz789" ─┼─ Debe coincidir con Grid x-uid
        ├── tabSchemaName: "grid" ─┼─ Debe coincidir con property key
        └── hidden: true        │
                                │
uiSchema                        │
├── x-uid: "abc123" ←───────────┘
├── x-component: "Page"
└── properties:
    └── grid:                  ← tabSchemaName
        ├── x-uid: "xyz789"    ← child schemaUid
        ├── x-component: "Grid"
        ├── x-async: true      ← CRÍTICO
        └── x-initializer: "page:addBlock"
```

## Variables de Entorno Requeridas

- `NOCOBASE_BASE_URL`: URL de la API de NocoBase
- `NOCOBASE_API_KEY`: Token de autenticación
