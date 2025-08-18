import Pusher from 'pusher-js';
import PusherServer from 'pusher';

// Initialize Pusher client
export const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  forceTLS: true,
});

// Pusher server instance (for server-side)
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Channel names for comments
export const getCommentsChannel = (taskId: string) => `comments-${taskId}`;

// Event types
export const COMMENT_EVENTS = {
  CREATED: 'comment-created',
  UPDATED: 'comment-updated',
  DELETED: 'comment-deleted',
} as const;
