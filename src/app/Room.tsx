"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";

export function Room({ children }: { children: ReactNode }) {
  const publicApiKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

  if (!publicApiKey) {
    return <div>Liveblocks key missing. Set NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY.</div>;
  }

  return (
    <LiveblocksProvider publicApiKey={publicApiKey}>
      <RoomProvider id="my-room">
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}