# Recursos Compartidos - Proyecto MIRA NocoBase

Esta carpeta contiene recursos **transversales** utilizados por **todas las aplicaciones NocoBase** del proyecto MIRA.

---

## 📂 Estructura

```
shared/
├── scripts/              ← Utilidades para API NocoBase
│   ├── _base-api-client.js
│   └── README.md
│
└── docs/                 ← Documentación transversal
    └── ERRORES-Y-SOLUCIONES.md
```

---

## 🎯 Propósito

### **scripts/**
Contiene el cliente base de API de NocoBase que **todas las apps deben usar**.

- ✅ Conexiones consistentes
- ✅ Manejo correcto de errores
- ✅ Configuración compartida (.env)

**Ver:** [scripts/README.md](scripts/README.md)

---

### **docs/**
Documentación que aplica a todas las aplicaciones NocoBase.

**ERRORES-Y-SOLUCIONES.md**
- Registro centralizado de errores de API
- Soluciones aplicadas
- Prevención de errores recurrentes

**Ver:** [docs/ERRORES-Y-SOLUCIONES.md](docs/ERRORES-Y-SOLUCIONES.md)

---

## 🔧 Uso desde Apps Específicas

### Ejemplo desde UGCO:

```javascript
// UGCO/scripts/mi-script.js
const { createClient, log } = require('../../shared/scripts/_base-api-client');

async function main() {
  const client = createClient();
  const collections = await client.getCollections();
  log(`Total: ${collections.length}`, 'green');
}

main();
```

---

## 📋 Apps que usan estos recursos:

1. **UGCO** - Unidad de Gestión de Casos Oncológicos
2. [Futura App 2]
3. [Futura App 3]

---

## 🚫 ¿Qué NO va aquí?

- ❌ Código específico de una app (va en su carpeta)
- ❌ Definiciones de tablas específicas (va en App/BD/)
- ❌ Documentación específica de una app (va en App/docs/)

---

## ✅ ¿Qué SÍ va aquí?

- ✅ Cliente API de NocoBase
- ✅ Utilidades de logging
- ✅ Registro de errores de API
- ✅ Scripts de diagnóstico genéricos
- ✅ Helpers reutilizables

---

## 🔄 Mantenimiento

Cuando agregues una nueva aplicación NocoBase:

1. Usa el cliente de `shared/scripts/`
2. Si encuentras errores de API, documéntalos en `docs/TROUBLESHOOTING.md`
3. Si creas utilidades reutilizables, agrégalas aquí

---

**Mantenido por**: Equipo MIRA - Hospital de Ovalle
**Última actualización**: 2025-11-21
