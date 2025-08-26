import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Pusher from 'pusher-js';

export const useRealtimeWorkspace = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const isConnectingRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !workspaceId) return;

    
    if (isConnectingRef.current) {
      return;
    }

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    
    if (!pusherKey || !pusherCluster) {
      console.warn('Pusher configuration missing. Real-time workspace updates disabled.');
      return;
    }

    isConnectingRef.current = true;

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      enabledTransports: ['ws', 'wss'],
    });

    
    const channel = pusher.subscribe('tasks');
    
    channel.bind('pusher:subscription_succeeded', () => {
      
    });
    
    channel.bind('pusher:subscription_error', (err: unknown) => {
      console.error('Pusher Workspace: Subscription error:', err);
    });

    
    channel.bind('task-updated', (data: { task: any }) => {
      if (data?.task && data.task.workspaceId === workspaceId) {
        
        queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
        queryClient.invalidateQueries({ queryKey: ['workspace-analytics', workspaceId] });
        queryClient.invalidateQueries({ queryKey: ['project-analytics'] });
        queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
        queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      }
    });

    
    channel.bind('task-created', (data: { task: any }) => {
      if (data?.task && data.task.workspaceId === workspaceId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
        queryClient.invalidateQueries({ queryKey: ['workspace-analytics', workspaceId] });
      }
    });

    
    channel.bind('task-deleted', (data: { taskId: string, task: any }) => {
      if (data?.task && data.task.workspaceId === workspaceId) {
        queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
        queryClient.invalidateQueries({ queryKey: ['workspace-analytics', workspaceId] });
      }
    });

    
    channel.bind('tasks-bulk-updated', (data: { tasks: any[] }) => {
      if (data?.tasks && data.tasks.some(task => task.workspaceId === workspaceId)) {
        queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
        queryClient.invalidateQueries({ queryKey: ['workspace-analytics', workspaceId] });
      }
    });

    
    const cleanup = () => {
      try {
        channel.unbind_all();
        channel.unsubscribe();
        pusher.disconnect();
      } catch {
        
      } finally {
        isConnectingRef.current = false;
      }
    };

    cleanupRef.current = cleanup;

    return cleanup;
  }, [queryClient, workspaceId]);

  
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [queryClient, workspaceId]);
};
