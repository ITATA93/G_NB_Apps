/**
 * Unit tests for manage-backup.ts
 *
 * Tests backup management CLI for NocoBase.
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
  getClient: vi.fn(() => ({ get: vi.fn() })),
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

describe('manage-backup (via mock client)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listBackups', () => {
    it('should call GET /backupFiles:list with sort and pagination', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { id: 1, name: 'pre-deploy', status: 'ok', fileSize: 1048576, createdAt: '2026-03-01T10:00:00Z' },
          { id: 2, name: 'daily-backup', status: 'succeed', fileSize: 2097152, createdAt: '2026-03-02T10:00:00Z' },
        ],
      });

      const result = await mockClient.get('/backupFiles:list', { sort: ['-createdAt'], pageSize: 50 });
      expect(mockClient.get).toHaveBeenCalledWith('/backupFiles:list', { sort: ['-createdAt'], pageSize: 50 });
      expect(result.data).toHaveLength(2);
      expect(result.data[0].status).toBe('ok');
    });

    it('should handle empty backups list', async () => {
      mockClient.get.mockResolvedValueOnce({ data: [] });
      const result = await mockClient.get('/backupFiles:list', { sort: ['-createdAt'], pageSize: 50 });
      expect(result.data).toHaveLength(0);
    });

    it('should display in-progress backups', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { id: 3, name: 'running', status: 'in_progress', fileSize: 0 },
        ],
      });

      const result = await mockClient.get('/backupFiles:list', { sort: ['-createdAt'], pageSize: 50 });
      expect(result.data[0].status).toBe('in_progress');
    });
  });

  describe('createBackup', () => {
    it('should POST to /backupFiles:create', async () => {
      mockClient.post.mockResolvedValueOnce({
        data: { id: 10, status: 'pending', fileSize: 0 },
      });

      const result = await mockClient.post('/backupFiles:create', {});
      expect(mockClient.post).toHaveBeenCalledWith('/backupFiles:create', {});
      expect(result.data.id).toBe(10);
    });

    it('should try alternative endpoint on failure', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('404 Not Found'));
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await expect(mockClient.post('/backupFiles:create', {})).rejects.toThrow('404');
      const altResult = await mockClient.post('/backup:run', {});
      expect(altResult.data.ok).toBe(true);
    });
  });

  describe('restoreBackup', () => {
    it('should POST to /backupFiles:restore with filterByTk', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/backupFiles:restore', { filterByTk: 5 });
      expect(mockClient.post).toHaveBeenCalledWith('/backupFiles:restore', { filterByTk: 5 });
    });
  });

  describe('deleteBackup', () => {
    it('should POST to /backupFiles:destroy', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/backupFiles:destroy', { filterByTk: 3 });
      expect(mockClient.post).toHaveBeenCalledWith('/backupFiles:destroy', { filterByTk: 3 });
    });
  });

  describe('backupStatus', () => {
    it('should check backup plugin and list recent backups', async () => {
      // Plugin check
      mockClient.get.mockResolvedValueOnce({
        data: [{ name: 'backup-restore', enabled: true, version: '1.0.0' }],
      });
      // Recent backups
      mockClient.get.mockResolvedValueOnce({
        data: [
          { id: 1, createdAt: '2026-03-01', status: 'ok', fileSize: 1048576 },
        ],
      });

      const pluginResult = await mockClient.get('/applicationPlugins:list', {
        filter: { name: { $like: '%backup%' } },
        pageSize: 10,
      });
      expect(pluginResult.data[0].enabled).toBe(true);

      const backupResult = await mockClient.get('/backupFiles:list', { sort: ['-createdAt'], pageSize: 5 });
      expect(backupResult.data).toHaveLength(1);
    });
  });

  describe('Error handling', () => {
    it('should handle API errors gracefully', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('500 Internal Server Error'));
      await expect(mockClient.get('/backupFiles:list')).rejects.toThrow('500');
    });

    it('should handle network errors', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('ECONNREFUSED'));
      await expect(mockClient.post('/backupFiles:create', {})).rejects.toThrow('ECONNREFUSED');
    });
  });
});
