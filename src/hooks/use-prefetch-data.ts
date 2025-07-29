import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { client } from '@/lib/rpc';

/**
 * Hook for prefetching data to improve navigation performance
 */
export const usePrefetchData = () => {
  const queryClient = useQueryClient();

  const prefetchWorkspaceData = useCallback(async (workspaceId: string) => {
    // Prefetch all workspace-related data in parallel
    await Promise.all([
      // Prefetch workspace analytics
      queryClient.prefetchQuery({
        queryKey: ["workspace-analytics", workspaceId],
        queryFn: async () => {
          const response = await client.api.workspaces[":workspaceId"]["analytics"].$get({
            param: { workspaceId },
          });
          if (!response.ok) throw new Error("Failed to fetch workspace analytics");
          const { data } = await response.json();
          return data;
        },
        staleTime: 30000, // Consider fresh for 30 seconds
      }),

      // Prefetch tasks
      queryClient.prefetchQuery({
        queryKey: ["tasks", workspaceId],
        queryFn: async () => {
          const response = await client.api.tasks.$get({
            query: { workspaceId },
          });
          if (!response.ok) throw new Error("Failed to fetch tasks");
          const { data } = await response.json();
          return data;
        },
        staleTime: 30000,
      }),

      // Prefetch projects
      queryClient.prefetchQuery({
        queryKey: ["projects", workspaceId],
        queryFn: async () => {
          const response = await client.api.projects.$get({
            query: { workspaceId },
          });
          if (!response.ok) throw new Error("Failed to fetch projects");
          const { data } = await response.json();
          return data;
        },
        staleTime: 30000,
      }),

      // Prefetch members
      queryClient.prefetchQuery({
        queryKey: ["members", workspaceId],
        queryFn: async () => {
          const response = await client.api.members.$get({
            query: { workspaceId },
          });
          if (!response.ok) throw new Error("Failed to fetch members");
          const { data } = await response.json();
          return data;
        },
        staleTime: 30000,
      }),
    ]);
  }, [queryClient]);

  const prefetchProjectData = useCallback(async (projectId: string) => {
    // Prefetch project analytics
    await queryClient.prefetchQuery({
      queryKey: ["project-analytics", projectId],
      queryFn: async () => {
        const response = await client.api.projects[":projectId"]["analytics"].$get({
          param: { projectId },
        });
        if (!response.ok) throw new Error("Failed to fetch project analytics");
        const { data } = await response.json();
        return data;
      },
      staleTime: 30000,
    });
  }, [queryClient]);

  return {
    prefetchWorkspaceData,
    prefetchProjectData,
  };
};
