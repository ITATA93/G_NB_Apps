# Reporte de Capacidades API NocoBase - UGCO

**Fecha**: 21-11-2025, 4:56:28 p. m.
**API URL**: https://nocobase.hospitaldeovalle.cl/api

---

## Resumen Ejecutivo

Este reporte documenta qué operaciones se pueden realizar mediante la API de NocoBase vs. qué requiere acceso visual a la interfaz.

## Capacidades Confirmadas

### ✓ Lo que SÍ se puede hacer con la API:

- ✓ READ COLLECTIONS
- ✓ READ COLLECTION DETAIL
- ✓ CREATE COLLECTION
- ✓ DELETE COLLECTION
- ✓ UPDATE COLLECTION
- ✓ CREATE FIELD
- ✓ DELETE FIELD
- ✓ LIST DATA
- ✓ CREATE DATA

### ✗ Lo que NO se puede hacer con la API:


### ⊘ Requiere más pruebas:

- ⊘ UPDATE DATA
- ⊘ DELETE DATA
- ⊘ CREATE RELATION
- ⊘ SQL PLUGIN ENDPOINT
- ⊘ PLUGINS

## Recomendaciones

1. ✓ **SUCCESS**: PUEDES crear colecciones vía API - No necesitas acceso visual para esto
2. ✓ **SUCCESS**: PUEDES crear campos vía API - Podrías poblar las colecciones existentes vacías
3. ℹ️ **INFO**: Acceso visual es opcional pero recomendado para facilitar el trabajo
4. 📋 **ACTION**: Revisar configuración del plugin SQL para mapear datos de ALMA

## Detalles Técnicos

```json
{
  "timestamp": "2025-11-21T19:56:28.937Z",
  "apiUrl": "https://nocobase.hospitaldeovalle.cl/api",
  "capabilities": {
    "read_collections": true,
    "read_collection_detail": true,
    "create_collection": true,
    "delete_collection": true,
    "update_collection": true,
    "create_field": true,
    "delete_field": true,
    "list_data": true,
    "create_data": true,
    "update_data": "not_tested",
    "delete_data": "not_tested",
    "create_relation": "not_tested_requires_setup",
    "sql_plugin_endpoint": "/pm:list",
    "plugins": [
      {
        "packageName": "@nocobase/plugin-acl",
        "name": "acl",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Users & permissions"
        ],
        "homepage": "https://docs.nocobase.com/handbook/acl",
        "packageJson": {
          "name": "@nocobase/plugin-acl",
          "displayName": "Access control",
          "displayName.zh-CN": "权限控制",
          "description": "Based on roles, resources, and actions, access control can precisely manage interface configuration permissions, data operation permissions, menu access permissions, and plugin permissions.",
          "description.zh-CN": "基于角色、资源和操作的权限控制，可以精确控制界面配置权限、数据操作权限、菜单访问权限、插件权限。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/acl",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/acl",
          "keywords": [
            "Users & permissions"
          ],
          "devDependencies": {
            "@types/jsonwebtoken": "^9.0.9",
            "jsonwebtoken": "^9.0.2",
            "react": "^18.2.0",
            "react-dom": "^18.2.0"
          },
          "peerDependencies": {
            "@nocobase/acl": "1.x",
            "@nocobase/actions": "1.x",
            "@nocobase/cache": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "repository": {
            "type": "git",
            "url": "git+https://github.com/nocobase/nocobase.git",
            "directory": "packages/plugins/acl"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Access control",
        "description": "Based on roles, resources, and actions, access control can precisely manage interface configuration permissions, data operation permissions, menu access permissions, and plugin permissions.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "ahooks",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.8"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/cache",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "antd-style",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.1"
          },
          {
            "name": "@nocobase/acl",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-action-bulk-edit",
        "name": "action-bulk-edit",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Actions"
        ],
        "homepage": "https://docs.nocobase.com/handbook/action-bulk-edit",
        "packageJson": {
          "name": "@nocobase/plugin-action-bulk-edit",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/action-bulk-edit",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/action-bulk-edit",
          "displayName": "Action: Batch edit",
          "displayName.zh-CN": "操作：批量编辑",
          "description": "Batch edit all records or selected records.",
          "description.zh-CN": "对全部数据或选中的数据进行批量编辑。",
          "license": "AGPL-3.0",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Actions"
          ]
        },
        "removable": false,
        "displayName": "Action: Batch edit",
        "description": "Batch edit all records or selected records.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@emotion/css",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.13.0"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-action-bulk-update",
        "name": "action-bulk-update",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Actions"
        ],
        "homepage": "https://docs.nocobase.com/handbook/action-bulk-update",
        "packageJson": {
          "name": "@nocobase/plugin-action-bulk-update",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/action-bulk-update",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/action-bulk-update",
          "displayName": "Action: Batch update",
          "displayName.zh-CN": "操作：批量更新",
          "description": "Batch update all records or selected records.",
          "description.zh-CN": "对全部数据或选中的数据进行批量更新。",
          "license": "AGPL-3.0",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Actions"
          ]
        },
        "removable": false,
        "displayName": "Action: Batch update",
        "description": "Batch update all records or selected records.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-action-custom-request",
        "name": "action-custom-request",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Actions"
        ],
        "homepage": "https://docs.nocobase.com/handbook/action-custom-request",
        "packageJson": {
          "name": "@nocobase/plugin-action-custom-request",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/action-custom-request",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/action-custom-request",
          "displayName": "Action: Custom request",
          "displayName.zh-CN": "操作：自定义请求",
          "description": "Sending a request to any HTTP service supports sending context data to the target service.",
          "description.zh-CN": "向任意 HTTP 服务发送请求，支持将上下文数据发送给目标服务。",
          "license": "AGPL-3.0",
          "devDependencies": {
            "@formily/react": "2.x",
            "@formily/shared": "2.x",
            "antd": "5.x",
            "lodash": "4.x",
            "react-i18next": "^11.15.1",
            "react-router-dom": "6.x"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Actions"
          ]
        },
        "removable": false,
        "displayName": "Action: Custom request",
        "description": "Sending a request to any HTTP service supports sending context data to the target service.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/logger",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/evaluators",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "axios",
            "result": true,
            "versionRange": "1.7.x",
            "packageVersion": "1.7.7"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-action-duplicate",
        "name": "action-duplicate",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Actions"
        ],
        "homepage": "https://docs.nocobase.com/handbook/action-duplicate",
        "packageJson": {
          "name": "@nocobase/plugin-action-duplicate",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/action-duplicate",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/action-duplicate",
          "displayName": "Action: Duplicate record",
          "displayName.zh-CN": "操作：复制记录",
          "description": "Duplicate a record, you can either duplicate it into a form and edit it before saving it, or you can duplicate it directly to generate a new record.",
          "description.zh-CN": "复制一条记录，可以复制到表单中编辑后再提交，也可以直接复制并生成一条新记录。",
          "license": "AGPL-3.0",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Actions"
          ]
        },
        "removable": false,
        "displayName": "Action: Duplicate record",
        "description": "Duplicate a record, you can either duplicate it into a form and edit it before saving it, or you can duplicate it directly to generate a new record.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@emotion/css",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.13.0"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-action-export",
        "name": "action-export",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Actions"
        ],
        "homepage": "https://docs.nocobase.com/handbook/action-export",
        "packageJson": {
          "name": "@nocobase/plugin-action-export",
          "displayName": "Action: Export records",
          "displayName.zh-CN": "操作：导出记录",
          "description": "Export filtered records to excel, you can configure which fields to export.",
          "description.zh-CN": "导出筛选后的记录到 Excel 中，可以配置导出哪些字段。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/action-export",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/action-export",
          "devDependencies": {
            "@formily/antd-v5": "1.x",
            "@formily/react": "2.x",
            "@formily/shared": "2.x",
            "@types/node-xlsx": "^0.15.1",
            "async-mutex": "^0.5.0",
            "file-saver": "^2.0.5",
            "node-xlsx": "^0.16.1",
            "react": "^18.2.0",
            "react-i18next": "^11.15.1",
            "xlsx": "https://cdn.sheetjs.com/xlsx-0.20.2/xlsx-0.20.2.tgz"
          },
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Actions"
          ]
        },
        "removable": false,
        "displayName": "Action: Export records",
        "description": "Export filtered records to excel, you can configure which fields to export.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/logger",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "async-mutex",
            "result": true,
            "versionRange": "0.5.x",
            "packageVersion": "0.5.0"
          },
          {
            "name": "@nocobase/data-source-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-action-import",
        "name": "action-import",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Actions"
        ],
        "homepage": "https://docs.nocobase.com/handbook/action-import",
        "packageJson": {
          "name": "@nocobase/plugin-action-import",
          "displayName": "Action: Import records",
          "displayName.zh-CN": "操作：导入记录",
          "description": "Import records using excel templates. You can configure which fields to import and templates will be generated automatically.",
          "description.zh-CN": "使用 Excel 模板导入数据，可以配置导入哪些字段，自动生成模板。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/action-import",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/action-import",
          "devDependencies": {
            "@ant-design/icons": "5.x",
            "@formily/antd-v5": "1.x",
            "@formily/core": "2.x",
            "@formily/react": "2.x",
            "@formily/shared": "2.x",
            "@koa/multer": "^3.1.0",
            "@types/node-xlsx": "^0.15.1",
            "antd": "5.x",
            "async-mutex": "^0.5.0",
            "exceljs": "^4.4.0",
            "file-saver": "^2.0.5",
            "mathjs": "^10.6.0",
            "node-xlsx": "^0.16.1",
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-i18next": "^11.15.1",
            "xlsx": "https://cdn.sheetjs.com/xlsx-0.20.2/xlsx-0.20.2.tgz"
          },
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Actions"
          ]
        },
        "removable": false,
        "displayName": "Action: Import records",
        "description": "Import records using excel templates. You can configure which fields to import and templates will be generated automatically.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@emotion/css",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.13.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "react-dom",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "async-mutex",
            "result": true,
            "versionRange": "0.5.x",
            "packageVersion": "0.5.0"
          },
          {
            "name": "@nocobase/data-source-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "sequelize",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.35.2"
          },
          {
            "name": "@nocobase/logger",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "mathjs",
            "result": true,
            "versionRange": "10.x",
            "packageVersion": "10.6.4"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-action-print",
        "name": "action-print",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Actions"
        ],
        "homepage": "https://docs.nocobase.com/handbook/action-print",
        "packageJson": {
          "name": "@nocobase/plugin-action-print",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/action-print",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/action-print",
          "displayName": "Action: Print",
          "displayName.zh-CN": "操作：打印",
          "description": "Calls the browser's print function to print a record.",
          "description.zh-CN": "调用浏览器的打印功能实现单条数据的打印。",
          "license": "AGPL-3.0",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Actions"
          ]
        },
        "removable": false,
        "displayName": "Action: Print",
        "description": "Calls the browser's print function to print a record.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-auth",
        "name": "auth",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Authentication",
          "Security"
        ],
        "homepage": "https://docs.nocobase.com/handbook/auth",
        "packageJson": {
          "name": "@nocobase/plugin-auth",
          "version": "1.8.30",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/auth",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/auth",
          "devDependencies": {
            "@ant-design/icons": "5.x",
            "@formily/react": "2.x",
            "@formily/shared": "2.x",
            "@types/cron": "^2.0.1",
            "antd": "5.x",
            "cron": "^2.3.1",
            "ms": "^2.1.3",
            "react": "^18.2.0",
            "react-i18next": "^11.15.1"
          },
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/auth": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "displayName": "Authentication",
          "displayName.zh-CN": "用户认证",
          "description": "User authentication management, including password, SMS, and support for Single Sign-On (SSO) protocols, with extensibility.",
          "description.zh-CN": "用户认证管理，包括基础的密码认证、短信认证、SSO 协议的认证等，可扩展。",
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Authentication",
            "Security"
          ]
        },
        "removable": false,
        "displayName": "Authentication",
        "description": "User authentication management, including password, SMS, and support for Single Sign-On (SSO) protocols, with extensibility.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "react-router-dom",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "axios",
            "result": true,
            "versionRange": "1.7.x",
            "packageVersion": "1.7.7"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/auth",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/cache",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/logger",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@emotion/css",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.13.0"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-async-task-manager",
        "name": "async-task-manager",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "packageJson": {
          "name": "@nocobase/plugin-async-task-manager",
          "displayName": "Async task manager",
          "displayName.zh-CN": "异步任务管理器",
          "description": "Manage and monitor asynchronous tasks such as data import/export. Support task progress tracking and notification.",
          "description.zh-CN": "管理和监控数据导入导出等异步任务。支持任务进度���踪和通知。",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/plugin-error-handler": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "dependencies": {
            "p-queue": "^6.6.2"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Async task manager",
        "description": "Manage and monitor asynchronous tasks such as data import/export. Support task progress tracking and notification.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/logger",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/plugin-error-handler",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "dayjs",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.11.13"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-ai",
        "name": "ai",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "packageJson": {
          "name": "@nocobase/plugin-ai",
          "displayName": "AI integration",
          "displayName.zh-CN": "AI 集成",
          "description": "Support integration with AI services, providing AI-related workflow nodes to enhance business processing capabilities.",
          "description.zh-CN": "支持接入 AI 服务，提供 AI 相关的工作流节点，增强业务处理能力。",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/plugin-workflow": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "devDependencies": {
            "@langchain/core": "^0.3.39",
            "@langchain/deepseek": "^0.0.1",
            "@langchain/openai": "^0.4.3"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "AI integration",
        "description": "Support integration with AI services, providing AI-related workflow nodes to enhance business processing capabilities.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-workflow",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "axios",
            "result": true,
            "versionRange": "1.7.x",
            "packageVersion": "1.7.7"
          },
          {
            "name": "@nocobase/resourcer",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-block-iframe",
        "name": "block-iframe",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Blocks"
        ],
        "homepage": "https://docs.nocobase.com/handbook/block-iframe",
        "packageJson": {
          "name": "@nocobase/plugin-block-iframe",
          "displayName": "Block: iframe",
          "displayName.zh-CN": "区块：iframe",
          "description": "Create an iframe block on the page to embed and display external web pages or content.",
          "description.zh-CN": "在页面上创建和管理iframe，用于嵌入和展示外部网页或内容。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/block-iframe",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/block-iframe",
          "devDependencies": {
            "@ant-design/icons": "5.x",
            "@formily/react": "2.x",
            "@formily/shared": "2.x",
            "antd": "5.x",
            "react": "^18.2.0",
            "react-i18next": "^11.15.1",
            "react-iframe": "~1.8.5"
          },
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Blocks"
          ]
        },
        "removable": false,
        "displayName": "Block: iframe",
        "description": "Create an iframe block on the page to embed and display external web pages or content.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-block-workbench",
        "name": "block-workbench",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Blocks"
        ],
        "packageJson": {
          "name": "@nocobase/plugin-block-workbench",
          "version": "1.8.30",
          "displayName": "Block: Action panel",
          "displayName.zh-CN": "区块：操作面板",
          "description": "Centrally manages and displays various actions, allowing users to efficiently perform tasks. It supports extensibility, with current action types including pop-ups, links, scanning, and custom requests.",
          "description.zh-CN": "集中管理和展示各种操作，方便用户快速执行任务。支持扩展，目前支持的操作类型有弹窗、链接、扫描、自定义请求。",
          "main": "dist/server/index.js",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/plugin-mobile": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "devDependencies": {
            "@ant-design/icons": "^5.x",
            "antd": "^5.x",
            "html5-qrcode": "^2.3.8",
            "react-router-dom": "^6.x"
          },
          "keywords": [
            "Blocks"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Block: Action panel",
        "description": "Centrally manages and displays various actions, allowing users to efficiently perform tasks. It supports extensibility, with current action types including pop-ups, links, scanning, and custom requests.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@emotion/css",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.13.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "antd-style",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.1"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@nocobase/plugin-mobile",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-router-dom",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-calendar",
        "name": "calendar",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Collections",
          "Blocks"
        ],
        "homepage": "https://docs.nocobase.com/handbook/calendar",
        "packageJson": {
          "name": "@nocobase/plugin-calendar",
          "version": "1.8.30",
          "displayName": "Calendar",
          "displayName.zh-CN": "日历",
          "description": "Provides callendar collection template and block for managing date data, typically for date/time related information such as events, appointments, tasks, and so on.",
          "description.zh-CN": "提供日历数据表模板和区块，用于管理日期数据，通常用于事件、约会、任务等与日期/时间相关的信息。",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/calendar",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/calendar",
          "types": "./dist/server/index.d.ts",
          "devDependencies": {
            "@ant-design/icons": "5.x",
            "@formily/antd-v5": "1.x",
            "@formily/core": "2.x",
            "@formily/react": "2.x",
            "@formily/shared": "2.x",
            "antd": "5.x",
            "antd-style": "3.7.1",
            "cron-parser": "4.4.0",
            "dayjs": "^1.11.8",
            "lodash": "^4.17.21",
            "react": "^18.2.0",
            "react-big-calendar": "^1.8.1",
            "react-js-cron": "^3.1.0",
            "solarlunar-es": "^1.0.9"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/server": "1.x"
          },
          "repository": {
            "type": "git",
            "url": "git+https://github.com/nocobase/nocobase.git",
            "directory": "packages/plugins/calendar"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Collections",
            "Blocks"
          ]
        },
        "removable": false,
        "displayName": "Calendar",
        "description": "Provides callendar collection template and block for managing date data, typically for date/time related information such as events, appointments, tasks, and so on.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "dayjs",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.11.13"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "react-dom",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "antd-style",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.1"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-client",
        "name": "client",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "packageJson": {
          "name": "@nocobase/plugin-client",
          "displayName": "WEB client",
          "displayName.zh-CN": "WEB 客户端",
          "description": "Provides a client interface for the NocoBase server",
          "description.zh-CN": "为 NocoBase 服务端提供客户端界面",
          "version": "1.8.30",
          "main": "./dist/server/index.js",
          "license": "AGPL-3.0",
          "devDependencies": {
            "antd": "5.x",
            "cronstrue": "^2.11.0",
            "koa-send": "^5.0.1",
            "koa-static": "^5.0.0"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/plugin-localization": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "WEB client",
        "description": "Provides a client interface for the NocoBase server",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-localization",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-collection-sql",
        "name": "collection-sql",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Collections"
        ],
        "homepage": "https://docs-cn.nocobase.com/handbook/collection-sql",
        "packageJson": {
          "name": "@nocobase/plugin-collection-sql",
          "displayName": "Collection: SQL",
          "displayName.zh-CN": "数据表: SQL",
          "description": "Provides SQL collection template",
          "description.zh-CN": "提供 SQL 数据表模板",
          "version": "1.8.30",
          "homepage": "https://docs-cn.nocobase.com/handbook/collection-sql",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/collection-sql",
          "main": "dist/server/index.js",
          "license": "AGPL-3.0",
          "peerDependencies": {
            "@nocobase/client": "0.x",
            "@nocobase/server": "0.x",
            "@nocobase/test": "0.x"
          },
          "keywords": [
            "Collections"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Collection: SQL",
        "description": "Provides SQL collection template",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "sequelize",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.35.2"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-collection-tree",
        "name": "collection-tree",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Collections"
        ],
        "packageJson": {
          "name": "@nocobase/plugin-collection-tree",
          "version": "1.8.30",
          "displayName": "Collection: Tree",
          "displayName.zh-CN": "数据表：树",
          "description": "Provides tree collection template",
          "description.zh-CN": "提供树数据表模板",
          "keywords": [
            "Collections"
          ],
          "main": "dist/server/index.js",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Collection: Tree",
        "description": "Provides tree collection template",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/data-source-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "sequelize",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.35.2"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-data-source-main",
        "name": "data-source-main",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Data sources"
        ],
        "homepage": "https://docs.nocobase.com/handbook/data-source-main",
        "packageJson": {
          "name": "@nocobase/plugin-data-source-main",
          "displayName": "Data source: Main",
          "displayName.zh-CN": "数据源：主数据库",
          "description": "NocoBase main database, supports relational databases such as PostgreSQL, MySQL, MariaDB and so on.",
          "description.zh-CN": "NocoBase 主数据库，支持 PostgreSQL、MySQL、MariaDB 等关系型数据库。",
          "version": "1.8.30",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/data-source-main",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/data-source-main",
          "license": "AGPL-3.0",
          "devDependencies": {
            "@hapi/topo": "^6.0.0",
            "toposort": "^2.0.2"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/plugin-error-handler": "1.x",
            "@nocobase/plugin-field-sort": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Data sources"
          ]
        },
        "removable": false,
        "displayName": "Data source: Main",
        "description": "NocoBase main database, supports relational databases such as PostgreSQL, MySQL, MariaDB and so on.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-error-handler",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "sequelize",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.35.2"
          },
          {
            "name": "dayjs",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.11.13"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-data-source-manager",
        "name": "data-source-manager",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Data model tools"
        ],
        "homepage": "https://docs.nocobase.com/handbook/data-source-manager",
        "packageJson": {
          "name": "@nocobase/plugin-data-source-manager",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "displayName": "Data source manager",
          "displayName.zh-CN": "数据源管理",
          "description": "Manage data sources, including the built-in Master database, external databases, APIs, etc.",
          "description.zh-CN": "管理数据源，包括内置的 Master 数据库，外部的数据库、API。",
          "homepage": "https://docs.nocobase.com/handbook/data-source-manager",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/data-source-manager",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/plugin-acl": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "keywords": [
            "Data model tools"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Data source manager",
        "description": "Manage data sources, including the built-in Master database, external databases, APIs, etc.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/plugin-acl",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/data-source-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/acl",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "react-router-dom",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@emotion/css",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.13.0"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "sequelize",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.35.2"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/reactive",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@dnd-kit/core",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.1.0"
          },
          {
            "name": "antd-style",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.1"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-data-visualization",
        "name": "data-visualization",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Blocks"
        ],
        "homepage": "https://docs.nocobase.com/handbook/data-visualization",
        "packageJson": {
          "name": "@nocobase/plugin-data-visualization",
          "version": "1.8.30",
          "displayName": "Data visualization",
          "displayName.zh-CN": "数据可视化",
          "description": "Provides data visualization feature, including chart block and chart filter block, support line charts, area charts, bar charts and more than a dozen kinds of charts, you can also extend more chart types.",
          "description.zh-CN": "提供数据可视化功能，包含图表区块和图表筛选区块，支持折线图、面积图、柱状图等十几种图表，你也可以扩展更多图表类型。",
          "main": "dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/data-visualization",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/data-visualization",
          "devDependencies": {
            "@ant-design/icons": "5.x",
            "@ant-design/plots": "^2.1.4",
            "@emotion/css": "^11.7.1",
            "@formily/antd-v5": "1.x",
            "@formily/core": "2.x",
            "@formily/react": "2.x",
            "@formily/shared": "2.x",
            "antd": "5.x",
            "classnames": "^2.3.1",
            "koa-compose": "^4.1.0",
            "lodash": "^4.17.21",
            "react": "^18.2.0",
            "react-error-boundary": "^4.0.10",
            "react-i18next": "^11.15.1"
          },
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/cache": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/plugin-data-source-main": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Blocks"
          ]
        },
        "removable": false,
        "displayName": "Data visualization",
        "description": "Provides data visualization feature, including chart block and chart filter block, support line charts, area charts, bar charts and more than a dozen kinds of charts, you can also extend more chart types.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "dayjs",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.11.13"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/cache",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@emotion/css",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.13.0"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "ahooks",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.8"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "sequelize",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.35.2"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-environment-variables",
        "name": "environment-variables",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "System management"
        ],
        "homepage": "https://docs.nocobase.com/handbook/environment-variables",
        "packageJson": {
          "name": "@nocobase/plugin-environment-variables",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "displayName": "Variables and secrets",
          "displayName.zh-CN": "变量和密钥",
          "description": "Centralized management of environment variables and secrets, used for sensitive data storage, configuration data reuse, multi-environment isolation, and more.",
          "description.zh-CN": "集中管理环境变量和密钥，用于敏感数据存储、配置数据重用、多环境隔离等。",
          "homepage": "https://docs.nocobase.com/handbook/environment-variables",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/environment-variables",
          "keywords": [
            "System management"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Variables and secrets",
        "description": "Centralized management of environment variables and secrets, used for sensitive data storage, configuration data reuse, multi-environment isolation, and more.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "react-router-dom",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-error-handler",
        "name": "error-handler",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "packageJson": {
          "name": "@nocobase/plugin-error-handler",
          "displayName": "Error handler",
          "displayName.zh-CN": "错误处理器",
          "description": "Handling application errors and exceptions.",
          "description.zh-CN": "处理应用程序中的错误和异常。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "devDependencies": {
            "@formily/json-schema": "2.x",
            "supertest": "^6.1.6"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "repository": {
            "type": "git",
            "url": "git+https://github.com/nocobase/nocobase.git",
            "directory": "packages/plugin-error-handler"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Error handler",
        "description": "Handling application errors and exceptions.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/json-schema",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-field-formula",
        "name": "field-formula",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Collection fields"
        ],
        "homepage": "https://docs.nocobase.com/handbook/field-formula",
        "packageJson": {
          "name": "@nocobase/plugin-field-formula",
          "displayName": "Collection field: Formula",
          "displayName.zh-CN": "数据表字段：公式",
          "description": "Configure and store the results of calculations between multiple field values in the same record, supporting both Math.js and Excel formula functions.",
          "description.zh-CN": "可以配置并存储同一条记录的多字段值之间的计算结果，支持 Math.js 和 Excel formula functions 两种引擎",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/field-formula",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/field-formula",
          "devDependencies": {
            "@formily/antd-v5": "1.x",
            "@formily/core": "2.x",
            "@formily/react": "2.x",
            "@formily/reactive": "2.x",
            "react": "^18.2.0",
            "react-i18next": "^11.15.1"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/evaluators": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Collection fields"
          ]
        },
        "removable": false,
        "displayName": "Collection field: Formula",
        "description": "Configure and store the results of calculations between multiple field values in the same record, supporting both Math.js and Excel formula functions.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/evaluators",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/reactive",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-field-sequence",
        "name": "field-sequence",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Collection fields"
        ],
        "homepage": "https://docs.nocobase.com/handbook/field-sequence",
        "packageJson": {
          "name": "@nocobase/plugin-field-sequence",
          "displayName": "Collection field: Sequence",
          "displayName.zh-CN": "数据表字段：自动编码",
          "description": "Automatically generate codes based on configured rules, supporting combinations of dates, numbers, and text.",
          "description.zh-CN": "根据配置的规则自动生成编码，支持日期、数字、文本的组合。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/field-sequence",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/field-sequence",
          "devDependencies": {
            "@formily/antd-v5": "1.x",
            "@formily/core": "2.x",
            "@formily/react": "2.x",
            "antd": "5.x",
            "classnames": "^2.3.1",
            "cron-parser": "4.4.0",
            "react": "18.x",
            "react-i18next": "^11.15.1",
            "react-js-cron": "^3.1.0"
          },
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/plugin-data-source-main": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Collection fields"
          ]
        },
        "removable": false,
        "displayName": "Collection field: Sequence",
        "description": "Automatically generate codes based on configured rules, supporting combinations of dates, numbers, and text.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "dayjs",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.11.13"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-field-sort",
        "name": "field-sort",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Collection fields"
        ],
        "packageJson": {
          "name": "@nocobase/plugin-field-sort",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "displayName": "Collection field: Sort",
          "displayName.zh-CN": "数据表字段：排序",
          "description": "Used to sort the data in a collection.",
          "description.zh-CN": "用于对数据表的数据进行排序。",
          "main": "dist/server/index.js",
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/lock-manager": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "lodash": "4.17.21",
            "sequelize": "^6.26.0"
          },
          "keywords": [
            "Collection fields"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Collection field: Sort",
        "description": "Used to sort the data in a collection.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/data-source-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "sequelize",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.35.2"
          },
          {
            "name": "@nocobase/lock-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-file-manager",
        "name": "file-manager",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Collections",
          "Collection fields"
        ],
        "homepage": "https://docs.nocobase.com/handbook/file-manager",
        "packageJson": {
          "name": "@nocobase/plugin-file-manager",
          "version": "1.8.30",
          "displayName": "File manager",
          "displayName.zh-CN": "文件管理器",
          "description": "Provides files storage services with files collection template and attachment field.",
          "description.zh-CN": "提供文件存储服务，并提供了文件表模板和附件字段。",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/file-manager",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/file-manager",
          "devDependencies": {
            "@aws-sdk/client-s3": "3.750.0",
            "@formily/antd-v5": "1.x",
            "@formily/core": "2.x",
            "@formily/react": "2.x",
            "@formily/shared": "2.x",
            "@koa/multer": "^3.1.0",
            "@types/koa-multer": "^1.0.4",
            "@types/mime-types": "^3.0.1",
            "@types/multer": "^1.4.5",
            "antd": "5.x",
            "axios": "^1.7.0",
            "cos-nodejs-sdk-v5": "^2.11.14",
            "koa-static": "^5.0.0",
            "mime-match": "^1.0.2",
            "mime-types": "^3.0.1",
            "mkdirp": "~0.5.4",
            "multer": "^1.4.5-lts.2",
            "multer-aliyun-oss": "2.1.3",
            "multer-cos": "^1.0.3",
            "multer-s3": "^3.0.1",
            "multistream": "^4.1.0",
            "react": "^18.2.0",
            "react-i18next": "^11.15.1",
            "supertest": "^6.1.6",
            "url-join": "4.0.1"
          },
          "dependencies": {
            "file-type": "^21.0.0"
          },
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "keywords": [
            "Collections",
            "Collection fields"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "File manager",
        "description": "Provides files storage services with files collection template and attachment field.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "multer",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.4.5-lts.2"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "sequelize",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.35.2"
          },
          {
            "name": "@nocobase/plugin-data-source-main",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "axios",
            "result": true,
            "versionRange": "1.7.x",
            "packageVersion": "1.7.7"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-gantt",
        "name": "gantt",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Blocks"
        ],
        "homepage": "https://docs.nocobase.com/handbook/block-gantt",
        "packageJson": {
          "name": "@nocobase/plugin-gantt",
          "version": "1.8.30",
          "displayName": "Block: Gantt",
          "displayName.zh-CN": "区块：甘特图",
          "description": "Provides Gantt block.",
          "description.zh-CN": "提供甘特图区块。",
          "license": "AGPL-3.0",
          "main": "dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/block-gantt",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/block-gantt",
          "devDependencies": {
            "antd-style": "3.7.1"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Blocks"
          ]
        },
        "removable": false,
        "displayName": "Block: Gantt",
        "description": "Provides Gantt block.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@emotion/css",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.13.0"
          },
          {
            "name": "antd-style",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.1"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-text-copy",
        "name": "text-copy",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Clipboard",
          "Copy"
        ],
        "homepage": "https://www.nocobase.com",
        "packageJson": {
          "name": "@nocobase/plugin-text-copy",
          "version": "1.8.30",
          "main": "./dist/server/index.js",
          "displayName": "Text copy",
          "displayName.zh-CN": "文本复制",
          "description": "Add copy button to text fields",
          "description.zh-CN": "为文本字段添加复制按钮",
          "license": "AGPL-3.0",
          "homepage": "https://www.nocobase.com",
          "devDependencies": {
            "@ant-design/icons": "5.x",
            "@formily/react": "2.x",
            "antd": "5.x",
            "react": "^18.2.0",
            "react-i18next": "^11.15.1"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "keywords": [
            "Clipboard",
            "Copy"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Text copy",
        "description": "Add copy button to text fields",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-kanban",
        "name": "kanban",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Blocks"
        ],
        "homepage": "https://docs.nocobase.com/handbook/block-kanban",
        "packageJson": {
          "name": "@nocobase/plugin-kanban",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/block-kanban",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/block-kanban",
          "license": "AGPL-3.0",
          "displayName": "Block: Kanban",
          "displayName.zh-CN": "区块：看板",
          "description": "Provides kanban block.",
          "description.zh-CN": "提供看板区块。",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "devDependencies": {
            "react-intersection-observer": "^9.8.1"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Blocks"
          ]
        },
        "removable": false,
        "displayName": "Block: Kanban",
        "description": "Provides kanban block.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@emotion/css",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.13.0"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd-style",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.1"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-logger",
        "name": "logger",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Logging and monitoring"
        ],
        "homepage": "https://docs.nocobase.com/handbook/logger",
        "packageJson": {
          "name": "@nocobase/plugin-logger",
          "displayName": "Logger",
          "displayName.zh-CN": "日志",
          "description": "Server-side logs, mainly including API request logs and system runtime logs, and allows to package and download log files.",
          "description.zh-CN": "服务端日志，主要包括接口请求日志和系统运行日志，并支持打包和下载日志文件。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/logger",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/logger",
          "devDependencies": {
            "@types/tar-fs": "^2.0.2",
            "tar-fs": "^3.0.4"
          },
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Logging and monitoring"
          ]
        },
        "removable": false,
        "displayName": "Logger",
        "description": "Server-side logs, mainly including API request logs and system runtime logs, and allows to package and download log files.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "ahooks",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.8"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/logger",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-notification-manager",
        "name": "notification-manager",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Notification"
        ],
        "homepage": "https://docs.nocobase.com/handbook/notification-manager",
        "packageJson": {
          "name": "@nocobase/plugin-notification-manager",
          "displayName": "Notification manager",
          "description": "Provides a unified management service that includes channel configuration, logging, and other features, supporting the configuration of various notification channels, including in-app message and email.",
          "displayName.zh-CN": "通知管理",
          "description.zh-CN": "提供统一的管理服务，涵盖渠道配置、日志记录等功能，支持多种通知渠道的配置，包括站内信和电子邮件等。",
          "version": "1.8.30",
          "homepage": "https://docs.nocobase.com/handbook/notification-manager",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/notification-manager",
          "main": "dist/server/index.js",
          "devDependencies": {
            "@ant-design/icons": "5.x",
            "@formily/antd-v5": "^1.x",
            "@formily/react": "2.x",
            "@formily/shared": "2.x",
            "@types/cron": "^2.0.1",
            "antd": "5.x",
            "cron": "^2.3.1",
            "react": "^18.2.0",
            "react-i18next": "^11.15.1"
          },
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/plugin-workflow": ">=0.17.0-alpha.3",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "keywords": [
            "Notification"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Notification manager",
        "description": "Provides a unified management service that includes channel configuration, logging, and other features, supporting the configuration of various notification channels, including in-app message and email.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/logger",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "@nocobase/plugin-workflow",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-notification-in-app-message",
        "name": "notification-in-app-message",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Notification"
        ],
        "homepage": "https://docs.nocobase.com/handbook/notification-in-app-message",
        "packageJson": {
          "name": "@nocobase/plugin-notification-in-app-message",
          "version": "1.8.30",
          "displayName": "Notification: In-app message",
          "displayName.zh-CN": "通知：站内信",
          "description": "It supports users in receiving real-time message notifications within the NocoBase application.",
          "description.zh-CN": "支持用户在 NocoBase 应用内实时接收消息通知。",
          "homepage": "https://docs.nocobase.com/handbook/notification-in-app-message",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/notification-in-app-message",
          "keywords": [
            "Notification"
          ],
          "main": "dist/server/index.js",
          "dependencies": {
            "immer": "^10.1.1"
          },
          "devDependencies": {
            "antd-mobile": "^5.38"
          },
          "peerDependencies": {
            "@formily/reactive": "^2",
            "@formily/reactive-react": "^2",
            "@nocobase/client": "1.x",
            "@nocobase/plugin-notification-manager": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "react-router-dom": "^6.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Notification: In-app message",
        "description": "It supports users in receiving real-time message notifications within the NocoBase application.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-notification-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-mobile",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "sequelize",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.35.2"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@formily/reactive-react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "antd-style",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.1"
          },
          {
            "name": "@emotion/css",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.13.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "react-router-dom",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@nocobase/plugin-workflow",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/reactive",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-mobile",
        "name": "mobile",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "homepage": "https://docs.nocobase.com/handbook/mobile",
        "packageJson": {
          "name": "@nocobase/plugin-mobile",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/mobile",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/mobile",
          "license": "AGPL-3.0",
          "displayName": "Mobile",
          "displayName.zh-CN": "移动端",
          "description": "Provides the ability to configure mobile pages.",
          "description.zh-CN": "提供移动端页面配置的能力。",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/plugin-acl": "1.x",
            "@nocobase/plugin-localization": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "devDependencies": {
            "@ant-design/icons": "5.x",
            "@emotion/css": "11.x",
            "@formily/antd-v5": "1.x",
            "@formily/core": "2.x",
            "@formily/react": "2.x",
            "@formily/shared": "2.x",
            "@types/react": "18.x",
            "@types/react-dom": "18.x",
            "ahooks": "3.x",
            "antd": "5.x",
            "antd-mobile": "^5.38",
            "lodash": "4.x",
            "re-resizable": "6.6.0",
            "react-device-detect": "2.2.3",
            "react-i18next": "11.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Mobile",
        "description": "Provides the ability to configure mobile pages.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@emotion/css",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.13.4"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-acl",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "ahooks",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.8"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "antd-style",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.1"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "react-router-dom",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-localization",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/plugin-mobile",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-dom",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/sdk",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/reactive",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "dayjs",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.11.13"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-system-settings",
        "name": "system-settings",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "System management"
        ],
        "homepage": "https://docs.nocobase.com/handbook/system-settings",
        "packageJson": {
          "name": "@nocobase/plugin-system-settings",
          "displayName": "System settings",
          "displayName.zh-CN": "系统设置",
          "description": "Used to adjust the system title, logo, language, etc.",
          "description.zh-CN": "用于调整系统的标题、LOGO、语言等。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/system-settings",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/system-settings",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "System management"
          ]
        },
        "removable": false,
        "displayName": "System settings",
        "description": "Used to adjust the system title, logo, language, etc.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-file-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-ui-schema-storage",
        "name": "ui-schema-storage",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "System & security"
        ],
        "homepage": "https://docs.nocobase.com/handbook/ui-schema-storage",
        "packageJson": {
          "name": "@nocobase/plugin-ui-schema-storage",
          "displayName": "UI schema storage",
          "displayName.zh-CN": "UI schema 存储服务",
          "description": "Provides centralized UI schema storage service.",
          "description.zh-CN": "提供中心化的 UI schema 存储服务。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/ui-schema-storage",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/ui-schema-storage",
          "devDependencies": {
            "@formily/json-schema": "2.x"
          },
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/cache": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/plugin-error-handler": "1.x",
            "@nocobase/resourcer": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "System & security"
          ]
        },
        "removable": false,
        "displayName": "UI schema storage",
        "description": "Provides centralized UI schema storage service.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/cache",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-localization",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/resourcer",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/json-schema",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-user-data-sync",
        "name": "user-data-sync",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Users & permissions"
        ],
        "packageJson": {
          "name": "@nocobase/plugin-user-data-sync",
          "displayName": "User data synchronization",
          "displayName.zh-CN": "用户数据同步",
          "description": "Reigster and manage extensible user data synchronization sources, with HTTP API provided by default. Support for synchronizing data to resources such as users and departments.",
          "description.zh-CN": "注册和管理可扩展的用户数据同步来源，默认提供 HTTP API。支持向用户和部门等资源同步数据。",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "keywords": [
            "Users & permissions"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "User data synchronization",
        "description": "Reigster and manage extensible user data synchronization sources, with HTTP API provided by default. Support for synchronizing data to resources such as users and departments.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/logger",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "dayjs",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.11.13"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-users",
        "name": "users",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Users & permissions"
        ],
        "homepage": "https://docs.nocobase.com/handbook/users",
        "packageJson": {
          "name": "@nocobase/plugin-users",
          "displayName": "Users",
          "displayName.zh-CN": "用户",
          "description": "Provides basic user model, as well as created by and updated by fields.",
          "description.zh-CN": "提供了基础的用户模型，以及创建人和最后更新人字段。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/users",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/users",
          "devDependencies": {
            "@types/jsonwebtoken": "^9.0.9",
            "jsonwebtoken": "^9.0.2"
          },
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/plugin-acl": "1.x",
            "@nocobase/plugin-auth": "1.x",
            "@nocobase/plugin-system-settings": "1.x",
            "@nocobase/plugin-ui-schema-storage": "1.x",
            "@nocobase/plugin-user-data-sync": "1.x",
            "@nocobase/resourcer": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Users & permissions"
          ]
        },
        "removable": false,
        "displayName": "Users",
        "description": "Provides basic user model, as well as created by and updated by fields.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "react-router-dom",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/plugin-acl",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@emotion/css",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.13.0"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-user-data-sync",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-ui-schema-storage",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "sequelize",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.35.2"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-verification",
        "name": "verification",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Authentication",
          "Verification",
          "Security"
        ],
        "homepage": "https://docs.nocobase.com/handbook/verification",
        "packageJson": {
          "name": "@nocobase/plugin-verification",
          "displayName": "Verification",
          "displayName.zh-CN": "验证",
          "description": "User identity verification management, including SMS, TOTP authenticator, with extensibility.",
          "description.zh-CN": "用户身份验证管理，包含短信、TOTP 认证器等，可扩展。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/verification",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/verification",
          "devDependencies": {
            "@alicloud/dysmsapi20170525": "2.0.17",
            "@alicloud/openapi-client": "0.4.12",
            "@alicloud/tea-util": "1.4.4",
            "@formily/antd-v5": "1.x",
            "@formily/core": "2.x",
            "@formily/react": "2.x",
            "@formily/shared": "2.x",
            "antd": "5.x",
            "react": "18.x",
            "react-i18next": "^11.15.1",
            "tencentcloud-sdk-nodejs": "^4.0.525"
          },
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/resourcer": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Authentication",
            "Verification",
            "Security"
          ]
        },
        "removable": false,
        "displayName": "Verification",
        "description": "User identity verification management, including SMS, TOTP authenticator, with extensibility.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/cache",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "react-router-dom",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "dayjs",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.11.13"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-workflow",
        "name": "workflow",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Workflow"
        ],
        "homepage": "https://docs.nocobase.com/handbook/workflow",
        "packageJson": {
          "name": "@nocobase/plugin-workflow",
          "displayName": "Workflow",
          "displayName.zh-CN": "工作流",
          "description": "A powerful BPM tool that provides foundational support for business automation, with the capability to extend unlimited triggers and nodes.",
          "description.zh-CN": "一个强大的 BPM 工具，为业务自动化提供基础支持，并且可任意扩展更多的触发器和节点。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/workflow",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/workflow",
          "devDependencies": {
            "@ant-design/icons": "5.x",
            "@formily/antd-v5": "1.x",
            "@formily/core": "2.x",
            "@formily/react": "2.x",
            "@types/ejs": "^3.1.1",
            "antd": "5.x",
            "classnames": "^2.3.1",
            "cron-parser": "4.4.0",
            "dayjs": "^1.11.8",
            "lodash": "4.17.21",
            "lru-cache": "8.0.5",
            "nodejs-snowflake": "2.0.1",
            "react": "18.x",
            "react-i18next": "^11.15.1",
            "react-js-cron": "^3.1.0",
            "react-router-dom": "^6.11.2",
            "sequelize": "^6.26.0",
            "tinybench": "4.x"
          },
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/evaluators": "1.x",
            "@nocobase/logger": "1.x",
            "@nocobase/plugin-data-source-main": "1.x",
            "@nocobase/plugin-error-handler": "1.x",
            "@nocobase/plugin-mobile": "1.x",
            "@nocobase/plugin-users": "1.x",
            "@nocobase/plugin-workflow-test": "1.x",
            "@nocobase/resourcer": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Workflow"
          ]
        },
        "removable": false,
        "displayName": "Workflow",
        "description": "A powerful BPM tool that provides foundational support for business automation, with the capability to extend unlimited triggers and nodes.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "react-router-dom",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@dnd-kit/core",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.1.0"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@nocobase/plugin-mobile",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "sequelize",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.35.2"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/data-source-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/logger",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/evaluators",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "@formily/reactive",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "dayjs",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.11.13"
          },
          {
            "name": "@nocobase/plugin-workflow-test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-workflow-action-trigger",
        "name": "workflow-action-trigger",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Workflow"
        ],
        "homepage": "https://docs.nocobase.com/plugins/workflow-action-trigger",
        "packageJson": {
          "name": "@nocobase/plugin-workflow-action-trigger",
          "displayName": "Workflow: Post-action event",
          "displayName.zh-CN": "工作流：操作后事件",
          "description": "Triggered after the completion of a request initiated through an action button or API, such as after adding, updating, deleting data, or \"submit to workflow\". Suitable for data processing, sending notifications, etc., after actions are completed.",
          "description.zh-CN": "通过操作按钮或 API 发起请求并在执行完成后触发，比如新增、更新、删除数据或者“提交至工作流”之后。适用于在操作完成后进行数据处理、发送通知等。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/plugins/workflow-action-trigger",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/plugins/workflow-action-trigger",
          "devDependencies": {
            "antd": "5.x",
            "react": "18.x",
            "react-i18next": "^11.15.1"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/plugin-workflow": ">=0.17.0-alpha.3",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Workflow"
          ]
        },
        "removable": false,
        "displayName": "Workflow: Post-action event",
        "description": "Triggered after the completion of a request initiated through an action button or API, such as after adding, updating, deleting data, or \"submit to workflow\". Suitable for data processing, sending notifications, etc., after actions are completed.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-workflow",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "sequelize",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.35.2"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-error-handler",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/data-source-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-workflow-test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-workflow-aggregate",
        "name": "workflow-aggregate",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Workflow"
        ],
        "homepage": "https://docs.nocobase.com/handbook/workflow-aggregate",
        "packageJson": {
          "name": "@nocobase/plugin-workflow-aggregate",
          "displayName": "Workflow: Aggregate node",
          "displayName.zh-CN": "工作流：聚合查询节点",
          "description": "Used to aggregate data against the database in workflow, such as: statistics, sum, average, etc.",
          "description.zh-CN": "可用于在工作流中对数据库进行聚合查询，如：统计数量、求和、平均值等。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/workflow-aggregate",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/workflow-aggregate",
          "devDependencies": {
            "antd": "5.x",
            "mathjs": "^10.6.0",
            "react": "18.x",
            "react-i18next": "^11.15.1"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/plugin-workflow": ">=0.17.0-alpha.3",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Workflow"
          ]
        },
        "removable": false,
        "displayName": "Workflow: Aggregate node",
        "description": "Used to aggregate data against the database in workflow, such as: statistics, sum, average, etc.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-workflow",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "mathjs",
            "result": true,
            "versionRange": "10.x",
            "packageVersion": "10.6.4"
          },
          {
            "name": "@nocobase/data-source-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-workflow-test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-workflow-delay",
        "name": "workflow-delay",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Workflow"
        ],
        "homepage": "https://docs.nocobase.com/handbook/workflow-delay",
        "packageJson": {
          "name": "@nocobase/plugin-workflow-delay",
          "displayName": "Workflow: Delay node",
          "displayName.zh-CN": "工作流：延时节点",
          "description": "Could be used in workflow parallel branch for waiting other branches.",
          "description.zh-CN": "可用于工作流并行分支中等待其��分支执行完成。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/workflow-delay",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/workflow-delay",
          "devDependencies": {
            "antd": "5.x",
            "react": "18.x",
            "react-i18next": "^11.15.1"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/plugin-workflow": ">=0.17.0-alpha.3",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Workflow"
          ]
        },
        "removable": false,
        "displayName": "Workflow: Delay node",
        "description": "Could be used in workflow parallel branch for waiting other branches.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@nocobase/plugin-workflow",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-workflow-loop",
        "name": "workflow-loop",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Workflow"
        ],
        "homepage": "https://docs.nocobase.com/handbook/workflow-loop",
        "packageJson": {
          "name": "@nocobase/plugin-workflow-loop",
          "displayName": "Workflow: Loop node",
          "displayName.zh-CN": "工作流：循环节点",
          "description": "Used to repeat the sub-process processing of each value in an array, and can also be used for fixed times of sub-process processing.",
          "description.zh-CN": "用于对一个数组中的每个值进行重复的子流程处理，也可用于固定次数的重复子流程处理。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/workflow-loop",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/workflow-loop",
          "devDependencies": {
            "@ant-design/icons": "5.x",
            "react": "18.x",
            "react-i18next": "^11.15.1"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/evaluators": "1.x",
            "@nocobase/plugin-workflow": ">=0.17.0-alpha.3",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Workflow"
          ]
        },
        "removable": false,
        "displayName": "Workflow: Loop node",
        "description": "Used to repeat the sub-process processing of each value in an array, and can also be used for fixed times of sub-process processing.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-workflow",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/evaluators",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-workflow-parallel",
        "name": "workflow-parallel",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Workflow"
        ],
        "homepage": "https://docs.nocobase.com/handbook/workflow-parallel",
        "packageJson": {
          "name": "@nocobase/plugin-workflow-parallel",
          "displayName": "Workflow: Parallel node",
          "displayName.zh-CN": "工作流：并行分支节点",
          "description": "Could be used for parallel execution of branch processes in the workflow.",
          "description.zh-CN": "用于在工作流中需要并行执行的分支流程。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/workflow-parallel",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/workflow-parallel",
          "devDependencies": {
            "@ant-design/icons": "5.x",
            "antd": "5.x",
            "react": "18.x",
            "react-i18next": "^11.15.1"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/plugin-workflow": ">=0.17.0-alpha.3",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Workflow"
          ]
        },
        "removable": false,
        "displayName": "Workflow: Parallel node",
        "description": "Could be used for parallel execution of branch processes in the workflow.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-workflow",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-workflow-test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-workflow-request",
        "name": "workflow-request",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Workflow"
        ],
        "homepage": "https://docs.nocobase.com/handbook/workflow-request",
        "packageJson": {
          "name": "@nocobase/plugin-workflow-request",
          "displayName": "Workflow: HTTP request node",
          "displayName.zh-CN": "工作流：HTTP 请求节点",
          "description": "Send HTTP requests to any HTTP service for data interaction in workflow.",
          "description.zh-CN": "可用于在工作流中向任意 HTTP 服务发送请求，进行数据交互。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/workflow-request",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/workflow-request",
          "devDependencies": {
            "antd": "5.x",
            "axios": "^1.7.0",
            "react": "18.x",
            "react-i18next": "^11.15.1"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/plugin-file-manager": "1.x",
            "@nocobase/plugin-workflow": ">=0.17.0-alpha.3",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Workflow"
          ]
        },
        "removable": false,
        "displayName": "Workflow: HTTP request node",
        "description": "Send HTTP requests to any HTTP service for data interaction in workflow.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-workflow",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "axios",
            "result": true,
            "versionRange": "1.7.x",
            "packageVersion": "1.7.7"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/plugin-file-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-workflow-sql",
        "name": "workflow-sql",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Workflow"
        ],
        "homepage": "https://docs.nocobase.com/handbook/workflow-sql",
        "packageJson": {
          "name": "@nocobase/plugin-workflow-sql",
          "displayName": "Workflow: SQL node",
          "displayName.zh-CN": "工作流：SQL 节点",
          "description": "Execute SQL statements in workflow.",
          "description.zh-CN": "可用于在工作流中对数据库执行任意 SQL 语句。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/workflow-sql",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/workflow-sql",
          "devDependencies": {
            "antd": "5.x",
            "react": "18.x",
            "react-i18next": "^11.15.1"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/plugin-workflow": ">=0.17.0-alpha.3",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Workflow"
          ]
        },
        "removable": false,
        "displayName": "Workflow: SQL node",
        "description": "Execute SQL statements in workflow.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-workflow",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/data-source-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-workflow-test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-workflow-notification",
        "name": "workflow-notification",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Workflow"
        ],
        "homepage": "https://docs.nocobase.com/handbook/workflow-smtp-mailer",
        "packageJson": {
          "name": "@nocobase/plugin-workflow-notification",
          "displayName": "Workflow: notification node",
          "displayName.zh-CN": "工作流：通知节点",
          "description": "Send notification in workflow.",
          "description.zh-CN": "可���于在工作流中发送各类通知。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/workflow-smtp-mailer",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/workflow-smtp-mailer",
          "devDependencies": {
            "antd": "5.x",
            "react": "18.x"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/plugin-workflow": ">=0.17.0-alpha.3",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "keywords": [
            "Workflow"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Workflow: notification node",
        "description": "Send notification in workflow.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@nocobase/plugin-workflow",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-notification-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-theme-editor",
        "name": "theme-editor",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "System management"
        ],
        "homepage": "https://docs.nocobase.com/handbook/theme-editor",
        "packageJson": {
          "name": "@nocobase/plugin-theme-editor",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/theme-editor",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/theme-editor",
          "displayName": "Theme editor",
          "displayName.zh-CN": "主题编辑器",
          "description": "Customize UI colors, sizes, etc. and save the result as a theme to switch between multiple themes.",
          "description.zh-CN": "自定义 UI 的颜色、尺寸等，并将结果保存为主题，可在多个主题间切换。",
          "devDependencies": {
            "@ant-design/cssinjs": "^1.11.1",
            "@ant-design/icons": "5.x",
            "@arvinxu/layout-kit": "^1",
            "@ctrl/tinycolor": "^3.6.0",
            "@emotion/css": "^11.11.2",
            "antd": "5.x",
            "classnames": "^2.3.1",
            "lodash": "4.17.21",
            "rc-util": "^5.32.0",
            "react": "^18.2.0",
            "react-colorful": "^5.5.1",
            "tinycolor2": "^1.6.0",
            "use-debouncy": "^4.3.0",
            "vanilla-jsoneditor": "^0.17.8"
          },
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "System management"
          ]
        },
        "removable": false,
        "displayName": "Theme editor",
        "description": "Customize UI colors, sizes, etc. and save the result as a theme to switch between multiple themes.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@ant-design/cssinjs",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.21.1"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@emotion/css",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.13.0"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-block-template",
        "name": "block-template",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "keywords": [
          "Block",
          "Template"
        ],
        "homepage": "https://docs.nocobase.com/handbook/block-template",
        "packageJson": {
          "name": "@nocobase/plugin-block-template",
          "displayName": "Block: template",
          "displayName.zh-CN": "区块：模板",
          "description": "Create and manage block templates for reuse on pages.",
          "description.zh-CN": "创建和管理区块模板，用于在页面中重复使用。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/block-template",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/block-template",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/plugin-ui-schema-storage": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "keywords": [
            "Block",
            "Template"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Block: template",
        "description": "Create and manage block templates for reuse on pages.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/json-schema",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/plugin-mobile",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "ahooks",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.8"
          },
          {
            "name": "react-router-dom",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          },
          {
            "name": "react-router",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "axios",
            "result": true,
            "versionRange": "1.7.x",
            "packageVersion": "1.7.7"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-ui-schema-storage",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "sequelize",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.35.2"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-license",
        "name": "license",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": true,
        "packageJson": {
          "name": "@nocobase/plugin-license",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "displayName": "License settings",
          "displayName.zh-CN": "授权设置",
          "description": "Instance ID and license key settings",
          "description.zh-CN": "实例 ID 和授权密钥设置",
          "devDependencies": {
            "@nocobase/license-kit": "^0.2.17"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "License settings",
        "description": "Instance ID and license key settings",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "ahooks",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.8"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/license-kit",
            "result": true,
            "versionRange": "0.2.x",
            "packageVersion": "0.2.17"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-api-doc",
        "name": "api-doc",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "homepage": "https://docs.nocobase.com/handbook/api-doc",
        "packageJson": {
          "name": "@nocobase/plugin-api-doc",
          "version": "1.8.30",
          "displayName": "API documentation",
          "displayName.zh-CN": "API 文档",
          "description": "An OpenAPI documentation generator for NocoBase HTTP API.",
          "description.zh-CN": "NocoBase HTTP API 的 OpenAPI 文档生成器。",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/api-doc",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/api-doc",
          "types": "./dist/server/index.d.ts",
          "devDependencies": {
            "swagger-ui-dist": "^5.3.1"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/server": "1.x"
          },
          "repository": {
            "type": "git",
            "url": "git+https://github.com/nocobase/nocobase.git",
            "directory": "packages/plugins/api-doc"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "API documentation",
        "description": "An OpenAPI documentation generator for NocoBase HTTP API.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/sdk",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "antd-style",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.1"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-api-keys",
        "name": "api-keys",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "keywords": [
          "Authentication"
        ],
        "homepage": "https://docs.nocobase.com/handbook/api-keys",
        "packageJson": {
          "name": "@nocobase/plugin-api-keys",
          "displayName": "Auth: API keys",
          "displayName.zh-CN": "认证：API 密钥",
          "description": "Allows users to use API key to access application's HTTP API",
          "description.zh-CN": "允许用户使用 API 密钥访问应用的 HTTP API",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/api-keys",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/api-keys",
          "keywords": [
            "Authentication"
          ],
          "devDependencies": {
            "@formily/react": "2.x",
            "@formily/shared": "2.x",
            "ahooks": "^3.7.2",
            "antd": "5.x",
            "dayjs": "^1.11.8",
            "i18next": "^22.4.9",
            "react": "^18.2.0",
            "react-dom": "^18.2.0",
            "react-i18next": "^11.15.1"
          },
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/resourcer": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Auth: API keys",
        "description": "Allows users to use API key to access application's HTTP API",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "ahooks",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.8"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "dayjs",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.11.13"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-auth-sms",
        "name": "auth-sms",
        "version": "1.8.30",
        "enabled": false,
        "installed": false,
        "builtIn": false,
        "keywords": [
          "Authentication"
        ],
        "homepage": "https://docs.nocobase.com/handbook/auth-sms",
        "packageJson": {
          "name": "@nocobase/plugin-auth-sms",
          "displayName": "Auth: SMS",
          "displayName.zh-CN": "认证：短信",
          "description": "SMS authentication.",
          "description.zh-CN": "通过短信验证码认证身份。",
          "version": "1.8.30",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/auth-sms",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/auth-sms",
          "license": "AGPL-3.0",
          "devDependencies": {
            "@formily/react": "2.x",
            "antd": "5.x",
            "react": "18.x",
            "react-i18next": "^11.15.1"
          },
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/auth": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/plugin-auth": ">=0.17.0-alpha.7",
            "@nocobase/plugin-verification": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Authentication"
          ]
        },
        "removable": false,
        "displayName": "Auth: SMS",
        "description": "SMS authentication.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/plugin-auth",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-verification",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/auth",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-departments",
        "name": "departments",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "keywords": [
          "Users & permissions"
        ],
        "packageJson": {
          "name": "@nocobase/plugin-departments",
          "displayName": "Departments",
          "displayName.zh-CN": "部门",
          "description": "Organize users by departments, set hierarchical relationships, link roles to control permissions, and use departments as variables in workflows and expressions.",
          "description.zh-CN": "以部门来组织用户，设定上下级关系，绑定角色控制权限，并支持作为变量用于工作流和表达式。",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/plugin-user-data-sync": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "keywords": [
            "Users & permissions"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Departments",
        "description": "Organize users by departments, set hierarchical relationships, link roles to control permissions, and use departments as variables in workflows and expressions.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-acl",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/plugin-user-data-sync",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/cache",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/data-source-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@emotion/css",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.13.0"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-field-attachment-url",
        "name": "field-attachment-url",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "keywords": [
          "Collection fields"
        ],
        "packageJson": {
          "name": "@nocobase/plugin-field-attachment-url",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "displayName": "Collection field: Attachment(URL)",
          "displayName.zh-CN": "数据表字段：附件（URL）",
          "description": "Supports attachments in URL format.",
          "description.zh-CN": "支持 URL 格式的附件。",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/plugin-file-manager": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "keywords": [
            "Collection fields"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Collection field: Attachment(URL)",
        "description": "Supports attachments in URL format.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-file-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-field-china-region",
        "name": "field-china-region",
        "version": "1.8.30",
        "enabled": false,
        "installed": false,
        "builtIn": false,
        "keywords": [
          "Collection fields"
        ],
        "homepage": "https://docs.nocobase.com/handbook/china-region",
        "packageJson": {
          "name": "@nocobase/plugin-field-china-region",
          "version": "1.8.30",
          "displayName": "Collection field: administrative divisions of China",
          "displayName.zh-CN": "数据表字段：中国行政区划",
          "description": "Provides data and field type for administrative divisions of China.",
          "description.zh-CN": "提供中国行政区划数据和字段类型。",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/china-region",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/china-region",
          "license": "AGPL-3.0",
          "devDependencies": {
            "@formily/core": "2.x",
            "@formily/react": "2.x",
            "@types/cross-spawn": "^6.0.2",
            "china-division": "^2.4.0",
            "cross-spawn": "^7.0.3"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Collection fields"
          ]
        },
        "removable": false,
        "displayName": "Collection field: administrative divisions of China",
        "description": "Provides data and field type for administrative divisions of China.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "china-division",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.7.0"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-field-m2m-array",
        "name": "field-m2m-array",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "keywords": [
          "Collection fields"
        ],
        "packageJson": {
          "name": "@nocobase/plugin-field-m2m-array",
          "displayName": "Collection field: Many to many (array)",
          "displayName.zh-CN": "数据表字段：多对多 (数组)",
          "description": "Allows to create many to many relationships between two models by storing an array of unique keys of the target model.",
          "description.zh-CN": "支持通过在数组中存储目标表唯一键的方式建立多对多关系。",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "keywords": [
            "Collection fields"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Collection field: Many to many (array)",
        "description": "Allows to create many to many relationships between two models by storing an array of unique keys of the target model.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-router-dom",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/data-source-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-field-markdown-vditor",
        "name": "field-markdown-vditor",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "keywords": [
          "Collection fields"
        ],
        "homepage": "https://docs.nocobase.com/handbook/field-markdown-vditor",
        "packageJson": {
          "name": "@nocobase/plugin-field-markdown-vditor",
          "displayName": "Collection field: Markdown(Vditor)",
          "displayName.zh-CN": "数据表字段：Markdown(Vditor)",
          "description": "Used to store Markdown and render it using Vditor editor, supports common Markdown syntax such as list, code, quote, etc., and supports uploading images, recordings, etc.It also allows for instant rendering, where what you see is what you get.",
          "description.zh-CN": "用于存储 Markdown，并使用 Vditor 编辑器渲染，支持常见 Markdown 语法，如列表，代码，引用等，并支持上传图片，录音等。同时可以做到即时渲染，所见即所得。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/field-markdown-vditor",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/field-markdown-vditor",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "devDependencies": {
            "@ant-design/icons": "5.x",
            "@formily/antd-v5": "1.x",
            "@formily/core": "2.x",
            "@formily/react": "2.x",
            "@formily/shared": "2.x",
            "antd": "5.x",
            "koa-send": "^5.0.1",
            "vditor": "^3.10.3"
          },
          "keywords": [
            "Collection fields"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Collection field: Markdown(Vditor)",
        "description": "Used to store Markdown and render it using Vditor editor, supports common Markdown syntax such as list, code, quote, etc., and supports uploading images, recordings, etc.It also allows for instant rendering, where what you see is what you get.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-file-previewer-office",
        "name": "file-previewer-office",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "keywords": [
          "File manager",
          "Collection fields"
        ],
        "packageJson": {
          "name": "@nocobase/plugin-file-previewer-office",
          "displayName": "Office File Previewer",
          "displayName.zh-CN": "Office 文件预览",
          "description": "A plugin for previewing office files via Microsoft live preview service.",
          "description.zh-CN": "基于微软在线服务预览 Office 文件的插件。",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "keywords": [
            "File manager",
            "Collection fields"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Office File Previewer",
        "description": "A plugin for previewing office files via Microsoft live preview service.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-graph-collection-manager",
        "name": "graph-collection-manager",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "keywords": [
          "Data model tools"
        ],
        "homepage": "https://docs.nocobase.com/handbook/graph-collection-manager",
        "packageJson": {
          "name": "@nocobase/plugin-graph-collection-manager",
          "displayName": "Graph collection manager",
          "displayName.zh-CN": "可视化数据表管理",
          "description": "An ER diagram-like tool. Currently only the Master database is supported.",
          "description.zh-CN": "类似 ER 图的工具，目前只支持主数据库。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/graph-collection-manager",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/graph-collection-manager",
          "devDependencies": {
            "@ant-design/icons": "5.x",
            "@antv/x6": "^2.0.0",
            "@antv/x6-plugin-dnd": "^2.0.0",
            "@antv/x6-plugin-export": "^2.0.0",
            "@antv/x6-plugin-minimap": "^2.0.0",
            "@antv/x6-plugin-scroller": "^2.0.0",
            "@antv/x6-plugin-selection": "^2.0.0",
            "@antv/x6-plugin-snapline": "^2.0.0",
            "@antv/x6-react-shape": "^2.0.0",
            "@formily/react": "2.x",
            "@formily/reactive": "2.x",
            "@formily/shared": "2.x",
            "ahooks": "^3.7.2",
            "antd": "5.x",
            "dagre": "^0.8.5",
            "react": "^18.2.0",
            "react-i18next": "^11.15.1"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Data model tools"
          ]
        },
        "removable": false,
        "displayName": "Graph collection manager",
        "description": "An ER diagram-like tool. Currently only the Master database is supported.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@emotion/css",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.13.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "react-router-dom",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          },
          {
            "name": "@formily/reactive",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "ahooks",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.8"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-locale-tester",
        "name": "locale-tester",
        "version": "1.8.30",
        "enabled": false,
        "installed": false,
        "builtIn": false,
        "homepage": "https://github.com/nocobase/locales",
        "packageJson": {
          "name": "@nocobase/plugin-locale-tester",
          "displayName": "Locale tester",
          "displayName.zh-CN": "翻译测试工具",
          "version": "1.8.30",
          "homepage": "https://github.com/nocobase/locales",
          "main": "dist/server/index.js",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Locale tester",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-localization",
        "name": "localization",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "keywords": [
          "System management"
        ],
        "homepage": "https://docs.nocobase.com/handbook/localization-management",
        "packageJson": {
          "name": "@nocobase/plugin-localization",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/localization-management",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/localization-management",
          "license": "AGPL-3.0",
          "devDependencies": {
            "deepmerge": "^4.3.1"
          },
          "peerDependencies": {
            "@nocobase/cache": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "keywords": [
            "System management"
          ],
          "displayName": "Localization",
          "displayName.zh-CN": "本地化",
          "description": "Allows to manage localization resources of the application.",
          "description.zh-CN": "支持管理应用程序的本地化资源。",
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Localization",
        "description": "Allows to manage localization resources of the application.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "ahooks",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.8"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/cache",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-map",
        "name": "map",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "keywords": [
          "Blocks"
        ],
        "homepage": "https://docs.nocobase.com/handbook/block-map",
        "packageJson": {
          "name": "@nocobase/plugin-map",
          "displayName": "Block: Map",
          "displayName.zh-CN": "区块：地图",
          "version": "1.8.30",
          "description": "Map block, support Gaode map and Google map, you can also extend more map types.",
          "description.zh-CN": "地图区块，支持高德地图和 Google 地图，你也可以扩展更多地图类型。",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/block-map",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/block-map",
          "devDependencies": {
            "@amap/amap-jsapi-loader": "^1.0.1",
            "@amap/amap-jsapi-types": "^0.0.10",
            "@ant-design/icons": "5.x",
            "@formily/antd-v5": "1.x",
            "@formily/core": "2.x",
            "@formily/react": "2.x",
            "@formily/shared": "2.x",
            "@googlemaps/js-api-loader": "^1.16.1",
            "@types/google.maps": "^3.53.4",
            "@types/react": "^18.0.0",
            "@types/react-dom": "^18.0.0",
            "ahooks": "^3.7.2",
            "antd": "5.x",
            "react": "18.x",
            "react-dom": "18.x",
            "react-i18next": "^11.15.1",
            "react-router-dom": "^6.11.2"
          },
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Blocks"
          ]
        },
        "removable": false,
        "displayName": "Block: Map",
        "description": "Map block, support Gaode map and Google map, you can also extend more map types.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "@emotion/css",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.13.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "ahooks",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.8"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-multi-app-manager",
        "name": "multi-app-manager",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "keywords": [
          "system"
        ],
        "homepage": "https://docs.nocobase.com/handbook/multi-app-manager",
        "packageJson": {
          "name": "@nocobase/plugin-multi-app-manager",
          "displayName": "Multi-app manager",
          "displayName.zh-CN": "多应用管理器",
          "description": "Dynamically create multiple apps without separate deployments.",
          "description.zh-CN": "无需单独部署即可动态创建多个应用。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/multi-app-manager",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/multi-app-manager",
          "devDependencies": {
            "@formily/react": "2.x",
            "@formily/shared": "2.x",
            "antd": "5.x",
            "antd-style": "3.x",
            "async-mutex": "^0.5.0",
            "mysql2": "^3.11.0",
            "pg": "^8.7.3",
            "react": "18.x",
            "react-i18next": "^11.15.1",
            "react-router-dom": "^6.11.2"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "system"
          ]
        },
        "removable": false,
        "displayName": "Multi-app manager",
        "description": "Dynamically create multiple apps without separate deployments.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "antd-style",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.1"
          },
          {
            "name": "react-router-dom",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "mysql2",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.11.0"
          },
          {
            "name": "pg",
            "result": true,
            "versionRange": "8.x",
            "packageVersion": "8.11.3"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-notification-email",
        "name": "notification-email",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "keywords": [
          "Notification"
        ],
        "homepage": "https://docs.nocobase.com/handbook/notification-email",
        "packageJson": {
          "name": "@nocobase/plugin-notification-email",
          "version": "1.8.30",
          "displayName": "Notification: Email",
          "displayName.zh-CN": "通知：电子邮件",
          "description": "Used for sending email notifications with built-in SMTP transport.",
          "description.zh-CN": "通过电子邮件渠道发送通知，目前只支持 SMTP 传输方式。",
          "homepage": "https://docs.nocobase.com/handbook/notification-email",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/notification-email",
          "main": "dist/server/index.js",
          "devDependencies": {
            "@types/nodemailer": "^6.x",
            "nodemailer": "^6.x"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/plugin-notification-manager": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "keywords": [
            "Notification"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Notification: Email",
        "description": "Used for sending email notifications with built-in SMTP transport.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/plugin-notification-manager",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-public-forms",
        "name": "public-forms",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "homepage": "https://docs.nocobase.com/handbook/public-form",
        "packageJson": {
          "name": "@nocobase/plugin-public-forms",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "displayName": "Public forms",
          "displayName.zh-CN": "公开表单",
          "description": "Share public forms externally to collect information from anonymous users",
          "description.zh-CN": "对外分享公开表单，向匿名用户收集信息。",
          "license": "AGPL-3.0",
          "homepage": "https://docs.nocobase.com/handbook/public-form",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/public-form",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/plugin-client": "1.x",
            "@nocobase/plugin-ui-schema-storage": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "devDependencies": {
            "react-device-detect": "2.2.3"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Public forms",
        "description": "Share public forms externally to collect information from anonymous users",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/plugin-ui-schema-storage",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "react-router",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          },
          {
            "name": "react-router-dom",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "@emotion/css",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.13.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "dayjs",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.11.13"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-workflow-cc",
        "name": "workflow-cc",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "keywords": [
          "Workflow"
        ],
        "homepage": "https://docs.nocobase.com/handbook/workflow-cc",
        "packageJson": {
          "name": "@nocobase/plugin-workflow-cc",
          "displayName": "Workflow: CC",
          "displayName.zh-CN": "工作流：抄送",
          "description": "Provide a CC (carbon copy) feature in workflows to send approvals, or any other type of information to specified users.",
          "description.zh-CN": "在工作流中提供抄送功能，将审批或其他任意信息抄送给特定的用户。",
          "homepage": "https://docs.nocobase.com/handbook/workflow-cc",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/workflow-cc",
          "license": "AGPL-3.0",
          "version": "1.8.30",
          "main": "dist/server/index.js",
          "peerDependencies": {
            "@nocobase/actions": "1.x",
            "@nocobase/client": "1.x",
            "@nocobase/plugin-ui-schema-storage": "1.x",
            "@nocobase/plugin-users": "1.x",
            "@nocobase/plugin-workflow": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "keywords": [
            "Workflow"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Workflow: CC",
        "description": "Provide a CC (carbon copy) feature in workflows to send approvals, or any other type of information to specified users.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-workflow",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "antd-style",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.1"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "react-router-dom",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-ui-schema-storage",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/shared",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.2"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-workflow-dynamic-calculation",
        "name": "workflow-dynamic-calculation",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "keywords": [
          "Workflow",
          "Collections"
        ],
        "homepage": "https://docs.nocobase.com/handbook/workflow-dynamic-calculation",
        "packageJson": {
          "name": "@nocobase/plugin-workflow-dynamic-calculation",
          "displayName": "Workflow: Dynamic calculation node",
          "displayName.zh-CN": "工作流：动态表达式计算节点",
          "description": "Useful plugin for doing dynamic calculation based on expression collection records in workflow.",
          "description.zh-CN": "用于在工作流中进行基于数据行的动态表达式计算。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/workflow-dynamic-calculation",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/workflow-dynamic-calculation",
          "devDependencies": {
            "@ant-design/icons": "5.x",
            "@formily/antd-v5": "1.x",
            "@formily/core": "2.x",
            "@formily/react": "2.x",
            "antd": "5.x",
            "lodash": "4.17.21",
            "react": "18.x",
            "react-i18next": "^11.15.1",
            "react-router-dom": "^6.11.2"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/evaluators": "1.x",
            "@nocobase/plugin-data-source-main": "1.x",
            "@nocobase/plugin-workflow": ">=0.17.0-alpha.3",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Workflow",
            "Collections"
          ]
        },
        "removable": false,
        "displayName": "Workflow: Dynamic calculation node",
        "description": "Useful plugin for doing dynamic calculation based on expression collection records in workflow.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-workflow",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/evaluators",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-workflow-mailer",
        "name": "workflow-mailer",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "keywords": [
          "NocoBase",
          "Workflow",
          "SMTP",
          "email"
        ],
        "homepage": "https://docs.nocobase.com/handbook/workflow-smtp-mailer",
        "packageJson": {
          "name": "@nocobase/plugin-workflow-mailer",
          "displayName": "Workflow: mailer node",
          "displayName.zh-CN": "工作流：邮件发送节点",
          "description": "Send email in workflow.",
          "description.zh-CN": "可用于在工作流中发送电子邮件。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/workflow-smtp-mailer",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/workflow-smtp-mailer",
          "devDependencies": {
            "antd": "5.x",
            "nodemailer": "6.9.13",
            "react": "18.x"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/plugin-workflow": ">=0.17.0-alpha.3",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "NocoBase",
            "Workflow",
            "SMTP",
            "email"
          ]
        },
        "removable": false,
        "displayName": "Workflow: mailer node",
        "description": "Send email in workflow.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-workflow",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-workflow-manual",
        "name": "workflow-manual",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "keywords": [
          "Workflow"
        ],
        "homepage": "https://docs.nocobase.com/handbook/workflow-manual",
        "packageJson": {
          "name": "@nocobase/plugin-workflow-manual",
          "displayName": "Workflow: Manual node",
          "displayName.zh-CN": "工作流：人工处理节点",
          "description": "Could be used for workflows which some of decisions are made by users.",
          "description.zh-CN": "用于人工控制部分决策的流程。",
          "version": "1.8.30",
          "license": "AGPL-3.0",
          "main": "./dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/workflow-manual",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/workflow-manual",
          "devDependencies": {
            "@ant-design/icons": "5.x",
            "@formily/antd-v5": "1.x",
            "@formily/core": "2.x",
            "@formily/react": "2.x",
            "antd": "5.x",
            "lodash": "4.17.21",
            "react": "18.x",
            "react-i18next": "^11.15.1",
            "react-router-dom": "^6.11.2"
          },
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/database": "1.x",
            "@nocobase/plugin-data-source-main": "1.x",
            "@nocobase/plugin-users": "1.x",
            "@nocobase/plugin-workflow": ">=0.17.0-alpha.3",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523",
          "keywords": [
            "Workflow"
          ]
        },
        "removable": false,
        "displayName": "Workflow: Manual node",
        "description": "Could be used for workflows which some of decisions are made by users.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "react-router-dom",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.28.1"
          },
          {
            "name": "@formily/react",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "@formily/antd-v5",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.2.3"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "antd-style",
            "result": true,
            "versionRange": "3.x",
            "packageVersion": "3.7.1"
          },
          {
            "name": "dayjs",
            "result": true,
            "versionRange": "1.x",
            "packageVersion": "1.11.13"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/plugin-workflow",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-mobile",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/utils",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/database",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/actions",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/resourcer",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/plugin-workflow-test",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@formily/core",
            "result": true,
            "versionRange": "2.x",
            "packageVersion": "2.3.0"
          },
          {
            "name": "sequelize",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.35.2"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-workflow-response-message",
        "name": "workflow-response-message",
        "version": "1.8.30",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "keywords": [
          "Workflow"
        ],
        "homepage": "https://docs.nocobase.com/handbook/workflow-response-message",
        "packageJson": {
          "name": "@nocobase/plugin-workflow-response-message",
          "version": "1.8.30",
          "displayName": "Workflow: Response message",
          "displayName.zh-CN": "工作流：响应消息",
          "description": "Used for assemble response message and showing to client in form event and request interception workflows.",
          "description.zh-CN": "用于在表单事件和请求拦截工作流中组装并向客户端显示响应消息。",
          "main": "dist/server/index.js",
          "homepage": "https://docs.nocobase.com/handbook/workflow-response-message",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/workflow-response-message",
          "peerDependencies": {
            "@nocobase/client": "1.x",
            "@nocobase/plugin-workflow": "1.x",
            "@nocobase/server": "1.x",
            "@nocobase/test": "1.x",
            "@nocobase/utils": "1.x"
          },
          "keywords": [
            "Workflow"
          ],
          "gitHead": "92d1f2f81caaf0b9aadafe3c70ca8fc335ece523"
        },
        "removable": false,
        "displayName": "Workflow: Response message",
        "description": "Used for assemble response message and showing to client in form event and request interception workflows.",
        "isCompatible": true,
        "depsCompatible": [
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "@ant-design/icons",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.6.1"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@nocobase/plugin-workflow",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/client",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          },
          {
            "name": "@nocobase/server",
            "result": true,
            "versionRange": "1.8.x",
            "packageVersion": "1.8.30"
          }
        ]
      },
      {
        "packageName": "@nocobase/plugin-data-source-external-mssql",
        "name": "data-source-external-mssql",
        "version": "2.0.0-alpha.36",
        "enabled": true,
        "installed": true,
        "builtIn": false,
        "keywords": [
          "Data sources"
        ],
        "homepage": "https://docs.nocobase.com/handbook/data-source-external-mssql",
        "packageJson": {
          "name": "@nocobase/plugin-data-source-external-mssql",
          "version": "2.0.0-alpha.36",
          "main": "dist/server/index.js",
          "displayName": "Data source: External SQL Server",
          "displayName.zh-CN": "数据源：外部 SQL Server",
          "description": "Use external SQL Server databases as data sources.",
          "description.zh-CN": "使用外部的 SQL Server 数据库作为数据源。",
          "homepage": "https://docs.nocobase.com/handbook/data-source-external-mssql",
          "homepage.zh-CN": "https://docs-cn.nocobase.com/handbook/data-source-external-mssql",
          "keywords": [
            "Data sources"
          ],
          "nocobase": {
            "supportedVersions": [
              "1.x",
              "2.x"
            ],
            "points": 2
          },
          "peerDependencies": {
            "@nocobase/client": "2.x",
            "@nocobase/plugin-data-source-manager": "2.x",
            "@nocobase/server": "2.x",
            "@nocobase/test": "2.x"
          },
          "devDependencies": {
            "external-db-data-source": "2.0.0-alpha.36",
            "tedious": "^18.2.4"
          },
          "gitHead": "c1170bac3ba2325b7420ce65e732c1ba8bbb7767"
        },
        "removable": false,
        "displayName": "Data source: External SQL Server",
        "description": "Use external SQL Server databases as data sources.",
        "isCompatible": false,
        "depsCompatible": [
          {
            "name": "@nocobase/client",
            "result": false,
            "versionRange": "1.8.x",
            "packageVersion": "2.0.0-alpha.36"
          },
          {
            "name": "react",
            "result": true,
            "versionRange": "18.x",
            "packageVersion": "18.2.0"
          },
          {
            "name": "antd",
            "result": true,
            "versionRange": "5.x",
            "packageVersion": "5.24.2"
          },
          {
            "name": "@nocobase/plugin-data-source-manager",
            "result": false,
            "versionRange": "1.8.x",
            "packageVersion": "2.0.0-alpha.36"
          },
          {
            "name": "react-i18next",
            "result": true,
            "versionRange": "11.x",
            "packageVersion": "11.18.6"
          },
          {
            "name": "@nocobase/data-source-manager",
            "result": false,
            "versionRange": "1.8.x",
            "packageVersion": "2.0.0-alpha.36"
          },
          {
            "name": "@nocobase/database",
            "result": false,
            "versionRange": "1.8.x",
            "packageVersion": "2.0.0-alpha.36"
          },
          {
            "name": "lodash",
            "result": true,
            "versionRange": "4.x",
            "packageVersion": "4.17.21"
          },
          {
            "name": "@nocobase/server",
            "result": false,
            "versionRange": "1.8.x",
            "packageVersion": "2.0.0-alpha.36"
          },
          {
            "name": "sequelize",
            "result": true,
            "versionRange": "6.x",
            "packageVersion": "6.35.2"
          }
        ]
      }
    ]
  },
  "permissions": {
    "can_read_roles": true,
    "can_check_auth": true,
    "current_user": {
      "id": 4,
      "nickname": null,
      "role": "unknown"
    }
  },
  "recommendations": [
    {
      "type": "success",
      "message": "PUEDES crear colecciones vía API - No necesitas acceso visual para esto"
    },
    {
      "type": "success",
      "message": "PUEDES crear campos vía API - Podrías poblar las colecciones existentes vacías"
    },
    {
      "type": "info",
      "message": "Acceso visual es opcional pero recomendado para facilitar el trabajo"
    },
    {
      "type": "action",
      "message": "Revisar configuración del plugin SQL para mapear datos de ALMA"
    }
  ],
  "testCollection": "test_api_capability_1763754989107"
}
```
