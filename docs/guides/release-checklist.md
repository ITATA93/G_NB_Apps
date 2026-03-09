# Release Checklist — G_NB_Apps

Checklist para despliegues de aplicaciones NocoBase.

---

## Pre-Deploy

- [ ] **Lint:** `npm run lint` — 0 errores
- [ ] **Tests:** `npm run test` — todas las suites pasan
- [ ] **Dry-run:** Ejecutar scripts con `--dry-run` si disponible
- [ ] **Backup:** Crear backup de la instancia target
  ```bash
  npx tsx shared/scripts/manage-backup.ts create --name "pre-deploy-YYYY-MM-DD"
  ```
- [ ] **Branch:** Verificar que estás en la rama correcta
- [ ] **Env:** Confirmar `NOCOBASE_BASE_URL` apunta al target correcto
  - Staging: `https://imedicina.cl/api`
  - Producción: `https://hospitaldeovalle.cl/api`

## Deploy

- [ ] **Orden de ejecución:** Seguir el orden de fases del plan
  1. Colecciones (schema)
  2. Campos y relaciones
  3. Datos de referencia (seed)
  4. Páginas y bloques UI
  5. Workflows
  6. RBAC (roles, permisos)
  7. RLS/FLS (seguridad fina)
  8. Verificación

- [ ] **Ejecutar scripts:** Uno por uno, verificar output
  ```bash
  npx tsx Apps/<APP>/scripts/nocobase/<script>.ts
  ```
- [ ] **Registrar errores:** Anotar cualquier error para remediación

## Post-Deploy

- [ ] **Verificación visual:** Abrir la app en browser y revisar cada página
- [ ] **ACL check:** Verificar permisos por rol
  ```bash
  npx tsx shared/scripts/manage-permissions.ts list --role <role>
  ```
- [ ] **Datos:** Confirmar que los registros de referencia están cargados
  ```bash
  npx tsx shared/scripts/data-crud.ts count <collection>
  ```
- [ ] **Workflows:** Verificar que workflows están habilitados
  ```bash
  npm run nb:workflows list
  ```
- [ ] **Screenshots:** Capturar evidencia visual (opcional)

## Rollback

Si hay problemas críticos:

1. **Restaurar backup:**
   ```bash
   npx tsx shared/scripts/manage-backup.ts list
   npx tsx shared/scripts/manage-backup.ts restore <id>
   ```
2. **Notificar** al equipo del rollback
3. **Documentar** el problema en `docs/DEVLOG.md`

## Post-Release

- [ ] Actualizar `docs/TODO.md` — marcar items completados
- [ ] Agregar entrada en `DEVLOG.md`
- [ ] Actualizar `CHANGELOG.md` si es release versionado
- [ ] Registrar scripts nuevos en `docs/library/scripts.md`
