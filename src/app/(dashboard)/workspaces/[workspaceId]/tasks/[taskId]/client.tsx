"use client";

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

    if(isLoading){
        return <PageLoader/>
    }

    if(!data){
        return <PageError message="Task not found"/>
    }

    // Prepare task details for the enhanced comments section
    const taskDetails = {
        assignee: data.assignee,
        dueDate: data.dueDate,
        status: data.status,
    };

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
                taskDetails={taskDetails}
            />
        </div>
    );
};