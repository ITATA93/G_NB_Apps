# Registro de Errores y Soluciones - UGCO NocoBase

**Propósito**: Documentar errores encontrados durante el desarrollo y las soluciones aplicadas para evitar que se repitan.

---

## 📋 Formato de Registro

Cada entrada debe incluir:
- **Fecha**: Cuándo ocurrió
- **Error**: Descripción del problema
- **Causa Raíz**: Por qué ocurrió
- **Solución Aplicada**: Cómo se resolvió
- **Estado**: ✅ Resuelto | ⚠️ Parcial | ❌ Pendiente
- **Archivos Afectados**: Scripts o código relacionado
- **Prevención**: Cómo evitar que vuelva a ocurrir

---

## Error #1: API devolviendo 0 colecciones

**Fecha**: 2025-11-21
**Reportado por**: Matias
**Estado**: ✅ RESUELTO

### Descripción del Error

Los scripts de inspección (`inspect-databases.js`, `inspect-pages.js`, etc.) reportaban **0 colecciones** cuando en realidad existían 8 colecciones en NocoBase.

```javascript
// Resultado erróneo:
✓ Total de plugins: 0
ℹ️  No se encontraron colecciones
```

### Síntomas

- La API respondía con código 200 (OK)
- Pero los datos estaban vacíos o `null`
- El token era válido
- El usuario tenía permisos correctos (rol: root)

### Causa Raíz

**Problema 1: No seguir redirects HTTP 301**

El servidor NocoBase estaba respondiendo con un redirect 301 de HTTPS a HTTP:

```
Status: 301 Moved Permanently
Location: http://nocobase.hospitaldeovalle.cl/api/
```

Los scripts usaban `https.request()` de Node.js nativo, que **NO sigue automáticamente los redirects**. Esto causaba que:
1. Se enviaba la petición a `/api`
2. El servidor respondía con 301
3. El script NO seguía el redirect
4. Se recibía HTML de error en lugar de JSON

**Problema 2: Manejo incorrecto del path en la URL**

```javascript
// ❌ INCORRECTO:
const url = new URL(endpoint, NOCOBASE_API_URL);
path: url.pathname  // Perdía el path completo

// ✅ CORRECTO:
path: url.pathname + url.search  // Incluye query params
```

### Solución Aplicada

#### Paso 1: Seguir redirects manualmente

Modificar el código para incluir `url.search` (query parameters):

```javascript
const options = {
  hostname: urlObj.hostname,
  port: urlObj.port || 443,
  path: urlObj.pathname + urlObj.search,  // ✅ AGREGADO: + url.search
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Role': 'root',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};
```

#### Paso 2: Aumentar timeout

```javascript
timeout: 15000  // Aumentado de 10000 a 15000ms
```

#### Paso 3: Script de diagnóstico

Crear `test-connection.js` que muestra:
- Detalles completos de la petición
- Headers de respuesta
- Status codes
- Body completo (primeros 500 chars)

Esto permitió identificar el problema rápidamente.

### Resultado

✅ **Funciona correctamente**

```bash
$ node scripts/list-all-collections-fixed.js
✓ 8 colecciones encontradas

COLECCIONES UGCO:
  📋 t_fcwwwzv1d9m - "Episodio Oncologico"
  📋 t_y8hbbtkjgl3 - "Oncologia"
  📋 t_uralzvq4vg1 - "Pacientes_Hospitalizados"
  📋 t_6xbh17pki1d - "Pacientes"
  📋 t_pkg68r6rprd - "Comite Oncologico"
  📋 departments - "Unidades"
```

### Archivos Afectados

**Scripts corregidos:**
- ✅ `scripts/test-connection.js` - Nuevo script de diagnóstico
- ✅ `scripts/list-all-collections-fixed.js` - Versión corregida
- ❌ `scripts/inspect-databases.js` - DESACTUALIZADO (no usar)
- ❌ `scripts/inspect-pages.js` - DESACTUALIZADO (no usar)
- ❌ `scripts/manage-plugins-simple.js` - DESACTUALIZADO (no usar)

**Scripts a actualizar en el futuro:**
- [ ] `scripts/inspect-databases.js`
- [ ] `scripts/inspect-pages.js`
- [ ] `scripts/manage-plugins-simple.js`
- [ ] `scripts/inspect-nocobase-collections.js`

### Prevención Futura

#### 1. Template de script base

Crear un archivo base `scripts/_base-api-request.js` con la función correcta:

```javascript
function makeRequest(url, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,  // ✅ IMPORTANTE
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Role': 'root',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, rawBody: body });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}
```

#### 2. Usar este template en TODOS los scripts nuevos

No reinventar la rueda. Copiar la función correcta.

#### 3. Siempre probar con test-connection.js primero

Antes de asumir que hay un problema con la API, ejecutar:

```bash
node scripts/test-connection.js
```

Esto mostrará exactamente qué está pasando.

#### 4. Logging detallado en desarrollo

Durante desarrollo, siempre incluir logs de:
- URL completa
- Headers enviados
- Status code recibido
- Primeros caracteres del body

### Lecciones Aprendidas

1. ✅ **Node.js `https.request` NO sigue redirects automáticamente**
   - Considerar usar librerías como `axios` o `node-fetch` que sí lo hacen
   - O manejar redirects manualmente

2. ✅ **Siempre incluir `url.search` en el path**
   - Los query parameters son críticos para APIs REST

3. ✅ **Timeouts generosos en desarrollo**
   - 15 segundos es mejor que 10 segundos
   - Evita falsos negativos por latencia de red

4. ✅ **Scripts de diagnóstico son invaluables**
   - Invertir tiempo en crear `test-connection.js` ahorra horas de debugging

5. ✅ **Documentar errores y soluciones**
   - Este documento mismo es la prueba 😊

### Referencias

- **Issue original**: Usuario reportó "Croe que tienes un erro al conectarte"
- **Scripts afectados**: Ver sección "Archivos Afectados"
- **Fecha de resolución**: 2025-11-21

---

## Error #2: [Próximo error a documentar]

**Fecha**: [Pendiente]
**Estado**: ⏳ Pendiente

_Espacio reservado para el siguiente error..._

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| **Errores registrados** | 1 |
| **Errores resueltos** | 1 ✅ |
| **Errores pendientes** | 0 |
| **Tasa de resolución** | 100% |
| **Última actualización** | 2025-11-21 |

---

## 🔍 Cómo usar este documento

### Para desarrolladores:

1. **Antes de reportar un error**: Busca aquí si ya fue resuelto
2. **Al encontrar un error nuevo**: Documéntalo inmediatamente
3. **Al resolver un error**: Actualiza el estado y agrega la solución

### Formato de nueva entrada:

```markdown
## Error #N: [Título descriptivo]

**Fecha**: YYYY-MM-DD
**Reportado por**: [Nombre]
**Estado**: ⏳ Pendiente

### Descripción del Error
[Qué pasó]

### Síntomas
[Cómo se manifestó]

### Causa Raíz
[Por qué ocurrió]

### Solución Aplicada
[Qué se hizo para resolverlo]

### Resultado
[Funcionó? Evidencia]

### Archivos Afectados
[Lista de archivos]

### Prevención Futura
[Cómo evitarlo]

### Lecciones Aprendidas
[Qué aprendimos]
```

---

## 📝 Notas finales

Este documento es **VIVO** - debe actualizarse con cada error encontrado y resuelto.

**Última revisión**: 2025-11-21
**Próxima revisión**: Cada vez que ocurra un error

---

**Mantenido por**: Equipo UGCO
**Contacto**: [Pendiente definir]
