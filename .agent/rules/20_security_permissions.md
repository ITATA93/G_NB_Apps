# 20 - Seguridad y permisos (terminal + browser + NocoBase)

## Antigravity (recomendado)
- Terminal execution policy: Request review
- JavaScript execution policy (browser): Request review (o Disabled si no necesitas UI automation)
- Review policy: Agent decides o Request review (segun criticidad)

## Browser allowlist
- Mantener Browser URL Allowlist restrictiva
- Incluir solo dominios necesarios (tu instancia NocoBase y docs oficiales)

## Secretos
- Nunca escribir API keys reales en archivos
- Usar .env local (no versionado) y .env.example como plantilla

## Cautelas
- No ejecutar acciones destructivas sin aprobacion
- No reset DB / reinstalar NocoBase por defecto
