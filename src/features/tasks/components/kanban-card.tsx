import  { Task, TaskStatus } from "../types";

import { MoreHorizontal } from "lucide-react";

import { DottedSeparator } from "@/components/dotted-line";

import { TaskActions } from "./task-actions";
import { TaskDate } from "./task-date";

import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MemberAvatar } from "@/features/members/components/members-avatar";

import { useCurrent } from "@/features/auth/api/use-current";


interface KanbanCardProps {
    task: Task;
}

export const KanbanCard = ({ task }: KanbanCardProps) => {
    const { data: currentUser } = useCurrent();
    const isAssignee = task.assignees?.some(
        (a: { $id: string; name: string; userId?: string }) => a.userId === currentUser?.$id || a.$id === currentUser?.$id
    );
    return (
        <div className="bg-white p-2.5 mb-1.5 rounded shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-x-2">
                <p className={`text-sm line-clamp-2 ${task.status === TaskStatus.DONE ? "line-through text-neutral-400" : ""}`}>{task.name}</p>
                <TaskActions id={task.$id} projectId={task.projectId} disabled={!isAssignee}>
                    <MoreHorizontal className="size-[18px] stroke-1 shrink-0 text-neutral-700 hover:opacity-75 transition"/>
                </TaskActions>
            </div>
            <DottedSeparator/>
            <div className="flex items-center gap-x-1.5">
                {task.assignees && task.assignees.length > 0 ? (
                  task.assignees.map((a: { $id: string; name: string }) => (
                    <MemberAvatar
                      key={a.$id}
                      name={a.name}
                      fallbackClassName="text-[10px]"
                    />
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">Unassigned</span>
                )}
                <div className="size-1 rounded-full bg-neutral-300"/>
                <TaskDate value={task.dueDate} className="text-xs"/>
            </div>
            <div className="flex items-center gap-x-1.5">
                <ProjectAvatar
                  name={task.project.name}
                  image={task.project.imageUrl}
                  fallbackClassName="text-[10px]"
                />
                <span className="text-xs font-medium">{task.project.name}</span>
            </div>
        </div>
    )
}