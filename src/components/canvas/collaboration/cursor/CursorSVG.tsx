import { cn } from "@/lib/utils";

interface CursorSVGProps {
  color: string;
  className?: string;
}

function CursorSVG({ color, className }: CursorSVGProps) {
  return (
    <svg
      className={cn("relative drop-shadow-sm", className)}
      width="24"
      height="36"
      viewBox="0 0 24 36"
      fill="none"
      stroke="white"
      strokeWidth="1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
        fill={color}
        className="transition-colors duration-200"
      />
    </svg>
  );
}

export default CursorSVG;