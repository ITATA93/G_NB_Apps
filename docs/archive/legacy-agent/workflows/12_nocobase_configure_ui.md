---
name: nocobase-configure-ui
description: Aplicar app-spec/app.yaml configurando NocoBase desde la UI (browser agent).
---

# Workflow: nocobase-configure-ui

## Objetivo
Aplicar app-spec/app.yaml configurando NocoBase desde la UI con evidencia.

## Pasos
1) Validar Browser URL Allowlist contiene el dominio correcto.
2) Abrir NocoBase y autenticar (sin guardar credenciales en repo).
3) Configurar en orden:
   a) Plugins requeridos (si hay permisos/licencia)
   b) Modelo de datos (collections y fields)
   c) Roles/permisos
   d) UI (menus y paginas)
   e) Workflows (si aplica)
4) Verificar:
   - pagina principal abre y lista datos
   - rol minimo ve lo esperado
5) Registrar evidencia (artifact con checklist detallado).
