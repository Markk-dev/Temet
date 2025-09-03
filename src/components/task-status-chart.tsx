"use client"

import { Task, TaskStatus } from "@/features/tasks/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DottedSeparator } from "./dotted-line";

interface TaskStatusChartProps {
    tasks: Task[];
}

const statusConfig = {
    [TaskStatus.BACKLOG]: {
        label: "Backlog",
        color: "bg-pink-100",
        barColor: "bg-pink-400",
        textColor: "text-pink-600"
    },
    [TaskStatus.TODO]: {
        label: "To Do",
        color: "bg-red-100",
        barColor: "bg-red-400",
        textColor: "text-red-600"
    },
    [TaskStatus.IN_PROGRESS]: {
        label: "In Progress",
        color: "bg-yellow-100",
        barColor: "bg-yellow-400",
        textColor: "text-yellow-600"
    },
    [TaskStatus.IN_REVIEW]: {
        label: "In Review",
        color: "bg-blue-100",
        barColor: "bg-blue-400",
        textColor: "text-blue-600"
    },
    [TaskStatus.DONE]: {
        label: "Done",
        color: "bg-green-100",
        barColor: "bg-green-400",
        textColor: "text-green-600"
    }
};

export const TaskStatusChart = ({ tasks }: TaskStatusChartProps) => {
    // Count tasks by status
    const statusCounts = Object.values(TaskStatus).reduce((acc, status) => {
        acc[status] = tasks.filter(task => task.status === status).length;
        return acc;
    }, {} as Record<TaskStatus, number>);

    const maxCount = Math.max(...Object.values(statusCounts), 1);

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground  text-black">
                    Task Status Distribution
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground !mt-[2.5px]">
                    Overview of tasks by current status
                </CardDescription>
                <DottedSeparator className="py-1"/>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-3">
                    {Object.values(TaskStatus).map((status) => {
                        const count = statusCounts[status];
                        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        const config = statusConfig[status];

                        return (
                            <div key={status} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className={cn("font-medium", config.textColor)}>
                                        {config.label}
                                    </span>
                                    <span className="text-muted-foreground font-medium">
                                        {count}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-50 rounded-lg h-3 overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full transition-all duration-500 ease-out",
                                            percentage === 100 ? "rounded-lg" : "rounded-l-lg",
                                            config.barColor
                                        )}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
