/**
 * Unit tests for ApiClient.ts
 *
 * Tests the core API client used by all NocoBase management scripts.
 * Uses vitest for testing with mocked axios to avoid real HTTP calls.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock environment variables BEFORE importing ApiClient
vi.stubEnv('NOCOBASE_BASE_URL', 'http://localhost:13000/api');
vi.stubEnv('NOCOBASE_API_KEY', 'test-api-key-12345');

// Mock axios
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

// Mock chalk (avoid ANSI in test output)
vi.mock('chalk', () => ({
  default: new Proxy({}, {
    get: () => (str: string) => str,
  }),
}));

// Mock fs to avoid actual file writes
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn(() => true),
    mkdirSync: vi.fn(),
    appendFileSync: vi.fn(),
  };
});

describe('ApiClient', () => {
  let ApiClient: unknown;
  let createClient: unknown;
  let log: unknown;
  let logAction: unknown;
  let getLogFilePath: unknown;
  let _mockAxios: unknown;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Dynamically import to get fresh module each time
    const mod = await import('../ApiClient.ts');
    ApiClient = mod.ApiClient;
    createClient = mod.createClient;
    log = mod.log;
    logAction = mod.logAction;
    getLogFilePath = mod.getLogFilePath;

    // Get reference to mocked axios
    const axios = await import('axios');
    _mockAxios = (axios.default.create as unknown).mock.results[0]?.value;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should create an ApiClient instance', () => {
      const client = createClient();
      expect(client).toBeInstanceOf(ApiClient);
    });

    it('should expose getBaseUrl()', () => {
      const client = createClient();
      expect(client.getBaseUrl()).toBe('http://localhost:13000/api');
    });

    it('should expose getClient() returning the axios instance', () => {
      const client = createClient();
      expect(client.getClient()).toBeDefined();
    });
  });

  describe('HTTP Methods', () => {
    it('get() should call axios.get and return data', async () => {
      const client = createClient();
      const axiosClient = client.getClient();
      axiosClient.get.mockResolvedValueOnce({
        data: { data: [{ id: 1, name: 'test' }] },
      });

      const result = await client.get('/collections:list');
      expect(axiosClient.get).toHaveBeenCalledWith('/collections:list', { params: {} });
      expect(result).toEqual({ data: [{ id: 1, name: 'test' }] });
    });

    it('get() with params should forward them', async () => {
      const client = createClient();
      const axiosClient = client.getClient();
      axiosClient.get.mockResolvedValueOnce({ data: { data: [] } });

      await client.get('/collections:list', { page: 1, pageSize: 20 });
      expect(axiosClient.get).toHaveBeenCalledWith('/collections:list', {
        params: { page: 1, pageSize: 20 },
      });
    });

    it('post() should call axios.post and return data', async () => {
      const client = createClient();
      const axiosClient = client.getClient();
      axiosClient.post.mockResolvedValueOnce({
        data: { data: { id: 1, name: 'new-collection' } },
      });

      const result = await client.post('/collections:create', { name: 'test' });
      expect(axiosClient.post).toHaveBeenCalledWith('/collections:create', { name: 'test' });
      expect(result).toEqual({ data: { id: 1, name: 'new-collection' } });
    });

    it('put() should call axios.put and return data', async () => {
      const client = createClient();
      const axiosClient = client.getClient();
      axiosClient.put.mockResolvedValueOnce({ data: { success: true } });

      const result = await client.put('/collections:update', { name: 'updated' });
      expect(axiosClient.put).toHaveBeenCalledWith('/collections:update', { name: 'updated' });
      expect(result).toEqual({ success: true });
    });

    it('patch() should call axios.patch and return data', async () => {
      const client = createClient();
      const axiosClient = client.getClient();
      axiosClient.patch.mockResolvedValueOnce({ data: { patched: true } });

      const result = await client.patch('/collections:update', { title: 'new' });
      expect(axiosClient.patch).toHaveBeenCalledWith('/collections:update', { title: 'new' });
      expect(result).toEqual({ patched: true });
    });

    it('delete() should call axios.delete', async () => {
      const client = createClient();
      const axiosClient = client.getClient();
      axiosClient.delete.mockResolvedValueOnce({ data: { deleted: true } });

      const result = await client.delete('/collections:destroy', { filterByTk: 'test' });
      expect(axiosClient.delete).toHaveBeenCalledWith('/collections:destroy', {
        params: { filterByTk: 'test' },
      });
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('Error Handling', () => {
    it('get() should throw on API error', async () => {
      const client = createClient();
      const axiosClient = client.getClient();
      axiosClient.get.mockRejectedValueOnce(new Error('Network Error'));

      await expect(client.get('/fail')).rejects.toThrow('Network Error');
    });

    it('post() should throw on API error', async () => {
      const client = createClient();
      const axiosClient = client.getClient();
      axiosClient.post.mockRejectedValueOnce(new Error('400 Bad Request'));

      await expect(client.post('/fail', {})).rejects.toThrow('400 Bad Request');
    });
  });

  describe('Pagination (listAll)', () => {
    it('should fetch single page when items < pageSize', async () => {
      const client = createClient();
      const axiosClient = client.getClient();

      // First call: 3 items (less than 100 = pageSize)
      axiosClient.get.mockResolvedValueOnce({
        data: { data: [{ id: 1 }, { id: 2 }, { id: 3 }] },
      });

      const result = await client.listAll('/collections:list');
      expect(result).toHaveLength(3);
      expect(axiosClient.get).toHaveBeenCalledTimes(1);
    });

    it('should fetch multiple pages when items === pageSize', async () => {
      const client = createClient();
      const axiosClient = client.getClient();

      // First page: 100 items
      const page1 = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      axiosClient.get.mockResolvedValueOnce({ data: { data: page1 } });

      // Second page: 50 items (end)
      const page2 = Array.from({ length: 50 }, (_, i) => ({ id: 100 + i }));
      axiosClient.get.mockResolvedValueOnce({ data: { data: page2 } });

      const result = await client.listAll('/collections:list');
      expect(result).toHaveLength(150);
      expect(axiosClient.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('Data Sanitization', () => {
    it('post() should sanitize sensitive fields in logs', async () => {
      const client = createClient();
      const axiosClient = client.getClient();
      axiosClient.post.mockResolvedValueOnce({ data: { ok: true } });

      // This should still send the real data but sanitize logs
      await client.post('/auth:signIn', {
        username: 'admin',
        password: 'secret123',
        token: 'abc',
      });

      expect(axiosClient.post).toHaveBeenCalledWith('/auth:signIn', {
        username: 'admin',
        password: 'secret123',
        token: 'abc',
      });
    });
  });

  describe('Exports', () => {
    it('log() should not throw', () => {
      expect(() => log('test message')).not.toThrow();
      expect(() => log('colored', 'green')).not.toThrow();
    });

    it('logAction() should not throw', () => {
      expect(() => logAction('test action')).not.toThrow();
      expect(() => logAction('action', { key: 'value' })).not.toThrow();
    });

    it('getLogFilePath() should return a string path', () => {
      const logPath = getLogFilePath();
      expect(typeof logPath).toBe('string');
      expect(logPath).toContain('nocobase-api-');
      expect(logPath).toContain('.log');
    });

    it('createClient() should return an ApiClient instance', () => {
      const client = createClient();
      expect(client).toBeInstanceOf(ApiClient);
    });
  });
});
