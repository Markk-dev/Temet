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
import { useConsolidatedAnalytics } from "@/hooks/use-consolidated-analytics";
import { usePrefetchData } from "@/hooks/use-prefetch-data";
import { useRealtimeWorkspace } from "@/hooks/use-realtime-workspace";

import { Button } from "@/components/ui/button";
import { Analytics } from "@/components/analytics";
import { PageError } from "@/components/page-error";
import { TaskStatusChart } from "@/components/task-status-chart";
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
    
    const { prefetchWorkspaceData, prefetchNavigationData } = usePrefetchData();
    useConsolidatedAnalytics(workspaceId);
    
    // Enable real-time updates for the entire workspace
    useRealtimeWorkspace(workspaceId); 
    
    React.useEffect(() => {
        if (workspaceId) {
            
            prefetchNavigationData(workspaceId);
            
            
            prefetchWorkspaceData(workspaceId);
        }
    }, [workspaceId, prefetchWorkspaceData, prefetchNavigationData]);
    
    
    const { data: analytics } = useGetWorkspaceAnalytics({ 
        workspaceId 
    });
    
    
    const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ workspaceId })
    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId })
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId })

    
    const isLoadingEssential = 
        isLoadingTasks || 
        isLoadingProjects || 
        isLoadingMembers;

    if(isLoadingEssential){
        return <DashboardLoader/>
    }

    if(!tasks || !projects || !members) {
        return <PageError message="Something went wrong"/>
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Show analytics when ready, or placeholder */}
            {analytics ? (
                <Analytics data={analytics}/>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Card key={i} className="border-0 shadow-sm animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <MemberTimeAnalytics />
                <TaskStatusChart tasks={tasks.documents} />
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
           <div className="bg-muted rounded-md p-4">
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
                  
                  "[&::-webkit-scrollbar]:w-2",
                  "[&::-webkit-scrollbar-track]:bg-gray-100",
                  "[&::-webkit-scrollbar-thumb]:bg-gray-300",
                  "[&::-webkit-scrollbar-thumb]:rounded-full",
                  "[&::-webkit-scrollbar-thumb:hover]:bg-gray-400",
                  
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
                
                "[&::-webkit-scrollbar]:w-2",
                "[&::-webkit-scrollbar-track]:bg-gray-100",
                "[&::-webkit-scrollbar-thumb]:bg-gray-300",
                "[&::-webkit-scrollbar-thumb]:rounded-full",
                "[&::-webkit-scrollbar-thumb:hover]:bg-gray-400",
                
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
                    Team Members
                </p>
                <Button asChild variant="secondary" size="icon">
                    <Link href={`/workspaces/${workspaceId}/members`}>
                        <SettingsIcon className="size-4 text-neutral-400"/>
                    </Link>
                </Button>
              </div>
              <DottedSeparator className="my-3"/>
              <div className="space-y-3">
                {data.map((member) => (
                  <div key={member.$id} className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                      <MemberAvatar 
                          className="size-10"
                          name={member.name}
                      />
                      <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                              {member.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                              {member.email}
                          </p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                          Admin
                      </span>
                  </div>
                ))}
                {data.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    No members found
                  </p>
                )}
              </div>
           </div>
        </div>
    )
}