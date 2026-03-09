# AGENDA (Agenda Medica) — Datos Requeridos para Produccion

**Destino**: mira.hospitaldeovalle.cl
**Fuente**: Sidra_Test (servidor hospital)
**Fecha**: 2026-03-09

---

## Resumen de Fuentes

| Tabla Sidra | Sync | Coleccion NocoBase | Campos | Prioridad |
|-------------|------|-------------------|--------|-----------|
| FUNCIONARIOS_MEDICOS | Semanal | ag_funcionarios | 9 | MEDIA |

**Nota**: Los 3 catalogos de referencia ya estan precargados y NO requieren Sidra:
- `ag_categorias_actividad` — 16 categorias (Visita, Sala, Pabellon, Poli, etc.)
- `ag_tipos_inasistencia` — 6 tipos (PA, LM, CS, CAP, FL, DC)
- `ag_servicios` — 10 servicios (CG, MI, TRAU, PED, GIN, UCI, UTI, URG, ONC, NEO)

---

## Tabla 1: FUNCIONARIOS_MEDICOS

**Frecuencia sync**: semanal (lunes 06:00)
**Modo sync**: UPSERT por campo `rut` (unique)
**Volumen estimado**: ~80-120 funcionarios medicos activos
**Coleccion NocoBase**: `ag_funcionarios`

| # | Campo Sidra | Tipo | Obligatorio | Mapeo NocoBase | Ejemplo |
|---|-------------|------|-------------|----------------|---------|
| 1 | rut | string | SI (unique) | ag_funcionarios.rut | 10.234.567-8 |
| 2 | nombre_completo | string | SI | ag_funcionarios.nombre_completo | Dr. Juan Perez Munoz |
| 3 | codigo_alma | string | NO | ag_funcionarios.codigo_alma | MED-001 |
| 4 | especialidad | string | NO | ag_funcionarios.especialidad | Cirugia General |
| 5 | servicio_codigo | string | NO | ag_funcionarios.servicio_id* | CG |
| 6 | cargo | string | NO | ag_funcionarios.cargo | Medico Cirujano |
| 7 | email | string | NO | ag_funcionarios.email | jperez@hospital.cl |
| 8 | jornada_horas | integer | NO | ag_funcionarios.jornada_horas | 44 |
| 9 | activo | boolean | SI | ag_funcionarios.activo | true |

*`servicio_codigo` se mapea al `id` de `ag_servicios` buscando por `codigo`. Ej: "CG" → ag_servicios donde codigo="CG".

**Cargos esperados**: Medico Cirujano, Medico Internista, Medico Especialista
**Especialidades esperadas**: Cirugia General, Medicina Interna, Traumatologia, Pediatria, Ginecologia, UCI, UTI, Urgencias, Oncologia, Neonatologia

---

## Datos NO requeridos de Sidra

Las siguientes colecciones son generadas internamente por la app:

| Coleccion | Tipo | Descripcion |
|-----------|------|-------------|
| ag_bloques_agenda | Transaccional | Bloques de agenda ingresados manualmente por usuarios |
| ag_inasistencias | Transaccional | Registro de inasistencias ingresado manualmente |
| ag_resumen_diario | Auto-generado | Generado por workflow diario a las 20:00 |
| ag_resumen_semanal | Auto-generado | Generado por workflow semanal los lunes 06:00 |

---

## Flujo de Datos

```
Sidra_Test ──[consulta SQL semanal lunes 06:00]──> ag_funcionarios (UPSERT by rut)
                                                          │
                                                          ├── Usuarios crean bloques de agenda
                                                          ├── Usuarios registran inasistencias
                                                          ├── Workflow calcula duracion automaticamente
                                                          └── Workflows generan resumenes diarios/semanales
```

**IMPORTANTE**: `ag_funcionarios` es la unica tabla que se alimenta externamente. Todo lo demas es operacion interna de la app.
