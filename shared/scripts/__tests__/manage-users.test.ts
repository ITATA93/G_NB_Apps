/**
 * Unit tests for manage-users.ts
 *
 * Tests user management CLI for NocoBase.
 * Mocks ApiClient to avoid real HTTP calls.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubEnv('NOCOBASE_BASE_URL', 'http://localhost:13000/api');
vi.stubEnv('NOCOBASE_API_KEY', 'test-api-key-12345');

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

vi.mock('../ApiClient', () => ({
  createClient: vi.fn(() => mockClient),
  log: vi.fn(),
  logAction: vi.fn(),
  ApiClient: vi.fn(),
}));

vi.mock('chalk', () => ({
  default: new Proxy({}, {
    get: () => (str: string) => str,
  }),
}));

vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn(() => true),
    mkdirSync: vi.fn(),
    appendFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
});

describe('manage-users (via mock client)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listUsers', () => {
    it('should call GET /users:list with appends for roles', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { id: 1, nickname: 'Admin', email: 'admin@example.com', roles: [{ name: 'root' }] },
          { id: 2, nickname: 'Doctor', email: 'doc@example.com', roles: [{ name: 'medico_oncologo' }] },
        ],
      });

      const result = await mockClient.get('/users:list', { pageSize: 200, appends: ['roles'] });
      expect(mockClient.get).toHaveBeenCalledWith('/users:list', { pageSize: 200, appends: ['roles'] });
      expect(result.data).toHaveLength(2);
      expect(result.data[0].roles[0].name).toBe('root');
    });

    it('should handle empty user list', async () => {
      mockClient.get.mockResolvedValueOnce({ data: [] });
      const result = await mockClient.get('/users:list', { pageSize: 200 });
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getUser', () => {
    it('should call GET /users:get with filterByTk and appends', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          id: 1,
          nickname: 'Admin',
          email: 'admin@example.com',
          roles: [{ name: 'root', title: 'Super Admin' }],
        },
      });

      const result = await mockClient.get('/users:get', { filterByTk: '1', appends: ['roles'] });
      expect(result.data.id).toBe(1);
      expect(result.data.email).toBe('admin@example.com');
    });
  });

  describe('createUser', () => {
    it('should POST to /users:create with required fields', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: { id: 10, email: 'new@example.com', nickname: 'New User' },
      });

      const data = { email: 'new@example.com', nickname: 'New User', password: 'secret123' };
      const result = await mockClient.post('/users:create', data);
      expect(mockClient.post).toHaveBeenCalledWith('/users:create', data);
      expect(result.data.id).toBe(10);
    });

    it('should create user with minimal data (email only)', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: { id: 11, email: 'minimal@example.com' },
      });

      const result = await mockClient.post('/users:create', { email: 'minimal@example.com' });
      expect(result.data.email).toBe('minimal@example.com');
    });
  });

  describe('updateUser', () => {
    it('should POST to /users:update with filterByTk', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/users:update', { filterByTk: '1', nickname: 'Updated Name' });
      expect(mockClient.post).toHaveBeenCalledWith('/users:update', {
        filterByTk: '1',
        nickname: 'Updated Name',
      });
    });
  });

  describe('deleteUser', () => {
    it('should POST to /users:destroy with filterByTk', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/users:destroy', { filterByTk: '5' });
      expect(mockClient.post).toHaveBeenCalledWith('/users:destroy', { filterByTk: '5' });
    });
  });

  describe('listUserRoles', () => {
    it('should GET user with roles appended', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          id: 1,
          roles: [
            { name: 'root', title: 'Super Admin' },
            { name: 'admin_ugco', title: 'Admin UGCO' },
          ],
        },
      });

      const result = await mockClient.get('/users:get', { filterByTk: '1', appends: ['roles'] });
      expect(result.data.roles).toHaveLength(2);
      expect(result.data.roles[1].name).toBe('admin_ugco');
    });

    it('should handle user with no roles', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: { id: 2, roles: [] },
      });

      const result = await mockClient.get('/users:get', { filterByTk: '2', appends: ['roles'] });
      expect(result.data.roles).toHaveLength(0);
    });
  });

  describe('assignRole', () => {
    it('should POST to /users/{id}/roles:add', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/users/1/roles:add', { name: 'medico_oncologo' });
      expect(mockClient.post).toHaveBeenCalledWith('/users/1/roles:add', { name: 'medico_oncologo' });
    });
  });

  describe('removeRole', () => {
    it('should POST to /users/{id}/roles:remove', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/users/1/roles:remove', { name: 'enfermera_ugco' });
      expect(mockClient.post).toHaveBeenCalledWith('/users/1/roles:remove', { name: 'enfermera_ugco' });
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('500 Internal Server Error'));
      await expect(mockClient.get('/users:list')).rejects.toThrow('500');
    });

    it('should handle network errors', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('ECONNREFUSED'));
      await expect(mockClient.post('/users:create', {})).rejects.toThrow('ECONNREFUSED');
    });

    it('should handle 404 on user not found', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('404 Not Found'));
      await expect(mockClient.get('/users:get', { filterByTk: '999' })).rejects.toThrow('404');
    });
  });
});
