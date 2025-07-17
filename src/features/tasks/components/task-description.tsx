import { useEffect, useState } from "react";
import { PencilIcon, XIcon } from "lucide-react";

import { Task } from "../types";

import { useUpdateTask } from "../api/use-update-task";
import { useQueryClient } from '@tanstack/react-query';
import { useCurrent } from "@/features/auth/api/use-current";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DottedSeparator } from "@/components/dotted-line";

interface TaskDescriptionProps {
    task: Task;
};

export const TaskDescription = ({ task }: TaskDescriptionProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(task.description);

    const { data: currentUser } = useCurrent();
    const assigneesArr = Array.isArray(task.assignees) ? task.assignees : task.assignees ? [task.assignees] : [];
    const isAssignee = assigneesArr.some(
        (a: any) => a.userId === currentUser?.$id || a.$id === currentUser?.$id
    );

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
                <Button onClick={() => setIsEditing((prev) => !prev)} variant="secondary" size="sm" disabled={!isAssignee}>
                    {isEditing ? (
                      <XIcon className="size-4 mr-2"/>
                    ) : (
                       <PencilIcon className="size-4 mr-2"/>
                    )}
                    {isEditing ? "Cancel" : "Edit"}
                </Button>
            </div>
            <DottedSeparator className="my-4"/>
            {isEditing ? (
                <div className="flex flex-col gap-4">
                    <Textarea
                        placeholder="Add a description"
                        value={value}
                        rows={4}
                        onChange={(e) => setValue(e.target.value)}
                        disabled={isPending}
                    />
                    <Button
                        onClick={handleSave}
                        size="sm"
                        className="w-fit ml-auto"
                        disabled={isPending}
                    >   
                    {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
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

