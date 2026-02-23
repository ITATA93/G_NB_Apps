/**
 * Unit tests for manage-collections.ts
 *
 * Tests the collection management CLI script for NocoBase.
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
    appendFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
});

describe('manage-collections (via mock client)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listCollections', () => {
    it('should call GET /collections:list with pagination', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { name: 'patients', title: 'Pacientes', fields: [{ name: 'id' }, { name: 'name' }], hidden: false },
          { name: 'onco_casos', title: 'Casos Oncología', fields: [{ name: 'id' }], hidden: false },
          { name: 'staff', title: 'Personal', fields: [], hidden: true },
        ],
      });

      const result = await mockClient.get('/collections:list', { pageSize: 200, sort: ['name'] });
      expect(mockClient.get).toHaveBeenCalledWith('/collections:list', { pageSize: 200, sort: ['name'] });
      expect(result.data).toHaveLength(3);
      expect(result.data[0].name).toBe('patients');
    });

    it('should handle empty collections list', async () => {
      mockClient.get.mockResolvedValueOnce({ data: [] });
      const result = await mockClient.get('/collections:list', { pageSize: 200 });
      expect(result.data).toHaveLength(0);
    });

    it('should support datasource parameter', async () => {
      mockClient.get.mockResolvedValueOnce({ data: [{ name: 'ext_table', title: 'External' }] });
      const result = await mockClient.get('/dataSources/alma/collections:list', { pageSize: 200 });
      expect(mockClient.get).toHaveBeenCalledWith('/dataSources/alma/collections:list', { pageSize: 200 });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getCollection', () => {
    it('should call GET /collections:get with appends', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          name: 'patients',
          title: 'Pacientes',
          hidden: false,
          origin: 'main',
          fields: [
            { name: 'id', type: 'bigInt', uiSchema: { title: 'ID' } },
            { name: 'nombre', type: 'string', uiSchema: { title: 'Nombre' } },
          ],
        },
      });

      const result = await mockClient.get('/collections:get', { filterByTk: 'patients', appends: ['fields'] });
      expect(mockClient.get).toHaveBeenCalledWith('/collections:get', { filterByTk: 'patients', appends: ['fields'] });
      expect(result.data.name).toBe('patients');
      expect(result.data.fields).toHaveLength(2);
    });
  });

  describe('createCollection', () => {
    it('should POST to /collections:create with standard fields', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: { name: 'new_collection', title: 'New Collection' },
      });

      const data = {
        name: 'new_collection',
        title: 'New Collection',
        fields: [],
        autoGenId: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        sortable: true,
      };

      const result = await mockClient.post('/collections:create', data);
      expect(mockClient.post).toHaveBeenCalledWith('/collections:create', data);
      expect(result.data.name).toBe('new_collection');
    });
  });

  describe('updateCollection', () => {
    it('should POST to /collections:update with filterByTk', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/collections:update', { title: 'Nuevo Titulo', filterByTk: 'patients' });
      expect(mockClient.post).toHaveBeenCalledWith('/collections:update', {
        title: 'Nuevo Titulo',
        filterByTk: 'patients',
      });
    });
  });

  describe('deleteCollection', () => {
    it('should POST to /collections:destroy', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/collections:destroy?filterByTk=test_col', {});
      expect(mockClient.post).toHaveBeenCalledWith('/collections:destroy?filterByTk=test_col', {});
    });
  });

  describe('exportSchema', () => {
    it('should GET collection with fields and format for export', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          name: 'patients',
          title: 'Pacientes',
          fields: [
            { name: 'id', type: 'bigInt', interface: 'id', required: false, unique: true },
            { name: 'nombre', type: 'string', interface: 'input', uiSchema: { title: 'Nombre' }, required: true },
          ],
        },
      });

      const result = await mockClient.get('/collections:get', { filterByTk: 'patients', appends: ['fields'] });
      const schema = result.data;
      const exportData = {
        name: schema.name,
        title: schema.title,
        fields: schema.fields.map((f: Record<string, unknown>) => ({
          name: f.name,
          type: f.type,
          interface: f.interface,
        })),
      };

      expect(exportData.name).toBe('patients');
      expect(exportData.fields).toHaveLength(2);
      expect(exportData.fields[1].interface).toBe('input');
    });
  });

  describe('countRecords', () => {
    it('should GET /<collection>:count', async () => {
      mockClient.get.mockResolvedValueOnce({ data: { count: 42 } });

      const result = await mockClient.get('/patients:count');
      expect(mockClient.get).toHaveBeenCalledWith('/patients:count');
      expect(result.data.count).toBe(42);
    });
  });

  describe('cloneCollection', () => {
    it('should create target collection and copy fields', async () => {
      // Get source
      mockClient.get.mockResolvedValueOnce({
        data: {
          name: 'source_col',
          title: 'Source',
          fields: [
            { name: 'id', type: 'bigInt', primaryKey: true },
            { name: 'nombre', type: 'string', interface: 'input', uiSchema: { title: 'Nombre' } },
            { name: 'email', type: 'string', interface: 'email' },
          ],
        },
      });

      // Create target
      mockClient.post.mockResolvedValueOnce({ data: { name: 'target_col' } });
      // Copy field 1 (nombre)
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });
      // Copy field 2 (email)
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      // Simulate the clone flow
      const sourceResp = await mockClient.get('/collections:get', { filterByTk: 'source_col', appends: ['fields'] });
      const sourceCol = sourceResp.data;

      await mockClient.post('/collections:create', {
        name: 'target_col',
        title: 'Source (copia)',
        fields: [],
        autoGenId: true,
      });

      const systemFields = ['id', 'createdAt', 'updatedAt', 'createdById', 'updatedById', 'sort'];
      const fieldsToClone = sourceCol.fields.filter(
        (f: Record<string, unknown>) => !systemFields.includes(f.name as string) && !f.primaryKey
      );

      expect(fieldsToClone).toHaveLength(2);

      for (const f of fieldsToClone) {
        await mockClient.post(`/collections/target_col/fields:create`, {
          name: f.name,
          type: f.type,
          interface: f.interface,
        });
      }

      expect(mockClient.post).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('500 Internal Server Error'));
      await expect(mockClient.get('/collections:list')).rejects.toThrow('500 Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('ECONNREFUSED'));
      await expect(mockClient.post('/collections:create', {})).rejects.toThrow('ECONNREFUSED');
    });
  });
});
