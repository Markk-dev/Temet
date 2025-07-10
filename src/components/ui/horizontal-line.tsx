import { cn } from "@/lib/utils";

interface HorizontalLineProps {
    className?: string;
    color?: string;
    height?: string;
}

export const HorizontalLine = ({
    className,
    color = "#d4d4d8",
    height = "1px",
}: HorizontalLineProps) => {
    return (
        <div className={cn("w-full flex items-center", className)}>
            <div
                className="flex-grow"
                style={{
                    width: "100%",
                    height,
                    backgroundColor: color,
                }}
            />
        </div>
    );
}; 