"use client";
import Link from "next/link";
import { PlusIcon, CalendarIcon, SettingsIcon} from "lucide-react";
import {formatDistanceToNow } from "date-fns";

import { Task } from "@/features/tasks/types";
import { useGetTasks } from "@/features/tasks/api/use-get-task";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspaceID";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { usePusherAnalytics } from "@/hooks/use-pusher-analytics";
import { usePrefetchData } from "@/hooks/use-prefetch-data";

import { Button } from "@/components/ui/button";
import { Analytics } from "@/components/analytics";
import { PageError } from "@/components/page-error";
import { DashboardLoader } from "@/components/optimized-loader";
import { DottedSeparator } from "@/components/dotted-line";
import { Card, CardContent } from "@/components/ui/card";
import { Project } from "@/features/projects/types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Member } from "@/features/members/types";
import { MemberAvatar } from "@/features/members/components/members-avatar";
import { MemberTimeAnalytics } from "@/features/tasks/components/member-time-analytics";
import { snakeCaseToTitleCase } from "@/lib/utils";
import { cn } from "@/lib/utils";

import { HomeBadge } from "@/components/home-badge";
import React from "react";

export const WorkspaceIdClient = () => {
    const workspaceId = useWorkspaceId();
    
    // Initialize prefetch and pusher hooks
    const { prefetchWorkspaceData } = usePrefetchData();
    usePusherAnalytics();
    
    // Prefetch data on component mount for better performance
    React.useEffect(() => {
        if (workspaceId) {
            prefetchWorkspaceData(workspaceId);
        }
    }, [workspaceId, prefetchWorkspaceData]);
    
    const { data: analytics, isLoading: isLoadingAnalytics } = useGetWorkspaceAnalytics({ workspaceId })
    const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId })
    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId })
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId })

    const isLoading = 
        isLoadingAnalytics || 
        isLoadingTasks || 
        isLoadingProjects || 
        isLoadingMembers;

        if(isLoading){
            return <DashboardLoader/>
        }

        if(!analytics || !tasks || !projects || !members) {
            return <PageError message="Something went wrong"/>
        }

    return (
        <div className="h-full flex flex-col space-y-4">
            <Analytics data={analytics}/>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <MemberTimeAnalytics />
                <div className="bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">Space for another chart</p>
                </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <TaskList data={tasks.documents} total={tasks.total}/>
                <div className="flex flex-col gap-4">
                    <ProjectList data={projects.documents} total={projects.total}/>
                    <MembersList data={members.documents} total={members.total}/>   
                </div>
            </div>
        </div>
    );
}

interface TasklistProps {
    data: Task[];
    total: number;
}

export const TaskList = ({ data, total }: TasklistProps) => {
    const workspaceId = useWorkspaceId();
    const { open: createTask } = useCreateTaskModal();

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
           <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                    Tasks ({total})
                </p>
                <Button variant="muted" size="icon" onClick={createTask}>
                    <PlusIcon className="size-4 text-neutral-400"/>
                </Button>
              </div>
              <DottedSeparator className="my-3"/>
              <ul
                className={cn(
                  "flex flex-col gap-y-4 max-h-72 pr-2",
                  data.length > 4 ? "overflow-y-scroll" : "overflow-hidden",
                  // Slim greyish scrollbar styling - matches Projects/Members
                  "[&::-webkit-scrollbar]:w-2",
                  "[&::-webkit-scrollbar-track]:bg-gray-100",
                  "[&::-webkit-scrollbar-thumb]:bg-gray-300",
                  "[&::-webkit-scrollbar-thumb]:rounded-full",
                  "[&::-webkit-scrollbar-thumb:hover]:bg-gray-400",
                  // Firefox scrollbar
                  "scrollbar-width:thin",
                  "scrollbar-color:rgb(209 213 219) rgb(243 244 246)"
                )}
                style={{ minHeight: "120px" }}
              >
               {data.map((task) => (
                <li key={task.$id}>
                  <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                    <Card className="shadow-none rouded-lg hover:opacity-75 transition">
                        <CardContent className="p-4">
                            <p className="text-sm truncate font-medium">{task.name}</p>
                            <div className="flex items-center gap-x-2">
                                <div className="flex py-2 justify-center items-center gap-x-1">
                                    <ProjectAvatar
                                         className="size-5"
                                         fallbackClassName="text-sm"
                                         name={task.project?.name ?? ""}
                                         image={task.project?.imageUrl}
                                    />
                                    <p className="text-xs">{task.project?.name}</p>
                                </div>
                                <div className="size-1 rounded-full bg-neutral-300"/>
                                <HomeBadge variant={task.status}>
                                    {snakeCaseToTitleCase(task.status)}
                                </HomeBadge>
                                <div className="text-sm text-muted-foreground flex items-center">
                                    <CalendarIcon className="size-3 mr-1"/>
                                    <span className="truncate text-xs">
                                        {formatDistanceToNow(new Date(task.$createdAt))} ago
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                  </Link>
                </li>
               ))}
               <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                No tasks found
               </li>
              </ul>
              <Button variant="muted" className="mt-4 w-full" asChild>
               <Link href={`/workspaces/${workspaceId}/tasks`}>
                Show all
               </Link>
              </Button>
           </div>
        </div>
    )
}

interface ProjectlistProps {
    data: Project[];
    total: number;
};

export const ProjectList = ({ data, total }: ProjectlistProps) => {
    const workspaceId = useWorkspaceId();
    const { open: createProject } = useCreateProjectModal();

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
           <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                    Projects ({total})
                </p>
                <Button variant="secondary" size="icon" onClick={createProject}>
                    <PlusIcon className="size-4 text-neutral-400"/>
                </Button>
              </div>
              <DottedSeparator className="my-3"/>
              <div className={cn(
                "pr-2",
                data.length > 6 ? "max-h-32 overflow-y-scroll" : "overflow-hidden",
                // Slim greyish scrollbar styling
                "[&::-webkit-scrollbar]:w-2",
                "[&::-webkit-scrollbar-track]:bg-gray-100",
                "[&::-webkit-scrollbar-thumb]:bg-gray-300",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                "[&::-webkit-scrollbar-thumb:hover]:bg-gray-400",
                // Firefox scrollbar
                "scrollbar-width:thin",
                "scrollbar-color:rgb(209 213 219) rgb(243 244 246)"
              )}>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {data.map((project) => (
                  <li key={project.$id}>
                    <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                      <Card className="shadow-none rouded-lg hover:opacity-75 transition">
                          <CardContent className="p-2 flex items-center gap-x-2.5">
                              <ProjectAvatar 
                                  className="size-10"
                                  fallbackClassName="text-xl"
                                  name={project.name}
                                  image={project.imageUrl}
                              />
                              <p className="text-sm font-medium truncate">
                                  {project.name}
                              </p>

                          </CardContent>
                      </Card>
                    </Link>
                  </li>
                 ))}
                 <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                  No projects found
                 </li>
                </ul>
              </div>
           </div>
        </div>
    )
}

interface MemberslistProps {
    data: Member[];
    total: number;
};

export const MembersList = ({ data, total }: MemberslistProps) => {
    const workspaceId = useWorkspaceId();

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
           <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">
                    Members ({total})
                </p>
                <Button asChild variant="secondary" size="icon">
                    <Link href={`/workspaces/${workspaceId}/members`}>
                        <SettingsIcon className="size-4 text-neutral-400"/>
                    </Link>
                </Button>
              </div>
              <DottedSeparator className="my-3"/>
              <div className={cn(
                "pr-2",
                data.length > 6 ? "max-h-32 overflow-y-scroll" : "overflow-hidden",
                // Slim greyish scrollbar styling
                "[&::-webkit-scrollbar]:w-2",
                "[&::-webkit-scrollbar-track]:bg-gray-100",
                "[&::-webkit-scrollbar-thumb]:bg-gray-300",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                "[&::-webkit-scrollbar-thumb:hover]:bg-gray-400",
                // Firefox scrollbar
                "scrollbar-width:thin",
                "scrollbar-color:rgb(209 213 219) rgb(243 244 246)"
              )}>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {data.map((member) => (
                  <li key={member.$id}>
                      <Card className="shadow-none rouded-lg overflow-hidden">
                          <CardContent className="p-3 flex flex-col items-center gap-x-2">
                              <MemberAvatar 
                                  className="size-12"
                                  name={member.name}
                              />
                              <div className="flex flex-col items-center overflow-hidden">
                                  <p className="text-lg font-medium truncate line-clamp-1">
                                      {member.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground truncate line-clamp-1">
                                      {member.email}
                                  </p>

                              </div>
                          </CardContent>
                      </Card>
                  </li>
                 ))}
                 <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
                  No members found
                 </li>
                </ul>
              </div>
           </div>
        </div>
    )
}