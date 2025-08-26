import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    pusherAnalyticsInstance?: Pusher;
    pusherAnalyticsWorkspaceId?: string;
  }
}

export const useConsolidatedAnalytics = (workspaceId?: string) => {
  const queryClient = useQueryClient();
  const isConnectingRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Prevent multiple connections
    if (isConnectingRef.current) {
      return;
    }

    // Reuse existing connection if same workspace
    if (window.pusherAnalyticsInstance && 
        window.pusherAnalyticsWorkspaceId === workspaceId &&
        window.pusherAnalyticsInstance.connection.state === 'connected') {
      return;
    }

    // Cleanup old connection if different workspace
            if (window.pusherAnalyticsInstance && 
            window.pusherAnalyticsWorkspaceId !== workspaceId) {
          try {
            window.pusherAnalyticsInstance.disconnect();
            window.pusherAnalyticsInstance = undefined;
            window.pusherAnalyticsWorkspaceId = undefined;
          } catch {
            // Silent cleanup
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

    // Store instance globally
    window.pusherAnalyticsInstance = pusher;
    window.pusherAnalyticsWorkspaceId = workspaceId;

    pusher.connection.bind('connected', () => {
      // Connection established silently
      isConnectingRef.current = false;
    });
    
    pusher.connection.bind('error', (err: unknown) => {
      console.error('Pusher Analytics: Connection error:', err);
      isConnectingRef.current = false;
    });

    pusher.connection.bind('disconnected', () => {
      // Connection lost silently
      isConnectingRef.current = false;
    });

    // Subscribe to PROJECTS channel (separate from tasks)
    const projectsChannel = pusher.subscribe('projects');
    
    projectsChannel.bind('pusher:subscription_succeeded', () => {
      // Successfully subscribed silently
    });
    
    projectsChannel.bind('pusher:subscription_error', (err: unknown) => {
      console.error('Pusher Analytics: Projects subscription error:', err);
    });

    // Project events
    projectsChannel.bind('project-created', () => {
      // Invalidate project-related queries
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspace-analytics'] });
    });
    
    projectsChannel.bind('project-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspace-analytics'] });
    });
    
    projectsChannel.bind('project-deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspace-analytics'] });
    });

    // Subscribe to MEMBERS channel for member updates
    const membersChannel = pusher.subscribe('members');
    
    membersChannel.bind('pusher:subscription_succeeded', () => {
      // Successfully subscribed silently
    });
    
    membersChannel.bind('pusher:subscription_error', (err: unknown) => {
      console.error('Pusher Analytics: Members subscription error:', err);
    });

    // Member events
    membersChannel.bind('member-added', () => {
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspace-analytics'] });
    });
    
    membersChannel.bind('member-removed', () => {
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspace-analytics'] });
    });
    
    membersChannel.bind('member-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspace-analytics'] });
    });

    // Cleanup function
    const cleanup = () => {
      try {
        projectsChannel.unbind_all();
        projectsChannel.unsubscribe();
        membersChannel.unbind_all();
        membersChannel.unsubscribe();
        
        // Only disconnect if this is still the current instance
        if (window.pusherAnalyticsInstance === pusher) {
          pusher.disconnect();
          window.pusherAnalyticsInstance = undefined;
          window.pusherAnalyticsWorkspaceId = undefined;
        }
              } catch {
          // Silent cleanup
        } finally {
          isConnectingRef.current = false;
        }
    };

    cleanupRef.current = cleanup;

    return cleanup;
  }, [queryClient, workspaceId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [queryClient, workspaceId]);
};
