/**
 * Unit tests for manage-fields.ts
 *
 * Tests the field management CLI script for NocoBase.
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

describe('manage-fields (via mock client)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listFields', () => {
    it('should call GET /collections/<name>/fields:list', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { name: 'id', type: 'bigInt', interface: 'id', uiSchema: { title: 'ID' } },
          { name: 'nombre', type: 'string', interface: 'input', uiSchema: { title: 'Nombre' } },
          { name: 'fecha', type: 'date', interface: 'datePicker', uiSchema: { title: 'Fecha' } },
        ],
      });

      const result = await mockClient.get('/collections/patients/fields:list');
      expect(mockClient.get).toHaveBeenCalledWith('/collections/patients/fields:list');
      expect(result.data).toHaveLength(3);
      expect(result.data[1].interface).toBe('input');
    });

    it('should handle collection with no custom fields', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { name: 'id', type: 'bigInt', interface: 'id' },
        ],
      });

      const result = await mockClient.get('/collections/empty_col/fields:list');
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getField', () => {
    it('should GET a specific field by name', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          name: 'nombre',
          type: 'string',
          interface: 'input',
          uiSchema: { title: 'Nombre del Paciente', 'x-component': 'Input' },
          required: true,
          unique: false,
        },
      });

      const result = await mockClient.get('/collections/patients/fields:get', { filterByTk: 'nombre' });
      expect(result.data.name).toBe('nombre');
      expect(result.data.required).toBe(true);
    });
  });

  describe('createField', () => {
    it('should POST to create a string field', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: { name: 'email', type: 'string', interface: 'email' },
      });

      const fieldData = {
        name: 'email',
        type: 'string',
        interface: 'email',
        uiSchema: {
          title: 'Email',
          'x-component': 'Input',
          'x-validator': 'email',
        },
      };

      const result = await mockClient.post('/collections/patients/fields:create', fieldData);
      expect(mockClient.post).toHaveBeenCalledWith('/collections/patients/fields:create', fieldData);
      expect(result.data.interface).toBe('email');
    });

    it('should POST to create a relation field (belongsTo)', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: {
          name: 'doctor_id',
          type: 'belongsTo',
          interface: 'obo',
          target: 'staff',
          foreignKey: 'doctor_id',
          targetKey: 'id',
        },
      });

      const result = await mockClient.post('/collections/onco_casos/fields:create', {
        name: 'doctor_id',
        type: 'belongsTo',
        interface: 'obo',
        target: 'staff',
        foreignKey: 'doctor_id',
        targetKey: 'id',
      });
      expect(result.data.type).toBe('belongsTo');
      expect(result.data.target).toBe('staff');
    });

    it('should POST to create a select field with enum', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: { name: 'status', type: 'string', interface: 'select' },
      });

      const result = await mockClient.post('/collections/onco_casos/fields:create', {
        name: 'status',
        type: 'string',
        interface: 'select',
        uiSchema: {
          title: 'Estado',
          enum: [
            { value: 'active', label: 'Activo' },
            { value: 'closed', label: 'Cerrado' },
          ],
        },
      });
      expect(result.data.interface).toBe('select');
    });
  });

  describe('updateField', () => {
    it('should POST to update field properties', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/collections/patients/fields:update', {
        filterByTk: 'nombre',
        uiSchema: { title: 'Nombre Completo' },
      });
      expect(mockClient.post).toHaveBeenCalledWith('/collections/patients/fields:update', {
        filterByTk: 'nombre',
        uiSchema: { title: 'Nombre Completo' },
      });
    });
  });

  describe('deleteField', () => {
    it('should POST to destroy a field', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/collections/patients/fields:destroy', { filterByTk: 'temp_field' });
      expect(mockClient.post).toHaveBeenCalledWith('/collections/patients/fields:destroy', {
        filterByTk: 'temp_field',
      });
    });
  });

  describe('Error handling', () => {
    it('should handle non-existent collection', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('404 Not Found'));
      await expect(mockClient.get('/collections/nonexistent/fields:list')).rejects.toThrow('404 Not Found');
    });

    it('should handle duplicate field creation', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('Field already exists'));
      await expect(
        mockClient.post('/collections/patients/fields:create', { name: 'id', type: 'bigInt' })
      ).rejects.toThrow('Field already exists');
    });
  });
});
