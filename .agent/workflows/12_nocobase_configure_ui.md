---
name: nocobase-configure-ui
description: Aplicar app-spec/app.yaml configurando NocoBase desde la UI (browser agent) con validación funcional.
---

# Workflow: nocobase-configure-ui

## Objetivo
Aplicar app-spec/app.yaml configurando NocoBase desde la UI con validación
funcional completa — no solo que "la página abra", sino que los flujos de usuario funcionen.

## Pre-requisitos
- Leer `docs/standards/nocobase-page-block-deployment.md` ANTES de crear páginas
- Verificar que `functional_spec` existe en el app.yaml para el módulo a configurar
- Si `functional_spec` no existe, DETENER y generarla primero (workflow 10/11)

## Pasos

### 1) Validar Entorno
- Browser URL Allowlist contiene el dominio correcto
- Conexión a NocoBase verificada (login exitoso)
- Credenciales NO guardadas en repositorio

### 2) Análisis Funcional Pre-Deploy
Antes de tocar NocoBase, leer del app.yaml:
- `functional_spec.page_specs` → Qué bloques van en cada página
- `functional_spec.user_journeys` → Qué flujos deben funcionar end-to-end
- `functional_spec.state_machines` → Qué transiciones configurar en workflows
- `functional_spec.business_rules` → Qué validaciones implementar

### 3) Configurar en Orden
a) Plugins requeridos (si hay permisos/licencia)
b) Modelo de datos (collections y fields)
c) Roles/permisos
d) UI según `page_specs`:
   - Crear menús con jerarquía del blueprint
   - Crear páginas con los bloques especificados
   - Configurar data scopes y filtros
   - Configurar acciones por fila (drawers, modals)
   - Configurar formularios de detalle con secciones
   - Configurar acciones bulk
e) Workflows según `state_machines` y `business_rules`

### 4) Verificación Funcional (EXPANDIDA)

#### 4a) Verificación Estructural (mínima)
- [ ] Cada page_key del blueprint tiene página visible en NocoBase
- [ ] Menús reflejan la jerarquía del blueprint
- [ ] Roles ven solo las páginas autorizadas

#### 4b) Verificación de Composición de Página
- [ ] Cada página tiene los bloques especificados en `page_specs`
- [ ] Tablas muestran las columnas correctas con el orden correcto
- [ ] Data scopes filtran correctamente (verificar con datos reales o seed)
- [ ] Filtros en la barra superior funcionan

#### 4c) Verificación de Interacciones
- [ ] Click en fila abre drawer/modal según `row_actions`
- [ ] Drawer/modal muestra las secciones correctas (read-only vs editable)
- [ ] Formularios de edición guardan correctamente
- [ ] Acciones bulk (botones masivos) funcionan

#### 4d) Verificación de User Journeys
- [ ] Para cada user_journey en `functional_spec`:
  - Completar el flujo paso a paso
  - Verificar cada `expects` y `postcondition`
  - Documentar cualquier desviación

#### 4e) Verificación de Reglas de Negocio
- [ ] State machines: verificar transiciones válidas e inválidas
- [ ] Business rules: verificar validaciones (ej: no firmar sin completar)
- [ ] Permisos por rol: verificar que cada rol ve/hace lo declarado

### 5) Registrar Evidencia
- Checklist DoD PASS/FAIL por cada categoría de verificación
- Captura de cada página desplegada (screenshot o descripción)
- User journeys verificados con resultado
- Desviaciones y workarounds documentados
