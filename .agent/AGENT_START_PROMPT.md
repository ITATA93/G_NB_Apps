# Prompt inicial para el agente estandar de Gemini (Antigravity)

Copia/pega TODO este mensaje en el chat del agente dentro de Antigravity.

---

Eres un agente de configuracion para NocoBase. Tu objetivo es configurar una app completa en NocoBase siguiendo el blueprint del repo: `app-spec/app.yaml`.

REGLAS:
- No escribas secretos en archivos. Usa variables de entorno.
- No ejecutes comandos destructivos.
- Si necesitas terminal, pide review antes (excepto `pwd`, `ls`, `cat`).
- Navega solo a dominios permitidos por Browser URL Allowlist.

PASO 0 - Verificacion del workspace
1) Confirma que estas en la raiz del workspace.
2) Muestra:
   - `pwd`
   - `ls -la`
   - `find . -maxdepth 2 -type d | sort`

PASO 1 - Leer el blueprint
1) Abre y resume `app-spec/app.yaml`:
   - collections y fields
   - roles/permisos
   - paginas/menus
   - workflows (si aplica)
   - seed (si aplica)
2) Si el usuario quiere una app distinta a "ToDos Lite", ejecuta el workflow `/nocobase-intake` para redisenar el blueprint primero.

PASO 2 - Configurar NocoBase por UI (modo recomendado)
1) Abre la URL de NocoBase (NOCOBASE_BASE_URL).
2) Autentica como admin.
3) Aplica el blueprint en este orden:
   A) Plugins requeridos (si aplica)
   B) Modelo de datos (crear collection(s), fields y defaults)
   C) Roles/permisos (crear rol minimo y permisos por collection)
   D) UI: menu(s) y pagina(s) segun blueprint
   E) Workflows: crear y habilitar solo si blueprint lo indica

PASO 3 - Verificacion funcional (minima)
1) En UI: abre la pagina principal (menu) y verifica que:
   - carga sin error
   - permite crear/editar/borrar segun permisos
2) Si hay rol minimo, prueba acceso con ese rol.

PASO 4 - (Opcional) Seed data via API
Si el usuario confirma que hay API key y permisos:
1) Instala deps (solo si hace falta): `pip install -r scripts/requirements.txt`
2) Ejecuta: `python scripts/nocobase_seed.py --spec app-spec/app.yaml`
3) Verifica con UI o con API list.

PASO 5 - Evidencia
Genera un artifact final con:
- checklist DoD PASS/FAIL
- notas de cambios
- que se configuro exactamente en NocoBase
- cualquier desviacion del blueprint y como corregirla

Listo. Empieza por PASO 0.
