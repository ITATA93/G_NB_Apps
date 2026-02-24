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

### NocoBase API Conventions

- **Actions use colon syntax**: `POST /resource:action` (e.g., `/users:create`, `/roles:destroy`)
- **`filterByTk` MUST be a URL query parameter**, NOT in the request body:
  - Correct: `POST /users:update?filterByTk=1` with body `{"nickname":"New"}`
  - Wrong: `POST /users:update` with body `{"filterByTk":1,"nickname":"New"}`
- **`filterByTks`** (plural) for multiple IDs: `?filterByTks=1,2,3`
- The ApiClient.post() auto-extracts `filterByTk` from body to URL for `:update`/`:destroy`

### Common Endpoints
| Resource | Endpoint | Notes |
|----------|----------|-------|
| Collections | `GET /collections:list` | List all collections |
| Collection detail | `GET /collections:get?filterByTk=name` | Get schema |
| Fields | `GET /collections/<name>/fields:list` | Get field definitions |
| Roles | `GET /roles:list` | List roles |
| Users | `GET /users:list` | List users |
| Permissions | `GET /roles/<name>/resources:list` | Role permissions |
| UI Schemas | `GET /uiSchemas:getJsonSchema/<uid>` | Page schemas |
| Desktop Routes | `GET /desktopRoutes:list` | Menu/navigation tree |
| Data CRUD | `GET /<collection>:list`, `POST /<collection>:create` | Data operations |
| Workflows | `GET /workflows:list` | List automations |
| Charts | `POST /charts:query` | Analytics queries |
| System | `GET /app:getLang`, `GET /app:getInfo` | System info |

### Shared Scripts
Scripts in `shared/scripts/` provide typed wrappers:

- `ApiClient.ts` — Base HTTP client (auto-handles filterByTk for update/destroy)
- `manage-collections.ts` — Collection CRUD
- `manage-fields.ts` — Field operations
- `manage-roles.ts` — Role management
- `manage-users.ts` — User management
- `manage-permissions.ts` — Permission grants
- `manage-auth.ts` — Auth/session operations
- `manage-workflows.ts` — Workflow automation
- `manage-charts.ts` — Analytics queries
- `manage-datasources.ts` — External DB connections
- `manage-system.ts` — System info/plugins
- `manage-ui.ts` — UI schemas/routes
- `manage-departments.ts` — Department hierarchy
- `data-crud.ts` — Generic data operations on any collection
- `deploy-routes.ts` — Route/menu deployment from JSON config
- `deploy-ui-pages.ts` — UI page deployment with schemas
- `add-block-to-page.ts` — Add blocks to existing pages
- `create-workflow.ts` — Create workflow from config

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
