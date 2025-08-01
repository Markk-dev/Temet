"use client"

import { useRouter } from "next/navigation";
import { RiAddCircleFill } from "react-icons/ri";

import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces"
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";
import { WorkspaceAvatar } from "@/features/workspaces/components/workspace-avatar";
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Workspace } from "@/features/workspaces/types";

export const WorkspaceSwitcher = () => {

    const workspaceId = useWorkspaceId();

    const router = useRouter();
    const { data: workspaces } = useGetWorkspaces(); 
    const { open } = useCreateWorkspaceModal();

    const onSelect = ( id: string ) => {
        router.push(`/workspaces/${id}`);
    };

  return (
    <div className="flex flex-col gap-y-2">
       <div className="flex items-center justify-between">
          <p className="text-sm uppercase text-neutal-500"> Workspaces </p>
          <RiAddCircleFill onClick={open} className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition"/>
       </div>
       <Select onValueChange={onSelect} value={workspaceId}>
        <SelectTrigger className="w-full bg-neutral-200 font-medium p-1">
            <SelectValue placeholder="No workspace selected" />
        </SelectTrigger>
        <SelectContent>
            {workspaces?.documents.map((workspace: { $id: string; name: string; imageUrl?: string }) => (
                <SelectItem key={workspace.$id} value={workspace.$id}>
                    <div className="flex justify-start items-center gap-3 font-md ">
                        <WorkspaceAvatar name={workspace.name} image={workspace.imageUrl}/>
                        <span className="truncate">{workspace.name}</span>
                    </div>
                </SelectItem>
            ))}
        </SelectContent>
       </Select>
    </div>
  )
}

export default WorkspaceSwitcher