# AGENDA - Agenda Medica

Modulo de gestion de agendas medicas para el Hospital de Ovalle.
Reemplaza el sistema anterior basado en Google Sheets + Apps Script.

## Estado: En desarrollo

## Descripcion

Permite registrar, visualizar y reportar las actividades diarias de medicos,
incluyendo visitas, sala, pabellon, policlinicos, reuniones, jefatura y mas.
Tambien gestiona inasistencias y genera resumenes diarios/semanales automaticos.

## Colecciones (prefijo `ag_`)

| Coleccion | Tipo | Descripcion |
|-----------|------|-------------|
| ag_categorias_actividad | Catalogo | 14 tipos de actividad medica |
| ag_tipos_inasistencia | Catalogo | 6 tipos de ausencia |
| ag_servicios | Catalogo | Servicios hospitalarios |
| ag_funcionarios | Maestro | Personal medico |
| ag_bloques_agenda | Transaccional | Bloques de actividad (tabla central) |
| ag_inasistencias | Transaccional | Registro de ausencias |
| ag_resumen_diario | Generado | Resumen diario por medico |
| ag_resumen_semanal | Generado | Resumen semanal por medico |

## Roles

| Rol | Acceso |
|-----|--------|
| admin_agenda | CRUD total en todas las colecciones |
| jefe_servicio_agenda | Ve y edita bloques de su equipo/servicio |
| medico_agenda | Solo ve y edita sus propios bloques |

## Paginas UI

- Dashboard con charts
- Vista calendario semanal
- Registro de actividades (CRUD)
- Inasistencias (CRUD)
- Resumenes diario y semanal
- Gestion de funcionarios y catalogos
- Administracion (solo admin)

## Deploy

```bash
# Dry run (simular)
npx tsx Apps/AGENDA/scripts/deploy-agenda-collections.ts --dry-run

# Deploy real
npx tsx Apps/AGENDA/scripts/deploy-agenda-collections.ts

# Solo seed data
npx tsx Apps/AGENDA/scripts/deploy-agenda-collections.ts --seed-only
```

## Referencia

- Blueprint: `app-spec/app.yaml` (seccion agenda)
- Patron: `Apps/ENTREGA/scripts/deploy-entrega-collections.ts`
- Origen: Google Sheets + Apps Script (`Doc_Ref/AppsScript_Agenda.txt`)
