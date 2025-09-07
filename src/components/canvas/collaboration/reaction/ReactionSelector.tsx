import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  setReaction: (reaction: string) => void;
  className?: string;
};

const ReactionSelector = ({ setReaction, className }: Props) => (
  <div
    className={cn(
      "absolute bottom-20 left-0 right-0 mx-auto w-fit z-50",
      "transform rounded-full bg-white px-2 py-1",
      "shadow-lg border border-gray-200",
      "animate-in slide-in-from-bottom-4 fade-in-0 duration-300",
      className
    )}
    onPointerMove={(e) => e.stopPropagation()}
  >
    <ReactionButton reaction="👍" onSelect={setReaction} />
    <ReactionButton reaction="🔥" onSelect={setReaction} />
    <ReactionButton reaction="😍" onSelect={setReaction} />
    <ReactionButton reaction="👀" onSelect={setReaction} />
    <ReactionButton reaction="😱" onSelect={setReaction} />
    <ReactionButton reaction="🙁" onSelect={setReaction} />
  </div>
);

type ReactionButtonProps = {
  reaction: string;
  onSelect: (reaction: string) => void;
};

const ReactionButton = ({ reaction, onSelect }: ReactionButtonProps) => (
  <button
    className={cn(
      "transform select-none p-2 text-xl transition-all duration-200 ease-out",
      "hover:scale-150 focus:scale-150 focus:outline-none",
      "rounded-full hover:bg-gray-100 active:bg-gray-200",
      "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    )}
    onPointerDown={() => onSelect(reaction)}
    aria-label={`React with ${reaction}`}
  >
    {reaction}
  </button>
);

export { ReactionButton };
export default ReactionSelector;