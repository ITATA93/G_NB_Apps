# NocoBase API Management Skill

> Gemini CLI skill for managing NocoBase instances via REST API.

## Context

This project (G_NB_Apps) manages NocoBase applications for Hospital de Ovalle.
The primary interface is the NocoBase REST API authenticated via Bearer token.

## Before Starting

1. Check `.env` for `NOCOBASE_BASE_URL` and `NOCOBASE_API_KEY`
2. Verify connectivity: `npx tsx Apps/_APP_TEMPLATE/scripts/test/test-connection.ts`
3. Review the blueprint: `app-spec/app.yaml`

## API Patterns

### Authentication
All requests use Bearer token from `NOCOBASE_API_KEY` env var:
```
Authorization: Bearer ${NOCOBASE_API_KEY}
```

### Common Endpoints
| Resource | Endpoint | Notes |
|----------|----------|-------|
| Collections | `GET /api/collections` | List all collections |
| Collection detail | `GET /api/collections/<name>` | Get schema |
| Fields | `GET /api/collections/<name>/fields` | Get field definitions |
| Roles | `GET /api/roles` | List roles |
| Permissions | `GET /api/roles/<name>/resources` | Role permissions |
| UI Schemas | `GET /api/uiSchemas:getJsonSchema/<uid>` | Page schemas |
| Menu/Routes | `GET /api/uiSchemas:getJsonSchema/nocobase-admin-menu` | Menu tree |

### Shared Scripts
Scripts in `shared/scripts/` provide typed wrappers:
- `ApiClient.ts` — Base HTTP client with error handling
- `manage-collections.ts` — Collection CRUD
- `manage-fields.ts` — Field operations
- `manage-roles.ts` — Role management
- `manage-permissions.ts` — Permission grants
- `deploy-routes.ts` — Route/menu deployment

### App Structure
Each app in `Apps/<APP_NAME>/` follows:
```
Apps/<APP_NAME>/
├── scripts/         → App-specific scripts
├── docs/            → App documentation
├── backups/         → Data backups
└── README.md        → App description
```

## Safety Rules
1. **NEVER** execute DELETE on collections without backup
2. **ALWAYS** verify API connectivity before mutations
3. **ALWAYS** use typed interfaces from `shared/scripts/types.ts`
4. **NEVER** hardcode tokens — use `process.env.NOCOBASE_API_KEY`
