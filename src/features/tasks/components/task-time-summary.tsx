"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, TimeLog } from "../types";

interface TaskTimeSummaryProps {
  task: Task;
  className?: string;
}

// Helper function to format duration in a human-readable format
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function TaskTimeSummary({ task, className }: TaskTimeSummaryProps) {
  // Calculate total time from time logs
  let totalSeconds = 0;
  
  try {
    const timeLogsString = task.timeLogs as unknown as string;
    const timeLogs: TimeLog[] = timeLogsString ? JSON.parse(timeLogsString) : [];
    totalSeconds = timeLogs.reduce((total: number, log: TimeLog) => {
      if (log.ended_at) {
        const duration = (new Date(log.ended_at).getTime() - new Date(log.started_at).getTime()) / 1000;
        return total + duration;
      }
      return total;
    }, 0);
  } catch {
    totalSeconds = 0;
  }

  if (totalSeconds === 0) {
    return null; // Don't show anything if no time has been logged
  }

  return (
    <div className={cn("flex items-center text-sm text-muted-foreground", className)}>
      <Clock className="mr-1.5 h-3.5 w-3.5" />
      <span>Total: {formatDuration(totalSeconds)}</span>
    </div>
  );
}
