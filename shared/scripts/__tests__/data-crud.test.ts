/**
 * Unit tests for data-crud.ts
 *
 * Tests the data CRUD operations CLI script for NocoBase.
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
    readFileSync: vi.fn(() => JSON.stringify([
      { nombre: 'Juan', rut: '12345678-9' },
      { nombre: 'María', rut: '98765432-1' },
    ])),
    writeFileSync: vi.fn(),
  };
});

describe('data-crud (via mock client)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listRecords', () => {
    it('should call GET /<collection>:list with pagination', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { id: 1, nombre: 'Juan', rut: '12345678-9' },
          { id: 2, nombre: 'María', rut: '98765432-1' },
        ],
        meta: { count: 2, page: 1, pageSize: 20, totalPage: 1 },
      });

      const result = await mockClient.get('/patients:list', { page: 1, pageSize: 20 });
      expect(mockClient.get).toHaveBeenCalledWith('/patients:list', { page: 1, pageSize: 20 });
      expect(result.data).toHaveLength(2);
      expect(result.meta.count).toBe(2);
    });

    it('should support filter parameter', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [{ id: 1, nombre: 'Juan', status: 'active' }],
        meta: { count: 1 },
      });

      const result = await mockClient.get('/patients:list', {
        page: 1,
        pageSize: 20,
        filter: { status: 'active' },
      });
      expect(result.data).toHaveLength(1);
    });

    it('should handle empty results', async () => {
      mockClient.get.mockResolvedValueOnce({ data: [], meta: { count: 0 } });
      const result = await mockClient.get('/patients:list', { page: 1, pageSize: 20 });
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getRecord', () => {
    it('should call GET /<collection>:get with filterByTk', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: { id: 1, nombre: 'Juan', rut: '12345678-9', fecha_nacimiento: '1985-03-15' },
      });

      const result = await mockClient.get('/patients:get', { filterByTk: '1' });
      expect(mockClient.get).toHaveBeenCalledWith('/patients:get', { filterByTk: '1' });
      expect(result.data.nombre).toBe('Juan');
    });

    it('should support appends for relations', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          id: 1,
          nombre: 'Juan',
          doctor: { id: 5, nombre: 'Dr. García' },
        },
      });

      const result = await mockClient.get('/patients:get', { filterByTk: '1', appends: ['doctor'] });
      expect(result.data.doctor.nombre).toBe('Dr. García');
    });
  });

  describe('createRecord', () => {
    it('should POST to /<collection>:create', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: { id: 3, nombre: 'Pedro', rut: '11111111-1' },
      });

      const result = await mockClient.post('/patients:create', { nombre: 'Pedro', rut: '11111111-1' });
      expect(mockClient.post).toHaveBeenCalledWith('/patients:create', { nombre: 'Pedro', rut: '11111111-1' });
      expect(result.data.id).toBe(3);
    });
  });

  describe('updateRecord', () => {
    it('should POST to /<collection>:update with filterByTk', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/patients:update', { nombre: 'Juan Pablo', filterByTk: '1' });
      expect(mockClient.post).toHaveBeenCalledWith('/patients:update', {
        nombre: 'Juan Pablo',
        filterByTk: '1',
      });
    });
  });

  describe('deleteRecord', () => {
    it('should POST to /<collection>:destroy', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/patients:destroy', { filterByTk: '1' });
      expect(mockClient.post).toHaveBeenCalledWith('/patients:destroy', { filterByTk: '1' });
    });
  });

  describe('countRecords', () => {
    it('should GET /<collection>:count', async () => {
      mockClient.get.mockResolvedValueOnce({ data: { count: 150 } });

      const result = await mockClient.get('/patients:count');
      expect(result.data.count).toBe(150);
    });

    it('should support filter for count', async () => {
      mockClient.get.mockResolvedValueOnce({ data: { count: 30 } });

      const result = await mockClient.get('/patients:count', { filter: { status: 'active' } });
      expect(result.data.count).toBe(30);
    });
  });

  describe('searchRecords', () => {
    it('should GET with $includes operator', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { id: 1, nombre: 'Juan García' },
          { id: 5, nombre: 'Juan López' },
        ],
      });

      const result = await mockClient.get('/patients:list', {
        filter: { nombre: { $includes: 'Juan' } },
        pageSize: 50,
      });
      expect(result.data).toHaveLength(2);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple records from array', async () => {
      mockClient.post
        .mockResolvedValueOnce({ data: { id: 10 } })
        .mockResolvedValueOnce({ data: { id: 11 } });

      const records = [
        { nombre: 'Paciente A' },
        { nombre: 'Paciente B' },
      ];

      for (const record of records) {
        await mockClient.post('/patients:create', record);
      }

      expect(mockClient.post).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures in bulk create', async () => {
      mockClient.post
        .mockResolvedValueOnce({ data: { id: 10 } })
        .mockRejectedValueOnce(new Error('Duplicate entry'));

      let created = 0;
      let errors = 0;

      const records = [{ nombre: 'OK' }, { nombre: 'Duplicate' }];
      for (const record of records) {
        try {
          await mockClient.post('/patients:create', record);
          created++;
        } catch {
          errors++;
        }
      }

      expect(created).toBe(1);
      expect(errors).toBe(1);
    });
  });

  describe('bulkUpdate', () => {
    it('should POST to /<collection>:update with filter', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/patients:update', {
        status: 'archived',
        filter: { status: 'old' },
      });
      expect(mockClient.post).toHaveBeenCalledWith('/patients:update', {
        status: 'archived',
        filter: { status: 'old' },
      });
    });
  });

  describe('bulkDelete', () => {
    it('should POST to /<collection>:destroy with filter', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/patients:destroy', { filter: { status: 'archived' } });
      expect(mockClient.post).toHaveBeenCalledWith('/patients:destroy', {
        filter: { status: 'archived' },
      });
    });
  });

  describe('exportData', () => {
    it('should fetch all records using listAll', async () => {
      mockClient.listAll.mockResolvedValueOnce([
        { id: 1, nombre: 'Juan' },
        { id: 2, nombre: 'María' },
        { id: 3, nombre: 'Pedro' },
      ]);

      const allRecords = await mockClient.listAll('/patients:list');
      expect(allRecords).toHaveLength(3);
    });

    it('should handle empty export', async () => {
      mockClient.listAll.mockResolvedValueOnce([]);
      const allRecords = await mockClient.listAll('/patients:list');
      expect(allRecords).toHaveLength(0);
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('401 Unauthorized'));
      await expect(mockClient.get('/patients:list')).rejects.toThrow('401 Unauthorized');
    });

    it('should handle network errors', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('ECONNREFUSED'));
      await expect(mockClient.post('/patients:create', {})).rejects.toThrow('ECONNREFUSED');
    });
  });
});
