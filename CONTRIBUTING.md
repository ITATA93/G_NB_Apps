---
depends_on: [CLAUDE.md, docs/standards/output_governance.md]
impacts: []
---

# Guía de Contribución - G_NB_Apps

Gracias por contribuir al proyecto G_NB_Apps (MIRA - Hospital de Ovalle). Esta guía te ayudará a mantener la calidad y consistencia del código.

## Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Primeros Pasos](#primeros-pasos)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Estándares de Código](#estándares-de-código)
- [Convenciones de Commits](#convenciones-de-commits)
- [Proceso de Revisión](#proceso-de-revisión)
- [Estructura del Proyecto](#estructura-del-proyecto)

---

## Código de Conducta

- Sé respetuoso y profesional
- Documenta tus cambios claramente
- Prueba tu código antes de hacer commit
- Sigue los estándares establecidos

---

## Primeros Pasos

### 1. Configurar el Entorno

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd G_NB_Apps

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Instalar dependencias
npm install
```

### 2. Verificar Conexión a NocoBase

```bash
# Ejecutar script de diagnóstico
npm run ugco:test
```

---

## Flujo de Trabajo

### Branching Strategy

Usamos una estrategia de branching simplificada:

```
master (producción estable)
  └── feature/<nombre-feature>     # Nuevas funcionalidades
  └── fix/<nombre-fix>              # Correcciones de bugs
  └── docs/<nombre-doc>             # Cambios de documentación
  └── refactor/<nombre-refactor>    # Refactorización
```

### Workflow de Desarrollo

1. **Crear una rama**
   ```bash
   git checkout -b feature/nombre-descriptivo
   ```

2. **Desarrollar y probar**
   - Escribe código siguiendo los estándares
   - Prueba localmente
   - Documenta los cambios

3. **Commit**
   ```bash
   git add .
   git commit -m "feat: agregar funcionalidad X"
   ```

4. **Push y Pull Request**
   ```bash
   git push origin feature/nombre-descriptivo
   # Crear PR en GitHub/GitLab
   ```

---

## Estándares de Código

### JavaScript / TypeScript

#### Preferir TypeScript para Nuevos Scripts

- **Nuevos scripts**: Usar TypeScript (.ts) con el cliente `ApiClient.ts`
- **Scripts existentes**: Pueden mantenerse en JavaScript hasta su refactorización

#### Ejemplo de Script TypeScript

```typescript
import { createClient, log } from '../../shared/scripts/ApiClient';

async function main() {
  const client = createClient();

  try {
    const collections = await client.get('/collections:list');
    log(`Total: ${collections.data.length}`, 'cyan');
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
```

#### Estilo de Código

- Usar camelCase para variables y funciones
- Usar PascalCase para clases
- Usar SCREAMING_SNAKE_CASE para constantes
- Indentación: 2 espacios
- Punto y coma al final de las líneas
- Comillas simples para strings

### Python

```python
# Usar snake_case
def process_data(input_data):
    """Documentar funciones con docstrings"""
    result = transform(input_data)
    return result

# Constantes en MAYÚSCULAS
MAX_RETRIES = 3
API_VERSION = "v1"
```

### Documentación de Código

#### Comentarios

- Explicar el "por qué", no el "qué"
- Comentar código complejo o no obvio
- Mantener comentarios actualizados

```javascript
// ✅ BUENO: Explica el razonamiento
// Usamos un timeout de 15 segundos porque las consultas SQL pueden ser lentas
const timeout = 15000;

// ❌ MALO: No agrega valor
// Timeout de 15 segundos
const timeout = 15000;
```

#### JSDoc / TSDoc

```typescript
/**
 * Obtiene todas las colecciones de NocoBase
 *
 * @returns {Promise<Collection[]>} Lista de colecciones
 * @throws {Error} Si la API no está disponible
 */
async function getCollections(): Promise<Collection[]> {
  // ...
}
```

---

## Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

### Formato

```
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat(ugco): agregar vista de casos oncológicos` |
| `fix` | Corrección de bug | `fix(api): corregir timeout en peticiones SQL` |
| `docs` | Cambios en documentación | `docs(readme): actualizar instrucciones de instalación` |
| `style` | Formato, sin cambios de lógica | `style: aplicar formato consistente` |
| `refactor` | Refactorización de código | `refactor(scripts): consolidar scripts de seed` |
| `test` | Agregar o modificar tests | `test(api): agregar tests de integración` |
| `chore` | Tareas de mantenimiento | `chore: actualizar dependencias` |

### Ejemplos

```bash
# Feature
git commit -m "feat(ugco): agregar formulario de registro de casos"

# Fix
git commit -m "fix(scripts): corregir manejo de errores en seed_data.js"

# Docs
git commit -m "docs(contributing): agregar sección de estándares"

# Refactor
git commit -m "refactor(api-client): migrar a TypeScript"

# Chore
git commit -m "chore: eliminar scripts obsoletos de legacy/"
```

### Co-Authored-By

Para commits en pair programming o con ayuda de IA:

```bash
git commit -m "feat: implementar nueva funcionalidad

Co-Authored-By: Nombre Colaborador <email@example.com>
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Proceso de Revisión

### Checklist del Autor (Antes de PR)

- [ ] Código sigue los estándares establecidos
- [ ] Pruebas ejecutadas y pasando
- [ ] Documentación actualizada
- [ ] Commit messages siguen convenciones
- [ ] No hay archivos temporales o secretos
- [ ] Scripts probados localmente

### Checklist del Revisor

- [ ] Código es claro y mantenible
- [ ] Cambios están bien documentados
- [ ] No introduce regresiones
- [ ] Sigue arquitectura establecida
- [ ] No hay problemas de seguridad obvios

### Proceso de Aprobación

1. **Autor** crea PR con descripción clara
2. **Revisor** revisa código y deja comentarios
3. **Autor** responde a comentarios y hace ajustes
4. **Revisor** aprueba PR
5. **Autor** hace merge a master

---

## Estructura del Proyecto

### Organización de Carpetas

```
G_NB_Apps/
├── .agent/                # Configuración de agentes (rules, skills, workflows)
├── .claude/               # Configuración Claude Code (skills, hooks)
├── app-spec/              # Blueprint (source of truth)
├── scripts/               # Scripts Python y PowerShell globales
├── shared/                # Recursos compartidos
│   ├── scripts/           # Clientes API TypeScript (36 scripts)
│   └── python/            # Scripts Python legacy
├── Apps/                  # Aplicaciones
│   ├── UGCO/              # App: Oncología
│   │   ├── BD/            # Modelos de datos
│   │   ├── docs/          # Documentación específica
│   │   ├── scripts/       # Scripts de automatización
│   │   └── backups/       # Backups de datos
│   ├── BUHO/              # App: Gestión Clínica
│   │   └── backend/       # Backend Express
│   └── _APP_TEMPLATE/     # Template para nuevas apps
├── docs/                  # Documentación global
│   ├── api/               # Documentación APIs
│   ├── debug/             # Outputs de validación
│   ├── reports/           # Reportes de auditoría
│   └── archive/           # Archivos históricos
└── MIRA/                  # Documentación técnica legacy
```

### Dónde Agregar Nuevo Código

| Tipo de Código | Ubicación |
|----------------|-----------|
| Scripts Python globales | `/scripts/` |
| Scripts Node.js compartidos | `/shared/scripts/` |
| Scripts específicos de UGCO | `/Apps/UGCO/scripts/` |
| Scripts específicos de BUHO | `/Apps/BUHO/scripts/` |
| Documentación técnica global | `/docs/` |
| Documentación de app | `/Apps/<APP>/docs/` |
| Modelos de datos | `/Apps/<APP>/BD/` |
| Blueprint del sistema | `/app-spec/app.yaml` |

---

## Mantenimiento de Scripts

### Política de Versionado

- **NO** crear archivos `_v2.js`, `_v3.js`
- Usar git tags para versiones: `git tag v1.0.0`
- Si necesitas mantener una versión antigua, moverla a `archive/`

### Deprecación de Scripts

1. Agregar comentario de deprecación en el archivo
   ```javascript
   /**
    * ⚠️ DEPRECADO: Usar ApiClient.ts en su lugar
    * Este script se mantendrá hasta [fecha]
    */
   ```

2. Actualizar README con advertencia

3. Después de 2 meses sin uso, mover a `archive/`

4. Después de 2 meses en `archive/`, eliminar definitivamente

---

## Mejores Prácticas

### Seguridad

- **NUNCA** commitear archivos `.env` con secretos
- Usar variables de entorno para credenciales
- Revisar `.gitignore` antes de hacer commit
- No incluir API keys en código

### Performance

- Usar paginación para consultas grandes
- Implementar timeouts apropiados
- Cachear resultados cuando sea posible
- Cerrar conexiones después de usar

### Mantenibilidad

- Escribir código auto-explicativo
- Evitar duplicación (DRY)
- Mantener funciones pequeñas y enfocadas
- Preferir composición sobre herencia

---

## Recursos Adicionales

- [README.md](README.md) - Documentación principal
- [app-spec/app.yaml](app-spec/app.yaml) - Blueprint del sistema (source of truth)
- [shared/scripts/README.md](shared/scripts/README.md) - Clientes API
- [MIRA/README.md](MIRA/README.md) - Documentación técnica legacy

---

## Preguntas

Si tienes preguntas que no están cubiertas aquí:

1. Revisa [FAQ.md](MIRA/docs/FAQ.md)
2. Consulta la documentación existente
3. Pregunta al equipo en el canal correspondiente

---

**Última actualización**: 2026-02-16
**Mantenido por**: Equipo MIRA - Hospital de Ovalle
