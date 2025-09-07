import { cn } from "@/lib/utils";
import { CursorChatProps, CursorMode } from "../../types/canvas";
import CursorSVG from "./CursorSVG";

const CursorChat = ({ cursor, cursorState, setCursorState, updateMyPresence }: CursorChatProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateMyPresence({ message: e.target.value });
    setCursorState({
      mode: CursorMode.Chat,
      previousMessage: null,
      message: e.target.value,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setCursorState({
        mode: CursorMode.Chat,
        previousMessage: cursorState.mode === CursorMode.Chat ? cursorState.message : null,
        message: "",
      });
    } else if (e.key === "Escape") {
      setCursorState({
        mode: CursorMode.Hidden,
      });
    }
  };

  return (
    <div
      className="absolute top-0 left-0 z-50"
      style={{
        transform: `translateX(${cursor.x}px) translateY(${cursor.y}px)`,
      }}
    >
      {/* Show message input when cursor is in chat mode */}
      {cursorState.mode === CursorMode.Chat && (
        <>
          {/* Custom Cursor shape */}
          <CursorSVG color="#1f2937" />

          <div
            className={cn(
              "absolute left-2 top-5 px-4 py-2 text-sm leading-relaxed text-white shadow-lg",
              "bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl",
              "border border-blue-400/20"
            )}
            onKeyUp={(e) => e.stopPropagation()}
          >
            {/* Previous message display */}
            {cursorState.previousMessage && (
              <div className="mb-2 pb-2 border-b border-blue-400/30 text-blue-100">
                {cursorState.previousMessage}
              </div>
            )}
            
            {/* Message input */}
            <input
              className={cn(
                "w-60 border-none bg-transparent text-white outline-none",
                "placeholder:text-blue-200 focus:placeholder:text-blue-300",
                "transition-colors duration-200"
              )}
              autoFocus={true}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={cursorState.previousMessage ? "" : "Say something…"}
              value={cursorState.message}
              maxLength={50}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CursorChat;