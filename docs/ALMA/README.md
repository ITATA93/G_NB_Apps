# ALMA - Estructura de Base de Datos

Documentación de la estructura de base de datos del sistema ALMA (HIS - Hospital Information System) para configuración de consultas.

## Importante

**NO ejecutar consultas directas sin autorización** - El servidor tiene limitaciones de carga.

## Propósito

Esta carpeta contiene:
- Documentación de tablas y vistas de ALMA
- Esquemas de datos relevantes para integración
- Queries de referencia (solo documentación, no ejecutar sin autorización)
- Mapeos entre ALMA y NocoBase

## Estructura de Documentación

```
ALMA/
├── README.md                 # Este archivo
├── schemas/                  # Esquemas de tablas
│   ├── pacientes.md
│   ├── atenciones.md
│   └── ...
├── queries/                  # Queries de referencia (documentación)
│   ├── consultas-frecuentes.md
│   └── reportes.md
├── mappings/                 # Mapeos ALMA <-> NocoBase
│   └── campo-mapping.md
└── diccionarios/             # Diccionarios de datos
    └── codigos.md
```

## Conexión a ALMA

La conexión a ALMA se configura como datasource externo en NocoBase.

### Configuración en .env
```env
# No incluir credenciales en repositorio
# Usar skill /nocobase-db-datasources para gestionar
```

### Verificar conexión (con autorización)
```bash
# Solo ejecutar con autorización explícita
npx tsx shared/scripts/manage-datasources.ts list
```

## Tablas Documentadas

| Tabla/Vista | Descripción | Documentado |
|-------------|-------------|-------------|
| - | - | - |

## Notas

- Todas las consultas requieren autorización previa
- Documentar esquemas antes de crear integraciones
- Usar vistas cuando sea posible en lugar de tablas directas

---

*Última actualización: 2026-02-01*
