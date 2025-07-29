"use client";

import { Calendar, Clock as ClockIcon } from "lucide-react";
import { format } from "date-fns";
import { Task, TimeLog } from "../types";

interface TimeLogListProps {
  task: Task;
}

export function TimeLogList({ task }: TimeLogListProps) {
  // Parse time logs from task
  let timeLogs: TimeLog[] = [];
  try {
    const timeLogsString = task.timeLogs as unknown as string;
    timeLogs = timeLogsString ? JSON.parse(timeLogsString) : [];
  } catch {
    timeLogs = [];
  }

  if (timeLogs.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No time entries found for this task.
      </div>
    );
  }

  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div>
            <p className="text-sm font-medium">Time Log History</p>
            <p className="text-xs text-muted-foreground">
              {timeLogs.length} {timeLogs.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {timeLogs.map((log: TimeLog) => {
          const duration = log.ended_at 
            ? (new Date(log.ended_at).getTime() - new Date(log.started_at).getTime()) / 1000
            : 0;
            
          return (
            <div key={log.id} className="flex items-center justify-between text-sm border rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {format(new Date(log.started_at), 'MMM d, yyyy')}
                </span>
                <span className="text-muted-foreground">•</span>
                <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {format(new Date(log.started_at), 'h:mm a')} - {log.ended_at ? format(new Date(log.ended_at), 'h:mm a') : 'In Progress'}
                </span>
              </div>
              <span className="font-medium">
                {log.ended_at ? formatDuration(duration) : 'Active'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
