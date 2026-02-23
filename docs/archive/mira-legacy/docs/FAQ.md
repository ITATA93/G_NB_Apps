# FAQ - Preguntas Frecuentes (Desarrollo)

Preguntas frecuentes sobre desarrollo, configuración y troubleshooting del proyecto MIRA.

## Tabla de Contenidos

- [Configuración y Setup](#configuración-y-setup)
- [Desarrollo](#desarrollo)
- [API y Scripts](#api-y-scripts)
- [Base de Datos](#base-de-datos)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Configuración y Setup

### ¿Cómo configuro mi entorno de desarrollo?

```bash
# 1. Clonar repositorio
git clone <url>
cd NB_Apps

# 2. Copiar y configurar .env
cp .env.example .env
# Editar .env con tus credenciales

# 3. Instalar dependencias
cd MIRA
npm install

# 4. Verificar conexión
node UGCO/scripts/test-connection.ts
```

### ¿Dónde obtengo las credenciales de NocoBase?

Las credenciales se obtienen del panel de administración de NocoBase:

1. Login en `https://nocobase.hospitaldeovalle.cl`
2. Ir a **Settings > API Keys**
3. Crear nuevo API Key con rol apropiado
4. Copiar token al archivo `.env`

### ¿Qué variables de entorno son obligatorias?

Variables mínimas requeridas:

```env
NOCOBASE_API_URL=https://nocobase.hospitaldeovalle.cl/api
NOCOBASE_API_TOKEN=tu_token_aqui
```

### ¿Debo configurar .env en múltiples ubicaciones?

Sí, hay 3 archivos .env según el contexto:

- **Raíz** (`NB_Apps/.env`): Configuración global (NocoBase API)
- **BUHO** (`Apps/BUHO/backend/.env`): Configuración de backend (PostgreSQL, Redis)
- **UGCO** (`Apps/UGCO/.env`): Scripts específicos de UGCO (opcional)

---

## Desarrollo

### ¿Debo usar JavaScript o TypeScript?

**Recomendación**: TypeScript para nuevos scripts.

- ✅ **TypeScript**: Type safety, mejor mantenibilidad, recomendado
- ⚠️ **JavaScript**: Solo para mantener scripts existentes

### ¿Qué cliente API debo usar?

**Para scripts nuevos**: `ApiClient.ts` (TypeScript moderno)

```typescript
import { createClient, log } from '../../shared/scripts/ApiClient';

const client = createClient();
const data = await client.get('/collections:list');
```

**Para scripts existentes**: `_base-api-client.js` (deprecado)

```javascript
const { createClient } = require('../../shared/scripts/_base-api-client');
```

Ver [shared/scripts/README.md](../shared/scripts/README.md) para más detalles.

### ¿Cómo creo un nuevo script?

1. **Decidir ubicación**:
   - Scripts globales: `/scripts/` (Python)
   - Scripts compartidos: `/shared/scripts/` (Node.js)
   - Scripts específicos de UGCO: `/Apps/UGCO/scripts/` (Node.js/TypeScript)

2. **Usar template**:

```typescript
import { createClient, log } from '../../shared/scripts/ApiClient';

async function main() {
  const client = createClient();

  try {
    // Tu lógica aquí
    const result = await client.get('/endpoint');
    log('Success', 'green');
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
```

3. **Documentar en README**: Agregar entrada en `UGCO/scripts/README.md`

### ¿Cómo hago un commit correctamente?

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
git commit -m "<tipo>(<alcance>): <descripción>"

# Ejemplos
git commit -m "feat(ugco): agregar vista de casos oncológicos"
git commit -m "fix(api): corregir timeout en peticiones"
git commit -m "docs(readme): actualizar instrucciones"
```

Ver [CONTRIBUTING.md](../../CONTRIBUTING.md) para más detalles.

### ¿Puedo crear archivos versionados (_v2, _v3)?

**No**. Política del proyecto:

- ❌ No crear `script_v2.js`, `script_v3.js`
- ✅ Usar git tags: `git tag v1.0.0`
- ✅ Si necesitas mantener versión antigua, moverla a `archive/`

---

## API y Scripts

### ¿Cómo pruebo la conexión a la API?

```bash
# Script de diagnóstico completo
npm run ugco:test

# O manualmente
curl -H "Authorization: Bearer $NOCOBASE_API_KEY" \
     https://nocobase.hospitaldeovalle.cl/api
```

### ¿Cómo listo todas las colecciones?

```bash
# Usando npm script (recomendado)
npm run ugco:list

# O directamente con tsx
tsx Apps/UGCO/scripts/list-collections.ts
```

### Error: "Cannot find module '../../shared/scripts/ApiClient'"

**Causa**: Path incorrecto o módulo no compilado.

**Solución**:

```bash
# Verificar que el archivo existe
ls shared/scripts/ApiClient.ts

# Ejecutar scripts TypeScript con tsx
npx tsx <path/to/script.ts>

# O usar los scripts npm configurados
npm run ugco:test
npm run ugco:list
```

### Error: "ECONNREFUSED" al conectar a API

**Causas comunes**:

1. URL incorrecta en `.env`
2. API caída
3. Firewall bloqueando conexión

**Solución**:

```bash
# 1. Verificar URL
echo $NOCOBASE_API_URL

# 2. Verificar conectividad
ping nocobase.hospitaldeovalle.cl

# 3. Verificar que API responde
curl -I https://nocobase.hospitaldeovalle.cl/api
```

### ¿Cómo manejo errores de timeout?

Aumentar timeout en `.env`:

```env
NOCOBASE_TIMEOUT_SECONDS=60
```

O en el script:

```typescript
const client = axios.create({
  timeout: 30000 // 30 segundos
});
```

---

## Base de Datos

### ¿Cuántas bases de datos hay en el proyecto?

3 bases de datos:

1. **PostgreSQL/MySQL (MIRA)**: Read/Write, colecciones propias de las aplicaciones (Apps/UGCO, Apps/BUHO)
2. **SQL Server (SIDRA)**: Read-Only, datos de ALMA (TrakCare)
3. **NocoBase Internal**: Gestión interna de NocoBase

### ¿Cómo verifico la sincronización con ALMA?

```bash
# Script de verificación
node Apps/UGCO/scripts/check-sql-sync-simple.js

# O verificar datasources
node Apps/UGCO/scripts/inspect-datasources.js
```

### ¿Puedo modificar datos de ALMA?

**No**. ALMA es **Read-Only**.

- ✅ Leer pacientes, diagnósticos, episodios
- ❌ Crear, actualizar o eliminar datos en ALMA
- ✅ Crear datos propios en colecciones UGCO

### ¿Cómo creo una nueva colección?

1. **Definir en Blueprint**: Editar `app-spec/app.yaml`

```yaml
- name: "mi_nueva_coleccion"
  title: "Mi Colección"
  fields:
    - name: "campo1"
      type: "string"
```

2. **Aplicar configuración**:

```bash
cd scripts
python nocobase_configure.py
```

3. **Verificar creación**:

```bash
node Apps/UGCO/scripts/list-collections.ts
```

---

## Deployment

### ¿Cuál es el proceso de deployment?

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para proceso completo.

Resumen:

1. Preparación y tests
2. Backup de configuración actual
3. Aplicar cambios de modelo de datos
4. Seed de datos maestros
5. Verificación post-deployment

### ¿Cómo hago rollback si algo falla?

Ver [DEPLOYMENT.md - Procedimientos de Rollback](./DEPLOYMENT.md#procedimientos-de-rollback).

Resumen:

```bash
# Restaurar desde backup
tar -xzf /backups/mira-<fecha>.tar.gz

# Revertir commits
git revert <commit-hash>

# Re-deploy versión anterior
```

### ¿Debo hacer backup antes de deployment?

**Sí, siempre**.

```bash
# Backup de colecciones
node Apps/UGCO/scripts/list-collections.ts > backup/collections-$(date +%Y%m%d).json

# Backup de base de datos
pg_dump mira_production > backup/mira-$(date +%Y%m%d).sql
```

---

## Troubleshooting

### Error: "0 colecciones encontradas"

**Causa**: Bug conocido en scripts antiguos (falta `url.search`).

**Solución**: Usar scripts actualizados.

```bash
# ❌ NO usar (obsoleto)
node inspect-databases.js

# ✅ Usar (actualizado)
node list-all-collections-fixed.js
ts-node list-collections.ts
```

Ver [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#error-1) para detalles.

### ¿Dónde están los logs de errores?

Ubicaciones comunes:

```bash
# Logs de aplicación
tail -f /var/log/mira/app.log

# Logs de NocoBase
tail -f /var/log/nocobase/error.log

# Logs de PostgreSQL
tail -f /var/log/postgresql/postgresql-*.log
```

### ¿Cómo debug un script que falla?

```typescript
// 1. Agregar logs detallados
import { log } from '../../shared/scripts/ApiClient';

log('Starting script...', 'cyan');
log(`Config: ${JSON.stringify(config)}`, 'yellow');

// 2. Ejecutar con --inspect
node --inspect script.js

// 3. Capturar errores con stack trace
try {
  // código
} catch (error) {
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
```

### Scripts legacy eliminados - ¿Dónde están ahora?

Los scripts en `UGCO/scripts/legacy/` fueron **eliminados definitivamente** en la auditoría de 2026-01-25.

**Razón**: Contenían bugs conocidos y estaban completamente deprecados.

**Alternativas**:
- `list-all-collections-fixed.js` → Usar `list-collections.ts`
- `inspect-*` → Usar scripts verificados en `UGCO/scripts/`

Ver [UGCO/scripts/archive/README.md](../UGCO/scripts/archive/README.md) para lista completa.

### ¿Qué hago si mi script usa _base-api-client.js deprecado?

**Opción 1: Mantener como está** (si funciona)
- Scripts existentes pueden seguir usando `_base-api-client.js`
- Agregar TODO para migrar a TypeScript

**Opción 2: Migrar a ApiClient.ts** (recomendado)

```typescript
// Antes (JavaScript)
const { createClient } = require('../../shared/scripts/_base-api-client');

// Después (TypeScript)
import { createClient } from '../../shared/scripts/ApiClient';
```

---

## Recursos Adicionales

### Documentación Principal

- [README.md](../README.md) - Introducción al proyecto
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Guía de contribución
- [ARQUITECTURA.md](./ARQUITECTURA.md) - Arquitectura del sistema
- [ESTANDARES.md](./ESTANDARES.md) - Estándares del proyecto

### Documentación Operacional

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Proceso de deployment
- [OPERATIONS.md](./OPERATIONS.md) - Operaciones y mantenimiento
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Solución de problemas

### Documentación de Aplicaciones

- [UGCO/README.md](../UGCO/README.md) - Aplicación de Oncología
- [UGCO/scripts/README.md](../UGCO/scripts/README.md) - Scripts de UGCO
- [shared/scripts/README.md](../shared/scripts/README.md) - Clientes API

---

## Contacto

¿Pregunta no resuelta?

1. Revisar documentación completa
2. Buscar en issues de GitHub/GitLab
3. Preguntar al equipo en el canal de desarrollo
4. Crear issue si es un problema nuevo

---

**Última actualización**: 2026-01-25
**Mantenido por**: Equipo MIRA - Hospital de Ovalle
**Contribuciones**: Bienvenidas vía pull request
