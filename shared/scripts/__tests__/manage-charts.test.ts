/**
 * Unit tests for manage-charts.ts
 *
 * Tests chart/data-visualization management CLI for NocoBase.
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

describe('manage-charts (via mock client)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('queryChart', () => {
    it('should POST to /charts:query with measures and dimensions', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: [
          { count: 15, estado: 'activo' },
          { count: 8, estado: 'seguimiento' },
          { count: 3, estado: 'egresado' },
        ],
      });

      const query = {
        collection: 'onco_casos',
        measures: [{ field: ['id'], aggregation: 'count', alias: 'count' }],
        dimensions: [{ field: ['estado'] }],
      };

      const result = await mockClient.post('/charts:query', query);
      expect(mockClient.post).toHaveBeenCalledWith('/charts:query', query);
      expect(result.data).toHaveLength(3);
      expect(result.data[0].count).toBe(15);
    });

    it('should use aggregation (not aggregate) in measures', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: [{ count: 42 }],
      });

      const query = {
        collection: 'onco_casos',
        measures: [{ field: ['id'], aggregation: 'count', alias: 'count' }],
        dimensions: [],
      };

      const result = await mockClient.post('/charts:query', query);
      expect(result.data[0].count).toBe(42);
      // Verify the key is 'aggregation' not 'aggregate'
      expect(query.measures[0]).toHaveProperty('aggregation');
      expect(query.measures[0]).not.toHaveProperty('aggregate');
    });

    it('should support filter parameter', async () => {
      mockClient.post.mockResolvedValueOnce({ data: [{ count: 5 }] });

      const query = {
        collection: 'onco_casos',
        measures: [{ field: ['id'], aggregation: 'count', alias: 'count' }],
        dimensions: [],
        filter: { estado: 'activo' },
      };

      await mockClient.post('/charts:query', query);
      expect(mockClient.post).toHaveBeenCalledWith('/charts:query', expect.objectContaining({
        filter: { estado: 'activo' },
      }));
    });

    it('should support limit and orders', async () => {
      mockClient.post.mockResolvedValueOnce({ data: [{ count: 10 }] });

      const query = {
        collection: 'onco_casos',
        measures: [{ field: ['id'], aggregation: 'count', alias: 'count' }],
        dimensions: [{ field: ['estado'] }],
        limit: 10,
        orders: [{ field: 'count', order: 'DESC' }],
      };

      await mockClient.post('/charts:query', query);
      expect(mockClient.post).toHaveBeenCalledWith('/charts:query', expect.objectContaining({
        limit: 10,
        orders: [{ field: 'count', order: 'DESC' }],
      }));
    });

    it('should handle empty results', async () => {
      mockClient.post.mockResolvedValueOnce({ data: [] });

      const result = await mockClient.post('/charts:query', {
        collection: 'onco_casos',
        measures: [{ field: ['id'], aggregation: 'count', alias: 'count' }],
        dimensions: [],
      });
      expect(result.data).toHaveLength(0);
    });
  });

  describe('querySql', () => {
    it('should POST SQL query to /charts:query', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: [{ total: 42 }],
      });

      const result = await mockClient.post('/charts:query', {
        type: 'sql',
        sql: 'SELECT COUNT(*) as total FROM onco_casos',
      });

      expect(mockClient.post).toHaveBeenCalledWith('/charts:query', {
        type: 'sql',
        sql: 'SELECT COUNT(*) as total FROM onco_casos',
      });
      expect(result.data[0].total).toBe(42);
    });
  });

  describe('listChartCollections', () => {
    it('should call GET /collections:list', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { name: 'onco_casos', title: 'Casos Oncologia', fields: [{ name: 'id' }, { name: 'estado' }] },
          { name: 'onco_episodios', title: 'Episodios', fields: [{ name: 'id' }] },
        ],
      });

      const result = await mockClient.get('/collections:list', { paginate: false });
      expect(result.data).toHaveLength(2);
    });
  });

  describe('listChartFields', () => {
    it('should call GET /collections/{name}/fields:list', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { name: 'id', type: 'bigInt', interface: 'id' },
          { name: 'estado', type: 'string', interface: 'select' },
          { name: 'createdAt', type: 'date', interface: 'createdAt' },
          { name: 'diagnostico', type: 'string', interface: 'input' },
        ],
      });

      const result = await mockClient.get('/collections/onco_casos/fields:list', {
        paginate: false,
        sort: ['sort'],
      });

      expect(result.data).toHaveLength(4);

      // Verify numeric types for measures
      const numericFields = result.data.filter((f: Record<string, unknown>) =>
        ['integer', 'bigInt', 'float', 'double', 'decimal', 'number'].includes(f.type as string)
      );
      expect(numericFields).toHaveLength(1); // only id

      // Verify date types for dimensions
      const dateFields = result.data.filter((f: Record<string, unknown>) =>
        ['date', 'dateOnly', 'datetime'].includes(f.type as string)
      );
      expect(dateFields).toHaveLength(1); // createdAt
    });
  });

  describe('Error handling', () => {
    it('should handle chart query errors', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('500 Internal Server Error'));
      await expect(mockClient.post('/charts:query', {})).rejects.toThrow('500');
    });

    it('should handle network errors', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('ECONNREFUSED'));
      await expect(mockClient.get('/collections:list')).rejects.toThrow('ECONNREFUSED');
    });
  });
});
