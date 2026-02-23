# Reporte de Plugin SQL - NocoBase UGCO

**Fecha**: 21-11-2025, 5:10:54 p. m.

---

## Hallazgos vía API

- Data Sources: 2
- Plugins SQL: 5
- Colecciones SQL: 0
- Queries SQL: 0

### Data Sources Encontrados

#### {{t("Main")}}

- **Key**: main
- **Type**: main
- **Enabled**: Sí
- **Database**: N/A

#### SIDRA

- **Key**: d_llw3u3ya2ej
- **Type**: mssql
- **Enabled**: Sí
- **Database**: DB_SIDRA_TEST

### Plugins SQL Encontrados

#### Collection: SQL

- **Package**: @nocobase/plugin-collection-sql
- **Version**: 1.8.30
- **Enabled**: Sí
- **Descripción**: Provides SQL collection template

#### Data source: Main

- **Package**: @nocobase/plugin-data-source-main
- **Version**: 1.8.30
- **Enabled**: Sí
- **Descripción**: NocoBase main database, supports relational databases such as PostgreSQL, MySQL, MariaDB and so on.

#### Data source manager

- **Package**: @nocobase/plugin-data-source-manager
- **Version**: 1.8.30
- **Enabled**: Sí
- **Descripción**: Manage data sources, including the built-in Master database, external databases, APIs, etc.

#### Workflow: SQL node

- **Package**: @nocobase/plugin-workflow-sql
- **Version**: 1.8.30
- **Enabled**: Sí
- **Descripción**: Execute SQL statements in workflow.

#### Data source: External SQL Server

- **Package**: @nocobase/plugin-data-source-external-mssql
- **Version**: 2.0.0-alpha.36
- **Enabled**: Sí
- **Descripción**: Use external SQL Server databases as data sources.

## Guía de Inspección Manual

Si la API no expone toda la información, sigue estos pasos:

### Paso 1: Abrir Chrome DevTools

1. Ir a https://nocobase.hospitaldeovalle.cl/
2. Presionar F12 para abrir DevTools
3. Ir a la pestaña "Network" (Red)

### Paso 2: Navegar a Secciones Relevantes

Navegar en NocoBase a:
- Configuración de "Data Sources"
- Configuración de "SQL Collections"
- Cualquier vista que muestre datos de ALMA

### Paso 3: Analizar Requests

Buscar requests que contengan:
- "dataSource" o "data-source"
- "sql" o "query"
- "alma" o "trakcare"

### Paso 4: Ejecutar en Consola

```javascript
// Ver data sources
fetch("https://nocobase.hospitaldeovalle.cl/api/dataSources:list", {
  headers: { "Authorization": "Bearer YOUR_TOKEN" }
}).then(r => r.json()).then(console.log)
```

## Próximos Pasos

1. Inspeccionar manualmente con DevTools
2. Compartir los JSON encontrados
3. Mapear las queries ALMA a colecciones NocoBase
4. Crear las colecciones correspondientes vía API

