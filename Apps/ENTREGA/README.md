# ENTREGA — Aplicación de Entrega de Turno Médica

## Estado: 📋 En diseño

Aplicación para digitalizar la entrega de turno médica del Hospital Dr. Antonio Tirado Lanas de Ovalle.

## Descripción

Reemplaza el Excel manual de 32 hojas (una por servicio) con una interfaz NocoBase que:

- Se alimenta de datos **en vivo desde ALMA/TrakCare** (InterSystems IRIS)
- Organiza pacientes por **especialidad clínica** (no ubicación física)
- Permite al médico registrar plan de tratamiento, indicaciones y pendientes
- Implementa firma digital de entrega/recepción
- Mantiene historial completo de entregas para auditoría

## Estructura

```
Apps/ENTREGA/
├── PROMPT_ENTREGA_TURNO.md    # Especificación completa (489 líneas)
├── docs/                       # Documentación
├── scripts/                    # Scripts de automatización
└── BD/                         # Modelos de datos
```

## Colecciones (prefijo `et_`)

| Colección | Descripción |
|-----------|-------------|
| `et_servicios` | Catálogo de servicios hospitalarios |
| `et_especialidades` | Catálogo de especialidades médicas |
| `et_usuarios` | Usuarios de la entrega (médicos, enfermeros) |
| `et_pacientes_censo` | Censo de hospitalizados (sync ALMA) |
| `et_diagnosticos` | Diagnósticos por paciente (sync ALMA) |
| `et_turnos` | Registro de entregas de turno |
| `et_entrega_paciente` | Detalle por paciente en cada entrega |
| `et_eventos_turno` | Eventos relevantes (altas, ingresos, cirugías) |

## Próximos pasos

1. Generar blueprint YAML desde `PROMPT_ENTREGA_TURNO.md` (workflow `/nocobase-intake`)
2. Crear colecciones y seed data
3. Configurar ETL ALMA → NocoBase
4. Crear UI por especialidad

---

*Creado: 2026-02-16*
