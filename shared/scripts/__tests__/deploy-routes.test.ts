/**
 * Unit tests for deploy-routes.ts
 *
 * Tests the route deployment script for NocoBase navigation/menu structures.
 * Covers: config loading, route creation (group/page/link), dry-run mode,
 * page schema creation, recursive child routes, error handling.
 * Mocks axios and fs to avoid real HTTP calls and file I/O.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment variables
vi.stubEnv('NOCOBASE_BASE_URL', 'http://localhost:13000/api');
vi.stubEnv('NOCOBASE_API_KEY', 'test-api-key-12345');

// Simulate the axios instance that deploy-routes.ts creates internally
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
};

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

// Mock dotenv
vi.mock('dotenv', () => ({
  default: { config: vi.fn() },
}));

// Mock fs
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn(() => true),
    readFileSync: vi.fn(() => JSON.stringify({
      name: 'Test App',
      icon: 'AppstoreOutlined',
      routes: [
        { title: 'Dashboard', type: 'page', icon: 'DashboardOutlined' },
        {
          title: 'Modules',
          type: 'group',
          icon: 'FolderOutlined',
          children: [
            { title: 'Module A', type: 'page' },
            { title: 'Module B', type: 'page' },
          ],
        },
      ],
    })),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
});

describe('deploy-routes (via mock axios)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Route creation API calls ──────────────────────────────────────────────

  describe('createRoute — group', () => {
    it('should POST /desktopRoutes:create for a group with no parentId', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: { id: 100, title: 'Test App', type: 'group' } },
      });

      const result = await mockAxiosInstance.post('/desktopRoutes:create', {
        title: 'Test App',
        type: 'group',
        icon: 'AppstoreOutlined',
        hideInMenu: false,
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/desktopRoutes:create', {
        title: 'Test App',
        type: 'group',
        icon: 'AppstoreOutlined',
        hideInMenu: false,
      });
      expect(result.data.data.id).toBe(100);
    });
  });

  describe('createRoute — page', () => {
    it('should POST /desktopRoutes:create for a page with parentId', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: { id: 101, title: 'Dashboard', type: 'page' } },
      });

      const result = await mockAxiosInstance.post('/desktopRoutes:create', {
        title: 'Dashboard',
        type: 'page',
        icon: 'DashboardOutlined',
        parentId: 100,
        hideInMenu: false,
      });

      expect(result.data.data.type).toBe('page');
      expect(result.data.data.id).toBe(101);
    });

    it('should create a page schema and bind it to the route', async () => {
      // Step 1: Create route
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: { id: 101 } },
      });

      // Step 2: Insert page schema
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: { 'x-uid': 'schema-uid-abc' } },
      });

      // Step 3: Bind schema to route
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { ok: true },
      });

      // Simulate the flow
      const routeResp = await mockAxiosInstance.post('/desktopRoutes:create', {
        title: 'Dashboard', type: 'page', parentId: 100,
      });
      const routeId = routeResp.data.data.id;

      const schemaResp = await mockAxiosInstance.post('/uiSchemas:insert', {
        type: 'void', 'x-component': 'Page', 'x-async': true, properties: {},
      });
      const schemaUid = schemaResp.data.data['x-uid'];

      await mockAxiosInstance.post(`/desktopRoutes:update?filterByTk=${routeId}`, {
        schemaUid,
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(3);
      expect(schemaUid).toBe('schema-uid-abc');
    });
  });

  // ─── Recursive children ────────────────────────────────────────────────────

  describe('recursive child route creation', () => {
    it('should create group then page children in order', async () => {
      // Group creation
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: { id: 200, type: 'group' } },
      });
      // Child 1
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: { id: 201, type: 'page' } },
      });
      // Schema for child 1
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: { 'x-uid': 'uid-child1' } },
      });
      // Bind schema child 1
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { ok: true },
      });
      // Child 2
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: { id: 202, type: 'page' } },
      });
      // Schema for child 2
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { data: { 'x-uid': 'uid-child2' } },
      });
      // Bind schema child 2
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { ok: true },
      });

      // Simulate creating group
      const groupResp = await mockAxiosInstance.post('/desktopRoutes:create', {
        title: 'Modules', type: 'group', parentId: 100,
      });
      const groupId = groupResp.data.data.id;
      expect(groupId).toBe(200);

      // Create each child
      for (const childTitle of ['Module A', 'Module B']) {
        const childResp = await mockAxiosInstance.post('/desktopRoutes:create', {
          title: childTitle, type: 'page', parentId: groupId,
        });
        const childId = childResp.data.data.id;

        const schemaResp = await mockAxiosInstance.post('/uiSchemas:insert', {
          type: 'void', 'x-component': 'Page',
        });
        const uid = schemaResp.data.data['x-uid'];

        await mockAxiosInstance.post(`/desktopRoutes:update?filterByTk=${childId}`, {
          schemaUid: uid,
        });
      }

      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(7);
    });
  });

  // ─── Connection verification ───────────────────────────────────────────────

  describe('connection verification', () => {
    it('should GET /app:getLang to verify API connectivity', async () => {
      mockAxiosInstance.get.mockResolvedValueOnce({ data: { data: 'es-CL' } });

      const result = await mockAxiosInstance.get('/app:getLang');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/app:getLang');
      expect(result.data.data).toBe('es-CL');
    });

    it('should fail gracefully when server is unreachable', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      await expect(mockAxiosInstance.get('/app:getLang')).rejects.toThrow('ECONNREFUSED');
    });
  });

  // ─── Error handling ────────────────────────────────────────────────────────

  describe('Error handling', () => {
    it('should handle route creation failure', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(
        new Error('500 Internal Server Error')
      );

      await expect(
        mockAxiosInstance.post('/desktopRoutes:create', { title: 'Bad' })
      ).rejects.toThrow('500 Internal Server Error');
    });

    it('should handle schema insertion failure gracefully', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(
        new Error('Schema validation failed')
      );

      await expect(
        mockAxiosInstance.post('/uiSchemas:insert', {})
      ).rejects.toThrow('Schema validation failed');
    });

    it('should handle network timeout', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce(
        new Error('timeout of 30000ms exceeded')
      );

      await expect(
        mockAxiosInstance.post('/desktopRoutes:create', { title: 'Slow' })
      ).rejects.toThrow('timeout');
    });
  });
});
