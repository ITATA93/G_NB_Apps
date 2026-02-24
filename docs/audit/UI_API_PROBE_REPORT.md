# UI API Probe Report

Generated: 2026-02-18T20:08:54.908Z

## Summary

| # | Endpoint | Method | Status | Notes |
|---|----------|--------|--------|-------|
| 1 | `desktopRoutes:list` | GET | ✅ OK | 3 rutas existentes |
| 2 | `desktopRoutes:list?tree=true` | GET | ✅ OK | Tree mode: 1 top-level |
| 3 | `desktopRoutes:create (group)` | POST | ✅ OK | Group created, ID=349010829049856, keys: createdAt, updatedAt, id, type, title, icon, sort, createdById, updatedById |
| 4 | `desktopRoutes:create (page)` | POST | ✅ OK | Page created, ID=349010833244160, schemaUid=NONE, keys: createdAt, updatedAt, id, type, title, icon, parentId, sort, createdById, updatedById |
| 5 | `desktopRoutes:get (page 349010833244160)` | GET | ✅ OK | schemaUid=NONE, type=page |
| 6 | `uiSchemas:getJsonSchema/nocobase-admin-menu` | GET | ✅ OK | Menu schema retrieved, 1 top-level items |
| 7 | `uiSchemas:insert` | POST | ✅ OK | Schema inserted, x-uid=7j10hwksyfm, keys: type, x-component, name, x-uid, x-async |
| 8 | `uiSchemas:insertAdjacent (child of 7j10hwksyfm)` | POST | ✅ OK | Grid added, x-uid=bro3ugi2536, keys: type, x-component, x-initializer, name, x-uid, x-async, x-index |
| 9 | `uiSchemas:patch` | POST | ✅ OK | Patch successful |
| 10 | `uiSchemas:remove` | POST | ✅ OK | Schema 7j10hwksyfm removed |
| 11 | `desktopRoutes:create (block test page)` | POST | ✅ OK | Page ID=349010835341313, schemaUid=NONE |
| 12 | `uiSchemas:getJsonSchema (grid 1hmcfekh2h8)` | GET | ✅ OK | Grid schema retrieved, keys: type, x-component, x-initializer, name, x-uid, x-async, x-index |
| 13 | `insertAdjacent/Grid.Row+TableBlockProvider` | POST | ✅ OK | Table block created! x-uid=py6xqtztuto |
| 14 | `insertAdjacent/CardItem+Markdown` | POST | ✅ OK | Markdown block created! x-uid=pdnl1aidw24 |

## Detailed Responses

### 1. desktopRoutes:list

```json
{
  "totalRoutes": 3,
  "sampleKeys": [
    "createdAt",
    "updatedAt",
    "id",
    "parentId",
    "title",
    "tooltip",
    "icon",
    "schemaUid",
    "menuSchemaUid",
    "tabSchemaName",
    "type",
    "options",
    "sort",
    "hideInMenu",
    "enableTabs",
    "enableHeader",
    "displayTitle",
    "hidden",
    "createdById",
    "updatedById"
  ]
}
```

### 3. desktopRoutes:create (group)

```json
{
  "createdAt": "2026-02-18T20:08:51.556Z",
  "updatedAt": "2026-02-18T20:08:51.556Z",
  "id": 349010829049856,
  "type": "group",
  "title": "__PROBE_GROUP__",
  "icon": "ExperimentOutlined",
  "sort": 3,
  "createdById": 4,
  "updatedById": 4
}
```

### 4. desktopRoutes:create (page)

```json
{
  "createdAt": "2026-02-18T20:08:53.067Z",
  "updatedAt": "2026-02-18T20:08:53.067Z",
  "id": 349010833244160,
  "type": "page",
  "title": "__PROBE_PAGE__",
  "icon": "FileOutlined",
  "parentId": 349010829049856,
  "sort": 1,
  "createdById": 4,
  "updatedById": 4
}
```

### 5. desktopRoutes:get (page 349010833244160)

```json
{
  "createdAt": "2026-02-18T20:08:53.067Z",
  "updatedAt": "2026-02-18T20:08:53.067Z",
  "id": 349010833244160,
  "parentId": 349010829049856,
  "title": "__PROBE_PAGE__",
  "tooltip": null,
  "icon": "FileOutlined",
  "schemaUid": null,
  "menuSchemaUid": null,
  "tabSchemaName": null,
  "type": "page",
  "options": null,
  "sort": 1,
  "hideInMenu": null,
  "enableTabs": null,
  "enableHeader": null,
  "displayTitle": null,
  "hidden": null,
  "createdById": 4,
  "updatedById": 4
}
```

### 7. uiSchemas:insert

```json
{
  "type": "void",
  "x-component": "Page",
  "name": "__probe_schema_test__",
  "x-uid": "7j10hwksyfm",
  "x-async": true
}
```

### 8. uiSchemas:insertAdjacent (child of 7j10hwksyfm)

```json
{
  "type": "void",
  "x-component": "Grid",
  "x-initializer": "page:addBlock",
  "name": "__probe_grid__",
  "x-uid": "bro3ugi2536",
  "x-async": false,
  "x-index": 1
}
```

### 11. desktopRoutes:create (block test page)

```json
{
  "createdAt": "2026-02-18T20:08:54.439Z",
  "updatedAt": "2026-02-18T20:08:54.439Z",
  "id": 349010835341313,
  "type": "page",
  "title": "__PROBE_BLOCK_PAGE__",
  "icon": "ExperimentOutlined",
  "sort": 4,
  "createdById": 4,
  "updatedById": 4
}
```

### 12. uiSchemas:getJsonSchema (grid 1hmcfekh2h8)

```json
{
  "type": "void",
  "x-component": "Grid",
  "x-initializer": "page:addBlock",
  "name": "grid",
  "x-uid": "1hmcfekh2h8",
  "x-async": false,
  "x-index": 1
}
```

### 13. insertAdjacent/Grid.Row+TableBlockProvider

```json
{
  "type": "void",
  "x-component": "Grid.Row",
  "properties": {
    "col1": {
      "type": "void",
      "x-component": "Grid.Col",
      "properties": {
        "block1": {
          "type": "void",
          "x-component": "CardItem",
          "x-decorator": "TableBlockProvider",
          "x-component-props": {
            "title": "Categorías de Actividad"
          },
          "x-decorator-props": {
            "action": "list",
            "collection": "ag_categorias_actividad",
            "dataSource": "main"
          },
          "properties": {
            "table": {
              "type": "array",
              "x-component": "TableV2",
              "x-component-props": {
                "rowKey": "id",
                "rowSelection": {
                  "type": "checkbox"
                }
              },
              "x-use-component-props": "useTableBlockProps",
              "x-uid": "rc2zkzai2pd",
              "x-async": false,
              "x-index": 1
            }
          },
          "x-uid": "ogox8rov88v",
          "x-async": false,
          "x-index": 1
        }
      },
      "x-uid": "cri63rjcpj9",
      "x-async": false,
      "x-index": 1
    }
  },
  "name": "gnd1njydczq",
  "x-uid": "py6xqtztuto",
  "x-async": false,
  "x-index": 1
}
```

### 14. insertAdjacent/CardItem+Markdown

```json
{
  "type": "void",
  "x-component": "Grid.Row",
  "properties": {
    "col1": {
      "type": "void",
      "x-component": "Grid.Col",
      "properties": {
        "block1": {
          "type": "void",
          "x-component": "Markdown.Void",
          "x-decorator": "CardItem",
          "x-component-props": {
            "content": "# Test Block\n\nThis is a probe test block for ag_tipos_inasistencia."
          },
          "x-uid": "cwivb4bgl4c",
          "x-async": false,
          "x-index": 1
        }
      },
      "x-uid": "96jvcoxtyhv",
      "x-async": false,
      "x-index": 1
    }
  },
  "name": "bnig641l95d",
  "x-uid": "pdnl1aidw24",
  "x-async": false,
  "x-index": 2
}
```


## Conclusion

- **14/14** endpoints functional
- **0** failures