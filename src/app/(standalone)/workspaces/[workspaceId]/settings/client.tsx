"use client";

import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

export const WorkspaceSettingsClient = () => {
    const workspaceId = useWorkspaceId();

    const { data: initialValues, isLoading } = useGetWorkspace({ workspaceId });

    if(isLoading){
        return <PageLoader/>
    }

    if(!initialValues) {
        return <PageError message="Project not found"/>
    }
    return (
      <div className="w-full lg:max-w-xl">
        <EditWorkspaceForm initialValues={initialValues} />
      </div>
    )
}