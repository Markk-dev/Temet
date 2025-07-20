import { Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

import { useGetTask } from "../api/use-get-tasks";
import { useGetMembers } from "@/features/members/api/use-get-members";
import  { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";

import { EditTaskForm } from "./edit-task-form";


interface EditTaskFormWrapperProps{
    onCancel: () => void;
    id: string;
};

export const EditTaskFormWrapper = ({
    onCancel,
    id,
}: EditTaskFormWrapperProps) => {
    const workspaceId = useWorkspaceId();

    const {data: initialValues, isLoading: isLoadingTask, refetch } = useGetTask({
        taskId: id,
    })

    useEffect(() => {
        refetch();
    }, [id, refetch]);

    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({workspaceId});
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({workspaceId});

    const projectsOptions = projects?.documents.map((project) => ({
        id: project.$id,
        name: project.name,
        imageUrl: project.imageUrl,
    }));

    const memberOptions = members?.documents.map((project) => ({
        id: project.$id,
        name: project.name
    }));

    const isLoading = isLoadingProjects || isLoadingMembers || isLoadingTask;

    if(isLoading){
        return(
            <Card className="w-full h-[714px] border-none shadow-none">
                <CardContent className="flex items-center justify-center h-full">
                    <Loader className="size-5 animate-spin text-muted-foreground"/>
                </CardContent>
            </Card>
        )
    }

    if (!initialValues) {
        return null;
    }

    return (
        <EditTaskForm 
            onCancel={onCancel}
            initialValues={initialValues}
            projectOptions={projectsOptions ?? []}
            memberOptions={memberOptions ?? []}
        />
    )
}