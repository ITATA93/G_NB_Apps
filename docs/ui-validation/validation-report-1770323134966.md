
# 🌐 Reporte de Validación UI - NocoBase

**Fecha**: 2026-02-05T20:25:27.879Z  
**URL**: https://mira.hospitaldeovalle.cl

---

## 📊 Resumen

| Métrica | Valor |
|---------|-------|
| **UI Cargada** | ✅ Sí |
| **Funcional** | ⚠️ Requiere Login |
| **Errores de Consola** | 6 |
| **Advertencias** | 3 |
| **Fallos de Red** | 2 |

---

## ❌ Errores de Consola (6)

1. `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
2. `O`
3. `Error calling global variable function for key: $env TypeError: Cannot read properties of undefined (reading 'data')
    at $ (https://mira.hospitaldeovalle.cl/static/plugins/@nocobase/plugin-environment-variables/dist/client/index.js?version=1.9.14&t=1764180046000:10:15747)
    at f (https://mira.hospitaldeovalle.cl/p__index.dc570262.async.js:9:24042)
    at W (https://mira.hospitaldeovalle.cl/p__index.dc570262.async.js:1815:35797)
    at b (https://mira.hospitaldeovalle.cl/p__index.dc570262.async.js:1815:29339)
    at Di (https://mira.hospitaldeovalle.cl/umi.43d125b9.js:54:20361)
    at wc (https://mira.hospitaldeovalle.cl/umi.43d125b9.js:56:44653)
    at Rc (https://mira.hospitaldeovalle.cl/umi.43d125b9.js:56:40310)
    at tf (https://mira.hospitaldeovalle.cl/umi.43d125b9.js:56:40282)
    at Cc (https://mira.hospitaldeovalle.cl/umi.43d125b9.js:56:35197)
    at N (https://mira.hospitaldeovalle.cl/umi.43d125b9.js:56:90665)`
4. `Failed to load resource: the server responded with a status of 401 (Unauthorized)`
5. `O`
6. `Error calling global variable function for key: $env TypeError: Cannot read properties of undefined (reading 'data')
    at $ (https://mira.hospitaldeovalle.cl/static/plugins/@nocobase/plugin-environment-variables/dist/client/index.js?version=1.9.14&t=1764180046000:10:15747)
    at f (https://mira.hospitaldeovalle.cl/p__index.dc570262.async.js:9:24042)
    at W (https://mira.hospitaldeovalle.cl/p__index.dc570262.async.js:1815:35797)
    at b (https://mira.hospitaldeovalle.cl/p__index.dc570262.async.js:1815:29339)
    at Di (https://mira.hospitaldeovalle.cl/umi.43d125b9.js:54:20361)
    at nl (https://mira.hospitaldeovalle.cl/umi.43d125b9.js:56:3138)
    at wc (https://mira.hospitaldeovalle.cl/umi.43d125b9.js:56:45427)
    at Rc (https://mira.hospitaldeovalle.cl/umi.43d125b9.js:56:40310)
    at ef (https://mira.hospitaldeovalle.cl/umi.43d125b9.js:56:40238)
    at Hu (https://mira.hospitaldeovalle.cl/umi.43d125b9.js:56:40092)`

---

## ⚠️ Advertencias (3)

1. `[NocoBase] @nocobase/plugin-mobile is deprecated and may be removed in future versions. Please migrate to the new mobile solution.`
2. `⚠️ React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7. You can use the `v7_startTransition` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_starttransition.`
3. `⚠️ React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7. You can use the `v7_relativeSplatPath` future flag to opt-in early. For more information, see https://reactrouter.com/v6/upgrading/future#v7_relativesplatpath.`

---

## 🔴 Fallos de Red (2)

1. **401** Unauthorized - `https://mira.hospitaldeovalle.cl/api/auth:check`
2. **401** Unauthorized - `https://mira.hospitaldeovalle.cl/api/roles:check`

---

## 🧭 Elementos del Menú (0)

_No extraído_

---

## 📦 Colecciones Detectadas (0)

_No extraído_

---

## 📸 Capturas de Pantalla

1. `docs\ui-validation\screenshots\01-initial-load.png`
2. `docs\ui-validation\screenshots\02-login-form.png`

---

**Reporte completo (JSON)**: `docs\ui-validation\validation-report-1770323134965.json`
