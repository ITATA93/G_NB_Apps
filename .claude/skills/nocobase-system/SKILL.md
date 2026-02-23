---
name: nocobase-system
description: Gestionar sistema NocoBase. Ver información, plugins, configuración, backups, usuarios y estado general.
argument-hint: <command> [options]
disable-model-invocation: false
allowed-tools: Bash(npx tsx:*), Read
---

# Gestión del Sistema NocoBase

Administra el sistema NocoBase: plugins, usuarios, backups, configuración.

## Script Principal

```bash
npx tsx shared/scripts/manage-system.ts <comando> [opciones]
```

## Comandos Disponibles

### Información del Sistema

```bash
# Ver información general
npx tsx shared/scripts/manage-system.ts info

# Ver configuración
npx tsx shared/scripts/manage-system.ts settings

# Ver estado del sistema
npx tsx shared/scripts/manage-system.ts status
```

### Gestión de Plugins

```bash
# Listar plugins
npx tsx shared/scripts/manage-plugins.ts list

# Buscar plugin
npx tsx shared/scripts/manage-plugins.ts search <nombre>

# Habilitar/deshabilitar
npx tsx shared/scripts/manage-plugins.ts enable <nombre>
npx tsx shared/scripts/manage-plugins.ts disable <nombre>
```

### Gestión de Usuarios

```bash
# Listar usuarios
npx tsx shared/scripts/manage-users.ts list

# Ver usuario
npx tsx shared/scripts/manage-users.ts get <id>

# Crear usuario
npx tsx shared/scripts/manage-users.ts create --username u --email e --password p
```

### Gestión de Backups

```bash
# Listar backups
npx tsx shared/scripts/manage-backup.ts list

# Crear backup
npx tsx shared/scripts/manage-backup.ts create --name "backup-manual"

# Restaurar backup
npx tsx shared/scripts/manage-backup.ts restore <id>
```

### Autenticación

```bash
# Ver configuración de auth
npx tsx shared/scripts/manage-auth.ts config

# Listar proveedores
npx tsx shared/scripts/manage-auth.ts providers
```

### Localización

```bash
# Ver idiomas disponibles
npx tsx shared/scripts/manage-localization.ts list

# Exportar traducciones
npx tsx shared/scripts/manage-localization.ts export --lang es
```

## Scripts Adicionales

| Script | Función |
|--------|---------|
| `manage-api-keys.ts` | Gestión de API keys |
| `manage-env-vars.ts` | Variables de entorno |
| `manage-themes.ts` | Temas visuales |
| `manage-notifications.ts` | Canales de notificación |
| `manage-async-tasks.ts` | Tareas asíncronas |

## Uso Típico

```bash
# Diagnóstico completo
npx tsx shared/scripts/manage-system.ts info
npx tsx shared/scripts/manage-plugins.ts list
npx tsx shared/scripts/manage-datasources.ts list

# Antes de despliegue
npx tsx shared/scripts/manage-backup.ts create --name "pre-deploy"
npx tsx shared/scripts/manage-system.ts status
```

## Variables de Entorno

- `NOCOBASE_BASE_URL`: URL de la API
- `NOCOBASE_API_KEY`: Token de autenticación
