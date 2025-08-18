import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { pusherClient, getCommentsChannel, COMMENT_EVENTS } from '@/lib/pusher';
import { Comment } from '../types';

export const useRealtimeComments = (taskId: string, workspaceId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = pusherClient.subscribe(getCommentsChannel(taskId));

    // Handle new comment
    channel.bind(COMMENT_EVENTS.CREATED, (newComment: Comment & { replies: Comment[] }) => {
      queryClient.setQueryData(
        ['comments', taskId, workspaceId],
        (oldData: any) => {
          if (!oldData?.data) return oldData;
          
          // Add the new comment to the beginning of the list
          return {
            ...oldData,
            data: [newComment, ...oldData.data]
          };
        }
      );
    });

    // Handle comment update
    channel.bind(COMMENT_EVENTS.UPDATED, (updatedComment: Comment) => {
      queryClient.setQueryData(
        ['comments', taskId, workspaceId],
        (oldData: any) => {
          if (!oldData?.data) return oldData;
          
          // Update the comment in the list
          const updateCommentInList = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.$id === updatedComment.$id) {
                return { ...comment, ...updatedComment };
              }
              if (comment.replies) {
                return {
                  ...comment,
                  replies: updateCommentInList(comment.replies)
                };
              }
              return comment;
            });
          };
          
          return {
            ...oldData,
            data: updateCommentInList(oldData.data)
          };
        }
      );
    });

    // Handle comment deletion
    channel.bind(COMMENT_EVENTS.DELETED, ({ commentId }: { commentId: string }) => {
      queryClient.setQueryData(
        ['comments', taskId, workspaceId],
        (oldData: any) => {
          if (!oldData?.data) return oldData;
          
          // Remove the comment from the list
          const removeCommentFromList = (comments: Comment[]): Comment[] => {
            return comments.filter(comment => {
              if (comment.$id === commentId) {
                return false;
              }
              if (comment.replies) {
                comment.replies = removeCommentFromList(comment.replies);
              }
              return true;
            });
          };
          
          return {
            ...oldData,
            data: removeCommentFromList(oldData.data)
          };
        }
      );
    });

    return () => {
      pusherClient.unsubscribe(getCommentsChannel(taskId));
    };
  }, [taskId, workspaceId, queryClient]);
}; 