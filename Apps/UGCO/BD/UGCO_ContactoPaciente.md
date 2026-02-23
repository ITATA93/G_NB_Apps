
# UGCO_ContactoPaciente

Datos de contacto del paciente tal como se gestionan en UGCO (similar a la sección “Datos de contacto del paciente” de SIGO).

Permite registrar dirección, teléfonos, correo y origen de la información.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: UGCO_ContactoPaciente
-- Datos de contacto del paciente
-- =========================================

CREATE TABLE UGCO_ContactoPaciente (
    id_contacto         SERIAL PRIMARY KEY,

    paciente_id         INTEGER NOT NULL,          -- FK → alma_pacientes(id)
    caso_id             INTEGER,                   -- FK → UGCO_CasoOncologico(id_caso), opcional

    region_residencia    VARCHAR(100),
    provincia_residencia VARCHAR(100),
    comuna_residencia    VARCHAR(100),

    tipo_calle          VARCHAR(50),               -- Calle, Pasaje, Avenida, etc.
    nombre_calle        VARCHAR(255),
    numero_direccion    VARCHAR(50),
    complemento_dir     VARCHAR(255),              -- Depto, block, villa, etc.

    telefono_1          VARCHAR(50),
    telefono_2          VARCHAR(50),
    email               VARCHAR(255),

    fuente_dato         VARCHAR(50),               -- ALMA / SIGO / MANUAL
    observaciones       TEXT,

    creado_por          VARCHAR(100) NOT NULL,
    fecha_creacion      TIMESTAMP NOT NULL DEFAULT NOW(),
    modificado_por      VARCHAR(100),
    fecha_modificacion  TIMESTAMP
);
```

---

## Diccionario de campos

| Campo                | Tipo lógico  | PK | Nulo | Descripción                                                             |
|----------------------|-------------|----|------|-------------------------------------------------------------------------|
| id_contacto          | entero      | ✔  | No   | Identificador interno del registro de contacto.                         |
| paciente_id          | entero (FK) |    | No   | Paciente en ALMA (ancla principal, `alma_pacientes`).                   |
| caso_id              | entero (FK) |    | Sí   | Caso oncológico UGCO asociado, si el contacto se define por caso.      |
| region_residencia    | texto       |    | Sí   | Región de residencia del paciente.                                     |
| provincia_residencia | texto       |    | Sí   | Provincia de residencia.                                               |
| comuna_residencia    | texto       |    | Sí   | Comuna de residencia.                                                  |
| tipo_calle           | texto corto |    | Sí   | Tipo de vía: Calle, Pasaje, Avenida, etc.                               |
| nombre_calle         | texto       |    | Sí   | Nombre de la calle.                                                     |
| numero_direccion     | texto corto |    | Sí   | Número de la dirección (o “s/n”).                                      |
| complemento_dir      | texto       |    | Sí   | Complemento (depto, block, villa, condominio, etc.).                   |
| telefono_1           | texto corto |    | Sí   | Teléfono de contacto principal.                                        |
| telefono_2           | texto corto |    | Sí   | Teléfono de contacto secundario.                                       |
| email                | texto       |    | Sí   | Correo electrónico del paciente.                                       |
| fuente_dato          | texto corto |    | Sí   | Origen de la información: ALMA, SIGO, MANUAL, otro.                    |
| observaciones        | texto       |    | Sí   | Notas sobre el contacto (ej. “prefiere WhatsApp”, “número de familiar”).|
| creado_por           | texto corto |    | No   | Usuario que creó el registro en UGCO.                                  |
| fecha_creacion       | fecha/hora  |    | No   | Fecha/hora de creación del registro.                                   |
| modificado_por       | texto corto |    | Sí   | Último usuario que modificó el registro.                               |
| fecha_modificacion   | fecha/hora  |    | Sí   | Fecha/hora de última modificación.                                     |
