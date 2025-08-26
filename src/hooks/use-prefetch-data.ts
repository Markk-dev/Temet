import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { client } from '@/lib/rpc';

export const usePrefetchData = () => {
  const queryClient = useQueryClient();

  const prefetchWorkspaceData = useCallback(async (workspaceId: string) => {
    
    await Promise.allSettled([
      
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
        staleTime: 10 * 60 * 1000, 
        gcTime: 30 * 60 * 1000, 
      }),

      
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
        staleTime: 10 * 60 * 1000, 
        gcTime: 30 * 60 * 1000, 
      }),

      
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
        staleTime: 30 * 1000, 
        gcTime: 5 * 60 * 1000, 
      }),

      
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
        staleTime: 5 * 60 * 1000, 
        gcTime: 15 * 60 * 1000, 
      }),

      
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
        staleTime: 2 * 60 * 1000, 
        gcTime: 10 * 60 * 1000, 
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
      staleTime: 10 * 60 * 1000, 
      gcTime: 30 * 60 * 1000, 
    });
  }, [queryClient]);

  
  const prefetchNavigationData = useCallback(async (workspaceId: string) => {
    
    await Promise.allSettled([
      
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
        staleTime: 2 * 60 * 1000, 
        gcTime: 10 * 60 * 1000, 
      }),

      
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
        staleTime: 15 * 60 * 1000, 
        gcTime: 30 * 60 * 1000, 
      }),
    ]);
  }, [queryClient]);

  return {
    prefetchWorkspaceData,
    prefetchProjectData,
    prefetchNavigationData,
  };
};
