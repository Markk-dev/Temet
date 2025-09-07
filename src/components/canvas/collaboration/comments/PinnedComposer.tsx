"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Composer, ComposerProps } from "@liveblocks/react-comments";
import { cn } from "@/lib/utils";
import { useSelf } from "@/config/liveblocks";

type Props = {
  onComposerSubmit: ComposerProps["onComposerSubmit"];
};

export const PinnedComposer = ({ onComposerSubmit, ...props }: Props) => {
  const self = useSelf();
  
  // Get user info from Temet's user system
  const userInfo = self?.info;
  const userName = userInfo?.name || "Anonymous";
  const userAvatar = userInfo?.avatar;
  const userColor = userInfo?.color || "#3B82F6";

  return (
    <div className={cn("absolute flex gap-4 pointer-events-auto")} {...props}>
      {/* User Avatar */}
      <div 
        className={cn(
          "select-none relative w-9 h-9 shadow-lg rounded-tl-md rounded-tr-full rounded-br-full rounded-bl-full",
          "bg-white flex justify-center items-center border border-gray-200"
        )}
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

      {/* Comment Composer */}
      <div 
        className={cn(
          "shadow-lg bg-white rounded-lg flex flex-col text-sm min-w-96 overflow-hidden",
          "border border-gray-200 transition-shadow duration-200 hover:shadow-xl"
        )}
      >
        {/**
         * We're using the Composer component to create a new comment.
         * Liveblocks provides a Composer component that allows to
         * create/edit/delete comments.
         *
         * Composer: https://liveblocks.io/docs/api-reference/liveblocks-react-comments#Composer
         */}
        <div className="p-3">
          <Composer
            onComposerSubmit={onComposerSubmit}
            autoFocus={true}
            onKeyUp={(e) => {
              e.stopPropagation();
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PinnedComposer;