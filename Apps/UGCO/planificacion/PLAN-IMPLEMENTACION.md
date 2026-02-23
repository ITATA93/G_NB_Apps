# Plan Estructurado de Implementación - UGCO
## Unidad de Gestión de Casos Oncológicos - Hospital de Ovalle

**Versión**: 1.0.0
**Fecha**: 2025-11-21
**Duración Estimada**: 10 semanas
**Estado**: Planificación

---

## ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Estrategia de Implementación](#2-estrategia-de-implementación)
3. [Fase 1: Fundación](#fase-1-fundación-semanas-1-2)
4. [Fase 2: Modelo de Datos](#fase-2-modelo-de-datos-semanas-2-3)
5. [Fase 3: Servicios de Negocio](#fase-3-servicios-de-negocio-semanas-3-4)
6. [Fase 4: Frontend NocoBase](#fase-4-frontend-nocobase-semanas-4-6)
7. [Fase 5: Configuración de Permisos](#fase-5-configuración-de-permisos-semana-6)
8. [Fase 6: Datos Maestros](#fase-6-datos-maestros-semana-7)
9. [Fase 7: Pruebas](#fase-7-pruebas-semanas-7-8)
10. [Fase 8: Capacitación y Despliegue](#fase-8-capacitación-y-despliegue-semanas-9-10)
11. [Cronograma Gantt](#11-cronograma-gantt)
12. [Recursos Necesarios](#12-recursos-necesarios)
13. [Dependencias Críticas](#13-dependencias-críticas)
14. [Riesgos y Mitigaciones](#14-riesgos-y-mitigaciones)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Objetivo
Implementar el sistema UGCO (Unidad de Gestión de Casos Oncológicos) en NocoBase para el Hospital de Ovalle, integrándose con ALMA (TrakCare) y proporcionando seguimiento completo de pacientes oncológicos por especialidad.

### 1.2 Alcance
- **7 colecciones nuevas en NocoBase** (prefijo `onco_`)
- **3 colecciones espejo de ALMA** (prefijo `alma_`)
- **Vistas y formularios** para gestión de casos, comités y seguimiento
- **Roles y permisos** específicos para equipo oncológico
- **Dashboards** por especialidad y métricas oncológicas
- **Capacitación** a usuarios clave

### 1.3 Fuera de Alcance (Fase 1)
- Modificaciones al sistema ALMA
- Reportes complejos con BI (Power BI, Tableau)
- Integración con otros sistemas hospitalarios (PACS, LIS)
- Módulo de gestión de farmacia oncológica
- App móvil

### 1.4 Entregables Principales
1. ✅ Documentación completa (Diagnóstico, Diccionario de Datos, Arquitectura)
2. Base de datos UGCO completamente implementada en NocoBase
3. Vistas y formularios funcionales para todos los flujos de trabajo
4. Sistema de permisos configurado
5. Datos maestros cargados
6. Sistema probado y validado
7. Usuarios capacitados
8. Sistema en producción

### 1.5 Hitos Críticos
- **Semana 2**: Modelo de datos aprobado e implementado
- **Semana 4**: Servicios de negocio funcionando
- **Semana 6**: UI completo y permisos configurados
- **Semana 8**: Pruebas completas finalizadas
- **Semana 10**: Sistema en producción

---

## 2. ESTRATEGIA DE IMPLEMENTACIÓN

### 2.1 Enfoque: Iterativo e Incremental

```
Diseño → Implementación → Prueba → Validación → Ajustes → Siguiente Fase
  ↑_______________________________________________________________|
```

**Características**:
- **Iterativo**: Cada fase incluye ciclos de feedback con usuarios
- **Incremental**: Funcionalidades se agregan progresivamente
- **Risk-driven**: Fases priorizadas por riesgo técnico y valor de negocio
- **User-centric**: Validación constante con usuarios clínicos

### 2.2 Principios Rectores

1. **ALMA es read-only**: Nunca modificar datos desde UGCO
2. **Validación temprana**: Involucrar a usuarios desde fase de diseño
3. **Calidad primero**: No avanzar a siguiente fase sin aprobar la anterior
4. **Documentación continua**: Actualizar docs con cada cambio
5. **Seguridad desde el diseño**: Permisos y auditoría desde el inicio

### 2.3 Criterios de Aceptación por Fase

Cada fase debe cumplir:
- ✅ Entregables completados al 100%
- ✅ Pruebas unitarias/funcionales pasadas
- ✅ Documentación actualizada
- ✅ Validación con usuarios (cuando aplique)
- ✅ Aprobación del sponsor/líder técnico

---

## FASE 1: FUNDACIÓN (Semanas 1-2)

### 📅 Duración: 2 semanas
### 🎯 Objetivo
Establecer las bases documentales, técnicas y organizacionales del proyecto.

---

### Semana 1: Documentación y Análisis

#### 1.1 Documentación Base
**Responsable**: Líder técnico + Analista
**Duración**: 5 días

| # | Tarea | Entregable | Estado |
|---|-------|------------|--------|
| 1.1.1 | Diagnóstico completo del sistema | [DIAGNOSTICO-COMPLETO.md](../docs/DIAGNOSTICO-COMPLETO.md) | ✅ |
| 1.1.2 | Diccionario de datos | [DICCIONARIO-DATOS.md](../docs/modelo-datos/DICCIONARIO-DATOS.md) | ✅ |
| 1.1.3 | Sistema de registro de cambios | [CHANGELOG.md](../CHANGELOG.md) | ✅ |
| 1.1.4 | Plan de implementación | Este documento | ✅ |
| 1.1.5 | Documento de arquitectura detallada | ARQUITECTURA.md | ⏳ |

**Criterios de Aceptación**:
- [ ] Todos los documentos completados y revisados
- [ ] Modelo de datos validado con equipo oncológico
- [ ] Arquitectura aprobada por TI del hospital

---

#### 1.2 Talleres con Usuarios
**Responsable**: Analista + Product Owner
**Duración**: 3 días

| # | Taller | Participantes | Objetivo | Entregable |
|---|--------|---------------|----------|------------|
| 1.2.1 | Flujos de trabajo oncológicos | Médico oncólogo, Enfermera gestora | Validar procesos actuales | Diagrama de flujos |
| 1.2.2 | Requisitos de comité oncológico | Equipo del comité | Definir necesidades de gestión de comités | Especificación de comités |
| 1.2.3 | Seguimiento por especialidad | Médicos de especialidades | Validar estructura de especialidades | Catálogo de especialidades |

**Entregables**:
- [ ] Actas de talleres
- [ ] Diagrama de flujos de trabajo validados
- [ ] Catálogo de especialidades aprobado
- [ ] Requisitos funcionales adicionales identificados

---

#### 1.3 Análisis de SQL Intermedio ALMA
**Responsable**: Desarrollador Backend + DBA Hospital
**Duración**: 2 días

| # | Tarea | Descripción | Entregable |
|---|-------|-------------|------------|
| 1.3.1 | Revisar esquema SQL ALMA | Documentar tablas/vistas disponibles | Esquema SQL documentado |
| 1.3.2 | Identificar brechas | Determinar si se necesitan vistas adicionales | Lista de vistas requeridas |
| 1.3.3 | Coordinar con TI | Solicitar creación de vistas faltantes | Ticket a TI hospital |
| 1.3.4 | Validar datos | Verificar calidad y completitud de datos | Reporte de calidad de datos |

**Criterios de Aceptación**:
- [ ] Esquema SQL ALMA completamente documentado
- [ ] Todas las vistas necesarias identificadas
- [ ] Solicitudes de vistas adicionales enviadas a TI
- [ ] Calidad de datos validada (>95% completitud en campos críticos)

---

### Semana 2: Infraestructura y Configuración

#### 1.4 Infraestructura Técnica
**Responsable**: DevOps + Desarrollador Backend
**Duración**: 3 días

| # | Tarea | Descripción | Entregable |
|---|-------|-------------|------------|
| 1.4.1 | Configurar ambiente de desarrollo | Clonar NocoBase, configurar .env | Ambiente DEV listo |
| 1.4.2 | Configurar ambiente de QA | Preparar ambiente de pruebas | Ambiente QA listo |
| 1.4.3 | Configurar logging específico UGCO | Winston logger para UGCO | Logs configurados |
| 1.4.4 | Configurar repositorio Git | Crear rama `feature/ugco` | Repo listo |
| 1.4.5 | Configurar CI/CD básico | Pipeline de deployment | CI/CD funcionando |

**Entregables**:
- [ ] Ambientes DEV y QA configurados y funcionando
- [ ] Logs de aplicación configurados
- [ ] Repositorio Git con estructura de ramas
- [ ] Pipeline CI/CD básico funcionando

---

#### 1.5 Scripts y Herramientas
**Responsable**: Desarrollador Backend
**Duración**: 2 días

| # | Tarea | Descripción | Archivo |
|---|-------|-------------|---------|
| 1.5.1 | Script de creación de colecciones | Script para crear colecciones vía API NocoBase | `scripts/create-collections.js` |
| 1.5.2 | Script de carga de datos maestros | Seed data para especialidades | `scripts/seed-especialidades.js` |
| 1.5.3 | Script de validación | Validar integridad del modelo | `scripts/validate-model.js` |
| 1.5.4 | Script de backup | Backup de colecciones UGCO | `scripts/backup-ugco.sh` |

**Entregables**:
- [ ] Scripts de creación de colecciones listos y probados
- [ ] Scripts de seed data listos
- [ ] Scripts de validación funcionando
- [ ] Scripts de backup configurados

---

### Entregables Fase 1
- ✅ Documentación completa (5 documentos)
- [ ] Talleres con usuarios completados (3 talleres)
- [ ] Análisis de SQL ALMA finalizado
- [ ] Infraestructura técnica configurada (DEV + QA)
- [ ] Scripts de gestión listos

### Criterios de Éxito Fase 1
- [ ] Modelo de datos aprobado por sponsor y equipo oncológico
- [ ] Requisitos funcionales validados
- [ ] Infraestructura técnica lista para desarrollo
- [ ] Equipo alineado en objetivos y alcance

---

## FASE 2: MODELO DE DATOS (Semanas 2-3)

### 📅 Duración: 2 semanas (solapado 1 semana con Fase 1)
### 🎯 Objetivo
Implementar el modelo de datos completo en NocoBase: colecciones, campos, relaciones, índices.

---

### Semana 2-3: Implementación de Colecciones

#### 2.1 Colecciones ALMA (Read-Only)
**Responsable**: Desarrollador Backend + DBA Hospital
**Duración**: 2 días

| # | Colección | Campos | Tipo | Estado |
|---|-----------|--------|------|--------|
| 2.1.1 | `alma_pacientes` | 15 campos | Vista SQL o External Data Source | ⏳ |
| 2.1.2 | `alma_episodios` | 12 campos | Vista SQL o External Data Source | ⏳ |
| 2.1.3 | `alma_diagnosticos` | 11 campos | Vista SQL o External Data Source | ⏳ |

**Tareas**:
1. Conectar fuente de datos SQL intermedio en NocoBase
2. Crear vistas para cada colección
3. Configurar refresh automático (si aplica)
4. Configurar permisos read-only
5. Validar datos con datos en ALMA

**Entregable**:
```javascript
// Script: scripts/create-alma-collections.js
// Crea las 3 colecciones ALMA en NocoBase vía API
```

**Criterios de Aceptación**:
- [ ] 3 colecciones ALMA creadas en NocoBase
- [ ] Datos sincronizados correctamente desde SQL ALMA
- [ ] Permisos read-only configurados
- [ ] Validación: Al menos 100 registros de prueba visibles

---

#### 2.2 Colecciones UGCO - Catálogos
**Responsable**: Desarrollador Backend
**Duración**: 1 día

| # | Colección | Campos | Relaciones | Estado |
|---|-----------|--------|------------|--------|
| 2.2.1 | `onco_especialidades` | 12 campos | Ninguna (maestro) | ⏳ |

**Tareas**:
1. Crear colección `onco_especialidades`
2. Definir campos según diccionario de datos
3. Cargar datos iniciales (10 especialidades)
4. Configurar permisos (Admin: CRUD, Users: Read)

**Entregable**:
```javascript
// Script: scripts/create-onco-especialidades.js
// Payload de creación de colección
POST /api/collections:create
{
  "name": "onco_especialidades",
  "fields": [
    {
      "name": "id",
      "type": "integer",
      "primaryKey": true,
      "autoIncrement": true
    },
    {
      "name": "nombre",
      "type": "string",
      "length": 100,
      "required": true
    },
    // ... resto de campos
  ]
}
```

**Datos Iniciales**:
```javascript
// Script: scripts/seed-especialidades.js
const especialidades = [
  { nombre: 'Digestivo alto', codigo: 'DIG-ALTO', color: '#3B82F6', orden: 1 },
  { nombre: 'Digestivo bajo', codigo: 'DIG-BAJO', color: '#10B981', orden: 2 },
  { nombre: 'Mama', codigo: 'MAMA', color: '#EC4899', orden: 3 },
  { nombre: 'Ginecológico', codigo: 'GINE', color: '#8B5CF6', orden: 4 },
  { nombre: 'Urológico', codigo: 'URO', color: '#F59E0B', orden: 5 },
  { nombre: 'Pulmón', codigo: 'PULMON', color: '#6366F1', orden: 6 },
  { nombre: 'Cabeza y cuello', codigo: 'CABEZA', color: '#EF4444', orden: 7 },
  { nombre: 'Hematología', codigo: 'HEMATO', color: '#14B8A6', orden: 8 },
  { nombre: 'Melanoma y piel', codigo: 'PIEL', color: '#F97316', orden: 9 },
  { nombre: 'Otros tumores sólidos', codigo: 'OTROS', color: '#6B7280', orden: 10 }
];
```

**Criterios de Aceptación**:
- [ ] Colección `onco_especialidades` creada
- [ ] 10 especialidades iniciales cargadas
- [ ] Permisos configurados correctamente

---

#### 2.3 Colecciones UGCO - Casos
**Responsable**: Desarrollador Backend
**Duración**: 2 días

| # | Colección | Campos | Relaciones | Estado |
|---|-----------|--------|------------|--------|
| 2.3.1 | `onco_casos` | 32 campos | belongsTo alma_pacientes, belongsToMany onco_especialidades | ⏳ |
| 2.3.2 | `onco_caso_especialidades` | 10 campos | belongsTo onco_casos, belongsTo onco_especialidades | ⏳ |

**Tareas día 1: `onco_casos`**:
1. Crear colección con todos los campos
2. Configurar relaciones:
   - `belongsTo` alma_pacientes (via id_paciente_alma)
   - `belongsTo` alma_episodios (via id_episodio_indice)
   - `belongsTo` alma_diagnosticos (via id_diagnostico_indice)
   - `belongsTo` users (via medico_tratante, enfermera_gestora)
3. Configurar índices (codigo_caso UNIQUE, estado, fecha_ingreso_ugco)
4. Implementar generación automática de codigo_caso (hook beforeCreate)
5. Configurar soft delete (deleted_at)

**Tareas día 2: `onco_caso_especialidades`**:
1. Crear colección (tabla intermedia N:N)
2. Configurar relaciones:
   - `belongsTo` onco_casos
   - `belongsTo` onco_especialidades
3. Configurar constraint UNIQUE (id_caso, id_especialidad)
4. Implementar validación: solo un `es_principal = true` por caso (hook)

**Entregable**:
```javascript
// Script: scripts/create-onco-casos.js
// Incluye:
// - Definición de colección onco_casos
// - Definición de colección onco_caso_especialidades
// - Configuración de relaciones
// - Hooks de validación
```

**Hooks de Validación**:
```javascript
// Hook beforeCreate en onco_casos
async function generateCodigoCaso(values) {
  const year = new Date().getFullYear();
  const lastCase = await db.onco_casos
    .where('codigo_caso', 'like', `UGCO-${year}-%`)
    .orderBy('id', 'desc')
    .first();

  const nextNumber = lastCase
    ? parseInt(lastCase.codigo_caso.split('-')[2]) + 1
    : 1;

  values.codigo_caso = `UGCO-${year}-${String(nextNumber).padStart(3, '0')}`;
}

// Hook beforeCreate/Update en onco_caso_especialidades
async function validateEsPrincipal(values) {
  if (values.es_principal === true) {
    // Actualizar otras a false
    await db.onco_caso_especialidades
      .where('id_caso', values.id_caso)
      .where('id', '!=', values.id)
      .update({ es_principal: false });
  }
}
```

**Criterios de Aceptación**:
- [ ] Colección `onco_casos` creada con 32 campos
- [ ] Colección `onco_caso_especialidades` creada con 10 campos
- [ ] Relaciones configuradas correctamente
- [ ] Generación automática de codigo_caso funcionando
- [ ] Validación de es_principal funcionando

---

#### 2.4 Colecciones UGCO - Episodios y Seguimiento
**Responsable**: Desarrollador Backend
**Duración**: 2 días

| # | Colección | Campos | Relaciones | Estado |
|---|-----------|--------|------------|--------|
| 2.4.1 | `onco_episodios` | 18 campos | belongsTo onco_casos, belongsTo onco_especialidades | ⏳ |
| 2.4.2 | `onco_seguimiento_eventos` | 16 campos | belongsTo onco_casos, belongsTo onco_especialidades | ⏳ |

**Tareas**:
1. Crear ambas colecciones con todos sus campos
2. Configurar relaciones con onco_casos (1:N)
3. Configurar relaciones con onco_especialidades (opcional)
4. Configurar índices (tipo_episodio, fecha, estado)
5. Configurar valores de dominio (enums)

**Entregable**:
```javascript
// Script: scripts/create-onco-episodios.js
```

**Criterios de Aceptación**:
- [ ] 2 colecciones creadas con todos los campos
- [ ] Relaciones configuradas correctamente
- [ ] Índices creados
- [ ] Valores de dominio (enums) configurados

---

#### 2.5 Colecciones UGCO - Comités
**Responsable**: Desarrollador Backend
**Duración**: 2 días

| # | Colección | Campos | Relaciones | Estado |
|---|-----------|--------|------------|--------|
| 2.5.1 | `onco_comite_sesiones` | 20 campos | hasMany onco_comite_casos | ⏳ |
| 2.5.2 | `onco_comite_casos` | 14 campos | belongsTo onco_comite_sesiones, belongsTo onco_casos | ⏳ |

**Tareas**:
1. Crear ambas colecciones
2. Configurar relaciones 1:N entre sesiones y casos
3. Configurar generación automática de codigo_sesion (hook)
4. Configurar campos JSON para asistentes, acuerdos

**Entregable**:
```javascript
// Script: scripts/create-onco-comites.js
```

**Hook codigo_sesion**:
```javascript
async function generateCodigoSesion(values) {
  const fecha = new Date(values.fecha_sesion);
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');

  let codigo = `COM-${year}-${month}-${day}`;

  // Si ya existe, agregar sufijo
  let suffix = '';
  let counter = 1;
  while (await db.onco_comite_sesiones.where('codigo_sesion', codigo + suffix).first()) {
    suffix = `-${counter}`;
    counter++;
  }

  values.codigo_sesion = codigo + suffix;
}
```

**Criterios de Aceptación**:
- [ ] 2 colecciones creadas
- [ ] Relaciones configuradas
- [ ] Generación automática de codigo_sesion funcionando
- [ ] Campos JSON funcionando correctamente

---

### Entregables Fase 2
- [ ] 3 colecciones ALMA creadas y sincronizadas
- [ ] 7 colecciones UGCO creadas:
  - [ ] onco_especialidades (con 10 especialidades iniciales)
  - [ ] onco_casos
  - [ ] onco_caso_especialidades
  - [ ] onco_episodios
  - [ ] onco_seguimiento_eventos
  - [ ] onco_comite_sesiones
  - [ ] onco_comite_casos
- [ ] Todas las relaciones configuradas y probadas
- [ ] Índices creados
- [ ] Hooks de validación funcionando
- [ ] Documentación de modelo de datos actualizada

### Criterios de Éxito Fase 2
- [ ] Todas las colecciones creadas sin errores
- [ ] Datos de prueba insertados exitosamente en cada colección
- [ ] Relaciones entre colecciones funcionando (queries JOIN)
- [ ] Hooks de validación probados
- [ ] Integridad referencial verificada
- [ ] Aprobación del sponsor

---

## FASE 3: SERVICIOS DE NEGOCIO (Semanas 3-4)

### 📅 Duración: 2 semanas
### 🎯 Objetivo
Implementar lógica de negocio adicional, validaciones oncológicas y servicios especializados en MIRA (opcional).

**NOTA**: Esta fase es **opcional** si toda la lógica se maneja directamente en NocoBase via hooks y actions.

---

### Semana 3-4: Servicios MIRA

#### 3.1 Servicio UGCO Base
**Responsable**: Desarrollador Backend
**Duración**: 2 días

**Archivo**: `src/services/ugcoService.js`

**Funcionalidades**:
- Servicio singleton para UGCO
- Métodos CRUD específicos oncológicos
- Validaciones de negocio
- Cálculos de métricas

**Métodos Principales**:
```javascript
class UGCOService {
  // Casos
  async createCaso(casoData) { /* ... */ }
  async updateCaso(id, casoData) { /* ... */ }
  async getCaso(id) { /* ... */ }
  async searchCasos(filters) { /* ... */ }
  async assignEspecialidad(idCaso, idEspecialidad, esPrincipal) { /* ... */ }

  // Episodios
  async createEpisodio(episodioData) { /* ... */ }
  async updateEpisodio(id, episodioData) { /* ... */ }
  async getEpisodiosByCaso(idCaso) { /* ... */ }

  // Seguimiento
  async createEvento(eventoData) { /* ... */ }
  async getEventosByCaso(idCaso, filters) { /* ... */ }

  // Comités
  async createSesionComite(sesionData) { /* ... */ }
  async addCasoToSesion(idSesion, idCaso, data) { /* ... */ }
  async getSesionesComite(filters) { /* ... */ }

  // Métricas
  async getCasosActivosByEspecialidad() { /* ... */ }
  async getEstadisticasGenerales() { /* ... */ }
}
```

**Entregable**:
- [ ] Archivo `src/services/ugcoService.js` completo
- [ ] Pruebas unitarias para cada método
- [ ] Documentación de API

**Criterios de Aceptación**:
- [ ] Servicio UGCO funcionando
- [ ] Cobertura de pruebas > 80%
- [ ] Documentación completa

---

#### 3.2 Validaciones Oncológicas
**Responsable**: Desarrollador Backend + Médico Oncólogo (validación)
**Duración**: 2 días

**Archivo**: `src/utils/ugcoValidations.js`

**Validaciones**:
1. **Validación de caso**:
   - Paciente existe en ALMA
   - Código CIE-10 válido
   - Estadio TNM válido
   - Fechas coherentes

2. **Validación de episodio**:
   - Tipo de episodio válido
   - Fechas coherentes (inicio < fin)
   - Profesional responsable existe

3. **Validación de comité**:
   - Fecha de sesión futura (para nuevas sesiones)
   - Al menos un caso asignado
   - Moderador es usuario válido

**Implementación**:
```javascript
// src/utils/ugcoValidations.js
const Joi = require('joi');

const casoSchema = Joi.object({
  id_paciente_alma: Joi.number().integer().required(),
  fecha_ingreso_ugco: Joi.date().required(),
  estado: Joi.string().valid('Activo', 'Seguimiento', 'Alta', 'Fallecido', 'Perdido', 'Derivado', 'Suspendido').required(),
  tipo_tumor: Joi.string().max(200),
  estadio_inicial: Joi.string().max(50).pattern(/^T[0-4]N[0-3]M[0-1]/), // TNM pattern
  // ... resto de campos
});

function validateCaso(casoData) {
  const { error, value } = casoSchema.validate(casoData);
  if (error) {
    throw new Error(`Validación fallida: ${error.details.map(d => d.message).join(', ')}`);
  }
  return value;
}

// Validación de negocio específica
async function validateCasoBusinessRules(casoData) {
  // 1. Verificar que paciente existe en ALMA
  const paciente = await db.alma_pacientes.where('id', casoData.id_paciente_alma).first();
  if (!paciente) {
    throw new Error(`Paciente con ID ${casoData.id_paciente_alma} no existe en ALMA`);
  }

  // 2. Verificar que no hay caso activo duplicado para el mismo paciente
  const casoExistente = await db.onco_casos
    .where('id_paciente_alma', casoData.id_paciente_alma)
    .where('estado', 'in', ['Activo', 'Seguimiento'])
    .where('deleted_at', null)
    .first();

  if (casoExistente) {
    throw new Error(`Ya existe un caso activo para este paciente: ${casoExistente.codigo_caso}`);
  }

  // 3. Validar fechas
  if (casoData.fecha_alta_ugco && casoData.fecha_alta_ugco < casoData.fecha_ingreso_ugco) {
    throw new Error('Fecha de alta no puede ser anterior a fecha de ingreso');
  }

  return true;
}

module.exports = {
  validateCaso,
  validateCasoBusinessRules,
  // ... otras validaciones
};
```

**Entregable**:
- [ ] Archivo de validaciones completo
- [ ] Pruebas unitarias de validaciones
- [ ] Documentación de reglas de negocio

---

#### 3.3 Cálculos y Métricas Oncológicas
**Responsable**: Desarrollador Backend + Médico Oncólogo
**Duración**: 2 días

**Archivo**: `src/utils/ugcoMetrics.js`

**Métricas**:
1. **Métricas de casos**:
   - Total de casos activos
   - Casos por especialidad
   - Casos por estado
   - Tiempo promedio de seguimiento

2. **Métricas de tratamiento**:
   - Distribución de tipos de tratamiento
   - Tasa de completitud de tratamiento
   - Complicaciones por tipo de tratamiento

3. **Métricas de comité**:
   - Número de sesiones realizadas
   - Casos discutidos por sesión
   - Tiempo promedio por caso

**Implementación**:
```javascript
// src/utils/ugcoMetrics.js
class UGCOMetrics {
  async getCasosActivos() {
    return await db.onco_casos
      .where('estado', 'in', ['Activo', 'Seguimiento'])
      .where('deleted_at', null)
      .count();
  }

  async getCasosPorEspecialidad() {
    return await db.onco_casos
      .join('onco_caso_especialidades', 'onco_casos.id', 'onco_caso_especialidades.id_caso')
      .join('onco_especialidades', 'onco_caso_especialidades.id_especialidad', 'onco_especialidades.id')
      .where('onco_casos.deleted_at', null)
      .where('onco_casos.activo', true)
      .where('onco_caso_especialidades.es_principal', true)
      .groupBy('onco_especialidades.nombre')
      .select('onco_especialidades.nombre', db.raw('COUNT(*) as total'))
      .orderBy('total', 'desc');
  }

  async getDistribucionEstados() {
    return await db.onco_casos
      .where('deleted_at', null)
      .groupBy('estado')
      .select('estado', db.raw('COUNT(*) as total'))
      .orderBy('total', 'desc');
  }

  async getEstadisticasComite(year) {
    const sesiones = await db.onco_comite_sesiones
      .where(db.raw('YEAR(fecha_sesion)'), year)
      .where('estado', 'Finalizada')
      .count();

    const casosDiscutidos = await db.onco_comite_casos
      .join('onco_comite_sesiones', 'onco_comite_casos.id_sesion', 'onco_comite_sesiones.id')
      .where(db.raw('YEAR(onco_comite_sesiones.fecha_sesion)'), year)
      .where('onco_comite_sesiones.estado', 'Finalizada')
      .count();

    return {
      sesiones_realizadas: sesiones,
      casos_discutidos: casosDiscutidos,
      promedio_casos_por_sesion: sesiones > 0 ? (casosDiscutidos / sesiones).toFixed(1) : 0
    };
  }

  // ... más métricas
}

module.exports = new UGCOMetrics();
```

**Entregable**:
- [ ] Clase de métricas completa
- [ ] Pruebas de métricas con datos de prueba
- [ ] Documentación de métricas disponibles

---

#### 3.4 API Endpoints UGCO (opcional)
**Responsable**: Desarrollador Backend
**Duración**: 2 días

**Archivo**: `src/api/ugcoRoutes.js`

**Endpoints adicionales** (más allá de la API nativa de NocoBase):

```javascript
// src/api/ugcoRoutes.js
const express = require('express');
const router = express.Router();
const ugcoService = require('../services/ugcoService');
const ugcoMetrics = require('../utils/ugcoMetrics');

// === CASOS ===
// GET /api/ugco/casos - Buscar casos con filtros avanzados
router.get('/casos', async (req, res) => {
  const { especialidad, estado, fechaDesde, fechaHasta, busqueda } = req.query;
  const casos = await ugcoService.searchCasos({ especialidad, estado, fechaDesde, fechaHasta, busqueda });
  res.json({ success: true, data: casos });
});

// GET /api/ugco/casos/:id/timeline - Línea de tiempo completa del caso
router.get('/casos/:id/timeline', async (req, res) => {
  const timeline = await ugcoService.getCasoTimeline(req.params.id);
  res.json({ success: true, data: timeline });
});

// POST /api/ugco/casos/:id/cambiar-estado - Cambiar estado del caso
router.post('/casos/:id/cambiar-estado', async (req, res) => {
  const { nuevoEstado, motivo } = req.body;
  const caso = await ugcoService.cambiarEstadoCaso(req.params.id, nuevoEstado, motivo);
  res.json({ success: true, data: caso });
});

// === MÉTRICAS ===
// GET /api/ugco/metricas/dashboard - Dashboard general
router.get('/metricas/dashboard', async (req, res) => {
  const dashboard = {
    casos_activos: await ugcoMetrics.getCasosActivos(),
    por_especialidad: await ugcoMetrics.getCasosPorEspecialidad(),
    por_estado: await ugcoMetrics.getDistribucionEstados(),
    comites: await ugcoMetrics.getEstadisticasComite(new Date().getFullYear())
  };
  res.json({ success: true, data: dashboard });
});

// GET /api/ugco/metricas/especialidad/:id - Métricas por especialidad
router.get('/metricas/especialidad/:id', async (req, res) => {
  const metricas = await ugcoMetrics.getMetricasEspecialidad(req.params.id);
  res.json({ success: true, data: metricas });
});

// === COMITÉS ===
// GET /api/ugco/comites/proximos - Próximas sesiones de comité
router.get('/comites/proximos', async (req, res) => {
  const proximas = await ugcoService.getProximasSesionesComite();
  res.json({ success: true, data: proximas });
});

// POST /api/ugco/comites/:id/finalizar - Finalizar sesión de comité
router.post('/comites/:id/finalizar', async (req, res) => {
  const { acta, acuerdos } = req.body;
  const sesion = await ugcoService.finalizarSesionComite(req.params.id, acta, acuerdos);
  res.json({ success: true, data: sesion });
});

// === REPORTES ===
// GET /api/ugco/reportes/casos-nuevos - Reporte de casos nuevos por período
router.get('/reportes/casos-nuevos', async (req, res) => {
  const { fechaDesde, fechaHasta } = req.query;
  const reporte = await ugcoService.getReporteCasosNuevos(fechaDesde, fechaHasta);
  res.json({ success: true, data: reporte });
});

module.exports = router;
```

**Integración en MIRA**:
```javascript
// src/index.js
const ugcoRoutes = require('./api/ugcoRoutes');
app.use('/api/ugco', ugcoRoutes);
```

**Entregable**:
- [ ] Rutas API completas
- [ ] Documentación de API (Swagger/OpenAPI)
- [ ] Pruebas de integración de endpoints

---

### Entregables Fase 3
- [ ] Servicio UGCO completo (`ugcoService.js`)
- [ ] Validaciones oncológicas (`ugcoValidations.js`)
- [ ] Métricas oncológicas (`ugcoMetrics.js`)
- [ ] API endpoints adicionales (opcional)
- [ ] Documentación de servicios
- [ ] Pruebas unitarias e integración (cobertura > 80%)

### Criterios de Éxito Fase 3
- [ ] Todos los servicios funcionando correctamente
- [ ] Validaciones probadas con casos reales
- [ ] Métricas calculando correctamente
- [ ] API endpoints respondiendo (si aplica)
- [ ] Cobertura de pruebas > 80%
- [ ] Documentación técnica completa

---

## FASE 4: FRONTEND NOCOBASE (Semanas 4-6)

### 📅 Duración: 3 semanas
### 🎯 Objetivo
Diseñar e implementar todas las vistas, formularios, dashboards y flujos de trabajo en NocoBase UI.

Esta es la **fase más visible** y requiere **validación constante con usuarios finales**.

---

### Semana 4: Vistas de Casos y Formularios

#### 4.1 Vista de Listado de Casos
**Responsable**: Desarrollador Frontend
**Duración**: 2 días

**Componente**: Table Block en NocoBase

**Características**:
- Listado completo de casos oncológicos
- Columnas principales: Código, Paciente, Especialidad, Estado, Fecha Ingreso, Médico Tratante
- Filtros avanzados:
  - Por especialidad (select)
  - Por estado (select)
  - Por rango de fechas
  - Búsqueda por texto (código, nombre paciente, tipo tumor)
- Ordenamiento por columnas
- Paginación (20 casos por página)
- Acciones por fila:
  - Ver detalle
  - Editar
  - Cambiar estado
  - Eliminar (soft delete)

**Mockup conceptual**:
```
╔════════════════════════════════════════════════════════════════╗
║ UGCO - Casos Oncológicos                          [+ Nuevo Caso]║
╠════════════════════════════════════════════════════════════════╣
║ Filtros:                                                        ║
║ [Especialidad ▼] [Estado ▼] [Desde: ___] [Hasta: ___] [Buscar]║
╠════════════════════════════════════════════════════════════════╣
║ Código      │Paciente        │Especialidad│Estado  │Fecha Ing │
╠════════════════════════════════════════════════════════════════╣
║ UGCO-2024-001│Juan Pérez      │Digestivo a│Activo  │01/01/2024║
║ UGCO-2024-002│María González  │Mama       │Seguim. │05/01/2024║
║ ...                                                             ║
╚════════════════════════════════════════════════════════════════╝
Mostrando 1-20 de 150  [< 1 2 3 ... 8 >]
```

**Configuración en NocoBase**:
1. Crear Page: "Casos Oncológicos"
2. Agregar Table Block
3. Configurar columnas desde colección `onco_casos`
4. Agregar relaciones:
   - `id_paciente_alma` -> mostrar `alma_pacientes.nombre`
   - `onco_caso_especialidades.id_especialidad` (principal) -> mostrar `onco_especialidades.nombre`
5. Configurar filtros
6. Configurar acciones (botones)

**Entregable**:
- [ ] Vista de listado funcional
- [ ] Filtros funcionando
- [ ] Acciones funcionando

---

#### 4.2 Formulario de Creación de Caso
**Responsable**: Desarrollador Frontend + Médico Oncólogo (validación)
**Duración**: 3 días

**Componente**: Form Block en NocoBase

**Secciones del formulario**:
1. **Datos del Paciente** (read-only, desde ALMA)
   - Selector de paciente (autocomplete por RUT o nombre)
   - Mostrar: RUT, Nombre, Edad, Sexo, Previsión

2. **Información del Caso**
   - Fecha de ingreso UGCO (date picker, default: hoy)
   - Especialidad(es) (select multiple)
     - Primera selección es automáticamente principal
     - Opción de marcar otras como secundarias
   - Episodio índice (opcional, select desde alma_episodios del paciente)
   - Diagnóstico índice (opcional, select desde alma_diagnosticos del paciente)

3. **Información Oncológica**
   - Tipo de tumor (text)
   - Localización primaria (text)
   - Estadio inicial TNM (text con ayuda contextual)
   - Histología (textarea)
   - Grado de diferenciación (select: Bien/Moderado/Pobre)
   - Biomarcadores (JSON editor o campos específicos)

4. **Equipo Responsable**
   - Médico tratante (select de usuarios con rol "Médico Oncólogo")
   - Enfermera gestora (select de usuarios con rol "Enfermera Gestora")

5. **Plan de Tratamiento**
   - Intención (select: Curativo/Paliativo/Sintomático)
   - Plan de tratamiento (textarea)
   - Protocolo (text)
   - Fecha inicio tratamiento (date picker)

6. **Observaciones**
   - Observaciones (textarea)
   - Alertas (textarea, destacado en rojo)
   - Prioridad (select: Baja/Normal/Alta/Urgente)

**Mockup conceptual**:
```
╔════════════════════════════════════════════════════════════════╗
║ Crear Nuevo Caso Oncológico                   [Guardar] [Cancelar]║
╠════════════════════════════════════════════════════════════════╣
║ 1️⃣ DATOS DEL PACIENTE                                          ║
║   Buscar paciente: [🔍 Buscar por RUT o nombre_______________] ║
║   ┌──────────────────────────────────────────────────────────┐ ║
║   │ RUT: 12.345.678-9                                        │ ║
║   │ Nombre: Juan Pérez González                             │ ║
║   │ Edad: 65 años  |  Sexo: Masculino  |  Previsión: FONASA│ ║
║   └──────────────────────────────────────────────────────────┘ ║
║                                                                 ║
║ 2️⃣ INFORMACIÓN DEL CASO                                        ║
║   Fecha de ingreso: [01/11/2024 📅]                           ║
║   Especialidad principal: [Digestivo alto    ▼]              ║
║   Especialidades secundarias: [+ Agregar especialidad]       ║
║   Episodio índice (opcional): [Buscar episodio...       ▼]   ║
║   Diagnóstico índice (opcional): [Buscar diagnóstico... ▼]   ║
║                                                                 ║
║ 3️⃣ INFORMACIÓN ONCOLÓGICA                                      ║
║   Tipo de tumor: [Adenocarcinoma gástrico________________]   ║
║   Localización: [Antro gástrico_________________________]   ║
║   Estadio TNM: [T3N1M0 ℹ️] → Estadio IIIA                     ║
║   Histología: [                                             ] ║
║               [Adenocarcinoma tipo intestinal, moderadamen- ] ║
║               [te diferenciado                               ] ║
║   Grado: [Moderadamente diferenciado ▼]                      ║
║   Biomarcadores: [HER2: Negativo, PD-L1: No aplica       ]   ║
║                                                                 ║
║ 4️⃣ EQUIPO RESPONSABLE                                          ║
║   Médico tratante: [Dr. Carlos Soto             ▼]          ║
║   Enfermera gestora: [Enf. Ana Torres           ▼]          ║
║                                                                 ║
║ 5️⃣ PLAN DE TRATAMIENTO                                         ║
║   Intención: [Curativo ▼]                                     ║
║   Plan: [Quimioterapia neoadyuvante + Cirugía + QT adyuvan-] ║
║         [te según protocolo FLOT                            ] ║
║   Protocolo: [FLOT_____________________________]            ║
║   Fecha inicio: [05/11/2024 📅]                              ║
║                                                                 ║
║ 6️⃣ OBSERVACIONES                                               ║
║   Observaciones: [___________________________________]        ║
║   ⚠️ Alertas: [Alergia a compuestos de platino____________] ║
║   Prioridad: [Alta ▼]                                         ║
║                                                                 ║
╠════════════════════════════════════════════════════════════════╣
║                                   [💾 Guardar] [❌ Cancelar]   ║
╚════════════════════════════════════════════════════════════════╝
```

**Validaciones en frontend**:
- Paciente es requerido
- Fecha de ingreso no puede ser futura
- Al menos una especialidad debe ser asignada
- Estadio TNM debe seguir formato válido (regex)

**Flujo post-creación**:
1. Validar datos
2. Crear registro en `onco_casos` (genera automáticamente `codigo_caso`)
3. Crear registro(s) en `onco_caso_especialidades`
4. Redirigir a vista de detalle del caso creado
5. Mostrar notificación de éxito con código del caso

**Entregable**:
- [ ] Formulario completo funcional
- [ ] Validaciones funcionando
- [ ] Flujo de creación end-to-end probado
- [ ] Guía de usuario para crear caso

---

#### 4.3 Vista de Detalle de Caso
**Responsable**: Desarrollador Frontend
**Duración**: 3 días

**Componente**: Details Block + Related Tables en NocoBase

**Estructura de la vista**:

**1. Header del caso**:
- Código del caso (destacado)
- Estado (badge con color)
- Paciente (link a ALMA)
- Especialidad(es) con badges de colores
- Botones de acción: Editar, Cambiar Estado, Eliminar

**2. Tabs**:
- **Tab 1: Información General**
  - Datos del paciente (desde ALMA)
  - Información oncológica
  - Equipo responsable
  - Plan de tratamiento
  - Observaciones y alertas

- **Tab 2: Episodios** (tabla relacionada: onco_episodios)
  - Listado de episodios del caso
  - [+ Agregar Episodio]
  - Columnas: Tipo, Fecha Inicio, Fecha Fin, Estado
  - Acción: Ver detalle, Editar

- **Tab 3: Seguimiento** (tabla relacionada: onco_seguimiento_eventos)
  - Timeline de eventos de seguimiento
  - [+ Agregar Evento]
  - Orden: Más reciente primero
  - Vista de timeline visual (opcional)

- **Tab 4: Comités** (tabla relacionada: onco_comite_casos)
  - Presentaciones del caso en comités
  - Columnas: Fecha Sesión, Tipo Comité, Decisión, Estado
  - Link a detalle de sesión

- **Tab 5: Historial** (auditoría)
  - Log de cambios del caso
  - Quién, qué, cuándo

**Mockup conceptual**:
```
╔════════════════════════════════════════════════════════════════╗
║ 🔙 Volver  │  CASO UGCO-2024-001        [✏️ Editar] [🔄 Estado]║
╠════════════════════════════════════════════════════════════════╣
║ 👤 Juan Pérez González (RUT: 12.345.678-9)  │  🟢 Activo       ║
║ 🏥 Digestivo alto (principal) | Oncología médica              ║
╠════════════════════════════════════════════════════════════════╣
║ [Info General] [Episodios] [Seguimiento] [Comités] [Historial]║
╠════════════════════════════════════════════════════════════════╣
║ INFORMACIÓN GENERAL                                             ║
║                                                                 ║
║ 📋 Datos del Paciente (desde ALMA)                             ║
║   RUT: 12.345.678-9                                            ║
║   Nombre: Juan Pérez González                                  ║
║   Edad: 65 años  |  Sexo: M  |  Previsión: FONASA A           ║
║   Dirección: Calle Principal 123, Ovalle                       ║
║   Teléfono: +56912345678                                       ║
║                                                                 ║
║ 🔬 Información Oncológica                                       ║
║   Tipo tumor: Adenocarcinoma gástrico                          ║
║   Localización: Antro gástrico                                 ║
║   Estadio inicial: T3N1M0 - Estadio IIIA                       ║
║   Estadio actual: T3N1M0 - Estadio IIIA                        ║
║   Histología: Adenocarcinoma tipo intestinal, mod. diferenc.  ║
║   Grado: Moderadamente diferenciado                            ║
║   Biomarcadores: HER2: Negativo, PD-L1: No aplica             ║
║                                                                 ║
║ 👥 Equipo Responsable                                           ║
║   Médico tratante: Dr. Carlos Soto                             ║
║   Enfermera gestora: Enf. Ana Torres                           ║
║                                                                 ║
║ 💊 Plan de Tratamiento                                          ║
║   Intención: Curativo                                          ║
║   Protocolo: FLOT                                              ║
║   Fecha inicio: 05/11/2024                                     ║
║   Plan: Quimioterapia neoadyuvante + Cirugía + QT adyuvante   ║
║                                                                 ║
║ 📝 Observaciones                                                ║
║   Paciente en buen estado general, colaborador.                ║
║   ⚠️ ALERTA: Alergia a compuestos de platino                   ║
║                                                                 ║
╚════════════════════════════════════════════════════════════════╝
```

**Entregable**:
- [ ] Vista de detalle completa con 5 tabs
- [ ] Navegación entre tabs funcional
- [ ] Relaciones cargando correctamente
- [ ] Botones de acción funcionando

---

### Semana 5: Vistas de Episodios, Seguimiento y Comités

#### 4.4 Formulario de Episodio Oncológico
**Responsable**: Desarrollador Frontend
**Duración**: 1 día

**Componente**: Form Block (modal o página)

**Campos**:
- Tipo de episodio (select: Cirugía, Quimioterapia, Radioterapia, etc.)
- Subtipo (text, contextual según tipo)
- Fecha inicio (datetime)
- Fecha fin (datetime, opcional)
- Duración estimada (number, días)
- Descripción (textarea)
- Objetivo (textarea)
- Profesional responsable (select)
- Lugar (text)
- Estado (select: Planificado, En curso, Completado, etc.)

**Entregable**:
- [ ] Formulario de episodio funcional
- [ ] Validación: fecha_fin >= fecha_inicio

---

#### 4.5 Timeline de Seguimiento
**Responsable**: Desarrollador Frontend
**Duración**: 2 días

**Componente**: Custom Timeline o Table con estilo de timeline

**Características**:
- Vista cronológica de eventos (más reciente primero)
- Filtros: Por tipo de evento, por especialidad, por rango de fechas
- [+ Agregar Evento]
- Cada evento muestra:
  - Fecha/hora
  - Tipo de evento (con icono)
  - Descripción
  - Profesional que registra
  - Acciones: Ver detalle, Editar

**Visual conceptual**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Filtros: [Tipo ▼] [Especialidad ▼] [Fechas]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  2024-11-20 14:30  |  📋 Consulta de seguimiento
  ┃                 |  Dr. Carlos Soto
  ┃                 |  Paciente evoluciona favorablemente...
  ┃                 |  [Ver más]
  ┃
  2024-11-15 10:00  |  📊 Resultado de examen
  ┃                 |  Enf. Ana Torres
  ┃                 |  TAC de control: Disminución de masa...
  ┃                 |  [Ver más]
  ┃
  2024-11-10 08:30  |  ⚠️ Complicación
  ┃                 |  Dr. Carlos Soto
  ┃                 |  Neutropenia febril post-QT ciclo 2...
  ┃                 |  [Ver más]
  ┃
  ▼ [Cargar más eventos]

  [+ Agregar Evento de Seguimiento]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Entregable**:
- [ ] Timeline de seguimiento funcional
- [ ] Filtros funcionando
- [ ] Formulario de agregar evento

---

#### 4.6 Vista de Sesiones de Comité
**Responsable**: Desarrollador Frontend
**Duración**: 2 días

**Componentes**:
1. **Listado de sesiones**
   - Tabla con sesiones (programadas, finalizadas)
   - Columnas: Código, Fecha, Tipo, Estado, # Casos
   - [+ Nueva Sesión]

2. **Detalle de sesión** (modal o página)
   - Información de la sesión
   - Lista de casos a discutir (con orden)
   - Formulario para registrar decisión por caso
   - Sección de acta
   - Botón [Finalizar Sesión]

**Entregable**:
- [ ] Vista de sesiones funcional
- [ ] Formulario de crear sesión
- [ ] Formulario de agregar caso a sesión
- [ ] Flujo de finalizar sesión

---

### Semana 6: Dashboards y Mejoras de UX

#### 4.7 Dashboard General UGCO
**Responsable**: Desarrollador Frontend
**Duración**: 2 días

**Componente**: Dashboard con Charts y Cards

**Widgets**:
1. **Cards de métricas clave**:
   - Total de casos activos
   - Casos nuevos este mes
   - Sesiones de comité este mes
   - Próxima sesión de comité

2. **Gráfico: Casos por Especialidad** (Pie Chart)
3. **Gráfico: Casos por Estado** (Bar Chart)
4. **Gráfico: Evolución de casos en el tiempo** (Line Chart)
5. **Tabla: Casos con alertas**
6. **Tabla: Próximos controles** (eventos con proximo_control próximo)

**Visual conceptual**:
```
╔════════════════════════════════════════════════════════════════╗
║ UGCO - Dashboard Principal                                      ║
╠════════════════════════════════════════════════════════════════╣
║ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          ║
║ │ 45       │ │ 12       │ │ 4        │ │ Próxima: │          ║
║ │ Casos    │ │ Nuevos   │ │ Comités  │ │ 25/11    │          ║
║ │ Activos  │ │ Este Mes │ │ Este Mes │ │ 10:00    │          ║
║ └──────────┘ └──────────┘ └──────────┘ └──────────┘          ║
║                                                                 ║
║ ┌─────────────────────────┐ ┌─────────────────────────┐       ║
║ │ Casos por Especialidad  │ │ Casos por Estado        │       ║
║ │     [Pie Chart]         │ │    [Bar Chart]          │       ║
║ │                         │ │                         │       ║
║ └─────────────────────────┘ └─────────────────────────┘       ║
║                                                                 ║
║ ┌───────────────────────────────────────────────────────────┐ ║
║ │ Evolución de Casos (últimos 6 meses)  [Line Chart]       │ ║
║ └───────────────────────────────────────────────────────────┘ ║
║                                                                 ║
║ ┌─────────────────────────┐ ┌─────────────────────────┐       ║
║ │ ⚠️ Casos con Alertas     │ │ 📅 Próximos Controles    │       ║
║ │ [Tabla]                 │ │ [Tabla]                 │       ║
║ └─────────────────────────┘ └─────────────────────────┘       ║
╚════════════════════════════════════════════════════════════════╝
```

**Entregable**:
- [ ] Dashboard general funcional
- [ ] Gráficos cargando datos reales
- [ ] Métricas calculando correctamente
- [ ] Actualización en tiempo real (o botón refrescar)

---

#### 4.8 Dashboard por Especialidad
**Responsable**: Desarrollador Frontend
**Duración**: 1 día

**Similar al dashboard general, pero filtrado por especialidad**.

Agregar selector de especialidad en el header para cambiar vista.

**Entregable**:
- [ ] Dashboard por especialidad funcional
- [ ] Filtro de especialidad funcionando

---

#### 4.9 Mejoras de UX
**Responsable**: Desarrollador Frontend
**Duración**: 2 días

**Mejoras**:
1. **Navegación**:
   - Breadcrumbs en todas las vistas
   - Menú lateral con secciones: Casos, Comités, Seguimiento, Dashboards, Configuración

2. **Búsqueda global**:
   - Barra de búsqueda en header
   - Buscar casos por código, nombre paciente, tipo tumor

3. **Notificaciones**:
   - Sistema de notificaciones para:
     - Próximas sesiones de comité
     - Controles pendientes
     - Casos con alertas

4. **Accesibilidad**:
   - Colores con contraste adecuado
   - Textos alternativos en iconos
   - Navegación por teclado

5. **Responsive**:
   - Adaptar vistas a móvil/tablet (básico)

**Entregable**:
- [ ] Navegación mejorada
- [ ] Búsqueda global funcionando
- [ ] Sistema de notificaciones básico
- [ ] Accesibilidad básica implementada

---

### Entregables Fase 4
- [ ] **Vistas de Casos**:
  - [ ] Listado de casos con filtros
  - [ ] Formulario de creación
  - [ ] Vista de detalle completa (5 tabs)
- [ ] **Vistas de Episodios**:
  - [ ] Formulario de episodio
- [ ] **Vistas de Seguimiento**:
  - [ ] Timeline de eventos
  - [ ] Formulario de evento
- [ ] **Vistas de Comités**:
  - [ ] Listado de sesiones
  - [ ] Detalle de sesión
  - [ ] Formularios de gestión de comité
- [ ] **Dashboards**:
  - [ ] Dashboard general
  - [ ] Dashboard por especialidad
- [ ] **UX**:
  - [ ] Navegación completa
  - [ ] Búsqueda global
  - [ ] Notificaciones
  - [ ] Accesibilidad básica

### Criterios de Éxito Fase 4
- [ ] Todas las vistas funcionales y validadas con usuarios
- [ ] Flujos de trabajo completos end-to-end probados
- [ ] UX aprobada por sponsor
- [ ] Documentación de usuario actualizada
- [ ] Training material creado

---

## FASE 5: CONFIGURACIÓN DE PERMISOS (Semana 6)

### 📅 Duración: 1 semana
### 🎯 Objetivo
Configurar roles, permisos y políticas de acceso en NocoBase para asegurar que cada usuario solo acceda a lo que le corresponde.

---

### Semana 6: Roles y Permisos

#### 5.1 Definición de Roles
**Responsable**: Analista + Líder técnico
**Duración**: 1 día

| Rol | Descripción | Cantidad Estimada |
|-----|-------------|-------------------|
| **Administrador UGCO** | Acceso completo, gestión de catálogos | 2 usuarios |
| **Médico Oncólogo** | CRUD casos, episodios, seguimiento; participar en comités | 5-8 usuarios |
| **Enfermera Gestora** | CRUD casos, episodios, seguimiento; gestión de comités | 3-5 usuarios |
| **Administrativo UGCO** | Lectura general, gestión de comités, reportes | 2-3 usuarios |
| **Auditor** | Solo lectura en todo | 1-2 usuarios |

**Entregable**:
- [ ] Documento de definición de roles
- [ ] Matriz de permisos por rol

**Matriz de Permisos**:

| Colección / Acción | Admin UGCO | Médico Onco | Enfermera Gestora | Administrativo | Auditor |
|--------------------|------------|-------------|-------------------|----------------|---------|
| **alma_pacientes** | Read | Read | Read | Read | Read |
| **alma_episodios** | Read | Read | Read | Read | Read |
| **alma_diagnosticos** | Read | Read | Read | Read | Read |
| **onco_especialidades** | CRUD | Read | Read | Read | Read |
| **onco_casos** | CRUD | CRUD | CRUD | Read | Read |
| **onco_caso_especialidades** | CRUD | CRUD | CRUD | Read | Read |
| **onco_episodios** | CRUD | CRUD | CRUD | Read | Read |
| **onco_seguimiento_eventos** | CRUD | CRUD | CRUD | Read | Read |
| **onco_comite_sesiones** | CRUD | CRUD | CRUD | CRUD | Read |
| **onco_comite_casos** | CRUD | CRUD | CRUD | CRUD | Read |

---

#### 5.2 Creación de Roles en NocoBase
**Responsable**: Desarrollador Backend + Admin NocoBase
**Duración**: 1 día

**Tareas**:
1. Crear 5 roles en NocoBase
2. Configurar permisos a nivel de colección para cada rol
3. Configurar permisos a nivel de campo (campos sensibles)
4. Configurar filtros de datos (data scopes) si aplica

**Configuración en NocoBase**:
- Ir a Settings > Roles
- Crear cada rol
- Asignar permisos collection por collection

**Entregable**:
- [ ] 5 roles creados en NocoBase
- [ ] Permisos configurados según matriz

---

#### 5.3 Configuración de Permisos a Nivel de Campo
**Responsable**: Desarrollador Backend
**Duración**: 1 día

**Campos con permisos especiales**:
- `onco_casos.observaciones`: Solo visible para Médico Onco, Enfermera, Admin
- `onco_casos.alerta`: Visible para todos (importante)
- `deleted_at`, `deleted_by`: Solo Admin

**Entregable**:
- [ ] Permisos a nivel de campo configurados

---

#### 5.4 Configuración de Data Scopes (Alcance de Datos)
**Responsable**: Desarrollador Backend
**Duración**: 1 día

**Reglas de alcance**:
- **Médico Oncólogo**: Solo ve casos donde él es `medico_tratante`
- **Enfermera Gestora**: Solo ve casos donde ella es `enfermera_gestora`
- **Admin, Auditor**: Ven todos los casos

**Implementación**:
- Configurar filtros automáticos (data scopes) en NocoBase
- O implementar en queries del backend

**Entregable**:
- [ ] Data scopes configurados
- [ ] Pruebas de acceso realizadas

---

#### 5.5 Asignación de Usuarios a Roles
**Responsable**: Admin NocoBase
**Duración**: 1 día

**Tareas**:
1. Crear usuarios de prueba (si no existen)
2. Asignar usuarios a roles
3. Validar accesos con cada rol

**Entregable**:
- [ ] Usuarios asignados a roles
- [ ] Pruebas de permisos exitosas

---

#### 5.6 Pruebas de Seguridad y Permisos
**Responsable**: QA + Desarrollador
**Duración**: 2 días

**Casos de prueba**:
1. Usuario con rol Médico Oncólogo intenta acceder a caso de otro médico → **Debe fallar**
2. Usuario con rol Auditor intenta editar un caso → **Debe fallar**
3. Usuario con rol Enfermera intenta eliminar especialidad → **Debe fallar**
4. Usuario con rol Admin intenta todo → **Debe funcionar**

**Entregable**:
- [ ] Plan de pruebas de permisos
- [ ] Ejecución de pruebas
- [ ] Reporte de bugs encontrados
- [ ] Bugs corregidos

---

### Entregables Fase 5
- [ ] 5 roles definidos y creados
- [ ] Matriz de permisos completa
- [ ] Permisos configurados a nivel de colección
- [ ] Permisos configurados a nivel de campo
- [ ] Data scopes configurados
- [ ] Usuarios asignados a roles
- [ ] Pruebas de permisos exitosas
- [ ] Documentación de permisos

### Criterios de Éxito Fase 5
- [ ] Todos los roles funcionando correctamente
- [ ] Usuarios solo acceden a lo que les corresponde
- [ ] Auditoría de accesos funcionando
- [ ] Sin vulnerabilidades de seguridad identificadas
- [ ] Documentación de permisos aprobada

---

## FASE 6: DATOS MAESTROS (Semana 7)

### 📅 Duración: 1 semana
### 🎯 Objetivo
Cargar catálogos, datos iniciales y realizar migraciones de datos históricos (si aplica).

---

### Semana 7: Carga de Datos

#### 6.1 Carga de Catálogos
**Responsable**: Desarrollador Backend + Administrativo
**Duración**: 2 días

**Catálogos a cargar**:
1. **onco_especialidades** (10 especialidades) - ✅ Ya definido en Fase 2
2. **Usuarios** (médicos, enfermeras, administrativos)
3. **Valores de dominio** (si se usan tablas separadas):
   - Tipos de episodio
   - Tipos de evento
   - Estados

**Scripts**:
```javascript
// scripts/seed-all-data.js
const seedEspecialidades = require('./seed-especialidades');
const seedUsers = require('./seed-users');
const seedDomainValues = require('./seed-domain-values');

async function seedAll() {
  console.log('Cargando especialidades...');
  await seedEspecialidades();

  console.log('Cargando usuarios...');
  await seedUsers();

  console.log('Cargando valores de dominio...');
  await seedDomainValues();

  console.log('✅ Todos los datos maestros cargados');
}

seedAll();
```

**Entregable**:
- [ ] Scripts de seed data completos
- [ ] Datos maestros cargados en ambiente QA
- [ ] Validación de datos

---

#### 6.2 Migración de Datos Históricos (si aplica)
**Responsable**: Desarrollador Backend + DBA
**Duración**: 3 días

**Si existen casos oncológicos históricos en otros sistemas** (ej: Excel, otro sistema legacy):

**Proceso**:
1. **Análisis de datos históricos**:
   - Obtener fuente de datos (Excel, CSV, BD legacy)
   - Mapear campos a modelo UGCO
   - Identificar datos faltantes

2. **Limpieza de datos**:
   - Normalizar formatos
   - Completar datos faltantes (coordinar con equipo clínico)
   - Validar integridad

3. **Script de migración**:
   ```javascript
   // scripts/migrate-historical-data.js
   async function migrateHistoricalCases() {
     const historicalData = await readCSV('casos_historicos.csv');

     for (const row of historicalData) {
       try {
         // 1. Buscar/crear paciente en alma_pacientes
         const paciente = await findOrCreatePaciente(row);

         // 2. Crear caso en onco_casos
         const caso = await createCaso({
           id_paciente_alma: paciente.id,
           fecha_ingreso_ugco: row.fecha_ingreso,
           tipo_tumor: row.tipo_tumor,
           // ... resto de campos
         });

         // 3. Asignar especialidad
         await assignEspecialidad(caso.id, row.especialidad);

         console.log(`✅ Caso ${caso.codigo_caso} migrado`);
       } catch (error) {
         console.error(`❌ Error migrando caso ${row.id}:`, error);
       }
     }
   }
   ```

4. **Ejecutar migración en ambiente QA**
5. **Validar datos migrados**
6. **Ejecutar migración en producción** (durante la implementación final)

**Entregable**:
- [ ] Script de migración completo
- [ ] Datos históricos migrados en QA
- [ ] Reporte de migración (casos exitosos, errores)
- [ ] Validación de datos migrados

**IMPORTANTE**: Si NO hay datos históricos, esta sub-fase se omite.

---

#### 6.3 Validación de Datos
**Responsable**: Equipo Clínico + QA
**Duración**: 2 días

**Validaciones**:
1. Especialidades cargadas correctamente (10)
2. Usuarios creados con roles correctos
3. Datos históricos (si aplica) son correctos y completos

**Entregable**:
- [ ] Checklist de validación
- [ ] Validación completada
- [ ] Correcciones aplicadas

---

### Entregables Fase 6
- [ ] Catálogos cargados (especialidades, usuarios, valores de dominio)
- [ ] Datos históricos migrados (si aplica)
- [ ] Scripts de seed data y migración
- [ ] Validación de datos completada
- [ ] Reporte de calidad de datos

### Criterios de Éxito Fase 6
- [ ] Todos los catálogos cargados sin errores
- [ ] Datos históricos migrados correctamente (si aplica)
- [ ] Validación de datos aprobada por equipo clínico
- [ ] Sistema listo para uso en producción con datos reales

---

## FASE 7: PRUEBAS (Semanas 7-8)

### 📅 Duración: 2 semanas
### 🎯 Objetivo
Realizar pruebas completas del sistema: unitarias, integración, funcionales, aceptación de usuario.

---

### Semana 7: Pruebas Técnicas

#### 7.1 Pruebas Unitarias (Backend)
**Responsable**: Desarrollador Backend
**Duración**: 2 días

**Cobertura**:
- Servicios UGCO
- Validaciones
- Métricas
- Hooks

**Framework**: Jest

**Objetivo**: Cobertura > 80%

**Entregable**:
- [ ] Suite de pruebas unitarias completa
- [ ] Cobertura de código > 80%
- [ ] Reporte de cobertura

---

#### 7.2 Pruebas de Integración
**Responsable**: Desarrollador Backend + QA
**Duración**: 2 días

**Pruebas**:
- Integración MIRA ↔ NocoBase
- Integración NocoBase ↔ SQL ALMA
- Flujos end-to-end (crear caso, agregar episodio, etc.)

**Herramienta**: Supertest, Postman

**Entregable**:
- [ ] Suite de pruebas de integración
- [ ] Todas las pruebas pasando
- [ ] Reporte de pruebas

---

#### 7.3 Pruebas de Rendimiento
**Responsable**: Desarrollador + DevOps
**Duración**: 1 día

**Pruebas**:
- Tiempo de carga de vistas (target: < 2s)
- Tiempo de creación de caso (target: < 1s)
- Consultas complejas (target: < 3s)
- Carga concurrente (10 usuarios simultáneos)

**Herramienta**: Apache JMeter o k6

**Entregable**:
- [ ] Plan de pruebas de rendimiento
- [ ] Ejecución de pruebas
- [ ] Reporte de rendimiento
- [ ] Optimizaciones aplicadas (si es necesario)

---

### Semana 8: Pruebas Funcionales y UAT

#### 7.4 Pruebas Funcionales
**Responsable**: QA
**Duración**: 3 días

**Casos de prueba** (ejemplos):
1. **Caso de Prueba: Crear Nuevo Caso**
   - Precondición: Usuario con rol Médico Oncólogo logueado
   - Pasos:
     1. Ir a "Casos Oncológicos"
     2. Click en "+ Nuevo Caso"
     3. Buscar paciente por RUT
     4. Completar formulario
     5. Guardar
   - Resultado esperado: Caso creado, redirige a detalle, código generado automáticamente

2. **Caso de Prueba: Agregar Episodio a Caso**
   - ...

3. **Caso de Prueba: Finalizar Sesión de Comité**
   - ...

**(Total: 30-40 casos de prueba)**

**Entregable**:
- [ ] Plan de pruebas funcionales (30-40 casos)
- [ ] Ejecución de todos los casos
- [ ] Reporte de bugs encontrados
- [ ] Bugs críticos corregidos

---

#### 7.5 Pruebas de Aceptación de Usuario (UAT)
**Responsable**: Equipo Clínico (usuarios finales) + Analista
**Duración**: 4 días

**Participantes**:
- 2 médicos oncólogos
- 2 enfermeras gestoras
- 1 administrativo

**Proceso**:
1. **Día 1: Capacitación básica** (2 horas)
2. **Días 2-3: Uso del sistema con casos reales**
   - Cada usuario crea, edita, busca casos
   - Registra episodios y seguimientos
   - Crea y gestiona sesiones de comité
3. **Día 4: Sesión de feedback**
   - Recoger comentarios
   - Identificar mejoras
   - Priorizar cambios

**Criterios de aceptación**:
- [ ] Usuarios pueden completar flujos principales sin ayuda
- [ ] Satisfacción > 7/10
- [ ] < 5 bugs críticos reportados
- [ ] Mejoras identificadas priorizadas

**Entregable**:
- [ ] Plan de UAT
- [ ] Sesiones de UAT completadas
- [ ] Feedback documentado
- [ ] Mejoras prioritarias implementadas
- [ ] Firma de aceptación de usuarios

---

### Entregables Fase 7
- [ ] Suite de pruebas unitarias (cobertura > 80%)
- [ ] Suite de pruebas de integración
- [ ] Pruebas de rendimiento ejecutadas
- [ ] Plan de pruebas funcionales completo
- [ ] UAT completado con aceptación de usuarios
- [ ] Todos los bugs críticos corregidos
- [ ] Reporte final de pruebas

### Criterios de Éxito Fase 7
- [ ] Todas las pruebas pasando
- [ ] Cobertura de código > 80%
- [ ] Rendimiento cumple targets
- [ ] UAT aprobado por usuarios
- [ ] Sistema estable y listo para producción

---

## FASE 8: CAPACITACIÓN Y DESPLIEGUE (Semanas 9-10)

### 📅 Duración: 2 semanas
### 🎯 Objetivo
Capacitar a todos los usuarios, desplegar el sistema en producción y realizar seguimiento post-lanzamiento.

---

### Semana 9: Capacitación

#### 8.1 Preparación de Material de Capacitación
**Responsable**: Analista + Desarrollador Frontend
**Duración**: 2 días

**Materiales**:
1. **Manual de Usuario** (PDF, 20-30 páginas)
   - Introducción a UGCO
   - Guía de navegación
   - Tutoriales paso a paso:
     - Crear caso
     - Agregar episodio
     - Registrar seguimiento
     - Gestionar comité
   - FAQ

2. **Videos tutoriales** (5-7 videos, 5-10 min c/u)
   - Intro a UGCO (5 min)
   - Crear y gestionar casos (10 min)
   - Seguimiento de pacientes (8 min)
   - Comités oncológicos (10 min)
   - Dashboards y reportes (7 min)

3. **Guías rápidas** (1 página por flujo, PDF)

**Entregable**:
- [ ] Manual de usuario completo
- [ ] 5-7 videos tutoriales
- [ ] Guías rápidas

---

#### 8.2 Sesiones de Capacitación Grupal
**Responsable**: Analista + Sponsor
**Duración**: 3 días

**Sesiones** (presenciales o virtuales):

| Sesión | Audiencia | Duración | Contenido |
|--------|-----------|----------|-----------|
| 1 | Médicos Oncólogos | 2 horas | Gestión de casos, episodios, seguimiento |
| 2 | Enfermeras Gestoras | 2 horas | Gestión de casos, comités, seguimiento |
| 3 | Administrativos | 1.5 horas | Gestión de comités, reportes, dashboards |
| 4 | Todos los usuarios | 1 hora | Q&A, dudas generales |

**Contenido de cada sesión**:
1. Introducción (10 min)
2. Demo en vivo (30-45 min)
3. Práctica guiada (30-45 min)
4. Q&A (15-20 min)

**Entregable**:
- [ ] Calendario de sesiones
- [ ] 4 sesiones completadas
- [ ] Asistencia registrada
- [ ] Feedback de capacitación

---

#### 8.3 Capacitación Individual (si necesario)
**Responsable**: Analista
**Duración**: 2 días

Para usuarios que requieran atención individual.

**Entregable**:
- [ ] Sesiones individuales completadas

---

### Semana 10: Despliegue y Go-Live

#### 8.4 Preparación de Producción
**Responsable**: DevOps + Desarrollador Backend
**Duración**: 1 día

**Tareas**:
1. Crear ambiente de producción (si no existe)
2. Configurar backup automático
3. Configurar monitoreo y alertas
4. Validar seguridad (SSL, firewalls, etc.)
5. Crear plan de rollback

**Entregable**:
- [ ] Ambiente de producción listo
- [ ] Backup configurado
- [ ] Monitoreo activo
- [ ] Plan de rollback documentado

---

#### 8.5 Migración de Datos a Producción
**Responsable**: Desarrollador Backend + DBA
**Duración**: 1 día

**Tareas**:
1. Ejecutar scripts de creación de colecciones en producción
2. Cargar catálogos (especialidades, usuarios)
3. Migrar datos históricos (si aplica) - ejecutar en horario de baja demanda
4. Validar integridad de datos

**Entregable**:
- [ ] Colecciones creadas en producción
- [ ] Datos maestros cargados
- [ ] Datos históricos migrados (si aplica)
- [ ] Validación completada

---

#### 8.6 Go-Live (Lanzamiento)
**Responsable**: Todo el equipo
**Duración**: 1 día

**Proceso**:
1. **Comunicación**: Anunciar lanzamiento a usuarios
2. **Activación**: Habilitar acceso a producción
3. **Soporte intensivo**: Equipo disponible para resolver incidencias
4. **Monitoreo**: Seguimiento continuo de logs y métricas

**Horario sugerido**: Lunes a primera hora (para tener toda la semana de soporte)

**Entregable**:
- [ ] Sistema en producción y accesible
- [ ] Usuarios accediendo sin problemas
- [ ] Incidencias resueltas en tiempo real

---

#### 8.7 Seguimiento Post-Lanzamiento
**Responsable**: Analista + Desarrollador
**Duración**: Semana 1-2 post-lanzamiento

**Actividades**:
1. **Días 1-3**: Soporte intensivo (8 horas/día)
2. **Días 4-7**: Soporte normal (4 horas/día)
3. **Semana 2**: Reuniones de seguimiento con usuarios (2 por semana)
4. **Semana 2-4**: Recolección de mejoras y bugs menores

**Métricas a monitorear**:
- Usuarios activos diarios
- Casos creados por día
- Tiempo promedio de uso
- Incidencias reportadas
- Satisfacción de usuarios

**Entregable**:
- [ ] Reporte semanal de uso del sistema
- [ ] Lista de mejoras identificadas
- [ ] Plan de mejora continua

---

#### 8.8 Cierre del Proyecto
**Responsable**: Sponsor + Líder técnico
**Duración**: 1 día

**Actividades**:
1. Reunión de cierre con stakeholders
2. Presentación de resultados vs. objetivos
3. Entrega de documentación final
4. Transición a soporte operativo
5. Retrospectiva del equipo

**Entregable**:
- [ ] Reporte final del proyecto
- [ ] Lecciones aprendidas
- [ ] Documentación completa entregada
- [ ] Plan de mejora continua (roadmap futuro)

---

### Entregables Fase 8
- [ ] Material de capacitación completo (manual, videos, guías)
- [ ] Sesiones de capacitación completadas (4 sesiones)
- [ ] Sistema desplegado en producción
- [ ] Datos migrados a producción
- [ ] Go-Live exitoso
- [ ] Seguimiento post-lanzamiento completado
- [ ] Proyecto cerrado formalmente

### Criterios de Éxito Fase 8
- [ ] 100% de usuarios capacitados
- [ ] Sistema en producción funcionando estable
- [ ] < 3 incidencias críticas en la primera semana
- [ ] Satisfacción de usuarios > 8/10
- [ ] Adopción > 80% después de 2 semanas
- [ ] Documentación completa entregada
- [ ] Proyecto cerrado con aprobación de sponsor

---

## 11. CRONOGRAMA GANTT

```
Semana →  1    2    3    4    5    6    7    8    9    10
─────────────────────────────────────────────────────────────
Fase 1    ████ ████
Fase 2         ████ ████
Fase 3              ████ ████
Fase 4                   ████ ████ ████
Fase 5                             ████
Fase 6                                  ████
Fase 7                                  ████ ████
Fase 8                                       ████ ████ ████
─────────────────────────────────────────────────────────────
Hitos:
  ✓ Sem 2: Modelo de datos aprobado
  ✓ Sem 4: Servicios de negocio funcionando
  ✓ Sem 6: UI completo y permisos configurados
  ✓ Sem 8: Pruebas completas finalizadas
  ✓ Sem 10: Sistema en producción

Nota: Algunas fases se solapan intencionalmente para optimizar el cronograma.
```

---

## 12. RECURSOS NECESARIOS

### 12.1 Equipo de Desarrollo

| Rol | Dedicación | Fases Principales |
|-----|------------|-------------------|
| **Líder Técnico** | 50% (20 hrs/sem) | Todas las fases |
| **Analista de Negocio** | 100% (40 hrs/sem) | Fases 1, 4, 7, 8 |
| **Desarrollador Backend** | 100% (40 hrs/sem) | Fases 2, 3, 5, 6 |
| **Desarrollador Frontend** | 100% (40 hrs/sem) | Fase 4 |
| **QA Tester** | 50% (20 hrs/sem) | Fases 5, 7 |
| **DevOps** | 25% (10 hrs/sem) | Fases 1, 7, 8 |

**Total horas estimadas**: ~1,200 horas

---

### 12.2 Equipo Clínico (SMEs)

| Rol | Dedicación | Fases Principales |
|-----|------------|-------------------|
| **Médico Oncólogo** | 3 hrs/sem | Fases 1, 3, 4, 7, 8 |
| **Enfermera Gestora** | 3 hrs/sem | Fases 1, 4, 7, 8 |
| **Administrativo** | 2 hrs/sem | Fases 1, 6, 8 |

**Total horas estimadas**: ~120 horas

---

### 12.3 Infraestructura

| Recurso | Descripción | Costo Estimado |
|---------|-------------|----------------|
| **Servidor NocoBase** | Ya existente | $0 |
| **SQL Intermedio ALMA** | Ya existente | $0 |
| **Ambiente QA** | Clonar producción | $0 (si en mismo servidor) |
| **Backup storage** | Para backups automáticos | $50/mes |
| **Monitoreo (New Relic/Datadog)** | Opcional | $100/mes |

**Total infraestructura**: ~$150/mes

---

### 12.4 Software y Herramientas

| Herramienta | Propósito | Costo |
|-------------|-----------|-------|
| **NocoBase** | Plataforma principal | $0 (open source) |
| **Node.js + npm** | Runtime backend | $0 |
| **Git + GitHub/GitLab** | Control de versiones | $0 |
| **Postman** | Pruebas de API | $0 (free plan) |
| **Jest** | Pruebas unitarias | $0 |
| **VS Code** | IDE | $0 |
| **Figma** (opcional) | Diseño de UI | $0 (free plan) |

**Total software**: $0

---

## 13. DEPENDENCIAS CRÍTICAS

### 13.1 Dependencias Externas

| Dependencia | Descripción | Responsable | Fecha Límite |
|-------------|-------------|-------------|--------------|
| **Vistas SQL ALMA** | Vistas adicionales en SQL intermedio (si se requieren) | TI Hospital | Semana 1 |
| **Token API NocoBase** | Token válido y con permisos | Admin NocoBase Hospital | Semana 1 (ya disponible ✅) |
| **Usuarios para pruebas** | Usuarios de prueba con diferentes roles | RRHH Hospital | Semana 5 |
| **Datos históricos** (si aplica) | Casos oncológicos históricos para migrar | Equipo Oncología | Semana 6 |

---

### 13.2 Dependencias Internas

| Dependencia | Descripción | Bloquea a |
|-------------|-------------|-----------|
| **Fase 1 aprobada** | Modelo de datos y requisitos validados | Fase 2 |
| **Fase 2 completada** | Colecciones creadas | Fases 3, 4 |
| **Fase 4 completada** | UI funcional | Fase 7 (UAT) |
| **Fase 7 aprobada** | UAT exitoso | Fase 8 (Go-Live) |

---

## 14. RIESGOS Y MITIGACIONES

### 14.1 Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **SQL intermedio no tiene datos necesarios** | Media | Alto | - Validar esquema SQL en Fase 1<br>- Coordinar con TI para crear vistas adicionales tempranamente |
| **Rendimiento de consultas complejas** | Media | Medio | - Implementar índices adecuados<br>- Usar caché Redis para queries frecuentes<br>- Optimizar queries con JOIN |
| **Bugs críticos en NocoBase** | Baja | Alto | - Mantener NocoBase actualizado<br>- Tener plan de rollback<br>- Reportar bugs a comunidad NocoBase |
| **Pérdida de conexión con ALMA** | Media | Alto | - Implementar retry automático<br>- Alertas de monitoreo<br>- Cache de datos críticos |

---

### 14.2 Riesgos Funcionales

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Requisitos oncológicos incompletos** | Alta | Alto | - Talleres con oncólogos en Fase 1<br>- Validaciones incrementales en Fase 4<br>- UAT en Fase 7 |
| **Cambios en flujos de trabajo durante desarrollo** | Media | Medio | - Desarrollo iterativo<br>- Validación cada 2 semanas<br>- Flexibilidad para ajustes |
| **Resistencia al cambio** | Media | Alto | - Involucrar a usuarios desde Fase 1<br>- Capacitación completa<br>- Comunicación constante |

---

### 14.3 Riesgos de Proyecto

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Falta de disponibilidad de usuarios clave** | Media | Medio | - Planificar sesiones con anticipación<br>- Tener usuarios backup<br>- Grabar sesiones |
| **Cambios en prioridades del hospital** | Baja | Alto | - Mantener comunicación con sponsor<br>- Mostrar avances cada 2 semanas<br>- Justificar valor del proyecto |
| **Sobrecarga del equipo de desarrollo** | Media | Medio | - Planificación realista<br>- Priorizar funcionalidades core<br>- Pedir recursos adicionales si es necesario |
| **Retrasos en fases críticas** | Media | Alto | - Seguimiento semanal de avance<br>- Identificar retrasos temprano<br>- Ajustar cronograma si es necesario |

---

## 15. CRITERIOS DE ÉXITO DEL PROYECTO

### 15.1 Criterios Técnicos
- [x] Modelo de datos completo implementado (10 colecciones)
- [ ] Todas las colecciones funcionando sin errores
- [ ] Integridad referencial verificada
- [ ] Rendimiento cumple targets (< 2s queries)
- [ ] Seguridad y permisos configurados correctamente
- [ ] Cobertura de pruebas > 80%
- [ ] Sistema estable en producción (disponibilidad > 99%)

### 15.2 Criterios Funcionales
- [ ] 100% de flujos de trabajo implementados
- [ ] Usuarios pueden completar tareas sin ayuda
- [ ] Dashboards mostrando métricas correctas
- [ ] Reportes generados correctamente
- [ ] Integridad de datos ALMA preservada (read-only)

### 15.3 Criterios de Adopción
- [ ] 100% de usuarios capacitados
- [ ] > 80% de usuarios activos después de 1 mes
- [ ] > 90% de casos registrados en UGCO
- [ ] Satisfacción de usuarios > 8/10
- [ ] < 5 incidencias críticas en el primer mes

### 15.4 Criterios de Negocio
- [ ] Reducción de 50% en tiempo de preparación de comités
- [ ] Trazabilidad completa de seguimiento de pacientes
- [ ] Reportes automáticos disponibles
- [ ] Sistema escalable para otras unidades (ej: UGCH - Cardiología)

---

## 16. PRÓXIMOS PASOS INMEDIATOS

### Acción Inmediata (Esta Semana)

1. **Revisión y aprobación de documentación**:
   - [ ] Revisar [DIAGNOSTICO-COMPLETO.md](../docs/DIAGNOSTICO-COMPLETO.md)
   - [ ] Revisar [DICCIONARIO-DATOS.md](../docs/modelo-datos/DICCIONARIO-DATOS.md)
   - [ ] Revisar este Plan de Implementación
   - [ ] Reunión con sponsor para aprobación

2. **Coordinación con TI Hospital**:
   - [ ] Solicitar reunión con DBA para revisar SQL intermedio ALMA
   - [ ] Validar acceso a ambientes NocoBase (DEV, QA, PROD)
   - [ ] Confirmar disponibilidad de TI para soporte

3. **Formación del equipo**:
   - [ ] Confirmar disponibilidad de desarrolladores
   - [ ] Asignar roles y responsabilidades
   - [ ] Calendario inicial de trabajo

4. **Inicio de Fase 1**:
   - [ ] Programar talleres con usuarios (3 talleres)
   - [ ] Iniciar análisis de SQL intermedio ALMA
   - [ ] Configurar ambientes de desarrollo

---

## APÉNDICES

### Apéndice A: Glosario

| Término | Definición |
|---------|------------|
| **ALMA** | Sistema maestro de registro clínico del Hospital de Ovalle, basado en TrakCare |
| **NocoBase** | Plataforma no-code/low-code para desarrollo de aplicaciones |
| **SQL Intermedio** | Base de datos SQL que sincroniza datos desde ALMA y se conecta a NocoBase |
| **UGCO** | Unidad de Gestión de Casos Oncológicos |
| **TNM** | Sistema de clasificación de tumores (Tumor, Nodo, Metástasis) |
| **CIE-10** | Clasificación Internacional de Enfermedades, 10ª revisión |
| **UAT** | User Acceptance Testing (Pruebas de Aceptación de Usuario) |

---

### Apéndice B: Contactos Clave

| Rol | Nombre | Email | Teléfono |
|-----|--------|-------|----------|
| **Sponsor del Proyecto** | TBD | - | - |
| **Líder Equipo Oncología** | TBD | - | - |
| **DBA Hospital** | TBD | - | - |
| **Admin NocoBase** | TBD | - | - |
| **Líder Técnico UGCO** | TBD | - | - |

---

### Apéndice C: Referencias

- [Documentación NocoBase](https://docs.nocobase.com)
- [Documentación MIRA](../README.md)
- [Diagnóstico UGCO](../docs/DIAGNOSTICO-COMPLETO.md)
- [Diccionario de Datos](../docs/modelo-datos/DICCIONARIO-DATOS.md)
- [CHANGELOG](../CHANGELOG.md)

---

**Documento elaborado por**: Claude Code
**Fecha**: 2025-11-21
**Versión**: 1.0.0
**Estado**: PLANIFICACIÓN - Pendiente de aprobación

---

**FIN DEL PLAN DE IMPLEMENTACIÓN**
