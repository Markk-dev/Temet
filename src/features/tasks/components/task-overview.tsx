import { PencilIcon } from "lucide-react";

import { DottedSeparator } from "@/components/dotted-line";
import { Button } from "@/components/ui/button";
import { Task } from "../types";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { OverviewProperty } from "./overview-property";
import { MemberAvatar } from "@/features/members/components/members-avatar";
import { TaskDate } from "./task-date";
import { Badge } from "@/components/ui/badge";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useCurrent } from "@/features/auth/api/use-current";
import { canEditTask } from "../utils/permissions";

function chunkArray<T>(arr: T[], size: number): T[][] {
    return arr.reduce((acc: T[][], _, i) => {
      if (i % size === 0) acc.push(arr.slice(i, i + size));
      return acc;
    }, []);
  }
  

interface TaskOverviewProps {
    task: Task;
    assignee: any;
};

export const TaskOverview = ({
    task,
    assignee
}: TaskOverviewProps) => {
    const {open} = useEditTaskModal();
    
    const { data: currentUser } = useCurrent();
    const { data: currentMember } = useCurrentMember();
    
    const canEdit = canEditTask({
        currentUserId: currentUser?.$id,
        assignees: assignee,
        currentMemberRole: currentMember?.role,
    });
    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between"> 
                    <p className="text-lg font-semibold">Overview</p>
                    <Button onClick={() => open(task.$id)} size="sm" variant="secondary" disabled={!canEdit}>
                        <PencilIcon className="size-4 mr-2"/>
                        Edit
                    </Button>
                </div>
                <DottedSeparator className="my-4"/>
                <div className="flex flex-col gap-y-4 text-sm">
                    <OverviewProperty label="Assignee">
                        {(Array.isArray(assignee) ? assignee : assignee ? [assignee] : []).length > 0
                            ? (
                                <div className="flex flex-col gap-2">
                                {chunkArray(Array.isArray(assignee) ? assignee : [assignee], 3).map((group, rowIdx) => (
                                  <div key={rowIdx} className="flex gap-3">
                                    {group.map((member, idx) => (
                                      <div key={member?.id || idx} className="flex items-center gap-x-1">
                                        <MemberAvatar name={member?.name} className="size-5 text-xs" />
                                        <span className="text-xs font-medium flex flex-col">{member?.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                              
                            )
                            : <span className="text-xs text-muted-foreground">Unassigned</span>
                        }
                    </OverviewProperty>
                    <OverviewProperty label="Due Date">
                        <TaskDate value={task.dueDate} className="text-sm font-xs"/>
                    </OverviewProperty>
                    <OverviewProperty label="status">
                        <Badge variant={task.status} className="ml-[-3px]">
                            {snakeCaseToTitleCase(task.status)}
                        </Badge>
                    </OverviewProperty>
                </div>
            </div>
        </div>
    )
}