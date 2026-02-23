# Documentación NB_Apps

## Estructura

```
docs/
├── api/                    # Documentación de APIs
│   ├── DR_API.md          # API general NocoBase
│   └── DR_API_VisualOIA.md
├── guides/                 # Guías de uso
│   └── *.pdf              # Guías en PDF
├── specs/                  # Especificaciones
│   └── app.yaml           # Blueprint de la aplicación
└── archive/               # Archivos históricos
    ├── AUDITORIA-*.md
    ├── legacy-agent/      # Config legacy Antigravity
    └── legacy-global_templates/
```

## Documentación por Aplicación

Cada aplicación tiene su propia documentación en:

- `Apps/UGCO/docs/` - Documentación UGCO
- `Apps/BUHO/docs/` - Documentación BUHO
- `MIRA/docs/` - Documentación técnica MIRA

## Documentación Claude Code

La configuración de Claude Code está en `.claude/`:

- `.claude/README.md` - Guía de configuración
- `.claude/skills/` - Skills disponibles

## Scripts

Documentación de scripts compartidos:

- `shared/scripts/README.md` - Scripts TypeScript
- `shared/python/` - Scripts Python (legacy)
