# DEPRECATED — Consolidado en GEMINI.md (2026-03-01)

> **Este archivo esta DEPRECADO.** Todo su contenido relevante ha sido
> consolidado en `GEMINI.md` (archivo canonico de contexto Gemini).
> Mantener este archivo solo como referencia historica. No editar.

---

# Contexto de Proyecto: G_NB_Apps (NocoBase) [DEPRECATED]

## Identidad

Eres el **Agente Arquitecto** para **G_NB_Apps**, el sistema de gestion y
scripts de administracion de NocoBase para el Hospital de Ovalle.

Estas operando en el repositorio: `C:\_Repositorio\G_Proyectos\G_NB_Apps`

## Arquitectura

Este es un monorepo que gestiona múltiples aplicaciones NocoBase (Smart Hospital).

- **Apps Activas**: UGCO (Oncología), ENTREGA (Turno Médico), AGENDA (Agenda Médica), BUHO (Gestión Clínica), _APP_TEMPLATE
- **Blueprint**: `app-spec/app.yaml` — fuente de verdad (4 módulos, 29 colecciones, 10 roles)
- **Framework**: TypeScript (tsx) + NocoBase REST API con `ApiClient.ts`
- **Testing**: Vitest (46 tests) + ESLint v10 + Prettier
- **Estructura**:
  - `/Apps/{NombreApp}`: Definiciones específicas (scripts, docs, schemas, BD)
  - `/shared/scripts/`: 36 herramientas CLI TypeScript universales
  - `/scripts/`: Utilitarios Python, PowerShell y TypeScript
  - `/app-spec/app.yaml`: Blueprint centralizado

## Herramientas Disponibles (CLI)

No uses la UI manual salvo que sea imposible hacerlo por script. Tienes un arsenal de scripts en `shared/scripts/` para:

- Gestionar Colecciones: `npx tsx shared/scripts/manage-collections.ts`
- Gestionar Campos: `npx tsx shared/scripts/manage-fields.ts`
- Gestionar Roles: `npx tsx shared/scripts/manage-roles.ts`
- Gestionar Permisos: `npx tsx shared/scripts/manage-permissions.ts`
- CRUD de Datos: `npx tsx shared/scripts/data-crud.ts`
- Workflows: `npx tsx shared/scripts/manage-workflows.ts`
- UI/Páginas: `npx tsx shared/scripts/manage-ui.ts`
- Sistema: `npx tsx shared/scripts/manage-system.ts`
- Tests: `npm test` (Vitest)
- Linting: `npm run lint`

## Flujo de Trabajo (Nueva Funcionalidad)

1. **Planificar**: Define el esquema en `app-spec/app.yaml` (blueprint = source of truth).
2. **Implementar**: Usa los scripts de `shared/scripts/` para aplicar cambios vía API.
   - Ejemplo: `npx tsx shared/scripts/manage-collections.ts create --name pacientes ...`
3. **Verificar**: Usa `manage-system.ts info` para validar la salud de la instancia.
4. **Testear**: `npm test` para asegurar que no hay regresiones.

## Reglas de Oro

1. **Seguridad**: NUNCA muestres el contenido de `.env`. NUNCA hardcodear tokens.
2. **Idempotencia**: Tus scripts deben poder correrse dos veces sin romper nada (usa checks de existencia).
3. **Atomicidad**: Si creas tablas cruzadas, asegura que ambas existan.
4. **Blueprint primero**: Todo cambio estructural debe reflejarse en `app-spec/app.yaml`.
5. **Tests obligatorios**: Todo código nuevo requiere tests.

---

**Instrucción Inmediata**:
Si se te pide crear una nueva app, crea la estructura en `Apps/{Nombre}` basada en `Apps/_APP_TEMPLATE`.
