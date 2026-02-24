# Changelog - BUHO

Todos los cambios notables a este proyecto seran documentados en este archivo.
Formato basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Sin Versionar]

### Agregado

- README.md con documentacion completa
- STATUS.md con seguimiento del proyecto
- CHANGELOG.md para registro de cambios
- .env.example con configuracion de entorno

## [0.1.0] - 2026-02-01

### Agregado

- Modelo de datos BUHO_Pacientes (16 campos)
- Backend Express + TypeScript con motor de reglas (planService)
- Script register-collection.ts para crear coleccion en NocoBase
- Script create-ui.ts para crear pagina UI en NocoBase
- Script init-db.ts para inicializar PostgreSQL
- Diseno de interfaz de usuario (Kanban, Ficha, Dashboard)
- Logger con Winston (error.log, combined.log)
