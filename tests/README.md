# Test Strategy — G_NB_Apps

## Test Locations

| Location | Type | Framework |
|----------|------|-----------|
| `shared/scripts/__tests__/` | Unit tests for shared NocoBase scripts | Vitest |
| `Apps/*/scripts/` | App-specific deploy/audit scripts (manual) | npx tsx |
| `scripts/validate-*.ts` | E2E/integration validation scripts | Playwright/CDP |

## Running Tests

```bash
# Unit tests (shared scripts)
npx vitest run

# With coverage
npx vitest run --coverage

# Single test file
npx vitest run shared/scripts/__tests__/ApiClient.test.ts
```

## Current Coverage

- **7 test suites**, 98 tests (as of 2026-02-18)
- **20.6% coverage** across shared/scripts/
- See `VALIDATION_SUMMARY.md` for full details

## Test Files

| Test | Covers |
|------|--------|
| ApiClient.test.ts | HTTP client, auth, error handling |
| data-crud.test.ts | CRUD operations |
| manage-collections.test.ts | Collection lifecycle |
| manage-fields.test.ts | Field CRUD |
| manage-permissions.test.ts | ACL permissions |
| manage-roles.test.ts | Role management |
| manage-ui.test.ts | UI schema operations |
| manage-workflows.test.ts | Workflow lifecycle |
| deploy-routes.test.ts | Route deployment |
| deploy-ui-pages.test.ts | UI page deployment |
