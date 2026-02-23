# Diseño Técnico de Implementación en NocoBase

**Fecha**: 2025-11-26
**Objetivo**: Definir la estructura de base de datos y la estrategia de creación vía API para el proyecto UGCO.

---

## 1. Estrategia de Creación (API)

Utilizaremos el endpoint de gestión de colecciones de NocoBase para crear la estructura de datos de forma programática.

*   **Endpoint**: `POST /api/collections:create`
*   **Headers**:
    *   `Authorization`: `Bearer <API_KEY>`
    *   `Content-Type`: `application/json`

---

## 2. Definición de Esquema (Payloads)

### A. Tablas de Referencia (`REF_CIE10`)
Estructura base para todos los catálogos (CIE-10, Topografía, etc.).

```json
{
  "name": "ref_cie10",
  "title": "Catálogo CIE-10",
  "fields": [
    {
      "name": "codigo_oficial",
      "type": "string",
      "interface": "input",
      "uiSchema": { "title": "Código CIE-10" }
    },
    {
      "name": "descripcion",
      "type": "string",
      "interface": "textarea",
      "uiSchema": { "title": "Descripción" }
    },
    {
      "name": "codigo_map_legacy",
      "type": "string",
      "interface": "input",
      "uiSchema": { "title": "Código Legacy" }
    },
    {
      "name": "activo",
      "type": "boolean",
      "defaultValue": true
    }
  ]
}
```

### B. Paciente (`ALMA_Paciente`)
Incluye campos nucleares y extensiones MPI.

```json
{
  "name": "alma_paciente",
  "title": "Pacientes (ALMA/MPI)",
  "fields": [
    {
      "name": "run",
      "type": "string",
      "unique": true,
      "uiSchema": { "title": "RUN" }
    },
    {
      "name": "nombres",
      "type": "string"
    },
    {
      "name": "apellidos",
      "type": "string"
    },
    {
      "name": "fecha_nacimiento",
      "type": "date"
    },
    {
      "name": "sexo_biologico",
      "type": "string",
      "interface": "select",
      "uiSchema": { "enum": [{"label":"Hombre","value":"male"}, {"label":"Mujer","value":"female"}] }
    },
    // Extensiones MPI
    {
      "name": "pueblo_originario",
      "type": "string",
      "interface": "select"
    },
    {
      "name": "nivel_educacional",
      "type": "string"
    }
  ]
}
```

### C. Caso Oncológico (`UGCO_CasoOncologico`)
Tabla central con relaciones (`belongsTo`).

```json
{
  "name": "ugco_casooncologico",
  "title": "Caso Oncológico",
  "fields": [
    {
      "name": "fecha_diagnostico",
      "type": "date"
    },
    // Relaciones
    {
      "name": "paciente",
      "type": "belongsTo",
      "target": "alma_paciente",
      "foreignKey": "paciente_id"
    },
    {
      "name": "diagnostico_cie10",
      "type": "belongsTo",
      "target": "ref_cie10",
      "foreignKey": "cie10_id"
    },
    // Campos Clínicos
    {
      "name": "clinical_status",
      "type": "string",
      "interface": "select",
      "uiSchema": { "enum": [{"value":"active"}, {"value":"remission"}, {"value":"relapse"}] }
    },
    {
      "name": "proximo_control",
      "type": "date",
      "uiSchema": { "title": "Próximo Control" }
    }
  ]
}
```

### D. Eventos y Solicitudes (`UGCO_Evento`)
Maneja controles, exámenes e interconsultas.

```json
{
  "name": "ugco_evento",
  "title": "Eventos y Solicitudes",
  "fields": [
    {
      "name": "caso",
      "type": "belongsTo",
      "target": "ugco_casooncologico"
    },
    {
      "name": "tipo_evento",
      "type": "string",
      "interface": "select",
      "uiSchema": { 
        "enum": [
          {"label":"Control Médico", "value":"control"},
          {"label":"Laboratorio", "value":"laboratorio"},
          {"label":"Imagenología", "value":"imagen"},
          {"label":"Endoscopía", "value":"endoscopia"},
          {"label":"Biopsia", "value":"biopsia"},
          {"label":"Interconsulta", "value":"interconsulta"},
          {"label":"Comité", "value":"comite"}
        ] 
      }
    },
    {
      "name": "estado",
      "type": "string",
      "interface": "select",
      "defaultValue": "solicitado",
      "uiSchema": { 
        "enum": [
          {"label":"Solicitado", "value":"solicitado"},
          {"label":"Agendado", "value":"agendado"},
          {"label":"Realizado/Informado", "value":"realizado"},
          {"label":"Cancelado", "value":"cancelado"}
        ] 
      }
    },
    {
      "name": "fecha_solicitud",
      "type": "date",
      "defaultValue": "{{now()}}"
    },
    {
      "name": "fecha_realizacion",
      "type": "date"
    },
    {
      "name": "descripcion",
      "type": "textarea"
    }
  ]
}
```

---

## 3. Orden de Creación

Para respetar las claves foráneas, el orden de ejecución de los scripts debe ser:

1.  **Nivel 0 (Maestros)**: `REF_CIE10`, `REF_OncoTopografia`, `REF_OncoMorfologia`.
2.  **Nivel 1 (Entidades)**: `ALMA_Paciente`.
3.  **Nivel 2 (Transaccional)**: `UGCO_CasoOncologico` (depende de Paciente y REF).
4.  **Nivel 3 (Eventos)**: `UGCO_EventoClinico` (depende de Caso).

---

## 4. Scripts de Automatización

Se crearán scripts en `UGCO/scripts/nocobase/` que:
1.  Lean la definición JSON.
2.  Autentiquen contra la API.
3.  Ejecuten el `POST` para crear la colección.
4.  Verifiquen el éxito (HTTP 200).
