import { cn } from "@/lib/utils";
import styles from "./index.module.css";

type Props = {
  x: number;
  y: number;
  timestamp: number;
  value: string;
};

const FlyingReaction = ({ x, y, timestamp, value }: Props) => {
  // Calculate text size based on timestamp for variety
  const textSizeClass = `text-${(timestamp % 5) + 2}xl`;
  
  // Get animation classes based on timestamp for variety
  const goUpClass = styles[`goUp${timestamp % 3}` as keyof typeof styles];
  const leftRightClass = styles[`leftRight${timestamp % 3}` as keyof typeof styles];

  return (
    <div
      className={cn(
        "pointer-events-none absolute select-none z-50",
        styles.disappear,
        textSizeClass,
        goUpClass
      )}
      style={{ left: x, top: y }}
    >
      <div className={leftRightClass}>
        <div 
          className={cn(
            "transform -translate-x-1/2 -translate-y-1/2",
            "drop-shadow-lg filter"
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
};

export default FlyingReaction;