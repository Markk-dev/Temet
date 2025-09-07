"use client";

import { useMemo, useState } from "react";
import { ThreadData } from "@liveblocks/client";
import { Thread } from "@liveblocks/react-comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ThreadMetadata, useUser } from "@/config/liveblocks";

type Props = {
  thread: ThreadData<ThreadMetadata>;
  onFocus: (threadId: string) => void;
};

export const PinnedThread = ({ thread, onFocus, ...props }: Props) => {
  // Get the first comment's user info
  const { user } = useUser(thread.comments[0].userId);
  
  // Open pinned threads that have just been created
  const startMinimized = useMemo(
    () => Number(new Date()) - Number(new Date(thread.createdAt)) > 100,
    [thread]
  );

  const [minimized, setMinimized] = useState(startMinimized);

  // Get user info for avatar display
  const userInfo = user?.info;
  const userName = userInfo?.name || "Anonymous";
  const userAvatar = userInfo?.avatar;
  const userColor = userInfo?.color || "#3B82F6";

  /**
   * memoize the result of this function so that it doesn't change on every render but only when the thread changes
   * Memo is used to optimize performance and avoid unnecessary re-renders.
   *
   * useMemo: https://react.dev/reference/react/useMemo
   */
  const memoizedContent = useMemo(
    () => (
      <div
        className={cn(
          "absolute flex cursor-pointer gap-4 transition-all duration-200",
          "hover:scale-105"
        )}
        {...props}
        onClick={(e: any) => {
          onFocus(thread.id);

          // check if click is on/in the composer
          if (
            e.target &&
            e.target.classList.contains("lb-icon") &&
            e.target.classList.contains("lb-button-icon")
          ) {
            return;
          }

          setMinimized(!minimized);
        }}
      >
        {/* Thread Avatar */}
        <div
          className={cn(
            "relative flex h-9 w-9 select-none items-center justify-center",
            "rounded-bl-full rounded-br-full rounded-tl-md rounded-tr-full",
            "bg-white shadow-lg border border-gray-200",
            "transition-shadow duration-200 hover:shadow-xl"
          )}
          data-draggable={true}
        >
          <Avatar className="w-7 h-7">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback 
              className="text-xs font-medium text-white"
              style={{ backgroundColor: userColor }}
            >
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Thread Content */}
        {!minimized ? (
          <div 
            className={cn(
              "flex min-w-60 flex-col overflow-hidden rounded-lg bg-white text-sm shadow-lg",
              "border border-gray-200 transition-all duration-200",
              "animate-in slide-in-from-left-2 fade-in-0"
            )}
          >
            <Thread
              thread={thread}
              indentCommentContent={false}
              onKeyUp={(e) => {
                e.stopPropagation();
              }}
            />
          </div>
        ) : null}
      </div>
    ),
    [thread.comments.length, minimized, userName, userAvatar, userColor, thread.id, onFocus]
  );

  return <>{memoizedContent}</>;
};

export default PinnedThread;