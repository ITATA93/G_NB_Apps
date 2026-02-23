
# UGCO_EquipoMiembro

Relación entre los **equipos de seguimiento** (`UGCO_EquipoSeguimiento`) y los **usuarios** del sistema (enfermeras, médicos, administrativos).

Permite saber qué usuarios pertenecen a qué equipo y con qué rol.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: UGCO_EquipoMiembro
-- Miembros de equipos de seguimiento (usuarios ↔ UGCO_EquipoSeguimiento)
-- =========================================

CREATE TABLE UGCO_EquipoMiembro (
    id_miembro      SERIAL PRIMARY KEY,

    equipo_id       INTEGER NOT NULL,          -- FK → UGCO_EquipoSeguimiento(id_equipo)
    usuario_id      INTEGER NOT NULL,          -- FK → tabla de usuarios del sistema (NocoBase/SSO)
    rol_miembro     VARCHAR(100),              -- Ej: Enfermera, Médico, Administrativo, Coordinador

    fecha_inicio    DATE,
    fecha_fin       DATE,

    activo          BOOLEAN NOT NULL DEFAULT TRUE,

    creado_por      VARCHAR(100) NOT NULL,
    fecha_creacion  TIMESTAMP NOT NULL DEFAULT NOW(),
    modificado_por  VARCHAR(100),
    fecha_modificacion TIMESTAMP
);
```

---

## Diccionario de campos

| Campo              | Tipo lógico  | PK | Nulo | Descripción                                                                 |
|--------------------|-------------|----|------|-----------------------------------------------------------------------------|
| id_miembro         | entero      | ✔  | No   | Identificador interno del miembro de equipo.                                |
| equipo_id          | entero (FK) |    | No   | Equipo de seguimiento (`UGCO_EquipoSeguimiento.id_equipo`).                 |
| usuario_id         | entero (FK) |    | No   | Usuario del sistema (tabla de usuarios de NocoBase/SSO).                    |
| rol_miembro        | texto       |    | Sí   | Rol dentro del equipo (Enfermera, Médico, Coordinador, Administrativo, etc.). |
| fecha_inicio       | fecha       |    | Sí   | Fecha desde la cual el usuario pertenece al equipo.                         |
| fecha_fin          | fecha       |    | Sí   | Fecha hasta la cual perteneció al equipo (si dejó de pertenecer).           |
| activo             | booleano    |    | No   | TRUE si actualmente pertenece al equipo.                                    |
| creado_por         | texto corto |    | No   | Usuario que creó el registro en UGCO.                                      |
| fecha_creacion     | fecha/hora  |    | No   | Fecha/hora de creación del registro.                                       |
| modificado_por     | texto corto |    | Sí   | Último usuario que modificó el registro.                                   |
| fecha_modificacion | fecha/hora  |    | Sí   | Fecha/hora de última modificación.                                         |
