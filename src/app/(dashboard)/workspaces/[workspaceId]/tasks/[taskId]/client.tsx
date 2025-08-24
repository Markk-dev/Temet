"use client";

import { useMemo } from "react";
import { useGetTask } from "@/features/tasks/api/use-get-tasks";
import { useTaskId } from "@/features/tasks/hooks/use-task-id";
import { TaskBreadcrumbs } from "@/features/tasks/components/task-breadcrumbs";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { DottedSeparator } from "@/components/dotted-line";
import { TaskOverview } from "@/features/tasks/components/task-overview";
import { TaskDescription } from "@/features/tasks/components/task-description";
import { EnhancedCommentsSection } from "@/features/comments/components/enhanced-comments-section";

export const TaskIdClient = () => {
    const  taskId = useTaskId();
    const { data, isLoading } = useGetTask({ taskId });

    // Memoize task details to prevent infinite re-renders
    // MUST be called before any conditional returns to maintain hook order
    const taskDetails = useMemo(() => {
        if (!data) return null;
        return {
            assignee: data.assignee,
            dueDate: data.dueDate,
            status: data.status,
        };
    }, [data?.assignee, data?.dueDate, data?.status]);

    if(isLoading){
        return <PageLoader/>
    }

    if(!data){
        return <PageError message="Task not found"/>
    }

    return (
        <div className="flex flex-col">
            <TaskBreadcrumbs project={data.project} task={data} assignee={data.assignee}/>
            <DottedSeparator className="my-6"/>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <TaskOverview task={data} assignee={data.assignee} />
                <TaskDescription task={data} assignee={data.assignee}/>
            </div>
            <EnhancedCommentsSection 
                taskId={data.$id} 
                workspaceId={data.workspaceId}
                taskDetails={taskDetails || undefined}
            />
        </div>
    );
};