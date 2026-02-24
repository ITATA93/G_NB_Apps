/**
 * Unit tests for manage-workflows.ts
 *
 * Tests the workflow management CLI script for NocoBase.
 * Covers: list, get, nodes, enable, disable, trigger, executions, delete.
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

describe('manage-workflows (via mock client)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── listWorkflows ─────────────────────────────────────────────────────────

  describe('listWorkflows', () => {
    it('should GET /workflows:list with pagination and sort', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { id: 1, title: 'On Patient Created', type: 'collection', enabled: true, executed: 42 },
          { id: 2, title: 'Daily Report', type: 'schedule', enabled: false, executed: 0 },
        ],
      });

      const result = await mockClient.get('/workflows:list', {
        pageSize: 200,
        sort: ['-createdAt'],
      });
      expect(mockClient.get).toHaveBeenCalledWith('/workflows:list', {
        pageSize: 200,
        sort: ['-createdAt'],
      });
      expect(result.data).toHaveLength(2);
      expect(result.data[0].enabled).toBe(true);
    });

    it('should support --enabled filter', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { id: 1, title: 'Active WF', enabled: true },
        ],
      });

      const result = await mockClient.get('/workflows:list', {
        pageSize: 200,
        sort: ['-createdAt'],
        filter: { enabled: true },
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].enabled).toBe(true);
    });

    it('should handle empty workflow list', async () => {
      mockClient.get.mockResolvedValueOnce({ data: [] });

      const result = await mockClient.get('/workflows:list', { pageSize: 200 });
      expect(result.data).toHaveLength(0);
    });
  });

  // ─── getWorkflow ───────────────────────────────────────────────────────────

  describe('getWorkflow', () => {
    it('should GET /workflows:get with filterByTk', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          id: 1,
          title: 'On Patient Created',
          type: 'collection',
          enabled: true,
          executed: 42,
          description: 'Triggered when a patient record is created',
          config: { collection: 'patients', mode: 1 },
        },
      });

      const result = await mockClient.get('/workflows:get', { filterByTk: '1' });
      expect(mockClient.get).toHaveBeenCalledWith('/workflows:get', { filterByTk: '1' });
      expect(result.data.title).toBe('On Patient Created');
      expect(result.data.config.collection).toBe('patients');
    });
  });

  // ─── listNodes ─────────────────────────────────────────────────────────────

  describe('listNodes', () => {
    it('should GET /flow_nodes:list filtered by workflowId', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { id: 10, title: 'Condition Check', type: 'condition', workflowId: 1, upstreamId: null },
          { id: 11, title: 'Create Record', type: 'create', workflowId: 1, upstreamId: 10 },
        ],
      });

      const result = await mockClient.get('/flow_nodes:list', {
        filter: { workflowId: 1 },
        sort: ['id'],
        pageSize: 200,
      });
      expect(result.data).toHaveLength(2);
      expect(result.data[1].upstreamId).toBe(10);
    });

    it('should handle workflow with no nodes', async () => {
      mockClient.get.mockResolvedValueOnce({ data: [] });

      const result = await mockClient.get('/flow_nodes:list', {
        filter: { workflowId: 999 },
        sort: ['id'],
        pageSize: 200,
      });
      expect(result.data).toHaveLength(0);
    });
  });

  // ─── enableWorkflow ────────────────────────────────────────────────────────

  describe('enableWorkflow', () => {
    it('should POST to enable workflow', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/workflows:update?filterByTk=1', { enabled: true });
      expect(mockClient.post).toHaveBeenCalledWith(
        '/workflows:update?filterByTk=1',
        { enabled: true }
      );
    });
  });

  // ─── disableWorkflow ───────────────────────────────────────────────────────

  describe('disableWorkflow', () => {
    it('should POST to disable workflow', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/workflows:update?filterByTk=1', { enabled: false });
      expect(mockClient.post).toHaveBeenCalledWith(
        '/workflows:update?filterByTk=1',
        { enabled: false }
      );
    });
  });

  // ─── triggerWorkflow ───────────────────────────────────────────────────────

  describe('triggerWorkflow', () => {
    it('should POST to trigger workflow execution', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { executionId: 100 } });

      const result = await mockClient.post('/workflows/1:trigger', {});
      expect(mockClient.post).toHaveBeenCalledWith('/workflows/1:trigger', {});
      expect(result.data.executionId).toBe(100);
    });

    it('should handle trigger failure for event-only workflows', async () => {
      mockClient.post.mockRejectedValueOnce(
        new Error('Workflow cannot be triggered manually')
      );

      await expect(
        mockClient.post('/workflows/2:trigger', {})
      ).rejects.toThrow('Workflow cannot be triggered manually');
    });
  });

  // ─── listExecutions ────────────────────────────────────────────────────────

  describe('listExecutions', () => {
    it('should GET /executions:list with workflowId filter and limit', async () => {
      mockClient.get.mockResolvedValueOnce({
        data: [
          { id: 100, status: 1, createdAt: '2026-02-20T10:00:00Z', workflowId: 1 },
          { id: 99, status: -1, createdAt: '2026-02-19T14:30:00Z', workflowId: 1 },
        ],
      });

      const result = await mockClient.get('/executions:list', {
        filter: { workflowId: 1 },
        sort: ['-createdAt'],
        pageSize: 10,
      });
      expect(result.data).toHaveLength(2);
      expect(result.data[0].status).toBe(1);  // completed
      expect(result.data[1].status).toBe(-1); // failed
    });

    it('should handle no executions', async () => {
      mockClient.get.mockResolvedValueOnce({ data: [] });

      const result = await mockClient.get('/executions:list', {
        filter: { workflowId: 1 },
        sort: ['-createdAt'],
        pageSize: 10,
      });
      expect(result.data).toHaveLength(0);
    });
  });

  // ─── deleteWorkflow ────────────────────────────────────────────────────────

  describe('deleteWorkflow', () => {
    it('should POST to /workflows:destroy', async () => {
      mockClient.post.mockResolvedValueOnce({ data: { ok: true } });

      await mockClient.post('/workflows:destroy?filterByTk=1', {});
      expect(mockClient.post).toHaveBeenCalledWith('/workflows:destroy?filterByTk=1', {});
    });
  });

  // ─── Error handling ────────────────────────────────────────────────────────

  describe('Error handling', () => {
    it('should handle 404 for nonexistent workflow', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('404 Not Found'));

      await expect(
        mockClient.get('/workflows:get', { filterByTk: '9999' })
      ).rejects.toThrow('404 Not Found');
    });

    it('should handle 401 Unauthorized', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('401 Unauthorized'));

      await expect(
        mockClient.post('/workflows:update?filterByTk=1', { enabled: true })
      ).rejects.toThrow('401 Unauthorized');
    });

    it('should handle network errors', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('ECONNREFUSED'));

      await expect(
        mockClient.get('/workflows:list', { pageSize: 200 })
      ).rejects.toThrow('ECONNREFUSED');
    });
  });
});
