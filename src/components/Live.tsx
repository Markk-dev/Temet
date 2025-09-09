import { useCallback, useRef, useMemo, useState, useEffect } from "react";
import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from "@liveblocks/react/suspense";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "../../types/type";
import LiveCursors from "./cursor/live-cursors"
import CursorChat from "./cursor/cursor-chat";
import ReactionSelector from "./reaction/reactionBtn";
import FlyingReaction from "./reaction/flyingReaction";
import useInterval from "../../hooks/useInterval";

const Live = () => {
    const others = useOthers();
    const [{cursor}, updateMyPresence] = useMyPresence() as any;

    const  [cursorState, setCursorState] = useState<CursorState>({
        mode: CursorMode.Hidden
    })

    // const lastUpdateRef = useRef<number>(0);
    // const rafRef = useRef<number | null>(null);
    // const pendingUpdateRef = useRef<{x: number, y: number} | null>(null);
    // const throttleDelay = 8; // ~120fps for smoother tracking

    const [reaction, setReaction] = useState<Reaction[]>([])

    const broadcast = useBroadcastEvent();

    useInterval(() => {
        if(cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor){
            setReaction((reactions) => reactions.concat([
              {
                point: {x: cursor.x, y: cursor.y},
                value: cursorState.reaction,
                timestamp: Date.now()
              }
            ]))
            broadcast({
                x: cursor.x,
                y: cursor.y,
                value: cursorState.reaction,
            })
        }
    }, 100); 

    useEventListener((eventData) => {
        const event = eventData.event as ReactionEvent;
        
        setReaction((reactions) => reactions.concat([
            {
              point: {x: event.x, y: event.y},
              value: event.value,
              timestamp: Date.now()
            }
          ]))
    })

    const handlePointerMove = useCallback((event: React.PointerEvent) => {
        event.preventDefault();

        if(cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
            const x = event.clientX - event.currentTarget.getBoundingClientRect().x
            const y = event.clientY - event.currentTarget.getBoundingClientRect().y
            updateMyPresence({ cursor: {x, y}}) 
        } 

    }, [updateMyPresence]) 

    const handlePointerLeave = useCallback((event: React.PointerEvent) => {
        setCursorState({mode: CursorMode.Hidden});
        updateMyPresence({cursor: null, message: null});
    }, [updateMyPresence]) 

    const handlePointerDown = useCallback((event: React.PointerEvent) => {
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y

        updateMyPresence({cursor: {x, y} });
        
        setCursorState((state: CursorState) => 
            cursorState.mode === CursorMode.Reaction ? 
        {...state, isPressed: true} : state);
    
    }, [cursorState.mode, setCursorState, updateMyPresence]) 

    const handlePointerUp = useCallback((event: React.PointerEvent) => {
        setCursorState((state: CursorState) => 
            cursorState.mode === CursorMode.Reaction ? 
        {...state, isPressed: true} : state);
    }, [cursorState.mode, setCursorState, updateMyPresence]) 


    useEffect(( ) => {
        const onKeyUp = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input field
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
            
            if(e.key ==='/'){
                setCursorState({
                mode: CursorMode.Chat,
                previousMessage: null,
                message: ''
                })
            } else if(e.key === 'Escape') {
                updateMyPresence({ message: '' })
                setCursorState({ mode: CursorMode.Hidden })
            } else if (e.key === 'e') {
                setCursorState ({
                    mode: CursorMode.ReactionSelector
                }) 
            }
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if(e.key === '/'){
             e.preventDefault();
            }
        }

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        }
    }, [updateMyPresence]);

    const handleReaction = useCallback((reaction: string) => {
            setCursorState({mode: CursorMode.Reaction, reaction, isPressed: false})    
    }, [])

  return (
    <div
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown ={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="h-[100vh] w-full flex justify-center items-center text-center"
      style={{
        contain: 'layout style paint',
        willChange: 'transform'
      }}
    >
        <h1 className="text-2xl text-black">Canvas</h1>
        
        {reaction.map((reactionprop) => (
            <FlyingReaction
                key={reactionprop.timestamp.toString()}
                x={reactionprop.point.x}
                y={reactionprop.point.y}
                timestamp={reactionprop.timestamp}
                value={reactionprop.value}
            />
        ))}

        {cursor && (
            <CursorChat
              cursor={cursor}
              cursorState={cursorState}
              setCursorState={setCursorState}
              updateMyPresence={updateMyPresence}
            />
        )}

        {cursorState.mode === CursorMode.ReactionSelector && (
            <ReactionSelector
            setReaction={handleReaction}
            />
        )}

        <LiveCursors others={others}/>
    </div>
  )
}

export default Live