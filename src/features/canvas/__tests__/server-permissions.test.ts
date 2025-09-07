import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import canvasRoute from '../server/route';
import { MemberRole } from '@/features/members/types';

// Mock dependencies
vi.mock('@/features/members/utils', () => ({
  getMembers: vi.fn(),
}));

vi.mock('@/lib/session-middleware', () => ({
  SessionMiddleware: vi.fn((c, next) => {
    c.set('user', { $id: 'test-user-123' });
    c.set('databases', mockDatabases);
    return next();
  }),
}));

vi.mock('@/config', () => ({
  DATABASE_ID: 'test-db',
  CANVAS_ROOMS_ID: 'canvas-rooms',
  MEMBERS_ID: 'members',
}));

const mockDatabases = {
  getDocument: vi.fn(),
  listDocuments: vi.fn(),
  createDocument: vi.fn(),
  updateDocument: vi.fn(),
  deleteDocument: vi.fn(),
};

const app = new Hono().route('/canvas', canvasRoute);

describe('Canvas Server Permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /canvas/:roomId', () => {
    it('should allow access to room owner', async () => {
      const { getMembers } = await import('@/features/members/utils');
      
      const canvasRoom = {
        $id: 'room-123',
        name: 'Test Room',
        workspaceId: 'workspace-123',
        createdBy: 'test-user-123',
        collaborators: ['test-user-123'],
        isPublic: false,
      };

      const member = {
        $id: 'member-123',
        userId: 'test-user-123',
        workspaceId: 'workspace-123',
        role: MemberRole.MEMBER,
      };

      mockDatabases.getDocument.mockResolvedValue(canvasRoom);
      (getMembers as any).mockResolvedValue(member);

      const req = new Request('http://localhost/canvas/room-123');
      const res = await app.request(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data).toEqual(canvasRoom);
    });

    it('should deny access to non-members of private room', async () => {
      const { getMembers } = await import('@/features/members/utils');
      
      const canvasRoom = {
        $id: 'room-123',
        name: 'Test Room',
        workspaceId: 'workspace-123',
        createdBy: 'other-user-456',
        collaborators: ['other-user-456'],
        isPublic: false,
      };

      mockDatabases.getDocument.mockResolvedValue(canvasRoom);
      (getMembers as any).mockResolvedValue(null);

      const req = new Request('http://localhost/canvas/room-123');
      const res = await app.request(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should allow access to public room for non-members', async () => {
      const { getMembers } = await import('@/features/members/utils');
      
      const canvasRoom = {
        $id: 'room-123',
        name: 'Test Room',
        workspaceId: 'workspace-123',
        createdBy: 'other-user-456',
        collaborators: ['other-user-456'],
        isPublic: true,
      };

      mockDatabases.getDocument.mockResolvedValue(canvasRoom);
      (getMembers as any).mockResolvedValue(null);

      const req = new Request('http://localhost/canvas/room-123');
      const res = await app.request(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data).toEqual(canvasRoom);
    });
  });

  describe('PATCH /canvas/:roomId', () => {
    it('should allow room owner to update room', async () => {
      const { getMembers } = await import('@/features/members/utils');
      
      const canvasRoom = {
        $id: 'room-123',
        name: 'Test Room',
        workspaceId: 'workspace-123',
        createdBy: 'test-user-123',
        collaborators: ['test-user-123'],
        isPublic: false,
      };

      const updatedRoom = { ...canvasRoom, name: 'Updated Room' };

      const member = {
        $id: 'member-123',
        userId: 'test-user-123',
        workspaceId: 'workspace-123',
        role: MemberRole.MEMBER,
      };

      mockDatabases.getDocument.mockResolvedValue(canvasRoom);
      mockDatabases.updateDocument.mockResolvedValue(updatedRoom);
      (getMembers as any).mockResolvedValue(member);

      const req = new Request('http://localhost/canvas/room-123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Room' }),
      });
      
      const res = await app.request(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.name).toBe('Updated Room');
    });

    it('should deny update access to non-collaborators', async () => {
      const { getMembers } = await import('@/features/members/utils');
      
      const canvasRoom = {
        $id: 'room-123',
        name: 'Test Room',
        workspaceId: 'workspace-123',
        createdBy: 'other-user-456',
        collaborators: ['other-user-456'],
        isPublic: false,
      };

      const member = {
        $id: 'member-123',
        userId: 'test-user-123',
        workspaceId: 'workspace-123',
        role: MemberRole.MEMBER,
      };

      mockDatabases.getDocument.mockResolvedValue(canvasRoom);
      (getMembers as any).mockResolvedValue(member);

      const req = new Request('http://localhost/canvas/room-123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Room' }),
      });
      
      const res = await app.request(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('DELETE /canvas/:roomId', () => {
    it('should allow room owner to delete room', async () => {
      const { getMembers } = await import('@/features/members/utils');
      
      const canvasRoom = {
        $id: 'room-123',
        name: 'Test Room',
        workspaceId: 'workspace-123',
        createdBy: 'test-user-123',
        collaborators: ['test-user-123'],
        isPublic: false,
      };

      const member = {
        $id: 'member-123',
        userId: 'test-user-123',
        workspaceId: 'workspace-123',
        role: MemberRole.MEMBER,
      };

      mockDatabases.getDocument.mockResolvedValue(canvasRoom);
      mockDatabases.deleteDocument.mockResolvedValue(undefined);
      (getMembers as any).mockResolvedValue(member);

      const req = new Request('http://localhost/canvas/room-123', {
        method: 'DELETE',
      });
      
      const res = await app.request(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.$id).toBe('room-123');
    });

    it('should allow workspace admin to delete room', async () => {
      const { getMembers } = await import('@/features/members/utils');
      
      const canvasRoom = {
        $id: 'room-123',
        name: 'Test Room',
        workspaceId: 'workspace-123',
        createdBy: 'other-user-456',
        collaborators: ['other-user-456'],
        isPublic: false,
      };

      const member = {
        $id: 'member-123',
        userId: 'test-user-123',
        workspaceId: 'workspace-123',
        role: MemberRole.ADMIN,
      };

      mockDatabases.getDocument.mockResolvedValue(canvasRoom);
      mockDatabases.deleteDocument.mockResolvedValue(undefined);
      (getMembers as any).mockResolvedValue(member);

      const req = new Request('http://localhost/canvas/room-123', {
        method: 'DELETE',
      });
      
      const res = await app.request(req);

      expect(res.status).toBe(200);
    });

    it('should deny delete access to regular collaborators', async () => {
      const { getMembers } = await import('@/features/members/utils');
      
      const canvasRoom = {
        $id: 'room-123',
        name: 'Test Room',
        workspaceId: 'workspace-123',
        createdBy: 'other-user-456',
        collaborators: ['other-user-456', 'test-user-123'],
        isPublic: false,
      };

      const member = {
        $id: 'member-123',
        userId: 'test-user-123',
        workspaceId: 'workspace-123',
        role: MemberRole.MEMBER,
      };

      mockDatabases.getDocument.mockResolvedValue(canvasRoom);
      (getMembers as any).mockResolvedValue(member);

      const req = new Request('http://localhost/canvas/room-123', {
        method: 'DELETE',
      });
      
      const res = await app.request(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });
  });
});