# Scripts de API NocoBase - UGCO

Esta carpeta contiene scripts para interactuar con la API de NocoBase del Hospital de Ovalle.

---

## 📋 Scripts Recomendados (Usar estos)

### 🔧 Diagnóstico y Utilidades

| Script | Descripción | Comando |
|--------|-------------|---------|
| **`test-connection.js`** | Diagnóstico completo de conexión | `node scripts/test-connection.js` |
| **`list-all-collections-fixed.js`** | Lista todas las colecciones con detalles | `node scripts/list-all-collections-fixed.js` |

### 🛠️ Cliente API

⚠️ **IMPORTANTE**: Hay dos clientes disponibles en ubicación compartida:

| Cliente | Estado | Descripción |
|---------|--------|-------------|
| `../../shared/scripts/ApiClient.ts` | ✅ **RECOMENDADO** | Cliente moderno TypeScript con type safety |
| `../../shared/scripts/_base-api-client.js` | ⚠️ **DEPRECADO** | Cliente JavaScript legacy (solo para scripts existentes) |

**📖 Ver documentación completa:** [shared/scripts/README.md](../../shared/scripts/README.md)

**Ejemplo de uso del cliente moderno (TypeScript):**

```typescript
import { createClient, log } from '../../shared/scripts/ApiClient';

async function main() {
  const client = createClient();

  // GET request
  const collections = await client.get('/collections:list');
  log(`Total colecciones: ${collections.data.length}`, 'cyan');

  // POST request
  const result = await client.post('/collections:create', { name: 'test' });
}

main();
```

**Ejemplo de uso del cliente legacy (JavaScript - deprecado):**

```javascript
const { createClient, log } = require('../../shared/scripts/_base-api-client');

async function main() {
  const client = createClient();
  const collections = await client.getCollections();
  log(`Total colecciones: ${collections.length}`, 'cyan');
}

main();
```

---

## ⚠️ Scripts Obsoletos Eliminados

Los siguientes scripts obsoletos fueron eliminados en la auditoría de 2026-01-25:

| Script | Razón de Eliminación |
|--------|---------------------|
| ❌ `inspect-databases.js` | Devolvía 0 colecciones (bug conocido) |
| ❌ `inspect-pages.js` | Devolvía 0 páginas (bug conocido) |
| ❌ `manage-plugins-simple.js` | Devolvía 0 plugins (bug conocido) |
| ❌ **Carpeta legacy/** (14 scripts) | Scripts completamente deprecados |

**Razón del bug**: No incluían `url.search` en las peticiones HTTP. Ver [TROUBLESHOOTING.md](../../docs/TROUBLESHOOTING.md#error-1)

**Reemplazados por**: `list-all-collections-fixed.js` y otros scripts verificados.

---

## 📦 Scripts Activos Disponibles

### Scripts Verificados y Funcionando:

| Script | Descripción | Tipo |
|--------|-------------|------|
| `test-connection.js` | Diagnóstico completo de conexión | JavaScript |
| `test-connection.ts` | Diagnóstico completo de conexión | TypeScript |
| `list-all-collections-fixed.js` | Lista todas las colecciones | JavaScript |
| `list-collections.ts` | Lista todas las colecciones | TypeScript |
| `inspect-datasources.js` | Inspecciona datasources | JavaScript |
| `inspect-datasources.ts` | Inspecciona datasources | TypeScript |
| `delete-empty-collections.js` | Elimina colecciones vacías | JavaScript |
| `delete-collections.ts` | Elimina colecciones | TypeScript |
| `check-sql-sync-simple.js` | Verifica sincronización SQL | JavaScript |
| `check-sql-sync.ts` | Verifica sincronización SQL | TypeScript |
| `configure-onco-fields.js` | Configura campos oncológicos | JavaScript |
| `probe-collection.js` | Inspecciona colección específica | JavaScript |
| `sync-mira-collections.js` | Sincroniza colecciones MIRA | JavaScript |

**Nota**: Los scripts TypeScript (.ts) son las versiones más modernas y se recomienda su uso en nuevos desarrollos.

---

## 🚀 Cómo crear un nuevo script

### Paso 1: Usar el cliente base

Siempre importa y usa el cliente base compartido:

```javascript
const { createClient, log, colors } = require('../../shared/scripts/_base-api-client');

async function main() {
  const client = createClient();

  // Tu código aquí
}

main().catch(error => {
  log(`Error: ${error.message}`, 'red');
  process.exit(1);
});
```

### Paso 2: Métodos disponibles

El cliente base incluye:

**Métodos HTTP:**
- `client.get(endpoint)` - GET request
- `client.post(endpoint, data)` - POST request
- `client.put(endpoint, data)` - PUT request
- `client.delete(endpoint)` - DELETE request

**Métodos helper:**
- `client.testConnection()` - Verifica si la API responde
- `client.getCurrentUser()` - Obtiene info del usuario actual
- `client.getCollections()` - Obtiene todas las colecciones
- `client.getCollectionSchema(name)` - Obtiene esquema de una colección
- `client.createCollection(data)` - Crea una colección
- `client.updateCollection(name, data)` - Actualiza una colección
- `client.deleteCollection(name)` - Elimina una colección

### Paso 3: Logging con colores

```javascript
log('Mensaje normal', 'reset');
log('Éxito', 'green');
log('Advertencia', 'yellow');
log('Error', 'red');
log('Info', 'cyan');
log('Destacado', 'bright');
```

---

## 📚 Documentación Relacionada

- **[TROUBLESHOOTING.md](../../docs/TROUBLESHOOTING.md)** - Registro de errores y soluciones (compartido)
- **[_base-api-client.js](../../shared/scripts/README.md)** - Documentación del cliente API (compartido)
- **[CHANGELOG.md](../CHANGELOG.md)** - Registro de cambios del proyecto
- **[README.md](../README.md)** - Documentación principal del proyecto

---

## 🐛 ¿Encontraste un error?

1. Ejecuta el diagnóstico:
   ```bash
   node scripts/test-connection.js
   ```

2. Revisa si el error ya fue documentado:
   - [TROUBLESHOOTING.md](../../docs/TROUBLESHOOTING.md)

3. Si es un error nuevo, documéntalo en ese archivo siguiendo el template.

---

## 📊 Estado de Scripts

| Estado | Cantidad | Nota |
|--------|----------|------|
| ✅ **Verificados y funcionando** | 13 | Ver sección "Scripts Activos Disponibles" |
| ❌ **Eliminados (obsoletos)** | 17+ | 14 en legacy/ + 3 scripts con bugs conocidos |
| 📁 **Archivo disponible** | 0 | Ver carpeta `archive/` para scripts archivados |

**Total**: 13 scripts activos (clientes API en `shared/`)

---

**Última auditoría**: 2026-01-25
**Última actualización**: 2026-01-25
**Mantenido por**: Equipo UGCO
