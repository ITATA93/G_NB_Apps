# Diccionarios y Datos de Referencia

Esta carpeta contiene los datos de referencia (maestros, catálogos) que se cargan en la aplicación.

## Descripción

Los diccionarios son datos estáticos o semi-estáticos que se usan como catálogos en la aplicación, como:
- Códigos de clasificación (ICD-10, HL7, etc.)
- Especialidades médicas
- Tipos de [entidad]
- Estados y valores predefinidos

## Formato de Archivos

### JSON

Formato preferido para datos estructurados:

```json
[
  {
    "codigo": "001",
    "nombre": "Nombre del elemento",
    "descripcion": "Descripción detallada",
    "activo": true
  },
  {
    "codigo": "002",
    "nombre": "Otro elemento",
    "descripcion": "Descripción",
    "activo": true
  }
]
```

### CSV

Para grandes volúmenes de datos:

```csv
codigo,nombre,descripcion,activo
001,Nombre del elemento,Descripción detallada,true
002,Otro elemento,Descripción,true
```

## Archivos de Diccionarios

<!-- Listar archivos conforme se agreguen -->

| Archivo | Colección | Registros | Fuente | Última Actualización |
|---------|-----------|-----------|--------|----------------------|
| `especialidades.json` | ref_especialidades | ~50 | DEIS | YYYY-MM-DD |
| `codigos_cie10.json` | ref_cie10 | ~14,000 | OMS | YYYY-MM-DD |
| `[nombre].json` | ref_[nombre] | ~[N] | [Fuente] | YYYY-MM-DD |

## Carga de Datos

### Script de Seed

Los diccionarios se cargan usando el script de seed:

```bash
node scripts/seed/seed-references.ts
```

### Orden de Carga

Los diccionarios deben cargarse en orden de dependencias:

1. Catálogos base (sin dependencias)
2. Catálogos que dependen de otros
3. Datos maestros

Ejemplo:
```
1. ref_tipos → 2. ref_categorias (depende de tipos) → 3. ref_elementos (depende de categorías)
```

## Actualización de Diccionarios

### Proceso de Actualización

1. **Obtener datos actualizados** de la fuente oficial
2. **Transformar** al formato JSON/CSV estándar
3. **Validar** estructura y datos
4. **Testear** carga en ambiente de desarrollo
5. **Documentar** cambios en este README
6. **Cargar** en staging/producción

### Versionado

Mantener versiones anteriores con sufijo de fecha:

```
especialidades.json          # Versión actual
especialidades_20260101.json # Versión anterior
especialidades_20251201.json # Versión más antigua
```

## Fuentes de Datos

### Oficiales

| Fuente | URL | Tipo de Datos | Frecuencia de Actualización |
|--------|-----|---------------|----------------------------|
| DEIS | https://deis.minsal.cl | Catálogos de salud | Anual |
| OMS CIE-10 | https://icd.who.int | Códigos de diagnóstico | Anual |
| HL7 | https://hl7.org | Estándares HL7 | Semestral |

### Internas

[Documentar fuentes internas si aplican]

## Validación de Datos

### Checklist de Validación

- [ ] Archivo es JSON/CSV válido
- [ ] Todos los registros tienen campos requeridos
- [ ] No hay duplicados (por código o ID)
- [ ] Referencias a otros diccionarios son válidas
- [ ] Formato de campos es consistente

### Script de Validación

```bash
# Validar estructura JSON
jq . diccionarios/especialidades.json

# Contar registros
jq 'length' diccionarios/especialidades.json

# Verificar duplicados por código
jq 'group_by(.codigo) | map(select(length > 1))' diccionarios/especialidades.json
```

## Convenciones

### Nombres de Archivo

- Minúsculas con guiones bajos: `especialidades_medicas.json`
- Prefijo descriptivo del contenido
- Extensión `.json` o `.csv`

### Estructura de Datos

#### Campos Estándar

Todos los diccionarios deben incluir:

```json
{
  "codigo": "string - Código único",
  "nombre": "string - Nombre descriptivo",
  "descripcion": "string - Descripción detallada (opcional)",
  "activo": "boolean - Si está activo/vigente",
  "orden": "number - Orden de visualización (opcional)"
}
```

#### Campos Adicionales

Agregar campos específicos según necesidad:

```json
{
  "codigo": "ONCO",
  "nombre": "Oncología",
  "descripcion": "Especialidad médica que estudia el cáncer",
  "activo": true,
  "orden": 1,
  "categoria": "medicina_interna",
  "codigo_deis": "101"
}
```

## Troubleshooting

### Problema: Carga falla con "duplicate key"

**Causa**: Ya existen registros con el mismo código

**Solución**:
```bash
# Limpiar colección antes de cargar
# O usar upsert en script de seed
```

### Problema: Algunos registros no se cargan

**Causa**: Validaciones fallando

**Solución**:
1. Revisar logs del script de seed
2. Validar estructura de datos
3. Verificar campos requeridos

## Referencias

- [Script de Seed](../../scripts/seed/seed-references.ts)
- [Modelo de Datos](../README_Modelo.md)
- [Colecciones de Referencia](../referencias/)

---

**Última Actualización**: YYYY-MM-DD
**Mantenido por**: [Equipo de Datos]
