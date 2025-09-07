import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkCanvasPermission, checkMultipleCanvasPermissions } from '../utils/server-permissions';
import { MemberRole } from '@/features/members/types';

// Mock dependencies
vi.mock('../utils', () => ({
  getCanvasRoomPermissions: vi.fn(),
}));

const mockDatabases = {
  getDocument: vi.fn(),
  listDocuments: vi.fn(),
  createDocument: vi.fn(),
  updateDocument: vi.fn(),
  deleteDocument: vi.fn(),
};

describe('Canvas Permission Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkCanvasPermission', () => {
    it('should return true for room owner with edit permission', async () => {
      const { getCanvasRoomPermissions } = await import('../utils');
      
      (getCanvasRoomPermissions as any).mockResolvedValue({
        canView: true,
        canEdit: true,
        canDelete: true,
        canInvite: true,
      });

      const result = await checkCanvasPermission({
        databases: mockDatabases as any,
        roomId: 'room-123',
        userId: 'user-123',
        requiredPermission: 'canEdit',
      });

      expect(result.hasPermission).toBe(true);
      expect(result.permissions.canEdit).toBe(true);
    });

    it('should return false for non-collaborator with edit permission', async () => {
      const { getCanvasRoomPermissions } = await import('../utils');
      
      (getCanvasRoomPermissions as any).mockResolvedValue({
        canView: true,
        canEdit: false,
        canDelete: false,
        canInvite: false,
      });

      const result = await checkCanvasPermission({
        databases: mockDatabases as any,
        roomId: 'room-123',
        userId: 'user-123',
        requiredPermission: 'canEdit',
      });

      expect(result.hasPermission).toBe(false);
      expect(result.permissions.canEdit).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const { getCanvasRoomPermissions } = await import('../utils');
      
      (getCanvasRoomPermissions as any).mockRejectedValue(new Error('Database error'));

      const result = await checkCanvasPermission({
        databases: mockDatabases as any,
        roomId: 'room-123',
        userId: 'user-123',
        requiredPermission: 'canEdit',
      });

      expect(result.hasPermission).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('checkMultipleCanvasPermissions', () => {
    it('should return all missing permissions', async () => {
      const { getCanvasRoomPermissions } = await import('../utils');
      
      (getCanvasRoomPermissions as any).mockResolvedValue({
        canView: true,
        canEdit: false,
        canDelete: false,
        canInvite: false,
      });

      const result = await checkMultipleCanvasPermissions({
        databases: mockDatabases as any,
        roomId: 'room-123',
        userId: 'user-123',
        requiredPermissions: ['canEdit', 'canDelete', 'canInvite'],
      });

      expect(result.hasPermission).toBe(false);
      expect(result.missingPermissions).toEqual(['canEdit', 'canDelete', 'canInvite']);
    });

    it('should return true when all permissions are granted', async () => {
      const { getCanvasRoomPermissions } = await import('../utils');
      
      (getCanvasRoomPermissions as any).mockResolvedValue({
        canView: true,
        canEdit: true,
        canDelete: true,
        canInvite: true,
      });

      const result = await checkMultipleCanvasPermissions({
        databases: mockDatabases as any,
        roomId: 'room-123',
        userId: 'user-123',
        requiredPermissions: ['canView', 'canEdit'],
      });

      expect(result.hasPermission).toBe(true);
      expect(result.missingPermissions).toEqual([]);
    });
  });

  describe('Permission scenarios', () => {
    it('should grant view permission to public room for non-members', async () => {
      const { getCanvasRoomPermissions } = await import('../utils');
      
      (getCanvasRoomPermissions as any).mockResolvedValue({
        canView: true,
        canEdit: false,
        canDelete: false,
        canInvite: false,
      });

      const result = await checkCanvasPermission({
        databases: mockDatabases as any,
        roomId: 'room-123',
        userId: 'user-123',
        requiredPermission: 'canView',
      });

      expect(result.hasPermission).toBe(true);
    });

    it('should grant full permissions to workspace admin', async () => {
      const { getCanvasRoomPermissions } = await import('../utils');
      
      (getCanvasRoomPermissions as any).mockResolvedValue({
        canView: true,
        canEdit: true,
        canDelete: true,
        canInvite: true,
      });

      const result = await checkMultipleCanvasPermissions({
        databases: mockDatabases as any,
        roomId: 'room-123',
        userId: 'admin-123',
        requiredPermissions: ['canView', 'canEdit', 'canDelete', 'canInvite'],
      });

      expect(result.hasPermission).toBe(true);
      expect(result.missingPermissions).toEqual([]);
    });

    it('should grant limited permissions to collaborators', async () => {
      const { getCanvasRoomPermissions } = await import('../utils');
      
      (getCanvasRoomPermissions as any).mockResolvedValue({
        canView: true,
        canEdit: true,
        canDelete: false,
        canInvite: false,
      });

      const viewResult = await checkCanvasPermission({
        databases: mockDatabases as any,
        roomId: 'room-123',
        userId: 'collaborator-123',
        requiredPermission: 'canView',
      });

      const editResult = await checkCanvasPermission({
        databases: mockDatabases as any,
        roomId: 'room-123',
        userId: 'collaborator-123',
        requiredPermission: 'canEdit',
      });

      const deleteResult = await checkCanvasPermission({
        databases: mockDatabases as any,
        roomId: 'room-123',
        userId: 'collaborator-123',
        requiredPermission: 'canDelete',
      });

      expect(viewResult.hasPermission).toBe(true);
      expect(editResult.hasPermission).toBe(true);
      expect(deleteResult.hasPermission).toBe(false);
    });
  });
});