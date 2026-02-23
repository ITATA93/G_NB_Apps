
# UGCO_ComiteCaso

Relación entre una sesión de comité oncológico y un caso oncológico UGCO, incluyendo la decisión/acuerdos tomados para ese caso en esa sesión.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: UGCO_ComiteCaso
-- Casos discutidos en un comité oncológico
-- =========================================

CREATE TABLE UGCO_ComiteCaso (
    id_comite_caso      SERIAL PRIMARY KEY,

    comite_id           INTEGER NOT NULL,           -- FK → UGCO_ComiteOncologico(id_comite)
    caso_id             INTEGER NOT NULL,           -- FK → UGCO_CasoOncologico(id_caso)
    paciente_id         INTEGER,                    -- FK → alma_pacientes(id), opcional (redundante pero útil)

    es_caso_principal   BOOLEAN DEFAULT FALSE,      -- TRUE si fue el caso "foco" de la sesión

    decision_resumen    TEXT,                       -- resumen de la decisión principal
    plan_tratamiento    TEXT,                       -- plan de tratamiento/acuerdos
    otros_acuerdos      TEXT,                       -- observaciones adicionales

    responsable_seguimiento VARCHAR(100),           -- usuario/equipo que debe ejecutar el plan
    requiere_tareas     BOOLEAN DEFAULT FALSE,      -- si se espera crear tareas de seguimiento en UGCO_Tarea

    creado_por          VARCHAR(100) NOT NULL,
    fecha_creacion      TIMESTAMP NOT NULL DEFAULT NOW(),
    modificado_por      VARCHAR(100),
    fecha_modificacion  TIMESTAMP
);
```

---

## Diccionario de campos

| Campo               | Tipo lógico  | PK | Nulo | Descripción                                                                 |
|---------------------|-------------|----|------|-----------------------------------------------------------------------------|
| id_comite_caso      | entero      | ✔  | No   | Identificador interno de la relación comité–caso.                           |
| comite_id           | entero (FK) |    | No   | Sesión de comité (`UGCO_ComiteOncologico.id_comite`).                        |
| caso_id             | entero (FK) |    | No   | Caso oncológico UGCO discutido (`UGCO_CasoOncologico.id_caso`).             |
| paciente_id         | entero (FK) |    | Sí   | Paciente asociado (opcional, se puede derivar del caso).                    |
| es_caso_principal   | booleano    |    | Sí   | TRUE si el caso fue el foco principal en esa sesión de comité.             |
| decision_resumen    | texto       |    | Sí   | Resumen corto de la decisión del comité para este caso.                     |
| plan_tratamiento    | texto       |    | Sí   | Plan de tratamiento acordado.                                              |
| otros_acuerdos      | texto       |    | Sí   | Otros acuerdos u observaciones.                                            |
| responsable_seguimiento | texto corto | | Sí  | Usuario/equipo responsable del seguimiento de los acuerdos.                |
| requiere_tareas     | booleano    |    | Sí   | TRUE si se espera crear tareas en `UGCO_Tarea` a partir de este acuerdo.   |
| creado_por          | texto corto |    | No   | Usuario que creó el registro.                                              |
| fecha_creacion      | fecha/hora  |    | No   | Fecha/hora de creación del registro.                                       |
| modificado_por      | texto corto |    | Sí   | Último usuario que modificó el registro.                                   |
| fecha_modificacion  | fecha/hora  |    | Sí   | Fecha/hora de última modificación.                                         |
