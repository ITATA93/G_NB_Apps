# Referencia de Elementos Visuales NocoBase

**Fecha**: 2026-01-29
**Proyecto**: UGCO Oncologia
**Uso**: Edicion programatica de paginas via API

---

## Estructura General de UI Schema

NocoBase usa un sistema de esquemas JSON para definir la interfaz visual. Cada elemento tiene:

```json
{
  "type": "void",
  "x-component": "NombreComponente",
  "x-component-props": { ... },
  "x-decorator": "DecoradorOpcional",
  "x-uid": "identificador-unico",
  "properties": { ... }
}
```

---

## 1. Componentes de Layout

### Page (Pagina)
Contenedor principal de una pagina.

```json
{
  "type": "void",
  "x-component": "Page",
  "x-async": true,
  "properties": {
    "grid": { ... }
  }
}
```

### Grid (Cuadricula)
Sistema de layout flexible con filas y columnas.

```json
{
  "type": "void",
  "x-component": "Grid",
  "x-initializer": "page:addBlock",
  "properties": {
    "row1": {
      "type": "void",
      "x-component": "Grid.Row",
      "properties": {
        "col1": {
          "type": "void",
          "x-component": "Grid.Col",
          "properties": { ... }
        }
      }
    }
  }
}
```

### CardItem (Tarjeta)
Contenedor visual con borde y sombra.

```json
{
  "type": "void",
  "x-component": "CardItem",
  "x-component-props": {
    "title": "Titulo de la Tarjeta"
  },
  "properties": { ... }
}
```

### Tabs (Pestanas)
Contenedor con pestanas navegables.

```json
{
  "type": "void",
  "x-component": "Tabs",
  "properties": {
    "tab1": {
      "type": "void",
      "x-component": "Tabs.TabPane",
      "x-component-props": { "tab": "Pestana 1" },
      "properties": { ... }
    }
  }
}
```

### Collapse (Acordeon)
Paneles colapsables.

```json
{
  "type": "void",
  "x-component": "Collapse",
  "properties": {
    "panel1": {
      "type": "void",
      "x-component": "Collapse.Panel",
      "x-component-props": { "header": "Panel 1" },
      "properties": { ... }
    }
  }
}
```

---

## 2. Bloques de Datos (Data Blocks)

### TableBlockProvider (Tabla)
Muestra datos en formato tabla con columnas configurables.

```json
{
  "type": "void",
  "x-decorator": "TableBlockProvider",
  "x-decorator-props": {
    "collection": "nombre_coleccion",
    "action": "list",
    "params": {
      "pageSize": 20
    }
  },
  "x-component": "CardItem",
  "properties": {
    "actions": {
      "type": "void",
      "x-component": "ActionBar",
      "x-component-props": { "style": { "marginBottom": 16 } },
      "properties": { ... }
    },
    "table": {
      "type": "array",
      "x-component": "TableV2",
      "x-component-props": {
        "rowKey": "id",
        "rowSelection": { "type": "checkbox" }
      },
      "properties": {
        "column1": {
          "type": "void",
          "x-component": "TableV2.Column",
          "x-component-props": { "width": 200 },
          "properties": {
            "campo": {
              "type": "string",
              "x-component": "CollectionField",
              "x-collection-field": "coleccion.campo",
              "x-read-pretty": true
            }
          }
        }
      }
    }
  }
}
```

### FormBlockProvider (Formulario)
Formulario para crear/editar registros.

```json
{
  "type": "void",
  "x-decorator": "FormBlockProvider",
  "x-decorator-props": {
    "collection": "nombre_coleccion",
    "action": "create"
  },
  "x-component": "CardItem",
  "properties": {
    "form": {
      "type": "void",
      "x-component": "FormV2",
      "x-component-props": {
        "layout": "vertical"
      },
      "properties": {
        "grid": {
          "type": "void",
          "x-component": "Grid",
          "properties": { ... }
        },
        "actions": {
          "type": "void",
          "x-component": "ActionBar",
          "properties": {
            "submit": {
              "type": "void",
              "x-component": "Action",
              "x-component-props": {
                "type": "primary",
                "title": "Guardar"
              },
              "x-action": "submit"
            }
          }
        }
      }
    }
  }
}
```

### DetailsBlockProvider (Detalles)
Vista de lectura de un registro.

```json
{
  "type": "void",
  "x-decorator": "DetailsBlockProvider",
  "x-decorator-props": {
    "collection": "nombre_coleccion",
    "action": "get"
  },
  "x-component": "CardItem",
  "properties": {
    "details": {
      "type": "void",
      "x-component": "Details",
      "properties": { ... }
    }
  }
}
```

### ListBlockProvider (Lista)
Vista de lista con cards individuales.

```json
{
  "type": "void",
  "x-decorator": "ListBlockProvider",
  "x-decorator-props": {
    "collection": "nombre_coleccion",
    "action": "list"
  },
  "x-component": "CardItem",
  "properties": { ... }
}
```

### GridCardBlockProvider (Tarjetas Grid)
Vista de tarjetas en cuadricula responsiva.

```json
{
  "type": "void",
  "x-decorator": "GridCardBlockProvider",
  "x-decorator-props": {
    "collection": "nombre_coleccion",
    "action": "list",
    "columnCount": { "md": 2, "lg": 3, "xl": 4 }
  },
  "x-component": "CardItem",
  "properties": { ... }
}
```

### CalendarBlockProvider (Calendario)
Vista de calendario para fechas/eventos.

```json
{
  "type": "void",
  "x-decorator": "CalendarBlockProvider",
  "x-decorator-props": {
    "collection": "nombre_coleccion",
    "action": "list",
    "fieldNames": {
      "title": "titulo",
      "start": "fecha_inicio",
      "end": "fecha_fin"
    }
  },
  "x-component": "CardItem",
  "properties": { ... }
}
```

### KanbanBlockProvider (Kanban)
Tablero Kanban con columnas arrastrables.

```json
{
  "type": "void",
  "x-decorator": "KanbanBlockProvider",
  "x-decorator-props": {
    "collection": "nombre_coleccion",
    "action": "list",
    "groupField": "estado"
  },
  "x-component": "CardItem",
  "properties": { ... }
}
```

---

## 3. Bloques Simples (No vinculados a datos)

### Markdown.Void (Markdown)
Bloque de texto enriquecido.

```json
{
  "type": "void",
  "x-component": "Markdown.Void",
  "x-component-props": {
    "content": "# Titulo\n\nContenido en **markdown**"
  }
}
```

### ChartBlockProvider (Graficos)
Bloque para graficos y visualizaciones.

```json
{
  "type": "void",
  "x-decorator": "ChartBlockProvider",
  "x-component": "CardItem",
  "properties": {
    "chart": {
      "type": "void",
      "x-component": "G2Plot",
      "x-component-props": {
        "plot": "Pie",
        "config": { ... }
      }
    }
  }
}
```

---

## 4. Componentes de Accion

### Action (Boton)
Boton de accion simple.

```json
{
  "type": "void",
  "x-component": "Action",
  "x-component-props": {
    "title": "Texto del Boton",
    "type": "primary",
    "icon": "PlusOutlined"
  },
  "x-action": "create"
}
```

### Action.Drawer (Panel lateral)
Abre un panel lateral (drawer).

```json
{
  "type": "void",
  "x-component": "Action",
  "x-component-props": {
    "title": "Abrir Panel",
    "openMode": "drawer"
  },
  "properties": {
    "drawer": {
      "type": "void",
      "x-component": "Action.Drawer",
      "x-component-props": { "title": "Titulo del Panel" },
      "properties": { ... }
    }
  }
}
```

### Action.Modal (Dialogo modal)
Abre un dialogo modal.

```json
{
  "type": "void",
  "x-component": "Action",
  "x-component-props": {
    "title": "Abrir Modal",
    "openMode": "modal"
  },
  "properties": {
    "modal": {
      "type": "void",
      "x-component": "Action.Modal",
      "x-component-props": { "title": "Titulo del Modal" },
      "properties": { ... }
    }
  }
}
```

### ActionBar (Barra de acciones)
Contenedor para agrupar botones.

```json
{
  "type": "void",
  "x-component": "ActionBar",
  "x-component-props": {
    "style": { "marginBottom": 16 }
  },
  "properties": {
    "create": { ... },
    "refresh": { ... },
    "filter": { ... }
  }
}
```

---

## 5. Campos de Formulario

### Input (Texto)
```json
{
  "type": "string",
  "x-component": "Input",
  "x-component-props": {
    "placeholder": "Ingrese texto..."
  }
}
```

### Input.TextArea (Area de texto)
```json
{
  "type": "string",
  "x-component": "Input.TextArea",
  "x-component-props": {
    "rows": 4
  }
}
```

### InputNumber (Numero)
```json
{
  "type": "number",
  "x-component": "InputNumber",
  "x-component-props": {
    "min": 0,
    "max": 100
  }
}
```

### DatePicker (Fecha)
```json
{
  "type": "string",
  "x-component": "DatePicker",
  "x-component-props": {
    "showTime": true
  }
}
```

### Select (Selector)
```json
{
  "type": "string",
  "x-component": "Select",
  "enum": [
    { "value": "opcion1", "label": "Opcion 1" },
    { "value": "opcion2", "label": "Opcion 2" }
  ]
}
```

### Checkbox (Casilla)
```json
{
  "type": "boolean",
  "x-component": "Checkbox"
}
```

### Radio.Group (Grupo de radios)
```json
{
  "type": "string",
  "x-component": "Radio.Group",
  "enum": [
    { "value": "a", "label": "Opcion A" },
    { "value": "b", "label": "Opcion B" }
  ]
}
```

### Upload (Carga de archivos)
```json
{
  "type": "array",
  "x-component": "Upload.Attachment",
  "x-component-props": {
    "action": "attachments:create",
    "multiple": true
  }
}
```

### RichText (Texto enriquecido)
```json
{
  "type": "string",
  "x-component": "RichText"
}
```

---

## 6. Iconos Disponibles (Ant Design)

### Iconos Comunes
| Icono | Nombre | Uso |
|-------|--------|-----|
| + | `PlusOutlined` | Crear/Agregar |
| Lapiz | `EditOutlined` | Editar |
| Basura | `DeleteOutlined` | Eliminar |
| Ojo | `EyeOutlined` | Ver |
| Buscar | `SearchOutlined` | Buscar |
| Filtrar | `FilterOutlined` | Filtrar |
| Descargar | `DownloadOutlined` | Descargar |
| Subir | `UploadOutlined` | Subir |
| Guardar | `SaveOutlined` | Guardar |
| Cerrar | `CloseOutlined` | Cerrar |

### Iconos de Navegacion
| Icono | Nombre | Uso |
|-------|--------|-----|
| Home | `HomeOutlined` | Inicio |
| Carpeta | `FolderOutlined` | Grupos/Carpetas |
| Archivo | `FileOutlined` | Paginas |
| Dashboard | `DashboardOutlined` | Dashboard |
| Config | `SettingOutlined` | Configuracion |
| Usuario | `UserOutlined` | Usuarios |
| Equipo | `TeamOutlined` | Grupos |
| Calendario | `CalendarOutlined` | Calendario |
| Chart | `BarChartOutlined` | Graficos |

### Iconos Medicos (UGCO)
| Icono | Nombre | Uso |
|-------|--------|-----|
| Medicina | `MedicineBoxOutlined` | Medicina |
| Corazon | `HeartOutlined` | Cardiologia |
| Experimento | `ExperimentOutlined` | Laboratorio |
| Alerta | `AlertOutlined` | Alertas |

---

## 7. Propiedades Comunes

### x-component-props
Propiedades del componente React.

### x-decorator
Wrapper del componente (ej: `CardItem`, `FormItem`).

### x-decorator-props
Propiedades del decorator.

### x-initializer
Define el inicializador para agregar elementos (ej: `page:addBlock`).

### x-action
Tipo de accion (ej: `create`, `update`, `delete`, `submit`).

### x-action-settings
Configuracion de la accion:
```json
{
  "x-action-settings": {
    "skipValidator": false,
    "assignedValues": {},
    "successMessage": "Guardado exitosamente",
    "manualClose": false,
    "redirecting": false,
    "triggerWorkflows": []
  }
}
```

### x-linkage-rules
Reglas de vinculacion dinamica entre campos.

### x-read-pretty
Modo solo lectura (true/false).

### x-disabled
Deshabilitar componente (true/false).

### x-visible
Visibilidad del componente (true/false).

---

## 8. APIs de UI Schema

### Obtener Schema
```
GET /uiSchemas:getJsonSchema/{uid}
```

### Crear Schema
```
POST /uiSchemas:insert
Body: { schema JSON }
```

### Insertar Adyacente
```
POST /uiSchemas:insertAdjacent/{parentUid}?position=beforeEnd
Body: { schema JSON }
```

Posiciones:
- `beforeBegin` - Antes del elemento
- `afterBegin` - Al inicio dentro del elemento
- `beforeEnd` - Al final dentro del elemento
- `afterEnd` - Despues del elemento

### Actualizar Schema
```
POST /uiSchemas:patch
Body: { "x-uid": "uid", ... cambios }
```

### Eliminar Schema
```
POST /uiSchemas:remove/{uid}
```

---

## 9. Estructura de Pagina UGCO Actual

```
Page (xikvv7wkefy)
└── Grid (bg5ku832fzc)
    └── Grid.Row (yu745rso0z5)
        └── Grid.Col (ly56sjhwfhp)
            └── CardItem (qafw3hyoyqi)
                └── Markdown.Void (4pxscl7if7e)
```

---

## 10. Ejemplo: Pagina con Tabla

```json
{
  "type": "void",
  "x-component": "Page",
  "x-async": true,
  "properties": {
    "grid": {
      "type": "void",
      "x-component": "Grid",
      "x-initializer": "page:addBlock",
      "properties": {
        "row1": {
          "type": "void",
          "x-component": "Grid.Row",
          "properties": {
            "col1": {
              "type": "void",
              "x-component": "Grid.Col",
              "properties": {
                "table": {
                  "type": "void",
                  "x-decorator": "TableBlockProvider",
                  "x-decorator-props": {
                    "collection": "pacientes_oncologia",
                    "action": "list",
                    "params": { "pageSize": 20 }
                  },
                  "x-component": "CardItem",
                  "x-component-props": { "title": "Pacientes" },
                  "properties": {
                    "actions": {
                      "type": "void",
                      "x-component": "ActionBar",
                      "properties": {
                        "create": {
                          "type": "void",
                          "x-component": "Action",
                          "x-component-props": {
                            "type": "primary",
                            "title": "Nuevo Paciente",
                            "icon": "PlusOutlined"
                          }
                        }
                      }
                    },
                    "table": {
                      "type": "array",
                      "x-component": "TableV2",
                      "x-component-props": { "rowKey": "id" },
                      "properties": {}
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

---

## Recursos

- [NocoBase Docs - Blocks](https://docs.nocobase.com/handbook/ui/blocks/)
- [NocoBase Docs - Form Block](https://docs.nocobase.com/handbook/ui/blocks/data-blocks/form/)
- [NocoBase Schema Components (CN)](https://docs-cn.nocobase.com/development/client/ui-schema/components)
- [DeepWiki - Schema Initialization](https://deepwiki.com/nocobase/nocobase/4.5-schema-initialization)
