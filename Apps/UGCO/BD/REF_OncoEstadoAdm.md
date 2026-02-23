
# REF_OncoEstadoAdm

Catálogo de **estado administrativo** del caso oncológico.  
Se usa en `UGCO_CasoOncologico.estado_adm_id` para indicar en qué fase del flujo está el caso:
- PROCESO_DIAGNOSTICO
- ETAPIFICACION
- TRATAMIENTO
- CONTROL
- CERRADO_ADMIN

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoEstadoAdm
-- Catálogo de estado administrativo del caso
-- =========================================

CREATE TABLE REF_OncoEstadoAdm (
    id          SERIAL PRIMARY KEY,
    codigo      VARCHAR(50) NOT NULL UNIQUE,   -- PROCESO_DIAGNOSTICO, ETAPIFICACION, TRATAMIENTO, CONTROL, CERRADO_ADMIN...
    nombre      VARCHAR(255) NOT NULL,         -- Proceso diagnóstico, Etapificación, Tratamiento, Control, Cerrado admin...
    es_final    BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE si el caso no debería seguirse activamente en este estado
    activo      BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo    | Tipo lógico  | PK | Nulo | Descripción                                                              |
|----------|-------------|----|------|--------------------------------------------------------------------------|
| id       | entero      | ✔  | No   | Identificador interno del estado administrativo.                         |
| codigo   | texto corto |    | No   | Código técnico: PROCESO_DIAGNOSTICO, ETAPIFICACION, TRATAMIENTO, etc.   |
| nombre   | texto       |    | No   | Nombre visible del estado administrativo.                                |
| es_final | booleano    |    | No   | TRUE si este estado indica cierre administrativo (fin del flujo activo). |
| activo   | booleano    |    | No   | TRUE si el estado está disponible para uso en la app.                    |
