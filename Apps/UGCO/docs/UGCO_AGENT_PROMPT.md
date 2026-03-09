# Contexto del Proyecto UGCO para IA Arquitecta

Este documento sirve como contexto y "prompt" estructurado para que una Inteligencia Artificial comprenda la arquitectura y estado actual del proyecto **UGCO** (Unidad de Gestión de Casos Oncológicos) y, en base a esto, pueda **diseñar y proveer la información necesaria para consolidar el proyecto con todos los agentes IA necesarios** para su mantenimiento, evolución y auditoría.

---

## 1. Resumen Ejecutivo del Proyecto

**UGCO** es un sistema integral de gestión y seguimiento de pacientes oncológicos desarrollado sobre **NocoBase** para el **Hospital Provincial de Ovalle** (Chile).

Su propósito central es reemplazar registros manuales y planillas dispersas, ofreciendo una plataforma centralizada que se integra en modo **read-only** con el sistema maestro del hospital (**ALMA / TrakCare**) para extraer datos demográficos, clínicos y episodios, mientras en NocoBase se gestiona todo el flujo oncológico (diagnósticos, tratamientos, comités y seguimiento).

**Estado Actual:** Implementado en Producción (Versión 2.0.0).

---

## 2. Arquitectura Técnica y Stack

- **Plataforma Core:** NocoBase (Low-code/No-code backend y frontend).
- **Backend:** Node.js, API REST nativa de NocoBase.
- **Base de Datos Core:** PostgreSQL / MySQL (repositorio de NocoBase).
- **Integración Clínica (Datasource Externo):** Conexión SQL hacia servidor intermedio que expone vistas de ALMA (InterSystems IRIS / SQL Server).
- **Despliegue:** Instancia self-hosted en servidor Hetzner (`mira.hospitaldeovalle.cl`).

---

## 3. Modelo de Datos y Configuración (Blueprint)

El sistema opera con un Blueprint altamente estructurado, abarcando **más de 45 colecciones**:

### 3.1 Colecciones Externas (ALMA - Read Only)
1. `alma_pacientes`: Datos demográficos (RUT, nombre, datos de contacto).
2. `alma_episodios`: Episodios clínicos e ingresos.
3. `alma_diagnosticos`: Diagnósticos CIE-10 índice.

### 3.2 Colecciones UGCO (Read/Write)
- **Core (11 tablas):** Entidades centrales como `onco_casos` (tabla pivote), `onco_episodios` (cirugías, quimio, radio), `onco_comite_sesiones`, `onco_comite_casos`, `onco_seguimiento_eventos`.
- **Relacionales/Secundarias (4 tablas):** Tablas de unión como `onco_caso_especialidades`.
- **Catálogos de Referencia (27 tablas):** Mantenimiento de listas maestras (tipos de tumores, histología, etapas TNM, etc.) con carga inicial de datos.

### 3.3 Interfaz de Usuario (UI)
- **19 páginas operativas + 2 grupos de navegación.**
- Dashboard principal con KPIs, gráficos y tablas de resumen.
- Secciones por especialidad (Digestivo, Mama, Ginecología, Urología, etc.).
- Vistas de Tareas Pendientes y Reportes exportables.

### 3.4 Automatización (Workflows)
1. **Asignación de código:** Trigger on create para generar código de caso.
2. **Log de cambio de estado:** Trigger on update para auditoría de casos.
3. **Tarea de Comité:** Generación automática de tareas al derivar un caso a comité (on create).
4. **Verificación diaria:** Cron job (schedule diario 8 AM) para marcar tareas vencidas.

### 3.5 Control de Acceso (RBAC)
- 3 Roles Clínicos: `medico_oncologo`, `enfermera_ugco`, `coordinador_ugco`.
- Pendiente de afinamiento: Permisos granulares ACL a nivel de campo y registro.

---

## 4. Objetivo para la IA Receptora (Instrucciones)

Como IA experta en arquitecturas de agentes (Antigravity System / GEN_OS), tu misión es leer este contexto y **diseñar el ecosistema de sub-agentes necesarios para consolidar, gobernar y mantener UGCO en el tiempo**.

Por favor, elabora un documento de diseño que contenga:

1. **Catálogo de Agentes Sugeridos:** ¿Qué agentes específicos se necesitan paraUGCO? (e.g., Agente Auditor de Blueprint, Agente de UI Testing, Agente Especialista en Datos Clínicos/ALMA).
2. **Asignación de Roles por Vendor:** Qué modelo (Claude Opus/Sonnet, Gemini Ultra, Codex) debería asumir cada rol, considerando las restricciones de esfuerzo y contexto.
3. **Workflows Autónomos:** Define 2 o 3 workflows críticos que estos agentes deberían ejecutar periódicamente (ej: `/nocobase-audit-ugco`, `/sync-alma-schema`).
4. **Reglas Absolutas (System Prompts):** Qué directrices de seguridad clínica (PHI, read-only de ALMA) deben inyectarse en los prompts de estos agentes.
5. **Estrategia de Interacción CLI:** Herramientas y scripts LTS (Long Term Support) que los agentes necesitarán consumir en `shared/scripts/` para gestionar NocoBase vía API sin romper el UI.

**Formato de Salida Esperado:** Un archivo Markdown estructurado (`UGCO_AGENT_ARCHITECTURE.md`) listo para ser integrado en el sistema Antigravity.
