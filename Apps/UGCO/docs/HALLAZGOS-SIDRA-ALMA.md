# Hallazgos: Conexión SIDRA-ALMA para UGCO

**Fecha**: 21 de noviembre de 2025
**Análisis**: Inspección completa de NocoBase y plugin SQL

---

## 🎯 Resumen Ejecutivo

He encontrado el puente entre NocoBase y ALMA (TrakCare):

✅ **Data Source encontrado**: **SIDRA**
- Key: `d_llw3u3ya2ej`
- Tipo: **SQL Server (mssql)**
- Base de datos: `DB_SIDRA_TEST`
- Estado: ⚠️ **DESHABILITADO** (enabled: false)

✅ **20 colecciones SQL encontradas** conectadas a SIDRA
- Incluye datos de pacientes, episodios, diagnósticos y **ONCOLOGÍA**

---

## 📊 Colecciones SIDRA Disponibles (20 totales)

### 🎗️ Oncología (CRÍTICAS para UGCO):
1. **H_Oncologia** - Datos oncológicos principales
2. **H_Oncologia2** - Datos oncológicos adicionales

### 👤 Pacientes:
3. **Ficha_Clinica** - Datos demográficos pacientes
4. **Admision_Pacientes** - Admisiones hospitalarias
5. **Admision_Ubicacion** - Ubicación de pacientes
6. **Episodios** - Episodios clínicos

### 🏥 Diagnósticos:
7. **H_Diagnostico** - Diagnósticos clínicos
8. **H_CIE10** - Códigos CIE-10

### 💊 Farmacia:
9. **H_Farmacos** - Medicamentos
10. **H_Categoria_Farmacologica** - Categorías farmacológicas
11. **H_Forma_Droga** - Formas farmacéuticas
12. **H_Copago_CEro** - Copagos

### 🚑 Urgencias y otros:
13. **H_AdmisionUrgencia** - Admisiones de urgencia
14. **H_GDA** - GDA (Gestión de Atención)
15. **H_GDA_ALMA** - GDA conectado a ALMA
16. **H_CodigoMAI** - Códigos MAI

### 📋 Catálogos:
17. **Ciudad** - Ciudades
18. **Establecimiento** - Establecimientos de salud
19. **Estado_Conyugal** - Estados conyugales
20. **CAMBIOS$** - Registro de cambios

---

## ⚠️ PROBLEMA CRÍTICO: SIDRA Está Deshabilitado

El data source SIDRA tiene:
```json
{
  "key": "d_llw3u3ya2ej",
  "displayName": "SIDRA",
  "type": "mssql",
  "enabled": false,  // ← PROBLEMA: DESHABILITADO
  "options": {
    "database": "DB_SIDRA_TEST"
  }
}
```

### ¿Por qué está deshabilitado?

Posibles razones:
1. **En mantenimiento** - Temporalmente desactivado
2. **En pruebas** - Aún no está en producción
3. **Problema de conexión** - No puede conectar a la BD
4. **Deshabilitado intencionalmente** - Esperando configuración

---

## 🔍 Cómo Inspeccionar con Chrome DevTools

Ya que solo tienes acceso a las consultas (no a la base directamente) y SIDRA está deshabilitado, necesitas usar Chrome DevTools para ver más información.

### Paso 1: Abrir NocoBase

```
https://nocobase.hospitaldeovalle.cl/
```

Inicia sesión como usuario "Matias" (rol: root).

### Paso 2: Abrir Chrome DevTools

Presiona **F12** o clic derecho → "Inspeccionar"

### Paso 3: Ir a la Consola

Haz clic en la pestaña **"Console"**

### Paso 4: Ejecutar Estos Comandos

#### Ver el Data Source SIDRA completo:

```javascript
fetch("https://nocobase.hospitaldeovalle.cl/api/dataSources:get?filterByTk=d_llw3u3ya2ej", {
  headers: {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGVOYW1lIjoicm9vdCIsImlhdCI6MTc2MzczNjAzMywiZXhwIjozMzMyMTMzNjAzM30.e2ykXt1VZiHilmOsVKVMvHTtFlW1bGpSPU_nxMYInMI"
  }
})
.then(r => r.json())
.then(d => {
  console.log("=== SIDRA DATA SOURCE ===");
  console.log(d);
  return d;
})
```

#### Ver las 20 colecciones de SIDRA:

```javascript
fetch("https://nocobase.hospitaldeovalle.cl/api/d_llw3u3ya2ej/collections:list", {
  headers: {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGVOYW1lIjoicm9vdCIsImlhdCI6MTc2MzczNjAzMywiZXhwIjozMzMyMTMzNjAzM30.e2ykXt1VZiHilmOsVKVMvHTtFlW1bGpSPU_nxMYInMI"
  }
})
.then(r => r.json())
.then(d => {
  console.log("=== COLECCIONES SIDRA ===");
  console.log(d);
  return d;
})
```

#### Ver detalle de H_Oncologia:

```javascript
fetch("https://nocobase.hospitaldeovalle.cl/api/d_llw3u3ya2ej/collections:get?filterByTk=H_Oncologia", {
  headers: {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGVOYW1lIjoicm9vdCIsImlhdCI6MTc2MzczNjAzMywiZXhwIjozMzMyMTMzNjAzM30.e2ykXt1VZiHilmOsVKVMvHTtFlW1bGpSPU_nxMYInMI"
  }
})
.then(r => r.json())
.then(d => {
  console.log("=== H_ONCOLOGIA ===");
  console.log(d);
  console.log("\nCampos:", d.data.fields);
  return d;
})
```

#### Ver detalle de Ficha_Clinica:

```javascript
fetch("https://nocobase.hospitaldeovalle.cl/api/d_llw3u3ya2ej/collections:get?filterByTk=Ficha_Clinica", {
  headers: {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsInJvbGVOYW1lIjoicm9vdCIsImlhdCI6MTc2MzczNjAzMywiZXhwIjozMzMyMTMzNjAzM30.e2ykXt1VZiHilmOsVKVMvHTtFlW1bGpSPU_nxMYInMI"
  }
})
.then(r => r.json())
.then(d => {
  console.log("=== FICHA_CLINICA ===");
  console.log(d);
  console.log("\nCampos:", d.data.fields);
  return d;
})
```

### Paso 5: Copiar los Resultados

Después de ejecutar cada comando:
1. Haz clic derecho en el resultado JSON en la consola
2. Selecciona "Copy object" o "Copiar objeto"
3. Pégalo en un archivo de texto
4. Compártelo conmigo

---

## 🚀 Próximos Pasos Recomendados

### Opción A: Habilitar SIDRA (RECOMENDADO)

Si SIDRA está deshabilitado por mantenimiento o pruebas:

1. **Navegar en NocoBase** a:
   - Configuración → Data Sources → SIDRA

2. **Habilitar el data source**:
   - Cambiar `enabled: false` → `enabled: true`
   - Guardar cambios

3. **Probar conexión**:
   - Verificar que conecta a `DB_SIDRA_TEST`
   - Probar una consulta simple

### Opción B: Crear Nuevo Data Source (ALTERNATIVA)

Si SIDRA no se puede habilitar, crear uno nuevo:

1. **Crear nuevo data source** en NocoBase:
   - Nombre: "ALMA" o "TrakCare"
   - Tipo: SQL Server (mssql)
   - Apuntar a la misma BD: `DB_SIDRA_TEST`

2. **Importar las colecciones necesarias**:
   - H_Oncologia
   - H_Oncologia2
   - Ficha_Clinica
   - Episodios
   - H_Diagnostico

### Opción C: Trabajar con SIDRA Deshabilitado (TEMPORAL)

Mientras se habilita SIDRA:

1. **Crear colecciones en base principal** (main):
   - Copiar estructura de H_Oncologia manualmente
   - Crear `onco_casos` como colección escribible
   - Crear relaciones cuando SIDRA esté habilitado

---

## 📋 Información para Compartir

Para que pueda continuar ayudándote, necesito que me compartas vía Chrome DevTools:

### CRÍTICO:
1. ✅ **Detalle completo de H_Oncologia** (campos, tipos, relaciones)
2. ✅ **Detalle completo de H_Oncologia2** (campos, tipos, relaciones)
3. ✅ **Detalle completo de Ficha_Clinica** (datos demográficos)
4. ✅ **Detalle completo de Episodios** (episodios clínicos)

### IMPORTANTE:
5. ⚠️ **Estado de SIDRA** (por qué está deshabilitado, se puede habilitar)
6. ⚠️ **Permisos** (¿puedes habilitar SIDRA tú mismo?)

### OPCIONAL (pero útil):
7. 📄 **Datos de muestra** (1-2 registros de H_Oncologia, si es posible)
8. 📊 **Estadísticas** (¿cuántos registros hay en cada colección?)

---

## 💡 Estrategia de Implementación

Una vez que tengamos acceso a las colecciones SIDRA, la estrategia será:

### 1. COLECCIONES READ-ONLY (desde SIDRA/ALMA):
```
┌─────────────────────────────────────────┐
│  H_Oncologia (SIDRA)                    │
│  - Datos oncológicos de ALMA            │
│  - READ ONLY                            │
└─────────────────────────────────────────┘
        ↓ (relación)
┌─────────────────────────────────────────┐
│  Ficha_Clinica (SIDRA)                  │
│  - Datos demográficos pacientes         │
│  - READ ONLY                            │
└─────────────────────────────────────────┘
        ↓ (relación)
┌─────────────────────────────────────────┐
│  Episodios (SIDRA)                      │
│  - Episodios clínicos                   │
│  - READ ONLY                            │
└─────────────────────────────────────────┘
```

### 2. COLECCIONES READ-WRITE (en base principal):
```
┌─────────────────────────────────────────┐
│  onco_casos (MAIN)                      │
│  - Gestión de casos UGCO                │
│  - READ/WRITE                           │
│  - Relación a H_Oncologia               │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  onco_comite_sesiones (MAIN)            │
│  - Sesiones del comité oncológico       │
│  - READ/WRITE                           │
└─────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────┐
│  onco_seguimiento (MAIN)                │
│  - Seguimiento de pacientes             │
│  - READ/WRITE                           │
└─────────────────────────────────────────┘
```

### 3. FLUJO DE DATOS:
```
ALMA/TrakCare
      ↓
  DB_SIDRA_TEST
      ↓
  SIDRA (Data Source)
      ↓
  H_Oncologia, Ficha_Clinica, Episodios (READ-ONLY)
      ↓
  NocoBase Main DB
      ↓
  onco_casos, onco_comite_sesiones (READ-WRITE)
      ↓
  Interfaz UGCO
```

---

## 🎯 Acciones Inmediatas

### TÚ (Matias):
1. ✅ Abrir Chrome DevTools en NocoBase
2. ✅ Ejecutar los comandos JavaScript de arriba
3. ✅ Copiar y compartir los JSON resultantes
4. ⚠️ Verificar si puedes habilitar SIDRA o necesitas ayuda de IT

### YO (Claude):
1. ⏳ Esperar los JSON con detalles de colecciones
2. ⏳ Analizar estructura de H_Oncologia y Ficha_Clinica
3. ⏳ Crear el modelo de datos completo para UGCO
4. ⏳ Generar scripts para crear colecciones y relaciones

---

## 📁 Archivos Generados

He creado estos reportes durante la inspección:

1. **[test-api-capabilities.js](C:\GIT\MIRA\UGCO\scripts\test-api-capabilities.js)**
   Script que prueba capacidades API (ejecutable)

2. **[inspect-sql-plugin.js](C:\GIT\MIRA\UGCO\scripts\inspect-sql-plugin.js)**
   Script que inspecciona plugins SQL

3. **[inspect-sidra-datasource.js](C:\GIT\MIRA\UGCO\scripts\inspect-sidra-datasource.js)**
   Script que inspecciona SIDRA en detalle

4. **[inspect-sidra-collections-detail.js](C:\GIT\MIRA\UGCO\scripts\inspect-sidra-collections-detail.js)**
   Script que inspecciona cada colección (bloqueado por SIDRA deshabilitado)

5. **[api-capabilities-report.json](C:\GIT\MIRA\UGCO\docs\arquitectura\api-capabilities-report.json)**
   Reporte completo de capacidades API

6. **[sql-plugin-report.json](C:\GIT\MIRA\UGCO\docs\arquitectura\sql-plugin-report.json)**
   Reporte de plugins SQL

7. **[sidra-datasource-report.json](C:\GIT\MIRA\UGCO\docs\arquitectura\sidra-datasource-report.json)**
   Reporte de SIDRA data source

8. **[HALLAZGOS-SIDRA-ALMA.md](C:\GIT\MIRA\UGCO\docs\HALLAZGOS-SIDRA-ALMA.md)** ← Este archivo
   Resumen ejecutivo de hallazgos

---

## ❓ Preguntas Frecuentes

### ¿Por qué SIDRA está deshabilitado?
No lo sé aún. Necesitas verificarlo en NocoBase o con el equipo de IT.

### ¿Puedo usar las colecciones aunque SIDRA esté deshabilitado?
No. Mientras esté deshabilitado, las colecciones no funcionarán.

### ¿Qué pasa si no puedo habilitar SIDRA?
Podemos crear un nuevo data source o trabajar copiando la estructura manualmente.

### ¿Los datos de H_Oncologia son de producción?
No lo sé. El nombre de la BD es `DB_SIDRA_TEST`, lo que sugiere que es un entorno de pruebas.

### ¿Puedo modificar datos en las colecciones SIDRA?
**NO DEBES**. Las colecciones SIDRA son READ-ONLY. Los datos maestros están en ALMA/TrakCare.

---

## 🎉 Resumen de lo que SÍ Sabemos

✅ NocoBase está funcionando
✅ Tienes permisos completos (rol: root)
✅ API funciona perfectamente
✅ Plugin SQL instalado y funcionando
✅ Data Source SIDRA existe
✅ 20 colecciones ALMA disponibles
✅ Incluye H_Oncologia y H_Oncologia2
✅ Incluye Ficha_Clinica y Episodios
✅ Incluye H_Diagnostico y H_CIE10

⚠️ SIDRA está deshabilitado (pero sabemos dónde está)
⚠️ Necesitamos ver el esquema de las colecciones

---

**Siguiente paso**: Ejecuta los comandos de Chrome DevTools y comparte los resultados 🚀
