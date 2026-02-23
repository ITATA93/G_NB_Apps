# Scripts Compartidos - NocoBase API

Utilidades CLI compartidas entre **todas las aplicaciones NocoBase** del proyecto MIRA.

---

## Ejecución Rápida

Todos los scripts se ejecutan con `npm run`:

```bash
npm run nb:<comando> -- <subcomando> [opciones]
```

---

## Scripts Disponibles

### `nb:data` - CRUD de Datos (data-crud.ts)

Operaciones CRUD genéricas sobre cualquier colección.

```bash
npm run nb:data -- list <coleccion>                      # listar registros
npm run nb:data -- get <coleccion> <id>                  # obtener un registro
npm run nb:data -- create <coleccion> --campo valor      # crear registro
npm run nb:data -- update <coleccion> <id> --campo valor # actualizar
npm run nb:data -- delete <coleccion> <id>               # eliminar
npm run nb:data -- count <coleccion>                     # contar registros
npm run nb:data -- search <coleccion> --field f --value v # buscar
npm run nb:data -- bulk-create <coleccion> --file data.json  # crear en lote
npm run nb:data -- bulk-update <coleccion> --filter f --campo v # actualizar en lote
npm run nb:data -- bulk-delete <coleccion> --filter f    # eliminar en lote
npm run nb:data -- export <coleccion> [--format csv|json] # exportar datos
```

### `nb:collections` - Gestión de Colecciones (manage-collections.ts)

```bash
npm run nb:collections -- list [--datasource ds]          # listar colecciones
npm run nb:collections -- get <nombre>                    # detalle con campos
npm run nb:collections -- create --name n --title t       # crear colección
npm run nb:collections -- update <nombre> --title t       # actualizar
npm run nb:collections -- delete <nombre>                 # eliminar
npm run nb:collections -- schema <nombre>                 # exportar esquema
npm run nb:collections -- count <nombre>                  # contar registros
npm run nb:collections -- clone <origen> <destino>        # clonar estructura
```

### `nb:fields` - Gestión de Campos (manage-fields.ts)

```bash
npm run nb:fields -- list <coleccion>                     # listar campos
npm run nb:fields -- get <coleccion> <campo>              # detalle del campo
npm run nb:fields -- create <coleccion> --name n --type t --interface i  # crear
npm run nb:fields -- update <coleccion> <campo> --title t # actualizar
npm run nb:fields -- delete <coleccion> <campo>           # eliminar
npm run nb:fields -- interfaces                           # listar interfaces disponibles
```

### `nb:users` - Gestión de Usuarios (manage-users.ts)

```bash
npm run nb:users -- list                                  # listar usuarios
npm run nb:users -- get <id>                              # detalle
npm run nb:users -- create --email e [--nickname n] [--password p]  # crear
npm run nb:users -- update <id> --campo valor             # actualizar
npm run nb:users -- delete <id>                           # eliminar
npm run nb:users -- roles <id>                            # ver roles del usuario
npm run nb:users -- assign-role <id> <rol>                # asignar rol
npm run nb:users -- remove-role <id> <rol>                # quitar rol
```

### `nb:roles` - Gestión de Roles (manage-roles.ts)

```bash
npm run nb:roles -- list                                  # listar roles
npm run nb:roles -- get <nombre>                          # detalle
npm run nb:roles -- create --name n --title t             # crear rol
npm run nb:roles -- update <nombre> --title t             # actualizar
npm run nb:roles -- delete <nombre>                       # eliminar
npm run nb:roles -- users <nombre>                        # usuarios del rol
npm run nb:roles -- resources <nombre>                    # permisos del rol
npm run nb:roles -- grant <rol> <coleccion>               # otorgar permiso
npm run nb:roles -- revoke <rol> <coleccion>              # revocar permiso
```

### `nb:permissions` - Gestión de Permisos (manage-permissions.ts)

```bash
npm run nb:permissions -- list-roles                      # roles con estrategias
npm run nb:permissions -- strategy <rol>                  # estrategia del rol
npm run nb:permissions -- set-strategy <rol> --actions a  # configurar acciones
npm run nb:permissions -- resources <rol>                 # permisos por recurso
npm run nb:permissions -- grant <rol> <col> --actions a   # otorgar permisos
npm run nb:permissions -- revoke <rol> <col>              # revocar permisos
npm run nb:permissions -- check <rol> <col>               # verificar permiso
npm run nb:permissions -- audit                           # auditoría completa
```

### `nb:workflows` - Gestión de Workflows (manage-workflows.ts)

```bash
npm run nb:workflows -- list                              # listar workflows
npm run nb:workflows -- get <id>                          # detalle
npm run nb:workflows -- nodes <id>                        # nodos del workflow
npm run nb:workflows -- enable <id>                       # habilitar
npm run nb:workflows -- disable <id>                      # deshabilitar
npm run nb:workflows -- trigger <id>                      # ejecutar manualmente
npm run nb:workflows -- executions <id>                   # historial de ejecuciones
npm run nb:workflows -- delete <id>                       # eliminar
```

### `nb:system` - Configuración del Sistema (manage-system.ts)

```bash
npm run nb:system -- info                                 # información general
npm run nb:system -- settings                             # configuración actual
npm run nb:system -- set --title "Mi App" [--lang es-ES]  # modificar configuración
npm run nb:system -- auth                                 # proveedores de autenticación
npm run nb:system -- env                                  # variables de entorno
npm run nb:system -- status                               # estado de salud
```

### `nb:plugins` - Gestión de Plugins (manage-plugins.ts)

```bash
npm run nb:plugins -- list [--enabled|--disabled]         # listar plugins
npm run nb:plugins -- get <nombre>                        # detalle
npm run nb:plugins -- enable <nombre>                     # habilitar
npm run nb:plugins -- disable <nombre>                    # deshabilitar
npm run nb:plugins -- search <término>                    # buscar
npm run nb:plugins -- builtin                             # listar built-in
```

### `nb:datasources` - Gestión de Data Sources (manage-datasources.ts)

```bash
npm run nb:datasources -- list                            # listar datasources
npm run nb:datasources -- get <key>                       # detalle
npm run nb:datasources -- collections <key>               # colecciones del DS
npm run nb:datasources -- test <key>                      # probar conexión
npm run nb:datasources -- create --key k --type t --host h --port p --database db --username u --password p
npm run nb:datasources -- enable <key>                    # habilitar
npm run nb:datasources -- disable <key>                   # deshabilitar
npm run nb:datasources -- delete <key>                    # eliminar
npm run nb:datasources -- status                          # resumen con conteos
```

Tipos de datasource: `mysql`, `postgres`, `mariadb`, `mssql`, `oracle`, `kingbase`, `rest-api`

### `nb:backup` - Backup y Restauración (manage-backup.ts)

```bash
npm run nb:backup -- list                                 # listar backups
npm run nb:backup -- create [--name "desc"]               # crear backup
npm run nb:backup -- download <id>                        # descargar backup
npm run nb:backup -- restore <id>                         # restaurar (sobreescribe datos)
npm run nb:backup -- delete <id>                          # eliminar backup
npm run nb:backup -- status                               # estado del sistema
```

### `nb:files` - Gestión de Archivos (manage-files.ts)

```bash
npm run nb:files -- list [--type image] [--limit 50] # listar archivos
npm run nb:files -- get <id>                          # detalle de un archivo
npm run nb:files -- upload --file ./archivo.pdf       # subir archivo
npm run nb:files -- delete <id>                       # eliminar archivo
npm run nb:files -- storages                          # listar storages configurados
npm run nb:files -- storage-get <id>                  # detalle de un storage
npm run nb:files -- stats                             # estadísticas de archivos
```

### `nb:auth` - Autenticación y SSO (manage-auth.ts)

```bash
npm run nb:auth -- list                               # listar proveedores
npm run nb:auth -- get <nombre>                       # detalle de un proveedor
npm run nb:auth -- create --name n --type OIDC --title "SSO"  # crear proveedor
npm run nb:auth -- update <nombre> --title t          # actualizar
npm run nb:auth -- enable <nombre>                    # habilitar
npm run nb:auth -- disable <nombre>                   # deshabilitar
npm run nb:auth -- delete <nombre>                    # eliminar
npm run nb:auth -- check                              # verificar sesión actual
npm run nb:auth -- tokens                             # listar API keys
```

Tipos: `Email/Password`, `SMS`, `OIDC`, `SAML`, `CAS`, `LDAP`, `API keys`

### `nb:ui` - UI Schemas (manage-ui.ts)

```bash
npm run nb:ui -- menus                                # listar menús del sistema
npm run nb:ui -- pages                                # listar páginas
npm run nb:ui -- schema <uid>                         # obtener schema por UID
npm run nb:ui -- tree <uid>                           # árbol de schema (recursivo)
npm run nb:ui -- export <uid> [--file out.json]       # exportar schema a archivo
npm run nb:ui -- import --file schema.json            # importar schema
npm run nb:ui -- delete <uid>                         # eliminar schema
npm run nb:ui -- templates                            # listar block templates
```

### `nb:localization` - Traducciones (manage-localization.ts)

```bash
npm run nb:localization -- list [--module m] [--lang l] # listar traducciones
npm run nb:localization -- get <id>                     # detalle
npm run nb:localization -- create --text t --translation t  # crear
npm run nb:localization -- update <id> --translation t  # actualizar
npm run nb:localization -- delete <id>                  # eliminar
npm run nb:localization -- search <texto>               # buscar
npm run nb:localization -- langs                        # idiomas disponibles
npm run nb:localization -- stats                        # estadísticas de cobertura
npm run nb:localization -- export --lang es-ES [--file f] # exportar
npm run nb:localization -- import --file f [--lang es-ES] # importar
```

### `nb:notifications` - Notificaciones (manage-notifications.ts)

```bash
npm run nb:notifications -- channels                    # listar canales
npm run nb:notifications -- channel-get <id>            # detalle de un canal
npm run nb:notifications -- channel-create --name n --type email  # crear canal
npm run nb:notifications -- channel-update <id> --name n # actualizar canal
npm run nb:notifications -- channel-delete <id>         # eliminar canal
npm run nb:notifications -- send --channel c --to dest --subject s --body b  # enviar
npm run nb:notifications -- logs [--channel c] [--limit n]  # ver logs de envío
npm run nb:notifications -- messages [--status read|unread] # mensajes in-app
npm run nb:notifications -- read <id>                   # marcar como leído
npm run nb:notifications -- read-all                    # marcar todos como leídos
```

Tipos de canal: `email`, `in-app-message`

### `nb:charts` - Visualización de Datos (manage-charts.ts)

```bash
npm run nb:charts -- query --collection c --measures m --dimensions d  # consultar
npm run nb:charts -- query-sql --sql "SELECT ..."       # consulta SQL directa
npm run nb:charts -- collections                        # colecciones disponibles
npm run nb:charts -- fields <coleccion>                 # campos para charts
```

Medidas: `campo:count`, `campo:sum`, `campo:avg`, `campo:min`, `campo:max`

### `nb:env-vars` - Variables de Entorno (manage-env-vars.ts)

```bash
npm run nb:env-vars -- list                             # listar variables
npm run nb:env-vars -- get <nombre>                     # obtener valor
npm run nb:env-vars -- set --name n --value v [--type t] # crear/actualizar
npm run nb:env-vars -- delete <nombre>                  # eliminar variable
```

Tipos: `text` (visible), `secret` (cifrado)

### `nb:import-export` - Importar/Exportar Datos (manage-import-export.ts)

```bash
npm run nb:import-export -- export <coleccion> [--file salida.xlsx]  # exportar
npm run nb:import-export -- import <coleccion> --file datos.xlsx     # importar
npm run nb:import-export -- template <coleccion> [--file tmpl.xlsx]  # plantilla
```

### `nb:async-tasks` - Tareas Asíncronas (manage-async-tasks.ts)

```bash
npm run nb:async-tasks -- list [--status s] [--limit n] # listar tareas
npm run nb:async-tasks -- get <id>                      # detalle de una tarea
npm run nb:async-tasks -- cancel <id>                   # cancelar tarea
npm run nb:async-tasks -- clean [--before YYYY-MM-DD]   # limpiar terminadas
```

Estados: `pending`, `running`, `completed`, `failed`, `cancelled`

### `nb:themes` - Temas Visuales (manage-themes.ts)

```bash
npm run nb:themes -- list                               # listar temas
npm run nb:themes -- get <id>                            # detalle de un tema
npm run nb:themes -- active                              # ver tema activo
npm run nb:themes -- activate <id>                       # activar un tema
npm run nb:themes -- create --name n [--primary #hex] [--dark]  # crear tema
npm run nb:themes -- update <id> [--primary #hex] [--radius N] # actualizar
npm run nb:themes -- delete <id>                         # eliminar tema
npm run nb:themes -- export <id> [--file tema.json]      # exportar tema
npm run nb:themes -- import --file tema.json             # importar tema
```

Opciones de estilo: `--primary`, `--success`, `--warning`, `--error`, `--radius`, `--fontSize`, `--bg`, `--dark`

### `nb:departments` - Departamentos (manage-departments.ts)

```bash
npm run nb:departments -- list                          # listar departamentos (árbol)
npm run nb:departments -- get <id>                      # detalle con miembros
npm run nb:departments -- create --title t [--parent id] # crear departamento
npm run nb:departments -- update <id> --title t         # actualizar
npm run nb:departments -- delete <id>                   # eliminar
npm run nb:departments -- members <deptId>              # listar miembros
npm run nb:departments -- add-member <deptId> <userId>  # agregar miembro
npm run nb:departments -- remove-member <deptId> <userId> # quitar miembro
npm run nb:departments -- set-owner <deptId> <userId>   # asignar responsable
```

### `nb:api-keys` - API Keys (manage-api-keys.ts)

```bash
npm run nb:api-keys -- list                             # listar API keys
npm run nb:api-keys -- create --name n [--role r] [--expiresIn d]  # crear key
npm run nb:api-keys -- delete <id>                      # revocar key
```

### `nb:public-forms` - Formularios Públicos (manage-public-forms.ts)

```bash
npm run nb:public-forms -- list                         # listar formularios
npm run nb:public-forms -- get <key>                    # detalle
npm run nb:public-forms -- create --collection c --title t  # crear
npm run nb:public-forms -- update <key> --title t       # actualizar
npm run nb:public-forms -- enable <key>                 # habilitar
npm run nb:public-forms -- disable <key>                # deshabilitar
npm run nb:public-forms -- delete <key>                 # eliminar
```

### `nb:apps` - Sub-Aplicaciones (manage-apps.ts)

```bash
npm run nb:apps -- list                                 # listar sub-apps
npm run nb:apps -- get <name>                           # detalle
npm run nb:apps -- create --name n [--displayName d]    # crear sub-app
npm run nb:apps -- update <name> --displayName d        # actualizar
npm run nb:apps -- delete <name>                        # eliminar
npm run nb:apps -- start <name>                         # iniciar sub-app
npm run nb:apps -- stop <name>                          # detener sub-app
```

### `nb:custom-requests` - Custom Requests (manage-custom-requests.ts)

```bash
npm run nb:custom-requests -- list                      # listar custom requests
npm run nb:custom-requests -- get <id>                  # detalle
npm run nb:custom-requests -- create --url u [--name n] [--method m]  # crear
npm run nb:custom-requests -- update <id> --url u       # actualizar
npm run nb:custom-requests -- delete <id>               # eliminar
npm run nb:custom-requests -- send <id>                 # ejecutar request
```

### `nb:verification` - Verificación SMS/Email (manage-verification.ts)

```bash
npm run nb:verification -- providers                    # listar proveedores
npm run nb:verification -- provider-create --name n --type t  # crear proveedor
npm run nb:verification -- provider-update <id> --name n      # actualizar
npm run nb:verification -- provider-delete <id>         # eliminar
npm run nb:verification -- list                         # verificaciones recientes
```

Tipos: `sms-aliyun`, `sms-tencent`, `email`

### `nb:db-views` - Vistas SQL (manage-db-views.ts)

```bash
npm run nb:db-views -- list                             # listar vistas SQL
npm run nb:db-views -- get <name>                       # detalle de una vista
npm run nb:db-views -- query <name>                     # ejecutar query
```

### `nb:categories` - Categorías de Colecciones (manage-collection-categories.ts)

```bash
npm run nb:categories -- list                           # listar categorías
npm run nb:categories -- create --name n [--color c]    # crear categoría
npm run nb:categories -- update <id> --name n           # actualizar
npm run nb:categories -- delete <id>                    # eliminar
npm run nb:categories -- reorder <id1,id2,...>           # reordenar
```

Colores: `default`, `red`, `volcano`, `orange`, `gold`, `yellow`, `lime`, `green`, `cyan`, `blue`, `geekblue`, `purple`, `magenta`

---

## ApiClient.ts - Cliente HTTP

Cliente moderno TypeScript para conectarse a la API de NocoBase. Usado por todos los scripts.

### Métodos HTTP

| Método | Uso |
|--------|-----|
| `client.get(endpoint, params)` | GET request |
| `client.post(endpoint, data)` | POST request |
| `client.put(endpoint, data)` | PUT request |
| `client.patch(endpoint, data)` | PATCH request |
| `client.delete(endpoint, params)` | DELETE request |
| `client.listAll(endpoint, params)` | Obtener todas las páginas |

### Utilidades

```typescript
import { createClient, log } from '../../shared/scripts/ApiClient';

const client = createClient();

// GET
const collections = await client.get('/collections:list');

// POST
const newCol = await client.post('/collections:create', { name: 'test' });

// Logging con colores
log('Éxito', 'green');
log('Error', 'red');
log('Info', 'cyan');
log('Advertencia', 'yellow');
```

---

## Configuración

El cliente lee las variables del archivo `.env` en la raíz del proyecto:

```env
NOCOBASE_BASE_URL=https://tu-instancia.com/api
NOCOBASE_API_KEY=tu_token_aqui
NOCOBASE_ROLE=root
```

---

## Estructura

```
shared/scripts/
  ApiClient.ts              # Cliente HTTP compartido
  data-crud.ts              # CRUD genérico de datos
  manage-collections.ts     # Gestión de colecciones
  manage-fields.ts          # Gestión de campos
  manage-users.ts           # Gestión de usuarios
  manage-roles.ts           # Gestión de roles
  manage-permissions.ts     # Gestión de permisos
  manage-workflows.ts       # Gestión de workflows
  manage-system.ts          # Configuración del sistema
  manage-plugins.ts         # Gestión de plugins
  manage-datasources.ts     # Gestión de datasources
  manage-backup.ts          # Backup y restauración
  manage-files.ts           # Archivos y attachments
  manage-auth.ts            # Autenticación y SSO
  manage-ui.ts              # UI Schemas (páginas, menús, bloques)
  manage-localization.ts    # Traducciones e idiomas
  manage-notifications.ts   # Notificaciones (email, in-app)
  manage-charts.ts          # Visualización de datos
  manage-env-vars.ts        # Variables de entorno
  manage-import-export.ts   # Importar/exportar datos (Excel)
  manage-async-tasks.ts     # Tareas asíncronas
  manage-themes.ts          # Temas visuales
  manage-departments.ts     # Departamentos / org structure
  manage-api-keys.ts        # API Keys
  manage-public-forms.ts    # Formularios públicos
  manage-apps.ts            # Sub-aplicaciones (multi-app)
  manage-custom-requests.ts # Custom requests HTTP
  manage-verification.ts    # Verificación SMS/email
  manage-db-views.ts        # Vistas SQL
  manage-collection-categories.ts  # Categorías de colecciones
  _base-api-client.js       # (DEPRECADO)
  README.md                 # Este archivo
```

---

**Mantenido por**: Equipo MIRA - Hospital de Ovalle
**Última actualización**: 2026-01-26
