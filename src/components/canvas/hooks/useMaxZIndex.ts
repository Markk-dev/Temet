import { useMemo } from "react";
import { useThreads } from "@/config/liveblocks";

/**
 * Returns the highest z-index of all threads in the room
 * This is used to ensure new threads appear on top of existing ones
 */
export const useMaxZIndex = (): number => {
  const { threads } = useThreads();

  return useMemo(() => {
    let max = 0;
    
    for (const thread of threads) {
      if (thread.metadata.zIndex > max) {
        max = thread.metadata.zIndex;
      }
    }
    
    return max;
  }, [threads]);
};