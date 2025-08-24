import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { pusherClient, getCommentsChannel, COMMENT_EVENTS } from '@/lib/pusher';
import { Comment } from '../types';

export const useRealtimeComments = (taskId: string, workspaceId: string) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Only subscribe if we have a valid taskId
    if (!taskId) return;

    try {
      const channel = pusherClient.subscribe(getCommentsChannel(taskId));
      channelRef.current = channel;

      channel.bind(COMMENT_EVENTS.CREATED, (newComment: Comment & { replies: Comment[] }) => {
        queryClient.invalidateQueries({ queryKey: ['comments', taskId, workspaceId] });
      });

      channel.bind(COMMENT_EVENTS.UPDATED, (updatedComment: Comment) => {
        queryClient.invalidateQueries({ queryKey: ['comments', taskId, workspaceId] });
      });

      channel.bind(COMMENT_EVENTS.DELETED, ({ commentId, deletedReplyIds }: { commentId: string, deletedReplyIds?: string[] }) => {
        queryClient.invalidateQueries({ queryKey: ['comments', taskId, workspaceId] });
      });

      // Wait for subscription to succeed before binding events
      channel.bind('pusher:subscription_succeeded', () => {
        // Successfully subscribed silently
      });

      channel.bind('pusher:subscription_error', (error: any) => {
        console.error(`Realtime Comments: Subscription error for channel ${getCommentsChannel(taskId)}:`, error);
      });

    } catch (error) {
      console.error('Realtime Comments: Failed to subscribe to channel:', error);
    }

    return () => {
      try {
        if (channelRef.current) {
          // Unbind all events first
          channelRef.current.unbind_all();
          // Then unsubscribe
          pusherClient.unsubscribe(getCommentsChannel(taskId));
          channelRef.current = null;
          // Cleanup completed silently
        }
      } catch (error) {
        console.error('Realtime Comments: Error during cleanup:', error);
      }
    };
  }, [taskId, workspaceId, queryClient]);
}; 