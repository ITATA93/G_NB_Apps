# BUHO (Hospitalizacion) — Datos Requeridos para Produccion

**Destino**: mira.hospitaldeovalle.cl
**Fuente**: Sidra_Test (servidor hospital)
**Fecha**: 2026-03-09

---

## Regla Visual Obligatoria

Toda pantalla que muestre informacion de paciente DEBE incluir:
- **Nombre completo**: nombres + apellido_paterno + apellido_materno
- **RUT**: formato XX.XXX.XXX-X
- **Edad**: en anos
- **Diagnostico principal**: texto descriptivo

---

## Resumen de Fuentes

| Tabla Sidra | Sync | Coleccion NocoBase | Campos | Prioridad |
|-------------|------|-------------------|--------|-----------|
| CENSO_PACIENTES_HOSPITALIZADOS | 15 min | buho_pacientes | 20 | MAXIMA |
| CATALOGO_CAMAS | Inicial | buho_camas | 5 | BAJA |

**Nota**: Las colecciones `buho_alertas`, `buho_planes_trabajo` y `buho_parametros_riesgo` son generadas internamente por la app. NO requieren datos de Sidra.

---

## Tabla 1: CENSO_PACIENTES_HOSPITALIZADOS

**Frecuencia sync**: cada 15 minutos
**Modo sync**: UPSERT por campo `episodio` (ID episodio ALMA, unique)
**Volumen estimado**: 80-120 pacientes hospitalizados simultaneamente
**Coleccion NocoBase**: `buho_pacientes`

| # | Campo Sidra | Tipo | Obligatorio | Mapeo NocoBase | Ejemplo |
|---|-------------|------|-------------|----------------|---------|
| 1 | episodio | string | SI (unique) | buho_pacientes.episodio | EP-2026-001234 |
| 2 | nombres | string | SI | buho_pacientes.nombre* | Maria Elena |
| 3 | apellido_paterno | string | SI | buho_pacientes.nombre* | Soto |
| 4 | apellido_materno | string | NO | buho_pacientes.nombre* | Gonzalez |
| 5 | rut | string | SI | buho_pacientes.rut | 12.345.678-9 |
| 6 | nro_ficha | string | NO | buho_pacientes.nro_ficha | 123456 |
| 7 | edad | integer | SI | buho_pacientes.edad | 68 |
| 8 | sexo | string | NO | buho_pacientes.sexo | F |
| 9 | servicio | string | SI | buho_pacientes.servicio | MQ1 |
| 10 | sala | string | NO | buho_pacientes.sala | 3 |
| 11 | cama | string | NO | buho_pacientes.cama | A |
| 12 | tipo_cama | string | NO | buho_pacientes.tipo_cama | adulto |
| 13 | diagnostico_principal | text | SI | buho_pacientes.diagnostico_principal | Neumonia adquirida comunidad |
| 14 | medico_tratante | string | NO | buho_pacientes.medico_tratante | Dr. Juan Perez |
| 15 | especialidad | string | NO | buho_pacientes.especialidad | Medicina Interna |
| 16 | fecha_ingreso | datetime | SI | buho_pacientes.fecha_ingreso | 2026-03-01T10:30 |
| 17 | dias_hospitalizacion | integer | NO | buho_pacientes.dias_hospitalizacion | 8 |
| 18 | fecha_probable_alta | date | NO | buho_pacientes.fecha_probable_alta | 2026-03-12 |
| 19 | alergias | text | NO | buho_pacientes.alergias | Penicilina |
| 20 | telefono | string | NO | buho_pacientes.telefono | +56912345678 |

*`buho_pacientes.nombre` se construye concatenando: `"${nombres} ${apellido_paterno} ${apellido_materno}"`. Si Sidra entrega `nombre_completo` como campo unico, se mapea directo.

**Servicios esperados**: MQ1, MQ2, MQ3, PCER, UCI, UTI, CIBU, PED, OBST, GIN, NEO, TRAU
**Tipos de cama**: adulto, pediatrica, basculante, uci, aislamiento

---

## Tabla 2: CATALOGO_CAMAS

**Frecuencia sync**: carga inicial unica + actualizaciones manuales
**Modo sync**: UPSERT por combinacion servicio+cama
**Volumen estimado**: ~150-200 camas
**Coleccion NocoBase**: `buho_camas`

| # | Campo Sidra | Tipo | Obligatorio | Mapeo NocoBase | Ejemplo |
|---|-------------|------|-------------|----------------|---------|
| 1 | servicio | string | SI | buho_camas.servicio | MQ1 |
| 2 | sala | string | NO | buho_camas.sala | 3 |
| 3 | cama | string | SI | buho_camas.cama | 101-A |
| 4 | tipo | string | NO | buho_camas.tipo | adulto |
| 5 | disponible | boolean | NO | buho_camas.disponible | true |

---

## Datos NO requeridos de Sidra

Las siguientes colecciones son generadas internamente:

| Coleccion | Tipo | Descripcion |
|-----------|------|-------------|
| buho_alertas | App-generada | Motor de reglas automatico (riesgo alto, alta proxima, etc.) |
| buho_planes_trabajo | App-generada | Planes de trabajo por paciente editados por medicos |
| buho_parametros_riesgo | Configuracion | Reglas del motor de clasificacion de riesgo |

---

## Flujo de Datos

```
Sidra_Test ──[consulta SQL Q1 cada 15min]──> buho_pacientes (UPSERT by episodio)
                                                   │
                                                   ├── Motor de riesgo clasifica automaticamente
                                                   ├── Medicos agregan planes de trabajo
                                                   └── Sistema genera alertas clinicas

Sidra_Test ──[carga inicial]──────────────> buho_camas (catalogo estático)
```

**IMPORTANTE**: Los campos `estado_plan`, `riesgo_detectado`, `proxima_accion`, `categorizacion`, `caso_social`, `vip` son editados SOLO dentro de BUHO y NO deben ser sobreescritos por el sync de Sidra.
