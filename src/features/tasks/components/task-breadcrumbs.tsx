import Link from "next/link";

import { Task } from "../types";

import { Project } from "@/features/projects/types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";
import { ChevronRightIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteTask } from "../api/use-delete-task";
import { UseConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";

import { useCurrent } from "@/features/auth/api/use-current";

interface TaskBreadcrumbsProps {
    project: Project;
    task: Task;
};

export const TaskBreadcrumbs = ({
    project,
    task,
}: TaskBreadcrumbsProps) => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const { mutate, isPending } = useDeleteTask();
    const [ConfirmDialog, confirm] = UseConfirm(
        "Delete Task?",
        "This action cannot be undone.",
        "deletion",
    );
    const { data: currentUser } = useCurrent();
    const assigneesArr = Array.isArray(task.assignees) ? task.assignees : task.assignees ? [task.assignees] : [];
    const isAssignee = assigneesArr.some(
        (a: any) => a.userId === currentUser?.$id || a.$id === currentUser?.$id
    );

    const handleDeleteTask = async () => {
        const ok = await confirm();

        if(!ok) return;

        mutate({param: {taskId: task.$id}}, {
            onSuccess:() => {
                router.push(`/workspaces/${workspaceId}/tasks`);
            }
        })
    }

    return (
    <div className="flex items-center gap-x-2">
        <ConfirmDialog/>
        <ProjectAvatar
            name={project.name}
            image={project.imageUrl}
            className="size-6 lg:size-8"
        />
        <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
         <p className="text-sm lg:text-lg font-semibold text-muted-foreground hover:opacity-75 transition">
            {project.name}
         </p>
        </Link>
        <ChevronRightIcon className="size-4 lg:size-5 text-muted-foreground"/>
        <p className="text-sm lg:text-lg font-semibold">
          {task.name}  
        </p>
        <Button
          onClick={handleDeleteTask}
          disabled={isPending || !isAssignee}
          className="ml-auto"
          variant="deletion"
          size="sm"
        >
          <TrashIcon className="size-4 lg:mr-2"/>
          <span className="hidden lg:block">Delete Task</span>
        </Button>
    </div>
    )
}



