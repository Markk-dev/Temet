import React, { useCallback, useEffect, useState } from "react";
import { Task, TaskStatus } from "../types";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";

import { useCurrent } from "@/features/auth/api/use-current";
import { toast } from "sonner";
import Pusher from 'pusher-js';
import { useQueryClient } from "@tanstack/react-query";

const boards: TaskStatus[] =[
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE,
];

type TasksState = {
    [key in TaskStatus]: Task[];
};

interface DataKanbanProps {
    data: Task[];
    onChange: (tasks: {$id: string; status: TaskStatus; position: number}[]) => void;
};

export const DataKanban = ({
    data,
    onChange
} : DataKanbanProps) => {
    const [task, setTasks] = useState<TasksState>(() => {
        const initialTasks: TasksState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: [],
        };

        data.forEach((task) => {
            initialTasks[task.status].push(task);
        });

        Object.keys(initialTasks).forEach((status) => {
            initialTasks[status as TaskStatus].sort((a,  b) => a.position - b.position)
        });

        return initialTasks;
    });

    const { data: currentUser } = useCurrent();
    const queryClient = useQueryClient();

    // Real-time Pusher integration
    useEffect(() => {
        // Only run on client
        if (typeof window === 'undefined') return;
        const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
        const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
        if (!pusherKey || !pusherCluster) return;

        const pusher = new Pusher(pusherKey, {
            cluster: pusherCluster,
        });
        const channel = pusher.subscribe('tasks');

        // Helper to update state for a single task
        const upsertTask = (newTask: Task) => {
            setTasks(prev => {
                // Remove from all columns
                const updated: TasksState = { ...prev };
                (Object.keys(updated) as TaskStatus[]).forEach(status => {
                    updated[status] = updated[status].filter(t => t.$id !== newTask.$id);
                });
                // Add to correct column
                updated[newTask.status] = [...updated[newTask.status], newTask];
                // Sort
                updated[newTask.status].sort((a, b) => a.position - b.position);
                return { ...updated };
            });
        };
        // Helper to remove a task
        const removeTask = (taskId: string) => {
            setTasks(prev => {
                const updated: TasksState = { ...prev };
                (Object.keys(updated) as TaskStatus[]).forEach(status => {
                    updated[status] = updated[status].filter(t => t.$id !== taskId);
                });
                return { ...updated };
            });
        };
        // Helper to bulk update tasks
        const bulkUpdateTasks = (tasks: Task[]) => {
            setTasks(prev => {
                // Remove all updated tasks from all columns
                const updated: TasksState = { ...prev };
                const updatedIds = new Set(tasks.map(t => t.$id));
                (Object.keys(updated) as TaskStatus[]).forEach(status => {
                    updated[status] = updated[status].filter(t => !updatedIds.has(t.$id));
                });
                // Add each updated task to its new column
                tasks.forEach(task => {
                    updated[task.status] = [...updated[task.status], task];
                });
                // Sort each column
                (Object.keys(updated) as TaskStatus[]).forEach(status => {
                    updated[status].sort((a, b) => a.position - b.position);
                });
                return { ...updated };
            });
        };

        channel.bind('task-created', (data: { task: Task }) => {
            if (data && data.task) upsertTask(data.task);
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
            queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
        });
        channel.bind('task-updated', (data: { task: Task }) => {
            if (data && data.task) upsertTask(data.task);
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
            queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
        });
        channel.bind('task-deleted', (data: { taskId: string }) => {
            if (data && data.taskId) removeTask(data.taskId);
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
            queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
        });
        channel.bind('tasks-bulk-updated', (data: { tasks: Task[] }) => {
            if (data && Array.isArray(data.tasks)) bulkUpdateTasks(data.tasks);
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            queryClient.invalidateQueries({ queryKey: ["workspace-analytics"] });
            queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
            pusher.disconnect();
        };
    }, []);
    
    const onDragEnd = useCallback((result: DropResult) => {
        if(!result.destination) return;

        const {source, destination}  = result;
        const sourceStatus = source.droppableId as TaskStatus;
        const destinationStatus = destination.droppableId as TaskStatus;

        // Find the task being moved
        const movedTask = task[sourceStatus][source.index];
        const isAssignee = movedTask?.assignees?.some(
            (a: { $id: string; userId?: string }) => a.userId === currentUser?.$id || a.$id === currentUser?.$id
        );
        if (!isAssignee) {
            toast.error("Only assignees can move this task.");
            return;
        }

        let updatesPayload : { $id: string; status: TaskStatus; position: number; }[] = [];

        setTasks ((prevTasks) => {
            const newTasks = {...prevTasks};

            //remove task from new source column
            const sourceColumn = [...newTasks[sourceStatus]];
            const [movedTask] = sourceColumn.splice(source.index, 1);

            if(!movedTask){
                console.error("No task found at the source index");
                return prevTasks;
            }

            const updatedMovedTask = sourceStatus !== destinationStatus
                ?{...movedTask, status: destinationStatus}
                : movedTask;

            newTasks[sourceStatus] = sourceColumn;

            const destinationColumn = [...newTasks[destinationStatus]];
            destinationColumn.splice(destination.index, 0, updatedMovedTask);
            newTasks[destinationStatus] = destinationColumn;

            updatesPayload = []

            updatesPayload.push({
                $id: updatedMovedTask.$id,
                status: destinationStatus,
                position: Math.min((destination.index + 1) * 1000, 1_000_000)
            });

            newTasks[destinationStatus].forEach((task, index) => {
                if(task && task.$id !==updatedMovedTask.$id){
                    const newPosition = Math.min((index + 1) * 1000, 1_000_000);
                    if(task.position !== newPosition){
                        updatesPayload.push({
                            $id: task.$id,
                            status: destinationStatus,
                            position: newPosition,
                        });
                    }
                }
            });

            if(sourceStatus !== destinationStatus) {
                newTasks[sourceStatus].forEach((task, index) => {
                    if(task) {
                        const newPosition = Math.min((index + 1) * 1000, 1_000_000);
                        if(task.position !== newPosition){
                            updatesPayload.push({
                                $id: task.$id,
                                status: sourceStatus,
                                position: newPosition,
                            });
                        }
                    }
                });
            }
            return newTasks;
        });

        onChange(updatesPayload);
    }, [onChange, task, currentUser]); 

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto ">
                {boards.map((board) => {
                    return (
                        <div key={board} className="flex-1 mx-2 bg-grey-10/40 p-1.5 rounded-md min-w-[200px]">
                            <KanbanColumnHeader
                                board={board}
                                taskCount={task[board].length}
                            />
                            <Droppable droppableId={board}>
                                {(provided) => (
                                   <div
                                     {...provided.droppableProps}
                                     ref={provided.innerRef}
                                     className="min-h-[200px] py-1.5"
                                   >
                                     {task[board].map((task, index) => (
                                        <Draggable
                                          key={task.$id}
                                          draggableId={task.$id}
                                          index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                >
                                                  <KanbanCard task={task}/>
                                                </div>
                                            )}
                                        </Draggable>
                                     ))}
                                     {provided.placeholder}
                                   </div>     
                                )}
                            </Droppable>
                        </div>
                    )
                })}
            </div>
        </DragDropContext>
    )
}