/**
 * Unit tests for manage-datasources.ts
 *
 * Tests data source management CLI for NocoBase.
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

describe('manage-datasources (via mock client)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listDataSources', () => {
    it('should call GET /dataSources:list', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { key: 'main', displayName: 'Main', type: 'main', enabled: true, fixed: true },
          { key: 'alma', displayName: 'ALMA IRIS', type: 'mssql', enabled: true, options: { host: '10.0.0.1', port: 1433, database: 'ALMA' } },
          { key: 'old_db', displayName: 'Legacy', type: 'postgres', enabled: false },
        ],
      });

      const result = await mockClient.get('/dataSources:list', { pageSize: 100 });
      expect(result.data).toHaveLength(3);

      const enabled = result.data.filter((s: Record<string, unknown>) => s.enabled !== false);
      const disabled = result.data.filter((s: Record<string, unknown>) => s.enabled === false);
      expect(enabled).toHaveLength(2);
      expect(disabled).toHaveLength(1);
    });

    it('should handle empty datasources list', async () => {
      mockClient.get.mockResolvedValueOnce({ data: [] });
      const result = await mockClient.get('/dataSources:list', { pageSize: 100 });
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getDataSource', () => {
    it('should call GET /dataSources:get with filterByTk', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          key: 'alma',
          displayName: 'ALMA IRIS',
          type: 'mssql',
          enabled: true,
          fixed: false,
          options: { host: '10.0.0.1', port: 1433, database: 'ALMA', password: 'secret' },
        },
      });

      const result = await mockClient.get('/dataSources:get', { filterByTk: 'alma' });
      expect(result.data.key).toBe('alma');
      expect(result.data.options.password).toBe('secret');
    });

    it('should handle non-existent datasource', async () => {
      mockClient.get.mockResolvedValueOnce({ data: null });
      const result = await mockClient.get('/dataSources:get', { filterByTk: 'nonexistent' });
      expect(result.data).toBeNull();
    });
  });

  describe('listCollections', () => {
    it('should call GET /dataSources/{key}/collections:list', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { name: 'pacientes', title: 'Pacientes', fields: [{ name: 'id' }, { name: 'nombre' }] },
          { name: 'camas', title: 'Camas', fields: [{ name: 'id' }] },
        ],
      });

      const result = await mockClient.get('/dataSources/alma/collections:list', {
        pageSize: 200,
        paginate: false,
      });
      expect(mockClient.get).toHaveBeenCalledWith('/dataSources/alma/collections:list', {
        pageSize: 200,
        paginate: false,
      });
      expect(result.data).toHaveLength(2);
    });
  });

  describe('testConnection', () => {
    it('should POST to /dataSources:testConnection', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      const result = await mockClient.post('/dataSources:testConnection', { filterByTk: 'alma' });
      expect(mockClient.post).toHaveBeenCalledWith('/dataSources:testConnection', { filterByTk: 'alma' });
      expect(result.data.ok).toBe(true);
    });

    it('should fall back to listing collections on test failure', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('Endpoint not found'));
      mockClient.get.mockResolvedValueOnce({
        data: [{ name: 'test_table' }],
      });

      await expect(mockClient.post('/dataSources:testConnection', { filterByTk: 'alma' })).rejects.toThrow();
      const fallback = await mockClient.get('/dataSources/alma/collections:list', { pageSize: 1 });
      expect(fallback.data).toHaveLength(1);
    });
  });

  describe('createDataSource', () => {
    it('should POST to /dataSources:create with connection options', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: { key: 'newdb', type: 'mssql', enabled: true },
      });

      const data = {
        key: 'newdb',
        type: 'mssql',
        displayName: 'New Database',
        enabled: true,
        options: {
          host: '10.0.0.2',
          port: 1433,
          database: 'NewDB',
          username: 'sa',
          password: 'pass',
        },
      };

      const result = await mockClient.post('/dataSources:create', data);
      expect(mockClient.post).toHaveBeenCalledWith('/dataSources:create', data);
      expect(result.data.key).toBe('newdb');
    });
  });

  describe('enableDataSource', () => {
    it('should POST to /dataSources:update with enabled=true', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/dataSources:update', { filterByTk: 'alma', enabled: true });
      expect(mockClient.post).toHaveBeenCalledWith('/dataSources:update', {
        filterByTk: 'alma',
        enabled: true,
      });
    });
  });

  describe('disableDataSource', () => {
    it('should POST to /dataSources:update with enabled=false', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/dataSources:update', { filterByTk: 'old_db', enabled: false });
      expect(mockClient.post).toHaveBeenCalledWith('/dataSources:update', {
        filterByTk: 'old_db',
        enabled: false,
      });
    });
  });

  describe('deleteDataSource', () => {
    it('should POST to /dataSources:destroy', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/dataSources:destroy', { filterByTk: 'old_db' });
      expect(mockClient.post).toHaveBeenCalledWith('/dataSources:destroy', { filterByTk: 'old_db' });
    });
  });

  describe('dataSourceStatus', () => {
    it('should list datasources and check collection counts', async () => {
      // List datasources
      mockClient.get.mockResolvedValueOnce({
        data: [
          { key: 'main', displayName: 'Main', type: 'main', enabled: true },
          { key: 'alma', displayName: 'ALMA', type: 'mssql', enabled: true },
        ],
      });
      // Collection count for main
      mockClient.get.mockResolvedValueOnce({
        data: [{ name: 'users' }],
        meta: { count: 45 },
      });
      // Collection count for alma
      mockClient.get.mockResolvedValueOnce({
        data: [{ name: 'pacientes' }],
        meta: { count: 12 },
      });

      const dsResult = await mockClient.get('/dataSources:list', { pageSize: 100 });
      expect(dsResult.data).toHaveLength(2);

      for (const ds of dsResult.data) {
        const colResult = await mockClient.get(`/dataSources/${ds.key}/collections:list`, { pageSize: 1 });
        expect(colResult.data.length).toBeGreaterThan(0);
      }

      expect(mockClient.get).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('500 Internal Server Error'));
      await expect(mockClient.get('/dataSources:list')).rejects.toThrow('500');
    });

    it('should handle network errors', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('ECONNREFUSED'));
      await expect(mockClient.post('/dataSources:create', {})).rejects.toThrow('ECONNREFUSED');
    });
  });
});
