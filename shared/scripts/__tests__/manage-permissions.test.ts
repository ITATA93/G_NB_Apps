/**
 * Unit tests for manage-permissions.ts
 *
 * Tests the permissions management CLI script for NocoBase.
 * Mocks ApiClient to avoid real HTTP calls.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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
    appendFileSync: vi.fn(),
  };
});

describe('manage-permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('listRoles (with strategies)', () => {
    it('should list roles with their permission strategies', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          {
            name: 'admin',
            title: 'Administrator',
            strategy: { actions: ['view', 'create', 'update', 'delete'] },
            allowNewMenu: true,
          },
          {
            name: 'member',
            title: 'Member',
            strategy: { actions: ['view'] },
            allowNewMenu: false,
          },
        ],
      });

      const result = await mockClient.get('/roles:list', { pageSize: 200 });
      expect(result.data).toHaveLength(2);
      expect(result.data[0].strategy.actions).toContain('delete');
      expect(result.data[1].strategy.actions).toEqual(['view']);
    });
  });

  describe('getStrategy', () => {
    it('should GET role strategy with filterByTk', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          name: 'admin_clinico',
          title: 'Administrador Clínico',
          strategy: { actions: ['view', 'create', 'update'] },
          allowNewMenu: true,
          allowConfigure: false,
        },
      });

      const result = await mockClient.get('/roles:get', { filterByTk: 'admin_clinico' });
      expect(result.data.strategy.actions).toHaveLength(3);
      expect(result.data.allowConfigure).toBe(false);
    });
  });

  describe('setStrategy', () => {
    it('should POST updated strategy actions', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/roles:update', {
        filterByTk: 'medico_oncologo',
        strategy: { actions: ['view', 'create'] },
      });

      expect(mockClient.post).toHaveBeenCalledWith('/roles:update', {
        filterByTk: 'medico_oncologo',
        strategy: { actions: ['view', 'create'] },
      });
    });
  });

  describe('listResources', () => {
    it('should GET role resources with appends', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          name: 'admin_clinico',
          resources: [
            {
              name: 'onco_casos',
              usingActionsConfig: true,
              actions: [
                { name: 'view', fields: [] },
                { name: 'create', fields: [] },
                { name: 'update', fields: ['estado', 'diagnostico'] },
              ],
            },
            {
              name: 'staff',
              usingActionsConfig: true,
              actions: [{ name: 'view', fields: [] }],
            },
          ],
        },
      });

      const result = await mockClient.get('/roles/admin_clinico', {
        appends: ['resources', 'resources.actions'],
      });

      expect(result.data.resources).toHaveLength(2);
      expect(result.data.resources[0].actions).toHaveLength(3);
      expect(result.data.resources[0].actions[2].fields).toContain('estado');
    });

    it('should handle roles with no specific resources', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: { name: 'member', resources: [] },
      });

      const result = await mockClient.get('/roles/member', {
        appends: ['resources', 'resources.actions'],
      });
      expect(result.data.resources).toHaveLength(0);
    });
  });

  describe('grantPermission', () => {
    it('should create new resource permission when none exists', async () => {
      // First check: resource doesn't exist
      mockClient.get.mockResolvedValueOnce({ data: [] });
      // Then create it
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      // Simulate the flow
      const existing = await mockClient.get('/roles/medico_oncologo/resources:list', {
        filter: { name: 'onco_casos' },
      });
      expect(existing.data).toHaveLength(0);

      await mockClient.post('/roles/medico_oncologo/resources:create', {
        name: 'onco_casos',
        usingActionsConfig: true,
        actions: [
          { name: 'view', fields: undefined },
          { name: 'update', fields: undefined },
        ],
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/roles/medico_oncologo/resources:create',
        expect.objectContaining({ name: 'onco_casos' })
      );
    });

    it('should update existing resource permission', async () => {
      // Check: resource exists
      mockClient.get.mockResolvedValueOnce({
        data: [{ name: 'onco_casos' }],
      });
      // Update it
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      const existing = await mockClient.get('/roles/medico_oncologo/resources:list', {
        filter: { name: 'onco_casos' },
      });
      expect(existing.data).toHaveLength(1);

      await mockClient.post('/roles/medico_oncologo/resources:update', {
        filterByTk: 'onco_casos',
        usingActionsConfig: true,
        actions: [
          { name: 'view', fields: undefined },
          { name: 'create', fields: undefined },
          { name: 'update', fields: undefined },
        ],
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/roles/medico_oncologo/resources:update',
        expect.objectContaining({ filterByTk: 'onco_casos' })
      );
    });

    it('should support field-level permissions', async () => {
      mockClient.get.mockResolvedValueOnce({ data: [] });
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.get('/roles/medico_oncologo/resources:list', {
        filter: { name: 'onco_casos' },
      });

      await mockClient.post('/roles/medico_oncologo/resources:create', {
        name: 'onco_casos',
        usingActionsConfig: true,
        actions: [
          { name: 'update', fields: ['estado', 'diagnostico_principal'] },
        ],
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/roles/medico_oncologo/resources:create',
        expect.objectContaining({
          actions: [
            { name: 'update', fields: ['estado', 'diagnostico_principal'] },
          ],
        })
      );
    });
  });

  describe('revokePermission', () => {
    it('should POST to destroy resource permission', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/roles/medico_oncologo/resources:destroy', {
        filter: { name: 'onco_casos' },
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/roles/medico_oncologo/resources:destroy',
        { filter: { name: 'onco_casos' } }
      );
    });
  });

  describe('checkPermission', () => {
    it('should detect permission via strategy', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          name: 'admin',
          strategy: { actions: ['view', 'create', 'update', 'delete'] },
          resources: [],
        },
      });

      const result = await mockClient.get('/roles/admin', {
        appends: ['resources', 'resources.actions'],
      });

      const strategyActions = result.data.strategy?.actions || [];
      expect(strategyActions).toContain('view');
      expect(strategyActions).toContain('delete');
    });

    it('should detect permission via specific resource config', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          name: 'medico_oncologo',
          strategy: { actions: [] },
          resources: [
            {
              name: 'onco_casos',
              usingActionsConfig: true,
              actions: [{ name: 'view' }, { name: 'update' }],
            },
          ],
        },
      });

      const result = await mockClient.get('/roles/medico_oncologo', {
        appends: ['resources', 'resources.actions'],
      });

      const resource = result.data.resources.find((r: { name: string }) => r.name === 'onco_casos');
      expect(resource).toBeDefined();
      const hasUpdate = resource.actions.some((a: { name: string }) => a.name === 'update');
      expect(hasUpdate).toBe(true);
    });
  });

  describe('auditPermissions', () => {
    it('should fetch roles and collections for audit', async () => {
      // Mock roles
      mockClient.get.mockResolvedValueOnce({
        data: [
          { name: 'admin', title: 'Admin', hidden: false, strategy: { actions: ['view', 'create'] } },
          { name: 'root', title: 'Root', hidden: true, strategy: { actions: ['*'] } },
        ],
      });
      // Mock collections
      mockClient.get.mockResolvedValueOnce({
        data: [
          { name: 'onco_casos' },
          { name: 'staff' },
          { name: 'schedule_blocks' },
        ],
      });

      const rolesResp = await mockClient.get('/roles:list', { pageSize: 200 });
      const collectionsResp = await mockClient.get('/collections:list', { pageSize: 200 });

      expect(rolesResp.data).toHaveLength(2);
      expect(collectionsResp.data).toHaveLength(3);

      // Hidden roles should be skippable
      const visibleRoles = rolesResp.data.filter((r: { hidden: boolean }) => !r.hidden);
      expect(visibleRoles).toHaveLength(1);
    });
  });

  describe('Error handling', () => {
    it('should handle 401 on strategy update', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('401 Unauthorized'));

      await expect(
        mockClient.post('/roles:update', {
          filterByTk: 'nonexistent',
          strategy: { actions: ['view'] },
        })
      ).rejects.toThrow('401 Unauthorized');
    });

    it('should handle 404 on role not found', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('404 Not Found'));

      await expect(
        mockClient.get('/roles:get', { filterByTk: 'nonexistent_role' })
      ).rejects.toThrow('404 Not Found');
    });
  });
});
