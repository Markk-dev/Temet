import { cn } from "@/lib/utils";
import CursorSVG from "./CursorSVG";

type Props = {
  color: string;
  x: number;
  y: number;
  message?: string;
  userName?: string;
};

const Cursor = ({ color, x, y, message, userName }: Props) => (
  <div
    className="pointer-events-none absolute left-0 top-0 z-50"
    style={{ transform: `translateX(${x}px) translateY(${y}px)` }}
  >
    <CursorSVG color={color} />

    {/* User name label */}
    {userName && (
      <div
        className="absolute left-2 -top-6 px-2 py-1 text-xs font-medium text-white rounded-md shadow-sm"
        style={{ backgroundColor: color }}
      >
        {userName}
      </div>
    )}

    {/* Chat message */}
    {message && (
      <div
        className={cn(
          "absolute left-2 top-5 px-4 py-2 rounded-2xl shadow-lg",
          "max-w-xs break-words"
        )}
        style={{ backgroundColor: color }}
      >
        <p className="whitespace-nowrap text-sm leading-relaxed text-white">
          {message}
        </p>
      </div>
    )}
  </div>
);

export default Cursor;