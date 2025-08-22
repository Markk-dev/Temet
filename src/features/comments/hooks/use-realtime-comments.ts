import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { pusherClient, getCommentsChannel, COMMENT_EVENTS } from '@/lib/pusher';
import { Comment } from '../types';

export const useRealtimeComments = (taskId: string, workspaceId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = pusherClient.subscribe(getCommentsChannel(taskId));

    
    channel.bind(COMMENT_EVENTS.CREATED, (newComment: Comment & { replies: Comment[] }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId, workspaceId] });
    });

    
    channel.bind(COMMENT_EVENTS.UPDATED, (updatedComment: Comment) => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId, workspaceId] });
    });

    
    channel.bind(COMMENT_EVENTS.DELETED, ({ commentId, deletedReplyIds }: { commentId: string, deletedReplyIds?: string[] }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId, workspaceId] });
    });

    return () => {
      pusherClient.unsubscribe(getCommentsChannel(taskId));
    };
  }, [taskId, workspaceId, queryClient]);
}; 