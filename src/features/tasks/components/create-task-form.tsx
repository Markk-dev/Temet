"use client"

import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateTask } from "../api/use-create-task";

import { createTaskSchema } from "../schemas";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-line";
import { DatePicker } from "@/components/date-picker";
import { Card,  CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormLabel, FormMessage, FormItem} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskStatus } from "../types";
import { MultiSelect } from "@/components/multi-select";


interface CreateTaskFormProps{
    onCancel ?: () => void;
    projectOptions: {id: string, name: string, imageUrl: string}[],
    memberOptions: {id: string, name: string}[],

}

export const CreateTaskForm = ({ onCancel, projectOptions, memberOptions }: CreateTaskFormProps) => {
    const workspaceId= useWorkspaceId();
    const { mutate, isPending } = useCreateTask(); 


    const omittedSchema = createTaskSchema.omit({ workspaceId: true });
    const form = useForm<z.infer<typeof omittedSchema>>({
        resolver: zodResolver(omittedSchema),
        defaultValues: {},
    });
    

    const onSubmit = (values: z.infer<typeof omittedSchema>) => {
        mutate({ json: { ...values, workspaceId } }, {
            onSuccess: () => {
                form.reset();
                onCancel?.();
            },
        });
    };

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex p-7">
                <CardTitle className="text-xl font-bold">
                    Create new task 
                </CardTitle>
            </CardHeader>
            <div className="px-7">
                <DottedSeparator/>
            </div>
            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit as SubmitHandler<z.infer<typeof omittedSchema>>)}>
                        <div className="flex flex-col gap-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Task Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input 
                                                {...field}
                                                placeholder="Enter task name"
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                           Due Date
                                        </FormLabel>
                                        <FormControl>
                                           <DatePicker {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="assigneeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assignees</FormLabel>
                                        <MultiSelect
                                            options={memberOptions.map(member => ({
                                                value: member.id,
                                                label: member.name,
                                            }))}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value || []}
                                            placeholder="Select assignees"
                                            className="font-normal text-sm"
                                        />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                           Status
                                        </FormLabel>
                                        <Select defaultValue={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <FormMessage/>
                                            <SelectContent>
                                               <SelectItem value={TaskStatus.BACKLOG}>
                                                    Backlog
                                               </SelectItem>
                                               <SelectItem value={TaskStatus.IN_PROGRESS}>
                                                    In Progress
                                               </SelectItem>
                                               <SelectItem value={TaskStatus.IN_REVIEW}>
                                                    In Review
                                               </SelectItem>
                                               <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>
                                               <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="projectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                           Project
                                        </FormLabel>
                                        <Select defaultValue={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select project"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <FormMessage/>
                                            <SelectContent>
                                                {projectOptions.map((project) => (
                                                    <SelectItem key={project.id} value={project.id}>
                                                        <div className="flex items-center gap-x-2">
                                                            <ProjectAvatar
                                                                className="size-6"
                                                                name={project.name}
                                                                image={project.imageUrl}
                                                            /> 
                                                            {project.name}                                                      
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                         </div>
                         <DottedSeparator className="py-7"/>
                         <div className="flex items-center justify-between">
                            <Button 
                                type="button"
                                size="lg" 
                                variant="secondary" 
                                onClick={onCancel} 
                                disabled={isPending} 
                                className={cn(!onCancel && "invisible")}
                                >
                                Cancel
                            </Button>
                            <Button type="submit" size="lg" variant="primary" disabled={isPending}>
                                Create Task
                            </Button>
                         </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
);

};