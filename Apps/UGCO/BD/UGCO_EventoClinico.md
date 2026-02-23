
# UGCO_EventoClinico

Registro de eventos clínicos relevantes para oncología (exámenes, cirugías, quimioterapia, radioterapia, etc.), siempre anclados al paciente y opcionalmente ligados a un caso oncológico UGCO y/o a un episodio de ALMA.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: UGCO_EventoClinico
-- Eventos clínicos (exámenes, cirugías, QT, RT, etc.)
-- =========================================

CREATE TABLE UGCO_EventoClinico (
    id_evento          SERIAL PRIMARY KEY,

    -- Identificadores interoperables
    UGCO_COD01         VARCHAR(50) NOT NULL UNIQUE,  -- código interno UGCO del evento
    UGCO_COD02         VARCHAR(50),                  -- id en ALMA (orden/procedimiento) si aplica
    UGCO_COD03         VARCHAR(50),                  -- id en otro HIS / SIGO / otro hospital
    UGCO_COD04         VARCHAR(50),                  -- reservado (FHIR, registro regional, etc.)

    -- Vínculos clínicos
    paciente_id        INTEGER NOT NULL,             -- siempre anclado al paciente (alma_pacientes)
    caso_id            INTEGER,                      -- FK → UGCO_CasoOncologico(id_caso), si pertenece a un episodio onco
    episodio_alma_id   INTEGER,                      -- FK → alma_episodios(id), si proviene de un episodio ALMA

    -- Tipo de evento
    tipo_evento        VARCHAR(50) NOT NULL,         -- EXAMEN / CIRUGIA / QT / RT / OTRO
    subtipo_evento     VARCHAR(100),                 -- TAC TAP, colonoscopia, gastrectomía subtotal, etc.

    -- Fechas y resultado
    fecha_solicitud    DATE,
    fecha_realizacion  DATE,
    resultado_resumen  TEXT,
    centro_realizacion VARCHAR(255),

    -- Origen del dato
    origen_dato        VARCHAR(10) NOT NULL,         -- ALMA / EXTERNO / MANUAL
    sistema_origen     VARCHAR(255),                 -- nombre del sistema/hospital (ALMA, H. La Serena, etc.)
    descripcion_origen TEXT,                         -- detalle adicional (ej. "cirugía previa a ALMA")

    -- Metadatos
    creado_por         VARCHAR(100) NOT NULL,
    fecha_creacion     TIMESTAMP NOT NULL DEFAULT NOW()
);
```

> Ajusta `SERIAL`/tipos y agrega los `FOREIGN KEY` según el motor y nombres reales de tus tablas ALMA y UGCO.  
> Por ejemplo, `paciente_id` → `alma_pacientes(id_paciente_alma)` y `caso_id` → `UGCO_CasoOncologico(id_caso)`.

---

## Diccionario de campos

| Campo              | Tipo lógico   | PK | Nulo | Descripción                                                                 |
|--------------------|---------------|----|------|-----------------------------------------------------------------------------|
| id_evento          | entero        | ✔  | No   | Identificador interno del evento clínico.                                  |
| UGCO_COD01         | texto corto   |    | No   | Código interno UGCO del evento. Único.                                     |
| UGCO_COD02         | texto corto   |    | Sí   | Id del evento en ALMA (orden, procedimiento) si aplica.                    |
| UGCO_COD03         | texto corto   |    | Sí   | Id en otro HIS/SIGO/centro externo.                                        |
| UGCO_COD04         | texto corto   |    | Sí   | Reservado para interoperabilidad futura (FHIR, registro regional, etc.).   |
| paciente_id        | entero (FK)   |    | No   | Paciente asociado (siempre). Referencia a `alma_pacientes`.                |
| caso_id            | entero (FK)   |    | Sí   | Caso oncológico UGCO al que se asocia el evento (`UGCO_CasoOncologico`).   |
| episodio_alma_id   | entero (FK)   |    | Sí   | Episodio ALMA asociado, si el evento proviene de ese episodio.             |
| tipo_evento        | texto corto   |    | No   | Tipo de evento: EXAMEN, CIRUGIA, QT, RT, OTRO.                             |
| subtipo_evento     | texto         |    | Sí   | Subtipo específico: TAC TAP, colonoscopia, gastrectomía, etc.              |
| fecha_solicitud    | fecha         |    | Sí   | Fecha de solicitud del examen/procedimiento (si aplica).                   |
| fecha_realizacion  | fecha         |    | Sí   | Fecha en que se realiza el evento.                                         |
| resultado_resumen  | texto         |    | Sí   | Resumen del resultado (no reemplaza informe completo).                     |
| centro_realizacion | texto         |    | Sí   | Centro donde se realiza (Hospital Ovalle, H. La Serena, Clínica X, etc.).  |
| origen_dato        | texto corto   |    | No   | ALMA / EXTERNO / MANUAL: origen de la información del evento.             |
| sistema_origen     | texto         |    | Sí   | Nombre del sistema/hospital de origen (ALMA, otro HIS, etc.).              |
| descripcion_origen | texto         |    | Sí   | Detalle adicional sobre el origen (ej. "cirugía previa a implantación ALMA"). |
| creado_por         | texto corto   |    | No   | Usuario o proceso que creó el registro en UGCO.                            |
| fecha_creacion     | fecha/hora    |    | No   | Fecha/hora de creación del registro en UGCO.                               |
