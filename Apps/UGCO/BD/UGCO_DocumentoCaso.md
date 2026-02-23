
# UGCO_DocumentoCaso

Gestor documental asociado a casos y eventos clínicos, similar al “Gestor Documental” de SIGO.  
Permite adjuntar documentos relevantes (informes, notificaciones obligatorias, imágenes, etc.) a un caso y/o evento.

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: UGCO_DocumentoCaso
-- Documentos asociados a caso/evento
-- =========================================

CREATE TABLE UGCO_DocumentoCaso (
    id_documento       SERIAL PRIMARY KEY,

    caso_id            INTEGER NOT NULL,          -- FK → UGCO_CasoOncologico(id_caso)
    evento_id          INTEGER,                   -- FK → UGCO_EventoClinico(id_evento), opcional

    tipo_documento_id  INTEGER,                   -- FK → REF_OncoTipoDocumento(id), opcional
    nombre_archivo     VARCHAR(255) NOT NULL,     -- nombre original del archivo
    ruta_almacenamiento VARCHAR(500) NOT NULL,    -- ruta física o URL donde se guarda

    seccion_origen     VARCHAR(255),              -- p.ej. "Creación de caso", "Registrar notificación obligatoria"
    fecha_carga        TIMESTAMP NOT NULL DEFAULT NOW(),
    observaciones      TEXT,

    cargado_por        VARCHAR(100) NOT NULL,
    es_visible         BOOLEAN NOT NULL DEFAULT TRUE -- para ocultar documentos si es necesario
);
```

---

## Diccionario de campos

| Campo               | Tipo lógico  | PK | Nulo | Descripción                                                                 |
|---------------------|-------------|----|------|-----------------------------------------------------------------------------|
| id_documento        | entero      | ✔  | No   | Identificador interno del documento.                                       |
| caso_id             | entero (FK) |    | No   | Caso oncológico UGCO al que se asocia el documento.                        |
| evento_id           | entero (FK) |    | Sí   | Evento clínico asociado, si el documento corresponde a un examen/procedimiento concreto. |
| tipo_documento_id   | entero (FK) |    | Sí   | Tipo de documento (informe, notificación, imagen, etc.; catálogo opcional).|
| nombre_archivo      | texto       |    | No   | Nombre original del archivo cargado.                                       |
| ruta_almacenamiento | texto       |    | No   | Ruta o URL donde se almacena el archivo en el sistema.                     |
| seccion_origen      | texto       |    | Sí   | Sección o flujo que originó el documento (ej. “Registrar notificación obligatoria”). |
| fecha_carga         | fecha/hora  |    | No   | Fecha/hora en que se cargó el documento.                                   |
| observaciones       | texto       |    | Sí   | Observaciones adicionales sobre el documento.                              |
| cargado_por         | texto corto |    | No   | Usuario que cargó el documento.                                            |
| es_visible          | booleano    |    | No   | TRUE si el documento se muestra en la interfaz; FALSE para ocultarlo.     |
