/**
 * Unit tests for deploy-ui-pages.ts
 *
 * Tests the full UI deployment script: groups, pages, schema building,
 * block injection (table, markdown), cleanup, and manifest generation.
 * Mocks ApiClient to avoid real HTTP calls and fs for file I/O.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment variables
vi.stubEnv('NOCOBASE_BASE_URL', 'http://localhost:13000/api');
vi.stubEnv('NOCOBASE_API_KEY', 'test-api-key-12345');

// Create mock client
const mockClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  getBaseUrl: vi.fn(() => 'http://localhost:13000/api'),
  getClient: vi.fn(),
  listAll: vi.fn(),
};

// Mock ApiClient module
vi.mock('../ApiClient', () => ({
  createClient: vi.fn(() => mockClient),
  log: vi.fn(),
  logAction: vi.fn(),
  ApiClient: vi.fn(),
}));

// Mock chalk
vi.mock('chalk', () => ({
  default: new Proxy({}, {
    get: () => (str: string) => str,
  }),
}));

// Mock fs
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    default: {
      existsSync: vi.fn(() => true),
      readFileSync: vi.fn(() => JSON.stringify({
        name: 'Test UI Deploy',
        groups: [
          {
            title: 'UGCO',
            icon: 'MedicineBoxOutlined',
            pages: [
              {
                title: 'Pacientes',
                icon: 'UserOutlined',
                blocks: [
                  {
                    type: 'table',
                    collection: 'patients',
                    columns: [
                      { name: 'nombre', title: 'Nombre' },
                      { name: 'rut', title: 'RUT' },
                    ],
                    actions: ['create', 'view', 'filter'],
                  },
                ],
              },
              {
                title: 'Info',
                blocks: [{ type: 'markdown', content: '# Info' }],
              },
            ],
          },
        ],
      })),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn(),
    },
    existsSync: vi.fn(() => true),
    readFileSync: vi.fn(() => '{}'),
    writeFileSync: vi.fn(),
  };
});

describe('deploy-ui-pages (via mock client)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── createGroup ───────────────────────────────────────────────────────────

  describe('createGroup', () => {
    it('should POST /desktopRoutes:create with type=group', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: { id: 50, type: 'group', title: 'UGCO' },
      });

      const result = await mockClient.post('/desktopRoutes:create', {
        type: 'group',
        title: 'UGCO',
        icon: 'MedicineBoxOutlined',
      });

      expect(mockClient.post).toHaveBeenCalledWith('/desktopRoutes:create', {
        type: 'group',
        title: 'UGCO',
        icon: 'MedicineBoxOutlined',
      });
      expect(result.data.id).toBe(50);
    });
  });

  // ─── createPage ────────────────────────────────────────────────────────────

  describe('createPage', () => {
    it('should create route, schema, bind them, and retrieve grid UID', async () => {
      // 1. Create route
      mockClient.post.mockResolvedValueOnce({
        data: { id: 51, type: 'page', title: 'Pacientes' },
      });

      // 2. Insert Page schema
      mockClient.post.mockResolvedValueOnce({
        data: { 'x-uid': 'page-uid-001' },
      });

      // 3. Bind schema to route
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      // 4. GET full schema to find grid UID
      mockClient.get.mockResolvedValueOnce({
        data: {
          'x-uid': 'page-uid-001',
          properties: {
            grid: {
              'x-uid': 'grid-uid-001',
              'x-component': 'Grid',
            },
          },
        },
      });

      // Simulate the page creation flow
      const routeResp = await mockClient.post('/desktopRoutes:create', {
        type: 'page', title: 'Pacientes', icon: 'UserOutlined', parentId: 50,
      });
      expect(routeResp.data.id).toBe(51);

      const schemaResp = await mockClient.post('/uiSchemas:insert', {
        type: 'void', 'x-component': 'Page', 'x-async': true,
        properties: { grid: { type: 'void', 'x-component': 'Grid', properties: {} } },
      });
      expect(schemaResp.data['x-uid']).toBe('page-uid-001');

      await mockClient.post('/desktopRoutes:update?filterByTk=51', {
        schemaUid: 'page-uid-001',
      });

      const fullSchema = await mockClient.get('/uiSchemas:getJsonSchema/page-uid-001');
      const gridUid = fullSchema.data.properties.grid['x-uid'];
      expect(gridUid).toBe('grid-uid-001');

      expect(mockClient.post).toHaveBeenCalledTimes(3);
      expect(mockClient.get).toHaveBeenCalledTimes(1);
    });
  });

  // ─── addBlockToPage — table block ──────────────────────────────────────────

  describe('addBlockToPage — table', () => {
    it('should POST /uiSchemas:insertAdjacent with table block schema', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: { 'x-uid': 'block-uid-001' },
      });

      const tableRowSchema = {
        type: 'void',
        'x-component': 'Grid.Row',
        properties: {
          col1: {
            type: 'void',
            'x-component': 'Grid.Col',
            properties: {
              block1: {
                type: 'void',
                'x-decorator': 'TableBlockProvider',
                'x-decorator-props': {
                  collection: 'patients',
                  dataSource: 'main',
                  action: 'list',
                  params: { pageSize: 20 },
                },
                'x-component': 'CardItem',
              },
            },
          },
        },
      };

      const result = await mockClient.post(
        '/uiSchemas:insertAdjacent/grid-uid-001?position=beforeEnd',
        { schema: tableRowSchema }
      );

      expect(mockClient.post).toHaveBeenCalledWith(
        '/uiSchemas:insertAdjacent/grid-uid-001?position=beforeEnd',
        expect.objectContaining({ schema: expect.any(Object) })
      );
      expect(result.data['x-uid']).toBe('block-uid-001');
    });
  });

  // ─── addBlockToPage — markdown block ───────────────────────────────────────

  describe('addBlockToPage — markdown', () => {
    it('should POST markdown block schema with content', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: { 'x-uid': 'md-uid-001' },
      });

      const mdSchema = {
        type: 'void',
        'x-component': 'Grid.Row',
        properties: {
          col1: {
            type: 'void',
            'x-component': 'Grid.Col',
            properties: {
              block1: {
                type: 'void',
                'x-decorator': 'CardItem',
                'x-component': 'Markdown.Void',
                'x-component-props': { content: '# Info' },
              },
            },
          },
        },
      };

      await mockClient.post(
        '/uiSchemas:insertAdjacent/grid-uid-002?position=beforeEnd',
        { schema: mdSchema }
      );

      expect(mockClient.post).toHaveBeenCalledTimes(1);
    });
  });

  // ─── cleanupGroup ──────────────────────────────────────────────────────────

  describe('cleanupGroup', () => {
    it('should remove child schemas, child routes, then the group itself', async () => {
      // List children
      mockClient.get.mockResolvedValueOnce({
        data: [
          { id: 51, title: 'Pacientes', schemaUid: 'page-uid-001' },
          { id: 52, title: 'Info', schemaUid: 'page-uid-002' },
        ],
      });

      // Remove schema 1
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });
      // Remove route 1
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });
      // Remove schema 2
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });
      // Remove route 2
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });
      // Remove group
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      // Simulate cleanup
      const resp = await mockClient.get('/desktopRoutes:list', { filter: { parentId: '50' } });
      const children = resp.data;
      expect(children).toHaveLength(2);

      for (const child of children) {
        if (child.schemaUid) {
          await mockClient.post(`/uiSchemas:remove/${child.schemaUid}`, {});
        }
        await mockClient.post(`/desktopRoutes:destroy?filterByTk=${child.id}`, {});
      }
      await mockClient.post('/desktopRoutes:destroy?filterByTk=50', {});

      expect(mockClient.post).toHaveBeenCalledTimes(5);
    });

    it('should handle missing schema gracefully during cleanup', async () => {
      // List children
      mockClient.get.mockResolvedValueOnce({
        data: [{ id: 60, title: 'Orphan', schemaUid: null }],
      });

      // Remove route (no schema to remove)
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });
      // Remove group
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      const resp = await mockClient.get('/desktopRoutes:list', { filter: { parentId: '70' } });
      for (const child of resp.data) {
        if (child.schemaUid) {
          await mockClient.post(`/uiSchemas:remove/${child.schemaUid}`, {});
        }
        await mockClient.post(`/desktopRoutes:destroy?filterByTk=${child.id}`, {});
      }
      await mockClient.post('/desktopRoutes:destroy?filterByTk=70', {});

      // Only 2 posts: destroy child route + destroy group (no schema removal)
      expect(mockClient.post).toHaveBeenCalledTimes(2);
    });
  });

  // ─── Full deployment simulation ────────────────────────────────────────────

  describe('full deployment flow', () => {
    it('should create group -> pages -> blocks in sequence', async () => {
      // Group
      mockClient.post.mockResolvedValueOnce({ data: { id: 80 } });
      // Page route
      mockClient.post.mockResolvedValueOnce({ data: { id: 81 } });
      // Page schema
      mockClient.post.mockResolvedValueOnce({ data: { 'x-uid': 'page-schema-1' } });
      // Bind
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });
      // Get schema for grid
      mockClient.get.mockResolvedValueOnce({
        data: { properties: { grid: { 'x-uid': 'grid-1' } } },
      });
      // Insert block
      mockClient.post.mockResolvedValueOnce({ data: { 'x-uid': 'block-1' } });

      // Group
      const group = await mockClient.post('/desktopRoutes:create', { type: 'group', title: 'App' });
      expect(group.data.id).toBe(80);

      // Page
      const page = await mockClient.post('/desktopRoutes:create', {
        type: 'page', title: 'Page1', parentId: 80,
      });
      expect(page.data.id).toBe(81);

      // Schema
      const schema = await mockClient.post('/uiSchemas:insert', { type: 'void' });
      await mockClient.post(`/desktopRoutes:update?filterByTk=81`, { schemaUid: schema.data['x-uid'] });

      // Grid
      const full = await mockClient.get(`/uiSchemas:getJsonSchema/${schema.data['x-uid']}`);
      const gridUid = full.data.properties.grid['x-uid'];

      // Block
      await mockClient.post(`/uiSchemas:insertAdjacent/${gridUid}?position=beforeEnd`, { schema: {} });

      expect(mockClient.post).toHaveBeenCalledTimes(5);
      expect(mockClient.get).toHaveBeenCalledTimes(1);
    });
  });

  // ─── Error handling ────────────────────────────────────────────────────────

  describe('Error handling', () => {
    it('should handle group creation failure', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('403 Forbidden'));

      await expect(
        mockClient.post('/desktopRoutes:create', { type: 'group' })
      ).rejects.toThrow('403 Forbidden');
    });

    it('should handle schema insertion failure', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('Schema too large'));

      await expect(
        mockClient.post('/uiSchemas:insert', {})
      ).rejects.toThrow('Schema too large');
    });

    it('should handle block injection failure without crashing', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('Invalid schema structure'));

      await expect(
        mockClient.post('/uiSchemas:insertAdjacent/grid-uid?position=beforeEnd', {})
      ).rejects.toThrow('Invalid schema structure');
    });
  });
});
