import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Task } from '@/features/tasks/types';

export const useGlobalTaskManager = () => {
  const queryClient = useQueryClient();

  // Update global React Query cache with new task data
  const updateGlobalTaskState = useCallback((workspaceId: string, updatedTasks: Task[]) => {
    // Update the main tasks query
    queryClient.setQueryData(
      ['tasks', workspaceId],
      (oldData: { documents: Task[] } | undefined) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          documents: updatedTasks,
        };
      }
    );

    // Update individual task queries
    updatedTasks.forEach(task => {
      queryClient.setQueryData(
        ['task', task.$id],
        task
      );
    });

    // Invalidate analytics queries to trigger updates
    queryClient.invalidateQueries({ queryKey: ['workspace-analytics'] });
    queryClient.invalidateQueries({ queryKey: ['project-analytics'] });
    queryClient.invalidateQueries({ queryKey: ['member-time-analytics'] });
  }, [queryClient]);

  // Get all tasks from global state
  const getGlobalTasks = useCallback((workspaceId: string): Task[] => {
    const tasksData = queryClient.getQueryData(['tasks', workspaceId]) as { documents: Task[] } | undefined;
    return tasksData?.documents || [];
  }, [queryClient]);

  // Update a single task globally
  const updateSingleTask = useCallback((workspaceId: string, updatedTask: Task) => {
    // Update individual task
    queryClient.setQueryData(['task', updatedTask.$id], updatedTask);
    
    // Update in main tasks list
    queryClient.setQueryData(
      ['tasks', workspaceId],
      (oldData: { documents: Task[] } | undefined) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          documents: oldData.documents.map((task: Task) => 
            task.$id === updatedTask.$id ? updatedTask : task
          ),
        };
      }
    );

    // Invalidate analytics
    queryClient.invalidateQueries({ queryKey: ['workspace-analytics'] });
    queryClient.invalidateQueries({ queryKey: ['project-analytics'] });
  }, [queryClient]);

  // Remove a task globally
  const removeGlobalTask = useCallback((workspaceId: string, taskId: string) => {
    // Remove from main tasks list
    queryClient.setQueryData(
      ['tasks', workspaceId],
      (oldData: { documents: Task[] } | undefined) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          documents: oldData.documents.filter((task: Task) => task.$id !== taskId),
        };
      }
    );

    // Remove individual task query
    queryClient.removeQueries({ queryKey: ['task', taskId] });

    // Invalidate analytics
    queryClient.invalidateQueries({ queryKey: ['workspace-analytics'] });
    queryClient.invalidateQueries({ queryKey: ['project-analytics'] });
  }, [queryClient]);

  return {
    updateGlobalTaskState,
    getGlobalTasks,
    updateSingleTask,
    removeGlobalTask,
  };
};
