
# REF_OncoTipoActividad

Catálogo de tipos de tarea/actividad oncológica (ej. Examen, Interconsulta, Control, Evaluación, Gestión interna).

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoTipoActividad
-- Catálogo de tipos de tarea/actividad
-- =========================================

CREATE TABLE REF_OncoTipoActividad (
    id          SERIAL PRIMARY KEY,
    codigo      VARCHAR(50) NOT NULL UNIQUE,   -- EXAMEN, IC, CONTROL, EVAL, INTERNA, etc.
    nombre      VARCHAR(255) NOT NULL,         -- Examen, Interconsulta, Control médico, etc.
    es_clinica  BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE si es actividad clínica (ligada a paciente)
    activo      BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo    | Tipo lógico  | PK | Nulo | Descripción                                                                 |
|----------|-------------|----|------|-----------------------------------------------------------------------------|
| id       | entero      | ✔  | No   | Identificador interno del tipo de actividad.                                |
| codigo   | texto corto |    | No   | Código técnico único: EXAMEN, IC, CONTROL, EVAL, INTERNA, etc.              |
| nombre   | texto       |    | No   | Nombre visible: Examen, Interconsulta, Control médico, etc.                 |
| es_clinica | booleano  |    | No   | Indica si es actividad clínica asociada a paciente/caso.                    |
| activo   | booleano    |    | No   | Indica si el tipo está disponible para uso en la app.                       |
