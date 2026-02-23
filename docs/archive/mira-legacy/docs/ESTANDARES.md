# Estructura del Proyecto MIRA - NocoBase

**Fecha de reorganización**: 2025-11-21

---

## 📂 Estructura Actual

```
C:/GIT/MIRA/
├── .env                        # Configuración compartida (NocoBase API)
├── .env.example                # Plantilla de configuración
├── .gitignore                  # Archivos ignorados por Git
├── README.md                   # Documentación principal del proyecto
├── ESTRUCTURA-PROYECTO.md      # Este archivo
│
├── shared/                 # ⭐ Recursos transversales (ex _compartido)
│   ├── README.md
│   ├── scripts/
│   │   ├── _base-api-client.js     # Cliente API NocoBase
│   │   └── README.md
│
├── docs/                       # Documentación transversal
│   ├── ESTANDARES.md           # Este archivo
│   ├── TROUBLESHOOTING.md      # Registro de errores (ex ERRORES-Y-SOLUCIONES)
│   └── ARQUITECTURA.md         # Arquitectura general
│
│
└── UGCO/                       # ⭐ Aplicación: Unidad Gestión Casos Oncológicos
    ├── README.md
    ├── README.md
    │
    ├── BD/                     # Definiciones de tablas (18 archivos .md)
    │   ├── README_UGCO_Modelo.md
    │   ├── RESUMEN-TABLAS-BD.md
    │   ├── REF_*.md            # 7 tablas de referencia
    │   └── UGCO_*.md           # 11 tablas operacionales
    │
    ├── docs/                   # Documentación específica UGCO
    │   ├── api/
    │   ├── arquitectura/
    │   ├── diccionarios/
    │   ├── modelo-datos/
    │   ├── DIAGNOSTICO-COMPLETO.md
    │   ├── HALLAZGOS-SIDRA-ALMA.md
    │   ├── RESUMEN-CAPACIDADES-API.md
    │   ├── RESUMEN-EJECUTIVO.md    # 📄 Movido desde raíz
    │   ├── CHANGELOG.md            # 📄 Movido desde raíz
    │   └── prompt-design.txt       # 📄 Diseño de prompts (ex Promp.txt)
    │
    ├── planificacion/          # Plan de implementación
    │   └── PLAN-IMPLEMENTACION.md
    │
    └── scripts/                # Scripts específicos de UGCO
        ├── README.md
        ├── test-connection.js
        ├── list-all-collections-fixed.js
        ├── inspect-datasources.js
        ├── delete-empty-collections.js
        ├── utils/                  # 🛠️ Utilidades (scripts .bat, etc)
        └── [otros scripts...]
```

---

## 🎯 Principios de Organización

### **1. Recursos Compartidos (`shared/`)**

**Contenido:**
- Cliente API de NocoBase
- Registro de errores de API
- Utilidades reutilizables

**Regla:**
- ✅ **SÍ** agregar: Código/docs que sirven para TODAS las apps NocoBase
- ❌ **NO** agregar: Código específico de una app

**Ejemplo de uso:**
```javascript
// Desde cualquier app
const { createClient } = require('../../shared/scripts/_base-api-client');
```

---

### **2. Aplicaciones Específicas (`UGCO/`, futuras apps)**

**Estructura típica de una app:**
```
AppName/
├── README.md               # Docs de la app
├── BD/                     # Definiciones de tablas
├── docs/                   # Documentación específica
├── scripts/                # Scripts específicos
└── planificacion/          # Planes y roadmap
```

**Regla:**
- ✅ Todo lo específico de la app va en su carpeta
- ✅ Usa recursos de `shared/` mediante imports

---

## 🗑️ Archivos Eliminados (2025-11-21)

### De la raíz de MIRA:
- ❌ `src/` - Código Express/HL7/FHIR (no usado)
- ❌ `package.json` - Proyecto Node.js (no usado)
- ❌ `tests/` - Tests unitarios (no usado)
- ❌ `examples/` - Ejemplos de código (no usado)
- ❌ `public/` - Assets estáticos (no usado)
- ❌ `test-nocobase-connection.js` - Script antiguo

### De docs/:
- ❌ `docs/NOCOBASE_INTEGRATION.md` - Integración no aplicable
- ❌ `docs/README_NOCOBASE.md` - Similar

### De UGCO/:
- ❌ `temp-*.json` (6 archivos temporales)
- ❌ `collections-output.json`
- ❌ `BD/.Rhistory` - Archivo de R Studio
- ❌ `BD/lista.txt` - Lista redundante
- ❌ `BD/UGCO_CasoOncologico.txt` (vacío)
- ❌ `BD/UGCO_CasoOncologico_Diccionario.txt` (vacío)

---

## 📦 Archivos Movidos (2025-11-21)

### A `_compartido/`:
- `UGCO/scripts/_base-api-client.js` → `_compartido/scripts/_base-api-client.js`
- `UGCO/docs/ERRORES-Y-SOLUCIONES.md` → `_compartido/docs/ERRORES-Y-SOLUCIONES.md`

### Referencias actualizadas:
- ✅ Todos los scripts de UGCO actualizados para usar nueva ruta
- ✅ README.md de scripts actualizado
- ✅ Enlaces de documentación actualizados

---

## 🚀 Próximas Apps (Estructura sugerida)

Cuando agregues una nueva aplicación NocoBase:

```
MIRA/
├── shared/                 # ← Usa esto
├── UGCO/                   # ← App existente
└── NuevaApp/               # ← Nueva app
    ├── README.md
    ├── BD/
    ├── docs/
    └── scripts/
        └── ejemplo.js
            # Importar así:
            # require('../../shared/scripts/_base-api-client')
```

---

## 📊 Estadísticas del Proyecto

### UGCO:
- **Tablas definidas**: 18 (7 REF + 11 UGCO)
- **Scripts**: 18+ archivos
- **Documentación**: 15+ archivos .md
- **Estado**: En desarrollo (instancia de prueba)

### Compartido:
- **Scripts**: 1 (_base-api-client.js)
- **Documentación**: 1 (ERRORES-Y-SOLUCIONES.md)

---

## 🔄 Historial de Cambios

### 2025-11-21
- ✅ Eliminados archivos de código no utilizado (src/, package.json, etc.)
- ✅ Creada estructura `_compartido/` para recursos transversales
- ✅ Movido cliente API y registro de errores a compartido
- ✅ Actualizadas todas las referencias en scripts
- ✅ Limpieza de archivos temporales y basura
- ✅ Limpieza de archivos temporales y basura
- ✅ Documentación actualizada

### 2025-11-26
- ✅ Reorganización de UGCO: Archivos sueltos movidos a `docs/` y `scripts/utils/`
- ✅ Estandarización de estructura para múltiples apps

---

## 📚 Documentación Principal

### General:
- [README.md](README.md) - Documentación del proyecto MIRA
- [shared/README.md](../shared/README.md) - Recursos compartidos

### UGCO:
- [UGCO/README.md](UGCO/README.md) - Documentación UGCO
- [UGCO/BD/RESUMEN-TABLAS-BD.md](UGCO/BD/RESUMEN-TABLAS-BD.md) - Inventario de tablas
- [UGCO/scripts/README.md](UGCO/scripts/README.md) - Guía de scripts

### Compartido:
- [shared/scripts/README.md](../shared/scripts/README.md) - Cliente API
- [docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md) - Errores y soluciones

---

**Mantenido por**: Equipo MIRA - Hospital de Ovalle
**Última actualización**: 2025-11-21
