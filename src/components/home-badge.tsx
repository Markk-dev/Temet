import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/features/tasks/types";

const homeBadgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold",
  {
    variants: {
      variant: {
        [TaskStatus.TODO]: "bg-red-100 text-red-600",
        [TaskStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-600",
        [TaskStatus.IN_REVIEW]: "bg-blue-100 text-blue-600",
        [TaskStatus.DONE]: "bg-emerald-100 text-emerald-600",
        [TaskStatus.BACKLOG]: "bg-pink-100 text-pink-600",
        default: "bg-gray-100 text-gray-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface HomeBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof homeBadgeVariants> {}

export function HomeBadge({ className, variant, ...props }: HomeBadgeProps) {
  return (
    <div className={cn(homeBadgeVariants({ variant }), className)} {...props} />
  );
} 