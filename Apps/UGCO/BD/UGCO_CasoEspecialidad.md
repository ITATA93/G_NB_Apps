
# UGCO_CasoEspecialidad

Relación entre casos oncológicos UGCO y especialidades/grupos oncológicos.  
Se usa para que cada caso quede asignado a una o más especialidades (ej. Digestivo alto, Urología), y eventualmente a un equipo de seguimiento (enfermeras, gestores, etc.).

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: UGCO_CasoEspecialidad
-- Relación caso oncológico ↔ especialidad
-- =========================================

CREATE TABLE UGCO_CasoEspecialidad (
    id              SERIAL PRIMARY KEY,

    caso_id         INTEGER NOT NULL,   -- FK → UGCO_CasoOncologico(id_caso)
    especialidad_id INTEGER NOT NULL,   -- FK → REF_OncoEspecialidad(id)
    equipo_id       INTEGER,            -- FK → UGCO_EquipoSeguimiento(id), si lo creas

    es_principal    BOOLEAN DEFAULT FALSE,
    comentario      TEXT
);
```

> Faltaría agregar los `FOREIGN KEY` reales según el nombre final de tus tablas (`UGCO_CasoOncologico`, `REF_OncoEspecialidad`, y opcional `UGCO_EquipoSeguimiento`).

---

## Diccionario de campos

| Campo          | Tipo lógico | PK | Nulo | Descripción                                                                 |
|----------------|------------|----|------|-----------------------------------------------------------------------------|
| id             | entero     | ✔  | No   | Identificador interno de la relación caso–especialidad.                    |
| caso_id        | entero (FK)|    | No   | Caso oncológico UGCO (`UGCO_CasoOncologico.id_caso`).                        |
| especialidad_id| entero (FK)|    | No   | Especialidad/grupo oncológico (`REF_OncoEspecialidad.id`).                  |
| equipo_id      | entero (FK)|    | Sí   | Equipo de seguimiento responsable (si existe tabla `UGCO_EquipoSeguimiento`). |
| es_principal   | booleano   |    | Sí   | Marca si esta es la especialidad principal/dueña del caso (TRUE/FALSE).     |
| comentario     | texto      |    | Sí   | Observaciones sobre la asignación (ej. “Seguimiento compartido con Digestivo bajo”). |
