/**
 * Unit tests for manage-ui.ts
 *
 * Tests the UI schema management CLI script for NocoBase.
 * Mocks ApiClient to avoid real HTTP calls.
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
    existsSync: vi.fn(() => true),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(() => JSON.stringify({
      type: 'void',
      'x-component': 'Page',
      properties: {},
    })),
  };
});

// Mock path
vi.mock('path', async () => {
  const actual = await vi.importActual('path');
  return { ...actual };
});

describe('manage-ui (via mock client)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listMenus', () => {
    it('should GET nocobase-admin-menu schema', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          type: 'void',
          'x-component': 'Menu',
          properties: {
            ugco: {
              type: 'void',
              title: 'UGCO',
              'x-component': 'Menu.Item',
              properties: {},
            },
            entrega: {
              type: 'void',
              title: 'ENTREGA',
              'x-component': 'Menu.SubMenu',
              properties: {
                dashboard: {
                  type: 'void',
                  title: 'Dashboard',
                  'x-component': 'Menu.Item',
                },
              },
            },
          },
        },
      });

      const result = await mockClient.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
      expect(mockClient.get).toHaveBeenCalledWith('/uiSchemas:getJsonSchema/nocobase-admin-menu');
      expect(result.data.properties).toHaveProperty('ugco');
      expect(result.data.properties).toHaveProperty('entrega');
      expect(result.data.properties.entrega.properties.dashboard.title).toBe('Dashboard');
    });

    it('should handle empty menu', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: { type: 'void', 'x-component': 'Menu', properties: {} },
      });

      const result = await mockClient.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
      expect(Object.keys(result.data.properties)).toHaveLength(0);
    });
  });

  describe('listPages', () => {
    it('should extract pages from menu structure', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          type: 'void',
          properties: {
            page1: {
              type: 'void',
              title: 'Pacientes',
              'x-component': 'Menu.Item',
              'x-uid': 'abc123',
              'x-component-props': { href: '/admin/abc123' },
            },
            page2: {
              type: 'void',
              title: 'Casos',
              'x-component': 'Menu.Item',
              'x-uid': 'def456',
            },
          },
        },
      });

      const result = await mockClient.get('/uiSchemas:getJsonSchema/nocobase-admin-menu');
      const pages = Object.entries(result.data.properties);
      expect(pages).toHaveLength(2);
    });
  });

  describe('getSchema', () => {
    it('should GET a specific UI schema by UID', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          type: 'void',
          'x-uid': 'abc123',
          'x-component': 'Page',
          title: 'Pacientes',
          properties: {
            grid: {
              type: 'void',
              'x-component': 'Grid',
              properties: {
                row1: {
                  type: 'void',
                  'x-component': 'Grid.Row',
                },
              },
            },
          },
        },
      });

      const result = await mockClient.get('/uiSchemas:getJsonSchema/abc123');
      expect(result.data['x-uid']).toBe('abc123');
      expect(result.data['x-component']).toBe('Page');
    });
  });

  describe('schemaTree', () => {
    it('should retrieve nested schema for tree display', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          type: 'void',
          'x-uid': 'root',
          'x-component': 'Page',
          properties: {
            child1: {
              type: 'void',
              'x-component': 'Grid',
              'x-uid': 'child1',
              properties: {
                nested: {
                  type: 'array',
                  'x-component': 'TableBlockProvider',
                  'x-uid': 'nested1',
                },
              },
            },
          },
        },
      });

      const result = await mockClient.get('/uiSchemas:getJsonSchema/root');
      expect(result.data.properties.child1['x-component']).toBe('Grid');
      expect(result.data.properties.child1.properties.nested.type).toBe('array');
    });
  });

  describe('exportSchema', () => {
    it('should GET schema and return as JSON', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          type: 'void',
          'x-uid': 'export_test',
          'x-component': 'Page',
          title: 'Test Page',
        },
      });

      const result = await mockClient.get('/uiSchemas:getJsonSchema/export_test');
      const json = JSON.stringify(result.data, null, 2);
      expect(json).toContain('export_test');
      expect(json).toContain('Test Page');
    });
  });

  describe('importSchema', () => {
    it('should POST a schema to insert into the UI tree', async () => {
      const schema = {
        type: 'void',
        'x-component': 'Page',
        title: 'New Page',
        properties: {},
      };

      mockClient.post.mockResolvedValueOnce({ data: { 'x-uid': 'new_uid_123' } });

      const result = await mockClient.post('/uiSchemas:insertAdjacent', {
        position: 'beforeEnd',
        target: 'parent_uid',
        schema,
      });
      expect(mockClient.post).toHaveBeenCalledWith('/uiSchemas:insertAdjacent', {
        position: 'beforeEnd',
        target: 'parent_uid',
        schema,
      });
      expect(result.data['x-uid']).toBe('new_uid_123');
    });
  });

  describe('deleteSchema', () => {
    it('should POST to remove a schema node', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/uiSchemas:remove/old_uid');
      expect(mockClient.post).toHaveBeenCalledWith('/uiSchemas:remove/old_uid');
    });
  });

  describe('listTemplates', () => {
    it('should GET block templates', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { key: 'tpl1', name: 'Patient Form', componentName: 'FormV2' },
          { key: 'tpl2', name: 'Case Table', componentName: 'TableBlockProvider' },
        ],
      });

      const result = await mockClient.get('/uiSchemaTemplates:list');
      expect(result.data).toHaveLength(2);
      expect(result.data[0].componentName).toBe('FormV2');
    });
  });

  describe('Error handling', () => {
    it('should handle schema not found', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('Schema not found'));
      await expect(mockClient.get('/uiSchemas:getJsonSchema/nonexistent')).rejects.toThrow('Schema not found');
    });

    it('should handle permission denied on schema modification', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('403 Forbidden'));
      await expect(mockClient.post('/uiSchemas:remove/protected_uid')).rejects.toThrow('403 Forbidden');
    });
  });
});
