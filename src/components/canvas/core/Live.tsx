"use client";

import { useCallback, useEffect, useState } from "react";

import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from "@/config/liveblocks";
import useInterval from "../hooks/useInterval";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "../types/canvas";
import { shortcuts } from "../constants";
import { CanvasErrorHandler, safeCanvasOperation } from "../utils/errorHandling";
import LiveblocksErrorBoundary from "./LiveblocksErrorBoundary";

import { Comments } from "../collaboration/comments/Comments";
import CursorChat from "../collaboration/cursor/CursorChat";
import FlyingReaction from "../collaboration/reaction/FlyingReaction";
import LiveCursors from "../collaboration/cursor/LiveCursors";
import ReactionSelector from "../collaboration/reaction/ReactionSelector";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";

type Props = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  undo: () => void;
  redo: () => void;
};

const Live = ({ canvasRef, undo, redo }: Props) => {
  // Error handling state
  const [liveblocksError, setLiveblocksError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Initialize error handler
  useEffect(() => {
    const errorHandler = CanvasErrorHandler.getInstance();

    errorHandler.onError('liveblocks', (error) => {
      console.error('Liveblocks error in Live component:', error);
      setLiveblocksError(error);
    });

    errorHandler.onError('network', (error) => {
      console.error('Network error in Live component:', error);
      setLiveblocksError(error);
    });

    return () => {
      errorHandler.offError('liveblocks');
      errorHandler.offError('network');
    };
  }, []);

  // Safe Liveblocks hooks with error handling
  let others: any = null;
  let cursor: { x: number; y: number } | null = null;
  let updateMyPresence: ((presence: any) => void) | null = null;
  let broadcast: ((event: any) => void) | null = null;

  try {
    /**
     * useOthers returns the list of other users in the room.
     *
     * useOthers: https://liveblocks.io/docs/api-reference/liveblocks-react#useOthers
     */
    others = useOthers();

    /**
     * useMyPresence returns the presence of the current user in the room.
     * It also returns a function to update the presence of the current user.
     *
     * useMyPresence: https://liveblocks.io/docs/api-reference/liveblocks-react#useMyPresence
     */
    const presenceData = useMyPresence() as any;
    cursor = presenceData[0]?.cursor || null;
    updateMyPresence = presenceData[1] || null;

    /**
     * useBroadcastEvent is used to broadcast an event to all the other users in the room.
     *
     * useBroadcastEvent: https://liveblocks.io/docs/api-reference/liveblocks-react#useBroadcastEvent
     */
    broadcast = useBroadcastEvent();
  } catch (error) {
    console.error('Liveblocks hooks error:', error);
    const errorHandler = CanvasErrorHandler.getInstance();
    errorHandler.handleError(error as Error, 'liveblocks-hooks');
    setLiveblocksError(error as Error);

    // Set all to null on error
    others = null;
    cursor = null;
    updateMyPresence = null;
    broadcast = null;
  }

  // store the reactions created on mouse click
  const [reactions, setReactions] = useState<Reaction[]>([]);

  // track the state of the cursor (hidden, chat, reaction, reaction selector)
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  // set the reaction of the cursor
  const setReaction = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  // Remove reactions that are not visible anymore (every 1 sec)
  useInterval(() => {
    setReactions((reactions) => reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000));
  }, 1000);

  // Broadcast the reaction to other users (every 100ms)
  useInterval(() => {
    if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor && broadcast) {
      try {
        // concat all the reactions created on mouse click
        setReactions((reactions) =>
          reactions.concat([
            {
              point: { x: cursor.x, y: cursor.y },
              value: cursorState.reaction,
              timestamp: Date.now(),
            },
          ])
        );

        // Broadcast the reaction to other users
        safeCanvasOperation(
          () => broadcast({
            x: cursor.x,
            y: cursor.y,
            value: cursorState.reaction,
          }),
          'broadcast-reaction'
        );
      } catch (error) {
        console.error('Error broadcasting reaction:', error);
        const errorHandler = CanvasErrorHandler.getInstance();
        errorHandler.handleError(error as Error, 'broadcast-reaction');
      }
    }
  }, 100);

  /**
   * useEventListener is used to listen to events broadcasted by other
   * users.
   *
   * useEventListener: https://liveblocks.io/docs/api-reference/liveblocks-react#useEventListener
   */
  useEventListener((eventData) => {
    try {
      // Safely cast the event to ReactionEvent after checking it has the required properties
      const event = eventData.event as unknown as ReactionEvent;
      
      // Validate that the event has the required properties for a reaction
      if (event && typeof event.x === 'number' && typeof event.y === 'number' && event.value) {
        setReactions((reactions) =>
          reactions.concat([
            {
              point: { x: event.x, y: event.y },
              value: event.value,
              timestamp: Date.now(),
            },
          ])
        );
      }
    } catch (error) {
      console.error('Error handling event listener:', error);
      const errorHandler = CanvasErrorHandler.getInstance();
      errorHandler.handleError(error as Error, 'event-listener');
    }
  });

  // Listen to keyboard events to change the cursor state
  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (e.key === "Escape") {
        if (updateMyPresence) {
          updateMyPresence({ message: "" });
        }
        setCursorState({ mode: CursorMode.Hidden });
      } else if (e.key === "e") {
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);

  // Listen to mouse events to change the cursor state
  const handlePointerMove = useCallback((event: React.PointerEvent) => {
    event.preventDefault();

    // if cursor is not in reaction selector mode, update the cursor position
    if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
      try {
        // get the cursor position in the canvas
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

        // broadcast the cursor position to other users
        if (updateMyPresence) {
          safeCanvasOperation(
            () => updateMyPresence({
              cursor: {
                x,
                y,
              },
            }),
            'update-cursor-position'
          );
        }
      } catch (error) {
        console.error('Error updating cursor position:', error);
        const errorHandler = CanvasErrorHandler.getInstance();
        errorHandler.handleError(error as Error, 'update-cursor-position');
      }
    }
  }, [cursor, cursorState.mode, updateMyPresence]);

  // Hide the cursor when the mouse leaves the canvas
  const handlePointerLeave = useCallback(() => {
    setCursorState({
      mode: CursorMode.Hidden,
    });
    if (updateMyPresence) {
      updateMyPresence({
        cursor: null,
        message: null,
      });
    }
  }, [updateMyPresence]);

  // Show the cursor when the mouse enters the canvas
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      // get the cursor position in the canvas
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

      if (updateMyPresence) {
        updateMyPresence({
          cursor: {
            x,
            y,
          },
        });
      }

      // if cursor is in reaction mode, set isPressed to true
      setCursorState((state: CursorState) =>
        cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
      );
    },
    [cursorState.mode, setCursorState, updateMyPresence]
  );

  // hide the cursor when the mouse is up
  const handlePointerUp = useCallback(() => {
    setCursorState((state: CursorState) =>
      cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state
    );
  }, [cursorState.mode, setCursorState]);

  // trigger respective actions when the user clicks on the right menu
  const handleContextMenuClick = useCallback((key: string) => {
    switch (key) {
      case "Chat":
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
        break;

      case "Reactions":
        setCursorState({ mode: CursorMode.ReactionSelector });
        break;

      case "Undo":
        undo();
        break;

      case "Redo":
        redo();
        break;

      default:
        break;
    }
  }, []);

  const handleRetryConnection = () => {
    setLiveblocksError(null);
    setRetryCount(prev => prev + 1);
  };

  return (
    <LiveblocksErrorBoundary
      onConnectionError={() => setLiveblocksError(new Error('Connection lost'))}
      onRetry={handleRetryConnection}
    >
      <ContextMenu>
        <ContextMenuTrigger
          className="relative flex h-full w-full flex-1 items-center justify-center"
          id="canvas"
          style={{
            cursor: cursorState.mode === CursorMode.Chat ? "none" : "auto",
          }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
          <canvas ref={canvasRef} />

          {/* Render the reactions */}
          {reactions.map((reaction) => (
            <FlyingReaction
              key={reaction.timestamp.toString()}
              x={reaction.point.x}
              y={reaction.point.y}
              timestamp={reaction.timestamp}
              value={reaction.value}
            />
          ))}

          {/* If cursor is in chat mode, show the chat cursor */}
          {cursor && updateMyPresence && (
            <CursorChat
              cursor={cursor}
              cursorState={cursorState}
              setCursorState={setCursorState}
              updateMyPresence={updateMyPresence}
            />
          )}

          {/* If cursor is in reaction selector mode, show the reaction selector */}
          {cursorState.mode === CursorMode.ReactionSelector && (
            <ReactionSelector
              setReaction={(reaction) => {
                setReaction(reaction);
              }}
            />
          )}

          {/* Show the live cursors of other users */}
          {others && <LiveCursors others={others} />}

          {/* Show the comments */}
          <Comments />
        </ContextMenuTrigger>

        <ContextMenuContent className="right-menu-content">
          {shortcuts.map((item) => (
            <ContextMenuItem
              key={item.key}
              className="right-menu-item"
              onClick={() => handleContextMenuClick(item.name)}
            >
              <p>{item.name}</p>
              <p className="text-xs text-primary-grey-300">{item.shortcut}</p>
            </ContextMenuItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>
    </LiveblocksErrorBoundary>
  );
};

export default Live;