# Colecciones de Referencia

Esta carpeta contiene la documentación de las colecciones de referencia (catálogos, maestros).

## Descripción

Las colecciones de referencia son tablas que contienen datos estáticos o semi-estáticos usados como catálogos en la aplicación. A diferencia de las colecciones propias (que almacenan datos operacionales), estas colecciones se cargan una vez y se actualizan periódicamente.

## Diferencia con Diccionarios

- **Diccionarios** (`BD/diccionarios/`): Archivos JSON/CSV con los datos
- **Referencias** (`BD/referencias/`): Documentación de las colecciones que almacenan esos datos

## Convenciones de Nomenclatura

Todas las colecciones de referencia usan el prefijo `ref_`:

- `ref_especialidades` - Especialidades médicas
- `ref_cie10` - Códigos CIE-10 de diagnósticos
- `ref_[nombre]` - Otras referencias

## Colecciones Documentadas

<!-- Actualizar conforme se agregan colecciones -->

- [ ] [ref_especialidades.md](ref_especialidades.md) - Especialidades médicas
- [ ] [ref_cie10.md](ref_cie10.md) - Códigos de diagnóstico CIE-10
- [ ] [ref_[nombre].md](ref_[nombre].md) - [Descripción]

## Template

Cada colección de referencia debe documentarse usando el template:

```
[NOMBRE_COLECCION].md
```

Basado en el template general de colecciones pero con secciones adicionales específicas para referencias:
- Fuente de datos
- Frecuencia de actualización
- Proceso de actualización

## Características Comunes

### Campos Estándar

Todas las colecciones de referencia incluyen:

```
id              - Identificador único
codigo          - Código alfanumérico (único)
nombre          - Nombre descriptivo
descripcion     - Descripción detallada (opcional)
activo          - Booleano indicando vigencia
orden           - Orden de visualización (opcional)
created_at      - Fecha de creación
updated_at      - Fecha de actualización
```

### Permisos

Las colecciones de referencia típicamente tienen permisos:

| Rol | Create | Read | Update | Delete |
|-----|--------|------|--------|--------|
| admin | ✅ | ✅ | ✅ | ⚠️ (soft delete) |
| usuario | ❌ | ✅ | ❌ | ❌ |
| readonly | ❌ | ✅ | ❌ | ❌ |

**Nota**: Generalmente no se eliminan registros de referencia, solo se marcan como `activo = false`.

## Actualización de Datos de Referencia

### Proceso Estándar

1. **Obtener datos actualizados** de la fuente oficial
2. **Actualizar archivo** en `BD/diccionarios/`
3. **Ejecutar script** de actualización:
   ```bash
   node scripts/seed/update-references.ts --collection ref_[nombre]
   ```
4. **Verificar** datos actualizados en UI
5. **Documentar** cambios en CHANGELOG

### Frecuencia de Actualización

| Colección | Fuente | Frecuencia | Responsable |
|-----------|--------|------------|-------------|
| ref_especialidades | DEIS | Anual | [Nombre] |
| ref_cie10 | OMS | Anual | [Nombre] |
| ref_[nombre] | [Fuente] | [Frecuencia] | [Nombre] |

## Carga Inicial

### Orden de Carga

Cargar en orden de dependencias:

1. **Sin dependencias**:
   - ref_tipos
   - ref_estados

2. **Con dependencias simples**:
   - ref_categorias (depende de ref_tipos)

3. **Con dependencias múltiples**:
   - ref_elementos (depende de ref_categorias y ref_estados)

### Script de Carga

```bash
# Cargar todas las referencias
node scripts/seed/seed-references.ts

# Cargar solo una colección
node scripts/seed/seed-references.ts --only ref_especialidades

# Forzar recarga (elimina datos existentes)
node scripts/seed/seed-references.ts --force
```

## Integridad de Datos

### Validaciones

- **Código único**: No duplicados
- **Nombre requerido**: No puede estar vacío
- **Referencias válidas**: Si depende de otra colección, el ID debe existir

### Verificación

```bash
# Verificar referencias huérfanas
node scripts/test/validate-references.ts

# Contar registros
node scripts/inspect/inspect-collection.ts ref_especialidades
```

## Performance

### Índices

Todas las colecciones de referencia deben tener índices en:
- `codigo` (unique)
- `nombre` (para búsquedas)
- `activo` (para filtrado)

### Cache

Datos de referencia son buenos candidatos para cache:
- TTL: 24 horas (raramente cambian)
- Invalidar cuando se actualiza la colección

## Migración de Datos

Si migras desde otro sistema:

1. Exportar datos del sistema anterior
2. Transformar al formato estándar (JSON/CSV)
3. Validar estructura
4. Cargar usando script de seed
5. Verificar integridad

## Referencias

- [Diccionarios](../diccionarios/) - Archivos de datos
- [Script de Seed](../../scripts/seed/seed-references.ts)
- [Modelo de Datos](../README_Modelo.md)

---

**Última Actualización**: YYYY-MM-DD
**Mantenido por**: [Equipo de Datos]
