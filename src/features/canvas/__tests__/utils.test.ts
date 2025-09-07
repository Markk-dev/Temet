import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCanvasRoomPermissions, validateCanvasRoomAccess, generateRoomId } from '../utils';
import { MemberRole } from '@/features/members/types';

// Mock the databases
const mockDatabases = {
  getDocument: vi.fn(),
  listDocuments: vi.fn(),
} as any;

describe('Canvas Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCanvasRoomPermissions', () => {
    it('should grant full permissions to room owner', async () => {
      const userId = 'user-123';
      const canvasRoom = {
        $id: 'room-123',
        createdBy: userId,
        workspaceId: 'workspace-123',
        collaborators: [userId],
        isPublic: false,
      };

      const member = {
        userId,
        workspaceId: 'workspace-123',
        role: MemberRole.MEMBER,
      };

      mockDatabases.getDocument.mockResolvedValue(canvasRoom);
      mockDatabases.listDocuments.mockResolvedValue({
        documents: [member],
      });

      const permissions = await getCanvasRoomPermissions({
        databases: mockDatabases,
        roomId: 'room-123',
        userId,
      });

      expect(permissions).toEqual({
        canView: true,
        canEdit: true,
        canDelete: true,
        canInvite: true,
      });
    });

    it('should grant limited permissions to workspace admin', async () => {
      const userId = 'user-123';
      const ownerId = 'owner-456';
      const canvasRoom = {
        $id: 'room-123',
        createdBy: ownerId,
        workspaceId: 'workspace-123',
        collaborators: [ownerId],
        isPublic: false,
      };

      const member = {
        userId,
        workspaceId: 'workspace-123',
        role: MemberRole.ADMIN,
      };

      mockDatabases.getDocument.mockResolvedValue(canvasRoom);
      mockDatabases.listDocuments.mockResolvedValue({
        documents: [member],
      });

      const permissions = await getCanvasRoomPermissions({
        databases: mockDatabases,
        roomId: 'room-123',
        userId,
      });

      expect(permissions).toEqual({
        canView: true,
        canEdit: true,
        canDelete: true,
        canInvite: true,
      });
    });

    it('should grant edit permissions to collaborators', async () => {
      const userId = 'user-123';
      const ownerId = 'owner-456';
      const canvasRoom = {
        $id: 'room-123',
        createdBy: ownerId,
        workspaceId: 'workspace-123',
        collaborators: [ownerId, userId],
        isPublic: false,
      };

      const member = {
        userId,
        workspaceId: 'workspace-123',
        role: MemberRole.MEMBER,
      };

      mockDatabases.getDocument.mockResolvedValue(canvasRoom);
      mockDatabases.listDocuments.mockResolvedValue({
        documents: [member],
      });

      const permissions = await getCanvasRoomPermissions({
        databases: mockDatabases,
        roomId: 'room-123',
        userId,
      });

      expect(permissions).toEqual({
        canView: true,
        canEdit: true,
        canDelete: false,
        canInvite: false,
      });
    });

    it('should grant view-only permissions to workspace members for public rooms', async () => {
      const userId = 'user-123';
      const ownerId = 'owner-456';
      const canvasRoom = {
        $id: 'room-123',
        createdBy: ownerId,
        workspaceId: 'workspace-123',
        collaborators: [ownerId],
        isPublic: true,
      };

      const member = {
        userId,
        workspaceId: 'workspace-123',
        role: MemberRole.MEMBER,
      };

      mockDatabases.getDocument.mockResolvedValue(canvasRoom);
      mockDatabases.listDocuments.mockResolvedValue({
        documents: [member],
      });

      const permissions = await getCanvasRoomPermissions({
        databases: mockDatabases,
        roomId: 'room-123',
        userId,
      });

      expect(permissions).toEqual({
        canView: true,
        canEdit: false,
        canDelete: false,
        canInvite: false,
      });
    });

    it('should deny all permissions to non-members of private rooms', async () => {
      const userId = 'user-123';
      const ownerId = 'owner-456';
      const canvasRoom = {
        $id: 'room-123',
        createdBy: ownerId,
        workspaceId: 'workspace-123',
        collaborators: [ownerId],
        isPublic: false,
      };

      mockDatabases.getDocument.mockResolvedValue(canvasRoom);
      mockDatabases.listDocuments.mockResolvedValue({
        documents: [],
      });

      const permissions = await getCanvasRoomPermissions({
        databases: mockDatabases,
        roomId: 'room-123',
        userId,
      });

      expect(permissions).toEqual({
        canView: false,
        canEdit: false,
        canDelete: false,
        canInvite: false,
      });
    });
  });

  describe('validateCanvasRoomAccess', () => {
    it('should validate specific permission correctly', async () => {
      const userId = 'user-123';
      const canvasRoom = {
        $id: 'room-123',
        createdBy: userId,
        workspaceId: 'workspace-123',
        collaborators: [userId],
        isPublic: false,
      };

      const member = {
        userId,
        workspaceId: 'workspace-123',
        role: MemberRole.MEMBER,
      };

      mockDatabases.getDocument.mockResolvedValue(canvasRoom);
      mockDatabases.listDocuments.mockResolvedValue({
        documents: [member],
      });

      const canEdit = await validateCanvasRoomAccess({
        databases: mockDatabases,
        roomId: 'room-123',
        userId,
        requiredPermission: 'canEdit',
      });

      expect(canEdit).toBe(true);
    });
  });

  describe('generateRoomId', () => {
    it('should generate a valid room ID', () => {
      const workspaceId = 'workspace-123';
      const roomName = 'My Canvas Room';
      
      const roomId = generateRoomId(workspaceId, roomName);
      
      expect(roomId).toMatch(/^workspace-123-my-canvas-room-\d+$/);
    });

    it('should sanitize room name properly', () => {
      const workspaceId = 'workspace-123';
      const roomName = 'My @#$% Canvas Room!!!';
      
      const roomId = generateRoomId(workspaceId, roomName);
      
      expect(roomId).toMatch(/^workspace-123-my----canvas----room----\d+$/);
    });
  });
});