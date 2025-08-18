import { useState, useEffect } from "react";
import { PencilIcon, XIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { DottedSeparator } from "@/components/dotted-line";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Task } from "../types";
import { useUpdateTask } from "../api/use-update-task";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useCurrent } from "@/features/auth/api/use-current";
import { canEditTask } from "../utils/permissions";

interface TaskDescriptionProps {
    task: Task;
    assignee?: any;
};

export const TaskDescription = ({ task, assignee }: TaskDescriptionProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(task.description);

    const { data: currentUser } = useCurrent();
    const { data: currentMember } = useCurrentMember();
    
    const canEdit = canEditTask({
        currentUserId: currentUser?.$id,
        assignees: assignee,
        currentMemberRole: currentMember?.role,
    });

    useEffect(() => {
        setValue(task.description);
    }, [task.description]);

    const queryClient = useQueryClient();

    const { mutate, isPending } = useUpdateTask();

    const handleSave = () => {
        setIsEditing(false);
        mutate(
            {
                json: { description: value },
                param: { taskId: task.$id }
            },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['task', task.$id] });
                    setIsEditing(false);
                }
            }
        );
    };

    return (
        <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Task Description</p>
                <div className="flex items-center gap-2">
                    {isEditing && (
                        <Button 
                            onClick={handleSave} 
                            size="sm" 
                            variant="primary"
                            disabled={isPending}
                        >   
                            {isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    )}
                    <Button onClick={() => setIsEditing((prev) => !prev)} variant="secondary" size="sm" disabled={!canEdit}>
                        {isEditing ? (
                          <XIcon className="size-4 mr-2"/>
                        ) : (
                           <PencilIcon className="size-4 mr-2"/>
                        )}
                        {isEditing ? "Cancel" : "Edit"}
                    </Button>
                </div>
            </div>
            <DottedSeparator className="my-4"/>
            {isEditing ? (
                <Textarea
                    placeholder="Add a description"
                    value={value}
                    rows={2}
                    onChange={(e) => setValue(e.target.value)}
                    disabled={isPending}
                    className="resize-none h-16 overflow-y-auto"
                />
            ) : (
                <div>
                    {task.description || (
                        <span className="text-muted-foreground text-sm">
                            No description provided
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

