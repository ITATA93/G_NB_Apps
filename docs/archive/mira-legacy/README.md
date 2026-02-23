# MIRA - Plataforma NocoBase del Hospital de Ovalle

## Medical Information Resource Application

MIRA es una **instancia personalizada de NocoBase** para el Hospital de Ovalle, diseñada para alojar múltiples aplicaciones de gestión hospitalaria.

---

## 🎯 ¿Qué es MIRA?

**MIRA** es una plataforma basada en [NocoBase](https://www.nocobase.com/) que sirve como base para desarrollar y desplegar aplicaciones de gestión clínica y administrativa del Hospital de Ovalle.

**NocoBase** es una plataforma no-code/low-code que permite crear aplicaciones mediante una interfaz visual, sin necesidad de programar código complejo.

---

## 📦 Aplicaciones Actuales

### 1. **UGCO** - Unidad de Gestión de Casos Oncológicos
Sistema de seguimiento y gestión de casos oncológicos.

**Características:**
- 📋 Registro de casos oncológicos
- 👥 Seguimiento de pacientes
- 🏥 Gestión de comités oncológicos
- 📊 Integración con ALMA (TrakCare) vía SIDRA
- 🧬 Clasificación ICD-O (Topografía y Morfología)

**Estado:** En desarrollo (instancia de prueba)

**Documentación:** Ver [UGCO/README.md](UGCO/README.md)

---

## 🏗️ Estructura del Proyecto

```
MIRA/
├── .env                    # Configuración de NocoBase API
├── .env.example            # Plantilla de configuración
├── README.md               # Este archivo
├── ESTRUCTURA-PROYECTO.md  # Documentación de estructura
│
├── _compartido/            # Recursos transversales
│   ├── scripts/
│   │   └── _base-api-client.js  # Cliente API NocoBase
│   └── docs/
│       └── ERRORES-Y-SOLUCIONES.md
│
├── UGCO/                   # App: Gestión Casos Oncológicos
│   ├── BD/                 # Definiciones de tablas (21 tablas)
│   ├── docs/               # Documentación UGCO
│   ├── scripts/            # Scripts de gestión API
│   └── planificacion/      # Plan de implementación
│
└── [Futuras Apps]/         # Otras aplicaciones del hospital
```

Ver estructura completa en [ESTRUCTURA-PROYECTO.md](ESTRUCTURA-PROYECTO.md)

---

## 🚀 Configuración

### Requisitos
- Acceso a la instancia de NocoBase del Hospital de Ovalle
- Token de API con permisos adecuados
- Node.js (para ejecutar scripts de gestión)

### Variables de Entorno

Crear archivo `.env` en la raíz:

```env
# NocoBase API Configuration
NOCOBASE_API_URL=https://nocobase.hospitaldeovalle.cl/api
NOCOBASE_API_TOKEN=tu_token_aqui
```

### Scripts de Gestión

Los scripts para gestionar la API de NocoBase están en cada aplicación:

```bash
# Desde UGCO
cd UGCO/scripts

# Test de conexión
node test-connection.js

# Listar colecciones
node list-all-collections-fixed.js
```

Ver documentación: [UGCO/scripts/README.md](UGCO/scripts/README.md)

---

## 🔧 Cliente API Compartido

Todas las aplicaciones usan el cliente base compartido ubicado en:
- `_compartido/scripts/_base-api-client.js`

**Ejemplo de uso:**

```javascript
const { createClient, log } = require('../../_compartido/scripts/_base-api-client');

async function main() {
  const client = createClient();
  const collections = await client.getCollections();
  log(`Total colecciones: ${collections.length}`, 'green');
}

main();
```

Ver documentación: [_compartido/scripts/README.md](_compartido/scripts/README.md)

---

## 📊 Estado del Proyecto

### UGCO:
- **Tablas definidas**: 21 (10 REF + 11 UGCO)
- **Scripts de gestión**: 18+
- **Estado**: Desarrollo en instancia de prueba
- **Integración ALMA**: Configurada vía SIDRA (8 tablas SQL sincronizadas)

### Infraestructura:
- **Plataforma**: NocoBase
- **Base de datos**: PostgreSQL (main) + MSSQL (SIDRA)
- **URL API**: https://nocobase.hospitaldeovalle.cl/api
- **Entorno**: Producción + Pruebas

---

## 📚 Documentación

### General:
- [README.md](README.md) - Este archivo
- [ESTRUCTURA-PROYECTO.md](ESTRUCTURA-PROYECTO.md) - Estructura completa
- [_compartido/README.md](_compartido/README.md) - Recursos compartidos

### UGCO:
- [UGCO/README.md](UGCO/README.md) - Documentación UGCO
- [UGCO/BD/RESUMEN-TABLAS-BD.md](UGCO/BD/RESUMEN-TABLAS-BD.md) - Inventario de tablas
- [UGCO/docs/RESUMEN-EJECUTIVO.md](UGCO/docs/RESUMEN-EJECUTIVO.md) - Resumen ejecutivo

### Scripts y Errores:
- [UGCO/scripts/README.md](UGCO/scripts/README.md) - Guía de scripts
- [_compartido/docs/ERRORES-Y-SOLUCIONES.md](_compartido/docs/ERRORES-Y-SOLUCIONES.md) - Errores conocidos

---

## 🔗 Integración con ALMA

MIRA se integra con **ALMA (TrakCare)** - el sistema de ficha clínica electrónica del hospital - a través de **SIDRA** (base de datos intermedia).

**Flujo de datos:**
```
ALMA (TrakCare) → SIDRA (SQL Server) → NocoBase (MIRA)
```

**Datos sincronizados:**
- Información de pacientes
- Episodios clínicos
- Datos demográficos
- Historial médico

**Modo:** Solo lectura (ALMA es la fuente de verdad)

---

## 🛠️ Desarrollo de Nuevas Aplicaciones

Para agregar una nueva aplicación al proyecto MIRA:

1. **Crear carpeta de la app:**
   ```
   MIRA/
   └── NuevaApp/
       ├── README.md
       ├── BD/              # Definiciones de tablas
       ├── docs/            # Documentación
       └── scripts/         # Scripts de gestión
   ```

2. **Usar recursos compartidos:**
   ```javascript
   const { createClient } = require('../../_compartido/scripts/_base-api-client');
   ```

3. **Documentar en ESTRUCTURA-PROYECTO.md**

---

## 🐛 Solución de Problemas

### Error de conexión a API
```bash
# Ejecutar diagnóstico
cd UGCO/scripts
node test-connection.js
```

### Revisar errores conocidos
Ver: [_compartido/docs/ERRORES-Y-SOLUCIONES.md](_compartido/docs/ERRORES-Y-SOLUCIONES.md)

---

## 📈 Roadmap

### UGCO (Corto plazo):
- [ ] Crear colecciones en instancia de prueba
- [ ] Configurar relaciones entre tablas
- [ ] Implementar interfaz de registro de casos
- [ ] Testing y validación
- [ ] Deploy a producción

### Futuras Aplicaciones:
- [ ] [App 2]
- [ ] [App 3]

---

## 🔒 Seguridad

- ✅ Autenticación mediante tokens de API
- ✅ Roles y permisos en NocoBase
- ✅ Conexión HTTPS
- ✅ Integración de solo lectura con ALMA

---

## 🌐 Enlaces

- **Repositorio GitHub**: https://github.com/ITATA93/MIRA.git
- **NocoBase Oficial**: https://www.nocobase.com/
- **Documentación NocoBase**: https://docs.nocobase.com/

---

## 👥 Equipo

**Desarrollado por**: Hospital de Ovalle - Departamento de TI

**Mantenido por**: Equipo MIRA

---

## 📝 Licencia

Proyecto interno del Hospital de Ovalle.

---

**Última actualización**: 2025-11-21
