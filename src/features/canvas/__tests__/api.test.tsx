import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useGetCanvasRooms } from '../api/use-get-canvas-rooms';
import { useGetCanvasRoom } from '../api/use-get-canvas-room';

// Mock the RPC client
vi.mock('@/lib/rpc', () => ({
  client: {
    api: {
      canvas: {
        workspace: {
          ':workspaceId': {
            $get: vi.fn(),
          },
        },
        ':roomId': {
          $get: vi.fn(),
        },
      },
    },
  },
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

describe('Canvas API Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetCanvasRooms', () => {
    it('should fetch canvas rooms successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          data: {
            documents: [
              {
                $id: 'room-1',
                name: 'Test Room',
                workspaceId: 'workspace-123',
                createdBy: 'user-123',
              },
            ],
            total: 1,
          },
        }),
      };

      const { client } = await import('@/lib/rpc');
      (client.api.canvas.workspace[':workspaceId'].$get as any).mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useGetCanvasRooms({ workspaceId: 'workspace-123' }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({
        documents: [
          {
            $id: 'room-1',
            name: 'Test Room',
            workspaceId: 'workspace-123',
            createdBy: 'user-123',
          },
        ],
        total: 1,
      });
    });

    it('should handle fetch error', async () => {
      const mockResponse = {
        ok: false,
      };

      const { client } = await import('@/lib/rpc');
      (client.api.canvas.workspace[':workspaceId'].$get as any).mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useGetCanvasRooms({ workspaceId: 'workspace-123' }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Failed to fetch canvas rooms');
    });
  });
});


