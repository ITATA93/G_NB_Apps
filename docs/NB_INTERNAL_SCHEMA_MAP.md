# NocoBase Internal Schema Map

Generated: 2026-02-18T20:47:38.711Z

## Collection Overview

| Category | Count |
|----------|-------|
| UI-related | 3 |
| System | 73 |
| Application | 22 |
| **Total** | **98** |

## UI-Related Collections

### activity_blocks

**Title:** Bloques de Actividad

| Field | Type | Interface | Target | ForeignKey |
|-------|------|-----------|--------|------------|
| name | string |  |  |  |
| code | string |  |  |  |
| default_duration | integer | integer |  |  |

### schedule_blocks

**Title:** Bloques de Agenda

| Field | Type | Interface | Target | ForeignKey |
|-------|------|-----------|--------|------------|
| start_time | datetime | datetime |  |  |
| staff | belongsTo | m2o | staff | staffId |
| status | string | select |  |  |
| end_time | datetime | datetime |  |  |
| staffId | bigInt | integer |  |  |
| activityTypeId | bigInt | integer |  |  |
| activity_type | belongsTo | m2o | activity_types | activityTypeId |
| notes | text | textarea |  |  |

### time_blocks

**Title:** Bloques de Horario

## Direct API Probes

### desktopRoutes

**Status:** Available (3+ items)

**Sample keys:** `createdAt`, `updatedAt`, `id`, `parentId`, `title`, `tooltip`, `icon`, `schemaUid`, `menuSchemaUid`, `tabSchemaName`, `type`, `options`, `sort`, `hideInMenu`, `enableTabs`, `enableHeader`, `displayTitle`, `hidden`, `createdById`, `updatedById`

**Sample record:**

```json
{
  "createdAt": "2025-11-27T11:18:46.634Z",
  "updatedAt": "2025-11-27T11:20:22.768Z",
  "id": 47,
  "parentId": null,
  "title": "RECA",
  "tooltip": null,
  "icon": "areachartoutlined",
  "schemaUid": "dcxc5y7wf4v",
  "menuSchemaUid": null,
  "tabSchemaName": null,
  "type": "group",
  "options": null,
  "sort": 2,
  "hideInMenu": null,
  "enableTabs": null,
  "enableHeader": null,
  "displayTitle": null,
  "hidden": null,
  "createdById": 3,
  "updatedById": 3
}
```

### uiSchemas

**Status:** Available (3+ items)

**Sample keys:** `x-uid`, `name`, `type`, `version`, `x-toolbar`, `x-settings`, `x-component`, `x-decorator`, `x-app-version`, `_isJSONSchemaObject`

**Sample record:**

```json
{
  "x-uid": "00gi5ra7fls",
  "name": "24wc0y2stgn",
  "type": "void",
  "version": "2.0",
  "x-toolbar": "TableColumnSchemaToolbar",
  "x-settings": "fieldSettings:TableColumn",
  "x-component": "TableV2.Column",
  "x-decorator": "TableV2.Column.Decorator",
  "x-app-version": "1.9.14",
  "_isJSONSchemaObject": true
}
```

### uiSchemaTemplates

**Status:** Available (2+ items)

**Sample keys:** `createdAt`, `updatedAt`, `key`, `name`, `componentName`, `associationName`, `resourceName`, `collectionName`, `dataSourceKey`, `uid`

**Sample record:**

```json
{
  "createdAt": "2025-12-08T13:18:10.000Z",
  "updatedAt": "2025-12-08T13:18:10.000Z",
  "key": "2buka3554sv",
  "name": "H_user_Tabla",
  "componentName": "Table",
  "associationName": null,
  "resourceName": null,
  "collectionName": "H_user",
  "dataSourceKey": "d_llw3u3ya2ej",
  "uid": "luwd13gmu99"
}
```

### uiSchemaTreePath

**Status:** Available (3+ items)

**Sample keys:** `ancestor`, `descendant`, `depth`, `async`, `type`, `sort`

**Sample record:**

```json
{
  "ancestor": "00gi5ra7fls",
  "descendant": "00gi5ra7fls",
  "depth": 0,
  "async": false,
  "type": "properties",
  "sort": null
}
```

### roles

**Status:** Available (3+ items)

**Sample keys:** `createdAt`, `updatedAt`, `name`, `hidden`, `allowNewMobileMenu`, `strategy`, `description`, `allowConfigure`, `allowNewMenu`, `snippets`, `title`, `default`

**Sample record:**

```json
{
  "createdAt": "2025-10-16T15:05:37.000Z",
  "updatedAt": "2025-10-16T15:05:38.000Z",
  "name": "admin",
  "hidden": false,
  "allowNewMobileMenu": true,
  "strategy": {
    "actions": [
      "create",
      "view",
      "update",
      "destroy",
      "export",
      "importXlsx"
    ]
  },
  "description": null,
  "allowConfigure": true,
  "allowNewMenu": true,
  "snippets": [
    "pm",
    "pm.*",
    "ui.*"
  ],
  "title": "{{t(\"Admin\")}}",
  "default": false
}
```

### rolesDesktopRoutes

**Status:** Available (3+ items)

**Sample keys:** `createdAt`, `updatedAt`, `desktopRouteId`, `roleName`

**Sample record:**

```json
{
  "createdAt": "2025-11-27T11:18:46.000Z",
  "updatedAt": "2025-11-27T11:18:46.000Z",
  "desktopRouteId": 47,
  "roleName": "admin"
}
```

### rolesUiSchemas

**Status:** Error — Request failed with status code 404

### rolesMenuItems

**Status:** Error — Request failed with status code 404

### menuUiSchemas

**Status:** Error — Request failed with status code 404

## Route Comparison: RECA vs AGENDA

### Group Comparison

```json
// RECA Group:
{
  "createdAt": "2025-11-27T11:18:46.634Z",
  "updatedAt": "2025-11-27T11:20:22.768Z",
  "id": 47,
  "parentId": null,
  "title": "RECA",
  "tooltip": null,
  "icon": "areachartoutlined",
  "schemaUid": "dcxc5y7wf4v",
  "menuSchemaUid": null,
  "tabSchemaName": null,
  "type": "group",
  "options": null,
  "sort": 2,
  "hideInMenu": null,
  "enableTabs": null,
  "enableHeader": null,
  "displayTitle": null,
  "hidden": null,
  "createdById": 3,
  "updatedById": 3
}

// AGENDA Group:
{
  "createdAt": "2026-02-18T20:12:27.935Z",
  "updatedAt": "2026-02-18T20:12:27.935Z",
  "id": 349011282034688,
  "parentId": null,
  "title": "Agenda",
  "tooltip": null,
  "icon": "ScheduleOutlined",
  "schemaUid": null,
  "menuSchemaUid": null,
  "tabSchemaName": null,
  "type": "group",
  "options": null,
  "sort": 3,
  "hideInMenu": null,
  "enableTabs": null,
  "enableHeader": null,
  "displayTitle": null,
  "hidden": null,
  "createdById": 4,
  "updatedById": 4
}
```

### RECA Page (functional) — Full record:

```json
{
  "createdAt": "2025-11-27T11:22:48.666Z",
  "updatedAt": "2025-11-27T11:22:48.666Z",
  "id": 48,
  "parentId": 47,
  "title": "Buscar Paciente",
  "tooltip": null,
  "icon": "dollaroutlined",
  "schemaUid": "esyj7702o22",
  "menuSchemaUid": "sfrf3micm6p",
  "tabSchemaName": null,
  "type": "page",
  "options": null,
  "sort": 1,
  "hideInMenu": null,
  "enableTabs": false,
  "enableHeader": null,
  "displayTitle": null,
  "hidden": null,
  "createdById": 3,
  "updatedById": 3
}
```

### AGENDA Page (non-editable) — Full record:

```json
{
  "createdAt": "2026-02-18T20:12:27.992Z",
  "updatedAt": "2026-02-18T20:34:40.865Z",
  "id": 349011282034689,
  "parentId": 349011282034688,
  "title": "Funcionarios",
  "tooltip": null,
  "icon": "TeamOutlined",
  "schemaUid": "5y0arg16q9x",
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

### Field-by-Field Differences

| Field | RECA | AGENDA | Match? |
|-------|------|--------|--------|
| **createdAt** | "2025-11-27T11:22:48.666Z" | "2026-02-18T20:12:27.992Z" | ❌ |
| **createdById** | 3 | 4 | ❌ |
| **enableTabs** | false | null | ❌ |
| **icon** | "dollaroutlined" | "TeamOutlined" | ❌ |
| **id** | 48 | 349011282034689 | ❌ |
| **menuSchemaUid** | "sfrf3micm6p" | null | ❌ |
| **parentId** | 47 | 349011282034688 | ❌ |
| **schemaUid** | "esyj7702o22" | "5y0arg16q9x" | ❌ |
| **title** | "Buscar Paciente" | "Funcionarios" | ❌ |
| **updatedAt** | "2025-11-27T11:22:48.666Z" | "2026-02-18T20:34:40.865Z" | ❌ |
| **updatedById** | 3 | 4 | ❌ |

## Role-Route Bindings

**Total bindings:** 33

**Sample binding:**

```json
{
  "createdAt": "2025-11-27T11:18:46.000Z",
  "updatedAt": "2025-11-27T11:18:46.000Z",
  "desktopRouteId": 47,
  "roleName": "admin"
}
```

**Bindings per role:**

- admin: 12
- member: 12
- root: 9

## Schema Tree Paths

**Sample tree path:**

```json
[
  {
    "ancestor": "00gi5ra7fls",
    "descendant": "00gi5ra7fls",
    "depth": 0,
    "async": false,
    "type": "properties",
    "sort": null
  },
  {
    "ancestor": "00gi5ra7fls",
    "descendant": "ge4vyiclcx5",
    "depth": 1,
    "async": null,
    "type": null,
    "sort": 1
  },
  {
    "ancestor": "0148zc5keqn",
    "descendant": "0148zc5keqn",
    "depth": 0,
    "async": false,
    "type": "properties",
    "sort": null
  },
  {
    "ancestor": "0148zc5keqn",
    "descendant": "1jwz3gv02bw",
    "depth": 3,
    "async": null,
    "type": null,
    "sort": null
  },
  {
    "ancestor": "0148zc5keqn",
    "descendant": "2xev816mp6z",
    "depth": 2,
    "async": null,
    "type": null,
    "sort": null
  }
]
```

## Schema Comparison

### RECA Page Schema (`esyj7702o22`)

```json
{
  "type": "void",
  "x-component": "Page",
  "name": "di7mnda9one",
  "x-uid": "esyj7702o22",
  "x-async": false
}
```

### AGENDA Page Schema (`5y0arg16q9x`)

```json
{
  "type": "void",
  "x-component": "Page",
  "properties": {
    "grid": {
      "type": "void",
      "x-component": "Grid",
      "x-initializer": "page:addBlock",
      "x-uid": "xxe6yw93609",
      "x-async": false,
      "x-index": 1
    }
  },
  "name": "qi0ojgtx6o2",
  "x-uid": "5y0arg16q9x",
  "x-async": true
}
```
