import React from "react";
import CursorSVG from "../../../public/assets/CursorSVG";

interface CursorProps {
  color: string;
  x: number;
  y: number;
  message: string;
}

const Cursor = React.memo(({ color, x, y, message }: CursorProps) => {
  return (
    <div 
      className="pointer-events-none absolute top-0 left-0 will-change-transform"
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
        transition: 'transform 0.2s ease-out'
      }}
    >
        <CursorSVG color={color} />

        {message && (
          <div className="absolute left-2 top-5 rounded-3xl px-4 py-2" style={{backgroundColor: color}}>
            <p className="text-white whitespace-nowrap text-sm leading-relaxed">{message}</p>
          </div>
        )}
    </div>
  )
});

Cursor.displayName = "Cursor";

export default Cursor