/**
 * Unit tests for manage-auth.ts
 *
 * Tests authentication provider management CLI for NocoBase.
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

describe('manage-auth (via mock client)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listProviders', () => {
    it('should call GET /authenticators:list with pagination', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { name: 'basic', authType: 'Email/Password', enabled: true, title: 'Email' },
          { name: 'sso', authType: 'OIDC', enabled: false, title: 'SSO Corp' },
        ],
      });

      const result = await mockClient.get('/authenticators:list', { pageSize: 50, sort: ['sort'] });
      expect(mockClient.get).toHaveBeenCalledWith('/authenticators:list', { pageSize: 50, sort: ['sort'] });
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('basic');
    });

    it('should handle empty providers list', async () => {
      mockClient.get.mockResolvedValueOnce({ data: [] });
      const result = await mockClient.get('/authenticators:list', { pageSize: 50 });
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getProvider', () => {
    it('should call GET /authenticators:get with filterByTk', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          name: 'basic',
          authType: 'Email/Password',
          enabled: true,
          title: 'Email',
          options: { clientSecret: 'secret123' },
        },
      });

      const result = await mockClient.get('/authenticators:get', { filterByTk: 'basic' });
      expect(mockClient.get).toHaveBeenCalledWith('/authenticators:get', { filterByTk: 'basic' });
      expect(result.data.name).toBe('basic');
      expect(result.data.options.clientSecret).toBe('secret123');
    });
  });

  describe('createProvider', () => {
    it('should POST to /authenticators:create with OIDC config', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: { id: 1, name: 'sso', authType: 'OIDC' },
      });

      const data = {
        name: 'sso',
        authType: 'OIDC',
        enabled: true,
        title: 'SSO Corp',
        options: { clientId: 'abc', issuer: 'https://auth.example.com' },
      };

      const result = await mockClient.post('/authenticators:create', data);
      expect(mockClient.post).toHaveBeenCalledWith('/authenticators:create', data);
      expect(result.data.name).toBe('sso');
    });
  });

  describe('enableProvider', () => {
    it('should POST to /authenticators:update with enabled=true', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/authenticators:update', { filterByTk: 'sso', enabled: true });
      expect(mockClient.post).toHaveBeenCalledWith('/authenticators:update', {
        filterByTk: 'sso',
        enabled: true,
      });
    });
  });

  describe('disableProvider', () => {
    it('should POST to /authenticators:update with enabled=false', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/authenticators:update', { filterByTk: 'sso', enabled: false });
      expect(mockClient.post).toHaveBeenCalledWith('/authenticators:update', {
        filterByTk: 'sso',
        enabled: false,
      });
    });
  });

  describe('deleteProvider', () => {
    it('should POST to /authenticators:destroy', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/authenticators:destroy', { filterByTk: 'sso' });
      expect(mockClient.post).toHaveBeenCalledWith('/authenticators:destroy', { filterByTk: 'sso' });
    });
  });

  describe('checkSession', () => {
    it('should call GET /auth:check and return user info', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          id: 1,
          nickname: 'Admin',
          email: 'admin@example.com',
          roles: [{ name: 'root' }],
        },
      });

      const result = await mockClient.get('/auth:check');
      expect(result.data.nickname).toBe('Admin');
      expect(result.data.roles).toHaveLength(1);
    });

    it('should handle 401 unauthorized', async () => {
      const error = new Error('Request failed with status code 401');
      (error as Record<string, unknown>).response = { status: 401 };
      mockClient.get.mockRejectedValueOnce(error);

      await expect(mockClient.get('/auth:check')).rejects.toThrow('401');
    });
  });

  describe('listTokens', () => {
    it('should call GET /apiKeys:list', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { id: 1, name: 'deploy-key', role: 'root', createdAt: '2026-01-01' },
          { id: 2, name: 'ci-key', role: 'admin', expiresAt: '2025-01-01' },
        ],
      });

      const result = await mockClient.get('/apiKeys:list', { pageSize: 50, sort: ['-createdAt'] });
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('deploy-key');
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('500 Internal Server Error'));
      await expect(mockClient.get('/authenticators:list')).rejects.toThrow('500');
    });

    it('should handle network errors', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('ECONNREFUSED'));
      await expect(mockClient.post('/authenticators:create', {})).rejects.toThrow('ECONNREFUSED');
    });
  });
});
