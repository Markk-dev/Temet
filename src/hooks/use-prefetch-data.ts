import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { client } from '@/lib/rpc';

export const usePrefetchData = () => {
  const queryClient = useQueryClient();

  const prefetchWorkspaceData = useCallback(async (workspaceId: string) => {
    // Use Promise.allSettled to continue even if some requests fail
    await Promise.allSettled([
      // Workspace analytics - longer cache time since it's expensive
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
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
      }),

      // Member time analytics - longer cache time
      queryClient.prefetchQuery({
        queryKey: ["member-time-analytics", workspaceId],
        queryFn: async () => {
          const response = await client.api.analytics["member-time"].$get({
            query: { workspaceId },
          });
          if (!response.ok) throw new Error("Failed to fetch member time analytics");
          const { data } = await response.json();
          return data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
      }),

      // Tasks - moderate cache time
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
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
      }),

      // Projects - longer cache time since they don't change often
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
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
      }),

      // Members - longer cache time since they don't change often
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
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
      }),
    ]);
  }, [queryClient]);

  const prefetchProjectData = useCallback(async (projectId: string) => {
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
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    });
  }, [queryClient]);

  // New function to prefetch navigation data specifically
  const prefetchNavigationData = useCallback(async (workspaceId: string) => {
    // Prefetch only essential data for navigation
    await Promise.allSettled([
      // Current member data
      queryClient.prefetchQuery({
        queryKey: ["current-member", workspaceId],
        queryFn: async () => {
          const response = await client.api.members["current-member"][":workspaceId"].$get({
            param: { workspaceId },
          });
          if (!response.ok) throw new Error("Failed to fetch current member");
          const { data } = await response.json();
          return data;
        },
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
      }),

      // Basic workspace info
      queryClient.prefetchQuery({
        queryKey: ["workspace-info", workspaceId],
        queryFn: async () => {
          const response = await client.api.workspaces[":workspaceId"].$get({
            param: { workspaceId },
          });
          if (!response.ok) throw new Error("Failed to fetch workspace info");
          const { data } = await response.json();
          return data;
        },
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
      }),
    ]);
  }, [queryClient]);

  return {
    prefetchWorkspaceData,
    prefetchProjectData,
    prefetchNavigationData,
  };
};
