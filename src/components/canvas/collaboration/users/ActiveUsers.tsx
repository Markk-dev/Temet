"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useOthers, useSelf } from "@/config/liveblocks";
import { UserAvatar } from "./UserAvatar";

const ActiveUsers = () => {
  /**
   * useOthers returns the list of other users in the room.
   *
   * useOthers: https://liveblocks.io/docs/api-reference/liveblocks-react#useOthers
   */
  const others = useOthers();

  /**
   * useSelf returns the current user details in the room
   *
   * useSelf: https://liveblocks.io/docs/api-reference/liveblocks-react#useSelf
   */
  const currentUser = useSelf();

  // memoize the result of this function so that it doesn't change on every render but only when there are new users joining the room
  const memoizedUsers = useMemo(() => {
    const hasMoreUsers = others.length > 2;

    return (
      <div className="flex items-center justify-center gap-1">
        {currentUser && (
          <UserAvatar 
            name="You" 
            userInfo={currentUser.info}
            className={cn(
              "border-2 border-green-500 shadow-lg",
              "ring-2 ring-green-500/20"
            )}
          />
        )}

        {others.slice(0, 2).map(({ connectionId, info }) => (
          <UserAvatar
            key={connectionId}
            name={info?.name || `User ${connectionId}`}
            userInfo={info}
            className="-ml-2 border-2 border-white shadow-md hover:scale-110 transition-transform duration-200"
          />
        ))}

        {hasMoreUsers && (
          <div 
            className={cn(
              "z-10 -ml-2 flex h-9 w-9 items-center justify-center rounded-full",
              "bg-gray-800 text-white text-xs font-medium shadow-lg",
              "border-2 border-white hover:scale-110 transition-transform duration-200"
            )}
          >
            +{others.length - 2}
          </div>
        )}
      </div>
    );
  }, [others.length, currentUser]);

  return memoizedUsers;
};

export default ActiveUsers;