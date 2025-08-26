import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export const useTaskCacheManager = () => {
  const queryClient = useQueryClient();

  
  const invalidateAllTaskCaches = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
    queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
    
    
    queryClient.removeQueries({ queryKey: ["tasks"] });
  }, [queryClient]);

  
  const invalidateTaskCache = useCallback((taskId: string) => {
    queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    queryClient.removeQueries({ queryKey: ["task", taskId] });
  }, [queryClient]);

  
  const invalidateAllIndividualTaskCaches = useCallback(() => {
    queryClient.removeQueries({ queryKey: ["task"] });
  }, [queryClient]);

  
  const updateTaskInCache = useCallback((taskId: string, updatedTask: any) => {
    queryClient.setQueryData(["task", taskId], updatedTask);
  }, [queryClient]);

  
  const updateTasksListInCache = useCallback((workspaceId: string, newTask: any) => {
    queryClient.setQueryData(
      ["tasks", workspaceId],
      (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          documents: [newTask, ...oldData.documents],
        };
      }
    );
  }, [queryClient]);

  
  const removeTaskFromCache = useCallback((taskId: string) => {
    queryClient.removeQueries({ queryKey: ["task", taskId] });
  }, [queryClient]);

  return {
    invalidateAllTaskCaches,
    invalidateTaskCache,
    invalidateAllIndividualTaskCaches,
    updateTaskInCache,
    updateTasksListInCache,
    removeTaskFromCache,
  };
};
