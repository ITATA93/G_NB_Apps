# Scripts - [NOMBRE_APP]

**Última Actualización**: YYYY-MM-DD

---

## Descripción

Esta carpeta contiene scripts de automatización para configuración, seed, inspección y testing de la aplicación NocoBase.

---

## Estructura

```
scripts/
├── configure/     # Scripts de configuración de colecciones
├── seed/          # Scripts de carga de datos
├── inspect/       # Scripts de inspección y diagnóstico
├── test/          # Scripts de testing y validación
├── utils/         # Utilidades compartidas
└── README.md      # Este archivo
```

---

## Prerrequisitos

### Variables de Entorno

Asegúrate de tener configurado `.env` en la raíz del proyecto:

```env
NOCOBASE_API_URL=https://nocobase.hospitaldeovalle.cl/api
NOCOBASE_API_TOKEN=tu_token_aqui
```

### Dependencias

```bash
# Instalar dependencias (si aplica)
npm install
```

---

## Scripts de Configuración

**Ubicación**: `configure/`

### configure.ts

Configura todas las colecciones de la aplicación.

**Uso**:
```bash
node scripts/configure/configure.ts
```

**Qué hace**:
- Lee definiciones de colecciones de `BD/colecciones/`
- Crea colecciones en NocoBase vía API
- Configura campos con validaciones
- Establece relaciones

**Opciones**:
```bash
# Modo dry-run (no crea, solo muestra)
node scripts/configure/configure.ts --dry-run

# Configurar solo una colección específica
node scripts/configure/configure.ts --collection nombre_coleccion
```

### update-fields.ts

Actualiza campos de una colección existente.

**Uso**:
```bash
node scripts/configure/update-fields.ts --collection nombre_coleccion
```

---

## Scripts de Seed

**Ubicación**: `seed/`

### seed-references.ts

Carga datos de referencia (catálogos, maestros).

**Uso**:
```bash
node scripts/seed/seed-references.ts
```

**Qué hace**:
- Lee archivos JSON de `BD/diccionarios/` y `BD/referencias/`
- Carga datos en colecciones de referencia
- Usa upsert para evitar duplicados

**Opciones**:
```bash
# Seed solo de una colección específica
node scripts/seed/seed-references.ts --only ref_especialidades

# Forzar recarga (elimina datos existentes)
node scripts/seed/seed-references.ts --force
```

### seed-sample-data.ts

Carga datos de ejemplo para desarrollo/testing.

**Uso**:
```bash
# Solo en ambiente de desarrollo
NODE_ENV=development node scripts/seed/seed-sample-data.ts
```

**⚠️ Advertencia**: No ejecutar en producción.

---

## Scripts de Inspección

**Ubicación**: `inspect/`

### list-collections.ts

Lista todas las colecciones de la aplicación.

**Uso**:
```bash
node scripts/inspect/list-collections.ts
```

**Salida**:
```
Colecciones en [NOMBRE_APP]:
1. casos_oncologicos (15 campos, 3 relaciones)
2. pacientes (20 campos, 5 relaciones)
...
Total: 10 colecciones
```

**Opciones**:
```bash
# Salida en formato JSON
node scripts/inspect/list-collections.ts --json

# Guardar en archivo
node scripts/inspect/list-collections.ts > colecciones.txt
```

### inspect-collection.ts

Inspecciona detalles de una colección específica.

**Uso**:
```bash
node scripts/inspect/inspect-collection.ts nombre_coleccion
```

**Salida**:
```json
{
  "name": "casos_oncologicos",
  "fields": [...],
  "indexes": [...],
  "associations": [...]
}
```

**Opciones**:
```bash
# Ver solo campos
node scripts/inspect/inspect-collection.ts nombre_coleccion --fields-only

# Ver solo relaciones
node scripts/inspect/inspect-collection.ts nombre_coleccion --relations-only
```

---

## Scripts de Testing

**Ubicación**: `test/`

### test-connection.ts

Verifica conexión a NocoBase API.

**Uso**:
```bash
node scripts/test/test-connection.ts
```

**Salida**:
```
✅ Conexión exitosa a NocoBase API
✅ Token válido
✅ Usuario autenticado: admin@example.com
```

### validate-collections.ts

Valida que todas las colecciones esperadas existen.

**Uso**:
```bash
node scripts/test/validate-collections.ts
```

**Salida**:
```
Validando colecciones...
✅ casos_oncologicos - OK
✅ pacientes - OK
❌ tratamientos - NO ENCONTRADA

Resultado: 2/3 colecciones OK
```

---

## Utilidades

**Ubicación**: `utils/`

### ApiClient.ts

Cliente reutilizable para interactuar con NocoBase API.

**Uso en otros scripts**:
```typescript
import { ApiClient } from '../utils/ApiClient';

const client = new ApiClient();

// Listar registros
const response = await client.list('casos_oncologicos', {
  page: 1,
  pageSize: 20
});

// Crear registro
const newRecord = await client.create('casos_oncologicos', {
  campo1: 'valor1',
  campo2: 'valor2'
});

// Actualizar registro
await client.update('casos_oncologicos', id, {
  campo1: 'nuevo_valor'
});

// Eliminar registro
await client.destroy('casos_oncologicos', id);
```

**Características**:
- Reintentos automáticos en caso de fallo temporal
- Logging de requests/responses
- Manejo de errores estandarizado

---

## Orden de Ejecución Recomendado

### Configuración Inicial

1. **Verificar conexión**:
   ```bash
   node scripts/test/test-connection.ts
   ```

2. **Configurar colecciones**:
   ```bash
   node scripts/configure/configure.ts
   ```

3. **Cargar datos de referencia**:
   ```bash
   node scripts/seed/seed-references.ts
   ```

4. **Validar**:
   ```bash
   node scripts/test/validate-collections.ts
   node scripts/inspect/list-collections.ts
   ```

### Después de Cambios en el Modelo

1. **Actualizar colecciones**:
   ```bash
   node scripts/configure/update-fields.ts --collection nombre_coleccion
   ```

2. **Verificar cambios**:
   ```bash
   node scripts/inspect/inspect-collection.ts nombre_coleccion
   ```

---

## Mejores Prácticas

### 1. Siempre usar Scripts TypeScript

❌ **Evitar**:
```bash
node scripts/legacy/old-script.js
```

✅ **Preferir**:
```bash
node scripts/configure/configure.ts
```

### 2. Dry-Run Antes de Cambios Importantes

```bash
# Ver qué haría sin ejecutar
node scripts/configure/configure.ts --dry-run
```

### 3. Logging

Los scripts loguean a `stdout`. Para guardar logs:

```bash
node scripts/configure/configure.ts 2>&1 | tee logs/configure-$(date +%Y%m%d).log
```

### 4. Manejo de Errores

Los scripts retornan código de salida:
- `0` = Éxito
- `1` = Error

Útil para CI/CD:
```bash
node scripts/test/validate-collections.ts
if [ $? -eq 0 ]; then
  echo "Validación exitosa"
else
  echo "Validación falló"
  exit 1
fi
```

---

## Troubleshooting

### Error: "ECONNREFUSED"

**Causa**: No se puede conectar a NocoBase API

**Solución**:
1. Verificar que `NOCOBASE_API_URL` en `.env` es correcto
2. Verificar que NocoBase está corriendo
3. Verificar conectividad de red

### Error: "401 Unauthorized"

**Causa**: Token inválido o expirado

**Solución**:
1. Re-autenticarse para obtener nuevo token
2. Actualizar `NOCOBASE_API_TOKEN` en `.env`

### Error: "Collection not found"

**Causa**: Colección no existe

**Solución**:
```bash
# Listar colecciones disponibles
node scripts/inspect/list-collections.ts

# Crear la colección
node scripts/configure/configure.ts --collection nombre_coleccion
```

---

## Scripts Legacy (Deprecados)

⚠️ **No usar estos scripts** - Se mantienen solo por compatibilidad:

- `legacy/old-script.js` - Usar `configure/configure.ts` en su lugar
- `legacy/seed-old.js` - Usar `seed/seed-references.ts` en su lugar

Ver `legacy/README.md` para detalles de migración.

---

## Desarrollo de Nuevos Scripts

### Template de Script

```typescript
import { ApiClient } from '../utils/ApiClient';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const client = new ApiClient();

  try {
    // Lógica del script aquí
    console.log('Script completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
```

### Agregar Script al Índice

Actualizar este README con:
1. Nombre y ubicación del script
2. Descripción de qué hace
3. Ejemplo de uso
4. Opciones disponibles

---

## Referencias

- [ApiClient.ts](utils/ApiClient.ts) - Cliente API reutilizable
- [NocoBase API Docs](https://docs.nocobase.com/api)
- [../BD/README_Modelo.md](../BD/README_Modelo.md) - Modelo de datos

---

## Contribuir

Al agregar nuevos scripts:
1. Seguir estructura de carpetas
2. Usar TypeScript
3. Incluir manejo de errores
4. Documentar en este README
5. Agregar ejemplo de uso

---

**Última Actualización**: YYYY-MM-DD
**Mantenido por**: [Equipo de Desarrollo]
