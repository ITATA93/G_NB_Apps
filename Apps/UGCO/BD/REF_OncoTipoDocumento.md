
# REF_OncoTipoDocumento

Catálogo de **tipos de documento** usados en `UGCO_DocumentoCaso`  
(informes clínicos, notificaciones obligatorias, imágenes, actas de comité, etc.).

---

## DDL (SQL de referencia)

```sql
-- =========================================
-- Tabla: REF_OncoTipoDocumento
-- Tipos de documento oncológico
-- =========================================

CREATE TABLE REF_OncoTipoDocumento (
    id_tipodoc   SERIAL PRIMARY KEY,

    codigo       VARCHAR(50)  NOT NULL UNIQUE,  -- INF_CLIN, NOTIF_OBLIG, IMG, ACTA_COMITE, OTRO, etc.
    nombre       VARCHAR(255) NOT NULL,         -- Informe clínico, Notificación obligatoria, Imagen, etc.
    descripcion  TEXT,
    activo       BOOLEAN NOT NULL DEFAULT TRUE
);
```

---

## Diccionario de campos

| Campo      | Tipo lógico  | PK | Nulo | Descripción                                   |
|------------|-------------|----|------|-----------------------------------------------|
| id_tipodoc | entero      | ✔  | No   | Identificador interno del tipo de documento.  |
| codigo     | texto corto |    | No   | Código técnico del tipo de documento.         |
| nombre     | texto       |    | No   | Nombre visible del tipo de documento.         |
| descripcion| texto       |    | Sí   | Descripción o ejemplo de uso.                 |
| activo     | booleano    |    | No   | TRUE si está disponible para uso.             |
