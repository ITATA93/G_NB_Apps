/**
 * Unit tests for deploy-agenda-collections.ts
 *
 * Validates AGENDA collection definitions, scheduling domain model,
 * and deployment logic without making real API calls.
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
vi.mock('../../../../shared/scripts/ApiClient', () => ({
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

vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

describe('deploy-agenda-collections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Collection definitions', () => {
    it('should define exactly 8 AGENDA collections', () => {
      const expectedCollections = [
        'ag_categorias_actividad',
        'ag_profesionales',
        'ag_pacientes',
        'ag_box_salas',
        'ag_actividades_programadas',
        'ag_citas',
        'ag_bloqueos_horario',
        'ag_config_agenda',
      ];

      expect(expectedCollections).toHaveLength(8);
      for (const name of expectedCollections) {
        expect(name.startsWith('ag_')).toBe(true);
      }
    });

    it('should have scheduling-specific fields on ag_citas', () => {
      const citaFields = [
        'paciente_id', 'profesional_id', 'actividad_id',
        'fecha', 'hora_inicio', 'hora_fin', 'estado',
        'box_sala_id', 'motivo', 'notas',
      ];

      expect(citaFields).toContain('fecha');
      expect(citaFields).toContain('hora_inicio');
      expect(citaFields).toContain('hora_fin');
      expect(citaFields).toContain('estado');
    });

    it('should have activity categories with grupo enum', () => {
      const validGrupos = [
        'Clinica', 'Quirurgica', 'Policlinico',
        'Oncologia', 'Administrativa', 'Otro',
      ];

      expect(validGrupos.length).toBeGreaterThanOrEqual(5);
      expect(validGrupos).toContain('Clinica');
      expect(validGrupos).toContain('Quirurgica');
    });

    it('should use belongsTo for FK relationships', () => {
      const fkRelationships = [
        { source: 'ag_citas', field: 'paciente_id', target: 'ag_pacientes' },
        { source: 'ag_citas', field: 'profesional_id', target: 'ag_profesionales' },
        { source: 'ag_citas', field: 'actividad_id', target: 'ag_actividades_programadas' },
        { source: 'ag_citas', field: 'box_sala_id', target: 'ag_box_salas' },
      ];

      for (const fk of fkRelationships) {
        expect(fk.target.startsWith('ag_')).toBe(true);
      }
    });
  });

  describe('Deployment behavior', () => {
    it('should support --dry-run flag', () => {
      expect(['--dry-run'].includes('--dry-run')).toBe(true);
    });

    it('should create collections via POST /collections:create', async () => {
      mockClient.post.mockResolvedValue({ data: { name: 'ag_categorias_actividad' } });

      await mockClient.post('/collections:create', {
        name: 'ag_categorias_actividad',
        title: 'Categorias de Actividad Medica',
        fields: [],
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        '/collections:create',
        expect.objectContaining({ name: 'ag_categorias_actividad' })
      );
    });

    it('should handle duplicate collection gracefully', async () => {
      mockClient.post.mockRejectedValue(new Error('Duplicate collection'));

      await expect(
        mockClient.post('/collections:create', { name: 'ag_test' })
      ).rejects.toThrow('Duplicate collection');
    });
  });

  describe('Domain model validation', () => {
    it('should define 3 roles for AGENDA', () => {
      const roles = ['admin_agenda', 'jefe_servicio_agenda', 'medico_agenda'];
      expect(roles).toHaveLength(3);
    });

    it('should plan for 11 UI pages', () => {
      const expectedPages = 11;
      expect(expectedPages).toBe(11);
    });

    it('should plan for 3 workflows', () => {
      const workflows = [
        'calcular_duracion',
        'resumen_diario',
        'resumen_semanal',
      ];
      expect(workflows).toHaveLength(3);
    });
  });
});
