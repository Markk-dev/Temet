import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Pusher from 'pusher-js';


export const usePusherAnalytics = () => {
  const queryClient = useQueryClient();

  useEffect(() => {

    if (typeof window === 'undefined') return;
    
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    
    if (!pusherKey || !pusherCluster) {
      console.warn('Pusher configuration missing. Real-time analytics updates disabled.');
      return;
    }

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
      enabledTransports: ['ws', 'wss'],
    });
    

    pusher.connection.bind('connected', () => {
      console.log('🔄 Pusher Analytics: Connected successfully');
    });
    
    pusher.connection.bind('error', (err: any) => {
      console.error('❌ Pusher Analytics: Connection error:', err);
    });
    
    const channel = pusher.subscribe('tasks');
    
    channel.bind('pusher:subscription_succeeded', () => {
      console.log('🔄 Pusher Analytics: Subscribed to tasks channel');
    });
    
    channel.bind('pusher:subscription_error', (err: any) => {
      console.error('❌ Pusher Analytics: Subscription error:', err);
    });


    const invalidateAnalytics = () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      console.log('📊 Analytics queries invalidated');
    };


    channel.bind('task-created', () => {
      console.log('📝 Task created - updating analytics');
      invalidateAnalytics();
    });
    
    channel.bind('task-updated', () => {
      console.log('✏️ Task updated - updating analytics');
      invalidateAnalytics();
    });
    
    channel.bind('task-deleted', () => {
      console.log('🗑️ Task deleted - updating analytics');
      invalidateAnalytics();
    });
    
    channel.bind('tasks-bulk-updated', () => {
      console.log('📦 Tasks bulk updated - updating analytics');
      invalidateAnalytics();
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
      console.log('🔌 Pusher Analytics: Disconnected');
    };
  }, [queryClient]);
};
