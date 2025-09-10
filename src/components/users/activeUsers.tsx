import { useOthers, useSelf } from "@liveblocks/react";
import styles from "./index.module.css";

import { Avatar } from "./avatar";
import { generateRandomName } from "@/lib/canvaUtils";
import { useMemo } from "react";


const activeUsers =() =>  {
    const users = useOthers();
    const currentUser = useSelf();
    const hasMoreUsers = users.length > 3;
  
    const memoizedUsers = useMemo(() => {
      return(
        <div className="flex items-center justify-center gap-1 py-2">
          <div className="flex pl-3">
              {currentUser && (
                  <Avatar name={(currentUser as any).info?.name ?? "You"} otherStyles="border-[3px] border-blue-500"/>
              )}
              {users.slice(0, 3).map(({ connectionId, info }) => {
                  return (
                    <Avatar key={connectionId} name={(info as any)?.name ?? generateRandomName()} otherStyles="-ml-3" />
                  );
                })}
        
                {hasMoreUsers && <div className={styles.more}>+{users.length - 3}</div>}
            </div>
        </div>
      )
    },[users.length]);

    return memoizedUsers; 
  }
  export default activeUsers;