
# UGCO_CasoOncologico

Episodio oncológico por paciente y diagnóstico principal (equivalente funcional a PrimaryCancerCondition de mCODE + contexto de gestión UGCO).

> **Interoperabilidad**: Mapeado al recurso **FHIR Condition** (Perfil: `mcode-primary-cancer-condition`).

---

## DDL (SQL de referencia)

```sql
CREATE TABLE UGCO_CasoOncologico (
    id_caso                 SERIAL PRIMARY KEY,

    -- Identificadores interoperables
    UGCO_COD01              VARCHAR(50) NOT NULL UNIQUE,  -- código interno UGCO (ej. ONC-00024)
    UGCO_COD02              VARCHAR(50),                  -- id SIGO u otro
    UGCO_COD03              VARCHAR(50),
    UGCO_COD04              VARCHAR(50),

    -- Vínculo a ALMA
    paciente_id             INTEGER NOT NULL,             -- FK → alma_pacientes(id)
    episodio_alma_id        INTEGER,                      -- FK → alma_episodios(id)
    diag_alma_id            INTEGER,                      -- FK → alma_diagnosticos(id)

    -- Diagnóstico oncológico principal
    codigo_cie10            VARCHAR(10) NOT NULL,
    cie10_glosa             VARCHAR(255),
    topografia_icdo         VARCHAR(10),
    morfologia_icdo         VARCHAR(10),
    comportamiento          VARCHAR(5),

    fecha_diagnostico       DATE NOT NULL,
    base_diagnostico        VARCHAR(100),

    -- Etapificación inicial
    tipo_etapificacion      VARCHAR(50),
    tnm_t                   VARCHAR(10),
    tnm_n                   VARCHAR(10),
    tnm_m                   VARCHAR(10),
    estadio_clinico         VARCHAR(10),
    figo                    VARCHAR(10),
    grado_diferenciacion    VARCHAR(50),
    ecog_inicial            VARCHAR(5),

    -- Estados del caso
    estado_clinico_id       INTEGER NOT NULL,             -- REF_OncoEstadoClinico
    estado_adm_id           INTEGER NOT NULL,             -- REF_OncoEstadoAdm
    intencion_trat_id       INTEGER,                      -- REF_OncoIntencionTrat
    estado_seguimiento_id   INTEGER NOT NULL,             -- REF_OncoEstadoCaso
    garantia                VARCHAR(50),                  -- GES 14 / No GES / etc.
    
    -- Campos FHIR Condition
    clinical_status         VARCHAR(20),                  -- active | recurrence | relapse | remission | resolved
    verification_status     VARCHAR(20),                  -- unconfirmed | provisional | differential | confirmed | refuted
    severity                VARCHAR(20),                  -- severe | moderate | mild (opcional)

    -- Fechas de gestión
    fecha_caso              DATE NOT NULL,                -- fecha de apertura del caso UGCO
    fecha_inicio_seguimiento DATE,
    fecha_ultimo_contacto   DATE,

    -- Desenlace
    fallecido               BOOLEAN,
    fecha_defuncion         DATE,
    causa_defuncion         VARCHAR(255),

    -- Notas y metadatos
    comentario_general      TEXT,
    creado_por              VARCHAR(100) NOT NULL,
    fecha_creacion          TIMESTAMP NOT NULL DEFAULT NOW(),
    modificado_por          VARCHAR(100),
    fecha_modificacion      TIMESTAMP
);
```

> Ajusta `SERIAL`/tipos y agrega los `FOREIGN KEY` según el motor y nombres reales de tus tablas ALMA.

---

## Diccionario de campos

| Campo                    | Tipo lógico  | PK | Nulo | Descripción                                                                 |
|--------------------------|--------------|----|------|-----------------------------------------------------------------------------|
| id_caso                  | entero       | ✔  | No   | Identificador interno del caso oncológico.                                  |
| UGCO_COD01               | texto corto  |    | No   | Código interno UGCO del caso (ej. ONC-00024). Único.                        |
| UGCO_COD02               | texto corto  |    | Sí   | Id del caso en SIGO u otro sistema.                                        |
| UGCO_COD03               | texto corto  |    | Sí   | Segundo identificador externo (registro regional, etc.).                   |
| UGCO_COD04               | texto corto  |    | Sí   | Reservado para interoperabilidad futura.                                   |
| paciente_id              | entero (FK)  |    | No   | Paciente en ALMA (`alma_pacientes`).                                       |
| episodio_alma_id         | entero (FK)  |    | Sí   | Episodio ALMA asociado al origen del caso.                                 |
| diag_alma_id             | entero (FK)  |    | Sí   | Diagnóstico ALMA índice para este caso.                                    |
| codigo_cie10             | texto corto  |    | No   | Código CIE-10 del tumor primario.                                          |
| cie10_glosa              | texto        |    | Sí   | Glosa descriptiva de CIE-10.                                               |
| topografia_icdo          | texto corto  |    | Sí   | Código ICD-O topografía.                                                   |
| morfologia_icdo          | texto corto  |    | Sí   | Código ICD-O morfología.                                                   |
| comportamiento           | texto corto  |    | Sí   | Comportamiento tumoral (/0, /1, /3, etc.).                                 |
| fecha_diagnostico        | fecha        |    | No   | Fecha de diagnóstico del cáncer.                                           |
| base_diagnostico         | texto corto  |    | Sí   | Base diagnóstica (histológica, imagen, clínica, etc.).                     |
| tipo_etapificacion       | texto corto  |    | Sí   | Tipo de etapificación (clínica, patológica, post-tratamiento).             |
| tnm_t                    | texto corto  |    | Sí   | T inicial (ej. T2b).                                                       |
| tnm_n                    | texto corto  |    | Sí   | N inicial.                                                                 |
| tnm_m                    | texto corto  |    | Sí   | M inicial.                                                                 |
| estadio_clinico          | texto corto  |    | Sí   | Estadio clínico (I, II, IIIA, IV...).                                      |
| figo                     | texto corto  |    | Sí   | FIGO (si aplica).                                                          |
| grado_diferenciacion     | texto corto  |    | Sí   | Grado histológico (bien/moderado/poco diferenciado, etc.).                 |
| ecog_inicial             | texto corto  |    | Sí   | ECOG al diagnóstico.                                                       |
| estado_clinico_id        | entero (FK)  |    | No   | Estado clínico (sospecha, confirmado, etc.).                               |
| estado_adm_id            | entero (FK)  |    | No   | Estado administrativo (proceso diagnóstico, etapificación, tratamiento...).|
| intencion_trat_id        | entero (FK)  |    | Sí   | Intención de tratamiento (curativo, paliativo, diagnóstico...).            |
| estado_seguimiento_id    | entero (FK)  |    | No   | Estado del caso para UGCO (activo, en seguimiento, cerrado, perdido...).   |
| garantia                 | texto corto  |    | Sí   | GES 14 / No GES / otro.                                                    |
| clinical_status          | texto corto  |    | Sí   | FHIR: Estado clínico del cáncer (active, remission, etc.).                 |
| verification_status      | texto corto  |    | Sí   | FHIR: Certeza diagnóstica (confirmed, provisional, etc.).                  |
| severity                 | texto corto  |    | Sí   | FHIR: Severidad (opcional).                                                |
| fecha_caso               | fecha        |    | No   | Fecha en que UGCO abre formalmente el caso.                                |
| fecha_inicio_seguimiento | fecha        |    | Sí   | Inicio de seguimiento por UGCO/enfermería.                                 |
| fecha_ultimo_contacto    | fecha        |    | Sí   | Último control o contacto registrado.                                      |
| fallecido                | booleano     |    | Sí   | Indica si el paciente falleció.                                            |
| fecha_defuncion          | fecha        |    | Sí   | Fecha de defunción.                                                        |
| causa_defuncion          | texto        |    | Sí   | Causa básica de defunción (texto o código).                                |
| comentario_general       | texto        |    | Sí   | Notas generales sobre el caso.                                             |
| creado_por               | texto corto  |    | No   | Usuario que creó el registro en UGCO.                                     |
| fecha_creacion           | fecha/hora   |    | No   | Fecha/hora de creación del registro.                                       |
| modificado_por           | texto corto  |    | Sí   | Último usuario que modificó el caso.                                      |
| fecha_modificacion       | fecha/hora   |    | Sí   | Fecha/hora de última modificación.                                         |
