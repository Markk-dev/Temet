import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Pusher from 'pusher-js';


declare global {
  interface Window {
    pusherAnalyticsInstance?: Pusher;
  }
}

export const usePusherAnalytics = (workspaceId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    
    if (window.pusherAnalyticsInstance && 
        window.pusherAnalyticsInstance.connection.state === 'connected') {
      console.log('Pusher Analytics: Already connected, skipping new connection');
      return;
    }
    
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    
    if (!pusherKey || !pusherCluster) {
      console.warn('Pusher configuration missing. Real-time analytics updates disabled.');
      return;
    }

    
    if (window.pusherAnalyticsInstance) {
      try {
        window.pusherAnalyticsInstance.disconnect();
      } catch (error) {
        console.log('Pusher Analytics: Cleaned up existing disconnected instance');
      }
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      enabledTransports: ['ws', 'wss'],
    });
    
    
    window.pusherAnalyticsInstance = pusher;

    pusher.connection.bind('connected', () => {
      console.log('Pusher Analytics: Connected successfully');
    });
    
    pusher.connection.bind('error', (err: any) => {
      console.error('Pusher Analytics: Connection error:', err);
    });
    
    const channel = pusher.subscribe('tasks');
    
    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Pusher Analytics: Subscribed to tasks channel');
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
        console.log('Member time analytics invalidated for workspace:', workspaceId);
      } else {
        
        queryClient.invalidateQueries({ queryKey: ["member-time-analytics"] });
        console.log('All member time analytics invalidated');
      }
      
      console.log('Analytics queries invalidated');
    };


    channel.bind('task-created', () => {
      console.log('Task created - updating analytics');
      invalidateAnalytics();
    });
    
    channel.bind('task-updated', () => {
      console.log('Task updated - updating analytics (includes time tracking)');
      invalidateAnalytics();
    });
    
    channel.bind('task-deleted', () => {
      console.log('Task deleted - updating analytics');
      invalidateAnalytics();
    });
    
    channel.bind('tasks-bulk-updated', () => {
      console.log('Tasks bulk updated - updating analytics');
      invalidateAnalytics();
    });

    return () => {
      try {
        channel.unbind_all();
        channel.unsubscribe();
        
        
        if (window.pusherAnalyticsInstance === pusher) {
          pusher.disconnect();
          window.pusherAnalyticsInstance = undefined;
          console.log('Pusher Analytics: Disconnected and cleaned up global instance');
        } else {
          console.log('Pusher Analytics: Local instance cleaned up (global instance preserved)');
        }
      } catch (error) {
        console.log('Pusher Analytics: Cleanup completed with existing connection');
      }
    };
  }, [queryClient, workspaceId]);
};
