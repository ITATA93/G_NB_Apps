---
depends_on: [CLAUDE.md]
impacts: []
---

# Apps - Aplicaciones NocoBase

Esta carpeta contiene todas las aplicaciones NocoBase del proyecto MIRA (Medical Information Resource Application) para el Hospital de Ovalle.

---

## Estructura

```
Apps/
├── _APP_TEMPLATE/          # Template para crear nuevas aplicaciones
├── UGCO/                   # Unidad de Gestión de Casos Oncológicos
├── ENTREGA/                # Entrega de Turno Médica
├── AGENDA/                 # Agenda Médica Hospitalaria
├── BUHO/                   # Gestión de Pacientes
└── README.md               # Este archivo
```

---

## Aplicaciones Actuales

### UGCO - Unidad de Gestión de Casos Oncológicos

**Estado**: 🟢 Producción
**Versión**: 1.0.0
**Descripción**: Sistema de registro y seguimiento de casos oncológicos basado en estándares internacionales (FIGO, TNM, morfología ICD-O-3).

**Características Principales**:
- Registro completo de casos oncológicos
- Clasificación según FIGO, TNM
- Morfología y topografía ICD-O-3
- Integración con ALMA/TrakCare (read-only)
- Gestión de tratamientos y seguimiento

**Documentación**: Ver [UGCO/README.md](UGCO/README.md)

**Scripts**: [UGCO/scripts/](UGCO/scripts/)

---

### ENTREGA - Entrega de Turno Médica

**Estado**: 🟢 Desplegado
**Versión**: 1.0.0
**Descripción**: Sistema de entrega de turno médica y de enfermería. Reemplaza el Excel de 32 hojas con datos sincronizados desde ALMA/IRIS.

**Características Principales**:
- Entrega médica organizada por especialidad clínica
- Entrega de enfermería organizada por servicio físico (MQ1, UCI, PED, etc.)
- 10 colecciones desplegadas con 130+ campos
- Campos ZEN sincronizados desde ALMA (signos vitales, dispositivos, insulina)
- 11 roles con permisos granulares
- Firmas digitales saliente/entrante

**Blueprint**: Definido en `app-spec/app.yaml` (sección `entrega:`)
**Documentación**: Ver [ENTREGA/README.md](ENTREGA/README.md)

---

### AGENDA - Agenda Médica Hospitalaria

**Estado**: 🟡 Blueprint definido
**Versión**: 0.1.0
**Descripción**: Sistema de agenda médica hospitalaria. Reemplaza sistema Google Sheets + Apps Script.

**Características Planeadas**:
- Registro de bloques de actividad médica (visita, sala, pabellón, policlínico)
- Control de inasistencias con tipificación
- Resúmenes diarios y semanales auto-generados
- 8 colecciones, 3 roles, 11 páginas UI
- 16 categorías de actividad con códigos de color

**Blueprint**: Definido en `app-spec/app.yaml` (sección `agenda:`)
**Documentación**: Ver [AGENDA/README.md](AGENDA/README.md)

---

### BUHO - Gestión de Pacientes

**Estado**: 🚧 En Desarrollo
**Versión**: 0.1.0
**Descripción**: Sistema de gestión integral de pacientes.

**Características Planeadas**:
- Registro de pacientes
- Historial médico
- Gestión de citas

**Documentación**: Ver [BUHO/README.md](BUHO/README.md)

## Crear Nueva Aplicación

Para crear una nueva aplicación usando el template:

### 1. Copiar Template

```bash
# Copiar template a nueva carpeta
cp -r Apps/_APP_TEMPLATE Apps/NUEVA_APP

cd Apps/NUEVA_APP
```

### 2. Personalizar

Editar los siguientes archivos reemplazando `[NOMBRE_APP]` con el nombre real:

**Archivos a personalizar**:
- [ ] `README.md` - Descripción de la aplicación
- [ ] `CHANGELOG.md` - Historial de cambios
- [ ] `STATUS.md` - Estado del proyecto
- [ ] `.env.example` - Variables de entorno
- [ ] `BD/README_Modelo.md` - Modelo de datos
- [ ] `docs/ARQUITECTURA.md` - Arquitectura
- [ ] Todos los demás archivos markdown que tengan `[NOMBRE_APP]`

**Buscar y reemplazar**:
```bash
# En Linux/Mac
find . -type f -name "*.md" -exec sed -i 's/\[NOMBRE_APP\]/Mi Nueva App/g' {} +

# En Windows (PowerShell)
Get-ChildItem -Recurse -Filter *.md | ForEach-Object {
    (Get-Content $_.FullName) -replace '\[NOMBRE_APP\]', 'Mi Nueva App' | Set-Content $_.FullName
}
```

### 3. Configurar Modelo de Datos

1. **Definir colecciones** en `BD/README_Modelo.md`
2. **Documentar cada colección** en `BD/colecciones/` (usar TEMPLATE_COLECCION.md)
3. **Preparar datos de referencia** en `BD/diccionarios/`
4. **Actualizar diagrama ER** en `BD/README_Modelo.md`

### 4. Configurar Scripts

1. **Actualizar `scripts/configure/configure.ts`** con definiciones de colecciones:
   ```typescript
   const COLLECTIONS: CollectionConfig[] = [
     {
       name: 'mi_coleccion',
       title: 'Mi Colección',
       fields: [
         { name: 'id', type: 'bigInteger', primaryKey: true },
         // ... más campos
       ]
     }
   ];
   ```

2. **Actualizar `scripts/seed/seed-references.ts`** con rutas a archivos de datos:
   ```typescript
   const REFERENCES: ReferenceData[] = [
     {
       collection: 'ref_categorias',
       file: 'BD/diccionarios/categorias.json',
       description: 'Categorías'
     }
   ];
   ```

### 5. Configurar Colecciones en NocoBase

```bash
# Copiar .env.example a .env
cp .env.example .env

# Editar .env con credenciales reales
code .env

# Verificar conexión
node scripts/test/test-connection.ts

# Crear colecciones
node scripts/configure/configure.ts

# Cargar datos de referencia
node scripts/seed/seed-references.ts

# Verificar
node scripts/inspect/list-collections.ts
```

### 6. Desarrollar UI

1. Crear vistas de listado en NocoBase UI
2. Crear formularios de creación/edición
3. Configurar permisos por rol
4. Implementar workflows si es necesario

### 7. Documentar

Completar documentación en `docs/`:
- `ARQUITECTURA.md` - Diseño de arquitectura
- `DISEÑO-UI.md` - Diseño de interfaz
- `DISEÑO-TECNICO.md` - Detalles técnicos
- `MANUAL-USUARIO.md` - Guía para usuarios
- `MANUAL-TECNICO.md` - Guía para administradores
- `TROUBLESHOOTING.md` - Solución de problemas

### 8. Planificar Implementación

Completar archivos en `planificacion/`:
- `PLAN-IMPLEMENTACION.md` - Plan detallado de implementación
- `ROADMAP.md` - Visión a largo plazo
- `SPRINTS.md` - Planificación de sprints

---

## Convenciones

### Nomenclatura de Colecciones

- **Colecciones propias** (read/write): `nombre_tabla`
- **Colecciones de referencia**: `ref_nombre`
- **Colecciones integradas** (ALMA/SIDRA): `alma_nombre`

Ejemplos:
- `casos_oncologicos` - Colección propia
- `ref_especialidades` - Catálogo de especialidades
- `alma_pacientes` - Datos de ALMA (read-only)

### Nomenclatura de Campos

- Minúsculas con guiones bajos: `nombre_campo`
- IDs: `[tabla]_id` (ej: `paciente_id`)
- Fechas: `fecha_[evento]` (ej: `fecha_ingreso`)
- Estados: `estado` o `estado_[contexto]`
- Flags booleanos: `is_[condicion]` (ej: `is_active`)

### Estructura de Scripts

Todos los scripts deben seguir el patrón:

```typescript
import { ApiClient } from '../utils/ApiClient';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const client = new ApiClient();

  try {
    // Lógica del script
    console.log('✅ Completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
```

---

## Recursos Compartidos

Recursos que todas las aplicaciones pueden usar:

### shared/scripts/

- **scripts/**: Scripts compartidos (`ApiClient.ts`, 36 herramientas CLI TypeScript)
- **README.md**: Documentación de la API client

### Variables de Entorno Comunes

Todas las apps comparten estas variables (en raíz del proyecto):

```env
# NocoBase API
NOCOBASE_API_URL=https://nocobase.hospitaldeovalle.cl/api
NOCOBASE_API_TOKEN=tu_token_aqui

# ALMA/SIDRA (si aplica)
SIDRA_HOST=sidra.hospitaldeovalle.cl
SIDRA_PORT=1433
SIDRA_DATABASE=SIDRA
SIDRA_USERNAME=readonly_user
SIDRA_PASSWORD=tu_password_aqui
```

---

## Gestión de Versiones

### Versionado Semántico

Todas las aplicaciones siguen [Semantic Versioning](https://semver.org/):

- **MAJOR**: Cambios incompatibles de API
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de bugs

Ejemplo: `1.2.3`
- `1` = Major version
- `2` = Minor version
- `3` = Patch version

### CHANGELOG

Mantener `CHANGELOG.md` actualizado siguiendo [Keep a Changelog](https://keepachangelog.com/):

```markdown
## [1.2.0] - 2026-01-25
### Added
- Nueva funcionalidad de reportes

### Changed
- Mejorada performance de búsqueda

### Fixed
- Corregido bug en validación de fecha
```

---

## Workflow de Desarrollo

### Branches

- `master` - Producción estable
- `develop` - Desarrollo activo
- `feature/[nombre]` - Nuevas funcionalidades
- `bugfix/[nombre]` - Correcciones de bugs
- `hotfix/[nombre]` - Fixes urgentes en producción

### Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(ugco): agregar vista de casos oncológicos
fix(buho): corregir validación de RUT
docs(readme): actualizar guía de instalación
chore(deps): actualizar dependencias
```

**Tipos**:
- `feat` - Nueva funcionalidad
- `fix` - Corrección de bug
- `docs` - Documentación
- `style` - Formateo (no afecta código)
- `refactor` - Refactorización
- `test` - Tests
- `chore` - Tareas de mantenimiento

### Pull Requests

1. Crear branch desde `develop`
2. Desarrollar feature
3. Crear PR a `develop`
4. Code review
5. Merge después de aprobación

---

## Testing

### Tests por Nivel

1. **Unit Tests**: Funciones individuales
2. **Integration Tests**: APIs y workflows
3. **E2E Tests**: Flujos completos de usuario

### Ejecutar Tests

```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:coverage

# Tests E2E
npm run test:e2e
```

---

## Deployment

### Ambientes

| Ambiente | URL | Propósito |
|----------|-----|-----------|
| Development | localhost:13000 | Desarrollo local |
| Staging | staging.hospitaldeovalle.cl | Pre-producción |
| Production | nocobase.hospitaldeovalle.cl | Producción |

### Proceso de Deploy

Ver [MIRA/docs/DEPLOYMENT.md](../MIRA/docs/DEPLOYMENT.md) para detalles completos.

**Checklist rápido**:
1. [ ] Tests pasando
2. [ ] Code review aprobado
3. [ ] CHANGELOG actualizado
4. [ ] Backup de BD
5. [ ] Migración de BD (si aplica)
6. [ ] Deploy a staging
7. [ ] Smoke tests en staging
8. [ ] Deploy a producción
9. [ ] Verificación post-deploy

---

## Soporte y Contacto

### Equipo de Desarrollo

- **Product Owner**: [Nombre]
- **Tech Lead**: [Nombre]
- **Developers**: [Nombres]
- **QA**: [Nombre]

### Canales de Comunicación

- **Issues**: GitHub Issues
- **Email**: dev@hospitaldeovalle.cl
- **Documentación**: Ver README de cada app

---

## Referencias

- [MIRA README](../MIRA/README.md) - Documentación general del proyecto
- [Template _APP_TEMPLATE](_APP_TEMPLATE/README.md) - Template para nuevas apps
- [UGCO](UGCO/README.md) - Documentación de UGCO
- [ENTREGA](ENTREGA/README.md) - Documentación de ENTREGA
- [AGENDA](AGENDA/README.md) - Documentación de AGENDA
- [BUHO](BUHO/README.md) - Documentación de BUHO
- [NocoBase Docs](https://docs.nocobase.com/) - Documentación oficial de NocoBase
- [CONTRIBUTING](../CONTRIBUTING.md) - Guía de contribución

---

## Changelog de Apps/

### 2026-02-17
- ✅ Agregadas apps ENTREGA y AGENDA a documentación
- ✅ ENTREGA desplegado con 10 colecciones y 11 roles
- ✅ AGENDA blueprint completo definido

### 2026-01-25
- ✅ Creada carpeta Apps/
- ✅ Creado _APP_TEMPLATE/ con estructura completa
- ✅ Migración de UGCO y BUHO a Apps/

---

**Última Actualización**: 2026-02-17
**Mantenido por**: Equipo G_NB_Apps - Hospital de Ovalle
