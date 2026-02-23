
# REF_OncoEstadoActividad

Catálogo de estados de tarea/actividad oncológica (para `UGCO_Tarea`), por ejemplo:
- PEND (Pendiente)
- EN_CURSO (En curso)
- COMP (Completada)
- VENC (Vencida)
- CANC (Cancelada)

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoEstadoActividad
-- Catálogo de estados de tarea/actividad
-- =========================================

CREATE TABLE REF_OncoEstadoActividad (
    id          SERIAL PRIMARY KEY,
    codigo      VARCHAR(50) NOT NULL UNIQUE,   -- PEND, EN_CURSO, COMP, VENC, CANC, etc.
    nombre      VARCHAR(255) NOT NULL,         -- Pendiente, En curso, Completada, Vencida...
    es_final    BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE si es estado terminal (completada, cancelada)
    activo      BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo    | Tipo lógico  | PK | Nulo | Descripción                                                        |
|----------|-------------|----|------|--------------------------------------------------------------------|
| id       | entero      | ✔  | No   | Identificador interno del estado de actividad.                     |
| codigo   | texto corto |    | No   | Código técnico: PEND, EN_CURSO, COMP, VENC, CANC, etc.            |
| nombre   | texto       |    | No   | Nombre visible: Pendiente, En curso, Completada, Vencida, etc.    |
| es_final | booleano    |    | No   | TRUE si la tarea termina en este estado (completada/cancelada).   |
| activo   | booleano    |    | No   | TRUE si el estado está disponible para uso en la app.             |
