"use client";

import { useCallback, useEffect, useState } from "react";
import { useBroadcastEvent, useEventListener } from "@/config/liveblocks";
import { cn } from "@/lib/utils";
import FlyingReaction from "./FlyingReaction";
import ReactionSelector from "./ReactionSelector";
import { Reaction } from "../../types/canvas";

interface ReactionsProps {
  isReactionSelectorVisible: boolean;
  onReactionSelectorToggle: () => void;
  className?: string;
}

export const Reactions = ({ 
  isReactionSelectorVisible, 
  onReactionSelectorToggle,
  className 
}: ReactionsProps) => {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  
  const broadcast = useBroadcastEvent();

  // Handle reaction selection
  const handleReactionSelect = useCallback((reaction: string) => {
    // Get canvas element to calculate relative position
    const canvas = document.getElementById("canvas");
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    
    // Use center of canvas as default position
    const x = canvasRect.width / 2;
    const y = canvasRect.height / 2;

    // Create reaction object
    const reactionData: Reaction = {
      value: reaction,
      timestamp: Date.now(),
      point: { x, y },
    };

    // Add to local state for immediate feedback
    setReactions((prev) => [...prev, reactionData]);

    // Broadcast to other users
    broadcast({
      type: "REACTION",
      emoji: reaction,
      x,
      y,
    });

    // Hide selector after selection
    onReactionSelectorToggle();
  }, [broadcast, onReactionSelectorToggle]);

  // Listen for reactions from other users
  useEventListener(({ event }) => {
    if (event.type === "REACTION") {
      const reactionData: Reaction = {
        value: event.emoji,
        timestamp: Date.now(),
        point: { x: event.x, y: event.y },
      };

      setReactions((prev) => [...prev, reactionData]);
    }
  });

  // Clean up old reactions
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setReactions((prev) => 
        prev.filter((reaction) => now - reaction.timestamp < 3000) // Remove after 3 seconds
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {/* Flying Reactions */}
      {reactions.map((reaction) => (
        <FlyingReaction
          key={`${reaction.timestamp}-${reaction.point.x}-${reaction.point.y}`}
          x={reaction.point.x}
          y={reaction.point.y}
          timestamp={reaction.timestamp}
          value={reaction.value}
        />
      ))}

      {/* Reaction Selector */}
      {isReactionSelectorVisible && (
        <ReactionSelector 
          setReaction={handleReactionSelect}
          className="pointer-events-auto"
        />
      )}
    </div>
  );
};

export default Reactions;