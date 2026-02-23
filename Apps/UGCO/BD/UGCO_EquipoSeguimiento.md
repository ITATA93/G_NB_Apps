
# UGCO_EquipoSeguimiento

Tabla para definir equipos de seguimiento (por ejemplo, “Enfermería Urología”, “Enfermería Digestivo Alto”) que pueden asociarse a casos y tareas.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: UGCO_EquipoSeguimiento
-- Equipos de seguimiento (enfermería / gestión)
-- =========================================

CREATE TABLE UGCO_EquipoSeguimiento (
    id_equipo      SERIAL PRIMARY KEY,

    nombre         VARCHAR(255) NOT NULL,
    descripcion    TEXT,

    especialidad_id INTEGER,                      -- FK → REF_OncoEspecialidad(id), opcional
    activo         BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo         | Tipo lógico  | PK | Nulo | Descripción                                                                 |
|---------------|-------------|----|------|-----------------------------------------------------------------------------|
| id_equipo     | entero      | ✔  | No   | Identificador interno del equipo de seguimiento.                            |
| nombre        | texto       |    | No   | Nombre del equipo (Ej. “Enfermería Urología”, “Digestivo Alto”).           |
| descripcion   | texto       |    | Sí   | Descripción libre del equipo.                                              |
| especialidad_id | entero (FK)|   | Sí   | Especialidad principal asociada (`REF_OncoEspecialidad`).                   |
| activo        | booleano    |    | No   | TRUE si el equipo está vigente para asignación de casos y tareas.          |
