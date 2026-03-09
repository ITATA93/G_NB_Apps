# Troubleshooting Guide — G_NB_Apps / NocoBase

Soluciones a problemas recurrentes encontrados durante desarrollo y despliegue.

---

## Chart Blocks

### Problema: Chart muestra "0" o datos en blanco
**Causa:** La propiedad de agregación en measures usa `aggregate` en vez de `aggregation`.
```json
// INCORRECTO — retorna filas raw
{ "field": ["id"], "aggregate": "count", "alias": "count" }

// CORRECTO — retorna datos agrupados
{ "field": ["id"], "aggregation": "count", "alias": "count" }
```

### Problema: Statistic muestra "0"
**Causa:** Falta `config.general.field` en el ChartRendererProvider.
```json
"config": {
  "chartType": "antd.statistic",
  "general": { "field": "count" }
}
```

### Problema: Query/config en ChartBlockProvider no funciona
**Causa:** `query` y `config` deben ir en `ChartRendererProvider` (capa 3), no en `ChartBlockProvider` (capa 1).
- Capa 1 (`ChartBlockProvider`): solo `collection` y `dataSource`
- Capa 3 (`ChartRendererProvider`): `collection`, `dataSource`, `query`, `config`

---

## Association Columns (Tablas)

### Problema: Columna de asociación muestra "N/A" o número entero
**3 requisitos para que funcione:**

1. **`params.appends`** en `TableBlockProvider`:
   ```json
   "params": { "appends": ["paciente", "estado_clinico"] }
   ```

2. **`titleField`** en la colección target:
   ```
   POST /collections:update?filterByTk=<collName>
   Body: { "titleField": "nombre" }
   ```

3. **Property key** correcto en el schema UI:
   - `paciente` (nombre de asociación) — CORRECTO
   - `paciente_id` (nombre FK) — INCORRECTO, muestra entero

**Para corregir:** `uiSchemas:remove` el nodo viejo + `uiSchemas:insertAdjacent` con el `name` correcto.

---

## ACL / Permisos

### Problema: `resources:update` retorna 200 pero no aplica permisos
**Causa:** `filterByTk` debe usar el **ID numérico** del recurso, no el nombre de la colección.
```
// INCORRECTO — silenciosamente no hace nada
PUT roles/admin_ugco/resources:update?filterByTk=onco_casos

// CORRECTO — aplica permisos
PUT roles/admin_ugco/resources:update?filterByTk=42
```

**Para obtener IDs numéricos:**
```
GET roles/{role}/resources:list?pageSize=200&appends[]=actions
```

### Problema: Página no visible para un rol
**Causa:** Falta agregar las rutas al rol, incluyendo tabs ocultos.
```
POST roles/{role}/desktopRoutes:add
Body: { "tk": [routeId1, routeId2, ...] }
```
Incluir: grupo padre + página + tabs ocultos (hijos con `type: "tabs"` y `hidden: true`).

---

## Routes / Navegación

### Problema: No encuentro el schemaUid de una página
**Solución:** Los tab children son entries separados en la respuesta de rutas.
```typescript
// INCORRECTO — children no vienen embebidos
child.children?.find(t => t.type === "tabs")

// CORRECTO — buscar en la lista plana
allRoutes.find(r => r.parentId === child.id && r.type === "tabs")
```
El `schemaUid` del tab ES el UID del grid de la página.

---

## Errores Comunes de API

| Error | Causa | Solución |
|-------|-------|----------|
| `400 Bad Request` en charts:query | Campo inexistente en measures/dimensions | Verificar nombre exacto del campo |
| `401 Unauthorized` | Token expirado o inválido | Regenerar API key en NocoBase admin |
| `404 Not Found` en actions:create | Endpoint no existe en esta versión | Usar `resources:update` con actions array |
| `500 Internal Server Error` en collections:create | Colección duplicada | Verificar con `collections:list` antes de crear |

---

## Scripts de Diagnóstico

```bash
# Diagnosticar charts
npx tsx scripts/diagnose-charts.ts

# Diagnosticar tablas UGCO
npx tsx Apps/UGCO/scripts/diagnostics/diagnose-tables.ts

# Verificar conexión
npx tsx shared/scripts/manage-system.ts info

# Listar colecciones
npm run nb:collections list
```
