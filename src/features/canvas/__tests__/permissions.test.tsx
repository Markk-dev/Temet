import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CanvasPermissionGuard, useCanvasPermission } from '../components/canvas-permission-guard';

// Mock the API hooks
vi.mock('../hooks/use-canvas-permissions', () => ({
  useCanvasPermissions: vi.fn(),
}));

vi.mock('../api/use-get-canvas-room', () => ({
  useGetCanvasRoom: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Test component that uses the permission hook
const TestComponent = ({ roomId, requiredPermission }: { roomId: string; requiredPermission: keyof import('../types').CanvasPermission }) => {
  const { hasPermission, isLoading } = useCanvasPermission({ roomId, requiredPermission });
  
  if (isLoading) return <div>Loading...</div>;
  return <div>{hasPermission ? 'Has Permission' : 'No Permission'}</div>;
};

describe('Canvas Permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CanvasPermissionGuard', () => {
    it('should render children when user has required permission', async () => {
      const { useCanvasPermissions } = await import('../hooks/use-canvas-permissions');
      (useCanvasPermissions as any).mockReturnValue({
        data: {
          canView: true,
          canEdit: true,
          canDelete: false,
          canInvite: false,
        },
        isLoading: false,
        error: null,
      });

      const wrapper = createWrapper();
      render(
        <CanvasPermissionGuard
          roomId="room-123"
          requiredPermission="canEdit"
        >
          <div>Protected Content</div>
        </CanvasPermissionGuard>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should render fallback when user lacks required permission', async () => {
      const { useCanvasPermissions } = await import('../hooks/use-canvas-permissions');
      (useCanvasPermissions as any).mockReturnValue({
        data: {
          canView: true,
          canEdit: false,
          canDelete: false,
          canInvite: false,
        },
        isLoading: false,
        error: null,
      });

      const wrapper = createWrapper();
      render(
        <CanvasPermissionGuard
          roomId="room-123"
          requiredPermission="canEdit"
          fallback={<div>Access Denied</div>}
        >
          <div>Protected Content</div>
        </CanvasPermissionGuard>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      });
    });

    it('should show loading state while fetching permissions', async () => {
      const { useCanvasPermissions } = await import('../hooks/use-canvas-permissions');
      (useCanvasPermissions as any).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      const wrapper = createWrapper();
      render(
        <CanvasPermissionGuard
          roomId="room-123"
          requiredPermission="canEdit"
          loading={<div>Loading permissions...</div>}
        >
          <div>Protected Content</div>
        </CanvasPermissionGuard>,
        { wrapper }
      );

      expect(screen.getByText('Loading permissions...')).toBeInTheDocument();
    });

    it('should render fallback on error', async () => {
      const { useCanvasPermissions } = await import('../hooks/use-canvas-permissions');
      (useCanvasPermissions as any).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch permissions'),
      });

      const wrapper = createWrapper();
      render(
        <CanvasPermissionGuard
          roomId="room-123"
          requiredPermission="canEdit"
          fallback={<div>Error loading permissions</div>}
        >
          <div>Protected Content</div>
        </CanvasPermissionGuard>,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Error loading permissions')).toBeInTheDocument();
      });
    });
  });

  describe('useCanvasPermission', () => {
    it('should return correct permission status', async () => {
      const { useCanvasPermissions } = await import('../hooks/use-canvas-permissions');
      (useCanvasPermissions as any).mockReturnValue({
        data: {
          canView: true,
          canEdit: true,
          canDelete: false,
          canInvite: false,
        },
        isLoading: false,
        error: null,
      });

      const wrapper = createWrapper();
      render(
        <TestComponent roomId="room-123" requiredPermission="canEdit" />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('Has Permission')).toBeInTheDocument();
      });
    });

    it('should return false when permission is not granted', async () => {
      const { useCanvasPermissions } = await import('../hooks/use-canvas-permissions');
      (useCanvasPermissions as any).mockReturnValue({
        data: {
          canView: true,
          canEdit: false,
          canDelete: false,
          canInvite: false,
        },
        isLoading: false,
        error: null,
      });

      const wrapper = createWrapper();
      render(
        <TestComponent roomId="room-123" requiredPermission="canEdit" />,
        { wrapper }
      );

      await waitFor(() => {
        expect(screen.getByText('No Permission')).toBeInTheDocument();
      });
    });
  });
});