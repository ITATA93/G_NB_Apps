# BUHO_Pacientes

Gestión de pacientes hospitalizados para el proyecto BUHO.

---

## DDL (SQL de referencia)

```sql
CREATE TABLE BUHO_Pacientes (
    id                      SERIAL PRIMARY KEY,
    nombre                  VARCHAR(255) NOT NULL,
    rut                     VARCHAR(20) NOT NULL,
    
    -- Ubicación
    servicio                VARCHAR(100),
    sala                    VARCHAR(50),
    cama                    VARCHAR(50),
    tipo_cama               VARCHAR(50),

    -- Clínico
    diagnostico_principal   TEXT,
    fecha_ingreso           TIMESTAMP,
    fecha_probable_alta     DATE,
    categorizacion          VARCHAR(50),

    -- Plan de Trabajo
    estado_plan             VARCHAR(50), -- Pendiente, En Curso, Listo para Alta
    riesgo_detectado        VARCHAR(50), -- Alto, Medio, Bajo
    proxima_accion          TEXT,
    estudios_pendientes     TEXT,

    -- Metadatos
    creado_por              VARCHAR(100),
    fecha_creacion          TIMESTAMP DEFAULT NOW(),
    modificado_por          VARCHAR(100),
    fecha_modificacion      TIMESTAMP
);
```
