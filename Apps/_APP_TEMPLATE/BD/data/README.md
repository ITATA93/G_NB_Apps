# Datos de Ejemplo y Testing

Esta carpeta contiene datos de ejemplo para desarrollo y testing.

## ⚠️ Advertencia

**Los datos de esta carpeta son SOLO para desarrollo/testing. NUNCA usar en producción.**

## Contenido

- Datos de ejemplo para poblar colecciones durante desarrollo
- Datasets de prueba para testing
- Datos sintéticos para demos

## Estructura

```
data/
├── sample/           # Datos de ejemplo para desarrollo
├── test/             # Datos específicos para tests
└── demo/             # Datos para demos y presentaciones
```

## Uso

### Cargar Datos de Ejemplo

```bash
# Solo en ambiente de desarrollo
NODE_ENV=development node scripts/seed/seed-sample-data.ts
```

### Limpiar Datos de Ejemplo

```bash
node scripts/seed/clean-sample-data.ts
```

## Convenciones

### Nombres de Archivo

- `sample_[coleccion].json` - Datos de ejemplo
- `test_[escenario].json` - Datos para testing específico
- `demo_[presentacion].json` - Datos para demos

### Datos Sintéticos

Todos los datos personales deben ser sintéticos:
- Nombres: Usar generadores de nombres falsos
- RUT/IDs: Números inválidos o de prueba
- Emails: Usar dominio `@example.com`
- Teléfonos: Números claramente ficticios

**Ejemplo**:
```json
{
  "nombre": "Juan Pérez (Ejemplo)",
  "rut": "11111111-1",
  "email": "juan.perez@example.com",
  "telefono": "+56912345678"
}
```

## Protección

### Verificación de Ambiente

El script de seed debe verificar el ambiente:

```typescript
if (process.env.NODE_ENV === 'production') {
  console.error('❌ No se puede cargar datos de ejemplo en producción');
  process.exit(1);
}
```

### .gitignore

Archivos de datos sensibles (si existen) deben estar en `.gitignore`:

```
# No commitear datos reales
data/real_*.json
data/backup_*.json
```

## Referencias

- [Script de Seed de Ejemplo](../../scripts/seed/seed-sample-data.ts)
- [Script de Limpieza](../../scripts/seed/clean-sample-data.ts)

---

**Última Actualización**: YYYY-MM-DD
