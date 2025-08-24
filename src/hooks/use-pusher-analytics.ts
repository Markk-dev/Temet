import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    pusherAnalyticsInstance?: Pusher;
    pusherAnalyticsWorkspaceId?: string;
  }
}

export const usePusherAnalytics = (workspaceId?: string) => {
  const queryClient = useQueryClient();
  const isConnectingRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    
    if (isConnectingRef.current) {
      return;
    }

    
    if (window.pusherAnalyticsInstance && 
        window.pusherAnalyticsWorkspaceId === workspaceId &&
        window.pusherAnalyticsInstance.connection.state === 'connected') {
      return;
    }

    
    if (window.pusherAnalyticsInstance && 
        window.pusherAnalyticsWorkspaceId !== workspaceId) {
      try {
        window.pusherAnalyticsInstance.disconnect();
        window.pusherAnalyticsInstance = undefined;
        window.pusherAnalyticsWorkspaceId = undefined;
      } catch (error) {
        
      }
    }

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    
    if (!pusherKey || !pusherCluster) {
      console.warn('Pusher configuration missing. Real-time analytics updates disabled.');
      return;
    }

    isConnectingRef.current = true;

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      enabledTransports: ['ws', 'wss'],
    });

    
    window.pusherAnalyticsInstance = pusher;
    window.pusherAnalyticsWorkspaceId = workspaceId;

    pusher.connection.bind('connected', () => {
      
      isConnectingRef.current = false;
    });
    
    pusher.connection.bind('error', (err: any) => {
      console.error('Pusher Analytics: Connection error:', err);
      isConnectingRef.current = false;
    });

    pusher.connection.bind('disconnected', () => {
      
      isConnectingRef.current = false;
    });

    const channel = pusher.subscribe('tasks');
    
    channel.bind('pusher:subscription_succeeded', () => {
      
    });
    
    channel.bind('pusher:subscription_error', (err: any) => {
      console.error('Pusher Analytics: Subscription error:', err);
    });

    const invalidateAnalytics = () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      
      if (workspaceId) {
        queryClient.invalidateQueries({ queryKey: ["member-time-analytics", workspaceId] });
        
      } else {
        queryClient.invalidateQueries({ queryKey: ["member-time-analytics"] });
        
      }
      
      
    };

    channel.bind('task-created', () => {
      
      invalidateAnalytics();
    });
    
    channel.bind('task-updated', () => {
      
      invalidateAnalytics();
    });
    
    channel.bind('task-deleted', () => {
      
      invalidateAnalytics();
    });
    
    channel.bind('tasks-bulk-updated', () => {
      
      invalidateAnalytics();
    });

    
    const cleanup = () => {
      try {
        channel.unbind_all();
        channel.unsubscribe();
        
        
        if (window.pusherAnalyticsInstance === pusher) {
          pusher.disconnect();
          window.pusherAnalyticsInstance = undefined;
          window.pusherAnalyticsWorkspaceId = undefined;
          
        } else {
          
        }
      } catch (error) {
        
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
  }, []);
};
