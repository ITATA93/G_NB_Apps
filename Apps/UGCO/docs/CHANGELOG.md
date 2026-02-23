# Registro de Cambios - UGCO
## Unidad de Gestión de Casos Oncológicos

Todos los cambios notables en el proyecto UGCO serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [No Publicado] - 2025-11-21

### Agregado

- **[DOCS]** Documento de registro de errores y soluciones ([ERRORES-Y-SOLUCIONES.md](docs/ERRORES-Y-SOLUCIONES.md))
  - Error #1: API devolviendo 0 colecciones - RESUELTO ✅
  - Template para documentar futuros errores
  - Estadísticas de resolución
- **[SCRIPTS]** Cliente base para API de NocoBase ([_base-api-client.js](scripts/_base-api-client.js))
  - Implementación correcta de peticiones HTTP/HTTPS
  - Manejo adecuado de query parameters
  - Clase `NocoBaseClient` con métodos GET, POST, PUT, DELETE
  - Funciones helper: `testConnection()`, `getCollections()`, etc.
- **[SCRIPTS]** Script de diagnóstico de conexión ([test-connection.js](scripts/test-connection.js))
  - Prueba 4 tipos diferentes de endpoints
  - Muestra detalles completos de peticiones y respuestas
  - Útil para debugging de problemas de conectividad
- **[SCRIPTS]** Script corregido para listar colecciones ([list-all-collections-fixed.js](scripts/list-all-collections-fixed.js))
  - Lista correctamente todas las colecciones
  - Clasifica por tipo (UGCO, Sistema, Otras)
  - Muestra esquema detallado de cada colección
  - Detecta colecciones vacías

### Corregido

- **[BUG-001]** Scripts devolvían 0 colecciones cuando existían 8
  - **Causa**: No se incluía `url.search` en el path de las peticiones HTTP
  - **Solución**: Modificar `path: urlObj.pathname + urlObj.search`
  - **Archivos afectados**: Todos los scripts de API
  - **Ver**: [ERRORES-Y-SOLUCIONES.md](docs/ERRORES-Y-SOLUCIONES.md#error-1)

### Obsoleto

- **[SCRIPTS]** Los siguientes scripts tienen implementación incorrecta y NO deben usarse:
  - ⚠️ `scripts/inspect-databases.js` - Usar `list-all-collections-fixed.js` en su lugar
  - ⚠️ `scripts/inspect-pages.js` - Pendiente actualizar
  - ⚠️ `scripts/manage-plugins-simple.js` - Pendiente actualizar

### Cambiado

- Nada en esta versión

---

## [1.0.0] - 2025-11-21 - FASE DE DISEÑO

### 🏗️ Fundación del Proyecto

#### Documentación
- **[AGREGADO]** Diagnóstico completo del sistema ([DIAGNOSTICO-COMPLETO.md](docs/DIAGNOSTICO-COMPLETO.md))
  - Análisis de infraestructura MIRA existente
  - Evaluación de capacidades actuales
  - Identificación de brechas
  - Definición de arquitectura del sistema
  - Plan de implementación en 8 fases

- **[AGREGADO]** Diccionario de datos completo ([DICCIONARIO-DATOS.md](docs/modelo-datos/DICCIONARIO-DATOS.md))
  - 3 colecciones ALMA (read-only): `alma_pacientes`, `alma_episodios`, `alma_diagnosticos`
  - 7 colecciones UGCO (read/write):
    - `onco_especialidades` - Catálogo de especialidades oncológicas
    - `onco_casos` - **Entidad central** de casos oncológicos
    - `onco_caso_especialidades` - Relación N:N casos-especialidades
    - `onco_episodios` - Episodios oncológicos (cirugías, quimio, radio, etc.)
    - `onco_comite_sesiones` - Sesiones del comité oncológico
    - `onco_comite_casos` - Casos discutidos en comité
    - `onco_seguimiento_eventos` - Eventos de seguimiento
  - Especificación completa de campos, tipos, relaciones, índices
  - Definición de valores de dominio (estados, tipos)
  - Validaciones de negocio

- **[AGREGADO]** Sistema de registro de cambios (este archivo CHANGELOG.md)
  - Formato estandarizado basado en Keep a Changelog
  - Versionado semántico
  - Categorización de cambios

#### Estructura de Directorios
- **[CREADO]** Estructura base del proyecto UGCO:
  ```
  C:\GIT\MIRA\UGCO\
  ├── docs/
  │   ├── arquitectura/
  │   ├── modelo-datos/
  │   ├── diccionarios/
  │   └── api/
  ├── planificacion/
  └── CHANGELOG.md
  ```

### 📋 Modelo de Datos Definido

#### Colecciones ALMA (Read-Only)
- **[DEFINIDO]** `alma_pacientes`: 15 campos (id, rut, nombre, fecha_nacimiento, sexo, etc.)
- **[DEFINIDO]** `alma_episodios`: 12 campos (id, id_paciente, tipo_episodio, fechas, etc.)
- **[DEFINIDO]** `alma_diagnosticos`: 11 campos (id, id_episodio, codigo_cie10, etc.)

#### Colecciones UGCO (Read/Write)
- **[DEFINIDO]** `onco_especialidades`: 12 campos
  - Catálogo maestro con 10 especialidades iniciales
  - Códigos únicos, colores para UI

- **[DEFINIDO]** `onco_casos`: 32 campos
  - **Entidad central del sistema**
  - Referencias a ALMA: id_paciente_alma, id_episodio_indice, id_diagnostico_indice
  - Información oncológica completa: tipo_tumor, estadio TNM, histología, biomarcadores
  - Equipo responsable: médico_tratante, enfermera_gestora
  - Auditoría completa con soft delete

- **[DEFINIDO]** `onco_caso_especialidades`: 10 campos
  - Relación N:N entre casos y especialidades
  - Flag `es_principal` para especialidad principal del caso

- **[DEFINIDO]** `onco_episodios`: 18 campos
  - Tipos: Cirugía, Quimioterapia, Radioterapia, Inmunoterapia, etc.
  - Estados: Planificado, En curso, Completado, Suspendido, Cancelado

- **[DEFINIDO]** `onco_comite_sesiones`: 20 campos
  - Tipos: Regular, Extraordinario, Urgente, Multidisciplinario
  - Modalidades: Presencial, Virtual, Híbrida
  - Actas, acuerdos, asistentes

- **[DEFINIDO]** `onco_comite_casos`: 14 campos
  - Casos discutidos en cada sesión
  - Decisiones, recomendaciones, derivaciones

- **[DEFINIDO]** `onco_seguimiento_eventos`: 16 campos
  - Tipos: Consulta, Examen, Resultado, Complicación, Cambio de tratamiento
  - Registro completo de evolución del caso

### 🔗 Relaciones Definidas
- **[DEFINIDO]** 15 relaciones entre colecciones
  - Relaciones 1:N entre ALMA y UGCO
  - Relación N:N casos-especialidades
  - Relaciones 1:N internas en UGCO

### 📐 Convenciones Establecidas
- **[ESTABLECIDO]** Nomenclatura snake_case
- **[ESTABLECIDO]** Prefijos: `alma_` (read-only), `onco_` (read/write)
- **[ESTABLECIDO]** Campos de auditoría estándar: created_at, updated_at, created_by, updated_by
- **[ESTABLECIDO]** Soft delete en colecciones críticas

### 🎯 Valores de Dominio
- **[DEFINIDO]** 7 catálogos de valores:
  - estado_caso: 7 valores (Activo, Seguimiento, Alta, Fallecido, Perdido, Derivado, Suspendido)
  - tipo_episodio: 10 valores (Cirugía, Quimioterapia, Radioterapia, etc.)
  - estado_episodio: 6 valores (Planificado, En curso, Completado, etc.)
  - tipo_comite: 4 valores (Regular, Extraordinario, Urgente, Multidisciplinario)
  - estado_sesion: 5 valores (Programada, En curso, Finalizada, Cancelada, Pospuesta)
  - estado_caso_comite: 5 valores (Pendiente, Presentado, Diferido, Derivado, Resuelto)
  - tipo_evento: 9 valores (Consulta, Examen, Resultado, etc.)

### 🔐 Seguridad y Permisos (Planificado)
- **[PLANIFICADO]** Permisos read-only en colecciones alma_*
- **[PLANIFICADO]** Permisos CRUD en colecciones onco_* según roles:
  - Médico Oncólogo
  - Enfermera Gestora
  - Administrativo
  - Auditor

### 📊 Plan de Implementación
- **[DEFINIDO]** Fase 1: Fundación (Semana 1-2)
- **[DEFINIDO]** Fase 2: Modelo de Datos (Semana 2-3)
- **[DEFINIDO]** Fase 3: Servicios de Negocio (Semana 3-4)
- **[DEFINIDO]** Fase 4: Frontend NocoBase (Semana 4-6)
- **[DEFINIDO]** Fase 5: Configuración de Permisos (Semana 6)
- **[DEFINIDO]** Fase 6: Datos Maestros (Semana 7)
- **[DEFINIDO]** Fase 7: Pruebas (Semana 7-8)
- **[DEFINIDO]** Fase 8: Capacitación y Despliegue (Semana 9-10)

### 🛠️ Infraestructura Técnica Existente
- **[VALIDADO]** Plataforma MIRA funcionando
  - Cliente NocoBase completo
  - Servicio NocoBase con métodos de negocio
  - Integración con Hospital de Ovalle (https://nocobase.hospitaldeovalle.cl/)
  - Token API válido hasta 2075

- **[VALIDADO]** SQL intermedio de ALMA conectado a NocoBase
- **[VALIDADO]** Stack tecnológico completo:
  - Node.js + Express
  - NocoBase como plataforma principal
  - PostgreSQL/MySQL
  - Redis (caché)
  - Winston (logging)

### 📈 Métricas de Éxito Definidas
- **[DEFINIDO]** Métricas técnicas: Tiempo de respuesta < 2s, disponibilidad > 99%
- **[DEFINIDO]** Métricas funcionales: 100% casos registrados, reducción 50% tiempo preparación comités
- **[DEFINIDO]** Métricas de adopción: 80% usuarios activos después de 1 mes

---

## Tipos de Cambios

### Categorías Principales
- **AGREGADO**: Nuevas funcionalidades
- **CAMBIADO**: Cambios en funcionalidad existente
- **OBSOLETO**: Funcionalidad que será eliminada
- **ELIMINADO**: Funcionalidad eliminada
- **CORREGIDO**: Corrección de bugs
- **SEGURIDAD**: Vulnerabilidades corregidas

### Categorías Específicas UGCO
- **MODELO**: Cambios en modelo de datos (colecciones, campos, relaciones)
- **API**: Cambios en API NocoBase o MIRA
- **UI**: Cambios en interface de usuario NocoBase
- **PERMISOS**: Cambios en configuración de roles y permisos
- **DATOS**: Cambios en datos maestros o migraciones
- **DOCS**: Cambios en documentación
- **CONFIG**: Cambios en configuración del sistema

---

## Convenciones de Versionado

Este proyecto usa [Versionado Semántico](https://semver.org/lang/es/):

**MAJOR.MINOR.PATCH**

- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de bugs compatibles

### Ejemplos:
- `1.0.0`: Primera versión estable en producción
- `1.1.0`: Agregar nueva funcionalidad (ej: reportes)
- `1.1.1`: Corregir bug en formularios
- `2.0.0`: Cambio incompatible (ej: reestructuración de modelo de datos)

---

## Formato de Entradas

Cada entrada debe seguir este formato:

```markdown
### Categoría
- **[TIPO]** Descripción del cambio
  - Detalles adicionales si son necesarios
  - Referencia a issue/ticket: #123
  - Autor: @usuario
  - Archivo(s) afectado(s): ruta/al/archivo.ext
```

**Ejemplo**:
```markdown
### Modelo de Datos
- **[AGREGADO]** Nueva colección `onco_tratamientos` para gestión detallada de protocolos
  - 15 campos incluyendo protocolo, dosis, ciclos
  - Relación 1:N con `onco_casos`
  - Issue: #45
  - Autor: @dev-oncologia
  - Archivo: docs/modelo-datos/DICCIONARIO-DATOS.md
```

---

## Notas

### Sobre Cambios en Colecciones ALMA
**IMPORTANTE**: Las colecciones con prefijo `alma_` son **read-only** y reflejan el esquema de ALMA (TrakCare). Los cambios en estas colecciones deben:
1. Ser coordinados con el equipo de TI del hospital
2. Realizarse primero en ALMA/SQL intermedio
3. Documentarse en este CHANGELOG indicando:
   - Fecha de cambio en ALMA
   - Descripción del cambio
   - Impacto en UGCO
   - Ajustes necesarios en código

**Ejemplo**:
```markdown
### MODELO - Colecciones ALMA
- **[CAMBIADO]** Campo `alma_pacientes.prevision` cambió de string(50) a string(100)
  - Fecha cambio en ALMA: 2024-02-15
  - Motivo: Soportar nombres largos de ISAPRE
  - Impacto en UGCO: Ajustar validaciones en formularios
  - Acción: Actualizar campo en vista NocoBase
```

### Proceso de Actualización del CHANGELOG
1. **Durante desarrollo**: Agregar cambios en sección `[No Publicado]`
2. **Antes de release**: Mover cambios a nueva versión con fecha
3. **Después de release**: Crear nueva sección `[No Publicado]` vacía
4. **Commit**: Incluir actualización de CHANGELOG en cada commit relevante

### Responsables
- **Mantiene CHANGELOG**: Líder técnico del proyecto UGCO
- **Revisa antes de release**: Product Owner / Sponsor del proyecto
- **Contribuyen**: Todos los desarrolladores

---

## Links Útiles

- [Repositorio del Proyecto](C:\GIT\MIRA\UGCO)
- [Documentación Completa](docs/)
- [Diccionario de Datos](docs/modelo-datos/DICCIONARIO-DATOS.md)
- [Plan de Implementación](planificacion/PLAN-IMPLEMENTACION.md)
- [NocoBase Hospital Ovalle](https://nocobase.hospitaldeovalle.cl/)

---

**Última Actualización**: 2025-11-21
**Versión Actual**: 1.0.0 (Fase de Diseño)
**Estado del Proyecto**: En Diseño
