import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Pusher from 'pusher-js';

export const useRealtimeTask = (taskId: string) => {
  const queryClient = useQueryClient();
  const isConnectingRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !taskId) return;

    // Prevent multiple connections
    if (isConnectingRef.current) {
      return;
    }

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    
    if (!pusherKey || !pusherCluster) {
      console.warn('Pusher configuration missing. Real-time task updates disabled.');
      return;
    }

    isConnectingRef.current = true;

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      enabledTransports: ['ws', 'wss'],
    });

    // Subscribe to tasks channel
    const channel = pusher.subscribe('tasks');
    
    channel.bind('pusher:subscription_succeeded', () => {
      // Successfully subscribed silently
    });
    
    channel.bind('pusher:subscription_error', (err: unknown) => {
      console.error('Pusher Task: Subscription error:', err);
    });

    // Listen for task updates
    channel.bind('task-updated', (data: { task: any }) => {
      if (data?.task && data.task.$id === taskId) {
        // Update the specific task in React Query cache
        queryClient.setQueryData(['task', taskId], data.task);
        
        // Also invalidate related queries to ensure consistency
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['workspace-analytics'] });
        queryClient.invalidateQueries({ queryKey: ['project-analytics'] });
      }
    });

    // Listen for task creation (in case it's relevant)
    channel.bind('task-created', (data: { task: any }) => {
      if (data?.task && data.task.$id === taskId) {
        queryClient.setQueryData(['task', taskId], data.task);
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    });

    // Listen for task deletion
    channel.bind('task-deleted', (data: { taskId: string }) => {
      if (data?.taskId === taskId) {
        // Remove the task from cache
        queryClient.removeQueries({ queryKey: ['task', taskId] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    });

    // Cleanup function
    const cleanup = () => {
      try {
        channel.unbind_all();
        channel.unsubscribe();
        pusher.disconnect();
      } catch {
        // Silent cleanup
      } finally {
        isConnectingRef.current = false;
      }
    };

    cleanupRef.current = cleanup;

    return cleanup;
  }, [queryClient, taskId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [queryClient, taskId]);
};
