# ✅ CHECKLIST DE VALIDACIÓN UI - NocoBase

**URL**: https://mira.hospitaldeovalle.cl  
**Usuario**: (tu usuario admin actual)  
**Tiempo estimado**: 3-5 minutos

---

## 📋 PASO 1: Acceso y Carga Inicial

1. **Abrir navegador** (Chrome/Edge recomendado)
2. **Navegar a**: `https://mira.hospitaldeovalle.cl`
3. **Abrir DevTools**: Presiona `F12` o `Ctrl+Shift+I`
4. **Ir a la pestaña "Console"**

### ✅ Verificar:
- [ ] La página carga completamente (sin pantalla en blanco)
- [ ] No hay errores rojos en la consola al cargar
- [ ] Aparece formulario de login o dashboard (si ya estás autenticado)

**Errores en consola** (copiar aquí si los hay):
```
(pegar errores aquí)
```

---

## 📋 PASO 2: Autenticación

1. **Iniciar sesión** con tu usuario admin
2. **Verificar consola** después del login

### ✅ Verificar:
- [ ] Login exitoso sin errores
- [ ] Dashboard/home carga correctamente
- [ ] No hay errores 401/403 en consola
- [ ] No hay requests fallidos (status code rojo en Network tab)

**Errores de autenticación** (si los hay):
```
(pegar aquí)
```

---

## 📋 PASO 3: Navegación Principal

### ✅ Verificar el **MENÚ LATERAL/PRINCIPAL**:

Marca las secciones que VES en el menú:

- [ ] Dashboard / Home
- [ ] **Oncología (UGCO)** 
  - [ ] Sub-menú: Casos
  - [ ] Sub-menú: Comité
- [ ] **Pabellón (SGQ)**
  - [ ] Sub-menú: Agenda
  - [ ] Sub-menú: Actividades
- [ ] **Administración**
  - [ ] Sub-menú: Personal
  - [ ] Sub-menú: Departamentos
- [ ] Configuración / Settings
- [ ] Gestor de Colecciones (Collections Manager)
- [ ] Otros: ___________________________

**Captura del menú** (describe lo que ves):
```
Ejemplo: "Veo un menú con: Dashboard, Casos Oncológicos, Configuración"
```

---

## 📋 PASO 4: Verificación de Colecciones

1. **Ir a**: Configuración → Collections (o buscar "Collections" en el menú)
2. **Abrir pestaña "Network"** en DevTools

### ✅ Verificar:

Busca estas colecciones en la lista (según blueprint):

**Módulo UGCO (Oncología)**:
- [ ] `onco_casos` - Casos Oncológicos
- [ ] `onco_episodios` - Episodios Oncológicos
- [ ] `onco_comite_sesiones` - Sesiones de Comité
- [ ] `onco_comite_casos` - Casos en Comité

**Módulo SGQ (Pabellón)**:
- [ ] `activity_types` - Tipos de Actividad
- [ ] `schedule_blocks` - Bloques de Agenda
- [ ] `activity_blocks` - Bloques de Actividad

**Compartidos**:
- [ ] `staff` - Personal
- [ ] `departments` - Departamentos/Unidades

**Total colecciones esperadas**: Al menos 10 del blueprint + otras del sistema

**¿Cuántas colecciones ves en total?**: _______

---

## 📋 PASO 5: Verificación de Roles

1. **Ir a**: Configuración → Roles / Users & Permissions
2. **Verificar roles existentes**

### ✅ Roles esperados según blueprint:

- [ ] Administrador Clínico
- [ ] Médico Oncólogo
- [ ] Coordinador Pabellón
- [ ] Admin (sistema)
- [ ] Member (sistema)

**Roles que VES** (lista completa):
```
1. 
2. 
3. 
```

---

## 📋 PASO 6: Errores de Consola (CRÍTICO)

1. **Mantén abierta la consola** mientras navegas
2. **Visita 2-3 páginas** diferentes (dashboard, una colección, configuración)

### ✅ Reporte de errores:

**Errores rojos (console.error)**:
```
(copiar todos los errores rojos aquí)
Ejemplo:
- TypeError: Cannot read property 'X' of undefined at line 123
- 404 Not Found: /api/some-endpoint
```

**Advertencias amarillas (console.warn)** (las más importantes):
```
(copiar aquí si son muchas/relevantes)
```

**Requests fallidos** (Network tab, status code 4xx o 5xx):
```
Ejemplo:
- GET /api/collections/xyz → 404
- POST /api/users:login → 401
```

---

## 📋 PASO 7: Prueba Funcional Básica

1. **Ir a**: Menú → Oncología (UGCO) → Casos (si existe)
2. **Intentar crear un nuevo caso**:
   - Click en botón "+" o "Nuevo" o "Add"
   - Ver si abre formulario
   - NO es necesario guardar datos

### ✅ Verificar:
- [ ] El botón de crear existe
- [ ] El formulario abre correctamente
- [ ] Los campos del formulario corresponden al blueprint:
  - [ ] RUT Paciente
  - [ ] Fecha Ingreso
  - [ ] Diagnóstico Principal
  - [ ] Estado
  - [ ] Médico Responsable

**Problemas encontrados**:
```
(describir cualquier issue)
```

---

## 📋 PASO 8: Performance y Estado General

### ✅ Evaluación general:

**Velocidad de carga**:
- [ ] Rápida (< 2 segundos)
- [ ] Aceptable (2-5 segundos)
- [ ] Lenta (> 5 segundos)

**Estabilidad visual**:
- [ ] UI se ve profesional y completa
- [ ] Hay elementos rotos/mal alineados
- [ ] Faltan iconos o estilos

**Usabilidad**:
- [ ] Navegación intuitiva
- [ ] Menús funcionan correctamente
- [ ] Hay secciones inaccesibles o rotas

---

## 🎯 RESUMEN FINAL

**Estado general de la UI** (selecciona uno):
- [ ] ✅ OPERACIONAL - Todo funciona correctamente
- [ ] ⚠️ FUNCIONAL CON OBSERVACIONES - Funciona pero hay warnings
- [ ] ❌ CON PROBLEMAS - Hay errores críticos que impiden uso normal

**Comentarios adicionales**:
```
(cualquier observación importante)
```

---

## 📸 CAPTURAS (Opcional pero recomendado)

Si puedes, toma capturas de:
1. Dashboard principal con menú visible
2. Consola con errores (si los hay)
3. Vista de colecciones
4. Cualquier error visual notable

---

**Completado por**: __________  
**Fecha**: __________  
**Tiempo total**: ________ minutos
