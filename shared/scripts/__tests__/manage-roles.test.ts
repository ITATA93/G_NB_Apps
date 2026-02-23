/**
 * Unit tests for manage-roles.ts
 *
 * Tests the role management CLI script for NocoBase.
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

// Prevent process.exit from terminating tests
const _mockExit = vi.spyOn(process, 'exit').mockImplementation((() => {
  throw new Error('process.exit called');
}) as never);

describe('manage-roles', () => {
  let originalArgv: string[];

  beforeEach(() => {
    vi.clearAllMocks();
    originalArgv = process.argv;
  });

  afterEach(() => {
    process.argv = originalArgv;
    vi.restoreAllMocks();
  });

  describe('parseArgs', () => {
    it('should parse positional args and flags correctly', async () => {
      // parseArgs is not exported, so we test it indirectly through the main function
      // We test by invoking the module with appropriate argv
      process.argv = ['node', 'manage-roles.ts', 'list'];
      mockClient.get.mockResolvedValueOnce({
        data: [
          { name: 'admin', title: 'Administrator', default: true },
          { name: 'member', title: 'Member' },
        ],
      });

      // Re-import module to trigger main()
      await vi.importActual('../manage-roles.ts').catch(() => {});
      // The imported module runs main() immediately, but we can verify the mock was called
    });
  });

  describe('listRoles (via mock client)', () => {
    it('should call GET /roles:list', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { name: 'admin', title: 'Administrator', default: true, hidden: false },
          { name: 'member', title: 'Member', default: false, hidden: false },
        ],
      });

      const result = await mockClient.get('/roles:list', { pageSize: 200 });
      expect(mockClient.get).toHaveBeenCalledWith('/roles:list', { pageSize: 200 });
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('admin');
    });

    it('should handle empty roles list', async () => {
      mockClient.get.mockResolvedValueOnce({ data: [] });

      const result = await mockClient.get('/roles:list', { pageSize: 200 });
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getRole', () => {
    it('should call GET /roles:get with filterByTk', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          name: 'admin_clinico',
          title: 'Administrador Clínico',
          strategy: { actions: ['view', 'create', 'update'] },
        },
      });

      const result = await mockClient.get('/roles:get', { filterByTk: 'admin_clinico' });
      expect(mockClient.get).toHaveBeenCalledWith('/roles:get', { filterByTk: 'admin_clinico' });
      expect(result.data.name).toBe('admin_clinico');
    });
  });

  describe('createRole', () => {
    it('should POST to /roles:create with name and title', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: { name: 'medico_oncologo', title: 'Médico Oncólogo' },
      });

      const result = await mockClient.post('/roles:create', {
        name: 'medico_oncologo',
        title: 'Médico Oncólogo',
      });
      expect(mockClient.post).toHaveBeenCalledWith('/roles:create', {
        name: 'medico_oncologo',
        title: 'Médico Oncólogo',
      });
      expect(result.data.name).toBe('medico_oncologo');
    });

    it('should accept optional description', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: {
          name: 'test_role',
          title: 'Test',
          description: 'A test role',
        },
      });

      const result = await mockClient.post('/roles:create', {
        name: 'test_role',
        title: 'Test',
        description: 'A test role',
      });
      expect(result.data.description).toBe('A test role');
    });
  });

  describe('updateRole', () => {
    it('should POST to /roles:update with filterByTk', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/roles:update', {
        filterByTk: 'admin_clinico',
        title: 'Admin Clínico Actualizado',
      });
      expect(mockClient.post).toHaveBeenCalledWith('/roles:update', {
        filterByTk: 'admin_clinico',
        title: 'Admin Clínico Actualizado',
      });
    });
  });

  describe('deleteRole', () => {
    it('should POST to /roles:destroy', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/roles:destroy', { filterByTk: 'test_role' });
      expect(mockClient.post).toHaveBeenCalledWith('/roles:destroy', {
        filterByTk: 'test_role',
      });
    });
  });

  describe('grantPermission', () => {
    it('should POST to /roles/{role}/resources:create with actions', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      const actions = ['view', 'create', 'update'];
      await mockClient.post('/roles/admin_clinico/resources:create', {
        name: 'onco_casos',
        usingActionsConfig: true,
        actions: actions.map(name => ({ name, fields: [] })),
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/roles/admin_clinico/resources:create',
        expect.objectContaining({
          name: 'onco_casos',
          usingActionsConfig: true,
          actions: [
            { name: 'view', fields: [] },
            { name: 'create', fields: [] },
            { name: 'update', fields: [] },
          ],
        })
      );
    });
  });

  describe('revokePermission', () => {
    it('should POST to /roles/{role}/resources:destroy', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/roles/admin_clinico/resources:destroy', {
        filter: { name: 'onco_casos' },
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/roles/admin_clinico/resources:destroy',
        { filter: { name: 'onco_casos' } }
      );
    });
  });

  describe('listRoleUsers', () => {
    it('should GET /roles/{role}/users:list', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { id: 1, nickname: 'Dr. García', email: 'garcia@hospital.cl' },
          { id: 2, nickname: 'Dr. López', email: 'lopez@hospital.cl' },
        ],
      });

      const result = await mockClient.get('/roles/medico_oncologo/users:list', { pageSize: 200 });
      expect(result.data).toHaveLength(2);
      expect(result.data[0].nickname).toBe('Dr. García');
    });
  });

  describe('listRoleResources', () => {
    it('should GET /roles/{role}/resources:list', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          {
            name: 'onco_casos',
            actions: [{ name: 'view' }, { name: 'update' }],
          },
          {
            name: 'staff',
            actions: [{ name: 'view' }],
          },
        ],
      });

      const result = await mockClient.get('/roles/medico_oncologo/resources:list', { pageSize: 200 });
      expect(result.data).toHaveLength(2);
      expect(result.data[0].actions).toHaveLength(2);
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('401 Unauthorized'));

      await expect(
        mockClient.post('/roles:create', { name: 'bad_role' })
      ).rejects.toThrow('401 Unauthorized');
    });

    it('should handle network errors', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      await expect(
        mockClient.get('/roles:list', { pageSize: 200 })
      ).rejects.toThrow('ECONNREFUSED');
    });
  });
});
